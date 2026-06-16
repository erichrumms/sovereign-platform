"""
SOVEREIGN Platform — Security Observability Framework
sovereign_honeytoken.py

Honeytokens are fake data records embedded in every product's data stores
at known locations. Nothing legitimate ever reads or writes them. Any access
is an immediate P1 security incident — no investigation required to determine
whether an access was suspicious. The access itself is the incident.

Design principles:
  - Silent: the accessor receives no indication a token was triggered
  - Immediate: P1 alert fires on access; no batching, no delay
  - Logged: every access produces a HONEYTOKEN_ACCESS Logger event
  - Resilient: webhook failure does not suppress the Logger event
  - Auditable: placement registry records every token's location and state

Usage — placing a token:
    from sovereign_honeytoken import HoneytokenManager

    manager = HoneytokenManager(
        config_path="sovereign_config.yaml",
        logger=sovereign_logger_instance
    )

    token = manager.place_token(
        product="CPMI",
        data_store="WORLD_MODEL_DB",
        field_name="_sovereign_integrity_token",
        placed_by="emp_001"
    )
    # token.value is the UUID4 string to embed in the data store

Usage — checking access (call this whenever a honeytoken field is read):
    triggered = manager.check_access(
        token_value=value_read_from_field,
        accessor_id=current_user_id,
        workflow_step_id="CPMI-GOVERN-v1.0-step-1",
        context={"query": "SELECT * FROM world_model"}
    )
    # If triggered is True, P1 alert has already fired. Log and escalate.

Version: 1.0
Date: June 2026
Stage: 1 — Local registry and Logger active. Webhook delivery requires
           HONEYTOKEN_WEBHOOK_URL environment variable.
"""

import json
import os
import threading
import uuid
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import requests
import yaml

from sovereign_logger import SovereignLogger


# ─────────────────────────────────────────────────────────────
# DATA STRUCTURES
# ─────────────────────────────────────────────────────────────

@dataclass
class HoneytokenRecord:
    """
    A single honeytoken placement record.
    Written to the placement registry when a token is placed.
    Never modified after creation — the registry is append-only.
    """
    token_id: str           # UUID4 — unique identifier for this placement
    token_value: str        # UUID4 — the actual value embedded in the data store
    product: str            # SOVEREIGN product owning the data store
    data_store: str         # Name of the data store (e.g. WORLD_MODEL_DB)
    field_name: str         # Field where the token is embedded
    placed_by: str          # actor_id of the person who placed the token
    placed_at: str          # ISO-8601 timestamp
    active: bool = True     # False after deliberate decommission
    access_count: int = 0   # Incremented on each access — should always be 0
    last_accessed_at: Optional[str] = None
    last_accessor_id: Optional[str] = None


@dataclass
class HoneytokenAccessEvent:
    """
    Record of a single honeytoken access — produced when check_access() triggers.
    """
    token_id: str
    token_value: str
    product: str
    data_store: str
    field_name: str
    accessor_id: str
    accessed_at: str
    workflow_step_id: str
    context: dict
    webhook_delivered: bool
    webhook_error: Optional[str]


# ─────────────────────────────────────────────────────────────
# EXCEPTIONS
# ─────────────────────────────────────────────────────────────

class HoneytokenError(Exception):
    """Base exception for Honeytoken Manager errors."""

class TokenNotFoundError(HoneytokenError):
    """Attempted to check or decommission a token that does not exist."""

class DuplicatePlacementError(HoneytokenError):
    """A token is already active at the specified product/data_store/field_name."""


# ─────────────────────────────────────────────────────────────
# HONEYTOKEN MANAGER
# ─────────────────────────────────────────────────────────────

class HoneytokenManager:
    """
    Manages honeytoken placement, access detection, and P1 alert dispatch
    for the SOVEREIGN Security Observability Framework.

    Thread-safe: a Lock protects the in-memory token index and registry writes.
    The webhook POST is made outside the lock to avoid blocking other threads
    during network I/O — the Logger event is always written first.
    """

    def __init__(
        self,
        config_path: str = "sovereign_config.yaml",
        logger: Optional[SovereignLogger] = None
    ):
        self._lock = threading.Lock()
        self._config = self._load_config(config_path)
        self._ht_config = (
            self._config.get("sovereign", {}).get("honeytoken", {})
        )
        self._registry_path = Path(
            self._ht_config.get(
                "placement_registry_path",
                "./logs/honeytoken_registry.jsonl"
            )
        )
        self._webhook_url: Optional[str] = self._ht_config.get("webhook_url")
        self._registry_path.parent.mkdir(parents=True, exist_ok=True)

        # In-memory index: token_value → HoneytokenRecord
        # Built from registry on startup for O(1) access checks
        self._token_index: dict[str, HoneytokenRecord] = {}
        self._load_registry()

        self._logger = logger

    # ── Configuration ──────────────────────────────────────────

    def _load_config(self, config_path: str) -> dict:
        path = Path(config_path)
        if not path.exists():
            import sys
            print(
                f"[SOVEREIGN Honeytoken] WARNING: config not found at {config_path}. "
                "Using defaults.",
                file=sys.stderr
            )
            return {}
        with open(path, "r") as f:
            return yaml.safe_load(f) or {}

    # ── Registry ───────────────────────────────────────────────

    def _load_registry(self) -> None:
        """
        Load all active tokens from the placement registry into memory.
        Called once at initialization. Registry is JSONL — one record per line.
        """
        if not self._registry_path.exists():
            return
        # Build a complete picture of each token's latest state by reading
        # all registry entries. Later entries for the same token_value
        # override earlier ones — the last write is the current state.
        all_records: dict[str, HoneytokenRecord] = {}
        with open(self._registry_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    data = json.loads(line)
                    record = HoneytokenRecord(**data)
                    all_records[record.token_value] = record  # Last entry wins
                except Exception:
                    # Malformed registry line — skip and continue
                    continue
        # Only load tokens whose final state is active
        for token_value, record in all_records.items():
            if record.active:
                self._token_index[token_value] = record

    def _write_registry_entry(self, record: HoneytokenRecord) -> None:
        """Append a record to the placement registry. Called under lock."""
        with open(self._registry_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(asdict(record), separators=(",", ":")) + "\n")

    def _update_registry_access(self, record: HoneytokenRecord) -> None:
        """
        Append an updated record reflecting the access event.
        The original placement record is preserved — this is an additional entry.
        Registry is append-only; we never modify existing lines.
        """
        with open(self._registry_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(asdict(record), separators=(",", ":")) + "\n")

    # ── Public API ─────────────────────────────────────────────

    def place_token(
        self,
        product: str,
        data_store: str,
        field_name: str,
        placed_by: str,
    ) -> HoneytokenRecord:
        """
        Generate a new honeytoken and record its placement.

        Returns the HoneytokenRecord. The caller embeds `record.token_value`
        in the specified field of the specified data store.

        Raises DuplicatePlacementError if an active token already exists
        at the same product/data_store/field_name location.
        """
        with self._lock:
            # Check for duplicate placement
            for existing in self._token_index.values():
                if (
                    existing.product == product
                    and existing.data_store == data_store
                    and existing.field_name == field_name
                    and existing.active
                ):
                    raise DuplicatePlacementError(
                        f"Active token already exists at "
                        f"{product}/{data_store}/{field_name}. "
                        "Decommission the existing token before placing a new one."
                    )

            record = HoneytokenRecord(
                token_id=str(uuid.uuid4()),
                token_value=str(uuid.uuid4()),
                product=product,
                data_store=data_store,
                field_name=field_name,
                placed_by=placed_by,
                placed_at=datetime.now(timezone.utc).isoformat(),
                active=True,
                access_count=0,
            )

            self._token_index[record.token_value] = record
            self._write_registry_entry(record)

        return record

    def check_access(
        self,
        token_value: str,
        accessor_id: str,
        workflow_step_id: str,
        context: Optional[dict] = None,
    ) -> bool:
        """
        Check whether a value read from a data store is a honeytoken.

        Call this whenever a field that may contain a honeytoken is read.
        If the value matches a known active token, fires a P1 alert immediately:
          1. Logs a HONEYTOKEN_ACCESS event to the Security Framework Logger
          2. POSTs to the webhook URL (if configured)
          3. Updates the placement registry with access metadata

        Returns True if a token was triggered, False otherwise.

        This method is designed to be called on every read of a monitored field.
        The fast path (no match) is a single dict lookup — O(1).
        """
        context = context or {}

        # Fast path — not a honeytoken
        if token_value not in self._token_index:
            return False

        # Token triggered — acquire lock to update record
        with self._lock:
            # Re-check under lock (another thread may have decommissioned it)
            if token_value not in self._token_index:
                return False

            record = self._token_index[token_value]
            if not record.active:
                return False

            # Update access metadata
            now = datetime.now(timezone.utc).isoformat()
            record.access_count += 1
            record.last_accessed_at = now
            record.last_accessor_id = accessor_id
            self._update_registry_access(record)

        # Log the access event — outside the lock, but Logger is thread-safe
        if self._logger:
            self._logger.log(
                event_type="HONEYTOKEN_ACCESS",
                workflow_step_id=workflow_step_id,
                product=record.product,
                sovereign_tier="enhanced",  # Honeytoken access always P1/enhanced
                actor_id=accessor_id,
                outcome="HONEYTOKEN_ACCESS — P1 security incident",
                payload={
                    "token_id": record.token_id,
                    "data_store": record.data_store,
                    "field_name": record.field_name,
                    "access_count": record.access_count,
                    "context": context,
                },
            )

        # Fire webhook — outside the lock, with three-tier fallback
        webhook_delivered, webhook_error = self._dispatch_webhook(
            record=record,
            accessor_id=accessor_id,
            accessed_at=now,
            workflow_step_id=workflow_step_id,
            context=context,
        )

        # Log webhook outcome if delivery failed — silently noted, never suppressed
        if not webhook_delivered and self._logger:
            self._logger.log(
                event_type="EXTERNAL_DEPENDENCY_FAILURE",
                workflow_step_id=workflow_step_id,
                product=record.product,
                actor_id="sovereign.honeytoken",
                outcome="Honeytoken webhook delivery failed — Logger event preserved",
                payload={
                    "token_id": record.token_id,
                    "webhook_error": webhook_error,
                },
            )

        return True

    def decommission_token(
        self,
        token_value: str,
        decommissioned_by: str,
        reason: str,
    ) -> HoneytokenRecord:
        """
        Mark a token as inactive.

        Called when a data store is rebuilt, a field is removed, or a token
        rotation is performed. Decommissioned tokens remain in the registry
        for audit purposes but are removed from the active index.

        Raises TokenNotFoundError if the token_value is not in the active index.
        """
        with self._lock:
            if token_value not in self._token_index:
                raise TokenNotFoundError(
                    f"Token not found in active index: {token_value[:8]}..."
                )
            record = self._token_index.pop(token_value)
            record.active = False
            self._write_registry_entry(record)

        return record

    def list_active_tokens(self) -> list[HoneytokenRecord]:
        """Return all currently active token records. Useful for audit."""
        with self._lock:
            return list(self._token_index.values())

    def get_token_by_id(self, token_id: str) -> Optional[HoneytokenRecord]:
        """Look up a token by its token_id (not its value). For audit use."""
        with self._lock:
            for record in self._token_index.values():
                if record.token_id == token_id:
                    return record
        return None

    @property
    def webhook_configured(self) -> bool:
        """True if a webhook URL is configured for alert delivery."""
        return bool(self._webhook_url)

    @property
    def active_token_count(self) -> int:
        """Number of currently active tokens across all products."""
        with self._lock:
            return len(self._token_index)

    # ── Webhook Dispatch ───────────────────────────────────────

    def _dispatch_webhook(
        self,
        record: HoneytokenRecord,
        accessor_id: str,
        accessed_at: str,
        workflow_step_id: str,
        context: dict,
    ) -> tuple[bool, Optional[str]]:
        """
        POST a P1 alert to the configured webhook URL.

        Three-tier fallback:
          Tier 1: Live webhook POST (3 attempts, exponential backoff)
          Tier 2: Local alert file (always written as fallback)
          Tier 3: Logger EXTERNAL_DEPENDENCY_FAILURE event (handled by caller)

        Returns (delivered: bool, error: str | None).
        Never raises — webhook failure must not suppress the Logger event.
        """
        payload = {
            "alert_type": "HONEYTOKEN_ACCESS",
            "priority": "P1",
            "token_id": record.token_id,
            "product": record.product,
            "data_store": record.data_store,
            "field_name": record.field_name,
            "accessor_id": accessor_id,
            "accessed_at": accessed_at,
            "workflow_step_id": workflow_step_id,
            "access_count": record.access_count,
            "context": context,
        }

        # Tier 2: Always write to local alert file regardless of webhook outcome
        self._write_local_alert(payload)

        # Tier 1: Attempt live webhook
        if not self._webhook_url:
            return False, "No webhook URL configured"

        last_error = None
        for attempt in range(3):
            try:
                response = requests.post(
                    self._webhook_url,
                    json=payload,
                    timeout=5,
                    headers={"Content-Type": "application/json"},
                )
                response.raise_for_status()
                return True, None
            except requests.exceptions.Timeout:
                last_error = f"Timeout on attempt {attempt + 1}"
            except requests.exceptions.ConnectionError as e:
                last_error = f"Connection error on attempt {attempt + 1}: {e}"
            except requests.exceptions.HTTPError as e:
                last_error = f"HTTP error on attempt {attempt + 1}: {e}"
            except Exception as e:
                last_error = f"Unexpected error on attempt {attempt + 1}: {e}"

            # Exponential backoff: 1s, 2s, 4s — but not after the last attempt
            if attempt < 2:
                import time
                time.sleep(2 ** attempt)

        return False, last_error

    def _write_local_alert(self, payload: dict) -> None:
        """
        Write the alert to the local fallback file.
        Always called — regardless of webhook outcome.
        This is the last-resort audit record.
        """
        # Derive local alert path from config or use default
        local_path = Path(
            self._config.get("sovereign", {})
            .get("alert_dispatcher", {})
            .get("destinations", {})
            .get("local_file", {})
            .get("path", "./logs/sovereign_alerts.jsonl")
        )
        local_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            with open(local_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(payload, separators=(",", ":")) + "\n")
        except Exception:
            # If even the local file write fails, there is nothing left to do.
            # The Logger event (written before this call) is the record of last resort.
            pass

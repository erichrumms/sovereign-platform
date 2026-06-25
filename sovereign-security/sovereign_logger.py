"""
SOVEREIGN Platform — Security Observability Framework
sovereign_logger.py

The SOVEREIGN Logger is the shared audit trail for the entire platform.
Every product imports this module. No product builds its own logging.

Design principles:
  - Append-only: entries are never modified after writing
  - Chain integrity: every entry includes SHA-256 of (prior entry + current content)
  - Required fields enforced at runtime: missing workflow_step_id raises immediately
  - CPMI enhanced tier: automatically applied when product="CPMI"
  - Structured output: JSONL — one JSON object per line, machine-readable by default
  - Intelligence Layer ready: deployment_feedback, decision_type, agent_id fields
    are first-class schema members, not optional payload keys

Usage:
    from sovereign_logger import SovereignLogger

    logger = SovereignLogger(config_path="sovereign_config.yaml")

    logger.log(
        event_type="HUMAN_DECISION",
        workflow_step_id="CPMI-GOVERN-v1.0-step-3",
        product="CPMI",
        actor_id="emp_001",
        outcome="Gate 3 attestation recorded",
        payload={"program_id": "PRG-001"},
        decision_type="HUMAN_APPROVAL",
        actor="human",
        actor_name="Jane Smith"
    )

Version: 1.0
Date: June 2026
Stage: 1 — Local JSONL output only. Remote sink activated in Stage 2.
"""

import hashlib
import json
import os
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal, Optional

import yaml


# ─────────────────────────────────────────────────────────────
# APPROVED EVENT TYPE TAXONOMY
# Source of truth: shell-contract.ts SovereignEventType
# Never add event types here without a governance decision.
# ─────────────────────────────────────────────────────────────

APPROVED_EVENT_TYPES = frozenset({
    "APPROVAL_GATE_OPEN",
    "APPROVAL_GATE_CLOSE",
    "HUMAN_DECISION",
    "AGENT_STEP_START",
    "AGENT_STEP_COMPLETE",
    "ANOMALY_DETECTED",
    "GOVERNANCE_GATE_1",
    "GOVERNANCE_GATE_2",
    "GOVERNANCE_GATE_3",
    "GOVERNANCE_GATE_4",
    "REASONING_STEP_START",
    "REASONING_STEP_COMPLETE",
    "HONEYTOKEN_ACCESS",
    "FALLBACK_ACTIVATED",
    "EXTERNAL_DEPENDENCY_FAILURE",
    "AGENT_ISOLATED",
    "GOVERNANCE_GATE_OVERRIDE",
    "AGUI_EVENT",
    "MCP_TOOL_CALL",
    "A2A_TASK_HANDOFF",
    "A2A_TASK_FAILURE",
    # GD-13 / shell-contract v1.10 (June 24, 2026) — model-evaluation completion event,
    # emitted by evaluate.py (CPMI-VRS four-gate validation). Synced from shell-contract.ts
    # SovereignEventType (Standing Constraint #11).
    # NOTE (drift flagged for governance): this set is otherwise still at the v1.0 baseline —
    # it does NOT yet include the GD-2..GD-11 event types (VOICE_CAPTURE_COMPLETED, ALERT_*,
    # AGENT_ACTION_*, CPMI_VRS_*, INFERENCE_*, AGENTOS_*, NEXUS_*). Those are emitted only by
    # the TypeScript modules today, so the gap is latent, but a future session should complete
    # the Constraint #11 propagation. See SOVEREIGN_Session16_Handoff.md.
    "MODEL_EVALUATION_COMPLETE",
})

APPROVED_PRODUCTS = frozenset({
    "NEXUS", "CPMI", "APEX", "FLOWPATH", "AGENTOS", "ARIA"
})

APPROVED_DECISION_TYPES = frozenset({
    "HUMAN_APPROVAL",
    "HUMAN_OVERRIDE",
    "HUMAN_DENIAL",
    "AUTHORIZATION_APPROVED",
    "AUTHORIZATION_DENIED",
    "TRAVEL_APPROVED",
    "TRAVEL_DENIED",
    "TRAVEL_ESCALATED",
    "LABOR_CORRECTION_APPROVED",
    "LABOR_ESCALATION_INITIATED",
})

APPROVED_AGENT_CLASSES = frozenset({
    "Analytical", "Operational", "Governance", "Monitoring",
    # GD-12 / shell-contract v1.9 (June 24, 2026) — AgentOS orchestrator class.
    # Synced from shell-contract.ts AgentClass (Standing Constraint #11).
    "Orchestration",
})

# Events that require decision_type, actor, and actor_name
HUMAN_DECISION_EVENTS = frozenset({"HUMAN_DECISION"})

# Events that require agent_id and agent_class
AGENT_EVENTS = frozenset({"AGENT_STEP_START", "AGENT_STEP_COMPLETE"})

# CPMI always runs on the enhanced tier regardless of config
CPMI_PRODUCT = "CPMI"


# ─────────────────────────────────────────────────────────────
# EXCEPTIONS
# ─────────────────────────────────────────────────────────────

class SovereignLoggerError(Exception):
    """Base exception for Logger errors."""

class MissingRequiredFieldError(SovereignLoggerError):
    """A required field was absent or empty."""

class InvalidFieldValueError(SovereignLoggerError):
    """A field contained a value not in the approved taxonomy."""

class LoggerConfigError(SovereignLoggerError):
    """Configuration could not be loaded or is malformed."""


# ─────────────────────────────────────────────────────────────
# LOGGER
# ─────────────────────────────────────────────────────────────

class SovereignLogger:
    """
    Platform-wide audit logger for the SOVEREIGN Security Observability Framework.

    Thread-safe: a threading.Lock protects the checksum chain and file writes,
    so multiple products or agents logging concurrently in the same process
    produce a consistent chain.

    Chain integrity: each entry's checksum is SHA-256(prior_checksum + entry_json).
    The first entry uses a zero hash as the prior. Any tampering with a historical
    entry invalidates every subsequent checksum — detectable on audit.
    """

    def __init__(self, config_path: str = "sovereign_config.yaml"):
        self._lock = threading.Lock()
        self._config = self._load_config(config_path)
        self._output_path = Path(
            self._config.get("sovereign", {})
            .get("logger", {})
            .get("output_path", "./logs/sovereign.jsonl")
        )
        self._remote_sink: Optional[str] = (
            self._config.get("sovereign", {})
            .get("logger", {})
            .get("remote_sink")
        )
        self._output_path.parent.mkdir(parents=True, exist_ok=True)
        self._prior_checksum: str = self._load_prior_checksum()

    # ── Configuration ──────────────────────────────────────────

    def _load_config(self, config_path: str) -> dict:
        path = Path(config_path)
        if not path.exists():
            # Graceful degradation: use defaults if config is absent.
            # Log to stderr so the absence is visible without raising.
            import sys
            print(
                f"[SOVEREIGN Logger] WARNING: config not found at {config_path}. "
                "Using defaults. Create sovereign_config.yaml to configure.",
                file=sys.stderr
            )
            return {}
        try:
            with open(path, "r") as f:
                return yaml.safe_load(f) or {}
        except Exception as e:
            raise LoggerConfigError(
                f"Failed to parse sovereign_config.yaml: {e}"
            ) from e

    def _load_prior_checksum(self) -> str:
        """
        Read the checksum of the last entry in the log file.
        If the file is new or empty, returns the zero hash.
        This initializes the chain correctly for both new and resumed logs.
        """
        zero_hash = "0" * 64
        if not self._output_path.exists():
            return zero_hash
        try:
            last_line = ""
            with open(self._output_path, "rb") as f:
                # Efficient last-line read without loading entire file
                f.seek(0, 2)
                file_size = f.tell()
                if file_size == 0:
                    return zero_hash
                pos = file_size - 1
                while pos > 0:
                    f.seek(pos)
                    char = f.read(1)
                    if char == b"\n" and pos < file_size - 1:
                        last_line = f.read().decode("utf-8").strip()
                        break
                    pos -= 1
                if not last_line:
                    f.seek(0)
                    last_line = f.read().decode("utf-8").strip()
            if last_line:
                entry = json.loads(last_line)
                return entry.get("checksum", zero_hash)
        except Exception:
            # If chain read fails, start fresh rather than crashing.
            # The audit team will detect the break — this is better than
            # losing subsequent entries.
            return zero_hash
        return zero_hash

    # ── Public API ─────────────────────────────────────────────

    def log(
        self,
        *,
        event_type: str,
        workflow_step_id: str,
        product: str,
        actor_id: str,
        outcome: str,
        payload: dict[str, Any],
        # HUMAN_DECISION required fields
        decision_type: Optional[str] = None,
        actor: Optional[Literal["human", "agent"]] = None,
        actor_name: Optional[str] = None,
        # AGENT_STEP_START / AGENT_STEP_COMPLETE required fields
        agent_id: Optional[str] = None,
        agent_class: Optional[str] = None,
        # AGENT_STEP_COMPLETE Intelligence Layer field
        deployment_feedback: Optional[dict[str, Any]] = None,
        # Override tier (CPMI is always enhanced regardless)
        sovereign_tier: Optional[Literal["standard", "enhanced"]] = None,
    ) -> dict[str, Any]:
        """
        Write a single log entry to the SOVEREIGN audit trail.

        Returns the complete entry dict (useful for testing and chaining).
        Raises MissingRequiredFieldError or InvalidFieldValueError on violations.
        Never silently drops a required field.
        """
        # ── Validate required fields ──────────────────────────

        self._require("event_type", event_type)
        self._require("workflow_step_id", workflow_step_id)
        self._require("product", product)
        self._require("actor_id", actor_id)
        self._require("outcome", outcome)

        if event_type not in APPROVED_EVENT_TYPES:
            raise InvalidFieldValueError(
                f"event_type '{event_type}' is not in the approved taxonomy. "
                f"Approved types: {sorted(APPROVED_EVENT_TYPES)}"
            )

        if product not in APPROVED_PRODUCTS:
            raise InvalidFieldValueError(
                f"product '{product}' is not a recognized SOVEREIGN product. "
                f"Approved products: {sorted(APPROVED_PRODUCTS)}"
            )

        # ── Human decision validation ─────────────────────────

        if event_type in HUMAN_DECISION_EVENTS:
            self._require("decision_type", decision_type)
            self._require("actor", actor)
            self._require("actor_name", actor_name)
            if decision_type not in APPROVED_DECISION_TYPES:
                raise InvalidFieldValueError(
                    f"decision_type '{decision_type}' is not in the approved taxonomy. "
                    f"Approved types: {sorted(APPROVED_DECISION_TYPES)}"
                )
            if actor != "human":
                raise InvalidFieldValueError(
                    "actor must be 'human' on HUMAN_DECISION events. "
                    f"Got: '{actor}'"
                )

        # ── Agent event validation ────────────────────────────

        if event_type in AGENT_EVENTS:
            self._require("agent_id", agent_id)
            self._require("agent_class", agent_class)
            if agent_class not in APPROVED_AGENT_CLASSES:
                raise InvalidFieldValueError(
                    f"agent_class '{agent_class}' is not in the approved taxonomy. "
                    f"Approved classes: {sorted(APPROVED_AGENT_CLASSES)}"
                )

        # ── Deployment feedback validation ────────────────────

        if event_type == "AGENT_STEP_COMPLETE" and deployment_feedback is not None:
            required_fb_fields = {
                "automatability_score", "human_time_seconds",
                "agent_time_seconds", "override_occurred"
            }
            missing = required_fb_fields - set(deployment_feedback.keys())
            if missing:
                raise MissingRequiredFieldError(
                    f"deployment_feedback is missing required fields: {missing}"
                )

        # ── Determine tier ────────────────────────────────────

        # CPMI always runs enhanced regardless of what caller passes.
        # This is architectural, not configurable.
        if product == CPMI_PRODUCT:
            resolved_tier = "enhanced"
        elif sovereign_tier is not None:
            resolved_tier = sovereign_tier
        else:
            resolved_tier = "standard"

        # ── Build entry ───────────────────────────────────────

        timestamp = datetime.now(timezone.utc).isoformat()

        entry: dict[str, Any] = {
            "timestamp": timestamp,
            "event_type": event_type,
            "workflow_step_id": workflow_step_id,
            "sovereign_tier": resolved_tier,
            "product": product,
            "actor_id": actor_id,
            "outcome": outcome,
            "payload": payload,
        }

        # Conditional fields — only include when present and relevant
        if decision_type is not None:
            entry["decision_type"] = decision_type
        if actor is not None:
            entry["actor"] = actor
        if actor_name is not None:
            entry["actor_name"] = actor_name
        if agent_id is not None:
            entry["agent_id"] = agent_id
        if agent_class is not None:
            entry["agent_class"] = agent_class
        if deployment_feedback is not None:
            entry["deployment_feedback"] = deployment_feedback

        # ── Compute checksum and write (thread-safe) ──────────

        with self._lock:
            entry_json = json.dumps(entry, sort_keys=True, separators=(",", ":"))
            checksum_input = self._prior_checksum + entry_json
            checksum = hashlib.sha256(checksum_input.encode("utf-8")).hexdigest()
            entry["checksum"] = checksum

            # Write entry with checksum to JSONL
            with open(self._output_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry, separators=(",", ":")) + "\n")

            self._prior_checksum = checksum

        return entry

    # ── Chain Verification ─────────────────────────────────────

    def verify_chain(self) -> dict[str, Any]:
        """
        Verify the integrity of the entire log chain.

        Returns a result dict with:
          - valid: bool — True if chain is unbroken
          - entries_checked: int
          - first_violation: int | None — line number of first broken link
          - violation_detail: str | None

        Use this in audit processes and after any suspected tampering.
        """
        if not self._output_path.exists():
            return {"valid": True, "entries_checked": 0, "first_violation": None}

        prior = "0" * 64
        entries_checked = 0

        try:
            with open(self._output_path, "r", encoding="utf-8") as f:
                for line_number, line in enumerate(f, start=1):
                    line = line.strip()
                    if not line:
                        continue
                    entry = json.loads(line)
                    stored_checksum = entry.pop("checksum", None)
                    if stored_checksum is None:
                        return {
                            "valid": False,
                            "entries_checked": entries_checked,
                            "first_violation": line_number,
                            "violation_detail": "Entry missing checksum field",
                        }
                    # Recompute checksum from entry without the checksum field
                    entry_json = json.dumps(entry, sort_keys=True, separators=(",", ":"))
                    expected = hashlib.sha256(
                        (prior + entry_json).encode("utf-8")
                    ).hexdigest()
                    if expected != stored_checksum:
                        return {
                            "valid": False,
                            "entries_checked": entries_checked,
                            "first_violation": line_number,
                            "violation_detail": (
                                f"Checksum mismatch: "
                                f"expected {expected[:16]}..., "
                                f"stored {stored_checksum[:16]}..."
                            ),
                        }
                    prior = stored_checksum
                    entries_checked += 1
        except json.JSONDecodeError as e:
            return {
                "valid": False,
                "entries_checked": entries_checked,
                "first_violation": None,
                "violation_detail": f"Malformed JSON in log: {e}",
            }

        return {
            "valid": True,
            "entries_checked": entries_checked,
            "first_violation": None,
            "violation_detail": None,
        }

    # ── Helpers ───────────────────────────────────────────────

    @staticmethod
    def _require(field_name: str, value: Any) -> None:
        """Raise MissingRequiredFieldError if value is None or empty string."""
        if value is None or value == "":
            raise MissingRequiredFieldError(
                f"Required field '{field_name}' is missing or empty. "
                "Every SOVEREIGN Logger event must include this field."
            )

    @property
    def output_path(self) -> Path:
        """The path of the JSONL log file this logger is writing to."""
        return self._output_path

    @property
    def remote_sink_configured(self) -> bool:
        """True if a remote sink endpoint is configured. Stage 2 activation."""
        return bool(self._remote_sink)

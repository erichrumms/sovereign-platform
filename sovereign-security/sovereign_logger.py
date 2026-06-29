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
    # ─────────────────────────────────────────────────────────
    # GD-15 / Session 17 (June 25, 2026) — Constraint #11 re-sync (catch-up only).
    # Brings APPROVED_EVENT_TYPES to full parity with the shell-contract v1.11
    # SovereignEventType union by adding the GD-2..GD-11 members that drifted over
    # Sessions 3–15 (each session previously synced only its own GD additions).
    # No NEW event types are introduced here — these are types already approved in
    # the shell contract, propagated to the Python logger. After this re-sync the
    # set holds 58 members, identical to shell-contract.ts v1.11. See
    # SOVEREIGN_Session16_Handoff.md §G and Integration Brief v1.25 §6 (GD-15).
    # ─────────────────────────────────────────────────────────
    # GD-2 / shell-contract v1.1 — SCRIBE voice capture (module-scribe).
    "VOICE_CAPTURE_COMPLETED",
    # GD-3 / shell-contract v1.1 — COUNSEL prior-position reconciliation (module-counsel).
    "PRIOR_POSITION_RECONCILIATION",
    # GD-4 / shell-contract v1.2 — seven VIGIL alert/triage/approval events (module-vigil).
    "ALERT_RECEIVED",
    "ALERT_ACKNOWLEDGED",
    "ALERT_RESOLVED",
    "ALERT_ESCALATED",
    "ALERT_FALSE_POSITIVE",
    "TRIAGE_ANALYSIS_PRODUCED",
    "APPROVAL_REQUEST_RECEIVED",
    # GD-6 / shell-contract v1.4 — four VIGIL agent-action approval lifecycle events.
    "AGENT_ACTION_APPROVED",
    "AGENT_ACTION_REJECTED",
    "AGENT_ACTION_ESCALATED",
    "AGENT_ACTION_EXPIRED",
    # GD-7 / shell-contract v1.5 — CPMI reasoning-chain + four CPMI-VRS gate events (module-cpmi).
    "CPMI_REASONING_CHAIN_COMPLETE",
    "CPMI_VRS_GATE_1_PASSED",
    "CPMI_VRS_GATE_2_PASSED",
    "CPMI_VRS_GATE_3_ATTESTED",
    "CPMI_VRS_GATE_4_PASSED",
    # GD-8 / shell-contract v1.6 — three inference-layer events (sovereign-api-client).
    "INFERENCE_CALL",
    "INFERENCE_PROVIDER_FALLBACK",
    "MODEL_HASH_MISMATCH",
    # GD-9 / shell-contract v1.7 — seven AgentOS task-lifecycle events (module-agentos).
    "AGENTOS_TASK_ASSIGNED",
    "AGENTOS_APPROVAL_REQUESTED",
    "AGENTOS_TASK_APPROVED",
    "AGENTOS_TASK_REJECTED",
    "AGENTOS_TASK_STARTED",
    "AGENTOS_TASK_COMPLETE",
    "AGENTOS_TASK_CANCELLED",
    # GD-11 / shell-contract v1.8 — six NEXUS work-request lifecycle events (module-nexus).
    "NEXUS_REQUEST_SUBMITTED",
    "NEXUS_REQUEST_ROUTED",
    "NEXUS_APPROVAL_PENDING",
    "NEXUS_REQUEST_IN_PROGRESS",
    "NEXUS_REQUEST_COMPLETE",
    "NEXUS_REQUEST_REJECTED",
    # GD-13 / shell-contract v1.10 — model-evaluation completion (evaluate.py). Synced Session 16.
    "MODEL_EVALUATION_COMPLETE",
    # GD-14 / shell-contract v1.11 — AgentOS A2A messaging events. Synced Session 16.
    "AGENT_MESSAGE_SENT",
    "AGENT_MESSAGE_RECEIVED",
    # GD-16 / shell-contract v1.12 (June 25, 2026) — seven APEX analytics/reporting events
    # (module-apex). Synced from shell-contract.ts SovereignEventType (Constraint #11) AFTER
    # the GD-15 re-sync above. The set now holds 65 members, identical to shell-contract v1.12.
    "APEX_ANALYSIS_STARTED",
    "APEX_ANALYSIS_COMPLETE",
    "APEX_REPORT_GENERATED",
    "APEX_DOSSIER_EXPORTED",
    "APEX_PROVENANCE_VIEWED",
    "REPORT_GENERATION_HELD",
    "APEX_EVENT_RECEIVED",
    # GD-18 / shell-contract v1.13 (June 26, 2026) — ten FLOWPATH workflow-elicitation events
    # (module-flowpath). Synced from shell-contract.ts SovereignEventType (Constraint #11). The
    # set now holds 75 members, identical to shell-contract v1.13. The two workstyle events carry
    # data_classification: user (hashed analyst_id) — never surface in a platform-wide audit query
    # without the user filter applied.
    "FLOWPATH_SESSION_STARTED",
    "FLOWPATH_SESSION_COMPLETE",
    "FLOWPATH_ARTIFACT_PRODUCED",
    "FLOWPATH_ARTIFACT_APPROVED",
    "FLOWPATH_GATE_FAILED",
    "FLOWPATH_VOCABULARY_CAPTURED",
    "FLOWPATH_DATASOURCE_REGISTERED",
    "FLOWPATH_VALIDATION_CADENCE_SET",
    "FLOWPATH_WORKSTYLE_ELICITED",
    "FLOWPATH_WORKSTYLE_BOUNDARY_CONFLICT",
    # GD-20 / shell-contract v1.15 (June 29, 2026) — four ARIA Suite / CLEAR event types
    # (module-aria). Synced from shell-contract.ts SovereignEventType (Constraint #11). The set
    # now holds 79 members, identical to shell-contract v1.15. Emitted by module-aria's clear-engine
    # and Certification Queue and by the deterministic aria.rules-engine.
    "ARIA_COMPLIANCE_CHECK",       # every automated compliance evaluation
    "ARIA_CERTIFICATION_ISSUED",   # every export gate opened by CLEAR certification
    "ARIA_VIOLATION_FLAGGED",      # every compliance deviation surfaced (engine or human)
    "ARIA_CALENDAR_ALERT",         # every governance-calendar timing violation
})

# NOTE (GD-18): FLOWPATH is already present in APPROVED_PRODUCTS below — it has been a primary
# SovereignProduct since shell-contract v1.0 and was added to this Python set at the GD-17
# companion re-sync framing. No product propagation was required for GD-18 (this corrects the
# Session 20 opening prompt's "10 -> 11" expectation; the set already holds 10 with FLOWPATH).
APPROVED_PRODUCTS = frozenset({
    "NEXUS", "CPMI", "APEX", "FLOWPATH", "AGENTOS", "ARIA",
    # GD-17 / Session 18 (June 26, 2026) — Constraint #11 companion-product re-sync
    # (catch-up only). The four companion products have been in the shell-contract
    # SovereignProduct union since GD-5 (v1.3) but were never propagated to the Python
    # logger (GD-15, Session 17, was scoped to event/decision types only). Adding them
    # so any future Python-side emission under a companion product is accepted rather
    # than rejected. No shell-contract change (APPROVED_PRODUCTS is Python-only) and no
    # other synced copy to update. See Integration Brief v1.26 §13 (Item 55) and
    # SOVEREIGN_Session17_Handoff.md §G.1.
    "COUNSEL", "SCRIBE", "LENS", "VIGIL",
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
    # GD-15 / Session 17 (June 25, 2026) — Constraint #11 re-sync (catch-up only).
    # The five HumanDecisionType members added to the shell contract over GD-6..GD-9
    # that had not yet been propagated to the Python logger. No new decision types —
    # full parity with shell-contract.ts v1.11 HumanDecisionType (15 members).
    "AGENT_APPROVAL",          # GD-6 / v1.4 — VIGIL agent-action approval
    "GATE_3_ATTESTATION",      # GD-7 / v1.5 — CPMI-VRS Gate 3 human attestation
    "WORLD_MODEL_UPDATE",      # GD-7 / v1.5 — human-gated world-model update
    "TASK_APPROVAL",           # GD-9 / v1.7 — AgentOS task approval via VIGIL
    "TASK_CANCELLATION",       # GD-9 / v1.7 — AgentOS task cancellation
    # GD-16 / shell-contract v1.12 (June 25, 2026) — APEX report attestation before export.
    # Synced from shell-contract.ts HumanDecisionType (Constraint #11). 16 members total.
    "REPORT_ATTESTATION",
    # GD-18 / shell-contract v1.13 (June 26, 2026) — FLOWPATH artifact approval + DC-5 validation
    # sign-off. Synced from shell-contract.ts HumanDecisionType (Constraint #11). 18 members total.
    "WORKFLOW_APPROVAL",       # GD-18 / v1.13 — reviewer approves a FLOWPATH workflow artifact
    "VALIDATION_SIGN_OFF",     # GD-18 / v1.13 — analyst signs off an APEX pre-review validation cycle
    # GD-20 / shell-contract v1.15 (June 29, 2026) — ARIA Suite CLEAR compliance certification.
    # Synced from shell-contract.ts HumanDecisionType (Constraint #11). 19 members total. A human
    # reviewer certifying an output as compliant in the CLEAR Certification Queue.
    "COMPLIANCE_CERTIFICATION",
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

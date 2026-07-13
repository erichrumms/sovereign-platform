"""
SOVEREIGN Platform — Security Observability Framework
ppbe_emitter.py — the Python-side PPBE event emitters (Session 32, D8).

The four PPBE event types are PYTHON-ONLY (Session 31 Project Principal
decision #3, following the TRACER/ARC/TT precedent): the TypeScript layer
produces structured records — the VIGIL Tier B gate's PhaseTransitionRecord,
COUNSEL's PPBEDecisionEmission, the monitoring agents' anomaly findings, and
APEX's EvaluationFinding entities — and THIS module records them on the audit
trail via the SovereignLogger. This closes the emission wiring Session 31
explicitly deferred ("a live Python-side emission wire-up is Session 32
material", Session 31 handoff §D.5).

Design, per the evaluate.py precedent: this is a CONFIG SEAM, not a live
cross-process call. The TS layer and this module agree on field sets (docs/18
§4); hosts carry the records across (e.g. a JSON handoff file or an HTTP shim
at deployment level). Each emitter validates the docs/18 §4 field set before
logging — an incomplete record raises rather than producing a half-governed
audit entry — and returns the logger entry it wrote.

PPBE_DECISION is in the logger's runtime-enforced HUMAN_DECISION_EVENTS set
(Session 31 D2): decision_type, actor="human", and actor_name are required at
the logger layer; decision types reuse the existing canonical members
(HUMAN_APPROVAL / TASK_APPROVAL — decision #5).

Version: 1.0 · Session 32 · July 13, 2026
"""

from typing import Any, Optional

from sovereign_logger import SovereignLogger

# Anomaly severities the TS finding shapes carry (docs/18 §4 payload field).
VALID_SEVERITIES = frozenset({"P1", "P2", "P3"})

# The six-phase closed loop admits N → N+1 or the loop-closing 6 → 1 —
# the same rule the VIGIL Tier B gate and COUNSEL's PPBE context enforce.
def _is_valid_phase_pair(from_phase: Any, to_phase: Any) -> bool:
    if not isinstance(from_phase, int) or not isinstance(to_phase, int):
        return False
    if not (1 <= from_phase <= 6 and 1 <= to_phase <= 6):
        return False
    return to_phase == from_phase + 1 or (from_phase == 6 and to_phase == 1)


def _require_str(record: dict, field: str) -> str:
    value = record.get(field)
    if not isinstance(value, str) or value.strip() == "":
        raise ValueError(
            f"PPBE emission blocked — required field '{field}' is missing or empty. "
            "An incomplete record must not reach the audit trail."
        )
    return value


def emit_phase_transition(logger: SovereignLogger, record: dict) -> dict:
    """
    Emit PPBE_PHASE_TRANSITION from a VIGIL Tier B PhaseTransitionRecord
    (module-vigil/src/ppbe-authorization.ts — produced ONLY by an AUTHORIZED
    case). Field set per docs/18 §4: from_phase, to_phase,
    data_quality_assessment, integration_readiness_check, approving_human.
    """
    approving_human = _require_str(record, "approving_human")
    wsid = _require_str(record, "workflow_step_id")
    data_quality = _require_str(record, "data_quality_assessment")
    readiness = _require_str(record, "integration_readiness_check")
    if not _is_valid_phase_pair(record.get("from_phase"), record.get("to_phase")):
        raise ValueError(
            "PPBE emission blocked — the phase pair is not a transition the six-phase "
            "closed loop admits (forward one phase, or 6 back to 1)."
        )
    return logger.log(
        event_type="PPBE_PHASE_TRANSITION",
        workflow_step_id=wsid,
        product="VIGIL",
        actor_id=approving_human,
        outcome="ppbe_phase_transition_authorized",
        payload={
            "from_phase": record["from_phase"],
            "to_phase": record["to_phase"],
            "data_quality_assessment": data_quality,
            "integration_readiness_check": readiness,
            "approving_human": approving_human,
        },
    )


def emit_ppbe_decision(logger: SovereignLogger, emission: dict, product: str = "VIGIL") -> dict:
    """
    Emit PPBE_DECISION from a COUNSEL PPBEDecisionEmission
    (module-counsel/src/ppbe-decisions.ts) or an APEX synthesis acceptance
    (module-apex/src/ppbe-evidence-synthesizer.ts). PPBE_DECISION is a HUMAN
    DECISION event: decision_type / actor / actor_name are runtime-enforced by
    the logger (Session 31 D2); decision types reuse the canonical members.
    """
    approving_human = _require_str(emission, "approving_human")
    wsid = _require_str(emission, "workflow_step_id")
    decision_type = _require_str(emission, "decision_type")
    program_id = emission.get("program_id")
    objective_id = emission.get("objective_id")
    if not program_id and not objective_id:
        raise ValueError(
            "PPBE emission blocked — a PPBE_DECISION must carry program_id or objective_id (docs/18 §4)."
        )
    return logger.log(
        event_type="PPBE_DECISION",
        workflow_step_id=wsid,
        product=product,
        actor_id=approving_human,
        outcome="ppbe_decision_recorded",
        decision_type=decision_type,
        actor="human",
        actor_name=approving_human,
        payload={
            "ppbe_decision_type": emission.get("ppbe_decision_type"),
            "program_id": program_id,
            "objective_id": objective_id,
            "approving_human": approving_human,
            "document_id": emission.get("document_id"),
        },
    )


def emit_ppbe_anomaly(
    logger: SovereignLogger,
    finding: dict,
    agent_id: str,
    product: str,
) -> dict:
    """
    Emit PPBE_ANOMALY from a monitoring finding (ppbe-ledger-monitor,
    ppbe-dependency-tracker, or ppbe-coordination-assistant — all observe/
    track-and-route only; the human response happens in VIGIL). Field set per
    docs/18 §4: anomaly_type, program_id, threshold_breached, severity.
    """
    anomaly_type = _require_str(finding, "anomaly_type")
    threshold = _require_str(finding, "threshold_breached")
    wsid = _require_str(finding, "workflow_step_id")
    severity = finding.get("severity")
    if severity not in VALID_SEVERITIES:
        raise ValueError(
            f"PPBE emission blocked — severity must be one of {sorted(VALID_SEVERITIES)}, got {severity!r}."
        )
    return logger.log(
        event_type="PPBE_ANOMALY",
        workflow_step_id=wsid,
        product=product,
        actor_id=agent_id,
        agent_id=agent_id,
        outcome="ppbe_anomaly_routed_to_vigil",
        payload={
            "anomaly_type": anomaly_type,
            "program_id": finding.get("program_id"),
            "threshold_breached": threshold,
            "severity": severity,
        },
    )


def emit_evaluation_finding(
    logger: SovereignLogger,
    finding: dict,
    product: str = "APEX",
) -> dict:
    """
    Emit PPBE_EVALUATION_FINDING on EvaluationFinding creation (docs/18 §4 —
    emitted by APEX). Field set: finding_id, program_id, objective_id,
    feeds_planning_cycle (the R-P7 loop is measured, never assumed).
    """
    finding_id = _require_str(finding, "finding_id")
    program_id = _require_str(finding, "program_id")
    objective_id = _require_str(finding, "objective_id")
    wsid = _require_str(finding, "workflow_step_id")
    feeds = finding.get("feeds_planning_cycle")
    if not isinstance(feeds, bool):
        raise ValueError(
            "PPBE emission blocked — feeds_planning_cycle must be a boolean; the planning "
            "loop is measured, not assumed (risk R-P7)."
        )
    return logger.log(
        event_type="PPBE_EVALUATION_FINDING",
        workflow_step_id=wsid,
        product=product,
        actor_id="apex.report-generator",
        outcome="ppbe_evaluation_finding_recorded",
        payload={
            "finding_id": finding_id,
            "program_id": program_id,
            "objective_id": objective_id,
            "feeds_planning_cycle": feeds,
        },
    )

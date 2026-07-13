"""
SOVEREIGN Platform — Security Observability Framework
seed_ppbe_events.py — seed the Python-side PPBE audit trail (Session 33,
goal item 6; WE-6).

Writes a SYNTHETIC PPBE event trail to logs/ppbe_synthetic_seed.jsonl via the
real SovereignLogger and the real ppbe_emitter — so the dashboard's
event-activity counts and any Walkthrough F audit-trail demonstration read
from a genuine, chain-verified JSONL trail rather than an empty or fabricated
log. The trail is SEPARATE from the platform's operational log (its own
config, ppbe_seed_config.yaml) — seeding never pollutes the real chain.

SCOPE BOUNDARY (Session 33 opening prompt): this is DIRECT Python-side
seeding through ppbe_emitter, exactly as item 6 asks. It is NOT a live
TS-to-Python bridge — that boundary remains a deliberate config seam.

CANONICAL SOURCE: the records below MIRROR the narrative of
sovereign-data/src/synthetic/ppbe-seed.ts (and the module-local seeds), which
is canonical. The Session 33 e2e V&V pass cross-checks this trail's ids
against the TypeScript seed, so drift between the two is caught in CI rather
than trusted. Story points deliberately encoded here:
  - ALPHA has completed transitions 1→2 through 4→5; DELTA completed 4→5.
  - ECHO's 4→5 transition is ABSENT — it is held (the failed SYNTH-DEP-06
    handoff / overdue SYNTH-CI-05), so no PPBE_PHASE_TRANSITION exists for it.
  - The anomaly set mirrors what the seeded monitors actually fire: BRAVO and
    CHARLIE rate deviations, DELTA ceiling proximity, ECHO ceiling exceedance
    (P1), both timing-violation arms, the DEP-06 health failure, the DEP-07
    quality failure, and the CI-05 overdue phase transition.
  - All 20 evaluation findings are recorded with their feeds_planning_cycle
    measurements (13 of 20 feeding).

Run:  python3 seed_ppbe_events.py
Re-runnable: truncates its own output first, then verifies the fresh chain.

Version: 1.0 · Session 33 · July 13, 2026
"""

from pathlib import Path

from ppbe_emitter import (
    emit_evaluation_finding,
    emit_phase_transition,
    emit_ppbe_anomaly,
    emit_ppbe_decision,
)
from sovereign_logger import SovereignLogger

HERE = Path(__file__).parent
DEFAULT_CONFIG = str(HERE / "ppbe_seed_config.yaml")
DEFAULT_OUTPUT = HERE / "logs" / "ppbe_synthetic_seed.jsonl"

# ── The seeded narrative (mirrors ppbe-seed.ts — see the header) ──────────────

# ALPHA walked the loop to phase 5; DELTA completed 4→5. ECHO's 4→5 is ABSENT.
PHASE_TRANSITIONS = [
    {"from_phase": 1, "to_phase": 2, "program": "SYNTH-PRG-ALPHA"},
    {"from_phase": 2, "to_phase": 3, "program": "SYNTH-PRG-ALPHA"},
    {"from_phase": 3, "to_phase": 4, "program": "SYNTH-PRG-ALPHA"},
    {"from_phase": 4, "to_phase": 5, "program": "SYNTH-PRG-ALPHA"},
    {"from_phase": 4, "to_phase": 5, "program": "SYNTH-PRG-DELTA"},
]

DECISIONS = [
    # The three Phase 1 ranking decisions (COUNSEL — the objectives' decision_record_ids).
    {
        "decision_type": "HUMAN_APPROVAL",
        "ppbe_decision_type": "STRATEGIC_PRIORITY_RANKING",
        "program_id": None,
        "objective_id": f"SYNTH-SO-0{n}",
        "approving_human": "SYNTH D. Reviewer",
        "workflow_step_id": f"ppbe-decision-ranking-SYNTH-SO-0{n}",
        "document_id": f"SYNTH-DR-RANK-0{n}",
        "product": "COUNSEL",
    }
    for n in (1, 2, 3)
] + [
    # An accepted evidence synthesis (APEX Tier A output, human-accepted).
    {
        "decision_type": "HUMAN_APPROVAL",
        "ppbe_decision_type": None,
        "program_id": "SYNTH-PRG-BRAVO",
        "objective_id": "SYNTH-SO-02",
        "approving_human": "SYNTH D. Reviewer",
        "workflow_step_id": "ppbe-evidence-synthesis-SYNTH-PRG-BRAVO",
        "document_id": None,
        "product": "APEX",
    },
    # A Tier C obligation authorization (VIGIL — DELTA's SYNTH-OB-D4).
    {
        "decision_type": "HUMAN_APPROVAL",
        "ppbe_decision_type": None,
        "program_id": "SYNTH-PRG-DELTA",
        "objective_id": "SYNTH-SO-03",
        "approving_human": "SYNTH M. Hale",
        "workflow_step_id": "ppbe-obligation-SYNTH-OB-D4",
        "document_id": "SYNTH-DR-PPBE-OB-D4",
        "product": "VIGIL",
    },
]

ANOMALIES = [
    # Ledger monitor (APEX).
    ("OBLIGATION_RATE_DEVIATION", "SYNTH-PRG-BRAVO", "P2",
     "Obligations for FY 2026 Q3 are 60 percent below plan — the configured limit is 10 percent.",
     "ppbe-ledger-SYNTH-PRG-BRAVO", "ppbe-ledger-monitor", "APEX"),
    ("OBLIGATION_RATE_DEVIATION", "SYNTH-PRG-CHARLIE", "P1",
     "Obligations for FY 2026 Q3 are 60 percent above plan — the configured limit is 10 percent.",
     "ppbe-ledger-SYNTH-PRG-CHARLIE", "ppbe-ledger-monitor", "APEX"),
    ("CEILING_PROXIMITY", "SYNTH-PRG-DELTA", "P2",
     "Cumulative obligations are 95 percent of the lifecycle cost estimate — the configured proximity limit is 90 percent.",
     "ppbe-ledger-SYNTH-PRG-DELTA", "ppbe-ledger-monitor", "APEX"),
    ("CEILING_EXCEEDED", "SYNTH-PRG-ECHO", "P1",
     "Cumulative obligations are 106 percent of the lifecycle cost estimate — the ceiling has been exceeded.",
     "ppbe-ledger-SYNTH-PRG-ECHO", "ppbe-ledger-monitor", "APEX"),
    ("FEEDBACK_LOOP_STALL", "SYNTH-PRG-ECHO", "P3",
     "3 of 4 evaluation findings are not feeding the planning cycle — the configured limit is 50 percent.",
     "ppbe-ledger-SYNTH-PRG-ECHO", "ppbe-ledger-monitor", "APEX"),
    # Dependency tracker (FLOWPATH-hosted; product carried as its host FLOWPATH).
    ("TIMING_VIOLATION", "SYNTH-PRG-BRAVO", "P2",
     "The handoff from phase-2-planning-SYNTH-PRG-BRAVO to phase-3-programming-SYNTH-PRG-BRAVO was delivered after its due time — the timing requirement is: within 5 business days of phase close",
     "ppbe-dependency-SYNTH-DEP-03", "ppbe-dependency-tracker", "FLOWPATH"),
    ("TIMING_VIOLATION", "SYNTH-PRG-BRAVO", "P1",
     "The handoff from phase-3-programming-SYNTH-PRG-BRAVO to phase-4-formulation-SYNTH-PRG-BRAVO is overdue and undelivered — the timing requirement is: within 3 business days of the programming decision",
     "ppbe-dependency-SYNTH-DEP-04", "ppbe-dependency-tracker", "FLOWPATH"),
    ("DEPENDENCY_HEALTH_FAILURE", "SYNTH-PRG-ECHO", "P1",
     "The handoff from phase-4-formulation-SYNTH-PRG-ECHO to phase-5-execution-SYNTH-PRG-ECHO is marked failed — the standard is: Budget exhibit certified by CLEAR with full figure lineage.",
     "ppbe-dependency-SYNTH-DEP-06", "ppbe-dependency-tracker", "FLOWPATH"),
    ("QUALITY_THRESHOLD_FAILURE", "SYNTH-PRG-DELTA", "P2",
     "The handoff from phase-4-formulation-SYNTH-PRG-DELTA to phase-5-execution-SYNTH-PRG-DELTA failed its quality check — the standard is: Budget exhibit certified by CLEAR with full figure lineage.",
     "ppbe-dependency-SYNTH-DEP-07", "ppbe-dependency-tracker", "FLOWPATH"),
    # Coordination assistant (NEXUS-hosted).
    ("OVERDUE_PHASE_TRANSITION", "SYNTH-PRG-ECHO", "P1",
     "Complete the Depot Scheduling Pilot phase 4 to 5 handoff — due 2026-07-06T17:00:00Z, still open, responsible role PROGRAM_MANAGER.",
     "ppbe-coordination-SYNTH-CI-05", "ppbe-coordination-assistant", "NEXUS"),
]

# (finding_id, program, objective, feeds_planning_cycle) — all 20, mirroring ppbe-seed.ts.
FINDINGS = [
    ("SYNTH-EF-A1", "SYNTH-PRG-ALPHA", "SYNTH-SO-01", True),
    ("SYNTH-EF-A2", "SYNTH-PRG-ALPHA", "SYNTH-SO-01", True),
    ("SYNTH-EF-A3", "SYNTH-PRG-ALPHA", "SYNTH-SO-01", True),
    ("SYNTH-EF-A4", "SYNTH-PRG-ALPHA", "SYNTH-SO-01", True),
    ("SYNTH-EF-A5", "SYNTH-PRG-ALPHA", "SYNTH-SO-01", False),
    ("SYNTH-EF-B1", "SYNTH-PRG-BRAVO", "SYNTH-SO-02", True),
    ("SYNTH-EF-B2", "SYNTH-PRG-BRAVO", "SYNTH-SO-02", True),
    ("SYNTH-EF-B3", "SYNTH-PRG-BRAVO", "SYNTH-SO-02", True),
    ("SYNTH-EF-B4", "SYNTH-PRG-BRAVO", "SYNTH-SO-02", False),
    ("SYNTH-EF-C1", "SYNTH-PRG-CHARLIE", "SYNTH-SO-02", True),
    ("SYNTH-EF-C2", "SYNTH-PRG-CHARLIE", "SYNTH-SO-02", True),
    ("SYNTH-EF-C3", "SYNTH-PRG-CHARLIE", "SYNTH-SO-02", True),
    ("SYNTH-EF-C4", "SYNTH-PRG-CHARLIE", "SYNTH-SO-02", False),
    ("SYNTH-EF-D1", "SYNTH-PRG-DELTA", "SYNTH-SO-03", True),
    ("SYNTH-EF-D2", "SYNTH-PRG-DELTA", "SYNTH-SO-03", True),
    ("SYNTH-EF-D3", "SYNTH-PRG-DELTA", "SYNTH-SO-03", False),
    ("SYNTH-EF-E1", "SYNTH-PRG-ECHO", "SYNTH-SO-03", True),
    ("SYNTH-EF-E2", "SYNTH-PRG-ECHO", "SYNTH-SO-03", False),
    ("SYNTH-EF-E3", "SYNTH-PRG-ECHO", "SYNTH-SO-03", False),
    ("SYNTH-EF-E4", "SYNTH-PRG-ECHO", "SYNTH-SO-03", False),
]


def seed(config_path: str = DEFAULT_CONFIG) -> dict:
    """
    Seed the synthetic PPBE trail. Truncates the configured output first so the
    run is repeatable, then emits every record through the real emitters and
    verifies the fresh chain. Returns a summary dict.
    """
    logger = SovereignLogger(config_path=config_path)
    # Re-runnable: a seed trail is a generated fixture, not an append-only
    # operational log — truncate, then re-emit and re-verify from a zero chain.
    logger.output_path.parent.mkdir(parents=True, exist_ok=True)
    logger.output_path.write_text("")
    logger = SovereignLogger(config_path=config_path)  # re-read the (now zero) chain head

    for t in PHASE_TRANSITIONS:
        emit_phase_transition(
            logger,
            {
                "from_phase": t["from_phase"],
                "to_phase": t["to_phase"],
                "data_quality_assessment":
                    f"SYNTH seeded assessment for {t['program']}: inputs validated against their source records.",
                "integration_readiness_check":
                    f"SYNTH seeded readiness for {t['program']}: dependencies healthy at handoff time.",
                "approving_human": "SYNTH Simulated Operator",
                "workflow_step_id":
                    f"ppbe-phase-transition-{t['from_phase']}-to-{t['to_phase']}-{t['program']}",
            },
        )

    for d in DECISIONS:
        emit_ppbe_decision(logger, d, product=d["product"])

    for anomaly_type, program_id, severity, threshold, wsid, agent_id, product in ANOMALIES:
        emit_ppbe_anomaly(
            logger,
            {
                "anomaly_type": anomaly_type,
                "program_id": program_id,
                "threshold_breached": threshold,
                "severity": severity,
                "workflow_step_id": wsid,
            },
            agent_id,
            product,
        )

    for finding_id, program_id, objective_id, feeds in FINDINGS:
        emit_evaluation_finding(
            logger,
            {
                "finding_id": finding_id,
                "program_id": program_id,
                "objective_id": objective_id,
                "feeds_planning_cycle": feeds,
                "workflow_step_id": f"ppbe-finding-{finding_id}",
            },
        )

    chain = logger.verify_chain()
    return {
        "output_path": str(logger.output_path),
        "phase_transitions": len(PHASE_TRANSITIONS),
        "decisions": len(DECISIONS),
        "anomalies": len(ANOMALIES),
        "evaluation_findings": len(FINDINGS),
        "total": len(PHASE_TRANSITIONS) + len(DECISIONS) + len(ANOMALIES) + len(FINDINGS),
        "chain_valid": chain["valid"],
        "entries_checked": chain["entries_checked"],
    }


if __name__ == "__main__":
    summary = seed()
    print("SYNTH PPBE audit trail seeded:")
    for key, value in summary.items():
        print(f"  {key}: {value}")
    if not summary["chain_valid"]:
        raise SystemExit("Chain verification FAILED — do not use this trail.")

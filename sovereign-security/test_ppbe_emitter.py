"""
test_ppbe_emitter.py — Session 32 (D8).
The Python-side PPBE event emitters: each of the four Python-only PPBE event
types emitted from the field sets the TypeScript layer produces (docs/18 §4),
with incomplete records blocked BEFORE they reach the audit trail, PPBE_DECISION
runtime-enforced as a human decision, and the chain intact after emission.
"""

from pathlib import Path

import pytest
import yaml

from ppbe_emitter import (
    emit_evaluation_finding,
    emit_phase_transition,
    emit_ppbe_anomaly,
    emit_ppbe_decision,
)
from sovereign_logger import (
    InvalidFieldValueError,
    MissingRequiredFieldError,
    SovereignLogger,
)


@pytest.fixture
def tmp_config(tmp_path: Path) -> str:
    config = {
        "sovereign": {
            "version": "1.0",
            "logger": {
                "output_path": str(tmp_path / "sovereign.jsonl"),
                "remote_sink": None,
            },
        }
    }
    config_path = tmp_path / "sovereign_config.yaml"
    config_path.write_text(yaml.dump(config))
    return str(config_path)


@pytest.fixture
def logger(tmp_config: str) -> SovereignLogger:
    return SovereignLogger(config_path=tmp_config)


# ── Fixture records — the exact shapes the TS layer produces ──────────────────

def phase_transition_record(**over) -> dict:
    """module-vigil ppbe-authorization.ts PhaseTransitionRecord (AUTHORIZED Tier B case)."""
    record = {
        "from_phase": 4,
        "to_phase": 5,
        "data_quality_assessment": "All Phase 4 exhibits validated against their source records.",
        "integration_readiness_check": "All 3 dependencies originating from this phase are healthy.",
        "approving_human": "Jane Smith",
        "workflow_step_id": "ppbe-phase-transition-4-to-5",
    }
    record.update(over)
    return record


def decision_emission(**over) -> dict:
    """module-counsel ppbe-decisions.ts PPBEDecisionEmission."""
    emission = {
        "decision_type": "HUMAN_APPROVAL",
        "ppbe_decision_type": "PROGRAMMING_TRADE_OFF",
        "program_id": "PRG-001",
        "objective_id": "SO-2027-01",
        "approving_human": "Dana Reviewer",
        "workflow_step_id": "ppbe-decision-PRG-001-step-1",
        "document_id": "COUNSEL-DR-PPBE-1",
    }
    emission.update(over)
    return emission


def anomaly_finding(**over) -> dict:
    """module-apex ppbe-ledger-monitor.ts PPBEAnomalyFinding (or coordination/dependency)."""
    finding = {
        "anomaly_type": "OBLIGATION_RATE_DEVIATION",
        "program_id": "PRG-001",
        "threshold_breached": "Obligations for FY 2027 Q1 are 40 percent below plan — the configured limit is 10 percent.",
        "severity": "P2",
        "workflow_step_id": "ppbe-ledger-PRG-001",
    }
    finding.update(over)
    return finding


def evaluation_finding(**over) -> dict:
    """@sovereign/data EvaluationFinding (the docs/18 §4 emission fields)."""
    finding = {
        "finding_id": "EF-1",
        "program_id": "PRG-001",
        "objective_id": "SO-2027-01",
        "feeds_planning_cycle": True,
        "workflow_step_id": "ppbe-finding-EF-1",
    }
    finding.update(over)
    return finding


# ── PPBE_PHASE_TRANSITION ─────────────────────────────────────────────────────

class TestPhaseTransition:
    def test_emits_the_docs18_field_set(self, logger):
        entry = emit_phase_transition(logger, phase_transition_record())
        assert entry["event_type"] == "PPBE_PHASE_TRANSITION"
        assert entry["product"] == "VIGIL"
        assert entry["workflow_step_id"] == "ppbe-phase-transition-4-to-5"
        assert entry["payload"]["from_phase"] == 4
        assert entry["payload"]["to_phase"] == 5
        assert entry["payload"]["approving_human"] == "Jane Smith"
        assert entry["payload"]["data_quality_assessment"]
        assert entry["payload"]["integration_readiness_check"]

    def test_accepts_the_loop_closing_6_to_1(self, logger):
        entry = emit_phase_transition(
            logger,
            phase_transition_record(
                from_phase=6, to_phase=1, workflow_step_id="ppbe-phase-transition-6-to-1"
            ),
        )
        assert entry["payload"]["to_phase"] == 1

    def test_blocks_an_illegal_phase_pair(self, logger):
        with pytest.raises(ValueError, match="closed loop"):
            emit_phase_transition(logger, phase_transition_record(from_phase=2, to_phase=5))

    def test_blocks_a_record_missing_its_approving_human(self, logger):
        with pytest.raises(ValueError, match="approving_human"):
            emit_phase_transition(logger, phase_transition_record(approving_human=""))


# ── PPBE_DECISION (runtime-enforced human decision) ───────────────────────────

class TestPpbeDecision:
    def test_emits_as_a_human_decision_with_canonical_decision_type(self, logger):
        entry = emit_ppbe_decision(logger, decision_emission(), product="COUNSEL")
        assert entry["event_type"] == "PPBE_DECISION"
        assert entry["decision_type"] == "HUMAN_APPROVAL"
        assert entry["actor"] == "human"
        assert entry["actor_name"] == "Dana Reviewer"
        assert entry["payload"]["ppbe_decision_type"] == "PROGRAMMING_TRADE_OFF"
        assert entry["payload"]["document_id"] == "COUNSEL-DR-PPBE-1"

    def test_accepts_a_synthesis_acceptance_shape(self, logger):
        """module-apex synthesisAcceptanceRecord: program/objective id lists become the payload."""
        acceptance = {
            "decision_type": "HUMAN_APPROVAL",
            "program_id": "PRG-001",
            "objective_id": "SO-2027-01",
            "approving_human": "Jane Smith",
            "workflow_step_id": "ppbe-evidence-synthesis-PRG-001",
        }
        entry = emit_ppbe_decision(logger, acceptance, product="APEX")
        assert entry["product"] == "APEX"

    def test_blocks_when_neither_program_nor_objective_is_carried(self, logger):
        with pytest.raises(ValueError, match="program_id or objective_id"):
            emit_ppbe_decision(logger, decision_emission(program_id=None, objective_id=None))

    def test_logger_rejects_a_non_canonical_decision_type(self, logger):
        with pytest.raises(InvalidFieldValueError):
            emit_ppbe_decision(logger, decision_emission(decision_type="PPBE_SPECIAL_APPROVAL"))


# ── PPBE_ANOMALY ──────────────────────────────────────────────────────────────

class TestPpbeAnomaly:
    def test_emits_a_ledger_monitor_finding(self, logger):
        entry = emit_ppbe_anomaly(logger, anomaly_finding(), "ppbe-ledger-monitor", "APEX")
        assert entry["event_type"] == "PPBE_ANOMALY"
        assert entry["agent_id"] == "ppbe-ledger-monitor"
        assert entry["payload"]["anomaly_type"] == "OBLIGATION_RATE_DEVIATION"
        assert entry["payload"]["severity"] == "P2"

    def test_emits_a_coordination_finding_under_nexus(self, logger):
        finding = anomaly_finding(
            anomaly_type="OVERDUE_PHASE_TRANSITION",
            severity="P1",
            workflow_step_id="ppbe-coordination-CI-2",
        )
        entry = emit_ppbe_anomaly(logger, finding, "ppbe-coordination-assistant", "NEXUS")
        assert entry["product"] == "NEXUS"
        assert entry["payload"]["severity"] == "P1"

    def test_blocks_an_unknown_severity_and_a_missing_threshold(self, logger):
        with pytest.raises(ValueError, match="severity"):
            emit_ppbe_anomaly(logger, anomaly_finding(severity="CRITICAL"), "ppbe-ledger-monitor", "APEX")
        with pytest.raises(ValueError, match="threshold_breached"):
            emit_ppbe_anomaly(logger, anomaly_finding(threshold_breached=""), "ppbe-ledger-monitor", "APEX")


# ── PPBE_EVALUATION_FINDING ───────────────────────────────────────────────────

class TestEvaluationFinding:
    def test_emits_the_r_p7_measurement(self, logger):
        entry = emit_evaluation_finding(logger, evaluation_finding(feeds_planning_cycle=False))
        assert entry["event_type"] == "PPBE_EVALUATION_FINDING"
        assert entry["product"] == "APEX"
        assert entry["payload"]["feeds_planning_cycle"] is False

    def test_blocks_an_unmeasured_planning_loop(self, logger):
        with pytest.raises(ValueError, match="R-P7"):
            emit_evaluation_finding(logger, evaluation_finding(feeds_planning_cycle=None))

    def test_blocks_a_finding_without_its_objective(self, logger):
        with pytest.raises(ValueError, match="objective_id"):
            emit_evaluation_finding(logger, evaluation_finding(objective_id=""))


# ── The full cycle on the audit trail ─────────────────────────────────────────

class TestFullCycleEmission:
    def test_all_six_phase_transitions_plus_decisions_land_with_an_intact_chain(self, logger):
        # Every transition of the closed loop: 1→2 … 5→6, then 6→1.
        pairs = [(1, 2), (2, 3), (3, 4), (4, 5), (5, 6), (6, 1)]
        for from_phase, to_phase in pairs:
            emit_phase_transition(
                logger,
                phase_transition_record(
                    from_phase=from_phase,
                    to_phase=to_phase,
                    workflow_step_id=f"ppbe-phase-transition-{from_phase}-to-{to_phase}",
                ),
            )
        emit_ppbe_decision(logger, decision_emission(), product="COUNSEL")
        emit_ppbe_anomaly(logger, anomaly_finding(), "ppbe-ledger-monitor", "APEX")
        emit_evaluation_finding(logger, evaluation_finding())

        result = logger.verify_chain()
        assert result["valid"] is True
        assert result["entries_checked"] == 9

    def test_missing_workflow_step_id_is_blocked_at_the_emitter(self, logger):
        with pytest.raises(ValueError, match="workflow_step_id"):
            emit_phase_transition(logger, phase_transition_record(workflow_step_id=""))
        with pytest.raises((ValueError, MissingRequiredFieldError)):
            emit_ppbe_decision(logger, decision_emission(workflow_step_id=""))

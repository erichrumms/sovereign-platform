"""
SOVEREIGN Platform — tests for evaluate.py (CPMI-VRS model-evaluation pipeline).

Covers the four gate checks, the PASS/FAIL verdict, promotion gating, and emission of
MODEL_EVALUATION_COMPLETE through the real Security Framework logger (which also proves the
GD-13 / Constraint #11 propagation to APPROVED_EVENT_TYPES took effect).
"""

import json
from pathlib import Path

import pytest
import yaml

from evaluate import (
    ModelEvaluationInput,
    ACCURACY_THRESHOLD,
    GATE_CHECKS,
    GATE_NAMES,
    run_gates,
    evaluate_model,
    can_promote,
    gate1_scope,
    gate2_transparency,
    gate3_accuracy,
    gate4_monitoring,
)
from sovereign_logger import SovereignLogger, APPROVED_EVENT_TYPES


def base_input(**over) -> ModelEvaluationInput:
    fields = dict(model_id="mistral:13b-q4", task_id="task-1", workflow_step_id="agentos-task-task-1")
    fields.update(over)
    return ModelEvaluationInput(**fields)


# ── Gate checks ────────────────────────────────────────────────

class TestGateChecks:
    def test_there_are_four_gates_named(self):
        assert len(GATE_CHECKS) == 4
        assert set(GATE_NAMES) == {1, 2, 3, 4}

    def test_gate1_scope(self):
        assert gate1_scope(base_input(has_scope_definition=True)) is True
        assert gate1_scope(base_input(has_scope_definition=False)) is False

    def test_gate2_transparency(self):
        assert gate2_transparency(base_input(has_model_card=True)) is True
        assert gate2_transparency(base_input(has_model_card=False)) is False

    def test_gate3_accuracy_threshold(self):
        assert gate3_accuracy(base_input(accuracy_score=ACCURACY_THRESHOLD)) is True
        assert gate3_accuracy(base_input(accuracy_score=ACCURACY_THRESHOLD - 0.01)) is False

    def test_gate4_monitoring(self):
        assert gate4_monitoring(base_input(has_monitoring_baseline=True)) is True
        assert gate4_monitoring(base_input(has_monitoring_baseline=False)) is False

    def test_run_gates_returns_four_in_order(self):
        gates = run_gates(base_input())
        assert [g["gate"] for g in gates] == [1, 2, 3, 4]
        assert all(g["passed"] for g in gates)


# ── Verdict + promotion gate ───────────────────────────────────

class TestEvaluateModel:
    def test_all_gates_pass_yields_PASS_and_promotable(self):
        result = evaluate_model(base_input())
        assert result["verdict"] == "PASS"
        assert can_promote(result) is True
        assert len(result["gate_results"]) == 4
        assert all(g["passed"] for g in result["gate_results"])
        # Shape compatible with evaluate-port.ts GateCheck = {gate, passed}.
        assert set(result["gate_results"][0].keys()) == {"gate", "passed"}

    @pytest.mark.parametrize("override,failed_gate", [
        ({"has_scope_definition": False}, 1),
        ({"has_model_card": False}, 2),
        ({"accuracy_score": 0.5}, 3),
        ({"has_monitoring_baseline": False}, 4),
    ])
    def test_any_failed_gate_blocks_promotion(self, override, failed_gate):
        result = evaluate_model(base_input(**override))
        assert result["verdict"] == "FAIL"
        assert can_promote(result) is False
        gate = next(g for g in result["gate_results"] if g["gate"] == failed_gate)
        assert gate["passed"] is False
        assert GATE_NAMES[failed_gate] in result["detail"]


# ── Logger emission (Security Framework) ───────────────────────

@pytest.fixture
def logger(tmp_path: Path) -> SovereignLogger:
    config = {"sovereign": {"logger": {"output_path": str(tmp_path / "sovereign.jsonl")}}}
    config_path = tmp_path / "sovereign_config.yaml"
    config_path.write_text(yaml.dump(config))
    return SovereignLogger(config_path=str(config_path))


class TestLoggerEmission:
    def test_MODEL_EVALUATION_COMPLETE_is_in_the_approved_taxonomy(self):
        # Proves the GD-13 / Constraint #11 propagation to the Python logger.
        assert "MODEL_EVALUATION_COMPLETE" in APPROVED_EVENT_TYPES

    def test_emits_through_the_real_logger_with_workflow_step_id(self, logger):
        evaluate_model(base_input(), logger=logger)
        lines = [l for l in logger.output_path.read_text().splitlines() if l.strip()]
        assert len(lines) == 1
        entry = json.loads(lines[0])
        assert entry["event_type"] == "MODEL_EVALUATION_COMPLETE"
        assert entry["product"] == "AGENTOS"
        assert entry["workflow_step_id"] == "agentos-task-task-1"  # Constraint #6
        assert entry["payload"]["verdict"] == "PASS"
        assert entry["outcome"] == "model_evaluation_pass"

    def test_fail_verdict_emits_with_fail_outcome(self, logger):
        evaluate_model(base_input(accuracy_score=0.1), logger=logger)
        entry = json.loads([l for l in logger.output_path.read_text().splitlines() if l.strip()][0])
        assert entry["payload"]["verdict"] == "FAIL"
        assert entry["outcome"] == "model_evaluation_fail"

    def test_no_logger_is_allowed_and_returns_result(self):
        result = evaluate_model(base_input(), logger=None)
        assert result["verdict"] == "PASS"

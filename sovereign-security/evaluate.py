"""
SOVEREIGN Platform — Security Observability Framework
evaluate.py

The CPMI-VRS model-evaluation pipeline. Before a model is promoted to the active
inference endpoint, AgentOS runs it through the four CPMI-VRS gates. evaluate.py is the
authoritative implementation of those checks; AgentOS reaches it through the injectable
`evaluate-port.ts` seam (module-agentos) — this module is the live backing that seam wires
to by configuration (Standing Constraint #3).

The four gates (CPMI-VRS, matching the platform gate model):
  - Gate 1 — Scope and Boundary:   the model declares a scope / boundary of use.
  - Gate 2 — Transparency:          an AI disclosure / model card is present.
  - Gate 3 — Accuracy and Validation: benchmark accuracy meets the threshold.
  - Gate 4 — Monitoring and Drift:  a monitoring baseline is registered.

A model may be promoted only when ALL four gates pass (verdict PASS). evaluate.py emits
MODEL_EVALUATION_COMPLETE (shell-contract v1.10 / GD-13) through the Security Framework
logger so the verdict is on the platform audit trail (Constraint #1 — no independent audit
system; Constraint #6 — workflow_step_id on every event).

SCOPE (Session 16, D3): synthetic/dev backing — Governance Clock OFF, no live model is
loaded or evaluated. The gate checks read declared model-metadata fields supplied by the
caller (synthetic). Wiring a live model-evaluation harness is future work.

The result shape is compatible with module-agentos/src/evaluate-port.ts `EvaluationResult`
(model_id, task_id, verdict, gate_results:[{gate, passed}], detail) so the live backing maps
directly onto the existing TypeScript seam (Constraint #3 — no rewrite).

Version: 1.0
Date: June 2026
Stage: synthetic/dev — no live model evaluation.
"""

from dataclasses import dataclass, field
from typing import Any, Optional, Protocol


# ─────────────────────────────────────────────────────────────
# GATE DEFINITIONS
# ─────────────────────────────────────────────────────────────

GATE_NAMES: dict[int, str] = {
    1: "Scope and Boundary",
    2: "Transparency",
    3: "Accuracy and Validation",
    4: "Monitoring and Drift",
}

#: Minimum benchmark accuracy a model must reach to clear Gate 3.
ACCURACY_THRESHOLD: float = 0.8

#: The product under which evaluation events are logged.
EVALUATE_PRODUCT = "AGENTOS"

#: The actor id stamped on evaluation events. NOT a registered agent — evaluate.py is a
#: pipeline (routing/validation logic), so it carries a system actor id, not an agent_id.
EVALUATE_ACTOR_ID = "agentos-evaluate-pipeline"

#: The GD-13 event type emitted on completion.
MODEL_EVALUATION_COMPLETE = "MODEL_EVALUATION_COMPLETE"


class SupportsLog(Protocol):
    """Duck-typed Logger interface — anything with the SovereignLogger.log signature."""

    def log(self, **kwargs: Any) -> dict[str, Any]: ...


@dataclass
class ModelEvaluationInput:
    """
    The model metadata evaluate.py validates. Synthetic/dev: the gate checks read these
    declared fields rather than loading a live model. Defaults all clear — a caller (or test)
    sets a field falsy/low to exercise a failing gate.
    """

    model_id: str
    task_id: str
    workflow_step_id: str
    has_scope_definition: bool = True        # Gate 1
    has_model_card: bool = True              # Gate 2 (AI transparency disclosure)
    accuracy_score: float = 1.0              # Gate 3
    has_monitoring_baseline: bool = True     # Gate 4
    metadata: dict[str, Any] = field(default_factory=dict)


# ─────────────────────────────────────────────────────────────
# GATE CHECKS (pure)
# ─────────────────────────────────────────────────────────────

def gate1_scope(inp: ModelEvaluationInput) -> bool:
    """Gate 1 — the model declares a scope / boundary of use."""
    return bool(inp.has_scope_definition)


def gate2_transparency(inp: ModelEvaluationInput) -> bool:
    """Gate 2 — an AI disclosure / model card is present."""
    return bool(inp.has_model_card)


def gate3_accuracy(inp: ModelEvaluationInput) -> bool:
    """Gate 3 — benchmark accuracy meets the threshold."""
    return inp.accuracy_score >= ACCURACY_THRESHOLD


def gate4_monitoring(inp: ModelEvaluationInput) -> bool:
    """Gate 4 — a monitoring / drift baseline is registered."""
    return bool(inp.has_monitoring_baseline)


#: Ordered gate runners — index 0 is Gate 1.
GATE_CHECKS = [gate1_scope, gate2_transparency, gate3_accuracy, gate4_monitoring]


def run_gates(inp: ModelEvaluationInput) -> list[dict[str, Any]]:
    """Run all four gates, returning [{gate, name, passed}] in gate order."""
    return [
        {"gate": i + 1, "name": GATE_NAMES[i + 1], "passed": bool(check(inp))}
        for i, check in enumerate(GATE_CHECKS)
    ]


# ─────────────────────────────────────────────────────────────
# EVALUATION
# ─────────────────────────────────────────────────────────────

def evaluate_model(
    inp: ModelEvaluationInput,
    logger: Optional[SupportsLog] = None,
) -> dict[str, Any]:
    """
    Run the four CPMI-VRS gates for a model and return the evaluation result.

    The result is compatible with the TypeScript `EvaluationResult` (evaluate-port.ts):
    {model_id, task_id, verdict, gate_results:[{gate, passed}], detail}. A model passes
    (verdict PASS) only when ALL four gates pass.

    If `logger` is supplied, emits MODEL_EVALUATION_COMPLETE through it (the Security
    Framework logger) — every event carries workflow_step_id (Constraint #6).
    """
    gate_detail = run_gates(inp)
    passed_all = all(g["passed"] for g in gate_detail)
    verdict = "PASS" if passed_all else "FAIL"

    failed = [f"Gate {g['gate']} ({g['name']})" for g in gate_detail if not g["passed"]]
    detail = (
        "All four CPMI-VRS gates passed — model may be promoted."
        if passed_all
        else "Model blocked from promotion — failed: " + ", ".join(failed) + "."
    )

    result: dict[str, Any] = {
        "model_id": inp.model_id,
        "task_id": inp.task_id,
        "verdict": verdict,
        # Compatible with evaluate-port.ts GateCheck = {gate, passed}.
        "gate_results": [{"gate": g["gate"], "passed": g["passed"]} for g in gate_detail],
        "detail": detail,
    }

    if logger is not None:
        logger.log(
            event_type=MODEL_EVALUATION_COMPLETE,
            workflow_step_id=inp.workflow_step_id,
            product=EVALUATE_PRODUCT,
            actor_id=EVALUATE_ACTOR_ID,
            outcome=f"model_evaluation_{verdict.lower()}",
            payload={
                "model_id": inp.model_id,
                "task_id": inp.task_id,
                "verdict": verdict,
                "gate_results": result["gate_results"],
                "detail": detail,
            },
        )

    return result


def can_promote(result: dict[str, Any]) -> bool:
    """Whether a model may be promoted — only on a PASS verdict (all gates passed)."""
    return result.get("verdict") == "PASS"

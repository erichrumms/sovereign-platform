/**
 * SOVEREIGN Platform — module-agentos
 * evaluate-port.ts — the injectable model-evaluation port (AgentOS → evaluate.py) + dev backing.
 *
 * AgentOS validates a model against the CPMI-VRS gates BEFORE it is promoted — the
 * sovereign-security `evaluate.py` pipeline. AgentOS reaches it through this injectable PORT,
 * NOT a direct call (Standing Constraints #1 / #3 — same pattern as the VIGIL approval port
 * and NEXUS's AgentOS port). This session the backing is SYNTHETIC/DEV (Governance Clock OFF):
 * no live model evaluation. The live `evaluate.py` backing is injected by configuration in a
 * later session — no AgentOS rewrite (Constraint #3).
 *
 * SCOPE NOTE (Session 15, D4): this is the AgentOS-side seam only. `evaluate.py` does not yet
 * exist in sovereign-security, and an evaluation-outcome Logger event would require a new
 * SovereignEventType (a shell-contract change beyond GD-11 — not authorized this session).
 * So the port returns a validation result the caller uses as a promotion gate; it emits no
 * Logger event. The live pipeline + an evaluation event type are future work (see handoff).
 *
 * Version: 1.0 · Session 15 · June 24, 2026
 */

export type EvaluationVerdict = "PASS" | "FAIL";

/** CPMI-VRS gate numbers evaluate.py checks before promotion. */
export type VrsGateNumber = 1 | 2 | 3 | 4;

export interface GateCheck {
  gate: VrsGateNumber;
  passed: boolean;
}

/** What AgentOS hands to evaluate.py to validate a model before promotion. */
export interface ModelEvaluationInput {
  model_id: string;
  task_id: string;
  workflow_step_id: string;
}

/** The CPMI-VRS validation result evaluate.py returns. */
export interface EvaluationResult {
  model_id: string;
  task_id: string;
  verdict: EvaluationVerdict;
  gate_results: GateCheck[];
  detail: string;
}

/** The injectable evaluate.py port. evaluateModel() returns the CPMI-VRS validation result. */
export interface EvaluatePort {
  evaluateModel: (input: ModelEvaluationInput) => EvaluationResult;
}

/** Whether a model may be promoted — only on a PASS verdict (all gates passed). */
export function canPromote(result: EvaluationResult): boolean {
  return result.verdict === "PASS";
}

const ALL_GATES: readonly VrsGateNumber[] = [1, 2, 3, 4];

/**
 * The default SYNTHETIC/DEV evaluate port (Governance Clock OFF — no live model evaluation).
 * Defaults to a PASS across all four CPMI-VRS gates; pass "FAIL" to exercise the blocked-
 * promotion path (synthetically failing Gate 3, the human-attestation gate). Replace by
 * injecting a live evaluate.py-backed port (configuration change, Constraint #3).
 */
export function createSyntheticEvaluatePort(verdict: EvaluationVerdict = "PASS"): EvaluatePort {
  return {
    evaluateModel: (input: ModelEvaluationInput): EvaluationResult => ({
      model_id: input.model_id,
      task_id: input.task_id,
      verdict,
      gate_results: ALL_GATES.map((gate) => ({ gate, passed: verdict === "PASS" || gate !== 3 })),
      detail:
        verdict === "PASS"
          ? "Synthetic CPMI-VRS evaluation — all four gates passed (dev/no live evaluation)."
          : "Synthetic CPMI-VRS evaluation — Gate 3 (accuracy/attestation) failed (dev).",
    }),
  };
}

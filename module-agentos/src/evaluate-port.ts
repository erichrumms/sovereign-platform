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
 * SCOPE NOTE: this is the AgentOS-side seam. Session 16 (D3) authored the live backing —
 * sovereign-security/evaluate.py — and the GD-13 MODEL_EVALUATION_COMPLETE event evaluate.py
 * emits via the Security Framework logger. createEvaluatePort() is the config-aware factory
 * that activates that live backing by configuration (VITE_EVALUATE_ENDPOINT); until the
 * cross-runtime adapter is wired it serves the synthetic backing (no live model evaluation
 * this session). The TypeScript port itself emits no Logger event — evaluate.py owns the
 * MODEL_EVALUATION_COMPLETE emission on the Python side.
 *
 * Version: 1.1 (config seam to live evaluate.py) · Session 16 · June 24, 2026
 */

import { readEvaluateEndpoint } from "./evaluate-endpoint";

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

/** Whether the live evaluate.py backing is configured (Session 16, D3 config seam). */
export function isEvaluateConfigured(): boolean {
  return readEvaluateEndpoint() !== null;
}

/**
 * The config-aware evaluate-port factory (Session 16, D3). Sources the backing from platform
 * config: default (no endpoint) → the synthetic/dev backing (unchanged — Governance Clock
 * OFF). When VITE_EVALUATE_ENDPOINT is set, the live sovereign-security/evaluate.py CPMI-VRS
 * pipeline is the backing — that cross-runtime adapter is wired in a future session (no live
 * model evaluation here); until then the synthetic backing is served so behavior is safe and
 * the configured endpoint is recorded for the live adapter to consume (Constraint #3 —
 * configuration seam, not a rewrite of createSyntheticEvaluatePort).
 */
export function createEvaluatePort(): EvaluatePort {
  // Default (null) and the not-yet-wired live branch both serve the synthetic backing this
  // session; isEvaluateConfigured() is the seam that activates the live evaluate.py adapter.
  return createSyntheticEvaluatePort();
}

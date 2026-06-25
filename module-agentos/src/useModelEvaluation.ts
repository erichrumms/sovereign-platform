/**
 * SOVEREIGN Platform — module-agentos
 * useModelEvaluation.ts — the model-evaluation hook (CPMI-VRS gate validation before promotion).
 *
 * Wraps the injectable EvaluatePort: evaluate(input) runs the (synthetic) CPMI-VRS validation
 * and exposes the result + whether the model may be promoted (PASS verdict). No Logger event
 * is emitted — an evaluation-outcome event type is not in the shell contract and adding one is
 * a shell-contract change beyond GD-11 (not authorized this session). The result is a promotion
 * gate the caller consumes.
 *
 * Version: 1.0 · Session 15 · June 24, 2026
 */

import { useCallback, useState } from "react";

import {
  canPromote,
  type EvaluatePort,
  type EvaluationResult,
  type ModelEvaluationInput,
} from "./evaluate-port";

export interface UseModelEvaluation {
  result: EvaluationResult | null;
  /** Whether the last evaluation permits promotion (false before any evaluation). */
  canPromote: boolean;
  /** Run the CPMI-VRS evaluation for a model and store the result. */
  evaluate: (input: ModelEvaluationInput) => EvaluationResult;
  reset: () => void;
}

export function useModelEvaluation(port: EvaluatePort): UseModelEvaluation {
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const evaluate = useCallback(
    (input: ModelEvaluationInput): EvaluationResult => {
      const r = port.evaluateModel(input);
      setResult(r);
      return r;
    },
    [port]
  );

  const reset = useCallback((): void => setResult(null), []);

  return { result, canPromote: result ? canPromote(result) : false, evaluate, reset };
}

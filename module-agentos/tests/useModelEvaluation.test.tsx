/** @jest-environment jsdom */
/**
 * module-agentos — useModelEvaluation.test.tsx
 * The model-evaluation hook: evaluate() stores the result and exposes canPromote; a FAIL
 * verdict blocks promotion; reset() clears the result.
 */
import { renderHook, act } from "@testing-library/react";

import { useModelEvaluation } from "../src/useModelEvaluation";
import { createSyntheticEvaluatePort } from "../src/evaluate-port";

const input = { model_id: "mistral:13b-q4", task_id: "task-1", workflow_step_id: "agentos-task-task-1" };

describe("useModelEvaluation", () => {
  it("starts with no result and canPromote false", () => {
    const { result } = renderHook(() => useModelEvaluation(createSyntheticEvaluatePort("PASS")));
    expect(result.current.result).toBeNull();
    expect(result.current.canPromote).toBe(false);
  });

  it("evaluate() with a PASS port permits promotion", () => {
    const { result } = renderHook(() => useModelEvaluation(createSyntheticEvaluatePort("PASS")));
    act(() => { result.current.evaluate(input); });
    expect(result.current.result?.verdict).toBe("PASS");
    expect(result.current.canPromote).toBe(true);
  });

  it("evaluate() with a FAIL port blocks promotion; reset() clears it", () => {
    const { result } = renderHook(() => useModelEvaluation(createSyntheticEvaluatePort("FAIL")));
    act(() => { result.current.evaluate(input); });
    expect(result.current.canPromote).toBe(false);
    act(() => result.current.reset());
    expect(result.current.result).toBeNull();
  });
});

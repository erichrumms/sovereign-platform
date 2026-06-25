/**
 * module-agentos — evaluate-port.test.ts
 * The injectable evaluate.py port (AgentOS → CPMI-VRS validation): a synthetic PASS clears
 * all four gates and permits promotion; a synthetic FAIL fails Gate 3 and blocks promotion.
 */
import { createSyntheticEvaluatePort, createEvaluatePort, isEvaluateConfigured, canPromote, type ModelEvaluationInput } from "../src/evaluate-port";

const input: ModelEvaluationInput = {
  model_id: "mistral:13b-q4",
  task_id: "task-1",
  workflow_step_id: "agentos-task-task-1",
};

describe("createSyntheticEvaluatePort", () => {
  it("PASS verdict clears all four CPMI-VRS gates and permits promotion", () => {
    const port = createSyntheticEvaluatePort("PASS");
    const result = port.evaluateModel(input);
    expect(result.verdict).toBe("PASS");
    expect(result.model_id).toBe("mistral:13b-q4");
    expect(result.gate_results).toHaveLength(4);
    expect(result.gate_results.every((g) => g.passed)).toBe(true);
    expect(canPromote(result)).toBe(true);
  });

  it("FAIL verdict fails Gate 3 and blocks promotion", () => {
    const port = createSyntheticEvaluatePort("FAIL");
    const result = port.evaluateModel(input);
    expect(result.verdict).toBe("FAIL");
    expect(result.gate_results.find((g) => g.gate === 3)!.passed).toBe(false);
    expect(result.gate_results.filter((g) => g.gate !== 3).every((g) => g.passed)).toBe(true);
    expect(canPromote(result)).toBe(false);
  });

  it("defaults to PASS", () => {
    expect(createSyntheticEvaluatePort().evaluateModel(input).verdict).toBe("PASS");
  });
});

describe("createEvaluatePort (D3 config seam)", () => {
  it("is not configured by default (no VITE_EVALUATE_ENDPOINT) and serves the synthetic backing", () => {
    expect(isEvaluateConfigured()).toBe(false);
    const port = createEvaluatePort();
    expect(port.evaluateModel(input).verdict).toBe("PASS");
  });

  it("reports configured when VITE_EVALUATE_ENDPOINT is set", () => {
    const prev = process.env["VITE_EVALUATE_ENDPOINT"];
    process.env["VITE_EVALUATE_ENDPOINT"] = "http://localhost:9100/evaluate";
    try {
      expect(isEvaluateConfigured()).toBe(true);
      // Live adapter not wired this session — synthetic backing is still served (safe default).
      expect(createEvaluatePort().evaluateModel(input).verdict).toBe("PASS");
    } finally {
      if (prev === undefined) delete process.env["VITE_EVALUATE_ENDPOINT"];
      else process.env["VITE_EVALUATE_ENDPOINT"] = prev;
    }
  });
});

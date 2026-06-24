/**
 * module-cpmi — benchmark.test.ts
 * The known-answer suite: three scenarios A/B/C, steps-completed counting, and the
 * gate3_ready rule (all schema_valid + steps_completed:6). Static tier (deterministic).
 */
import type { SovereignLLMResponse } from "@sovereign/api-client";

import { BENCHMARK_SCENARIOS, runBenchmark, stepsCompleted, type ScenarioId } from "../src/benchmark";
import { validateReasoningChainOutput, type ReasoningChainOutput } from "../src/cpmi-contract";
import type { ReasoningDeps } from "../src/reasoning-engine";

function fullOutput(): ReasoningChainOutput {
  return {
    context_summary: "ctx",
    context_confidence: "high",
    risk_register: [],
    constraint_map: [],
    option_set: [{ option: "o", cost: "c", defers: "d", closes: "x" }],
    recommendation: "rec",
    alternatives_considered: [],
    schema_valid: true,
  };
}

function staticDeps(): ReasoningDeps {
  // complete throws → engine serves the static tier (schema_valid, 6 steps) per scenario.
  return {
    complete: async (): Promise<SovereignLLMResponse> => {
      throw new Error("no key");
    },
    cacheGet: () => null,
    cacheSet: () => {},
  };
}
function ctxFor(id: ScenarioId) {
  return { workflow_step_id: `cpmi-benchmark-1-${id}`, product: "CPMI" as const, agent_id: "cpmi.reasoning-chain", tier: "standard" as const };
}

describe("benchmark scenarios", () => {
  it("defines exactly three scenarios A/B/C", () => {
    expect(BENCHMARK_SCENARIOS.map((s) => s.id)).toEqual(["A", "B", "C"]);
  });
});

describe("stepsCompleted", () => {
  it("counts six step outputs for a full output", () => {
    expect(stepsCompleted(fullOutput())).toBe(6);
  });
  it("counts fewer when a step output is missing", () => {
    expect(stepsCompleted({ ...fullOutput(), recommendation: "" })).toBe(5);
    expect(stepsCompleted({ ...fullOutput(), context_summary: "" })).toBe(5);
  });
});

describe("runBenchmark", () => {
  it("runs all three scenarios and is gate3_ready (static tier yields schema_valid + 6 steps)", async () => {
    const report = await runBenchmark(staticDeps(), ctxFor, { runId: "1", runAt: "2026-06-23T12:00:00.000Z" });

    expect(report.scenarios_run).toBe(3);
    expect(report.scenario_results.map((r) => r.scenario_id)).toEqual(["A", "B", "C"]);
    expect(report.schema_compliance_rate).toBe(1);
    expect(report.step_completion_rate).toBe(1);
    expect(report.gate3_ready).toBe(true);
    expect(report.workflow_step_id).toBe("cpmi-benchmark-1");

    for (const r of report.scenario_results) {
      expect(r.schema_valid).toBe(true);
      expect(r.steps_completed).toBe(6);
      expect(r.recommendation_present).toBe(true);
      expect(validateReasoningChainOutput(r.output)).toEqual({ valid: true });
    }
  });
});

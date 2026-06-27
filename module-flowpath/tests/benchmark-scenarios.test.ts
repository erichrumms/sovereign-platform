/**
 * module-flowpath — benchmark-scenarios.test.ts (CPMI-VRS Gate 2, Session 21 D2)
 * The three known-answer benchmark scenarios (A/B/C) each produce a schema-valid, gate-passing
 * WorkflowArtifact, and runFlowpathBenchmark emits FLOWPATH_SESSION_STARTED / _ARTIFACT_PRODUCED /
 * _SESSION_COMPLETE (each with workflow_step_id). Scenario-specific expectations are also checked.
 */
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import {
  FLOWPATH_BENCHMARK_SCENARIOS,
  evaluateBenchmark,
  evaluateAllBenchmarks,
  runFlowpathBenchmark,
  type BenchmarkId,
} from "../src/benchmark-scenarios";
import { evaluateFiveQuestionGate } from "../src/flowpath-contract";
import { makeCtx } from "./test-helpers";

const IDS: BenchmarkId[] = ["A", "B", "C"];

describe("FLOWPATH CPMI-VRS benchmark scenarios", () => {
  it("defines exactly three scenarios A, B, C", () => {
    expect(FLOWPATH_BENCHMARK_SCENARIOS.map((s) => s.id)).toEqual(["A", "B", "C"]);
  });

  it.each(IDS)("scenario %s produces a schema-valid artifact", (id) => {
    expect(evaluateBenchmark(id).schema_valid).toBe(true);
  });

  it.each(IDS)("scenario %s passes the Five-Question Gate", (id) => {
    const { bundle, gate_passed } = evaluateBenchmark(id);
    expect(gate_passed).toBe(true);
    expect(evaluateFiveQuestionGate(bundle.artifact).gate_passed).toBe(true);
  });

  it.each(IDS)("scenario %s logs the session lifecycle events with workflow_step_id", (id) => {
    const sink: SovereignLogEvent[] = [];
    runFlowpathBenchmark(makeCtx({ logSink: sink }), id);
    const types = sink.map((e) => e.event_type);
    expect(types).toContain("FLOWPATH_SESSION_STARTED");
    expect(types).toContain("FLOWPATH_ARTIFACT_PRODUCED");
    expect(types).toContain("FLOWPATH_SESSION_COMPLETE");
    expect(sink.every((e) => typeof e.workflow_step_id === "string" && e.workflow_step_id.length > 0)).toBe(true);
  });

  it("evaluateAllBenchmarks returns all three, all schema-valid and gate-passed", () => {
    const all = evaluateAllBenchmarks();
    expect(all).toHaveLength(3);
    expect(all.every((r) => r.schema_valid && r.gate_passed)).toBe(true);
  });

  it("Scenario A is a two-step operational workflow with no branch", () => {
    const { bundle, scenario } = evaluateBenchmark("A");
    expect(scenario.workflow_type).toBe("operational");
    expect(bundle.artifact.steps).toHaveLength(2);
  });

  it("Scenario B registers the accounting system as a data source and branches on the variance", () => {
    const { bundle } = evaluateBenchmark("B");
    expect(bundle.data_sources.sources.some((s) => s.source_type === "accounting")).toBe(true);
    const terminals = bundle.artifact.steps.filter((s) => s.is_terminal);
    expect(terminals.length).toBe(2); // escalate-to-CFO and self-certify branches
  });

  it("Scenario C is a PPBE Phase 1 workflow capturing vocabulary and a validation cadence", () => {
    const { bundle, scenario } = evaluateBenchmark("C");
    expect(scenario.workflow_type).toBe("ppbe");
    expect(bundle.vocabulary.entries.length).toBeGreaterThan(0);
    expect(bundle.validation_cadence.cadence_type).toBe("before_each_qpr");
  });

  it("uses no PPBE reserved field names anywhere in the produced bundles (spec §13)", () => {
    const reserved = ["fiscal_year", "lifecycle_cost_estimate", "obligation_plan", "performance_baseline"];
    for (const id of IDS) {
      const json = JSON.stringify(evaluateBenchmark(id).bundle);
      for (const name of reserved) expect(json).not.toContain(name);
    }
  });

  it("Scenario C output is plain prose, not a schema dump (Gap 5)", () => {
    const { bundle } = evaluateBenchmark("C");
    expect(bundle.artifact.summary).toMatch(/program executive/i);
    expect(bundle.artifact.summary).not.toMatch(/[{}]|step_id/);
  });
});

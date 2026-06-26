/**
 * module-apex — benchmark-scenarios.test.ts
 * The three CPMI-VRS known-answer benchmarks (spec §8 / D-APEX-5). All three produce
 * schema_valid:true outputs; each matches its known expected characteristics:
 *   A (on-track) — no escalation; B (at-risk) — DC-3 provenance populated; C (off-track) —
 *   escalation recommendation + regulatory item flagged for legal review.
 */
import {
  BENCHMARK_SCENARIOS,
  runAllBenchmarks,
  runBenchmarkScenario,
} from "../src/benchmark-scenarios";
import { isSurfaceableAnalysis } from "../src/apex-contract";

describe("APEX CPMI-VRS benchmark scenarios", () => {
  it("defines exactly scenarios A, B, C", () => {
    expect(BENCHMARK_SCENARIOS.map((s) => s.id)).toEqual(["A", "B", "C"]);
  });

  it("all three produce schema_valid:true, surfaceable outputs", () => {
    const results = runAllBenchmarks();
    expect(results).toHaveLength(3);
    expect(results.every((r) => r.schema_valid)).toBe(true);
    expect(results.every((r) => isSurfaceableAnalysis(r.output))).toBe(true);
  });

  it("Scenario A (on-track) — positive narrative, no escalation, no flags", () => {
    const a = runBenchmarkScenario(BENCHMARK_SCENARIOS[0]);
    expect(a.output.risk_findings).toHaveLength(0);
    expect(a.output.recommendations.join(" ")).not.toMatch(/escalat/i);
  });

  it("Scenario B (at-risk) — DC-3 provenance populated for the cost variance flag", () => {
    const b = runBenchmarkScenario(BENCHMARK_SCENARIOS[1]);
    expect(b.output.risk_findings.length).toBeGreaterThanOrEqual(1);
    const f = b.output.risk_findings[0];
    expect(f.source_data).not.toBe("");
    expect(f.baseline).not.toBe("");
    expect(f.responsible_party).not.toBe("");
    expect(b.output.recommendations.length).toBeGreaterThanOrEqual(1);
  });

  it("Scenario C (off-track) — escalation recommendation; all flags carry DC-3 provenance", () => {
    const c = runBenchmarkScenario(BENCHMARK_SCENARIOS[2]);
    expect(c.output.recommendations.join(" ")).toMatch(/escalat/i);
    expect(c.output.risk_findings.length).toBe(3);
    expect(c.output.risk_findings.every((f) => f.source_data && f.baseline && f.responsible_party)).toBe(true);
    // The regulatory compliance question is flagged for human legal review.
    expect(c.output.recommendations.join(" ")).toMatch(/legal review/i);
  });
});

/**
 * module-aria — determinism-verification.test.ts (Session 25 · D5)
 * The ARIA Suite CPMI-VRS "benchmark": proving determinism (docs/16 §12). Every scenario runs one
 * ARIA engine — CLEAR, TRACER, or ARC — twice with identical input and must produce identical output.
 * Covers all three components and the all-pass gate that stands in for Gates 1–2.
 */
import {
  DETERMINISM_SCENARIOS,
  verifyScenario,
  verifyAllDeterminism,
  allDeterministic,
} from "../src/determinism-verification";

describe("determinism-verification — coverage", () => {
  it("includes at least one scenario per ARIA component (docs/16 §12)", () => {
    const components = new Set(DETERMINISM_SCENARIOS.map((s) => s.component));
    expect(components.has("CLEAR")).toBe(true);
    expect(components.has("TRACER")).toBe(true);
    expect(components.has("ARC")).toBe(true);
  });

  it("defines three or more scenarios", () => {
    expect(DETERMINISM_SCENARIOS.length).toBeGreaterThanOrEqual(3);
  });
});

describe("determinism-verification — each scenario is deterministic", () => {
  it.each(DETERMINISM_SCENARIOS.map((s) => [s.id, s] as const))(
    "scenario %s produces identical output on both runs",
    (_id, scenario) => {
      const result = verifyScenario(scenario);
      expect(result.identical).toBe(true);
      expect(result.runs).toBe(2);
      expect(result.output_summary.length).toBeGreaterThan(0);
    }
  );

  it("verifyAllDeterminism reports every scenario identical and the gate passes", () => {
    const results = verifyAllDeterminism();
    expect(results).toHaveLength(DETERMINISM_SCENARIOS.length);
    expect(results.every((r) => r.identical)).toBe(true);
    expect(allDeterministic(results)).toBe(true);
  });

  it("allDeterministic is false when a result is not identical (guards against a false pass)", () => {
    const results = verifyAllDeterminism();
    const tampered = results.map((r, i) => (i === 0 ? { ...r, identical: false } : r));
    expect(allDeterministic(tampered)).toBe(false);
  });

  it("allDeterministic is false for an empty result set", () => {
    expect(allDeterministic([])).toBe(false);
  });
});

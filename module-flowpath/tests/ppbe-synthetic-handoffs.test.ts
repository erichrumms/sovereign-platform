/**
 * ppbe-synthetic-handoffs tests — Session 33 (D1, module-local half).
 * The seeded handoff observations, run against the canonical seeded
 * dependencies, fire EXACTLY the designed rule variety — including both
 * TIMING_VIOLATION arms and QUALITY_THRESHOLD_FAILURE, which had never fired
 * end to end before this session — and make phase 4 genuinely NOT ready.
 */

import { SYNTH_PPBE_AS_OF, SYNTH_PPBE_DEPENDENCIES } from "@sovereign/data";

import {
  assessPhaseReadiness,
  runDependencyTracker,
} from "../src/ppbe-dependency-tracker";
import { SYNTH_PPBE_HANDOFF_OBSERVATIONS } from "../src/ppbe-synthetic-handoffs";

describe("seeded handoff observations against the seeded dependencies", () => {
  const findings = runDependencyTracker(
    SYNTH_PPBE_DEPENDENCIES,
    SYNTH_PPBE_HANDOFF_OBSERVATIONS,
    SYNTH_PPBE_AS_OF
  );

  it("fire both TIMING_VIOLATION arms with the designed severities", () => {
    const timing = findings.filter((f) => f.anomaly_type === "TIMING_VIOLATION");
    const byId = Object.fromEntries(timing.map((f) => [f.dependency_id, f]));
    expect(Object.keys(byId).sort()).toEqual(["SYNTH-DEP-03", "SYNTH-DEP-04"]);
    expect(byId["SYNTH-DEP-03"].severity).toBe("P2"); // delivered late
    expect(byId["SYNTH-DEP-04"].severity).toBe("P1"); // overdue, undelivered
  });

  it("fire QUALITY_THRESHOLD_FAILURE on the on-time-but-failed handoff", () => {
    const quality = findings.filter((f) => f.anomaly_type === "QUALITY_THRESHOLD_FAILURE");
    expect(quality.map((f) => f.dependency_id)).toEqual(["SYNTH-DEP-07"]);
  });

  it("fire the health rules on the at-risk and failed links, and nothing on the clean ones", () => {
    expect(findings.filter((f) => f.anomaly_type === "DEPENDENCY_AT_RISK").map((f) => f.dependency_id)).toEqual(["SYNTH-DEP-05"]);
    expect(findings.filter((f) => f.anomaly_type === "DEPENDENCY_HEALTH_FAILURE").map((f) => f.dependency_id)).toEqual(["SYNTH-DEP-06"]);
    const flagged = new Set(findings.map((f) => f.dependency_id));
    expect(flagged.has("SYNTH-DEP-01")).toBe(false);
    expect(flagged.has("SYNTH-DEP-02")).toBe(false);
    expect(flagged.has("SYNTH-DEP-08")).toBe(false);
  });

  it("make phase 4 genuinely NOT ready (the Tier B not-ready example) while phase 2 handoffs read differently", () => {
    const phase4 = assessPhaseReadiness(
      SYNTH_PPBE_DEPENDENCIES,
      SYNTH_PPBE_HANDOFF_OBSERVATIONS,
      SYNTH_PPBE_AS_OF,
      "phase-4"
    );
    expect(phase4.ready).toBe(false);
    expect(phase4.blocking_dependency_ids).toEqual(
      expect.arrayContaining(["SYNTH-DEP-06", "SYNTH-DEP-07"])
    );
    expect(phase4.summary).toContain("require human review");

    const phase1 = assessPhaseReadiness(
      SYNTH_PPBE_DEPENDENCIES,
      SYNTH_PPBE_HANDOFF_OBSERVATIONS,
      SYNTH_PPBE_AS_OF,
      "phase-1"
    );
    expect(phase1.ready).toBe(true);
  });
});

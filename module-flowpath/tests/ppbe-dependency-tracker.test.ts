/**
 * ppbe-dependency-tracker tests — Session 31 (D6).
 * Deterministic monitoring agent (registry determination, confirmed Session 31
 * open): reads DependencyMap entities and handoff observations (read-only),
 * flags health/timing/quality failures before they cascade, and contributes
 * the readiness check for Tier B phase handoffs. Tracks and routes only.
 */

import {
  PPBE_DEPENDENCY_TRACKER_AGENT_ID,
  detectHealthFailures,
  detectTimingViolations,
  detectQualityFailures,
  runDependencyTracker,
  assessPhaseReadiness,
  type HandoffObservation,
} from "../src/ppbe-dependency-tracker";
import type { DependencyMap } from "@sovereign/data";

function dep(id: string, health: DependencyMap["health_status"]): DependencyMap {
  return {
    dependency_id: id,
    source_workflow: "ppbe-phase-2-planning",
    target_workflow: "ppbe-phase-3-programming",
    handoff_standard: "Evidence base delivered with all assessments attached.",
    timing_requirement: "within 5 business days of phase close",
    health_status: health,
  };
}

const onTime: HandoffObservation = {
  dependency_id: "DEP-1",
  due_by: "2026-07-15T00:00:00Z",
  delivered: true,
  delivered_at: "2026-07-14T00:00:00Z",
  quality_check_passed: true,
};

describe("ppbe-dependency-tracker", () => {
  it("exports the registered agent id", () =>
    expect(PPBE_DEPENDENCY_TRACKER_AGENT_ID).toBe("ppbe-dependency-tracker"));
});

describe("health failures (Rule 1)", () => {
  it("stays silent for healthy dependencies", () =>
    expect(detectHealthFailures([dep("DEP-1", "healthy")])).toEqual([]));

  it("flags failed as P1 and at-risk as P2, citing the handoff standard", () => {
    const findings = detectHealthFailures([dep("DEP-1", "failed"), dep("DEP-2", "at-risk")]);
    expect(findings[0]).toMatchObject({
      anomaly_type: "DEPENDENCY_HEALTH_FAILURE",
      severity: "P1",
      workflow_step_id: "ppbe-dependency-DEP-1",
      observation_only: true,
    });
    expect(findings[1]).toMatchObject({ anomaly_type: "DEPENDENCY_AT_RISK", severity: "P2" });
    expect(findings[0].threshold_breached).toContain("Evidence base delivered");
  });
});

describe("timing violations (Rule 2 — clock supplied by the host)", () => {
  it("stays silent for an on-time delivery", () =>
    expect(
      detectTimingViolations([dep("DEP-1", "healthy")], [onTime], "2026-07-16T00:00:00Z")
    ).toEqual([]));

  it("flags an overdue undelivered handoff as P1", () => {
    const findings = detectTimingViolations(
      [dep("DEP-1", "healthy")],
      [{ ...onTime, delivered: false, delivered_at: undefined }],
      "2026-07-16T00:00:00Z"
    );
    expect(findings[0]).toMatchObject({ anomaly_type: "TIMING_VIOLATION", severity: "P1" });
    expect(findings[0].threshold_breached).toContain("overdue and undelivered");
  });

  it("flags a late delivery as P2", () => {
    const findings = detectTimingViolations(
      [dep("DEP-1", "healthy")],
      [{ ...onTime, delivered_at: "2026-07-16T00:00:00Z" }],
      "2026-07-17T00:00:00Z"
    );
    expect(findings[0]).toMatchObject({ anomaly_type: "TIMING_VIOLATION", severity: "P2" });
  });

  it("does not flag an undelivered handoff before its due time", () =>
    expect(
      detectTimingViolations(
        [dep("DEP-1", "healthy")],
        [{ ...onTime, delivered: false, delivered_at: undefined }],
        "2026-07-14T00:00:00Z"
      )
    ).toEqual([]));

  it("ignores observations for unknown dependencies", () =>
    expect(
      detectTimingViolations([], [{ ...onTime, delivered: false }], "2026-07-16T00:00:00Z")
    ).toEqual([]));
});

describe("quality failures (Rule 3)", () => {
  it("flags a delivered handoff that failed its quality check", () => {
    const findings = detectQualityFailures(
      [dep("DEP-1", "healthy")],
      [{ ...onTime, quality_check_passed: false }]
    );
    expect(findings[0]).toMatchObject({
      anomaly_type: "QUALITY_THRESHOLD_FAILURE",
      severity: "P2",
    });
  });

  it("does not flag undelivered or unchecked handoffs", () => {
    expect(
      detectQualityFailures(
        [dep("DEP-1", "healthy")],
        [{ ...onTime, delivered: false, quality_check_passed: undefined }]
      )
    ).toEqual([]);
    expect(
      detectQualityFailures([dep("DEP-1", "healthy")], [{ ...onTime, quality_check_passed: undefined }])
    ).toEqual([]);
  });
});

describe("full tracking pass and phase readiness", () => {
  it("is deterministic — same input, same output", () => {
    const deps = [dep("DEP-1", "at-risk")];
    const obs = [{ ...onTime, quality_check_passed: false }];
    expect(runDependencyTracker(deps, obs, "2026-07-16T00:00:00Z")).toEqual(
      runDependencyTracker(deps, obs, "2026-07-16T00:00:00Z")
    );
  });

  it("reports ready with a plain-prose summary when the phase is clean", () => {
    const readiness = assessPhaseReadiness(
      [dep("DEP-1", "healthy")],
      [onTime],
      "2026-07-16T00:00:00Z",
      "ppbe-phase-2"
    );
    expect(readiness.ready).toBe(true);
    expect(readiness.summary).toContain("All 1 dependencies");
  });

  it("blocks readiness on any open finding and names the blockers", () => {
    const readiness = assessPhaseReadiness(
      [dep("DEP-1", "failed"), dep("DEP-2", "healthy")],
      [],
      "2026-07-16T00:00:00Z",
      "ppbe-phase-2"
    );
    expect(readiness.ready).toBe(false);
    expect(readiness.blocking_dependency_ids).toEqual(["DEP-1"]);
    expect(readiness.summary).toContain("require human review");
  });

  it("treats a phase with no registered dependencies as ready", () => {
    const readiness = assessPhaseReadiness([], [], "2026-07-16T00:00:00Z", "ppbe-phase-4");
    expect(readiness.ready).toBe(true);
  });
});

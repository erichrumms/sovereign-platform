/**
 * ppbe-synthetic-coordination tests — Session 33 (D1, module-local half).
 * The seeded coordination state produces EXACTLY the designed anomaly variety
 * against the clock of record, every task is a valid instance on a legal
 * GD-11 state, and the notes corpus carries the evaluable signals the digest
 * needs (a completion claim, a discussed-not-done trap, a quiet owner, an
 * untracked dependency).
 */

import { SYNTH_PPBE_AS_OF } from "@sovereign/data";

import { detectCoordinationFailures } from "../src/ppbe-coordination-assistant";
import {
  SYNTH_PPBE_COORDINATION_ITEMS,
  SYNTH_PPBE_MEETING_NOTES,
  SYNTH_PPBE_TASKS,
} from "../src/ppbe-synthetic-coordination";
import { validatePPBETask } from "../src/ppbe-tasks";
import { WORK_REQUEST_STATUSES } from "../src/nexus-contract";

describe("seeded coordination items", () => {
  it("produce exactly the designed failure variety at the clock of record", () => {
    const findings = detectCoordinationFailures(SYNTH_PPBE_COORDINATION_ITEMS, SYNTH_PPBE_AS_OF);
    const byType = (t: string) => findings.filter((f) => f.anomaly_type === t);
    expect(findings).toHaveLength(4);
    expect(byType("MISSED_DEADLINE").map((f) => [f.item_id, f.severity]).sort()).toEqual([
      ["SYNTH-CI-02", "P3"],
      ["SYNTH-CI-03", "P2"],
    ]);
    expect(byType("LAPSED_COMMITMENT").map((f) => f.item_id)).toEqual(["SYNTH-CI-04"]);
    const overdue = byType("OVERDUE_PHASE_TRANSITION");
    expect(overdue.map((f) => f.item_id)).toEqual(["SYNTH-CI-05"]);
    expect(overdue[0].severity).toBe("P1");
  });

  it("keep the resolved item and the future items out of the failure set", () => {
    const flagged = new Set(
      detectCoordinationFailures(SYNTH_PPBE_COORDINATION_ITEMS, SYNTH_PPBE_AS_OF).map((f) => f.item_id)
    );
    for (const cleanId of ["SYNTH-CI-01", "SYNTH-CI-06", "SYNTH-CI-07", "SYNTH-CI-08"]) {
      expect(flagged.has(cleanId)).toBe(false);
    }
  });
});

describe("the meeting-notes corpus", () => {
  it("carries the four evaluable signals the digest is judged against", () => {
    // 1 — a completion claim for CI-01 (a RESOLVED proposal is justified).
    expect(SYNTH_PPBE_MEETING_NOTES).toMatch(/evidence base is DONE/);
    // 2 — CI-04 discussed at length but explicitly NOT decided (the trap).
    expect(SYNTH_PPBE_MEETING_NOTES).toMatch(/No decision recorded yet/);
    // 3 — the quiet owner on CI-02.
    expect(SYNTH_PPBE_MEETING_NOTES).toMatch(/has not\s+reported since/);
    // 4 — a dependency tracked nowhere (risk-flag material).
    expect(SYNTH_PPBE_MEETING_NOTES).toMatch(/does\s+not appear on any tracker/);
  });
});

describe("seeded PPBE tasks", () => {
  it("are valid instances on legal GD-11 states, spread across the lifecycle", () => {
    const statuses = new Set<string>();
    for (const task of SYNTH_PPBE_TASKS) {
      expect(validatePPBETask(task)).toEqual({ valid: true });
      expect(WORK_REQUEST_STATUSES).toContain(task.status);
      statuses.add(task.status);
    }
    expect(statuses.size).toBeGreaterThanOrEqual(4);
  });
});

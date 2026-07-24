/**
 * module-flowpath — flowpath-approval-session.test.ts (Session 61, D5 / D3-4).
 * The session-persistent approval record: idempotent marking, notify-on-change
 * subscription, and reset.
 */

import {
  getApprovedFlowpathSessionIds,
  isFlowpathSessionApproved,
  markFlowpathSessionApproved,
  resetFlowpathApprovalSessionForTests,
  subscribeFlowpathApprovalSession,
} from "../src/flowpath-approval-session";

describe("flowpath-approval-session (D5 / D3-4)", () => {
  beforeEach(() => resetFlowpathApprovalSessionForTests());

  it("marks a session approved and reports it; marking is idempotent (no repeat notify)", () => {
    let calls = 0;
    subscribeFlowpathApprovalSession(() => { calls += 1; });

    expect(isFlowpathSessionApproved("S-OPS-001")).toBe(false);
    markFlowpathSessionApproved("S-OPS-001");
    expect(isFlowpathSessionApproved("S-OPS-001")).toBe(true);
    expect(calls).toBe(1);

    markFlowpathSessionApproved("S-OPS-001"); // repeat — no change, no notify
    expect(calls).toBe(1);
    expect(getApprovedFlowpathSessionIds()).toEqual(["S-OPS-001"]);
  });

  it("unsubscribe stops notifications; reset clears state and listeners", () => {
    let calls = 0;
    const unsubscribe = subscribeFlowpathApprovalSession(() => { calls += 1; });
    markFlowpathSessionApproved("A");
    expect(calls).toBe(1);
    unsubscribe();
    markFlowpathSessionApproved("B");
    expect(calls).toBe(1);

    resetFlowpathApprovalSessionForTests();
    expect(isFlowpathSessionApproved("A")).toBe(false);
    let calls2 = 0;
    subscribeFlowpathApprovalSession(() => { calls2 += 1; });
    markFlowpathSessionApproved("C");
    expect(calls2).toBe(1);
  });
});

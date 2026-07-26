/**
 * module-flowpath — flowpath-elicitation-session.test.ts (Session 64, WH-25).
 * The session-persistent elicitation session store: seed-once init, create, update,
 * return-for-revision, subscribe/notify, idempotency, and reset.
 */

import type { ElicitationSession } from "../src/flowpath-contract";
import {
  createFlowpathElicitationSession,
  getFlowpathElicitationSessions,
  initFlowpathElicitationSessions,
  resetFlowpathElicitationSessionForTests,
  returnFlowpathSessionForRevision,
  subscribeFlowpathElicitationSession,
  updateFlowpathElicitationSession,
} from "../src/flowpath-elicitation-session";

const SESSION_A: ElicitationSession = {
  session_id: "S-TEST-A",
  workflow_type: "operational",
  expert_role: "Program Analyst",
  date: "2026-07-25",
  status: "IN_PROGRESS",
  gate_passed: false,
};

const SESSION_B: ElicitationSession = {
  session_id: "S-TEST-B",
  workflow_type: "validation_cadence",
  expert_role: "Senior Analyst",
  date: "2026-07-25",
  status: "COMPLETE",
  gate_passed: true,
};

describe("flowpath-elicitation-session (WH-25)", () => {
  beforeEach(() => resetFlowpathElicitationSessionForTests());

  it("initFlowpathElicitationSessions seeds on first call and is idempotent", () => {
    const first = initFlowpathElicitationSessions([SESSION_A]);
    expect(first).toHaveLength(1);
    expect(first[0].session_id).toBe("S-TEST-A");

    // Second call with different seeds — should return the already-seeded list, not re-seed.
    const second = initFlowpathElicitationSessions([SESSION_B]);
    expect(second).toHaveLength(1);
    expect(second[0].session_id).toBe("S-TEST-A");
  });

  it("createFlowpathElicitationSession prepends and notifies", () => {
    initFlowpathElicitationSessions([SESSION_A]);

    let received: readonly ElicitationSession[] = [];
    subscribeFlowpathElicitationSession((s) => { received = s; });

    createFlowpathElicitationSession(SESSION_B);

    const sessions = getFlowpathElicitationSessions();
    expect(sessions).toHaveLength(2);
    expect(sessions[0].session_id).toBe("S-TEST-B"); // prepended
    expect(sessions[1].session_id).toBe("S-TEST-A");
    expect(received[0].session_id).toBe("S-TEST-B");
  });

  it("updateFlowpathElicitationSession patches the correct session and notifies", () => {
    initFlowpathElicitationSessions([SESSION_A, SESSION_B]);

    let calls = 0;
    subscribeFlowpathElicitationSession(() => { calls += 1; });

    updateFlowpathElicitationSession("S-TEST-A", { status: "COMPLETE", gate_passed: true });
    const sessions = getFlowpathElicitationSessions();
    expect(sessions.find((s) => s.session_id === "S-TEST-A")?.status).toBe("COMPLETE");
    expect(sessions.find((s) => s.session_id === "S-TEST-A")?.gate_passed).toBe(true);
    expect(sessions.find((s) => s.session_id === "S-TEST-B")?.status).toBe("COMPLETE"); // unchanged
    expect(calls).toBe(1);
  });

  it("updateFlowpathElicitationSession is a no-op when the patch changes nothing (no notify)", () => {
    initFlowpathElicitationSessions([SESSION_B]); // already COMPLETE + gate_passed: true
    let calls = 0;
    subscribeFlowpathElicitationSession(() => { calls += 1; });

    updateFlowpathElicitationSession("S-TEST-B", { status: "COMPLETE", gate_passed: true });
    expect(calls).toBe(0);
  });

  it("updateFlowpathElicitationSession is a no-op for an unknown session id", () => {
    initFlowpathElicitationSessions([SESSION_A]);
    let calls = 0;
    subscribeFlowpathElicitationSession(() => { calls += 1; });

    updateFlowpathElicitationSession("S-DOES-NOT-EXIST", { status: "COMPLETE" });
    expect(calls).toBe(0);
  });

  it("returnFlowpathSessionForRevision resets status to IN_PROGRESS and gate_passed to false", () => {
    initFlowpathElicitationSessions([SESSION_B]); // starts COMPLETE + gate_passed: true
    returnFlowpathSessionForRevision("S-TEST-B");
    const after = getFlowpathElicitationSessions().find((s) => s.session_id === "S-TEST-B");
    expect(after?.status).toBe("IN_PROGRESS");
    expect(after?.gate_passed).toBe(false);
  });

  it("unsubscribe stops notifications; reset clears state and listeners", () => {
    initFlowpathElicitationSessions([SESSION_A]);
    let calls = 0;
    const unsub = subscribeFlowpathElicitationSession(() => { calls += 1; });

    updateFlowpathElicitationSession("S-TEST-A", { status: "GATE_PENDING" });
    expect(calls).toBe(1);

    unsub();
    updateFlowpathElicitationSession("S-TEST-A", { status: "COMPLETE", gate_passed: true });
    expect(calls).toBe(1); // unsubscribed — no more notifications

    resetFlowpathElicitationSessionForTests();
    expect(getFlowpathElicitationSessions()).toHaveLength(0);

    // After reset, a fresh listener can subscribe
    let calls2 = 0;
    subscribeFlowpathElicitationSession(() => { calls2 += 1; });
    initFlowpathElicitationSessions([SESSION_B]);
    createFlowpathElicitationSession(SESSION_A);
    expect(calls2).toBe(1);
  });
});

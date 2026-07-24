/**
 * module-nexus — tt-session.test.ts (Session 61, D4 / finding D3-3).
 *
 * The session-persistent TT queue store: one assembly per session (idempotent
 * ensure), wholesale list replacement with notify-on-change, the D1-shape
 * subscription, and proof that a mutated queue survives "remount" (a second
 * ensure with fresh seeds).
 */

import type { SubmittedTravelItem, SubmittedTimeItem } from "../src/useTTIntake";
import {
  ensureTTSession,
  getTTSession,
  resetTTSessionForTests,
  setTTSessionTime,
  setTTSessionTravel,
  subscribeTTSession,
} from "../src/tt-session";

function travelItem(id: string, status = "ROUTED"): SubmittedTravelItem {
  return {
    request: { request_id: id, status } as SubmittedTravelItem["request"],
    finding: {} as SubmittedTravelItem["finding"],
    workflow_step_id: `tt-travel-${id}`,
  };
}

function timeItem(id: string): SubmittedTimeItem {
  return {
    record: { record_id: id } as SubmittedTimeItem["record"],
    flags: [],
    evaluated: true,
    workflow_step_id: `tt-time-${id}`,
  };
}

describe("tt-session (D4 / D3-3 — the TT resurrection fix)", () => {
  beforeEach(() => resetTTSessionForTests());

  it("assembles once and is idempotent — a second ensure with fresh seeds returns the LIVE queues", () => {
    ensureTTSession({ travel: [travelItem("TR-1")], time: [timeItem("TM-1")] });
    setTTSessionTravel([travelItem("TR-1", "APPROVED")]);

    // "The remount": fresh seeds are offered again and must be ignored.
    const atRemount = ensureTTSession({
      travel: [travelItem("TR-1"), travelItem("TR-2")],
      time: [timeItem("TM-1"), timeItem("TM-2")],
    });
    expect(atRemount.travel).toHaveLength(1);
    expect(atRemount.travel[0].request.status).toBe("APPROVED"); // decision persisted
    expect(atRemount.time).toHaveLength(1); // second seed set ignored
  });

  it("wholesale replacement notifies subscribers with the new snapshot", () => {
    ensureTTSession({ travel: [travelItem("TR-1")], time: [] });
    const seen: Array<readonly SubmittedTravelItem[]> = [];
    const unsubscribe = subscribeTTSession((s) => seen.push(s.travel));

    setTTSessionTravel([travelItem("TR-1", "DENIED")]);
    expect(seen).toHaveLength(1);
    expect(seen[0][0].request.status).toBe("DENIED");

    unsubscribe();
    setTTSessionTravel([]);
    expect(seen).toHaveLength(1);
  });

  it("time-list replacement persists across ensure the same way", () => {
    ensureTTSession({ travel: [], time: [timeItem("TM-1")] });
    setTTSessionTime([timeItem("TM-1"), timeItem("TM-2")]);
    const atRemount = ensureTTSession({ travel: [], time: [timeItem("TM-1")] });
    expect(atRemount.time).toHaveLength(2);
  });

  it("reset clears state and listeners", () => {
    ensureTTSession({ travel: [travelItem("TR-1")], time: [] });
    let calls = 0;
    subscribeTTSession(() => { calls += 1; });
    resetTTSessionForTests();
    expect(getTTSession()).toBeNull();
    ensureTTSession({ travel: [], time: [] });
    setTTSessionTravel([travelItem("TR-9")]);
    expect(calls).toBe(0);
  });
});

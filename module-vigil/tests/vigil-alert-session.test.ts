/**
 * module-vigil — vigil-alert-session.test.ts (Session 61, D2 / finding D3-1 HIGH).
 *
 * The session-persistent alert store: one assembly per session (idempotent
 * ensure), response application (closing removes; ack/investigating
 * transitions), ingest dedupe, the D1-shape subscription, and — the reason
 * this file exists — proof that a responded alert does NOT resurrect when a
 * second consumer assembles "at remount."
 */

import {
  applyResponseToAlerts,
  applyVigilAlertSessionResponse,
  ensureVigilAlertSession,
  getVigilAlertSession,
  ingestVigilAlertSessionAlert,
  resetVigilAlertSessionForTests,
  subscribeVigilAlertSession,
} from "../src/vigil-alert-session";
import type { SecurityAlert } from "../src/vigil-types";
import { makeAlert } from "./test-helpers";

const SEEDS: SecurityAlert[] = [
  makeAlert({ alertId: "A1", alertLevel: "P1" }),
  makeAlert({ alertId: "A2", alertLevel: "P2" }),
  makeAlert({ alertId: "A3", alertLevel: "P3" }),
];

describe("vigil-alert-session (D2 / D3-1 — the resurrection fix)", () => {
  beforeEach(() => resetVigilAlertSessionForTests());

  it("assembles once from the seeds and is idempotent — a second ensure returns the live queue", () => {
    const first = ensureVigilAlertSession(SEEDS);
    expect(first).toHaveLength(3);
    applyVigilAlertSessionResponse("A2", "RESOLVED");
    const second = ensureVigilAlertSession(SEEDS); // "the remount"
    expect(second).toHaveLength(2);
    expect(second.some((a) => a.alertId === "A2")).toBe(false);
  });

  it("a RESOLVED alert does not resurrect at remount — the D3-1 proof at store level", () => {
    ensureVigilAlertSession(SEEDS);
    applyVigilAlertSessionResponse("A1", "RESOLVED");
    applyVigilAlertSessionResponse("A3", "FALSE_POSITIVE");

    // A remounting VigilApp calls ensure with the same static seeds — before
    // this store, that re-seeded everything and the responses were lost.
    const atRemount = ensureVigilAlertSession(SEEDS);
    expect(atRemount.map((a) => a.alertId)).toEqual(["A2"]);
  });

  it("an ACKNOWLEDGED status persists across remount (not reset to UNACKNOWLEDGED)", () => {
    ensureVigilAlertSession(SEEDS);
    applyVigilAlertSessionResponse("A2", "ACKNOWLEDGED");

    const atRemount = ensureVigilAlertSession(SEEDS);
    expect(atRemount.find((a) => a.alertId === "A2")?.status).toBe("ACKNOWLEDGED");
  });

  it("ingest dedupes by alertId (duplicate is a silent no-op, no notify)", () => {
    ensureVigilAlertSession(SEEDS);
    let calls = 0;
    subscribeVigilAlertSession(() => { calls += 1; });

    ingestVigilAlertSessionAlert(makeAlert({ alertId: "A4" }));
    expect(calls).toBe(1);
    ingestVigilAlertSessionAlert(makeAlert({ alertId: "A4" }));
    expect(calls).toBe(1); // dedupe — no second notify
    expect(getVigilAlertSession()).toHaveLength(4);
  });

  it("subscription fires on response with the post-mutation snapshot; unsubscribe stops it", () => {
    ensureVigilAlertSession(SEEDS);
    const seen: Array<readonly SecurityAlert[]> = [];
    const unsubscribe = subscribeVigilAlertSession((s) => seen.push(s));

    applyVigilAlertSessionResponse("A1", "ESCALATED");
    expect(seen).toHaveLength(1);
    expect(seen[0].some((a) => a.alertId === "A1")).toBe(false);

    unsubscribe();
    applyVigilAlertSessionResponse("A2", "RESOLVED");
    expect(seen).toHaveLength(1);
  });

  it("a response to an unknown id is a no-op and does not notify", () => {
    ensureVigilAlertSession(SEEDS);
    let calls = 0;
    subscribeVigilAlertSession(() => { calls += 1; });
    applyVigilAlertSessionResponse("nope", "RESOLVED");
    expect(calls).toBe(0);
    expect(getVigilAlertSession()).toHaveLength(3);
  });

  it("applyResponseToAlerts (the shared pure helper) returns the same reference on no-op", () => {
    const list = [makeAlert({ alertId: "A1" })];
    expect(applyResponseToAlerts(list, "unknown", "RESOLVED")).toBe(list);
    expect(applyResponseToAlerts(list, "A1", "RESOLVED")).toHaveLength(0);
    expect(applyResponseToAlerts(list, "A1", "ACKNOWLEDGED")[0].status).toBe("ACKNOWLEDGED");
  });

  it("reset clears both state and listeners", () => {
    ensureVigilAlertSession(SEEDS);
    let calls = 0;
    subscribeVigilAlertSession(() => { calls += 1; });
    resetVigilAlertSessionForTests();
    expect(getVigilAlertSession()).toBeNull();
    ensureVigilAlertSession(SEEDS);
    applyVigilAlertSessionResponse("A1", "RESOLVED");
    expect(calls).toBe(0);
  });
});

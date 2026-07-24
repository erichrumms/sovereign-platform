/**
 * module-vigil — vigil-approval-session.test.ts (Session 54, WG-1/WG-5/WG-13).
 *
 * The shared, session-persistent approval queue store: one assembly per
 * session (idempotent ensure), decision removal (including the obligation
 * case), and the live expiry sweep emitting AGENT_ACTION_EXPIRED through the
 * shared builder.
 */

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import {
  ensureVigilApprovalSession,
  getVigilApprovalSession,
  removeVigilSessionRequest,
  expireVigilSessionRequests,
  resetVigilApprovalSessionForTests,
  subscribeVigilApprovalSession,
  type VigilApprovalSession,
} from "../src/vigil-approval-session";
import { SOF_APPROVAL_SYSTEM } from "../src/approval-contract";

function makeLogger(sink: SovereignLogEvent[]) {
  return { log: (e: SovereignLogEvent) => sink.push(e) };
}

describe("vigil-approval-session (WG-13 shared store)", () => {
  beforeEach(() => resetVigilApprovalSessionForTests());

  it("assembles the same queue VigilApp assembled at mount: 3 dev + TT + obligation = 5", () => {
    const sink: SovereignLogEvent[] = [];
    const session = ensureVigilApprovalSession(makeLogger(sink));
    expect(session.requests).toHaveLength(5);
    expect(session.obligationCase).not.toBeNull();
    // The Tier C obligation request is IN the queue, matching the case.
    expect(
      session.requests.some(
        (r) => r.request_id === session.obligationCase!.approval_request.request_id
      )
    ).toBe(true);
  });

  it("is idempotent — a second ensure returns the SAME live queue (WG-13)", () => {
    const sink: SovereignLogEvent[] = [];
    const first = ensureVigilApprovalSession(makeLogger(sink));
    removeVigilSessionRequest("req-dev-002");
    const second = ensureVigilApprovalSession(makeLogger(sink));
    expect(second.requests).toHaveLength(4);
    expect(second.anchorIso).toBe(first.anchorIso);
    expect(getVigilApprovalSession()).not.toBeNull();
  });

  it("removeVigilSessionRequest clears the obligation case when its request is decided", () => {
    const session = ensureVigilApprovalSession(makeLogger([]));
    const obligationId = session.obligationCase!.approval_request.request_id;
    removeVigilSessionRequest(obligationId);
    expect(getVigilApprovalSession()!.obligationCase).toBeNull();
    expect(
      getVigilApprovalSession()!.requests.some((r) => r.request_id === obligationId)
    ).toBe(false);
  });

  it("remove is a no-op for ids not in the session (test-seeded requests)", () => {
    ensureVigilApprovalSession(makeLogger([]));
    removeVigilSessionRequest("not-a-real-request");
    expect(getVigilApprovalSession()!.requests).toHaveLength(5);
  });

  it("expireVigilSessionRequests auto-rejects overdue requests with AGENT_ACTION_EXPIRED (WG-5)", () => {
    const sink: SovereignLogEvent[] = [];
    const session = ensureVigilApprovalSession(makeLogger(sink));
    const anchorMs = Date.parse(session.anchorIso);

    // 20 minutes past assembly: the P1 (15-minute window) is overdue; P2/P3 are not.
    const { expired, emitErrors } = expireVigilSessionRequests(anchorMs + 20 * 60_000, makeLogger(sink));

    expect(emitErrors).toHaveLength(0);
    expect(expired.length).toBeGreaterThan(0);
    expect(expired.some((r) => r.request_id === "req-dev-001")).toBe(true); // the P1 dev request
    for (const req of expired) {
      const ev = sink.find(
        (e) => e.event_type === "AGENT_ACTION_EXPIRED" && e.payload.request_id === req.request_id
      )!;
      expect(ev).toBeDefined();
      expect(ev.actor_id).toBe(SOF_APPROVAL_SYSTEM);
      expect(ev.actor).toBeUndefined(); // system event — not a human decision
      expect(ev.decision_type).toBeUndefined();
      expect(ev.workflow_step_id).toBe(`vigil-approval-${req.request_id}`);
    }
    // Expired requests actually left the shared queue.
    const remaining = getVigilApprovalSession()!.requests;
    for (const req of expired) {
      expect(remaining.some((r) => r.request_id === req.request_id)).toBe(false);
    }
  });

  it("expiry sweep is a safe no-op before the session exists", () => {
    const { expired, emitErrors } = expireVigilSessionRequests(Date.now(), makeLogger([]));
    expect(expired).toHaveLength(0);
    expect(emitErrors).toHaveLength(0);
  });
});

describe("vigil-approval-session — live subscription (D1, Session 61)", () => {
  beforeEach(() => resetVigilApprovalSessionForTests());

  it("notifies a subscriber when a request is removed, with the removed item gone from the snapshot", () => {
    ensureVigilApprovalSession(makeLogger([]));
    const seen: VigilApprovalSession[] = [];
    subscribeVigilApprovalSession((s) => seen.push(s));

    removeVigilSessionRequest("req-dev-002");

    expect(seen).toHaveLength(1);
    expect(seen[0].requests).toHaveLength(4);
    expect(seen[0].requests.some((r) => r.request_id === "req-dev-002")).toBe(false);
  });

  it("does NOT notify on a no-op removal (id not in the queue) — the loop guard", () => {
    ensureVigilApprovalSession(makeLogger([]));
    let calls = 0;
    subscribeVigilApprovalSession(() => { calls += 1; });

    removeVigilSessionRequest("not-a-real-request");
    expect(calls).toBe(0);
  });

  it("unsubscribe stops notifications", () => {
    ensureVigilApprovalSession(makeLogger([]));
    let calls = 0;
    const unsubscribe = subscribeVigilApprovalSession(() => { calls += 1; });

    removeVigilSessionRequest("req-dev-001");
    expect(calls).toBe(1);

    unsubscribe();
    removeVigilSessionRequest("req-dev-002");
    expect(calls).toBe(1);
  });

  it("notifies on each expiry-sweep removal", () => {
    const session = ensureVigilApprovalSession(makeLogger([]));
    const anchorMs = Date.parse(session.anchorIso);
    let calls = 0;
    subscribeVigilApprovalSession(() => { calls += 1; });

    const { expired } = expireVigilSessionRequests(anchorMs + 20 * 60_000, makeLogger([]));
    expect(expired.length).toBeGreaterThan(0);
    expect(calls).toBe(expired.length);
  });

  it("a subscriber attached before assembly fires at assembly with the full queue", () => {
    const seen: VigilApprovalSession[] = [];
    subscribeVigilApprovalSession((s) => seen.push(s));

    ensureVigilApprovalSession(makeLogger([]));
    expect(seen).toHaveLength(1);
    expect(seen[0].requests).toHaveLength(5);
  });

  it("resetVigilApprovalSessionForTests clears listeners (no cross-test leakage)", () => {
    ensureVigilApprovalSession(makeLogger([]));
    let calls = 0;
    subscribeVigilApprovalSession(() => { calls += 1; });

    resetVigilApprovalSessionForTests();
    ensureVigilApprovalSession(makeLogger([]));
    removeVigilSessionRequest("req-dev-001");
    expect(calls).toBe(0);
  });
});

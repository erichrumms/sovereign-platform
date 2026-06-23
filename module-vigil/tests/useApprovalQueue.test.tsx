/** @jest-environment jsdom */
/**
 * module-vigil — useApprovalQueue.test.tsx
 * P1-first sort, default synthetic port load, expiry → AGENT_ACTION_EXPIRED system event
 * (no human actor, no decision_type) + removal, and remove() on decision.
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { useApprovalQueue } from "../src/useApprovalQueue";
import { computeExpiresAt, approvalWorkflowStep, type AgentApprovalRequest, type RiskClassification } from "../src/approval-contract";
import { makeCtx } from "./test-helpers";

const ANCHOR = "2026-06-23T12:00:00.000Z";
const anchorMs = Date.parse(ANCHOR);

function req(id: string, risk: RiskClassification, over: Partial<AgentApprovalRequest> = {}): AgentApprovalRequest {
  return {
    request_id: id,
    requesting_agent_id: "agentos-x",
    requesting_agent_class: "Operational",
    action_type: "configuration_change",
    action_detail: { synthetic: true },
    risk_classification: risk,
    submitted_at: ANCHOR,
    expires_at: computeExpiresAt(ANCHOR, risk),
    workflow_step_id: approvalWorkflowStep(id),
    ...over,
  };
}

describe("useApprovalQueue", () => {
  it("loads the synthetic/dev port by default (3 requests)", () => {
    const { result } = renderHook(() => useApprovalQueue(makeCtx(), { anchorIso: ANCHOR }));
    expect(result.current.requests).toHaveLength(3);
  });

  it("sorts P1-first regardless of input order", () => {
    const { result } = renderHook(() =>
      useApprovalQueue(makeCtx(), { initialRequests: [req("c", "P3"), req("a", "P1"), req("b", "P2")] })
    );
    expect(result.current.requests.map((r) => r.risk_classification)).toEqual(["P1", "P2", "P3"]);
    expect(result.current.hasPendingP1).toBe(true);
    expect(result.current.pendingCount).toBe(3);
  });

  it("auto-rejects overdue requests with an AGENT_ACTION_EXPIRED system event", () => {
    const logSink: SovereignLogEvent[] = [];
    // P1 expires at anchor+15min; check at anchor+20min.
    const { result } = renderHook(() =>
      useApprovalQueue(makeCtx({ logSink }), { initialRequests: [req("a", "P1"), req("b", "P3")] })
    );

    let expired: string[] = [];
    act(() => {
      expired = result.current.expireOverdue(anchorMs + 20 * 60_000);
    });

    expect(expired).toEqual(["a"]); // only the P1 (15-min) expired; P3 (240-min) still pending
    expect(result.current.requests.map((r) => r.request_id)).toEqual(["b"]);

    const ev = logSink.find((e) => e.event_type === "AGENT_ACTION_EXPIRED")!;
    expect(ev.actor_id).toBe("sof-approval-system");
    expect(ev.actor).toBeUndefined(); // system event — not a human decision
    expect(ev.decision_type).toBeUndefined();
    expect(ev.workflow_step_id).toBe("vigil-approval-a");
  });

  it("remove() drops a decided request and clears selection", () => {
    const { result } = renderHook(() => useApprovalQueue(makeCtx(), { initialRequests: [req("a", "P1")] }));
    act(() => result.current.select("a"));
    expect(result.current.selected?.request_id).toBe("a");
    act(() => result.current.remove("a"));
    expect(result.current.requests).toHaveLength(0);
    expect(result.current.selected).toBeNull();
  });
});

/** @jest-environment jsdom */
/**
 * module-vigil — useApprovalDecision.test.tsx
 * Approve / Reject / Escalate emit the GD-6 events as HUMAN decisions (actor "human",
 * decision_type AGENT_APPROVAL — Constraint #4), require ≥10-char notes, carry
 * workflow_step_id, record escalation_reason on escalate, and fail-closed on a failed
 * Logger emit (Gate 2).
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { useApprovalDecision } from "../src/useApprovalDecision";
import { computeExpiresAt, approvalWorkflowStep, type AgentApprovalRequest } from "../src/approval-contract";
import { makeCtx } from "./test-helpers";

const ANCHOR = "2026-06-23T12:00:00.000Z";
const REQUEST: AgentApprovalRequest = {
  request_id: "req-1",
  requesting_agent_id: "agentos-deployer",
  requesting_agent_class: "Operational",
  action_type: "model_deployment",
  action_detail: { synthetic: true },
  risk_classification: "P1",
  submitted_at: ANCHOR,
  expires_at: computeExpiresAt(ANCHOR, "P1"),
  workflow_step_id: approvalWorkflowStep("req-1"),
};
const NOTE = "Reviewed the deployment detail and it is consistent with the release plan.";

describe("useApprovalDecision", () => {
  it("APPROVE emits AGENT_ACTION_APPROVED as a human decision with decision_type AGENT_APPROVAL", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useApprovalDecision(makeCtx({ logSink })));

    let ok = false;
    act(() => {
      ok = result.current.decide(REQUEST, "APPROVE", NOTE).ok;
    });

    expect(ok).toBe(true);
    const ev = logSink[0];
    expect(ev.event_type).toBe("AGENT_ACTION_APPROVED");
    expect(ev.actor).toBe("human");
    expect(ev.actor_name).toBe("Pat Operator");
    expect(ev.decision_type).toBe("AGENT_APPROVAL");
    expect(ev.workflow_step_id).toBe("vigil-approval-req-1");
    expect((ev.payload as { notes: string }).notes).toBe(NOTE);
    expect((ev.payload as { request_id: string }).request_id).toBe("req-1");
  });

  it("REJECT and ESCALATE emit their event types; ESCALATE records escalation_reason", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useApprovalDecision(makeCtx({ logSink })));

    act(() => {
      result.current.decide(REQUEST, "REJECT", NOTE);
    });
    expect(logSink[0].event_type).toBe("AGENT_ACTION_REJECTED");
    expect((logSink[0].payload as { escalation_reason?: string }).escalation_reason).toBeUndefined();

    act(() => {
      result.current.decide(REQUEST, "ESCALATE", NOTE);
    });
    const esc = logSink[1];
    expect(esc.event_type).toBe("AGENT_ACTION_ESCALATED");
    expect((esc.payload as { escalation_reason: string }).escalation_reason).toBe(NOTE);
  });

  it("rejects notes shorter than 10 chars without emitting", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useApprovalDecision(makeCtx({ logSink })));

    let ok = true;
    act(() => {
      ok = result.current.decide(REQUEST, "APPROVE", "short").ok;
    });
    expect(ok).toBe(false);
    expect(result.current.error).toMatch(/at least 10 characters/);
    expect(logSink).toHaveLength(0);
  });

  it("fails closed when the Logger emit throws (Gate 2)", () => {
    const { result } = renderHook(() => useApprovalDecision(makeCtx({ throwOnLog: true })));
    let ok = true;
    act(() => {
      ok = result.current.decide(REQUEST, "APPROVE", NOTE).ok;
    });
    expect(ok).toBe(false);
    expect(result.current.error).toMatch(/Logger emission failed/);
  });
});

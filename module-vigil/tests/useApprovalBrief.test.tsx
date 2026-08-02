/** @jest-environment jsdom */
/**
 * module-vigil — useApprovalBrief.test.tsx
 * Brief generation brackets the vigil-approval-agent step with AGENT_STEP_* +
 * FALLBACK_ACTIVATED (approved event types only), carries workflow_step_id, and halts on
 * a failed Logger emit (Gate 2). Key-less → static tier (deterministic, no network).
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { useApprovalBrief } from "../src/useApprovalBrief";
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

describe("useApprovalBrief", () => {
  it("produces a static brief (key-less) and emits the approved event sequence", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useApprovalBrief(makeCtx({ logSink })));

    await act(async () => {
      await result.current.generate(REQUEST);
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.outcome?.tier).toBe("static");

    const types = logSink.map((e) => e.event_type);
    expect(types).toEqual(["AGENT_STEP_START", "FALLBACK_ACTIVATED", "AGENT_STEP_COMPLETE"]);
    expect(logSink.every((e) => e.workflow_step_id === "vigil-approval-req-1")).toBe(true);

    const start = logSink.find((e) => e.event_type === "AGENT_STEP_START")!;
    expect(start.agent_id).toBe("vigil-approval-agent");
    expect(start.agent_class).toBe("Monitoring");
    expect((start.payload as { registry_id: string }).registry_id).toBe("PR-VIGIL-002");
  });

  it("halts on a failed Logger emit (Gate 2)", async () => {
    const { result } = renderHook(() => useApprovalBrief(makeCtx({ throwOnLog: true })));
    await act(async () => {
      await result.current.generate(REQUEST);
    });
    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/Logger emission failed/);
  });

  it("populates token_usage on AGENT_STEP_COMPLETE when live tier serves (GD-31)", async () => {
    const logSink: SovereignLogEvent[] = [];
    const mockComplete = async () =>
      ({
        content: "REQUESTED ACTION: deploy model\nWHAT CHANGES: Model goes live.",
        fallback_activated: false,
        fallback_tier: "live",
        usage: { input_tokens: 100, output_tokens: 50 },
      } as unknown as import("@sovereign/api-client").SovereignLLMResponse);
    const { result } = renderHook(() =>
      useApprovalBrief(makeCtx({ logSink }), { complete: mockComplete })
    );
    await act(async () => {
      await result.current.generate(REQUEST);
    });
    expect(result.current.outcome?.tier).toBe("live");
    const complete = logSink.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage?.input_tokens).toBe(100);
    expect(complete.token_usage?.output_tokens).toBe(50);
    expect(typeof complete.token_usage?.estimated_cost_usd).toBe("number");
  });

  it("leaves token_usage absent on AGENT_STEP_COMPLETE when fallback served (GD-31)", async () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useApprovalBrief(makeCtx({ logSink })));
    await act(async () => {
      await result.current.generate(REQUEST);
    });
    const complete = logSink.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage).toBeUndefined();
  });
});

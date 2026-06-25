/** @jest-environment jsdom */
/**
 * module-nexus — useRequestRegistry.test.tsx
 * The governed lifecycle: intake + each transition emits its GD-11 NEXUS_* event carrying
 * the request's workflow_step_id (Constraint #6); routing applies the table; the AgentOS
 * port receives the task on IN_PROGRESS; GD-10 refuses a non-UNCLASSIFIED intake; Gate 2
 * fail-closed blocks a transition whose Logger emit throws.
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { useRequestRegistry } from "../src/useRequestRegistry";
import { createSyntheticAgentOSPort } from "../src/agentos-port";
import { nexusAgentOSTaskId } from "../src/agentos-port";
import { makeCtx } from "./test-helpers";

function submitInput(over: Record<string, unknown> = {}) {
  return {
    request_id: "req-1",
    title: "Quarterly compliance review",
    description: "synthetic",
    request_type: "GOVERNANCE_QUERY" as const,
    data_classification: "UNCLASSIFIED" as const,
    requester_id: "E-900",
    ...over,
  };
}

describe("useRequestRegistry — approval path", () => {
  it("emits SUBMITTED→ROUTED→APPROVAL_PENDING→IN_PROGRESS→COMPLETE with workflow_step_id; hands to AgentOS", () => {
    const logSink: SovereignLogEvent[] = [];
    const port = createSyntheticAgentOSPort();
    const { result } = renderHook(() => useRequestRegistry(makeCtx({ logSink }), port));

    act(() => result.current.submit(submitInput()));
    act(() => result.current.route("req-1"));
    act(() => result.current.sendForApproval("req-1"));
    act(() => result.current.approveAndStart("req-1"));
    act(() => result.current.complete("req-1"));

    expect(result.current.requests[0].status).toBe("COMPLETE");
    expect(logSink.map((e) => e.event_type)).toEqual([
      "NEXUS_REQUEST_SUBMITTED",
      "NEXUS_REQUEST_ROUTED",
      "NEXUS_APPROVAL_PENDING",
      "NEXUS_REQUEST_IN_PROGRESS",
      "NEXUS_REQUEST_COMPLETE",
    ]);
    expect(logSink.every((e) => e.workflow_step_id === "nexus-request-req-1")).toBe(true);
    expect(logSink.every((e) => e.product === "NEXUS")).toBe(true);

    // GOVERNANCE_QUERY routed to Governance + requires approval.
    const routed = logSink.find((e) => e.event_type === "NEXUS_REQUEST_ROUTED")!;
    expect(routed.payload).toMatchObject({ agent_class: "Governance", requires_approval: true });

    // AgentOS received the task on IN_PROGRESS.
    const taskId = nexusAgentOSTaskId("req-1");
    expect(result.current.requests[0].agentos_task_id).toBe(taskId);
    expect(port.getTaskStatus(taskId)).toBe("ASSIGNED");
  });

  it("supports the rejection branch (PENDING_APPROVAL → REJECTED, no AgentOS hand-off)", () => {
    const logSink: SovereignLogEvent[] = [];
    const port = createSyntheticAgentOSPort();
    const { result } = renderHook(() => useRequestRegistry(makeCtx({ logSink }), port));
    act(() => result.current.submit(submitInput()));
    act(() => result.current.route("req-1"));
    act(() => result.current.sendForApproval("req-1"));
    act(() => result.current.reject("req-1"));
    expect(result.current.requests[0].status).toBe("REJECTED");
    expect(logSink.some((e) => e.event_type === "NEXUS_REQUEST_REJECTED")).toBe(true);
    expect(port.getTaskStatus(nexusAgentOSTaskId("req-1"))).toBe("CREATED"); // never submitted
  });
});

describe("useRequestRegistry — no-approval path", () => {
  it("DOCUMENT_REVIEW goes SUBMITTED → ROUTED → IN_PROGRESS → COMPLETE (no approval step)", () => {
    const logSink: SovereignLogEvent[] = [];
    const port = createSyntheticAgentOSPort();
    const { result } = renderHook(() => useRequestRegistry(makeCtx({ logSink }), port));
    act(() => result.current.submit(submitInput({ request_type: "DOCUMENT_REVIEW" })));
    act(() => result.current.route("req-1"));
    act(() => result.current.startWork("req-1"));
    act(() => result.current.complete("req-1"));
    expect(result.current.requests[0].status).toBe("COMPLETE");
    expect(logSink.map((e) => e.event_type)).toEqual([
      "NEXUS_REQUEST_SUBMITTED",
      "NEXUS_REQUEST_ROUTED",
      "NEXUS_REQUEST_IN_PROGRESS",
      "NEXUS_REQUEST_COMPLETE",
    ]);
    expect(logSink.find((e) => e.event_type === "NEXUS_REQUEST_ROUTED")!.payload).toMatchObject({ requires_approval: false });
  });
});

describe("useRequestRegistry — guards", () => {
  it("refuses a non-UNCLASSIFIED intake (GD-10) with the fixed message and emits nothing", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useRequestRegistry(makeCtx({ logSink }), createSyntheticAgentOSPort()));
    act(() => result.current.submit(submitInput({ data_classification: "CUI" })));
    expect(result.current.requests).toHaveLength(0);
    expect(result.current.error).toBe(
      "This classification level is not authorized for processing in SOVEREIGN. Contact your system administrator."
    );
    expect(logSink).toHaveLength(0);
  });

  it("fails closed when a transition Logger emit throws (Gate 2)", () => {
    const logSink: SovereignLogEvent[] = [];
    let shouldThrow = false;
    const ctx = makeCtx({ logSink });
    const throwingCtx = {
      ...ctx,
      logger: { log: (e: SovereignLogEvent) => { if (shouldThrow) throw new Error("boom"); logSink.push(e); } },
    };
    const { result } = renderHook(() => useRequestRegistry(throwingCtx as typeof ctx, createSyntheticAgentOSPort()));
    act(() => result.current.submit(submitInput()));
    shouldThrow = true;
    act(() => result.current.route("req-1"));
    expect(result.current.error).toMatch(/Logger emit failed/);
    expect(result.current.requests[0].status).toBe("SUBMITTED"); // not advanced
  });

  it("refuses an illegal transition with an error and no state change", () => {
    const { result } = renderHook(() => useRequestRegistry(makeCtx(), createSyntheticAgentOSPort()));
    act(() => result.current.submit(submitInput()));
    act(() => result.current.complete("req-1")); // SUBMITTED → COMPLETE illegal
    expect(result.current.error).toMatch(/Illegal NEXUS request transition/);
    expect(result.current.requests[0].status).toBe("SUBMITTED");
  });
});

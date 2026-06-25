/** @jest-environment jsdom */
/**
 * e2e — full-pipeline scenarios (NEXUS -> AgentOS -> VIGIL).
 *
 * Drives the real module hooks through one shared logger and asserts the cross-module Logger
 * trail + workflow_step_id chain. The bridge (a NEXUS request -> an AgentOS task) is the e2e
 * orchestration: AgentOS task id `nexus-<reqId>` encodes the originating NEXUS request, so the
 * NEXUS workflow_step_id (`nexus-request-<reqId>`) and the AgentOS one (`agentos-task-nexus-<reqId>`)
 * are linked and traceable.
 */
import { renderHook, act, type RenderHookResult } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import type { Task } from "../../module-agentos/src/agentos-contract";
import { routeRequest } from "../../module-nexus/src/request-router";
import { approvalRequestId } from "../../module-agentos/src/agent-dispatcher";
import { usePipeline, makeCtx, type Pipeline } from "./harness";

type Result = RenderHookResult<Pipeline, unknown>["result"];

const types = (sink: SovereignLogEvent[]) => sink.map((e) => e.event_type);
const forProduct = (sink: SovereignLogEvent[], product: string) => sink.filter((e) => e.product === product);

function submitInput(reqId: string, requestType: string, classification = "UNCLASSIFIED") {
  return { request_id: reqId, title: `${requestType} ${reqId}`, description: "e2e", request_type: requestType as never, data_classification: classification as never, requester_id: "E-001" };
}

/** NEXUS intake + route. */
function nexusSubmitAndRoute(result: Result, reqId: string, requestType: string): void {
  act(() => result.current.nexus.submit(submitInput(reqId, requestType)));
  act(() => result.current.nexus.route(reqId));
}

/** Bridge: AgentOS creates + dispatches the task for a routed NEXUS request. Returns the task id. */
function agentosCreateAndDispatch(result: Result, reqId: string, requestType: string): string {
  const taskId = `nexus-${reqId}`;
  const { requires_approval } = routeRequest(requestType as never);
  act(() => result.current.tasks.create({ task_id: taskId, title: requestType, description: "e2e", requires_approval, data_classification: "UNCLASSIFIED" }));
  const task = result.current.tasks.tasks.find((t: Task) => t.task_id === taskId)!;
  act(() => {
    const dispatched = result.current.dispatcher.dispatch(task)!;
    result.current.tasks.assign(taskId, dispatched.agent.agent_id);
    if (dispatched.approvalRequest) result.current.tasks.requestApproval(taskId, dispatched.approvalRequest.request_id);
  });
  if (requires_approval) act(() => result.current.nexus.sendForApproval(reqId));
  return taskId;
}

describe("SOVEREIGN end-to-end pipeline", () => {
  // ── Scenario 1 — approval-required happy path ──────────────────────────────
  it("Scenario 1: COMPLIANCE_CHECK with approval reaches IN_PROGRESS across NEXUS + AgentOS", () => {
    const sink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => usePipeline(makeCtx(sink)));

    nexusSubmitAndRoute(result, "req-1", "COMPLIANCE_CHECK");
    const taskId = agentosCreateAndDispatch(result, "req-1", "COMPLIANCE_CHECK");

    // VIGIL receives the request through the AgentOS approval port.
    expect(result.current.dispatcher.pendingRequests().map((r) => r.request_id)).toEqual([approvalRequestId(taskId)]);

    // VIGIL approves → task proceeds → NEXUS reflects IN_PROGRESS.
    act(() => {
      result.current.dispatcher.recordDecision(approvalRequestId(taskId), "approved");
      result.current.tasks.approve(taskId);
      result.current.tasks.start(taskId);
    });
    act(() => result.current.nexus.approveAndStart("req-1"));

    expect(result.current.nexus.requests[0].status).toBe("IN_PROGRESS");
    expect(result.current.tasks.tasks[0].status).toBe("IN_PROGRESS");
    expect(result.current.dispatcher.pendingRequests()).toHaveLength(0);

    // All expected Logger events present.
    const all = types(sink);
    for (const expected of [
      "NEXUS_REQUEST_SUBMITTED", "NEXUS_REQUEST_ROUTED", "NEXUS_APPROVAL_PENDING", "NEXUS_REQUEST_IN_PROGRESS",
      "AGENTOS_TASK_ASSIGNED", "AGENTOS_APPROVAL_REQUESTED", "AGENTOS_TASK_APPROVED", "AGENTOS_TASK_STARTED",
    ]) expect(all).toContain(expected);

    // workflow_step_id chain: NEXUS events share the request id; AgentOS events share the task
    // id; the AgentOS id encodes the NEXUS request id (traceable chain).
    expect(forProduct(sink, "NEXUS").every((e) => e.workflow_step_id === "nexus-request-req-1")).toBe(true);
    expect(forProduct(sink, "AGENTOS").every((e) => e.workflow_step_id === "agentos-task-nexus-req-1")).toBe(true);
    expect("agentos-task-nexus-req-1").toContain("req-1");
  });

  // ── Scenario 2 — no-approval happy path ────────────────────────────────────
  it("Scenario 2: DOCUMENT_REVIEW without approval goes ASSIGNED -> IN_PROGRESS directly; no VIGIL request", () => {
    const sink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => usePipeline(makeCtx(sink)));

    nexusSubmitAndRoute(result, "req-2", "DOCUMENT_REVIEW");
    const taskId = agentosCreateAndDispatch(result, "req-2", "DOCUMENT_REVIEW");

    // No approval request was ever submitted to VIGIL.
    expect(result.current.dispatcher.pendingRequests()).toHaveLength(0);

    act(() => result.current.tasks.start(taskId));   // ASSIGNED -> IN_PROGRESS (D3b)
    act(() => result.current.nexus.startWork("req-2"));

    expect(result.current.nexus.requests[0].status).toBe("IN_PROGRESS");
    expect(result.current.tasks.tasks[0].status).toBe("IN_PROGRESS");

    const all = types(sink);
    expect(all).not.toContain("AGENTOS_APPROVAL_REQUESTED");
    expect(all).not.toContain("NEXUS_APPROVAL_PENDING");
    expect(all).toContain("AGENTOS_TASK_STARTED");
    expect(all).toContain("NEXUS_REQUEST_IN_PROGRESS");
    // workflow_step_id consistent within each product.
    expect(forProduct(sink, "NEXUS").every((e) => e.workflow_step_id === "nexus-request-req-2")).toBe(true);
    expect(forProduct(sink, "AGENTOS").every((e) => e.workflow_step_id === "agentos-task-nexus-req-2")).toBe(true);
  });

  // ── Scenario 3 — classification rejection at intake ────────────────────────
  it("Scenario 3: a CUI work request is refused at NEXUS intake (GD-10) and never reaches AgentOS", () => {
    const sink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => usePipeline(makeCtx(sink)));

    act(() => result.current.nexus.submit(submitInput("req-3", "DATA_ANALYSIS", "CUI")));

    expect(result.current.nexus.error).toBe(
      "This classification level is not authorized for processing in SOVEREIGN. Contact your system administrator."
    );
    expect(result.current.nexus.requests).toHaveLength(0); // request never created
    expect(result.current.tasks.tasks).toHaveLength(0);    // never reached AgentOS
    expect(sink).toHaveLength(0);                            // no Logger event emitted
  });

  // ── Scenario 4 — VIGIL rejection ───────────────────────────────────────────
  it("Scenario 4: GOVERNANCE_QUERY rejected by VIGIL reaches REJECTED in NEXUS + AgentOS", () => {
    const sink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => usePipeline(makeCtx(sink)));

    nexusSubmitAndRoute(result, "req-4", "GOVERNANCE_QUERY");
    const taskId = agentosCreateAndDispatch(result, "req-4", "GOVERNANCE_QUERY");

    act(() => {
      result.current.dispatcher.recordDecision(approvalRequestId(taskId), "rejected");
      result.current.tasks.reject(taskId);
    });
    act(() => result.current.nexus.reject("req-4"));

    expect(result.current.nexus.requests[0].status).toBe("REJECTED");
    expect(result.current.tasks.tasks[0].status).toBe("REJECTED");

    const rejected = sink.find((e) => e.event_type === "NEXUS_REQUEST_REJECTED")!;
    expect(rejected).toBeDefined();
    // workflow_step_id links the rejection back to the original submission.
    expect(rejected.workflow_step_id).toBe("nexus-request-req-4");
    expect(sink.find((e) => e.event_type === "NEXUS_REQUEST_SUBMITTED")!.workflow_step_id).toBe("nexus-request-req-4");
    expect(types(sink)).toContain("AGENTOS_TASK_REJECTED");
  });
});

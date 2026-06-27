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
import {
  SYNTHETIC_WORKFLOW_ARTIFACT,
  SYNTHETIC_SESSION_ID,
} from "../../module-flowpath/src/synthetic-elicitation";
import {
  evaluateFiveQuestionGate,
  sessionWorkflowStep,
  artifactWorkflowStep,
  FLOWPATH_COORDINATOR,
  FLOWPATH_MAPPER,
} from "../../module-flowpath/src/flowpath-contract";
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

  // ── Scenario 5 — Walkthrough B: live NEXUS → AgentOS hand-off (D3) end-to-end ──────────────
  // Exercises the Stage 5a pipeline through the LIVE AgentOS-backed port (createAgentOSBackedPort):
  // a NEXUS submission routes, passes the VIGIL-routed approval marker, and on entering
  // IN_PROGRESS creates a REAL AgentOS task (AGENTOS_TASK_ASSIGNED) carrying the NEXUS request_id
  // — the hand-off Walkthrough A found missing. It then confirms APEX surfaces portfolio program
  // data (the CPMI World Model projection a reviewer sees) for the same UNCLASSIFIED session.
  it("Scenario 5: a NEXUS submission creates a live AgentOS task and APEX shows portfolio data", () => {
    const sink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => usePipeline(makeCtx(sink)));

    // NEXUS submission → routing → VIGIL-routed approval → execution hand-off (live port).
    act(() => result.current.nexusLive.submit(submitInput("req-5", "COMPLIANCE_CHECK")));
    act(() => result.current.nexusLive.route("req-5"));
    act(() => result.current.nexusLive.sendForApproval("req-5"));
    act(() => result.current.nexusLive.approveAndStart("req-5"));

    // NEXUS reached IN_PROGRESS.
    expect(result.current.nexusLive.requests[0].status).toBe("IN_PROGRESS");

    // The LIVE port created a real AgentOS task carrying the NEXUS request_id (traceability).
    const liveTasks = result.current.livePort.listTasks();
    expect(liveTasks).toHaveLength(1);
    expect(liveTasks[0].task_id).toBe("nexus-req-5");
    expect(liveTasks[0].status).toBe("ASSIGNED");
    const assigned = sink.find((e) => e.event_type === "AGENTOS_TASK_ASSIGNED");
    expect(assigned).toBeDefined();
    expect(assigned!.payload.request_id).toBe("req-5");

    // Event sequence across products: SUBMITTED → ROUTED → APPROVAL_PENDING → IN_PROGRESS → ASSIGNED.
    const all = types(sink);
    for (const expected of [
      "NEXUS_REQUEST_SUBMITTED", "NEXUS_REQUEST_ROUTED", "NEXUS_APPROVAL_PENDING",
      "NEXUS_REQUEST_IN_PROGRESS", "AGENTOS_TASK_ASSIGNED",
    ]) expect(all).toContain(expected);

    // workflow_step_id chain: the AgentOS task's id ties back to the NEXUS request.
    expect(forProduct(sink, "NEXUS").every((e) => e.workflow_step_id === "nexus-request-req-5")).toBe(true);
    expect(assigned!.workflow_step_id).toBe("agentos-task-nexus-req-5");
    expect(result.current.nexusLive.requests[0].agentos_task_id).toBe("agentos-task-nexus-req-5");

    // APEX portfolio view has program data (synthetic CPMI World Model), incl. P-100.
    const programs = result.current.apex.listPrograms();
    expect(programs.length).toBeGreaterThan(0);
    expect(programs.some((p) => p.program_id === "P-100")).toBe(true);
  });

  // ── Scenario 6 — Stage 5b: FLOWPATH → AgentOS → APEX pipeline (synthetic, no live LLM) ──────
  // A FLOWPATH elicitation session produces a gate-passing WorkflowArtifact; a human reviewer
  // approves it (WORKFLOW_APPROVAL — Constraint #4); AgentOS receives the approved workflow as a
  // task whose id encodes the FLOWPATH session_id (traceability, the same pattern as Scenarios
  // 1–5); APEX confirms portfolio program data. Synthetic artifact — no live LLM call. Every event
  // carries workflow_step_id.
  it("Scenario 6: a FLOWPATH session produces an approved workflow AgentOS receives, and APEX shows portfolio data", () => {
    const sink: SovereignLogEvent[] = [];
    const ctx = makeCtx(sink);
    const { result } = renderHook(() => usePipeline(ctx));

    const sessionId = SYNTHETIC_SESSION_ID;
    const artifact = SYNTHETIC_WORKFLOW_ARTIFACT;
    const sessionStep = sessionWorkflowStep(sessionId);
    const artifactStep = artifactWorkflowStep(sessionId);

    // Step 1 — FLOWPATH session produces the WorkflowArtifact (synthetic; flowpath.coordinator/mapper).
    ctx.logger.log({ event_type: "FLOWPATH_SESSION_STARTED", workflow_step_id: sessionStep, sovereign_tier: "standard", product: "FLOWPATH", actor_id: "E-001", agent_id: FLOWPATH_COORDINATOR, outcome: "flowpath_session_started", payload: { session_id: sessionId, workflow_type: artifact.workflow_type } });
    ctx.logger.log({ event_type: "FLOWPATH_ARTIFACT_PRODUCED", workflow_step_id: artifactStep, sovereign_tier: "standard", product: "FLOWPATH", actor_id: "E-001", agent_id: FLOWPATH_MAPPER, outcome: "flowpath_artifact_static", payload: { session_id: sessionId, artifact_type: artifact.workflow_type } });
    ctx.logger.log({ event_type: "FLOWPATH_SESSION_COMPLETE", workflow_step_id: sessionStep, sovereign_tier: "standard", product: "FLOWPATH", actor_id: "E-001", agent_id: FLOWPATH_COORDINATOR, outcome: "flowpath_session_complete", payload: { session_id: sessionId, gate_passed: true } });

    // Step 2 — the artifact passes the Five-Question Gate.
    expect(evaluateFiveQuestionGate(artifact).gate_passed).toBe(true);

    // Step 3 — a human reviewer approves the artifact (WORKFLOW_APPROVAL).
    ctx.logger.log({ event_type: "HUMAN_DECISION", workflow_step_id: artifactStep, sovereign_tier: "standard", product: "FLOWPATH", actor_id: "E-001", actor: "human", actor_name: "E2E Operator", decision_type: "WORKFLOW_APPROVAL", outcome: "flowpath_workflow_approved", payload: { session_id: sessionId, artifact_id: artifact.artifact_id } });
    ctx.logger.log({ event_type: "FLOWPATH_ARTIFACT_APPROVED", workflow_step_id: artifactStep, sovereign_tier: "standard", product: "FLOWPATH", actor_id: "E-001", actor: "human", actor_name: "E2E Operator", outcome: "flowpath_artifact_approved", payload: { session_id: sessionId, artifact_type: artifact.workflow_type } });

    // Step 4 — AgentOS receives the approved workflow as a task whose id encodes the session_id.
    const taskId = `flowpath-${sessionId}`;
    act(() => result.current.tasks.create({ task_id: taskId, title: artifact.title, description: "Approved FLOWPATH workflow", requires_approval: false, data_classification: "UNCLASSIFIED" }));
    act(() => result.current.tasks.assign(taskId, "agentos.configurator"));

    const assigned = sink.find((e) => e.event_type === "AGENTOS_TASK_ASSIGNED");
    expect(assigned).toBeDefined();
    expect(assigned!.workflow_step_id).toBe(`agentos-task-${taskId}`);
    expect((assigned!.payload as { task_id: string }).task_id).toContain(sessionId);
    expect(result.current.tasks.tasks[0].status).toBe("ASSIGNED");

    // Step 5 — APEX portfolio shows program data (synthetic CPMI World Model), incl. P-100.
    const programs = result.current.apex.listPrograms();
    expect(programs.some((p) => p.program_id === "P-100")).toBe(true);

    // Audit trail: the FLOWPATH lifecycle + approval + AgentOS assignment are all present, and every
    // event carries a workflow_step_id (Constraint #6).
    const all = types(sink);
    for (const expected of ["FLOWPATH_SESSION_STARTED", "FLOWPATH_SESSION_COMPLETE", "FLOWPATH_ARTIFACT_PRODUCED", "FLOWPATH_ARTIFACT_APPROVED", "AGENTOS_TASK_ASSIGNED"]) {
      expect(all).toContain(expected);
    }
    const approval = sink.find((e) => e.event_type === "HUMAN_DECISION" && e.decision_type === "WORKFLOW_APPROVAL");
    expect(approval).toBeDefined();
    expect(approval!.actor).toBe("human");
    expect(approval!.actor_name).toBe("E2E Operator");
    expect(sink.every((e) => typeof e.workflow_step_id === "string" && e.workflow_step_id.length > 0)).toBe(true);
  });
});

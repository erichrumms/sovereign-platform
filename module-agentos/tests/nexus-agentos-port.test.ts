/**
 * module-agentos — nexus-agentos-port.test.ts (Session 18, D3).
 * The LIVE AgentOS backing for NEXUS's AgentOSPort: a NEXUS hand-off creates a real AgentOS
 * task (ASSIGNED), emits AGENTOS_TASK_ASSIGNED carrying the originating request_id, reconciles
 * its id with the NEXUS-side agentos_task_id, and fails closed when the Logger emit throws.
 */
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import type { AgentOSSubmitInput } from "../../module-nexus/src/agentos-port";
import { nexusAgentOSTaskId } from "../../module-nexus/src/agentos-port";
import { createAgentOSBackedPort, nexusTaskId } from "../src/nexus-agentos-port";
import { makeCtx } from "./test-helpers";

function submitInput(requestId: string, requestType = "DOCUMENT_REVIEW"): AgentOSSubmitInput {
  return {
    request_id: requestId,
    request_type: requestType,
    agent_class: "Analytical",
    requires_approval: requestType === "COMPLIANCE_CHECK",
    data_classification: "UNCLASSIFIED",
    workflow_step_id: `nexus-request-${requestId}`,
  };
}

describe("createAgentOSBackedPort — live NEXUS → AgentOS hand-off", () => {
  it("creates a corresponding AgentOS task entry on submitTask", () => {
    const port = createAgentOSBackedPort(makeCtx());
    port.submitTask(submitInput("req-1"));

    const tasks = port.listTasks();
    expect(tasks).toHaveLength(1);
    const task = port.getTask(nexusTaskId("req-1"));
    expect(task).toBeDefined();
    expect(task!.task_id).toBe("nexus-req-1");
    expect(task!.status).toBe("ASSIGNED");
    expect(task!.assigned_agent_id).toBe("agentos-orchestrator");
  });

  it("emits AGENTOS_TASK_ASSIGNED carrying the originating NEXUS request_id (traceability)", () => {
    const logSink: SovereignLogEvent[] = [];
    const port = createAgentOSBackedPort(makeCtx({ logSink }));
    port.submitTask(submitInput("req-2"));

    const assigned = logSink.find((e) => e.event_type === "AGENTOS_TASK_ASSIGNED");
    expect(assigned).toBeDefined();
    expect(assigned!.product).toBe("AGENTOS");
    expect(assigned!.actor).toBe("agent");
    expect(assigned!.agent_id).toBe("agentos-orchestrator");
    expect(assigned!.payload.request_id).toBe("req-2");
    expect(assigned!.payload.task_id).toBe("nexus-req-2");
    // Constraint #6 — workflow_step_id present on the event.
    expect(assigned!.workflow_step_id).toBe("agentos-task-nexus-req-2");
  });

  it("reconciles its returned id with the NEXUS-side agentos_task_id, so getTaskStatus matches", () => {
    const port = createAgentOSBackedPort(makeCtx());
    const returnedId = port.submitTask(submitInput("req-3"));

    // NEXUS records nexusAgentOSTaskId(request_id) as the request's agentos_task_id and polls with it.
    expect(returnedId).toBe(nexusAgentOSTaskId("req-3"));
    expect(port.getTaskStatus(nexusAgentOSTaskId("req-3"))).toBe("ASSIGNED");
    // An unknown id reports CREATED (never throws).
    expect(port.getTaskStatus("agentos-task-nexus-unknown")).toBe("CREATED");
  });

  it("carries the routing metadata (agent_class, approval requirement) through to the event", () => {
    const logSink: SovereignLogEvent[] = [];
    const port = createAgentOSBackedPort(makeCtx({ logSink }));
    port.submitTask(submitInput("req-4", "COMPLIANCE_CHECK"));

    const assigned = logSink.find((e) => e.event_type === "AGENTOS_TASK_ASSIGNED");
    expect(assigned!.payload.agent_class).toBe("Analytical");
    expect(assigned!.payload.requires_approval).toBe(true);
    expect(port.getTask(nexusTaskId("req-4"))!.requires_approval).toBe(true);
  });

  it("fails closed: a Logger emit failure stores no task entry and never throws", () => {
    const port = createAgentOSBackedPort(makeCtx({ throwOnLog: true }));
    expect(() => port.submitTask(submitInput("req-5"))).not.toThrow();
    expect(port.listTasks()).toHaveLength(0);
    expect(port.getTaskStatus(nexusAgentOSTaskId("req-5"))).toBe("CREATED");
  });
});

/**
 * module-nexus — agentos-port.test.ts
 * The injectable AgentOS port (NEXUS → AgentOS hand-off): submitTask records a synthetic
 * AgentOS task and returns its id; getTaskStatus reports the AgentOS TaskStatus; the dev
 * seam advances it; an unknown task id reports CREATED.
 */
import { createSyntheticAgentOSPort, nexusAgentOSTaskId, type AgentOSSubmitInput } from "../src/agentos-port";

function input(over: Partial<AgentOSSubmitInput> = {}): AgentOSSubmitInput {
  return {
    request_id: "req-1",
    request_type: "DOCUMENT_REVIEW",
    agent_class: "Analytical",
    requires_approval: false,
    data_classification: "UNCLASSIFIED",
    workflow_step_id: "nexus-request-req-1",
    ...over,
  };
}

describe("createSyntheticAgentOSPort", () => {
  it("submitTask returns the deterministic AgentOS task id and starts ASSIGNED", () => {
    const port = createSyntheticAgentOSPort();
    const taskId = port.submitTask(input());
    expect(taskId).toBe(nexusAgentOSTaskId("req-1"));
    expect(port.getTaskStatus(taskId)).toBe("ASSIGNED");
  });

  it("reports CREATED for an unknown task id (nothing submitted)", () => {
    const port = createSyntheticAgentOSPort();
    expect(port.getTaskStatus("unknown")).toBe("CREATED");
  });

  it("the dev seam advances a submitted task's status", () => {
    const port = createSyntheticAgentOSPort();
    const taskId = port.submitTask(input());
    port.setTaskStatus(taskId, "COMPLETE");
    expect(port.getTaskStatus(taskId)).toBe("COMPLETE");
  });

  it("setTaskStatus ignores a task that was never submitted", () => {
    const port = createSyntheticAgentOSPort();
    port.setTaskStatus("ghost", "COMPLETE");
    expect(port.getTaskStatus("ghost")).toBe("CREATED");
  });
});

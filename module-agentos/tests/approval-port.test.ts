/**
 * module-agentos — approval-port.test.ts
 * The AgentOS implementation of VIGIL's AgentApprovalPort: submitRequest enqueues a request
 * VIGIL reads via listPending(); getDecision() reports pending until recordDecision() lands;
 * a decided request drops out of listPending() (closes the Session 10 loop).
 */
import { createAgentOSApprovalPort } from "../src/approval-port";
import type { AgentApprovalRequest } from "../../module-vigil/src/approval-contract";

function req(id: string): AgentApprovalRequest {
  return {
    request_id: id,
    requesting_agent_id: "agentos-deployer",
    requesting_agent_class: "Operational",
    action_type: "agent_task",
    action_detail: { synthetic: true, task_id: "task-1" },
    risk_classification: "P2",
    submitted_at: "2026-06-24T12:00:00.000Z",
    expires_at: "2026-06-24T13:00:00.000Z",
    workflow_step_id: "agentos-task-task-1",
  };
}

describe("createAgentOSApprovalPort", () => {
  it("implements VIGIL's AgentApprovalPort: submitted requests appear in listPending()", () => {
    const port = createAgentOSApprovalPort();
    expect(port.listPending()).toHaveLength(0);
    port.submitRequest(req("agentos-req-task-1"));
    expect(port.listPending().map((r) => r.request_id)).toEqual(["agentos-req-task-1"]);
    expect(port.getDecision("agentos-req-task-1")).toBe("pending");
  });

  it("recordDecision resolves the request and drops it from listPending()", () => {
    const port = createAgentOSApprovalPort();
    port.submitRequest(req("agentos-req-task-1"));
    port.recordDecision("agentos-req-task-1", "approved");
    expect(port.getDecision("agentos-req-task-1")).toBe("approved");
    expect(port.listPending()).toHaveLength(0);
  });

  it("supports rejection and reports pending for an unknown request id", () => {
    const port = createAgentOSApprovalPort();
    port.submitRequest(req("r1"));
    port.recordDecision("r1", "rejected");
    expect(port.getDecision("r1")).toBe("rejected");
    expect(port.getDecision("unknown")).toBe("pending");
  });

  it("ignores a decision for a request that was never submitted", () => {
    const port = createAgentOSApprovalPort();
    port.recordDecision("ghost", "approved");
    expect(port.getDecision("ghost")).toBe("pending");
    expect(port.listPending()).toHaveLength(0);
  });
});

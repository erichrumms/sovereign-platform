/**
 * module-agentos — agent-dispatcher.test.ts
 * Synthetic dispatch: deterministic agent selection, AgentAssignment shape, the
 * AgentApprovalRequest AgentOS submits to VIGIL, and the GD-10 boundary (an unauthorized
 * classification is rejected before any assignment/request is produced).
 */
import {
  SYNTHETIC_DISPATCH_AGENTS,
  selectAgentForTask,
  buildAssignment,
  buildApprovalRequest,
  approvalRequestId,
} from "../src/agent-dispatcher";
import { ClassificationNotAuthorizedError } from "@sovereign/api-client";
import { createTask } from "../src/task-registry";
import type { CreateTaskInput, Task } from "../src/agentos-contract";

const NOW = "2026-06-24T12:00:00.000Z";

function task(over: Partial<CreateTaskInput> = {}): Task {
  const input: CreateTaskInput = {
    task_id: "task-1",
    title: "Refresh APEX model",
    description: "synthetic task",
    requires_approval: true,
    data_classification: "UNCLASSIFIED",
    ...over,
  };
  return createTask(input, NOW);
}

describe("selectAgentForTask", () => {
  it("returns a roster agent deterministically (same id → same agent)", () => {
    const a = selectAgentForTask(task({ task_id: "task-1" }));
    const b = selectAgentForTask(task({ task_id: "task-1" }));
    expect(a).toBe(b);
    expect(SYNTHETIC_DISPATCH_AGENTS).toContain(a);
  });
});

describe("buildAssignment", () => {
  it("produces the AgentAssignment shape (spec §3.4)", () => {
    const agent = selectAgentForTask(task());
    const assignment = buildAssignment(task(), agent, NOW);
    expect(assignment).toEqual({
      task_id: "task-1",
      agent_id: agent.agent_id,
      agent_class: agent.agent_class,
      assigned_at: NOW,
      requires_approval: true,
    });
  });

  it("throws ClassificationNotAuthorizedError for a CUI task (GD-10)", () => {
    const t = task({ data_classification: "CUI" });
    expect(() => buildAssignment(t, selectAgentForTask(t), NOW)).toThrow(ClassificationNotAuthorizedError);
  });
});

describe("buildApprovalRequest", () => {
  it("builds the request AgentOS submits to VIGIL, sharing the task workflow_step_id", () => {
    const t = task();
    const agent = selectAgentForTask(t);
    const req = buildApprovalRequest(t, agent, NOW);
    expect(req.request_id).toBe(approvalRequestId("task-1"));
    expect(req.requesting_agent_id).toBe(agent.agent_id);
    expect(req.action_type).toBe("agent_task");
    expect(req.workflow_step_id).toBe(t.workflow_step_id); // Constraint #6 — ties the loop
    expect(req.risk_classification).toBe("P2");
    expect(req.expires_at > req.submitted_at).toBe(true);
    expect((req.action_detail as { task_id: string }).task_id).toBe("task-1");
  });

  it("throws ClassificationNotAuthorizedError for SECRET (GD-10)", () => {
    const t = task({ data_classification: "SECRET" });
    expect(() => buildApprovalRequest(t, selectAgentForTask(t), NOW)).toThrow(ClassificationNotAuthorizedError);
  });
});

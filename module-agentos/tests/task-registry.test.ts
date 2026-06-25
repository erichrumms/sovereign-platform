/**
 * module-agentos — task-registry.test.ts
 * The pure state machine: createTask shape, each named transition, immutability (input
 * array never mutated), illegal-transition rejection, and unknown-task rejection.
 */
import {
  createTask,
  getTask,
  transition,
  assignTask,
  requestApproval,
  approveTask,
  rejectTask,
  startTask,
  completeTask,
  cancelTask,
  TaskTransitionError,
  TaskNotFoundError,
} from "../src/task-registry";
import type { CreateTaskInput, Task } from "../src/agentos-contract";

const NOW = "2026-06-24T12:00:00.000Z";
const LATER = "2026-06-24T12:05:00.000Z";

const input: CreateTaskInput = {
  task_id: "task-1",
  title: "Refresh APEX model",
  description: "synthetic",
  requires_approval: true,
  data_classification: "UNCLASSIFIED",
};

describe("createTask", () => {
  it("creates a CREATED task with workflow_step_id and timestamps", () => {
    const t = createTask(input, NOW);
    expect(t.status).toBe("CREATED");
    expect(t.task_id).toBe("task-1");
    expect(t.workflow_step_id).toBe("agentos-task-task-1");
    expect(t.created_at).toBe(NOW);
    expect(t.updated_at).toBe(NOW);
    expect(t.assigned_agent_id).toBeUndefined();
  });
});

describe("transitions are pure and stamp updated_at", () => {
  it("assignTask records the agent and does not mutate the input array", () => {
    const before: Task[] = [createTask(input, NOW)];
    const after = assignTask(before, "task-1", "agentos-deployer", LATER);
    expect(after).not.toBe(before);
    expect(before[0].status).toBe("CREATED"); // input untouched
    expect(getTask(after, "task-1")!.status).toBe("ASSIGNED");
    expect(getTask(after, "task-1")!.assigned_agent_id).toBe("agentos-deployer");
    expect(getTask(after, "task-1")!.updated_at).toBe(LATER);
  });

  it("runs the full happy path CREATED → ... → COMPLETE", () => {
    let tasks: Task[] = [createTask(input, NOW)];
    tasks = assignTask(tasks, "task-1", "agentos-deployer", NOW);
    tasks = requestApproval(tasks, "task-1", NOW);
    tasks = approveTask(tasks, "task-1", NOW);
    tasks = startTask(tasks, "task-1", NOW);
    tasks = completeTask(tasks, "task-1", NOW);
    expect(getTask(tasks, "task-1")!.status).toBe("COMPLETE");
  });

  it("supports the rejection branch PENDING_APPROVAL → REJECTED → CANCELLED", () => {
    let tasks: Task[] = [createTask(input, NOW)];
    tasks = assignTask(tasks, "task-1", "a", NOW);
    tasks = requestApproval(tasks, "task-1", NOW);
    tasks = rejectTask(tasks, "task-1", NOW);
    expect(getTask(tasks, "task-1")!.status).toBe("REJECTED");
    tasks = cancelTask(tasks, "task-1", NOW);
    expect(getTask(tasks, "task-1")!.status).toBe("CANCELLED");
  });

  it("cancels from any non-terminal state", () => {
    const created: Task[] = [createTask(input, NOW)];
    expect(getTask(cancelTask(created, "task-1", NOW), "task-1")!.status).toBe("CANCELLED");
  });

  it("starts a requires_approval=false task directly ASSIGNED → IN_PROGRESS (D3b)", () => {
    let tasks: Task[] = [createTask({ ...input, requires_approval: false }, NOW)];
    tasks = assignTask(tasks, "task-1", "agentos-deployer", NOW);
    tasks = startTask(tasks, "task-1", NOW); // ASSIGNED → IN_PROGRESS, no approval gate
    expect(getTask(tasks, "task-1")!.status).toBe("IN_PROGRESS");
  });
});

describe("guards", () => {
  it("throws TaskTransitionError on an illegal transition and never mutates", () => {
    const tasks: Task[] = [createTask(input, NOW)];
    expect(() => startTask(tasks, "task-1", NOW)).toThrow(TaskTransitionError);
    expect(tasks[0].status).toBe("CREATED");
  });

  it("throws TaskNotFoundError for an unknown task id", () => {
    expect(() => transition([], "missing", "ASSIGNED", NOW)).toThrow(TaskNotFoundError);
  });

  it("cannot transition out of a terminal state", () => {
    let tasks: Task[] = [createTask(input, NOW)];
    tasks = cancelTask(tasks, "task-1", NOW);
    expect(() => assignTask(tasks, "task-1", "a", NOW)).toThrow(TaskTransitionError);
  });
});

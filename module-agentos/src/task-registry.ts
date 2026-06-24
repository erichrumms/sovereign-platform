/**
 * SOVEREIGN Platform — module-agentos
 * task-registry.ts — the task lifecycle state machine (pure, no React).
 *
 * Pure functions over an immutable Task[]. Each transition validates against
 * ALLOWED_TRANSITIONS (agentos-contract) and returns a NEW array; an illegal transition
 * throws TaskTransitionError and never mutates. The hook (useTaskRegistry) wires Logger
 * emission with the Gate-2 fail-closed rule (emit first; a failed emit blocks the
 * transition). The dispatcher reads/feeds this registry; the panels render it.
 *
 * Version: 1.0 · Session 14 · June 24, 2026
 */

import {
  type Task,
  type TaskStatus,
  type CreateTaskInput,
  canTransition,
  taskWorkflowStep,
} from "./agentos-contract";

/** Thrown when a task transition is not allowed by the lifecycle state machine. */
export class TaskTransitionError extends Error {
  constructor(
    public readonly taskId: string,
    public readonly from: TaskStatus,
    public readonly to: TaskStatus
  ) {
    super(`Illegal AgentOS task transition for ${taskId}: ${from} -> ${to}`);
    this.name = "TaskTransitionError";
  }
}

/** Thrown when an operation references a task id the registry does not hold. */
export class TaskNotFoundError extends Error {
  constructor(public readonly taskId: string) {
    super(`AgentOS task not found: ${taskId}`);
    this.name = "TaskNotFoundError";
  }
}

/** Create a new task in the CREATED state, anchored to `nowIso`. */
export function createTask(input: CreateTaskInput, nowIso: string): Task {
  return {
    task_id: input.task_id,
    title: input.title,
    description: input.description,
    status: "CREATED",
    requires_approval: input.requires_approval,
    data_classification: input.data_classification,
    created_at: nowIso,
    updated_at: nowIso,
    workflow_step_id: taskWorkflowStep(input.task_id),
  };
}

export function getTask(tasks: readonly Task[], taskId: string): Task | undefined {
  return tasks.find((t) => t.task_id === taskId);
}

function requireTask(tasks: readonly Task[], taskId: string): Task {
  const task = getTask(tasks, taskId);
  if (!task) throw new TaskNotFoundError(taskId);
  return task;
}

/**
 * Apply a transition to `taskId`, returning a NEW array. Validates the transition
 * (TaskTransitionError if illegal), stamps updated_at, and applies an optional partial
 * patch (e.g. assigned_agent_id). Pure — the input array is never mutated.
 */
export function transition(
  tasks: readonly Task[],
  taskId: string,
  to: TaskStatus,
  nowIso: string,
  patch: Partial<Task> = {}
): Task[] {
  const current = requireTask(tasks, taskId);
  if (!canTransition(current.status, to)) {
    throw new TaskTransitionError(taskId, current.status, to);
  }
  return tasks.map((t) =>
    t.task_id === taskId ? { ...t, ...patch, status: to, updated_at: nowIso } : t
  );
}

// ---- Named convenience transitions (each is the single source for its target state) ----

/** CREATED → ASSIGNED, recording the assigned agent. */
export function assignTask(tasks: readonly Task[], taskId: string, agentId: string, nowIso: string): Task[] {
  return transition(tasks, taskId, "ASSIGNED", nowIso, { assigned_agent_id: agentId });
}

/** ASSIGNED → PENDING_APPROVAL (task requires human authorization). */
export function requestApproval(tasks: readonly Task[], taskId: string, nowIso: string): Task[] {
  return transition(tasks, taskId, "PENDING_APPROVAL", nowIso);
}

/** PENDING_APPROVAL → APPROVED (VIGIL approval received). */
export function approveTask(tasks: readonly Task[], taskId: string, nowIso: string): Task[] {
  return transition(tasks, taskId, "APPROVED", nowIso);
}

/** PENDING_APPROVAL → REJECTED (VIGIL rejection received). */
export function rejectTask(tasks: readonly Task[], taskId: string, nowIso: string): Task[] {
  return transition(tasks, taskId, "REJECTED", nowIso);
}

/** APPROVED → IN_PROGRESS (agent begins execution). */
export function startTask(tasks: readonly Task[], taskId: string, nowIso: string): Task[] {
  return transition(tasks, taskId, "IN_PROGRESS", nowIso);
}

/** IN_PROGRESS → COMPLETE (agent signals completion). */
export function completeTask(tasks: readonly Task[], taskId: string, nowIso: string): Task[] {
  return transition(tasks, taskId, "COMPLETE", nowIso);
}

/** Any non-terminal → CANCELLED (Project Principal cancels). */
export function cancelTask(tasks: readonly Task[], taskId: string, nowIso: string): Task[] {
  return transition(tasks, taskId, "CANCELLED", nowIso);
}

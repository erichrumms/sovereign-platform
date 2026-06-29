/**
 * SOVEREIGN Platform — module-agentos
 * useTaskRegistry.ts — the task-registry hook (state + Logger emission).
 *
 * Owns the Task[] state and drives every lifecycle transition through the pure
 * task-registry, emitting the GD-9 Logger event for each (spec §3.2). Every event carries
 * the task's workflow_step_id (Standing Constraint #6); human transitions
 * (APPROVED / REJECTED / CANCELLED) carry actor "human" + decision_type (Constraint #4).
 *
 * GATE 2 (fail-closed): the Logger event is emitted BEFORE the state changes — a failed
 * emit BLOCKS the transition (an unlogged transition is an ungoverned transition). Mirrors
 * module-cpmi's useGateRunner: the emit happens OUTSIDE setState (Strict-Mode safe). State
 * is mirrored in a ref so chained transitions within one handler (assign → requestApproval)
 * see each other synchronously.
 *
 * Version: 1.0 · Session 14 · June 24, 2026
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { SovereignShellContext, SovereignLogEvent, SharedTask } from "../../sovereign-shell/shell-contract";
import {
  type Task,
  type TaskStatus,
  type CreateTaskInput,
  canTransition,
  eventTypeForTransition,
  decisionTypeForTransition,
  isHumanTransition,
} from "./agentos-contract";
import { createTask, getTask, transition, TaskTransitionError } from "./task-registry";

const AGENTOS_ORCHESTRATOR = "agentos-orchestrator";

export interface UseTaskRegistry {
  tasks: Task[];
  error: string | null;
  /** Create a task in CREATED (no transition event — CREATED is the initial state). */
  create: (input: CreateTaskInput) => void;
  /** CREATED → ASSIGNED. */
  assign: (taskId: string, agentId: string) => void;
  /** ASSIGNED → PENDING_APPROVAL. Optionally records the submitted approval request id. */
  requestApproval: (taskId: string, requestId?: string) => void;
  /** PENDING_APPROVAL → APPROVED (human / VIGIL). */
  approve: (taskId: string) => void;
  /** PENDING_APPROVAL → REJECTED (human / VIGIL). */
  reject: (taskId: string) => void;
  /** APPROVED → IN_PROGRESS. */
  start: (taskId: string) => void;
  /** IN_PROGRESS → COMPLETE. */
  complete: (taskId: string) => void;
  /** Any non-terminal → CANCELLED (human / Project Principal). */
  cancel: (taskId: string) => void;
  clearError: () => void;
}

/**
 * True when two SharedTask snapshots are equivalent for rendering (same ids, statuses, and
 * updated_at, in order). Used to bail out of a state update when the surface hands back an
 * unchanged set — this keeps the subscribe effect from looping if the ctx (and thus the
 * surface) identity changes every render (a common renderHook(makeCtx()) test pattern).
 */
function sameTaskList(a: readonly SharedTask[], b: readonly SharedTask[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].task_id !== b[i].task_id || a[i].status !== b[i].status || a[i].updated_at !== b[i].updated_at) {
      return false;
    }
  }
  return true;
}

/** Convert a cross-product SharedTask (e.g. a NEXUS-routed task) into a renderable AgentOS Task. */
function sharedToTask(s: SharedTask): Task {
  return {
    task_id: s.task_id,
    title: s.title,
    description: s.description,
    status: s.status,
    assigned_agent_id: s.assigned_agent_id,
    requires_approval: s.requires_approval,
    data_classification: s.data_classification,
    created_at: s.created_at,
    updated_at: s.updated_at,
    workflow_step_id: s.workflow_step_id,
    origin_product: s.origin_product,
    origin_request_id: s.origin_request_id,
  };
}

export function useTaskRegistry(ctx: SovereignShellContext): UseTaskRegistry {
  const tasksRef = useRef<Task[]>([]);
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  // GD-19 (D2): mirror the shared task surface so tasks routed in from other products
  // (e.g. a NEXUS work request handed to AgentOS) appear in the Task Registry. The surface
  // is the ninth shell export; optional-guarded so a partial test ctx degrades to local-only.
  const surface = ctx.taskSurface;
  const [surfaceTasks, setSurfaceTasks] = useState<readonly SharedTask[]>(() => surface?.list() ?? []);
  useEffect(() => {
    if (!surface) return;
    // Bail out when the set is unchanged so re-running this effect (e.g. when a test supplies a
    // fresh ctx/surface every render) never triggers an extra render — no setState, no loop.
    const sync = (next: readonly SharedTask[]): void =>
      setSurfaceTasks((prev) => (sameTaskList(prev, next) ? prev : next));
    sync(surface.list());
    return surface.subscribe(sync);
  }, [surface]);

  const operatorId = ctx.auth.user.employee_id;
  const operatorName = ctx.auth.user.name;

  /** Commit a new task array to both the ref (synchronous source of truth) and state. */
  const commit = useCallback((next: Task[]): void => {
    tasksRef.current = next;
    setTasksState(next);
  }, []);

  const create = useCallback(
    (input: CreateTaskInput): void => {
      setError(null);
      if (getTask(tasksRef.current, input.task_id)) return; // idempotent by id
      commit([...tasksRef.current, createTask(input, new Date().toISOString())]);
    },
    [commit]
  );

  /**
   * Run one transition with the Gate-2 fail-closed rule: validate the transition, emit the
   * Logger event first; if it throws, set the error and leave state untouched; else commit.
   */
  const runTransition = useCallback(
    (
      taskId: string,
      to: TaskStatus,
      patch: Partial<Task> = {},
      extraPayload: Record<string, unknown> = {}
    ): void => {
      setError(null);
      const task = getTask(tasksRef.current, taskId);
      if (!task) {
        setError(`AgentOS task not found: ${taskId}`);
        return;
      }
      if (!canTransition(task.status, to)) {
        setError(new TaskTransitionError(taskId, task.status, to).message);
        return;
      }

      const nowIso = new Date().toISOString();
      const human = isHumanTransition(to);
      const agentActor = task.assigned_agent_id ?? patch.assigned_agent_id ?? AGENTOS_ORCHESTRATOR;

      const event: SovereignLogEvent = {
        event_type: eventTypeForTransition(to),
        workflow_step_id: task.workflow_step_id, // Constraint #6
        sovereign_tier: "standard",
        product: "AGENTOS",
        actor_id: human ? operatorId : agentActor,
        outcome: `agentos_task_${to.toLowerCase()}`,
        payload: {
          task_id: taskId,
          from: task.status,
          to,
          requires_approval: task.requires_approval,
          data_classification: task.data_classification,
          ...extraPayload,
        },
        ...(human
          ? { actor: "human" as const, actor_name: operatorName, decision_type: decisionTypeForTransition(to) }
          : { actor: "agent" as const, agent_id: agentActor }),
      };

      // --- Gate 2 fail-closed: emit first; a failed emit blocks the transition. ---
      try {
        ctx.logger.log(event);
      } catch (err) {
        setError(transitionEmitError(to, err));
        return; // state unchanged — ungoverned transition refused
      }

      commit(transition(tasksRef.current, taskId, to, nowIso, patch));
    },
    [commit, ctx, operatorId, operatorName]
  );

  const assign = useCallback((taskId: string, agentId: string) => runTransition(taskId, "ASSIGNED", { assigned_agent_id: agentId }, { agent_id: agentId }), [runTransition]);
  const requestApproval = useCallback((taskId: string, requestId?: string) => runTransition(taskId, "PENDING_APPROVAL", {}, requestId ? { request_id: requestId } : {}), [runTransition]);
  const approve = useCallback((taskId: string) => runTransition(taskId, "APPROVED"), [runTransition]);
  const reject = useCallback((taskId: string) => runTransition(taskId, "REJECTED"), [runTransition]);
  const start = useCallback((taskId: string) => runTransition(taskId, "IN_PROGRESS"), [runTransition]);
  const complete = useCallback((taskId: string) => runTransition(taskId, "COMPLETE"), [runTransition]);
  const cancel = useCallback((taskId: string) => runTransition(taskId, "CANCELLED"), [runTransition]);
  const clearError = useCallback((): void => setError(null), []);

  // Merge local AgentOS tasks with surface-published tasks from other products. Local tasks
  // win on id collision (AgentOS owns its own task there); external tasks are appended so a
  // NEXUS-routed task is visible without being locally driveable (see Task.origin_product).
  const mergedTasks = useMemo<Task[]>(() => {
    const localIds = new Set(tasks.map((t) => t.task_id));
    const external = surfaceTasks.filter((s) => !localIds.has(s.task_id)).map(sharedToTask);
    return external.length === 0 ? tasks : [...tasks, ...external];
  }, [tasks, surfaceTasks]);

  return { tasks: mergedTasks, error, create, assign, requestApproval, approve, reject, start, complete, cancel, clearError };
}

function transitionEmitError(to: TaskStatus, err: unknown): string {
  return `Transition to ${to} Logger emit failed — task not advanced (AgentOS Gate 2): ${
    err instanceof Error ? err.message : String(err)
  }`;
}

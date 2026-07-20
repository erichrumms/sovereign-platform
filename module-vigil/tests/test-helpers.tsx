/**
 * module-vigil — component/hook-test helpers.
 * A minimal fake SovereignShellContext. hasRole() reflects the configured role
 * (NOT always-true) so the VIGIL role gate is genuinely exercised, a2a._stage is
 * configurable so the Agent Approval Queue stub can be driven across stages, and the
 * logger can capture events (logSink) or simulate a failed emit (throwOnLog) so the
 * ALERT_* / AGENT_STEP_* emission and CPMI-VRS Gate 2 paths are testable.
 */
import type {
  SovereignShellContext,
  SovereignRole,
  SovereignLogEvent,
  SharedTask,
  TaskSurface,
  WorkQueueSurface,
  WorkQueueSummary,
} from "../../sovereign-shell/shell-contract";
import type { A2AStage } from "../src/AgentApprovalQueue";
import type { SecurityAlert } from "../src/vigil-types";

/**
 * Minimal in-memory shared task surface (GD-19 ninth export) — same shape as the
 * module-agentos helper (restated; modules do not import each other's tests).
 */
export function createInMemoryTaskSurface(): TaskSurface {
  const tasks = new Map<string, SharedTask>();
  const listeners = new Set<(t: readonly SharedTask[]) => void>();
  const snapshot = (): readonly SharedTask[] => Array.from(tasks.values());
  const notify = (): void => {
    for (const l of listeners) l(snapshot());
  };
  return {
    publish: (task) => {
      tasks.set(task.task_id, task);
      notify();
    },
    update: (id, patch) => {
      const t = tasks.get(id);
      if (!t) return;
      tasks.set(id, { ...t, ...patch, task_id: id });
      notify();
    },
    list: () => snapshot(),
    get: (id) => tasks.get(id),
    subscribe: (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}

/** Build a SecurityAlert for tests, with sensible defaults. */
export function makeAlert(over: Partial<SecurityAlert> = {}): SecurityAlert {
  return {
    alertId: over.alertId ?? "ALERT-1",
    alertLevel: over.alertLevel ?? "P2",
    alertType: over.alertType ?? "ANOMALY_DETECTED",
    sourceProduct: over.sourceProduct ?? "APEX",
    agentId: over.agentId,
    timestamp: over.timestamp ?? "2026-06-18T12:00:00.000Z",
    rawEvent: over.rawEvent ?? { event_type: "ANOMALY_DETECTED" },
    status: over.status ?? "UNACKNOWLEDGED",
  };
}

/** Minimal no-op WorkQueueSurface (GD-24 twelfth export) for component tests. */
export function createNoopWorkQueueSurface(): WorkQueueSurface {
  const queues = new Map<string, WorkQueueSummary>();
  const listeners = new Set<(s: readonly WorkQueueSummary[]) => void>();
  const snapshot = (): readonly WorkQueueSummary[] => Array.from(queues.values());
  const notify = (): void => { for (const l of listeners) l(snapshot()); };
  return {
    publish: (s) => { queues.set(`${s.module_id}::${s.queue_label}`, s); notify(); },
    listForModule: (id) => snapshot().filter(s => s.module_id === id),
    list: () => snapshot(),
    subscribe: (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
  };
}

export interface CtxOverrides {
  role?: SovereignRole;
  a2aStage?: A2AStage;
  /** When provided, every logged event is pushed here (assertion sink). */
  logSink?: SovereignLogEvent[];
  /** When true, ctx.logger.log throws — exercises the Gate 2 failure path. */
  throwOnLog?: boolean;
  /** Shared task surface (GD-19). Defaults to an in-memory one; pass null-ish via omission. */
  taskSurface?: TaskSurface;
}

export function makeCtx(over: CtxOverrides = {}): SovereignShellContext {
  const role: SovereignRole = over.role ?? "PLATFORM_ADMIN";
  return {
    taskSurface: over.taskSurface ?? createInMemoryTaskSurface(),
    workQueueSurface: createNoopWorkQueueSurface(),
    auth: {
      user: {
        employee_id: "E-900",
        name: "Pat Operator",
        org_unit: "Platform Ops",
        role,
        clearance_level: "CUI",
        cost_code_assignments: [],
      },
      token: "test-token",
      signOut: () => {},
      hasRole: (r: SovereignRole) => r === role,
      hasClearance: () => true,
    },
    logger: {
      log: (event: SovereignLogEvent) => {
        if (over.throwOnLog) throw new Error("simulated logger failure");
        over.logSink?.push(event);
      },
    },
    navigation: { navigateTo: () => {}, currentPath: "/vigil", breadcrumb: [] },
    a2a: { _stage: over.a2aStage ?? "DEFINED", listAgents: () => [] },
  } as unknown as SovereignShellContext;
}

/**
 * module-agentos — component/hook-test helpers.
 * A minimal fake SovereignShellContext. hasRole() reflects the configured role (NOT
 * always-true) so the AgentOS role gate is genuinely exercised. The logger can capture
 * events (logSink) or simulate a failed emit (throwOnLog) so the GD-9 AGENTOS_* emission
 * and the Gate-2 fail-closed path are testable.
 */
import type {
  SovereignShellContext,
  SovereignRole,
  SovereignLogEvent,
  SharedTask,
  TaskSurface,
} from "../../sovereign-shell/shell-contract";

/** A minimal in-memory TaskSurface for tests — same semantics as the shell's ShellTaskSurface. */
export function createInMemoryTaskSurface(): TaskSurface {
  const tasks = new Map<string, SharedTask>();
  const listeners = new Set<(t: readonly SharedTask[]) => void>();
  const snapshot = (): readonly SharedTask[] => Array.from(tasks.values());
  const notify = (): void => { for (const l of listeners) l(snapshot()); };
  return {
    publish: (task) => { tasks.set(task.task_id, task); notify(); },
    update: (id, patch) => { const t = tasks.get(id); if (!t) return; tasks.set(id, { ...t, ...patch, task_id: id }); notify(); },
    list: () => snapshot(),
    get: (id) => tasks.get(id),
    subscribe: (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
  };
}

export interface CtxOverrides {
  role?: SovereignRole;
  /** When provided, every logged event is pushed here (assertion sink). */
  logSink?: SovereignLogEvent[];
  /** When true, ctx.logger.log throws — exercises the Gate-2 failure path. */
  throwOnLog?: boolean;
  /** Inject a shared task surface (e.g. to share one across two ctxs). Defaults to a fresh one. */
  taskSurface?: TaskSurface;
}

export function makeCtx(over: CtxOverrides = {}): SovereignShellContext {
  const role: SovereignRole = over.role ?? "PLATFORM_ADMIN";
  const taskSurface = over.taskSurface ?? createInMemoryTaskSurface();
  return {
    taskSurface,
    auth: {
      user: {
        employee_id: "E-700",
        name: "Pat Orchestrator",
        org_unit: "Platform Operations",
        role,
        clearance_level: "UNCLASSIFIED",
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
    governance: {
      cpmiStatus: { overall: "GREEN", products: [], last_updated: "2026-06-24T00:00:00.000Z", pending_gate3_reviews: 0 },
      vrsGates: [],
      isOnHold: () => false,
    },
    navigation: { navigateTo: () => {}, currentPath: "/agentos", breadcrumb: [] },
  } as unknown as SovereignShellContext;
}

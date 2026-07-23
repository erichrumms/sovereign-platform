/**
 * module-workspace — component-test helpers.
 * A minimal fake SovereignShellContext. hasRole() reflects the configured role
 * (NOT always-true) so the module gate and the per-section gates are genuinely
 * exercised. Provides a REAL in-memory ReviewerWorkspaceSurface (the surface under
 * test), a real in-memory ctx.aria (the embedded ClearCertificationQueue records
 * decisions to it), and a task surface (TTManagerReview's VIGIL-authorization hook
 * subscribes to it). Cast through `unknown` like the other module helpers.
 */
import type {
  SovereignShellContext,
  SovereignRole,
  SovereignLogEvent,
  AriaCertification,
  SharedTask,
  TaskSurface,
  ReviewerWorkspaceSurface,
  WorkspaceReviewItem,
  WorkQueueSurface,
  WorkQueueSummary,
} from "../../sovereign-shell/shell-contract";

/** A real in-memory ReviewerWorkspaceSurface (GD-25 thirteenth export — the surface under test). */
export function createInMemoryReviewerWorkspaceSurface(): ReviewerWorkspaceSurface {
  const items = new Map<string, WorkspaceReviewItem>();
  const listeners = new Set<(i: readonly WorkspaceReviewItem[]) => void>();
  const snapshot = (): readonly WorkspaceReviewItem[] => Array.from(items.values());
  const notify = (): void => { for (const l of listeners) l(snapshot()); };
  return {
    publish: (item) => { items.set(`${item.module_id}::${item.item_id}`, item); notify(); },
    remove: (module_id, item_id) => { if (items.delete(`${module_id}::${item_id}`)) notify(); },
    listForModule: (id) => snapshot().filter(i => i.module_id === id),
    list: () => snapshot(),
    subscribe: (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
  };
}

/** A real in-memory ctx.aria surface (GD-20) — the embedded CLEAR queue records to it. */
export function makeAriaSurface() {
  const certs = new Map<string, AriaCertification>();
  const listeners = new Set<(c: readonly AriaCertification[]) => void>();
  const snapshot = () => Array.from(certs.values());
  const notify = () => listeners.forEach((l) => l(snapshot()));
  return {
    record: (c: AriaCertification) => { certs.set(c.document_id, c); notify(); },
    isCertified: (id: string) => certs.get(id)?.certified === true,
    get: (id: string) => certs.get(id),
    list: () => snapshot(),
    subscribe: (l: (c: readonly AriaCertification[]) => void) => { listeners.add(l); return () => { listeners.delete(l); }; },
  };
}

/** Real in-memory WorkQueueSurface — D3 (WG-16) effects publish updated counts to it. */
export function createInMemoryWorkQueueSurface(): WorkQueueSurface {
  const summaries = new Map<string, WorkQueueSummary>();
  const listeners = new Set<(s: readonly WorkQueueSummary[]) => void>();
  const key = (s: WorkQueueSummary): string => `${s.module_id}::${s.queue_label}`;
  const snapshot = (): readonly WorkQueueSummary[] => Array.from(summaries.values());
  const notify = (): void => { for (const l of listeners) l(snapshot()); };
  return {
    publish: (s) => { summaries.set(key(s), s); notify(); },
    listForModule: (id) => snapshot().filter((s) => s.module_id === id),
    list: () => snapshot(),
    subscribe: (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
  };
}

/** Minimal in-memory shared task surface (GD-19) — TTManagerReview's authorization hook reads it. */
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
  /** Shared ReviewerWorkspaceSurface — pass one to publish before rendering. */
  reviewerWorkspaceSurface?: ReviewerWorkspaceSurface;
}

export function makeCtx(over: CtxOverrides = {}): SovereignShellContext {
  const role: SovereignRole = over.role ?? "SYSTEM_ADMIN";
  return {
    reviewerWorkspaceSurface: over.reviewerWorkspaceSurface ?? createInMemoryReviewerWorkspaceSurface(),
    workQueueSurface: createInMemoryWorkQueueSurface(),
    aria: makeAriaSurface(),
    taskSurface: createInMemoryTaskSurface(),
    auth: {
      user: {
        employee_id: "E-950",
        name: "Riley Reviewer",
        org_unit: "Program Office",
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
        over.logSink?.push(event);
      },
    },
    navigation: { navigateTo: () => {}, currentPath: "/workspace", breadcrumb: [] },
  } as unknown as SovereignShellContext;
}

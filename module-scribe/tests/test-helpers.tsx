/**
 * module-scribe — component-test helpers.
 * A minimal fake SovereignShellContext (the fields the SCRIBE UI reads: auth.user,
 * logger.log, navigation.navigateTo) cast to the contract type. Tests may inject a
 * logger and a navigateTo spy to assert Gate 2 emission and export routing.
 */
import { validateStyleProfile } from "@sovereign/data";
import type {
  SovereignShellContext,
  SovereignLogEvent,
  SovereignRole,
  AriaCertification,
  SharedTask,
  TaskSurface,
  WorkQueueSurface,
  WorkQueueSummary,
  ReviewerWorkspaceSurface,
  WorkspaceReviewItem,
} from "../../sovereign-shell/shell-contract";

/**
 * Minimal in-memory shared task surface (GD-19 ninth export) — same shape as the
 * module-agentos helper (restated; modules do not import each other's tests).
 * Session 35: lets TTManagerReview tests drive a live VIGIL authorization.
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

/** Minimal in-memory WorkQueueSurface (GD-24 twelfth export) for component tests. */
function createNoopWorkQueueSurface(): WorkQueueSurface {
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

/** Minimal in-memory ReviewerWorkspaceSurface (GD-25 thirteenth export) for component tests. */
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

export interface CtxOverrides {
  role?: SovereignRole;
  log?: (event: SovereignLogEvent) => void;
  navigateTo?: (path: string) => void;
  /** Document ids to pre-seed as CLEAR-certified on the ctx.aria surface (GD-20 export gate). */
  certifiedDocumentIds?: string[];
  /** Shared task surface (GD-19). Defaults to an in-memory one. */
  taskSurface?: TaskSurface;
}

export function makeCtx(over: CtxOverrides = {}): SovereignShellContext {
  // Minimal in-memory CLEAR certification surface (ctx.aria — tenth shell export, GD-20),
  // pre-seeded with any certified document ids the test supplies.
  const certs = new Map<string, AriaCertification>();
  for (const id of over.certifiedDocumentIds ?? []) {
    certs.set(id, {
      document_id: id,
      certified: true,
      certifying_actor_id: "E-900",
      certifying_actor_name: "Robin Compliance",
      decision_note: "Certified for test fixture.",
      applicable_sources: [],
      workflow_step_id: `aria-clear-${id}`,
      certified_at: "2026-06-29T00:00:00.000Z",
    });
  }
  const aria = {
    record: (c: AriaCertification) => { certs.set(c.document_id, c); },
    isCertified: (id: string) => certs.get(id)?.certified === true,
    get: (id: string) => certs.get(id),
    list: () => Array.from(certs.values()),
    subscribe: () => () => {},
  };

  return {
    aria,
    taskSurface: over.taskSurface ?? createInMemoryTaskSurface(),
    workQueueSurface: createNoopWorkQueueSurface(),
    reviewerWorkspaceSurface: createInMemoryReviewerWorkspaceSurface(),
    auth: {
      user: {
        employee_id: "E-700",
        name: "Sam Author",
        org_unit: "Program Office",
        role: over.role ?? "PROGRAM_MANAGER",
        clearance_level: "CUI",
        cost_code_assignments: [],
      },
      token: "test-token",
      signOut: () => {},
      hasRole: () => true,
      hasClearance: () => true,
    },
    logger: { log: over.log ?? (() => {}) },
    navigation: {
      navigateTo: over.navigateTo ?? (() => {}),
      currentPath: "/scribe",
      breadcrumb: [],
    },
    // Mirrors the shell's frozen ctx.data.types validator catalog (shell.ts) — so
    // Style DNA can validate the StyleProfile "via ctx.data" under test.
    data: { types: { validateStyleProfile } },
  } as unknown as SovereignShellContext;
}

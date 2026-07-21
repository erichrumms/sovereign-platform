/**
 * module-aria — component-test helpers.
 * A minimal fake SovereignShellContext. hasRole() reflects the configured role (NOT always-true)
 * so the ARIA PLATFORM_ADMIN gate is genuinely exercised. The default user is a PLATFORM_ADMIN —
 * ARIA's minimumRole (docs/16 §9). CLEAR (S23) reads and writes ctx.aria (the tenth shell export,
 * GD-20), so this helper provides a real in-memory AriaCertificationSurface. The partial ctx is
 * cast through `unknown` like the other module helpers.
 */
import type {
  SovereignShellContext,
  SovereignRole,
  SovereignLogEvent,
  AriaCertification,
  WorkQueueSurface,
  WorkQueueSummary,
  ReviewerWorkspaceSurface,
  WorkspaceReviewItem,
} from "../../sovereign-shell/shell-contract";

export interface CtxOverrides {
  role?: SovereignRole;
  name?: string;
  /** When provided, every logged event is pushed here (assertion sink). */
  logSink?: SovereignLogEvent[];
}

/** A real in-memory ctx.aria surface (mirrors ShellAriaSurface) so CLEAR can be exercised under test. */
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

export function makeCtx(over: CtxOverrides = {}): SovereignShellContext {
  const role: SovereignRole = over.role ?? "PLATFORM_ADMIN";
  return {
    aria: makeAriaSurface(),
    workQueueSurface: createNoopWorkQueueSurface(),
    reviewerWorkspaceSurface: createInMemoryReviewerWorkspaceSurface(),
    auth: {
      user: {
        employee_id: "E-900",
        name: over.name ?? "Robin Compliance",
        org_unit: "Compliance Office",
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
        over.logSink?.push(event);
      },
    },
    governance: {
      cpmiStatus: { overall: "GREEN", products: [], last_updated: "2026-06-29T00:00:00.000Z", pending_gate3_reviews: 0 },
      vrsGates: [],
      isOnHold: () => false,
    },
    navigation: { navigateTo: () => {}, currentPath: "/aria", breadcrumb: [] },
  } as unknown as SovereignShellContext;
}

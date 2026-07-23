/**
 * e2e — pipeline harness.
 *
 * Wires the REAL module hooks into one pipeline driven by a single shared SovereignShellContext
 * (so one logSink captures every Logger event across NEXUS, AgentOS, and the AgentOS↔VIGIL
 * approval channel):
 *   - NEXUS:   useRequestRegistry (work-request lifecycle) + its AgentOS hand-off port.
 *   - AgentOS: useTaskRegistry (task lifecycle) + useAgentDispatcher (the AgentOS approval port
 *              VIGIL reads — "VIGIL receives the request" = it is in dispatcher.pendingRequests();
 *              "VIGIL approves/rejects" = dispatcher.recordDecision()).
 *
 * The hooks' registries are ref-backed, so a scenario can step the pipeline synchronously.
 */
import { useMemo } from "react";

import type {
  SovereignShellContext,
  SovereignRole,
  SovereignLogEvent,
  SharedTask,
  TaskSurface,
  ProgramStatusSnapshot,
  ProgramStatusSurface,
  WorkQueueSurface,
  WorkQueueSummary,
  ReviewerWorkspaceSurface,
  WorkspaceReviewItem,
  AriaCertification,
  AriaCertificationSurface,
} from "../../sovereign-shell/shell-contract";

import { useRequestRegistry } from "../../module-nexus/src/useRequestRegistry";
import { createSyntheticAgentOSPort } from "../../module-nexus/src/agentos-port";
import { useTaskRegistry } from "../../module-agentos/src/useTaskRegistry";
import { useAgentDispatcher } from "../../module-agentos/src/useAgentDispatcher";
import { createAgentOSBackedPort, type AgentOSBackedPort } from "../../module-agentos/src/nexus-agentos-port";
import { createSyntheticApexDataAdapter, type ApexDataAdapter } from "../../module-apex/src/apex-data-adapter";

/** A minimal in-memory WorkQueueSurface (GD-24 twelfth export) for convergence tests. */
export function createInMemoryWorkQueueSurface(): WorkQueueSurface {
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

/** A minimal in-memory ReviewerWorkspaceSurface (GD-25 thirteenth export) for convergence tests. */
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

/** A minimal in-memory AriaCertificationSurface (GD-20 tenth export) — the embedded CLEAR queue records to it. */
export function createInMemoryAriaSurface(): AriaCertificationSurface {
  const certs = new Map<string, AriaCertification>();
  const listeners = new Set<(c: readonly AriaCertification[]) => void>();
  const snapshot = (): readonly AriaCertification[] => Array.from(certs.values());
  const notify = (): void => { for (const l of listeners) l(snapshot()); };
  return {
    record: (c) => { certs.set(c.document_id, c); notify(); },
    isCertified: (id) => certs.get(id)?.certified === true,
    get: (id) => certs.get(id),
    list: () => snapshot(),
    subscribe: (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
  };
}

/** A minimal in-memory ProgramStatusSurface (GD-23 eleventh export) for convergence tests. */
function createInMemoryProgramStatusSurface(): ProgramStatusSurface {
  const statuses = new Map<string, ProgramStatusSnapshot>();
  const listeners = new Set<(s: readonly ProgramStatusSnapshot[]) => void>();
  const snapshot = (): readonly ProgramStatusSnapshot[] => Array.from(statuses.values());
  const notify = (): void => { for (const l of listeners) l(snapshot()); };
  return {
    publish: (status) => { statuses.set(status.program_id, status); notify(); },
    get: (id) => statuses.get(id),
    list: () => snapshot(),
    subscribe: (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
  };
}

/** A minimal in-memory TaskSurface (GD-19 ninth export) so the live AgentOS-backed port publishes. */
function createInMemoryTaskSurface(): TaskSurface {
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

export function makeCtx(logSink: SovereignLogEvent[]): SovereignShellContext {
  const role: SovereignRole = "SYSTEM_ADMIN";
  return {
    taskSurface: createInMemoryTaskSurface(),
    programStatusSurface: createInMemoryProgramStatusSurface(),
    workQueueSurface: createInMemoryWorkQueueSurface(),
    reviewerWorkspaceSurface: createInMemoryReviewerWorkspaceSurface(),
    aria: createInMemoryAriaSurface(),
    auth: {
      user: { employee_id: "E-001", name: "E2E Operator", org_unit: "Platform", role, clearance_level: "UNCLASSIFIED", cost_code_assignments: [] },
      token: "test-token",
      signOut: () => {},
      hasRole: (r: SovereignRole) => r === role,
      hasClearance: () => true,
    },
    logger: { log: (event: SovereignLogEvent) => { logSink.push(event); }, getEntries: () => logSink },
    governance: {
      cpmiStatus: { overall: "GREEN", products: [], last_updated: "2026-06-24T00:00:00.000Z", pending_gate3_reviews: 0 },
      vrsGates: [],
      isOnHold: () => false,
    },
    navigation: { navigateTo: () => {}, currentPath: "/", breadcrumb: [] },
  } as unknown as SovereignShellContext;
}

export interface Pipeline {
  nexus: ReturnType<typeof useRequestRegistry>;
  tasks: ReturnType<typeof useTaskRegistry>;
  dispatcher: ReturnType<typeof useAgentDispatcher>;
  /** Walkthrough B (Session 18) — a second NEXUS registry driven by the LIVE AgentOS-backed
   *  port (D3), so a scenario can exercise the real NEXUS → AgentOS hand-off. Additive: the
   *  existing four scenarios use `nexus` (synthetic) and never touch these. */
  nexusLive: ReturnType<typeof useRequestRegistry>;
  livePort: AgentOSBackedPort;
  /** APEX synthetic World Model adapter — the portfolio program data a reviewer sees. */
  apex: ApexDataAdapter;
}

export function usePipeline(ctx: SovereignShellContext): Pipeline {
  const nexusPort = useMemo(() => createSyntheticAgentOSPort(), []);
  const nexus = useRequestRegistry(ctx, nexusPort);
  const tasks = useTaskRegistry(ctx);
  const dispatcher = useAgentDispatcher();
  // Live NEXUS → AgentOS hand-off path (D3). Captures the first ctx (its logger writes to the
  // same shared logSink) and stays stable across renders, mirroring the synthetic port above.
  const livePort = useMemo(() => createAgentOSBackedPort(ctx), []); // eslint-disable-line react-hooks/exhaustive-deps
  const nexusLive = useRequestRegistry(ctx, livePort);
  const apex = useMemo(() => createSyntheticApexDataAdapter(), []);
  return { nexus, tasks, dispatcher, nexusLive, livePort, apex };
}

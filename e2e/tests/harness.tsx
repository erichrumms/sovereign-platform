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
} from "../../sovereign-shell/shell-contract";

import { useRequestRegistry } from "../../module-nexus/src/useRequestRegistry";
import { createSyntheticAgentOSPort } from "../../module-nexus/src/agentos-port";
import { useTaskRegistry } from "../../module-agentos/src/useTaskRegistry";
import { useAgentDispatcher } from "../../module-agentos/src/useAgentDispatcher";

export function makeCtx(logSink: SovereignLogEvent[]): SovereignShellContext {
  const role: SovereignRole = "SYSTEM_ADMIN";
  return {
    auth: {
      user: { employee_id: "E-001", name: "E2E Operator", org_unit: "Platform", role, clearance_level: "UNCLASSIFIED", cost_code_assignments: [] },
      token: "test-token",
      signOut: () => {},
      hasRole: (r: SovereignRole) => r === role,
      hasClearance: () => true,
    },
    logger: { log: (event: SovereignLogEvent) => { logSink.push(event); } },
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
}

export function usePipeline(ctx: SovereignShellContext): Pipeline {
  const nexusPort = useMemo(() => createSyntheticAgentOSPort(), []);
  const nexus = useRequestRegistry(ctx, nexusPort);
  const tasks = useTaskRegistry(ctx);
  const dispatcher = useAgentDispatcher();
  return { nexus, tasks, dispatcher };
}

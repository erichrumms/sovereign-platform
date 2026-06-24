/**
 * SOVEREIGN Platform — module-agentos
 * AgentOS — agent orchestration + MLOps backbone (the platform execution layer).
 *
 * Pipeline role (spec §2): sits between CPMI (governance) and the execution products
 * (NEXUS / APEX). Embeds the Security Framework + CPMI-VRS; routes agent approval requests
 * to VIGIL. Session 14 SCOPE — D2: the module's SovereignModuleContract plus the task
 * lifecycle core (registry state machine, synthetic dispatcher, and the AgentOS-side VIGIL
 * approval port that closes the Session 10 loop). Real agent execution, A2A message passing,
 * and evaluate.py integration are future work (spec §7).
 *
 * ROLE GATE (orchestration backbone — conservative, fail-closed): minimumRole
 *   "PLATFORM_ADMIN". AgentOS orchestrates agents across products and routes human
 *   authorizations, so access is restricted to PLATFORM_ADMIN / SYSTEM_ADMIN via the
 *   loader's fail-closed default policy, with a structural mount-gate as defense in depth
 *   (same pattern as CPMI / VIGIL). The authoritative role→module matrix (Decision 24)
 *   remains open; this is the least-privilege default, relaxable by configuration.
 *
 * AGENT CARDS (Constraint #10 — no self-registration): empty this session. AgentOS's
 *   orchestrator agents are NOT yet in Agent_Identity_Standard.md; Claude Code does not
 *   self-register agents. The dispatcher's synthetic roster (agent-dispatcher.ts) is dev
 *   dispatch-target data, not platform agent registration. When AgentOS orchestrator agents
 *   are entered in the registry by governance, their AgentCards are added here.
 *
 * GOVERNANCE: module-agentos → AGENTOS is already in the ModuleLoader's MODULE_PRODUCT map
 *   and the SovereignProduct union. No Logger event on mount (no approved "module mounted"
 *   event type).
 *
 * Version: 1.0 (AgentOS scaffold + task lifecycle core) · Session 14 · June 24, 2026
 */

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import type {
  SovereignModuleContract,
  SovereignShellContext,
  AgentCard,
} from "../../sovereign-shell/shell-contract";
import { ModuleAccessDeniedError } from "../../sovereign-shell/src/module-loader";
import { AgentOSApp } from "./AgentOSApp";

const AGENTOS_MINIMUM_ROLE = "PLATFORM_ADMIN" as const;

// No platform agents are registered this session (Constraint #10 — see header).
const AGENTOS_AGENT_CARDS: AgentCard[] = [];

/** The React root this module last mounted, so unmount() can dispose it. */
let root: Root | null = null;

export const agentosModule: SovereignModuleContract = {
  moduleId: "module-agentos",
  mountPath: "/agentos",
  displayName: "AgentOS",
  minimumRole: AGENTOS_MINIMUM_ROLE,
  agentCards: AGENTOS_AGENT_CARDS,

  mount: (ctx: SovereignShellContext, el: HTMLElement): void => {
    // --- Structural role gate: throw before building the tree (defense in depth). ---
    if (!ctx.auth.hasRole("PLATFORM_ADMIN") && !ctx.auth.hasRole("SYSTEM_ADMIN")) {
      throw new ModuleAccessDeniedError("module-agentos", ctx.auth.user.role, AGENTOS_MINIMUM_ROLE);
    }
    root = createRoot(el);
    root.render(createElement(AgentOSApp, { ctx }));
  },

  unmount: (): void => {
    root?.unmount();
    root = null;
  },

  healthCheck: async () => {
    // AgentOS has no live orchestration yet (Governance Clock OFF). Honest NOT_STARTED.
    return { status: "HEALTHY", vrs_gate: "NOT_STARTED" };
  },
};

export default agentosModule;

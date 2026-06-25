/**
 * SOVEREIGN Platform — module-nexus
 * NEXUS — work-request intake, routing, and execution hand-off to AgentOS.
 *
 * Pipeline role: NEXUS is the operator-facing intake surface for platform work. It routes
 * each request to an AI agent class, enforces the GD-10 classification boundary at intake,
 * and hands execution to AgentOS (which runs the governed agents and the VIGIL approval
 * queue). Session 15 SCOPE — D2: the module's SovereignModuleContract plus the work-request
 * lifecycle core (registry state machine, router, and the injectable AgentOS port). Real
 * agent execution and the live AgentOS backing are future work.
 *
 * ROLE GATE (operator surface — conservative, fail-closed): minimumRole "AGENT_OPERATOR".
 *   The role taxonomy has no "OPERATOR"; AGENT_OPERATOR is the nearest existing role (no new
 *   role invented — opening prompt / Constraint #2). The loader's fail-closed default policy
 *   then admits AGENT_OPERATOR or SYSTEM_ADMIN, with a structural mount-gate as defense in
 *   depth. The authoritative role→module matrix (Decision 24) remains open.
 *
 * AGENT CARDS: empty this session. NEXUS does not own platform agents — it routes work to
 *   AgentOS-orchestrated agent CLASSES. No agent is registered here (Constraint #10).
 *
 * GOVERNANCE: module-nexus → NEXUS is already in the ModuleLoader's MODULE_PRODUCT map and
 *   the SovereignProduct union. No Logger event on mount.
 *
 * Version: 1.0 (NEXUS scaffold + work-request lifecycle core) · Session 15 · June 24, 2026
 */

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import type {
  SovereignModuleContract,
  SovereignShellContext,
  AgentCard,
} from "../../sovereign-shell/shell-contract";
import { ModuleAccessDeniedError } from "../../sovereign-shell/src/module-loader";
import { NexusApp } from "./NexusApp";

const NEXUS_MINIMUM_ROLE = "AGENT_OPERATOR" as const;

// NEXUS routes work to AgentOS-orchestrated agent classes; it registers no platform agents.
const NEXUS_AGENT_CARDS: AgentCard[] = [];

/** The React root this module last mounted, so unmount() can dispose it. */
let root: Root | null = null;

export const nexusModule: SovereignModuleContract = {
  moduleId: "module-nexus",
  mountPath: "/nexus",
  displayName: "NEXUS",
  minimumRole: NEXUS_MINIMUM_ROLE,
  agentCards: NEXUS_AGENT_CARDS,

  mount: (ctx: SovereignShellContext, el: HTMLElement): void => {
    // --- Structural role gate: throw before building the tree (defense in depth). ---
    if (!ctx.auth.hasRole("AGENT_OPERATOR") && !ctx.auth.hasRole("SYSTEM_ADMIN")) {
      throw new ModuleAccessDeniedError("module-nexus", ctx.auth.user.role, NEXUS_MINIMUM_ROLE);
    }
    root = createRoot(el);
    root.render(createElement(NexusApp, { ctx }));
  },

  unmount: (): void => {
    root?.unmount();
    root = null;
  },

  healthCheck: async () => {
    // NEXUS has no live execution yet (Governance Clock OFF). Honest NOT_STARTED.
    return { status: "HEALTHY", vrs_gate: "NOT_STARTED" };
  },
};

export default nexusModule;

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
 * AGENT CARDS (Constraint #10): the three AgentOS orchestrator agents
 *   (agentos.deployer / .exporter / .configurator), registered in
 *   Agent_Identity_Standard.md v1.3 as class "Orchestration" and activated here in
 *   Session 16 (D2), after GD-12 added "Orchestration" to the shell-contract AgentClass
 *   union (D1). They route/assign tasks and submit approvals to VIGIL; they use no AI
 *   reasoning prompt. The dispatcher's synthetic roster (agent-dispatcher.ts) remains
 *   separate dev dispatch-target data, distinct from these registered agents.
 *
 * GOVERNANCE: module-agentos → AGENTOS is already in the ModuleLoader's MODULE_PRODUCT map
 *   and the SovereignProduct union. No Logger event on mount (no approved "module mounted"
 *   event type).
 *
 * Version: 1.1 (orchestrator AgentCards) · Session 16 · June 24, 2026
 */

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import type {
  SovereignModuleContract,
  SovereignShellContext,
  SovereignRole,
  AgentCard,
} from "../../sovereign-shell/shell-contract";
import { ModuleAccessDeniedError } from "../../sovereign-shell/src/module-loader";
import { AgentOSApp } from "./AgentOSApp";

// GD-22 / SOVEREIGN_Role_Access_Matrix_20260718.md: AgentOS unchanged — admin-only
// (orchestration backbone; routes human authorizations and manages agent lifecycle).
const AGENTOS_MINIMUM_ROLES: SovereignRole[] = ["PLATFORM_ADMIN", "SYSTEM_ADMIN"];

// AgentOS orchestrator agents (Session 16, D2). Registered in Agent_Identity_Standard.md
// v1.3 as class "Orchestration" (added to the shell-contract AgentClass union in GD-12 / D1).
// They route and assign tasks and submit approval requests to VIGIL — they do NOT execute
// tasks directly (orchestrator scope limit). No AI reasoning prompt (routing logic only),
// so no PR-* binding. data_classification_ceiling is UNCLASSIFIED (GD-10 — the platform
// processes UNCLASSIFIED only). approval_behavior ACKNOWLEDGE_AND_CONTINUE (the platform
// default; orchestrators resume from a paused state after a human authorization).
function orchestratorCard(agentId: string, orchestrationCapability: string): AgentCard {
  return {
    agent_id: agentId,
    agent_class: "Orchestration",
    product: "AGENTOS",
    capabilities: ["task_routing", "task_assignment", orchestrationCapability, "vigil_approval_submission"],
    input_schema: {},
    output_schema: {},
    task_lifecycle_contract: {
      supports_long_running: true,
      approval_behavior: "ACKNOWLEDGE_AND_CONTINUE",
      partial_failure_behavior: "ESCALATE",
    },
    data_classification_ceiling: "UNCLASSIFIED",
    security_observable: true,
  };
}

const AGENTOS_AGENT_CARDS: AgentCard[] = [
  orchestratorCard("agentos.deployer", "deployment_orchestration"),
  orchestratorCard("agentos.exporter", "data_export_orchestration"),
  orchestratorCard("agentos.configurator", "configuration_orchestration"),
];

/** The React root this module last mounted, so unmount() can dispose it. */
let root: Root | null = null;

export const agentosModule: SovereignModuleContract = {
  moduleId: "module-agentos",
  mountPath: "/agentos",
  displayName: "AgentOS",
  minimumRole: AGENTOS_MINIMUM_ROLES,
  agentCards: AGENTOS_AGENT_CARDS,

  mount: (ctx: SovereignShellContext, el: HTMLElement): void => {
    // --- Structural role gate: throw before building the tree (defense in depth). ---
    if (!AGENTOS_MINIMUM_ROLES.some((r) => ctx.auth.hasRole(r))) {
      throw new ModuleAccessDeniedError("module-agentos", ctx.auth.user.role, AGENTOS_MINIMUM_ROLES);
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

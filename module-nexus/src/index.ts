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
  SovereignRole,
  AgentCard,
} from "../../sovereign-shell/shell-contract";
import { ModuleAccessDeniedError } from "../../sovereign-shell/src/module-loader";
import { NexusApp } from "./NexusApp";

// GD-22 / SOVEREIGN_Role_Access_Matrix_20260718.md: NEXUS admits operators, program
// managers, compliance officers, and admins — anyone who submits or oversees work requests.
const NEXUS_MINIMUM_ROLES: SovereignRole[] = [
  "PLATFORM_ADMIN",
  "SYSTEM_ADMIN",
  "AGENT_OPERATOR",
  "PROGRAM_MANAGER",
  "COMPLIANCE_OFFICER",
];

// NEXUS's own routing runs through AgentOS-orchestrated agent classes (no native NEXUS
// cards yet — the implemented-but-not-carded native agents are tracked as finding F-2).
// Session 27 adds the two Time & Travel workflow-layer agents that RUN ON NEXUS
// infrastructure (docs/17 §2 — no new module directory; AIS D-TT5). Both are
// deterministic: no LLM, no sovereign-api-client. product is the HOST product — the
// workflow layer is not a SovereignProduct (docs/17 §2), so cards carry "NEXUS".

// tt.travel-compliance-engine — Governance, deterministic. Evaluates TravelRequests
// against the active TravelPolicy; produces STANDARD/FLAGGED/ESCALATE findings.
// Evaluates and routes only — approval/denial is always a human decision.
const ttTravelComplianceEngineCard: AgentCard = {
  agent_id: "tt.travel-compliance-engine",
  agent_class: "Governance",
  product: "NEXUS",
  capabilities: ["travel_policy_evaluation", "routing_recommendation", "compliance_finding"],
  input_schema: {},
  output_schema: {},
  task_lifecycle_contract: {
    supports_long_running: false,
    approval_behavior: "ACKNOWLEDGE_AND_CONTINUE", // platform default (AIS Session 1)
    partial_failure_behavior: "ESCALATE",
  },
  data_classification_ceiling: "UNCLASSIFIED", // GD-10
  security_observable: true,
};

// tt.travel-router — Operational, deterministic. Executes the engine's routing in
// NEXUS; structurally cannot route below the authority the engine specifies.
const ttTravelRouterCard: AgentCard = {
  agent_id: "tt.travel-router",
  agent_class: "Operational",
  product: "NEXUS",
  capabilities: ["authority_queue_routing", "request_status_update"],
  input_schema: {},
  output_schema: {},
  task_lifecycle_contract: {
    supports_long_running: false,
    approval_behavior: "ACKNOWLEDGE_AND_CONTINUE",
    partial_failure_behavior: "ESCALATE",
  },
  data_classification_ceiling: "UNCLASSIFIED",
  security_observable: true,
};

// ppbe-coordination-assistant — PPBE workflow-layer agent hosted on NEXUS/VIGIL
// infrastructure (Session 32, docs/18 §7.2 — D-P6: no new module directory; AIS
// D-P5; moved from Session 31 per that session's Project Principal decision #1).
// Operational, LLM-backed under the PENDING ppbe/prompts/coordination_system.md
// prompt (synthetic-data use only until approved; registry's prompt requirement
// overrides docs/18 §5's "inferred no"). Tracks action items, commitments, and
// governance-calendar obligations; routes coordination failures to VIGIL as
// PPBE_ANOMALY findings. NEVER sends communications; the only close path
// requires a human operator and a successful Logger emit.
const ppbeCoordinationAssistantCard: AgentCard = {
  agent_id: "ppbe-coordination-assistant",
  agent_class: "Operational",
  product: "NEXUS",
  capabilities: [
    "action_item_tracking",
    "governance_calendar_monitoring",
    "coordination_failure_routing",
    "natural_language_coordination_tracking",
  ],
  input_schema: {},
  output_schema: {},
  task_lifecycle_contract: {
    supports_long_running: false,
    approval_behavior: "ACKNOWLEDGE_AND_CONTINUE",
    partial_failure_behavior: "ESCALATE",
  },
  data_classification_ceiling: "UNCLASSIFIED",
  security_observable: true,
};

const NEXUS_AGENT_CARDS: AgentCard[] = [
  ttTravelComplianceEngineCard,
  ttTravelRouterCard,
  ppbeCoordinationAssistantCard,
];

/** The React root this module last mounted, so unmount() can dispose it. */
let root: Root | null = null;

export const nexusModule: SovereignModuleContract = {
  moduleId: "module-nexus",
  mountPath: "/nexus",
  displayName: "NEXUS",
  minimumRole: NEXUS_MINIMUM_ROLES,
  agentCards: NEXUS_AGENT_CARDS,

  mount: (ctx: SovereignShellContext, el: HTMLElement): void => {
    // --- Structural role gate: throw before building the tree (defense in depth). ---
    if (!NEXUS_MINIMUM_ROLES.some((r) => ctx.auth.hasRole(r))) {
      throw new ModuleAccessDeniedError("module-nexus", ctx.auth.user.role, NEXUS_MINIMUM_ROLES);
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

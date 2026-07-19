/**
 * SOVEREIGN Platform — module-cpmi
 * CPMI — Contextual Program Management Intelligence (the platform AI governance engine).
 *
 * Pipeline role (spec §2): the second stage of the SOVEREIGN pipeline — receives FLOWPATH
 * outputs, produces governance outputs all six primary products depend on. Highest-
 * priority security node; enhanced monitoring at 0.7× the anomaly threshold (permanent).
 *
 * Session 11 SCOPE — D2 (first Stage 3 build): the module's SovereignModuleContract. It
 * enforces the CPMI role gate structurally at mount and renders the CPMI chrome (CpmiApp)
 * with three surfaces — the six-step Reasoning Chain (cpmi.reasoning-chain, PR-CPMI-001),
 * the read-only World Model query (cpmi.world-model-api, synthetic/dev backing), and the
 * CPMI-VRS Gate Runner (Gates 1/2 auto, Gate 3 human attestation, Gate 4 monitoring) with
 * VRS certification (cpmi.vrs-certification). The world model and live monitoring activate
 * by configuration in a later session — no CPMI rewrite (Standing Constraint #3).
 *
 * ROLE GATE (governance engine — conservative, fail-closed): minimumRole "PLATFORM_ADMIN".
 *   CPMI's outputs are the governance foundation for the whole platform and Gate 3
 *   attestation is a Project-Principal-level act, so access is restricted to
 *   PLATFORM_ADMIN / SYSTEM_ADMIN via the loader's fail-closed default policy, with a
 *   structural mount-gate as defense in depth (same pattern as VIGIL). The authoritative
 *   role->module matrix (Decision 24) remains open; this is the least-privilege default
 *   for the governance engine, relaxable by configuration if a broader policy is written.
 *
 * GOVERNANCE: module-cpmi → CPMI is already in the ModuleLoader's MODULE_PRODUCT map and
 *   the SovereignProduct union. The three agents are registered in Agent_Identity_Standard.md
 *   v1.2 (Constraint #10). PR-CPMI-001 is APPROVED (Constraint #9). No Logger event on
 *   mount (no approved "module mounted" event type).
 *
 * Version: 1.0 (CPMI core scaffold) · Session 11 · June 23, 2026
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
import { CpmiApp } from "./CpmiApp";

// GD-22 / SOVEREIGN_Role_Access_Matrix_20260718.md: CPMI unchanged — admin-only
// (governance engine; Gate 3 attestation is a Project-Principal-level act).
const CPMI_MINIMUM_ROLES: SovereignRole[] = ["PLATFORM_ADMIN", "SYSTEM_ADMIN"];

// cpmi.reasoning-chain — Governance agent (Agent Identity Standard v1.2 lists it
// "Analytical / Governance"; the AgentCard class is a single value and Governance is its
// defining role — it IS the AI governance engine). RE_EXECUTE approval behavior: the
// chain restarts after Gate 3 human attestation (spec §4.1). Operates under PR-CPMI-001.
const reasoningChainCard: AgentCard = {
  agent_id: "cpmi.reasoning-chain",
  agent_class: "Governance",
  product: "CPMI",
  capabilities: ["reasoning_chain", "risk_identification", "constraint_mapping", "governance_recommendation"],
  input_schema: {},
  output_schema: {},
  task_lifecycle_contract: {
    supports_long_running: false,
    approval_behavior: "RE_EXECUTE", // CPMI Gate 3 exception (spec §4.1)
    partial_failure_behavior: "ESCALATE",
  },
  data_classification_ceiling: "CUI",
  security_observable: true,
};

// cpmi.world-model-api — Operational agent. Serves world-model queries (read-only this
// session); updates the world model only on human approval (decision_type
// WORLD_MODEL_UPDATE). No prompt — it serves structured queries, not prose.
const worldModelApiCard: AgentCard = {
  agent_id: "cpmi.world-model-api",
  agent_class: "Operational",
  product: "CPMI",
  capabilities: ["world_model_query", "world_model_update_human_gated"],
  input_schema: {},
  output_schema: {},
  task_lifecycle_contract: {
    supports_long_running: false,
    approval_behavior: "ACKNOWLEDGE_AND_CONTINUE",
    partial_failure_behavior: "ESCALATE",
  },
  data_classification_ceiling: "CUI",
  security_observable: true,
};

// cpmi.vrs-certification — Governance agent. Issues VRS certificates only after all four
// CPMI-VRS gates pass (Gate 3 human-attested). Cannot self-certify; cannot issue partial
// certifications. No prompt — it issues structured records, not prose.
const vrsCertificationCard: AgentCard = {
  agent_id: "cpmi.vrs-certification",
  agent_class: "Governance",
  product: "CPMI",
  capabilities: ["vrs_gate_recording", "vrs_certification"],
  input_schema: {},
  output_schema: {},
  task_lifecycle_contract: {
    supports_long_running: false,
    approval_behavior: "ACKNOWLEDGE_AND_CONTINUE",
    partial_failure_behavior: "ESCALATE",
  },
  data_classification_ceiling: "CUI",
  security_observable: true,
};

/** The React root this module last mounted, so unmount() can dispose it. */
let root: Root | null = null;

export const cpmiModule: SovereignModuleContract = {
  moduleId: "module-cpmi",
  mountPath: "/cpmi",
  displayName: "CPMI",
  minimumRole: CPMI_MINIMUM_ROLES,
  agentCards: [reasoningChainCard, worldModelApiCard, vrsCertificationCard],

  mount: (ctx: SovereignShellContext, el: HTMLElement): void => {
    // --- Structural role gate: throw before building the tree (defense in depth). ---
    if (!CPMI_MINIMUM_ROLES.some((r) => ctx.auth.hasRole(r))) {
      throw new ModuleAccessDeniedError("module-cpmi", ctx.auth.user.role, CPMI_MINIMUM_ROLES);
    }
    root = createRoot(el);
    root.render(createElement(CpmiApp, { ctx }));
  },

  unmount: (): void => {
    root?.unmount();
    root = null;
  },

  healthCheck: async () => {
    // CPMI has no CPMI-VRS gate activity yet (Governance Clock not activated).
    // Honest NOT_STARTED rather than a fabricated gate state.
    return { status: "HEALTHY", vrs_gate: "NOT_STARTED" };
  },
};

export default cpmiModule;

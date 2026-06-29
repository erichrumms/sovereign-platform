/**
 * SOVEREIGN Platform — module-aria
 * ARIA Suite — compliance, traceability, and regulatory-impact layer (Stage 6).
 *
 * Pipeline role (docs/16 §2): a persistent governance layer that wraps platform activity after
 * APEX and before the Intelligence Layer. Three components — CLEAR (compliance), TRACER
 * (traceability), ARC (regulatory impact). Session 22 SCOPE — D4: the module's
 * SovereignModuleContract + the AriaApp shell (routing, banners, placeholder panels). CLEAR /
 * TRACER / ARC logic arrives in Sessions 23–25 (docs/16 §9).
 *
 * ROLE GATE (governance layer — conservative, fail-closed): minimumRole "PLATFORM_ADMIN".
 *   ARIA Suite governs platform-wide compliance, so access is restricted to PLATFORM_ADMIN /
 *   SYSTEM_ADMIN via the loader's fail-closed default policy, with a structural mount-gate as
 *   defense in depth (same pattern as CPMI / APEX / AgentOS / VIGIL).
 *
 * AGENT CARDS (Constraint #10): the one ARIA agent, aria.rules-engine, registered in
 *   Agent_Identity_Standard.md as class "Governance". It is DETERMINISTIC — it evaluates rules,
 *   computes compliance scores, and issues AI-absence attestations and export clearances with NO
 *   AI inference. It does NOT call sovereign-api-client and carries NO reasoning prompt (docs/16
 *   §3). "Governance" is already in the shell-contract AgentClass union — no shell-contract change
 *   (docs/16 §7). NO shell-contract change is required for ARIA Suite.
 *
 * GOVERNANCE: module-aria → ARIA is already in the ModuleLoader's MODULE_PRODUCT map and the
 *   SovereignProduct union. No Logger event on mount (no approved "module mounted" event type).
 *
 * Version: 1.0 · Session 22 (D4 scaffold) · June 29, 2026
 */

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import type {
  SovereignModuleContract,
  SovereignShellContext,
  AgentCard,
} from "../../sovereign-shell/shell-contract";
import { ModuleAccessDeniedError } from "../../sovereign-shell/src/module-loader";
import { AriaApp } from "./AriaApp";

const ARIA_MINIMUM_ROLE = "PLATFORM_ADMIN" as const;

// The single ARIA agent (docs/16 §3). Deterministic governance engine — evaluates rules and
// issues attestations/clearances with no AI inference. No prompt, no sovereign-api-client call.
const ariaRulesEngineCard: AgentCard = {
  agent_id: "aria.rules-engine",
  agent_class: "Governance",
  product: "ARIA",
  capabilities: [
    "deterministic_rule_evaluation",
    "compliance_scoring",
    "ai_absence_attestation",
    "export_clearance",
    "regulatory_violation_flagging",
  ],
  input_schema: {},
  output_schema: {},
  task_lifecycle_contract: {
    supports_long_running: false,
    approval_behavior: "ACKNOWLEDGE_AND_CONTINUE",
    partial_failure_behavior: "ESCALATE",
  },
  data_classification_ceiling: "UNCLASSIFIED", // GD-10 — UNCLASSIFIED only
  security_observable: true,
};

const ARIA_AGENT_CARDS: AgentCard[] = [ariaRulesEngineCard];

/** The React root this module last mounted, so unmount() can dispose it. */
let root: Root | null = null;

export const ariaModule: SovereignModuleContract = {
  moduleId: "module-aria",
  mountPath: "/aria",
  displayName: "ARIA Suite",
  minimumRole: ARIA_MINIMUM_ROLE,
  agentCards: ARIA_AGENT_CARDS,

  mount: (ctx: SovereignShellContext, el: HTMLElement): void => {
    // --- Structural role gate: throw before building the tree (defense in depth). ---
    if (!ctx.auth.hasRole("PLATFORM_ADMIN") && !ctx.auth.hasRole("SYSTEM_ADMIN")) {
      throw new ModuleAccessDeniedError("module-aria", ctx.auth.user.role, ARIA_MINIMUM_ROLE);
    }
    root = createRoot(el);
    root.render(createElement(AriaApp, { ctx }));
  },

  unmount: (): void => {
    root?.unmount();
    root = null;
  },

  healthCheck: async () => {
    // Scaffold only (Governance Clock OFF) — no CLEAR/TRACER/ARC logic yet. Honest NOT_STARTED.
    return { status: "HEALTHY", vrs_gate: "NOT_STARTED" };
  },
};

export default ariaModule;

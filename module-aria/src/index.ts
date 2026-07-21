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
  SovereignRole,
  AgentCard,
} from "../../sovereign-shell/shell-contract";
import { ModuleAccessDeniedError } from "../../sovereign-shell/src/module-loader";
import { AriaApp, type AriaInitialState } from "./AriaApp";

// GD-22 / D3: ARIA module-level gate widens to admit the union of all per-tab roles.
// The module must admit anyone who needs access to ANY tab — per-tab gating inside
// AriaApp.tsx then restricts each component to its role. PLATFORM_ADMIN and SYSTEM_ADMIN
// pass the gate and see all tabs; role-specific users see only their assigned tab.
// Per SOVEREIGN_Role_Access_Matrix_20260718.md:
//   CLEAR  → COMPLIANCE_OFFICER (+ admins)
//   TRACER → PROGRAM_MANAGER   (+ admins)
//   ARC    → ANALYST            (+ admins)
//   VRS    → admins only (unchanged)
export const ARIA_MINIMUM_ROLES: SovereignRole[] = [
  "PLATFORM_ADMIN",
  "SYSTEM_ADMIN",
  "COMPLIANCE_OFFICER",
  "PROGRAM_MANAGER",
  "ANALYST",
];

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

/**
 * GD-27 (shell-contract v1.22) — narrow the contract-level `unknown` navigation
 * intent to ARIA's real shape (docs/25 §3). Permissive on extra fields, strict on
 * the one field used; anything else narrows to undefined (cold-mount default).
 */
function narrowAriaInitialState(initialState: unknown): AriaInitialState | undefined {
  if (typeof initialState !== "object" || initialState === null) return undefined;
  const candidate = initialState as { selectedDocumentId?: unknown };
  return typeof candidate.selectedDocumentId === "string"
    ? { selectedDocumentId: candidate.selectedDocumentId }
    : undefined;
}

/** The React root this module last mounted, so unmount() can dispose it. */
let root: Root | null = null;

export const ariaModule: SovereignModuleContract = {
  moduleId: "module-aria",
  mountPath: "/aria",
  displayName: "ARIA Suite",
  minimumRole: ARIA_MINIMUM_ROLES,
  agentCards: ARIA_AGENT_CARDS,

  mount: (ctx: SovereignShellContext, el: HTMLElement, initialState?: unknown): void => {
    // --- Structural role gate: throw before building the tree (defense in depth). ---
    // Admits anyone who needs at least one ARIA tab; per-tab gating is in AriaApp.tsx.
    if (!ARIA_MINIMUM_ROLES.some((r) => ctx.auth.hasRole(r))) {
      throw new ModuleAccessDeniedError("module-aria", ctx.auth.user.role, ARIA_MINIMUM_ROLES);
    }
    root = createRoot(el);
    // GD-27: narrow the opaque navigation intent to ARIA's real shape here, at
    // the module boundary — the contract stays `unknown` (docs/25 §3).
    root.render(
      createElement(AriaApp, { ctx, initialState: narrowAriaInitialState(initialState) })
    );
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

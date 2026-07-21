/**
 * SOVEREIGN Platform — module-vigil
 * VIGIL — Agent Operator & Security Operator Dashboard (Companion Suite) — scaffold
 *
 * Pipeline role: the governed human response surface for Security Framework
 * P1/P2/P3 alerts (Risk R11) and AgentOS human-approval requests (Risk R10). VIGIL
 * reads what the platform's shared infrastructure produces; it implements no
 * security logic and orchestrates no agents.
 *
 * SCOPE (through Session 10):
 *   This file is the module's SovereignModuleContract. It enforces the VIGIL role gate
 *   structurally at mount and renders the VIGIL chrome (VigilApp) with two tabs: the
 *   wired Alert Queue + Alert Detail (response actions + Anomaly Triage Assistant,
 *   Session 7) and the Agent Approval Queue (Session 10 — request queue, vigil-approval-
 *   agent brief, and human-gated Approve/Reject/Escalate decisions). The module
 *   registers BOTH vigil-triage-analyst (PR-VIGIL-001) and vigil-approval-agent
 *   (PR-VIGIL-002, APPROVED June 23, 2026). The live alert feed (VIGIL_ALERT_ENDPOINT,
 *   Session 9) and the live AgentOS approval port both activate by configuration
 *   (Standing Constraint #3); this session both run on synthetic/dev backings.
 *
 * ROLE GATE (spec §1 / §7) — STRUCTURAL, not a conditional render:
 *   Access is restricted to PLATFORM_ADMIN and SYSTEM_ADMIN. This is enforced in
 *   TWO independent layers:
 *     1. minimumRole "PLATFORM_ADMIN" → the ModuleLoader's fail-closed
 *        defaultRoleAccessPolicy admits exactly PLATFORM_ADMIN or SYSTEM_ADMIN and
 *        throws ModuleAccessDeniedError before mount() is ever called.
 *     2. mount() ALSO checks ctx.auth and throws ModuleAccessDeniedError for any
 *        other role — defense in depth, so a user without the role never reaches
 *        the VIGIL component tree even if mount() is invoked directly.
 *   The thrown error is the platform's canonical ModuleAccessDeniedError (reused
 *   from the loader, NOT a forked copy). The loader module has only type-only
 *   imports, so this is a cheap, cycle-free runtime reference — the loader imports
 *   no modules. This is VIGIL's one deliberate runtime coupling beyond the
 *   types-only shell-contract import; it exists to throw the exact error type the
 *   platform recognises rather than diverge.
 *
 * GOVERNANCE (authorized by existing decisions — no contract change made here):
 *   - moduleId "module-vigil" → product VIGIL is already in the ModuleLoader's
 *     MODULE_PRODUCT map and the SovereignProduct union (GD-5, shell-contract v1.3).
 *   - PLATFORM_ADMIN is a SovereignRole as of GD-5 / v1.3.
 *   - No Logger event on mount: there is no approved SovereignEventType for "module
 *     mounted" (open governance item §13/13). Same posture as COUNSEL / SCRIBE.
 *   - vigil-triage-analyst is registered this session (Session 7) — it is named in
 *     the VIGIL spec (§7) and added to Agent_Identity_Standard.md before build, and
 *     operates under the APPROVED PR-VIGIL-001 prompt. vigil-approval-agent stays
 *     deferred (not registered) until the Agent Approval flow is built.
 *
 * Version: 1.1 (core D1) · Session 7 · June 18, 2026
 */

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import type {
  SovereignModuleContract,
  SovereignShellContext,
  SovereignRole,
  AgentCard,
} from "../../sovereign-shell/shell-contract";
// Canonical access-denial error — reused from the loader (the platform owner of
// this type), not forked. The loader file has only type-only imports, so this is a
// cheap, cycle-free runtime reference (the loader imports no modules).
import { ModuleAccessDeniedError } from "../../sovereign-shell/src/module-loader";
import { VigilApp, type VigilInitialState } from "./VigilApp";

// GD-22 / SOVEREIGN_Role_Access_Matrix_20260718.md: VIGIL is unchanged — restricted to
// platform and system admins only (security/oversight surface, intentional narrow gate).
const VIGIL_MINIMUM_ROLES: SovereignRole[] = ["PLATFORM_ADMIN", "SYSTEM_ADMIN"];

// vigil-triage-analyst — Monitoring agent (observes and advises; never acts
// autonomously — Agent Identity Standard taxonomy). Registered this session (Session
// 7) for the Anomaly Triage Assistant; operates under PR-VIGIL-001 (APPROVED) and
// obtains LLM access via createSovereignClient() (never the Anthropic API directly,
// Standing Constraint #5). vigil-approval-agent remains deferred to the Agent Approval
// build session and is intentionally NOT registered here.
const vigilTriageAnalystCard: AgentCard = {
  agent_id: "vigil-triage-analyst",
  agent_class: "Monitoring",
  product: "VIGIL",
  capabilities: ["anomaly_triage", "context_assembly", "false_positive_estimation"],
  input_schema: {},
  output_schema: {},
  task_lifecycle_contract: {
    supports_long_running: false,
    approval_behavior: "ACKNOWLEDGE_AND_CONTINUE", // platform default (Decision 19)
    partial_failure_behavior: "ESCALATE",
  },
  data_classification_ceiling: "CUI",
  security_observable: true,
};

// vigil-approval-agent — Monitoring agent (Agent Identity Standard v1.1). Activated
// this session (Session 10 — Agent Approval Flow). Turns an AgentOS approval request
// into a human-readable brief (PR-VIGIL-002, APPROVED June 23, 2026) and records the
// operator's decision; it never self-approves and takes no platform action (spec §3.1).
// LLM access via createSovereignClient() only (Standing Constraint #5).
const vigilApprovalAgentCard: AgentCard = {
  agent_id: "vigil-approval-agent",
  agent_class: "Monitoring",
  product: "VIGIL",
  capabilities: ["approval_brief_generation", "decision_record_keeping"],
  input_schema: {},
  output_schema: {},
  task_lifecycle_contract: {
    supports_long_running: false,
    approval_behavior: "ACKNOWLEDGE_AND_CONTINUE", // platform default (Agent Identity Standard)
    partial_failure_behavior: "ESCALATE",
  },
  data_classification_ceiling: "CUI",
  security_observable: true,
};

// tt.escalation-monitor — Time & Travel workflow-layer agent hosted on VIGIL/NEXUS
// infrastructure (Session 27, docs/17 §2 — no new module directory; AIS D-TT5).
// Monitoring, deterministic: tracks recurrence per employee/rule across the rolling
// window and routes formal escalations for VIGIL human authorization. Tracks and
// routes only. product is the HOST product ("VIGIL") — the workflow layer is not a
// SovereignProduct. NOTE: actual VIGIL Alert Queue wiring is Session 28 scope,
// blocked on the sourceProduct question (see tt-escalation-monitor.ts header).
const ttEscalationMonitorCard: AgentCard = {
  agent_id: "tt.escalation-monitor",
  agent_class: "Monitoring",
  product: "VIGIL",
  capabilities: ["recurrence_tracking", "escalation_routing", "communication_type_upgrade"],
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

/**
 * GD-27 (shell-contract v1.22) — narrow the contract-level `unknown` navigation
 * intent to VIGIL's real shape (docs/25 §3). Permissive on extra fields, strict
 * on the one field used: anything that is not an object carrying a string
 * `selectedRequestId` narrows to undefined and the module opens at its default
 * screen, exactly as a cold mount.
 */
function narrowVigilInitialState(initialState: unknown): VigilInitialState | undefined {
  if (typeof initialState !== "object" || initialState === null) return undefined;
  const candidate = initialState as { selectedRequestId?: unknown };
  return typeof candidate.selectedRequestId === "string"
    ? { selectedRequestId: candidate.selectedRequestId }
    : undefined;
}

/** The React root this module last mounted, so unmount() can dispose it. */
let root: Root | null = null;

export const vigilModule: SovereignModuleContract = {
  moduleId: "module-vigil",
  mountPath: "/vigil",
  displayName: "VIGIL",
  // GD-22: VIGIL unchanged — PLATFORM_ADMIN and SYSTEM_ADMIN only (access matrix confirms).
  minimumRole: VIGIL_MINIMUM_ROLES,
  // vigil-triage-analyst (Session 7 — Anomaly Triage Assistant), vigil-approval-agent
  // (Session 10 — Agent Approval Flow), and tt.escalation-monitor (Session 27 —
  // Time & Travel workflow layer, hosted on VIGIL infrastructure) are registered.
  agentCards: [vigilTriageAnalystCard, vigilApprovalAgentCard, ttEscalationMonitorCard],

  mount: (ctx: SovereignShellContext, el: HTMLElement, initialState?: unknown): void => {
    // --- Structural role gate (spec §7 / GD-22): throw before building the tree. ---
    if (!VIGIL_MINIMUM_ROLES.some((r) => ctx.auth.hasRole(r))) {
      throw new ModuleAccessDeniedError("module-vigil", ctx.auth.user.role, VIGIL_MINIMUM_ROLES);
    }
    root = createRoot(el);
    // GD-27: narrow the opaque navigation intent to VIGIL's real shape here, at
    // the module boundary — the contract stays `unknown` (docs/25 §3).
    root.render(
      createElement(VigilApp, { ctx, initialState: narrowVigilInitialState(initialState) })
    );
  },

  unmount: (): void => {
    root?.unmount();
    root = null;
  },

  healthCheck: async () => {
    // Scaffold: VIGIL has no CPMI-VRS gate activity yet (Governance Clock not
    // activated). Honest NOT_STARTED rather than a fabricated gate state.
    return { status: "HEALTHY", vrs_gate: "NOT_STARTED" };
  },
};

export default vigilModule;

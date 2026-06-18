/**
 * SOVEREIGN Platform — module-vigil
 * VIGIL — Agent Operator & Security Operator Dashboard (Companion Suite) — scaffold
 *
 * Pipeline role: the governed human response surface for Security Framework
 * P1/P2/P3 alerts (Risk R11) and AgentOS human-approval requests (Risk R10). VIGIL
 * reads what the platform's shared infrastructure produces; it implements no
 * security logic and orchestrates no agents.
 *
 * Session 6 SCOPE — SCAFFOLD (D3):
 *   This file is the module's SovereignModuleContract. It enforces the VIGIL role
 *   gate structurally at mount and renders the VIGIL chrome (VigilApp) with the
 *   Alert Queue and Agent Approval Queue STUBS. Live alert ingestion, the Anomaly
 *   Triage Assistant, and the approval decision flow are later sessions (spec §8
 *   build sequencing). Ship with agentCards: [] — vigil-triage-analyst and
 *   vigil-approval-agent are deferred to the session that builds triage/approval
 *   (governance decision already recorded for Session 6).
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
 *   - agentCards: [] — registering vigil-triage-analyst / vigil-approval-agent is
 *     deferred (Session 6 governance decision); this scaffold registers no agents.
 *
 * Version: 1.0 (scaffold) · Session 6 · June 17, 2026
 */

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import type {
  SovereignModuleContract,
  SovereignShellContext,
} from "../../sovereign-shell/shell-contract";
// Canonical access-denial error — reused from the loader (the platform owner of
// this type), not forked. The loader file has only type-only imports, so this is a
// cheap, cycle-free runtime reference (the loader imports no modules).
import { ModuleAccessDeniedError } from "../../sovereign-shell/src/module-loader";
import { VigilApp } from "./VigilApp";

/** The role that satisfies VIGIL's gate (with SYSTEM_ADMIN as the universal superuser). */
const VIGIL_MINIMUM_ROLE = "PLATFORM_ADMIN" as const;

/** The React root this module last mounted, so unmount() can dispose it. */
let root: Root | null = null;

export const vigilModule: SovereignModuleContract = {
  moduleId: "module-vigil",
  mountPath: "/vigil",
  displayName: "VIGIL",
  // Real role gate (VIGIL is the first companion module with one). The loader's
  // fail-closed default policy turns this into "PLATFORM_ADMIN or SYSTEM_ADMIN
  // only". Not a placeholder, unlike COUNSEL/SCRIBE's READ_ONLY.
  minimumRole: VIGIL_MINIMUM_ROLE,
  // Scaffold ships with NO agents — vigil-triage-analyst / vigil-approval-agent are
  // deferred to the triage/approval build session (Session 6 governance decision).
  agentCards: [],

  mount: (ctx: SovereignShellContext, el: HTMLElement): void => {
    // --- Structural role gate (spec §7): throw before building the tree. ---
    if (!ctx.auth.hasRole("PLATFORM_ADMIN") && !ctx.auth.hasRole("SYSTEM_ADMIN")) {
      throw new ModuleAccessDeniedError("module-vigil", ctx.auth.user.role, VIGIL_MINIMUM_ROLE);
    }
    root = createRoot(el);
    root.render(createElement(VigilApp, { ctx }));
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

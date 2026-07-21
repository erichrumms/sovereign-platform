/**
 * SOVEREIGN Platform — module-workspace
 * Reviewer's Workspace — a genuine new top-level module (GD-25, docs/23 §1 item 3;
 * NOT a Home Dashboard extension — the Home Dashboard is a survey, this is a place
 * work actually happens).
 *
 * One place where a reviewer acts inline on the three decision screens where the
 * embed-real-component pattern was verified in code (docs/23 §1 item 2): VIGIL's
 * Agent Approval Queue (ApprovalDetail), ARIA's CLEAR Certification
 * (ClearCertificationQueue), and SCRIBE's T&T Review (TTManagerReview). Source
 * modules publish their real items to ctx.reviewerWorkspaceSurface (the thirteenth
 * shell export) and remove them on their decision-commit paths.
 *
 * ROLE GATE (GD-25 / docs/23 §3): the module-level gate is the union of every role
 * any of its three sections needs — mirroring exactly the pattern GD-22 established
 * for ARIA. Per-section gating inside WorkspaceApp.tsx (the AriaApp TAB_ROLES shape)
 * then restricts each panel to its roles:
 *   VIGIL Approvals     → PLATFORM_ADMIN, SYSTEM_ADMIN
 *   ARIA Certifications → COMPLIANCE_OFFICER (+ admins)
 *   SCRIBE T&T Reviews  → PROGRAM_MANAGER, ANALYST (+ admins)
 *
 * AGENT CARDS (Constraint #10): none. The Workspace embeds other modules' components;
 * it runs no agent of its own, registers no prompt, and makes no LLM call itself
 * (the embedded VIGIL brief hook carries its own PR-VIGIL-002 provenance).
 *
 * GOVERNANCE / RECONCILIATION (surfaced, not hidden): the ModuleLoader's
 * MODULE_PRODUCT map requires a SovereignProduct per module, and the frozen
 * SovereignProduct union has no WORKSPACE member — adding one is a shell-contract
 * change GD-25 does NOT authorize. module-workspace therefore maps to the nearest
 * existing product, VIGIL (the module whose entire domain is "actions awaiting a
 * human decision"), in the loader — a loader bookkeeping entry only, same posture as
 * NEXUS's "nearest existing role" gate (Session 15). A dedicated WORKSPACE product
 * member is flagged for a future GD. See module-loader/index.ts.
 *
 * Version: 1.0 · Session 50 (GD-25) · July 20, 2026
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
import { WorkspaceApp } from "./WorkspaceApp";

// GD-25 / docs/23 §3: the union of every role any section needs — the ARIA (GD-22)
// module-gate pattern. Per-section gating inside WorkspaceApp then restricts each panel.
export const WORKSPACE_MINIMUM_ROLES: SovereignRole[] = [
  "PLATFORM_ADMIN",
  "SYSTEM_ADMIN",
  "COMPLIANCE_OFFICER",
  "PROGRAM_MANAGER",
  "ANALYST",
];

// No agents (Constraint #10) — the Workspace embeds other modules' components only.
const WORKSPACE_AGENT_CARDS: AgentCard[] = [];

/** The React root this module last mounted, so unmount() can dispose it. */
let root: Root | null = null;

export const workspaceModule: SovereignModuleContract = {
  moduleId: "module-workspace",
  mountPath: "/workspace",
  displayName: "Reviewer's Workspace",
  minimumRole: WORKSPACE_MINIMUM_ROLES,
  agentCards: WORKSPACE_AGENT_CARDS,

  mount: (ctx: SovereignShellContext, el: HTMLElement): void => {
    // --- Structural role gate: throw before building the tree (defense in depth). ---
    // Admits anyone who needs at least one section; per-section gating is in WorkspaceApp.tsx.
    if (!WORKSPACE_MINIMUM_ROLES.some((r) => ctx.auth.hasRole(r))) {
      throw new ModuleAccessDeniedError("module-workspace", ctx.auth.user.role, WORKSPACE_MINIMUM_ROLES);
    }
    root = createRoot(el);
    root.render(createElement(WorkspaceApp, { ctx }));
  },

  unmount: (): void => {
    root?.unmount();
    root = null;
  },

  healthCheck: async () => {
    // The Workspace is a composition surface over shell state (Governance Clock OFF —
    // all data synthetic). Honest NOT_STARTED, same as the other Stage-1 modules.
    return { status: "HEALTHY", vrs_gate: "NOT_STARTED" };
  },
};

export default workspaceModule;

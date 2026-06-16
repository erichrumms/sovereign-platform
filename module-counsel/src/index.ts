/**
 * SOVEREIGN Platform — module-counsel
 * COUNSEL — Human Decision Support (Companion Suite)
 *
 * Pipeline role: produces Decision Records that feed back into any stage.
 * Access: all roles (intended; READ_ONLY placeholder pending the Decision 24
 * role->module access matrix). Registered agent: counsel-analyst (LLM-backed).
 *
 * Session 4 SCOPE — CORE (in progress):
 *   This file is the module's SovereignModuleContract. As of Session 4 it mounts
 *   COUNSEL's React tree (CounselApp) via react-dom/client into the shell-provided
 *   outlet element, replacing the Session 3 el.innerHTML scaffold. The COUNSEL
 *   core components (Decision Framing, Prior Position Alert, Analysis Engine) are
 *   composed inside CounselApp across the Session 4 sub-steps.
 *
 * IMPLEMENTATION NOTES (deliberate):
 *   - Module obtains LLM access via createSovereignClient() from
 *     @sovereign/api-client (wired in the Analysis Engine sub-step), never the
 *     Anthropic API directly (Standing Constraint #5).
 *   - mount() owns a single React root; unmount() disposes it. The shell never
 *     renders children into the outlet, so the root owns that DOM exclusively.
 *   - It does NOT emit a Logger event on mount: there is no approved
 *     SovereignEventType for "module mounted" (open governance item §13/13);
 *     inventing taxonomy is a constraint violation.
 *   - It does NOT touch the mcp/a2a task-lifecycle/agui-humanAction stubs (they
 *     throw by design until Stage 2 wires them).
 *
 * Contract types are imported from the canonical sovereign-shell/shell-contract.ts
 * (the same file the loader uses) so the SovereignModuleContract type identity is
 * shared with the loader — no divergent copy. The import is types-only (erased at
 * runtime). The module itself is consumed by the shell host via the workspace
 * package name "@sovereign/module-counsel".
 *
 * Version: 1.0 (core, in progress) · Session 4 · June 15, 2026
 */

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import type {
  SovereignModuleContract,
  SovereignShellContext,
  AgentCard,
} from "../../sovereign-shell/shell-contract";
import { CounselApp } from "./CounselApp";

// counsel-analyst — Agent Identity Standard (Companion Suite additions).
// LLM-backed Analytical agent; obtains LLM access via createSovereignClient()
// (never the Anthropic API directly). product "COUNSEL" is representable as of
// GD-5 / shell-contract v1.3.
const counselAnalystCard: AgentCard = {
  agent_id: "counsel-analyst",
  agent_class: "Analytical",
  product: "COUNSEL",
  capabilities: ["decision_support_analysis", "prior_position_reconciliation"],
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

/** The React root this module last mounted, so unmount() can dispose it. */
let root: Root | null = null;

export const counselModule: SovereignModuleContract = {
  moduleId: "module-counsel",
  mountPath: "/counsel",
  displayName: "COUNSEL",
  // Fail-closed placeholder. COUNSEL's intended access is "all roles", but the
  // platform has no role->module access matrix yet (Decision 24); under the
  // default exact-match-or-SYSTEM_ADMIN policy a single minimumRole cannot
  // express "all roles". READ_ONLY is the least-privilege placeholder; the
  // authoritative matrix is injected as a RoleAccessPolicy when written — no
  // module change required.
  minimumRole: "READ_ONLY",
  agentCards: [counselAnalystCard],

  mount: (ctx: SovereignShellContext, el: HTMLElement): void => {
    root = createRoot(el);
    root.render(createElement(CounselApp, { ctx }));
  },

  unmount: (): void => {
    root?.unmount();
    root = null;
  },

  healthCheck: async () => {
    // Synthetic: COUNSEL has no CPMI-VRS gate activity yet (Governance Clock
    // not activated). Honest NOT_STARTED rather than a fabricated gate state.
    return { status: "HEALTHY", vrs_gate: "NOT_STARTED" };
  },
};

export default counselModule;

/**
 * SOVEREIGN Platform — module-lens
 * LENS — Orientation & Explanation (Companion Suite) — core
 *
 * Pipeline role: the platform's plain-language orientation and explanation surface for
 * ANY authenticated user. LENS reads what the platform produces (pipeline context,
 * governance notices, the agent-action log it observes) and explains it; it
 * implements no security, governance, or orchestration logic and takes no action.
 *
 * Session 8 SCOPE — CORE (D1):
 *   This file is the module's SovereignModuleContract. It mounts LENS's React tree
 *   (LensApp) via react-dom/client into the shell-provided outlet and renders the three
 *   orientation surfaces: Governance Explainer (lens-explainer, grounded ONLY in
 *   docs/vigil_alert_response.md + docs/vigil_agent_approvals.md, three-tier fallback,
 *   Logger emission), Pipeline Navigator (static), and AI Transparency Panel
 *   (read-only). Built per the LENS architecture spec (03_LENS_Orientation_Module.md).
 *
 * ROLE GATE: minimumRole "READ_ONLY" — a fail-closed PLACEHOLDER, identical rationale
 *   to COUNSEL / SCRIBE. LENS's intended access is "all authenticated roles", but the
 *   platform has no role->module access matrix yet (Decision 24); under the loader's
 *   default exact-match-or-SYSTEM_ADMIN policy a single minimumRole cannot express
 *   "all roles", so READ_ONLY is the least-privilege placeholder. The authoritative
 *   RoleAccessPolicy is injected when written — no module change required. Unlike
 *   VIGIL, LENS has no real role gate, so mount() does no structural role check.
 *
 * GOVERNANCE (authorized by existing decisions — no contract change made here):
 *   - moduleId "module-lens" → product LENS is already in the ModuleLoader's
 *     MODULE_PRODUCT map and the SovereignProduct union (GD-5, shell-contract v1.3).
 *   - Agent cards lens-explainer (Analytical — explains, takes no action; corrected
 *     from the Session 7 scaffold's Operational per the LENS spec §2.1) and
 *     lens-orientation (Analytical) are registered here and recorded in
 *     Agent_Identity_Standard.md.
 *   - PR-LENS-001 (explainer_system.md) is registered (prompts/CHANGELOG.md) and
 *     APPROVED — Project Principal, June 18, 2026. Its runtime copy is
 *     src/prompts/explainer-system.prompt.ts. PR-LENS-002 (orientation) remains
 *     deferred — the Pipeline Navigator is a static render and makes no LLM call.
 *   - No Logger event on mount: there is no approved SovereignEventType for "module
 *     mounted" (open governance item §13/13). Same posture as COUNSEL / SCRIBE / VIGIL.
 *
 * Version: 2.0 (core) · Session 8 · June 22, 2026
 */

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import type {
  SovereignModuleContract,
  SovereignShellContext,
  AgentCard,
} from "../../sovereign-shell/shell-contract";
import { LensApp } from "./LensApp";

// lens-explainer — Analytical agent (LENS spec §2.1: it explains; it does not take
// action — corrected from the Session 7 scaffold's Operational). Explains platform
// behaviour in plain language, grounded ONLY in the LENS knowledge-base source
// documents and supplied context. Advisory/explanatory; takes no action. Obtains LLM
// access via createSovereignClient() (never the Anthropic API directly, Standing
// Constraint #5). Operates under PR-LENS-001 (APPROVED, June 18, 2026).
const lensExplainerCard: AgentCard = {
  agent_id: "lens-explainer",
  agent_class: "Analytical",
  product: "LENS",
  capabilities: ["platform_explanation", "governance_explanation", "source_document_grounding"],
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

// lens-orientation — Analytical agent (per the Session 7 done condition). Produces a
// user's orientation/pipeline-context view. Advisory only.
const lensOrientationCard: AgentCard = {
  agent_id: "lens-orientation",
  agent_class: "Analytical",
  product: "LENS",
  capabilities: ["pipeline_orientation", "context_summary"],
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

export const lensModule: SovereignModuleContract = {
  moduleId: "module-lens",
  mountPath: "/lens",
  displayName: "LENS",
  // Fail-closed placeholder, identical rationale to COUNSEL / SCRIBE (Decision 24).
  minimumRole: "READ_ONLY",
  agentCards: [lensExplainerCard, lensOrientationCard],

  mount: (ctx: SovereignShellContext, el: HTMLElement): void => {
    root = createRoot(el);
    root.render(createElement(LensApp, { ctx }));
  },

  unmount: (): void => {
    root?.unmount();
    root = null;
  },

  healthCheck: async () => {
    // LENS has no CPMI-VRS gate activity yet (Governance Clock not activated).
    // Honest NOT_STARTED rather than a fabricated gate state.
    return { status: "HEALTHY", vrs_gate: "NOT_STARTED" };
  },
};

export default lensModule;

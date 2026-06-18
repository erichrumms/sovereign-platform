/**
 * SOVEREIGN Platform — module-lens
 * LENS — Orientation & Explanation (Companion Suite) — scaffold
 *
 * Pipeline role: the platform's plain-language orientation and explanation surface for
 * ANY authenticated user. LENS reads what the platform produces (pipeline context,
 * governance notices, the platform-wide agent-action log) and explains it; it
 * implements no security, governance, or orchestration logic and takes no action.
 *
 * Session 7 SCOPE — SCAFFOLD (D2):
 *   This file is the module's SovereignModuleContract. It mounts LENS's React tree
 *   (LensApp) via react-dom/client into the shell-provided outlet and renders the LENS
 *   chrome with honest stubs. The LENS CORE — the lens-explainer agent powered by the
 *   two knowledge-base source documents (docs/vigil_alert_response.md,
 *   docs/vigil_agent_approvals.md), the orientation surfaces (Pipeline Navigator,
 *   Governance Explainer, AI Transparency Panel), three-tier fallback, and Logger
 *   emission — is DEFERRED until the LENS architecture spec (03_LENS_Orientation_Module.md)
 *   is authored in Claude Chat. The scaffold makes no LLM call.
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
 *   - Agent cards lens-explainer (Operational) and lens-orientation (Analytical) are
 *     registered here and recorded in Agent_Identity_Standard.md. Their class
 *     assignments follow the Session 7 done condition; the LENS architecture spec will
 *     confirm them. No LLM call is made by the scaffold.
 *   - PR-LENS-001 (explainer_system.md) is authored and registered (prompts/CHANGELOG.md),
 *     PENDING Project Principal approval. PR-LENS-002 (orientation) is deferred to LENS
 *     core. No runtime prompt copy exists until LENS core consumes a prompt.
 *   - No Logger event on mount: there is no approved SovereignEventType for "module
 *     mounted" (open governance item §13/13). Same posture as COUNSEL / SCRIBE / VIGIL.
 *
 * Version: 1.0 (scaffold) · Session 7 · June 18, 2026
 */

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import type {
  SovereignModuleContract,
  SovereignShellContext,
  AgentCard,
} from "../../sovereign-shell/shell-contract";
import { LensApp } from "./LensApp";

// lens-explainer — Operational agent (per the Session 7 done condition). Explains
// platform behaviour in plain language, grounded ONLY in the LENS knowledge-base
// source documents and supplied context. Advisory/explanatory; takes no action.
// Obtains LLM access via createSovereignClient() (LENS core; never the Anthropic API
// directly, Standing Constraint #5). Operates under PR-LENS-001 when core is built.
const lensExplainerCard: AgentCard = {
  agent_id: "lens-explainer",
  agent_class: "Operational",
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
    // Scaffold: LENS has no CPMI-VRS gate activity yet (Governance Clock not
    // activated). Honest NOT_STARTED rather than a fabricated gate state.
    return { status: "HEALTHY", vrs_gate: "NOT_STARTED" };
  },
};

export default lensModule;

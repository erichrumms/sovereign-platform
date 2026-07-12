/**
 * SOVEREIGN Platform — module-scribe
 * SCRIBE — Drafting & Style DNA (Companion Suite) — scaffold
 *
 * Pipeline role: turns captured material into destination-ready drafts for the
 * six primary products, in the user's voice (Style DNA). Access: all roles
 * (intended; READ_ONLY placeholder pending the Decision 24 role->module access
 * matrix — same rationale as COUNSEL). Registered agents: scribe-drafter
 * (Operational, drafting) and scribe-style-analyst (Analytical, Style DNA).
 *
 * Session 5 SCOPE — SCAFFOLD:
 *   This file is the module's SovereignModuleContract. It mounts SCRIBE's React
 *   tree (ScribeApp) via react-dom/client into the shell-provided outlet, and the
 *   tree shows the eight-mode selector (SCRIBE_MODES) bound to the @sovereign/data
 *   output schemas. The drafting engine (capture → LLM draft via createSovereignClient
 *   → per-mode schema validation → three-tier fallback → human-gated Export) is a
 *   later session, following the COUNSEL scaffold (Session 3) → core (Session 4)
 *   sequence. PR-SCRIBE-001 (drafting_system.md) is authored and registered
 *   (prompts/CHANGELOG.md), PENDING Project Principal approval.
 *
 * GOVERNANCE (authorized by existing decisions — no contract change made here):
 *   - moduleId "module-scribe" → product SCRIBE is already in the ModuleLoader's
 *     MODULE_PRODUCT map and SovereignProduct union (GD-5, shell-contract v1.3).
 *   - The agent_ids scribe-drafter and scribe-style-analyst are named in approved
 *     decisions (GD-2 VOICE_CAPTURE_COMPLETED emitter; GD-1 StyleProfile owner),
 *     so their AgentCards implement existing decisions rather than registering new
 *     agents — the same basis on which counsel-analyst was declared in Session 4.
 *   - It does NOT emit a Logger event on mount: there is no approved
 *     SovereignEventType for "module mounted" (open governance item §13/13);
 *     inventing taxonomy is a constraint violation. (Same posture as COUNSEL.)
 *
 * Contract types are imported from the canonical sovereign-shell/shell-contract.ts
 * (the same file the loader uses) so the SovereignModuleContract type identity is
 * shared with the loader — no divergent copy. The import is types-only (erased at
 * runtime). The module is consumed by the shell host via the workspace package
 * name "@sovereign/module-scribe".
 *
 * Version: 1.0 (scaffold) · Session 5 · June 16, 2026
 */

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import type {
  SovereignModuleContract,
  SovereignShellContext,
  AgentCard,
} from "../../sovereign-shell/shell-contract";
import { ScribeApp } from "./ScribeApp";

// scribe-drafter — Agent Identity Standard (Companion Suite additions). Operational
// drafting agent; obtains LLM access via createSovereignClient() (never the
// Anthropic API directly). Named by GD-2 (VOICE_CAPTURE_COMPLETED emitter).
const scribeDrafterCard: AgentCard = {
  agent_id: "scribe-drafter",
  agent_class: "Operational",
  product: "SCRIBE",
  capabilities: ["mode_drafting", "voice_capture_transcription", "synthesis", "framing"],
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

// scribe-style-analyst — Analytical agent maintaining the user's Style DNA
// (StyleProfile). Named by GD-1 (StyleProfile entity owner). data_classification
// "user" applies to the StyleProfile it maintains; the card ceiling is CUI.
const scribeStyleAnalystCard: AgentCard = {
  agent_id: "scribe-style-analyst",
  agent_class: "Analytical",
  product: "SCRIBE",
  capabilities: ["style_profile_analysis", "voice_matching"],
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

// --- Time & Travel workflow-layer agents hosted on SCRIBE infrastructure (Session 28,
// docs/17 §2 — no new module directory; AIS D-TT5). Both Operational, LLM-backed via
// createSovereignClient() only, operating under the two APPROVED registered prompts
// (tt/prompts/CHANGELOG.md v1.0). product is the HOST product ("SCRIBE") — the workflow
// layer is not a SovereignProduct. Both agents DRAFT ONLY: the manager reviews, adjusts,
// and sends; neither agent has a send path (docs/17 §1). ---

// tt.travel-drafter — four travel communication templates (docs/17 §5.4) from governed
// TravelRequest/TravelPolicy data.
const ttTravelDrafterCard: AgentCard = {
  agent_id: "tt.travel-drafter",
  agent_class: "Operational",
  product: "SCRIBE",
  capabilities: [
    "travel_approval_notice_drafting",
    "travel_information_request_drafting",
    "travel_escalation_notice_drafting",
    "travel_denial_notice_drafting",
  ],
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

// tt.time-drafter — five time & expense communication templates (docs/17 §6.4) from
// governed TimeRecord/ComplianceFlag/ChargeAccount data. The formal escalation
// scenario requires manager selection of which version(s) to send — the agent never
// chooses (AIS scope constraint).
const ttTimeDrafterCard: AgentCard = {
  agent_id: "tt.time-drafter",
  agent_class: "Operational",
  product: "SCRIBE",
  capabilities: [
    "time_error_correction_drafting",
    "time_clarification_request_drafting",
    "time_justification_request_drafting",
    "time_pattern_flag_notice_drafting",
    "time_formal_escalation_drafting",
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

/** The React root this module last mounted, so unmount() can dispose it. */
let root: Root | null = null;

export const scribeModule: SovereignModuleContract = {
  moduleId: "module-scribe",
  mountPath: "/scribe",
  displayName: "SCRIBE",
  // Fail-closed placeholder, identical rationale to COUNSEL: SCRIBE's intended
  // access is "all roles", but the platform has no role->module access matrix yet
  // (Decision 24). READ_ONLY is the least-privilege placeholder; the authoritative
  // RoleAccessPolicy is injected when written — no module change required.
  minimumRole: "READ_ONLY",
  // scribe-drafter + scribe-style-analyst (Session 5), plus the two Time & Travel
  // drafters hosted on SCRIBE infrastructure (Session 28 — docs/17 §2, AIS D-TT5).
  agentCards: [scribeDrafterCard, scribeStyleAnalystCard, ttTravelDrafterCard, ttTimeDrafterCard],

  mount: (ctx: SovereignShellContext, el: HTMLElement): void => {
    root = createRoot(el);
    root.render(createElement(ScribeApp, { ctx }));
  },

  unmount: (): void => {
    root?.unmount();
    root = null;
  },

  healthCheck: async () => {
    // Scaffold: SCRIBE has no CPMI-VRS gate activity yet (Governance Clock not
    // activated). Honest NOT_STARTED rather than a fabricated gate state.
    return { status: "HEALTHY", vrs_gate: "NOT_STARTED" };
  },
};

export default scribeModule;

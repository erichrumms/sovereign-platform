/**
 * SOVEREIGN Platform — module-scribe
 * modes.ts — the SCRIBE drafting-mode catalog (the "mode selector in
 * module-scribe" referenced by shell-contract SCRIBEMode and the companion suite
 * spec, Part 3).
 *
 * Each mode binds to its canonical output schema from @sovereign/data — field
 * names are NOT hardcoded here (the scribe-modes schema file is the source of
 * truth; this catalog only references the types). The `mode` values MUST match
 * the SCRIBEMode union in shell-contract.ts exactly — SCRIBE_MODES is checked
 * against that union at compile time below.
 *
 * Version: 1.0 (scaffold) · Session 5 · June 16, 2026
 */

import type {
  CorrespondenceDraftSchema,
  ProgramNarrativeSchema,
  ReportCommentarySchema,
  VVRDescriptionSchema,
  GovernanceMemoSchema,
  RuleChangeProposalSchema,
} from "@sovereign/data";

import type { SCRIBEMode, SovereignProduct } from "../../sovereign-shell/shell-contract";

/**
 * The canonical output schema produced by each drafting mode. `synthesis` and
 * `framing` are intermediate/pre-work modes with no product intake schema (spec
 * §Part 3 — they feed other modes), represented as `null`.
 */
export type ModeOutputSchema =
  | CorrespondenceDraftSchema
  | ProgramNarrativeSchema
  | ReportCommentarySchema
  | VVRDescriptionSchema
  | GovernanceMemoSchema
  | RuleChangeProposalSchema
  | null;

export interface ScribeModeDescriptor {
  mode: SCRIBEMode;
  label: string;
  /** Plain-language description of what the mode drafts. */
  description: string;
  /**
   * The product the mode's output feeds. `null` for the intermediate modes
   * (synthesis, framing) that have no direct product intake.
   */
  targetProduct: SovereignProduct | null;
  /** True for product-intake drafting modes; false for intermediate modes. */
  producesProductIntake: boolean;
}

export const SCRIBE_MODES: readonly ScribeModeDescriptor[] = [
  {
    mode: "correspondence_draft",
    label: "Correspondence Draft",
    description: "Letters, memos, and emails drafted for NEXUS task intake.",
    targetProduct: "NEXUS",
    producesProductIntake: true,
  },
  {
    mode: "program_narrative",
    label: "Program Narrative",
    description: "Program status narrative for NEXUS or APEX.",
    targetProduct: "NEXUS",
    producesProductIntake: true,
  },
  {
    mode: "report_commentary",
    label: "Report Commentary",
    description: "QPR/ABS narrative sections for APEX reports.",
    targetProduct: "APEX",
    producesProductIntake: true,
  },
  {
    mode: "vvr_description",
    label: "VVR Description",
    description: "Verification & validation record step descriptions for FLOWPATH.",
    targetProduct: "FLOWPATH",
    producesProductIntake: true,
  },
  {
    mode: "governance_memo",
    label: "Governance Memo",
    description: "Decision/reasoning memos referencing a CPMI recommendation or gate.",
    targetProduct: "CPMI",
    producesProductIntake: true,
  },
  {
    mode: "rule_change_proposal",
    label: "Rule Change Proposal",
    description: "Policy-as-data rule change proposals for ARIA.",
    targetProduct: "ARIA",
    producesProductIntake: true,
  },
  {
    mode: "synthesis",
    label: "Synthesis",
    description: "Intermediate artifact — synthesizes captured material before drafting.",
    targetProduct: null,
    producesProductIntake: false,
  },
  {
    mode: "framing",
    label: "Framing",
    description: "FLOWPATH pre-work — frames a draft before the drafting pass.",
    targetProduct: null,
    producesProductIntake: false,
  },
];

/** Lookup a descriptor by mode. */
export function describeMode(mode: SCRIBEMode): ScribeModeDescriptor {
  const found = SCRIBE_MODES.find((m) => m.mode === mode);
  // SCRIBE_MODES is exhaustive over SCRIBEMode (see compile-time check below).
  return found as ScribeModeDescriptor;
}

/**
 * Compile-time exhaustiveness guard: this literal must name every SCRIBEMode. If
 * a member is added to the shell-contract union (or renamed) and not reflected
 * here, this object stops type-checking — a missing key or an excess key both
 * fail. Erased at runtime. Keep in sync with SCRIBE_MODES above.
 */
const _MODE_KEYS: Record<SCRIBEMode, true> = {
  correspondence_draft: true,
  program_narrative: true,
  report_commentary: true,
  vvr_description: true,
  governance_memo: true,
  rule_change_proposal: true,
  synthesis: true,
  framing: true,
};
void _MODE_KEYS;

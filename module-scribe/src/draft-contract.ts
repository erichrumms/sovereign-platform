/**
 * SOVEREIGN Platform — module-scribe
 * draft-contract.ts — the SCRIBE drafting output contract (PR-SCRIBE-001).
 *
 * The six product-aligned drafting modes each return a canonical output schema
 * defined in @sovereign/data (scribe-modes.ts). Those schemas ship as TYPES ONLY
 * (companion suite spec, Part 3 — "no validation functions at this stage"). This
 * file supplies the runtime validators the drafting engine runs on the LLM's JSON
 * BEFORE it is shown to the user, and that the Export gate re-runs on the
 * human-edited draft before it can be approved (D1 done condition: "Schema
 * validation before output is shown"; CPMI-VRS Gate 2/Gate 3 discipline).
 *
 * FIELD NAMES ARE NOT REDEFINED HERE. The schema shapes are imported from
 * @sovereign/data; these validators check that an unknown value conforms to the
 * imported shape — Standing Constraint #2 (no shared entity field-name divergence).
 *
 * SCOPE (Session 6, D1): the SIX product-intake drafting modes only. `synthesis`
 * and `framing` are intermediate modes with NO product intake schema (their
 * ModeOutputSchema is null) and are out of scope for the drafting engine this
 * session — they are a later deliverable. validateModeOutput rejects them rather
 * than silently passing.
 *
 * Version: 1.0 · Session 6 · June 17, 2026
 */

import {
  HUMAN_DECISION_TYPES,
  type ValidationResult,
  type HumanDecisionType,
  type CorrespondenceDraftSchema,
  type ActionItem,
  type ProgramNarrativeSchema,
  type ReportCommentarySchema,
  type VVRDescriptionSchema,
  type GovernanceMemoSchema,
  type RuleChangeProposalSchema,
} from "@sovereign/data";

import type { SCRIBEMode } from "../../sovereign-shell/shell-contract";

/** PR-SCRIBE-001 registry binding — stamped onto Logger events as prompt provenance. */
export const PR_SCRIBE_001 = {
  registryId: "PR-SCRIBE-001",
  file: "prompts/drafting-system-v1.0.md",
  promptVersion: "v1.0",
} as const;

/**
 * The six product-aligned drafting modes that have a canonical @sovereign/data
 * output schema (producesProductIntake: true in modes.ts). These are the D1
 * drafting-engine scope. `synthesis` and `framing` are deliberately excluded.
 */
export type DraftableMode = Exclude<SCRIBEMode, "synthesis" | "framing">;

export const DRAFTABLE_MODES: readonly DraftableMode[] = [
  "correspondence_draft",
  "program_narrative",
  "report_commentary",
  "vvr_description",
  "governance_memo",
  "rule_change_proposal",
];

/** Narrow an arbitrary SCRIBEMode to the draftable subset. */
export function isDraftableMode(mode: SCRIBEMode): mode is DraftableMode {
  return (DRAFTABLE_MODES as readonly string[]).includes(mode);
}

/**
 * The union of canonical output schemas the six draftable modes produce. Each
 * member is the exact @sovereign/data type — no field added, renamed, or dropped.
 */
export type ModeOutput =
  | CorrespondenceDraftSchema
  | ProgramNarrativeSchema
  | ReportCommentarySchema
  | VVRDescriptionSchema
  | GovernanceMemoSchema
  | RuleChangeProposalSchema;

/** Map each draftable mode to its concrete output schema type. */
export interface ModeOutputByMode {
  correspondence_draft: CorrespondenceDraftSchema;
  program_narrative: ProgramNarrativeSchema;
  report_commentary: ReportCommentarySchema;
  vvr_description: VVRDescriptionSchema;
  governance_memo: GovernanceMemoSchema;
  rule_change_proposal: RuleChangeProposalSchema;
}

// ============================================================
// PRIMITIVE GUARDS
// ============================================================

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== "";
}

/** A string[] in which every element is a (non-empty) string. Empty array is allowed. */
function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

/** An optional ISO-ish date string: absent, or a non-empty string. */
function isOptionalString(v: unknown): v is string | undefined {
  return v === undefined || isNonEmptyString(v);
}

/** decision_type, when present, must be a member of the canonical Decision Matrix taxonomy. */
function isValidOptionalDecisionType(v: unknown): v is HumanDecisionType | undefined {
  return v === undefined || (typeof v === "string" && (HUMAN_DECISION_TYPES as readonly string[]).includes(v));
}

function isValidDecisionType(v: unknown): v is HumanDecisionType {
  return typeof v === "string" && (HUMAN_DECISION_TYPES as readonly string[]).includes(v);
}

const REPORT_SECTIONS: readonly ReportCommentarySchema["report_section"][] = [
  "executive_summary",
  "program_status",
  "financial_summary",
  "risks_issues",
  "outlook",
];

function result(errors: string[]): ValidationResult {
  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

function asObject(value: unknown, errors: string[]): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) {
    errors.push("draft must be a non-null object");
    return null;
  }
  return value as Record<string, unknown>;
}

// ============================================================
// PER-MODE VALIDATORS
// Each returns the canonical @sovereign/data ValidationResult.
// ============================================================

/** Correspondence Draft → NEXUS task intake. */
export function validateCorrespondenceDraft(value: unknown): ValidationResult {
  const errors: string[] = [];
  const o = asObject(value, errors);
  if (!o) return result(errors);

  if (!isNonEmptyString(o.subject)) errors.push("subject: required non-empty string");
  if (!isNonEmptyString(o.body)) errors.push("body: required non-empty string");

  if (!Array.isArray(o.action_items)) {
    errors.push("action_items: required array (may be empty)");
  } else {
    o.action_items.forEach((item, i) => {
      const it = item as Partial<ActionItem>;
      if (!isNonEmptyString(it.description)) errors.push(`action_items[${i}].description: required non-empty string`);
      if (!isOptionalString(it.owner_role)) errors.push(`action_items[${i}].owner_role: optional non-empty string`);
      if (!isOptionalString(it.due_date)) errors.push(`action_items[${i}].due_date: optional ISO 8601 string`);
    });
  }

  if (!isOptionalString(o.program_id)) errors.push("program_id: optional non-empty string");
  if (!isOptionalString(o.document_id)) errors.push("document_id: optional non-empty string");
  if (!isValidOptionalDecisionType(o.decision_type)) {
    errors.push(`decision_type: optional — must be one of ${HUMAN_DECISION_TYPES.join(" | ")}`);
  }
  return result(errors);
}

/** Program Narrative → NEXUS / APEX. */
export function validateProgramNarrative(value: unknown): ValidationResult {
  const errors: string[] = [];
  const o = asObject(value, errors);
  if (!o) return result(errors);

  if (!isNonEmptyString(o.program_id)) errors.push("program_id: required non-empty string");
  if (!isNonEmptyString(o.period)) errors.push("period: required non-empty string");
  if (!isNonEmptyString(o.narrative)) errors.push("narrative: required non-empty string");
  if (!isStringArray(o.key_themes)) errors.push("key_themes: required string[]");
  if (!isStringArray(o.risks_noted)) errors.push("risks_noted: required string[]");
  return result(errors);
}

/** Report Commentary → APEX QPR/ABS narrative section. */
export function validateReportCommentary(value: unknown): ValidationResult {
  const errors: string[] = [];
  const o = asObject(value, errors);
  if (!o) return result(errors);

  if (typeof o.report_section !== "string" || !REPORT_SECTIONS.includes(o.report_section as ReportCommentarySchema["report_section"])) {
    errors.push(`report_section: must be one of ${REPORT_SECTIONS.join(" | ")}`);
  }
  if (!isNonEmptyString(o.program_id)) errors.push("program_id: required non-empty string");
  if (!isNonEmptyString(o.commentary)) errors.push("commentary: required non-empty string");
  if (!isStringArray(o.anomalies_addressed)) errors.push("anomalies_addressed: required string[]");
  return result(errors);
}

/** VVR Description → FLOWPATH — frozen fields per Integration Brief §9. */
export function validateVVRDescription(value: unknown): ValidationResult {
  const errors: string[] = [];
  const o = asObject(value, errors);
  if (!o) return result(errors);

  if (!isNonEmptyString(o.step_id)) errors.push("step_id: required non-empty string");
  if (!isNonEmptyString(o.description)) errors.push("description: required non-empty string");
  if (!isStringArray(o.inputs)) errors.push("inputs: required string[]");
  if (!isStringArray(o.outputs)) errors.push("outputs: required string[]");
  if (typeof o.decision_required !== "boolean") errors.push("decision_required: required boolean");
  if (!isNonEmptyString(o.human_role)) errors.push("human_role: required non-empty string");
  if (!isValidOptionalDecisionType(o.decision_type)) {
    errors.push(`decision_type: optional — must be one of ${HUMAN_DECISION_TYPES.join(" | ")}`);
  }
  return result(errors);
}

/** Governance Memo → CPMI. decision_type is REQUIRED here. */
export function validateGovernanceMemo(value: unknown): ValidationResult {
  const errors: string[] = [];
  const o = asObject(value, errors);
  if (!o) return result(errors);

  if (!isNonEmptyString(o.subject)) errors.push("subject: required non-empty string");
  if (!isNonEmptyString(o.cpmi_reference)) errors.push("cpmi_reference: required non-empty string");
  if (!isNonEmptyString(o.decision)) errors.push("decision: required non-empty string");
  if (!isNonEmptyString(o.reasoning)) errors.push("reasoning: required non-empty string");
  if (!isValidDecisionType(o.decision_type)) {
    errors.push(`decision_type: required — must be one of ${HUMAN_DECISION_TYPES.join(" | ")}`);
  }
  return result(errors);
}

/** Rule Change Proposal → ARIA policy-as-data format. */
export function validateRuleChangeProposal(value: unknown): ValidationResult {
  const errors: string[] = [];
  const o = asObject(value, errors);
  if (!o) return result(errors);

  if (!isNonEmptyString(o.rule_id)) errors.push("rule_id: required non-empty string");
  if (!isNonEmptyString(o.current_rule)) errors.push("current_rule: required non-empty string");
  if (!isNonEmptyString(o.proposed_rule)) errors.push("proposed_rule: required non-empty string");
  if (!isNonEmptyString(o.justification)) errors.push("justification: required non-empty string");
  if (!isNonEmptyString(o.regulatory_source)) errors.push("regulatory_source: required non-empty string");
  if (!isOptionalString(o.effective_date)) errors.push("effective_date: optional ISO 8601 string");
  return result(errors);
}

/** Per-mode validator table. Exhaustive over DraftableMode (compile-time enforced). */
const MODE_VALIDATORS: { [M in DraftableMode]: (value: unknown) => ValidationResult } = {
  correspondence_draft: validateCorrespondenceDraft,
  program_narrative: validateProgramNarrative,
  report_commentary: validateReportCommentary,
  vvr_description: validateVVRDescription,
  governance_memo: validateGovernanceMemo,
  rule_change_proposal: validateRuleChangeProposal,
};

/**
 * Validate an LLM-produced (or human-edited, or static-fallback) draft against the
 * canonical output schema for `mode`. The single entry point the engine and the
 * Export gate call. Rejects the two intermediate modes (synthesis / framing),
 * which have no product intake schema and are out of scope this session.
 */
export function validateModeOutput(mode: SCRIBEMode, value: unknown): ValidationResult {
  if (!isDraftableMode(mode)) {
    return {
      valid: false,
      errors: [
        `mode "${mode}" has no product intake schema — synthesis and framing are intermediate modes, not draftable in this session.`,
      ],
    };
  }
  return MODE_VALIDATORS[mode](value);
}

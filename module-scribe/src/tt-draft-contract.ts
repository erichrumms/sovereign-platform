/**
 * SOVEREIGN Platform — module-scribe
 * tt-draft-contract.ts — the Time & Travel drafting output contract (Session 28, D2).
 *
 * tt.travel-drafter and tt.time-drafter extend SCRIBE's drafting engine with the
 * Travel Management and Time & Expense communication modes (docs/17 §8). Both are
 * Time & Travel workflow-layer agents hosted on SCRIBE infrastructure (docs/17 §2 —
 * no new module directory; AIS D-TT5), operating under the two APPROVED, registered
 * prompts (tt/prompts/CHANGELOG.md, v1.0, July 11, 2026).
 *
 * GOVERNANCE NOTE (Session 28 reconciliation, surfaced in handoff): docs/17 §8
 * describes these as "two new drafting modes added to the existing SCRIBE drafting
 * engine", but SCRIBEMode is a shell-contract union (v1.1, GD-2) and GD-21
 * authorizes ONLY the three HumanDecisionType additions — no SCRIBEMode change.
 * The TT communication modes are therefore MODULE-LEVEL taxonomies (this file),
 * not SCRIBEMode members — the same deliberate pattern as Session 27's
 * TimeCompliancePolicyConfig. The five time & expense communication types reuse
 * the canonical CorrectionCommunicationType from @sovereign/data (Standing
 * Constraint #2 — no divergent duplicate); the four travel communication types
 * have no canonical entity type (docs/17 §5.4 defines them in prose) and are
 * defined here.
 *
 * SYSTEM-INVISIBLE (docs/17 §6.4, both prompts): the tool name never appears in an
 * outgoing communication. That rule is enforced structurally here — the validator
 * REJECTS any draft that mentions the platform, an agent id, or an AI system, so a
 * violating draft can never reach the manager review queue.
 *
 * Version: 1.0 · Session 28 · July 12, 2026
 */

import type {
  ValidationResult,
  TravelRequest,
  ComplianceFlag,
  CorrectionCommunicationType,
} from "@sovereign/data";

// ============================================================
// AGENT IDS + PROMPT REGISTRY BINDINGS
// ============================================================

export const TT_TRAVEL_DRAFTER = "tt.travel-drafter";
export const TT_TIME_DRAFTER = "tt.time-drafter";

/** Registry binding stamped onto Logger events as prompt provenance (AIS D-TT5). */
export const TT_TRAVEL_PROMPT_REGISTRATION = {
  file: "tt/prompts/travel_drafting_system.md",
  promptVersion: "v1.0",
} as const;

export const TT_TIME_PROMPT_REGISTRATION = {
  file: "tt/prompts/time_drafting_system.md",
  promptVersion: "v1.0",
} as const;

// ============================================================
// COMMUNICATION TYPE TAXONOMIES
// ============================================================

/**
 * The four travel communication templates (docs/17 §5.4). Module-level taxonomy —
 * see the governance note in the header.
 */
export type TravelCommunicationType =
  | "APPROVAL_NOTICE"
  | "INFORMATION_REQUEST"
  | "ESCALATION_NOTICE"
  | "DENIAL_NOTICE";

export const TRAVEL_COMMUNICATION_TYPES: readonly TravelCommunicationType[] = [
  "APPROVAL_NOTICE",
  "INFORMATION_REQUEST",
  "ESCALATION_NOTICE",
  "DENIAL_NOTICE",
];

/**
 * The five time & expense communication templates ARE the canonical
 * CorrectionCommunicationType (docs/17 §6.4 == CorrectionRecord.communication_type).
 * Re-exported under the drafting-layer name; not redefined (Constraint #2).
 */
export type TimeCommunicationType = CorrectionCommunicationType;

export const TIME_COMMUNICATION_TYPES: readonly TimeCommunicationType[] = [
  "ERROR_CORRECTION",
  "CLARIFICATION_REQUEST",
  "JUSTIFICATION_REQUEST",
  "PATTERN_FLAG_NOTICE",
  "FORMAL_ESCALATION",
];

// ============================================================
// COMMUNICATION TYPE SELECTION — deterministic, from governed data.
// The drafter never chooses an outcome; it drafts the communication the
// routing/compliance state already implies (docs/17 §1).
// ============================================================

/**
 * Which of the four travel templates a request's current state calls for
 * (travel prompt, "What you draft"). Deterministic:
 *   - informationNeeded present and non-empty → INFORMATION_REQUEST (the engine
 *     flagged specific fields as needing clarification before routing)
 *   - status APPROVED → APPROVAL_NOTICE
 *   - status DENIED → DENIAL_NOTICE
 *   - status ESCALATED, or routing_tier ESCALATE while awaiting decision →
 *     ESCALATION_NOTICE
 * Throws for a state with no communication (DRAFT / SUBMITTED / ROUTED-standard):
 * a draft with no documented template is a caller bug, not a draftable state.
 */
export function selectTravelCommunicationType(
  request: TravelRequest,
  informationNeeded?: readonly string[]
): TravelCommunicationType {
  if (informationNeeded !== undefined && informationNeeded.length > 0) {
    return "INFORMATION_REQUEST";
  }
  if (request.status === "APPROVED") return "APPROVAL_NOTICE";
  if (request.status === "DENIED") return "DENIAL_NOTICE";
  if (request.status === "ESCALATED" || request.routing_tier === "ESCALATE") {
    return "ESCALATION_NOTICE";
  }
  throw new Error(
    `tt.travel-drafter: no travel communication template applies to status ${request.status}` +
      ` (routing_tier ${request.routing_tier ?? "unset"}) — nothing to draft`
  );
}

/**
 * Which of the five time & expense templates a compliance flag calls for
 * (docs/17 §6.1 default responses + §6.2 recurrence upgrade). Deterministic:
 *   - an upgraded communication type from tt.escalation-monitor (FORMAL_ESCALATION
 *     at/beyond the recurrence threshold) takes precedence — the monitor already
 *     decided the upgrade; the drafter never re-decides it
 *   - PATTERN_DRIFT → PATTERN_FLAG_NOTICE (informational, docs/17 §6.1)
 *   - JUSTIFICATION_ABSENCE → JUSTIFICATION_REQUEST
 *   - severity ERROR → ERROR_CORRECTION
 *   - remaining WARNING categories → CLARIFICATION_REQUEST
 */
export function selectTimeCommunicationType(
  flag: ComplianceFlag,
  upgradedType?: CorrectionCommunicationType
): TimeCommunicationType {
  if (upgradedType === "FORMAL_ESCALATION") return "FORMAL_ESCALATION";
  if (flag.rule_category === "PATTERN_DRIFT") return "PATTERN_FLAG_NOTICE";
  if (flag.rule_category === "JUSTIFICATION_ABSENCE") return "JUSTIFICATION_REQUEST";
  if (flag.severity === "ERROR") return "ERROR_CORRECTION";
  return "CLARIFICATION_REQUEST";
}

// ============================================================
// DRAFT OUTPUT SHAPE + VALIDATION
// ============================================================

/**
 * A drafted TT communication, parsed from the model's plain-prose output (both
 * prompts: "a subject line (if applicable) followed by the body"). NEVER sent by
 * the system — the manager reviews, adjusts, and sends (docs/17 §1).
 */
export interface TTDraft {
  /** The communication template this draft realizes. */
  communication_type: TravelCommunicationType | TimeCommunicationType;
  /** Subject line, when the communication type carries one. */
  subject?: string;
  /** The communication body, plain prose. */
  body: string;
}

/**
 * Substrings that must NEVER appear in an outgoing communication — the
 * system-invisibility rule (docs/17 §6.4 "tool is invisible"; both prompts'
 * "Voice and disclosure"). \b-bounded / case-chosen to avoid false positives
 * on ordinary prose ("air", "detail", "said").
 */
const SYSTEM_DISCLOSURE_PATTERNS: readonly RegExp[] = [
  /\bSOVEREIGN\b/i,
  /\bSCRIBE\b/i,
  /\btt\.[a-z][a-z-]*\b/i, // any tt.* agent id
  /\bAI\b/, // case-sensitive — "AI" the initialism, not "air"/"said"
  /\bartificial intelligence\b/i,
  /\blanguage model\b/i,
  /\bLLM\b/,
  /\bautomated system\b/i,
  /\bcompliance engine\b/i,
];

/** True when the text discloses the system — grounds for validation rejection. */
export function disclosesSystem(text: string): boolean {
  return SYSTEM_DISCLOSURE_PATTERNS.some((p) => p.test(text));
}

function result(errors: string[]): ValidationResult {
  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * Validate a parsed TT draft before it is shown in the manager review queue.
 * Checks shape, taxonomy membership, and the system-invisibility rule. Run on
 * the LLM output AND re-run by the export gate on the human-edited draft.
 */
export function validateTTDraft(value: unknown): ValidationResult {
  const errors: string[] = [];
  if (typeof value !== "object" || value === null) {
    return result(["draft must be a non-null object"]);
  }
  const d = value as Partial<TTDraft>;

  const allTypes: readonly string[] = [...TRAVEL_COMMUNICATION_TYPES, ...TIME_COMMUNICATION_TYPES];
  if (typeof d.communication_type !== "string" || !allTypes.includes(d.communication_type)) {
    errors.push(`communication_type: must be one of ${allTypes.join(" | ")}`);
  }
  if (typeof d.body !== "string" || d.body.trim() === "") {
    errors.push("body: required non-empty string");
  }
  if (d.subject !== undefined && (typeof d.subject !== "string" || d.subject.trim() === "")) {
    errors.push("subject: must be a non-empty string when present");
  }

  const prose = `${d.subject ?? ""}\n${typeof d.body === "string" ? d.body : ""}`;
  if (disclosesSystem(prose)) {
    errors.push(
      "system-invisibility violation: the draft references the platform, an agent, or an AI system — " +
        "the tool name never appears in outgoing communications (docs/17 §6.4)"
    );
  }
  return result(errors);
}

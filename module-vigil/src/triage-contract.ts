/**
 * SOVEREIGN Platform — module-vigil
 * triage-contract.ts — the VIGIL Anomaly Triage brief contract (PR-VIGIL-001).
 *
 * Defines the triage-brief shape the vigil-triage-analyst prompt returns, a runtime
 * validator for it (the brief is validated BEFORE it is shown to the operator —
 * spec §2.3 / prompt "Output format — STRICT"), and the eligibility rule for which
 * alert types may be triaged (spec §2.3: ANOMALY_DETECTED / CPMI_DRIFT_DETECTED /
 * CASCADE_RISK only — honeytoken triggers have clear factual interpretations and are
 * out of scope).
 *
 * The triage brief is ADVISORY (Gate 3): VIGIL shows it; the operator decides. It is
 * not an entity in @sovereign/data, so the ValidationResult shape is reused from the
 * canonical package (Standing Constraint #2 — do not redefine shared shapes).
 *
 * Version: 1.0 · Session 7 · June 18, 2026
 */

import type { ValidationResult } from "@sovereign/data";

import type { AlertType } from "./vigil-types";

/** PR-VIGIL-001 registry binding — stamped onto Logger events as prompt provenance. */
export const PR_VIGIL_001 = {
  registryId: "PR-VIGIL-001",
  file: "prompts/triage-system-v1.0.md",
  promptVersion: "v1.0",
} as const;

/** One ranked likely cause (prompt: array of `{ cause, likelihood }`). */
export interface LikelyCause {
  cause: string;
  /** A likelihood label (e.g. "high" | "medium" | "low") — model-supplied, ranked. */
  likelihood: string;
}

/** The triage brief — the single JSON object the analyst returns (prompt §What you produce). */
export interface TriageBrief {
  likely_causes: LikelyCause[];
  recommended_steps: string[];
  /** Integer 0–100. */
  false_positive_likelihood: number;
  false_positive_explanation: string;
}

/** Alert types eligible for AI triage (spec §2.3). Honeytoken et al. are excluded. */
export const TRIAGE_ELIGIBLE_ALERT_TYPES: readonly AlertType[] = [
  "ANOMALY_DETECTED",
  "CPMI_DRIFT_DETECTED",
  "CASCADE_RISK",
];

/** Whether the Anomaly Triage Assistant is available for this alert type (spec §2.3). */
export function isTriageEligible(alertType: AlertType): boolean {
  return TRIAGE_ELIGIBLE_ALERT_TYPES.includes(alertType);
}

/**
 * Validate a candidate triage brief before it is shown to the operator. Mirrors the
 * prompt's "What you produce" shape exactly. Returns the canonical ValidationResult.
 */
export function validateTriageBrief(value: unknown): ValidationResult {
  if (typeof value !== "object" || value === null) {
    return { valid: false, errors: ["triage brief must be a non-null object"] };
  }
  const errors: string[] = [];
  const b = value as Partial<TriageBrief>;

  if (
    !Array.isArray(b.likely_causes) ||
    b.likely_causes.length === 0 ||
    !b.likely_causes.every(
      (c) =>
        typeof c === "object" &&
        c !== null &&
        typeof (c as LikelyCause).cause === "string" &&
        (c as LikelyCause).cause.trim() !== "" &&
        typeof (c as LikelyCause).likelihood === "string" &&
        (c as LikelyCause).likelihood.trim() !== ""
    )
  ) {
    errors.push("likely_causes: must be a non-empty array of { cause, likelihood } strings");
  }
  if (
    !Array.isArray(b.recommended_steps) ||
    b.recommended_steps.length === 0 ||
    !b.recommended_steps.every((s) => typeof s === "string" && s.trim() !== "")
  ) {
    errors.push("recommended_steps: must be a non-empty array of strings");
  }
  if (
    typeof b.false_positive_likelihood !== "number" ||
    !Number.isInteger(b.false_positive_likelihood) ||
    b.false_positive_likelihood < 0 ||
    b.false_positive_likelihood > 100
  ) {
    errors.push("false_positive_likelihood: must be an integer 0–100");
  }
  if (typeof b.false_positive_explanation !== "string" || b.false_positive_explanation.trim() === "") {
    errors.push("false_positive_explanation: required non-empty string");
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

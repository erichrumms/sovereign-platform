/**
 * SOVEREIGN Platform — module-counsel
 * analysis-contract.ts — the AnalysisResult output contract for the COUNSEL
 * Analysis Engine (PR-COUNSEL-001).
 *
 * Two halves of one contract live here:
 *   1. The TypeScript shape the PR-COUNSEL-001 prompt promises to return
 *      (AnalysisResult and its parts).
 *   2. A runtime validator (validateAnalysisResult) the Analysis Engine runs on
 *      the LLM's JSON BEFORE showing it to the user — an LLM that returns
 *      malformed or under-specified output is rejected, never displayed
 *      (spec §3: "validated against schema"; CPMI-VRS Gate 2 discipline).
 *
 * This is COUNSEL-internal session data, not a canonical shared entity (the final
 * DecisionRecord conforms to the canonical Document entity from @sovereign/data;
 * AnalysisResult does not). It therefore lives in the module, not in sovereign-data.
 * The validator returns the canonical ValidationResult shape from @sovereign/data.
 *
 * Version: 1.0 · Session 4 · June 15, 2026
 */

import type { ValidationResult } from "@sovereign/data";

/** PR-COUNSEL-001 registry binding — stamped onto Logger events as prompt provenance. */
export const PR_COUNSEL_001 = {
  registryId: "PR-COUNSEL-001",
  file: "prompts/analysis-system-v1.0.md",
  promptVersion: "v1.0",
} as const;

export type RiskSeverity = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
export const RISK_SEVERITIES: readonly RiskSeverity[] = [
  "LOW",
  "MODERATE",
  "HIGH",
  "CRITICAL",
];

/** The minimum number of distinct alternatives the Analysis Engine requires. */
export const MIN_ALTERNATIVES = 3;

export interface Alternative {
  id: string; // "ALT-1", "ALT-2", ... — unique within the result
  label: string;
  summary: string;
  pros: string[];
  cons: string[];
}

export interface RiskScenario {
  alternativeId: string; // references an Alternative.id
  scenario: string;
  severity: RiskSeverity;
}

export interface AssumptionFlag {
  assumption: string;
  concern: string;
}

export interface AnalysisResult {
  alternatives: Alternative[]; // >= MIN_ALTERNATIVES
  riskScenarios: RiskScenario[]; // exactly one per alternative
  assumptionFlags: AssumptionFlag[]; // may be empty
  confidenceScore: number; // integer 0–100
  recommendedNextAction: string;
  /**
   * Provenance attached by the Analysis Engine hook in the three-tier fallback
   * (live → cache → static), NOT produced by the LLM. Optional and not required
   * by the validator, which validates the model's own output shape.
   */
  source?: "live" | "cache" | "static";
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== "";
}

function isNonEmptyStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.length > 0 && v.every(isNonEmptyString);
}

/**
 * Validate an LLM-produced (or fallback) AnalysisResult. Returns the canonical
 * ValidationResult. Run this before any AnalysisResult reaches the user.
 */
export function validateAnalysisResult(value: unknown): ValidationResult {
  if (typeof value !== "object" || value === null) {
    return { valid: false, errors: ["analysis result must be a non-null object"] };
  }

  const errors: string[] = [];
  const r = value as Partial<AnalysisResult>;

  // --- alternatives (>= MIN_ALTERNATIVES, unique ids) -----------------------
  const altIds = new Set<string>();
  const alts = r.alternatives;
  if (!Array.isArray(alts) || alts.length < MIN_ALTERNATIVES) {
    errors.push(`alternatives: must be an array of at least ${MIN_ALTERNATIVES}`);
  } else {
    alts.forEach((a, i) => {
      const alt = a as Partial<Alternative>;
      if (!isNonEmptyString(alt.id)) {
        errors.push(`alternatives[${i}].id: required non-empty string`);
      } else if (altIds.has(alt.id)) {
        errors.push(`alternatives[${i}].id: duplicate "${alt.id}"`);
      } else {
        altIds.add(alt.id);
      }
      if (!isNonEmptyString(alt.label)) errors.push(`alternatives[${i}].label: required non-empty string`);
      if (!isNonEmptyString(alt.summary)) errors.push(`alternatives[${i}].summary: required non-empty string`);
      if (!isNonEmptyStringArray(alt.pros)) errors.push(`alternatives[${i}].pros: required non-empty string[]`);
      if (!isNonEmptyStringArray(alt.cons)) errors.push(`alternatives[${i}].cons: required non-empty string[]`);
    });
  }

  // --- riskScenarios (one per alternative, valid ref, valid severity) -------
  const risks = r.riskScenarios;
  if (!Array.isArray(risks)) {
    errors.push("riskScenarios: must be an array");
  } else {
    if (Array.isArray(alts) && risks.length !== alts.length) {
      errors.push(
        `riskScenarios: must have exactly one per alternative (got ${risks.length} for ${alts.length} alternatives)`
      );
    }
    const covered = new Set<string>();
    risks.forEach((s, i) => {
      const rs = s as Partial<RiskScenario>;
      if (!isNonEmptyString(rs.alternativeId) || !altIds.has(rs.alternativeId)) {
        errors.push(`riskScenarios[${i}].alternativeId: must reference an existing alternative id`);
      } else if (covered.has(rs.alternativeId)) {
        errors.push(`riskScenarios[${i}].alternativeId: duplicate coverage of "${rs.alternativeId}"`);
      } else {
        covered.add(rs.alternativeId);
      }
      if (!isNonEmptyString(rs.scenario)) errors.push(`riskScenarios[${i}].scenario: required non-empty string`);
      if (typeof rs.severity !== "string" || !RISK_SEVERITIES.includes(rs.severity as RiskSeverity)) {
        errors.push(`riskScenarios[${i}].severity: must be one of ${RISK_SEVERITIES.join(" | ")}`);
      }
    });
  }

  // --- assumptionFlags (array, may be empty; each well-formed) --------------
  const flags = r.assumptionFlags;
  if (!Array.isArray(flags)) {
    errors.push("assumptionFlags: must be an array");
  } else {
    flags.forEach((f, i) => {
      const af = f as Partial<AssumptionFlag>;
      if (!isNonEmptyString(af.assumption)) errors.push(`assumptionFlags[${i}].assumption: required non-empty string`);
      if (!isNonEmptyString(af.concern)) errors.push(`assumptionFlags[${i}].concern: required non-empty string`);
    });
  }

  // --- confidenceScore (integer 0–100) --------------------------------------
  if (
    typeof r.confidenceScore !== "number" ||
    !Number.isInteger(r.confidenceScore) ||
    r.confidenceScore < 0 ||
    r.confidenceScore > 100
  ) {
    errors.push("confidenceScore: must be an integer 0–100");
  }

  // --- recommendedNextAction ------------------------------------------------
  if (!isNonEmptyString(r.recommendedNextAction)) {
    errors.push("recommendedNextAction: required non-empty string");
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

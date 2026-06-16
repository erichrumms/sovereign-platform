/**
 * SOVEREIGN Platform — module-counsel
 * premortem-contract.ts — the Pre-Mortem Studio output contract (PR-COUNSEL-003).
 *
 * Two halves of one contract live here:
 *   1. The TypeScript shape the PR-COUNSEL-003 prompt promises to return
 *      (PreMortemResult and its FailureMode parts) — the AnalysisResult
 *      "preMortemResult" extension named in COUNSEL spec §3.
 *   2. A runtime validator (validatePreMortemResult) the studio runs on the LLM's
 *      JSON BEFORE showing it to the user — malformed or under-specified output is
 *      rejected, never displayed (spec §3; CPMI-VRS Gate 2 discipline).
 *
 * Like AnalysisResult, this is COUNSEL-internal transient session data, not a
 * canonical shared entity — it lives in the module, not in sovereign-data. The
 * validator returns the canonical ValidationResult shape from @sovereign/data.
 * `severity` reuses RiskSeverity from analysis-contract (one severity taxonomy in
 * COUNSEL); `likelihood` is a pre-mortem-specific three-value scale.
 *
 * Version: 1.0 · Session 5 · June 16, 2026
 */

import type { ValidationResult } from "@sovereign/data";

import { RISK_SEVERITIES, type RiskSeverity } from "./analysis-contract";

/** PR-COUNSEL-003 registry binding — stamped onto Logger events as prompt provenance. */
export const PR_COUNSEL_003 = {
  registryId: "PR-COUNSEL-003",
  file: "prompts/premortem-system-v1.0.md",
  promptVersion: "v1.0",
} as const;

export type FailureLikelihood = "LOW" | "MODERATE" | "HIGH";
export const FAILURE_LIKELIHOODS: readonly FailureLikelihood[] = ["LOW", "MODERATE", "HIGH"];

/** The minimum number of distinct failure modes the Pre-Mortem Studio requires. */
export const MIN_FAILURE_MODES = 2;

/**
 * One failure mode produced across the three pre-mortem steps (imagine → causes →
 * detect + prevent). The exact shape the PR-COUNSEL-003 prompt returns per entry.
 */
export interface FailureMode {
  id: string; // "FM-1", "FM-2", ... — unique within the result
  /** Step 1: a concrete account written as if the failure already happened. */
  failureNarrative: string;
  /** Step 2: the causes that produced the failure. */
  rootCauses: string[];
  /** Step 3a: observable signals appearing before the failure is irreversible. */
  earlyWarnings: string[];
  /** Step 3b: actions available now that reduce likelihood or impact. */
  preventiveActions: string[];
  severity: RiskSeverity;
  likelihood: FailureLikelihood;
}

export interface PreMortemResult {
  failureModes: FailureMode[]; // >= MIN_FAILURE_MODES
  overallVulnerability: RiskSeverity;
  topPreventiveAction: string;
  /**
   * Serving tier attached by the engine's three-tier fallback (live → cache →
   * static), NOT produced by the LLM. Optional; the validator checks the model's
   * own output shape only.
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
 * Validate an LLM-produced (or fallback) PreMortemResult. Returns the canonical
 * ValidationResult. Run this before any pre-mortem reaches the user.
 */
export function validatePreMortemResult(value: unknown): ValidationResult {
  if (typeof value !== "object" || value === null) {
    return { valid: false, errors: ["pre-mortem result must be a non-null object"] };
  }

  const errors: string[] = [];
  const r = value as Partial<PreMortemResult>;

  // --- failureModes (>= MIN_FAILURE_MODES, unique ids, all steps present) ---
  const ids = new Set<string>();
  const modes = r.failureModes;
  if (!Array.isArray(modes) || modes.length < MIN_FAILURE_MODES) {
    errors.push(`failureModes: must be an array of at least ${MIN_FAILURE_MODES}`);
  } else {
    modes.forEach((m, i) => {
      const fm = m as Partial<FailureMode>;
      if (!isNonEmptyString(fm.id)) {
        errors.push(`failureModes[${i}].id: required non-empty string`);
      } else if (ids.has(fm.id)) {
        errors.push(`failureModes[${i}].id: duplicate "${fm.id}"`);
      } else {
        ids.add(fm.id);
      }
      if (!isNonEmptyString(fm.failureNarrative)) {
        errors.push(`failureModes[${i}].failureNarrative: required non-empty string`);
      }
      if (!isNonEmptyStringArray(fm.rootCauses)) {
        errors.push(`failureModes[${i}].rootCauses: required non-empty string[]`);
      }
      if (!isNonEmptyStringArray(fm.earlyWarnings)) {
        errors.push(`failureModes[${i}].earlyWarnings: required non-empty string[]`);
      }
      if (!isNonEmptyStringArray(fm.preventiveActions)) {
        errors.push(`failureModes[${i}].preventiveActions: required non-empty string[]`);
      }
      if (typeof fm.severity !== "string" || !RISK_SEVERITIES.includes(fm.severity as RiskSeverity)) {
        errors.push(`failureModes[${i}].severity: must be one of ${RISK_SEVERITIES.join(" | ")}`);
      }
      if (typeof fm.likelihood !== "string" || !FAILURE_LIKELIHOODS.includes(fm.likelihood as FailureLikelihood)) {
        errors.push(`failureModes[${i}].likelihood: must be one of ${FAILURE_LIKELIHOODS.join(" | ")}`);
      }
    });
  }

  // --- overallVulnerability ---
  if (typeof r.overallVulnerability !== "string" || !RISK_SEVERITIES.includes(r.overallVulnerability as RiskSeverity)) {
    errors.push(`overallVulnerability: must be one of ${RISK_SEVERITIES.join(" | ")}`);
  }

  // --- topPreventiveAction ---
  if (!isNonEmptyString(r.topPreventiveAction)) {
    errors.push("topPreventiveAction: required non-empty string");
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

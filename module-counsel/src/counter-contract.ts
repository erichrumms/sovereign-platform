/**
 * SOVEREIGN Platform — module-counsel
 * counter-contract.ts — the Counterargument Mode output contract (PR-COUNSEL-002).
 *
 * Two halves of one contract live here:
 *   1. The TypeScript shape the PR-COUNSEL-002 prompt promises to return per turn
 *      (CounterargumentChallenge) plus the session-level rollup the UI assembles
 *      (CounterargumentSummary — the AnalysisResult extension named in COUNSEL
 *      spec §3).
 *   2. A runtime validator (validateCounterargumentChallenge) the engine runs on
 *      the LLM's JSON BEFORE showing it to the user — malformed or under-specified
 *      output is rejected, never displayed (spec §3; CPMI-VRS Gate 2 discipline).
 *
 * Like AnalysisResult, this is COUNSEL-internal transient session data, not a
 * canonical shared entity — it lives in the module, not in sovereign-data. The
 * validator returns the canonical ValidationResult shape from @sovereign/data.
 * RiskSeverity is reused from analysis-contract (one severity taxonomy in COUNSEL).
 *
 * Version: 1.0 · Session 5 · June 16, 2026
 */

import type { ValidationResult } from "@sovereign/data";

import { RISK_SEVERITIES, type RiskSeverity } from "./analysis-contract";

/** PR-COUNSEL-002 registry binding — stamped onto Logger events as prompt provenance. */
export const PR_COUNSEL_002 = {
  registryId: "PR-COUNSEL-002",
  file: "prompts/counter-system-v1.0.md",
  promptVersion: "v1.0",
} as const;

/**
 * One adversarial turn produced by counsel-analyst in Counterargument Mode.
 * This is the exact shape the PR-COUNSEL-002 prompt returns and the validator
 * checks before display.
 */
export interface CounterargumentChallenge {
  /** The single sharpest adversarial push against the leaning alternative this turn. */
  challengeToPosition: string;
  /** At least one concrete weakness in the position or the human's latest defense. */
  weaknesses: string[];
  /** Steelman of the strongest case for choosing differently. */
  strongestOpposingCase: string;
  /** What the position legitimately gets right — mandatory, never blank. */
  concession: string;
  /** Specific facts/judgments the frame does not settle (may be empty). */
  openQuestions: string[];
  /** How serious the unrebutted concern is. */
  pressureLevel: RiskSeverity;
  /**
   * Serving tier attached by the engine's three-tier fallback (live → cache →
   * static), NOT produced by the LLM. Optional; the validator checks the model's
   * own output shape only.
   */
  source?: "live" | "cache" | "static";
}

/**
 * Session-level rollup of a Counterargument dialogue on one alternative. Assembled
 * client-side across turns; the AnalysisResult "counterargumentSummary" extension
 * (COUNSEL spec §3). Not LLM output — not validated by the turn validator.
 */
export interface CounterargumentSummary {
  /** The alternative that was challenged (references an Alternative.id). */
  targetAlternativeId: string;
  /** The challenge turns, in order. */
  turns: CounterargumentChallenge[];
  /**
   * The human's own conclusion after the dialogue: did the position survive the
   * challenge? Set by the user — COUNSEL advises, the human decides.
   */
  positionSurvived: boolean;
  /** The human's plain-language net takeaway from the dialogue. */
  netAssessment: string;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== "";
}

function isNonEmptyStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.length > 0 && v.every(isNonEmptyString);
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(isNonEmptyString);
}

/**
 * Validate an LLM-produced (or fallback) CounterargumentChallenge. Returns the
 * canonical ValidationResult. Run this before any challenge reaches the user.
 */
export function validateCounterargumentChallenge(value: unknown): ValidationResult {
  if (typeof value !== "object" || value === null) {
    return { valid: false, errors: ["counterargument challenge must be a non-null object"] };
  }

  const errors: string[] = [];
  const c = value as Partial<CounterargumentChallenge>;

  if (!isNonEmptyString(c.challengeToPosition)) {
    errors.push("challengeToPosition: required non-empty string");
  }
  if (!isNonEmptyStringArray(c.weaknesses)) {
    errors.push("weaknesses: required non-empty string[]");
  }
  if (!isNonEmptyString(c.strongestOpposingCase)) {
    errors.push("strongestOpposingCase: required non-empty string");
  }
  if (!isNonEmptyString(c.concession)) {
    errors.push("concession: required non-empty string (the position's real strength)");
  }
  if (!isStringArray(c.openQuestions)) {
    errors.push("openQuestions: must be an array of non-empty strings (may be empty)");
  }
  if (typeof c.pressureLevel !== "string" || !RISK_SEVERITIES.includes(c.pressureLevel as RiskSeverity)) {
    errors.push(`pressureLevel: must be one of ${RISK_SEVERITIES.join(" | ")}`);
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

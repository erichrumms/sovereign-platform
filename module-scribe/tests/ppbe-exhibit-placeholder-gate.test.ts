/**
 * module-scribe — ppbe-exhibit-placeholder-gate.test.ts
 * F-51 follow-on (Session 126, D4). Extends the Session 124/125 placeholder-rejection
 * gate to the PPBE exhibit validator (validatePPBEExhibitDraft), which — like
 * validateModeOutput and validateTTDraft — checked shape, figure traceability, and
 * system invisibility, but not whether a schema-VALID draft was still nothing but an
 * unedited static-fallback notice.
 *
 * PPBE's static tier (ppbe-exhibit-engine.ts staticExhibitDraft) is genuinely
 * distinct from a pure-template fallback: its figures and citations ARE assembled
 * from real governed records. Only the narrative carries the STATIC_NOTICE, which as
 * of Session 126 is built FROM FALLBACK_SENTINELS.unavailableCore, so the same
 * detector the six SCRIBE modes and TT use recognizes it here (Rule 11 — one detector,
 * one source of truth). The reviewing official must complete the document from the
 * cited records before it can pass the sign-off gate.
 *
 * Two proofs per document mode (matching tt-draft-placeholder-gate.test.ts):
 *   (a) fresh, unedited static-fallback draft FAILS validatePPBEExhibitDraft
 *   (b) the same draft with real narrative content substituted PASSES
 *
 * Node env; no React, no network.
 */

import type { EvaluationFinding, ObligationRecord, ProgramRecord } from "@sovereign/data";

import {
  PPBE_DOCUMENT_MODES,
  validatePPBEExhibitDraft,
  type PPBEExhibitDraft,
} from "../src/ppbe-exhibit-contract";
import {
  allowedSourceRefs,
  staticExhibitDraft,
  type ExhibitDraftInput,
} from "../src/ppbe-exhibit-engine";
import { isUnfilledPlaceholder } from "../src/draft-contract";

// ---------- minimal governed-record fixtures ----------

function program(): ProgramRecord {
  return {
    program_id: "PRG-001",
    name: "Logistics Data Interchange",
    sponsor: "PEO Logistics",
    contract_number: "W91-26-C-0001",
    classification_level: "UNCLASSIFIED",
    status: "ACTIVE",
    objective_id: "SO-2027-01",
    fiscal_year: "FY 2027",
    lifecycle_cost_estimate: 1000000,
    obligation_plan: [
      { period: "FY 2027 Q1", planned_amount: 100000 },
      { period: "FY 2027 Q2", planned_amount: 200000 },
    ],
    performance_baseline: [{ metric: "obligation rate", baseline_value: "on plan" }],
  };
}

function obligation(id: string, amount: number): ObligationRecord {
  return {
    obligation_id: id,
    program_id: "PRG-001",
    cost_code: "CC-1",
    amount,
    timestamp: "2026-07-12T15:30:00Z",
    authorizing_official: "Jane Smith",
    workflow_step_id: `ppbe-obligation-${id}`,
  };
}

function finding(id: string, feeds: boolean): EvaluationFinding {
  return {
    finding_id: id,
    program_id: "PRG-001",
    objective_id: "SO-2027-01",
    finding_type: feeds ? "on-track" : "variance",
    narrative: `Finding ${id}.`,
    feeds_planning_cycle: feeds,
    workflow_step_id: `ppbe-finding-${id}`,
  };
}

function input(over: Partial<ExhibitDraftInput> = {}): ExhibitDraftInput {
  return {
    mode: "BUDGET_EXHIBIT",
    program: program(),
    obligations: [obligation("OB-1", 90000), obligation("OB-2", 45000)],
    plan_source_step_id: "flowpath-ppbe-plan-PRG-001",
    ...over,
  };
}

/** Deep-copy a draft, replacing every unedited-placeholder string with real content. */
function fillPlaceholders<T>(value: T): T {
  if (typeof value === "string") {
    return (isUnfilledPlaceholder(value)
      ? "The reviewing official completed this exhibit from the cited governed records."
      : value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => fillPlaceholders(v)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = fillPlaceholders(v);
    return out as T;
  }
  return value;
}

/** Static-fallback input for a given mode — Evaluation Report needs findings. */
function staticInputFor(mode: (typeof PPBE_DOCUMENT_MODES)[number]): ExhibitDraftInput {
  return input({
    mode,
    findings: mode === "EVALUATION_REPORT" ? [finding("EF-1", true), finding("EF-2", false)] : undefined,
  });
}

describe("F-51 follow-on — validatePPBEExhibitDraft rejects unedited static fallback, per document mode", () => {
  it.each(PPBE_DOCUMENT_MODES)("(a) %s: fresh static fallback FAILS the placeholder gate", (mode) => {
    const si = staticInputFor(mode);
    const draft: PPBEExhibitDraft = staticExhibitDraft(si);
    // Sanity: the static fallback narrative genuinely still carries an unedited sentinel.
    expect(isUnfilledPlaceholder(draft.narrative)).toBe(true);
    const check = validatePPBEExhibitDraft(draft, allowedSourceRefs(si));
    expect(check.valid).toBe(false);
    expect((check as { valid: false; errors: string[] }).errors.join(" ")).toMatch(/placeholder/);
  });

  it.each(PPBE_DOCUMENT_MODES)("(b) %s: same draft with real narrative content PASSES", (mode) => {
    const si = staticInputFor(mode);
    const filled = fillPlaceholders(staticExhibitDraft(si));
    // Figures still cite only real governed records — traceability is untouched by the fill.
    expect(validatePPBEExhibitDraft(filled, allowedSourceRefs(si))).toEqual({ valid: true });
  });
});

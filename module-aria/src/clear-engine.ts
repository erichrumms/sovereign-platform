/**
 * SOVEREIGN Platform — module-aria
 * clear-engine.ts — the CLEAR deterministic rule-evaluation core (Stage 6, Session 23 · D4).
 *
 * CLEAR evaluates an output against four regulatory sources and returns a structured,
 * fully deterministic result: the SAME input always produces the SAME findings,
 * compliance verdict, and applicable-source list. There is NO randomness and NO LLM
 * call anywhere in this engine (docs/16 §1/§3) — its authority rests on that fact. The
 * only non-deterministic value, the evaluation timestamp, is supplied by the caller so
 * the rule core itself stays referentially transparent and testable.
 *
 * REGULATORY SOURCES (D4): the four governance summaries live on disk in
 *   module-aria/data/regulatory-sources/ — omba11.md, evidence-act.md,
 *   anti-deficiency-act.md, dod-ppbe-reform.md. They are the human-readable source of
 *   record for the rules below. module-aria is a browser ESM module (it mounts via
 *   react-dom/client) and its tsconfig is `moduleResolution: bundler` with no Node
 *   types, so this engine does NOT read the filesystem at runtime — it carries the
 *   typed REGULATORY_SOURCES registry that binds each rule to its source file, and a
 *   Node-side test (tests/clear-engine.test.ts) reads the four files and asserts they
 *   bind to this registry, proving the sources are present and authoritative at startup.
 *   (Spec-vs-codebase reconciliation — recorded in the Session 23 handoff.)
 *
 * The aria.rules-engine agent_id appears on every ARIA_COMPLIANCE_CHECK event this
 * engine emits (emitComplianceCheck).
 *
 * Version: 1.0 · Session 23 (D4) · June 29, 2026
 */

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  DATA_QUALITY_THRESHOLD,
  severityForDataQuality,
  type ClearEvaluation,
  type ClearEvaluationInput,
  type Finding,
  type RegulatorySource,
  type RegulatorySourceId,
} from "./clear-types";

/** The deterministic governance agent identity on every CLEAR Logger event (Agent Identity Standard). */
export const ARIA_RULES_ENGINE_AGENT_ID = "aria.rules-engine";

/**
 * The four regulatory sources CLEAR evaluates against. The `fileName` of each binds the
 * rule set to its on-disk governance summary in module-aria/data/regulatory-sources/.
 */
export const REGULATORY_SOURCES: readonly RegulatorySource[] = [
  { id: "omba11", fileName: "omba11.md", title: "OMB Circular A-11" },
  { id: "evidence-act", fileName: "evidence-act.md", title: "Evidence Act" },
  { id: "anti-deficiency-act", fileName: "anti-deficiency-act.md", title: "Anti-Deficiency Act" },
  { id: "dod-ppbe-reform", fileName: "dod-ppbe-reform.md", title: "DoD PPBE Reform" },
];

const SOURCE_TITLE: Record<RegulatorySourceId, string> = REGULATORY_SOURCES.reduce(
  (acc, s) => {
    acc[s.id] = s.title;
    return acc;
  },
  {} as Record<RegulatorySourceId, string>
);

/**
 * "Load" the regulatory sources at startup. Resolving the typed registry IS the load —
 * deterministic, synchronous, no filesystem access (bundle-safe; see the file header).
 * Returns a defensive copy so no caller can mutate the registry.
 */
export function loadRegulatorySources(): RegulatorySource[] {
  return REGULATORY_SOURCES.map((s) => ({ ...s }));
}

/** Per-document CLEAR workflow step id — every CLEAR event for a document shares it (Constraint #6). */
export function clearWorkflowStep(documentId: string): string {
  return `aria-clear-${documentId}`;
}

// ── Deterministic rule helpers ───────────────────────────────────────────────────────
// Each returns a Finding. A passed finding is always green; a failed finding carries the
// severity the source assigns. Descriptions are plain prose stating what passed/flagged.

function ruleJustificationNarrative(input: ClearEvaluationInput): Finding {
  const passed = input.has_justification_narrative;
  return {
    rule_id: "R-A11-1",
    source_id: "omba11",
    source_title: SOURCE_TITLE["omba11"],
    passed,
    severity: passed ? "green" : input.is_congressional_submission ? "red" : "amber",
    description: passed
      ? "A written justification narrative is present, as OMB Circular A-11 requires for a budget exhibit."
      : "No written justification narrative — OMB Circular A-11 requires one before this exhibit can be exported.",
  };
}

function ruleTypeDeclared(input: ClearEvaluationInput): Finding {
  const passed = input.document_type.trim() !== "";
  return {
    rule_id: "R-A11-2",
    source_id: "omba11",
    source_title: SOURCE_TITLE["omba11"],
    passed,
    severity: passed ? "green" : "amber",
    description: passed
      ? `The output declares its type (${input.document_type}), so it can be matched to the correct A-11 format.`
      : "The output does not declare an exhibit or document type, so it cannot be matched to an A-11 format requirement.",
  };
}

function ruleDataQuality(input: ClearEvaluationInput): Finding {
  const passed = input.data_quality_index >= DATA_QUALITY_THRESHOLD;
  const severity = passed
    ? "green"
    : severityForDataQuality(input.data_quality_index, input.is_congressional_submission);
  return {
    rule_id: "R-A11-3",
    source_id: "omba11",
    source_title: SOURCE_TITLE["omba11"],
    passed,
    severity,
    description: passed
      ? `Data quality is ${input.data_quality_index}%, at or above the ${DATA_QUALITY_THRESHOLD}% threshold.`
      : input.is_congressional_submission
        ? `Data quality is ${input.data_quality_index}%, below the ${DATA_QUALITY_THRESHOLD}% threshold on a congressional submission — a priority (P1) violation.`
        : `Data quality is ${input.data_quality_index}%, below the ${DATA_QUALITY_THRESHOLD}% threshold.`,
  };
}

function ruleEvidenceBasis(input: ClearEvaluationInput): Finding {
  const passed = input.has_evidence_basis;
  return {
    rule_id: "R-EV-1",
    source_id: "evidence-act",
    source_title: SOURCE_TITLE["evidence-act"],
    passed,
    severity: passed ? "green" : "amber",
    description: passed
      ? "The output cites an evidence basis, as the Evidence Act requires for a reported conclusion."
      : "The output asserts a conclusion with no cited evidence basis — the Evidence Act requires one.",
  };
}

function ruleObligationCoverage(input: ClearEvaluationInput): Finding {
  const passed = input.obligation_covered;
  return {
    rule_id: "R-ADA-1",
    source_id: "anti-deficiency-act",
    source_title: SOURCE_TITLE["anti-deficiency-act"],
    passed,
    // An over-obligation is always red — the Anti-Deficiency Act admits no de-minimis exception.
    severity: passed ? "green" : "red",
    description: passed
      ? "The obligation is covered by available budget authority — no Anti-Deficiency Act exposure."
      : "The obligation is not covered by available budget authority — a potential Anti-Deficiency Act violation (over-obligation).",
  };
}

function ruleFundsAvailability(input: ClearEvaluationInput): Finding {
  const passed = input.funds_availability_stated;
  return {
    rule_id: "R-ADA-2",
    source_id: "anti-deficiency-act",
    source_title: SOURCE_TITLE["anti-deficiency-act"],
    passed,
    severity: passed ? "green" : "amber",
    description: passed
      ? "The appropriation and availability period this output draws against are stated."
      : "The output commits resources without stating the appropriation and availability period it draws against.",
  };
}

function rulePpbePhaseAlignment(input: ClearEvaluationInput): Finding {
  const passed = input.ppbe_phase.trim() !== "";
  return {
    rule_id: "R-PPBE-1",
    source_id: "dod-ppbe-reform",
    source_title: SOURCE_TITLE["dod-ppbe-reform"],
    passed,
    severity: passed ? "green" : "amber",
    description: passed
      ? `The output is aligned to the ${input.ppbe_phase} PPBE phase, per DoD PPBE Reform guidance.`
      : "The output is not aligned to a PPBE phase (Planning, Programming, Budgeting, or Execution).",
  };
}

const RULES: ReadonlyArray<(input: ClearEvaluationInput) => Finding> = [
  ruleJustificationNarrative,
  ruleTypeDeclared,
  ruleDataQuality,
  ruleEvidenceBasis,
  ruleObligationCoverage,
  ruleFundsAvailability,
  rulePpbePhaseAlignment,
];

/**
 * Evaluate one document against all four CLEAR sources. Fully deterministic: for a given
 * (input, evaluatedAt) the findings, `compliant` verdict, and `applicable_sources` are
 * always identical. `compliant` is true only when every rule passes.
 *
 * @param evaluatedAt ISO 8601 timestamp supplied by the caller (keeps the core deterministic).
 */
export function evaluateDocument(
  input: ClearEvaluationInput,
  evaluatedAt: string
): ClearEvaluation {
  const findings = RULES.map((rule) => rule(input));
  const compliant = findings.every((f) => f.passed);
  return {
    document_id: input.document_id,
    compliant,
    findings,
    applicable_sources: REGULATORY_SOURCES.map((s) => s.title),
    evaluation_timestamp: evaluatedAt,
  };
}

/**
 * Emit the ARIA_COMPLIANCE_CHECK Logger event for one evaluation. The aria.rules-engine
 * agent_id is carried on the event (Agent Identity Standard). Emission does not gate the
 * evaluation — the deterministic result already exists; this records that it happened.
 */
export function emitComplianceCheck(
  ctx: SovereignShellContext,
  evaluation: ClearEvaluation
): void {
  const flagged = evaluation.findings.filter((f) => !f.passed).map((f) => f.rule_id);
  ctx.logger.log({
    event_type: "ARIA_COMPLIANCE_CHECK",
    workflow_step_id: clearWorkflowStep(evaluation.document_id),
    sovereign_tier: "standard",
    product: "ARIA",
    actor_id: ARIA_RULES_ENGINE_AGENT_ID,
    agent_id: ARIA_RULES_ENGINE_AGENT_ID,
    agent_class: "Governance",
    outcome: evaluation.compliant ? "compliant" : "deviations_flagged",
    payload: {
      document_id: evaluation.document_id,
      compliant: evaluation.compliant,
      finding_count: evaluation.findings.length,
      flagged_rule_ids: flagged,
      applicable_sources: evaluation.applicable_sources,
      evaluation_timestamp: evaluation.evaluation_timestamp,
    },
  });
}

/**
 * SOVEREIGN Platform — module-apex
 * ppbe-evidence-synthesizer.ts — PPBE workflow layer, Session 32 (Full Cycle).
 *
 * ppbe-evidence-synthesizer (Analytical, LLM-BACKED — Agent Identity Standard,
 * D-P5; prompt ppbe/prompts/evidence_synthesis_system.md, PENDING, authored this
 * session per the July 12 AGENT_REFERENCE.md reassignment). Runs on APEX / ARIA
 * infrastructure. Aggregates EvaluationFinding records and APEX program data
 * across programs into synthesis reports for planning and programming reviews
 * (docs/18 §7.2).
 *
 * ADVISORY ONLY (docs/18 §6 Tier A): every report carries the mandatory
 * advisory label and is rendered with the same "AI-generated recommendation"
 * treatment as COUNSEL's advisory outputs. Human review is required before any
 * synthesis report influences a PPBE decision — acceptance is recorded as a
 * PPBE_DECISION event (Python-side emitter; the four PPBE event types are
 * Python-only per the Session 31 Project Principal decision #3). This module
 * produces the acceptance record; it never emits.
 *
 * TRACEABILITY ENFORCED STRUCTURALLY: the validator rejects any report whose
 * key findings cite a finding_id not present in the supplied EvaluationFinding
 * set — a fabricated citation can never reach a reviewer.
 *
 * Scope (registry): produces advisory synthesis reports only. Does not modify
 * EvaluationFinding records, program data, or any APEX data store. Does not
 * invoke other agents. All LLM access through the injected complete()
 * (createSovereignClient — Constraint #5); live → static tiers, one live
 * attempt per call, same discipline as apex-analysis.ts.
 *
 * Version: 1.0 · Session 32 · July 12, 2026
 */

import type {
  SovereignMessage,
  SovereignRequestContext,
  SovereignLLMResponse,
} from "@sovereign/api-client";
import type { EvaluationFinding, ValidationResult } from "@sovereign/data";

import type { ApexProgramRecord } from "./apex-contract";

// ============================================================
// AGENT ID + PROMPT REGISTRY BINDING (Constraints #9 / #10)
// ============================================================

export const PPBE_EVIDENCE_SYNTHESIZER_AGENT_ID = "ppbe-evidence-synthesizer";

/** Registry binding stamped onto Logger events as prompt provenance (AIS D-P5). */
export const PPBE_EVIDENCE_PROMPT_REGISTRATION = {
  file: "ppbe/prompts/evidence_synthesis_system.md",
  promptVersion: "v1.0",
  /** PENDING — synthetic-data use only until the Project Principal approves. */
  status: "PENDING",
} as const;

/**
 * The mandatory Tier A advisory label (docs/18 §6). Same literal as
 * module-vigil's PPBE_TIER_A_LABEL — restated here because modules cannot
 * import each other (Constraint #11); the e2e suite asserts the two are equal.
 */
export const PPBE_ADVISORY_LABEL = "AI-generated recommendation — a human decides";

// ============================================================
// SYNTHESIS REPORT SHAPE
// ============================================================

/** One synthesized finding, traceable to the EvaluationFinding records it rests on. */
export interface SynthesisKeyFinding {
  /** Plain prose (Gap 5). */
  statement: string;
  /** Every EvaluationFinding this statement rests on — at least one, all real. */
  source_finding_ids: string[];
  /** The programs the statement concerns. */
  programs_affected: string[];
}

/** The synthesis report — advisory, labeled, human-reviewed before it matters. */
export interface PPBESynthesisReport {
  report_title: string;
  /** Restated from the input, e.g. "FY 2027 programming review" (Gap 5). */
  fiscal_context: string;
  programs_covered: string[];
  objectives_covered: string[];
  /** Plain prose (Gap 5). */
  summary: string;
  key_findings: SynthesisKeyFinding[];
  /** Must equal PPBE_ADVISORY_LABEL exactly. */
  advisory_label: string;
  workflow_step_id: string;
  /** The agent's own conformance assertion (same convention as ApexAnalysisOutput). */
  schema_valid: boolean;
}

/** One synthesis pass — governed data only. */
export interface EvidenceSynthesisInput {
  findings: EvaluationFinding[];
  /** APEX program data for the programs under review (read-only). */
  programs: ApexProgramRecord[];
  /** Plain prose, spelled-out fiscal years (Gap 5). */
  fiscal_context: string;
  /** Supplied by the originating flow, or synthesized (Constraint #6). */
  workflowStepId?: string;
}

export type SynthesisTier = "live" | "static";

export interface SynthesisOutcome {
  report: PPBESynthesisReport;
  tier: SynthesisTier;
  /** Why the static tier was used, when applicable (for the Logger payload). */
  detail?: string;
}

/** Injected dependencies — the host wires complete to sovereign-api-client. */
export interface SynthesisDeps {
  complete: (
    messages: SovereignMessage[],
    context: SovereignRequestContext
  ) => Promise<SovereignLLMResponse>;
}

// ============================================================
// WORKFLOW STEP (Constraint #6)
// ============================================================

export function synthesisWorkflowStep(input: EvidenceSynthesisInput): string {
  if (input.workflowStepId) return input.workflowStepId;
  const programs = [...new Set(input.findings.map((f) => f.program_id))].sort();
  return `ppbe-evidence-synthesis-${programs.join("-") || "no-programs"}`;
}

// ============================================================
// VALIDATION — structural traceability, no fabricated citations
// ============================================================

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== "";
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((s) => isNonEmptyString(s));
}

/**
 * Validate a synthesis report against the contract AND the supplied evidence
 * base: every source_finding_id must exist among the input findings, and every
 * program/objective the report claims to cover must come from the input. A
 * report citing evidence that was never supplied is rejected outright.
 */
export function validatePPBESynthesisReport(
  value: unknown,
  evidence: { findings: readonly EvaluationFinding[]; programs: readonly ApexProgramRecord[] }
): ValidationResult {
  if (typeof value !== "object" || value === null) {
    return { valid: false, errors: ["synthesis report must be a non-null object"] };
  }
  const r = value as Partial<PPBESynthesisReport>;
  const errors: string[] = [];

  const knownFindingIds = new Set(evidence.findings.map((f) => f.finding_id));
  const knownProgramIds = new Set([
    ...evidence.findings.map((f) => f.program_id),
    ...evidence.programs.map((p) => p.program_id),
  ]);
  const knownObjectiveIds = new Set(evidence.findings.map((f) => f.objective_id));

  for (const key of ["report_title", "fiscal_context", "summary", "workflow_step_id"] as const) {
    if (!isNonEmptyString(r[key])) errors.push(`${key}: required non-empty string`);
  }
  if (r.advisory_label !== PPBE_ADVISORY_LABEL) {
    errors.push(`advisory_label: must be exactly "${PPBE_ADVISORY_LABEL}" (docs/18 §6 Tier A)`);
  }
  if (typeof r.schema_valid !== "boolean") errors.push("schema_valid: required boolean");

  if (!isStringArray(r.programs_covered)) {
    errors.push("programs_covered: required array of non-empty strings");
  } else {
    for (const id of r.programs_covered) {
      if (!knownProgramIds.has(id)) {
        errors.push(`programs_covered: "${id}" is not in the supplied evidence base — fabricated coverage`);
      }
    }
  }
  if (!Array.isArray(r.objectives_covered) || !r.objectives_covered.every(isNonEmptyString)) {
    errors.push("objectives_covered: required array of non-empty strings");
  } else {
    for (const id of r.objectives_covered) {
      if (!knownObjectiveIds.has(id)) {
        errors.push(`objectives_covered: "${id}" is not in the supplied evidence base — fabricated coverage`);
      }
    }
  }

  if (!Array.isArray(r.key_findings)) {
    errors.push("key_findings: required array");
  } else {
    r.key_findings.forEach((kf, i) => {
      if (typeof kf !== "object" || kf === null) {
        errors.push(`key_findings[${i}]: must be an object`);
        return;
      }
      const k = kf as Partial<SynthesisKeyFinding>;
      if (!isNonEmptyString(k.statement)) errors.push(`key_findings[${i}].statement: required`);
      if (!isStringArray(k.source_finding_ids) || k.source_finding_ids.length === 0) {
        errors.push(`key_findings[${i}].source_finding_ids: at least one source finding is required`);
      } else {
        for (const id of k.source_finding_ids) {
          if (!knownFindingIds.has(id)) {
            errors.push(
              `key_findings[${i}].source_finding_ids: "${id}" does not exist in the supplied findings — fabricated citation`
            );
          }
        }
      }
      if (!isStringArray(k.programs_affected) || k.programs_affected.length === 0) {
        errors.push(`key_findings[${i}].programs_affected: at least one program is required`);
      }
    });
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/** Surfaceable = validates AND the agent asserts schema_valid (ApexAnalysisOutput convention). */
export function isSurfaceableSynthesis(
  report: PPBESynthesisReport,
  evidence: { findings: readonly EvaluationFinding[]; programs: readonly ApexProgramRecord[] }
): boolean {
  return validatePPBESynthesisReport(report, evidence).valid && report.schema_valid === true;
}

// ============================================================
// MESSAGES + PARSING
// ============================================================

/** Build the two-message conversation: registered system prompt + the evidence base. */
export function buildSynthesisMessages(
  input: EvidenceSynthesisInput,
  systemPrompt: string
): SovereignMessage[] {
  const payload = {
    fiscal_context: input.fiscal_context,
    evaluation_findings: input.findings,
    program_records: input.programs,
    workflow_step_id: synthesisWorkflowStep(input),
  };
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: JSON.stringify(payload, null, 2) },
  ];
}

/** Parse the model output into a surfaceable report, or null. Tolerates a fence. */
export function parseSynthesisReport(
  content: string,
  evidence: { findings: readonly EvaluationFinding[]; programs: readonly ApexProgramRecord[] }
): PPBESynthesisReport | null {
  const stripped = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    return null;
  }
  if (!validatePPBESynthesisReport(parsed, evidence).valid) return null;
  const report = parsed as PPBESynthesisReport;
  return report.schema_valid === true ? report : null;
}

// ============================================================
// STATIC TIER — deterministic aggregation, invents nothing
// ============================================================

const FINDING_TYPE_PROSE: Record<EvaluationFinding["finding_type"], string> = {
  "on-track": "on track",
  variance: "showing variance",
  "contradicts-assumption": "contradicting a planning assumption",
};

/**
 * The deterministic static synthesis — schema-valid, advisory-labeled, and
 * assembled only from the supplied records. Every statement is a count over
 * real findings; every citation is real. Empty evidence produces an honest
 * "insufficient evidence" report, not a fabricated healthy one.
 */
export function staticSynthesisReport(input: EvidenceSynthesisInput): PPBESynthesisReport {
  const wsid = synthesisWorkflowStep(input);
  const byProgram = new Map<string, EvaluationFinding[]>();
  for (const f of input.findings) {
    const list = byProgram.get(f.program_id) ?? [];
    list.push(f);
    byProgram.set(f.program_id, list);
  }
  const programs = [...byProgram.keys()].sort();
  const objectives = [...new Set(input.findings.map((f) => f.objective_id))].sort();

  const keyFindings: SynthesisKeyFinding[] = programs.map((programId) => {
    const findings = byProgram.get(programId) ?? [];
    const parts = (Object.keys(FINDING_TYPE_PROSE) as EvaluationFinding["finding_type"][])
      .map((t) => ({ t, n: findings.filter((f) => f.finding_type === t).length }))
      .filter(({ n }) => n > 0)
      .map(({ t, n }) => `${n} ${FINDING_TYPE_PROSE[t]}`);
    const notFeeding = findings.filter((f) => !f.feeds_planning_cycle).length;
    const feedNote =
      notFeeding > 0
        ? ` ${notFeeding} of these findings ${notFeeding === 1 ? "is" : "are"} not feeding the planning cycle.`
        : "";
    return {
      statement:
        `Program ${programId} has ${findings.length} recorded evaluation ` +
        `${findings.length === 1 ? "finding" : "findings"}: ${parts.join(", ")}.${feedNote}`,
      source_finding_ids: findings.map((f) => f.finding_id),
      programs_affected: [programId],
    };
  });

  const summary =
    input.findings.length === 0
      ? "No evaluation findings are recorded for the programs under review. The evidence base is " +
        "insufficient for a synthesis — this statement is itself the finding. A reviewer should " +
        "consider whether evaluations are being recorded before drawing any conclusion from their absence."
      : `Across ${programs.length} ${programs.length === 1 ? "program" : "programs"}, ` +
        `${input.findings.length} evaluation ${input.findings.length === 1 ? "finding is" : "findings are"} ` +
        `recorded. This static synthesis reports counts only — it was assembled without live reasoning, ` +
        `and a reviewer should read the underlying findings before acting on it.`;

  return {
    report_title: `Evidence synthesis — ${input.fiscal_context}`,
    fiscal_context: input.fiscal_context,
    programs_covered: programs,
    objectives_covered: objectives,
    summary,
    key_findings: keyFindings,
    advisory_label: PPBE_ADVISORY_LABEL,
    workflow_step_id: wsid,
    schema_valid: true,
  };
}

// ============================================================
// ENGINE — live → static, one live attempt, never throws
// ============================================================

export async function runEvidenceSynthesis(
  input: EvidenceSynthesisInput,
  systemPrompt: string,
  requestContext: SovereignRequestContext,
  deps: SynthesisDeps
): Promise<SynthesisOutcome> {
  let detail: string | undefined;
  try {
    const response = await deps.complete(buildSynthesisMessages(input, systemPrompt), requestContext);
    if (!response.fallback_activated) {
      const report = parseSynthesisReport(response.content, input);
      if (report) return { report, tier: "live" };
      detail = "live_response_not_surfaceable";
    } else {
      detail = `api_client_fallback_${response.fallback_tier}`;
    }
  } catch (err) {
    detail = err instanceof Error ? err.message : String(err);
  }
  return { report: staticSynthesisReport(input), tier: "static", detail };
}

// ============================================================
// ACCEPTANCE — the human decision that makes a synthesis matter
// ============================================================

/**
 * The docs/18 §4 PPBE_DECISION field set for an accepted synthesis report,
 * ready for the Python-side emitter (the four PPBE event types are
 * Python-only). decision_type reuses HUMAN_APPROVAL per the Session 31
 * Project Principal decision #5 — no PPBE-specific HumanDecisionType.
 */
export interface SynthesisAcceptanceRecord {
  decision_type: "HUMAN_APPROVAL";
  program_ids: string[];
  objective_ids: string[];
  approving_human: string;
  workflow_step_id: string;
}

/**
 * Build the acceptance record for a human-accepted synthesis report. Returns
 * null when the approving human is blank — an unattributed acceptance is not
 * a decision (Standing Constraint #4 family).
 */
export function synthesisAcceptanceRecord(
  report: PPBESynthesisReport,
  approvingHuman: string
): SynthesisAcceptanceRecord | null {
  if (approvingHuman.trim() === "") return null;
  return {
    decision_type: "HUMAN_APPROVAL",
    program_ids: [...report.programs_covered],
    objective_ids: [...report.objectives_covered],
    approving_human: approvingHuman.trim(),
    workflow_step_id: report.workflow_step_id,
  };
}

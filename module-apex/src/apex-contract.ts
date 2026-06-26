/**
 * SOVEREIGN Platform — module-apex
 * apex-contract.ts — APEX data shapes, validation, and the GD-16 schema re-exports.
 *
 * APEX is the analytics / reporting product (spec 13_APEX_Architecture.md). It consumes
 * CPMI World Model program records, reasoning-chain history, AgentOS task records, and
 * governance decisions — all READ-ONLY (Constraint: APEX never writes upstream) — and
 * produces defensible, exportable analysis. The apex.ai-assistant → apex.report-generator
 * contract (ApexAnalysisOutput / RiskFinding / ApexReportType) is governance-frozen in the
 * shell contract (GD-16, v1.12); this module re-exports those rather than redefining them
 * (Standing Constraint #2 — no divergent duplicate).
 *
 * PPBE forward-compatibility (spec §17.3): this module's ApexProgramRecord MUST NOT use the
 * reserved field names fiscal_year / lifecycle_cost_estimate / obligation_plan /
 * performance_baseline — those are reserved for the PPBE Phase I data-dictionary extension.
 *
 * Version: 1.0 (APEX scaffold) · Session 17 · June 25, 2026
 */

import type { ValidationResult, ClearanceLevel } from "@sovereign/data";

// --- GD-16 governance-frozen schema (re-exported from the shell contract) ---
import type {
  ApexReportType,
  RiskFinding,
  ApexAnalysisOutput,
} from "../../sovereign-shell/shell-contract";

export type { ApexReportType, RiskFinding, ApexAnalysisOutput };

// ============================================================
// AGENT + PROMPT REGISTRY CONSTANTS (Constraints #9 / #10)
// ============================================================

export const APEX_AI_ASSISTANT = "apex.ai-assistant" as const;
export const APEX_REPORT_GENERATOR = "apex.report-generator" as const;

/** PR-APEX-001 — the apex.ai-assistant system prompt (approved June 25, 2026). */
export const PR_APEX_001 = {
  registryId: "PR-APEX-001",
  agentId: APEX_AI_ASSISTANT,
  status: "APPROVED",
} as const;

// ============================================================
// DC-3 PROVENANCE (generic — renders by entity type, spec §17.4)
// ============================================================

export type ProvenanceTrend = "IMPROVING" | "STABLE" | "DEGRADING" | "UNKNOWN";

/**
 * The DC-3 fields for any figure, status, or flag APEX surfaces. Generic by
 * `entity_type` so the provenance panel renders obligation records, evaluation findings,
 * or world-model flags through one component without hardcoding world-model field names.
 *
 * `current_actual_value` and `variance_from_baseline` (Session 19, Gap 3 from Walkthrough B)
 * make the drill-down show not just what was expected (baseline) but what was actually
 * measured and how far it diverges — the difference between "I can see the flag" and "I can
 * defend the flag". These two fields live on this module-local type only; the governance-frozen
 * shell-contract `RiskFinding` is unchanged (no shell-contract change, no GD).
 */
export interface ProvenanceRecord {
  /** What kind of thing this provenance describes, e.g. "World Model risk flag". */
  entity_type: string;
  /** Human label of the specific figure/flag, e.g. "Cost variance". */
  field_label: string;
  /** DC-3 #1 — the specific record(s) that produced this figure/flag. */
  source_data: string;
  /** DC-3 #2 — the expected/target value when the measurement was taken. */
  baseline: string;
  /** DC-3 #2a — the actual measured value at the most recent update (plain prose). */
  current_actual_value: string;
  /** DC-3 #2b — the calculated difference from baseline, in plain prose, with direction. */
  variance_from_baseline: string;
  /** DC-3 #3 — when the underlying data was last refreshed (ISO date or "Unknown"). */
  last_updated: string;
  /** DC-3 #4 — direction of travel. A single data point is not actionable; a trend is. */
  trend: ProvenanceTrend;
  /** DC-3 #5 — who owns this data/flag. A finding without an owner cannot be actioned. */
  responsible_party: string;
}

// ============================================================
// APEX PROGRAM RECORD (the World Model projection APEX reads)
// ============================================================

export type ProgramStatus = "ON_TRACK" | "AT_RISK" | "OFF_TRACK";

export interface ApexMilestone {
  name: string;
  /** Plain-prose status (Gap 5) — "Milestone 3 is two weeks behind schedule." */
  status_narrative: string;
  on_track: boolean;
}

/** A risk flag with its DC-3 provenance — every flag is traceable (spec §4 DC-3). */
export interface ApexRiskFlag {
  flag_id: string;
  /** Plain-prose summary (Gap 5) — not a machine field pair. */
  summary: string;
  severity: "P1" | "P2" | "P3";
  provenance: ProvenanceRecord;
}

/**
 * The program record APEX reads from the CPMI World Model (read-only). Aligned to the CPMI
 * WorldModelRecord (program_id / program_name / status / flags / regulatory_context /
 * objectives / prior_governance_records) plus the APEX presentation fields a program
 * manager needs. NOTE (spec §17.3): no PPBE-reserved field names are used here.
 */
export interface ApexProgramRecord {
  program_id: string;
  program_name: string;
  classification: ClearanceLevel; // UNCLASSIFIED only (GD-10)
  status_label: ProgramStatus;
  /** Plain-prose program status (Gap 5). */
  status_narrative: string;
  completion_pct: number;
  responsible_party: string;
  objectives: string[];
  milestones: ApexMilestone[];
  risk_flags: ApexRiskFlag[];
  regulatory_context: string[];
  prior_governance_records: string[];
  /** ISO date the world-model record was last refreshed. */
  last_updated: string;
}

// ============================================================
// SUPPORTING DOSSIER RECORDS (DC-2)
// ============================================================

export interface ReasoningChainSummary {
  /** ISO timestamp — dossier renders these in chronological order (spec §4 DC-2). */
  recorded_at: string;
  recommendation: string;
  tier: "live" | "cache" | "static";
  schema_valid: boolean;
}

export interface GovernanceDecisionRecord {
  decided_at: string;
  decision_type: string;
  actor_name: string;
  note: string;
  outcome: string;
}

export interface AgentTaskRecord {
  task_id: string;
  title: string;
  approval_status: string;
  approved_by: string | null;
  completed: boolean;
}

export type ApexExportFormat = "PDF" | "FORMATTED_DOCUMENT";

/** The complete DC-2 program dossier — the full package, not a summary. */
export interface ProgramDossier {
  program: ApexProgramRecord;
  reasoning_chain_history: ReasoningChainSummary[];
  governance_decisions: GovernanceDecisionRecord[];
  risk_register: ApexRiskFlag[];
  regulatory_constraints: string[];
  task_history: AgentTaskRecord[];
  generated_at: string;
  export_format: ApexExportFormat;
}

// ============================================================
// WORKFLOW STEP HELPERS (Standing Constraint #6)
// ============================================================

export function analysisWorkflowStep(programId: string, reportType: ApexReportType): string {
  return `apex-analysis-${reportType.toLowerCase()}-${programId}`;
}

export function reportWorkflowStep(programId: string, reportType: ApexReportType): string {
  return `apex-report-${reportType.toLowerCase()}-${programId}`;
}

export function dossierWorkflowStep(programId: string): string {
  return `apex-dossier-${programId}`;
}

// ============================================================
// VALIDATION (reuses @sovereign/data ValidationResult — Constraint #2)
// ============================================================

const REPORT_TYPES: readonly ApexReportType[] = ["MSR", "QPR", "AD_HOC"];
const TRENDS: readonly RiskFinding["trend"][] = ["IMPROVING", "STABLE", "DEGRADING"];
const SEVERITIES: readonly RiskFinding["severity"][] = ["P1", "P2", "P3"];

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== "";
}

function validateRiskFinding(value: unknown, index: number): string[] {
  const errors: string[] = [];
  if (typeof value !== "object" || value === null) {
    return [`risk_findings[${index}]: must be an object`];
  }
  const f = value as Partial<RiskFinding>;
  if (!isNonEmptyString(f.flag_id)) errors.push(`risk_findings[${index}].flag_id: required`);
  if (!isNonEmptyString(f.description)) errors.push(`risk_findings[${index}].description: required`);
  if (!isNonEmptyString(f.source_data)) errors.push(`risk_findings[${index}].source_data: required (DC-3)`);
  if (!isNonEmptyString(f.baseline)) errors.push(`risk_findings[${index}].baseline: required (DC-3)`);
  if (!isNonEmptyString(f.responsible_party)) errors.push(`risk_findings[${index}].responsible_party: required (DC-3)`);
  if (!TRENDS.includes(f.trend as RiskFinding["trend"])) errors.push(`risk_findings[${index}].trend: must be ${TRENDS.join(" | ")}`);
  if (!SEVERITIES.includes(f.severity as RiskFinding["severity"])) errors.push(`risk_findings[${index}].severity: must be ${SEVERITIES.join(" | ")}`);
  return errors;
}

/** Validate an ApexAnalysisOutput against the GD-16 schema. */
export function validateApexAnalysisOutput(value: unknown): ValidationResult {
  if (typeof value !== "object" || value === null) {
    return { valid: false, errors: ["analysis output must be a non-null object"] };
  }
  const o = value as Partial<ApexAnalysisOutput>;
  const errors: string[] = [];

  if (!isNonEmptyString(o.program_id)) errors.push("program_id: required non-empty string");
  if (!REPORT_TYPES.includes(o.report_type as ApexReportType)) {
    errors.push(`report_type: must be one of ${REPORT_TYPES.join(" | ")}`);
  }
  if (!isNonEmptyString(o.status_narrative)) errors.push("status_narrative: required non-empty string");
  if (!isNonEmptyString(o.workflow_step_id)) errors.push("workflow_step_id: required non-empty string");

  if (!Array.isArray(o.risk_findings)) {
    errors.push("risk_findings: required array");
  } else {
    o.risk_findings.forEach((f, i) => errors.push(...validateRiskFinding(f, i)));
  }

  if (!Array.isArray(o.recommendations)) {
    errors.push("recommendations: required array");
  } else if (!o.recommendations.every((r) => isNonEmptyString(r))) {
    errors.push("recommendations: every entry must be a non-empty string");
  }

  if (typeof o.schema_valid !== "boolean") errors.push("schema_valid: required boolean");

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * Whether an analysis output may be surfaced for report assembly: it must validate against
 * the schema AND the agent must assert schema_valid === true (spec §8 — a schema_valid:false
 * output is never used to generate a report).
 */
export function isSurfaceableAnalysis(output: ApexAnalysisOutput): boolean {
  return validateApexAnalysisOutput(output).valid && output.schema_valid === true;
}

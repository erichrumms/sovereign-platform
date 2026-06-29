/**
 * SOVEREIGN Platform — module-aria
 * clear-types.ts — CLEAR domain types shared by the engine, the Compliance Dashboard,
 * and the Certification Queue (Stage 6, Session 23).
 *
 * CLEAR — Continuous Legal and Regulatory Evaluation and Assessment Review. These are
 * the deterministic shapes the CLEAR rule-evaluation engine (clear-engine.ts) produces
 * and the two CLEAR UI panels consume. No AI inference is involved in any CLEAR path
 * (docs/16 §1/§3) — every value here is the output of a deterministic rule evaluation
 * or a human certification decision recorded against one.
 *
 * Gap 5: every human-facing string a component renders from these types is plain prose.
 *
 * Version: 1.0 · Session 23 (D4) · June 29, 2026
 */

/** Severity coding shared by every CLEAR surface. Green = compliant · Amber = at risk · Red = violation. */
export type ClearSeverity = "green" | "amber" | "red";

/** Certification status of an output awaiting CLEAR clearance (populated from ctx.aria). */
export type CertStatus = "pending" | "certified" | "flagged";

/** The four regulatory sources CLEAR evaluates against (ids match data/regulatory-sources/<id>.md). */
export type RegulatorySourceId =
  | "omba11"
  | "evidence-act"
  | "anti-deficiency-act"
  | "dod-ppbe-reform";

/** The platform data-quality threshold. Materials below this are surfaced at risk or as violations. */
export const DATA_QUALITY_THRESHOLD = 90;

/** A registered regulatory source: its id, on-disk file, and human-readable title. */
export interface RegulatorySource {
  id: RegulatorySourceId;
  /** File in module-aria/data/regulatory-sources/ that holds this source's governance summary. */
  fileName: string;
  title: string;
}

/**
 * The deterministic input to one CLEAR document evaluation. Every field is an
 * already-measured fact about the output — the engine applies fixed rules to them,
 * never inference. Empty string for document_type / ppbe_phase means "not declared".
 */
export interface ClearEvaluationInput {
  document_id: string;
  document_name: string;
  document_type: string;
  /** 0–100 measured data-quality index for the material. */
  data_quality_index: number;
  is_congressional_submission: boolean;
  /** A-11 R1 — a written justification narrative is present. */
  has_justification_narrative: boolean;
  /** Evidence Act R1 — the finding cites an evidence basis. */
  has_evidence_basis: boolean;
  /** ADA R1 — the obligation is covered by available budget authority (no over-obligation). */
  obligation_covered: boolean;
  /** ADA R2 — the appropriation and availability period are stated. */
  funds_availability_stated: boolean;
  /** PPBE R1 — the declared PPBE phase ("" = not aligned to a phase). */
  ppbe_phase: string;
}

/** A single deterministic CLEAR finding against one rule. `description` is plain prose (Gap 5). */
export interface Finding {
  rule_id: string;
  source_id: RegulatorySourceId;
  source_title: string;
  description: string;
  passed: boolean;
  severity: ClearSeverity;
}

/** The deterministic result of one CLEAR evaluation. Same input + timestamp → identical result. */
export interface ClearEvaluation {
  document_id: string;
  compliant: boolean;
  findings: Finding[];
  /** Titles of the regulatory sources evaluated for this document. */
  applicable_sources: string[];
  /** ISO 8601 — supplied by the caller so the core evaluation stays deterministic. */
  evaluation_timestamp: string;
}

// ── Compliance Dashboard surface shapes ────────────────────────────────────────────────

/** Surface 1 — an output awaiting CLEAR certification before export. */
export interface OutputComplianceItem {
  document_id: string;
  document_name: string;
  document_type: string;
  /** Plain-prose name of the regulatory check that applies (Gap 5). */
  applicable_check: string;
  /** Certification status (pending until ctx.aria carries a decision). */
  status: CertStatus;
}

/** Surface 2 — a governance-calendar item (PPBE phase transition, attestation, decision forum). */
export interface ProcessComplianceItem {
  id: string;
  /** Plain-prose label, e.g. "Programming phase transition" or "Q3 attestation deadline". */
  label: string;
  /** ISO 8601 due date for the commitment. */
  due_date: string;
  /** True when the commitment is past its due date. */
  overdue: boolean;
  /** Plain-prose elapsed overdue time, e.g. "4 days overdue" (empty when on time / upcoming). */
  elapsed_overdue: string;
  severity: ClearSeverity;
}

/** Surface 3 — a data-quality reading for a pipeline material. */
export interface DataQualityItem {
  id: string;
  material_name: string;
  /** 0–100 measured data-quality index. */
  quality_index: number;
  is_congressional_submission: boolean;
  severity: ClearSeverity;
}

/**
 * Deterministic severity for a data-quality reading. At or above the threshold is green;
 * below threshold is amber; below threshold on a congressional submission is red (P1).
 */
export function severityForDataQuality(
  qualityIndex: number,
  isCongressionalSubmission: boolean
): ClearSeverity {
  if (qualityIndex >= DATA_QUALITY_THRESHOLD) return "green";
  return isCongressionalSubmission ? "red" : "amber";
}

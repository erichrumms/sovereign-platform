/**
 * Program Record — Canonical Entity (PPBE workflow layer)
 * Canonical identifier: program_id  ·  Data classification: program
 *
 * Approved D-P3 (June 29, 2026); reaffirmed unchanged D-P7 Option A (July 12, 2026).
 * ProgramRecord EXTENDS the existing Program entity (docs/18 §3.2 — "no change to
 * the existing entity's identity"; Standing Constraint #2, no divergent duplicate;
 * same pattern as ChargeAccount extends CostCode). The base Program fields are
 * unchanged; the extension adds the PPBE traceability and planning fields.
 *
 * docs/18 §3.2 specifies `obligation_plan` and `performance_baseline` only as
 * "structured object" — the entry shapes below are this build's minimal
 * elaboration (documented in the Session 31 handoff), not a spec amendment.
 *
 * Field names are frozen by the SOVEREIGN data dictionary.
 */

import type { ValidationResult } from '../shared-types';
import type { Program } from './program';
import { validateProgram } from './program';

/** One period of the planned obligation schedule (docs/18 §3.2 obligation_plan). */
export interface ObligationPlanEntry {
  /** Plain-prose period label per Gap 5, e.g. `FY 2027 Q1`. */
  period: string;
  /** Planned obligation for the period, whole currency units. */
  planned_amount: number;
}

/** One baseline metric feeding the Phase 6 evaluation comparison (docs/18 §3.2). */
export interface PerformanceBaselineMetric {
  metric: string;
  /** Plain prose per Gap 5, e.g. `92 percent on-time milestone completion`. */
  baseline_value: string;
}

export interface ProgramRecord extends Program {
  /** FK → StrategicObjective — the traceability chain's second link. */
  objective_id: string;
  fiscal_year: string;
  /** Whole currency units. */
  lifecycle_cost_estimate: number;
  /** Planned obligation schedule by period. */
  obligation_plan: ObligationPlanEntry[];
  /** Feeds Phase 6 evaluation comparison. */
  performance_baseline: PerformanceBaselineMetric[];
}

export function validateProgramRecord(record: unknown): ValidationResult {
  // Base Program validation first — ProgramRecord is an extension, not a redefinition.
  const base = validateProgram(record);
  const errors: string[] = base.valid ? [] : [...base.errors];
  const r = record as Partial<ProgramRecord>;

  for (const key of ['objective_id', 'fiscal_year'] as const) {
    if (typeof r[key] !== 'string' || (r[key] as string).trim() === '') {
      errors.push(`${key}: required string`);
    }
  }
  if (typeof r.lifecycle_cost_estimate !== 'number' || r.lifecycle_cost_estimate < 0) {
    errors.push('lifecycle_cost_estimate: must be a non-negative number');
  }
  if (!Array.isArray(r.obligation_plan)) {
    errors.push('obligation_plan: required array of {period, planned_amount} entries');
  } else {
    for (const [i, entry] of r.obligation_plan.entries()) {
      if (typeof entry?.period !== 'string' || entry.period.trim() === '') {
        errors.push(`obligation_plan[${i}].period: required string`);
      }
      if (typeof entry?.planned_amount !== 'number' || entry.planned_amount < 0) {
        errors.push(`obligation_plan[${i}].planned_amount: must be a non-negative number`);
      }
    }
  }
  if (!Array.isArray(r.performance_baseline)) {
    errors.push('performance_baseline: required array of {metric, baseline_value} entries');
  } else {
    for (const [i, entry] of r.performance_baseline.entries()) {
      if (typeof entry?.metric !== 'string' || entry.metric.trim() === '') {
        errors.push(`performance_baseline[${i}].metric: required string`);
      }
      if (typeof entry?.baseline_value !== 'string' || entry.baseline_value.trim() === '') {
        errors.push(`performance_baseline[${i}].baseline_value: required string`);
      }
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

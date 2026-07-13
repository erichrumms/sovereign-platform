/**
 * Obligation Record — Canonical Entity (PPBE workflow layer)
 * Canonical identifier: obligation_id  ·  Data classification: program
 *
 * Approved D-P3 (June 29, 2026); reaffirmed unchanged D-P7 Option A (July 12, 2026).
 * Field-level schema per docs/18_PPBE_Workflow_Architecture.md §3.4. Creation is
 * VIGIL Tier C — resource commitment authorization: requires a VIGIL decision AND
 * a linked COUNSEL Decision Record ID (docs/18 §6); `authorizing_official` records
 * the human who authorized the obligation.
 *
 * D-P7's analysis identified this entity as most likely to eventually need
 * external-system linkage — no such field is added here; `PPBE-EXT-GD` remains
 * deferred and trigger-conditioned.
 *
 * Field names are frozen by the SOVEREIGN data dictionary.
 */

import type { ValidationResult } from '../shared-types';

export interface ObligationRecord {
  obligation_id: string;
  /** FK → ProgramRecord. */
  program_id: string;
  /** References the existing CostCode entity (docs/18 §3.4 / architecture doc §5.1). */
  cost_code: string;
  /** Whole currency units. */
  amount: number;
  /** ISO 8601 datetime. */
  timestamp: string;
  /** The human who authorized the obligation — VIGIL Tier C. */
  authorizing_official: string;
  /** Constraint #6 — joins the record to the audit trail. */
  workflow_step_id: string;
}

export function validateObligationRecord(record: unknown): ValidationResult {
  const errors: string[] = [];
  const r = record as Partial<ObligationRecord>;

  for (const key of [
    'obligation_id',
    'program_id',
    'cost_code',
    'timestamp',
    'authorizing_official',
    'workflow_step_id',
  ] as const) {
    if (typeof r[key] !== 'string' || (r[key] as string).trim() === '') {
      errors.push(`${key}: required string`);
    }
  }
  if (typeof r.amount !== 'number' || r.amount <= 0) {
    errors.push('amount: must be a positive number');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

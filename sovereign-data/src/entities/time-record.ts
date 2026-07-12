/**
 * Time Record — Canonical Entity (Time & Travel workflow layer)
 * Canonical identifier: record_id  ·  Data classification: program
 *
 * Approved D-TT3 (June 29, 2026); reaffirmed unchanged D-TT7 Option A (July 11, 2026).
 * Field-level schema derived from docs/17_TimeAndTravel_Architecture.md §6
 * (Time & Expense Tool). One record per employee per pay period; evaluated by
 * tt.time-compliance-engine against the ten rule categories. The record itself
 * is program-level governance data; individual BASELINE data derived from it by
 * tt.pattern-analyst is data_classification: user with hashed employee ID —
 * that privacy boundary applies at the analysis layer, not here.
 *
 * Field names are frozen by the SOVEREIGN data dictionary.
 */

import type { ValidationResult } from '../shared-types';
import type { ChargeAccountType } from './charge-account';

/** One labor charge line within a time record period. */
export interface TimeRecordEntry {
  /** ISO 8601 date the hours were worked. */
  entry_date: string;
  /** Charge account identifier — references ChargeAccount.cost_code. */
  cost_code: string;
  /** Hours charged for this entry; positive, quarter-hour precision not enforced here. */
  hours: number;
  /** Direct or indirect charge — evaluated against ChargeAccount.account_type. */
  charge_type: ChargeAccountType;
  /** Whether entry_date falls on an organizational holiday (holiday direct charge rule). */
  holiday: boolean;
  /** Justification narrative, required by policy for certain charges (justification-absence rule). */
  justification?: string;
}

export interface TimeRecord {
  record_id: string;
  employee_id: string;
  /** ISO 8601 date — first day of the pay period. */
  period_start: string;
  /** ISO 8601 date — last day of the pay period. */
  period_end: string;
  entries: TimeRecordEntry[];
  /** Sum of entry hours for the period. */
  total_hours: number;
  /** ISO 8601 timestamp the record was submitted (absent until submission). */
  submitted_at?: string;
}

const CHARGE_TYPES: readonly ChargeAccountType[] = ['DIRECT', 'INDIRECT'];

export function validateTimeRecord(record: unknown): ValidationResult {
  const errors: string[] = [];
  const t = record as Partial<TimeRecord>;

  for (const key of ['record_id', 'employee_id', 'period_start', 'period_end'] as const) {
    if (typeof t[key] !== 'string' || (t[key] as string).trim() === '') {
      errors.push(`${key}: required string`);
    }
  }
  if (
    typeof t.period_start === 'string' &&
    typeof t.period_end === 'string' &&
    t.period_end < t.period_start
  ) {
    errors.push('period_end: must not precede period_start');
  }

  if (!Array.isArray(t.entries)) {
    errors.push('entries: required array');
  } else {
    t.entries.forEach((entry, i) => {
      const e = entry as Partial<TimeRecordEntry>;
      if (typeof e.entry_date !== 'string' || e.entry_date.trim() === '') {
        errors.push(`entries[${i}].entry_date: required ISO 8601 date string`);
      }
      if (typeof e.cost_code !== 'string' || e.cost_code.trim() === '') {
        errors.push(`entries[${i}].cost_code: required string`);
      }
      if (typeof e.hours !== 'number' || e.hours <= 0) {
        errors.push(`entries[${i}].hours: must be a positive number`);
      }
      if (!CHARGE_TYPES.includes(e.charge_type as ChargeAccountType)) {
        errors.push(`entries[${i}].charge_type: must be one of ${CHARGE_TYPES.join(', ')}`);
      }
      if (typeof e.holiday !== 'boolean') {
        errors.push(`entries[${i}].holiday: must be a boolean`);
      }
      if (e.justification !== undefined && (typeof e.justification !== 'string' || e.justification.trim() === '')) {
        errors.push(`entries[${i}].justification: must be a non-empty string when present`);
      }
    });
  }

  if (typeof t.total_hours !== 'number' || t.total_hours < 0) {
    errors.push('total_hours: must be a non-negative number');
  } else if (Array.isArray(t.entries) && t.entries.every((e) => typeof (e as TimeRecordEntry).hours === 'number')) {
    const sum = (t.entries as TimeRecordEntry[]).reduce((acc, e) => acc + e.hours, 0);
    if (t.total_hours !== sum) {
      errors.push('total_hours: must equal the sum of entry hours');
    }
  }

  if (t.submitted_at !== undefined && (typeof t.submitted_at !== 'string' || t.submitted_at.trim() === '')) {
    errors.push('submitted_at: must be a non-empty ISO 8601 timestamp when present');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

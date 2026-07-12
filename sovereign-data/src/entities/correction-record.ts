/**
 * Correction Record — Canonical Entity (Time & Travel workflow layer)
 * Canonical identifier: correction_id  ·  Data classification: program
 *
 * Approved D-TT3 (June 29, 2026); reaffirmed unchanged D-TT7 Option A (July 11, 2026).
 * Field-level schema derived from docs/17_TimeAndTravel_Architecture.md §6.2
 * (recurrence tracking), §6.4 (five communication templates), and §11 (COUNSEL
 * Decision Records are attached to the CorrectionRecord). Records the human-sent
 * communication and its resolution — the manager sends, never the system
 * (docs/17 §1: the system prepares, the human decides).
 *
 * Field names are frozen by the SOVEREIGN data dictionary.
 */

import type { ValidationResult } from '../shared-types';

/** The five communication templates (docs/17 §6.4). */
export type CorrectionCommunicationType =
  | 'ERROR_CORRECTION'
  | 'CLARIFICATION_REQUEST'
  | 'JUSTIFICATION_REQUEST'
  | 'PATTERN_FLAG_NOTICE'
  | 'FORMAL_ESCALATION';

export type CorrectionResolutionStatus =
  | 'PENDING'
  | 'CORRECTED'
  | 'CLARIFIED'
  | 'ESCALATED'
  | 'CLOSED';

const COMMUNICATION_TYPES: readonly CorrectionCommunicationType[] = [
  'ERROR_CORRECTION',
  'CLARIFICATION_REQUEST',
  'JUSTIFICATION_REQUEST',
  'PATTERN_FLAG_NOTICE',
  'FORMAL_ESCALATION',
];

const RESOLUTION_STATUSES: readonly CorrectionResolutionStatus[] = [
  'PENDING',
  'CORRECTED',
  'CLARIFIED',
  'ESCALATED',
  'CLOSED',
];

export interface CorrectionRecord {
  correction_id: string;
  /** The ComplianceFlag this correction addresses. */
  flag_id: string;
  employee_id: string;
  communication_type: CorrectionCommunicationType;
  /** Which occurrence in the rolling window this communication addresses (docs/17 §6.2). */
  occurrence_number: number;
  /** The human manager who reviewed and sent the communication. */
  sent_by: string;
  /** ISO 8601 timestamp the manager sent the communication. */
  sent_at: string;
  resolution_status: CorrectionResolutionStatus;
  resolution_note?: string;
  /**
   * FORMAL_ESCALATION only — whether the supervisor-notification version was
   * also sent (docs/17 §6.2: manager selects which version(s) to send).
   */
  supervisor_notified?: boolean;
  /** COUNSEL Decision Record attached for high-stakes cases (docs/17 §11). */
  counsel_decision_record_id?: string;
}

export function validateCorrectionRecord(record: unknown): ValidationResult {
  const errors: string[] = [];
  const r = record as Partial<CorrectionRecord>;

  for (const key of ['correction_id', 'flag_id', 'employee_id', 'sent_by', 'sent_at'] as const) {
    if (typeof r[key] !== 'string' || (r[key] as string).trim() === '') {
      errors.push(`${key}: required string`);
    }
  }
  if (!COMMUNICATION_TYPES.includes(r.communication_type as CorrectionCommunicationType)) {
    errors.push(`communication_type: must be one of ${COMMUNICATION_TYPES.join(', ')}`);
  }
  if (typeof r.occurrence_number !== 'number' || !Number.isInteger(r.occurrence_number) || r.occurrence_number < 1) {
    errors.push('occurrence_number: must be an integer >= 1');
  }
  if (!RESOLUTION_STATUSES.includes(r.resolution_status as CorrectionResolutionStatus)) {
    errors.push(`resolution_status: must be one of ${RESOLUTION_STATUSES.join(', ')}`);
  }
  if (r.resolution_note !== undefined && (typeof r.resolution_note !== 'string' || r.resolution_note.trim() === '')) {
    errors.push('resolution_note: must be a non-empty string when present');
  }
  if (r.supervisor_notified !== undefined) {
    if (typeof r.supervisor_notified !== 'boolean') {
      errors.push('supervisor_notified: must be a boolean when present');
    }
    if (r.communication_type !== 'FORMAL_ESCALATION') {
      errors.push('supervisor_notified: only valid on FORMAL_ESCALATION communications');
    }
  }
  if (
    r.counsel_decision_record_id !== undefined &&
    (typeof r.counsel_decision_record_id !== 'string' || r.counsel_decision_record_id.trim() === '')
  ) {
    errors.push('counsel_decision_record_id: must be a non-empty string when present');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * Program — Canonical Entity
 * Canonical identifier: program_id  ·  Data classification: program
 *
 * `classification_level` is a frozen Intelligence Layer exposure field
 * (Integration Brief §9 / shell-contract Section 9) — required on every program
 * entity, never renamed. Field names are frozen by the data dictionary.
 */

import type { ClearanceLevel, ValidationResult } from '../shared-types';
import { CLEARANCE_LEVELS } from '../shared-types';

export interface Program {
  program_id: string;
  name: string;
  sponsor: string;
  contract_number: string;
  /** Frozen IL exposure field — required on every program entity. */
  classification_level: ClearanceLevel;
  status: string;
}

export function validateProgram(program: unknown): ValidationResult {
  const errors: string[] = [];
  const p = program as Partial<Program>;

  if (typeof p.program_id !== 'string' || p.program_id.trim() === '') {
    errors.push('program_id: required string');
  }
  if (typeof p.name !== 'string' || p.name.trim() === '') {
    errors.push('name: required string');
  }
  if (typeof p.sponsor !== 'string' || p.sponsor.trim() === '') {
    errors.push('sponsor: required string');
  }
  if (typeof p.contract_number !== 'string' || p.contract_number.trim() === '') {
    errors.push('contract_number: required string');
  }
  if (!CLEARANCE_LEVELS.includes(p.classification_level as ClearanceLevel)) {
    errors.push(`classification_level: must be one of ${CLEARANCE_LEVELS.join(' | ')}`);
  }
  if (typeof p.status !== 'string' || p.status.trim() === '') {
    errors.push('status: required string');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

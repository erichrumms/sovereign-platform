/**
 * Document — Canonical Entity
 * Canonical identifier: document_id  ·  Data classification: program
 *
 * `classification_level` is a frozen Intelligence Layer exposure field.
 * Field names are frozen by the SOVEREIGN data dictionary.
 */

import type { ClearanceLevel, ValidationResult } from '../shared-types';
import { CLEARANCE_LEVELS } from '../shared-types';

export interface Document {
  document_id: string;
  title: string;
  /** Frozen IL exposure field. */
  classification_level: ClearanceLevel;
  version: string;
  /** employee_id of the creator. */
  created_by: string;
  program_id: string;
  /** ISO 8601 timestamp. */
  created_at: string;
}

export function validateDocument(document: unknown): ValidationResult {
  const errors: string[] = [];
  const d = document as Partial<Document>;

  if (typeof d.document_id !== 'string' || d.document_id.trim() === '') {
    errors.push('document_id: required string');
  }
  if (typeof d.title !== 'string' || d.title.trim() === '') {
    errors.push('title: required string');
  }
  if (!CLEARANCE_LEVELS.includes(d.classification_level as ClearanceLevel)) {
    errors.push(`classification_level: must be one of ${CLEARANCE_LEVELS.join(' | ')}`);
  }
  if (typeof d.version !== 'string' || d.version.trim() === '') {
    errors.push('version: required string');
  }
  if (typeof d.created_by !== 'string' || d.created_by.trim() === '') {
    errors.push('created_by: required string');
  }
  if (typeof d.program_id !== 'string' || d.program_id.trim() === '') {
    errors.push('program_id: required string');
  }
  if (typeof d.created_at !== 'string' || d.created_at.trim() === '') {
    errors.push('created_at: required ISO 8601 string');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * Cost Code — Canonical Entity
 * Canonical identifier: cost_code  ·  Data classification: program
 *
 * Field names are frozen by the SOVEREIGN data dictionary.
 */

import type { ValidationResult } from '../shared-types';

export interface CostCode {
  cost_code: string;
  program_id: string;
  labor_category: string;
  /** Federal fiscal year, e.g. 2026. */
  fiscal_year: number;
  /** Funding ceiling in whole currency units. */
  ceiling: number;
}

export function validateCostCode(costCode: unknown): ValidationResult {
  const errors: string[] = [];
  const c = costCode as Partial<CostCode>;

  if (typeof c.cost_code !== 'string' || c.cost_code.trim() === '') {
    errors.push('cost_code: required string');
  }
  if (typeof c.program_id !== 'string' || c.program_id.trim() === '') {
    errors.push('program_id: required string');
  }
  if (typeof c.labor_category !== 'string' || c.labor_category.trim() === '') {
    errors.push('labor_category: required string');
  }
  if (typeof c.fiscal_year !== 'number' || !Number.isInteger(c.fiscal_year)) {
    errors.push('fiscal_year: must be an integer');
  }
  if (typeof c.ceiling !== 'number' || c.ceiling < 0) {
    errors.push('ceiling: must be a non-negative number');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

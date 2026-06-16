/**
 * Employee — Canonical Entity
 * Canonical identifier: employee_id  ·  Data classification: program
 *
 * Field names are frozen by the SOVEREIGN data dictionary (system_prompt.md /
 * Integration Brief §10). No module may redefine or rename these fields.
 * TypeScript types are chosen to match the documented field semantics; the
 * field NAMES are the governed contract.
 */

import type { SovereignRole, ClearanceLevel, ValidationResult } from '../shared-types';
import { SOVEREIGN_ROLES, CLEARANCE_LEVELS } from '../shared-types';

export interface Employee {
  employee_id: string;
  name: string;
  org_unit: string;
  role: SovereignRole;
  clearance_level: ClearanceLevel;
  /** Cost codes this employee is assigned to (cost_code identifiers). */
  cost_code_assignments: string[];
}

export function validateEmployee(employee: unknown): ValidationResult {
  const errors: string[] = [];
  const e = employee as Partial<Employee>;

  if (typeof e.employee_id !== 'string' || e.employee_id.trim() === '') {
    errors.push('employee_id: required string');
  }
  if (typeof e.name !== 'string' || e.name.trim() === '') {
    errors.push('name: required string');
  }
  if (typeof e.org_unit !== 'string' || e.org_unit.trim() === '') {
    errors.push('org_unit: required string');
  }
  if (!SOVEREIGN_ROLES.includes(e.role as SovereignRole)) {
    errors.push(`role: must be one of ${SOVEREIGN_ROLES.join(' | ')}`);
  }
  if (!CLEARANCE_LEVELS.includes(e.clearance_level as ClearanceLevel)) {
    errors.push(`clearance_level: must be one of ${CLEARANCE_LEVELS.join(' | ')}`);
  }
  if (!Array.isArray(e.cost_code_assignments) ||
      !e.cost_code_assignments.every((c) => typeof c === 'string')) {
    errors.push('cost_code_assignments: must be string[]');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

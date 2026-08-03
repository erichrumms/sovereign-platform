/**
 * Staff Project Assignment — Canonical Entity
 * Canonical identifier: (staff_id, project_id, project_system) composite
 * Data classification: program
 *
 * GD-33 (shell-contract v1.26, August 3, 2026) — the many-to-many link between
 * staff (Employee.employee_id) and programs. project_system distinguishes the two
 * program datasets: "ppbe_native" for ProgramRecord instances in sovereign-data
 * (program_id = 'SYNTH-PRG-*') and "world_model" for ApexProgramRecord instances
 * in module-apex (program_id = 'P-*'). Placement confirmed by direct check of the
 * sovereign-data entity/index pattern: all canonical entity types live in
 * sovereign-data/src/entities/ and are exported from sovereign-data/src/index.ts.
 *
 * Field names are frozen by the SOVEREIGN data dictionary.
 */

import type { ValidationResult } from '../shared-types';

export interface StaffProjectAssignment {
  /** FK → Employee.employee_id — the staff member. */
  staff_id: string;
  /** FK → ProgramRecord.program_id (ppbe_native) or ApexProgramRecord.program_id (world_model). */
  project_id: string;
  /** Which program dataset this project_id belongs to. */
  project_system: 'world_model' | 'ppbe_native';
}

const PROJECT_SYSTEMS: readonly StaffProjectAssignment['project_system'][] = [
  'world_model',
  'ppbe_native',
];

export function validateStaffProjectAssignment(assignment: unknown): ValidationResult {
  const errors: string[] = [];
  const a = assignment as Partial<StaffProjectAssignment>;

  if (typeof a.staff_id !== 'string' || a.staff_id.trim() === '') {
    errors.push('staff_id: required non-empty string');
  }
  if (typeof a.project_id !== 'string' || a.project_id.trim() === '') {
    errors.push('project_id: required non-empty string');
  }
  if (!PROJECT_SYSTEMS.includes(a.project_system as StaffProjectAssignment['project_system'])) {
    errors.push(`project_system: must be one of ${PROJECT_SYSTEMS.join(' | ')}`);
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

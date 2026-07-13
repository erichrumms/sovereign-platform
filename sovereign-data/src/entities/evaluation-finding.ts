/**
 * Evaluation Finding — Canonical Entity (PPBE workflow layer)
 * Canonical identifier: finding_id  ·  Data classification: program
 *
 * Approved D-P3 (June 29, 2026); reaffirmed unchanged D-P7 Option A (July 12, 2026).
 * Field-level schema per docs/18_PPBE_Workflow_Architecture.md §3.5. The
 * `objective_id` FK closes the Phase 6 → Phase 1 feedback loop;
 * `feeds_planning_cycle` is tracked so the loop is measured, not assumed
 * (architecture doc §5.1 / risk R-P7).
 *
 * Field names are frozen by the SOVEREIGN data dictionary.
 */

import type { ValidationResult } from '../shared-types';

/** Finding classification per docs/18 §3.5 — literal values are spec-frozen. */
export type EvaluationFindingType = 'on-track' | 'variance' | 'contradicts-assumption';

export interface EvaluationFinding {
  finding_id: string;
  /** FK → ProgramRecord. */
  program_id: string;
  /** FK → StrategicObjective — closes the Phase 6 → Phase 1 feedback loop. */
  objective_id: string;
  finding_type: EvaluationFindingType;
  /** Plain prose per Gap 5. */
  narrative: string;
  /** Tracked so the feedback loop is measured, not assumed. */
  feeds_planning_cycle: boolean;
  /** Constraint #6 — joins the finding to the audit trail. */
  workflow_step_id: string;
}

const EVALUATION_FINDING_TYPES: readonly EvaluationFindingType[] = [
  'on-track',
  'variance',
  'contradicts-assumption',
];

export function validateEvaluationFinding(finding: unknown): ValidationResult {
  const errors: string[] = [];
  const f = finding as Partial<EvaluationFinding>;

  for (const key of [
    'finding_id',
    'program_id',
    'objective_id',
    'narrative',
    'workflow_step_id',
  ] as const) {
    if (typeof f[key] !== 'string' || (f[key] as string).trim() === '') {
      errors.push(`${key}: required string`);
    }
  }
  if (!EVALUATION_FINDING_TYPES.includes(f.finding_type as EvaluationFindingType)) {
    errors.push(`finding_type: must be one of ${EVALUATION_FINDING_TYPES.join(', ')}`);
  }
  if (typeof f.feeds_planning_cycle !== 'boolean') {
    errors.push('feeds_planning_cycle: must be a boolean');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

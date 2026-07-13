/**
 * Strategic Objective — Canonical Entity (PPBE workflow layer)
 * Canonical identifier: objective_id  ·  Data classification: program
 *
 * Approved D-P3 (June 29, 2026); reaffirmed unchanged D-P7 Option A (July 12, 2026).
 * Field-level schema per docs/18_PPBE_Workflow_Architecture.md §3.1. Produced
 * during PPBE Phase 1 (Strategic Direction); the first link in the traceability
 * chain StrategicObjective → ProgramRecord → ObligationRecord / EvaluationFinding.
 *
 * Field names are frozen by the SOVEREIGN data dictionary.
 */

import type { ValidationResult } from '../shared-types';

/** Lifecycle status per docs/18 §3.1 — literal values are spec-frozen. */
export type StrategicObjectiveStatus = 'draft' | 'active' | 'superseded';

export interface StrategicObjective {
  objective_id: string;
  title: string;
  description: string;
  /** Set during Phase 1 (Strategic Direction) ranking. */
  priority_rank: number;
  /** Spelled out per Gap 5, e.g. `FY 2027-2031`. */
  fiscal_year_range: string;
  /** FK → Logger: the FLOWPATH elicitation that produced it. */
  source_workflow_step_id: string;
  /** FK → COUNSEL: the signed Decision Record that approved the ranking. */
  decision_record_id: string;
  status: StrategicObjectiveStatus;
}

const STRATEGIC_OBJECTIVE_STATUSES: readonly StrategicObjectiveStatus[] = [
  'draft',
  'active',
  'superseded',
];

export function validateStrategicObjective(objective: unknown): ValidationResult {
  const errors: string[] = [];
  const o = objective as Partial<StrategicObjective>;

  for (const key of [
    'objective_id',
    'title',
    'description',
    'fiscal_year_range',
    'source_workflow_step_id',
    'decision_record_id',
  ] as const) {
    if (typeof o[key] !== 'string' || (o[key] as string).trim() === '') {
      errors.push(`${key}: required string`);
    }
  }
  if (typeof o.priority_rank !== 'number' || !Number.isInteger(o.priority_rank) || o.priority_rank < 1) {
    errors.push('priority_rank: must be a positive integer');
  }
  if (!STRATEGIC_OBJECTIVE_STATUSES.includes(o.status as StrategicObjectiveStatus)) {
    errors.push(`status: must be one of ${STRATEGIC_OBJECTIVE_STATUSES.join(', ')}`);
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

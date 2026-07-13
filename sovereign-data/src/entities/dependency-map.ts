/**
 * Dependency Map — Canonical Entity (PPBE workflow layer)
 * Canonical identifier: dependency_id  ·  Data classification: program
 *
 * Approved D-P3 (June 29, 2026); reaffirmed unchanged D-P7 Option A (July 12, 2026).
 * Field-level schema per docs/18_PPBE_Workflow_Architecture.md §3.6. Describes an
 * inter-workflow handoff across the six PPBE phases; `health_status` feeds
 * ppbe-dependency-tracker, which reads these records (read-only) and routes
 * failures to VIGIL as PPBE_ANOMALY events.
 *
 * Field names are frozen by the SOVEREIGN data dictionary.
 */

import type { ValidationResult } from '../shared-types';

/** Handoff health per docs/18 §3.6 — literal values are spec-frozen. */
export type DependencyHealthStatus = 'healthy' | 'at-risk' | 'failed';

export interface DependencyMap {
  dependency_id: string;
  source_workflow: string;
  target_workflow: string;
  /** Plain prose per Gap 5 — what a valid handoff looks like. */
  handoff_standard: string;
  /** Plain prose per Gap 5, e.g. `within 5 business days of phase close`. */
  timing_requirement: string;
  health_status: DependencyHealthStatus;
}

const DEPENDENCY_HEALTH_STATUSES: readonly DependencyHealthStatus[] = [
  'healthy',
  'at-risk',
  'failed',
];

export function validateDependencyMap(map: unknown): ValidationResult {
  const errors: string[] = [];
  const m = map as Partial<DependencyMap>;

  for (const key of [
    'dependency_id',
    'source_workflow',
    'target_workflow',
    'handoff_standard',
    'timing_requirement',
  ] as const) {
    if (typeof m[key] !== 'string' || (m[key] as string).trim() === '') {
      errors.push(`${key}: required string`);
    }
  }
  if (m.source_workflow === m.target_workflow && typeof m.source_workflow === 'string') {
    errors.push('target_workflow: must differ from source_workflow');
  }
  if (!DEPENDENCY_HEALTH_STATUSES.includes(m.health_status as DependencyHealthStatus)) {
    errors.push(`health_status: must be one of ${DEPENDENCY_HEALTH_STATUSES.join(', ')}`);
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * Budget Exhibit — Canonical Entity (PPBE workflow layer)
 * Canonical identifier: exhibit_id  ·  Data classification: program
 *
 * Approved D-P3 (June 29, 2026); reaffirmed unchanged D-P7 Option A (July 12, 2026).
 * Field-level schema per docs/18_PPBE_Workflow_Architecture.md §3.3. Narrative
 * content is produced by ppbe-exhibit-drafter / SCRIBE (Full Cycle session);
 * every figure is traceable via `source_data_lineage` (architecture doc §9);
 * export is gated on ARIA Suite CLEAR certification via the existing
 * `ctx.aria.isCertified` gate (GD-20) — no new gate mechanism.
 *
 * docs/18 §3.3 specifies `certification_status` and `export_status` only as
 * "enum" — the literal values below are this build's minimal elaboration
 * (documented in the Session 31 handoff), aligned to the AriaCertification
 * surface's certified/flagged outcomes and SCRIBE's export gate states.
 *
 * Field names are frozen by the SOVEREIGN data dictionary.
 */

import type { ValidationResult } from '../shared-types';

/** Set by ARIA Suite CLEAR (docs/18 §3.3): not yet evaluated, certified, or flagged. */
export type ExhibitCertificationStatus = 'UNCERTIFIED' | 'CERTIFIED' | 'FLAGGED';

/** Gated per SCRIBE's existing export-gate mechanism (ctx.aria.isCertified, GD-20). */
export type ExhibitExportStatus = 'NOT_EXPORTED' | 'APPROVED_FOR_EXPORT' | 'EXPORTED';

export interface BudgetExhibit {
  exhibit_id: string;
  /** FK → ProgramRecord. */
  program_id: string;
  fiscal_year: string;
  /** Produced by ppbe-exhibit-drafter / SCRIBE. */
  narrative_content: string;
  /** Logger event references (workflow_step_id values) — every figure traceable. */
  source_data_lineage: string[];
  certification_status: ExhibitCertificationStatus;
  export_status: ExhibitExportStatus;
}

const CERTIFICATION_STATUSES: readonly ExhibitCertificationStatus[] = [
  'UNCERTIFIED',
  'CERTIFIED',
  'FLAGGED',
];

const EXPORT_STATUSES: readonly ExhibitExportStatus[] = [
  'NOT_EXPORTED',
  'APPROVED_FOR_EXPORT',
  'EXPORTED',
];

export function validateBudgetExhibit(exhibit: unknown): ValidationResult {
  const errors: string[] = [];
  const e = exhibit as Partial<BudgetExhibit>;

  for (const key of ['exhibit_id', 'program_id', 'fiscal_year', 'narrative_content'] as const) {
    if (typeof e[key] !== 'string' || (e[key] as string).trim() === '') {
      errors.push(`${key}: required string`);
    }
  }
  if (
    !Array.isArray(e.source_data_lineage) ||
    e.source_data_lineage.some((ref) => typeof ref !== 'string' || ref.trim() === '')
  ) {
    errors.push('source_data_lineage: must be an array of non-empty Logger event references');
  }
  if (!CERTIFICATION_STATUSES.includes(e.certification_status as ExhibitCertificationStatus)) {
    errors.push(`certification_status: must be one of ${CERTIFICATION_STATUSES.join(', ')}`);
  }
  if (!EXPORT_STATUSES.includes(e.export_status as ExhibitExportStatus)) {
    errors.push(`export_status: must be one of ${EXPORT_STATUSES.join(', ')}`);
  }
  // Export gate invariant (GD-20 pattern): an exhibit cannot move past NOT_EXPORTED
  // without holding a positive CLEAR certification.
  if (
    e.export_status !== undefined &&
    e.export_status !== 'NOT_EXPORTED' &&
    e.certification_status !== 'CERTIFIED'
  ) {
    errors.push('export_status: export requires certification_status CERTIFIED (CLEAR gate, GD-20)');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

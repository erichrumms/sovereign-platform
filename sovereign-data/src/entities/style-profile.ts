/**
 * StyleProfile — Canonical Entity
 * Approved: GD-1, June 11, 2026, Project Principal
 * Owner: module-scribe (scribe-style-analyst agent)
 * Data Classification: user
 *
 * Personal writing voice profile maintained by SCRIBE's Style DNA feature.
 * Contains no program data, task data, or compliance-sensitive content.
 * One profile per user_id. Updates are in-place — history is not retained.
 *
 * FIELD NAMES ARE FROZEN. No module may redefine or rename these fields.
 * Additions require a new governance decision and sovereign-data version increment.
 */

export interface StyleProfile {
  /** SOVEREIGN user identifier — matches ctx.auth.userId */
  user_id: string;

  /**
   * Overall formality level of the user's writing.
   * 0 = highly informal, 100 = highly formal.
   * Integer. Validated: must be 0–100 inclusive.
   */
  formality_score: number;

  /**
   * Characteristic sentence structure complexity.
   * 'simple'   — short sentences, minimal subordinate clauses
   * 'moderate' — mixed structure, some complex sentences
   * 'complex'  — frequent subordinate clauses, longer sentences
   */
  sentence_complexity: 'simple' | 'moderate' | 'complex';

  /**
   * Characteristic vocabulary level.
   * 'accessible'  — common vocabulary, minimal jargon
   * 'technical'   — domain-specific terminology, assumes familiarity
   * 'specialized' — highly specialized, field-specific terminology
   */
  vocabulary_density: 'accessible' | 'technical' | 'specialized';

  /**
   * Recurring structural patterns observed in the user's writing.
   * String array — values are descriptive labels extracted by scribe-style-analyst.
   * Examples: ['active voice', 'short paragraphs', 'bullet-point lists',
   *            'numbered steps', 'direct address', 'hedging language']
   * Array may be empty if no strong patterns are detected.
   */
  structural_patterns: string[];

  /**
   * Total number of writing samples analyzed to build this profile.
   * Additive across profile updates — incremented on each Style DNA analysis call.
   * Used to signal profile confidence: low sample_count = less reliable profile.
   * Minimum meaningful profile: sample_count >= 1 (200+ words recommended per sample).
   */
  sample_count: number;

  /** ISO 8601 — profile first created */
  created_at: string;

  /** ISO 8601 — profile last updated */
  updated_at: string;
}

/**
 * StyleProfileUpdate — the partial shape used when updating an existing profile.
 * user_id and created_at are immutable after creation.
 * sample_count is always incremented, never set directly.
 */
export type StyleProfileUpdate = Omit<StyleProfile, 'user_id' | 'created_at'>;

/**
 * Runtime validation for StyleProfile.
 * Call before writing a StyleProfile to sovereign-data.
 * Returns { valid: true } or { valid: false, errors: string[] }.
 */
export function validateStyleProfile(
  profile: unknown
): { valid: true } | { valid: false; errors: string[] } {
  const errors: string[] = [];
  const p = profile as Partial<StyleProfile>;

  if (typeof p.user_id !== 'string' || p.user_id.trim() === '') {
    errors.push('user_id: required string');
  }
  if (typeof p.formality_score !== 'number' ||
      !Number.isInteger(p.formality_score) ||
      p.formality_score < 0 ||
      p.formality_score > 100) {
    errors.push('formality_score: must be integer 0–100');
  }
  if (!['simple', 'moderate', 'complex'].includes(p.sentence_complexity as string)) {
    errors.push('sentence_complexity: must be simple | moderate | complex');
  }
  if (!['accessible', 'technical', 'specialized'].includes(p.vocabulary_density as string)) {
    errors.push('vocabulary_density: must be accessible | technical | specialized');
  }
  if (!Array.isArray(p.structural_patterns)) {
    errors.push('structural_patterns: must be string[]');
  }
  if (typeof p.sample_count !== 'number' ||
      !Number.isInteger(p.sample_count) ||
      p.sample_count < 1) {
    errors.push('sample_count: must be integer >= 1');
  }
  if (typeof p.created_at !== 'string') {
    errors.push('created_at: required ISO 8601 string');
  }
  if (typeof p.updated_at !== 'string') {
    errors.push('updated_at: required ISO 8601 string');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

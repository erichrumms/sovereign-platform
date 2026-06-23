/**
 * LensExplanation — Canonical Entity
 * Added: Session 8, June 22, 2026, Project Principal (LENS core build)
 * Owner: module-lens (lens-explainer agent)
 * Data Classification: platform-explanatory (no program, task, or restricted-record content)
 *
 * The structured explanation the LENS Governance Explainer returns to a user.
 * Produced by the lens-explainer agent under PR-LENS-001, grounded EXCLUSIVELY in
 * the LENS knowledge-base source documents supplied as context. Validated by
 * validateLensExplanation BEFORE it is shown to the user (spec §2.1 / prompt
 * "Output format — STRICT").
 *
 * FIELD NAMES ARE FROZEN. They mirror the PR-LENS-001 output shape exactly
 * (Project Principal decision, Session 8: align the entity to the approved prompt).
 * No module may redefine or rename these fields. Additions require a new governance
 * decision and a sovereign-data version increment.
 */

export type LensExplanationConfidence = 'grounded' | 'partial';

export interface LensExplanation {
  /**
   * The plain-language answer to the user's question, grounded only in the
   * supplied source documents. Non-empty.
   */
  explanation: string;

  /**
   * The source-document names the explanation was grounded in
   * (e.g. 'vigil_alert_response', 'vigil_agent_approvals').
   * Non-empty when confidence is 'grounded' or 'partial' and the answer drew on
   * any source; may be empty only when the answer is fully out of scope.
   */
  sources: string[];

  /**
   * 'grounded' — the answer is fully supported by the supplied sources (gaps empty).
   * 'partial'  — the sources only partly cover the question (gaps non-empty).
   */
  confidence: LensExplanationConfidence;

  /**
   * Anything the question asked that the supplied sources do not cover.
   * Empty when confidence is 'grounded'; non-empty when 'partial'.
   * LENS never fills a gap with invented platform behaviour — it lists it here.
   */
  gaps: string[];
}

/**
 * Runtime validation for LensExplanation.
 * Call before showing a LensExplanation to the user. Mirrors the PR-LENS-001
 * "What you produce" shape exactly, and enforces the grounded/partial ⇔ gaps
 * invariant the prompt specifies (grounded ⇒ no gaps; partial ⇒ at least one gap).
 * Returns { valid: true } or { valid: false, errors: string[] }.
 */
export function validateLensExplanation(
  value: unknown
): { valid: true } | { valid: false; errors: string[] } {
  if (typeof value !== 'object' || value === null) {
    return { valid: false, errors: ['LensExplanation must be a non-null object'] };
  }
  const errors: string[] = [];
  const e = value as Partial<LensExplanation>;

  if (typeof e.explanation !== 'string' || e.explanation.trim() === '') {
    errors.push('explanation: required non-empty string');
  }
  if (
    !Array.isArray(e.sources) ||
    !e.sources.every((s) => typeof s === 'string' && s.trim() !== '')
  ) {
    errors.push('sources: must be an array of non-empty strings');
  }
  if (e.confidence !== 'grounded' && e.confidence !== 'partial') {
    errors.push("confidence: must be 'grounded' | 'partial'");
  }
  if (
    !Array.isArray(e.gaps) ||
    !e.gaps.every((g) => typeof g === 'string' && g.trim() !== '')
  ) {
    errors.push('gaps: must be an array of non-empty strings');
  } else if (e.confidence === 'grounded' && e.gaps.length !== 0) {
    errors.push("gaps: must be empty when confidence is 'grounded'");
  } else if (e.confidence === 'partial' && e.gaps.length === 0) {
    errors.push("gaps: must be non-empty when confidence is 'partial'");
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

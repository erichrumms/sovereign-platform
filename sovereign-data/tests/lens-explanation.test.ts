/**
 * LensExplanation validation tests — Session 8 entity (aligned to PR-LENS-001).
 * Fields are frozen; these tests guard the frozen contract and the
 * grounded/partial ⇔ gaps invariant the prompt specifies.
 */

import {
  validateLensExplanation,
  type LensExplanation,
} from '../src/entities/lens-explanation';

function grounded(): LensExplanation {
  return {
    explanation:
      'Only PLATFORM_ADMIN and SYSTEM_ADMIN roles can mount VIGIL; the system enforces this structurally before the module loads.',
    sources: ['vigil_alert_response'],
    confidence: 'grounded',
    gaps: [],
  };
}

function partial(): LensExplanation {
  return {
    explanation:
      'VIGIL surfaces agent approval requests for human authorization; the two source documents do not describe approval SLAs.',
    sources: ['vigil_agent_approvals'],
    confidence: 'partial',
    gaps: ['Approval request service-level expectations are not covered by the supplied sources.'],
  };
}

describe('validateLensExplanation', () => {
  it('passes a valid grounded explanation', () => {
    expect(validateLensExplanation(grounded())).toEqual({ valid: true });
  });

  it('passes a valid partial explanation', () => {
    expect(validateLensExplanation(partial())).toEqual({ valid: true });
  });

  it('rejects a non-object', () => {
    const result = validateLensExplanation(null);
    expect(result.valid).toBe(false);
  });

  it('rejects an empty explanation', () => {
    const result = validateLensExplanation({ ...grounded(), explanation: '   ' });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain('explanation: required non-empty string');
    }
  });

  it('rejects sources that are not all non-empty strings', () => {
    const result = validateLensExplanation({ ...grounded(), sources: ['ok', ''] });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain('sources: must be an array of non-empty strings');
    }
  });

  it('rejects an unknown confidence value', () => {
    const result = validateLensExplanation({ ...grounded(), confidence: 'high' });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain("confidence: must be 'grounded' | 'partial'");
    }
  });

  it('rejects grounded with non-empty gaps', () => {
    const result = validateLensExplanation({ ...grounded(), gaps: ['something missing'] });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain("gaps: must be empty when confidence is 'grounded'");
    }
  });

  it('rejects partial with empty gaps', () => {
    const result = validateLensExplanation({ ...partial(), gaps: [] });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain("gaps: must be non-empty when confidence is 'partial'");
    }
  });

  it('rejects gaps that are not all non-empty strings', () => {
    const result = validateLensExplanation({ ...partial(), gaps: [''] });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain('gaps: must be an array of non-empty strings');
    }
  });
});

/**
 * ReasoningChainOutput validation tests — Session 11 entity (CPMI).
 * Fields are frozen; these tests guard the canonical six-step output shape.
 */
import {
  validateReasoningChainOutput,
  type ReasoningChainOutput,
} from '../src/entities/reasoning-chain-output';

function valid(): ReasoningChainOutput {
  return {
    context_summary: 'Program P-100 is mid-execution with a schedule slip flag.',
    context_confidence: 'high',
    risk_register: [{ risk: 'Schedule slip on milestone 3', severity: 'P2', type: 'schedule' }],
    constraint_map: [
      {
        constraint: 'FAR 15.2 source selection',
        permitted: 'Competitive re-scope within ceiling',
        prohibited: 'Sole-source extension without J&A',
        requires_approval: 'Any ceiling increase',
      },
    ],
    option_set: [
      { option: 'Re-baseline milestone 3', cost: 'Two-week slip', defers: 'Milestone 4', closes: 'Schedule risk' },
    ],
    recommendation: 'Re-baseline milestone 3 and notify the governance board.',
    alternatives_considered: ['Accept the slip', 'De-scope milestone 3'],
    schema_valid: true,
  };
}

describe('validateReasoningChainOutput', () => {
  it('passes a valid output', () => {
    expect(validateReasoningChainOutput(valid())).toEqual({ valid: true });
  });

  it('rejects a non-object', () => {
    expect(validateReasoningChainOutput(null).valid).toBe(false);
  });

  it('rejects an invalid context_confidence', () => {
    const r = validateReasoningChainOutput({ ...valid(), context_confidence: 'certain' });
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.errors).toContain('context_confidence: must be high | medium | low');
  });

  it('rejects a bad risk severity/type', () => {
    const r = validateReasoningChainOutput({
      ...valid(),
      risk_register: [{ risk: 'x', severity: 'P9', type: 'unknown' }],
    });
    expect(r.valid).toBe(false);
  });

  it('rejects an incomplete constraint entry', () => {
    const r = validateReasoningChainOutput({
      ...valid(),
      constraint_map: [{ constraint: 'c', permitted: 'p', prohibited: 'x' }],
    });
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.errors.some((e) => e.includes('requires_approval'))).toBe(true);
  });

  it('rejects a non-boolean schema_valid', () => {
    const r = validateReasoningChainOutput({ ...valid(), schema_valid: 'true' });
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.errors).toContain('schema_valid: required boolean');
  });

  it('rejects a non-array alternatives_considered', () => {
    const r = validateReasoningChainOutput({ ...valid(), alternatives_considered: 'none' });
    expect(r.valid).toBe(false);
  });
});

/**
 * StyleProfile validation tests — GD-1 entity.
 * Minimum suite per companion suite specification §1.4 (8 tests) plus
 * additional robustness cases. Fields are frozen; these tests guard the
 * frozen contract.
 */

import {
  validateStyleProfile,
  type StyleProfile,
} from '../src/entities/style-profile';

function validProfile(): StyleProfile {
  return {
    user_id: 'user-001',
    formality_score: 72,
    sentence_complexity: 'moderate',
    vocabulary_density: 'technical',
    structural_patterns: ['active voice', 'short paragraphs'],
    sample_count: 3,
    created_at: '2026-06-13T00:00:00.000Z',
    updated_at: '2026-06-13T00:00:00.000Z',
  };
}

describe('validateStyleProfile (§1.4 required suite)', () => {
  // 1
  it('passes a valid StyleProfile', () => {
    expect(validateStyleProfile(validProfile())).toEqual({ valid: true });
  });

  // 2
  it('rejects formality_score outside 0–100', () => {
    const result = validateStyleProfile({ ...validProfile(), formality_score: 101 });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain('formality_score: must be integer 0–100');
    }

    const low = validateStyleProfile({ ...validProfile(), formality_score: -1 });
    expect(low.valid).toBe(false);
  });

  // 3
  it('rejects non-integer formality_score', () => {
    const result = validateStyleProfile({ ...validProfile(), formality_score: 50.5 });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain('formality_score: must be integer 0–100');
    }
  });

  // 4
  it('rejects invalid sentence_complexity value', () => {
    const result = validateStyleProfile({ ...validProfile(), sentence_complexity: 'ornate' });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain('sentence_complexity: must be simple | moderate | complex');
    }
  });

  // 5
  it('rejects invalid vocabulary_density value', () => {
    const result = validateStyleProfile({ ...validProfile(), vocabulary_density: 'fancy' });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain('vocabulary_density: must be accessible | technical | specialized');
    }
  });

  // 6
  it('rejects sample_count < 1', () => {
    const result = validateStyleProfile({ ...validProfile(), sample_count: 0 });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain('sample_count: must be integer >= 1');
    }
  });

  // 7
  it('rejects non-array structural_patterns', () => {
    const result = validateStyleProfile({ ...validProfile(), structural_patterns: 'active voice' });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain('structural_patterns: must be string[]');
    }
  });

  // 8
  it('round-trips a valid profile through JSON identical', () => {
    const original = validProfile();
    const reparsed = JSON.parse(JSON.stringify(original)) as StyleProfile;
    expect(validateStyleProfile(reparsed)).toEqual({ valid: true });
    expect(reparsed).toEqual(original);
  });
});

describe('validateStyleProfile (robustness)', () => {
  it('accepts an empty structural_patterns array', () => {
    expect(validateStyleProfile({ ...validProfile(), structural_patterns: [] })).toEqual({ valid: true });
  });

  it('accepts boundary formality_score values 0 and 100', () => {
    expect(validateStyleProfile({ ...validProfile(), formality_score: 0 })).toEqual({ valid: true });
    expect(validateStyleProfile({ ...validProfile(), formality_score: 100 })).toEqual({ valid: true });
  });

  it('rejects an empty user_id', () => {
    const result = validateStyleProfile({ ...validProfile(), user_id: '   ' });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain('user_id: required string');
    }
  });

  it('rejects missing timestamps and accumulates multiple errors', () => {
    const result = validateStyleProfile({
      user_id: 'user-002',
      formality_score: 200,
      sentence_complexity: 'moderate',
      vocabulary_density: 'technical',
      structural_patterns: [],
      sample_count: 2,
      // created_at / updated_at omitted
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain('created_at: required ISO 8601 string');
      expect(result.errors).toContain('updated_at: required ISO 8601 string');
      expect(result.errors).toContain('formality_score: must be integer 0–100');
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    }
  });
});

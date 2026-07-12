/**
 * sovereign-data — tt-seed.test.ts (Session 29, D1/D3)
 * The canonical Time & Travel synthetic seed data: every instance validates
 * against its D-TT3 entity validator, every id carries the SYNTH- prefix
 * (Session 28 e2e convention), and the deliberately-broken rule seeds
 * (exhausted budget, inactive account) are present so the §6.1 rules are
 * exercisable from seed data alone.
 */
import { validateTravelPolicy, validateChargeAccount } from '../src';
import { SYNTH_TT_TRAVEL_POLICY, SYNTH_TT_CHARGE_ACCOUNTS } from '../src';

describe('TT synthetic seed — travel policy', () => {
  it('validates against the TravelPolicy entity validator', () => {
    expect(validateTravelPolicy(SYNTH_TT_TRAVEL_POLICY)).toEqual({ valid: true });
  });

  it('is SYNTH- prefixed and carries ascending routing thresholds', () => {
    expect(SYNTH_TT_TRAVEL_POLICY.policy_id).toMatch(/^SYNTH-/);
    expect(SYNTH_TT_TRAVEL_POLICY.flowpath_session_id).toMatch(/^SYNTH-/);
    const t = SYNTH_TT_TRAVEL_POLICY.routing_thresholds;
    expect(t.manager_threshold).toBeLessThanOrEqual(t.director_threshold);
    expect(t.director_threshold).toBeLessThanOrEqual(t.executive_threshold);
  });
});

describe('TT synthetic seed — charge accounts', () => {
  it('every account validates against the ChargeAccount entity validator', () => {
    for (const account of SYNTH_TT_CHARGE_ACCOUNTS) {
      expect(validateChargeAccount(account)).toEqual({ valid: true });
    }
  });

  it('every cost_code is SYNTH- prefixed', () => {
    for (const account of SYNTH_TT_CHARGE_ACCOUNTS) {
      expect(account.cost_code).toMatch(/^SYNTH-/);
    }
  });

  it('includes the deliberately-broken rule seeds: one exhausted budget, one inactive account', () => {
    expect(SYNTH_TT_CHARGE_ACCOUNTS.some((a) => a.budget_remaining === 0 && a.active)).toBe(true);
    expect(SYNTH_TT_CHARGE_ACCOUNTS.some((a) => !a.active)).toBe(true);
    expect(SYNTH_TT_CHARGE_ACCOUNTS.some((a) => a.account_type === 'INDIRECT')).toBe(true);
  });
});

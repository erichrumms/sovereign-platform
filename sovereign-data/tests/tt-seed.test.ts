/**
 * sovereign-data — tt-seed.test.ts (Session 29, D1/D3)
 * The canonical Time & Travel synthetic seed data: every instance validates
 * against its D-TT3 entity validator, every id carries the SYNTH- prefix
 * (Session 28 e2e convention), and the deliberately-broken rule seeds
 * (exhausted budget, inactive account) are present so the §6.1 rules are
 * exercisable from seed data alone.
 */
import {
  validateTravelPolicy,
  validateChargeAccount,
  validateTravelRequest,
  validateTimeRecord,
  validateComplianceFlag,
  validateCorrectionRecord,
} from '../src';
import {
  SYNTH_TT_TRAVEL_POLICY,
  SYNTH_TT_CHARGE_ACCOUNTS,
  SYNTH_TT_TRAVEL_REQUESTS,
  SYNTH_TT_TIME_RECORDS,
  SYNTH_TT_COMPLIANCE_FLAGS,
  SYNTH_TT_CORRECTION_RECORDS,
} from '../src';

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

describe('TT synthetic seed — travel requests (WE-5 state coverage)', () => {
  it('every request validates and is SYNTH- prefixed', () => {
    expect(SYNTH_TT_TRAVEL_REQUESTS.length).toBeGreaterThanOrEqual(8);
    for (const r of SYNTH_TT_TRAVEL_REQUESTS) {
      expect(validateTravelRequest(r)).toEqual({ valid: true });
      expect(r.request_id).toMatch(/^SYNTH-/);
      expect(r.employee_id).toMatch(/^SYNTH-/);
    }
  });

  it('spans every reachable decision state and all three routing tiers', () => {
    const statuses = new Set(SYNTH_TT_TRAVEL_REQUESTS.map((r) => r.status));
    for (const s of ['APPROVED', 'ROUTED', 'ESCALATED', 'DENIED']) expect(statuses).toContain(s);
    const tiers = new Set(SYNTH_TT_TRAVEL_REQUESTS.map((r) => r.routing_tier));
    for (const t of ['STANDARD', 'FLAGGED', 'ESCALATE']) expect(tiers).toContain(t);
    const authorities = new Set(SYNTH_TT_TRAVEL_REQUESTS.map((r) => r.assigned_authority));
    for (const a of ['MANAGER', 'DIRECTOR', 'EXECUTIVE']) expect(authorities).toContain(a);
  });
});

describe('TT synthetic seed — time records + compliance flags (WE-5 state coverage)', () => {
  it('every record and flag validates and is SYNTH- prefixed', () => {
    for (const r of SYNTH_TT_TIME_RECORDS) {
      expect(validateTimeRecord(r)).toEqual({ valid: true });
      expect(r.record_id).toMatch(/^SYNTH-/);
    }
    for (const f of SYNTH_TT_COMPLIANCE_FLAGS) {
      expect(validateComplianceFlag(f)).toEqual({ valid: true });
      expect(f.flag_id).toMatch(/^SYNTH-/);
    }
  });

  it('every flag references a seeded record', () => {
    const recordIds = new Set(SYNTH_TT_TIME_RECORDS.map((r) => r.record_id));
    for (const f of SYNTH_TT_COMPLIANCE_FLAGS) expect(recordIds).toContain(f.record_ref);
  });

  it('covers all five communication-type drivers, including two third-occurrence escalation cases', () => {
    const categories = new Set(SYNTH_TT_COMPLIANCE_FLAGS.map((f) => f.rule_category));
    // error correction / clarification / justification / pattern flag drivers:
    for (const c of ['UNAUTHORIZED_CHARGE_ACCOUNT', 'OVERTIME_THRESHOLD', 'JUSTIFICATION_ABSENCE', 'PATTERN_DRIFT', 'MISSING_HOURS']) {
      expect(categories).toContain(c);
    }
    // formal escalation: third occurrence, in BOTH gate states (pending + authorized).
    const escalations = SYNTH_TT_COMPLIANCE_FLAGS.filter((f) => f.recurrence_count >= 3);
    expect(escalations.length).toBeGreaterThanOrEqual(2);
  });
});

describe('TT synthetic seed — correction records', () => {
  it('every correction validates, references a seeded flag, and history spans resolution states', () => {
    const flagIds = new Set(SYNTH_TT_COMPLIANCE_FLAGS.map((f) => f.flag_id));
    for (const c of SYNTH_TT_CORRECTION_RECORDS) {
      expect(validateCorrectionRecord(c)).toEqual({ valid: true });
      expect(flagIds).toContain(c.flag_id);
      expect(c.correction_id).toMatch(/^SYNTH-/);
    }
    const states = new Set(SYNTH_TT_CORRECTION_RECORDS.map((c) => c.resolution_status));
    for (const s of ['CORRECTED', 'PENDING', 'ESCALATED']) expect(states).toContain(s);
  });
});

/**
 * Time & Travel entity validation tests — Session 27 (D1).
 * Six entities per D-TT3, reaffirmed unchanged by D-TT7 Option A (July 11, 2026).
 * Field-level schema derived from docs/17_TimeAndTravel_Architecture.md §4/§5/§6.
 * Guards the frozen data-dictionary field names against accidental drift.
 */

import { validateTravelPolicy, type TravelPolicy } from '../src/entities/travel-policy';
import { validateTravelRequest, type TravelRequest } from '../src/entities/travel-request';
import { validateTimeRecord, type TimeRecord } from '../src/entities/time-record';
import { validateChargeAccount, type ChargeAccount } from '../src/entities/charge-account';
import {
  validateComplianceFlag,
  TIME_RULE_SEVERITY,
  type ComplianceFlag,
} from '../src/entities/compliance-flag';
import { validateCorrectionRecord, type CorrectionRecord } from '../src/entities/correction-record';

const policy: TravelPolicy = {
  policy_id: 'TP-2026-01',
  effective_date: '2026-07-01',
  flowpath_session_id: 'FP-SESS-42',
  hard_exceptions: {
    personal_day_escalates: true,
    international_escalates: true,
    special_authority_categories: ['SITE_VISIT_CLASSIFIED'],
  },
  routing_thresholds: {
    manager_threshold: 2500,
    director_threshold: 10000,
    executive_threshold: 50000,
  },
  soft_flags: {
    advance_booking_standard_days: 14,
    advance_booking_short_notice_days: 7,
    advance_booking_critical_hours: 48,
    conference_fee_threshold: 1500,
    budget_proximity_percent: 85,
  },
};

describe('TravelPolicy', () => {
  it('accepts a valid policy', () => expect(validateTravelPolicy(policy)).toEqual({ valid: true }));
  it('rejects non-ascending routing thresholds', () => {
    const r = validateTravelPolicy({
      ...policy,
      routing_thresholds: { manager_threshold: 10000, director_threshold: 2500, executive_threshold: 50000 },
    });
    expect(r.valid).toBe(false);
  });
  it('rejects budget_proximity_percent above 100', () => {
    const r = validateTravelPolicy({
      ...policy,
      soft_flags: { ...policy.soft_flags, budget_proximity_percent: 120 },
    });
    expect(r.valid).toBe(false);
  });
  it('rejects a missing hard_exceptions object', () => {
    const { hard_exceptions: _omitted, ...rest } = policy;
    expect(validateTravelPolicy(rest).valid).toBe(false);
  });
});

const request: TravelRequest = {
  request_id: 'TR-1001',
  employee_id: 'emp-1',
  destination: 'Denver, CO',
  international: false,
  travel_start_date: '2026-08-03',
  travel_end_date: '2026-08-06',
  mission_purpose: 'Program milestone review',
  costs: { airfare: 450, hotel: 600, per_diem: 236, ground_transport: 90, registration_fees: 0 },
  total_cost: 1376,
  personal_day_included: false,
  justification: 'On-site attendance required for milestone M-3 review.',
  status: 'SUBMITTED',
  submitted_at: '2026-07-12T14:00:00Z',
};

describe('TravelRequest', () => {
  it('accepts a valid submitted request', () =>
    expect(validateTravelRequest(request)).toEqual({ valid: true }));
  it('accepts a routed request with tier and authority', () =>
    expect(
      validateTravelRequest({ ...request, status: 'ROUTED', routing_tier: 'STANDARD', assigned_authority: 'MANAGER' })
    ).toEqual({ valid: true }));
  it('rejects a total_cost that does not equal the itemized sum', () =>
    expect(validateTravelRequest({ ...request, total_cost: 1000 }).valid).toBe(false));
  it('rejects an end date before the start date', () =>
    expect(validateTravelRequest({ ...request, travel_end_date: '2026-08-01' }).valid).toBe(false));
  it('rejects a submitted request without submitted_at', () => {
    const { submitted_at: _omitted, ...rest } = request;
    expect(validateTravelRequest(rest).valid).toBe(false);
  });
  it('accepts a DRAFT without submitted_at', () => {
    const { submitted_at: _omitted, ...rest } = request;
    expect(validateTravelRequest({ ...rest, status: 'DRAFT' })).toEqual({ valid: true });
  });
  it('rejects an unknown routing tier', () =>
    expect(validateTravelRequest({ ...request, routing_tier: 'FAST_TRACK' }).valid).toBe(false));
});

const account: ChargeAccount = {
  cost_code: 'CC-1',
  program_id: 'prog-1',
  labor_category: 'Engineer',
  fiscal_year: 2026,
  ceiling: 500000,
  account_type: 'DIRECT',
  authorized_roles: ['ANALYST', 'PROGRAM_MANAGER'],
  budget_remaining: 125000,
  active: true,
};

describe('ChargeAccount (extends CostCode)', () => {
  it('accepts a valid charge account', () =>
    expect(validateChargeAccount(account)).toEqual({ valid: true }));
  it('enforces the base CostCode validation (extension, not redefinition)', () =>
    expect(validateChargeAccount({ ...account, fiscal_year: 2026.5 }).valid).toBe(false));
  it('rejects budget_remaining above ceiling', () =>
    expect(validateChargeAccount({ ...account, budget_remaining: 600000 }).valid).toBe(false));
  it('rejects an unknown account_type', () =>
    expect(validateChargeAccount({ ...account, account_type: 'OVERHEAD' }).valid).toBe(false));
  it('accepts a zero-budget account (budget-exhaustion rule input)', () =>
    expect(validateChargeAccount({ ...account, budget_remaining: 0 })).toEqual({ valid: true }));
});

const record: TimeRecord = {
  record_id: 'TRC-2026-P14-emp-1',
  employee_id: 'emp-1',
  period_start: '2026-06-29',
  period_end: '2026-07-12',
  entries: [
    { entry_date: '2026-06-29', cost_code: 'CC-1', hours: 8, charge_type: 'DIRECT', holiday: false },
    {
      entry_date: '2026-07-03',
      cost_code: 'CC-1',
      hours: 10,
      charge_type: 'DIRECT',
      holiday: true,
      justification: 'Holiday coverage authorized by PM for milestone close-out.',
    },
  ],
  total_hours: 18,
  submitted_at: '2026-07-12T18:00:00Z',
};

describe('TimeRecord', () => {
  it('accepts a valid time record', () => expect(validateTimeRecord(record)).toEqual({ valid: true }));
  it('rejects total_hours that does not equal the entry sum', () =>
    expect(validateTimeRecord({ ...record, total_hours: 40 }).valid).toBe(false));
  it('rejects a non-positive entry hours value', () => {
    const bad = { ...record, entries: [{ ...record.entries[0], hours: 0 }], total_hours: 0 };
    expect(validateTimeRecord(bad).valid).toBe(false);
  });
  it('rejects a period_end before period_start', () =>
    expect(validateTimeRecord({ ...record, period_end: '2026-06-01' }).valid).toBe(false));
});

const flag: ComplianceFlag = {
  flag_id: 'CF-3001',
  source: 'TIME',
  record_ref: 'TRC-2026-P14-emp-1',
  employee_id: 'emp-1',
  rule_category: 'OVERTIME_THRESHOLD',
  severity: 'WARNING',
  rule_citation: 'Timekeeping Policy §4.2 — weekly overtime threshold',
  actual_value: '52 hours',
  threshold_value: '40 hours per week',
  recurrence_count: 1,
  raised_at: '2026-07-12T18:05:00Z',
  status: 'OPEN',
};

describe('ComplianceFlag', () => {
  it('accepts a valid time flag', () => expect(validateComplianceFlag(flag)).toEqual({ valid: true }));
  it('enforces the docs/17 §6.1 severity mapping (frozen)', () =>
    expect(validateComplianceFlag({ ...flag, severity: 'ERROR' }).valid).toBe(false));
  it('maps all ten time rule categories per docs/17 §6.1', () => {
    expect(Object.keys(TIME_RULE_SEVERITY)).toHaveLength(10);
    expect(TIME_RULE_SEVERITY.UNAUTHORIZED_CHARGE_ACCOUNT).toBe('ERROR');
    expect(TIME_RULE_SEVERITY.BUDGET_EXHAUSTION).toBe('ERROR');
    expect(TIME_RULE_SEVERITY.DIRECT_INDIRECT_MISMATCH).toBe('ERROR');
    expect(TIME_RULE_SEVERITY.PATTERN_DRIFT).toBe('INFORMATIONAL');
  });
  it('accepts a travel flag with a travel rule category', () =>
    expect(
      validateComplianceFlag({
        ...flag,
        source: 'TRAVEL',
        record_ref: 'TR-1001',
        rule_category: 'TRAVEL_HARD_EXCEPTION',
        severity: 'ERROR',
        rule_citation: 'TravelPolicy TP-2026-01 — international destination',
        actual_value: 'international destination: true',
        threshold_value: 'hard exception — escalate regardless of cost',
      })
    ).toEqual({ valid: true }));
  it('rejects a TIME flag carrying a travel rule category', () =>
    expect(validateComplianceFlag({ ...flag, rule_category: 'TRAVEL_SOFT_FLAG' }).valid).toBe(false));
  it('rejects a recurrence_count below 1', () =>
    expect(validateComplianceFlag({ ...flag, recurrence_count: 0 }).valid).toBe(false));
});

const correction: CorrectionRecord = {
  correction_id: 'CR-4001',
  flag_id: 'CF-3001',
  employee_id: 'emp-1',
  communication_type: 'CLARIFICATION_REQUEST',
  occurrence_number: 1,
  sent_by: 'mgr-7',
  sent_at: '2026-07-12T19:00:00Z',
  resolution_status: 'PENDING',
};

describe('CorrectionRecord', () => {
  it('accepts a valid correction record', () =>
    expect(validateCorrectionRecord(correction)).toEqual({ valid: true }));
  it('accepts a formal escalation with supervisor notification and COUNSEL record', () =>
    expect(
      validateCorrectionRecord({
        ...correction,
        communication_type: 'FORMAL_ESCALATION',
        occurrence_number: 3,
        supervisor_notified: true,
        counsel_decision_record_id: 'DR-88',
      })
    ).toEqual({ valid: true }));
  it('rejects supervisor_notified on a non-escalation communication', () =>
    expect(validateCorrectionRecord({ ...correction, supervisor_notified: true }).valid).toBe(false));
  it('rejects an unknown communication_type', () =>
    expect(validateCorrectionRecord({ ...correction, communication_type: 'REMINDER' }).valid).toBe(false));
  it('rejects a non-integer occurrence_number', () =>
    expect(validateCorrectionRecord({ ...correction, occurrence_number: 1.5 }).valid).toBe(false));
});

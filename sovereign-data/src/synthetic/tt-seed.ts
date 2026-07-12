/**
 * SOVEREIGN Platform — sovereign-data
 * synthetic/tt-seed.ts — Time & Travel canonical synthetic seed data (Session 29).
 *
 * Walkthrough E findings WE-1/WE-5: Time & Travel shipped with zero seed data,
 * unlike every other product (APEX's P-100 program, VIGIL's seeded alerts). This
 * file is the SINGLE canonical source of Time & Travel synthetic records. The TT
 * workflow layer spans four host modules (docs/17 §2) that cannot import each
 * other, so the shared seed instances live here in @sovereign/data — the one
 * package every module already imports — rather than being duplicated per module
 * (Standing Constraint #2 spirit: no divergent copies that drift).
 *
 * ALL DATA IS SYNTHETIC: every id carries the SYNTH- prefix (the Session 28 e2e
 * convention) and every record is UNCLASSIFIED program-shaped fiction (GD-10).
 * No entity type is added or changed here — these are validated INSTANCES of the
 * six D-TT3 entities, nothing more. Values are chosen so the seeded queues
 * exercise every reachable state (see the per-section notes).
 *
 * Version: 1.0 · Session 29 · July 12, 2026
 */

import type { TravelPolicy } from '../entities/travel-policy';
import type { ChargeAccount } from '../entities/charge-account';
import type { TravelRequest } from '../entities/travel-request';
import type { TimeRecord } from '../entities/time-record';
import type { ComplianceFlag } from '../entities/compliance-flag';
import type { CorrectionRecord } from '../entities/correction-record';

// ============================================================
// ACTIVE TRAVEL POLICY — loaded by tt.travel-compliance-engine at startup
// (docs/17 §4). Thresholds chosen so the seeded requests below spread across
// all three routing tiers.
// ============================================================

export const SYNTH_TT_TRAVEL_POLICY: TravelPolicy = {
  policy_id: 'SYNTH-TT-POLICY-1',
  effective_date: '2026-07-01',
  flowpath_session_id: 'SYNTH-FP-TT-1',
  hard_exceptions: {
    personal_day_escalates: true,
    international_escalates: true,
    special_authority_categories: ['FOREIGN_LIAISON'],
  },
  routing_thresholds: {
    manager_threshold: 2500,
    director_threshold: 7500,
    executive_threshold: 20000,
  },
  soft_flags: {
    advance_booking_standard_days: 14,
    advance_booking_short_notice_days: 7,
    advance_booking_critical_hours: 48,
    conference_fee_threshold: 1500,
    budget_proximity_percent: 85,
  },
};

// ============================================================
// CHARGE ACCOUNTS — evaluated by tt.time-compliance-engine (docs/17 §6.1:
// unauthorized-account, budget-exhaustion, and direct/indirect-mismatch rules).
// SYNTH-CC-4001 is deliberately at zero remaining budget; SYNTH-CC-4002 is
// deliberately inactive — so those two rules are exercisable from seed data.
// ============================================================

export const SYNTH_TT_CHARGE_ACCOUNTS: ChargeAccount[] = [
  {
    cost_code: 'SYNTH-CC-1001',
    program_id: 'P-100',
    labor_category: 'Engineering — Direct',
    fiscal_year: 2026,
    ceiling: 250000,
    account_type: 'DIRECT',
    authorized_roles: ['ANALYST', 'PROGRAM_MANAGER', 'AGENT_OPERATOR'],
    budget_remaining: 140000,
    active: true,
  },
  {
    cost_code: 'SYNTH-CC-2001',
    program_id: 'P-100',
    labor_category: 'Program Management — Direct',
    fiscal_year: 2026,
    ceiling: 120000,
    account_type: 'DIRECT',
    authorized_roles: ['PROGRAM_MANAGER'],
    budget_remaining: 36000,
    active: true,
  },
  {
    cost_code: 'SYNTH-CC-3001',
    program_id: 'P-100',
    labor_category: 'Overhead — Indirect',
    fiscal_year: 2026,
    ceiling: 80000,
    account_type: 'INDIRECT',
    authorized_roles: ['ANALYST', 'PROGRAM_MANAGER', 'AGENT_OPERATOR', 'COMPLIANCE_OFFICER'],
    budget_remaining: 51000,
    active: true,
  },
  {
    // Budget-exhaustion rule seed: zero remaining budget (P1 VIGIL alert path).
    cost_code: 'SYNTH-CC-4001',
    program_id: 'P-150',
    labor_category: 'Integration Test — Direct',
    fiscal_year: 2026,
    ceiling: 60000,
    account_type: 'DIRECT',
    authorized_roles: ['ANALYST', 'AGENT_OPERATOR'],
    budget_remaining: 0,
    active: true,
  },
  {
    // Unauthorized-charge-account rule seed: inactive account rejects charges.
    cost_code: 'SYNTH-CC-4002',
    program_id: 'P-150',
    labor_category: 'Closed Task — Direct',
    fiscal_year: 2026,
    ceiling: 45000,
    account_type: 'DIRECT',
    authorized_roles: ['ANALYST'],
    budget_remaining: 12000,
    active: false,
  },
];

// ============================================================
// TRAVEL REQUESTS — every reachable state (Walkthrough E WE-5): clean approval,
// pending standard, flagged (information-request scenario), hard-exception
// escalations, denial, executive-level cost, approved-with-flags. The
// routing_tier / assigned_authority values are ENGINE-CONSISTENT: a module-nexus
// test re-evaluates each request against SYNTH_TT_TRAVEL_POLICY and asserts the
// engine produces exactly these values — seeds cannot drift from the rules.
// Dates are fixed so lead-time computation is deterministic.
// ============================================================

export const SYNTH_TT_TRAVEL_REQUESTS: TravelRequest[] = [
  {
    // Clean approval path — all rules satisfied, decided by a manager.
    request_id: 'SYNTH-TR-101',
    employee_id: 'SYNTH-E-101',
    destination: 'Denver, CO',
    international: false,
    travel_start_date: '2026-07-14',
    travel_end_date: '2026-07-16',
    mission_purpose: 'Quarterly program review with the logistics modernization team.',
    costs: { airfare: 400, hotel: 380, per_diem: 250, ground_transport: 60, registration_fees: 0 },
    total_cost: 1090,
    personal_day_included: false,
    justification: 'On-site attendance required for the P-100 quarterly review.',
    status: 'APPROVED',
    submitted_at: '2026-06-20T14:00:00.000Z',
    routing_tier: 'STANDARD',
    assigned_authority: 'MANAGER',
  },
  {
    // Pending standard request — sits in the manager queue awaiting decision.
    request_id: 'SYNTH-TR-102',
    employee_id: 'SYNTH-E-102',
    destination: 'Huntsville, AL',
    international: false,
    travel_start_date: '2026-07-28',
    travel_end_date: '2026-07-30',
    mission_purpose: 'Integration test witness at the contractor facility.',
    costs: { airfare: 300, hotel: 320, per_diem: 210, ground_transport: 40, registration_fees: 0 },
    total_cost: 870,
    personal_day_included: false,
    justification: 'Milestone 3 integration test requires a government witness.',
    status: 'ROUTED',
    submitted_at: '2026-07-01T10:00:00.000Z',
    routing_tier: 'STANDARD',
    assigned_authority: 'MANAGER',
  },
  {
    // Flagged — short-notice booking + conference fee: the information-request
    // scenario (soft flags disclosed, manager may still approve).
    request_id: 'SYNTH-TR-103',
    employee_id: 'SYNTH-E-103',
    destination: 'San Diego, CA',
    international: false,
    travel_start_date: '2026-07-15',
    travel_end_date: '2026-07-17',
    mission_purpose: 'Defense acquisition training course.',
    costs: { airfare: 350, hotel: 400, per_diem: 160, ground_transport: 40, registration_fees: 1500 },
    total_cost: 2450,
    personal_day_included: false,
    justification: 'Course seat became available on short notice.',
    status: 'ROUTED',
    submitted_at: '2026-07-10T09:00:00.000Z',
    routing_tier: 'FLAGGED',
    assigned_authority: 'MANAGER',
  },
  {
    // Hard exception — international destination escalates regardless of cost.
    request_id: 'SYNTH-TR-104',
    employee_id: 'SYNTH-E-104',
    destination: 'London, United Kingdom',
    international: true,
    travel_start_date: '2026-07-21',
    travel_end_date: '2026-07-24',
    mission_purpose: 'Allied interoperability working group.',
    costs: { airfare: 950, hotel: 780, per_diem: 400, ground_transport: 90, registration_fees: 0 },
    total_cost: 2220,
    personal_day_included: false,
    justification: 'US representation required at the working group session.',
    status: 'ROUTED',
    submitted_at: '2026-06-25T08:00:00.000Z',
    routing_tier: 'ESCALATE',
    assigned_authority: 'DIRECTOR',
  },
  {
    // Hard exception (personal day) — escalated and DECIDED as escalated.
    request_id: 'SYNTH-TR-105',
    employee_id: 'SYNTH-E-105',
    destination: 'Orlando, FL',
    international: false,
    travel_start_date: '2026-07-06',
    travel_end_date: '2026-07-10',
    mission_purpose: 'Simulation and training industry conference.',
    costs: { airfare: 420, hotel: 510, per_diem: 230, ground_transport: 50, registration_fees: 900 },
    total_cost: 2110,
    personal_day_included: true,
    justification: 'Conference attendance plus one approved personal day.',
    status: 'ESCALATED',
    submitted_at: '2026-06-18T15:00:00.000Z',
    routing_tier: 'ESCALATE',
    assigned_authority: 'DIRECTOR',
  },
  {
    // Denial path — director-level cost, denied with rule citation.
    request_id: 'SYNTH-TR-106',
    employee_id: 'SYNTH-E-106',
    destination: 'Honolulu, HI',
    international: false,
    travel_start_date: '2026-07-08',
    travel_end_date: '2026-07-15',
    mission_purpose: 'Pacific component liaison visit.',
    costs: { airfare: 1200, hotel: 2100, per_diem: 1400, ground_transport: 500, registration_fees: 0 },
    total_cost: 5200,
    personal_day_included: false,
    justification: 'Extended liaison engagement across two commands.',
    status: 'DENIED',
    submitted_at: '2026-06-22T11:00:00.000Z',
    routing_tier: 'ESCALATE',
    assigned_authority: 'DIRECTOR',
  },
  {
    // Executive-level cost threshold — pending at the top authority queue.
    request_id: 'SYNTH-TR-107',
    employee_id: 'SYNTH-E-107',
    destination: 'Colorado Springs, CO',
    international: false,
    travel_start_date: '2026-08-04',
    travel_end_date: '2026-08-14',
    mission_purpose: 'Two-week exercise support detail, five-person team lead.',
    costs: { airfare: 2400, hotel: 3800, per_diem: 2300, ground_transport: 700, registration_fees: 0 },
    total_cost: 9200,
    personal_day_included: false,
    justification: 'Team lead travel for the annual exercise support window.',
    status: 'ROUTED',
    submitted_at: '2026-07-02T13:00:00.000Z',
    routing_tier: 'ESCALATE',
    assigned_authority: 'EXECUTIVE',
  },
  {
    // Approved WITH disclosed soft flags (conference fee) — flags documented.
    request_id: 'SYNTH-TR-108',
    employee_id: 'SYNTH-E-108',
    destination: 'Arlington, VA',
    international: false,
    travel_start_date: '2026-07-01',
    travel_end_date: '2026-07-02',
    mission_purpose: 'Program protection planning symposium.',
    costs: { airfare: 300, hotel: 260, per_diem: 120, ground_transport: 20, registration_fees: 1800 },
    total_cost: 2500,
    personal_day_included: false,
    justification: 'Symposium fee above the awareness threshold; disclosed and approved.',
    status: 'APPROVED',
    submitted_at: '2026-06-15T10:00:00.000Z',
    routing_tier: 'FLAGGED',
    assigned_authority: 'MANAGER',
  },
];

// ============================================================
// TIME RECORDS + COMPLIANCE FLAGS — one seeded case per communication type
// (docs/17 §6.4): error correction, clarification, justification request,
// pattern flag, and TWO formal-escalation cases (one pending VIGIL
// authorization, one already authorized) so both gate states are inspectable.
// Flag severities follow the frozen TIME_RULE_SEVERITY mapping — the entity
// validator enforces it.
// ============================================================

export const SYNTH_TT_TIME_RECORDS: TimeRecord[] = [
  {
    // Error correction: five days charged to an INACTIVE account (SYNTH-CC-4002).
    record_id: 'SYNTH-TM-201',
    employee_id: 'SYNTH-E-201',
    period_start: '2026-06-22',
    period_end: '2026-06-26',
    entries: ['2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26'].map((d) => ({
      entry_date: d,
      cost_code: 'SYNTH-CC-4002',
      hours: 8,
      charge_type: 'DIRECT' as const,
      holiday: false,
    })),
    total_hours: 40,
    submitted_at: '2026-06-26T17:10:00.000Z',
  },
  {
    // Clarification: sustained overtime (three 12-hour days) with justifications.
    record_id: 'SYNTH-TM-202',
    employee_id: 'SYNTH-E-202',
    period_start: '2026-06-22',
    period_end: '2026-06-26',
    entries: [
      { entry_date: '2026-06-22', cost_code: 'SYNTH-CC-1001', hours: 12, charge_type: 'DIRECT' as const, holiday: false, justification: 'Integration test surge support, shift extension approved.' },
      { entry_date: '2026-06-23', cost_code: 'SYNTH-CC-1001', hours: 12, charge_type: 'DIRECT' as const, holiday: false, justification: 'Integration test surge support, shift extension approved.' },
      { entry_date: '2026-06-24', cost_code: 'SYNTH-CC-1001', hours: 12, charge_type: 'DIRECT' as const, holiday: false, justification: 'Integration test surge support, shift extension approved.' },
      { entry_date: '2026-06-25', cost_code: 'SYNTH-CC-1001', hours: 10, charge_type: 'DIRECT' as const, holiday: false, justification: 'Test data reduction and closeout.' },
      { entry_date: '2026-06-26', cost_code: 'SYNTH-CC-1001', hours: 8, charge_type: 'DIRECT' as const, holiday: false },
    ],
    total_hours: 54,
    submitted_at: '2026-06-26T18:00:00.000Z',
  },
  {
    // Justification request: a 10-hour day with no narrative supplied.
    record_id: 'SYNTH-TM-203',
    employee_id: 'SYNTH-E-203',
    period_start: '2026-06-22',
    period_end: '2026-06-26',
    entries: [
      { entry_date: '2026-06-22', cost_code: 'SYNTH-CC-1001', hours: 8, charge_type: 'DIRECT' as const, holiday: false },
      { entry_date: '2026-06-23', cost_code: 'SYNTH-CC-1001', hours: 8, charge_type: 'DIRECT' as const, holiday: false },
      { entry_date: '2026-06-24', cost_code: 'SYNTH-CC-1001', hours: 10, charge_type: 'DIRECT' as const, holiday: false },
      { entry_date: '2026-06-25', cost_code: 'SYNTH-CC-1001', hours: 8, charge_type: 'DIRECT' as const, holiday: false },
      { entry_date: '2026-06-26', cost_code: 'SYNTH-CC-1001', hours: 8, charge_type: 'DIRECT' as const, holiday: false },
    ],
    total_hours: 42,
    submitted_at: '2026-06-26T16:40:00.000Z',
  },
  {
    // Pattern flag: clean record; the drift signal comes from the analysis layer.
    record_id: 'SYNTH-TM-204',
    employee_id: 'SYNTH-E-204',
    period_start: '2026-06-22',
    period_end: '2026-06-26',
    entries: ['2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26'].map((d) => ({
      entry_date: d,
      cost_code: 'SYNTH-CC-3001',
      hours: 8,
      charge_type: 'INDIRECT' as const,
      holiday: false,
    })),
    total_hours: 40,
    submitted_at: '2026-06-26T15:20:00.000Z',
  },
  {
    // Formal escalation (PENDING at the VIGIL gate): missing day, third occurrence.
    record_id: 'SYNTH-TM-205',
    employee_id: 'SYNTH-E-205',
    period_start: '2026-06-22',
    period_end: '2026-06-26',
    entries: [
      { entry_date: '2026-06-22', cost_code: 'SYNTH-CC-1001', hours: 8, charge_type: 'DIRECT' as const, holiday: false },
      { entry_date: '2026-06-23', cost_code: 'SYNTH-CC-1001', hours: 8, charge_type: 'DIRECT' as const, holiday: false },
      { entry_date: '2026-06-25', cost_code: 'SYNTH-CC-1001', hours: 8, charge_type: 'DIRECT' as const, holiday: false },
      { entry_date: '2026-06-26', cost_code: 'SYNTH-CC-1001', hours: 8, charge_type: 'DIRECT' as const, holiday: false },
    ],
    total_hours: 32,
    submitted_at: '2026-06-26T17:45:00.000Z',
  },
  {
    // Formal escalation (ALREADY AUTHORIZED): recurring overtime, third occurrence.
    record_id: 'SYNTH-TM-206',
    employee_id: 'SYNTH-E-206',
    period_start: '2026-06-22',
    period_end: '2026-06-26',
    entries: ['2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26'].map((d) => ({
      entry_date: d,
      cost_code: 'SYNTH-CC-1001',
      hours: 12,
      charge_type: 'DIRECT' as const,
      holiday: false,
      justification: 'Sustained exercise support tempo.',
    })),
    total_hours: 60,
    submitted_at: '2026-06-26T19:05:00.000Z',
  },
];

export const SYNTH_TT_COMPLIANCE_FLAGS: ComplianceFlag[] = [
  {
    flag_id: 'SYNTH-TM-201-F1',
    source: 'TIME',
    record_ref: 'SYNTH-TM-201',
    employee_id: 'SYNTH-E-201',
    rule_category: 'UNAUTHORIZED_CHARGE_ACCOUNT',
    severity: 'ERROR',
    rule_citation: 'Timekeeping policy — authorized charge account lists per employee role',
    actual_value: '2026-06-22..26 SYNTH-CC-4002: inactive account',
    threshold_value: 'charges accepted only to active, role-authorized accounts',
    recurrence_count: 1,
    raised_at: '2026-06-26T17:10:00.000Z',
    status: 'OPEN',
  },
  {
    flag_id: 'SYNTH-TM-202-F1',
    source: 'TIME',
    record_ref: 'SYNTH-TM-202',
    employee_id: 'SYNTH-E-202',
    rule_category: 'OVERTIME_THRESHOLD',
    severity: 'WARNING',
    rule_citation: 'Timekeeping policy — daily overtime threshold',
    actual_value: '2026-06-22/23/24: 12 hours each',
    threshold_value: '10 hours per day',
    recurrence_count: 1,
    raised_at: '2026-06-26T18:00:00.000Z',
    status: 'OPEN',
  },
  {
    flag_id: 'SYNTH-TM-203-F1',
    source: 'TIME',
    record_ref: 'SYNTH-TM-203',
    employee_id: 'SYNTH-E-203',
    rule_category: 'JUSTIFICATION_ABSENCE',
    severity: 'WARNING',
    rule_citation: 'Timekeeping policy — justification requirements',
    actual_value: '2026-06-24 SYNTH-CC-1001: 10h without justification',
    threshold_value: 'justification narrative required for this charge',
    recurrence_count: 1,
    raised_at: '2026-06-26T16:40:00.000Z',
    status: 'OPEN',
  },
  {
    flag_id: 'SYNTH-TM-204-F1',
    source: 'TIME',
    record_ref: 'SYNTH-TM-204',
    employee_id: 'SYNTH-E-204',
    rule_category: 'PATTERN_DRIFT',
    severity: 'INFORMATIONAL',
    rule_citation: 'Timekeeping policy — pattern drift threshold (individual baseline)',
    actual_value: 'indirect charging 40h vs 4-week baseline 12h (+233%)',
    threshold_value: 'drift threshold 40% deviation from rolling baseline',
    recurrence_count: 1,
    raised_at: '2026-06-26T15:20:00.000Z',
    status: 'OPEN',
  },
  {
    flag_id: 'SYNTH-TM-205-F1',
    source: 'TIME',
    record_ref: 'SYNTH-TM-205',
    employee_id: 'SYNTH-E-205',
    rule_category: 'MISSING_HOURS',
    severity: 'WARNING',
    rule_citation: 'Timekeeping policy — complete daily recording',
    actual_value: '2026-06-24: no hours recorded',
    threshold_value: 'every scheduled workday requires recorded hours',
    recurrence_count: 3, // third occurrence — formal escalation territory (docs/17 §6.2)
    raised_at: '2026-06-26T17:45:00.000Z',
    status: 'ESCALATED',
  },
  {
    flag_id: 'SYNTH-TM-206-F1',
    source: 'TIME',
    record_ref: 'SYNTH-TM-206',
    employee_id: 'SYNTH-E-206',
    rule_category: 'OVERTIME_THRESHOLD',
    severity: 'WARNING',
    rule_citation: 'Timekeeping policy — weekly overtime threshold',
    actual_value: 'week 1: 60 hours',
    threshold_value: '45 hours per week',
    recurrence_count: 3, // third occurrence — escalation already authorized in VIGIL
    raised_at: '2026-06-26T19:05:00.000Z',
    status: 'ESCALATED',
  },
];

// ============================================================
// CORRECTION RECORDS — resolution history so the audit-reporter and manager
// dashboard have a past to show (docs/17 §6.2/§6.4).
// ============================================================

export const SYNTH_TT_CORRECTION_RECORDS: CorrectionRecord[] = [
  {
    correction_id: 'SYNTH-COR-301',
    flag_id: 'SYNTH-TM-201-F1',
    employee_id: 'SYNTH-E-201',
    communication_type: 'ERROR_CORRECTION',
    occurrence_number: 1,
    sent_by: 'SYNTH-MGR-1',
    sent_at: '2026-06-29T13:05:00.000Z',
    resolution_status: 'CORRECTED',
    resolution_note: 'Employee moved the five entries to the correct active account.',
  },
  {
    correction_id: 'SYNTH-COR-302',
    flag_id: 'SYNTH-TM-202-F1',
    employee_id: 'SYNTH-E-202',
    communication_type: 'CLARIFICATION_REQUEST',
    occurrence_number: 1,
    sent_by: 'SYNTH-MGR-1',
    sent_at: '2026-06-29T13:20:00.000Z',
    resolution_status: 'PENDING',
  },
  {
    correction_id: 'SYNTH-COR-303',
    flag_id: 'SYNTH-TM-206-F1',
    employee_id: 'SYNTH-E-206',
    communication_type: 'FORMAL_ESCALATION',
    occurrence_number: 3,
    sent_by: 'SYNTH-MGR-2',
    sent_at: '2026-06-30T10:00:00.000Z',
    resolution_status: 'ESCALATED',
    supervisor_notified: true,
    counsel_decision_record_id: 'SYNTH-CDR-9',
  },
];

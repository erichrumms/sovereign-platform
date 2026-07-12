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

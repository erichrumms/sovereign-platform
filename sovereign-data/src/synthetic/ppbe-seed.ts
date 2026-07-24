/**
 * SOVEREIGN Platform — sovereign-data
 * synthetic/ppbe-seed.ts — PPBE canonical synthetic seed data (Session 33).
 *
 * Session 32's PRELIMINARY V&V verified the PPBE pipeline's wiring at n=1 and
 * explicitly could not verify it at real volume — two ledger-monitor rules and
 * two dependency-tracker rules had never fired end to end. This file is the
 * SINGLE canonical source of PPBE synthetic records (WE-6, the Walkthrough F
 * precondition), following the tt-seed.ts pattern exactly: the PPBE workflow
 * layer spans host modules that cannot import each other, so the shared seed
 * instances live here in @sovereign/data. Module-local shapes (coordination
 * items, handoff observations) are seeded in their own modules and reference
 * these records by id.
 *
 * ALL DATA IS SYNTHETIC: every id carries the SYNTH- prefix and every record
 * is UNCLASSIFIED program-shaped fiction (GD-10). No entity type is added or
 * changed — these are validated INSTANCES of the six D-P3 entities.
 *
 * INTERNAL CONSISTENCY CONTRACT (asserted by tests/ppbe-seed.test.ts):
 *   - The clock of record is SYNTH_PPBE_AS_OF (July 13, 2026). All four federal
 *     FY 2026 quarters exist at that clock: Q1 = October–December 2025,
 *     Q2 = January–March 2026, Q3 = April–June 2026, Q4 = July–September 2026.
 *     Every obligation timestamp falls inside its period; Q1/Q2 are in the past
 *     relative to the clock and are treated as historical actuals.
 *   - Every obligation's program exists; every finding's program AND objective
 *     exist and agree with the program's own objective_id; every exhibit
 *     lineage reference is a real seeded workflow step.
 *   - Obligations exceed a program's plan or lifecycle estimate ONLY as the
 *     deliberate, labeled anomaly examples below — never by accident.
 *
 * THE PORTFOLIO STORY (five programs, three objectives, every ledger rule
 * reachable):
 *   ALPHA   — on plan. The healthy baseline (no ledger findings expected).
 *   BRAVO   — under-executing (Q3 actuals 60 percent below plan) →
 *             OBLIGATION_RATE_DEVIATION.
 *   CHARLIE — over-executing (Q3 actuals 60 percent above plan) →
 *             OBLIGATION_RATE_DEVIATION (above-plan direction).
 *   DELTA   — 95 percent of its lifecycle estimate obligated →
 *             CEILING_PROXIMITY (at the standard 90 percent threshold).
 *   ECHO    — 106 percent of its lifecycle estimate obligated →
 *             CEILING_EXCEEDED (P1) — THE deliberate ADA-exposure example —
 *             AND a stalled learning loop (3 of 4 findings not feeding
 *             planning) → FEEDBACK_LOOP_STALL.
 *
 * Version: 1.1 · Session 33 · July 13, 2026 · extended Q1/Q2 Session 59
 */

import type { StrategicObjective } from '../entities/strategic-objective';
import type { ProgramRecord } from '../entities/program-record';
import type { ObligationRecord } from '../entities/obligation-record';
import type { EvaluationFinding } from '../entities/evaluation-finding';
import type { DependencyMap } from '../entities/dependency-map';
import type { BudgetExhibit } from '../entities/budget-exhibit';

/** The seed's clock of record — module seeds and adapters evaluate "overdue" against this. */
export const SYNTH_PPBE_AS_OF = '2026-07-13T12:00:00Z';

/** All four FY 2026 quarters in chronological order (federal fiscal year). */
export const SYNTH_PPBE_PERIODS = ['FY 2026 Q1', 'FY 2026 Q2', 'FY 2026 Q3', 'FY 2026 Q4'] as const;

/**
 * Map a seeded obligation timestamp to its federal FY 2026 quarter.
 * Q1 = Oct–Dec 2025 (month 10-12), Q2 = Jan–Mar 2026 (month 1-3),
 * Q3 = Apr–Jun 2026 (month 4-6), Q4 = Jul–Sep 2026 (month 7-9).
 */
export function synthPeriodForTimestamp(isoTimestamp: string): string {
  const month = Number(isoTimestamp.slice(5, 7));
  if (month >= 10) return 'FY 2026 Q1';
  if (month <= 3) return 'FY 2026 Q2';
  if (month <= 6) return 'FY 2026 Q3';
  return 'FY 2026 Q4';
}

// ============================================================
// STRATEGIC OBJECTIVES — three, ranked in Phase 1, each approved
// by a (synthetic) COUNSEL Decision Record.
// ============================================================

export const SYNTH_PPBE_OBJECTIVES: StrategicObjective[] = [
  {
    objective_id: 'SYNTH-SO-01',
    title: 'Modernize logistics data interchange',
    description:
      'Replace point-to-point logistics data feeds with a governed interchange so program offices ' +
      'work from one authoritative picture.',
    priority_rank: 1,
    fiscal_year_range: 'FY 2026-2030',
    source_workflow_step_id: 'SYNTH-flowpath-ppbe-elicitation-01',
    decision_record_id: 'SYNTH-DR-RANK-01',
    status: 'active',
  },
  {
    objective_id: 'SYNTH-SO-02',
    title: 'Harden supply-chain cyber resilience',
    description:
      'Bring supplier-facing systems up to the current cyber survivability baseline before the next ' +
      'accreditation cycle.',
    priority_rank: 2,
    fiscal_year_range: 'FY 2026-2030',
    source_workflow_step_id: 'SYNTH-flowpath-ppbe-elicitation-02',
    decision_record_id: 'SYNTH-DR-RANK-02',
    status: 'active',
  },
  {
    objective_id: 'SYNTH-SO-03',
    title: 'Consolidate legacy sustainment systems',
    description:
      'Retire duplicative sustainment tooling and consolidate onto the two supported platforms.',
    priority_rank: 3,
    fiscal_year_range: 'FY 2026-2030',
    source_workflow_step_id: 'SYNTH-flowpath-ppbe-elicitation-03',
    decision_record_id: 'SYNTH-DR-RANK-03',
    status: 'active',
  },
];

// ============================================================
// PROGRAM RECORDS — five, across the three objectives, at varied
// lifecycle stages. Plans use the two FY 2026 periods above.
// ============================================================

export const SYNTH_PPBE_PROGRAMS: ProgramRecord[] = [
  {
    program_id: 'SYNTH-PRG-ALPHA',
    name: 'Logistics Data Interchange Modernization',
    sponsor: 'SYNTH PEO Logistics',
    contract_number: 'SYNTH-W91-26-C-0101',
    classification_level: 'UNCLASSIFIED',
    status: 'ACTIVE',
    objective_id: 'SYNTH-SO-01',
    fiscal_year: 'FY 2026',
    lifecycle_cost_estimate: 2000000,
    obligation_plan: [
      { period: 'FY 2026 Q1', planned_amount: 150000 },
      { period: 'FY 2026 Q2', planned_amount: 175000 },
      { period: 'FY 2026 Q3', planned_amount: 200000 },
      { period: 'FY 2026 Q4', planned_amount: 300000 },
    ],
    performance_baseline: [
      { metric: 'obligation rate', baseline_value: 'within ten percent of plan each quarter' },
      { metric: 'milestone completion', baseline_value: '90 percent of milestones on schedule' },
    ],
  },
  {
    program_id: 'SYNTH-PRG-BRAVO',
    name: 'Supply Chain Telemetry',
    sponsor: 'SYNTH PEO Cyber',
    contract_number: 'SYNTH-W91-26-C-0102',
    classification_level: 'UNCLASSIFIED',
    status: 'ACTIVE',
    objective_id: 'SYNTH-SO-02',
    fiscal_year: 'FY 2026',
    lifecycle_cost_estimate: 1500000,
    obligation_plan: [
      { period: 'FY 2026 Q1', planned_amount: 80000 },
      { period: 'FY 2026 Q2', planned_amount: 100000 },
      { period: 'FY 2026 Q3', planned_amount: 150000 },
      { period: 'FY 2026 Q4', planned_amount: 250000 },
    ],
    performance_baseline: [
      { metric: 'obligation rate', baseline_value: 'within ten percent of plan each quarter' },
      { metric: 'sensor coverage', baseline_value: '70 percent of tier-one suppliers instrumented' },
    ],
  },
  {
    program_id: 'SYNTH-PRG-CHARLIE',
    name: 'Cyber Resilience Retrofit',
    sponsor: 'SYNTH PEO Cyber',
    contract_number: 'SYNTH-W91-26-C-0103',
    classification_level: 'UNCLASSIFIED',
    status: 'ACTIVE',
    objective_id: 'SYNTH-SO-02',
    fiscal_year: 'FY 2026',
    lifecycle_cost_estimate: 800000,
    obligation_plan: [
      { period: 'FY 2026 Q1', planned_amount: 50000 },
      { period: 'FY 2026 Q2', planned_amount: 60000 },
      { period: 'FY 2026 Q3', planned_amount: 100000 },
      { period: 'FY 2026 Q4', planned_amount: 100000 },
    ],
    performance_baseline: [
      { metric: 'obligation rate', baseline_value: 'within ten percent of plan each quarter' },
      { metric: 'systems retrofitted', baseline_value: 'twelve systems per quarter' },
    ],
  },
  {
    program_id: 'SYNTH-PRG-DELTA',
    name: 'Legacy Sustainment Consolidation',
    sponsor: 'SYNTH PEO Sustainment',
    contract_number: 'SYNTH-W91-26-C-0104',
    classification_level: 'UNCLASSIFIED',
    status: 'ACTIVE',
    objective_id: 'SYNTH-SO-03',
    fiscal_year: 'FY 2026',
    lifecycle_cost_estimate: 500000,
    obligation_plan: [
      { period: 'FY 2026 Q1', planned_amount: 3000 },
      { period: 'FY 2026 Q2', planned_amount: 7000 },
      { period: 'FY 2026 Q3', planned_amount: 250000 },
      { period: 'FY 2026 Q4', planned_amount: 250000 },
    ],
    performance_baseline: [
      { metric: 'obligation rate', baseline_value: 'front-loaded; full estimate obligated by Q4 close' },
      { metric: 'systems retired', baseline_value: 'four legacy systems retired this fiscal year' },
    ],
  },
  {
    // THE DELIBERATE CEILING-EXCEEDED EXAMPLE — see the portfolio story above.
    program_id: 'SYNTH-PRG-ECHO',
    name: 'Depot Scheduling Pilot',
    sponsor: 'SYNTH PEO Sustainment',
    contract_number: 'SYNTH-W91-26-C-0105',
    classification_level: 'UNCLASSIFIED',
    status: 'ACTIVE',
    objective_id: 'SYNTH-SO-03',
    fiscal_year: 'FY 2026',
    lifecycle_cost_estimate: 300000,
    obligation_plan: [
      { period: 'FY 2026 Q1', planned_amount: 70000 },
      { period: 'FY 2026 Q2', planned_amount: 70000 },
      { period: 'FY 2026 Q3', planned_amount: 150000 },
      { period: 'FY 2026 Q4', planned_amount: 150000 },
    ],
    performance_baseline: [
      { metric: 'obligation rate', baseline_value: 'within ten percent of plan each quarter' },
      { metric: 'depot throughput', baseline_value: 'five percent scheduling improvement by pilot close' },
    ],
  },
];

// ============================================================
// OBLIGATION RECORDS — thirty total (17 Q3/Q4 originals + 13 Q1/Q2
// backdated, Session 59 cosmetic padding). Q1 timestamps: Oct–Dec 2025;
// Q2 timestamps: Jan–Mar 2026. All predate the clock of record.
// ============================================================

function ob(
  id: string,
  programId: string,
  costCode: string,
  amount: number,
  timestamp: string,
  official: string
): ObligationRecord {
  return {
    obligation_id: id,
    program_id: programId,
    cost_code: costCode,
    amount,
    timestamp,
    authorizing_official: official,
    workflow_step_id: `ppbe-obligation-${id}`,
  };
}

export const SYNTH_PPBE_OBLIGATIONS: ObligationRecord[] = [
  // ALPHA — on plan all four quarters.
  // Q1: 145000 of 150000 plan (-3%); Q2: 172000 of 175000 plan (-2%).
  ob('SYNTH-OB-A5', 'SYNTH-PRG-ALPHA', 'SYNTH-CC-110', 75000, '2025-10-14T14:00:00Z', 'SYNTH A. Vance'),
  ob('SYNTH-OB-A6', 'SYNTH-PRG-ALPHA', 'SYNTH-CC-110', 70000, '2025-12-09T14:00:00Z', 'SYNTH A. Vance'),
  ob('SYNTH-OB-A7', 'SYNTH-PRG-ALPHA', 'SYNTH-CC-111', 90000, '2026-01-21T14:00:00Z', 'SYNTH A. Vance'),
  ob('SYNTH-OB-A8', 'SYNTH-PRG-ALPHA', 'SYNTH-CC-111', 82000, '2026-03-17T14:00:00Z', 'SYNTH A. Vance'),
  // Q3 exactly 200000; Q4 285000 so far (five percent under, inside threshold).
  ob('SYNTH-OB-A1', 'SYNTH-PRG-ALPHA', 'SYNTH-CC-110', 120000, '2026-04-20T14:00:00Z', 'SYNTH A. Vance'),
  ob('SYNTH-OB-A2', 'SYNTH-PRG-ALPHA', 'SYNTH-CC-110', 80000, '2026-06-05T14:00:00Z', 'SYNTH A. Vance'),
  ob('SYNTH-OB-A3', 'SYNTH-PRG-ALPHA', 'SYNTH-CC-111', 150000, '2026-07-02T14:00:00Z', 'SYNTH A. Vance'),
  ob('SYNTH-OB-A4', 'SYNTH-PRG-ALPHA', 'SYNTH-CC-111', 135000, '2026-07-10T14:00:00Z', 'SYNTH A. Vance'),
  // BRAVO — under-executing all four quarters.
  // Q1: 45000 of 80000 plan (44% below); Q2: 72000 of 100000 plan (28% below).
  ob('SYNTH-OB-B3', 'SYNTH-PRG-BRAVO', 'SYNTH-CC-120', 45000, '2025-11-06T14:00:00Z', 'SYNTH R. Okafor'),
  ob('SYNTH-OB-B4', 'SYNTH-PRG-BRAVO', 'SYNTH-CC-120', 40000, '2026-02-11T14:00:00Z', 'SYNTH R. Okafor'),
  ob('SYNTH-OB-B5', 'SYNTH-PRG-BRAVO', 'SYNTH-CC-121', 32000, '2026-03-24T14:00:00Z', 'SYNTH R. Okafor'),
  // Q3: 60000 of 150000 planned (sixty percent below).
  ob('SYNTH-OB-B1', 'SYNTH-PRG-BRAVO', 'SYNTH-CC-120', 60000, '2026-05-18T14:00:00Z', 'SYNTH R. Okafor'),
  ob('SYNTH-OB-B2', 'SYNTH-PRG-BRAVO', 'SYNTH-CC-120', 90000, '2026-07-08T14:00:00Z', 'SYNTH R. Okafor'),
  // CHARLIE — on plan in Q1/Q2; over-executing from Q3.
  // Q1: 48000 of 50000 plan (-4%); Q2: 58000 of 60000 plan (-3%).
  ob('SYNTH-OB-C4', 'SYNTH-PRG-CHARLIE', 'SYNTH-CC-130', 48000, '2025-10-22T14:00:00Z', 'SYNTH R. Okafor'),
  ob('SYNTH-OB-C5', 'SYNTH-PRG-CHARLIE', 'SYNTH-CC-130', 58000, '2026-02-28T14:00:00Z', 'SYNTH R. Okafor'),
  // Q3: 160000 against 100000 planned (sixty percent above).
  ob('SYNTH-OB-C1', 'SYNTH-PRG-CHARLIE', 'SYNTH-CC-130', 100000, '2026-04-28T14:00:00Z', 'SYNTH R. Okafor'),
  ob('SYNTH-OB-C2', 'SYNTH-PRG-CHARLIE', 'SYNTH-CC-130', 60000, '2026-06-12T14:00:00Z', 'SYNTH R. Okafor'),
  ob('SYNTH-OB-C3', 'SYNTH-PRG-CHARLIE', 'SYNTH-CC-131', 30000, '2026-07-06T14:00:00Z', 'SYNTH R. Okafor'),
  // DELTA — ceiling-proximate: 485000 of a 500000 lifecycle estimate (97 percent) across all four quarters.
  // Q1/Q2 are minimal ramp-up; main obligations front-loaded into Q3/Q4.
  // Per-quarter actuals stay INSIDE the deviation threshold so DELTA's signal is
  // cleanly CEILING_PROXIMITY, not a mixed rate-deviation case.
  ob('SYNTH-OB-D5', 'SYNTH-PRG-DELTA', 'SYNTH-CC-140', 3000, '2025-11-03T14:00:00Z', 'SYNTH M. Hale'),
  ob('SYNTH-OB-D6', 'SYNTH-PRG-DELTA', 'SYNTH-CC-140', 7000, '2026-02-14T14:00:00Z', 'SYNTH M. Hale'),
  ob('SYNTH-OB-D1', 'SYNTH-PRG-DELTA', 'SYNTH-CC-140', 150000, '2026-04-10T14:00:00Z', 'SYNTH M. Hale'),
  ob('SYNTH-OB-D2', 'SYNTH-PRG-DELTA', 'SYNTH-CC-140', 90000, '2026-05-22T14:00:00Z', 'SYNTH M. Hale'),
  ob('SYNTH-OB-D3', 'SYNTH-PRG-DELTA', 'SYNTH-CC-141', 120000, '2026-07-03T14:00:00Z', 'SYNTH M. Hale'),
  ob('SYNTH-OB-D4', 'SYNTH-PRG-DELTA', 'SYNTH-CC-141', 115000, '2026-07-09T14:00:00Z', 'SYNTH M. Hale'),
  // ECHO — THE DELIBERATE CEILING-EXCEEDED EXAMPLE.
  // Q1/Q2 on plan (70000 each); ceiling reached by end of Q3; Q4 extends the violation.
  // Total across all four quarters: 458000 of a 300000 lifecycle estimate (153 percent).
  // Seeded ADA exposure for the walkthrough — the ledger monitor must flag it P1.
  ob('SYNTH-OB-E5', 'SYNTH-PRG-ECHO', 'SYNTH-CC-150', 70000, '2025-10-30T14:00:00Z', 'SYNTH M. Hale'),
  ob('SYNTH-OB-E6', 'SYNTH-PRG-ECHO', 'SYNTH-CC-150', 70000, '2026-01-19T14:00:00Z', 'SYNTH M. Hale'),
  ob('SYNTH-OB-E1', 'SYNTH-PRG-ECHO', 'SYNTH-CC-150', 100000, '2026-04-15T14:00:00Z', 'SYNTH M. Hale'),
  ob('SYNTH-OB-E2', 'SYNTH-PRG-ECHO', 'SYNTH-CC-150', 60000, '2026-06-20T14:00:00Z', 'SYNTH M. Hale'),
  ob('SYNTH-OB-E3', 'SYNTH-PRG-ECHO', 'SYNTH-CC-151', 90000, '2026-07-04T14:00:00Z', 'SYNTH M. Hale'),
  ob('SYNTH-OB-E4', 'SYNTH-PRG-ECHO', 'SYNTH-CC-151', 68000, '2026-07-11T14:00:00Z', 'SYNTH M. Hale'),
];

// ============================================================
// DEPENDENCY MAPS — eight inter-phase handoffs. Five healthy, one
// at risk, one failed, one healthy-but-late (its lateness lives in
// the module-flowpath handoff observations, not in health_status).
// Source workflows carry a phase prefix so assessPhaseReadiness can
// scope by closing phase; the "phase-4-formulation" links are the
// deliberately NOT-ready Tier B example (ECHO/DELTA).
// ============================================================

function dep(
  id: string,
  source: string,
  target: string,
  standard: string,
  timing: string,
  health: DependencyMap['health_status']
): DependencyMap {
  return {
    dependency_id: id,
    source_workflow: source,
    target_workflow: target,
    handoff_standard: standard,
    timing_requirement: timing,
    health_status: health,
  };
}

export const SYNTH_PPBE_DEPENDENCIES: DependencyMap[] = [
  dep(
    'SYNTH-DEP-01',
    'phase-1-strategic-direction-portfolio',
    'phase-2-planning-portfolio',
    'Ranked objectives with signed Decision Records for every rank.',
    'within 5 business days of the ranking decision',
    'healthy'
  ),
  dep(
    'SYNTH-DEP-02',
    'phase-2-planning-SYNTH-PRG-ALPHA',
    'phase-3-programming-SYNTH-PRG-ALPHA',
    'Complete evidence package with every finding traceable.',
    'within 5 business days of phase close',
    'healthy'
  ),
  dep(
    'SYNTH-DEP-03',
    'phase-2-planning-SYNTH-PRG-BRAVO',
    'phase-3-programming-SYNTH-PRG-BRAVO',
    'Complete evidence package with every finding traceable.',
    'within 5 business days of phase close',
    'healthy' // delivered LATE — see the module-flowpath handoff observation.
  ),
  dep(
    'SYNTH-DEP-04',
    'phase-3-programming-SYNTH-PRG-BRAVO',
    'phase-4-formulation-SYNTH-PRG-BRAVO',
    'Trade-off decision recorded with scenario basis attached.',
    'within 3 business days of the programming decision',
    'healthy' // OVERDUE and undelivered — see the handoff observation.
  ),
  dep(
    'SYNTH-DEP-05',
    'phase-2-planning-SYNTH-PRG-CHARLIE',
    'phase-3-programming-SYNTH-PRG-CHARLIE',
    'Complete evidence package with every finding traceable.',
    'within 5 business days of phase close',
    'at-risk'
  ),
  dep(
    'SYNTH-DEP-06',
    'phase-4-formulation-SYNTH-PRG-ECHO',
    'phase-5-execution-SYNTH-PRG-ECHO',
    'Budget exhibit certified by CLEAR with full figure lineage.',
    'before the execution phase opens',
    'failed' // ECHO's exhibit handoff failed — part of the NOT-ready Tier B example.
  ),
  dep(
    'SYNTH-DEP-07',
    'phase-4-formulation-SYNTH-PRG-DELTA',
    'phase-5-execution-SYNTH-PRG-DELTA',
    'Budget exhibit certified by CLEAR with full figure lineage.',
    'before the execution phase opens',
    'healthy' // delivered but FAILED its quality check — see the handoff observation.
  ),
  dep(
    'SYNTH-DEP-08',
    'phase-6-evaluation-portfolio',
    'phase-1-strategic-direction-portfolio',
    'Evaluation findings with feeds_planning_cycle recorded on every one.',
    'before the next ranking cycle opens',
    'healthy'
  ),
];

// ============================================================
// EVALUATION FINDINGS — twenty, mixed profile: 13 of 20 feed the
// planning cycle (65 percent portfolio learning velocity). ECHO is
// the stalled program: 3 of its 4 findings do NOT feed planning →
// FEEDBACK_LOOP_STALL at the standard thresholds.
// ============================================================

function ef(
  id: string,
  programId: string,
  objectiveId: string,
  type: EvaluationFinding['finding_type'],
  narrative: string,
  feeds: boolean
): EvaluationFinding {
  return {
    finding_id: id,
    program_id: programId,
    objective_id: objectiveId,
    finding_type: type,
    narrative,
    feeds_planning_cycle: feeds,
    workflow_step_id: `ppbe-finding-${id}`,
  };
}

export const SYNTH_PPBE_FINDINGS: EvaluationFinding[] = [
  // ALPHA — 5 findings, 4 feeding.
  ef('SYNTH-EF-A1', 'SYNTH-PRG-ALPHA', 'SYNTH-SO-01', 'on-track', 'Interchange throughput met its Q3 baseline.', true),
  ef('SYNTH-EF-A2', 'SYNTH-PRG-ALPHA', 'SYNTH-SO-01', 'on-track', 'Milestone completion held at 92 percent, above the 90 percent baseline.', true),
  ef('SYNTH-EF-A3', 'SYNTH-PRG-ALPHA', 'SYNTH-SO-01', 'variance', 'Data-quality remediation took two weeks longer than planned in May.', true),
  ef('SYNTH-EF-A4', 'SYNTH-PRG-ALPHA', 'SYNTH-SO-01', 'on-track', 'Supplier onboarding pace matches the plan.', true),
  ef('SYNTH-EF-A5', 'SYNTH-PRG-ALPHA', 'SYNTH-SO-01', 'variance', 'Training uptake lagged in one region; not yet raised at a planning forum.', false),
  // BRAVO — 4 findings, 3 feeding.
  ef('SYNTH-EF-B1', 'SYNTH-PRG-BRAVO', 'SYNTH-SO-02', 'variance', 'Sensor deployment is one quarter behind the coverage baseline.', true),
  ef('SYNTH-EF-B2', 'SYNTH-PRG-BRAVO', 'SYNTH-SO-02', 'variance', 'Under-execution of Q3 obligations traces to a delayed supplier agreement.', true),
  ef('SYNTH-EF-B3', 'SYNTH-PRG-BRAVO', 'SYNTH-SO-02', 'on-track', 'Instrumented suppliers are reporting at the expected fidelity.', true),
  ef('SYNTH-EF-B4', 'SYNTH-PRG-BRAVO', 'SYNTH-SO-02', 'variance', 'Integration lab backlog grew in June; awaiting a planning review slot.', false),
  // CHARLIE — 4 findings, 3 feeding, including the portfolio's contradicts-assumption example.
  ef('SYNTH-EF-C1', 'SYNTH-PRG-CHARLIE', 'SYNTH-SO-02', 'contradicts-assumption', 'Retrofit unit cost is running 40 percent above the planning assumption — the assumption does not survive contact with the actuals.', true),
  ef('SYNTH-EF-C2', 'SYNTH-PRG-CHARLIE', 'SYNTH-SO-02', 'variance', 'Q3 over-execution reflects accelerated retrofit starts pulled forward from Q4.', true),
  ef('SYNTH-EF-C3', 'SYNTH-PRG-CHARLIE', 'SYNTH-SO-02', 'on-track', 'Accreditation pre-checks are passing on first submission.', true),
  ef('SYNTH-EF-C4', 'SYNTH-PRG-CHARLIE', 'SYNTH-SO-02', 'variance', 'Vendor staffing churn noted in June; not yet before a planning forum.', false),
  // DELTA — 3 findings, 2 feeding.
  ef('SYNTH-EF-D1', 'SYNTH-PRG-DELTA', 'SYNTH-SO-03', 'on-track', 'Two of four legacy systems retired ahead of schedule.', true),
  ef('SYNTH-EF-D2', 'SYNTH-PRG-DELTA', 'SYNTH-SO-03', 'variance', 'Front-loaded obligations have consumed 95 percent of the lifecycle estimate with two retirements to go.', true),
  ef('SYNTH-EF-D3', 'SYNTH-PRG-DELTA', 'SYNTH-SO-03', 'variance', 'Data migration rework in one depot; on the working-group list only.', false),
  // ECHO — 4 findings, ONLY 1 feeding: the stalled learning loop (R-P7).
  ef('SYNTH-EF-E1', 'SYNTH-PRG-ECHO', 'SYNTH-SO-03', 'contradicts-assumption', 'Pilot throughput gains are 1 percent, against the 5 percent planning assumption.', true),
  ef('SYNTH-EF-E2', 'SYNTH-PRG-ECHO', 'SYNTH-SO-03', 'variance', 'Obligations exceeded the lifecycle estimate in July; finding recorded but never routed to planning.', false),
  ef('SYNTH-EF-E3', 'SYNTH-PRG-ECHO', 'SYNTH-SO-03', 'variance', 'Scheduler adoption is voluntary and uneven across shifts; not before any planning forum.', false),
  ef('SYNTH-EF-E4', 'SYNTH-PRG-ECHO', 'SYNTH-SO-03', 'variance', 'Depot staff report double-entry against the legacy tool; unrouted.', false),
];

// ============================================================
// BUDGET EXHIBITS — one fully certified and export-approved (the
// walkthrough's clean path) and one uncertified draft (the gated
// path — ECHO cannot export; its numbers are the ADA example).
// Lineage references are REAL seeded workflow steps only.
// ============================================================

export const SYNTH_PPBE_EXHIBITS: BudgetExhibit[] = [
  {
    exhibit_id: 'SYNTH-EX-ALPHA',
    program_id: 'SYNTH-PRG-ALPHA',
    fiscal_year: 'FY 2026',
    narrative_content:
      'The Logistics Data Interchange Modernization program has obligated 485000 of its 500000 ' +
      'planned for FY 2026 to date, within ten percent of plan in both quarters. Figures are ' +
      'traceable to the cited obligation records.',
    source_data_lineage: [
      'ppbe-obligation-SYNTH-OB-A1',
      'ppbe-obligation-SYNTH-OB-A2',
      'ppbe-obligation-SYNTH-OB-A3',
      'ppbe-obligation-SYNTH-OB-A4',
      'SYNTH-flowpath-ppbe-elicitation-01',
    ],
    certification_status: 'CERTIFIED',
    export_status: 'APPROVED_FOR_EXPORT',
  },
  {
    exhibit_id: 'SYNTH-EX-ECHO',
    program_id: 'SYNTH-PRG-ECHO',
    fiscal_year: 'FY 2026',
    narrative_content:
      'DRAFT — the Depot Scheduling Pilot has obligated 318000 against a 300000 lifecycle ' +
      'estimate. This draft cannot be certified or exported until the over-obligation is ' +
      'resolved through the governed process.',
    source_data_lineage: [
      'ppbe-obligation-SYNTH-OB-E1',
      'ppbe-obligation-SYNTH-OB-E2',
      'ppbe-obligation-SYNTH-OB-E3',
      'ppbe-obligation-SYNTH-OB-E4',
    ],
    certification_status: 'UNCERTIFIED',
    export_status: 'NOT_EXPORTED',
  },
];

/**
 * SOVEREIGN Platform — sovereign-data
 * synthetic/staff-seed.ts — Program & Staff Data Foundation (GD-33, docs/35).
 *
 * Deterministic, seeded synthetic data for the staff-to-program visibility
 * layer. Generated via a fixed-seed LCG — same seed, same output, every run
 * (convergence-testable). All data is UNCLASSIFIED synthetic fiction with
 * SYNTH- prefixed record IDs.
 *
 * WHAT THIS FILE CONTAINS:
 *   - 56 Employee records: 8 named anchors + 40 generated working staff + 8 Supervisors
 *   - 10 new PPBE-native ProgramRecord records (SYNTH-PRG-FOXTROT through SYNTH-PRG-OSCAR)
 *   - 34 new TravelRequest records (SYNTH-TR-201 through SYNTH-TR-234)
 *   - 24 new TimeRecord records (SYNTH-TM-301 through SYNTH-TM-324)
 *   - Staff-to-program StaffProjectAssignment records
 *
 * TEAM STRUCTURE (docs/35 §3 — 8 teams × 6 working staff + 8 Supervisors):
 *
 *   Team        Anchor (existing reference)   Supervisor ID (new)
 *   ALPHA       Marcus Cole (PM)              SYNTH-E-401 → reports to PP
 *   BRAVO       Sarah Okonkwo (PM)            SYNTH-E-402 → reports to PP
 *   CHARLIE     James Rivera (Analyst)        SYNTH-E-403 → reports to PP
 *   DELTA       Patricia Webb (PM)            SYNTH-E-404 → reports to PP
 *   ECHO        David Nkosi (PM)              SYNTH-E-405 → reports to PP
 *   WM-I        Dana Jones (PM)               SYNTH-E-406 → reports to PP
 *   WM-II       Robin Vasquez (PM)            SYNTH-E-407 → reports to PP
 *   T&T Ops     Jordan Kim (PM)               SYNTH-E-408 → reports to PP
 *
 * SUPERVISOR REPORTING: All 8 Supervisors report to the Project Principal
 * (SYNTH-PP-001), recorded via Employee.reports_to (GD-33). This is an
 * organizational fact in the data, not a platform RBAC role.
 *
 * WORLD MODEL PROGRAM COUNT NOTE: docs/35 §1 scoped from 11 World Model programs
 * to ~18–20. Direct code inspection found 5 real World Model programs in the
 * codebase (P-100, P-150, P-200, P-205, P-300). This file adds 13 new stubs
 * (P-401–P-413), reaching 18 total. Full ApexProgramRecord records for P-401–P-413
 * live in module-apex/src/synthetic-world-model.ts. The discrepancy from 11 is
 * recorded in the session handoff.
 *
 * INTERNAL CONSISTENCY (asserted by tests/staff-seed.test.ts):
 *   - All Employee records validate against validateEmployee.
 *   - All ProgramRecord records validate against validateProgramRecord.
 *   - All TravelRequest records validate against validateTravelRequest.
 *   - All TimeRecord records validate against validateTimeRecord.
 *   - All StaffProjectAssignment records validate against validateStaffProjectAssignment.
 *   - TimeRecordEntry.cost_code is always in the employee's cost_code_assignments.
 *   - Same seed → same output (convergence test via generateStaffData export).
 *
 * Version: 1.0 · GD-33 (docs/35) · August 3, 2026
 */

import type { Employee } from '../entities/employee';
import type { ProgramRecord } from '../entities/program-record';
import type { TravelRequest, TravelCostBreakdown } from '../entities/travel-request';
import type { TimeRecord, TimeRecordEntry } from '../entities/time-record';
import type { StaffProjectAssignment } from '../entities/staff-project-assignment';

// ============================================================
// SEED AND PRNG
// ============================================================

/** The fixed generation seed. Change only with a new governance decision. */
export const STAFF_SEED = 20260803;

/** The Project Principal pseudo-employee-id. Not a real Employee record. */
export const SYNTH_PROJECT_PRINCIPAL_ID = 'SYNTH-PP-001';

/** Simple 32-bit LCG — deterministic, not cryptographic. */
function makeLCG(seed: number): () => number {
  let state = (seed >>> 0);
  return function next(): number {
    state = ((Math.imul(1664525, state) + 1013904223) >>> 0);
    return state / 0x100000000;
  };
}

function pickFrom<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function intBetween(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// ============================================================
// NAME POOLS (realistic, diverse — docs/35 §4)
// ============================================================

const FIRST_NAMES = [
  'Aaliyah', 'Adrian', 'Amara', 'Andre', 'Asha', 'Brendan', 'Caleb', 'Carmen',
  'Chen', 'Claudia', 'Dara', 'Darius', 'Elena', 'Emeka', 'Fatima', 'Felix',
  'Gabriela', 'Hamid', 'Imani', 'Isaac', 'Jasmine', 'Jerome', 'Kira', 'Kofi',
  'Layla', 'Leon', 'Maria', 'Miles', 'Nadia', 'Nathan', 'Nkechi', 'Omar',
  'Priya', 'Rafael', 'Rhea', 'Samuel', 'Selena', 'Tariq', 'Tessa', 'Victor',
  'Wendy', 'Xavier', 'Yara', 'Zara',
] as const;

const LAST_NAMES = [
  'Adeyemi', 'Alvarez', 'Andersen', 'Balogun', 'Baptiste', 'Brennan', 'Carter',
  'Castillo', 'Cruz', 'Decker', 'Diallo', 'Dumont', 'Eze', 'Fitzgerald', 'Flores',
  'Fontaine', 'Garza', 'Grant', 'Guerrero', 'Hassan', 'Hayashi', 'Ibrahim',
  'Ivanova', 'Jara', 'Jensen', 'Kaur', 'Keita', 'Larsson', 'Laurent', 'Lemos',
  'Lindqvist', 'Mancini', 'Mensah', 'Morales', 'Nakamura', 'Ndiaye', 'Obinna',
  'Pacheco', 'Petrov', 'Reyes', 'Santos', 'Sato', 'Schulz', 'Singh', 'Soriano',
  'Tanaka', 'Theron', 'Torres', 'Usman', 'Vidal', 'Walsh', 'Werner', 'Yusuf',
] as const;

function makeName(rng: () => number): string {
  return `${pickFrom(rng, FIRST_NAMES)} ${pickFrom(rng, LAST_NAMES)}`;
}

// ============================================================
// TEAM DEFINITIONS (governance-fixed per docs/35 §3)
// ============================================================

const WM_ORG_UNIT = 'SYNTH World Model Programs';
const TT_ORG_UNIT = 'SYNTH T&T Operations';

interface TeamDef {
  name: string;
  anchorId: string;
  anchorName: string;
  anchorRole: Employee['role'];
  anchorClearance: Employee['clearance_level'];
  anchorOrgUnit: string;
  anchorCostCodes: string[];
  memberIds: string[];
  memberOrgUnit: string;
  memberCostCodes: string[];
  supervisorId: string;
  ppbePrograms: string[];
  worldModelPrograms: string[];
}

const TEAMS: TeamDef[] = [
  {
    name: 'ALPHA',
    anchorId: 'SYNTH-E-301', anchorName: 'Marcus Cole',
    anchorRole: 'PROGRAM_MANAGER', anchorClearance: 'SECRET',
    anchorOrgUnit: 'SYNTH PEO Logistics',
    anchorCostCodes: ['SYNTH-CC-110', 'SYNTH-CC-111'],
    memberIds: ['SYNTH-E-309', 'SYNTH-E-310', 'SYNTH-E-311', 'SYNTH-E-312', 'SYNTH-E-313'],
    memberOrgUnit: 'SYNTH PEO Logistics',
    memberCostCodes: ['SYNTH-CC-110', 'SYNTH-CC-111'],
    supervisorId: 'SYNTH-E-401',
    ppbePrograms: ['SYNTH-PRG-ALPHA', 'SYNTH-PRG-FOXTROT', 'SYNTH-PRG-GOLF'],
    worldModelPrograms: [],
  },
  {
    name: 'BRAVO',
    anchorId: 'SYNTH-E-302', anchorName: 'Sarah Okonkwo',
    anchorRole: 'PROGRAM_MANAGER', anchorClearance: 'CUI',
    anchorOrgUnit: 'SYNTH PEO Cyber',
    anchorCostCodes: ['SYNTH-CC-120', 'SYNTH-CC-121'],
    memberIds: ['SYNTH-E-314', 'SYNTH-E-315', 'SYNTH-E-316', 'SYNTH-E-317', 'SYNTH-E-318'],
    memberOrgUnit: 'SYNTH PEO Cyber',
    memberCostCodes: ['SYNTH-CC-120', 'SYNTH-CC-121'],
    supervisorId: 'SYNTH-E-402',
    ppbePrograms: ['SYNTH-PRG-BRAVO', 'SYNTH-PRG-HOTEL', 'SYNTH-PRG-INDIA'],
    worldModelPrograms: [],
  },
  {
    name: 'CHARLIE',
    anchorId: 'SYNTH-E-303', anchorName: 'James Rivera',
    anchorRole: 'ANALYST', anchorClearance: 'CUI',
    anchorOrgUnit: 'SYNTH PEO Cyber',
    anchorCostCodes: ['SYNTH-CC-130', 'SYNTH-CC-131'],
    memberIds: ['SYNTH-E-319', 'SYNTH-E-320', 'SYNTH-E-321', 'SYNTH-E-322', 'SYNTH-E-323'],
    memberOrgUnit: 'SYNTH PEO Cyber',
    memberCostCodes: ['SYNTH-CC-130', 'SYNTH-CC-131'],
    supervisorId: 'SYNTH-E-403',
    ppbePrograms: ['SYNTH-PRG-CHARLIE', 'SYNTH-PRG-JULIET', 'SYNTH-PRG-KILO'],
    worldModelPrograms: [],
  },
  {
    name: 'DELTA',
    anchorId: 'SYNTH-E-304', anchorName: 'Patricia Webb',
    anchorRole: 'PROGRAM_MANAGER', anchorClearance: 'SECRET',
    anchorOrgUnit: 'SYNTH PEO Sustainment',
    anchorCostCodes: ['SYNTH-CC-140', 'SYNTH-CC-141'],
    memberIds: ['SYNTH-E-324', 'SYNTH-E-325', 'SYNTH-E-326', 'SYNTH-E-327', 'SYNTH-E-328'],
    memberOrgUnit: 'SYNTH PEO Sustainment',
    memberCostCodes: ['SYNTH-CC-140', 'SYNTH-CC-141'],
    supervisorId: 'SYNTH-E-404',
    ppbePrograms: ['SYNTH-PRG-DELTA', 'SYNTH-PRG-LIMA', 'SYNTH-PRG-MIKE'],
    worldModelPrograms: [],
  },
  {
    name: 'ECHO',
    anchorId: 'SYNTH-E-305', anchorName: 'David Nkosi',
    anchorRole: 'PROGRAM_MANAGER', anchorClearance: 'CUI',
    anchorOrgUnit: 'SYNTH PEO Sustainment',
    anchorCostCodes: ['SYNTH-CC-150', 'SYNTH-CC-151'],
    memberIds: ['SYNTH-E-329', 'SYNTH-E-330', 'SYNTH-E-331', 'SYNTH-E-332', 'SYNTH-E-333'],
    memberOrgUnit: 'SYNTH PEO Sustainment',
    memberCostCodes: ['SYNTH-CC-150', 'SYNTH-CC-151'],
    supervisorId: 'SYNTH-E-405',
    ppbePrograms: ['SYNTH-PRG-ECHO', 'SYNTH-PRG-NOVEMBER', 'SYNTH-PRG-OSCAR'],
    worldModelPrograms: [],
  },
  {
    name: 'World Model I',
    anchorId: 'SYNTH-E-306', anchorName: 'Dana Jones',
    anchorRole: 'PROGRAM_MANAGER', anchorClearance: 'CUI',
    anchorOrgUnit: WM_ORG_UNIT,
    anchorCostCodes: ['SYNTH-CC-210', 'SYNTH-CC-211'],
    memberIds: ['SYNTH-E-334', 'SYNTH-E-335', 'SYNTH-E-336', 'SYNTH-E-337', 'SYNTH-E-338'],
    memberOrgUnit: WM_ORG_UNIT,
    memberCostCodes: ['SYNTH-CC-210', 'SYNTH-CC-211'],
    supervisorId: 'SYNTH-E-406',
    ppbePrograms: [],
    worldModelPrograms: [
      'P-100', 'P-150', 'P-401', 'P-402', 'P-403', 'P-404', 'P-405', 'P-406', 'P-407',
    ],
  },
  {
    name: 'World Model II',
    anchorId: 'SYNTH-E-307', anchorName: 'Robin Vasquez',
    anchorRole: 'PROGRAM_MANAGER', anchorClearance: 'CUI',
    anchorOrgUnit: WM_ORG_UNIT,
    anchorCostCodes: ['SYNTH-CC-220', 'SYNTH-CC-221'],
    memberIds: ['SYNTH-E-339', 'SYNTH-E-340', 'SYNTH-E-341', 'SYNTH-E-342', 'SYNTH-E-343'],
    memberOrgUnit: WM_ORG_UNIT,
    memberCostCodes: ['SYNTH-CC-220', 'SYNTH-CC-221'],
    supervisorId: 'SYNTH-E-407',
    ppbePrograms: [],
    worldModelPrograms: [
      'P-200', 'P-205', 'P-300', 'P-408', 'P-409', 'P-410', 'P-411', 'P-412', 'P-413',
    ],
  },
  {
    name: 'T&T Operations',
    anchorId: 'SYNTH-E-308', anchorName: 'Jordan Kim',
    anchorRole: 'PROGRAM_MANAGER', anchorClearance: 'CUI',
    anchorOrgUnit: TT_ORG_UNIT,
    anchorCostCodes: ['SYNTH-CC-310', 'SYNTH-CC-311'],
    memberIds: ['SYNTH-E-344', 'SYNTH-E-345', 'SYNTH-E-346', 'SYNTH-E-347', 'SYNTH-E-348'],
    memberOrgUnit: TT_ORG_UNIT,
    memberCostCodes: ['SYNTH-CC-310', 'SYNTH-CC-311'],
    supervisorId: 'SYNTH-E-408',
    ppbePrograms: [],
    worldModelPrograms: [],
  },
];

// ============================================================
// GENERATION FUNCTION — deterministic from seed
// ============================================================

export interface StaffDataOutput {
  employees: Employee[];
  ppbePrograms: ProgramRecord[];
  travelRequests: TravelRequest[];
  timeRecords: TimeRecord[];
  assignments: StaffProjectAssignment[];
  worldModelProgramIds: string[];
}

// Fixed supervisor names — one per team, order matches TEAMS array
const SUPERVISOR_NAMES: readonly string[] = [
  'Lorraine Osei',
  'Marcus Tanaka',
  'Bria Guerrero',
  'Devin Fontaine',
  'Amara Santos',
  'Kofi Petrov',
  'Elena Mensah',
  'Rafael Andersen',
];

export function generateStaffData(seed: number): StaffDataOutput {
  const rng = makeLCG(seed);

  // ── Employees ─────────────────────────────────────────────────────────────

  const employees: Employee[] = [];

  // 8 anchor employees (fixed names, exact ids, roles from docs/35 §3 table)
  for (const team of TEAMS) {
    employees.push({
      employee_id: team.anchorId,
      name: team.anchorName,
      org_unit: team.anchorOrgUnit,
      role: team.anchorRole,
      clearance_level: team.anchorClearance,
      cost_code_assignments: [...team.anchorCostCodes],
      reports_to: team.supervisorId,
    });
  }

  // 40 generated working staff (5 per team, PRNG-determined names/roles/clearances)
  const CLEARANCES: readonly Employee['clearance_level'][] = [
    'UNCLASSIFIED', 'CUI', 'CUI', 'SECRET',
  ];
  const MEMBER_ROLES: readonly Employee['role'][] = [
    'ANALYST', 'ANALYST', 'ANALYST', 'PROGRAM_MANAGER', 'ANALYST',
  ];

  for (const team of TEAMS) {
    for (const memberId of team.memberIds) {
      const useOneCode = rng() > 0.5;
      const costCodes = useOneCode
        ? [team.memberCostCodes[0]]
        : [...team.memberCostCodes];
      employees.push({
        employee_id: memberId,
        name: makeName(rng),
        org_unit: team.memberOrgUnit,
        role: pickFrom(rng, MEMBER_ROLES),
        clearance_level: pickFrom(rng, CLEARANCES),
        cost_code_assignments: costCodes,
        reports_to: team.supervisorId,
      });
    }
  }

  // 8 Supervisors — one per team, all reporting to the Project Principal
  for (let i = 0; i < TEAMS.length; i++) {
    const team = TEAMS[i];
    employees.push({
      employee_id: team.supervisorId,
      name: SUPERVISOR_NAMES[i],
      org_unit: team.memberOrgUnit,
      role: 'SUPERVISOR',
      clearance_level: 'SECRET',
      cost_code_assignments: [...team.memberCostCodes],
      reports_to: SYNTH_PROJECT_PRINCIPAL_ID,
    });
  }

  // ── Staff-to-program assignments ──────────────────────────────────────────

  const assignments: StaffProjectAssignment[] = [];
  for (const team of TEAMS) {
    const teamStaffIds = [team.anchorId, ...team.memberIds, team.supervisorId];
    for (const staffId of teamStaffIds) {
      for (const programId of team.ppbePrograms) {
        assignments.push({ staff_id: staffId, project_id: programId, project_system: 'ppbe_native' });
      }
      for (const programId of team.worldModelPrograms) {
        assignments.push({ staff_id: staffId, project_id: programId, project_system: 'world_model' });
      }
    }
  }

  // ── New PPBE programs (10 new, 2 per PPBE team) ───────────────────────────

  const ppbePrograms: ProgramRecord[] = buildPPBEPrograms();

  // ── Travel requests (34 new — SYNTH-TR-201 through SYNTH-TR-234) ──────────

  const travelRequests: TravelRequest[] = buildTravelRequests(rng, employees);

  // ── Time records (24 new — SYNTH-TM-301 through SYNTH-TM-324) ────────────

  const timeRecords: TimeRecord[] = buildTimeRecords(rng, employees);

  const worldModelProgramIds = [
    'P-401', 'P-402', 'P-403', 'P-404', 'P-405', 'P-406', 'P-407',
    'P-408', 'P-409', 'P-410', 'P-411', 'P-412', 'P-413',
  ];

  return { employees, ppbePrograms, travelRequests, timeRecords, assignments, worldModelProgramIds };
}

// ============================================================
// PPBE PROGRAM BUILDER (static — fields require precise values to pass
// validateProgramRecord, so these are authored rather than PRNG-generated)
// ============================================================

function buildPPBEPrograms(): ProgramRecord[] {
  return [
    // ALPHA team additions
    {
      program_id: 'SYNTH-PRG-FOXTROT',
      name: 'Autonomous Logistics Routing',
      sponsor: 'SYNTH PEO Logistics',
      contract_number: 'SYNTH-W91-26-C-0201',
      classification_level: 'UNCLASSIFIED',
      status: 'ACTIVE',
      objective_id: 'SYNTH-SO-01',
      fiscal_year: 'FY 2026',
      lifecycle_cost_estimate: 1800000,
      obligation_plan: [
        { period: 'FY 2026 Q3', planned_amount: 200000 },
        { period: 'FY 2026 Q4', planned_amount: 300000 },
      ],
      performance_baseline: [
        { metric: 'obligation rate', baseline_value: 'within 10% of plan each quarter' },
        { metric: 'routing accuracy', baseline_value: '95% on-time routing decisions' },
      ],
      point_of_contact: { name: 'Marcus Cole', role: 'Program Manager' },
    },
    {
      program_id: 'SYNTH-PRG-GOLF',
      name: 'Distributed Inventory Visibility',
      sponsor: 'SYNTH PEO Logistics',
      contract_number: 'SYNTH-W91-26-C-0202',
      classification_level: 'UNCLASSIFIED',
      status: 'ACTIVE',
      objective_id: 'SYNTH-SO-01',
      fiscal_year: 'FY 2026',
      lifecycle_cost_estimate: 950000,
      obligation_plan: [
        { period: 'FY 2026 Q3', planned_amount: 100000 },
        { period: 'FY 2026 Q4', planned_amount: 180000 },
      ],
      performance_baseline: [
        { metric: 'obligation rate', baseline_value: 'within 10% of plan each quarter' },
        { metric: 'inventory accuracy', baseline_value: '98% item accuracy by Q4' },
      ],
      point_of_contact: { name: 'Marcus Cole', role: 'Program Manager' },
    },
    // BRAVO team additions
    {
      program_id: 'SYNTH-PRG-HOTEL',
      name: 'Cyber Threat Intelligence Feed',
      sponsor: 'SYNTH PEO Cyber',
      contract_number: 'SYNTH-W91-26-C-0203',
      classification_level: 'UNCLASSIFIED',
      status: 'ACTIVE',
      objective_id: 'SYNTH-SO-02',
      fiscal_year: 'FY 2026',
      lifecycle_cost_estimate: 600000,
      obligation_plan: [
        { period: 'FY 2026 Q3', planned_amount: 80000 },
        { period: 'FY 2026 Q4', planned_amount: 120000 },
      ],
      performance_baseline: [
        { metric: 'obligation rate', baseline_value: 'within 10% of plan each quarter' },
        { metric: 'feed coverage', baseline_value: 'eight priority threat categories monitored by Q4' },
      ],
      point_of_contact: { name: 'Sarah Okonkwo', role: 'Program Manager' },
    },
    {
      program_id: 'SYNTH-PRG-INDIA',
      name: 'Zero-Trust Network Segmentation',
      sponsor: 'SYNTH PEO Cyber',
      contract_number: 'SYNTH-W91-26-C-0204',
      classification_level: 'UNCLASSIFIED',
      status: 'ACTIVE',
      objective_id: 'SYNTH-SO-02',
      fiscal_year: 'FY 2026',
      lifecycle_cost_estimate: 1100000,
      obligation_plan: [
        { period: 'FY 2026 Q3', planned_amount: 130000 },
        { period: 'FY 2026 Q4', planned_amount: 200000 },
      ],
      performance_baseline: [
        { metric: 'obligation rate', baseline_value: 'within 10% of plan each quarter' },
        { metric: 'segment coverage', baseline_value: '60% of enterprise segments isolated by Q4' },
      ],
      point_of_contact: { name: 'Sarah Okonkwo', role: 'Program Manager' },
    },
    // CHARLIE team additions
    {
      program_id: 'SYNTH-PRG-JULIET',
      name: 'Endpoint Security Uplift',
      sponsor: 'SYNTH PEO Cyber',
      contract_number: 'SYNTH-W91-26-C-0205',
      classification_level: 'UNCLASSIFIED',
      status: 'ACTIVE',
      objective_id: 'SYNTH-SO-02',
      fiscal_year: 'FY 2026',
      lifecycle_cost_estimate: 750000,
      obligation_plan: [
        { period: 'FY 2026 Q3', planned_amount: 90000 },
        { period: 'FY 2026 Q4', planned_amount: 140000 },
      ],
      performance_baseline: [
        { metric: 'obligation rate', baseline_value: 'within 10% of plan each quarter' },
        { metric: 'endpoint compliance', baseline_value: '95% of managed endpoints compliant by Q4' },
      ],
      point_of_contact: { name: 'James Rivera', role: 'Senior Analyst' },
    },
    {
      program_id: 'SYNTH-PRG-KILO',
      name: 'Vulnerability Management Automation',
      sponsor: 'SYNTH PEO Cyber',
      contract_number: 'SYNTH-W91-26-C-0206',
      classification_level: 'UNCLASSIFIED',
      status: 'ACTIVE',
      objective_id: 'SYNTH-SO-02',
      fiscal_year: 'FY 2026',
      lifecycle_cost_estimate: 420000,
      obligation_plan: [
        { period: 'FY 2026 Q3', planned_amount: 50000 },
        { period: 'FY 2026 Q4', planned_amount: 80000 },
      ],
      performance_baseline: [
        { metric: 'obligation rate', baseline_value: 'within 10% of plan each quarter' },
        { metric: 'patch cycle', baseline_value: 'critical patches applied within seventy-two hours' },
      ],
      point_of_contact: { name: 'James Rivera', role: 'Senior Analyst' },
    },
    // DELTA team additions
    {
      program_id: 'SYNTH-PRG-LIMA',
      name: 'Depot Sustainment Platform Migration',
      sponsor: 'SYNTH PEO Sustainment',
      contract_number: 'SYNTH-W91-26-C-0207',
      classification_level: 'UNCLASSIFIED',
      status: 'ACTIVE',
      objective_id: 'SYNTH-SO-03',
      fiscal_year: 'FY 2026',
      lifecycle_cost_estimate: 680000,
      obligation_plan: [
        { period: 'FY 2026 Q3', planned_amount: 75000 },
        { period: 'FY 2026 Q4', planned_amount: 120000 },
      ],
      performance_baseline: [
        { metric: 'obligation rate', baseline_value: 'within 10% of plan each quarter' },
        { metric: 'data migration', baseline_value: '40% of depot records migrated by Q4' },
      ],
      point_of_contact: { name: 'Patricia Webb', role: 'Program Manager' },
    },
    {
      program_id: 'SYNTH-PRG-MIKE',
      name: 'Maintenance Record Digitization',
      sponsor: 'SYNTH PEO Sustainment',
      contract_number: 'SYNTH-W91-26-C-0208',
      classification_level: 'UNCLASSIFIED',
      status: 'ACTIVE',
      objective_id: 'SYNTH-SO-03',
      fiscal_year: 'FY 2026',
      lifecycle_cost_estimate: 390000,
      obligation_plan: [
        { period: 'FY 2026 Q3', planned_amount: 45000 },
        { period: 'FY 2026 Q4', planned_amount: 70000 },
      ],
      performance_baseline: [
        { metric: 'obligation rate', baseline_value: 'within 10% of plan each quarter' },
        { metric: 'digitization rate', baseline_value: 'twelve thousand records digitized per quarter' },
      ],
      point_of_contact: { name: 'Patricia Webb', role: 'Program Manager' },
    },
    // ECHO team additions
    {
      program_id: 'SYNTH-PRG-NOVEMBER',
      name: 'Fleet Readiness Analytics',
      sponsor: 'SYNTH PEO Sustainment',
      contract_number: 'SYNTH-W91-26-C-0209',
      classification_level: 'UNCLASSIFIED',
      status: 'ACTIVE',
      objective_id: 'SYNTH-SO-03',
      fiscal_year: 'FY 2026',
      lifecycle_cost_estimate: 520000,
      obligation_plan: [
        { period: 'FY 2026 Q3', planned_amount: 60000 },
        { period: 'FY 2026 Q4', planned_amount: 100000 },
      ],
      performance_baseline: [
        { metric: 'obligation rate', baseline_value: 'within 10% of plan each quarter' },
        { metric: 'readiness reporting', baseline_value: 'weekly automated readiness reports delivered by Q3' },
      ],
      point_of_contact: { name: 'David Nkosi', role: 'Program Manager' },
    },
    {
      program_id: 'SYNTH-PRG-OSCAR',
      name: 'Supply Chain Risk Monitoring',
      sponsor: 'SYNTH PEO Sustainment',
      contract_number: 'SYNTH-W91-26-C-0210',
      classification_level: 'UNCLASSIFIED',
      status: 'ACTIVE',
      objective_id: 'SYNTH-SO-03',
      fiscal_year: 'FY 2026',
      lifecycle_cost_estimate: 310000,
      obligation_plan: [
        { period: 'FY 2026 Q3', planned_amount: 35000 },
        { period: 'FY 2026 Q4', planned_amount: 65000 },
      ],
      performance_baseline: [
        { metric: 'obligation rate', baseline_value: 'within 10% of plan each quarter' },
        { metric: 'supplier coverage', baseline_value: 'seventy tier-two suppliers monitored by Q4' },
      ],
      point_of_contact: { name: 'David Nkosi', role: 'Program Manager' },
    },
  ];
}

// ============================================================
// TRAVEL REQUEST BUILDER
// 34 records (SYNTH-TR-201 through SYNTH-TR-234)
// employee_ids drawn from working staff (non-supervisor) roster
// ============================================================

const DESTINATIONS = [
  'Arlington, VA', 'San Diego, CA', 'Colorado Springs, CO', 'Huntsville, AL',
  'Tampa, FL', 'Seattle, WA', 'Dallas, TX', 'Dayton, OH', 'Fort Meade, MD',
  'San Antonio, TX', 'Sacramento, CA', 'Norfolk, VA', 'Atlanta, GA',
  'Phoenix, AZ', 'Omaha, NE',
] as const;

const MISSIONS = [
  'Quarterly program review with the program office team.',
  'Technical working group for requirements development.',
  'Site visit to contractor facility for milestone verification.',
  'Annual conference on program planning and execution.',
  'Interagency coordination meeting on shared logistics standards.',
  'System demonstration review with the program decision authority.',
  'Kickoff meeting for the new contract period of performance.',
  'Data exchange workshop with the counterpart program office.',
  'Training on updated compliance procedures and reporting requirements.',
  'End-of-year closeout review with the contracting officer.',
] as const;

// ISO date string from numeric year/month/day parts
function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildTravelRequests(rng: () => number, employees: Employee[]): TravelRequest[] {
  const requests: TravelRequest[] = [];
  // Only working staff (anchor + member, not supervisors) generate travel
  const travelable = employees.filter((e) => e.reports_to !== SYNTH_PROJECT_PRINCIPAL_ID);

  const STATUSES: readonly TravelRequest['status'][] = [
    'SUBMITTED', 'ROUTED', 'APPROVED', 'APPROVED', 'APPROVED', 'DENIED',
  ];
  const ROUTING_TIERS: readonly NonNullable<TravelRequest['routing_tier']>[] = [
    'STANDARD', 'STANDARD', 'FLAGGED',
  ];
  const AUTHORITIES: readonly NonNullable<TravelRequest['assigned_authority']>[] = [
    'MANAGER', 'MANAGER', 'DIRECTOR',
  ];

  for (let i = 1; i <= 34; i++) {
    const emp = pickFrom(rng, travelable);
    const airfare = intBetween(rng, 200, 800);
    const hotel = intBetween(rng, 180, 600);
    const perDiem = intBetween(rng, 100, 400);
    const ground = intBetween(rng, 30, 150);
    const regFees = intBetween(rng, 0, 300);
    const totalCost = airfare + hotel + perDiem + ground + regFees;

    // Ensure end >= start: start day 1-14, end day 15-28 of the same month
    const startDay = intBetween(rng, 1, 14);
    const endDay = intBetween(rng, 15, 28);

    const costs: TravelCostBreakdown = {
      airfare,
      hotel,
      per_diem: perDiem,
      ground_transport: ground,
      registration_fees: regFees,
    };

    const submittedDay = String(intBetween(rng, 1, 28)).padStart(2, '0');

    requests.push({
      request_id: `SYNTH-TR-${200 + i}`,
      employee_id: emp.employee_id,
      destination: pickFrom(rng, DESTINATIONS),
      international: false,
      travel_start_date: isoDate(2026, 8, startDay),
      travel_end_date: isoDate(2026, 8, endDay),
      mission_purpose: pickFrom(rng, MISSIONS),
      costs,
      total_cost: totalCost,
      personal_day_included: false,
      justification: `Travel required for ${emp.org_unit} program coordination.`,
      status: pickFrom(rng, STATUSES),
      submitted_at: `2026-07-${submittedDay}T10:00:00.000Z`,
      routing_tier: pickFrom(rng, ROUTING_TIERS),
      assigned_authority: pickFrom(rng, AUTHORITIES),
    });
  }
  return requests;
}

// ============================================================
// TIME RECORD BUILDER
// 24 records (SYNTH-TM-301 through SYNTH-TM-324)
// cost_code from employee's own cost_code_assignments (docs/35 §4)
// ============================================================

// Three non-overlapping pay periods
const PAY_PERIODS: readonly { start: string; end: string; days: string[] }[] = [
  {
    start: '2026-06-22', end: '2026-07-05',
    days: ['2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26'],
  },
  {
    start: '2026-07-06', end: '2026-07-19',
    days: ['2026-07-07', '2026-07-08', '2026-07-09', '2026-07-10', '2026-07-11'],
  },
  {
    start: '2026-07-20', end: '2026-08-02',
    days: ['2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24', '2026-07-25'],
  },
];

function buildTimeRecords(rng: () => number, employees: Employee[]): TimeRecord[] {
  const records: TimeRecord[] = [];
  // Only working staff (anchor + member, not supervisors)
  const timeStaff = employees.filter((e) => e.reports_to !== SYNTH_PROJECT_PRINCIPAL_ID);

  for (let i = 1; i <= 24; i++) {
    const emp = pickFrom(rng, timeStaff);
    const period = pickFrom(rng, PAY_PERIODS);

    // cost_code must be in the employee's cost_code_assignments (consistency rule)
    const costCode = pickFrom(rng, emp.cost_code_assignments as string[]);

    const entries: TimeRecordEntry[] = period.days.map((date) => ({
      entry_date: date,
      cost_code: costCode,
      hours: intBetween(rng, 6, 10),
      charge_type: 'DIRECT' as const,
      holiday: false,
    }));

    const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);

    records.push({
      record_id: `SYNTH-TM-${300 + i}`,
      employee_id: emp.employee_id,
      period_start: period.start,
      period_end: period.end,
      entries,
      total_hours: totalHours,
      submitted_at: `${period.start}T17:00:00.000Z`,
    });
  }
  return records;
}

// ============================================================
// EXPORTED CONSTANTS — generated at module load from fixed seed
// ============================================================

const _generated = generateStaffData(STAFF_SEED);

/** 56 Employee records: 8 anchors (SYNTH-E-301–308) + 40 working staff (SYNTH-E-309–348) + 8 Supervisors (SYNTH-E-401–408). */
export const SYNTH_STAFF_EMPLOYEES: Employee[] = _generated.employees;

/** 10 new PPBE-native ProgramRecord instances: SYNTH-PRG-FOXTROT through SYNTH-PRG-OSCAR. */
export const SYNTH_STAFF_PPBE_PROGRAMS: ProgramRecord[] = _generated.ppbePrograms;

/** 34 new TravelRequest records: SYNTH-TR-201 through SYNTH-TR-234. */
export const SYNTH_STAFF_TRAVEL_REQUESTS: TravelRequest[] = _generated.travelRequests;

/** 24 new TimeRecord records: SYNTH-TM-301 through SYNTH-TM-324. */
export const SYNTH_STAFF_TIME_RECORDS: TimeRecord[] = _generated.timeRecords;

/** Staff-to-program assignments for all 56 staff members. */
export const SYNTH_STAFF_ASSIGNMENTS: StaffProjectAssignment[] = _generated.assignments;

/** The 13 new World Model program IDs added this session (P-401–P-413).
 *  Full ApexProgramRecord data lives in module-apex/src/synthetic-world-model.ts. */
export const SYNTH_STAFF_WORLD_MODEL_PROGRAM_IDS: readonly string[] = _generated.worldModelProgramIds;

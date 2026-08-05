/**
 * sovereign-data — staff-seed.test.ts (GD-33, docs/35 §5)
 *
 * Done Condition assertions:
 *   DC-5: All Employee records validate.
 *   DC-5: All ProgramRecord records validate.
 *   DC-5: All TravelRequest records validate.
 *   DC-5: All TimeRecord records validate.
 *   DC-5: All StaffProjectAssignment records validate.
 *   DC-5 internal consistency: TimeRecordEntry.cost_code ∈ employee.cost_code_assignments.
 *   DC-5 internal consistency: TravelRequest.employee_id references a known employee.
 *   DC-6 convergence: generateStaffData(STAFF_SEED) called twice → identical output.
 *
 * Volume assertions (docs/35 §5 DC-4):
 *   56 employees (8 anchors + 40 working + 8 supervisors).
 *   10 new PPBE programs.
 *   34 travel requests.
 *   24 time records.
 *   All 8 anchor names present.
 *   All 8 supervisors report to SYNTH_PROJECT_PRINCIPAL_ID.
 *   13 World Model program IDs listed.
 */
import {
  validateEmployee,
  validateProgramRecord,
  validateTravelRequest,
  validateTimeRecord,
  validateStaffProjectAssignment,
  SYNTH_STAFF_EMPLOYEES,
  SYNTH_STAFF_PPBE_PROGRAMS,
  SYNTH_STAFF_TRAVEL_REQUESTS,
  SYNTH_STAFF_TIME_RECORDS,
  SYNTH_STAFF_ASSIGNMENTS,
  SYNTH_STAFF_WORLD_MODEL_PROGRAM_IDS,
  STAFF_SEED,
  SYNTH_PROJECT_PRINCIPAL_ID,
  generateStaffData,
} from '../src';

// ── Volume ────────────────────────────────────────────────────────────────────

describe('staff-seed — volume (docs/35 §5 DC-4)', () => {
  it('produces exactly 56 employees', () => {
    expect(SYNTH_STAFF_EMPLOYEES).toHaveLength(56);
  });

  it('produces exactly 10 new PPBE programs', () => {
    expect(SYNTH_STAFF_PPBE_PROGRAMS).toHaveLength(10);
  });

  it('produces exactly 34 travel requests', () => {
    expect(SYNTH_STAFF_TRAVEL_REQUESTS).toHaveLength(34);
  });

  it('produces exactly 24 time records', () => {
    expect(SYNTH_STAFF_TIME_RECORDS).toHaveLength(24);
  });

  it('lists exactly 13 new World Model program IDs', () => {
    expect(SYNTH_STAFF_WORLD_MODEL_PROGRAM_IDS).toHaveLength(13);
  });
});

// ── Anchor names ──────────────────────────────────────────────────────────────

const EXPECTED_ANCHORS = [
  { id: 'SYNTH-E-301', name: 'Marcus Cole' },
  { id: 'SYNTH-E-302', name: 'Sarah Okonkwo' },
  { id: 'SYNTH-E-303', name: 'James Rivera' },
  { id: 'SYNTH-E-304', name: 'Patricia Webb' },
  { id: 'SYNTH-E-305', name: 'David Nkosi' },
  { id: 'SYNTH-E-306', name: 'Dana Jones' },
  { id: 'SYNTH-E-307', name: 'Robin Vasquez' },
  { id: 'SYNTH-E-308', name: 'Jordan Kim' },
];

describe('staff-seed — team anchors', () => {
  const byId = new Map(SYNTH_STAFF_EMPLOYEES.map((e) => [e.employee_id, e]));

  for (const { id, name } of EXPECTED_ANCHORS) {
    it(`anchor ${id} has name ${name}`, () => {
      const emp = byId.get(id);
      expect(emp).toBeDefined();
      expect(emp!.name).toBe(name);
    });
  }
});

// ── Supervisor structure ──────────────────────────────────────────────────────

describe('staff-seed — supervisor structure', () => {
  const supervisorIds = ['SYNTH-E-401', 'SYNTH-E-402', 'SYNTH-E-403', 'SYNTH-E-404',
    'SYNTH-E-405', 'SYNTH-E-406', 'SYNTH-E-407', 'SYNTH-E-408'];
  const byId = new Map(SYNTH_STAFF_EMPLOYEES.map((e) => [e.employee_id, e]));

  it('has exactly 8 supervisors', () => {
    const sups = SYNTH_STAFF_EMPLOYEES.filter((e) => e.reports_to === SYNTH_PROJECT_PRINCIPAL_ID);
    expect(sups).toHaveLength(8);
  });

  for (const supId of supervisorIds) {
    it(`supervisor ${supId} reports to SYNTH_PROJECT_PRINCIPAL_ID`, () => {
      const sup = byId.get(supId);
      expect(sup).toBeDefined();
      expect(sup!.reports_to).toBe(SYNTH_PROJECT_PRINCIPAL_ID);
    });
  }

  it('all anchors and members report to their team supervisor (not the PP)', () => {
    const workingStaff = SYNTH_STAFF_EMPLOYEES.filter(
      (e) => e.reports_to !== SYNTH_PROJECT_PRINCIPAL_ID
    );
    expect(workingStaff).toHaveLength(48);
    for (const emp of workingStaff) {
      expect(emp.reports_to).toMatch(/^SYNTH-E-4/);
    }
  });

  it('all 8 supervisors carry role SUPERVISOR (docs/34 Phase 3, Session 91)', () => {
    // Session 79 / GD-33 used INDEPENDENT_REVIEWER as a placeholder because SUPERVISOR
    // did not exist in SovereignRole. Session 91 adds the role and reassigns here.
    const supervisorEmployees = SYNTH_STAFF_EMPLOYEES.filter(
      (e) => e.reports_to === SYNTH_PROJECT_PRINCIPAL_ID
    );
    expect(supervisorEmployees).toHaveLength(8);
    for (const sup of supervisorEmployees) {
      expect(sup.role).toBe('SUPERVISOR');
    }
  });
});

// ── Entity validation (DC-5) ──────────────────────────────────────────────────

describe('staff-seed — employee validation', () => {
  it('every employee validates against validateEmployee', () => {
    for (const emp of SYNTH_STAFF_EMPLOYEES) {
      const result = validateEmployee(emp);
      if (!result.valid) {
        throw new Error(`Employee ${emp.employee_id} failed validation: ${result.errors?.join('; ')}`);
      }
      expect(result).toEqual({ valid: true });
    }
  });

  it('every employee_id is SYNTH- prefixed', () => {
    for (const emp of SYNTH_STAFF_EMPLOYEES) {
      expect(emp.employee_id).toMatch(/^SYNTH-E-/);
    }
  });
});

describe('staff-seed — PPBE program validation', () => {
  it('every PPBE program validates against validateProgramRecord', () => {
    for (const prog of SYNTH_STAFF_PPBE_PROGRAMS) {
      const result = validateProgramRecord(prog);
      if (!result.valid) {
        throw new Error(`Program ${prog.program_id} failed validation: ${result.errors?.join('; ')}`);
      }
      expect(result).toEqual({ valid: true });
    }
  });

  it('all new PPBE program IDs are SYNTH-PRG- prefixed', () => {
    for (const prog of SYNTH_STAFF_PPBE_PROGRAMS) {
      expect(prog.program_id).toMatch(/^SYNTH-PRG-/);
    }
  });
});

describe('staff-seed — travel request validation', () => {
  it('every travel request validates against validateTravelRequest', () => {
    for (const req of SYNTH_STAFF_TRAVEL_REQUESTS) {
      const result = validateTravelRequest(req);
      if (!result.valid) {
        throw new Error(`Request ${req.request_id} failed validation: ${result.errors?.join('; ')}`);
      }
      expect(result).toEqual({ valid: true });
    }
  });

  it('all request IDs are SYNTH-TR- prefixed', () => {
    for (const req of SYNTH_STAFF_TRAVEL_REQUESTS) {
      expect(req.request_id).toMatch(/^SYNTH-TR-/);
    }
  });
});

describe('staff-seed — time record validation', () => {
  it('every time record validates against validateTimeRecord', () => {
    for (const rec of SYNTH_STAFF_TIME_RECORDS) {
      const result = validateTimeRecord(rec);
      if (!result.valid) {
        throw new Error(`Record ${rec.record_id} failed validation: ${result.errors?.join('; ')}`);
      }
      expect(result).toEqual({ valid: true });
    }
  });

  it('all record IDs are SYNTH-TM- prefixed', () => {
    for (const rec of SYNTH_STAFF_TIME_RECORDS) {
      expect(rec.record_id).toMatch(/^SYNTH-TM-/);
    }
  });
});

describe('staff-seed — assignment validation', () => {
  it('every assignment validates against validateStaffProjectAssignment', () => {
    for (const asgn of SYNTH_STAFF_ASSIGNMENTS) {
      const result = validateStaffProjectAssignment(asgn);
      if (!result.valid) {
        throw new Error(`Assignment ${asgn.staff_id}→${asgn.project_id} failed: ${result.errors?.join('; ')}`);
      }
      expect(result).toEqual({ valid: true });
    }
  });
});

// ── Internal consistency (DC-5) ───────────────────────────────────────────────

describe('staff-seed — internal consistency', () => {
  const employeeById = new Map(SYNTH_STAFF_EMPLOYEES.map((e) => [e.employee_id, e]));

  it('every TimeRecord employee_id references a known seed employee', () => {
    for (const rec of SYNTH_STAFF_TIME_RECORDS) {
      expect(employeeById.has(rec.employee_id)).toBe(true);
    }
  });

  it('every TravelRequest employee_id references a known seed employee', () => {
    for (const req of SYNTH_STAFF_TRAVEL_REQUESTS) {
      expect(employeeById.has(req.employee_id)).toBe(true);
    }
  });

  it('every TimeRecordEntry cost_code is in the employee\'s cost_code_assignments', () => {
    for (const rec of SYNTH_STAFF_TIME_RECORDS) {
      const emp = employeeById.get(rec.employee_id);
      if (!emp) continue;
      const assignedCodes = new Set(emp.cost_code_assignments);
      for (const entry of rec.entries) {
        expect(assignedCodes.has(entry.cost_code)).toBe(true);
      }
    }
  });
});

// ── Convergence (DC-6) ────────────────────────────────────────────────────────

describe('staff-seed — convergence (docs/35 §5 DC-6)', () => {
  it('generateStaffData(STAFF_SEED) is deterministic — same result called twice', () => {
    const run1 = generateStaffData(STAFF_SEED);
    const run2 = generateStaffData(STAFF_SEED);
    expect(JSON.stringify(run1)).toBe(JSON.stringify(run2));
  });

  it('generateStaffData with a different seed produces a different employee roster', () => {
    const run1 = generateStaffData(STAFF_SEED);
    const run2 = generateStaffData(STAFF_SEED + 1);
    // The generated (non-anchor) names will differ; anchors are fixed
    const run1Names = run1.employees.map((e) => e.name).join(',');
    const run2Names = run2.employees.map((e) => e.name).join(',');
    expect(run1Names).not.toBe(run2Names);
  });

  it('the STAFF_SEED constant is exactly 20260803', () => {
    expect(STAFF_SEED).toBe(20260803);
  });
});

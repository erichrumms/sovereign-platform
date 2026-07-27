/**
 * ppbe-seed tests — Session 33 (D1).
 * The canonical PPBE synthetic seed: every record is a VALID entity instance,
 * every cross-reference resolves, dates are internally consistent with the
 * clock of record, and the deliberate anomaly examples are present EXACTLY as
 * designed (one ceiling-exceeded program, one ceiling-proximate, one stalled
 * learning loop) — never by accident.
 */

import {
  SYNTH_PPBE_AS_OF,
  SYNTH_PPBE_PERIODS,
  fiscalYearOfTimestamp,
  synthPeriodForTimestamp,
  SYNTH_PPBE_OBJECTIVES,
  SYNTH_PPBE_PROGRAMS,
  SYNTH_PPBE_OBLIGATIONS,
  SYNTH_PPBE_DEPENDENCIES,
  SYNTH_PPBE_FINDINGS,
  SYNTH_PPBE_EXHIBITS,
  validateStrategicObjective,
  validateProgramRecord,
  validateObligationRecord,
  validateEvaluationFinding,
  validateDependencyMap,
  validateBudgetExhibit,
} from '../src';

/** FY2026 obligations only — used for anomaly tests that assert exact per-year figures. */
function obligationsFY2026(programId: string): number {
  return SYNTH_PPBE_OBLIGATIONS.filter(
    (o) => o.program_id === programId && fiscalYearOfTimestamp(o.timestamp) === 'FY 2026'
  ).reduce((sum, o) => sum + o.amount, 0);
}

function totalObligated(programId: string): number {
  return SYNTH_PPBE_OBLIGATIONS.filter((o) => o.program_id === programId).reduce(
    (sum, o) => sum + o.amount,
    0
  );
}

describe('every seeded record is a valid entity instance', () => {
  it('objectives, programs, obligations, findings, dependencies, exhibits all validate', () => {
    for (const o of SYNTH_PPBE_OBJECTIVES) expect(validateStrategicObjective(o)).toEqual({ valid: true });
    for (const p of SYNTH_PPBE_PROGRAMS) expect(validateProgramRecord(p)).toEqual({ valid: true });
    for (const ob of SYNTH_PPBE_OBLIGATIONS) expect(validateObligationRecord(ob)).toEqual({ valid: true });
    for (const f of SYNTH_PPBE_FINDINGS) expect(validateEvaluationFinding(f)).toEqual({ valid: true });
    for (const d of SYNTH_PPBE_DEPENDENCIES) expect(validateDependencyMap(d)).toEqual({ valid: true });
    for (const e of SYNTH_PPBE_EXHIBITS) expect(validateBudgetExhibit(e)).toEqual({ valid: true });
  });

  it('every id carries the SYNTH- prefix and every record is UNCLASSIFIED (GD-10)', () => {
    expect(SYNTH_PPBE_OBJECTIVES.every((o) => o.objective_id.startsWith('SYNTH-'))).toBe(true);
    expect(SYNTH_PPBE_PROGRAMS.every((p) => p.program_id.startsWith('SYNTH-'))).toBe(true);
    expect(SYNTH_PPBE_PROGRAMS.every((p) => p.classification_level === 'UNCLASSIFIED')).toBe(true);
    expect(SYNTH_PPBE_OBLIGATIONS.every((o) => o.obligation_id.startsWith('SYNTH-'))).toBe(true);
    expect(SYNTH_PPBE_FINDINGS.every((f) => f.finding_id.startsWith('SYNTH-'))).toBe(true);
  });
});

describe('the portfolio shape (goal item 1)', () => {
  it('holds five programs in FY2026 (the current year) across three objectives', () => {
    const fy2026 = SYNTH_PPBE_PROGRAMS.filter((p) => p.fiscal_year === 'FY 2026');
    expect(fy2026).toHaveLength(5);
    expect(SYNTH_PPBE_OBJECTIVES).toHaveLength(3);
    const objectivesUsed = new Set(fy2026.map((p) => p.objective_id));
    expect(objectivesUsed.size).toBe(3);
  });

  it('every cross-reference resolves and agrees', () => {
    const objectiveIds = new Set(SYNTH_PPBE_OBJECTIVES.map((o) => o.objective_id));
    const programsById = new Map(SYNTH_PPBE_PROGRAMS.map((p) => [p.program_id, p]));
    for (const p of SYNTH_PPBE_PROGRAMS) expect(objectiveIds.has(p.objective_id)).toBe(true);
    for (const ob of SYNTH_PPBE_OBLIGATIONS) expect(programsById.has(ob.program_id)).toBe(true);
    for (const f of SYNTH_PPBE_FINDINGS) {
      const program = programsById.get(f.program_id);
      expect(program).toBeDefined();
      // The finding's objective agrees with its program's own objective.
      expect(f.objective_id).toBe(program!.objective_id);
    }
    const obligationSteps = new Set(SYNTH_PPBE_OBLIGATIONS.map((o) => o.workflow_step_id));
    const elicitationSteps = new Set(SYNTH_PPBE_OBJECTIVES.map((o) => o.source_workflow_step_id));
    for (const exhibit of SYNTH_PPBE_EXHIBITS) {
      expect(programsById.has(exhibit.program_id)).toBe(true);
      for (const ref of exhibit.source_data_lineage) {
        expect(obligationSteps.has(ref) || elicitationSteps.has(ref)).toBe(true);
      }
    }
  });
});

describe('internal date consistency (the clock of record)', () => {
  it('every obligation is before the clock of record, maps to a valid FY period, and that period exists in the matching year\'s program plan', () => {
    for (const ob of SYNTH_PPBE_OBLIGATIONS) {
      expect(ob.timestamp < SYNTH_PPBE_AS_OF).toBe(true);
      const period = synthPeriodForTimestamp(ob.timestamp);
      // Period must be a well-formed fiscal-year quarter string (multi-year aware).
      expect(period).toMatch(/^FY 20\d\d Q[1-4]$/);
      // The program record for this obligation's fiscal year has the period in its plan.
      const fy = fiscalYearOfTimestamp(ob.timestamp);
      const program = SYNTH_PPBE_PROGRAMS.find(
        (p) => p.program_id === ob.program_id && p.fiscal_year === fy
      );
      expect(program).toBeDefined();
      expect(program!.obligation_plan.some((e) => e.period === period)).toBe(true);
    }
  });
});

describe('the deliberate anomaly examples (goal items 2-4) — exact, never accidental', () => {
  it('EXACTLY one FY2026 program exceeds its FY2026 lifecycle estimate (ECHO, the labeled ADA example)', () => {
    const fy2026 = SYNTH_PPBE_PROGRAMS.filter((p) => p.fiscal_year === 'FY 2026');
    const exceeded = fy2026.filter(
      (p) => obligationsFY2026(p.program_id) > p.lifecycle_cost_estimate
    );
    expect(exceeded.map((p) => p.program_id)).toEqual(['SYNTH-PRG-ECHO']);
    expect(obligationsFY2026('SYNTH-PRG-ECHO')).toBe(458000); // 153 percent of 300000 (Q1–Q4 total)
  });

  it('EXACTLY one FY2026 program sits in the ceiling-proximity band (DELTA, 90-100 percent)', () => {
    const fy2026 = SYNTH_PPBE_PROGRAMS.filter((p) => p.fiscal_year === 'FY 2026');
    const proximate = fy2026.filter((p) => {
      const pct = (obligationsFY2026(p.program_id) / p.lifecycle_cost_estimate) * 100;
      return pct >= 90 && pct <= 100;
    });
    expect(proximate.map((p) => p.program_id)).toEqual(['SYNTH-PRG-DELTA']);
    expect(obligationsFY2026('SYNTH-PRG-DELTA')).toBe(485000); // 97 percent of 500000 (Q1–Q4 total)
  });

  it('BRAVO under-executes and CHARLIE over-executes Q3 beyond the ten percent threshold; ALPHA and DELTA stay inside it', () => {
    const q3Actual = (programId: string) =>
      SYNTH_PPBE_OBLIGATIONS.filter(
        (o) => o.program_id === programId && synthPeriodForTimestamp(o.timestamp) === 'FY 2026 Q3'
      ).reduce((sum, o) => sum + o.amount, 0);
    const q3Planned = (programId: string) =>
      SYNTH_PPBE_PROGRAMS.find((p) => p.program_id === programId)!.obligation_plan.find(
        (e) => e.period === 'FY 2026 Q3'
      )!.planned_amount;
    const deviation = (programId: string) =>
      Math.abs((q3Actual(programId) - q3Planned(programId)) / q3Planned(programId)) * 100;

    expect(q3Actual('SYNTH-PRG-BRAVO')).toBeLessThan(q3Planned('SYNTH-PRG-BRAVO'));
    expect(deviation('SYNTH-PRG-BRAVO')).toBeGreaterThanOrEqual(10);
    expect(q3Actual('SYNTH-PRG-CHARLIE')).toBeGreaterThan(q3Planned('SYNTH-PRG-CHARLIE'));
    expect(deviation('SYNTH-PRG-CHARLIE')).toBeGreaterThanOrEqual(10);
    expect(deviation('SYNTH-PRG-ALPHA')).toBeLessThan(10);
    expect(deviation('SYNTH-PRG-DELTA')).toBeLessThan(10);
  });

  it('the learning loop: 15 of 22 findings feed planning; ECHO is the stalled program (3 of 4 not feeding)', () => {
    // 20 FY2026 findings + 2 FY2025 close-out findings (ALPHA and BRAVO, both feeds_planning_cycle: true)
    expect(SYNTH_PPBE_FINDINGS).toHaveLength(22);
    expect(SYNTH_PPBE_FINDINGS.filter((f) => f.feeds_planning_cycle)).toHaveLength(15);
    const echo = SYNTH_PPBE_FINDINGS.filter((f) => f.program_id === 'SYNTH-PRG-ECHO');
    expect(echo).toHaveLength(4);
    expect(echo.filter((f) => !f.feeds_planning_cycle)).toHaveLength(3);
    // No OTHER program is stalled at the standard 50 percent threshold.
    for (const p of SYNTH_PPBE_PROGRAMS.filter((p) => p.program_id !== 'SYNTH-PRG-ECHO')) {
      const findings = SYNTH_PPBE_FINDINGS.filter((f) => f.program_id === p.program_id);
      const notFeeding = findings.filter((f) => !f.feeds_planning_cycle).length;
      expect(notFeeding / findings.length).toBeLessThan(0.5);
    }
  });
});

describe('dependency coverage (goal item 3) and the exhibit pair', () => {
  it('holds healthy, at-risk, and failed links, with the failed one on ECHO phase 4', () => {
    const byHealth = (h: string) => SYNTH_PPBE_DEPENDENCIES.filter((d) => d.health_status === h);
    expect(byHealth('healthy').length).toBeGreaterThanOrEqual(5);
    expect(byHealth('at-risk')).toHaveLength(1);
    const failed = byHealth('failed');
    expect(failed).toHaveLength(1);
    expect(failed[0].source_workflow).toBe('phase-4-formulation-SYNTH-PRG-ECHO');
  });

  it('one exhibit is certified/export-approved (the GD-20 invariant holds) and one is an uncertified draft', () => {
    const alpha = SYNTH_PPBE_EXHIBITS.find((e) => e.exhibit_id === 'SYNTH-EX-ALPHA')!;
    expect(alpha.certification_status).toBe('CERTIFIED');
    expect(alpha.export_status).toBe('APPROVED_FOR_EXPORT');
    const echo = SYNTH_PPBE_EXHIBITS.find((e) => e.exhibit_id === 'SYNTH-EX-ECHO')!;
    expect(echo.certification_status).toBe('UNCERTIFIED');
    expect(echo.export_status).toBe('NOT_EXPORTED');
  });
});

/**
 * PPBE entity validation tests — Session 31 (D1).
 * Six entities per D-P3, reaffirmed unchanged by D-P7 Option A (July 12, 2026).
 * Field-level schema per docs/18_PPBE_Workflow_Architecture.md §3.
 * Guards the frozen data-dictionary field names against accidental drift.
 */

import {
  validateStrategicObjective,
  type StrategicObjective,
} from '../src/entities/strategic-objective';
import { validateProgramRecord, type ProgramRecord } from '../src/entities/program-record';
import { validateBudgetExhibit, type BudgetExhibit } from '../src/entities/budget-exhibit';
import { validateObligationRecord, type ObligationRecord } from '../src/entities/obligation-record';
import {
  validateEvaluationFinding,
  type EvaluationFinding,
} from '../src/entities/evaluation-finding';
import { validateDependencyMap, type DependencyMap } from '../src/entities/dependency-map';

const objective: StrategicObjective = {
  objective_id: 'SO-2027-01',
  title: 'Modernize logistics data interchange',
  description: 'Convert strategy guidance into funded logistics modernization programs.',
  priority_rank: 1,
  fiscal_year_range: 'FY 2027-2031',
  source_workflow_step_id: 'flowpath-ppbe-phase1-elicitation-1',
  decision_record_id: 'DR-CNSL-0042',
  status: 'active',
};

describe('StrategicObjective', () => {
  it('accepts a valid objective', () =>
    expect(validateStrategicObjective(objective)).toEqual({ valid: true }));
  it('rejects a non-integer priority_rank', () =>
    expect(validateStrategicObjective({ ...objective, priority_rank: 1.5 }).valid).toBe(false));
  it('rejects a zero priority_rank', () =>
    expect(validateStrategicObjective({ ...objective, priority_rank: 0 }).valid).toBe(false));
  it('rejects an unknown status', () =>
    expect(validateStrategicObjective({ ...objective, status: 'archived' }).valid).toBe(false));
  it('requires the COUNSEL decision_record_id (traceability)', () =>
    expect(validateStrategicObjective({ ...objective, decision_record_id: '' }).valid).toBe(false));
  it('requires the source_workflow_step_id Logger link', () => {
    const { source_workflow_step_id: _omitted, ...rest } = objective;
    expect(validateStrategicObjective(rest).valid).toBe(false);
  });
});

const programRecord: ProgramRecord = {
  program_id: 'PRG-001',
  name: 'Logistics Data Interchange',
  sponsor: 'PEO Logistics',
  contract_number: 'W91-26-C-0001',
  classification_level: 'UNCLASSIFIED',
  status: 'ACTIVE',
  objective_id: 'SO-2027-01',
  fiscal_year: 'FY 2027',
  lifecycle_cost_estimate: 12500000,
  obligation_plan: [
    { period: 'FY 2027 Q1', planned_amount: 1500000 },
    { period: 'FY 2027 Q2', planned_amount: 2000000 },
  ],
  performance_baseline: [
    { metric: 'on-time milestone completion', baseline_value: '92 percent' },
  ],
};

describe('ProgramRecord (extends Program)', () => {
  it('accepts a valid program record', () =>
    expect(validateProgramRecord(programRecord)).toEqual({ valid: true }));
  it('enforces the base Program validation (extension, not redefinition)', () =>
    expect(validateProgramRecord({ ...programRecord, classification_level: 'NATO' }).valid).toBe(
      false
    ));
  it('requires the objective_id traceability link', () =>
    expect(validateProgramRecord({ ...programRecord, objective_id: '' }).valid).toBe(false));
  it('rejects a negative planned_amount in the obligation plan', () =>
    expect(
      validateProgramRecord({
        ...programRecord,
        obligation_plan: [{ period: 'FY 2027 Q1', planned_amount: -5 }],
      }).valid
    ).toBe(false));
  it('rejects a baseline entry with an empty metric', () =>
    expect(
      validateProgramRecord({
        ...programRecord,
        performance_baseline: [{ metric: '', baseline_value: '92 percent' }],
      }).valid
    ).toBe(false));
});

const exhibit: BudgetExhibit = {
  exhibit_id: 'BE-2027-001',
  program_id: 'PRG-001',
  fiscal_year: 'FY 2027',
  narrative_content: 'This exhibit requests continued funding for the logistics data program.',
  source_data_lineage: ['ppbe-obligation-OB-1', 'ppbe-evaluation-EF-1'],
  certification_status: 'UNCERTIFIED',
  export_status: 'NOT_EXPORTED',
};

describe('BudgetExhibit', () => {
  it('accepts a valid unexported exhibit', () =>
    expect(validateBudgetExhibit(exhibit)).toEqual({ valid: true }));
  it('accepts a certified, exported exhibit', () =>
    expect(
      validateBudgetExhibit({
        ...exhibit,
        certification_status: 'CERTIFIED',
        export_status: 'EXPORTED',
      })
    ).toEqual({ valid: true }));
  it('blocks export without CLEAR certification (GD-20 gate invariant)', () =>
    expect(
      validateBudgetExhibit({ ...exhibit, export_status: 'APPROVED_FOR_EXPORT' }).valid
    ).toBe(false));
  it('blocks export of a FLAGGED exhibit', () =>
    expect(
      validateBudgetExhibit({
        ...exhibit,
        certification_status: 'FLAGGED',
        export_status: 'EXPORTED',
      }).valid
    ).toBe(false));
  it('rejects an empty lineage reference', () =>
    expect(validateBudgetExhibit({ ...exhibit, source_data_lineage: [''] }).valid).toBe(false));
});

const obligation: ObligationRecord = {
  obligation_id: 'OB-2027-0001',
  program_id: 'PRG-001',
  cost_code: 'CC-1',
  amount: 250000,
  timestamp: '2026-07-12T15:30:00Z',
  authorizing_official: 'Jane Smith',
  workflow_step_id: 'ppbe-obligation-OB-2027-0001',
};

describe('ObligationRecord', () => {
  it('accepts a valid obligation', () =>
    expect(validateObligationRecord(obligation)).toEqual({ valid: true }));
  it('rejects a zero amount', () =>
    expect(validateObligationRecord({ ...obligation, amount: 0 }).valid).toBe(false));
  it('requires the authorizing official (VIGIL Tier C)', () =>
    expect(validateObligationRecord({ ...obligation, authorizing_official: '' }).valid).toBe(
      false
    ));
  it('requires workflow_step_id (Constraint #6)', () => {
    const { workflow_step_id: _omitted, ...rest } = obligation;
    expect(validateObligationRecord(rest).valid).toBe(false);
  });
});

const finding: EvaluationFinding = {
  finding_id: 'EF-2027-001',
  program_id: 'PRG-001',
  objective_id: 'SO-2027-01',
  finding_type: 'variance',
  narrative:
    'Obligation rate is 12 percent below plan for the second consecutive quarter.',
  feeds_planning_cycle: true,
  workflow_step_id: 'ppbe-evaluation-EF-2027-001',
};

describe('EvaluationFinding', () => {
  it('accepts a valid finding', () =>
    expect(validateEvaluationFinding(finding)).toEqual({ valid: true }));
  it('accepts each spec-frozen finding_type', () => {
    for (const finding_type of ['on-track', 'variance', 'contradicts-assumption'] as const) {
      expect(validateEvaluationFinding({ ...finding, finding_type })).toEqual({ valid: true });
    }
  });
  it('rejects an unknown finding_type', () =>
    expect(validateEvaluationFinding({ ...finding, finding_type: 'CRITICAL' }).valid).toBe(false));
  it('requires the objective_id feedback-loop link', () =>
    expect(validateEvaluationFinding({ ...finding, objective_id: '' }).valid).toBe(false));
  it('requires feeds_planning_cycle to be a boolean (measured, not assumed)', () =>
    expect(validateEvaluationFinding({ ...finding, feeds_planning_cycle: 'yes' }).valid).toBe(
      false
    ));
});

const dependency: DependencyMap = {
  dependency_id: 'DEP-P2-P3-01',
  source_workflow: 'ppbe-phase-2-planning',
  target_workflow: 'ppbe-phase-3-programming',
  handoff_standard: 'Evidence base delivered with all capability gap assessments attached.',
  timing_requirement: 'within 5 business days of phase close',
  health_status: 'healthy',
};

describe('DependencyMap', () => {
  it('accepts a valid dependency', () =>
    expect(validateDependencyMap(dependency)).toEqual({ valid: true }));
  it('accepts each spec-frozen health_status', () => {
    for (const health_status of ['healthy', 'at-risk', 'failed'] as const) {
      expect(validateDependencyMap({ ...dependency, health_status })).toEqual({ valid: true });
    }
  });
  it('rejects an unknown health_status', () =>
    expect(validateDependencyMap({ ...dependency, health_status: 'DEGRADED' }).valid).toBe(false));
  it('rejects a self-referential dependency', () =>
    expect(
      validateDependencyMap({ ...dependency, target_workflow: dependency.source_workflow }).valid
    ).toBe(false));
});

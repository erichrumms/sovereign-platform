/**
 * Canonical entity validation smoke tests.
 * Happy path + one representative failure per entity. Guards the frozen
 * data-dictionary field names against accidental drift.
 */

import { validateEmployee, type Employee } from '../src/entities/employee';
import { validateProgram, type Program } from '../src/entities/program';
import { validateCostCode, type CostCode } from '../src/entities/cost-code';
import { validateDocument, type Document } from '../src/entities/document';
import { validateVendor, type Vendor } from '../src/entities/vendor';

describe('Employee', () => {
  const e: Employee = {
    employee_id: 'emp-1',
    name: 'Jane Roe',
    org_unit: 'OPS',
    role: 'PROGRAM_MANAGER',
    clearance_level: 'CUI',
    cost_code_assignments: ['CC-1'],
  };
  it('accepts a valid employee', () => expect(validateEmployee(e)).toEqual({ valid: true }));
  it('rejects an unknown role', () => {
    const r = validateEmployee({ ...e, role: 'CHIEF' });
    expect(r.valid).toBe(false);
  });
  it('accepts the GD-5 PLATFORM_ADMIN role', () =>
    expect(validateEmployee({ ...e, role: 'PLATFORM_ADMIN' })).toEqual({ valid: true }));
});

describe('Program', () => {
  const p: Program = {
    program_id: 'prog-1',
    name: 'Atlas',
    sponsor: 'DOE',
    contract_number: 'C-100',
    classification_level: 'UNCLASSIFIED',
    status: 'active',
  };
  it('accepts a valid program', () => expect(validateProgram(p)).toEqual({ valid: true }));
  it('rejects a bad classification_level', () =>
    expect(validateProgram({ ...p, classification_level: 'OPEN' }).valid).toBe(false));
});

describe('CostCode', () => {
  const c: CostCode = {
    cost_code: 'CC-1',
    program_id: 'prog-1',
    labor_category: 'Engineer',
    fiscal_year: 2026,
    ceiling: 500000,
  };
  it('accepts a valid cost code', () => expect(validateCostCode(c)).toEqual({ valid: true }));
  it('rejects a non-integer fiscal_year', () =>
    expect(validateCostCode({ ...c, fiscal_year: 2026.5 }).valid).toBe(false));
});

describe('Document', () => {
  const d: Document = {
    document_id: 'doc-1',
    title: 'Plan',
    classification_level: 'SECRET',
    version: '1.0',
    created_by: 'emp-1',
    program_id: 'prog-1',
    created_at: '2026-06-13T00:00:00.000Z',
  };
  it('accepts a valid document', () => expect(validateDocument(d)).toEqual({ valid: true }));
  it('rejects a missing created_at', () => {
    const { created_at, ...rest } = d;
    expect(validateDocument(rest).valid).toBe(false);
  });
});

describe('Vendor', () => {
  const v: Vendor = {
    vendor_id: 'ven-1',
    name: 'Acme',
    cage_code: '1A2B3',
    jurisdiction: 'US',
    cleared_status: true,
    active_contracts: ['C-100'],
  };
  it('accepts a valid vendor', () => expect(validateVendor(v)).toEqual({ valid: true }));
  it('rejects non-boolean cleared_status', () =>
    expect(validateVendor({ ...v, cleared_status: 'yes' }).valid).toBe(false));
});

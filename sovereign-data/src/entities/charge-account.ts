/**
 * Charge Account — Canonical Entity (Time & Travel workflow layer)
 * Canonical identifier: cost_code  ·  Data classification: program
 *
 * Approved D-TT3 (June 29, 2026); reaffirmed unchanged D-TT7 Option A (July 11, 2026).
 * ChargeAccount EXTENDS the existing CostCode entity — it is not a standalone
 * entity (Session 27 opening directive; Standing Constraint #2, no divergent
 * duplicate). The base CostCode fields are unchanged; the extension adds the
 * timekeeping-authorization fields tt.time-compliance-engine evaluates against
 * (docs/17 §4 Time & Expense Policy Elicitation, §6.1 rule categories:
 * unauthorized charge account, budget exhaustion, direct/indirect mismatch).
 *
 * Field names are frozen by the SOVEREIGN data dictionary.
 */

import type { ValidationResult } from '../shared-types';
import type { CostCode } from './cost-code';
import { validateCostCode } from './cost-code';

/** Whether charges to this account are direct or indirect (docs/17 §6.1 mismatch rule). */
export type ChargeAccountType = 'DIRECT' | 'INDIRECT';

export interface ChargeAccount extends CostCode {
  account_type: ChargeAccountType;
  /** SovereignRole values authorized to charge this account (docs/17 §4: per-role lists). */
  authorized_roles: string[];
  /** Remaining budget in whole currency units; 0 triggers the budget-exhaustion rule. */
  budget_remaining: number;
  /** Inactive accounts reject new charges via the unauthorized-charge-account rule. */
  active: boolean;
}

const CHARGE_ACCOUNT_TYPES: readonly ChargeAccountType[] = ['DIRECT', 'INDIRECT'];

export function validateChargeAccount(account: unknown): ValidationResult {
  // Base CostCode validation first — ChargeAccount is an extension, not a redefinition.
  const base = validateCostCode(account);
  const errors: string[] = base.valid ? [] : [...base.errors];
  const a = account as Partial<ChargeAccount>;

  if (!CHARGE_ACCOUNT_TYPES.includes(a.account_type as ChargeAccountType)) {
    errors.push(`account_type: must be one of ${CHARGE_ACCOUNT_TYPES.join(', ')}`);
  }
  if (
    !Array.isArray(a.authorized_roles) ||
    a.authorized_roles.some((r) => typeof r !== 'string' || r.trim() === '')
  ) {
    errors.push('authorized_roles: must be an array of non-empty strings');
  }
  if (typeof a.budget_remaining !== 'number' || a.budget_remaining < 0) {
    errors.push('budget_remaining: must be a non-negative number');
  }
  if (
    typeof a.budget_remaining === 'number' &&
    typeof a.ceiling === 'number' &&
    a.budget_remaining > a.ceiling
  ) {
    errors.push('budget_remaining: must not exceed ceiling');
  }
  if (typeof a.active !== 'boolean') {
    errors.push('active: must be a boolean');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

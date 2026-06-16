/**
 * Vendor — Canonical Entity
 * Canonical identifier: vendor_id  ·  Data classification: program
 *
 * Field names are frozen by the SOVEREIGN data dictionary.
 */

import type { ValidationResult } from '../shared-types';

export interface Vendor {
  vendor_id: string;
  name: string;
  /** Commercial and Government Entity (CAGE) code. */
  cage_code: string;
  /** Country / jurisdiction of incorporation — drives "no non-U.S. controlled" checks. */
  jurisdiction: string;
  /** Whether the vendor holds the required facility/personnel clearance. */
  cleared_status: boolean;
  /** Active contract identifiers (contract_number values). */
  active_contracts: string[];
}

export function validateVendor(vendor: unknown): ValidationResult {
  const errors: string[] = [];
  const v = vendor as Partial<Vendor>;

  if (typeof v.vendor_id !== 'string' || v.vendor_id.trim() === '') {
    errors.push('vendor_id: required string');
  }
  if (typeof v.name !== 'string' || v.name.trim() === '') {
    errors.push('name: required string');
  }
  if (typeof v.cage_code !== 'string' || v.cage_code.trim() === '') {
    errors.push('cage_code: required string');
  }
  if (typeof v.jurisdiction !== 'string' || v.jurisdiction.trim() === '') {
    errors.push('jurisdiction: required string');
  }
  if (typeof v.cleared_status !== 'boolean') {
    errors.push('cleared_status: must be boolean');
  }
  if (!Array.isArray(v.active_contracts) ||
      !v.active_contracts.every((c) => typeof c === 'string')) {
    errors.push('active_contracts: must be string[]');
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

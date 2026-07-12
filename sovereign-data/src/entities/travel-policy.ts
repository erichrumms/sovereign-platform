/**
 * Travel Policy — Canonical Entity (Time & Travel workflow layer)
 * Canonical identifier: policy_id  ·  Data classification: program
 *
 * Approved D-TT3 (June 29, 2026); reaffirmed unchanged D-TT7 Option A (July 11, 2026).
 * Field-level schema derived from docs/17_TimeAndTravel_Architecture.md §4
 * (Travel Policy Elicitation) — hard exception rules, cost-based routing
 * thresholds, and soft flags. Produced by a FLOWPATH elicitation session;
 * loaded by tt.travel-compliance-engine at startup.
 *
 * Field names are frozen by the SOVEREIGN data dictionary.
 */

import type { ValidationResult } from '../shared-types';

/** Hard exception rules — override cost-based routing regardless of dollar amount (docs/17 §4). */
export interface TravelHardExceptionRules {
  /** Personal day inclusion escalates the request. */
  personal_day_escalates: boolean;
  /** International destination escalates the request. */
  international_escalates: boolean;
  /** Special authority travel categories that escalate (empty = none defined). */
  special_authority_categories: string[];
}

/** Cost-based routing thresholds per authority level, in whole currency units (docs/17 §4). */
export interface TravelRoutingThresholds {
  /** Requests at or below this total route to manager-level approval. */
  manager_threshold: number;
  /** Requests at or below this total route to director-level approval. */
  director_threshold: number;
  /** Requests at or below this total route to executive-level approval. */
  executive_threshold: number;
}

/** Soft flags — require awareness but do not escalate authority (docs/17 §4). */
export interface TravelSoftFlags {
  /** Advance booking days at/above which a request is standard (docs/17 §5.2: 14). */
  advance_booking_standard_days: number;
  /** Advance booking days below which the short-notice flag activates (docs/17 §5.2: 7). */
  advance_booking_short_notice_days: number;
  /** Advance booking hours below which escalation analysis intensifies (docs/17 §5.2: 48). */
  advance_booking_critical_hours: number;
  /** Conference or training fee amount at/above which a soft flag raises. */
  conference_fee_threshold: number;
  /** Budget proximity percentage (0–100) at/above which a soft flag raises. */
  budget_proximity_percent: number;
}

export interface TravelPolicy {
  policy_id: string;
  /** ISO 8601 date this policy version takes effect. */
  effective_date: string;
  /** FLOWPATH elicitation session that produced this policy version. */
  flowpath_session_id: string;
  hard_exceptions: TravelHardExceptionRules;
  routing_thresholds: TravelRoutingThresholds;
  soft_flags: TravelSoftFlags;
}

export function validateTravelPolicy(policy: unknown): ValidationResult {
  const errors: string[] = [];
  const p = policy as Partial<TravelPolicy>;

  if (typeof p.policy_id !== 'string' || p.policy_id.trim() === '') {
    errors.push('policy_id: required string');
  }
  if (typeof p.effective_date !== 'string' || p.effective_date.trim() === '') {
    errors.push('effective_date: required ISO 8601 date string');
  }
  if (typeof p.flowpath_session_id !== 'string' || p.flowpath_session_id.trim() === '') {
    errors.push('flowpath_session_id: required string');
  }

  const h = p.hard_exceptions as Partial<TravelHardExceptionRules> | undefined;
  if (!h || typeof h !== 'object') {
    errors.push('hard_exceptions: required object');
  } else {
    if (typeof h.personal_day_escalates !== 'boolean') {
      errors.push('hard_exceptions.personal_day_escalates: must be a boolean');
    }
    if (typeof h.international_escalates !== 'boolean') {
      errors.push('hard_exceptions.international_escalates: must be a boolean');
    }
    if (
      !Array.isArray(h.special_authority_categories) ||
      h.special_authority_categories.some((c) => typeof c !== 'string' || c.trim() === '')
    ) {
      errors.push('hard_exceptions.special_authority_categories: must be an array of non-empty strings');
    }
  }

  const r = p.routing_thresholds as Partial<TravelRoutingThresholds> | undefined;
  if (!r || typeof r !== 'object') {
    errors.push('routing_thresholds: required object');
  } else {
    for (const key of ['manager_threshold', 'director_threshold', 'executive_threshold'] as const) {
      if (typeof r[key] !== 'number' || (r[key] as number) < 0) {
        errors.push(`routing_thresholds.${key}: must be a non-negative number`);
      }
    }
    if (
      typeof r.manager_threshold === 'number' &&
      typeof r.director_threshold === 'number' &&
      typeof r.executive_threshold === 'number' &&
      !(r.manager_threshold <= r.director_threshold && r.director_threshold <= r.executive_threshold)
    ) {
      errors.push('routing_thresholds: must be ascending (manager <= director <= executive)');
    }
  }

  const s = p.soft_flags as Partial<TravelSoftFlags> | undefined;
  if (!s || typeof s !== 'object') {
    errors.push('soft_flags: required object');
  } else {
    for (const key of [
      'advance_booking_standard_days',
      'advance_booking_short_notice_days',
      'advance_booking_critical_hours',
      'conference_fee_threshold',
    ] as const) {
      if (typeof s[key] !== 'number' || (s[key] as number) < 0) {
        errors.push(`soft_flags.${key}: must be a non-negative number`);
      }
    }
    if (
      typeof s.budget_proximity_percent !== 'number' ||
      s.budget_proximity_percent < 0 ||
      s.budget_proximity_percent > 100
    ) {
      errors.push('soft_flags.budget_proximity_percent: must be a number between 0 and 100');
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

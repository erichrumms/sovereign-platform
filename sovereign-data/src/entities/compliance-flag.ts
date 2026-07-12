/**
 * Compliance Flag — Canonical Entity (Time & Travel workflow layer)
 * Canonical identifier: flag_id  ·  Data classification: program
 *
 * Approved D-TT3 (June 29, 2026); reaffirmed unchanged D-TT7 Option A (July 11, 2026).
 * Field-level schema derived from docs/17_TimeAndTravel_Architecture.md §6.1
 * (ten rule categories, three severity levels) and §5.3 (travel compliance
 * findings cite the exact rule triggered, the actual value, and the threshold
 * exceeded). One entity serves both tools: source distinguishes travel findings
 * from time findings.
 *
 * Severity is DETERMINED BY the rule category for time flags (docs/17 §6.1
 * table) — the validator enforces that mapping so a flag can never carry a
 * severity its rule doesn't authorize.
 *
 * Field names are frozen by the SOVEREIGN data dictionary.
 */

import type { ValidationResult } from '../shared-types';

/** Which Time & Travel tool raised the flag. */
export type ComplianceFlagSource = 'TRAVEL' | 'TIME';

/** The ten time & expense rule categories (docs/17 §6.1). */
export type TimeRuleCategory =
  | 'UNAUTHORIZED_CHARGE_ACCOUNT'
  | 'BUDGET_EXHAUSTION'
  | 'DIRECT_INDIRECT_MISMATCH'
  | 'OVERTIME_THRESHOLD'
  | 'HOLIDAY_DIRECT_CHARGE'
  | 'MISSING_HOURS'
  | 'JUSTIFICATION_ABSENCE'
  | 'OFF_SCHEDULE_SUBMISSION'
  | 'PERIOD_HOUR_MINIMUM'
  | 'PATTERN_DRIFT';

/** Travel compliance finding bases (docs/17 §4, §5.3). */
export type TravelRuleCategory =
  | 'TRAVEL_HARD_EXCEPTION'
  | 'TRAVEL_ROUTING_THRESHOLD'
  | 'TRAVEL_SOFT_FLAG';

export type ComplianceRuleCategory = TimeRuleCategory | TravelRuleCategory;

/** Three severity levels (docs/17 §6.1). */
export type ComplianceFlagSeverity = 'ERROR' | 'WARNING' | 'INFORMATIONAL';

export type ComplianceFlagStatus = 'OPEN' | 'RESOLVED' | 'ESCALATED';

/**
 * docs/17 §6.1 — the frozen severity each time rule category carries.
 * Exported so tt.time-compliance-engine and the validator share one mapping
 * (Standing Constraint #2 — no divergent duplicate).
 */
export const TIME_RULE_SEVERITY: Readonly<Record<TimeRuleCategory, ComplianceFlagSeverity>> = {
  UNAUTHORIZED_CHARGE_ACCOUNT: 'ERROR',
  BUDGET_EXHAUSTION: 'ERROR',
  DIRECT_INDIRECT_MISMATCH: 'ERROR',
  OVERTIME_THRESHOLD: 'WARNING',
  HOLIDAY_DIRECT_CHARGE: 'WARNING',
  MISSING_HOURS: 'WARNING',
  JUSTIFICATION_ABSENCE: 'WARNING',
  OFF_SCHEDULE_SUBMISSION: 'WARNING',
  PERIOD_HOUR_MINIMUM: 'WARNING',
  PATTERN_DRIFT: 'INFORMATIONAL',
};

const TRAVEL_RULE_CATEGORIES: readonly TravelRuleCategory[] = [
  'TRAVEL_HARD_EXCEPTION',
  'TRAVEL_ROUTING_THRESHOLD',
  'TRAVEL_SOFT_FLAG',
];

const SEVERITIES: readonly ComplianceFlagSeverity[] = ['ERROR', 'WARNING', 'INFORMATIONAL'];
const STATUSES: readonly ComplianceFlagStatus[] = ['OPEN', 'RESOLVED', 'ESCALATED'];
const SOURCES: readonly ComplianceFlagSource[] = ['TRAVEL', 'TIME'];

export interface ComplianceFlag {
  flag_id: string;
  source: ComplianceFlagSource;
  /** TravelRequest.request_id (source TRAVEL) or TimeRecord.record_id (source TIME). */
  record_ref: string;
  employee_id: string;
  rule_category: ComplianceRuleCategory;
  severity: ComplianceFlagSeverity;
  /** The exact policy section or rule cited (docs/17: policy reference always cited). */
  rule_citation: string;
  /** The actual value observed, plain prose (e.g. "52 hours"). */
  actual_value: string;
  /** The threshold or requirement breached, plain prose (e.g. "40 hours per week"). */
  threshold_value: string;
  /** Occurrence count for this rule/employee in the rolling window (tt.escalation-monitor). */
  recurrence_count: number;
  /** ISO 8601 timestamp the flag was raised. */
  raised_at: string;
  status: ComplianceFlagStatus;
}

export function validateComplianceFlag(flag: unknown): ValidationResult {
  const errors: string[] = [];
  const f = flag as Partial<ComplianceFlag>;

  for (const key of ['flag_id', 'record_ref', 'employee_id', 'rule_citation', 'actual_value', 'threshold_value', 'raised_at'] as const) {
    if (typeof f[key] !== 'string' || (f[key] as string).trim() === '') {
      errors.push(`${key}: required string`);
    }
  }
  if (!SOURCES.includes(f.source as ComplianceFlagSource)) {
    errors.push(`source: must be one of ${SOURCES.join(', ')}`);
  }
  if (!SEVERITIES.includes(f.severity as ComplianceFlagSeverity)) {
    errors.push(`severity: must be one of ${SEVERITIES.join(', ')}`);
  }
  if (!STATUSES.includes(f.status as ComplianceFlagStatus)) {
    errors.push(`status: must be one of ${STATUSES.join(', ')}`);
  }
  if (typeof f.recurrence_count !== 'number' || !Number.isInteger(f.recurrence_count) || f.recurrence_count < 1) {
    errors.push('recurrence_count: must be an integer >= 1');
  }

  const timeCategories = Object.keys(TIME_RULE_SEVERITY) as TimeRuleCategory[];
  const isTimeCategory = timeCategories.includes(f.rule_category as TimeRuleCategory);
  const isTravelCategory = TRAVEL_RULE_CATEGORIES.includes(f.rule_category as TravelRuleCategory);

  if (!isTimeCategory && !isTravelCategory) {
    errors.push('rule_category: must be a documented time or travel rule category');
  } else if (f.source === 'TIME' && !isTimeCategory) {
    errors.push('rule_category: TIME flags must carry one of the ten time rule categories');
  } else if (f.source === 'TRAVEL' && !isTravelCategory) {
    errors.push('rule_category: TRAVEL flags must carry a travel rule category');
  } else if (
    isTimeCategory &&
    SEVERITIES.includes(f.severity as ComplianceFlagSeverity) &&
    TIME_RULE_SEVERITY[f.rule_category as TimeRuleCategory] !== f.severity
  ) {
    errors.push(
      `severity: ${f.rule_category} carries ${TIME_RULE_SEVERITY[f.rule_category as TimeRuleCategory]} per docs/17 §6.1`
    );
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

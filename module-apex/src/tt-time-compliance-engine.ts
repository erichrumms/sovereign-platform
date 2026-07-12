/**
 * SOVEREIGN Platform — module-apex
 * tt-time-compliance-engine.ts — Time & Travel workflow layer, Session 27 scaffold.
 *
 * tt.time-compliance-engine (Governance, deterministic — Agent Identity Standard,
 * D-TT5). Runs on NEXUS/APEX infrastructure per docs/17 §2 — no new module directory.
 *
 * Evaluates every employee time record against the ten rule categories (docs/17
 * §6.1), assigning the FROZEN severity each category carries (TIME_RULE_SEVERITY,
 * @sovereign/data). Same input always produces same output: NO LLM call, NO
 * sovereign-api-client, no wall-clock reads. The engine detects and flags only —
 * it never communicates to employees, modifies time records, or authorizes
 * corrections (docs/17 §1: the system prepares, the human decides).
 *
 * GOVERNANCE NOTE (Session 27 reconciliation, surfaced in handoff): docs/17 §4
 * calls for a "validated time and expense policy configuration committed to the
 * data dictionary", but D-TT3 approved exactly SIX entities — none of them a time
 * policy entity. TimeCompliancePolicyConfig below is therefore a MODULE-LEVEL
 * engine configuration type (loaded from a FLOWPATH elicitation output at startup),
 * NOT a canonical data-dictionary entity. Promoting it to an entity would be a new
 * governance decision — not taken here.
 */

import {
  TIME_RULE_SEVERITY,
  type TimeRecord,
  type TimeRecordEntry,
  type ChargeAccount,
  type ComplianceFlag,
  type TimeRuleCategory,
} from "@sovereign/data";

export const TT_TIME_COMPLIANCE_ENGINE_AGENT_ID = "tt.time-compliance-engine";

/** FLOWPATH-elicited engine configuration (docs/17 §4 Time & Expense Policy Elicitation). */
export interface TimeCompliancePolicyConfig {
  /** Daily hours above which the overtime rule triggers. */
  overtime_daily_hours: number;
  /** Weekly (7-day bucket from period_start) hours above which the overtime rule triggers. */
  overtime_weekly_hours: number;
  /** Minimum total hours a full period must carry. */
  period_hour_minimum: number;
  /** Days past period_end after which submission is off-schedule. */
  submission_grace_days: number;
  /** Daily hours at/above which a justification narrative is required. */
  justification_required_above_daily_hours: number;
}

/** Prior recurrence counts per employee+rule, maintained by tt.escalation-monitor. */
export type RecurrenceLookup = (employee_id: string, rule: TimeRuleCategory) => number;

const NO_PRIOR: RecurrenceLookup = () => 0;
const MS_PER_DAY = 86_400_000;

let flagSequence = 0;

function timeFlag(
  record: TimeRecord,
  rule: TimeRuleCategory,
  rule_citation: string,
  actual_value: string,
  threshold_value: string,
  priorRecurrence: RecurrenceLookup
): ComplianceFlag {
  flagSequence += 1;
  return {
    flag_id: `${record.record_id}-F${flagSequence}`,
    source: "TIME",
    record_ref: record.record_id,
    employee_id: record.employee_id,
    rule_category: rule,
    severity: TIME_RULE_SEVERITY[rule],
    rule_citation,
    actual_value,
    threshold_value,
    recurrence_count: priorRecurrence(record.employee_id, rule) + 1,
    raised_at: record.submitted_at ?? record.period_end,
    status: "OPEN",
  };
}

/** Sum entry hours grouped by a key function. */
function sumBy(entries: TimeRecordEntry[], key: (e: TimeRecordEntry) => string): Map<string, number> {
  const totals = new Map<string, number>();
  for (const e of entries) {
    const k = key(e);
    totals.set(k, (totals.get(k) ?? 0) + e.hours);
  }
  return totals;
}

/**
 * Evaluate one time record period against the active configuration and charge
 * accounts. Returns every flag raised, each carrying its frozen severity and the
 * recurrence count supplied by the escalation-monitor lookup. PATTERN_DRIFT is
 * NOT evaluated here — that is tt.pattern-analyst's analysis layer (docs/17 §6.3);
 * its informational flags are produced there and merged downstream.
 */
export function evaluateTimeRecord(
  record: TimeRecord,
  accounts: ChargeAccount[],
  employeeRole: string,
  config: TimeCompliancePolicyConfig,
  priorRecurrence: RecurrenceLookup = NO_PRIOR
): ComplianceFlag[] {
  flagSequence = 0;
  const flags: ComplianceFlag[] = [];
  const byCode = new Map(accounts.map((a) => [a.cost_code, a]));

  for (const entry of record.entries) {
    const account = byCode.get(entry.cost_code);

    // 1. Unauthorized charge account — unknown, inactive, or role not authorized.
    if (!account || !account.active || !account.authorized_roles.includes(employeeRole)) {
      const reason = !account ? "unknown account" : !account.active ? "inactive account" : `role ${employeeRole} not authorized`;
      flags.push(
        timeFlag(record, "UNAUTHORIZED_CHARGE_ACCOUNT",
          "Timekeeping policy — authorized charge account lists per employee role",
          `${entry.entry_date} ${entry.cost_code}: ${reason}`,
          "charges accepted only to active, role-authorized accounts", priorRecurrence)
      );
      continue; // remaining account-dependent rules need a resolvable account
    }

    // 2. Budget exhaustion — account at zero remaining budget.
    if (account.budget_remaining === 0) {
      flags.push(
        timeFlag(record, "BUDGET_EXHAUSTION",
          "Timekeeping policy — budget exhaustion",
          `${entry.entry_date} ${entry.cost_code}: budget_remaining 0`,
          "charge accounts must hold remaining budget", priorRecurrence)
      );
    }

    // 3. Direct/indirect mismatch.
    if (entry.charge_type !== account.account_type) {
      flags.push(
        timeFlag(record, "DIRECT_INDIRECT_MISMATCH",
          "Timekeeping policy — direct/indirect charge alignment",
          `${entry.entry_date} ${entry.cost_code}: charged ${entry.charge_type}`,
          `account is ${account.account_type}`, priorRecurrence)
      );
    }

    // 5. Holiday direct charge.
    if (entry.holiday && entry.charge_type === "DIRECT") {
      flags.push(
        timeFlag(record, "HOLIDAY_DIRECT_CHARGE",
          "Timekeeping policy — holiday direct charge definition",
          `${entry.entry_date} ${entry.cost_code}: ${entry.hours}h direct on a holiday`,
          "holiday direct charges require clarification", priorRecurrence)
      );
    }
  }

  // 4. Overtime — daily, then weekly (7-day buckets from period_start).
  const daily = sumBy(record.entries, (e) => e.entry_date);
  for (const [date, hours] of daily) {
    if (hours > config.overtime_daily_hours) {
      flags.push(
        timeFlag(record, "OVERTIME_THRESHOLD",
          "Timekeeping policy — daily overtime threshold",
          `${date}: ${hours} hours`, `${config.overtime_daily_hours} hours per day`, priorRecurrence)
      );
    }
  }
  const periodStartMs = Date.parse(record.period_start);
  const weekly = sumBy(record.entries, (e) => {
    const week = Math.floor((Date.parse(e.entry_date) - periodStartMs) / (7 * MS_PER_DAY));
    return `week ${week + 1}`;
  });
  for (const [week, hours] of weekly) {
    if (hours > config.overtime_weekly_hours) {
      flags.push(
        timeFlag(record, "OVERTIME_THRESHOLD",
          "Timekeeping policy — weekly overtime threshold",
          `${week}: ${hours} hours`, `${config.overtime_weekly_hours} hours per week`, priorRecurrence)
      );
    }
  }

  // 7. Justification absence — high-hour or holiday-direct entries lacking narrative.
  for (const entry of record.entries) {
    const requiresJustification =
      entry.hours >= config.justification_required_above_daily_hours ||
      (entry.holiday && entry.charge_type === "DIRECT");
    if (requiresJustification && (entry.justification === undefined || entry.justification.trim() === "")) {
      flags.push(
        timeFlag(record, "JUSTIFICATION_ABSENCE",
          "Timekeeping policy — justification requirements",
          `${entry.entry_date} ${entry.cost_code}: ${entry.hours}h without justification`,
          "justification narrative required for this charge", priorRecurrence)
      );
    }
  }

  // 6. Missing hours — a weekday inside the period with zero recorded hours.
  const periodEndMs = Date.parse(record.period_end);
  for (let ms = periodStartMs; ms <= periodEndMs; ms += MS_PER_DAY) {
    const d = new Date(ms);
    const dow = d.getUTCDay();
    if (dow === 0 || dow === 6) continue; // weekend
    const iso = d.toISOString().slice(0, 10);
    if (!daily.has(iso)) {
      flags.push(
        timeFlag(record, "MISSING_HOURS",
          "Timekeeping policy — complete daily recording",
          `${iso}: no hours recorded`, "every scheduled workday requires recorded hours", priorRecurrence)
      );
    }
  }

  // 8. Off-schedule submission — submitted beyond the grace window after period end.
  if (record.submitted_at !== undefined) {
    const submittedMs = Date.parse(record.submitted_at);
    const deadline = periodEndMs + config.submission_grace_days * MS_PER_DAY;
    if (submittedMs > deadline) {
      const daysLate = Math.ceil((submittedMs - deadline) / MS_PER_DAY);
      flags.push(
        timeFlag(record, "OFF_SCHEDULE_SUBMISSION",
          "Timekeeping policy — submission schedule",
          `submitted ${daysLate} day(s) past the grace window`,
          `within ${config.submission_grace_days} day(s) of period end`, priorRecurrence)
      );
    }
  }

  // 9. Period hour minimum.
  if (record.total_hours < config.period_hour_minimum) {
    flags.push(
      timeFlag(record, "PERIOD_HOUR_MINIMUM",
        "Timekeeping policy — period hour minimum per employment classification",
        `total_hours: ${record.total_hours}`, `minimum: ${config.period_hour_minimum}`, priorRecurrence)
    );
  }

  return flags;
}

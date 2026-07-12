/**
 * Time & Travel — time compliance engine, pattern analyst, audit reporter tests
 * (Session 27 scaffold). docs/17 §6.1 (ten rules, frozen severities), §6.3
 * (informational-only pattern analysis, hashed employee IDs), audit exports.
 */
import {
  evaluateTimeRecord,
  TT_TIME_COMPLIANCE_ENGINE_AGENT_ID,
  type TimeCompliancePolicyConfig,
} from "../src/tt-time-compliance-engine";
import {
  computeIndividualBaseline,
  computePeerBaseline,
  detectPatternDrift,
  hashEmployeeId,
  TT_PATTERN_ANALYST_AGENT_ID,
} from "../src/tt-pattern-analyst";
import {
  buildTravelSessionExport,
  buildTimePeriodExport,
  TT_AUDIT_REPORTER_AGENT_ID,
} from "../src/tt-audit-reporter";
import type { ChargeAccount, ComplianceFlag, TimeRecord, TravelRequest } from "@sovereign/data";

const config: TimeCompliancePolicyConfig = {
  overtime_daily_hours: 10,
  overtime_weekly_hours: 45,
  period_hour_minimum: 40,
  submission_grace_days: 2,
  justification_required_above_daily_hours: 10,
};

const accounts: ChargeAccount[] = [
  {
    cost_code: "CC-DIR",
    program_id: "prog-1",
    labor_category: "Engineer",
    fiscal_year: 2026,
    ceiling: 500000,
    account_type: "DIRECT",
    authorized_roles: ["ANALYST"],
    budget_remaining: 100000,
    active: true,
  },
  {
    cost_code: "CC-IND",
    program_id: "prog-1",
    labor_category: "Overhead",
    fiscal_year: 2026,
    ceiling: 100000,
    account_type: "INDIRECT",
    authorized_roles: ["ANALYST"],
    budget_remaining: 0,
    active: true,
  },
];

/** A clean one-week record: 8h direct Mon–Fri (Jul 6–10, 2026), 40h total. */
function cleanRecord(): TimeRecord {
  const days = ["2026-07-06", "2026-07-07", "2026-07-08", "2026-07-09", "2026-07-10"];
  return {
    record_id: "TRC-1",
    employee_id: "emp-1",
    period_start: "2026-07-06",
    period_end: "2026-07-10",
    entries: days.map((entry_date) => ({
      entry_date,
      cost_code: "CC-DIR",
      hours: 8,
      charge_type: "DIRECT" as const,
      holiday: false,
    })),
    total_hours: 40,
    submitted_at: "2026-07-10T18:00:00Z",
  };
}

describe("tt.time-compliance-engine", () => {
  it("exports the registered agent id", () =>
    expect(TT_TIME_COMPLIANCE_ENGINE_AGENT_ID).toBe("tt.time-compliance-engine"));

  it("raises no flags for a clean record", () =>
    expect(evaluateTimeRecord(cleanRecord(), accounts, "ANALYST", config)).toEqual([]));

  it("is deterministic — same input, same output", () => {
    const a = evaluateTimeRecord(cleanRecord(), accounts, "ANALYST", config);
    const b = evaluateTimeRecord(cleanRecord(), accounts, "ANALYST", config);
    expect(a).toEqual(b);
  });

  it("flags an unauthorized charge account as ERROR (unknown account)", () => {
    const r = cleanRecord();
    r.entries[0] = { ...r.entries[0], cost_code: "CC-NOPE" };
    const flags = evaluateTimeRecord(r, accounts, "ANALYST", config);
    const f = flags.find((x) => x.rule_category === "UNAUTHORIZED_CHARGE_ACCOUNT");
    expect(f?.severity).toBe("ERROR");
  });

  it("flags a role not authorized for the account", () => {
    const flags = evaluateTimeRecord(cleanRecord(), accounts, "PROGRAM_MANAGER", config);
    expect(flags.some((x) => x.rule_category === "UNAUTHORIZED_CHARGE_ACCOUNT")).toBe(true);
  });

  it("flags budget exhaustion as ERROR on a zero-budget account", () => {
    const r = cleanRecord();
    r.entries[0] = { ...r.entries[0], cost_code: "CC-IND", charge_type: "INDIRECT" };
    const flags = evaluateTimeRecord(r, accounts, "ANALYST", config);
    const f = flags.find((x) => x.rule_category === "BUDGET_EXHAUSTION");
    expect(f?.severity).toBe("ERROR");
  });

  it("flags a direct/indirect mismatch as ERROR", () => {
    const r = cleanRecord();
    r.entries[0] = { ...r.entries[0], charge_type: "INDIRECT" };
    const flags = evaluateTimeRecord(r, accounts, "ANALYST", config);
    const f = flags.find((x) => x.rule_category === "DIRECT_INDIRECT_MISMATCH");
    expect(f?.severity).toBe("ERROR");
  });

  it("flags daily overtime as WARNING and requires justification above the bar", () => {
    const r = cleanRecord();
    r.entries[0] = { ...r.entries[0], hours: 12 };
    r.total_hours = 44;
    const flags = evaluateTimeRecord(r, accounts, "ANALYST", config);
    expect(flags.find((x) => x.rule_category === "OVERTIME_THRESHOLD")?.severity).toBe("WARNING");
    expect(flags.some((x) => x.rule_category === "JUSTIFICATION_ABSENCE")).toBe(true);
  });

  it("does not flag justification absence when a justification is present", () => {
    const r = cleanRecord();
    r.entries[0] = { ...r.entries[0], hours: 12, justification: "Milestone close-out authorized by PM." };
    r.total_hours = 44;
    const flags = evaluateTimeRecord(r, accounts, "ANALYST", config);
    expect(flags.some((x) => x.rule_category === "JUSTIFICATION_ABSENCE")).toBe(false);
  });

  it("flags weekly overtime across the 7-day bucket", () => {
    const r = cleanRecord();
    r.entries = r.entries.map((e) => ({ ...e, hours: 10 }));
    r.total_hours = 50;
    const flags = evaluateTimeRecord(r, accounts, "ANALYST", config);
    expect(
      flags.some((x) => x.rule_category === "OVERTIME_THRESHOLD" && x.actual_value.startsWith("week"))
    ).toBe(true);
  });

  it("flags a holiday direct charge as WARNING", () => {
    const r = cleanRecord();
    r.entries[2] = { ...r.entries[2], holiday: true };
    const flags = evaluateTimeRecord(r, accounts, "ANALYST", config);
    expect(flags.find((x) => x.rule_category === "HOLIDAY_DIRECT_CHARGE")?.severity).toBe("WARNING");
  });

  it("flags a missing weekday as WARNING", () => {
    const r = cleanRecord();
    r.entries = r.entries.slice(1); // drop Monday
    r.total_hours = 32;
    const flags = evaluateTimeRecord(r, accounts, "ANALYST", config);
    expect(flags.some((x) => x.rule_category === "MISSING_HOURS" && x.actual_value.startsWith("2026-07-06"))).toBe(true);
    expect(flags.some((x) => x.rule_category === "PERIOD_HOUR_MINIMUM")).toBe(true);
  });

  it("flags an off-schedule submission past the grace window", () => {
    const r = cleanRecord();
    r.submitted_at = "2026-07-20T09:00:00Z"; // period end +2d grace = Jul 12
    const flags = evaluateTimeRecord(r, accounts, "ANALYST", config);
    expect(flags.find((x) => x.rule_category === "OFF_SCHEDULE_SUBMISSION")?.severity).toBe("WARNING");
  });

  it("carries recurrence counts from the escalation-monitor lookup", () => {
    const r = cleanRecord();
    r.entries[0] = { ...r.entries[0], charge_type: "INDIRECT" };
    const flags = evaluateTimeRecord(r, accounts, "ANALYST", config, (emp, rule) =>
      emp === "emp-1" && rule === "DIRECT_INDIRECT_MISMATCH" ? 2 : 0
    );
    expect(flags.find((x) => x.rule_category === "DIRECT_INDIRECT_MISMATCH")?.recurrence_count).toBe(3);
  });
});

describe("tt.pattern-analyst", () => {
  const prior: TimeRecord[] = [1, 2, 3, 4].map((week) => ({
    ...cleanRecord(),
    record_id: `TRC-W${week}`,
  }));

  it("exports the registered agent id", () =>
    expect(TT_PATTERN_ANALYST_AGENT_ID).toBe("tt.pattern-analyst"));

  it("computes a per-category individual baseline", () =>
    expect(computeIndividualBaseline(prior)).toEqual({ "CC-DIR": 40 }));

  it("returns an empty baseline for no history", () => expect(computeIndividualBaseline([])).toEqual({}));

  it("surfaces an informational drift signal at/above the threshold, with a hashed id", () => {
    const current = cleanRecord();
    current.entries = current.entries.map((e) => ({ ...e, hours: 12 }));
    current.total_hours = 60; // +50% vs 40h baseline
    const signals = detectPatternDrift(current, computeIndividualBaseline(prior), 25, "INDIVIDUAL_BASELINE", "salt-1");
    expect(signals).toHaveLength(1);
    expect(signals[0].deviation_percent).toBe(50);
    expect(signals[0].informational_only).toBe(true);
    expect(signals[0].employee_id_hash).toBe(hashEmployeeId("emp-1", "salt-1"));
    expect(signals[0].employee_id_hash).not.toContain("emp-1");
  });

  it("stays silent below the drift threshold", () => {
    const signals = detectPatternDrift(cleanRecord(), computeIndividualBaseline(prior), 25, "INDIVIDUAL_BASELINE", "salt-1");
    expect(signals).toEqual([]);
  });

  it("computes a peer baseline across employees", () => {
    const peers = [
      { ...cleanRecord(), record_id: "P1", employee_id: "emp-2" },
      { ...cleanRecord(), record_id: "P2", employee_id: "emp-3" },
    ];
    expect(computePeerBaseline(peers)).toEqual({ "CC-DIR": 40 });
  });

  it("hashing is deterministic per salt and differs across salts", () => {
    expect(hashEmployeeId("emp-1", "s1")).toBe(hashEmployeeId("emp-1", "s1"));
    expect(hashEmployeeId("emp-1", "s1")).not.toBe(hashEmployeeId("emp-1", "s2"));
  });
});

describe("tt.audit-reporter", () => {
  it("exports the registered agent id", () =>
    expect(TT_AUDIT_REPORTER_AGENT_ID).toBe("tt.audit-reporter"));

  it("builds a session export from decided requests only", () => {
    const requests: TravelRequest[] = [
      {
        request_id: "TR-1",
        employee_id: "emp-1",
        destination: "Denver, CO",
        international: false,
        travel_start_date: "2026-09-01",
        travel_end_date: "2026-09-04",
        mission_purpose: "Review",
        costs: { airfare: 400, hotel: 500, per_diem: 200, ground_transport: 80, registration_fees: 0 },
        total_cost: 1180,
        personal_day_included: false,
        justification: "Required.",
        status: "APPROVED",
        submitted_at: "2026-07-15T12:00:00Z",
        routing_tier: "STANDARD",
        assigned_authority: "MANAGER",
      },
      {
        request_id: "TR-2",
        employee_id: "emp-2",
        destination: "Reston, VA",
        international: false,
        travel_start_date: "2026-09-10",
        travel_end_date: "2026-09-11",
        mission_purpose: "Kickoff",
        costs: { airfare: 300, hotel: 200, per_diem: 100, ground_transport: 40, registration_fees: 0 },
        total_cost: 640,
        personal_day_included: false,
        justification: "Required.",
        status: "SUBMITTED", // not decided — excluded
        submitted_at: "2026-07-15T12:00:00Z",
      },
    ];
    const exp = buildTravelSessionExport(requests, "2026-07-12T20:00:00Z", "admin-1");
    expect(exp.total_requests).toBe(1);
    expect(exp.outcomes).toEqual({ APPROVED: 1 });
    expect(exp.decisions[0].assigned_authority).toBe("MANAGER");
  });

  it("builds a period export with severity counts and a recurrence watchlist", () => {
    const flags: ComplianceFlag[] = [
      {
        flag_id: "F1",
        source: "TIME",
        record_ref: "TRC-1",
        employee_id: "emp-1",
        rule_category: "DIRECT_INDIRECT_MISMATCH",
        severity: "ERROR",
        rule_citation: "policy",
        actual_value: "a",
        threshold_value: "b",
        recurrence_count: 3,
        raised_at: "2026-07-10T18:00:00Z",
        status: "OPEN",
      },
      {
        flag_id: "F2",
        source: "TIME",
        record_ref: "TRC-2",
        employee_id: "emp-2",
        rule_category: "MISSING_HOURS",
        severity: "WARNING",
        rule_citation: "policy",
        actual_value: "a",
        threshold_value: "b",
        recurrence_count: 1,
        raised_at: "2026-07-10T18:00:00Z",
        status: "RESOLVED",
      },
    ];
    const exp = buildTimePeriodExport(flags, [], "2026-07-06", "2026-07-10", "2026-07-12T20:00:00Z", "admin-1");
    expect(exp.open_flag_count).toBe(1);
    expect(exp.flags_by_severity).toEqual({ ERROR: 1, WARNING: 1 });
    expect(exp.recurrence_watchlist).toEqual([
      { employee_id: "emp-1", rule_category: "DIRECT_INDIRECT_MISMATCH", recurrence_count: 3 },
    ]);
  });
});

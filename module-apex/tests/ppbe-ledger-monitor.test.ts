/**
 * ppbe-ledger-monitor tests — Session 31 (D6).
 * Deterministic monitoring agent (registry determination, confirmed Session 31
 * open): analyzes obligation records and performance data against configured
 * thresholds; observes and alerts only. Findings carry the docs/18 §4
 * PPBE_ANOMALY payload fields for Python-side emission and VIGIL routing.
 */

import {
  PPBE_LEDGER_MONITOR_AGENT_ID,
  totalObligated,
  detectObligationRateDeviation,
  detectCeilingBreach,
  detectFeedbackLoopStall,
  runLedgerMonitor,
  type LedgerMonitorConfig,
} from "../src/ppbe-ledger-monitor";
import type { ObligationRecord, ProgramRecord, EvaluationFinding } from "@sovereign/data";

const config: LedgerMonitorConfig = {
  obligation_deviation_percent: 10,
  ceiling_proximity_percent: 90,
  feedback_stall_fraction: 0.5,
  feedback_minimum_findings: 2,
};

const program: ProgramRecord = {
  program_id: "PRG-001",
  name: "Logistics Data Interchange",
  sponsor: "PEO Logistics",
  contract_number: "W91-26-C-0001",
  classification_level: "UNCLASSIFIED",
  status: "ACTIVE",
  objective_id: "SO-2027-01",
  fiscal_year: "FY 2027",
  lifecycle_cost_estimate: 1000000,
  obligation_plan: [
    { period: "FY 2027 Q1", planned_amount: 100000 },
    { period: "FY 2027 Q2", planned_amount: 200000 },
  ],
  performance_baseline: [{ metric: "obligation rate", baseline_value: "on plan" }],
};

function obligation(id: string, amount: number): ObligationRecord {
  return {
    obligation_id: id,
    program_id: "PRG-001",
    cost_code: "CC-1",
    amount,
    timestamp: "2026-07-12T15:30:00Z",
    authorizing_official: "Jane Smith",
    workflow_step_id: `ppbe-obligation-${id}`,
  };
}

function finding(id: string, feeds: boolean): EvaluationFinding {
  return {
    finding_id: id,
    program_id: "PRG-001",
    objective_id: "SO-2027-01",
    finding_type: "variance",
    narrative: "Obligation rate below plan.",
    feeds_planning_cycle: feeds,
    workflow_step_id: `ppbe-evaluation-${id}`,
  };
}

describe("ppbe-ledger-monitor", () => {
  it("exports the registered agent id", () =>
    expect(PPBE_LEDGER_MONITOR_AGENT_ID).toBe("ppbe-ledger-monitor"));

  it("sums obligations per program", () =>
    expect(totalObligated([obligation("OB-1", 100), obligation("OB-2", 50)], "PRG-001")).toBe(150));
});

describe("obligation rate deviation (Rule 1)", () => {
  it("stays silent within the configured deviation", () => {
    const findings = detectObligationRateDeviation(
      program,
      { "FY 2027 Q1": 95000, "FY 2027 Q2": 205000 },
      config
    );
    expect(findings).toEqual([]);
  });

  it("flags a period below plan with plain-prose threshold context", () => {
    const findings = detectObligationRateDeviation(program, { "FY 2027 Q1": 80000 }, config);
    expect(findings).toHaveLength(2); // Q1 20% below; Q2 has zero actuals (100% below)
    expect(findings[0]).toMatchObject({
      anomaly_type: "OBLIGATION_RATE_DEVIATION",
      program_id: "PRG-001",
      severity: "P1", // 20% >= 2x the 10% limit
      observation_only: true,
    });
    expect(findings[0].threshold_breached).toContain("20 percent below plan");
    expect(findings[0].workflow_step_id).toBe("ppbe-ledger-PRG-001");
  });

  it("assigns P2 below the doubled limit and P1 at or above it", () => {
    const p2 = detectObligationRateDeviation(program, { "FY 2027 Q1": 88000, "FY 2027 Q2": 200000 }, config);
    expect(p2[0].severity).toBe("P2"); // 12% deviation
    const p1 = detectObligationRateDeviation(program, { "FY 2027 Q1": 75000, "FY 2027 Q2": 200000 }, config);
    expect(p1[0].severity).toBe("P1"); // 25% deviation
  });
});

describe("lifecycle ceiling (Rule 2)", () => {
  it("stays silent below the proximity limit", () =>
    expect(detectCeilingBreach(program, [obligation("OB-1", 500000)], config)).toEqual([]));

  it("flags proximity at the configured percent (P2)", () => {
    const findings = detectCeilingBreach(program, [obligation("OB-1", 920000)], config);
    expect(findings[0]).toMatchObject({ anomaly_type: "CEILING_PROXIMITY", severity: "P2" });
    expect(findings[0].threshold_breached).toContain("92 percent");
  });

  it("flags exceedance as P1", () => {
    const findings = detectCeilingBreach(program, [obligation("OB-1", 1100000)], config);
    expect(findings[0]).toMatchObject({ anomaly_type: "CEILING_EXCEEDED", severity: "P1" });
  });
});

describe("feedback-loop stall (Rule 3 — R-P7, measured not assumed)", () => {
  it("stays silent below the minimum finding count", () =>
    expect(detectFeedbackLoopStall("PRG-001", [finding("EF-1", false)], config)).toEqual([]));

  it("stays silent when findings feed the planning cycle", () =>
    expect(
      detectFeedbackLoopStall("PRG-001", [finding("EF-1", true), finding("EF-2", true)], config)
    ).toEqual([]));

  it("flags a stalled loop with the stalled count in prose", () => {
    const findings = detectFeedbackLoopStall(
      "PRG-001",
      [finding("EF-1", false), finding("EF-2", false), finding("EF-3", true)],
      config
    );
    expect(findings[0]).toMatchObject({ anomaly_type: "FEEDBACK_LOOP_STALL", severity: "P3" });
    expect(findings[0].threshold_breached).toContain("2 of 3");
  });
});

describe("full ledger pass", () => {
  it("combines all three rules and is deterministic", () => {
    const obligations = [obligation("OB-1", 950000)];
    const actuals = { "FY 2027 Q1": 80000, "FY 2027 Q2": 200000 };
    const evals = [finding("EF-1", false), finding("EF-2", false)];
    const a = runLedgerMonitor(program, obligations, actuals, evals, config);
    const b = runLedgerMonitor(program, obligations, actuals, evals, config);
    expect(a).toEqual(b);
    const types = a.map((f) => f.anomaly_type);
    expect(types).toContain("OBLIGATION_RATE_DEVIATION");
    expect(types).toContain("CEILING_PROXIMITY");
    expect(types).toContain("FEEDBACK_LOOP_STALL");
    for (const f of a) expect(f.observation_only).toBe(true);
  });
});

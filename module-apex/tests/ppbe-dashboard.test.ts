/**
 * ppbe-dashboard tests — Session 32 (D5).
 * Deterministic metric computations (docs/18 §7.2 APEX scope): obligation
 * rate, budget-to-actual variance, dependency health index, learning
 * velocity, and activity counts across the FOUR PPBE Logger event types
 * (§7.2's "six" is a spec error — logged in the Session 32 handoff).
 */

import type {
  DependencyMap,
  EvaluationFinding,
  ObligationRecord,
  ProgramRecord,
} from "@sovereign/data";

import {
  PPBE_EVENT_TYPES,
  EMPTY_PPBE_EVENT_COUNTS,
  obligationRate,
  budgetToActualVariance,
  dependencyHealthIndex,
  learningVelocity,
  buildPPBEDashboard,
  type PPBEDashboardInputs,
} from "../src/ppbe-dashboard";

function program(id: string): ProgramRecord {
  return {
    program_id: id,
    name: `Program ${id}`,
    sponsor: "PEO Logistics",
    contract_number: `W91-26-C-${id}`,
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
}

function obligation(id: string, programId: string, amount: number): ObligationRecord {
  return {
    obligation_id: id,
    program_id: programId,
    cost_code: "CC-1",
    amount,
    timestamp: "2026-07-12T15:30:00Z",
    authorizing_official: "Jane Smith",
    workflow_step_id: `ppbe-obligation-${id}`,
  };
}

function dependency(id: string, health: DependencyMap["health_status"]): DependencyMap {
  return {
    dependency_id: id,
    source_workflow: "phase-2-planning",
    target_workflow: "phase-3-programming",
    handoff_standard: "complete evidence package",
    timing_requirement: "within 5 business days of phase close",
    health_status: health,
  };
}

function finding(id: string, feeds: boolean): EvaluationFinding {
  return {
    finding_id: id,
    program_id: "PRG-001",
    objective_id: "SO-2027-01",
    finding_type: feeds ? "on-track" : "variance",
    narrative: `Finding ${id}.`,
    feeds_planning_cycle: feeds,
    workflow_step_id: `ppbe-finding-${id}`,
  };
}

describe("event type coverage", () => {
  it("covers exactly the four Python-only PPBE event types (docs/18 §4 — not six)", () => {
    expect(PPBE_EVENT_TYPES).toEqual([
      "PPBE_DECISION",
      "PPBE_PHASE_TRANSITION",
      "PPBE_ANOMALY",
      "PPBE_EVALUATION_FINDING",
    ]);
  });
});

describe("obligationRate", () => {
  it("computes the rate over the plan total, counting only this program's obligations", () => {
    const m = obligationRate(program("PRG-001"), [
      obligation("OB-1", "PRG-001", 90000),
      obligation("OB-2", "PRG-001", 60000),
      obligation("OB-3", "PRG-OTHER", 500000),
    ]);
    expect(m.planned_total).toBe(300000);
    expect(m.obligated_total).toBe(150000);
    expect(m.rate_percent).toBe(50);
    expect(m.narrative).toContain("50 percent");
  });

  it("reports null (not zero) when nothing is planned — a rate over zero is not a rate", () => {
    const noPlan = { ...program("PRG-001"), obligation_plan: [] };
    const m = obligationRate(noPlan, []);
    expect(m.rate_percent).toBeNull();
    expect(m.narrative).toContain("cannot be computed");
  });
});

describe("budgetToActualVariance", () => {
  it("computes signed per-period variance with plain-prose direction", () => {
    const v = budgetToActualVariance(program("PRG-001"), {
      "FY 2027 Q1": 120000,
      "FY 2027 Q2": 150000,
    });
    expect(v).toHaveLength(2);
    expect(v[0].variance).toBe(20000);
    expect(v[0].narrative).toContain("above plan");
    expect(v[1].variance).toBe(-50000);
    expect(v[1].narrative).toContain("below plan");
  });

  it("treats a missing period as zero actuals and flags on-plan periods plainly", () => {
    const v = budgetToActualVariance(program("PRG-001"), { "FY 2027 Q1": 100000 });
    expect(v[0].narrative).toContain("on plan");
    expect(v[1].actual_amount).toBe(0);
    expect(v[1].variance).toBe(-200000);
  });
});

describe("dependencyHealthIndex", () => {
  it("indexes percent healthy and counts each state", () => {
    const idx = dependencyHealthIndex([
      dependency("D-1", "healthy"),
      dependency("D-2", "healthy"),
      dependency("D-3", "at-risk"),
      dependency("D-4", "failed"),
    ]);
    expect(idx).toMatchObject({ healthy: 2, at_risk: 1, failed: 1, index_percent: 50 });
    expect(idx.narrative).toContain("2 of 4");
  });

  it("reports null when no dependencies are registered", () => {
    expect(dependencyHealthIndex([]).index_percent).toBeNull();
  });
});

describe("learningVelocity", () => {
  it("measures the R-P7 loop — findings feeding the planning cycle", () => {
    const m = learningVelocity([finding("EF-1", true), finding("EF-2", true), finding("EF-3", false)]);
    expect(m.velocity_percent).toBe(67);
    expect(m.feeding_planning_cycle).toBe(2);
    expect(m.narrative).toContain("R-P7");
  });

  it("treats zero findings as a fact, never as health", () => {
    const m = learningVelocity([]);
    expect(m.velocity_percent).toBeNull();
    expect(m.narrative).toContain("not evidence");
  });
});

describe("buildPPBEDashboard", () => {
  const inputs: PPBEDashboardInputs = {
    programs: [program("PRG-002"), program("PRG-001")],
    obligations: [obligation("OB-1", "PRG-001", 90000)],
    actualsByProgram: { "PRG-001": { "FY 2027 Q1": 90000 } },
    dependencies: [dependency("D-1", "healthy")],
    findings: [finding("EF-1", true)],
    eventCounts: { ...EMPTY_PPBE_EVENT_COUNTS, PPBE_ANOMALY: 3 },
  };

  it("assembles all four metrics plus event counts, programs sorted", () => {
    const data = buildPPBEDashboard(inputs);
    expect(data.obligation_rates.map((m) => m.program_id)).toEqual(["PRG-001", "PRG-002"]);
    expect(data.variances).toHaveLength(4);
    expect(data.dependency_health.index_percent).toBe(100);
    expect(data.learning_velocity.velocity_percent).toBe(100);
    expect(data.event_counts.PPBE_ANOMALY).toBe(3);
    expect(data.is_empty).toBe(false);
  });

  it("flags the honest empty state when nothing is recorded", () => {
    const data = buildPPBEDashboard({
      programs: [],
      obligations: [],
      actualsByProgram: {},
      dependencies: [],
      findings: [],
      eventCounts: EMPTY_PPBE_EVENT_COUNTS,
    });
    expect(data.is_empty).toBe(true);
  });
});

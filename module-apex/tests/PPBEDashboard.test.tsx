/** @jest-environment jsdom */
/**
 * PPBEDashboard component tests — Session 32 (D5).
 * The live PPBE performance dashboard on APEX's Execution Monitoring tab.
 * With data: all four metric sections render plain-prose narratives and the
 * four PPBE event-type activity counts. Without data: an honest Category-1
 * empty state, never fabricated-looking measurements.
 */
import { render, screen } from "@testing-library/react";

import { PPBEDashboard } from "../src/PPBEDashboard";
import { EMPTY_PPBE_EVENT_COUNTS, type PPBEDashboardInputs } from "../src/ppbe-dashboard";

const inputs: PPBEDashboardInputs = {
  programs: [
    {
      program_id: "PRG-001",
      name: "Logistics Data Interchange",
      sponsor: "PEO Logistics",
      contract_number: "W91-26-C-0001",
      classification_level: "UNCLASSIFIED",
      status: "ACTIVE",
      objective_id: "SO-2027-01",
      fiscal_year: "FY 2027",
      lifecycle_cost_estimate: 1000000,
      obligation_plan: [{ period: "FY 2027 Q1", planned_amount: 100000 }],
      performance_baseline: [{ metric: "obligation rate", baseline_value: "on plan" }],
    },
  ],
  obligations: [
    {
      obligation_id: "OB-1",
      program_id: "PRG-001",
      cost_code: "CC-1",
      amount: 50000,
      timestamp: "2026-07-12T15:30:00Z",
      authorizing_official: "Jane Smith",
      workflow_step_id: "ppbe-obligation-OB-1",
    },
  ],
  actualsByProgram: { "PRG-001": { "FY 2027 Q1": 50000 } },
  dependencies: [
    {
      dependency_id: "D-1",
      source_workflow: "phase-2-planning",
      target_workflow: "phase-3-programming",
      handoff_standard: "complete evidence package",
      timing_requirement: "within 5 business days of phase close",
      health_status: "at-risk",
    },
  ],
  findings: [
    {
      finding_id: "EF-1",
      program_id: "PRG-001",
      objective_id: "SO-2027-01",
      finding_type: "variance",
      narrative: "Finding EF-1.",
      feeds_planning_cycle: false,
      workflow_step_id: "ppbe-finding-EF-1",
    },
  ],
  eventCounts: { ...EMPTY_PPBE_EVENT_COUNTS, PPBE_DECISION: 2, PPBE_ANOMALY: 1 },
};

describe("PPBEDashboard", () => {
  it("renders all four metric sections and the event activity with data", () => {
    render(<PPBEDashboard inputs={inputs} />);
    expect(screen.getByRole("heading", { name: "APEX — Execution Monitoring" })).toBeInTheDocument();
    expect(screen.getByText(/obligated 50000 of 100000 planned — 50 percent/)).toBeInTheDocument();
    expect(screen.getByText(/Logistics Data Interchange.*FY 2027 Q1.*under-executing.*actuals of 50000 are 50000 below plan/)).toBeInTheDocument();
    expect(screen.getByText(/0 of 1 registered dependencies are healthy/)).toBeInTheDocument();
    expect(screen.getByText(/0 of 1 evaluation findings are feeding the planning cycle/)).toBeInTheDocument();
    expect(screen.getByText(/PPBE_DECISION: 2 recorded events/)).toBeInTheDocument();
    expect(screen.getByText(/PPBE_ANOMALY: 1 recorded event$/)).toBeInTheDocument();
    // No empty-state notice when data exists.
    expect(screen.queryByText(/No PPBE execution data is recorded yet/)).not.toBeInTheDocument();
  });

  it("renders the honest empty state when no inputs are supplied", () => {
    render(<PPBEDashboard />);
    expect(screen.getByText(/No PPBE execution data is recorded yet/)).toBeInTheDocument();
    expect(screen.getByText(/nothing shown here is fabricated/)).toBeInTheDocument();
    expect(screen.getByText(/No programs are recorded./)).toBeInTheDocument();
    expect(screen.getByText(/PPBE_PHASE_TRANSITION: 0 recorded events/)).toBeInTheDocument();
  });
});

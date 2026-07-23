/** @jest-environment jsdom */
/**
 * PPBEProgramDetail component tests — Session 57 (D1 / WG-11 + WG-8).
 *
 * Verifies the four sections for a single selected PPBE program:
 *   1. Obligation status — rate percent, status badge
 *   2. Budget-to-actual variance history — period rows
 *   3. Dependency health — filtered to this program's workflows only
 *   4. Site breakdown — filtered via sitesForProgram(programId)
 *
 * Also verifies the empty / not-found state and the Back button callback.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { PPBEProgramDetail } from "../src/PPBEProgramDetail";
import { EMPTY_PPBE_EVENT_COUNTS, type PPBEDashboardInputs } from "../src/ppbe-dashboard";

const BASE_PROGRAM = {
  program_id: "SYNTH-PRG-ALPHA",
  name: "Logistics Data Interchange Modernization",
  sponsor: "PEO Logistics",
  contract_number: "W91-26-C-0001",
  classification_level: "UNCLASSIFIED" as const,
  status: "ACTIVE" as const,
  objective_id: "SO-2027-01",
  fiscal_year: "FY 2027",
  lifecycle_cost_estimate: 1000000,
  obligation_plan: [
    { period: "FY 2027 Q1", planned_amount: 100000 },
    { period: "FY 2027 Q2", planned_amount: 120000 },
  ],
  performance_baseline: [{ metric: "obligation rate", baseline_value: "on plan" }],
};

const INPUTS: PPBEDashboardInputs = {
  programs: [BASE_PROGRAM],
  obligations: [
    {
      obligation_id: "OB-1",
      program_id: "SYNTH-PRG-ALPHA",
      cost_code: "CC-1",
      amount: 90000,
      timestamp: "2027-01-15T00:00:00Z",
      authorizing_official: "J. Smith",
      workflow_step_id: "ppbe-obligation-OB-1",
    },
    {
      obligation_id: "OB-2",
      program_id: "SYNTH-PRG-ALPHA",
      cost_code: "CC-1",
      amount: 60000,
      timestamp: "2027-04-10T00:00:00Z",
      authorizing_official: "J. Smith",
      workflow_step_id: "ppbe-obligation-OB-2",
    },
  ],
  actualsByProgram: {
    "SYNTH-PRG-ALPHA": { "FY 2027 Q1": 90000, "FY 2027 Q2": 60000 },
  },
  dependencies: [
    {
      dependency_id: "DEP-A1",
      source_workflow: "phase-2-planning-SYNTH-PRG-ALPHA",
      target_workflow: "phase-3-programming-SYNTH-PRG-ALPHA",
      handoff_standard: "R-P1",
      timing_requirement: "within 30 days",
      health_status: "healthy",
    },
    {
      dependency_id: "DEP-B1",
      source_workflow: "phase-2-planning-SYNTH-PRG-BRAVO",
      target_workflow: "phase-3-programming-SYNTH-PRG-BRAVO",
      handoff_standard: "R-P1",
      timing_requirement: "within 30 days",
      health_status: "at-risk",
    },
  ],
  findings: [],
  eventCounts: EMPTY_PPBE_EVENT_COUNTS,
};

describe("PPBEProgramDetail", () => {
  it("renders program name and ID in header", () => {
    render(<PPBEProgramDetail programId="SYNTH-PRG-ALPHA" inputs={INPUTS} onBack={() => {}} />);
    expect(screen.getByRole("heading", { name: "Logistics Data Interchange Modernization" })).toBeInTheDocument();
    expect(screen.getByText("SYNTH-PRG-ALPHA")).toBeInTheDocument();
  });

  it("shows obligation rate percent and status badge (≥80% = on track)", () => {
    render(<PPBEProgramDetail programId="SYNTH-PRG-ALPHA" inputs={INPUTS} onBack={() => {}} />);
    // Total obligated: 150000, planned: 220000 → 68% → at_risk
    expect(screen.getByText("68%")).toBeInTheDocument();
    // "At risk" may appear more than once (obligation badge + site rows) — at least one is expected
    expect(screen.getAllByText("At risk").length).toBeGreaterThanOrEqual(1);
  });

  it("shows obligation narrative from obligationRate()", () => {
    render(<PPBEProgramDetail programId="SYNTH-PRG-ALPHA" inputs={INPUTS} onBack={() => {}} />);
    expect(screen.getByText(/has obligated 150000 of 220000 planned/)).toBeInTheDocument();
  });

  it("shows variance history rows for each obligation plan period", () => {
    render(<PPBEProgramDetail programId="SYNTH-PRG-ALPHA" inputs={INPUTS} onBack={() => {}} />);
    expect(screen.getByText("FY 2027 Q1")).toBeInTheDocument();
    expect(screen.getByText("FY 2027 Q2")).toBeInTheDocument();
  });

  it("shows dependency health filtered to only this program's workflows (not BRAVO's)", () => {
    render(<PPBEProgramDetail programId="SYNTH-PRG-ALPHA" inputs={INPUTS} onBack={() => {}} />);
    // ALPHA's dep appears
    expect(screen.getByText("DEP-A1")).toBeInTheDocument();
    // BRAVO's dep is filtered out
    expect(screen.queryByText("DEP-B1")).not.toBeInTheDocument();
  });

  it("shows site breakdown for the selected program using sitesForProgram()", () => {
    render(<PPBEProgramDetail programId="SYNTH-PRG-ALPHA" inputs={INPUTS} onBack={() => {}} />);
    expect(screen.getByRole("table", { name: "Per-site obligation breakdown" })).toBeInTheDocument();
  });

  it("calls onBack when the Back button is clicked", () => {
    const onBack = jest.fn();
    render(<PPBEProgramDetail programId="SYNTH-PRG-ALPHA" inputs={INPUTS} onBack={onBack} />);
    fireEvent.click(screen.getByRole("button", { name: /Back to dashboard/ }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("shows not-found empty state for an unknown programId", () => {
    render(<PPBEProgramDetail programId="SYNTH-PRG-UNKNOWN" inputs={INPUTS} onBack={() => {}} />);
    expect(screen.getByText(/No PPBE program record found for SYNTH-PRG-UNKNOWN/)).toBeInTheDocument();
  });

  it("shows empty-deps message when no dependencies match this program", () => {
    const noDepInputs: PPBEDashboardInputs = { ...INPUTS, dependencies: [] };
    render(<PPBEProgramDetail programId="SYNTH-PRG-ALPHA" inputs={noDepInputs} onBack={() => {}} />);
    expect(screen.getByText(/No inter-workflow dependencies involve this program/)).toBeInTheDocument();
  });

  it("shows variance empty state when program has no obligation plan periods", () => {
    const noPlanInputs: PPBEDashboardInputs = {
      ...INPUTS,
      programs: [{ ...BASE_PROGRAM, obligation_plan: [] }],
    };
    render(<PPBEProgramDetail programId="SYNTH-PRG-ALPHA" inputs={noPlanInputs} onBack={() => {}} />);
    expect(screen.getByText(/No obligation plan periods are recorded/)).toBeInTheDocument();
  });
});

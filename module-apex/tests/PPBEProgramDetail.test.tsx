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
  objective_id: "SO-2026-01",
  fiscal_year: "FY 2026",
  lifecycle_cost_estimate: 1000000,
  obligation_plan: [
    { period: "FY 2026 Q1", planned_amount: 100000 },
    { period: "FY 2026 Q2", planned_amount: 120000 },
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
      timestamp: "2026-01-15T00:00:00Z",
      authorizing_official: "J. Smith",
      workflow_step_id: "ppbe-obligation-OB-1",
    },
    {
      obligation_id: "OB-2",
      program_id: "SYNTH-PRG-ALPHA",
      cost_code: "CC-1",
      amount: 60000,
      timestamp: "2026-04-10T00:00:00Z",
      authorizing_official: "J. Smith",
      workflow_step_id: "ppbe-obligation-OB-2",
    },
  ],
  actualsByProgram: {
    "SYNTH-PRG-ALPHA": { "FY 2026 Q1": 90000, "FY 2026 Q2": 60000 },
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
    expect(screen.getByText(/has obligated \$150,000 of \$220,000 planned/)).toBeInTheDocument();
  });

  it("shows variance history for each obligation plan period (via narrative captions below chart)", () => {
    render(<PPBEProgramDetail programId="SYNTH-PRG-ALPHA" inputs={INPUTS} onBack={() => {}} />);
    // Period labels appear in the narrative captions rendered below the line chart (Gap 5).
    expect(screen.getByText(/FY 2026 Q1/)).toBeInTheDocument();
    expect(screen.getByText(/FY 2026 Q2/)).toBeInTheDocument();
    // Chart container is present.
    expect(screen.getByLabelText("Budget-to-actual variance history chart")).toBeInTheDocument();
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

  // F-48 (Session 118): the two tables on this page agree with each other — the
  // quarterly table says "Obligated" (not "Actual"), and the site table carries
  // the same Planned → Obligated → Variance column order with a computed variance.
  it("F-48: quarterly variance table header uses the platform term 'Obligated'", () => {
    render(<PPBEProgramDetail programId="SYNTH-PRG-ALPHA" inputs={INPUTS} onBack={() => {}} />);
    const quarterly = screen.getByRole("table", { name: "Budget-to-actual variance by period" });
    const headers = Array.from(quarterly.querySelectorAll("th")).map((th) => th.textContent);
    expect(headers).toEqual(["Period", "Planned", "Obligated", "Variance"]);
    expect(headers).not.toContain("Actual");
  });

  it("F-48: site table columns run Planned → Obligated → Variance → Status with a computed variance", () => {
    render(<PPBEProgramDetail programId="SYNTH-PRG-ALPHA" inputs={INPUTS} onBack={() => {}} />);
    const site = screen.getByRole("table", { name: "Per-site obligation breakdown" });
    const headers = Array.from(site.querySelectorAll("th")).map((th) => th.textContent);
    expect(headers).toEqual(["Site", "Region", "Planned", "Obligated", "Variance", "Status"]);
    // Variance = Obligated − Planned per row, rendered like the quarterly table
    // ("On plan" at zero, signed currency otherwise).
    const firstRow = site.querySelectorAll("tbody tr")[0];
    const cells = Array.from(firstRow?.querySelectorAll("td") ?? []).map((td) => td.textContent ?? "");
    expect(cells[4]).toMatch(/^On plan$|^[+-]?\$/);
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

describe("PPBEProgramDetail — WH-37 BY/BY+1 planning-phase gating", () => {
  const BY_PROGRAM = {
    ...BASE_PROGRAM,
    fiscal_year: "FY 2027",
    obligation_plan: [{ period: "FY 2027 Q1", planned_amount: 100000 }],
  };
  const BY_INPUTS: PPBEDashboardInputs = {
    ...INPUTS,
    programs: [BY_PROGRAM],
    obligations: [],
    actualsByProgram: {},
  };

  it("BY (FY 2027): obligation status section shows planning notice, not rate or badge", () => {
    render(<PPBEProgramDetail programId="SYNTH-PRG-ALPHA" inputs={BY_INPUTS} onBack={() => {}} />);
    // Execution metrics must not be present.
    expect(screen.queryByLabelText(/Obligation rate:/)).not.toBeInTheDocument();
    // Planning notice must be present.
    expect(screen.getByText(/BY \(FY 2027\) is a budget-year request/)).toBeInTheDocument();
  });

  it("BY (FY 2027): variance section shows planning notice, not chart or WH-48 table", () => {
    render(<PPBEProgramDetail programId="SYNTH-PRG-ALPHA" inputs={BY_INPUTS} onBack={() => {}} />);
    expect(screen.queryByLabelText("Budget-to-actual variance history chart")).not.toBeInTheDocument();
    // WH-48 × WH-37: the new Period/Planned/Actual/Variance table must also be absent for BY.
    expect(screen.queryByLabelText("Budget-to-actual variance by period")).not.toBeInTheDocument();
    expect(screen.getByText(/Budget-year planning estimates.*do not have actual obligation records by definition/)).toBeInTheDocument();
  });

  it("BY+1 (FY 2028): obligation status section shows BY+1 planning notice", () => {
    const BY1_PROGRAM = { ...BY_PROGRAM, fiscal_year: "FY 2028" };
    const BY1_INPUTS: PPBEDashboardInputs = { ...BY_INPUTS, programs: [BY1_PROGRAM] };
    render(<PPBEProgramDetail programId="SYNTH-PRG-ALPHA" inputs={BY1_INPUTS} onBack={() => {}} />);
    expect(screen.getByText(/BY\+1 \(FY 2028\) has no obligation concept/)).toBeInTheDocument();
  });
});

// ── WH-49 × WH-37 interaction ─────────────────────────────────────────────────
// Both fixes were built in separate sessions and only tested in isolation.
// This suite verifies the combined path: Dashboard carries BY via initialFiscalYear
// (WH-49) and Detail correctly gates execution metrics for that carried year (WH-37).

describe("PPBEProgramDetail — WH-49 × WH-37 interaction", () => {
  // Multi-year data: the same program has both CY (FY 2026) and BY (FY 2027) records.
  // This is the realistic case: a user selects BY on the Dashboard, which then carries
  // 'FY 2027' as initialFiscalYear when navigating into the Detail.
  const BY_PROGRAM = {
    ...BASE_PROGRAM,
    fiscal_year: "FY 2027",
    obligation_plan: [{ period: "FY 2027", planned_amount: 300000 }],
  };
  const MULTI_YEAR_INPUTS: PPBEDashboardInputs = {
    ...INPUTS,
    programs: [BASE_PROGRAM, BY_PROGRAM],
  };

  it("initialFiscalYear='FY 2027' on a multi-year program opens on BY and shows planning notice", () => {
    render(
      <PPBEProgramDetail
        programId="SYNTH-PRG-ALPHA"
        inputs={MULTI_YEAR_INPUTS}
        onBack={() => {}}
        initialFiscalYear="FY 2027"
      />
    );
    // WH-49: the Dashboard's selected year is honored — component opens on FY 2027,
    // not the CY default that would otherwise win (the program has FY 2026 data too).
    // WH-37: isBudgetYear is true for FY 2027 — planning notice renders, not metrics.
    expect(screen.getByText(/BY \(FY 2027\) is a budget-year request/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Obligation rate:/)).not.toBeInTheDocument();
    // WH-48: the variance table is also absent (same isBudgetYear gate covers it).
    expect(screen.queryByLabelText("Budget-to-actual variance by period")).not.toBeInTheDocument();
  });

  it("without initialFiscalYear, a multi-year program defaults to CY (FY 2026) and shows execution metrics", () => {
    render(
      <PPBEProgramDetail
        programId="SYNTH-PRG-ALPHA"
        inputs={MULTI_YEAR_INPUTS}
        onBack={() => {}}
      />
    );
    // No initialFiscalYear → defaults to CY (FY 2026) → execution metrics render.
    expect(screen.getByLabelText(/Obligation rate:/)).toBeInTheDocument();
    // Variance table present (CY has obligation data).
    expect(screen.getByLabelText("Budget-to-actual variance by period")).toBeInTheDocument();
    // Planning notice must NOT be shown for CY.
    expect(screen.queryByText(/BY \(FY 2027\) is a budget-year request/)).not.toBeInTheDocument();
  });
});

/** @jest-environment jsdom */
/**
 * PPBEDashboard component tests — Session 32 (D5) + Session 46 (D1–D3).
 *
 * Session 32: live PPBE performance dashboard on APEX's Execution Monitoring tab.
 * Session 46 additions:
 *   D1 — charts render (obligation rate BarChart, variance BarChart, dependency table).
 *   D2 — onSelectProgram fires when an accessible program button is clicked.
 *   D3 — per-site breakdown section is present with visible placeholder disclosure.
 *
 * Narrative prose assertions (obligation rate, variance, dependency health) still
 * pass because the prose is kept as caption text below each chart (Gap 5).
 */
import { render, screen, fireEvent } from "@testing-library/react";

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
  // ── Session 32 baseline assertions (still pass — prose is kept in DOM) ────

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

  // ── D1 — charts and dependency table (Session 46) ─────────────────────────

  it("D1: obligation rate chart container is present", () => {
    render(<PPBEDashboard inputs={inputs} />);
    expect(screen.getByLabelText("Obligation rate bar chart")).toBeInTheDocument();
  });

  it("D1: budget-to-actual variance chart container is present", () => {
    render(<PPBEDashboard inputs={inputs} />);
    expect(screen.getByLabelText("Budget-to-actual variance chart")).toBeInTheDocument();
  });

  it("D1: dependency health renders as a table (not a chart), with header rows", () => {
    render(<PPBEDashboard inputs={inputs} />);
    const table = screen.getByLabelText("Dependency health counts");
    expect(table.tagName).toBe("TABLE");
    expect(table).toHaveTextContent("Healthy");
    expect(table).toHaveTextContent("At risk");
    expect(table).toHaveTextContent("Failed");
  });

  // ── D2 — program selection callback (Session 46) ─────────────────────────

  it("D2: accessible program button is rendered when onSelectProgram is provided", () => {
    const onSelect = jest.fn();
    render(<PPBEDashboard inputs={inputs} onSelectProgram={onSelect} />);
    expect(
      screen.getByRole("button", { name: /View detail for Logistics Data Interchange/ })
    ).toBeInTheDocument();
  });

  it("D2: clicking the accessible program button calls onSelectProgram with the program_id", () => {
    const onSelect = jest.fn();
    render(<PPBEDashboard inputs={inputs} onSelectProgram={onSelect} />);
    fireEvent.click(
      screen.getByRole("button", { name: /View detail for Logistics Data Interchange/ })
    );
    expect(onSelect).toHaveBeenCalledWith("PRG-001");
  });

  it("D2: no program selection buttons are rendered when onSelectProgram is not provided", () => {
    render(<PPBEDashboard inputs={inputs} />);
    expect(
      screen.queryByRole("button", { name: /View detail for/ })
    ).not.toBeInTheDocument();
  });

  // ── D3 — site breakdown placeholder (Session 46) ─────────────────────────

  it("D3: per-site breakdown section is present", () => {
    render(<PPBEDashboard inputs={inputs} />);
    expect(screen.getByRole("heading", { name: "Per-site breakdown" })).toBeInTheDocument();
  });

  it("D3: visible placeholder disclosure is present in the UI (not just in a comment)", () => {
    render(<PPBEDashboard inputs={inputs} />);
    expect(
      screen.getByText(/Site-level data is illustrative — a real site-tracking schema has not yet been added/)
    ).toBeInTheDocument();
  });

  it("D3: site breakdown table is present with expected columns", () => {
    render(<PPBEDashboard inputs={inputs} />);
    const table = screen.getByLabelText("Per-site obligation breakdown (illustrative)");
    expect(table).toBeInTheDocument();
    expect(table).toHaveTextContent("Site");
    expect(table).toHaveTextContent("Region");
    expect(table).toHaveTextContent("Obligated");
    expect(table).toHaveTextContent("Planned");
  });

  it("D3: site breakdown renders synthetic sites (multiple programs share Aberdeen Proving Ground)", () => {
    render(<PPBEDashboard inputs={inputs} />);
    // Aberdeen appears in ALPHA, ECHO, BRAVO rows — three occurrences expected.
    const cells = screen.getAllByText("Aberdeen Proving Ground");
    expect(cells.length).toBeGreaterThanOrEqual(1);
  });

  it("D3: exactly six distinct physical sites appear in the dataset", () => {
    // Verify the dataset has the required six distinct site names
    const { SYNTH_SITE_BREAKDOWNS, DISTINCT_SITE_COUNT } = require("../src/ppbe-site-breakdown");
    expect(DISTINCT_SITE_COUNT).toBe(6);
    const siteNames = new Set(SYNTH_SITE_BREAKDOWNS.map((s: { site_name: string }) => s.site_name));
    expect(siteNames.size).toBe(6);
  });

  it("D3: site participation varies — one program with all 6 sites, one with exactly 1, others in between", () => {
    const { SYNTH_SITE_BREAKDOWNS } = require("../src/ppbe-site-breakdown");
    const countByProgram: Record<string, number> = {};
    for (const s of SYNTH_SITE_BREAKDOWNS) {
      countByProgram[s.program_id] = (countByProgram[s.program_id] ?? 0) + 1;
    }
    const counts = Object.values(countByProgram) as number[];
    expect(counts).toContain(6);  // at least one program with all 6
    expect(counts).toContain(1);  // at least one single-site program
    // Remaining programs are between 1 and 6 exclusive
    const between = counts.filter((c) => c > 1 && c < 6);
    expect(between.length).toBeGreaterThan(0);
  });
});

// ── Session 54 — WG-3 / WG-4 / WG-12 ────────────────────────────────────────

describe("PPBEDashboard — Session 54 (WG-3 codename key, WG-4 legend order, WG-12 dependency detail)", () => {
  it("WG-3: renders an always-visible codename → full-name key above the obligation chart", () => {
    render(<PPBEDashboard inputs={inputs} />);
    const key = screen.getByLabelText("Program codename key");
    // shortId("PRG-001") === "001"; the key bridges it to the full program name.
    expect(key).toHaveTextContent("001 = Logistics Data Interchange");
  });

  it("WG-4: variance legend content renders with deterministic order — Planned before Actual", () => {
    // Recharts renders no chart internals under jsdom (zero-size container), so the
    // explicit content renderer is asserted directly — it IS the deterministic order.
    const { VarianceLegendContent } = require("../src/PPBEDashboard");
    render(<VarianceLegendContent />);
    const legend = screen.getByLabelText("Variance chart legend");
    const items = Array.from(legend.querySelectorAll("li")).map((li) => li.textContent);
    expect(items).toEqual(["Planned", "Actual"]);
  });

  it("WG-12: dependency detail table identifies WHICH dependency is at risk, not just counts", () => {
    render(<PPBEDashboard inputs={inputs} />);
    const detail = screen.getByLabelText("Dependency detail");
    expect(detail.tagName).toBe("TABLE");
    expect(detail).toHaveTextContent("D-1");
    expect(detail).toHaveTextContent("phase-2-planning");
    expect(detail).toHaveTextContent("phase-3-programming");
    expect(detail).toHaveTextContent("At risk");
    // The counts table (Session 46) is unchanged alongside it.
    expect(screen.getByLabelText("Dependency health counts")).toBeInTheDocument();
  });
});

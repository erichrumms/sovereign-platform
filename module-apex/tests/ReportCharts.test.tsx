/** @jest-environment jsdom */
/**
 * module-apex — ReportCharts.test.tsx (Session 19, D4)
 * The DC-4 report indicators: completion progress bar, cost-variance badge, and milestone
 * summary — each with a plain-prose caption (Gap 5). Driven from the synthetic adapter.
 */
import { render, screen, within } from "@testing-library/react";

import { ReportCharts } from "../src/ReportCharts";
import { createSyntheticApexDataAdapter } from "../src/apex-data-adapter";

const adapter = createSyntheticApexDataAdapter();
const p100 = adapter.getProgram("P-100")!; // AT_RISK, has a cost-variance flag, 62% complete
const p200 = adapter.getProgram("P-200")!; // ON_TRACK, no cost flag, 80% complete
const p300 = adapter.getProgram("P-300")!; // OFF_TRACK, two missed milestones

describe("ReportCharts", () => {
  it("completion indicator renders with the program's completion value and a plain-prose caption", () => {
    render(<ReportCharts program={p100} />);
    const indicator = screen.getByLabelText("Completion indicator");
    expect(indicator).toHaveAttribute("data-completion", "62");
    expect(screen.getByText("This program is 62 percent complete.")).toBeInTheDocument();
  });

  it("cost variance indicator is amber/over-plan when a cost-variance flag is open", () => {
    render(<ReportCharts program={p100} />);
    const cost = screen.getByLabelText("Cost variance indicator");
    expect(cost).toHaveAttribute("data-cost-state", "over");
    expect(within(cost).getByText("Cost over plan")).toBeInTheDocument();
    // Caption carries the variance prose and the priority (Gap 5).
    expect(within(cost).getByText(/8 percentage points above the planned 58 percent/)).toBeInTheDocument();
    expect(within(cost).getByText(/Risk Level 2 risk/)).toBeInTheDocument();
  });

  it("cost variance indicator is within-plan when no cost-variance flag is present", () => {
    render(<ReportCharts program={p200} />);
    const cost = screen.getByLabelText("Cost variance indicator");
    expect(cost).toHaveAttribute("data-cost-state", "within");
    expect(within(cost).getByText("Cost within plan")).toBeInTheDocument();
    expect(within(cost).getByText(/No cost variance is flagged/)).toBeInTheDocument();
  });

  it("milestone summary counts on-schedule, at-risk, and missed correctly", () => {
    render(<ReportCharts program={p100} />);
    const summary = screen.getByLabelText("Milestone status summary");
    // P-100: M1, M2 on schedule; M3 at risk (behind schedule, not missed); 0 missed.
    expect(within(within(summary).getByLabelText("Completed on schedule count")).getByText("2")).toBeInTheDocument();
    expect(within(within(summary).getByLabelText("At risk count")).getByText("1")).toBeInTheDocument();
    expect(within(within(summary).getByLabelText("Missed count")).getByText("0")).toBeInTheDocument();
    expect(screen.getByText(/2 milestones are completed or on schedule, 1 milestone is at risk\./)).toBeInTheDocument();
  });

  it("milestone summary counts missed milestones for an off-track program", () => {
    render(<ReportCharts program={p300} />);
    const summary = screen.getByLabelText("Milestone status summary");
    // P-300: both milestones missed.
    expect(within(within(summary).getByLabelText("Missed count")).getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/2 milestones have been missed\./)).toBeInTheDocument();
  });
});

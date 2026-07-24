/** @jest-environment jsdom */
/**
 * ppbe-data-adapter tests — Session 33 (D4, goal item 8).
 * The dashboard's host adapter over the canonical seed: actuals are DERIVED
 * from the obligation records (one source of truth), the assembled inputs
 * drive real metric values, and the dashboard component demonstrably renders
 * them — no empty state.
 */
import { render, screen } from "@testing-library/react";

import { SYNTH_PPBE_OBLIGATIONS } from "@sovereign/data";

import { PPBEDashboard } from "../src/PPBEDashboard";
import { buildPPBEDashboard } from "../src/ppbe-dashboard";
import {
  actualsForProgram,
  createSyntheticPPBEDashboardInputs,
  SYNTH_PPBE_EVENT_COUNTS,
} from "../src/ppbe-data-adapter";

describe("actualsForProgram", () => {
  it("derives per-period actuals from the obligation records — no restated numbers", () => {
    const alpha = actualsForProgram(SYNTH_PPBE_OBLIGATIONS, "SYNTH-PRG-ALPHA");
    expect(alpha).toEqual({ "FY 2026 Q1": 145000, "FY 2026 Q2": 172000, "FY 2026 Q3": 200000, "FY 2026 Q4": 285000 });
    const bravo = actualsForProgram(SYNTH_PPBE_OBLIGATIONS, "SYNTH-PRG-BRAVO");
    expect(bravo).toEqual({ "FY 2026 Q1": 45000, "FY 2026 Q2": 72000, "FY 2026 Q3": 60000, "FY 2026 Q4": 90000 });
  });
});

describe("createSyntheticPPBEDashboardInputs → buildPPBEDashboard", () => {
  const data = buildPPBEDashboard(createSyntheticPPBEDashboardInputs());

  it("produces real, non-empty metrics across the seeded portfolio", () => {
    expect(data.is_empty).toBe(false);
    expect(data.obligation_rates).toHaveLength(5);
    const byProgram = Object.fromEntries(data.obligation_rates.map((m) => [m.program_id, m]));
    expect(byProgram["SYNTH-PRG-ALPHA"].rate_percent).toBe(97);
    expect(byProgram["SYNTH-PRG-BRAVO"].rate_percent).toBe(46); // 267000 of 580000 (Q1–Q4)
    expect(byProgram["SYNTH-PRG-ECHO"].rate_percent).toBe(104); // 458000 of 440000 — the ADA example (Q1–Q4)
    expect(data.dependency_health.index_percent).toBe(75); // 6 of 8 healthy
    expect(data.learning_velocity.velocity_percent).toBe(65); // 13 of 20
    expect(data.event_counts).toEqual(SYNTH_PPBE_EVENT_COUNTS);
  });

  it("shows meaningful VARIANCE across programs — the n=1 dashboard could not", () => {
    const rates = data.obligation_rates.map((m) => m.rate_percent);
    expect(new Set(rates).size).toBeGreaterThanOrEqual(4); // genuinely different programs
    const variances = data.variances.filter((v) => v.variance !== 0);
    expect(variances.length).toBeGreaterThan(0);
  });
});

describe("PPBEDashboard renders the adapter's data live", () => {
  it("shows real metrics and no empty-state notice", () => {
    render(<PPBEDashboard inputs={createSyntheticPPBEDashboardInputs()} />);
    expect(screen.queryByText(/No PPBE execution data is recorded yet/)).not.toBeInTheDocument();
    expect(screen.getByText(/97 percent/)).toBeInTheDocument();
    expect(screen.getByText(/6 of 8 registered dependencies are healthy \(75 percent\)/)).toBeInTheDocument();
    expect(screen.getByText(/13 of 20 evaluation findings are feeding the planning cycle/)).toBeInTheDocument();
    expect(screen.getByText(/PPBE_ANOMALY: 10 recorded events/)).toBeInTheDocument();
  });
});

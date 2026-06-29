/** @jest-environment jsdom */
/**
 * module-aria — ClearDashboard.test.tsx (Session 23 · D6)
 * The CLEAR Compliance Dashboard: the three monitoring surfaces, severity coding, the
 * permanent determinism notice, and certification status populated from ctx.aria.
 */
import { render, screen, within } from "@testing-library/react";

import { ClearDashboard } from "../src/ClearDashboard";
import { makeCtx, makeAriaSurface } from "./test-helpers";
import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";

describe("ClearDashboard (D2)", () => {
  it("renders all three monitoring surfaces", () => {
    render(<ClearDashboard ctx={makeCtx()} />);
    expect(screen.getByTestId("clear-surface-output")).toBeInTheDocument();
    expect(screen.getByTestId("clear-surface-process")).toBeInTheDocument();
    expect(screen.getByTestId("clear-surface-data-quality")).toBeInTheDocument();
  });

  it("shows the permanent CLEAR determinism notice (ARIA does not make decisions)", () => {
    render(<ClearDashboard ctx={makeCtx()} />);
    expect(screen.getByText(/It does not make decisions\. Human reviewers certify all outputs\./)).toBeInTheDocument();
  });

  it("severity-codes data quality: congressional below 90% is a red P1 violation", () => {
    render(<ClearDashboard ctx={makeCtx()} />);
    const row = screen.getByTestId("data-quality-row-DQ-CONG-JUST");
    expect(within(row).getByText(/Violation \(P1\)/)).toBeInTheDocument();
    expect(row.querySelector('[data-severity="red"]')).toBeTruthy();
  });

  it("severity-codes data quality: non-congressional below 90% is amber, at-or-above is green", () => {
    render(<ClearDashboard ctx={makeCtx()} />);
    expect(screen.getByTestId("data-quality-row-DQ-PRG-PERF").querySelector('[data-severity="amber"]')).toBeTruthy();
    expect(screen.getByTestId("data-quality-row-DQ-COST-BASE").querySelector('[data-severity="green"]')).toBeTruthy();
  });

  it("flags an overdue governance-calendar item red with its elapsed overdue time", () => {
    render(<ClearDashboard ctx={makeCtx()} />);
    const row = screen.getByTestId("process-row-CAL-PROG-XSN");
    expect(within(row).getByText(/4 days overdue/)).toBeInTheDocument();
    expect(row.querySelector('[data-severity="red"]')).toBeTruthy();
  });

  it("populates output certification status from ctx.aria (certified document shows Certified)", () => {
    const aria = makeAriaSurface();
    aria.record({
      document_id: "DOC-A11-FY26-OM",
      certified: true,
      certifying_actor_id: "E-900",
      certifying_actor_name: "Robin Compliance",
      decision_note: "Meets all A-11 checks.",
      applicable_sources: ["OMB Circular A-11"],
      workflow_step_id: "aria-clear-DOC-A11-FY26-OM",
      certified_at: "2026-06-29T00:00:00.000Z",
    });
    const ctx = { ...makeCtx(), aria } as unknown as SovereignShellContext;

    render(<ClearDashboard ctx={ctx} />);
    const row = screen.getByTestId("output-row-DOC-A11-FY26-OM");
    expect(within(row).getByText("Certified")).toBeInTheDocument();
    // A document with no recorded decision stays pending.
    expect(within(screen.getByTestId("output-row-DOC-OBL-Q3")).getByText(/Pending certification/)).toBeInTheDocument();
  });
});

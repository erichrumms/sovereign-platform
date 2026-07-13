/** @jest-environment jsdom */
/**
 * module-apex — ApexApp.test.tsx
 * The composition root: five tabs; the Portfolio Dashboard is the entry; opening a program
 * navigates to the Program Detail tab; the Execution Monitoring tab shows the live PPBE
 * performance dashboard (Session 32 — replaced the Session 17 stub).
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { ApexApp } from "../src/ApexApp";
import { createSyntheticApexDataAdapter } from "../src/apex-data-adapter";
import { makeCtx } from "./test-helpers";

const adapter = createSyntheticApexDataAdapter();

describe("ApexApp", () => {
  it("renders four tabs and the Portfolio Dashboard by default", () => {
    render(<ApexApp ctx={makeCtx()} adapter={adapter} />);
    expect(screen.getByRole("tab", { name: "Portfolio Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Program Detail" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Report Generation" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Execution Monitoring" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "APEX — Portfolio Dashboard" })).toBeInTheDocument();
  });

  it("navigates to the Program Detail tab when a program is opened", () => {
    render(<ApexApp ctx={makeCtx()} adapter={adapter} />);
    fireEvent.click(screen.getByRole("button", { name: /Joint Logistics Modernization/ }));
    expect(screen.getByRole("heading", { name: "Joint Logistics Modernization" })).toBeInTheDocument();
  });

  it("shows the live PPBE performance dashboard on the Execution Monitoring tab (Session 32)", () => {
    render(<ApexApp ctx={makeCtx()} adapter={adapter} />);
    fireEvent.click(screen.getByRole("tab", { name: "Execution Monitoring" }));
    expect(screen.getByRole("heading", { name: "APEX — PPBE Performance" })).toBeInTheDocument();
    // Honest empty state until the dedicated synthetic-data session lands (Gap 6 Category 1).
    expect(screen.getByText(/No PPBE execution data is recorded yet/)).toBeInTheDocument();
  });

  it("falls back to the portfolio when Program Detail is opened with no selection", () => {
    render(<ApexApp ctx={makeCtx()} adapter={adapter} />);
    fireEvent.click(screen.getByRole("tab", { name: "Program Detail" }));
    expect(screen.getByRole("heading", { name: "APEX — Portfolio Dashboard" })).toBeInTheDocument();
  });
});

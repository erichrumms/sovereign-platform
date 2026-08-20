/** @jest-environment jsdom */
/**
 * module-apex — ApexApp.test.tsx
 * The composition root: five tabs; the Portfolio Dashboard is the entry; opening a program
 * navigates to the Program Detail tab; the Execution Monitoring tab shows the live PPBE
 * performance dashboard (Session 32 — replaced the Session 17 stub).
 */
import { render, screen, fireEvent, within } from "@testing-library/react";

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

  it("shows the live PPBE performance dashboard with REAL seeded metrics on the Execution Monitoring tab (Session 33)", () => {
    render(<ApexApp ctx={makeCtx()} adapter={adapter} />);
    fireEvent.click(screen.getByRole("tab", { name: "Execution Monitoring" }));
    expect(screen.getByRole("heading", { name: "APEX — Execution Monitoring" })).toBeInTheDocument();
    // The Session 32 empty state is gone — the host adapter feeds the seeded portfolio.
    expect(screen.queryByText(/No PPBE execution data is recorded yet/)).not.toBeInTheDocument();
    expect(screen.getByText(/Logistics Data Interchange Modernization has obligated \$802,000 of \$825,000 planned\./)).toBeInTheDocument();
    expect(screen.getByText(/15 of 22 evaluation findings are feeding the planning cycle/)).toBeInTheDocument();
  });

  it("shows a hint when Program Detail is opened with no program selected (WF-4)", () => {
    render(<ApexApp ctx={makeCtx()} adapter={adapter} />);
    fireEvent.click(screen.getByRole("tab", { name: "Program Detail" }));
    expect(screen.getByText(/Select a program from the Portfolio Dashboard to view its detail/)).toBeInTheDocument();
  });

  // F-42 (Session 118): Export Dossier on a non-default program's row carries that
  // program into Report Generation — the dropdown no longer resets to P-100.
  it("F-42: Export Dossier on P-300 lands on Report Generation with P-300 selected", () => {
    render(<ApexApp ctx={makeCtx()} adapter={adapter} />);
    const row = screen.getByText(/Depot Modernization/).closest("tr") as HTMLElement;
    fireEvent.click(within(row).getByRole("button", { name: "Export Dossier" }));
    expect(screen.getByRole("heading", { name: "APEX — Report Generation" })).toBeInTheDocument();
    expect(screen.getByLabelText("program")).toHaveValue("P-300");
  });
});

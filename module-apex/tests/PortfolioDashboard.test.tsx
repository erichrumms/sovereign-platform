/** @jest-environment jsdom */
/**
 * module-apex — PortfolioDashboard.test.tsx (D-APEX-2)
 * Renders the program list with plain-prose status (Gap 5), the Category-2 governance banners
 * (Gap 6), an Export Dossier button on each row (DC-2), and emits APEX_ANALYSIS_STARTED on load.
 */
import { render, screen, fireEvent, within } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { PortfolioDashboard } from "../src/PortfolioDashboard";
import { createSyntheticApexDataAdapter } from "../src/apex-data-adapter";
import { makeCtx } from "./test-helpers";

const adapter = createSyntheticApexDataAdapter();

function renderDash(over: { logSink?: SovereignLogEvent[]; onOpen?: (id: string) => void; onExport?: (id: string) => void } = {}) {
  return render(
    <PortfolioDashboard
      ctx={makeCtx({ logSink: over.logSink })}
      adapter={adapter}
      onOpenProgram={over.onOpen ?? (() => {})}
      onExportDossier={over.onExport ?? (() => {})}
    />
  );
}

describe("PortfolioDashboard", () => {
  it("renders the Gate-1 and GD-10 governance banners (Category 2)", () => {
    renderDash();
    expect(screen.getByText(/AI disclosure \(CPMI-VRS Gate 1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Classification boundary \(GD-10\)/)).toBeInTheDocument();
  });

  it("lists each program with plain-prose completion (Gap 5)", () => {
    renderDash();
    expect(screen.getByText(/Joint Logistics Modernization/)).toBeInTheDocument();
    expect(screen.getByText("62 percent complete")).toBeInTheDocument();
    // Two programs are at risk (P-100, P-150) — both render an "At risk" status pill.
    expect(screen.getAllByText(/At risk/).length).toBeGreaterThanOrEqual(2);
  });

  it("shows an Export Dossier button on every program row", () => {
    renderDash();
    expect(screen.getAllByRole("button", { name: "Export Dossier" })).toHaveLength(adapter.listPrograms().length);
  });

  it("emits APEX_ANALYSIS_STARTED when the portfolio view loads", () => {
    const logSink: SovereignLogEvent[] = [];
    renderDash({ logSink });
    const started = logSink.find((e) => e.event_type === "APEX_ANALYSIS_STARTED");
    expect(started).toBeDefined();
    expect(started!.workflow_step_id).toBe("apex-portfolio-overview");
    expect(started!.payload).toMatchObject({ view: "portfolio" });
  });

  it("invokes the open + export callbacks", () => {
    const onOpen = jest.fn();
    const onExport = jest.fn();
    renderDash({ onOpen, onExport });
    fireEvent.click(screen.getByRole("button", { name: /Joint Logistics Modernization/ }));
    expect(onOpen).toHaveBeenCalledWith("P-100");
    const p100Row = screen.getByText(/Joint Logistics Modernization/).closest("tr")!;
    fireEvent.click(within(p100Row).getByRole("button", { name: "Export Dossier" }));
    expect(onExport).toHaveBeenCalledWith("P-100");
  });
});

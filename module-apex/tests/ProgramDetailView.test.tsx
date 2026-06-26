/** @jest-environment jsdom */
/**
 * module-apex — ProgramDetailView.test.tsx (D-APEX-3)
 * Renders P-100 in plain prose; every risk flag is clickable and opens the DC-3 provenance
 * panel (emitting APEX_PROVENANCE_VIEWED); reasoning history is expandable; the Export Dossier
 * button is always visible.
 */
import { render, screen, fireEvent } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { ProgramDetailView } from "../src/ProgramDetailView";
import { createSyntheticApexDataAdapter } from "../src/apex-data-adapter";
import { makeCtx } from "./test-helpers";

const adapter = createSyntheticApexDataAdapter();

function renderDetail(logSink?: SovereignLogEvent[]) {
  return render(
    <ProgramDetailView
      ctx={makeCtx({ logSink })}
      adapter={adapter}
      programId="P-100"
      onExportDossier={() => {}}
      onBack={() => {}}
    />
  );
}

describe("ProgramDetailView", () => {
  it("renders the program status narrative in plain prose (Gap 5)", () => {
    renderDetail();
    expect(screen.getByRole("heading", { name: "Joint Logistics Modernization" })).toBeInTheDocument();
    expect(screen.getByText(/62 percent through its execution phase/)).toBeInTheDocument();
  });

  it("always shows the Export Dossier button", () => {
    renderDetail();
    expect(screen.getByRole("button", { name: "Export Dossier" })).toBeInTheDocument();
  });

  it("opens the DC-3 provenance panel when a risk flag is clicked, and logs APEX_PROVENANCE_VIEWED", () => {
    const logSink: SovereignLogEvent[] = [];
    renderDetail(logSink);
    // Click the first risk flag (cost variance).
    fireEvent.click(screen.getByText(/Cost variance is trending unfavorably — actual costs are running about 8 percent/));
    expect(screen.getByLabelText("Data provenance")).toBeInTheDocument();
    expect(screen.getByText("Source record")).toBeInTheDocument();
    const viewed = logSink.find((e) => e.event_type === "APEX_PROVENANCE_VIEWED");
    expect(viewed).toBeDefined();
    expect(viewed!.payload).toMatchObject({ program_id: "P-100", field_id: "P-100-R1" });
  });

  it("expands a reasoning-chain entry on demand", () => {
    renderDetail();
    const toggles = screen.getAllByRole("button", { name: /show detail/ });
    fireEvent.click(toggles[0]);
    expect(screen.getByText(/Recommendation:/)).toBeInTheDocument();
  });
});

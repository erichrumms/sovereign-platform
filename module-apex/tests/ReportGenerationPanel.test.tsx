/** @jest-environment jsdom */
/**
 * module-apex — ReportGenerationPanel.test.tsx (D-APEX-4)
 * The full report flow: generate (analysis runs key-less → static tier, with a transparent
 * Category-1 notice), the report renders, attestation enables export, and the DC-2 dossier
 * export confirmation appears. Also: the sovereignHold() gate blocks generation when held.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { ReportGenerationPanel } from "../src/ReportGenerationPanel";
import { createSyntheticApexDataAdapter } from "../src/apex-data-adapter";
import { makeCtx } from "./test-helpers";

const adapter = createSyntheticApexDataAdapter();

describe("ReportGenerationPanel", () => {
  it("generates a report (static tier in dev) and exports a dossier after attestation", async () => {
    const logSink: SovereignLogEvent[] = [];
    render(<ReportGenerationPanel ctx={makeCtx({ logSink })} adapter={adapter} />);

    fireEvent.click(screen.getByRole("button", { name: "Generate Report" }));

    // The report renders; the live-unavailable Category-1 notice is shown.
    await waitFor(() => expect(screen.getByText(/Monthly Status Report — /)).toBeInTheDocument());
    expect(screen.getByText(/Live analysis service unavailable/)).toBeInTheDocument();
    expect(logSink.map((e) => e.event_type)).toEqual(
      expect.arrayContaining(["APEX_ANALYSIS_STARTED", "APEX_ANALYSIS_COMPLETE", "APEX_REPORT_GENERATED"])
    );

    // Export is gated on attestation.
    fireEvent.change(screen.getByLabelText("attestation note"), { target: { value: "Reviewed and accepted the analysis." } });
    fireEvent.click(screen.getByRole("button", { name: "Attest report" }));
    fireEvent.click(screen.getByRole("button", { name: "Export Dossier" }));

    await waitFor(() => expect(screen.getByText(/complete program dossier for P-100 was exported/)).toBeInTheDocument());
    const types = logSink.map((e) => e.event_type);
    expect(types).toContain("HUMAN_DECISION"); // REPORT_ATTESTATION
    expect(types).toContain("APEX_DOSSIER_EXPORTED");
  });

  it("blocks generation with a plain-prose hold notice when APEX is on hold", async () => {
    render(<ReportGenerationPanel ctx={makeCtx({ onHold: ["APEX"] })} adapter={adapter} />);
    fireEvent.click(screen.getByRole("button", { name: "Generate Report" }));
    // The hold reason is unique to the held path (the label shares a prefix with it).
    await waitFor(() => expect(screen.getByText(/resolve the hold before a report is generated/)).toBeInTheDocument());
    expect(screen.queryByText(/Monthly Status Report — /)).not.toBeInTheDocument();
  });
});

/** @jest-environment jsdom */
/**
 * module-apex — percent-symbol-convention.test.tsx (Session 118, F-40/F-45)
 *
 * User-facing percentages use the "%" symbol, never the spelled-out word.
 * The defect class ("62 percent complete", "30 percent complete",
 * "8 percentage points above...") recurred on three surfaces after the Home
 * Dashboard instance was fixed in Session 116 (F-9/F-11). This test is the
 * tripwire the Session 118 Build Brief asked for: a recurrence fails here in
 * review instead of in a fourth rehearsal screenshot.
 */
import { render, screen } from "@testing-library/react";

import { PortfolioDashboard } from "../src/PortfolioDashboard";
import { createSyntheticApexDataAdapter } from "../src/apex-data-adapter";
import { SYNTHETIC_PROGRAMS } from "../src/synthetic-world-model";
import { makeCtx } from "./test-helpers";

// Numeric value followed by the spelled-out word — the exact defect shape.
const SPELLED_OUT = /\d\s+percent\b|percentage points/;

describe("percent symbol convention (F-40/F-45)", () => {
  it("no synthetic World Model narrative spells out 'percent' after a number", () => {
    // Every user-visible string in the program records travels through here —
    // status narratives, risk-flag summaries, and DC-3 evidence fields.
    const allText = JSON.stringify(SYNTHETIC_PROGRAMS);
    const match = allText.match(SPELLED_OUT);
    expect(match ? `found: "...${allText.slice(Math.max(0, (match.index ?? 0) - 40), (match.index ?? 0) + 40)}..."` : null).toBeNull();
  });

  it("the Portfolio Dashboard completion column renders the % symbol", () => {
    render(
      <PortfolioDashboard
        ctx={makeCtx()}
        adapter={createSyntheticApexDataAdapter()}
        onOpenProgram={() => {}}
        onExportDossier={() => {}}
      />
    );
    expect(screen.getByText("62% complete")).toBeInTheDocument();
    expect(screen.queryByText(/\d\s+percent\b/)).toBeNull();
  });
});

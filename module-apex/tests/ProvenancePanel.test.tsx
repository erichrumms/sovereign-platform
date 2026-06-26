/** @jest-environment jsdom */
/**
 * module-apex — ProvenancePanel.test.tsx
 * The generic DC-3 panel renders all five provenance fields with plain-language labels, by
 * entity type, and closes on demand.
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { ProvenancePanel } from "../src/ProvenancePanel";
import type { ProvenanceRecord } from "../src/apex-contract";

const record: ProvenanceRecord = {
  entity_type: "World Model risk flag",
  field_label: "Cost variance",
  source_data: "CPMI World Model cost ledger for P-100.",
  baseline: "Planned spend of 58 percent.",
  last_updated: "2026-05-31",
  trend: "DEGRADING",
  responsible_party: "Alex Reed",
};

describe("ProvenancePanel", () => {
  it("renders all five DC-3 fields with plain-language labels", () => {
    render(<ProvenancePanel record={record} onClose={() => {}} />);
    expect(screen.getByText("World Model risk flag")).toBeInTheDocument();
    expect(screen.getByText("Cost variance")).toBeInTheDocument();
    expect(screen.getByText("Source record")).toBeInTheDocument();
    expect(screen.getByText(/CPMI World Model cost ledger/)).toBeInTheDocument();
    expect(screen.getByText("Baseline (expected value)")).toBeInTheDocument();
    expect(screen.getByText("Date last updated")).toBeInTheDocument();
    expect(screen.getByText("2026-05-31")).toBeInTheDocument();
    expect(screen.getByText("Trend over time")).toBeInTheDocument();
    expect(screen.getByText(/Degrading over time/)).toBeInTheDocument();
    expect(screen.getByText("Responsible party")).toBeInTheDocument();
    expect(screen.getByText("Alex Reed")).toBeInTheDocument();
  });

  it("calls onClose", () => {
    const onClose = jest.fn();
    render(<ProvenancePanel record={record} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /close provenance panel/i }));
    expect(onClose).toHaveBeenCalled();
  });
});

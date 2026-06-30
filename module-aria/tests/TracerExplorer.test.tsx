/** @jest-environment jsdom */
/**
 * module-aria — TracerExplorer.test.tsx (Session 24 · D5)
 * The TRACER Traceability Explorer: the permanent determinism notice, the output-type picker,
 * chain rendering for each output type, explicit per-node citation markers, honest amber orphan
 * display (never hidden, never asserted complete), and the not-yet-integrated obligation message.
 */
import { render, screen, fireEvent, within } from "@testing-library/react";

import { TracerExplorer } from "../src/TracerExplorer";
import { makeCtx } from "./test-helpers";

function selectItem(testId: string, value: string): void {
  fireEvent.change(screen.getByTestId(testId), { target: { value } });
}

describe("TracerExplorer (D2)", () => {
  it("shows the permanent TRACER determinism guardrail", () => {
    render(<TracerExplorer ctx={makeCtx()} />);
    expect(screen.getByText(/How TRACER works:/)).toBeInTheDocument();
    expect(screen.getByText(/does not analyze, judge, or infer/)).toBeInTheDocument();
  });

  it("offers all three output types and prompts for a selection", () => {
    render(<TracerExplorer ctx={makeCtx()} />);
    expect(screen.getByTestId("tracer-type-decision")).toBeInTheDocument();
    expect(screen.getByTestId("tracer-type-document")).toBeInTheDocument();
    expect(screen.getByTestId("tracer-type-obligation")).toBeInTheDocument();
    expect(screen.getByTestId("tracer-empty")).toBeInTheDocument();
  });

  it("renders a complete decision chain with citation markers when a regulation basis exists", () => {
    render(<TracerExplorer ctx={makeCtx()} />);
    selectItem("tracer-item-select", "DR-COUNSEL-0008"); // illustrative-basis demo decision
    const chain = screen.getByTestId("tracer-chain");
    expect(chain).toHaveAttribute("data-complete", "true");
    expect(screen.getByTestId("tracer-complete")).toBeInTheDocument();
    // Every node makes its citation explicit (ARIA Gap 6) — at least one "Cited from" marker.
    expect(screen.getAllByText(/Cited from/).length).toBeGreaterThan(0);
  });

  it("shows an orphan decision chain in amber with a plain-prose reason (today-COUNSEL shape)", () => {
    render(<TracerExplorer ctx={makeCtx()} />);
    selectItem("tracer-item-select", "DR-COUNSEL-0007"); // no regulation_basis — must orphan
    const chain = screen.getByTestId("tracer-chain");
    expect(chain).toHaveAttribute("data-complete", "false");
    expect(screen.getByTestId("tracer-orphan-reason").textContent).toMatch(/regulation basis/);
    expect(screen.getAllByText(/No traceable source/).length).toBeGreaterThan(0);
  });

  it("traces a SCRIBE document chain when the document type is selected", () => {
    render(<TracerExplorer ctx={makeCtx()} />);
    fireEvent.click(screen.getByTestId("tracer-type-document"));
    selectItem("tracer-item-select", "SCR-EXHIBIT-FY26-OM");
    const chain = screen.getByTestId("tracer-chain");
    expect(chain).toHaveAttribute("data-complete", "true");
    // The draft node cites the real scribe-drafter Logger event.
    expect(screen.getByText(/Draft recorded by scribe-drafter/)).toBeInTheDocument();
  });

  it("shows the not-yet-integrated message for an obligation chain", () => {
    render(<TracerExplorer ctx={makeCtx()} />);
    fireEvent.click(screen.getByTestId("tracer-type-obligation"));
    selectItem("tracer-item-select", "OBL-FY26-0042");
    expect(screen.getByTestId("tracer-chain")).toHaveAttribute("data-complete", "false");
    expect(
      screen.getByText(/has not yet been integrated into the PPBE tracking system/)
    ).toBeInTheDocument();
  });

  it("resets the item selection when the output type changes", () => {
    render(<TracerExplorer ctx={makeCtx()} />);
    selectItem("tracer-item-select", "DR-COUNSEL-0007");
    expect(screen.getByTestId("tracer-chain")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("tracer-type-document"));
    // After switching type, nothing is selected → the empty prompt returns.
    expect(screen.getByTestId("tracer-empty")).toBeInTheDocument();
  });

  it("links each traceable node to a source reference a reviewer can open", () => {
    render(<TracerExplorer ctx={makeCtx()} />);
    selectItem("tracer-item-select", "DR-COUNSEL-0008");
    const chain = screen.getByTestId("tracer-chain");
    expect(within(chain).getAllByText(/Reference:/).length).toBeGreaterThan(0);
  });
});

/** @jest-environment jsdom */
/**
 * module-scribe — ScribeApp.test.tsx
 * The scaffold renders the SCRIBE chrome and the eight-mode selector, and shows a
 * mode's destination + schema binding when selected.
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { ScribeApp } from "../src/ScribeApp";
import { makeCtx } from "./test-helpers";

describe("ScribeApp (scaffold)", () => {
  it("renders the SCRIBE chrome and the eight drafting modes", () => {
    render(<ScribeApp ctx={makeCtx()} />);
    expect(screen.getByRole("heading", { name: "SCRIBE", level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Drafting & Style DNA/)).toBeInTheDocument();
    const list = screen.getByRole("list", { name: /drafting modes/i });
    expect(list.querySelectorAll('[role="listitem"]')).toHaveLength(8);
  });

  it("shows the destination binding when a product-intake mode is selected", () => {
    render(<ScribeApp ctx={makeCtx()} />);
    // Click the mode-button label (unique before selection); the click bubbles to
    // the button's onClick.
    fireEvent.click(screen.getByText("Correspondence Draft"));
    expect(screen.getByRole("heading", { name: "Correspondence Draft" })).toBeInTheDocument();
    expect(screen.getByText(/Destination:/)).toBeInTheDocument();
    expect(screen.getAllByText(/NEXUS/).length).toBeGreaterThan(0);
  });

  it("marks an intermediate mode as having no product intake", () => {
    render(<ScribeApp ctx={makeCtx()} />);
    fireEvent.click(screen.getByText("Synthesis"));
    expect(screen.getByText(/feeds another drafting mode; no product intake/)).toBeInTheDocument();
  });
});

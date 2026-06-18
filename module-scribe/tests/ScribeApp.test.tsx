/** @jest-environment jsdom */
/**
 * module-scribe — ScribeApp.test.tsx
 * The composition root renders the SCRIBE chrome and the eight-mode selector.
 * Selecting one of the six product-aligned modes opens the DraftWorkspace; the two
 * intermediate modes show the later-session notice.
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { ScribeApp } from "../src/ScribeApp";
import { makeCtx } from "./test-helpers";

describe("ScribeApp", () => {
  it("renders the SCRIBE chrome and the eight drafting modes", () => {
    render(<ScribeApp ctx={makeCtx()} />);
    expect(screen.getByRole("heading", { name: "SCRIBE", level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Drafting & Style DNA/)).toBeInTheDocument();
    const list = screen.getByRole("list", { name: /drafting modes/i });
    expect(list.querySelectorAll('[role="listitem"]')).toHaveLength(8);
  });

  it("opens the drafting workspace when a product-intake mode is selected", () => {
    render(<ScribeApp ctx={makeCtx()} />);
    // Click the mode-button label (unique before selection); the click bubbles to
    // the button's onClick.
    fireEvent.click(screen.getByText("Correspondence Draft"));
    expect(screen.getByRole("heading", { name: "Correspondence Draft" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Captured material/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generate draft/i })).toBeInTheDocument();
    expect(screen.getAllByText(/NEXUS/).length).toBeGreaterThan(0);
  });

  it("shows a later-session notice for an intermediate mode (no product intake)", () => {
    render(<ScribeApp ctx={makeCtx()} />);
    fireEvent.click(screen.getByText("Synthesis"));
    expect(screen.getByText(/feeds another drafting mode/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /generate draft/i })).not.toBeInTheDocument();
  });
});

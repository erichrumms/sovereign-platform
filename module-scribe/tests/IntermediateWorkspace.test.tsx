/** @jest-environment jsdom */
/**
 * module-scribe — IntermediateWorkspace.test.tsx
 * The synthesis/framing surface: capture → produce prose → carry forward. No product
 * export gate, no schema-validation UI. Key-less, so it serves the static tier.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { IntermediateWorkspace } from "../src/IntermediateWorkspace";
import { makeCtx } from "./test-helpers";

describe("IntermediateWorkspace", () => {
  it("disables the action until material is captured", () => {
    render(<IntermediateWorkspace ctx={makeCtx()} mode="synthesis" label="Synthesis" />);
    expect(screen.getByRole("button", { name: /Synthesize material/i })).toBeDisabled();
  });

  it("produces intermediate prose (static tier) and offers no product export", async () => {
    render(<IntermediateWorkspace ctx={makeCtx()} mode="synthesis" label="Synthesis" />);

    fireEvent.change(screen.getByLabelText(/Captured material/i), {
      target: { value: "Three sources to reconcile." },
    });
    fireEvent.click(screen.getByRole("button", { name: /Synthesize material/i }));

    await waitFor(() => {
      expect(screen.getByLabelText("intermediate prose")).toBeInTheDocument();
    });
    // Carry-forward artifact — no export-to-product control.
    expect(screen.getByText(/nothing leaves SCRIBE here/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /export to/i })).not.toBeInTheDocument();
    expect(screen.getByText("STATIC")).toBeInTheDocument();
  });

  it("uses the framing verb and purpose for the framing mode", () => {
    render(<IntermediateWorkspace ctx={makeCtx()} mode="framing" label="Framing" />);
    expect(screen.getByRole("button", { name: /Frame material/i })).toBeInTheDocument();
    expect(screen.getByText(/FLOWPATH/)).toBeInTheDocument();
  });
});

/** @jest-environment jsdom */
/**
 * module-cpmi — ReasoningChainPanel.test.tsx
 * Shows the Gate 1 AI disclosure, runs the chain (static tier, key-less), and renders the
 * schema-validated output sections with serving-tier disclosure.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { ReasoningChainPanel } from "../src/ReasoningChainPanel";
import { makeCtx } from "./test-helpers";

describe("ReasoningChainPanel", () => {
  it("carries the CPMI-VRS Gate 1 AI disclosure", () => {
    render(<ReasoningChainPanel ctx={makeCtx()} />);
    expect(screen.getByLabelText("Reasoning Chain")).toHaveTextContent(/Gate 1 — AI disclosure/i);
    expect(screen.getByLabelText("Reasoning Chain")).toHaveTextContent(/0\.7×/);
  });

  it("runs the chain and renders the output (static tier, key-less)", async () => {
    render(<ReasoningChainPanel ctx={makeCtx()} />);
    fireEvent.click(screen.getByRole("button", { name: /Run reasoning chain/i }));

    await waitFor(() => expect(screen.getByLabelText("Reasoning Output")).toBeInTheDocument());
    expect(screen.getByText("STATIC")).toBeInTheDocument();
    expect(screen.getByLabelText("Reasoning Output")).toHaveTextContent(/Recommendation/);
    expect(screen.getByLabelText("Reasoning Output")).toHaveTextContent(/schema_valid/);
  });
});

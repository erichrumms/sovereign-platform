/** @jest-environment jsdom */
/**
 * module-flowpath — FlowpathApp.test.tsx
 * The composition root: the FLOWPATH header renders, the Session Manager is the default surface,
 * and the tab bar switches to the Elicitation Dialogue.
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { FlowpathApp } from "../src/FlowpathApp";
import { makeCtx } from "./test-helpers";

describe("FlowpathApp", () => {
  it("renders the FLOWPATH header and defaults to the Session Manager", () => {
    render(<FlowpathApp ctx={makeCtx()} />);
    expect(screen.getByRole("heading", { name: "FLOWPATH" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: /elicitation sessions/i })).toBeInTheDocument();
  });

  it("switches to the Elicitation Dialogue via the tab bar", () => {
    render(<FlowpathApp ctx={makeCtx()} />);
    fireEvent.click(screen.getByRole("tab", { name: /elicitation dialogue/i }));
    expect(screen.getByRole("list", { name: /five-question gate status/i })).toBeInTheDocument();
  });

  it("WC-1: clicking a gate-passed session card navigates to the Artifact Review screen", () => {
    render(<FlowpathApp ctx={makeCtx()} />);
    // Default surface is the Session Manager; click the gate-passed (actionable) session.
    const row = screen.getByText(/Operational workflow — with the Program Analyst/i).closest("li")!;
    fireEvent.click(row);
    // Artifact Review (Screen 3) is now shown.
    expect(screen.getByTestId("artifact-review")).toBeInTheDocument();
  });
});

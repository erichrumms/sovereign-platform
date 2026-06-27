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
});

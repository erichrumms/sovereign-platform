/** @jest-environment jsdom */
/**
 * module-counsel — CounselApp.test.tsx
 * Smoke test of the composition root: it mounts with the COUNSEL chrome and starts
 * the flow at the DecisionFramer, whose first screen is the non-dismissible
 * CPMI-VRS Gate 1 AI-disclosure (spec §7 Gate 1 — shown before framing begins).
 */
import { render, screen } from "@testing-library/react";

import { CounselApp } from "../src/CounselApp";
import { makeCtx } from "./test-helpers";

describe("CounselApp", () => {
  it("renders the COUNSEL header and the Gate 1 disclosure entry point", () => {
    const { ctx } = makeCtx();
    render(<CounselApp ctx={ctx} />);
    expect(screen.getByRole("heading", { name: "COUNSEL", level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Human Decision Support/)).toBeInTheDocument();
    // Gate 1: the AI-disclosure dialog is shown before framing can begin.
    expect(screen.getByRole("dialog", { name: /AI disclosure/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /CPMI-VRS Gate 1/ })).toBeInTheDocument();
  });
});

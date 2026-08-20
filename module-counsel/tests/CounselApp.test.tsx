/** @jest-environment jsdom */
/**
 * module-counsel — CounselApp.test.tsx
 * Smoke test of the composition root: it mounts with the COUNSEL chrome and starts
 * the flow at the DecisionFramer, whose first screen is the non-dismissible
 * CPMI-VRS Gate 1 AI-disclosure (spec §7 Gate 1 — shown before framing begins).
 */
import { render, screen, fireEvent } from "@testing-library/react";

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

  // Session 122 (Session 121 survey Finding 5): the slim Gate 1 strip persists past
  // framing — previously it lived only inside DecisionFramer and disappeared with it,
  // leaving the AI-output stages with no visible disclosure.
  it("keeps a visible Gate 1 disclosure strip after framing completes, exactly once", () => {
    const { ctx } = makeCtx();
    render(<CounselApp ctx={ctx} />);

    fireEvent.click(screen.getByRole("button", { name: /I understand — begin framing/ }));
    // Framing stage: the strip renders from inside DecisionFramer.
    expect(screen.getAllByText(/CPMI-VRS Gate 1 acknowledged/)).toHaveLength(1);

    // Complete the five required frame fields and submit.
    fireEvent.change(screen.getByLabelText(/Decision statement/), { target: { value: "Approve the Q3 vendor change request?" } });
    fireEvent.change(screen.getByLabelText(/Stakes/), { target: { value: "A wrong approval propagates to the cost baseline." } });
    const source = screen.getByLabelText(/Source product/) as HTMLSelectElement;
    fireEvent.change(source, { target: { value: source.options[source.options.length - 1].value } });
    const dtype = screen.getByLabelText(/Decision type/) as HTMLSelectElement;
    fireEvent.change(dtype, { target: { value: dtype.options[dtype.options.length - 1].value } });
    fireEvent.change(screen.getByLabelText(/Workflow step id/), { target: { value: "TEST-step-1" } });
    fireEvent.click(screen.getByRole("button", { name: "Run analysis" }));

    // The framer (and its own strip) unmounted — the CounselApp root strip persists,
    // still exactly one instance.
    expect(screen.getAllByText(/CPMI-VRS Gate 1 acknowledged/)).toHaveLength(1);
  });
});

/** @jest-environment jsdom */
/**
 * module-lens — LensApp.test.tsx (LENS core)
 * The chrome renders the LENS header, the signed-in user, and the three surface tabs
 * (Governance Explainer, Pipeline Navigator, AI Transparency). Tab switching swaps the
 * active surface.
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { LensApp } from "../src/LensApp";
import { makeCtx } from "./test-helpers";

describe("LensApp (core)", () => {
  it("renders the LENS chrome and the signed-in user", () => {
    render(<LensApp ctx={makeCtx()} />);
    expect(screen.getByRole("heading", { name: "LENS", level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Orientation & Explanation/)).toBeInTheDocument();
    expect(screen.getByText(/Sam Reader/)).toBeInTheDocument();
  });

  it("defaults to the Governance Explainer surface", () => {
    render(<LensApp ctx={makeCtx()} />);
    expect(screen.getByLabelText("Governance Explainer")).toBeInTheDocument();
    expect(screen.queryByLabelText("Pipeline Navigator")).not.toBeInTheDocument();
  });

  it("switches surfaces when a tab is clicked", () => {
    render(<LensApp ctx={makeCtx()} />);
    fireEvent.click(screen.getByRole("tab", { name: "Pipeline Navigator" }));
    expect(screen.getByLabelText("Pipeline Navigator")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "AI Transparency" }));
    expect(screen.getByLabelText("AI Transparency Panel")).toBeInTheDocument();
  });
});

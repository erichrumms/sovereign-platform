/** @jest-environment jsdom */
/**
 * module-lens — LensApp.test.tsx
 * The scaffold chrome renders the LENS header, the signed-in user, and the three
 * honest orientation stubs (Governance Explainer, Pipeline Navigator, AI Transparency
 * Panel) — without implying LENS core is operational.
 */
import { render, screen } from "@testing-library/react";

import { LensApp } from "../src/LensApp";
import { makeCtx } from "./test-helpers";

describe("LensApp (scaffold)", () => {
  it("renders the LENS chrome and the signed-in user", () => {
    render(<LensApp ctx={makeCtx()} />);
    expect(screen.getByRole("heading", { name: "LENS", level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Orientation & Explanation/)).toBeInTheDocument();
    expect(screen.getByText(/Sam Reader/)).toBeInTheDocument();
  });

  it("renders the three orientation stubs, marked not yet wired", () => {
    render(<LensApp ctx={makeCtx()} />);
    expect(screen.getByLabelText("Governance Explainer")).toHaveTextContent(/Not yet wired/i);
    expect(screen.getByLabelText("Pipeline Navigator")).toHaveTextContent(/Not yet wired/i);
    expect(screen.getByLabelText("AI Transparency Panel")).toHaveTextContent(/Not yet wired/i);
  });

  it("names the knowledge-base source documents the explainer will use", () => {
    render(<LensApp ctx={makeCtx()} />);
    expect(screen.getByLabelText("Governance Explainer")).toHaveTextContent(/vigil_alert_response\.md/);
  });
});

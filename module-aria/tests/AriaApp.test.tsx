/** @jest-environment jsdom */
/**
 * module-aria — AriaApp.test.tsx (D4 scaffold)
 * The composition root renders the ARIA chrome with the determinism + GD-10 governance banners
 * (Category 2, blue), routes between the CLEAR / TRACER / ARC placeholder panels, and keeps every
 * surface in plain prose (Gap 5) with the three Gap-6 content categories visually present.
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { AriaApp } from "../src/AriaApp";
import { makeCtx } from "./test-helpers";

describe("AriaApp (Stage 6 scaffold)", () => {
  it("renders the ARIA Suite header", () => {
    render(<AriaApp ctx={makeCtx()} />);
    expect(screen.getByRole("heading", { name: /ARIA Suite/i, level: 1 })).toBeInTheDocument();
  });

  it("renders the ARIA determinism guardrail (Category 2, blue) — no AI in any decision path", () => {
    const { container } = render(<AriaApp ctx={makeCtx()} />);
    const banner = Array.from(container.querySelectorAll('[data-category="2-governance"]')).find((b) =>
      /no AI model is used in any ARIA decision path/i.test(b.textContent ?? "")
    );
    expect(banner).toBeTruthy();
    expect(banner as HTMLElement).toHaveStyle({ color: "#1e40af" });
  });

  it("renders the GD-10 classification boundary banner (Category 2)", () => {
    render(<AriaApp ctx={makeCtx()} />);
    expect(screen.getByText(/Classification boundary \(GD-10\)/)).toBeInTheDocument();
    expect(screen.getByText(/UNCLASSIFIED data only/i)).toBeInTheDocument();
  });

  it("offers the three ARIA components as tabs (CLEAR / TRACER / ARC)", () => {
    render(<AriaApp ctx={makeCtx()} />);
    expect(screen.getByRole("tab", { name: "CLEAR" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "TRACER" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "ARC" })).toBeInTheDocument();
  });

  it("defaults to the CLEAR panel", () => {
    render(<AriaApp ctx={makeCtx()} />);
    expect(screen.getByTestId("aria-panel-clear")).toBeInTheDocument();
    expect(screen.queryByTestId("aria-panel-tracer")).not.toBeInTheDocument();
    expect(screen.getByText(/Continuous Legal and Regulatory Evaluation/i)).toBeInTheDocument();
  });

  it("routes to the TRACER panel via its tab", () => {
    render(<AriaApp ctx={makeCtx()} />);
    fireEvent.click(screen.getByRole("tab", { name: "TRACER" }));
    expect(screen.getByTestId("aria-panel-tracer")).toBeInTheDocument();
    expect(screen.queryByTestId("aria-panel-clear")).not.toBeInTheDocument();
    expect(screen.getByText(/Traceability and Accountability Chain/i)).toBeInTheDocument();
  });

  it("routes to the ARC panel via its tab", () => {
    render(<AriaApp ctx={makeCtx()} />);
    fireEvent.click(screen.getByRole("tab", { name: "ARC" }));
    expect(screen.getByTestId("aria-panel-arc")).toBeInTheDocument();
    expect(screen.getByText(/Adaptive Regulatory Change engine/i)).toBeInTheDocument();
  });

  it("Gap 6: the three content categories are visually present (blue governance + white card)", () => {
    const { container } = render(<AriaApp ctx={makeCtx()} />);
    // Category 2 (blue) guardrails present.
    expect(container.querySelectorAll('[data-category="2-governance"]').length).toBeGreaterThanOrEqual(2);
    // Category 3 (Primary) substantive content in a white card.
    const card = screen.getByTestId("aria-panel-clear");
    expect(card).toHaveStyle({ background: "#ffffff" });
  });

  it("Gap 5: surfaces are plain prose — no SOVEREIGN internals or schema dumps leak", () => {
    const { container } = render(<AriaApp ctx={makeCtx()} />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/agent_id|workflow_step_id|SovereignEventType|input_schema|[{}]/);
  });

  it("shows the reviewer name in the classification boundary (Gap 5)", () => {
    render(<AriaApp ctx={makeCtx({ name: "Dana Reviewer" })} />);
    expect(screen.getByText(/Dana Reviewer/)).toBeInTheDocument();
  });
});

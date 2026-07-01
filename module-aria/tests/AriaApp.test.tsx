/** @jest-environment jsdom */
/**
 * module-aria — AriaApp.test.tsx (Session 25 — ARC live + VRS Gates)
 * The composition root renders the ARIA chrome with the determinism + GD-10 governance banners
 * (Category 2, blue), routes between the live CLEAR, TRACER, ARC panels and the CPMI-VRS Gates tab,
 * and keeps every surface in plain prose (Gap 5) with the three Gap-6 content categories present.
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

  it("offers the three ARIA components plus the CPMI-VRS tab (CLEAR / TRACER / ARC / CPMI-VRS)", () => {
    render(<AriaApp ctx={makeCtx()} />);
    expect(screen.getByRole("tab", { name: "CLEAR" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "TRACER" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "ARC" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "CPMI-VRS" })).toBeInTheDocument();
  });

  it("defaults to the live CLEAR panel (Compliance Dashboard)", () => {
    render(<AriaApp ctx={makeCtx()} />);
    expect(screen.getByTestId("clear-panel")).toBeInTheDocument();
    expect(screen.getByTestId("clear-dashboard")).toBeInTheDocument();
    expect(screen.queryByTestId("aria-panel-tracer")).not.toBeInTheDocument();
    expect(screen.getByText(/Output compliance/i)).toBeInTheDocument();
  });

  it("routes to the live TRACER panel (Traceability Explorer) via its tab", () => {
    render(<AriaApp ctx={makeCtx()} />);
    fireEvent.click(screen.getByRole("tab", { name: "TRACER" }));
    // Session 24 (D2): TRACER is live — the Explorer replaces the scaffold placeholder.
    expect(screen.getByTestId("tracer-explorer")).toBeInTheDocument();
    expect(screen.queryByTestId("aria-panel-tracer")).not.toBeInTheDocument();
    expect(screen.queryByTestId("clear-panel")).not.toBeInTheDocument();
    expect(screen.getByText(/How TRACER works:/)).toBeInTheDocument();
  });

  it("routes to the live ARC panel (Regulatory Impact Modeler) via its tab", () => {
    render(<AriaApp ctx={makeCtx()} />);
    fireEvent.click(screen.getByRole("tab", { name: "ARC" }));
    // Session 25 (D2): ARC is live — the Impact Modeler replaces the scaffold placeholder.
    expect(screen.getByTestId("arc-impact-modeler")).toBeInTheDocument();
    expect(screen.queryByTestId("aria-panel-arc")).not.toBeInTheDocument();
    expect(screen.getByText(/How ARC works:/)).toBeInTheDocument();
  });

  it("routes to the CPMI-VRS Gates tab via its tab", () => {
    render(<AriaApp ctx={makeCtx()} />);
    fireEvent.click(screen.getByRole("tab", { name: "CPMI-VRS" }));
    expect(screen.getByTestId("aria-vrs-gates")).toBeInTheDocument();
    expect(screen.getByText(/Determinism Verification/)).toBeInTheDocument();
  });

  it("D-7: the Category 2 banners render exactly once on the CPMI-VRS tab (no duplicate)", () => {
    render(<AriaApp ctx={makeCtx()} />);
    fireEvent.click(screen.getByRole("tab", { name: "CPMI-VRS" }));
    expect(screen.getByTestId("aria-vrs-gates")).toBeInTheDocument();
    // Both app-shell guardrails appear once — the tab no longer renders its own copies.
    expect(screen.getAllByText(/Classification boundary \(GD-10\)/)).toHaveLength(1);
    expect(screen.getAllByText(/How ARIA reaches its findings:/)).toHaveLength(1);
  });

  it("Gap 6: the three content categories are visually present (blue governance + white card)", () => {
    const { container } = render(<AriaApp ctx={makeCtx()} />);
    // Category 2 (blue) guardrails present.
    expect(container.querySelectorAll('[data-category="2-governance"]').length).toBeGreaterThanOrEqual(2);
    // Category 3 (Primary) substantive content in a white card (the live CLEAR dashboard surface).
    const card = screen.getByTestId("clear-surface-output");
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

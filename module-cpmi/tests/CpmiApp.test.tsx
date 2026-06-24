/** @jest-environment jsdom */
/**
 * module-cpmi — CpmiApp.test.tsx
 * Renders the CPMI chrome and three tabs; defaults to the Reasoning Chain; switches to
 * the World Model and CPMI-VRS Gates surfaces.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { CpmiApp } from "../src/CpmiApp";
import { makeCtx } from "./test-helpers";

describe("CpmiApp", () => {
  it("renders the chrome and defaults to the Reasoning Chain", () => {
    render(<CpmiApp ctx={makeCtx()} />);
    expect(screen.getByRole("heading", { name: "CPMI", level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/AI Governance Engine/)).toBeInTheDocument();
    expect(screen.getByLabelText("Reasoning Chain")).toBeInTheDocument();
  });

  it("switches between the three surfaces", async () => {
    render(<CpmiApp ctx={makeCtx()} />);
    fireEvent.click(screen.getByRole("tab", { name: "World Model" }));
    expect(screen.getByLabelText("World Model")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "CPMI-VRS Gates" }));
    expect(screen.getByLabelText("Gate Runner")).toBeInTheDocument();
    // The gate runner auto-runs the benchmark on mount; let it settle.
    await waitFor(() => expect(screen.getByLabelText("gate3 readiness")).toBeInTheDocument());
  });
});

/** @jest-environment jsdom */
/**
 * module-cpmi — GateRunnerPanel.test.tsx
 * Drives the gate sequence: pass Gate 1 → Gate 2 → attest Gate 3 (note) → Gate 4, then a
 * VRS certificate is issued.
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { GateRunnerPanel } from "../src/GateRunnerPanel";
import { makeCtx } from "./test-helpers";

describe("GateRunnerPanel", () => {
  it("certifies the product after all four gates complete", () => {
    render(<GateRunnerPanel ctx={makeCtx()} productId="CPMI" />);

    // Initially uncertified.
    expect(screen.getByLabelText("VRS certificate")).toHaveTextContent(/No VRS certificate yet/i);

    fireEvent.click(screen.getByRole("button", { name: "Pass Gate 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Pass Gate 2" }));

    fireEvent.change(screen.getByLabelText("Gate 3 attestation note"), {
      target: { value: "Benchmark and schema validation passed; attested." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Attest Gate 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Pass Gate 4" }));

    expect(screen.getByLabelText("VRS certificate")).toHaveTextContent(/VRS certificate issued/i);
  });

  it("blocks Gate 2 until Gate 1 is passed", () => {
    render(<GateRunnerPanel ctx={makeCtx()} productId="CPMI" />);
    expect(screen.getByRole("button", { name: "Pass Gate 2" })).toBeDisabled();
  });
});

/** @jest-environment jsdom */
/**
 * module-cpmi — BenchmarkPanel.test.tsx
 * Runs the benchmark on mount, displays the three scenario results and gate3 readiness,
 * and activates the Gate 3 attestation button ONLY when gate3_ready (and preceding gates
 * passed). The autonomous session never clicks it; a test may, with a spy.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { BenchmarkPanel } from "../src/BenchmarkPanel";
import { makeCtx } from "./test-helpers";

const NOTE = "Benchmark accuracy reviewed and acceptable.";

describe("BenchmarkPanel", () => {
  it("renders the three scenario results and the gate3-ready state", async () => {
    render(<BenchmarkPanel ctx={makeCtx()} />);
    await waitFor(() => expect(screen.getByLabelText("Scenario results")).toBeInTheDocument());
    const items = screen.getByLabelText("Scenario results").querySelectorAll("li");
    expect(items).toHaveLength(3);
    expect(screen.getByLabelText("gate3 readiness")).toHaveTextContent(/gate3_ready/i);
  });

  it("enables the Gate 3 button only when ready + note valid, and forwards the attestation", async () => {
    const onAttestGate3 = jest.fn().mockReturnValue(true);
    render(<BenchmarkPanel ctx={makeCtx()} onAttestGate3={onAttestGate3} />);

    await waitFor(() => expect(screen.getByLabelText("gate3 readiness")).toBeInTheDocument());
    // Ready, but no note yet → disabled.
    expect(screen.getByRole("button", { name: "Gate 3 Attestation" })).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Gate 3 attestation note"), { target: { value: NOTE } });
    expect(screen.getByRole("button", { name: "Gate 3 Attestation" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Gate 3 Attestation" }));
    expect(onAttestGate3).toHaveBeenCalledWith(NOTE);
  });

  it("keeps the Gate 3 button disabled until the preceding gates pass", async () => {
    render(<BenchmarkPanel ctx={makeCtx()} onAttestGate3={() => true} precedingGatesPassed={false} />);
    await waitFor(() => expect(screen.getByLabelText("gate3 readiness")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Gate 3 attestation note"), { target: { value: NOTE } });
    expect(screen.getByRole("button", { name: "Gate 3 Attestation" })).toBeDisabled();
  });
});

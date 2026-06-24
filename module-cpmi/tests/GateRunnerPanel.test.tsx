/** @jest-environment jsdom */
/**
 * module-cpmi — GateRunnerPanel.test.tsx (Session 12)
 * On mount, Gates 1 and 2 auto-record (CPMI_VRS_GATE_1/2_PASSED). The benchmark runs and
 * enables — but does NOT click — the Gate 3 attestation. Gate 4 stays disabled until
 * Gate 3 is attested; no certificate yet.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { GateRunnerPanel } from "../src/GateRunnerPanel";
import { makeCtx } from "./test-helpers";

describe("GateRunnerPanel (autonomous cycle)", () => {
  it("auto-records Gates 1 and 2 on mount and runs the benchmark", async () => {
    const logSink: SovereignLogEvent[] = [];
    render(<GateRunnerPanel ctx={makeCtx({ logSink })} productId="cpmi" />);

    // Gates 1 and 2 auto-recorded.
    const types = logSink.map((e) => e.event_type);
    expect(types).toContain("CPMI_VRS_GATE_1_PASSED");
    expect(types).toContain("CPMI_VRS_GATE_2_PASSED");

    const g1 = logSink.find((e) => e.event_type === "CPMI_VRS_GATE_1_PASSED")!;
    expect(g1.actor_id).toBe("cpmi.vrs-certification");
    expect(g1.workflow_step_id).toBe("cpmi-vrs-cpmi");

    // Benchmark settles → gate3 readiness shown; Gate 3 not yet attested; no cert.
    await waitFor(() => expect(screen.getByLabelText("gate3 readiness")).toHaveTextContent(/gate3_ready/i));
    expect(screen.getByLabelText("VRS certificate")).toHaveTextContent(/No VRS certificate yet/i);
  });

  it("enables the Gate 3 attestation only after the benchmark is ready (and does not auto-click it)", async () => {
    render(<GateRunnerPanel ctx={makeCtx()} productId="cpmi" />);
    await waitFor(() => expect(screen.getByLabelText("gate3 readiness")).toBeInTheDocument());

    // Enabled once a valid note is entered (Gates 1+2 auto-passed, gate3_ready true).
    expect(screen.getByRole("button", { name: "Gate 3 Attestation" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Gate 3 attestation note"), {
      target: { value: "Benchmark accuracy acceptable; attested." },
    });
    expect(screen.getByRole("button", { name: "Gate 3 Attestation" })).toBeEnabled();

    // Gate 4 remains disabled (Gate 3 not attested by the autonomous session).
    expect(screen.getByRole("button", { name: /Pass Gate 4/ })).toBeDisabled();
  });
});

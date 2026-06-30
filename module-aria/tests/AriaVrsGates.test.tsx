/** @jest-environment jsdom */
/**
 * module-aria — AriaVrsGates.test.tsx (Session 25 · D5)
 * The ARIA Suite CPMI-VRS Gates tab: determinism verification (replacing Gates 1–2) renders all
 * scenario results as identical; Gate 3 attestation field is present and functional (logs a
 * HUMAN_DECISION/GATE_3_ATTESTATION only when a human submits — it does NOT auto-attest); Gate 4 is
 * locked until Gate 3 passes. No shell-contract change (existing event/decision types only).
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { AriaVrsGates } from "../src/AriaVrsGates";
import { makeCtx } from "./test-helpers";
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";

describe("AriaVrsGates (D4)", () => {
  it("renders the determinism verification gate, passed, with scenario results", () => {
    render(<AriaVrsGates ctx={makeCtx()} />);
    expect(screen.getByTestId("aria-vrs-gates")).toBeInTheDocument();
    expect(screen.getByText(/Determinism Verification/)).toBeInTheDocument();
    // Every scenario shows as identical on both runs.
    expect(screen.getAllByText(/Identical on both runs/).length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText(/Outputs differ/)).not.toBeInTheDocument();
  });

  it("does NOT auto-attest Gate 3 — it is pending and shows the attestation field", () => {
    render(<AriaVrsGates ctx={makeCtx()} />);
    const gate3 = screen.getByLabelText(/Gate 3 — Human Attestation/);
    expect(gate3.textContent).toMatch(/Pending/);
    expect(screen.getByTestId("aria-gate3-note")).toBeInTheDocument();
    expect(screen.getByTestId("aria-gate3-attest")).toBeInTheDocument();
  });

  it("Gate 4 is locked until Gate 3 is attested", () => {
    render(<AriaVrsGates ctx={makeCtx()} />);
    const gate4 = screen.getByLabelText(/Gate 4 — Monitoring Baseline/);
    expect(gate4.textContent).toMatch(/Locked/);
    expect(screen.queryByTestId("aria-gate4-complete")).not.toBeInTheDocument();
  });

  it("rejects a Gate 3 attestation with too short a note (no event logged)", () => {
    const logSink: SovereignLogEvent[] = [];
    render(<AriaVrsGates ctx={makeCtx({ logSink })} />);
    fireEvent.change(screen.getByTestId("aria-gate3-note"), { target: { value: "ok" } });
    fireEvent.click(screen.getByTestId("aria-gate3-attest"));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(logSink).toHaveLength(0);
  });

  it("attesting Gate 3 (human action) logs HUMAN_DECISION/GATE_3_ATTESTATION and unlocks Gate 4", () => {
    const logSink: SovereignLogEvent[] = [];
    render(<AriaVrsGates ctx={makeCtx({ logSink })} />);
    fireEvent.change(screen.getByTestId("aria-gate3-note"), {
      target: { value: "Reviewed the ARIA rule sets against the current regulatory framework — accepted." },
    });
    fireEvent.click(screen.getByTestId("aria-gate3-attest"));

    expect(logSink).toHaveLength(1);
    const event = logSink[0] as any;
    expect(event.event_type).toBe("HUMAN_DECISION");
    expect(event.decision_type).toBe("GATE_3_ATTESTATION");
    expect(event.product).toBe("ARIA");
    expect(event.workflow_step_id).toBe("aria-cpmi-vrs-gate3-attestation");
    expect(event.actor).toBe("human");

    // Gate 4 now unlocked.
    expect(screen.getByTestId("aria-gate4-complete")).toBeInTheDocument();
  });

  it("completing Gate 4 after Gate 3 logs a HUMAN_DECISION for the monitoring baseline", () => {
    const logSink: SovereignLogEvent[] = [];
    render(<AriaVrsGates ctx={makeCtx({ logSink })} />);
    fireEvent.change(screen.getByTestId("aria-gate3-note"), {
      target: { value: "Reviewed and accepted the ARIA rule sets." },
    });
    fireEvent.click(screen.getByTestId("aria-gate3-attest"));
    fireEvent.click(screen.getByTestId("aria-gate4-complete"));

    expect(logSink).toHaveLength(2);
    const gate4Event = logSink[1] as any;
    expect(gate4Event.workflow_step_id).toBe("aria-cpmi-vrs-gate4-monitoring-baseline");
    expect(gate4Event.payload.gate).toBe(4);
  });
});

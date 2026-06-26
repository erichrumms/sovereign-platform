/** @jest-environment jsdom */
/**
 * module-apex — GateRunnerPanel.test.tsx (Session 18, D2).
 * The APEX CPMI-VRS Certification tab: Gate 1 passes on load; Gate 2 renders the three
 * benchmark scenarios with human-readable full output; Gate 3 attestation logs a
 * GATE_3_ATTESTATION human decision and unlocks Gate 4; Gate 4 is locked until Gate 3 passes
 * and logs a HUMAN_DECISION (HUMAN_APPROVAL) on completion; the certification summary tracks
 * progress; the Gap 6 governance banner is present.
 */
import { render, screen, fireEvent, within } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { GateRunnerPanel } from "../src/GateRunnerPanel";
import { createSyntheticApexDataAdapter } from "../src/apex-data-adapter";
import { makeCtx } from "./test-helpers";

const adapter = createSyntheticApexDataAdapter();

function gate(n: number): HTMLElement {
  return screen.getByLabelText(new RegExp(`^Gate ${n} —`));
}

describe("GateRunnerPanel — CPMI-VRS Certification tab", () => {
  it("Gate 1 (AI Disclosure) passes on load", () => {
    render(<GateRunnerPanel ctx={makeCtx()} adapter={adapter} />);
    expect(within(gate(1)).getByText("Passed")).toBeInTheDocument();
    expect(within(gate(1)).getByText(/AI-disclosure banner/)).toBeInTheDocument();
  });

  it("Gate 2 (Reasoning Transparency) passes and renders all three benchmark scenario cards", () => {
    render(<GateRunnerPanel ctx={makeCtx()} adapter={adapter} />);
    expect(within(gate(2)).getByText("Passed")).toBeInTheDocument();
    expect(screen.getByLabelText(/Benchmark scenario A —/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Benchmark scenario B —/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Benchmark scenario C —/)).toBeInTheDocument();
  });

  it("Gate 2 reports schema validation as plain prose, not a JSON dump", () => {
    render(<GateRunnerPanel ctx={makeCtx()} adapter={adapter} />);
    const cardA = screen.getByLabelText(/Benchmark scenario A —/);
    expect(within(cardA).getByText(/Schema validation passed/)).toBeInTheDocument();
    // No raw JSON braces leak into the rendered scenario card.
    expect(cardA.textContent).not.toMatch(/[{}]/);
  });

  it('Gate 2 "View full output" expands a human-readable analysis (prose headings, no JSON)', () => {
    render(<GateRunnerPanel ctx={makeCtx()} adapter={adapter} />);
    const cardC = screen.getByLabelText(/Benchmark scenario C —/);
    fireEvent.click(within(cardC).getByText("View full output"));
    expect(within(cardC).getByText("Status narrative")).toBeInTheDocument();
    expect(within(cardC).getByText("Risk findings")).toBeInTheDocument();
    expect(within(cardC).getByText("Recommendations")).toBeInTheDocument();
    expect(cardC.textContent).not.toMatch(/"schema_valid"|\bworkflow_step_id\b/);
  });

  it("Gate 3 starts PENDING and Gate 4 starts LOCKED", () => {
    render(<GateRunnerPanel ctx={makeCtx()} adapter={adapter} />);
    expect(within(gate(3)).getByText("Pending")).toBeInTheDocument();
    expect(within(gate(4)).getByText("Locked")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Complete Gate 4" })).not.toBeInTheDocument();
  });

  it("Gate 3 attestation requires a note of at least 10 characters", () => {
    const logSink: SovereignLogEvent[] = [];
    render(<GateRunnerPanel ctx={makeCtx({ logSink })} adapter={adapter} />);
    fireEvent.change(screen.getByLabelText("gate 3 attestation note"), { target: { value: "too short" } });
    fireEvent.click(screen.getByRole("button", { name: "Attest Gate 3" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/at least 10 characters/);
    expect(logSink).toHaveLength(0);
    expect(within(gate(3)).getByText("Pending")).toBeInTheDocument();
  });

  it("Gate 3 attestation logs a GATE_3_ATTESTATION human decision and unlocks Gate 4", () => {
    const logSink: SovereignLogEvent[] = [];
    render(<GateRunnerPanel ctx={makeCtx({ logSink })} adapter={adapter} />);
    fireEvent.change(screen.getByLabelText("gate 3 attestation note"), {
      target: { value: "Reviewed the APEX analysis and accept it as the basis for the report." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Attest Gate 3" }));

    const decision = logSink.find((e) => e.event_type === "HUMAN_DECISION");
    expect(decision).toBeDefined();
    expect(decision!.decision_type).toBe("GATE_3_ATTESTATION");
    expect(decision!.actor).toBe("human");
    expect(decision!.product).toBe("APEX");
    expect(decision!.workflow_step_id).toBe("apex-cpmi-vrs-gate3-attestation");

    expect(within(gate(3)).getByText("Passed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Complete Gate 4" })).toBeInTheDocument();
  });

  it("Gate 4 completion logs a HUMAN_DECISION (HUMAN_APPROVAL) and marks Gate 4 PASSED", () => {
    const logSink: SovereignLogEvent[] = [];
    render(<GateRunnerPanel ctx={makeCtx({ logSink })} adapter={adapter} />);
    fireEvent.change(screen.getByLabelText("gate 3 attestation note"), {
      target: { value: "Reviewed and accepted the analysis for certification." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Attest Gate 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Complete Gate 4" }));

    const gate4Event = logSink.find((e) => e.workflow_step_id === "apex-cpmi-vrs-gate4-monitoring-baseline");
    expect(gate4Event).toBeDefined();
    expect(gate4Event!.event_type).toBe("HUMAN_DECISION");
    expect(gate4Event!.decision_type).toBe("HUMAN_APPROVAL");
    expect(within(gate(4)).getByText("Passed")).toBeInTheDocument();
  });

  it("certification summary tracks progress from 2/4 to complete", () => {
    render(<GateRunnerPanel ctx={makeCtx()} adapter={adapter} />);
    expect(screen.getByText(/2 of 4 gates are complete/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("gate 3 attestation note"), {
      target: { value: "Reviewed and accepted for certification." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Attest Gate 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Complete Gate 4" }));
    expect(screen.getByText(/APEX CPMI-VRS certification is complete/)).toBeInTheDocument();
  });

  it("renders the permanent governance banners (Gap 6 Category 2)", () => {
    render(<GateRunnerPanel ctx={makeCtx()} adapter={adapter} />);
    expect(screen.getByText(/AI disclosure \(CPMI-VRS Gate 1\):/)).toBeInTheDocument();
    expect(screen.getByText(/Classification boundary \(GD-10\):/)).toBeInTheDocument();
  });

  it("fails closed: a logger emission failure blocks Gate 3 attestation", () => {
    render(<GateRunnerPanel ctx={makeCtx({ throwOnLog: true })} adapter={adapter} />);
    fireEvent.change(screen.getByLabelText("gate 3 attestation note"), {
      target: { value: "Reviewed and accepted the analysis." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Attest Gate 3" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Logger emission failed/);
    expect(within(gate(3)).getByText("Pending")).toBeInTheDocument();
  });
});

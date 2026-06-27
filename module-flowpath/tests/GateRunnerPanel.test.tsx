/** @jest-environment jsdom */
/**
 * module-flowpath — GateRunnerPanel.test.tsx (Screen 5, CPMI-VRS Certification, Session 21 D3)
 * Gate 1 passes on load; Gate 2 shows three benchmark scenario cards (A/B/C); Gate 3 attestation
 * logs GATE_3_ATTESTATION and unlocks Gate 4; Gate 4 logs HUMAN_APPROVAL; the summary progresses;
 * the permanent blue governance banners are present (Gap 6); output is plain prose (Gap 5).
 */
import { render, screen, fireEvent } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { GateRunnerPanel } from "../src/GateRunnerPanel";
import { makeCtx } from "./test-helpers";

function ctxWith(sink?: SovereignLogEvent[]) {
  return makeCtx(sink ? { logSink: sink } : {});
}

function attest(): void {
  fireEvent.change(screen.getByLabelText(/gate 3 attestation note/i), { target: { value: "Reviewed all three benchmarks; complete and accurate." } });
  fireEvent.click(screen.getByRole("button", { name: /attest gate 3/i }));
}

describe("GateRunnerPanel (FLOWPATH CPMI-VRS Certification)", () => {
  it("shows Gate 1 as passed on load", () => {
    render(<GateRunnerPanel ctx={ctxWith()} />);
    const gate1 = document.querySelector('[data-gate="1"]') as HTMLElement;
    expect(gate1.textContent ?? "").toMatch(/Passed/);
  });

  it("renders all three benchmark scenario cards (A, B, C) under Gate 2", () => {
    render(<GateRunnerPanel ctx={ctxWith()} />);
    expect(screen.getByLabelText(/Benchmark scenario A/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Benchmark scenario B/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Benchmark scenario C/i)).toBeInTheDocument();
  });

  it("each benchmark card states schema validation and gate passed in plain prose (Gap 5)", () => {
    render(<GateRunnerPanel ctx={ctxWith()} />);
    const cardA = screen.getByLabelText(/Benchmark scenario A/i);
    const text = cardA.textContent ?? "";
    expect(text).toMatch(/Schema validation passed/i);
    expect(text).toMatch(/Five-Question Completeness Gate passed/i);
    expect(text).not.toMatch(/[{}]|step_id|schema_valid/);
  });

  it("shows Gate 3 as pending and Gate 4 as locked before attestation", () => {
    render(<GateRunnerPanel ctx={ctxWith()} />);
    expect((document.querySelector('[data-gate="3"]') as HTMLElement).textContent ?? "").toMatch(/Pending/);
    expect((document.querySelector('[data-gate="4"]') as HTMLElement).textContent ?? "").toMatch(/Locked/);
  });

  it("requires a substantive attestation note before Gate 3 can be attested", () => {
    const sink: SovereignLogEvent[] = [];
    render(<GateRunnerPanel ctx={ctxWith(sink)} />);
    fireEvent.change(screen.getByLabelText(/gate 3 attestation note/i), { target: { value: "ok" } });
    fireEvent.click(screen.getByRole("button", { name: /attest gate 3/i }));
    expect(sink.some((e) => e.event_type === "HUMAN_DECISION")).toBe(false);
    expect(screen.getByRole("alert").textContent ?? "").toMatch(/at least 10 characters/i);
  });

  it("Gate 3 attestation logs GATE_3_ATTESTATION with actor, actor_name, note, workflow_step_id", () => {
    const sink: SovereignLogEvent[] = [];
    render(<GateRunnerPanel ctx={ctxWith(sink)} />);
    attest();
    const ev = sink.find((e) => e.event_type === "HUMAN_DECISION" && e.decision_type === "GATE_3_ATTESTATION");
    expect(ev).toBeDefined();
    expect(ev!.actor).toBe("human");
    expect(ev!.actor_name).toBe("Sam Analyst");
    expect(ev!.workflow_step_id).toBe("flowpath-cpmi-vrs-gate3-attestation");
    expect((ev!.payload as { note: string }).note).toMatch(/Reviewed all three benchmarks/i);
  });

  it("unlocks Gate 4 after Gate 3 is attested", () => {
    render(<GateRunnerPanel ctx={ctxWith()} />);
    attest();
    expect((document.querySelector('[data-gate="3"]') as HTMLElement).textContent ?? "").toMatch(/Passed/);
    expect(screen.getByRole("button", { name: /complete gate 4/i })).toBeInTheDocument();
  });

  it("Gate 4 completion logs a HUMAN_APPROVAL human decision", () => {
    const sink: SovereignLogEvent[] = [];
    render(<GateRunnerPanel ctx={ctxWith(sink)} />);
    attest();
    fireEvent.click(screen.getByRole("button", { name: /complete gate 4/i }));
    const ev = sink.find((e) => e.event_type === "HUMAN_DECISION" && e.workflow_step_id === "flowpath-cpmi-vrs-gate4-monitoring-baseline");
    expect(ev).toBeDefined();
    expect(ev!.decision_type).toBe("HUMAN_APPROVAL");
  });

  it("progresses the certification summary to complete after both gates", () => {
    render(<GateRunnerPanel ctx={ctxWith()} />);
    expect(screen.getByRole("status").textContent ?? "").toMatch(/2 of 4 gates/i);
    attest();
    fireEvent.click(screen.getByRole("button", { name: /complete gate 4/i }));
    expect(screen.getByRole("status").textContent ?? "").toMatch(/certification is complete/i);
  });

  it("shows the permanent blue governance banners (Category 2)", () => {
    const { container } = render(<GateRunnerPanel ctx={ctxWith()} />);
    const banners = container.querySelectorAll('[data-category="2-governance"]');
    expect(banners.length).toBeGreaterThanOrEqual(2); // AI disclosure + classification boundary
  });

  it("applies the white card pattern to gate cards (#ffffff)", () => {
    render(<GateRunnerPanel ctx={ctxWith()} />);
    const gate1 = document.querySelector('[data-gate="1"]') as HTMLElement;
    expect(gate1.style.background).toBe("rgb(255, 255, 255)");
  });

  it("reveals the full workflow output in plain prose when a benchmark card is expanded", () => {
    render(<GateRunnerPanel ctx={ctxWith()} />);
    const cardA = screen.getByLabelText(/Benchmark scenario A/i);
    expect(cardA.textContent ?? "").toMatch(/is responsible/);
    expect(cardA.textContent ?? "").toMatch(/The workflow is complete when/i);
  });
});

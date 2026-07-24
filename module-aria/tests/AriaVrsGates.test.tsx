/** @jest-environment jsdom */
/**
 * module-aria — AriaVrsGates.test.tsx (Session 25 · D5; updated Session 26 · Walkthrough D D-11/D-12)
 * The ARIA Suite CPMI-VRS Gates tab: determinism verification (replacing Gates 1–2) renders all
 * scenario results as identical; a plain-prose rationale explains why determinism substitutes for the
 * accuracy Gates 1–2 BEFORE the scenarios (D-12); Gate 3 presents a pre-formed attestation statement the
 * Principal reviews and confirms — never auto-attesting — and logs a HUMAN_DECISION/GATE_3_ATTESTATION
 * with the verbatim statement only on human confirmation (D-11); Gate 4 is locked until Gate 3 passes.
 * No shell-contract change (existing event/decision types only).
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { AriaVrsGates } from "../src/AriaVrsGates";
import {
  getAriaVrsGateSession,
  recordAriaGate3Attestation,
  recordAriaGate4Completion,
  resetAriaVrsGateSessionForTests,
  subscribeAriaVrsGateSession,
} from "../src/aria-vrs-session";
import { makeCtx } from "./test-helpers";
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";

describe("AriaVrsGates (D4)", () => {
  // D3 (Session 61): gate state is a module-level session store — reset per test.
  beforeEach(() => resetAriaVrsGateSessionForTests());

  it("renders the determinism verification gate, passed, with scenario results", () => {
    render(<AriaVrsGates ctx={makeCtx()} />);
    expect(screen.getByTestId("aria-vrs-gates")).toBeInTheDocument();
    expect(screen.getByText(/Determinism Verification/)).toBeInTheDocument();
    // Every scenario shows as identical on both runs.
    expect(screen.getAllByText(/Identical on both runs/).length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText(/Outputs differ/)).not.toBeInTheDocument();
  });

  it("D-9: states the two-per-component coverage rationale on the determinism page", () => {
    render(<AriaVrsGates ctx={makeCtx()} />);
    const coverage = screen.getByTestId("aria-determinism-coverage");
    expect(coverage.textContent).toMatch(/two for each ARIA component/i);
    expect(coverage.textContent).toMatch(/normal path/i);
    expect(coverage.textContent).toMatch(/exception path/i);
  });

  it("D-10: each scenario card names what was compared across the two runs", () => {
    render(<AriaVrsGates ctx={makeCtx()} />);
    const compared = screen.getAllByTestId(/^aria-determinism-compared-/);
    expect(compared).toHaveLength(6);
    for (const el of compared) {
      expect(el.textContent).toMatch(/Compared:/);
      expect(el.textContent).toMatch(/run 1 against run 2/i);
    }
    // The ambiguous bare "identically" is gone from the scenario titles.
    expect(screen.queryByText(/identically/i)).not.toBeInTheDocument();
  });

  it("D-12: explains why determinism replaces the accuracy Gates 1–2, for a non-technical reviewer", () => {
    render(<AriaVrsGates ctx={makeCtx()} />);
    const rationale = screen.getByTestId("aria-determinism-rationale");
    expect(rationale).toBeInTheDocument();
    // Names the LLM-backed comparators, the deterministic distinction, and the two-per-component coverage.
    expect(rationale.textContent).toMatch(/accuracy benchmark/i);
    expect(rationale.textContent).toMatch(/large language model/i);
    expect(rationale.textContent).toMatch(/deterministic/i);
    expect(rationale.textContent).toMatch(/two for each ARIA component/i);
    // Surfaced BEFORE the first determinism scenario in document order.
    const firstScenario = screen.getAllByTestId(/^aria-determinism-scenario|^aria-determinism-/).find(
      (el) => el.getAttribute("data-testid") !== "aria-determinism-rationale",
    );
    expect(firstScenario).toBeDefined();
    expect(rationale.compareDocumentPosition(firstScenario as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("D-11: presents a pre-formed attestation statement (what/capacity/evidence/consequence), not a blank field", () => {
    render(<AriaVrsGates ctx={makeCtx()} />);
    const statement = screen.getByTestId("aria-gate3-statement");
    // WHAT is certified, in WHAT capacity, on WHAT evidence — and it is the OLD free-text field that is gone.
    expect(statement.textContent).toMatch(/Robin Compliance/);
    expect(statement.textContent).toMatch(/Project Principal/);
    expect(statement.textContent).toMatch(/regulatory framework/i);
    expect(statement.textContent).toMatch(/determinism verification results above/i);
    expect(screen.queryByTestId("aria-gate3-note")).not.toBeInTheDocument();
    // WHAT changes on submit is disclosed, and confirmation is explicit.
    expect(screen.getAllByText(/unlocks\s+Gate 4/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId("aria-gate3-confirm")).toBeInTheDocument();
  });

  it("does NOT auto-attest Gate 3 — it is pending and shows the attest control", () => {
    render(<AriaVrsGates ctx={makeCtx()} />);
    const gate3 = screen.getByLabelText(/Gate 3 — Human Attestation/);
    expect(gate3.textContent).toMatch(/Pending/);
    expect(screen.getByTestId("aria-gate3-attest")).toBeInTheDocument();
  });

  it("Gate 4 is locked until Gate 3 is attested", () => {
    render(<AriaVrsGates ctx={makeCtx()} />);
    const gate4 = screen.getByLabelText(/Gate 4 — Monitoring Baseline/);
    expect(gate4.textContent).toMatch(/Locked/);
    expect(screen.queryByTestId("aria-gate4-complete")).not.toBeInTheDocument();
  });

  it("rejects a Gate 3 attestation when the statement has not been confirmed (no event logged)", () => {
    const logSink: SovereignLogEvent[] = [];
    render(<AriaVrsGates ctx={makeCtx({ logSink })} />);
    // Click attest without ticking the confirmation checkbox.
    fireEvent.click(screen.getByTestId("aria-gate3-attest"));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(logSink).toHaveLength(0);
  });

  it("attesting Gate 3 (confirmed human action) logs HUMAN_DECISION/GATE_3_ATTESTATION with the verbatim statement and unlocks Gate 4", () => {
    const logSink: SovereignLogEvent[] = [];
    render(<AriaVrsGates ctx={makeCtx({ logSink })} />);
    fireEvent.click(screen.getByTestId("aria-gate3-confirm"));
    fireEvent.click(screen.getByTestId("aria-gate3-attest"));

    expect(logSink).toHaveLength(1);
    const event = logSink[0] as any;
    expect(event.event_type).toBe("HUMAN_DECISION");
    expect(event.decision_type).toBe("GATE_3_ATTESTATION");
    expect(event.product).toBe("ARIA");
    expect(event.workflow_step_id).toBe("aria-cpmi-vrs-gate3-attestation");
    expect(event.actor).toBe("human");
    // The permanent record captures the exact statement that was confirmed (not a reconstructed note).
    expect(event.payload.statement).toMatch(/I, Robin Compliance/);
    expect(event.payload.statement).toMatch(/regulatory framework/i);
    expect(event.payload.gate).toBe(3);

    // Gate 4 now unlocked.
    expect(screen.getByTestId("aria-gate4-complete")).toBeInTheDocument();
  });

  it("carries optional remarks into the audit payload without requiring them", () => {
    const logSink: SovereignLogEvent[] = [];
    render(<AriaVrsGates ctx={makeCtx({ logSink })} />);
    fireEvent.change(screen.getByTestId("aria-gate3-remarks"), {
      target: { value: "Cross-checked CLEAR rules against the FY 2026 guidance." },
    });
    fireEvent.click(screen.getByTestId("aria-gate3-confirm"));
    fireEvent.click(screen.getByTestId("aria-gate3-attest"));

    expect(logSink).toHaveLength(1);
    expect((logSink[0] as any).payload.remarks).toMatch(/Cross-checked CLEAR rules/);
  });

  it("completing Gate 4 after Gate 3 logs a HUMAN_DECISION for the monitoring baseline", () => {
    const logSink: SovereignLogEvent[] = [];
    render(<AriaVrsGates ctx={makeCtx({ logSink })} />);
    fireEvent.click(screen.getByTestId("aria-gate3-confirm"));
    fireEvent.click(screen.getByTestId("aria-gate3-attest"));
    fireEvent.click(screen.getByTestId("aria-gate4-complete"));

    expect(logSink).toHaveLength(2);
    const gate4Event = logSink[1] as any;
    expect(gate4Event.workflow_step_id).toBe("aria-cpmi-vrs-gate4-monitoring-baseline");
    expect(gate4Event.payload.gate).toBe(4);
  });
});

// D3 (Session 61, finding D3-2) — the resurrection/duplication proofs: a Gate 3
// attestation survives unmount/remount (the UI's "permanent" claim made true),
// and a second GATE_3_ATTESTATION cannot be emitted in the same session.
describe("AriaVrsGates — session-persistent gates (D3, Session 61)", () => {
  beforeEach(() => resetAriaVrsGateSessionForTests());

  it("a Gate 3 attestation persists across unmount/remount — no PENDING reset, no attest control", () => {
    const logSink: SovereignLogEvent[] = [];
    const first = render(<AriaVrsGates ctx={makeCtx({ logSink })} />);
    fireEvent.click(screen.getByTestId("aria-gate3-confirm"));
    fireEvent.click(screen.getByTestId("aria-gate3-attest"));
    expect(logSink).toHaveLength(1);
    first.unmount(); // navigate away

    render(<AriaVrsGates ctx={makeCtx({ logSink })} />); // navigate back
    const gate3 = screen.getByLabelText(/Gate 3 — Human Attestation/);
    expect(gate3.textContent).toMatch(/was attested on/);
    expect(screen.queryByTestId("aria-gate3-attest")).not.toBeInTheDocument();
    expect(screen.queryByTestId("aria-gate3-confirm")).not.toBeInTheDocument();
    // Gate 4 remains unlocked after the remount too.
    expect(screen.getByTestId("aria-gate4-complete")).toBeInTheDocument();
  });

  it("a completed Gate 4 persists across remount", () => {
    const logSink: SovereignLogEvent[] = [];
    const first = render(<AriaVrsGates ctx={makeCtx({ logSink })} />);
    fireEvent.click(screen.getByTestId("aria-gate3-confirm"));
    fireEvent.click(screen.getByTestId("aria-gate3-attest"));
    fireEvent.click(screen.getByTestId("aria-gate4-complete"));
    expect(logSink).toHaveLength(2);
    first.unmount();

    render(<AriaVrsGates ctx={makeCtx({ logSink })} />);
    const gate4 = screen.getByLabelText(/Gate 4 — Monitoring Baseline/);
    expect(gate4.textContent).toMatch(/was established on/);
    expect(screen.queryByTestId("aria-gate4-complete")).not.toBeInTheDocument();
  });

  it("a second attestation attempt emits NOTHING — the duplicate is prevented, not just discouraged", () => {
    const logSink: SovereignLogEvent[] = [];
    const first = render(<AriaVrsGates ctx={makeCtx({ logSink })} />);
    fireEvent.click(screen.getByTestId("aria-gate3-confirm"));
    fireEvent.click(screen.getByTestId("aria-gate3-attest"));
    expect(logSink).toHaveLength(1);
    first.unmount();

    // After remount there is no attest control at all — the UI path is gone.
    render(<AriaVrsGates ctx={makeCtx({ logSink })} />);
    expect(screen.queryByTestId("aria-gate3-attest")).not.toBeInTheDocument();
    // And the store itself refuses a duplicate even if some future code path tried.
    expect(recordAriaGate3Attestation(new Date().toISOString())).toBe(false);
    expect(logSink).toHaveLength(1); // still exactly one GATE_3_ATTESTATION
  });
});

// D3 — store-level unit tests (the same shape as the VIGIL session-store suites).
describe("aria-vrs-session store (D3, Session 61)", () => {
  beforeEach(() => resetAriaVrsGateSessionForTests());

  it("initializes PENDING/LOCKED; Gate 3 attestation unlocks Gate 4; duplicates refused", () => {
    expect(getAriaVrsGateSession().gate3.state).toBe("PENDING");
    expect(getAriaVrsGateSession().gate4.state).toBe("LOCKED");

    expect(recordAriaGate3Attestation("2026-07-23T00:00:00Z")).toBe(true);
    expect(getAriaVrsGateSession().gate3).toEqual({ state: "PASSED", attestedAt: "2026-07-23T00:00:00Z" });
    expect(getAriaVrsGateSession().gate4.state).toBe("PENDING");

    expect(recordAriaGate3Attestation("2026-07-23T01:00:00Z")).toBe(false); // duplicate refused
    expect(getAriaVrsGateSession().gate3.attestedAt).toBe("2026-07-23T00:00:00Z"); // unchanged

    expect(recordAriaGate4Completion("2026-07-23T02:00:00Z")).toBe(true);
    expect(recordAriaGate4Completion("2026-07-23T03:00:00Z")).toBe(false); // duplicate refused
  });

  it("Gate 4 cannot be completed while locked (Gate 3 not attested)", () => {
    expect(recordAriaGate4Completion("2026-07-23T00:00:00Z")).toBe(false);
    expect(getAriaVrsGateSession().gate4.state).toBe("LOCKED");
  });

  it("subscription fires on record; unsubscribe stops it", () => {
    let calls = 0;
    const unsubscribe = subscribeAriaVrsGateSession(() => { calls += 1; });
    recordAriaGate3Attestation("2026-07-23T00:00:00Z");
    expect(calls).toBe(1);
    recordAriaGate3Attestation("2026-07-23T01:00:00Z"); // refused duplicate — no notify
    expect(calls).toBe(1);
    unsubscribe();
    recordAriaGate4Completion("2026-07-23T02:00:00Z");
    expect(calls).toBe(1);
  });
});

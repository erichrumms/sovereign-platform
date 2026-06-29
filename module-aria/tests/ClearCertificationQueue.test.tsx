/** @jest-environment jsdom */
/**
 * module-aria — ClearCertificationQueue.test.tsx (Session 23 · D6)
 * The CLEAR Certification Queue: deterministic findings shown per document, the >= 10-char
 * decision-note enforcement, and the certify / flag actions — each records on ctx.aria and
 * emits the correct governed Logger event with decision_type COMPLIANCE_CERTIFICATION.
 */
import { render, screen, fireEvent, within } from "@testing-library/react";

import { ClearCertificationQueue } from "../src/ClearCertificationQueue";
import { makeCtx } from "./test-helpers";
import type { SovereignLogEvent, SovereignShellContext } from "../../sovereign-shell/shell-contract";
import type { ClearEvaluationInput } from "../src/clear-types";

const CLEAN: ClearEvaluationInput = {
  document_id: "DOC-CLEAN",
  document_name: "Clean Exhibit",
  document_type: "OMB A-11 Exhibit",
  data_quality_index: 96,
  is_congressional_submission: false,
  has_justification_narrative: true,
  has_evidence_basis: true,
  obligation_covered: true,
  funds_availability_stated: true,
  ppbe_phase: "Budgeting",
};

const FLAGGED: ClearEvaluationInput = {
  ...CLEAN,
  document_id: "DOC-ADA",
  document_name: "Over-obligated Summary",
  obligation_covered: false,
};

function setup(items: ClearEvaluationInput[]): { events: SovereignLogEvent[]; ctx: SovereignShellContext } {
  const events: SovereignLogEvent[] = [];
  const ctx = makeCtx({ logSink: events });
  render(<ClearCertificationQueue ctx={ctx} items={items} />);
  return { events, ctx };
}

describe("ClearCertificationQueue (D3)", () => {
  it("shows the deterministic findings for a flagged document (Anti-Deficiency Act violation)", () => {
    setup([FLAGGED]);
    const card = screen.getByTestId("queue-item-DOC-ADA");
    expect(within(card).getByText(/not covered by available budget authority/i)).toBeInTheDocument();
    expect(card.querySelector('[data-testid="finding-DOC-ADA-R-ADA-1"] [data-severity="red"]')).toBeTruthy();
  });

  it("disables certify / flag until the decision note is at least 10 characters", () => {
    setup([CLEAN]);
    const certify = screen.getByTestId("certify-DOC-CLEAN") as HTMLButtonElement;
    const flag = screen.getByTestId("flag-DOC-CLEAN") as HTMLButtonElement;
    expect(certify).toBeDisabled();
    expect(flag).toBeDisabled();

    fireEvent.change(screen.getByTestId("note-DOC-CLEAN"), { target: { value: "too short" } }); // 9 chars
    expect(certify).toBeDisabled();
    expect(screen.getByText(/at least 10 characters is required/i)).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("note-DOC-CLEAN"), { target: { value: "Meets all A-11 checks." } });
    expect(certify).not.toBeDisabled();
    expect(flag).not.toBeDisabled();
  });

  it("Certify records a positive certification on ctx.aria and emits ARIA_CERTIFICATION_ISSUED", () => {
    const { events, ctx } = setup([CLEAN]);
    fireEvent.change(screen.getByTestId("note-DOC-CLEAN"), { target: { value: "Certified — meets all checks." } });
    fireEvent.click(screen.getByTestId("certify-DOC-CLEAN"));

    expect(ctx.aria.isCertified("DOC-CLEAN")).toBe(true);
    const event = events.find((e) => e.event_type === "ARIA_CERTIFICATION_ISSUED")!;
    expect(event).toBeDefined();
    expect(event.decision_type).toBe("COMPLIANCE_CERTIFICATION");
    expect(event.actor).toBe("human");
    expect(event.actor_name).toBe("Robin Compliance");
    expect(event.workflow_step_id).toBe("aria-clear-DOC-CLEAN");
    // The decision is now recorded; the action UI is replaced by the status.
    expect(screen.getByTestId("decided-DOC-CLEAN")).toHaveTextContent(/Certified/);
  });

  it("Flag records a negative certification on ctx.aria and emits ARIA_VIOLATION_FLAGGED", () => {
    const { events, ctx } = setup([FLAGGED]);
    fireEvent.change(screen.getByTestId("note-DOC-ADA"), { target: { value: "Flagged — over-obligation must be resolved." } });
    fireEvent.click(screen.getByTestId("flag-DOC-ADA"));

    expect(ctx.aria.isCertified("DOC-ADA")).toBe(false);
    expect(ctx.aria.get("DOC-ADA")?.certified).toBe(false);
    const event = events.find((e) => e.event_type === "ARIA_VIOLATION_FLAGGED")!;
    expect(event).toBeDefined();
    expect(event.actor_name).toBe("Robin Compliance");
    expect(event.payload.flagged_rule_ids).toContain("R-ADA-1");
  });

  it("requires a decision note — clicking with a short note records nothing", () => {
    const { events, ctx } = setup([CLEAN]);
    // Buttons are disabled, but defensively confirm the guard: a too-short note records nothing.
    fireEvent.change(screen.getByTestId("note-DOC-CLEAN"), { target: { value: "short" } });
    const certify = screen.getByTestId("certify-DOC-CLEAN");
    fireEvent.click(certify); // disabled — no effect
    expect(events.some((e) => e.event_type === "ARIA_CERTIFICATION_ISSUED")).toBe(false);
    expect(ctx.aria.list()).toHaveLength(0);
  });
});

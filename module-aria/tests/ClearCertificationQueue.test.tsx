/** @jest-environment jsdom */
/**
 * module-aria — ClearCertificationQueue.test.tsx (Session 23 · D6; updated Session 26 · Walkthrough D)
 * The CLEAR Certification Queue: deterministic findings shown per document, the >= 10-char decision-note
 * enforcement, and the certify / flag actions — each records on ctx.aria and emits the correct governed
 * Logger event with decision_type COMPLIANCE_CERTIFICATION.
 *
 * Walkthrough D additions:
 *   - D-3: a synthetic document preview; Certify captures an export destination + intended recipient into
 *     the audit-trail payload only (NOT enforced by the SCRIBE export gate — reads as a record).
 *   - D-1: the data-quality finding surfaces P1-vs-At-Risk severity keyed to document type at row level.
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

// A congressional submission below the data-quality threshold → data-quality finding is a P1 (red).
const CONG: ClearEvaluationInput = {
  ...CLEAN,
  document_id: "DOC-CONG",
  document_name: "FY 2026 Congressional Justification",
  document_type: "Congressional Justification",
  data_quality_index: 87,
  is_congressional_submission: true,
};

// A non-congressional document below the threshold → data-quality finding is At Risk (amber).
const NONCONG: ClearEvaluationInput = {
  ...CLEAN,
  document_id: "DOC-NONCONG",
  document_name: "Program performance exhibit",
  data_quality_index: 84,
  is_congressional_submission: false,
};

function setup(items: ClearEvaluationInput[]): { events: SovereignLogEvent[]; ctx: SovereignShellContext } {
  const events: SovereignLogEvent[] = [];
  const ctx = makeCtx({ logSink: events });
  render(<ClearCertificationQueue ctx={ctx} items={items} />);
  return { events, ctx };
}

// Fill note + export capture so a document can be certified.
function fillForCertify(documentId: string, note = "Certified — meets all checks."): void {
  fireEvent.change(screen.getByTestId(`note-${documentId}`), { target: { value: note } });
  fireEvent.change(screen.getByTestId(`dest-${documentId}`), { target: { value: "OMB MAX submission portal" } });
  fireEvent.change(screen.getByTestId(`recip-${documentId}`), { target: { value: "OMB RMO analyst, Jane Roe" } });
}

describe("ClearCertificationQueue (D3)", () => {
  it("shows the deterministic findings for a flagged document (Anti-Deficiency Act violation)", () => {
    setup([FLAGGED]);
    const card = screen.getByTestId("queue-item-DOC-ADA");
    expect(within(card).getByText(/not covered by available budget authority/i)).toBeInTheDocument();
    expect(card.querySelector('[data-testid="finding-DOC-ADA-R-ADA-1"] [data-severity="red"]')).toBeTruthy();
  });

  it("disables flag until the decision note is at least 10 characters", () => {
    setup([CLEAN]);
    const flag = screen.getByTestId("flag-DOC-CLEAN") as HTMLButtonElement;
    expect(flag).toBeDisabled();

    fireEvent.change(screen.getByTestId("note-DOC-CLEAN"), { target: { value: "too short" } }); // 9 chars
    expect(flag).toBeDisabled();
    expect(screen.getByText(/at least 10 characters is required/i)).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("note-DOC-CLEAN"), { target: { value: "Reviewed and accepted." } });
    expect(flag).not.toBeDisabled();
  });

  it("D-3: certify requires an export destination and recipient (audit capture); flag does not", () => {
    setup([CLEAN]);
    const certify = screen.getByTestId("certify-DOC-CLEAN") as HTMLButtonElement;
    const flag = screen.getByTestId("flag-DOC-CLEAN") as HTMLButtonElement;

    fireEvent.change(screen.getByTestId("note-DOC-CLEAN"), { target: { value: "Meets all A-11 checks." } });
    // Note satisfies flag, but certify still needs destination + recipient.
    expect(flag).not.toBeDisabled();
    expect(certify).toBeDisabled();

    fireEvent.change(screen.getByTestId("dest-DOC-CLEAN"), { target: { value: "OMB submission portal" } });
    expect(certify).toBeDisabled();
    fireEvent.change(screen.getByTestId("recip-DOC-CLEAN"), { target: { value: "OMB RMO analyst" } });
    expect(certify).not.toBeDisabled();
  });

  it("D-3: reveals a synthetic document preview on demand", () => {
    setup([CLEAN]);
    expect(screen.queryByTestId("preview-DOC-CLEAN")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("view-doc-DOC-CLEAN"));
    const preview = screen.getByTestId("preview-DOC-CLEAN");
    expect(preview).toHaveTextContent(/Synthetic preview/i);
    expect(preview).toHaveTextContent(/Data-quality index/i);
    // Toggles back off.
    fireEvent.click(screen.getByTestId("view-doc-DOC-CLEAN"));
    expect(screen.queryByTestId("preview-DOC-CLEAN")).not.toBeInTheDocument();
  });

  it("D-3: the export capture reads as an audit record, not an authorization", () => {
    setup([CLEAN]);
    const disclosure = screen.getByTestId("export-disclosure-DOC-CLEAN");
    expect(disclosure).toHaveTextContent(/recorded to the audit trail only/i);
    expect(disclosure).toHaveTextContent(/not/i);
    expect(disclosure).toHaveTextContent(/SCRIBE export gate/i);
    // Must not imply enforcement/authorization anywhere in the capture surface.
    expect(disclosure.textContent ?? "").not.toMatch(/authoriz/i);
  });

  it("Certify records a positive certification, captures destination/recipient in the audit payload, and shows them as noted (not enforced)", () => {
    const { events, ctx } = setup([CLEAN]);
    fillForCertify("DOC-CLEAN");
    fireEvent.click(screen.getByTestId("certify-DOC-CLEAN"));

    expect(ctx.aria.isCertified("DOC-CLEAN")).toBe(true);
    const event = events.find((e) => e.event_type === "ARIA_CERTIFICATION_ISSUED")! as any;
    expect(event).toBeDefined();
    expect(event.decision_type).toBe("COMPLIANCE_CERTIFICATION");
    expect(event.actor).toBe("human");
    expect(event.actor_name).toBe("Robin Compliance");
    expect(event.workflow_step_id).toBe("aria-clear-DOC-CLEAN");
    // D-3 — destination/recipient recorded to the audit trail only.
    expect(event.payload.export_destination).toBe("OMB MAX submission portal");
    expect(event.payload.intended_recipient).toBe("OMB RMO analyst, Jane Roe");
    expect(event.payload.export_capture).toBe("audit-record-only");

    // The decision is now recorded; the action UI is replaced by the status.
    expect(screen.getByTestId("decided-DOC-CLEAN")).toHaveTextContent(/Certified/);
    expect(screen.getByTestId("export-noted-DOC-CLEAN")).toHaveTextContent(/noted for audit trail \(not enforced/i);
  });

  it("Flag records a negative certification on ctx.aria and emits ARIA_VIOLATION_FLAGGED (no export capture required)", () => {
    const { events, ctx } = setup([FLAGGED]);
    fireEvent.change(screen.getByTestId("note-DOC-ADA"), { target: { value: "Flagged — over-obligation must be resolved." } });
    fireEvent.click(screen.getByTestId("flag-DOC-ADA"));

    expect(ctx.aria.isCertified("DOC-ADA")).toBe(false);
    expect(ctx.aria.get("DOC-ADA")?.certified).toBe(false);
    const event = events.find((e) => e.event_type === "ARIA_VIOLATION_FLAGGED")! as any;
    expect(event).toBeDefined();
    expect(event.actor_name).toBe("Robin Compliance");
    expect(event.payload.flagged_rule_ids).toContain("R-ADA-1");
  });

  it("requires a decision note — clicking with a short note records nothing", () => {
    const { events, ctx } = setup([CLEAN]);
    // Buttons are disabled, but defensively confirm the guard: a too-short note records nothing.
    fireEvent.change(screen.getByTestId("note-DOC-CLEAN"), { target: { value: "short" } });
    fireEvent.click(screen.getByTestId("certify-DOC-CLEAN")); // disabled — no effect
    expect(events.some((e) => e.event_type === "ARIA_CERTIFICATION_ISSUED")).toBe(false);
    expect(ctx.aria.list()).toHaveLength(0);
  });

  it("D-1: a congressional submission below threshold shows the data-quality finding as Violation (P1) with the document-type keying", () => {
    setup([CONG]);
    const finding = screen.getByTestId("finding-DOC-CONG-R-A11-3");
    expect(finding.querySelector('[data-severity="red"]')).toBeTruthy();
    expect(finding).toHaveTextContent(/Violation \(P1\)/);
    expect(screen.getByTestId("severity-keying-DOC-CONG")).toHaveTextContent(
      /congressional submission below the 90% threshold is a priority \(P1\) violation/i
    );
  });

  it("D-1: a non-congressional document below threshold shows At Risk with the keying rationale", () => {
    setup([NONCONG]);
    const finding = screen.getByTestId("finding-DOC-NONCONG-R-A11-3");
    expect(finding.querySelector('[data-severity="amber"]')).toBeTruthy();
    expect(finding).toHaveTextContent(/At risk/);
    expect(screen.getByTestId("severity-keying-DOC-NONCONG")).toHaveTextContent(
      /non-congressional document below the 90% threshold is At Risk/i
    );
  });
});

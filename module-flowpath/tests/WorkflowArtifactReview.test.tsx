/** @jest-environment jsdom */
/**
 * module-flowpath — WorkflowArtifactReview.test.tsx (Screen 3, Session 21 D1)
 * The human approval surface: the artifact renders in plain prose (Gap 5, never a schema dump);
 * Approve logs WORKFLOW_APPROVAL (Constraint #4) + FLOWPATH_ARTIFACT_APPROVED and calls back;
 * Return for Revision logs FLOWPATH_GATE_FAILED with the reviewer note and calls back; the blue
 * AI-disclosure guardrail (Category 2) is present; every event carries workflow_step_id.
 */
import { render, screen, fireEvent } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { WorkflowArtifactReview } from "../src/WorkflowArtifactReview";
import { artifactWorkflowStep } from "../src/flowpath-contract";
import { SYNTHETIC_MAPPER_OUTPUT, SYNTHETIC_SESSION_ID } from "../src/synthetic-elicitation";
import { makeCtx } from "./test-helpers";
import { resetFlowpathApprovalSessionForTests } from "../src/flowpath-approval-session";

function makeCtxLocal(sink?: SovereignLogEvent[]) {
  return makeCtx(sink ? { logSink: sink } : {});
}

const startRevision = (): void => fireEvent.click(screen.getByRole("button", { name: /^return for revision$/i }));

describe("WorkflowArtifactReview (Screen 3)", () => {
  // D5 (Session 61): approvals are a module-level session store — reset per test.
  beforeEach(() => resetFlowpathApprovalSessionForTests());

  it("renders the artifact title and summary in plain prose", () => {
    render(<WorkflowArtifactReview ctx={makeCtxLocal()} />);
    expect(screen.getByText(SYNTHETIC_MAPPER_OUTPUT.artifact.title)).toBeInTheDocument();
    const review = screen.getByTestId("artifact-review");
    expect(review.textContent ?? "").toMatch(/Each month the program analyst/i);
  });

  it("renders each step as a prose paragraph with the responsible role (Gap 5)", () => {
    render(<WorkflowArtifactReview ctx={makeCtxLocal()} />);
    const review = screen.getByTestId("artifact-review");
    const text = review.textContent ?? "";
    expect(text).toMatch(/The Program Analyst is responsible/);
    expect(text).toMatch(/The Program Manager is responsible/);
    expect(text).toMatch(/The workflow is complete when/i);
  });

  it("does not expose raw schema keys or JSON braces (Gap 5)", () => {
    render(<WorkflowArtifactReview ctx={makeCtxLocal()} />);
    const text = screen.getByTestId("artifact-review").textContent ?? "";
    expect(text).not.toMatch(/[{}]|"artifact_id"|"step_id"|workflow_step_id|data_classification/);
  });

  it("renders captured vocabulary as sentences and data sources in plain language", () => {
    render(<WorkflowArtifactReview ctx={makeCtxLocal()} />);
    const text = screen.getByTestId("artifact-review").textContent ?? "";
    expect(text).toMatch(/By cost variance, this organization means/i);
    expect(text).toMatch(/Oracle Financials is the organization's accounting system/i);
    expect(text).toMatch(/validated on a monthly cadence/i);
  });

  it("shows the permanent blue AI-disclosure guardrail (Category 2)", () => {
    const { container } = render(<WorkflowArtifactReview ctx={makeCtxLocal()} />);
    const banner = container.querySelector('[data-category="2-governance"]');
    expect(banner).not.toBeNull();
    expect(banner!.textContent ?? "").toMatch(/your approval commits it to the workflow registry/i);
  });

  it("applies the white content-card pattern (#ffffff cards)", () => {
    render(<WorkflowArtifactReview ctx={makeCtxLocal()} />);
    const review = screen.getByTestId("artifact-review");
    expect(review.style.background).toBe("rgb(255, 255, 255)");
  });

  it("logs WORKFLOW_APPROVAL on approve, with decision_type, actor, actor_name, workflow_step_id", () => {
    const sink: SovereignLogEvent[] = [];
    render(<WorkflowArtifactReview ctx={makeCtxLocal(sink)} />);
    fireEvent.click(screen.getByRole("button", { name: /approve and commit/i }));
    const ev = sink.find((e) => e.event_type === "HUMAN_DECISION" && e.decision_type === "WORKFLOW_APPROVAL");
    expect(ev).toBeDefined();
    expect(ev!.actor).toBe("human");
    expect(ev!.actor_name).toBe("Sam Analyst");
    expect(ev!.workflow_step_id).toBe(artifactWorkflowStep(SYNTHETIC_SESSION_ID));
  });

  it("logs FLOWPATH_ARTIFACT_APPROVED on approve", () => {
    const sink: SovereignLogEvent[] = [];
    render(<WorkflowArtifactReview ctx={makeCtxLocal(sink)} />);
    fireEvent.click(screen.getByRole("button", { name: /approve and commit/i }));
    expect(sink.some((e) => e.event_type === "FLOWPATH_ARTIFACT_APPROVED")).toBe(true);
  });

  it("calls onApproved with the session id and shows the committed confirmation", () => {
    const sink: SovereignLogEvent[] = [];
    const approved: string[] = [];
    render(<WorkflowArtifactReview ctx={makeCtxLocal(sink)} onApproved={(id) => approved.push(id)} />);
    fireEvent.click(screen.getByRole("button", { name: /approve and commit/i }));
    expect(approved).toEqual([SYNTHETIC_SESSION_ID]);
    expect(screen.getByTestId("approved-confirmation")).toBeInTheDocument();
  });

  it("logs FLOWPATH_GATE_FAILED with the reviewer note on return for revision", () => {
    const sink: SovereignLogEvent[] = [];
    render(<WorkflowArtifactReview ctx={makeCtxLocal(sink)} />);
    startRevision();
    fireEvent.change(screen.getByLabelText(/what needs to be corrected/i), { target: { value: "The second step is missing its trigger." } });
    fireEvent.click(screen.getByRole("button", { name: /send back for revision/i }));
    const ev = sink.find((e) => e.event_type === "FLOWPATH_GATE_FAILED");
    expect(ev).toBeDefined();
    expect((ev!.payload as { revision_note: string }).revision_note).toMatch(/missing its trigger/i);
    expect(ev!.workflow_step_id).toBe(artifactWorkflowStep(SYNTHETIC_SESSION_ID));
  });

  it("calls onReturnForRevision with the note", () => {
    const calls: Array<{ id: string; note: string }> = [];
    render(<WorkflowArtifactReview ctx={makeCtxLocal()} onReturnForRevision={(id, note) => calls.push({ id, note })} />);
    startRevision();
    fireEvent.change(screen.getByLabelText(/what needs to be corrected/i), { target: { value: "Needs a clearer terminal condition." } });
    fireEvent.click(screen.getByRole("button", { name: /send back for revision/i }));
    expect(calls).toEqual([{ id: SYNTHETIC_SESSION_ID, note: "Needs a clearer terminal condition." }]);
  });

  it("requires a substantive revision note before returning", () => {
    const sink: SovereignLogEvent[] = [];
    render(<WorkflowArtifactReview ctx={makeCtxLocal(sink)} />);
    startRevision();
    fireEvent.change(screen.getByLabelText(/what needs to be corrected/i), { target: { value: "no" } });
    fireEvent.click(screen.getByRole("button", { name: /send back for revision/i }));
    expect(sink.some((e) => e.event_type === "FLOWPATH_GATE_FAILED")).toBe(false);
    expect(screen.getByRole("alert").textContent ?? "").toMatch(/at least 10 characters/i);
  });

  it("every emitted event carries a workflow_step_id (Constraint #6)", () => {
    const sink: SovereignLogEvent[] = [];
    render(<WorkflowArtifactReview ctx={makeCtxLocal(sink)} />);
    fireEvent.click(screen.getByRole("button", { name: /approve and commit/i }));
    expect(sink.length).toBeGreaterThanOrEqual(2);
    expect(sink.every((e) => typeof e.workflow_step_id === "string" && e.workflow_step_id.length > 0)).toBe(true);
  });
});

// D5 (Session 61, finding D3-4) — the resurrection/duplication proofs: an
// approved artifact stays approved across unmount/remount, and a duplicate
// WORKFLOW_APPROVAL cannot be emitted for it in the same session.
describe("WorkflowArtifactReview — session-persistent approval (D5, Session 61)", () => {
  beforeEach(() => resetFlowpathApprovalSessionForTests());

  it("an approved artifact renders as approved after remount — no approve control, no duplicate emit path", () => {
    const logSink: SovereignLogEvent[] = [];
    const first = render(<WorkflowArtifactReview ctx={makeCtx({ logSink })} />);
    fireEvent.click(screen.getByRole("button", { name: /Approve and commit to registry/ }));
    expect(screen.getByTestId("approved-confirmation")).toBeInTheDocument();
    const approvalEvents = logSink.filter(
      (e) => e.event_type === "HUMAN_DECISION" && e.decision_type === "WORKFLOW_APPROVAL"
    );
    expect(approvalEvents).toHaveLength(1);
    first.unmount(); // navigate away

    render(<WorkflowArtifactReview ctx={makeCtx({ logSink })} />); // navigate back
    // Renders as already approved — the approve button never reappears.
    expect(screen.getByTestId("approved-confirmation")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Approve and commit to registry/ })).not.toBeInTheDocument();
    // Still exactly one WORKFLOW_APPROVAL in the audit sink.
    expect(
      logSink.filter((e) => e.event_type === "HUMAN_DECISION" && e.decision_type === "WORKFLOW_APPROVAL")
    ).toHaveLength(1);
  });
});

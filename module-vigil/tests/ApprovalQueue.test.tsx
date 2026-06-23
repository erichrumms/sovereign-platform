/** @jest-environment jsdom */
/**
 * module-vigil — ApprovalQueue.test.tsx
 * Renders request cards with risk badges and expiry countdown, the empty-state notice,
 * the EXPIRED badge past expiry, and forwards selection.
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { ApprovalQueue } from "../src/ApprovalQueue";
import { computeExpiresAt, approvalWorkflowStep, type AgentApprovalRequest, type RiskClassification } from "../src/approval-contract";

const ANCHOR = "2026-06-23T12:00:00.000Z";
const anchorMs = Date.parse(ANCHOR);

function req(id: string, risk: RiskClassification): AgentApprovalRequest {
  return {
    request_id: id,
    requesting_agent_id: "agentos-x",
    requesting_agent_class: "Operational",
    action_type: "model_deployment",
    action_detail: {},
    risk_classification: risk,
    submitted_at: ANCHOR,
    expires_at: computeExpiresAt(ANCHOR, risk),
    workflow_step_id: approvalWorkflowStep(id),
  };
}

describe("ApprovalQueue", () => {
  it("shows the empty-state notice when there are no requests", () => {
    render(<ApprovalQueue requests={[]} selectedId={null} onSelect={() => {}} />);
    expect(screen.getByText(/No pending approvals/i)).toBeInTheDocument();
  });

  it("renders a card per request and shows the expiry countdown", () => {
    render(<ApprovalQueue requests={[req("a", "P1")]} selectedId={null} onSelect={() => {}} nowMs={anchorMs + 5 * 60_000} />);
    expect(screen.getByText("model_deployment")).toBeInTheDocument();
    expect(screen.getByText(/Expires in 10 min/)).toBeInTheDocument();
  });

  it("shows the EXPIRED badge past expiry", () => {
    render(<ApprovalQueue requests={[req("a", "P1")]} selectedId={null} onSelect={() => {}} nowMs={anchorMs + 20 * 60_000} />);
    expect(screen.getByText("EXPIRED")).toBeInTheDocument();
  });

  it("forwards selection", () => {
    const onSelect = jest.fn();
    render(<ApprovalQueue requests={[req("a", "P1")]} selectedId={null} onSelect={onSelect} nowMs={anchorMs} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith("a");
  });
});

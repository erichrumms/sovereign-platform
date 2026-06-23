/** @jest-environment jsdom */
/**
 * module-vigil — ApprovalDetail.test.tsx
 * Shows the request fields, generates the (static, key-less) brief, and records a
 * decision via the decision panel — calling onDecided so the request leaves the queue.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { ApprovalDetail } from "../src/ApprovalDetail";
import { computeExpiresAt, approvalWorkflowStep, type AgentApprovalRequest } from "../src/approval-contract";
import { makeCtx } from "./test-helpers";

const ANCHOR = "2026-06-23T12:00:00.000Z";
const REQUEST: AgentApprovalRequest = {
  request_id: "req-1",
  requesting_agent_id: "agentos-deployer",
  requesting_agent_class: "Operational",
  action_type: "model_deployment",
  action_detail: { synthetic: true },
  risk_classification: "P1",
  submitted_at: ANCHOR,
  expires_at: computeExpiresAt(ANCHOR, "P1"),
  workflow_step_id: approvalWorkflowStep("req-1"),
  context: "Routine refresh.",
};

describe("ApprovalDetail", () => {
  it("renders request fields and the generated (static) brief", async () => {
    render(<ApprovalDetail ctx={makeCtx()} request={REQUEST} onDecided={() => {}} />);
    expect(screen.getByText(/req-1/)).toBeInTheDocument();
    expect(screen.getByText(/agentos-deployer \(Operational\)/)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText("STATIC")).toBeInTheDocument());
    expect(screen.getByLabelText("Approval Detail")).toHaveTextContent(/REQUESTED ACTION:/);
  });

  it("records a decision and calls onDecided", async () => {
    const onDecided = jest.fn();
    render(<ApprovalDetail ctx={makeCtx()} request={REQUEST} onDecided={onDecided} />);

    await waitFor(() => expect(screen.getByText("STATIC")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Decision note"), { target: { value: "approved after reviewing the detail" } });
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(onDecided).toHaveBeenCalledWith("req-1");
  });
});

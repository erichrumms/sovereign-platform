/** @jest-environment jsdom */
/**
 * module-vigil — VigilApp.test.tsx
 * The chrome renders the command center and two tabs: the Alert Queue (default — shows
 * the null-endpoint configuration notice) and the Agent Approval Queue (port-driven,
 * synthetic/dev requests). The legacy A2A-stage AgentApprovalQueue component is tested
 * standalone below (it is no longer rendered by VigilApp).
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { VigilApp } from "../src/VigilApp";
import { AgentApprovalQueue } from "../src/AgentApprovalQueue";
import { makeCtx } from "./test-helpers";

describe("VigilApp (scaffold)", () => {
  it("renders the VIGIL chrome and the operator identity", () => {
    render(<VigilApp ctx={makeCtx()} />);
    expect(screen.getByRole("heading", { name: "VIGIL", level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Agent & Security Operator Dashboard/)).toBeInTheDocument();
    expect(screen.getByText(/Pat Operator/)).toBeInTheDocument();
  });

  it("renders the Alert Queue stub with the null-endpoint configuration notice", () => {
    render(<VigilApp ctx={makeCtx()} />);
    const queue = screen.getByLabelText("Alert Queue");
    expect(queue).toHaveTextContent(/No alert endpoint configured/i);
    // Honest framing: empty does NOT mean secure.
    expect(queue).toHaveTextContent(/not.*because the platform is known to be secure/i);
  });

  it("shows the pending-approvals count from the synthetic/dev port in the command center", () => {
    render(<VigilApp ctx={makeCtx()} />);
    const summary = screen.getByLabelText("Command Center summary");
    expect(summary).toHaveTextContent(/Pending approvals/);
    expect(summary).toHaveTextContent(/3/); // three synthetic requests
  });

  it("switches to the Agent Approval Queue tab and shows the synthetic requests", () => {
    render(<VigilApp ctx={makeCtx()} />);
    // Default tab is the Alert Queue; the approval queue is not yet shown.
    expect(screen.getByLabelText("Alert Queue")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Agent Approval Queue" }));
    expect(screen.getByLabelText("Agent Approval Queue")).toBeInTheDocument();
    expect(
      screen.getAllByText(/model_deployment|data_export|configuration_change/).length
    ).toBeGreaterThan(0);
  });
});

describe("AgentApprovalQueue — does not call throwing A2A methods", () => {
  it("renders the implemented note only at the IMPLEMENTED stage", () => {
    render(<AgentApprovalQueue a2aStage="IMPLEMENTED" />);
    expect(screen.getByLabelText("Agent Approval Queue")).toHaveTextContent(/A2A protocol is IMPLEMENTED/i);
  });
});

/** @jest-environment jsdom */
/**
 * module-vigil — VigilApp.test.tsx
 * The scaffold chrome renders the command center and the two stubs correctly:
 * the Alert Queue shows the null-endpoint configuration notice (and does not throw),
 * and the Agent Approval Queue shows the A2A stage indicator without calling the
 * throwing A2A methods.
 */
import { render, screen } from "@testing-library/react";

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

  it("renders the Agent Approval Queue stub with the A2A DEFINED indicator", () => {
    render(<VigilApp ctx={makeCtx({ a2aStage: "DEFINED" })} />);
    const queue = screen.getByLabelText("Agent Approval Queue");
    expect(queue).toHaveTextContent(/A2A protocol at DEFINED stage/i);
    expect(queue).toHaveTextContent(/implemented in Stage\s*2/i);
  });

  it("reflects the actual A2A stage when agents have registered (CARDS_REGISTERED)", () => {
    render(<VigilApp ctx={makeCtx({ a2aStage: "CARDS_REGISTERED" })} />);
    expect(screen.getByLabelText("Agent Approval Queue")).toHaveTextContent(/A2A protocol at CARDS_REGISTERED stage/i);
  });
});

describe("AgentApprovalQueue — does not call throwing A2A methods", () => {
  it("renders the implemented note only at the IMPLEMENTED stage", () => {
    render(<AgentApprovalQueue a2aStage="IMPLEMENTED" />);
    expect(screen.getByLabelText("Agent Approval Queue")).toHaveTextContent(/A2A protocol is IMPLEMENTED/i);
  });
});

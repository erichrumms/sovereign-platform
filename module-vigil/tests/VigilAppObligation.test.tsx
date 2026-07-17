/** @jest-environment jsdom */
/**
 * module-vigil — VigilAppObligation.test.tsx
 * Part 3 (Session 38): the seeded PPBE obligation case (PPBE-OB-DEMO-001) appears
 * in the Agent Approval Queue as a ppbe_obligation P1 card; selecting it shows the
 * ObligationDecisionPanel with its counselId input (not the standard panel).
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { VigilApp } from "../src/VigilApp";
import { makeCtx } from "./test-helpers";

describe("VigilApp — Tier C obligation seeding (Part 3)", () => {
  it("includes the seeded PPBE obligation request in the Approval Queue", () => {
    render(<VigilApp ctx={makeCtx()} />);
    // Switch to Agent Approval Queue tab
    fireEvent.click(screen.getByRole("tab", { name: "Agent Approval Queue" }));
    // The obligation card appears with action_type "ppbe_obligation"
    expect(screen.getByText("ppbe_obligation")).toBeInTheDocument();
  });

  it("shows ObligationDecisionPanel (counselId input) when the obligation card is selected", () => {
    render(<VigilApp ctx={makeCtx()} />);
    fireEvent.click(screen.getByRole("tab", { name: "Agent Approval Queue" }));
    // Click the obligation card
    const obligationCard = screen.getByText("ppbe_obligation").closest("button");
    if (!obligationCard) throw new Error("obligation card button not found");
    fireEvent.click(obligationCard);
    // Tier C panel is present — standard panel's Approve/Reject/Escalate are absent
    expect(screen.getByTestId("obligation-counsel-id-input")).toBeInTheDocument();
    expect(screen.getByTestId("obligation-approve-btn")).toBeInTheDocument();
    // Approve is disabled until both fields are filled
    expect(screen.getByTestId("obligation-approve-btn")).toBeDisabled();
  });
});

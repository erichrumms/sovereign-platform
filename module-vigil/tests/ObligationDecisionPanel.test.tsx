/** @jest-environment jsdom */
/**
 * module-vigil — ObligationDecisionPanel.test.tsx
 * Part 3 (Session 38): Tier C obligation authorization panel — Approve requires
 * both a decision note (≥10 chars) AND a COUNSEL Decision Record ID.
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { ObligationDecisionPanel } from "../src/ObligationDecisionPanel";
import type { PPBEGateAction } from "../src/ppbe-authorization";

describe("ObligationDecisionPanel — Tier C gate", () => {
  it("renders counselId input, note textarea, and Approve/Reject buttons", () => {
    render(<ObligationDecisionPanel onDecide={() => true} error={null} />);
    expect(screen.getByTestId("obligation-counsel-id-input")).toBeInTheDocument();
    expect(screen.getByTestId("obligation-decision-note")).toBeInTheDocument();
    expect(screen.getByTestId("obligation-approve-btn")).toBeInTheDocument();
    expect(screen.getByTestId("obligation-reject-btn")).toBeInTheDocument();
  });

  it("Approve is disabled with no note and no counselId", () => {
    render(<ObligationDecisionPanel onDecide={() => true} error={null} />);
    expect(screen.getByTestId("obligation-approve-btn")).toBeDisabled();
  });

  it("Approve is disabled with a valid note but no counselId", () => {
    render(<ObligationDecisionPanel onDecide={() => true} error={null} />);
    fireEvent.change(screen.getByTestId("obligation-decision-note"), {
      target: { value: "This is a sufficient note" },
    });
    expect(screen.getByTestId("obligation-approve-btn")).toBeDisabled();
  });

  it("Approve is disabled with a counselId but note too short", () => {
    render(<ObligationDecisionPanel onDecide={() => true} error={null} />);
    fireEvent.change(screen.getByTestId("obligation-counsel-id-input"), {
      target: { value: "CDR-2026-0047" },
    });
    expect(screen.getByTestId("obligation-approve-btn")).toBeDisabled();
  });

  it("Approve becomes enabled when both note (≥10 chars) and counselId are present", () => {
    render(<ObligationDecisionPanel onDecide={() => true} error={null} />);
    fireEvent.change(screen.getByTestId("obligation-counsel-id-input"), {
      target: { value: "CDR-2026-0047" },
    });
    fireEvent.change(screen.getByTestId("obligation-decision-note"), {
      target: { value: "Obligation is within budget authority and aligned to mission." },
    });
    expect(screen.getByTestId("obligation-approve-btn")).not.toBeDisabled();
  });

  it("calls onDecide with APPROVE, note, and counselId when clicked", () => {
    const calls: Array<{ action: PPBEGateAction; note: string; id: string }> = [];
    render(
      <ObligationDecisionPanel
        onDecide={(action, note, id) => {
          calls.push({ action, note, id });
          return true;
        }}
        error={null}
      />
    );
    fireEvent.change(screen.getByTestId("obligation-counsel-id-input"), {
      target: { value: "CDR-2026-0047" },
    });
    fireEvent.change(screen.getByTestId("obligation-decision-note"), {
      target: { value: "Obligation approved per budget authority." },
    });
    fireEvent.click(screen.getByTestId("obligation-approve-btn"));
    expect(calls).toHaveLength(1);
    expect(calls[0].action).toBe("APPROVE");
    expect(calls[0].id).toBe("CDR-2026-0047");
  });

  it("Reject is enabled with a valid note even without counselId", () => {
    render(<ObligationDecisionPanel onDecide={() => true} error={null} />);
    fireEvent.change(screen.getByTestId("obligation-decision-note"), {
      target: { value: "Rejecting this obligation — insufficient justification." },
    });
    expect(screen.getByTestId("obligation-reject-btn")).not.toBeDisabled();
  });

  it("displays error text when error prop is set", () => {
    render(
      <ObligationDecisionPanel
        onDecide={() => false}
        error="Logger emission failed — authorization not recorded (CPMI-VRS Gate 2)"
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("CPMI-VRS Gate 2");
  });
});

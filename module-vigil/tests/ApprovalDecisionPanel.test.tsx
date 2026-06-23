/** @jest-environment jsdom */
/**
 * module-vigil — ApprovalDecisionPanel.test.tsx
 * Decisions require a ≥10-char note: the buttons are disabled until the note is valid,
 * and a click forwards the action + note to onDecide.
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { ApprovalDecisionPanel } from "../src/ApprovalDecisionPanel";

describe("ApprovalDecisionPanel", () => {
  it("disables all three decisions until the note is ≥10 chars", () => {
    render(<ApprovalDecisionPanel onDecide={() => true} error={null} />);
    for (const name of ["Approve", "Reject", "Escalate"]) {
      expect(screen.getByRole("button", { name })).toBeDisabled();
    }
    fireEvent.change(screen.getByLabelText("Decision note"), { target: { value: "short" } });
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Decision note"), { target: { value: "a sufficiently long decision note" } });
    expect(screen.getByRole("button", { name: "Approve" })).toBeEnabled();
  });

  it("forwards the action and note on click", () => {
    const onDecide = jest.fn().mockReturnValue(true);
    render(<ApprovalDecisionPanel onDecide={onDecide} error={null} />);
    fireEvent.change(screen.getByLabelText("Decision note"), { target: { value: "documented decision reason" } });
    fireEvent.click(screen.getByRole("button", { name: "Escalate" }));
    expect(onDecide).toHaveBeenCalledWith("ESCALATE", "documented decision reason");
  });

  it("surfaces an error", () => {
    render(<ApprovalDecisionPanel onDecide={() => false} error="Logger emission failed" />);
    expect(screen.getByRole("alert")).toHaveTextContent(/Logger emission failed/);
  });
});

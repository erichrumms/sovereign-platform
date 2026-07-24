/** @jest-environment jsdom */
/**
 * module-vigil — ApprovalDecisionPanel.test.tsx
 * Decisions require a ≥10-char note: the buttons are disabled until the note is valid,
 * and a click forwards the action + note to onDecide.
 */
import { render, screen, fireEvent, within } from "@testing-library/react";

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

describe("ApprovalDecisionPanel — reason-code chips (Session 59 D3)", () => {
  const CHIP = "Routine — matches expected pattern";

  it("renders all four reason-code chips in the quick-insert row", () => {
    render(<ApprovalDecisionPanel onDecide={() => true} error={null} />);
    const row = screen.getByLabelText("Reason-code quick-insert");
    expect(within(row).getAllByRole("button")).toHaveLength(4);
  });

  it("clicking a chip inserts its text into an empty note without submitting a decision", () => {
    const onDecide = jest.fn().mockReturnValue(true);
    render(<ApprovalDecisionPanel onDecide={onDecide} error={null} />);
    fireEvent.click(screen.getByRole("button", { name: CHIP }));
    expect(screen.getByLabelText("Decision note")).toHaveValue(CHIP);
    expect(onDecide).not.toHaveBeenCalled();
  });

  it("clicking a chip appends to existing text with a single separating space", () => {
    render(<ApprovalDecisionPanel onDecide={() => true} error={null} />);
    fireEvent.change(screen.getByLabelText("Decision note"), {
      target: { value: "Checked the evidence.  " },
    });
    fireEvent.click(screen.getByRole("button", { name: CHIP }));
    expect(screen.getByLabelText("Decision note")).toHaveValue(`Checked the evidence. ${CHIP}`);
  });

  it("a chip-inserted note satisfies the ≥10-char minimum and enables the decision buttons", () => {
    render(<ApprovalDecisionPanel onDecide={() => true} error={null} />);
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: CHIP }));
    expect(screen.getByRole("button", { name: "Approve" })).toBeEnabled();
  });

  it("chips extend a too-short manual note rather than replacing it, and the combined note is forwarded", () => {
    const onDecide = jest.fn().mockReturnValue(true);
    render(<ApprovalDecisionPanel onDecide={onDecide} error={null} />);
    fireEvent.change(screen.getByLabelText("Decision note"), { target: { value: "short" } });
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: CHIP }));
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(onDecide).toHaveBeenCalledWith("APPROVE", `short ${CHIP}`);
  });

  it("the note resets after a successful decision that used a chip", () => {
    render(<ApprovalDecisionPanel onDecide={() => true} error={null} />);
    fireEvent.click(screen.getByRole("button", { name: CHIP }));
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(screen.getByLabelText("Decision note")).toHaveValue("");
  });
});

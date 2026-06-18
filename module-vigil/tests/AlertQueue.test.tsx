/** @jest-environment jsdom */
/**
 * module-vigil — AlertQueue.test.tsx
 * The queue renders selectable alert cards, surfaces the CPMI platform-wide warning,
 * and falls back to the honest null-endpoint notice (empty ≠ secure, spec §3.2).
 */
import { render, screen, fireEvent, within } from "@testing-library/react";

import { AlertQueue } from "../src/AlertQueue";
import { makeAlert } from "./test-helpers";

describe("AlertQueue", () => {
  it("shows the null-endpoint notice when unconfigured and empty (empty ≠ secure)", () => {
    render(<AlertQueue alerts={[]} configured={false} selectedId={null} onSelect={() => {}} />);
    const queue = screen.getByLabelText("Alert Queue");
    expect(queue).toHaveTextContent(/No alert endpoint configured/i);
    expect(queue).toHaveTextContent(/not.*because the platform is known to be secure/i);
  });

  it("renders a card per alert in the given order", () => {
    const alerts = [
      makeAlert({ alertId: "p1", alertLevel: "P1", alertType: "ANOMALY_DETECTED" }),
      makeAlert({ alertId: "p2", alertLevel: "P2", alertType: "THRESHOLD_BREACH" }),
    ];
    render(<AlertQueue alerts={alerts} configured selectedId={null} onSelect={() => {}} />);
    const cards = within(screen.getByLabelText("Alert Queue")).getAllByRole("button");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("ANOMALY_DETECTED");
    expect(cards[1]).toHaveTextContent("THRESHOLD_BREACH");
  });

  it("renders the CPMI platform-wide warning on a CPMI_DRIFT_DETECTED card", () => {
    render(
      <AlertQueue
        alerts={[makeAlert({ alertType: "CPMI_DRIFT_DETECTED", sourceProduct: "CPMI" })]}
        configured
        selectedId={null}
        onSelect={() => {}}
      />
    );
    expect(screen.getByLabelText("Alert Queue")).toHaveTextContent(/platform-wide dependency/i);
  });

  it("calls onSelect with the alert id when a card is clicked", () => {
    const onSelect = jest.fn();
    render(
      <AlertQueue alerts={[makeAlert({ alertId: "A1" })]} configured selectedId={null} onSelect={onSelect} />
    );
    fireEvent.click(within(screen.getByLabelText("Alert Queue")).getAllByRole("button")[0]);
    expect(onSelect).toHaveBeenCalledWith("A1");
  });

  it("marks the selected card as pressed", () => {
    render(
      <AlertQueue alerts={[makeAlert({ alertId: "A1" })]} configured selectedId="A1" onSelect={() => {}} />
    );
    expect(within(screen.getByLabelText("Alert Queue")).getAllByRole("button")[0]).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});

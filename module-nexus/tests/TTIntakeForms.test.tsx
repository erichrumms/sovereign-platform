/** @jest-environment jsdom */
/**
 * module-nexus — TTIntakeForms.test.tsx (Session 118, F-50 regression)
 *
 * F-50: the travel intake form discarded EVERY entered field when a single
 * field failed validation, because the form body cleared its state
 * unconditionally after calling submitTravel. The fix clears only when the
 * submission actually committed. These tests pin both halves of that contract:
 * a failed submission preserves the operator's input alongside the error, and
 * a successful submission still resets the form for the next request.
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { SYNTH_TT_TRAVEL_POLICY } from "@sovereign/data";

import { useTTIntake } from "../src/useTTIntake";
import { TravelIntakeFormBody } from "../src/TTIntakeForms";
import { makeCtx } from "./test-helpers";

function Harness(): JSX.Element {
  const tt = useTTIntake(makeCtx(), {
    travelPolicy: SYNTH_TT_TRAVEL_POLICY,
    // Fixed clock: 50 days of lead time to the travel dates below (Session 95 lesson).
    nowIsoFn: () => "2026-07-01T00:00:00.000Z",
  });
  return (
    <>
      <TravelIntakeFormBody tt={tt} />
      {tt.error ? <p role="alert">{tt.error}</p> : null}
    </>
  );
}

function fillForm(over: { airfare?: string } = {}): void {
  fireEvent.change(screen.getByLabelText("destination"), { target: { value: "Denver, CO" } });
  fireEvent.change(screen.getByLabelText("travel start date"), { target: { value: "2026-08-20" } });
  fireEvent.change(screen.getByLabelText("travel end date"), { target: { value: "2026-08-22" } });
  fireEvent.change(screen.getByLabelText("mission purpose"), { target: { value: "Program review" } });
  fireEvent.change(screen.getByLabelText("cost airfare"), { target: { value: over.airfare ?? "400" } });
  fireEvent.change(screen.getByLabelText("cost hotel"), { target: { value: "300" } });
  fireEvent.change(screen.getByLabelText("cost per_diem"), { target: { value: "200" } });
  fireEvent.change(screen.getByLabelText("cost ground_transport"), { target: { value: "50" } });
  fireEvent.change(screen.getByLabelText("cost registration_fees"), { target: { value: "0" } });
  fireEvent.change(screen.getByLabelText("justification"), { target: { value: "Quarterly on-site program review." } });
}

describe("TravelIntakeFormBody — F-50 data preservation", () => {
  it("preserves every entered field when one field fails validation", () => {
    render(<Harness />);
    fillForm({ airfare: "not-a-number" });

    fireEvent.click(screen.getByTestId("tt-submit-travel"));

    // The error is surfaced AND the operator's input survives it.
    expect(screen.getByRole("alert").textContent).toContain("airfare");
    expect(screen.getByLabelText("destination")).toHaveValue("Denver, CO");
    expect(screen.getByLabelText("mission purpose")).toHaveValue("Program review");
    expect(screen.getByLabelText("cost hotel")).toHaveValue("300");
    expect(screen.getByLabelText("justification")).toHaveValue("Quarterly on-site program review.");
    // The invalid field itself is also preserved, so the operator can see and correct it.
    expect(screen.getByLabelText("cost airfare")).toHaveValue("not-a-number");
  });

  it("clears the form after a successful submission", () => {
    render(<Harness />);
    fillForm();

    fireEvent.click(screen.getByTestId("tt-submit-travel"));

    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByLabelText("destination")).toHaveValue("");
    // Cost fields reset to EMPTY_TRAVEL_FORM's "0" default, not the empty string.
    expect(screen.getByLabelText("cost airfare")).toHaveValue("0");
  });

  it("submits successfully after the operator corrects only the invalid field", () => {
    render(<Harness />);
    fillForm({ airfare: "not-a-number" });
    fireEvent.click(screen.getByTestId("tt-submit-travel"));
    expect(screen.getByLabelText("destination")).toHaveValue("Denver, CO");

    fireEvent.change(screen.getByLabelText("cost airfare"), { target: { value: "400" } });
    fireEvent.click(screen.getByTestId("tt-submit-travel"));

    // The corrected resubmission commits and the form resets.
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByLabelText("destination")).toHaveValue("");
  });
});

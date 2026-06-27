/** @jest-environment jsdom */
/**
 * module-flowpath — IndividualWorkstyle.test.tsx (Screen 4)
 * The trust statement is delivered verbatim before any question and must be acknowledged; the
 * privacy banner is always present; only expertise/preference questions are asked; a looser personal
 * threshold surfaces a boundary conflict and logs FLOWPATH_WORKSTYLE_BOUNDARY_CONFLICT; a valid
 * profile logs FLOWPATH_WORKSTYLE_ELICITED with the HASHED analyst id and data_classification: user;
 * the cleartext employee id never appears in any logged event.
 */
import { render, screen, fireEvent } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { IndividualWorkstyle } from "../src/IndividualWorkstyle";
import { hashAnalystId, workstyleWorkflowStep } from "../src/flowpath-contract";
import { ANALYST_TRUST_STATEMENT } from "../src/prompts/individual-elicitation.prompt";
import { makeCtx } from "./test-helpers";

const EMP = "E-410";

function acknowledge(): void {
  fireEvent.click(screen.getByRole("button", { name: /i understand — begin/i }));
}

describe("IndividualWorkstyle (Screen 4)", () => {
  it("delivers the trust statement verbatim before any question", () => {
    render(<IndividualWorkstyle ctx={makeCtx({ employee_id: EMP })} />);
    expect(screen.getByTestId("trust-statement")).toHaveTextContent(ANALYST_TRUST_STATEMENT);
    // No elicitation questions before acknowledgement.
    expect(screen.queryByLabelText(/what do you look at first/i)).not.toBeInTheDocument();
  });

  it("requires acknowledgement before the questions appear", () => {
    render(<IndividualWorkstyle ctx={makeCtx({ employee_id: EMP })} />);
    acknowledge();
    expect(screen.getByLabelText(/what do you look at first/i)).toBeInTheDocument();
    expect(screen.queryByTestId("trust-statement")).not.toBeInTheDocument();
  });

  it("always shows the privacy notice (Category 2), before and after acknowledgement", () => {
    render(<IndividualWorkstyle ctx={makeCtx({ employee_id: EMP })} />);
    expect(screen.getByText(/never shared with administrators/i)).toBeInTheDocument();
    acknowledge();
    expect(screen.getByText(/never shared with administrators/i)).toBeInTheDocument();
  });

  it("offers three entry points (initial / post-review / annual refresh)", () => {
    render(<IndividualWorkstyle ctx={makeCtx({ employee_id: EMP })} />);
    expect(screen.getByRole("button", { name: /initial elicitation/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /post-review reflection/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /annual refresh/i })).toBeInTheDocument();
  });

  it("asks only expertise/preference questions — never the prohibited types (Gap 5 / §5a)", () => {
    const { container } = render(<IndividualWorkstyle ctx={makeCtx({ employee_id: EMP })} />);
    acknowledge();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/how long does it take|describe all the steps|what would you do differently|compare(d)? to (other|your colleagues)/i);
  });

  it("surfaces a boundary conflict and logs FLOWPATH_WORKSTYLE_BOUNDARY_CONFLICT for a looser threshold", () => {
    const sink: SovereignLogEvent[] = [];
    render(<IndividualWorkstyle ctx={makeCtx({ employee_id: EMP, logSink: sink })} />);
    acknowledge();
    fireEvent.change(screen.getByLabelText(/concern threshold for cost variance/i), { target: { value: "10 percent" } });
    fireEvent.click(screen.getByRole("button", { name: /save my workstyle/i }));
    expect(screen.getByText(/Threshold conflict/i)).toBeInTheDocument();
    const ev = sink.find((e) => e.event_type === "FLOWPATH_WORKSTYLE_BOUNDARY_CONFLICT");
    expect(ev).toBeDefined();
    expect(ev!.payload).toMatchObject({ data_classification: "user" });
    expect(screen.queryByTestId("workstyle-saved")).not.toBeInTheDocument();
  });

  it("saves the profile and logs FLOWPATH_WORKSTYLE_ELICITED with the hashed id + data_classification user", () => {
    const sink: SovereignLogEvent[] = [];
    render(<IndividualWorkstyle ctx={makeCtx({ employee_id: EMP, logSink: sink })} />);
    acknowledge();
    fireEvent.change(screen.getByLabelText(/what do you look at first/i), { target: { value: "Cost elements before milestones." } });
    fireEvent.change(screen.getByLabelText(/concern threshold for cost variance/i), { target: { value: "5 percent" } });
    fireEvent.click(screen.getByRole("button", { name: /save my workstyle/i }));
    expect(screen.getByTestId("workstyle-saved")).toBeInTheDocument();
    const ev = sink.find((e) => e.event_type === "FLOWPATH_WORKSTYLE_ELICITED")!;
    expect(ev).toBeDefined();
    expect(ev.actor_id).toBe(hashAnalystId(EMP));
    expect(ev.workflow_step_id).toBe(workstyleWorkflowStep(hashAnalystId(EMP)));
    expect(ev.payload).toMatchObject({ analyst_id_hash: hashAnalystId(EMP), data_classification: "user" });
  });

  it("never writes the cleartext employee id into any logged event (privacy)", () => {
    const sink: SovereignLogEvent[] = [];
    render(<IndividualWorkstyle ctx={makeCtx({ employee_id: EMP, logSink: sink })} />);
    acknowledge();
    fireEvent.change(screen.getByLabelText(/what do you look at first/i), { target: { value: "Cost elements first." } });
    fireEvent.change(screen.getByLabelText(/concern threshold for cost variance/i), { target: { value: "5 percent" } });
    fireEvent.click(screen.getByRole("button", { name: /save my workstyle/i }));
    expect(JSON.stringify(sink)).not.toContain(EMP);
    expect(sink.length).toBeGreaterThan(0);
  });
});

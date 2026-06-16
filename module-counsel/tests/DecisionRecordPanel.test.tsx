/** @jest-environment jsdom */
/**
 * module-counsel — DecisionRecordPanel.test.tsx
 * CPMI-VRS Gate 3: the produce button is disabled until the user confirms review.
 * On confirm, a HUMAN_DECISION event is emitted and the canonical Document ID is
 * shown for hand-back to the source product.
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { DecisionRecordPanel } from "../src/DecisionRecordPanel";
import { makeCtx, frameFixture, analysisFixture } from "./test-helpers";

describe("DecisionRecordPanel", () => {
  it("gates production on the Gate 3 confirmation checkbox", () => {
    const { ctx } = makeCtx();
    render(<DecisionRecordPanel ctx={ctx} frame={frameFixture()} analysis={analysisFixture()} />);
    const button = screen.getByRole("button", { name: /Produce Decision Record/ });
    expect(button).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox"));
    expect(button).toBeEnabled();
  });

  it("emits a HUMAN_DECISION event and shows the Document ID on success", () => {
    const { ctx, logged } = makeCtx();
    render(
      <DecisionRecordPanel
        ctx={ctx}
        frame={frameFixture()}
        analysis={analysisFixture()}
        defaultProgramId="PRG-1042"
      />
    );

    fireEvent.change(screen.getByLabelText(/Which alternative/i), { target: { value: "ALT-2" } });
    fireEvent.change(screen.getByLabelText(/Your rationale/i), {
      target: { value: "Cost data is incomplete; defer is cheap insurance." },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Produce Decision Record/ }));

    // Success view.
    expect(screen.getByText("Decision recorded")).toBeInTheDocument();
    expect(screen.getByText(/COUNSEL-DR-NEXUS-APPROVE-v1-step-3/)).toBeInTheDocument();

    // The frozen IL fields are present on the emitted HUMAN_DECISION event.
    const event = logged.find((e) => e.event_type === "HUMAN_DECISION");
    expect(event).toBeDefined();
    expect(event?.decision_type).toBe("HUMAN_APPROVAL");
    expect(event?.actor).toBe("human");
    expect(event?.actor_name).toBe("Dana Reviewer");
    expect(event?.workflow_step_id).toBe("NEXUS-APPROVE-v1-step-3");
    expect(event?.payload.chosen_alternative_id).toBe("ALT-2");
    expect(event?.payload.program_id).toBe("PRG-1042");
  });

  it("surfaces a Gate 2 logger failure instead of claiming the record was produced", () => {
    const { ctx } = makeCtx({ logThrows: true });
    render(
      <DecisionRecordPanel
        ctx={ctx}
        frame={frameFixture()}
        analysis={analysisFixture()}
        defaultProgramId="PRG-1042"
      />
    );
    fireEvent.change(screen.getByLabelText(/Your rationale/i), { target: { value: "Go." } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Produce Decision Record/ }));

    expect(screen.queryByText("Decision recorded")).not.toBeInTheDocument();
    expect(screen.getByText(/Logger emission failed/)).toBeInTheDocument();
  });
});

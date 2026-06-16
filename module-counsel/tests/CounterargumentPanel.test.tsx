/** @jest-environment jsdom */
/**
 * module-counsel — CounterargumentPanel.test.tsx
 * Pick an alternative → a (static) challenge renders → conclude the dialogue →
 * the panel hands back a CounterargumentSummary. No network: the engine degrades
 * to the static challenge tier.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { CounterargumentPanel } from "../src/CounterargumentPanel";
import { makeCtx, frameFixture, analysisFixture } from "./test-helpers";

describe("CounterargumentPanel", () => {
  it("challenges a chosen alternative and returns a summary the human concludes", async () => {
    const { ctx, logged } = makeCtx();
    const onComplete = jest.fn();
    render(
      <CounterargumentPanel
        ctx={ctx}
        frame={frameFixture()}
        analysis={analysisFixture()}
        onComplete={onComplete}
        onSkip={() => {}}
      />
    );

    // Stage 1: pick the alternative to challenge.
    fireEvent.click(screen.getByRole("button", { name: /Approve as submitted/ }));

    // Stage 2: the static challenge resolves and renders (with its concession).
    await waitFor(() => expect(screen.getByText("Challenge 1")).toBeInTheDocument());
    expect(screen.getByText(/Concession:/)).toBeInTheDocument();

    // Conclude the dialogue and record the human's net assessment.
    fireEvent.click(screen.getByRole("button", { name: /Conclude the dialogue/ }));
    fireEvent.change(screen.getByLabelText(/net assessment/i), {
      target: { value: "Defer is the stronger play." },
    });
    fireEvent.click(screen.getByRole("button", { name: /Position weakened/ }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    const summary = onComplete.mock.calls[0][0];
    expect(summary.targetAlternativeId).toBe("ALT-1");
    expect(summary.positionSurvived).toBe(false);
    expect(summary.netAssessment).toBe("Defer is the stronger play.");
    expect(summary.turns.length).toBeGreaterThanOrEqual(1);

    // Gate 2: the turn emitted reasoning events under counsel-analyst.
    expect(logged.some((e) => e.event_type === "REASONING_STEP_COMPLETE")).toBe(true);
  });

  it("can be skipped without producing a summary", () => {
    const onSkip = jest.fn();
    const { ctx } = makeCtx();
    render(
      <CounterargumentPanel
        ctx={ctx}
        frame={frameFixture()}
        analysis={analysisFixture()}
        onComplete={() => {}}
        onSkip={onSkip}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});

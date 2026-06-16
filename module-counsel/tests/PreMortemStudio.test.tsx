/** @jest-environment jsdom */
/**
 * module-counsel — PreMortemStudio.test.tsx
 * Pick a course → the (static) pre-mortem renders its failure modes → record it →
 * the panel hands back a PreMortemResult. No network: degrades to the static tier.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { PreMortemStudio } from "../src/PreMortemStudio";
import { makeCtx, frameFixture, analysisFixture } from "./test-helpers";

describe("PreMortemStudio", () => {
  it("runs the pre-mortem on a chosen course and returns the result", async () => {
    const { ctx, logged } = makeCtx();
    const onComplete = jest.fn();
    render(
      <PreMortemStudio
        ctx={ctx}
        frame={frameFixture()}
        analysis={analysisFixture()}
        onComplete={onComplete}
        onSkip={() => {}}
      />
    );

    // Stage 1: pick the course to pre-mortem.
    fireEvent.click(screen.getByRole("button", { name: /Approve as submitted/ }));

    // Stage 2: the static pre-mortem resolves with at least two failure modes.
    await waitFor(() => expect(screen.getByText("FM-1")).toBeInTheDocument());
    expect(screen.getByText("FM-2")).toBeInTheDocument();
    expect(screen.getByText(/Top preventive action/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Record this pre-mortem/ }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    const result = onComplete.mock.calls[0][0];
    expect(result.failureModes.length).toBeGreaterThanOrEqual(2);
    expect(result.source).toBe("static");

    // Gate 2: a pre-mortem reasoning step was emitted.
    const complete = logged.find((e) => e.event_type === "REASONING_STEP_COMPLETE");
    expect(complete?.payload.registry_id).toBe("PR-COUNSEL-003");
  });
});

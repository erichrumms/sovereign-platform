/** @jest-environment jsdom */
/**
 * module-counsel — AnalysisPanel.test.tsx
 * Component tests for the Analysis result rendering and the panel's run+lift
 * behavior. With no API key the engine degrades to the static tier (no network),
 * so the panel renders the degraded fallback and lifts a schema-valid result.
 */
import { render, screen, waitFor } from "@testing-library/react";

import { AnalysisPanel, AnalysisResultView } from "../src/AnalysisPanel";
import { makeCtx, frameFixture, analysisFixture } from "./test-helpers";

describe("AnalysisResultView", () => {
  it("renders alternatives, confidence, severity badges, and the recommended action", () => {
    render(<AnalysisResultView result={analysisFixture()} />);
    expect(screen.getByText("Approve")).toBeInTheDocument();
    expect(screen.getByText("Defer")).toBeInTheDocument();
    expect(screen.getByText("Escalate")).toBeInTheDocument();
    expect(screen.getByText("64/100")).toBeInTheDocument();
    expect(screen.getByText("HIGH")).toBeInTheDocument();
    expect(screen.getByText(/Verify the package before approving/)).toBeInTheDocument();
  });

  it("shows the degraded banner only when the source is not live", () => {
    const { rerender } = render(<AnalysisResultView result={analysisFixture()} />);
    expect(screen.queryByText(/Degraded mode/)).not.toBeInTheDocument();
    rerender(<AnalysisResultView result={{ ...analysisFixture(), source: "static" }} />);
    expect(screen.getByText(/Degraded mode/)).toBeInTheDocument();
  });
});

describe("AnalysisPanel", () => {
  it("runs analysis (degrades to static with no key) and lifts a result via onComplete", async () => {
    const { ctx } = makeCtx();
    const onComplete = jest.fn();
    render(<AnalysisPanel ctx={ctx} frame={frameFixture()} onReframe={() => {}} onComplete={onComplete} />);

    // Static fallback resolves asynchronously; the panel then renders the result.
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    const lifted = onComplete.mock.calls[0][0];
    expect(lifted.alternatives.length).toBeGreaterThanOrEqual(3);
    expect(lifted.source).toBe("static");
    expect(screen.getByText(/Degraded mode/)).toBeInTheDocument();
  });

  it("emits REASONING_STEP_START/COMPLETE and FALLBACK_ACTIVATED via the logger (Gate 2)", async () => {
    const { ctx, logged } = makeCtx();
    render(<AnalysisPanel ctx={ctx} frame={frameFixture()} onReframe={() => {}} />);
    await waitFor(() => expect(logged.some((e) => e.event_type === "REASONING_STEP_COMPLETE")).toBe(true));
    const types = logged.map((e) => e.event_type);
    expect(types).toContain("REASONING_STEP_START");
    expect(types).toContain("FALLBACK_ACTIVATED");
    // Provenance is stamped on the completion event.
    const complete = logged.find((e) => e.event_type === "REASONING_STEP_COMPLETE");
    expect(complete?.payload.registry_id).toBe("PR-COUNSEL-001");
    expect(complete?.agent_id).toBe("counsel-analyst");
  });
});

/** @jest-environment jsdom */
/**
 * module-apex — PPBEAgentsPanel.test.tsx
 * Part 2 (Session 38): evidence-synthesizer and scenario-analyst triggers
 * render in the Execution Monitoring tab; clicking each produces output
 * with the correct advisory label (static tier in test — no LLM key).
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { PPBEAgentsPanel } from "../src/PPBEAgentsPanel";
import { PPBE_ADVISORY_LABEL } from "../src/ppbe-evidence-synthesizer";
import { PPBE_SCENARIO_LABEL } from "../src/ppbe-scenario-analyst";
import { createSyntheticPPBEDashboardInputs } from "../src/ppbe-data-adapter";
import { makeCtx } from "./test-helpers";

const inputs = createSyntheticPPBEDashboardInputs();

describe("PPBEAgentsPanel — Part 2 PPBE agent triggers", () => {
  it("renders both agent trigger buttons", () => {
    render(<PPBEAgentsPanel ctx={makeCtx()} inputs={inputs} />);
    expect(screen.getByTestId("ppbe-run-evidence-synthesis")).toBeInTheDocument();
    expect(screen.getByTestId("ppbe-run-scenario-analysis")).toBeInTheDocument();
  });

  it("shows evidence synthesis output with advisory label after clicking Run", async () => {
    render(<PPBEAgentsPanel ctx={makeCtx()} inputs={inputs} />);
    fireEvent.click(screen.getByTestId("ppbe-run-evidence-synthesis"));
    await waitFor(() =>
      expect(screen.getByTestId("ppbe-evidence-synthesis-output")).toBeInTheDocument()
    );
    expect(screen.getByTestId("ppbe-evidence-synthesis-output")).toHaveTextContent(PPBE_ADVISORY_LABEL);
    expect(screen.getByTestId("ppbe-evidence-synthesis-output")).toHaveTextContent("Evidence synthesis");
  });

  it("shows scenario analysis output with scenario label after clicking Run", async () => {
    render(<PPBEAgentsPanel ctx={makeCtx()} inputs={inputs} />);
    fireEvent.click(screen.getByTestId("ppbe-run-scenario-analysis"));
    await waitFor(() =>
      expect(screen.getByTestId("ppbe-scenario-analysis-output")).toBeInTheDocument()
    );
    expect(screen.getByTestId("ppbe-scenario-analysis-output")).toHaveTextContent(PPBE_SCENARIO_LABEL);
  });
});

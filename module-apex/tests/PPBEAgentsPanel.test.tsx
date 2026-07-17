/** @jest-environment jsdom */
/**
 * module-apex — PPBEAgentsPanel.test.tsx
 * Part 2 (Session 38): evidence-synthesizer and scenario-analyst triggers
 * render in the Execution Monitoring tab; clicking each produces output
 * with the correct advisory label (static tier in test — no LLM key).
 *
 * Post-session: prompt-assertion tests verify each panel passes the real,
 * approved .md file content as systemPrompt — independent of API key
 * availability. Regressions to [PENDING] placeholders are caught here.
 */
import fs from "fs";
import path from "path";

import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { PPBEAgentsPanel } from "../src/PPBEAgentsPanel";
import { PPBE_ADVISORY_LABEL } from "../src/ppbe-evidence-synthesizer";
import { PPBE_SCENARIO_LABEL } from "../src/ppbe-scenario-analyst";
import * as evidenceSynthModule from "../src/ppbe-evidence-synthesizer";
import * as scenarioModule from "../src/ppbe-scenario-analyst";
import { createSyntheticPPBEDashboardInputs } from "../src/ppbe-data-adapter";
import { makeCtx } from "./test-helpers";

const PROMPT_DIR = path.resolve(__dirname, "../../ppbe/prompts");

function loadApprovedPrompt(filename: string): string {
  const raw = fs.readFileSync(path.join(PROMPT_DIR, filename), "utf8");
  if (!/STATUS:\s*APPROVED/.test(raw)) throw new Error(`${filename}: STATUS is not APPROVED`);
  return raw.replace(/^<!--[\s\S]*?-->\s*/, "");
}

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

describe("PPBEAgentsPanel — systemPrompt matches approved .md files", () => {
  afterEach(() => jest.restoreAllMocks());

  it("passes evidence_synthesis_system.md content (stripped) as systemPrompt to runEvidenceSynthesis", async () => {
    const spy = jest.spyOn(evidenceSynthModule, "runEvidenceSynthesis");
    render(<PPBEAgentsPanel ctx={makeCtx()} inputs={inputs} />);
    fireEvent.click(screen.getByTestId("ppbe-run-evidence-synthesis"));
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    const capturedPrompt = spy.mock.calls[0][1] as string;
    const expectedPrompt = loadApprovedPrompt("evidence_synthesis_system.md");
    expect(capturedPrompt).toBe(expectedPrompt);
  });

  it("passes scenario_analysis_system.md content (stripped) as systemPrompt to runScenarioAnalysis", async () => {
    const spy = jest.spyOn(scenarioModule, "runScenarioAnalysis");
    render(<PPBEAgentsPanel ctx={makeCtx()} inputs={inputs} />);
    fireEvent.click(screen.getByTestId("ppbe-run-scenario-analysis"));
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    const capturedPrompt = spy.mock.calls[0][1] as string;
    const expectedPrompt = loadApprovedPrompt("scenario_analysis_system.md");
    expect(capturedPrompt).toBe(expectedPrompt);
  });
});

/** @jest-environment jsdom */
/**
 * module-nexus — PPBECoordinationPanel.test.tsx
 * Part 2 (Session 38): ppbe-coordination-assistant trigger renders in
 * NEXUS's "PPBE Coordination" tab; clicking Run Coordination Tracking
 * produces output with the advisory label (static tier in test).
 *
 * Post-session: prompt-assertion test verifies the panel passes the real,
 * approved coordination_system.md content as systemPrompt.
 */
import fs from "fs";
import path from "path";

import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { PPBECoordinationPanel } from "../src/PPBECoordinationPanel";
import { PPBE_COORDINATION_ADVISORY_LABEL } from "../src/ppbe-coordination-assistant";
import * as coordinationModule from "../src/ppbe-coordination-assistant";
import type { SovereignShellContext, SovereignLogEvent } from "../../sovereign-shell/shell-contract";

const PROMPT_DIR = path.resolve(__dirname, "../../ppbe/prompts");

function loadApprovedPrompt(filename: string): string {
  const raw = fs.readFileSync(path.join(PROMPT_DIR, filename), "utf8");
  if (!/STATUS:\s*APPROVED/.test(raw)) throw new Error(`${filename}: STATUS is not APPROVED`);
  return raw.replace(/^<!--[\s\S]*?-->\s*/, "");
}

function makeCtx(): SovereignShellContext {
  const events: SovereignLogEvent[] = [];
  return {
    auth: { user: { employee_id: "TEST-001", name: "Test User", org_unit: "TEST", role: "PROGRAM_MANAGER", clearance_level: "UNCLASSIFIED", cost_code_assignments: [] } },
    logger: { log: (e: SovereignLogEvent) => { events.push(e); } },
    governance: {
      cpmiStatus: { overall: "GREEN", pending_gate3_reviews: 0, last_updated: "2026-07-16T00:00:00Z" },
      vrsGates: [],
      isOnHold: () => false,
    },
    cpmiPublisher: { publish: () => {} },
    flowpathPublisher: { publishArtifact: () => {} },
    agentosRegistry: { register: () => {}, list: () => [] },
    taskSurface: { publish: () => {}, subscribe: () => () => {} },
    workQueueSurface: { publish: () => {}, listForModule: () => [], list: () => [], subscribe: () => () => {} },
    client: {} as SovereignShellContext["client"],
  } as unknown as SovereignShellContext;
}

describe("PPBECoordinationPanel — Part 2 ppbe-coordination-assistant trigger", () => {
  it("renders the notes textarea and Run button", () => {
    render(<PPBECoordinationPanel ctx={makeCtx()} />);
    expect(screen.getByTestId("ppbe-coordination-notes")).toBeInTheDocument();
    expect(screen.getByTestId("ppbe-run-coordination-tracking")).toBeInTheDocument();
  });

  it("shows coordination digest output after clicking Run", async () => {
    render(<PPBECoordinationPanel ctx={makeCtx()} />);
    fireEvent.click(screen.getByTestId("ppbe-run-coordination-tracking"));
    await waitFor(() =>
      expect(screen.getByTestId("ppbe-coordination-output")).toBeInTheDocument()
    );
    expect(screen.getByTestId("ppbe-coordination-output")).toHaveTextContent(
      PPBE_COORDINATION_ADVISORY_LABEL
    );
    // Static tier produces overdue scan summary.
    expect(screen.getByTestId("ppbe-coordination-output")).toHaveTextContent("Static digest");
  });
});

describe("PPBECoordinationPanel — systemPrompt matches approved .md file", () => {
  afterEach(() => jest.restoreAllMocks());

  it("passes coordination_system.md content (stripped) as systemPrompt to runCoordinationTracking", async () => {
    // runCoordinationTracking(input, asOfIso, systemPrompt, reqCtx, deps) — systemPrompt is arg index 2
    const spy = jest.spyOn(coordinationModule, "runCoordinationTracking");
    render(<PPBECoordinationPanel ctx={makeCtx()} />);
    fireEvent.click(screen.getByTestId("ppbe-run-coordination-tracking"));
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    const capturedPrompt = spy.mock.calls[0][2] as string;
    const expectedPrompt = loadApprovedPrompt("coordination_system.md");
    expect(capturedPrompt).toBe(expectedPrompt);
  });
});

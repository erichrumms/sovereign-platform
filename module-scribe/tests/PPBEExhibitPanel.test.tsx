/** @jest-environment jsdom */
/**
 * module-scribe — PPBEExhibitPanel.test.tsx
 * Part 2 (Session 38): ppbe-exhibit-drafter trigger renders in SCRIBE's
 * "PPBE Exhibits" surface; clicking Draft Exhibit produces output (static
 * tier in test — no LLM key).
 *
 * Post-session: prompt-assertion test verifies the panel passes the real,
 * approved exhibit_drafting_system.md content as systemPrompt.
 */
import fs from "fs";
import path from "path";

import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { PPBEExhibitPanel } from "../src/PPBEExhibitPanel";
import * as exhibitEngine from "../src/ppbe-exhibit-engine";
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
    client: {} as SovereignShellContext["client"],
  } as unknown as SovereignShellContext;
}

describe("PPBEExhibitPanel — Part 2 ppbe-exhibit-drafter trigger", () => {
  it("renders the mode selector and Draft Exhibit button", () => {
    render(<PPBEExhibitPanel ctx={makeCtx()} />);
    expect(screen.getByTestId("ppbe-exhibit-mode-select")).toBeInTheDocument();
    expect(screen.getByTestId("ppbe-run-exhibit-draft")).toBeInTheDocument();
  });

  it("shows draft output after clicking Draft Exhibit", async () => {
    render(<PPBEExhibitPanel ctx={makeCtx()} />);
    fireEvent.click(screen.getByTestId("ppbe-run-exhibit-draft"));
    await waitFor(() =>
      expect(screen.getByTestId("ppbe-exhibit-draft-output")).toBeInTheDocument()
    );
    // Output includes the tier badge (STATIC) and a title.
    expect(screen.getByTestId("ppbe-exhibit-draft-output")).toHaveTextContent("STATIC");
  });
});

describe("PPBEExhibitPanel — systemPrompt matches approved .md file", () => {
  afterEach(() => jest.restoreAllMocks());

  it("passes exhibit_drafting_system.md content (stripped) as systemPrompt to runExhibitDraft", async () => {
    const spy = jest.spyOn(exhibitEngine, "runExhibitDraft");
    render(<PPBEExhibitPanel ctx={makeCtx()} />);
    fireEvent.click(screen.getByTestId("ppbe-run-exhibit-draft"));
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    const capturedPrompt = spy.mock.calls[0][1] as string;
    const expectedPrompt = loadApprovedPrompt("exhibit_drafting_system.md");
    expect(capturedPrompt).toBe(expectedPrompt);
  });
});

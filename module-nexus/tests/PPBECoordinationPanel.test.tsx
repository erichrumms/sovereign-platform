/** @jest-environment jsdom */
/**
 * module-nexus — PPBECoordinationPanel.test.tsx
 * Part 2 (Session 38): ppbe-coordination-assistant trigger renders in
 * NEXUS's "PPBE Coordination" tab; clicking Run Coordination Tracking
 * produces output with the advisory label (static tier in test).
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { PPBECoordinationPanel } from "../src/PPBECoordinationPanel";
import { PPBE_COORDINATION_ADVISORY_LABEL } from "../src/ppbe-coordination-assistant";
import type { SovereignShellContext, SovereignLogEvent } from "../../sovereign-shell/shell-contract";

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

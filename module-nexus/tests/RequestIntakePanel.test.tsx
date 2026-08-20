/** @jest-environment jsdom */
/**
 * module-nexus — RequestIntakePanel.test.tsx (Session 118, F-49)
 *
 * F-49: TRAVEL_REQUEST and TIME_RECORD are selectable in the request-type
 * dropdown and have real approval mechanisms (the Travel & Time Queue's
 * MANAGER / DIRECTOR / EXECUTIVE authority ladder), but the routing table
 * below the form omitted both — the operator saw a table claiming to describe
 * every request type while silently covering only the five WorkRequestTypes.
 * These tests pin the completed table: all seven selectable types appear, and
 * the TT rows name their distinct approval pathway rather than the generic
 * "requires approval" used for the VIGIL-routed types.
 */
import { render, screen, within } from "@testing-library/react";

import { RequestIntakePanel } from "../src/RequestIntakePanel";
import type { UseRequestRegistry } from "../src/useRequestRegistry";
import type { UseTTIntake } from "../src/useTTIntake";
import { WORK_REQUEST_TYPES } from "../src/nexus-contract";
import { TT_INTAKE_TYPES } from "../src/tt-intake";
import { makeCtx } from "./test-helpers";

function makeRegistry(): UseRequestRegistry {
  return {
    requests: [],
    error: null,
    submit: jest.fn(),
    route: jest.fn(),
    sendForApproval: jest.fn(),
    startWork: jest.fn(),
    approveAndStart: jest.fn(),
    reject: jest.fn(),
    complete: jest.fn(),
    nextRequestId: jest.fn(() => "REQ-1"),
    clearError: jest.fn(),
  };
}

function makeTT(): UseTTIntake {
  return {
    travelItems: [],
    timeItems: [],
    error: null,
    submitTravel: jest.fn(() => true),
    submitTime: jest.fn(() => true),
    decideTravel: jest.fn(),
    previewTravel: jest.fn(() => null),
    clearError: jest.fn(),
  };
}

describe("RequestIntakePanel routing table (F-49)", () => {
  it("lists every selectable request type — the five work-request types AND both TT types", () => {
    render(<RequestIntakePanel registry={makeRegistry()} ctx={makeCtx()} tt={makeTT()} />);
    const rows = screen.getAllByRole("row");
    // Header row + 5 work-request rows + 2 TT rows.
    expect(rows).toHaveLength(1 + WORK_REQUEST_TYPES.length + TT_INTAKE_TYPES.length);
    for (const t of [...WORK_REQUEST_TYPES, ...TT_INTAKE_TYPES]) {
      expect(screen.getByRole("cell", { name: t })).toBeInTheDocument();
    }
  });

  it("names the Travel & Time Queue authority ladder as the TT approval pathway", () => {
    render(<RequestIntakePanel registry={makeRegistry()} ctx={makeCtx()} tt={makeTT()} />);
    const travelRow = screen.getByRole("cell", { name: "TRAVEL_REQUEST" }).closest("tr") as HTMLElement;
    const timeRow = screen.getByRole("cell", { name: "TIME_RECORD" }).closest("tr") as HTMLElement;
    for (const row of [travelRow, timeRow]) {
      expect(within(row).getByText(/Travel & Time Queue \(manager \/ director \/ executive\)/)).toBeInTheDocument();
    }
    // Distinct from the VIGIL-routed pathway's generic label.
    expect(within(travelRow).queryByText(/^requires approval$/)).toBeNull();
  });
});

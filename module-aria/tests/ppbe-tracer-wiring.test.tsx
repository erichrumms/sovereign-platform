/** @jest-environment jsdom */
/**
 * ppbe-tracer-wiring tests — Session 33 (D3, goal item 7).
 * The TracerExplorer's integration layer resolves seeded PPBE obligations
 * through the REAL entity chain (assemblePPBEObligationChain), lists them in
 * the picker, keeps the honest not-integrated path for the legacy bare
 * reference, and the Explorer component renders a COMPLETE obligation trace
 * against real seeded data.
 */
import { render, screen, fireEvent } from "@testing-library/react";

import { SYNTH_PPBE_OBLIGATIONS } from "@sovereign/data";

import {
  DEMO_TRACER_DATA,
  assembleChainFor,
  listTraceableItems,
} from "../src/tracer-integration";
import { OBLIGATION_NOT_INTEGRATED_MESSAGE } from "../src/tracer-types";
import { TracerExplorer } from "../src/TracerExplorer";
import { makeCtx } from "./test-helpers";

describe("tracer integration — the entity-resolved PPBE lane", () => {
  it("lists every seeded PPBE obligation plus the legacy bare reference", () => {
    const items = listTraceableItems(DEMO_TRACER_DATA);
    const obligationItems = items.filter((i) => i.chain_type === "obligation");
    expect(obligationItems).toHaveLength(SYNTH_PPBE_OBLIGATIONS.length + 1);
    expect(obligationItems.some((i) => i.id === "SYNTH-OB-A1")).toBe(true);
    expect(obligationItems.some((i) => i.id === "OBL-FY26-0042")).toBe(true);
  });

  it("assembles a COMPLETE chain for every seeded PPBE obligation — obligation → program → objective", () => {
    for (const obligation of SYNTH_PPBE_OBLIGATIONS) {
      const chain = assembleChainFor(DEMO_TRACER_DATA, "obligation", obligation.obligation_id);
      expect(chain).not.toBeNull();
      expect(chain!.complete).toBe(true);
      expect(chain!.nodes.map((n) => n.kind)).toEqual([
        "obligation_record",
        "program_record",
        "strategic_objective",
      ]);
      expect(chain!.nodes.every((n) => n.traceable)).toBe(true);
    }
  });

  it("keeps the honest not-integrated result for the legacy bare reference", () => {
    const chain = assembleChainFor(DEMO_TRACER_DATA, "obligation", "OBL-FY26-0042");
    expect(chain).not.toBeNull();
    expect(chain!.complete).toBe(false);
    expect(chain!.nodes.some((n) => n.cites === OBLIGATION_NOT_INTEGRATED_MESSAGE)).toBe(true);
  });

  it("orphans honestly (never fabricates) when the resolved entities do not connect", () => {
    const broken = {
      ...DEMO_TRACER_DATA,
      ppbe: {
        obligations: [SYNTH_PPBE_OBLIGATIONS[0]],
        programs: [], // the program cannot be resolved
        objectives: [],
      },
    };
    const chain = assembleChainFor(broken, "obligation", SYNTH_PPBE_OBLIGATIONS[0].obligation_id);
    expect(chain!.complete).toBe(false);
    expect(chain!.orphan_reason).toContain("no program record was resolved");
  });
});

describe("TracerExplorer renders a complete PPBE obligation trace (goal item 7 demonstrated)", () => {
  it("selects a seeded obligation and shows all three traceable chain nodes", () => {
    render(<TracerExplorer ctx={makeCtx()} />);
    // Step 1 — switch to the Obligation output type; step 2 — pick the seeded record.
    fireEvent.click(screen.getByRole("tab", { name: "Obligation" }));
    fireEvent.change(screen.getByTestId("tracer-item-select"), { target: { value: "SYNTH-OB-A1" } });
    expect(screen.getByText(/authorized by SYNTH A. Vance/)).toBeInTheDocument();
    expect(screen.getByText(/Program: Logistics Data Interchange Modernization \(FY 2026\)/)).toBeInTheDocument();
    expect(screen.getByText(/Strategic objective: Modernize logistics data interchange/)).toBeInTheDocument();
    expect(screen.queryByText(OBLIGATION_NOT_INTEGRATED_MESSAGE)).not.toBeInTheDocument();
  });
});

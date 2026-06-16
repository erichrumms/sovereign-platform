/**
 * SOVEREIGN Platform — sovereign-shell
 * governance/gateStatus.ts
 *
 * Presentation helpers mapping CPMI-VRS gate / portfolio states to labels and
 * colors. The states themselves are governance law (shell-contract §3); this
 * file only decides how they render.
 *
 * Version: 1.0 · Session 2B · June 2, 2026
 */

import type { VRSGateState, CPMIPortfolioStatus } from "../../shell-contract";
import { SOVEREIGN_THEME as T } from "../navigation/theme";

export interface GateVisual {
  label: string;
  color: string;
}

const GATE_VISUALS: Record<VRSGateState, GateVisual> = {
  NOT_STARTED: { label: "Not started", color: T.text.muted },
  GATE_1_COMPLETE: { label: "Gate 1 — Disclosure", color: T.semantic.blue },
  GATE_2_COMPLETE: { label: "Gate 2 — Audit Trail", color: T.semantic.blue },
  GATE_3_PENDING: { label: "Gate 3 — Oversight (pending)", color: T.semantic.amber },
  GATE_3_COMPLETE: { label: "Gate 3 — Oversight", color: T.semantic.teal },
  GATE_4_CERTIFIED: { label: "Gate 4 — Certified", color: T.semantic.green },
  HOLD: { label: "HOLD", color: T.semantic.red },
};

export function gateVisual(state: VRSGateState): GateVisual {
  return GATE_VISUALS[state];
}

export function overallColor(
  overall: CPMIPortfolioStatus["overall"]
): string {
  switch (overall) {
    case "GREEN":
      return T.semantic.green;
    case "AMBER":
      return T.semantic.amber;
    case "RED":
      return T.semantic.red;
    default:
      return T.text.muted;
  }
}

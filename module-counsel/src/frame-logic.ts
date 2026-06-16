/**
 * SOVEREIGN Platform — module-counsel
 * frame-logic.ts — pure framing logic (no React).
 *
 * The framing form's state, completeness rule, and DecisionFrame assembly live
 * here as pure functions so they are unit-testable in a Node environment without
 * a DOM. useDecisionFrame.ts (the hook) wraps these in React state; DecisionFramer
 * renders them. The component owns rendering only — the rules live here.
 *
 * Version: 1.0 · Session 4 · June 15, 2026
 */

import type { HumanDecisionType } from "@sovereign/data";
import type {
  COUNSELInboundContext,
  CounselSourceProduct,
  DecisionFrame,
} from "./types";

/** The editable framing form state. Empty string = "not yet chosen/entered". */
export interface FrameState {
  decisionStatement: string;
  stakes: string;
  constraints: string[];
  sourceProduct: CounselSourceProduct | "";
  decisionType: HumanDecisionType | "";
  workflowStepId: string;
}

/** Seed the form, pre-filled from an inbound deep-link context if present (spec §4.1). */
export function initialFrameState(inbound?: COUNSELInboundContext): FrameState {
  return {
    decisionStatement: "",
    stakes: inbound?.suggestedStakes ?? "",
    constraints: [],
    sourceProduct: inbound?.sourceProduct ?? "",
    decisionType: inbound?.decisionType ?? "",
    workflowStepId: inbound?.workflowStepId ?? "",
  };
}

/**
 * A frame is analyzable once the decision statement, stakes, source product,
 * decision type, and workflow step id are all present. Constraints are optional.
 */
export function isFrameComplete(s: FrameState): boolean {
  return (
    s.decisionStatement.trim() !== "" &&
    s.stakes.trim() !== "" &&
    s.sourceProduct !== "" &&
    s.decisionType !== "" &&
    s.workflowStepId.trim() !== ""
  );
}

/** Assemble the immutable DecisionFrame, or null if the form is incomplete. */
export function assembleFrame(s: FrameState): DecisionFrame | null {
  if (!isFrameComplete(s)) return null;
  return {
    decisionStatement: s.decisionStatement.trim(),
    stakes: s.stakes.trim(),
    constraints: s.constraints.map((c) => c.trim()).filter((c) => c !== ""),
    sovereignContext: {
      sourceProduct: s.sourceProduct as CounselSourceProduct,
      workflowStepId: s.workflowStepId.trim(),
      decisionType: s.decisionType as HumanDecisionType,
    },
  };
}

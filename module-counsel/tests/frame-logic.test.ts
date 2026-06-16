/**
 * module-counsel — frame-logic.test.ts
 * Pure framing logic: completeness rule, DecisionFrame assembly, inbound pre-fill.
 * Node environment (no DOM) — the React hook/component wrap these helpers.
 */

import {
  initialFrameState,
  isFrameComplete,
  assembleFrame,
  type FrameState,
} from "../src/frame-logic";
import type { COUNSELInboundContext } from "../src/types";

function completeState(): FrameState {
  return {
    decisionStatement: "Approve the Q3 vendor change request",
    stakes: "Wrong approval hits the cost baseline",
    constraints: ["Must respect FAR 52.244", "  "],
    sourceProduct: "NEXUS",
    decisionType: "HUMAN_APPROVAL",
    workflowStepId: "NEXUS-APPROVE-v1-step-3",
  };
}

describe("frame-logic", () => {
  it("initialFrameState is empty without inbound context", () => {
    const s = initialFrameState();
    expect(isFrameComplete(s)).toBe(false);
    expect(s.sourceProduct).toBe("");
    expect(s.decisionType).toBe("");
    expect(s.constraints).toEqual([]);
  });

  it("initialFrameState pre-fills from an inbound deep-link context (spec §4.1)", () => {
    const inbound: COUNSELInboundContext = {
      sourceProduct: "VIGIL",
      workflowStepId: "VIGIL-APPROVE-v1-step-1",
      decisionType: "HUMAN_OVERRIDE",
      suggestedStakes: "Operator override of an AgentOS gate",
    };
    const s = initialFrameState(inbound);
    expect(s.sourceProduct).toBe("VIGIL");
    expect(s.decisionType).toBe("HUMAN_OVERRIDE");
    expect(s.workflowStepId).toBe("VIGIL-APPROVE-v1-step-1");
    expect(s.stakes).toBe("Operator override of an AgentOS gate");
    // statement still required from the user
    expect(isFrameComplete(s)).toBe(false);
  });

  it("isFrameComplete requires statement, stakes, product, type, and step id", () => {
    const s = completeState();
    expect(isFrameComplete(s)).toBe(true);
    expect(isFrameComplete({ ...s, decisionStatement: "" })).toBe(false);
    expect(isFrameComplete({ ...s, stakes: "  " })).toBe(false);
    expect(isFrameComplete({ ...s, sourceProduct: "" })).toBe(false);
    expect(isFrameComplete({ ...s, decisionType: "" })).toBe(false);
    expect(isFrameComplete({ ...s, workflowStepId: "" })).toBe(false);
  });

  it("constraints are optional for completeness", () => {
    expect(isFrameComplete({ ...completeState(), constraints: [] })).toBe(true);
  });

  it("assembleFrame returns null when incomplete", () => {
    expect(assembleFrame(initialFrameState())).toBeNull();
  });

  it("assembleFrame trims fields and drops blank constraints, preserving IL fields", () => {
    const frame = assembleFrame(completeState());
    expect(frame).not.toBeNull();
    if (!frame) return;
    expect(frame.decisionStatement).toBe("Approve the Q3 vendor change request");
    expect(frame.constraints).toEqual(["Must respect FAR 52.244"]); // blank dropped
    expect(frame.sovereignContext).toEqual({
      sourceProduct: "NEXUS",
      workflowStepId: "NEXUS-APPROVE-v1-step-3",
      decisionType: "HUMAN_APPROVAL",
    });
  });
});

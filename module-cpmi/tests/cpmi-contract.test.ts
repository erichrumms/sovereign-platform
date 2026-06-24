/**
 * module-cpmi — cpmi-contract.test.ts
 * Six-step definitions, the 0.7× threshold constant, gate→event mapping, workflow_step_id
 * helpers, and the surfaceable-output rule (schema-valid AND schema_valid===true).
 */
import {
  eventTypeForGate,
  hasSurfaceableOutput,
  reasoningWorkflowStep,
  gateWorkflowStep,
  REASONING_STEPS,
  CPMI_ANOMALY_THRESHOLD_FACTOR,
  type ReasoningChainOutput,
} from "../src/cpmi-contract";

function validOutput(over: Partial<ReasoningChainOutput> = {}): ReasoningChainOutput {
  return {
    context_summary: "Program P-100 mid-execution.",
    context_confidence: "high",
    risk_register: [{ risk: "Slip", severity: "P2", type: "schedule" }],
    constraint_map: [{ constraint: "FAR 15.2", permitted: "re-scope", prohibited: "sole-source", requires_approval: "ceiling" }],
    option_set: [{ option: "Re-baseline", cost: "2wk", defers: "M4", closes: "risk" }],
    recommendation: "Re-baseline.",
    alternatives_considered: ["Accept slip"],
    schema_valid: true,
    ...over,
  };
}

describe("cpmi-contract", () => {
  it("defines six sequential reasoning steps", () => {
    expect(REASONING_STEPS).toHaveLength(6);
    expect(REASONING_STEPS.map((s) => s.step)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("the enhanced-monitoring threshold factor is the 0.7× constant", () => {
    expect(CPMI_ANOMALY_THRESHOLD_FACTOR).toBe(0.7);
  });

  it("maps each gate to its GD-7 event type", () => {
    expect(eventTypeForGate(1)).toBe("CPMI_VRS_GATE_1_PASSED");
    expect(eventTypeForGate(2)).toBe("CPMI_VRS_GATE_2_PASSED");
    expect(eventTypeForGate(3)).toBe("CPMI_VRS_GATE_3_ATTESTED");
    expect(eventTypeForGate(4)).toBe("CPMI_VRS_GATE_4_PASSED");
  });

  it("builds workflow_step_ids", () => {
    expect(reasoningWorkflowStep("P-100")).toBe("cpmi-reasoning-P-100");
    expect(gateWorkflowStep("CPMI")).toBe("cpmi-vrs-CPMI");
  });

  it("surfaces only schema-valid outputs with schema_valid===true", () => {
    expect(hasSurfaceableOutput(validOutput())).toBe(true);
    expect(hasSurfaceableOutput(validOutput({ schema_valid: false }))).toBe(false);
    expect(hasSurfaceableOutput(validOutput({ recommendation: "" }))).toBe(false);
  });
});

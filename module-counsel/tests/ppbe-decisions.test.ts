/**
 * module-counsel — ppbe-decisions.test.ts (Session 32, D7).
 * The four PPBE decision types (docs/18 §7.2): module-level taxonomy mapping
 * to HUMAN_APPROVAL on the canonical HumanDecisionType (Session 31 decision
 * #5); per-type context validation; records ride the standard assembly (full
 * IL field set) with the PPBE traceability fields added to the payload; and
 * the docs/18 §4 PPBE_DECISION emission record for the Python-side emitter.
 * A signed Decision Record is produced in each of the four types.
 */

import type { AnalysisResult } from "../src/analysis-contract";
import type { DecisionRecordDeps, DecisionRecordInput } from "../src/decision-record";
import type { DecisionFrame } from "../src/types";
import {
  PPBE_DECISION_TYPES,
  PPBE_DECISION_TYPE_NAMES,
  canonicalDecisionTypeFor,
  validatePPBEDecisionContext,
  buildPPBEDecisionRecord,
  ppbeDecisionEmissionRecord,
  type PPBEDecisionContext,
  type PPBEDecisionType,
} from "../src/ppbe-decisions";

// ---------- fixtures ----------

function frame(): DecisionFrame {
  return {
    decisionStatement: "Authorize the Phase 4 budget formulation trade-off for PRG-001",
    stakes: "A wrong trade-off misallocates the FY 2027 request",
    constraints: ["Must hold the FY 2027 portfolio total"],
    sovereignContext: {
      sourceProduct: "APEX",
      workflowStepId: "ppbe-decision-PRG-001-step-1",
      decisionType: "HUMAN_APPROVAL",
    },
  };
}

function analysis(): AnalysisResult {
  return {
    alternatives: [
      { id: "ALT-1", label: "Adopt scenario A", summary: "Level funding.", pros: ["stable"], cons: ["slow"] },
      { id: "ALT-2", label: "Adopt scenario B", summary: "Shift to PRG-002.", pros: ["speed"], cons: ["risk"] },
      { id: "ALT-3", label: "Defer", summary: "Hold for data.", pros: ["safe"], cons: ["delay"] },
    ],
    riskScenarios: [
      { alternativeId: "ALT-1", scenario: "Stagnation.", severity: "LOW" },
      { alternativeId: "ALT-2", scenario: "Milestone slip.", severity: "HIGH" },
      { alternativeId: "ALT-3", scenario: "Missed window.", severity: "MODERATE" },
    ],
    assumptionFlags: [],
    confidenceScore: 70,
    recommendedNextAction: "Review both scenarios against the baseline.",
  };
}

function recordInput(over: Partial<DecisionRecordInput> = {}): DecisionRecordInput {
  return {
    frame: frame(),
    analysis: analysis(),
    chosenAlternativeId: "ALT-1",
    rationale: "Scenario A holds the portfolio total with the least milestone risk.",
    programId: "PRG-001",
    reviewConfirmed: true,
    ...over,
  };
}

function ppbeContext(type: PPBEDecisionType): PPBEDecisionContext {
  switch (type) {
    case "STRATEGIC_PRIORITY_RANKING":
      return { ppbe_decision_type: type, program_id: "PRG-001", objective_id: "SO-2027-01" };
    case "PROGRAMMING_TRADE_OFF":
      return { ppbe_decision_type: type, program_id: "PRG-001", objective_id: "SO-2027-01" };
    case "PHASE_TRANSITION_AUTHORIZATION":
      return { ppbe_decision_type: type, program_id: "PRG-001", from_phase: 4, to_phase: 5 };
    case "EVALUATION_FINDING_RESPONSE":
      return { ppbe_decision_type: type, program_id: "PRG-001", finding_id: "EF-1" };
  }
}

const deps: DecisionRecordDeps = {
  now: () => "2026-07-13T12:00:00.000Z",
  newDocumentId: () => "COUNSEL-DR-PPBE-1",
  actorId: "E-555",
  actorName: "Dana Reviewer",
};

// ---------- taxonomy ----------

describe("the four PPBE decision types", () => {
  it("defines exactly the docs/18 §7.2 four, each mapping to HUMAN_APPROVAL (Session 31 decision #5)", () => {
    expect(PPBE_DECISION_TYPES).toEqual([
      "STRATEGIC_PRIORITY_RANKING",
      "PROGRAMMING_TRADE_OFF",
      "PHASE_TRANSITION_AUTHORIZATION",
      "EVALUATION_FINDING_RESPONSE",
    ]);
    for (const t of PPBE_DECISION_TYPES) {
      expect(canonicalDecisionTypeFor(t)).toBe("HUMAN_APPROVAL");
      expect(PPBE_DECISION_TYPE_NAMES[t].length).toBeGreaterThan(0);
    }
  });
});

// ---------- context validation ----------

describe("validatePPBEDecisionContext", () => {
  it("accepts a valid context for each of the four types", () => {
    for (const t of PPBE_DECISION_TYPES) {
      expect(validatePPBEDecisionContext(ppbeContext(t))).toEqual([]);
    }
  });

  it("requires the objective for a ranking, the finding for a response, and a legal phase pair", () => {
    expect(
      validatePPBEDecisionContext({ ppbe_decision_type: "STRATEGIC_PRIORITY_RANKING", program_id: "PRG-001" })
        .join(" ")
    ).toContain("objective_id");
    expect(
      validatePPBEDecisionContext({ ppbe_decision_type: "EVALUATION_FINDING_RESPONSE", program_id: "PRG-001" })
        .join(" ")
    ).toContain("finding_id");
    expect(
      validatePPBEDecisionContext({
        ppbe_decision_type: "PHASE_TRANSITION_AUTHORIZATION",
        program_id: "PRG-001",
        from_phase: 2,
        to_phase: 5,
      }).join(" ")
    ).toContain("closed loop");
    // The loop-closing 6 → 1 is legal.
    expect(
      validatePPBEDecisionContext({
        ppbe_decision_type: "PHASE_TRANSITION_AUTHORIZATION",
        program_id: "PRG-001",
        from_phase: 6,
        to_phase: 1,
      })
    ).toEqual([]);
  });

  it("requires a program on every PPBE decision", () => {
    expect(
      validatePPBEDecisionContext({ ppbe_decision_type: "PROGRAMMING_TRADE_OFF", program_id: " " }).join(" ")
    ).toContain("program_id");
  });
});

// ---------- record assembly ----------

describe("buildPPBEDecisionRecord", () => {
  it("produces a signed Decision Record in each of the four PPBE decision types", () => {
    for (const t of PPBE_DECISION_TYPES) {
      const r = buildPPBEDecisionRecord(recordInput(), ppbeContext(t), deps);
      expect(r.ok).toBe(true);
      if (!r.ok) continue;
      // Full IL field set from the standard assembly.
      expect(r.record.event.event_type).toBe("HUMAN_DECISION");
      expect(r.record.event.decision_type).toBe("HUMAN_APPROVAL");
      expect(r.record.event.actor).toBe("human");
      expect(r.record.event.actor_name).toBe("Dana Reviewer");
      expect(r.record.event.workflow_step_id).toBe("ppbe-decision-PRG-001-step-1");
      expect(r.record.event.payload.rationale).toBeTruthy();
      expect(r.record.event.payload.prompts).toBeTruthy();
      // PPBE traceability extension.
      expect(r.record.event.payload.ppbe_decision_type).toBe(t);
      expect(r.record.event.payload.ppbe_decision_name).toBe(PPBE_DECISION_TYPE_NAMES[t]);
      expect(r.record.event.payload.program_id).toBe("PRG-001");
      // The signed canonical Document.
      expect(r.record.document.document_id).toBe("COUNSEL-DR-PPBE-1");
      expect(r.record.document.created_by).toBe("E-555");
    }
  });

  it("carries the phase pair for a transition authorization and the finding for a response", () => {
    const transition = buildPPBEDecisionRecord(
      recordInput(),
      ppbeContext("PHASE_TRANSITION_AUTHORIZATION"),
      deps
    );
    expect(transition.ok && transition.record.event.payload.from_phase).toBe(4);
    expect(transition.ok && transition.record.event.payload.to_phase).toBe(5);

    const response = buildPPBEDecisionRecord(recordInput(), ppbeContext("EVALUATION_FINDING_RESPONSE"), deps);
    expect(response.ok && response.record.event.payload.finding_id).toBe("EF-1");
  });

  it("refuses a frame whose canonical decisionType mismatches the mapping, and a program mismatch", () => {
    const wrongType = recordInput();
    wrongType.frame.sovereignContext.decisionType = "TASK_APPROVAL";
    const r1 = buildPPBEDecisionRecord(wrongType, ppbeContext("PROGRAMMING_TRADE_OFF"), deps);
    expect(r1.ok).toBe(false);
    if (!r1.ok) expect(r1.errors.join(" ")).toContain("Session 31 decision #5");

    const r2 = buildPPBEDecisionRecord(
      recordInput({ programId: "PRG-OTHER" }),
      ppbeContext("PROGRAMMING_TRADE_OFF"),
      deps
    );
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.errors.join(" ")).toContain("same program");
  });

  it("still enforces the standard assembly's Gate 3", () => {
    const r = buildPPBEDecisionRecord(
      recordInput({ reviewConfirmed: false }),
      ppbeContext("PROGRAMMING_TRADE_OFF"),
      deps
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join(" ")).toMatch(/Gate 3/);
  });
});

// ---------- Python-side emission record ----------

describe("ppbeDecisionEmissionRecord", () => {
  it("builds the docs/18 §4 PPBE_DECISION field set from an assembled record", () => {
    const r = buildPPBEDecisionRecord(recordInput(), ppbeContext("STRATEGIC_PRIORITY_RANKING"), deps);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(ppbeDecisionEmissionRecord(r.record, ppbeContext("STRATEGIC_PRIORITY_RANKING"))).toEqual({
      decision_type: "HUMAN_APPROVAL",
      ppbe_decision_type: "STRATEGIC_PRIORITY_RANKING",
      program_id: "PRG-001",
      objective_id: "SO-2027-01",
      approving_human: "Dana Reviewer",
      workflow_step_id: "ppbe-decision-PRG-001-step-1",
      document_id: "COUNSEL-DR-PPBE-1",
    });
  });
});

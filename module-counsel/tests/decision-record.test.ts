/**
 * module-counsel — decision-record.test.ts
 * Decision Record assembly (pure): CPMI-VRS Gate 3 refusal, chosen-alternative
 * validation, canonical Document construction + validateDocument, the
 * HUMAN_DECISION event shape (frozen IL fields), and prompt provenance. Node env;
 * clock/id/identity are injected.
 */

import { validateDocument } from "@sovereign/data";

import type { AnalysisResult } from "../src/analysis-contract";
import type { CounterargumentSummary } from "../src/counter-contract";
import type { PreMortemResult } from "../src/premortem-contract";
import {
  buildDecisionRecord,
  DEFAULT_DECISION_CLASSIFICATION,
  type DecisionRecordDeps,
  type DecisionRecordInput,
} from "../src/decision-record";
import type { DecisionFrame } from "../src/types";

function frame(): DecisionFrame {
  return {
    decisionStatement: "Approve the Q3 vendor change request",
    stakes: "Wrong approval hits the cost baseline",
    constraints: ["Must respect FAR 52.244"],
    sovereignContext: {
      sourceProduct: "NEXUS",
      workflowStepId: "NEXUS-APPROVE-v1-step-3",
      decisionType: "HUMAN_APPROVAL",
    },
  };
}

function analysis(): AnalysisResult {
  return {
    alternatives: [
      { id: "ALT-1", label: "Approve", summary: "Approve as submitted.", pros: ["fast"], cons: ["risk"] },
      { id: "ALT-2", label: "Defer", summary: "Hold for data.", pros: ["safe"], cons: ["delay"] },
      { id: "ALT-3", label: "Escalate", summary: "Route up.", pros: ["oversight"], cons: ["slow"] },
    ],
    riskScenarios: [
      { alternativeId: "ALT-1", scenario: "Bad approval.", severity: "HIGH" },
      { alternativeId: "ALT-2", scenario: "Missed window.", severity: "MODERATE" },
      { alternativeId: "ALT-3", scenario: "Backlog.", severity: "LOW" },
    ],
    assumptionFlags: [],
    confidenceScore: 64,
    recommendedNextAction: "Verify the package.",
  };
}

function input(over: Partial<DecisionRecordInput> = {}): DecisionRecordInput {
  return {
    frame: frame(),
    analysis: analysis(),
    chosenAlternativeId: "ALT-2",
    rationale: "Cost data is incomplete; deferring two weeks is cheap insurance.",
    programId: "PRG-1042",
    reviewConfirmed: true,
    ...over,
  };
}

const deps: DecisionRecordDeps = {
  now: () => "2026-06-16T12:00:00.000Z",
  newDocumentId: () => "COUNSEL-DR-TEST-1",
  actorId: "E-555",
  actorName: "Dana Reviewer",
};

describe("buildDecisionRecord — Gate 3 and prerequisites", () => {
  it("refuses to assemble until reviewConfirmed (Gate 3)", () => {
    const r = buildDecisionRecord(input({ reviewConfirmed: false }), deps);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join(" ")).toMatch(/Gate 3/);
  });

  it("rejects a chosen alternative that is not in the analysis", () => {
    const r = buildDecisionRecord(input({ chosenAlternativeId: "ALT-9" }), deps);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join(" ")).toMatch(/does not reference/);
  });

  it("requires a non-empty rationale and programId", () => {
    expect(buildDecisionRecord(input({ rationale: "  " }), deps).ok).toBe(false);
    expect(buildDecisionRecord(input({ programId: "" }), deps).ok).toBe(false);
  });
});

describe("buildDecisionRecord — Document", () => {
  it("produces a canonical Document that passes validateDocument", () => {
    const r = buildDecisionRecord(input(), deps);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(validateDocument(r.record.document)).toEqual({ valid: true });
    expect(r.record.document.document_id).toBe("COUNSEL-DR-TEST-1");
    expect(r.record.document.created_by).toBe("E-555");
    expect(r.record.document.program_id).toBe("PRG-1042");
    expect(r.record.document.created_at).toBe("2026-06-16T12:00:00.000Z");
    expect(r.record.document.title).toContain("Q3 vendor change request");
  });

  it("defaults classification to the counsel-analyst CUI ceiling", () => {
    const r = buildDecisionRecord(input(), deps);
    if (!r.ok) throw new Error("expected ok");
    expect(r.record.document.classification_level).toBe(DEFAULT_DECISION_CLASSIFICATION);
    expect(r.record.document.classification_level).toBe("CUI");
  });

  it("honors an explicit classification override", () => {
    const r = buildDecisionRecord(input({ classificationLevel: "SECRET" }), deps);
    if (!r.ok) throw new Error("expected ok");
    expect(r.record.document.classification_level).toBe("SECRET");
  });
});

describe("buildDecisionRecord — HUMAN_DECISION event", () => {
  it("emits the frozen IL fields the shell logger validator requires", () => {
    const r = buildDecisionRecord(input(), deps);
    if (!r.ok) throw new Error("expected ok");
    const e = r.record.event;
    expect(e.event_type).toBe("HUMAN_DECISION");
    expect(e.workflow_step_id).toBe("NEXUS-APPROVE-v1-step-3");
    expect(e.decision_type).toBe("HUMAN_APPROVAL");
    expect(e.actor).toBe("human");
    expect(e.actor_name).toBe("Dana Reviewer");
    expect(e.actor_id).toBe("E-555");
    expect(e.product).toBe("COUNSEL");
    expect(e.sovereign_tier).toBe("standard");
  });

  it("carries the chosen alternative, rationale, and Document id in the payload", () => {
    const r = buildDecisionRecord(input(), deps);
    if (!r.ok) throw new Error("expected ok");
    const p = r.record.event.payload;
    expect(p.chosen_alternative_id).toBe("ALT-2");
    expect(p.chosen_alternative_label).toBe("Defer");
    expect(p.document_id).toBe("COUNSEL-DR-TEST-1");
    expect(p.program_id).toBe("PRG-1042");
    expect(p.confidence_score).toBe(64);
  });

  it("records analysis-only provenance when no other modes were run", () => {
    const r = buildDecisionRecord(input(), deps);
    if (!r.ok) throw new Error("expected ok");
    expect(r.record.event.payload.modes_used).toEqual(["analysis"]);
    expect(r.record.event.payload.prompts).toEqual([
      { registry_id: "PR-COUNSEL-001", prompt_version: "v1.0" },
    ]);
  });

  it("adds counterargument + premortem provenance when those modes contributed", () => {
    const counterargument: CounterargumentSummary = {
      targetAlternativeId: "ALT-1",
      turns: [],
      positionSurvived: false,
      netAssessment: "The defer case was stronger.",
    };
    const preMortem: PreMortemResult = {
      failureModes: [
        {
          id: "FM-1",
          failureNarrative: "x",
          rootCauses: ["x"],
          earlyWarnings: ["x"],
          preventiveActions: ["x"],
          severity: "HIGH",
          likelihood: "MODERATE",
        },
        {
          id: "FM-2",
          failureNarrative: "y",
          rootCauses: ["y"],
          earlyWarnings: ["y"],
          preventiveActions: ["y"],
          severity: "MODERATE",
          likelihood: "LOW",
        },
      ],
      overallVulnerability: "HIGH",
      topPreventiveAction: "Set a trip-wire.",
    };
    const r = buildDecisionRecord(input({ counterargument, preMortem }), deps);
    if (!r.ok) throw new Error("expected ok");
    expect(r.record.event.payload.modes_used).toEqual(["analysis", "counterargument", "premortem"]);
    expect(r.record.event.payload.counterargument_position_survived).toBe(false);
    expect(r.record.event.payload.premortem_overall_vulnerability).toBe("HIGH");
    expect((r.record.event.payload.prompts as unknown[]).length).toBe(3);
  });
});

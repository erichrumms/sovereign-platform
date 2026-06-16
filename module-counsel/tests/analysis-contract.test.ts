/**
 * module-counsel — analysis-contract.test.ts
 * Unit tests for validateAnalysisResult — the schema gate the COUNSEL Analysis
 * Engine runs on PR-COUNSEL-001 output before any AnalysisResult reaches the user.
 *
 * Node test environment (no DOM). React component tests (jsdom + React Testing
 * Library) are a flagged follow-up requiring a network install.
 */

import {
  validateAnalysisResult,
  MIN_ALTERNATIVES,
  RISK_SEVERITIES,
  type AnalysisResult,
} from "../src/analysis-contract";

/** A minimal well-formed AnalysisResult (3 alternatives, one risk each). */
function validResult(): AnalysisResult {
  return {
    alternatives: [
      { id: "ALT-1", label: "Proceed", summary: "Approve as submitted.", pros: ["fast"], cons: ["risk of error"] },
      { id: "ALT-2", label: "Defer", summary: "Hold for more data.", pros: ["safer"], cons: ["delay"] },
      { id: "ALT-3", label: "Escalate", summary: "Route to reviewer.", pros: ["oversight"], cons: ["slower"] },
    ],
    riskScenarios: [
      { alternativeId: "ALT-1", scenario: "Approves a non-compliant item.", severity: "HIGH" },
      { alternativeId: "ALT-2", scenario: "Delay misses a deadline.", severity: "MODERATE" },
      { alternativeId: "ALT-3", scenario: "Reviewer backlog stalls it.", severity: "LOW" },
    ],
    assumptionFlags: [{ assumption: "Submission is complete.", concern: "Not verified in the frame." }],
    confidenceScore: 62,
    recommendedNextAction: "Confirm the submission package is complete before approving.",
  };
}

describe("validateAnalysisResult", () => {
  it("accepts a well-formed result", () => {
    expect(validateAnalysisResult(validResult())).toEqual({ valid: true });
  });

  it("accepts an empty assumptionFlags array when otherwise valid", () => {
    const r = validResult();
    r.assumptionFlags = [];
    expect(validateAnalysisResult(r)).toEqual({ valid: true });
  });

  it("rejects a non-object", () => {
    const res = validateAnalysisResult(null);
    expect(res.valid).toBe(false);
  });

  it(`rejects fewer than ${MIN_ALTERNATIVES} alternatives`, () => {
    const r = validResult();
    r.alternatives = r.alternatives.slice(0, 2);
    r.riskScenarios = r.riskScenarios.slice(0, 2);
    const res = validateAnalysisResult(r);
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.errors.some((e) => e.includes("alternatives"))).toBe(true);
  });

  it("rejects duplicate alternative ids", () => {
    const r = validResult();
    r.alternatives[1].id = "ALT-1";
    const res = validateAnalysisResult(r);
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.errors.some((e) => e.includes("duplicate"))).toBe(true);
  });

  it("rejects a risk count that is not one per alternative", () => {
    const r = validResult();
    r.riskScenarios = r.riskScenarios.slice(0, 2);
    const res = validateAnalysisResult(r);
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.errors.some((e) => e.includes("one per alternative"))).toBe(true);
  });

  it("rejects a risk that references an unknown alternative id", () => {
    const r = validResult();
    r.riskScenarios[0].alternativeId = "ALT-9";
    const res = validateAnalysisResult(r);
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.errors.some((e) => e.includes("alternativeId"))).toBe(true);
  });

  it("rejects an invalid severity", () => {
    const r = validResult();
    // @ts-expect-error — deliberately invalid severity for the runtime guard
    r.riskScenarios[0].severity = "SEVERE";
    const res = validateAnalysisResult(r);
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.errors.some((e) => e.includes("severity"))).toBe(true);
  });

  it("accepts every allowed severity", () => {
    for (const sev of RISK_SEVERITIES) {
      const r = validResult();
      r.riskScenarios[0].severity = sev;
      expect(validateAnalysisResult(r)).toEqual({ valid: true });
    }
  });

  it.each([-1, 101, 62.5, Number.NaN])("rejects confidenceScore %p", (score) => {
    const r = validResult();
    r.confidenceScore = score as number;
    const res = validateAnalysisResult(r);
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.errors.some((e) => e.includes("confidenceScore"))).toBe(true);
  });

  it("rejects an empty recommendedNextAction", () => {
    const r = validResult();
    r.recommendedNextAction = "   ";
    const res = validateAnalysisResult(r);
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.errors.some((e) => e.includes("recommendedNextAction"))).toBe(true);
  });

  it("rejects empty pros/cons on an alternative", () => {
    const r = validResult();
    r.alternatives[0].pros = [];
    const res = validateAnalysisResult(r);
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.errors.some((e) => e.includes("pros"))).toBe(true);
  });
});

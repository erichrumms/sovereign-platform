/**
 * module-vigil — triage-contract.test.ts
 * The triage-brief validator and the triage-eligibility rule (spec §2.3).
 */
import {
  validateTriageBrief,
  isTriageEligible,
  TRIAGE_ELIGIBLE_ALERT_TYPES,
  type TriageBrief,
} from "../src/triage-contract";
import type { AlertType } from "../src/vigil-types";

function validBrief(): TriageBrief {
  return {
    likely_causes: [{ cause: "Baseline shift", likelihood: "high" }],
    recommended_steps: ["Confirm the triggering event."],
    false_positive_likelihood: 30,
    false_positive_explanation: "Surrounding events are consistent with a genuine shift.",
  };
}

describe("validateTriageBrief", () => {
  it("accepts a well-formed brief", () => {
    expect(validateTriageBrief(validBrief())).toEqual({ valid: true });
  });

  it("rejects a non-object", () => {
    expect(validateTriageBrief(null).valid).toBe(false);
    expect(validateTriageBrief("nope").valid).toBe(false);
  });

  it("rejects an empty likely_causes array", () => {
    const r = validateTriageBrief({ ...validBrief(), likely_causes: [] });
    expect(r.valid).toBe(false);
  });

  it("rejects a likely_cause missing cause/likelihood strings", () => {
    const r = validateTriageBrief({ ...validBrief(), likely_causes: [{ cause: "x" }] });
    expect(r.valid).toBe(false);
  });

  it("rejects empty recommended_steps", () => {
    const r = validateTriageBrief({ ...validBrief(), recommended_steps: [] });
    expect(r.valid).toBe(false);
  });

  it("rejects a false_positive_likelihood outside 0–100", () => {
    expect(validateTriageBrief({ ...validBrief(), false_positive_likelihood: 150 }).valid).toBe(false);
    expect(validateTriageBrief({ ...validBrief(), false_positive_likelihood: -1 }).valid).toBe(false);
  });

  it("rejects a non-integer false_positive_likelihood", () => {
    expect(validateTriageBrief({ ...validBrief(), false_positive_likelihood: 12.5 }).valid).toBe(false);
  });

  it("rejects a missing/empty explanation", () => {
    expect(validateTriageBrief({ ...validBrief(), false_positive_explanation: "" }).valid).toBe(false);
  });
});

describe("isTriageEligible (spec §2.3)", () => {
  it("admits the three anomaly alert types", () => {
    expect(isTriageEligible("ANOMALY_DETECTED")).toBe(true);
    expect(isTriageEligible("CPMI_DRIFT_DETECTED")).toBe(true);
    expect(isTriageEligible("CASCADE_RISK")).toBe(true);
  });

  it("excludes honeytoken, threshold, and fallback alerts", () => {
    const excluded: AlertType[] = ["HONEYTOKEN_TRIGGERED", "THRESHOLD_BREACH", "FALLBACK_ACTIVATED"];
    for (const t of excluded) expect(isTriageEligible(t)).toBe(false);
  });

  it("exposes exactly the three eligible types", () => {
    expect([...TRIAGE_ELIGIBLE_ALERT_TYPES].sort()).toEqual(
      ["ANOMALY_DETECTED", "CASCADE_RISK", "CPMI_DRIFT_DETECTED"].sort()
    );
  });
});

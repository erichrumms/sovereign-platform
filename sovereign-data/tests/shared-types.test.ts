/**
 * sovereign-data — shared-types.test.ts
 * Guards the runtime enum mirrors against drift from their TypeScript unions.
 */

import {
  SOVEREIGN_ROLES,
  CLEARANCE_LEVELS,
  HUMAN_DECISION_TYPES,
  type HumanDecisionType,
} from "../src/index";

describe("runtime enum mirrors", () => {
  it("SOVEREIGN_ROLES includes PLATFORM_ADMIN (GD-5) and has 8 members", () => {
    expect(SOVEREIGN_ROLES).toContain("PLATFORM_ADMIN");
    expect(SOVEREIGN_ROLES).toHaveLength(8);
  });

  it("CLEARANCE_LEVELS has the four canonical levels in order", () => {
    expect(CLEARANCE_LEVELS).toEqual(["UNCLASSIFIED", "CUI", "SECRET", "TOP_SECRET"]);
  });

  it("HUMAN_DECISION_TYPES mirrors the canonical taxonomy (10 members, unique)", () => {
    expect(HUMAN_DECISION_TYPES).toHaveLength(10);
    expect(new Set(HUMAN_DECISION_TYPES).size).toBe(10);
    expect(HUMAN_DECISION_TYPES).toContain("HUMAN_APPROVAL");
    expect(HUMAN_DECISION_TYPES).toContain("LABOR_ESCALATION_INITIATED");
  });

  it("HUMAN_DECISION_TYPES values are assignable to HumanDecisionType", () => {
    const sample: HumanDecisionType = HUMAN_DECISION_TYPES[0];
    expect(typeof sample).toBe("string");
  });
});

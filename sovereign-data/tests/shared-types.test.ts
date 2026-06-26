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

  it("HUMAN_DECISION_TYPES mirrors the canonical taxonomy (16 members, unique)", () => {
    expect(HUMAN_DECISION_TYPES).toHaveLength(16);
    expect(new Set(HUMAN_DECISION_TYPES).size).toBe(16);
    expect(HUMAN_DECISION_TYPES).toContain("HUMAN_APPROVAL");
    expect(HUMAN_DECISION_TYPES).toContain("LABOR_ESCALATION_INITIATED");
    // GD-6 (shell-contract v1.4) — synced agent-action approval decision type.
    expect(HUMAN_DECISION_TYPES).toContain("AGENT_APPROVAL");
    // GD-7 (shell-contract v1.5) — synced CPMI Gate 3 attestation + world-model update.
    expect(HUMAN_DECISION_TYPES).toContain("GATE_3_ATTESTATION");
    expect(HUMAN_DECISION_TYPES).toContain("WORLD_MODEL_UPDATE");
    // GD-9 (shell-contract v1.7) — synced AgentOS task approval + cancellation.
    expect(HUMAN_DECISION_TYPES).toContain("TASK_APPROVAL");
    expect(HUMAN_DECISION_TYPES).toContain("TASK_CANCELLATION");
    // GD-16 (shell-contract v1.12) — synced APEX report attestation.
    expect(HUMAN_DECISION_TYPES).toContain("REPORT_ATTESTATION");
  });

  it("HUMAN_DECISION_TYPES values are assignable to HumanDecisionType", () => {
    const sample: HumanDecisionType = HUMAN_DECISION_TYPES[0];
    expect(typeof sample).toBe("string");
  });
});

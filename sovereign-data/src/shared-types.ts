/**
 * SOVEREIGN Platform — sovereign-data
 * shared-types.ts
 *
 * Canonical copies of the shared enum types consumed by this package's
 * entities and schemas.
 *
 * WHY THIS FILE EXISTS:
 * sovereign-data is a shared package that must compile and test in isolation,
 * without the full monorepo present. Rather than importing from
 * ../../sovereign-shell/shell-contract (which breaks standalone builds), we
 * maintain local copies of the enum types this package needs — the same
 * pattern sovereign-api-client/src/types.ts uses for SovereignProduct.
 *
 * GOVERNANCE CONSTRAINT:
 * These definitions must remain identical to the canonical versions in
 * shell-contract.ts (Section 1 — SovereignRole, ClearanceLevel; Section 2 —
 * HumanDecisionType). Any change to those types in shell-contract.ts requires
 * a matching update here. This is a governance obligation, not an optional sync.
 *
 * FORWARD NOTE (flagged for governance, NOT done here):
 * shell-contract.ts Section 1 comments that SovereignUser/SovereignRole/
 * ClearanceLevel are "Re-exported from sovereign-data package." Actually wiring
 * shell-contract to import from sovereign-data (so there is a single source of
 * truth instead of synced copies) is a shell-contract change = a governance
 * decision + version increment. It is not performed in Session 3.
 *
 * Source of truth (current): sovereign-shell/shell-contract.ts
 * Version: 1.0 — synced to shell-contract v1.3, Session 3, June 13, 2026
 */

/** Canonical platform roles. Synced to shell-contract.ts v1.3 (incl. GD-5 PLATFORM_ADMIN). */
export type SovereignRole =
  | "PROGRAM_MANAGER"
  | "ANALYST"
  | "COMPLIANCE_OFFICER"
  | "AGENT_OPERATOR"
  | "INDEPENDENT_REVIEWER"
  | "SYSTEM_ADMIN"
  | "READ_ONLY"
  | "PLATFORM_ADMIN";

/** Canonical clearance levels. Synced to shell-contract.ts Section 1. */
export type ClearanceLevel =
  | "UNCLASSIFIED"
  | "CUI"
  | "SECRET"
  | "TOP_SECRET";

/**
 * Canonical human-decision taxonomy. Synced to shell-contract.ts Section 2.
 * This is the Decision Matrix taxonomy referenced by SCRIBE output schemas and
 * by PriorPositionReconciliationEvent.decision_type. (The companion suite spec
 * informally calls this "DecisionType"; the canonical name is HumanDecisionType.)
 */
export type HumanDecisionType =
  | "HUMAN_APPROVAL"
  | "HUMAN_OVERRIDE"
  | "HUMAN_DENIAL"
  | "AUTHORIZATION_APPROVED"
  | "AUTHORIZATION_DENIED"
  | "TRAVEL_APPROVED"
  | "TRAVEL_DENIED"
  | "TRAVEL_ESCALATED"
  | "LABOR_CORRECTION_APPROVED"
  | "LABOR_ESCALATION_INITIATED"
  // GD-6 (shell-contract v1.4, June 23, 2026) — a human authorizing an agent action
  // via VIGIL's Agent Approval Queue. Synced from shell-contract.ts Section 2.
  | "AGENT_APPROVAL"
  // GD-7 (shell-contract v1.5, June 23, 2026) — CPMI-VRS Gate 3 human attestation and
  // human-gated world-model update. Synced from shell-contract.ts Section 2.
  | "GATE_3_ATTESTATION"
  | "WORLD_MODEL_UPDATE";

/** Runtime value sets, for validation reuse. Must mirror the unions above. */
export const SOVEREIGN_ROLES: readonly SovereignRole[] = [
  "PROGRAM_MANAGER",
  "ANALYST",
  "COMPLIANCE_OFFICER",
  "AGENT_OPERATOR",
  "INDEPENDENT_REVIEWER",
  "SYSTEM_ADMIN",
  "READ_ONLY",
  "PLATFORM_ADMIN",
];

export const CLEARANCE_LEVELS: readonly ClearanceLevel[] = [
  "UNCLASSIFIED",
  "CUI",
  "SECRET",
  "TOP_SECRET",
];

/**
 * Runtime mirror of the HumanDecisionType union — the canonical Decision Matrix
 * taxonomy as values, for dropdowns and validation reuse (same pattern as
 * SOVEREIGN_ROLES / CLEARANCE_LEVELS). Consumers that need to enumerate the
 * taxonomy at runtime (e.g. COUNSEL's framing selector) import this rather than
 * hardcoding the list. Must mirror the HumanDecisionType union above.
 */
export const HUMAN_DECISION_TYPES: readonly HumanDecisionType[] = [
  "HUMAN_APPROVAL",
  "HUMAN_OVERRIDE",
  "HUMAN_DENIAL",
  "AUTHORIZATION_APPROVED",
  "AUTHORIZATION_DENIED",
  "TRAVEL_APPROVED",
  "TRAVEL_DENIED",
  "TRAVEL_ESCALATED",
  "LABOR_CORRECTION_APPROVED",
  "LABOR_ESCALATION_INITIATED",
  // GD-6 (shell-contract v1.4, June 23, 2026) — agent-action approval.
  "AGENT_APPROVAL",
  // GD-7 (shell-contract v1.5, June 23, 2026) — CPMI Gate 3 attestation + world-model update.
  "GATE_3_ATTESTATION",
  "WORLD_MODEL_UPDATE",
];

/** Shared validation result shape used by every entity validator in this package. */
export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

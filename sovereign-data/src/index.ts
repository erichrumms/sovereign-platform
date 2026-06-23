/**
 * SOVEREIGN Platform — sovereign-data
 * index.ts — public surface
 *
 * The canonical shared data package: entity types, output schemas, and runtime
 * validation. These types are law — shell-contract.ts Section 1 designates this
 * package as the source of canonical entity types. No module may redefine or
 * rename these fields.
 *
 * Version: 1.1.0 — Session 8, June 22, 2026
 *   - Canonical entities: Employee, Program, Cost Code, Document, Vendor
 *   - StyleProfile (GD-1, approved June 11, 2026)
 *   - LensExplanation (Session 8, approved Project Principal — aligned to PR-LENS-001)
 *   - SCRIBE mode output schemas (companion suite spec, Part 3)
 */

// Shared enum types (synced to shell-contract.ts — see shared-types.ts header)
export type {
  SovereignRole,
  ClearanceLevel,
  HumanDecisionType,
  ValidationResult,
} from './shared-types';
export { SOVEREIGN_ROLES, CLEARANCE_LEVELS, HUMAN_DECISION_TYPES } from './shared-types';

// Canonical entities
export type { Employee } from './entities/employee';
export { validateEmployee } from './entities/employee';

export type { Program } from './entities/program';
export { validateProgram } from './entities/program';

export type { CostCode } from './entities/cost-code';
export { validateCostCode } from './entities/cost-code';

export type { Document } from './entities/document';
export { validateDocument } from './entities/document';

export type { Vendor } from './entities/vendor';
export { validateVendor } from './entities/vendor';

// GD-1 — approved June 11, 2026
export type { StyleProfile, StyleProfileUpdate } from './entities/style-profile';
export { validateStyleProfile } from './entities/style-profile';

// Session 8 — approved Project Principal (aligned to PR-LENS-001 output shape)
export type { LensExplanation, LensExplanationConfidence } from './entities/lens-explanation';
export { validateLensExplanation } from './entities/lens-explanation';

// SCRIBE mode output schemas (companion suite spec, Part 3)
export type {
  CorrespondenceDraftSchema,
  ActionItem,
  ProgramNarrativeSchema,
  ReportCommentarySchema,
  VVRDescriptionSchema,
  GovernanceMemoSchema,
  RuleChangeProposalSchema,
} from './schemas/scribe-modes';

/** Package version. */
export const SOVEREIGN_DATA_VERSION = '1.1.0';

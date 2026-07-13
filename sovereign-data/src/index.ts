/**
 * SOVEREIGN Platform — sovereign-data
 * index.ts — public surface
 *
 * The canonical shared data package: entity types, output schemas, and runtime
 * validation. These types are law — shell-contract.ts Section 1 designates this
 * package as the source of canonical entity types. No module may redefine or
 * rename these fields.
 *
 * Version: 1.3.0 — Session 27, July 12, 2026
 *   - Canonical entities: Employee, Program, Cost Code, Document, Vendor
 *   - StyleProfile (GD-1, approved June 11, 2026)
 *   - LensExplanation (Session 8, approved Project Principal — aligned to PR-LENS-001)
 *   - ReasoningChainOutput (Session 11, CPMI module — six-step chain output)
 *   - SCRIBE mode output schemas (companion suite spec, Part 3)
 *   - Time & Travel entities (D-TT3, reaffirmed D-TT7 Option A): TravelRequest,
 *     TravelPolicy, TimeRecord, ChargeAccount (extends CostCode), ComplianceFlag,
 *     CorrectionRecord (Session 27, July 12, 2026)
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

// Session 11 — CPMI module (six-step reasoning chain output)
export type {
  ReasoningChainOutput,
  ReasoningRisk,
  ReasoningConstraint,
  ReasoningOption,
  ConfidenceLevel,
  RiskSeverity,
  RiskType,
} from './entities/reasoning-chain-output';
export { validateReasoningChainOutput } from './entities/reasoning-chain-output';

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

// Time & Travel workflow layer — D-TT3 (June 29, 2026), reaffirmed D-TT7
// Option A (July 11, 2026). Six entities registered Session 27.
export type {
  TravelPolicy,
  TravelHardExceptionRules,
  TravelRoutingThresholds,
  TravelSoftFlags,
} from './entities/travel-policy';
export { validateTravelPolicy } from './entities/travel-policy';

export type {
  TravelRequest,
  TravelCostBreakdown,
  TravelRoutingTier,
  TravelApprovalAuthority,
  TravelRequestStatus,
} from './entities/travel-request';
export { validateTravelRequest } from './entities/travel-request';

export type { TimeRecord, TimeRecordEntry } from './entities/time-record';
export { validateTimeRecord } from './entities/time-record';

export type { ChargeAccount, ChargeAccountType } from './entities/charge-account';
export { validateChargeAccount } from './entities/charge-account';

export type {
  ComplianceFlag,
  ComplianceFlagSource,
  ComplianceFlagSeverity,
  ComplianceFlagStatus,
  ComplianceRuleCategory,
  TimeRuleCategory,
  TravelRuleCategory,
} from './entities/compliance-flag';
export { validateComplianceFlag, TIME_RULE_SEVERITY } from './entities/compliance-flag';

export type {
  CorrectionRecord,
  CorrectionCommunicationType,
  CorrectionResolutionStatus,
} from './entities/correction-record';
export { validateCorrectionRecord } from './entities/correction-record';

// PPBE workflow layer — D-P3 (June 29, 2026), reaffirmed D-P7 Option A
// (July 12, 2026). Six entities registered Session 31 per docs/18 §3.
export type { StrategicObjective, StrategicObjectiveStatus } from './entities/strategic-objective';
export { validateStrategicObjective } from './entities/strategic-objective';

export type {
  ProgramRecord,
  ObligationPlanEntry,
  PerformanceBaselineMetric,
} from './entities/program-record';
export { validateProgramRecord } from './entities/program-record';

export type {
  BudgetExhibit,
  ExhibitCertificationStatus,
  ExhibitExportStatus,
} from './entities/budget-exhibit';
export { validateBudgetExhibit } from './entities/budget-exhibit';

export type { ObligationRecord } from './entities/obligation-record';
export { validateObligationRecord } from './entities/obligation-record';

export type { EvaluationFinding, EvaluationFindingType } from './entities/evaluation-finding';
export { validateEvaluationFinding } from './entities/evaluation-finding';

export type { DependencyMap, DependencyHealthStatus } from './entities/dependency-map';
export { validateDependencyMap } from './entities/dependency-map';

// Time & Travel canonical synthetic seed data (Session 29 — Walkthrough E
// WE-1/WE-5). Validated SYNTH- prefixed INSTANCES of the six D-TT3 entities,
// single-sourced here because the TT workflow layer spans four host modules
// that cannot import each other. No entity type added or changed.
export {
  SYNTH_TT_TRAVEL_POLICY,
  SYNTH_TT_CHARGE_ACCOUNTS,
  SYNTH_TT_TRAVEL_REQUESTS,
  SYNTH_TT_TIME_RECORDS,
  SYNTH_TT_COMPLIANCE_FLAGS,
  SYNTH_TT_CORRECTION_RECORDS,
} from './synthetic/tt-seed';

/** Package version. */
export const SOVEREIGN_DATA_VERSION = '1.5.0';

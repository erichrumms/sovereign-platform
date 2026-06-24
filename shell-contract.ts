/**
 * SOVEREIGN Platform — Shell Contract
 * shell-contract.ts
 *
 * GOVERNANCE DOCUMENT — Approved by Project Principal before any module development begins.
 * This file defines exactly what the sovereign-shell exports to every product module.
 * Modules must not reach outside this contract.
 *
 * Version: 1.5
 * Date: June 2026
 * Authority: Project Principal · SOVEREIGN Platform Governance Authority
 * Status: APPROVED — Session 1 governance record
 *
 * Change process: Any modification to this file requires:
 *   1. A documented governance decision by the Project Principal
 *   2. A version increment
 *   3. A changelog entry below
 *   4. Assessment of impact on all six product modules
 *
 * Changelog:
 *   v1.5 (June 23, 2026) — GD-7 (CPMI Module / CPMI-VRS Gate Runner, approved Project
 *                       Principal June 23, 2026, Session 11, per 08_CPMI_Architecture.md
 *                       §5 / §9). Added five SovereignEventType members for the CPMI
 *                       reasoning chain + CPMI-VRS gate lifecycle:
 *                       CPMI_REASONING_CHAIN_COMPLETE, CPMI_VRS_GATE_1_PASSED,
 *                       CPMI_VRS_GATE_2_PASSED, CPMI_VRS_GATE_3_ATTESTED,
 *                       CPMI_VRS_GATE_4_PASSED. Added GATE_3_ATTESTATION (Gate 3 human
 *                       attestation) and WORLD_MODEL_UPDATE (human-gated world-model
 *                       update) to HumanDecisionType. All seven are non-breaking union
 *                       widenings. Impact assessment: the five event types are defined
 *                       only here (the two shell-contract copies) and emitted only by
 *                       module-cpmi; no existing module emits them and no exhaustive
 *                       switch over SovereignEventType exists. The two HumanDecisionType
 *                       members additionally propagate to the synced copy in
 *                       sovereign-data/src/shared-types.ts (the type + the
 *                       HUMAN_DECISION_TYPES runtime const, 11 -> 13 members) and its
 *                       test, per Standing Constraint #11. Full tsc --noEmit clean; both
 *                       shell-contract copies SHA-256 verified identical at v1.5.
 *   v1.4 (June 23, 2026) — GD-6 (VIGIL Agent Approval Flow, approved Project
 *                       Principal June 23, 2026, Session 10, per
 *                       05_VIGIL_Agent_Approval.md §7). Added four SovereignEventType
 *                       members for the agent-action approval lifecycle:
 *                       AGENT_ACTION_APPROVED, AGENT_ACTION_REJECTED,
 *                       AGENT_ACTION_ESCALATED, AGENT_ACTION_EXPIRED. Added
 *                       AGENT_APPROVAL to HumanDecisionType (a human authorizing an
 *                       agent action via VIGIL's Agent Approval Queue carries
 *                       decision_type AGENT_APPROVAL — Standing Constraint #4). All
 *                       five are non-breaking union widenings. Impact assessment: the
 *                       four event types are defined only here (the two shell-contract
 *                       copies) and emitted only by module-vigil (vigil-approval-agent
 *                       flow) — no existing module emits them and no exhaustive switch
 *                       over SovereignEventType exists. AGENT_APPROVAL additionally
 *                       propagates to the synced HumanDecisionType copy in
 *                       sovereign-data/src/shared-types.ts (the type + the
 *                       HUMAN_DECISION_TYPES runtime const) and its test, per Standing
 *                       Constraint #11 — the data dictionary is a shared artifact. Full
 *                       tsc --noEmit clean; both shell-contract copies SHA-256 verified
 *                       identical at v1.4.
 *   v1.3 (June 13, 2026) — GD-5 (Companion Suite Contract Enablement, approved
 *                       Project Principal June 13, 2026, Session 3). Added four
 *                       companion products to SovereignProduct: COUNSEL, SCRIBE,
 *                       LENS, VIGIL. Added PLATFORM_ADMIN to SovereignRole
 *                       (enables VIGIL's PLATFORM_ADMIN-or-SYSTEM_ADMIN mount
 *                       gate under the existing fail-closed default policy).
 *                       Both changes are non-breaking union widenings.
 *                       Impact assessment: no exhaustive switch / Record key over
 *                       SovereignProduct or SovereignRole; module-loader gains a
 *                       matching MODULE_PRODUCT update (separate component);
 *                       sovereign-api-client/src/types.ts SovereignProduct updated
 *                       to match (governance-obligated sync per that file's
 *                       header). Full tsc --noEmit clean across both TS packages.
 *                       GD-5 does NOT resolve the role->module access matrix
 *                       (Decision 24), companion VRS-gate treatment, or the
 *                       access-denial taxonomy gap (Decision 25).
 *   v1.2 (June 11, 2026) — Added seven VIGIL SovereignEventType members
 *                       (GD-4, approved Project Principal June 11, 2026):
 *                       ALERT_RECEIVED, ALERT_ACKNOWLEDGED, ALERT_RESOLVED,
 *                       ALERT_ESCALATED, ALERT_FALSE_POSITIVE,
 *                       TRIAGE_ANALYSIS_PRODUCED, APPROVAL_REQUEST_RECEIVED.
 *                       Applied AFTER v1.1, not combined. Seven new union
 *                       members only; non-breaking widening. See
 *                       Governance_Decision_Record_GD4_VIGIL.md. Impact
 *                       assessment: no exhaustive switch on SovereignEventType
 *                       exists in the monorepo; full tsc --noEmit clean.
 *   v1.1 (June 11, 2026) — Added VOICE_CAPTURE_COMPLETED to SovereignEventType
 *                       (GD-2, approved Project Principal June 11, 2026). Added
 *                       PRIOR_POSITION_RECONCILIATION to SovereignEventType
 *                       (GD-3, approved Project Principal June 11, 2026). Added
 *                       SCRIBEMode, VoiceCaptureCompletedEvent, and
 *                       PriorPositionReconciliationEvent payload types (Section 2).
 *                       Two new union members only; no field removed or renamed.
 *                       Non-breaking widening. See Governance_Decision_Record_GD1_GD2_GD3.md.
 *                       Impact assessment: no exhaustive switch on SovereignEventType
 *                       exists in the monorepo; full tsc --noEmit clean.
 *   v1.0 (June 2026) — Initial specification. Covers five original shell exports
 *                       plus three protocol boundary interfaces (MCP, A2A, AG-UI).
 *                       Protocol interfaces are defined and reserved here; implementations
 *                       are Stage 2 deliverables. No module may implement these
 *                       independently at the product level.
 */

// ============================================================
// SECTION 1 — SHARED ENTITY TYPES
// Re-exported from sovereign-data package.
// These are law. Never redefine in a module.
// ============================================================

export interface SovereignUser {
  employee_id: string;
  name: string;
  org_unit: string;
  role: SovereignRole;
  clearance_level: ClearanceLevel;
  cost_code_assignments: string[];
}

export type SovereignRole =
  | "PROGRAM_MANAGER"
  | "ANALYST"
  | "COMPLIANCE_OFFICER"
  | "AGENT_OPERATOR"
  | "INDEPENDENT_REVIEWER"
  | "SYSTEM_ADMIN"
  | "READ_ONLY"
  // GD-5, June 13, 2026 (shell-contract v1.3) — platform administrator role.
  // VIGIL declares minimumRole "PLATFORM_ADMIN"; the fail-closed default
  // RoleAccessPolicy (exact match OR SYSTEM_ADMIN superuser) then admits
  // exactly PLATFORM_ADMIN or SYSTEM_ADMIN — the required VIGIL mount gate.
  | "PLATFORM_ADMIN";

export type ClearanceLevel =
  | "UNCLASSIFIED"
  | "CUI"
  | "SECRET"
  | "TOP_SECRET";

export type SovereignProduct =
  // Six primary products
  | "NEXUS"
  | "CPMI"
  | "APEX"
  | "FLOWPATH"
  | "AGENTOS"
  | "ARIA"
  // Four companion suite modules — GD-5, June 13, 2026 (shell-contract v1.3)
  | "COUNSEL"
  | "SCRIBE"
  | "LENS"
  | "VIGIL";

export type SovereignTier = "standard" | "enhanced";


// ============================================================
// SECTION 2 — LOGGER TYPES
// Every module calls shell.logger.log() — never a provider directly.
// Full schema: sovereign-security/sovereign_logger.py
// ============================================================

export type SovereignEventType =
  | "APPROVAL_GATE_OPEN"
  | "APPROVAL_GATE_CLOSE"
  | "HUMAN_DECISION"
  | "AGENT_STEP_START"
  | "AGENT_STEP_COMPLETE"
  | "ANOMALY_DETECTED"
  | "GOVERNANCE_GATE_1"
  | "GOVERNANCE_GATE_2"
  | "GOVERNANCE_GATE_3"
  | "GOVERNANCE_GATE_4"
  | "REASONING_STEP_START"
  | "REASONING_STEP_COMPLETE"
  | "HONEYTOKEN_ACCESS"
  | "FALLBACK_ACTIVATED"
  | "EXTERNAL_DEPENDENCY_FAILURE"
  | "AGENT_ISOLATED"
  | "GOVERNANCE_GATE_OVERRIDE"
  | "AGUI_EVENT"
  | "MCP_TOOL_CALL"
  | "A2A_TASK_HANDOFF"
  | "A2A_TASK_FAILURE"
  // GD-2 — June 11, 2026 (shell-contract v1.1)
  | "VOICE_CAPTURE_COMPLETED"
  // GD-3 — June 11, 2026 (shell-contract v1.1)
  | "PRIOR_POSITION_RECONCILIATION"
  // GD-4 — June 11, 2026 (shell-contract v1.2) — seven VIGIL event types
  | "ALERT_RECEIVED"
  | "ALERT_ACKNOWLEDGED"
  | "ALERT_RESOLVED"
  | "ALERT_ESCALATED"
  | "ALERT_FALSE_POSITIVE"
  | "TRIAGE_ANALYSIS_PRODUCED"
  | "APPROVAL_REQUEST_RECEIVED"
  // GD-6 — June 23, 2026 (shell-contract v1.4) — four agent-action approval
  // lifecycle event types (VIGIL Agent Approval Flow). Emitted only by module-vigil.
  | "AGENT_ACTION_APPROVED"
  | "AGENT_ACTION_REJECTED"
  | "AGENT_ACTION_ESCALATED"
  | "AGENT_ACTION_EXPIRED"
  // GD-7 — June 23, 2026 (shell-contract v1.5) — CPMI reasoning-chain completion +
  // four CPMI-VRS gate lifecycle event types. Emitted only by module-cpmi.
  | "CPMI_REASONING_CHAIN_COMPLETE"
  | "CPMI_VRS_GATE_1_PASSED"
  | "CPMI_VRS_GATE_2_PASSED"
  | "CPMI_VRS_GATE_3_ATTESTED"
  | "CPMI_VRS_GATE_4_PASSED";

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
  // GD-6 — June 23, 2026 (shell-contract v1.4) — a human authorizing an agent action
  // via VIGIL's Agent Approval Queue. Synced to sovereign-data/src/shared-types.ts.
  | "AGENT_APPROVAL"
  // GD-7 — June 23, 2026 (shell-contract v1.5) — CPMI-VRS Gate 3 human attestation and
  // human-gated world-model update. Synced to sovereign-data/src/shared-types.ts.
  | "GATE_3_ATTESTATION"
  | "WORLD_MODEL_UPDATE";

export interface SovereignLogEvent {
  event_type: SovereignEventType;
  workflow_step_id: string;
  sovereign_tier: SovereignTier;
  product: SovereignProduct;
  actor_id: string;
  outcome: string;
  payload: Record<string, unknown>;
  // HUMAN_DECISION events only
  decision_type?: HumanDecisionType;
  actor?: "human" | "agent";
  actor_name?: string;
  // AGENT_STEP_START and AGENT_STEP_COMPLETE events
  agent_id?: string;
  agent_class?: "Analytical" | "Operational" | "Governance" | "Monitoring";
  // AGENT_STEP_COMPLETE events (Intelligence Layer exposure)
  deployment_feedback?: {
    automatability_score: number;
    human_time_seconds: number;
    agent_time_seconds: number;
    override_occurred: boolean;
    override_reason?: string;
  };
}

// ------------------------------------------------------------
// COMPANION SUITE EVENT PAYLOAD TYPES (shell-contract v1.1)
// Auxiliary, fully-typed payload shapes for the GD-2 / GD-3 event types.
// SovereignLogEvent.payload remains Record<string, unknown>; these describe
// the structured payloads a module supplies for these two event types so the
// Intelligence Layer can consume them without re-deriving the shape.
// ------------------------------------------------------------

/**
 * SCRIBEMode — the six product-aligned drafting modes plus synthesis and
 * framing. Used in VoiceCaptureCompletedEvent.target_mode. Values must match
 * the mode selector in module-scribe.
 */
export type SCRIBEMode =
  | "correspondence_draft"   // → NEXUS
  | "program_narrative"      // → NEXUS / APEX
  | "report_commentary"      // → APEX
  | "vvr_description"        // → FLOWPATH
  | "governance_memo"        // → CPMI
  | "rule_change_proposal"   // → ARIA
  | "synthesis"              // → intermediate artifact
  | "framing";               // → FLOWPATH pre-work

/**
 * VOICE_CAPTURE_COMPLETED — GD-2, approved June 11, 2026.
 * Emitted by: scribe-drafter (module-scribe / useVoiceCapture.ts).
 * Data classification: user — invariant, never change.
 */
export interface VoiceCaptureCompletedEvent {
  event_type: "VOICE_CAPTURE_COMPLETED";
  agent_id: string;                // "scribe-drafter"
  duration_seconds: number;        // capture session duration
  word_count: number;              // words in resulting transcript
  target_mode: SCRIBEMode;         // drafting mode the capture feeds
  workflow_step_id?: string;       // present if initiated from product context
  data_classification: "user";     // invariant
}

/**
 * PRIOR_POSITION_RECONCILIATION — GD-3, approved June 11, 2026.
 * Emitted by: counsel-analyst (module-counsel / usePriorPositionCheck.ts).
 * Both resolution paths are logged. Neither is blocked.
 * NOTE: decision_type uses the contract's canonical HumanDecisionType
 * (the Decision Matrix taxonomy), not a separate "DecisionType" type.
 */
export interface PriorPositionReconciliationEvent {
  event_type: "PRIOR_POSITION_RECONCILIATION";
  agent_id: string;                  // "counsel-analyst"
  current_decision_id: string;
  conflicting_record_ids: string[];
  resolution: "acknowledged" | "dismissed";
  /**
   * Present when resolution === "acknowledged".
   * Absent (not just undefined) when resolution === "dismissed".
   * Schema validation enforces this constraint at the emit site.
   */
  reconciliation_note?: string;
  decision_type: HumanDecisionType;  // from the Decision Matrix taxonomy
  workflow_step_id?: string;
}


// ============================================================
// SECTION 3 — GOVERNANCE TYPES
// ============================================================

export type VRSGateState =
  | "NOT_STARTED"
  | "GATE_1_COMPLETE"
  | "GATE_2_COMPLETE"
  | "GATE_3_PENDING"
  | "GATE_3_COMPLETE"
  | "GATE_4_CERTIFIED"
  | "HOLD";

export interface VRSGateStatus {
  product: SovereignProduct;
  gate_state: VRSGateState;
  last_certified: string | null;
  hold_reason?: string;
  certifying_officer?: string;
}

export interface CPMIPortfolioStatus {
  overall: "GREEN" | "AMBER" | "RED";
  products: VRSGateStatus[];
  last_updated: string;
  pending_gate3_reviews: number;
}


// ============================================================
// SECTION 4 — MCP PROTOCOL BOUNDARY
// Governance: SOVEREIGN Security Framework
// Implementation stage: Stage 2
// ============================================================

export type MCPToolCategory =
  | "DATABASE_READ"
  | "DATABASE_WRITE"
  | "EXTERNAL_API"
  | "FILE_OPERATION"
  | "SECURITY_FRAMEWORK"
  | "WORLD_MODEL";

export interface MCPToolEndpoint {
  tool_id: string;
  category: MCPToolCategory;
  product_scope: SovereignProduct[];
  data_classification: ClearanceLevel;
  requires_human_approval: boolean;
  security_observable: boolean;
}

export interface MCPCallResult<T = unknown> {
  tool_id: string;
  success: boolean;
  data?: T;
  error?: string;
  fallback_tier?: "live" | "cache" | "static";
  workflow_step_id: string;
}

export interface SovereignMCPInterface {
  call: <T>(
    tool_id: string,
    params: Record<string, unknown>,
    context: { workflow_step_id: string; product: SovereignProduct }
  ) => Promise<MCPCallResult<T>>;
  listEndpoints: (product: SovereignProduct) => MCPToolEndpoint[];
  manifestVersion: string;
  _stage: "DEFINED" | "IMPLEMENTED";
}


// ============================================================
// SECTION 5 — A2A PROTOCOL BOUNDARY
// Governance: AgentOS
// Implementation stage: Stage 2
//
// OPEN DECISION (unresolved — blocks Stage 2 A2A task lifecycle build):
//   When AgentOS encounters a medium-risk task requiring human approval,
//   does it re-execute after approval or acknowledge and continue?
//   Decision owner: Project Principal.
// ============================================================

export type AgentClass =
  | "Analytical"
  | "Operational"
  | "Governance"
  | "Monitoring";

export type TaskLifecycleState =
  | "QUEUED"
  | "RUNNING"
  | "AWAITING_HUMAN_APPROVAL"
  | "APPROVED"
  | "DENIED"
  | "COMPLETE"
  | "FAILED"
  | "ESCALATED";

export interface AgentCard {
  agent_id: string;
  agent_class: AgentClass;
  product: SovereignProduct;
  capabilities: string[];
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown>;
  task_lifecycle_contract: {
    supports_long_running: boolean;
    // Platform default: ACKNOWLEDGE_AND_CONTINUE — task resumes from paused state.
    // CPMI Gate 3 exception: RE_EXECUTE — reasoning chain restarts with current
    // world model. Encoded in CPMI agent card. Resolved: Project Principal, June 1, 2026.
    approval_behavior: "RE_EXECUTE" | "ACKNOWLEDGE_AND_CONTINUE";
    partial_failure_behavior: "ESCALATE" | "RETRY" | "FALLBACK";
  };
  data_classification_ceiling: ClearanceLevel;
  security_observable: boolean;
}

export interface A2ATask {
  task_id: string;
  originating_agent: string;
  target_agent: string;
  workflow_step_id: string;
  payload: Record<string, unknown>;
  state: TaskLifecycleState;
  created_at: string;
  updated_at: string;
  hold_reason?: string;
}

export interface SovereignA2AInterface {
  registerAgent: (card: AgentCard) => Promise<{ registered: boolean; registry_version: string }>;
  invokeAgent: (
    target_agent_id: string,
    payload: Record<string, unknown>,
    context: { workflow_step_id: string; originating_agent: string }
  ) => Promise<A2ATask>;
  getTaskState: (task_id: string) => Promise<A2ATask>;
  listAgents: () => AgentCard[];
  _stage: "DEFINED" | "CARDS_REGISTERED" | "IMPLEMENTED";
}


// ============================================================
// SECTION 6 — AG-UI PROTOCOL BOUNDARY
// Governance: CPMI-VRS (gate definitions) + AgentOS (execution)
// Implementation stage: Stage 2
//
// OPEN DECISION (unresolved — blocks Stage 3 annotation program design):
//   Which industry or workflow class does the Intelligence Layer
//   build its knowledge base for first?
//   Decision owner: Project Principal.
// ============================================================

export type AGUIEventType =
  | "REASONING_STEP"
  | "TOOL_CALL_INITIATED"
  | "TOOL_CALL_COMPLETE"
  | "RECOMMENDATION_READY"
  | "HUMAN_INTERRUPT"
  | "HUMAN_REDIRECT"
  | "HUMAN_APPROVAL"
  | "HUMAN_DENIAL"
  | "TASK_COMPLETE"
  | "TASK_FAILED";

export interface AGUIEvent {
  event_id: string;
  event_type: AGUIEventType;
  agent_id: string;
  workflow_step_id: string;
  product: SovereignProduct;
  timestamp: string;
  sequence: number;
  payload: Record<string, unknown>;
  // Human action events
  actor_id?: string;
  actor_name?: string;
  decision_type?: HumanDecisionType;
}

export interface AGUISubscription {
  task_id: string;
  subscriber_id: string;
  product: SovereignProduct;
  gate_context?: VRSGateState;
}

export interface SovereignAGUIInterface {
  emit: (event: Omit<AGUIEvent, "event_id" | "timestamp" | "sequence">) => void;
  subscribe: (
    subscription: AGUISubscription,
    handler: (event: AGUIEvent) => void
  ) => () => void;
  humanAction: (
    task_id: string,
    action: Pick<AGUIEvent, "event_type" | "actor_id" | "actor_name" | "decision_type" | "payload">,
    context: { workflow_step_id: string }
  ) => void;
  taxonomyVersion: string;
  _stage: "DEFINED" | "TAXONOMY_COMPLETE" | "IMPLEMENTED";
}


// ============================================================
// SECTION 7 — SHELL CONTEXT (THE COMPLETE CONTRACT)
// ============================================================

export interface SovereignShellContext {
  auth: {
    user: SovereignUser;
    token: string;
    signOut: () => void;
    hasRole: (role: SovereignRole) => boolean;
    hasClearance: (level: ClearanceLevel) => boolean;
  };
  logger: {
    log: (event: SovereignLogEvent) => void;
  };
  governance: {
    cpmiStatus: CPMIPortfolioStatus;
    vrsGates: VRSGateStatus[];
    isOnHold: (product: SovereignProduct) => boolean;
  };
  data: {
    types: unknown; // sovereign-data package canonical types
  };
  navigation: {
    navigateTo: (path: string) => void;
    currentPath: string;
    breadcrumb: Array<{ label: string; path: string }>;
  };
  // Protocol boundaries
  mcp: SovereignMCPInterface;
  a2a: SovereignA2AInterface;
  agui: SovereignAGUIInterface;
}


// ============================================================
// SECTION 8 — MODULE CONTRACT
// ============================================================

export interface SovereignModuleContract {
  moduleId: string;        // "module-[productname]"
  mountPath: string;       // "/[productname]"
  displayName: string;
  minimumRole: SovereignRole;
  agentCards: AgentCard[];
  mount: (ctx: SovereignShellContext, el: HTMLElement) => void;
  unmount: () => void;
  healthCheck: () => Promise<{
    status: "HEALTHY" | "DEGRADED" | "UNAVAILABLE";
    vrs_gate: VRSGateState;
    degraded_reason?: string;
  }>;
}


// ============================================================
// SECTION 9 — INTELLIGENCE LAYER EXPOSURE (FROZEN)
// Field names are frozen. Never rename, never omit.
//
// ✓ workflow_step_id        — every Logger event
// ✓ decision_type           — every HUMAN_DECISION event
// ✓ deployment_feedback     — every AGENT_STEP_COMPLETE event
// ✓ ANOMALY_DETECTED        — includes workflow_step_id
// ✓ classification_level    — every program entity
// ✓ VVR export schema       — {step_id, description, inputs, outputs,
//                              decision_required, human_role, cpmi_vrs_disclosure}
// ============================================================

export type ILExposureVerified = true;


// ============================================================
// SECTION 10 — GOVERNANCE NOTICE
//
// This file is a governance document expressed as TypeScript.
// Nothing here is executed directly. It is imported by the shell
// (sovereign-shell/src/shell.ts) and by each module's
// module.config.ts.
//
// Changing this file is a governance event, not a refactor.
// The change process is stated at the top of this file.
// ============================================================

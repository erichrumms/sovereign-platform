/**
 * SOVEREIGN Platform — module-nexus
 * nexus-contract.ts — the NEXUS work-request contract (GD-11 + GD-10).
 *
 * Owns the shapes and the state machine the request registry, router, AgentOS port, and
 * panels share: the WorkRequest shape, the five WorkRequestType values, the six-status
 * lifecycle (spec §3 / opening prompt), the allowed-transition map, the GD-11 Logger-event
 * mapping, and the per-request workflow_step_id invariant (Standing Constraint #6).
 *
 * Shared shapes are reused, never redefined (Standing Constraint #2): ValidationResult and
 * ClearanceLevel come from @sovereign/data / @sovereign/api-client; AgentClass and
 * SovereignEventType come from the shell contract. NEXUS records the OUTCOMES of VIGIL
 * decisions (routed via AgentOS) — it adds no HumanDecisionType (GD-11).
 *
 * Version: 1.0 · Session 15 · June 24, 2026
 */

import type { ValidationResult } from "@sovereign/data";
import { CLEARANCE_LEVELS } from "@sovereign/data";
import type { ClearanceLevel } from "@sovereign/api-client";

import type { SovereignEventType, AgentClass } from "../../sovereign-shell/shell-contract";

// ============================================================
// WORK REQUEST TYPES (5) + ROUTING-RELEVANT TYPES
// ============================================================

export type WorkRequestType =
  | "DOCUMENT_REVIEW"
  | "DATA_ANALYSIS"
  | "COMPLIANCE_CHECK"
  | "REPORT_GENERATION"
  | "GOVERNANCE_QUERY";

export const WORK_REQUEST_TYPES: readonly WorkRequestType[] = [
  "DOCUMENT_REVIEW",
  "DATA_ANALYSIS",
  "COMPLIANCE_CHECK",
  "REPORT_GENERATION",
  "GOVERNANCE_QUERY",
];

// ============================================================
// WORK REQUEST STATUSES (6) — the lifecycle
// ============================================================

export type WorkRequestStatus =
  | "SUBMITTED"
  | "ROUTED"
  | "PENDING_APPROVAL"
  | "IN_PROGRESS"
  | "COMPLETE"
  | "REJECTED";

export const WORK_REQUEST_STATUSES: readonly WorkRequestStatus[] = [
  "SUBMITTED",
  "ROUTED",
  "PENDING_APPROVAL",
  "IN_PROGRESS",
  "COMPLETE",
  "REJECTED",
];

/** Terminal statuses — no outgoing transition. */
export const TERMINAL_STATUSES: readonly WorkRequestStatus[] = ["COMPLETE", "REJECTED"];

/**
 * Allowed transitions. After ROUTED, the request goes to PENDING_APPROVAL (when the routed
 * type requires approval) or straight to IN_PROGRESS (when it does not). A PENDING_APPROVAL
 * request records the VIGIL outcome routed via AgentOS: IN_PROGRESS (approved) or REJECTED.
 */
export const ALLOWED_TRANSITIONS: Readonly<Record<WorkRequestStatus, readonly WorkRequestStatus[]>> = {
  SUBMITTED: ["ROUTED"],
  ROUTED: ["PENDING_APPROVAL", "IN_PROGRESS"],
  PENDING_APPROVAL: ["IN_PROGRESS", "REJECTED"],
  IN_PROGRESS: ["COMPLETE"],
  COMPLETE: [],
  REJECTED: [],
};

export function canTransition(from: WorkRequestStatus, to: WorkRequestStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function isTerminal(status: WorkRequestStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

// ============================================================
// GD-11 EVENT MAPPING
// ============================================================

/**
 * Map a status to its GD-11 Logger event type. SUBMITTED is the intake event
 * (NEXUS_REQUEST_SUBMITTED) — unlike AgentOS, the initial NEXUS state carries an event.
 */
export function eventTypeForStatus(status: WorkRequestStatus): SovereignEventType {
  switch (status) {
    case "SUBMITTED":
      return "NEXUS_REQUEST_SUBMITTED";
    case "ROUTED":
      return "NEXUS_REQUEST_ROUTED";
    case "PENDING_APPROVAL":
      return "NEXUS_APPROVAL_PENDING";
    case "IN_PROGRESS":
      return "NEXUS_REQUEST_IN_PROGRESS";
    case "COMPLETE":
      return "NEXUS_REQUEST_COMPLETE";
    case "REJECTED":
      return "NEXUS_REQUEST_REJECTED";
  }
}

/** Per-request workflow_step_id — shared by every event in the request's lifecycle (Constraint #6). */
export function requestWorkflowStep(requestId: string): string {
  return `nexus-request-${requestId}`;
}

// ============================================================
// WORK REQUEST SHAPE
// ============================================================

export interface WorkRequest {
  request_id: string;
  title: string;
  description: string;
  request_type: WorkRequestType;
  status: WorkRequestStatus;
  data_classification: ClearanceLevel;
  requester_id: string;
  /** Set at routing — the agent class the router assigned (Constraint #2: AgentClass). */
  assigned_agent_class?: AgentClass;
  /** Set at routing — whether the routed type requires human approval. */
  requires_approval?: boolean;
  /** Set when NEXUS hands execution to AgentOS (AgentOSPort.submitTask). */
  agentos_task_id?: string;
  created_at: string;
  updated_at: string;
  workflow_step_id: string;
}

/** The fields a requester supplies at intake; the registry fills in the rest. */
export interface SubmitRequestInput {
  request_id: string;
  title: string;
  description: string;
  request_type: WorkRequestType;
  data_classification: ClearanceLevel;
  requester_id: string;
}

// ============================================================
// VALIDATION (reuses @sovereign/data ValidationResult — Constraint #2)
// ============================================================

export function validateSubmitRequestInput(value: unknown): ValidationResult {
  if (typeof value !== "object" || value === null) {
    return { valid: false, errors: ["request input must be a non-null object"] };
  }
  const errors: string[] = [];
  const r = value as Partial<SubmitRequestInput>;
  const str = (v: unknown): boolean => typeof v === "string" && v.trim() !== "";

  if (!str(r.request_id)) errors.push("request_id: required non-empty string");
  if (!str(r.title)) errors.push("title: required non-empty string");
  if (!str(r.description)) errors.push("description: required non-empty string");
  if (!str(r.requester_id)) errors.push("requester_id: required non-empty string");
  if (!WORK_REQUEST_TYPES.includes(r.request_type as WorkRequestType)) {
    errors.push(`request_type: must be one of ${WORK_REQUEST_TYPES.join(" | ")}`);
  }
  if (!CLEARANCE_LEVELS.includes(r.data_classification as ClearanceLevel)) {
    errors.push(`data_classification: must be one of ${CLEARANCE_LEVELS.join(" | ")}`);
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

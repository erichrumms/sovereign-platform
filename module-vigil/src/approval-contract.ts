/**
 * SOVEREIGN Platform — module-vigil
 * approval-contract.ts — the VIGIL Agent Approval contract (PR-VIGIL-002).
 *
 * Defines the AgentApprovalRequest shape AgentOS submits (spec §5), the operator
 * decision taxonomy, expiry logic (spec §4.1), the workflow_step_id invariant
 * (spec §6 — `vigil-approval-<requestId>`), the PR-VIGIL-002 binding, and the
 * ApprovalBrief shape vigil-approval-agent produces. Shared shapes (ValidationResult)
 * are reused from @sovereign/data, never redefined (Standing Constraint #2).
 *
 * Version: 1.0 · Session 10 · June 23, 2026
 */

import type { ValidationResult } from "@sovereign/data";

import type { SovereignEventType, SovereignLogEvent } from "../../sovereign-shell/shell-contract";

/** PR-VIGIL-002 registry binding — stamped onto Logger events as prompt provenance. */
export const PR_VIGIL_002 = {
  registryId: "PR-VIGIL-002",
  file: "prompts/approval-system-v1.0.md",
  promptVersion: "v1.0",
} as const;

export type RiskClassification = "P1" | "P2" | "P3";

export type ApprovalAgentClass = "Analytical" | "Operational" | "Governance" | "Monitoring";

/** The approval request AgentOS submits to VIGIL via the injectable port (spec §5). */
export interface AgentApprovalRequest {
  request_id: string;
  requesting_agent_id: string;
  requesting_agent_class: ApprovalAgentClass;
  action_type: string;
  action_detail: Record<string, unknown>;
  risk_classification: RiskClassification;
  submitted_at: string;
  expires_at: string;
  workflow_step_id: string;
  context?: string;
}

/** The operator's three decisions (spec §4.2). */
export type ApprovalDecisionAction = "APPROVE" | "REJECT" | "ESCALATE";

/** Notes are required for ALL three decisions (spec §4.2). */
export const APPROVAL_NOTE_MIN_CHARS = 10;

/** Expiry windows by risk classification (spec §4.1): P1 15 min, P2 60 min, P3 4 hours. */
export const EXPIRY_MINUTES: Record<RiskClassification, number> = { P1: 15, P2: 60, P3: 240 };

/** Risk sort order — P1 first (spec §4.3). */
export const RISK_ORDER: Record<RiskClassification, number> = { P1: 0, P2: 1, P3: 2 };

/** Compute expires_at from submitted_at + the risk's window. */
export function computeExpiresAt(submittedAtIso: string, risk: RiskClassification): string {
  return new Date(Date.parse(submittedAtIso) + EXPIRY_MINUTES[risk] * 60_000).toISOString();
}

/** System actor on automated expiry events (spec §4.3 / §6 — not a human decision). */
export const SOF_APPROVAL_SYSTEM = "sof-approval-system";

/**
 * Live expiry-sweep cadence (WG-5, Session 54): how often an open screen re-checks
 * the queue for overdue requests. 30 seconds keeps a P1's 15-minute window honest
 * without meaningful cost; the check itself is a cheap timestamp comparison.
 */
export const EXPIRY_SWEEP_INTERVAL_MS = 30_000;

/**
 * The AGENT_ACTION_EXPIRED system event for one overdue request — the single
 * source of this event's shape (WG-5, Session 54). Both sweep sites build the
 * event here — useApprovalQueue.expireOverdue (VIGIL's own screen) and
 * expireVigilSessionRequests (the shared session store, reached from the
 * Reviewer's Workspace) — so the two cannot drift (Constraint #2).
 */
export function agentActionExpiredEvent(req: AgentApprovalRequest): SovereignLogEvent {
  return {
    event_type: "AGENT_ACTION_EXPIRED",
    workflow_step_id: approvalWorkflowStep(req.request_id),
    sovereign_tier: "standard",
    product: "VIGIL",
    actor_id: SOF_APPROVAL_SYSTEM,
    outcome: "agent_action_expired",
    payload: {
      request_id: req.request_id,
      requesting_agent_id: req.requesting_agent_id,
      action_type: req.action_type,
      risk_classification: req.risk_classification,
      expired_at: req.expires_at,
    },
  };
}

/** Whether the request is past its expiry at the given instant. */
export function isExpired(request: AgentApprovalRequest, nowMs: number): boolean {
  const t = Date.parse(request.expires_at);
  return !Number.isNaN(t) && t <= nowMs;
}

/** Minutes remaining before expiry (negative if already expired). */
export function minutesRemaining(request: AgentApprovalRequest, nowMs: number): number {
  return Math.round((Date.parse(request.expires_at) - nowMs) / 60_000);
}

/**
 * Per-request workflow_step_id — every Logger event for a request (brief generation,
 * decision, expiry) shares it so the audit trail ties the lifecycle together
 * (Standing Constraint #6 / spec §6 invariant).
 */
export function approvalWorkflowStep(requestId: string): string {
  return `vigil-approval-${requestId}`;
}

/** Map an operator decision to its GD-6 event type (spec §4.2 / §6). */
export function eventTypeForDecision(action: ApprovalDecisionAction): SovereignEventType {
  switch (action) {
    case "APPROVE":
      return "AGENT_ACTION_APPROVED";
    case "REJECT":
      return "AGENT_ACTION_REJECTED";
    case "ESCALATE":
      return "AGENT_ACTION_ESCALATED";
  }
}

/** Notes validity (≥10 non-whitespace-trimmed chars). */
export function validateNotes(notes: string | undefined): boolean {
  return typeof notes === "string" && notes.trim().length >= APPROVAL_NOTE_MIN_CHARS;
}

/** The brief vigil-approval-agent produces — labeled-section text (prompt §8). */
export interface ApprovalBrief {
  brief: string;
}

/**
 * Whether model output is a usable brief: non-empty and carrying the lead section
 * anchor (so a broken/empty response falls back to cache/static).
 */
export function hasUsableBrief(brief: string): boolean {
  return brief.trim() !== "" && /REQUESTED ACTION/i.test(brief);
}

/** Validate an inbound approval request (port sanity — a malformed request is not shown). */
export function validateApprovalRequest(value: unknown): ValidationResult {
  if (typeof value !== "object" || value === null) {
    return { valid: false, errors: ["approval request must be a non-null object"] };
  }
  const errors: string[] = [];
  const r = value as Partial<AgentApprovalRequest>;
  const str = (v: unknown): boolean => typeof v === "string" && v.trim() !== "";

  if (!str(r.request_id)) errors.push("request_id: required non-empty string");
  if (!str(r.requesting_agent_id)) errors.push("requesting_agent_id: required non-empty string");
  if (!str(r.requesting_agent_class)) errors.push("requesting_agent_class: required non-empty string");
  if (!str(r.action_type)) errors.push("action_type: required non-empty string");
  if (typeof r.action_detail !== "object" || r.action_detail === null) {
    errors.push("action_detail: required object");
  }
  if (r.risk_classification !== "P1" && r.risk_classification !== "P2" && r.risk_classification !== "P3") {
    errors.push("risk_classification: must be P1 | P2 | P3");
  }
  if (!str(r.submitted_at)) errors.push("submitted_at: required ISO 8601 string");
  if (!str(r.expires_at)) errors.push("expires_at: required ISO 8601 string");
  if (!str(r.workflow_step_id)) errors.push("workflow_step_id: required non-empty string");

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

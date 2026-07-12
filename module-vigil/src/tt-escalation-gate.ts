/**
 * SOVEREIGN Platform — module-vigil
 * tt-escalation-gate.ts — the VIGIL authorization gate for Time & Travel formal
 * escalations (Session 28, D3).
 *
 * docs/17 §7 Tier B: "Any formal escalation notice (employee direct or supervisor
 * notification) requires manager authorization in the VIGIL Agent Approval Queue
 * before the communication is sent." This module is that gate, made structural:
 * an escalation case opens PENDING_AUTHORIZATION, isSendable() is false until a
 * human authorization decision is recorded, and the decision emission itself
 * carries decision_type ESCALATION_AUTHORIZED (GD-21, shell-contract v1.16) — the
 * exact decision type docs/17 §12 defined for this act.
 *
 * THE GATE HALTS THE FLOW: there is no code path from a drafted escalation to a
 * sendable one that does not pass through recordEscalationAuthorization() with a
 * human actor. A draft is never auto-sent; rejection closes the case unsendable.
 *
 * Logger emission (all APPROVED taxonomy, every event carrying workflow_step_id —
 * Constraint #6): APPROVAL_REQUEST_RECEIVED when the case enters the queue (GD-4);
 * AGENT_ACTION_APPROVED / AGENT_ACTION_REJECTED + the HUMAN_DECISION semantics on
 * the operator decision (GD-6 pattern, mirrored from useApprovalDecision), with
 * decision_type ESCALATION_AUTHORIZED on approval and HUMAN_DENIAL on rejection.
 *
 * Version: 1.0 · Session 28 · July 12, 2026
 */

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { validateNotes, APPROVAL_NOTE_MIN_CHARS, type AgentApprovalRequest } from "./approval-contract";
import { TT_ESCALATION_MONITOR_AGENT_ID, type EscalationDecision } from "./tt-escalation-monitor";
import { ttEscalationToApprovalRequest } from "./tt-alert-routing";

/** Minimal logger surface (ctx.logger-compatible; injectable for Node tests). */
export interface GateLogger {
  log: (event: SovereignLogEvent) => void;
}

export type EscalationAuthorizationStatus =
  | "PENDING_AUTHORIZATION"
  | "AUTHORIZED"
  | "REJECTED";

/** One formal escalation case held at the VIGIL gate. */
export interface TTEscalationCase {
  case_id: string;
  decision: EscalationDecision;
  /** The drafted escalation communication awaiting authorization. */
  draft: { subject?: string; body: string };
  /** The approval-queue request this case rides in. */
  approval_request: AgentApprovalRequest;
  authorization: EscalationAuthorizationStatus;
  /** Present once decided. */
  decided_by?: string;
  decision_note?: string;
  workflow_step_id: string;
}

/** The human operator recording the authorization decision. */
export interface GateOperator {
  id: string;
  name: string;
}

/**
 * Open an escalation case at the gate: build the approval-queue request and emit
 * APPROVAL_REQUEST_RECEIVED. The case starts PENDING_AUTHORIZATION — not sendable.
 */
export function openEscalationCase(
  decision: EscalationDecision,
  draft: { subject?: string; body: string },
  referenceId: string,
  submittedAtIso: string,
  logger: GateLogger
): TTEscalationCase {
  const approvalRequest = ttEscalationToApprovalRequest(decision, draft, referenceId, submittedAtIso);
  const wsid = approvalRequest.workflow_step_id;

  logger.log({
    event_type: "APPROVAL_REQUEST_RECEIVED",
    workflow_step_id: wsid,
    sovereign_tier: "standard",
    product: "VIGIL",
    actor_id: TT_ESCALATION_MONITOR_AGENT_ID,
    agent_id: TT_ESCALATION_MONITOR_AGENT_ID,
    outcome: "tt_escalation_pending_authorization",
    payload: {
      request_id: approvalRequest.request_id,
      employee_id: decision.employee_id,
      rule_category: decision.rule_category,
      recurrence_count: decision.recurrence_count,
      communication_type: decision.communication_type,
    },
  });

  return {
    case_id: approvalRequest.request_id,
    decision,
    draft,
    approval_request: approvalRequest,
    authorization: "PENDING_AUTHORIZATION",
    workflow_step_id: wsid,
  };
}

/**
 * THE GATE PREDICATE: a formal escalation communication may be sent if and only if
 * a human authorization has been recorded. False for pending AND rejected cases.
 */
export function isSendable(escalationCase: TTEscalationCase): boolean {
  return escalationCase.authorization === "AUTHORIZED";
}

export type EscalationGateAction = "APPROVE" | "REJECT";

export interface GateDecisionResult {
  ok: boolean;
  case: TTEscalationCase;
  error?: string;
}

/**
 * Record the manager's authorization decision. Approval emits AGENT_ACTION_APPROVED
 * with decision_type ESCALATION_AUTHORIZED (GD-21); rejection emits
 * AGENT_ACTION_REJECTED with decision_type HUMAN_DENIAL. Notes ≥10 chars required
 * for both (an undocumented authorization is as ungoverned as no authorization —
 * spec §4.2 discipline). A failed Logger emit BLOCKS the decision (Gate 2): the
 * case stays PENDING_AUTHORIZATION and the error is surfaced. Pure over its input —
 * returns a new case object; never mutates.
 */
export function recordEscalationAuthorization(
  escalationCase: TTEscalationCase,
  action: EscalationGateAction,
  operator: GateOperator,
  note: string,
  logger: GateLogger
): GateDecisionResult {
  if (escalationCase.authorization !== "PENDING_AUTHORIZATION") {
    return {
      ok: false,
      case: escalationCase,
      error: `case ${escalationCase.case_id} is already ${escalationCase.authorization}`,
    };
  }
  if (!validateNotes(note)) {
    return {
      ok: false,
      case: escalationCase,
      error: `A note of at least ${APPROVAL_NOTE_MIN_CHARS} characters is required to ${action.toLowerCase()} this escalation.`,
    };
  }

  const trimmedNote = note.trim();
  try {
    logger.log({
      event_type: action === "APPROVE" ? "AGENT_ACTION_APPROVED" : "AGENT_ACTION_REJECTED",
      workflow_step_id: escalationCase.workflow_step_id,
      sovereign_tier: "standard",
      product: "VIGIL",
      actor_id: operator.id,
      outcome: action === "APPROVE" ? "tt_escalation_authorized" : "tt_escalation_rejected",
      actor: "human",
      actor_name: operator.name,
      // GD-21 (shell-contract v1.16): the decision type docs/17 §12 defined for a
      // manager authorizing a formal escalation. Rejection is a HUMAN_DENIAL.
      decision_type: action === "APPROVE" ? "ESCALATION_AUTHORIZED" : "HUMAN_DENIAL",
      payload: {
        request_id: escalationCase.approval_request.request_id,
        requesting_agent_id: TT_ESCALATION_MONITOR_AGENT_ID,
        action_type: escalationCase.approval_request.action_type,
        employee_id: escalationCase.decision.employee_id,
        rule_category: escalationCase.decision.rule_category,
        recurrence_count: escalationCase.decision.recurrence_count,
        notes: trimmedNote,
      },
    });
  } catch (err) {
    return {
      ok: false,
      case: escalationCase,
      error: `Logger emission failed — authorization not recorded (CPMI-VRS Gate 2): ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }

  return {
    ok: true,
    case: {
      ...escalationCase,
      authorization: action === "APPROVE" ? "AUTHORIZED" : "REJECTED",
      decided_by: operator.name,
      decision_note: trimmedNote,
    },
  };
}

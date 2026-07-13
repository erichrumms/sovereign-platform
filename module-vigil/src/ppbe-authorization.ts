/**
 * SOVEREIGN Platform — module-vigil
 * ppbe-authorization.ts — the three-tier PPBE authorization architecture
 * (Session 31, D5; docs/18 §6).
 *
 * Tier A — Analysis and Recommendation: NO gate. Advisory outputs are rendered
 *   with the same "AI-generated recommendation" label treatment as COUNSEL.
 * Tier B — Phase Transition Authorization: a PPBE phase transition cannot be
 *   marked complete without a VIGIL Agent Approval Queue decision.
 * Tier C — Resource Commitment Authorization: ObligationRecord creation requires
 *   a VIGIL decision AND a linked COUNSEL Decision Record ID — the decision
 *   action stays inactive until both are present (the useApprovalDecision
 *   pattern, docs/18 §6).
 *
 * Built on the Session 28 tt-escalation-gate pattern: cases ride the existing
 * Agent Approval Queue (AgentApprovalRequest), the gate predicate is structural
 * (no code path to a completed transition / created obligation that bypasses the
 * human decision), and a failed Logger emit BLOCKS the decision (CPMI-VRS Gate 2).
 *
 * LOGGER TAXONOMY NOTE (Session 31 Project Principal decisions #3/#5): the four
 * PPBE_* event types are PYTHON-ONLY — ctx.logger.log() is typed to
 * SovereignEventType, which deliberately does not carry them. This gate therefore
 * emits the EXISTING approved TS events (APPROVAL_REQUEST_RECEIVED on entry,
 * AGENT_ACTION_APPROVED / AGENT_ACTION_REJECTED on decision) with the EXISTING
 * decision types (HUMAN_APPROVAL on approval, HUMAN_DENIAL on rejection — no
 * PPBE-specific HumanDecisionType this session). An AUTHORIZED Tier B case
 * yields a PhaseTransitionRecord carrying the full docs/18 §4 field set
 * (from_phase, to_phase, data_quality_assessment, integration_readiness_check,
 * approving_human) ready for the Python-side PPBE_PHASE_TRANSITION emitter.
 */

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import type { ObligationRecord } from "@sovereign/data";
import { validateObligationRecord } from "@sovereign/data";
import {
  computeExpiresAt,
  validateNotes,
  APPROVAL_NOTE_MIN_CHARS,
  type AgentApprovalRequest,
} from "./approval-contract";

/** Minimal logger surface (ctx.logger-compatible; injectable for Node tests). */
export interface PPBEGateLogger {
  log: (event: SovereignLogEvent) => void;
}

/** The human operator recording an authorization decision. */
export interface PPBEGateOperator {
  id: string;
  name: string;
}

// ============================================================
// THE THREE TIERS (docs/18 §6)
// ============================================================

export type PPBEAuthorizationTier = "A" | "B" | "C";

/** The kinds of PPBE action the tier architecture classifies. */
export type PPBEActionKind =
  | "analysis"          // synthesizer / scenario outputs — advisory
  | "recommendation"    // advisory recommendation surfaced to a human
  | "phase_transition"  // one phase handing off to the next
  | "obligation"        // a resource commitment
  | "reprogramming";    // a resource reallocation

/** Tier A advisory label — same visual treatment as COUNSEL's advisory outputs. */
export const PPBE_TIER_A_LABEL = "AI-generated recommendation — a human decides";

/** Classify an action into its authorization tier (docs/18 §6). Deterministic. */
export function tierForPPBEAction(kind: PPBEActionKind): PPBEAuthorizationTier {
  switch (kind) {
    case "analysis":
    case "recommendation":
      return "A";
    case "phase_transition":
      return "B";
    case "obligation":
    case "reprogramming":
      return "C";
  }
}

// ============================================================
// TIER B — PHASE TRANSITION AUTHORIZATION
// ============================================================

export type PPBEGateStatus = "PENDING_AUTHORIZATION" | "AUTHORIZED" | "REJECTED";

/**
 * The docs/18 §4 PPBE_PHASE_TRANSITION field set. Produced only by an AUTHORIZED
 * Tier B case — this record is what the Python-side emitter logs.
 */
export interface PhaseTransitionRecord {
  from_phase: number;
  to_phase: number;
  /** Plain prose (Gap 5). */
  data_quality_assessment: string;
  /** Plain prose (Gap 5). */
  integration_readiness_check: string;
  approving_human: string;
  workflow_step_id: string;
}

/** One phase transition held at the VIGIL gate. */
export interface PPBEPhaseTransitionCase {
  case_id: string;
  from_phase: number;
  to_phase: number;
  data_quality_assessment: string;
  integration_readiness_check: string;
  /** The approval-queue request this case rides in. */
  approval_request: AgentApprovalRequest;
  authorization: PPBEGateStatus;
  decided_by?: string;
  decision_note?: string;
  /** Present only when AUTHORIZED — the Python-side emission payload. */
  transition_record?: PhaseTransitionRecord;
  workflow_step_id: string;
}

/**
 * The six-phase closed loop admits exactly two shapes of transition: forward one
 * phase (N → N+1) or the loop-closing 6 → 1 (Phase 6 feeds back into Phase 1).
 */
export function isValidPhaseTransition(from: number, to: number): boolean {
  const inRange = (p: number) => Number.isInteger(p) && p >= 1 && p <= 6;
  if (!inRange(from) || !inRange(to)) return false;
  return to === from + 1 || (from === 6 && to === 1);
}

export function phaseTransitionWorkflowStep(from: number, to: number): string {
  return `ppbe-phase-transition-${from}-to-${to}`;
}

/**
 * Open a Tier B case at the gate: build the approval-queue request and emit
 * APPROVAL_REQUEST_RECEIVED. Returns null for an ill-formed transition —
 * an impossible handoff never enters the queue.
 */
export function openPhaseTransitionGate(
  input: {
    from_phase: number;
    to_phase: number;
    data_quality_assessment: string;
    integration_readiness_check: string;
    /** The registered agent whose readiness check accompanies the handoff. */
    requested_by_agent_id: string;
  },
  submittedAtIso: string,
  logger: PPBEGateLogger
): PPBEPhaseTransitionCase | null {
  if (!isValidPhaseTransition(input.from_phase, input.to_phase)) return null;
  if (
    input.data_quality_assessment.trim() === "" ||
    input.integration_readiness_check.trim() === ""
  ) {
    return null;
  }

  const wsid = phaseTransitionWorkflowStep(input.from_phase, input.to_phase);
  const request: AgentApprovalRequest = {
    request_id: `PPBE-PT-${input.from_phase}-${input.to_phase}`,
    requesting_agent_id: input.requested_by_agent_id,
    requesting_agent_class: "Monitoring",
    action_type: "ppbe_phase_transition",
    action_detail: {
      from_phase: input.from_phase,
      to_phase: input.to_phase,
      data_quality_assessment: input.data_quality_assessment,
      integration_readiness_check: input.integration_readiness_check,
    },
    risk_classification: "P2",
    submitted_at: submittedAtIso,
    expires_at: computeExpiresAt(submittedAtIso, "P2"),
    workflow_step_id: wsid,
  };

  logger.log({
    event_type: "APPROVAL_REQUEST_RECEIVED",
    workflow_step_id: wsid,
    sovereign_tier: "standard",
    product: "VIGIL",
    actor_id: input.requested_by_agent_id,
    agent_id: input.requested_by_agent_id,
    outcome: "ppbe_phase_transition_pending_authorization",
    payload: { ...request.action_detail, request_id: request.request_id },
  });

  return {
    case_id: request.request_id,
    from_phase: input.from_phase,
    to_phase: input.to_phase,
    data_quality_assessment: input.data_quality_assessment,
    integration_readiness_check: input.integration_readiness_check,
    approval_request: request,
    authorization: "PENDING_AUTHORIZATION",
    workflow_step_id: wsid,
  };
}

/**
 * THE TIER B GATE PREDICATE (docs/18 §6): a PPBE phase transition may be marked
 * complete if and only if a human authorization has been recorded.
 */
export function isPhaseTransitionComplete(gateCase: PPBEPhaseTransitionCase): boolean {
  return gateCase.authorization === "AUTHORIZED";
}

export type PPBEGateAction = "APPROVE" | "REJECT";

export interface PPBEGateDecisionResult {
  ok: boolean;
  case: PPBEPhaseTransitionCase;
  error?: string;
}

/**
 * Record the human's Tier B decision. Approval emits AGENT_ACTION_APPROVED with
 * decision_type HUMAN_APPROVAL; rejection emits AGENT_ACTION_REJECTED with
 * HUMAN_DENIAL. Notes ≥10 chars required for both. A failed Logger emit BLOCKS
 * the decision. Pure over its input — returns a new case; never mutates.
 */
export function recordPhaseTransitionDecision(
  gateCase: PPBEPhaseTransitionCase,
  action: PPBEGateAction,
  operator: PPBEGateOperator,
  note: string,
  logger: PPBEGateLogger
): PPBEGateDecisionResult {
  if (gateCase.authorization !== "PENDING_AUTHORIZATION") {
    return {
      ok: false,
      case: gateCase,
      error: `case ${gateCase.case_id} is already ${gateCase.authorization}`,
    };
  }
  if (!validateNotes(note)) {
    return {
      ok: false,
      case: gateCase,
      error: `A note of at least ${APPROVAL_NOTE_MIN_CHARS} characters is required to ${action.toLowerCase()} this phase transition.`,
    };
  }

  const trimmedNote = note.trim();
  try {
    logger.log({
      event_type: action === "APPROVE" ? "AGENT_ACTION_APPROVED" : "AGENT_ACTION_REJECTED",
      workflow_step_id: gateCase.workflow_step_id,
      sovereign_tier: "standard",
      product: "VIGIL",
      actor_id: operator.id,
      outcome:
        action === "APPROVE" ? "ppbe_phase_transition_authorized" : "ppbe_phase_transition_rejected",
      actor: "human",
      actor_name: operator.name,
      // Session 31 Project Principal decision #5: reuse the existing members —
      // no PPBE-specific HumanDecisionType this session.
      decision_type: action === "APPROVE" ? "HUMAN_APPROVAL" : "HUMAN_DENIAL",
      payload: {
        request_id: gateCase.approval_request.request_id,
        from_phase: gateCase.from_phase,
        to_phase: gateCase.to_phase,
        notes: trimmedNote,
      },
    });
  } catch (err) {
    return {
      ok: false,
      case: gateCase,
      error: `Logger emission failed — authorization not recorded (CPMI-VRS Gate 2): ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }

  const decided: PPBEPhaseTransitionCase = {
    ...gateCase,
    authorization: action === "APPROVE" ? "AUTHORIZED" : "REJECTED",
    decided_by: operator.name,
    decision_note: trimmedNote,
  };
  if (action === "APPROVE") {
    decided.transition_record = {
      from_phase: gateCase.from_phase,
      to_phase: gateCase.to_phase,
      data_quality_assessment: gateCase.data_quality_assessment,
      integration_readiness_check: gateCase.integration_readiness_check,
      approving_human: operator.name,
      workflow_step_id: gateCase.workflow_step_id,
    };
  }
  return { ok: true, case: decided };
}

// ============================================================
// TIER C — RESOURCE COMMITMENT AUTHORIZATION
// ============================================================

/** An obligation awaiting authorization — everything but the authorizing human. */
export type ObligationDraft = Omit<ObligationRecord, "authorizing_official">;

/** One resource commitment held at the VIGIL gate. */
export interface PPBEObligationCase {
  case_id: string;
  draft: ObligationDraft;
  approval_request: AgentApprovalRequest;
  authorization: PPBEGateStatus;
  decided_by?: string;
  decision_note?: string;
  /** Required for authorization (docs/18 §6 Tier C) — recorded at decision time. */
  counsel_decision_record_id?: string;
  /** Present only when AUTHORIZED — the validated, creatable ObligationRecord. */
  authorized_record?: ObligationRecord;
  workflow_step_id: string;
}

/**
 * THE TIER C SUBMIT PREDICATE (the useApprovalDecision pattern): the decision
 * action stays inactive until BOTH the note and the linked COUNSEL Decision
 * Record ID are present.
 */
export function canSubmitObligationDecision(
  note: string,
  counselDecisionRecordId: string
): boolean {
  return validateNotes(note) && counselDecisionRecordId.trim() !== "";
}

/**
 * Open a Tier C case at the gate: emit APPROVAL_REQUEST_RECEIVED and hold the
 * obligation draft. Returns null when the draft is structurally broken (fails
 * every field check except the authorizing_official the gate itself supplies).
 */
export function openObligationGate(
  draft: ObligationDraft,
  requestedByAgentId: string,
  submittedAtIso: string,
  logger: PPBEGateLogger
): PPBEObligationCase | null {
  // Validate the draft AS IF authorized — the only permitted gap is the official.
  const probe = validateObligationRecord({ ...draft, authorizing_official: "pending" });
  if (!probe.valid) return null;

  const wsid = draft.workflow_step_id;
  const request: AgentApprovalRequest = {
    request_id: `PPBE-OB-${draft.obligation_id}`,
    requesting_agent_id: requestedByAgentId,
    requesting_agent_class: "Monitoring",
    action_type: "ppbe_obligation",
    action_detail: {
      obligation_id: draft.obligation_id,
      program_id: draft.program_id,
      cost_code: draft.cost_code,
      amount: draft.amount,
    },
    risk_classification: "P1",
    submitted_at: submittedAtIso,
    expires_at: computeExpiresAt(submittedAtIso, "P1"),
    workflow_step_id: wsid,
  };

  logger.log({
    event_type: "APPROVAL_REQUEST_RECEIVED",
    workflow_step_id: wsid,
    sovereign_tier: "standard",
    product: "VIGIL",
    actor_id: requestedByAgentId,
    agent_id: requestedByAgentId,
    outcome: "ppbe_obligation_pending_authorization",
    payload: { ...request.action_detail, request_id: request.request_id },
  });

  return {
    case_id: request.request_id,
    draft,
    approval_request: request,
    authorization: "PENDING_AUTHORIZATION",
    workflow_step_id: wsid,
  };
}

export interface PPBEObligationDecisionResult {
  ok: boolean;
  case: PPBEObligationCase;
  error?: string;
}

/**
 * Record the human's Tier C decision. Authorization REQUIRES a linked COUNSEL
 * Decision Record ID in addition to the note (docs/18 §6) — without it the
 * action is inactive, exactly as the decision_type requirement is enforced in
 * useApprovalDecision. Approval yields the validated ObligationRecord with the
 * operator recorded as authorizing_official.
 */
export function recordObligationAuthorization(
  gateCase: PPBEObligationCase,
  action: PPBEGateAction,
  operator: PPBEGateOperator,
  note: string,
  counselDecisionRecordId: string,
  logger: PPBEGateLogger
): PPBEObligationDecisionResult {
  if (gateCase.authorization !== "PENDING_AUTHORIZATION") {
    return {
      ok: false,
      case: gateCase,
      error: `case ${gateCase.case_id} is already ${gateCase.authorization}`,
    };
  }
  if (action === "APPROVE" && !canSubmitObligationDecision(note, counselDecisionRecordId)) {
    return {
      ok: false,
      case: gateCase,
      error:
        "Authorization requires both a decision note (at least " +
        `${APPROVAL_NOTE_MIN_CHARS} characters) and a linked COUNSEL Decision Record ID.`,
    };
  }
  if (action === "REJECT" && !validateNotes(note)) {
    return {
      ok: false,
      case: gateCase,
      error: `A note of at least ${APPROVAL_NOTE_MIN_CHARS} characters is required to reject this obligation.`,
    };
  }

  const trimmedNote = note.trim();
  try {
    logger.log({
      event_type: action === "APPROVE" ? "AGENT_ACTION_APPROVED" : "AGENT_ACTION_REJECTED",
      workflow_step_id: gateCase.workflow_step_id,
      sovereign_tier: "standard",
      product: "VIGIL",
      actor_id: operator.id,
      outcome: action === "APPROVE" ? "ppbe_obligation_authorized" : "ppbe_obligation_rejected",
      actor: "human",
      actor_name: operator.name,
      decision_type: action === "APPROVE" ? "HUMAN_APPROVAL" : "HUMAN_DENIAL",
      payload: {
        request_id: gateCase.approval_request.request_id,
        obligation_id: gateCase.draft.obligation_id,
        program_id: gateCase.draft.program_id,
        amount: gateCase.draft.amount,
        counsel_decision_record_id: action === "APPROVE" ? counselDecisionRecordId.trim() : undefined,
        notes: trimmedNote,
      },
    });
  } catch (err) {
    return {
      ok: false,
      case: gateCase,
      error: `Logger emission failed — authorization not recorded (CPMI-VRS Gate 2): ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }

  const decided: PPBEObligationCase = {
    ...gateCase,
    authorization: action === "APPROVE" ? "AUTHORIZED" : "REJECTED",
    decided_by: operator.name,
    decision_note: trimmedNote,
  };
  if (action === "APPROVE") {
    decided.counsel_decision_record_id = counselDecisionRecordId.trim();
    decided.authorized_record = { ...gateCase.draft, authorizing_official: operator.name };
  }
  return { ok: true, case: decided };
}

/** THE TIER C GATE PREDICATE: an ObligationRecord exists only from an AUTHORIZED case. */
export function isObligationCreatable(gateCase: PPBEObligationCase): boolean {
  return gateCase.authorization === "AUTHORIZED" && gateCase.authorized_record !== undefined;
}

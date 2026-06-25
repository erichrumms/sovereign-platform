/**
 * SOVEREIGN Platform — module-nexus
 * request-registry.ts — the work-request lifecycle state machine (pure, no React).
 *
 * Pure functions over an immutable WorkRequest[]. Each transition validates against
 * ALLOWED_TRANSITIONS (nexus-contract) and returns a NEW array; an illegal transition
 * throws RequestTransitionError and never mutates. The hook (useRequestRegistry) wires
 * Logger emission (Gate-2 fail-closed), the GD-10 intake check, and the AgentOS port.
 *
 * Version: 1.0 · Session 15 · June 24, 2026
 */

import {
  type WorkRequest,
  type WorkRequestStatus,
  type SubmitRequestInput,
  canTransition,
  requestWorkflowStep,
} from "./nexus-contract";
import type { RoutingDecision } from "./request-router";

/** Thrown when a request transition is not allowed by the lifecycle state machine. */
export class RequestTransitionError extends Error {
  constructor(
    public readonly requestId: string,
    public readonly from: WorkRequestStatus,
    public readonly to: WorkRequestStatus
  ) {
    super(`Illegal NEXUS request transition for ${requestId}: ${from} -> ${to}`);
    this.name = "RequestTransitionError";
  }
}

/** Thrown when an operation references a request id the registry does not hold. */
export class RequestNotFoundError extends Error {
  constructor(public readonly requestId: string) {
    super(`NEXUS request not found: ${requestId}`);
    this.name = "RequestNotFoundError";
  }
}

/** Create a new request in the SUBMITTED state, anchored to `nowIso`. */
export function createRequest(input: SubmitRequestInput, nowIso: string): WorkRequest {
  return {
    request_id: input.request_id,
    title: input.title,
    description: input.description,
    request_type: input.request_type,
    status: "SUBMITTED",
    data_classification: input.data_classification,
    requester_id: input.requester_id,
    created_at: nowIso,
    updated_at: nowIso,
    workflow_step_id: requestWorkflowStep(input.request_id),
  };
}

export function getRequest(requests: readonly WorkRequest[], requestId: string): WorkRequest | undefined {
  return requests.find((r) => r.request_id === requestId);
}

function requireRequest(requests: readonly WorkRequest[], requestId: string): WorkRequest {
  const request = getRequest(requests, requestId);
  if (!request) throw new RequestNotFoundError(requestId);
  return request;
}

/**
 * Apply a transition to `requestId`, returning a NEW array. Validates the transition
 * (RequestTransitionError if illegal), stamps updated_at, applies an optional partial patch.
 * Pure — the input array is never mutated.
 */
export function transition(
  requests: readonly WorkRequest[],
  requestId: string,
  to: WorkRequestStatus,
  nowIso: string,
  patch: Partial<WorkRequest> = {}
): WorkRequest[] {
  const current = requireRequest(requests, requestId);
  if (!canTransition(current.status, to)) {
    throw new RequestTransitionError(requestId, current.status, to);
  }
  return requests.map((r) =>
    r.request_id === requestId ? { ...r, ...patch, status: to, updated_at: nowIso } : r
  );
}

// ---- Named convenience transitions (each is the single source for its target status) ----

/** SUBMITTED → ROUTED, recording the router's agent class + approval requirement. */
export function markRouted(requests: readonly WorkRequest[], requestId: string, decision: RoutingDecision, nowIso: string): WorkRequest[] {
  return transition(requests, requestId, "ROUTED", nowIso, {
    assigned_agent_class: decision.agent_class,
    requires_approval: decision.requires_approval,
  });
}

/** ROUTED → PENDING_APPROVAL (the routed type requires human authorization). */
export function markPendingApproval(requests: readonly WorkRequest[], requestId: string, nowIso: string): WorkRequest[] {
  return transition(requests, requestId, "PENDING_APPROVAL", nowIso);
}

/** ROUTED → IN_PROGRESS (no approval) or PENDING_APPROVAL → IN_PROGRESS (approved), recording the AgentOS task id. */
export function markInProgress(requests: readonly WorkRequest[], requestId: string, agentosTaskId: string, nowIso: string): WorkRequest[] {
  return transition(requests, requestId, "IN_PROGRESS", nowIso, { agentos_task_id: agentosTaskId });
}

/** PENDING_APPROVAL → REJECTED (VIGIL rejection, routed via AgentOS). */
export function markRejected(requests: readonly WorkRequest[], requestId: string, nowIso: string): WorkRequest[] {
  return transition(requests, requestId, "REJECTED", nowIso);
}

/** IN_PROGRESS → COMPLETE (AgentOS reports completion). */
export function markComplete(requests: readonly WorkRequest[], requestId: string, nowIso: string): WorkRequest[] {
  return transition(requests, requestId, "COMPLETE", nowIso);
}

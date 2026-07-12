/**
 * SOVEREIGN Platform — module-nexus
 * tt-travel-queue.ts — Time & Travel travel-request pipeline wiring (Session 28, D3).
 *
 * Connects the Session 27 deterministic scaffolds (tt.travel-compliance-engine +
 * tt.travel-router) into the live NEXUS pipeline with governed Logger emission.
 * The engines themselves stay pure — emission lives HERE, at the integration
 * layer, so evaluation remains a pure function of its inputs.
 *
 * Logger emission (all APPROVED taxonomy — the TT_* event types are Python-only
 * per docs/17 §12 and are NOT emitted from the TypeScript layer; reconciliation
 * documented in the Session 28 handoff):
 *   - AGENT_STEP_START / AGENT_STEP_COMPLETE bracket each deterministic agent step
 *     (tt.travel-compliance-engine — Governance; tt.travel-router — Operational),
 *     with agent_id/agent_class per the Agent Identity Standard.
 *   - HUMAN_DECISION with decision_type TRAVEL_APPROVAL (GD-21, shell-contract
 *     v1.16) records the manager's decision on a routed request — ONE decision
 *     type for the act, the outcome carried in payload + status (see the v1.16
 *     changelog naming note distinguishing this from the v1.0 TRAVEL_APPROVED/
 *     DENIED/ESCALATED outcome members).
 * Every event carries workflow_step_id (Standing Constraint #6): one id per
 * request ties the whole lifecycle together — `tt-travel-<request_id>`.
 *
 * THE SYSTEM PREPARES; THE HUMAN DECIDES (docs/17 §1): processTravelSubmission
 * evaluates and routes only. No status ever becomes APPROVED/DENIED/ESCALATED
 * except through recordTravelDecision with a human actor.
 *
 * Version: 1.0 · Session 28 · July 12, 2026
 */

import type { TravelRequest, TravelPolicy } from "@sovereign/data";
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";

import {
  evaluateTravelRequest,
  TT_TRAVEL_COMPLIANCE_ENGINE_AGENT_ID,
  type TravelComplianceFinding,
  type TravelEvaluationContext,
} from "./tt-travel-compliance-engine";
import {
  routeTravelRequest,
  TT_TRAVEL_ROUTER_AGENT_ID,
  type TravelRoutingResult,
} from "./tt-travel-router";

/** Minimal logger surface (ctx.logger-compatible; injectable for Node tests). */
export interface QueueLogger {
  log: (event: SovereignLogEvent) => void;
}

/** Per-request workflow step id — every Logger event for a request shares it. */
export function travelWorkflowStep(requestId: string): string {
  return `tt-travel-${requestId}`;
}

export interface ProcessedTravelSubmission {
  finding: TravelComplianceFinding;
  routing: TravelRoutingResult;
  workflow_step_id: string;
}

/**
 * Evaluate and route one submitted travel request, emitting the governed audit
 * trail for both deterministic agent steps. Returns the finding + routing result;
 * the returned request is ROUTED and awaiting a human decision.
 */
export function processTravelSubmission(
  request: TravelRequest,
  policy: TravelPolicy,
  logger: QueueLogger,
  actorId: string,
  evaluationContext: TravelEvaluationContext = {}
): ProcessedTravelSubmission {
  const wsid = travelWorkflowStep(request.request_id);

  // --- tt.travel-compliance-engine (Governance, deterministic) ---
  logger.log({
    event_type: "AGENT_STEP_START",
    workflow_step_id: wsid,
    sovereign_tier: "standard",
    product: "NEXUS",
    actor_id: actorId,
    agent_id: TT_TRAVEL_COMPLIANCE_ENGINE_AGENT_ID,
    agent_class: "Governance",
    outcome: "travel_compliance_evaluation_started",
    payload: { request_id: request.request_id, policy_id: policy.policy_id },
  });

  const finding = evaluateTravelRequest(request, policy, evaluationContext);

  logger.log({
    event_type: "AGENT_STEP_COMPLETE",
    workflow_step_id: wsid,
    sovereign_tier: "standard",
    product: "NEXUS",
    actor_id: actorId,
    agent_id: TT_TRAVEL_COMPLIANCE_ENGINE_AGENT_ID,
    agent_class: "Governance",
    outcome: `travel_compliance_${finding.routing_tier.toLowerCase()}`,
    payload: {
      request_id: request.request_id,
      routing_tier: finding.routing_tier,
      required_authority: finding.required_authority,
      hard_exceptions: finding.hard_exceptions,
      soft_flags: finding.soft_flags,
      finding_count: finding.findings.length,
      lead_time_days: finding.lead_time_days,
    },
  });

  // --- tt.travel-router (Operational, deterministic) ---
  logger.log({
    event_type: "AGENT_STEP_START",
    workflow_step_id: wsid,
    sovereign_tier: "standard",
    product: "NEXUS",
    actor_id: actorId,
    agent_id: TT_TRAVEL_ROUTER_AGENT_ID,
    agent_class: "Operational",
    outcome: "travel_routing_started",
    payload: { request_id: request.request_id, routing_tier: finding.routing_tier },
  });

  const routing = routeTravelRequest(request, finding);

  logger.log({
    event_type: "AGENT_STEP_COMPLETE",
    workflow_step_id: wsid,
    sovereign_tier: "standard",
    product: "NEXUS",
    actor_id: actorId,
    agent_id: TT_TRAVEL_ROUTER_AGENT_ID,
    agent_class: "Operational",
    outcome: "travel_routed",
    payload: {
      request_id: request.request_id,
      assigned_authority: routing.assigned_authority,
      routing_basis: routing.routing_basis,
    },
  });

  return { finding, routing, workflow_step_id: wsid };
}

/** The three outcomes a manager may record on a routed request (docs/17 §5.3/§5.4). */
export type TravelDecisionOutcome = "APPROVED" | "DENIED" | "ESCALATED";

/** The human manager recording the decision. */
export interface TravelDecider {
  id: string;
  name: string;
}

export interface TravelDecisionResult {
  request: TravelRequest;
}

/**
 * Record the manager's decision on a routed travel request — the ONLY path by
 * which a request becomes APPROVED / DENIED / ESCALATED. Emits HUMAN_DECISION
 * with decision_type TRAVEL_APPROVAL (GD-21), actor "human". Throws (recording
 * nothing) if the request has not been routed: deciding an unevaluated request
 * would bypass the compliance engine.
 */
export function recordTravelDecision(
  request: TravelRequest,
  outcome: TravelDecisionOutcome,
  decider: TravelDecider,
  note: string,
  logger: QueueLogger
): TravelDecisionResult {
  if (request.status !== "ROUTED") {
    throw new Error(
      `recordTravelDecision: request ${request.request_id} is ${request.status}, not ROUTED — ` +
        "a decision may only be recorded on a routed request (docs/17 §5.3)"
    );
  }

  const wsid = travelWorkflowStep(request.request_id);
  logger.log({
    event_type: "HUMAN_DECISION",
    workflow_step_id: wsid,
    sovereign_tier: "standard",
    product: "NEXUS",
    actor_id: decider.id,
    outcome: `travel_${outcome.toLowerCase()}`,
    actor: "human",
    actor_name: decider.name,
    decision_type: "TRAVEL_APPROVAL", // GD-21 — the decision ACT; outcome in payload/status
    payload: {
      request_id: request.request_id,
      decision_outcome: outcome,
      routing_tier: request.routing_tier ?? null,
      assigned_authority: request.assigned_authority ?? null,
      note,
    },
  });

  return { request: { ...request, status: outcome } };
}

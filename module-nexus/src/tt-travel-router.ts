/**
 * SOVEREIGN Platform — module-nexus
 * tt-travel-router.ts — Time & Travel workflow layer, Session 27 scaffold.
 *
 * tt.travel-router (Operational, deterministic — Agent Identity Standard, D-TT5).
 * Routes travel requests to the correct approval authority based on the compliance
 * engine's output, updating the TravelRequest status and authority assignment.
 * Wrong-authority routing is structurally prevented: the router CANNOT route to an
 * authority level below what the compliance engine specifies (docs/17 / AIS scope
 * constraint). It routes only — it does not approve, deny, or communicate.
 */

import type { TravelRequest, TravelApprovalAuthority } from "@sovereign/data";
import type { TravelComplianceFinding } from "./tt-travel-compliance-engine";

export const TT_TRAVEL_ROUTER_AGENT_ID = "tt.travel-router";

const AUTHORITY_RANK: Record<TravelApprovalAuthority, number> = {
  MANAGER: 0,
  DIRECTOR: 1,
  EXECUTIVE: 2,
};

/** One routing action, ready for the Logger (TT_TRAVEL_ROUTED) and the authority queue. */
export interface TravelRoutingResult {
  request: TravelRequest;
  /** The queue the request was assigned to. */
  assigned_authority: TravelApprovalAuthority;
  /** The rule basis carried into the TT_TRAVEL_ROUTED Logger event. */
  routing_basis: string;
}

/**
 * Structurally-safe authority resolution: an override may raise the authority level
 * (e.g. a manager routing upward for awareness) but NEVER lower it below the engine's
 * requirement. Throws rather than silently correcting — a below-requirement override
 * is a caller bug, not a routable state.
 */
export function resolveAuthority(
  required: TravelApprovalAuthority,
  override?: TravelApprovalAuthority
): TravelApprovalAuthority {
  if (override === undefined) return required;
  if (AUTHORITY_RANK[override] < AUTHORITY_RANK[required]) {
    throw new Error(
      `tt.travel-router: cannot route to ${override} — compliance engine requires ${required} or higher`
    );
  }
  return override;
}

/**
 * Execute the routing decision for an evaluated request. Deterministic: the output
 * is a pure function of the request, the engine finding, and the optional upward
 * override. The returned request carries status ROUTED, the engine's routing tier,
 * and the assigned authority.
 */
export function routeTravelRequest(
  request: TravelRequest,
  finding: TravelComplianceFinding,
  overrideAuthority?: TravelApprovalAuthority
): TravelRoutingResult {
  if (finding.request_id !== request.request_id) {
    throw new Error(
      `tt.travel-router: finding ${finding.request_id} does not match request ${request.request_id}`
    );
  }
  const assigned = resolveAuthority(finding.required_authority, overrideAuthority);
  const basis =
    finding.hard_exceptions.length > 0
      ? `hard exception(s): ${finding.hard_exceptions.join(", ")}`
      : `cost-based routing: total ${request.total_cost} -> ${assigned}`;

  return {
    request: {
      ...request,
      status: "ROUTED",
      routing_tier: finding.routing_tier,
      assigned_authority: assigned,
    },
    assigned_authority: assigned,
    routing_basis: basis,
  };
}

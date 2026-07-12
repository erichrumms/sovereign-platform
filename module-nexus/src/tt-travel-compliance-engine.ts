/**
 * SOVEREIGN Platform — module-nexus
 * tt-travel-compliance-engine.ts — Time & Travel workflow layer, Session 27 scaffold.
 *
 * tt.travel-compliance-engine (Governance, deterministic — Agent Identity Standard,
 * D-TT5). Runs on NEXUS/FLOWPATH infrastructure per docs/17 §2 — Time & Travel is a
 * workflow layer with NO new module directory, so the engine lives here, the same
 * pattern as aria.rules-engine living in module-aria.
 *
 * Evaluates a TravelRequest against the active TravelPolicy (docs/17 §5.2/§5.3) and
 * produces one of three routing recommendations — STANDARD, FLAGGED, ESCALATE — with
 * a complete compliance finding citing the exact rule triggered, the actual value,
 * and the threshold exceeded. Same input always produces same output: NO LLM call,
 * NO sovereign-api-client, no wall-clock reads (lead time is computed from the
 * request's own submitted_at, so evaluation is a pure function of its inputs).
 *
 * The engine evaluates and routes ONLY. It does not approve, deny, or communicate —
 * every consequential action is a human decision in NEXUS/VIGIL (docs/17 §1).
 */

import type {
  TravelRequest,
  TravelPolicy,
  TravelRoutingTier,
  TravelApprovalAuthority,
  ComplianceFlag,
} from "@sovereign/data";

export const TT_TRAVEL_COMPLIANCE_ENGINE_AGENT_ID = "tt.travel-compliance-engine";

/** Optional evaluation context beyond the request/policy pair (docs/17 §4 budget proximity). */
export interface TravelEvaluationContext {
  /** Percent (0–100) of the funding account's budget already used, when known. */
  budget_used_percent?: number;
}

/** The complete, auditable output of one evaluation (docs/17 §5.3). */
export interface TravelComplianceFinding {
  request_id: string;
  routing_tier: TravelRoutingTier;
  /** The minimum authority level that may decide this request. */
  required_authority: TravelApprovalAuthority;
  /** Every hard exception triggered, in evaluation order. */
  hard_exceptions: string[];
  /** Every soft flag raised, in evaluation order. */
  soft_flags: string[];
  /** Structured findings — one ComplianceFlag (source TRAVEL) per rule triggered. */
  findings: ComplianceFlag[];
  /** Whole days between submission date and travel start (docs/17 §5.2 lead-time bands). */
  lead_time_days: number;
}

const MS_PER_DAY = 86_400_000;

/** Whole days from the submission date to the travel start date (floored, min 0). */
export function computeLeadTimeDays(request: TravelRequest): number {
  const submitted = request.submitted_at ?? request.travel_start_date;
  const start = Date.parse(request.travel_start_date);
  const sub = Date.parse(submitted);
  if (Number.isNaN(start) || Number.isNaN(sub)) return 0;
  return Math.max(0, Math.floor((start - sub) / MS_PER_DAY));
}

/** Cost-based authority routing per docs/17 §4 — ascending thresholds, executive above director. */
export function requiredAuthorityForCost(
  totalCost: number,
  policy: TravelPolicy
): TravelApprovalAuthority {
  if (totalCost <= policy.routing_thresholds.manager_threshold) return "MANAGER";
  if (totalCost <= policy.routing_thresholds.director_threshold) return "DIRECTOR";
  return "EXECUTIVE";
}

let findingSequence = 0;

function travelFlag(
  request: TravelRequest,
  rule_category: ComplianceFlag["rule_category"],
  severity: ComplianceFlag["severity"],
  rule_citation: string,
  actual_value: string,
  threshold_value: string
): ComplianceFlag {
  findingSequence += 1;
  return {
    flag_id: `${request.request_id}-F${findingSequence}`,
    source: "TRAVEL",
    record_ref: request.request_id,
    employee_id: request.employee_id,
    rule_category,
    severity,
    rule_citation,
    actual_value,
    threshold_value,
    recurrence_count: 1,
    raised_at: request.submitted_at ?? request.travel_start_date,
    status: "OPEN",
  };
}

/**
 * Evaluate a travel request against the active policy. Pure and deterministic:
 * hard exceptions first (they override cost-based routing regardless of dollar
 * amount — docs/17 §4), then cost thresholds, then soft flags.
 */
export function evaluateTravelRequest(
  request: TravelRequest,
  policy: TravelPolicy,
  context: TravelEvaluationContext = {}
): TravelComplianceFinding {
  findingSequence = 0;
  const hard: string[] = [];
  const soft: string[] = [];
  const findings: ComplianceFlag[] = [];
  const cite = (rule: string) => `TravelPolicy ${policy.policy_id} — ${rule}`;

  // --- Hard exception rules (docs/17 §4) ---
  if (policy.hard_exceptions.personal_day_escalates && request.personal_day_included) {
    hard.push("personal_day_included");
    findings.push(
      travelFlag(request, "TRAVEL_HARD_EXCEPTION", "ERROR", cite("personal day inclusion"),
        "personal_day_included: true", "hard exception — escalate regardless of cost")
    );
  }
  if (policy.hard_exceptions.international_escalates && request.international) {
    hard.push("international_destination");
    findings.push(
      travelFlag(request, "TRAVEL_HARD_EXCEPTION", "ERROR", cite("international destination"),
        `destination: ${request.destination}`, "hard exception — escalate regardless of cost")
    );
  }
  if (
    request.special_authority_category !== undefined &&
    policy.hard_exceptions.special_authority_categories.includes(request.special_authority_category)
  ) {
    hard.push("special_authority_category");
    findings.push(
      travelFlag(request, "TRAVEL_HARD_EXCEPTION", "ERROR", cite("special authority travel category"),
        `special_authority_category: ${request.special_authority_category}`,
        "hard exception — escalate regardless of cost")
    );
  }

  // --- Cost-based routing (docs/17 §4) ---
  const required_authority = requiredAuthorityForCost(request.total_cost, policy);
  const exceedsManagerLevel = required_authority !== "MANAGER";
  if (exceedsManagerLevel) {
    findings.push(
      travelFlag(request, "TRAVEL_ROUTING_THRESHOLD", "WARNING", cite("cost-based routing threshold"),
        `total_cost: ${request.total_cost}`,
        `manager-level threshold: ${policy.routing_thresholds.manager_threshold}`)
    );
  }

  // --- Soft flags (docs/17 §4 / §5.2) — awareness only, never escalate authority ---
  const lead_time_days = computeLeadTimeDays(request);
  if (lead_time_days < policy.soft_flags.advance_booking_standard_days) {
    const critical = lead_time_days * 24 < policy.soft_flags.advance_booking_critical_hours;
    const label = critical
      ? "advance_booking_critical"
      : lead_time_days < policy.soft_flags.advance_booking_short_notice_days
        ? "advance_booking_short_notice"
        : "advance_booking_reduced";
    soft.push(label);
    findings.push(
      travelFlag(request, "TRAVEL_SOFT_FLAG", "WARNING", cite("advance booking window"),
        `lead time: ${lead_time_days} days`,
        `standard window: ${policy.soft_flags.advance_booking_standard_days}+ days`)
    );
  }
  if (request.costs.registration_fees >= policy.soft_flags.conference_fee_threshold && request.costs.registration_fees > 0) {
    soft.push("conference_fee");
    findings.push(
      travelFlag(request, "TRAVEL_SOFT_FLAG", "WARNING", cite("conference or training fee threshold"),
        `registration_fees: ${request.costs.registration_fees}`,
        `threshold: ${policy.soft_flags.conference_fee_threshold}`)
    );
  }
  if (
    context.budget_used_percent !== undefined &&
    context.budget_used_percent >= policy.soft_flags.budget_proximity_percent
  ) {
    soft.push("budget_proximity");
    findings.push(
      travelFlag(request, "TRAVEL_SOFT_FLAG", "WARNING", cite("budget proximity percentage"),
        `budget used: ${context.budget_used_percent}%`,
        `threshold: ${policy.soft_flags.budget_proximity_percent}%`)
    );
  }

  // --- Routing tier (docs/17 §5.3) ---
  const routing_tier: TravelRoutingTier =
    hard.length > 0 || exceedsManagerLevel ? "ESCALATE" : soft.length > 0 ? "FLAGGED" : "STANDARD";

  // Hard exceptions route to the senior authority regardless of cost (docs/17 tt.travel-router
  // description: an international trip below the senior dollar threshold still goes senior).
  const finalAuthority: TravelApprovalAuthority =
    hard.length > 0 && required_authority === "MANAGER" ? "DIRECTOR" : required_authority;

  return {
    request_id: request.request_id,
    routing_tier,
    required_authority: finalAuthority,
    hard_exceptions: hard,
    soft_flags: soft,
    findings,
    lead_time_days,
  };
}

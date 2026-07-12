/**
 * Time & Travel — travel compliance engine + router tests (Session 27 scaffold).
 * docs/17 §4 (hard exceptions / thresholds / soft flags), §5.2 (lead-time bands),
 * §5.3 (routing tiers). Determinism is a design guarantee: same input, same output.
 */
import {
  evaluateTravelRequest,
  computeLeadTimeDays,
  requiredAuthorityForCost,
  TT_TRAVEL_COMPLIANCE_ENGINE_AGENT_ID,
} from "../src/tt-travel-compliance-engine";
import {
  routeTravelRequest,
  resolveAuthority,
  TT_TRAVEL_ROUTER_AGENT_ID,
} from "../src/tt-travel-router";
import type { TravelPolicy, TravelRequest } from "@sovereign/data";

const policy: TravelPolicy = {
  policy_id: "TP-2026-01",
  effective_date: "2026-07-01",
  flowpath_session_id: "FP-SESS-42",
  hard_exceptions: {
    personal_day_escalates: true,
    international_escalates: true,
    special_authority_categories: ["SITE_VISIT_CLASSIFIED"],
  },
  routing_thresholds: { manager_threshold: 2500, director_threshold: 10000, executive_threshold: 50000 },
  soft_flags: {
    advance_booking_standard_days: 14,
    advance_booking_short_notice_days: 7,
    advance_booking_critical_hours: 48,
    conference_fee_threshold: 1500,
    budget_proximity_percent: 85,
  },
};

const base: TravelRequest = {
  request_id: "TR-1",
  employee_id: "emp-1",
  destination: "Denver, CO",
  international: false,
  travel_start_date: "2026-09-01",
  travel_end_date: "2026-09-04",
  mission_purpose: "Milestone review",
  costs: { airfare: 400, hotel: 500, per_diem: 200, ground_transport: 80, registration_fees: 0 },
  total_cost: 1180,
  personal_day_included: false,
  justification: "On-site attendance required.",
  status: "SUBMITTED",
  submitted_at: "2026-07-15T12:00:00Z",
};

describe("tt.travel-compliance-engine", () => {
  it("exports the registered agent id", () =>
    expect(TT_TRAVEL_COMPLIANCE_ENGINE_AGENT_ID).toBe("tt.travel-compliance-engine"));

  it("routes a fully compliant request STANDARD at manager level", () => {
    const f = evaluateTravelRequest(base, policy);
    expect(f.routing_tier).toBe("STANDARD");
    expect(f.required_authority).toBe("MANAGER");
    expect(f.hard_exceptions).toEqual([]);
    expect(f.findings).toEqual([]);
  });

  it("is deterministic — same input, same output", () => {
    expect(evaluateTravelRequest(base, policy)).toEqual(evaluateTravelRequest(base, policy));
  });

  it("ESCALATEs an international trip below the manager dollar threshold (hard exception overrides cost)", () => {
    const f = evaluateTravelRequest({ ...base, international: true }, policy);
    expect(f.routing_tier).toBe("ESCALATE");
    expect(f.hard_exceptions).toContain("international_destination");
    // Hard exception routes above manager level even though cost alone is manager-level.
    expect(f.required_authority).toBe("DIRECTOR");
    expect(f.findings.some((x) => x.rule_category === "TRAVEL_HARD_EXCEPTION")).toBe(true);
  });

  it("ESCALATEs on personal day inclusion when the policy says so", () => {
    const f = evaluateTravelRequest({ ...base, personal_day_included: true }, policy);
    expect(f.routing_tier).toBe("ESCALATE");
    expect(f.hard_exceptions).toContain("personal_day_included");
  });

  it("ESCALATEs a special authority category listed in the policy", () => {
    const f = evaluateTravelRequest({ ...base, special_authority_category: "SITE_VISIT_CLASSIFIED" }, policy);
    expect(f.hard_exceptions).toContain("special_authority_category");
  });

  it("ignores a special authority category the policy does not list", () => {
    const f = evaluateTravelRequest({ ...base, special_authority_category: "ROUTINE_OFFSITE" }, policy);
    expect(f.hard_exceptions).toEqual([]);
  });

  it("routes by cost thresholds when no hard exception applies", () => {
    expect(requiredAuthorityForCost(2500, policy)).toBe("MANAGER");
    expect(requiredAuthorityForCost(2501, policy)).toBe("DIRECTOR");
    expect(requiredAuthorityForCost(10001, policy)).toBe("EXECUTIVE");
    const f = evaluateTravelRequest(
      { ...base, total_cost: 12000, costs: { ...base.costs, airfare: 11220 } },
      policy
    );
    expect(f.routing_tier).toBe("ESCALATE");
    expect(f.required_authority).toBe("EXECUTIVE");
    expect(f.findings.some((x) => x.rule_category === "TRAVEL_ROUTING_THRESHOLD")).toBe(true);
  });

  it("FLAGs (not escalates) soft flags alone — short-notice booking", () => {
    const f = evaluateTravelRequest({ ...base, submitted_at: "2026-08-27T12:00:00Z" }, policy);
    expect(f.lead_time_days).toBe(4); // 4.5 days floored — partial days round down
    expect(f.routing_tier).toBe("FLAGGED");
    expect(f.required_authority).toBe("MANAGER");
    expect(f.soft_flags).toContain("advance_booking_short_notice");
  });

  it("marks a sub-48-hour booking critical", () => {
    const f = evaluateTravelRequest({ ...base, submitted_at: "2026-08-31T00:00:00Z" }, policy);
    expect(f.soft_flags).toContain("advance_booking_critical");
    expect(f.routing_tier).toBe("FLAGGED");
  });

  it("raises the conference fee and budget proximity soft flags", () => {
    const f = evaluateTravelRequest(
      { ...base, costs: { ...base.costs, registration_fees: 1600 }, total_cost: 2780 },
      policy,
      { budget_used_percent: 90 }
    );
    expect(f.soft_flags).toEqual(expect.arrayContaining(["conference_fee", "budget_proximity"]));
    // Cost pushed above manager threshold — escalates on threshold, not on the soft flags.
    expect(f.routing_tier).toBe("ESCALATE");
  });

  it("computes lead time from submission — no wall-clock reads", () => {
    expect(computeLeadTimeDays(base)).toBe(47); // 47.5 days floored — partial days round down
  });
});

describe("tt.travel-router", () => {
  it("exports the registered agent id", () =>
    expect(TT_TRAVEL_ROUTER_AGENT_ID).toBe("tt.travel-router"));

  it("routes to the engine-required authority and marks the request ROUTED", () => {
    const f = evaluateTravelRequest({ ...base, international: true }, policy);
    const r = routeTravelRequest({ ...base, international: true }, f);
    expect(r.assigned_authority).toBe("DIRECTOR");
    expect(r.request.status).toBe("ROUTED");
    expect(r.request.routing_tier).toBe("ESCALATE");
    expect(r.routing_basis).toContain("hard exception");
  });

  it("structurally prevents routing below the required authority", () => {
    expect(() => resolveAuthority("DIRECTOR", "MANAGER")).toThrow(/cannot route to MANAGER/);
  });

  it("permits an upward override", () => {
    expect(resolveAuthority("MANAGER", "EXECUTIVE")).toBe("EXECUTIVE");
  });

  it("rejects a finding/request mismatch", () => {
    const f = evaluateTravelRequest(base, policy);
    expect(() => routeTravelRequest({ ...base, request_id: "TR-OTHER" }, f)).toThrow(/does not match/);
  });
});

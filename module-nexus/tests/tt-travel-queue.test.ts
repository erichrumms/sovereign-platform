/**
 * Time & Travel — travel queue pipeline wiring tests (Session 28, D3).
 * The integration layer emits the governed audit trail around the pure Session 27
 * engines: AGENT_STEP_START/COMPLETE per deterministic agent step, HUMAN_DECISION
 * with decision_type TRAVEL_APPROVAL (GD-21) for the manager's decision, every
 * event carrying workflow_step_id (Constraint #6). All fixture data is SYNTHETIC
 * TEST DATA — never real governance data.
 */
import type { TravelRequest, TravelPolicy } from "@sovereign/data";
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";

import {
  processTravelSubmission,
  recordTravelDecision,
  travelWorkflowStep,
  type QueueLogger,
} from "../src/tt-travel-queue";

function syntheticPolicy(): TravelPolicy {
  return {
    policy_id: "TEST-POLICY-1",
    effective_date: "2026-01-01",
    flowpath_session_id: "TEST-FP-SESSION-1",
    hard_exceptions: {
      personal_day_escalates: true,
      international_escalates: true,
      special_authority_categories: [],
    },
    routing_thresholds: {
      manager_threshold: 2500,
      director_threshold: 10000,
      executive_threshold: 50000,
    },
    soft_flags: {
      advance_booking_standard_days: 14,
      advance_booking_short_notice_days: 7,
      advance_booking_critical_hours: 48,
      conference_fee_threshold: 1500,
      budget_proximity_percent: 85,
    },
  };
}

function syntheticRequest(over: Partial<TravelRequest> = {}): TravelRequest {
  return {
    request_id: "TEST-TR-0100",
    employee_id: "TEST-EMP-100",
    destination: "Testville, TS",
    international: false,
    travel_start_date: "2026-09-01",
    travel_end_date: "2026-09-03",
    mission_purpose: "Synthetic test trip",
    costs: { airfare: 400, hotel: 300, per_diem: 150, ground_transport: 50, registration_fees: 0 },
    total_cost: 900,
    personal_day_included: false,
    justification: "Synthetic justification",
    status: "SUBMITTED",
    submitted_at: "2026-08-01T10:00:00.000Z",
    ...over,
  };
}

function captureLogger(): { logger: QueueLogger; events: SovereignLogEvent[] } {
  const events: SovereignLogEvent[] = [];
  return { logger: { log: (e) => events.push(e) }, events };
}

describe("processTravelSubmission — audit trail wiring", () => {
  it("brackets both deterministic agent steps with the correct identities", () => {
    const { logger, events } = captureLogger();
    const result = processTravelSubmission(syntheticRequest(), syntheticPolicy(), logger, "TEST-MGR-1");

    expect(events.map((e) => [e.event_type, e.agent_id])).toEqual([
      ["AGENT_STEP_START", "tt.travel-compliance-engine"],
      ["AGENT_STEP_COMPLETE", "tt.travel-compliance-engine"],
      ["AGENT_STEP_START", "tt.travel-router"],
      ["AGENT_STEP_COMPLETE", "tt.travel-router"],
    ]);
    expect(events[0].agent_class).toBe("Governance");
    expect(events[2].agent_class).toBe("Operational");
    expect(result.routing.request.status).toBe("ROUTED");
  });

  it("every event carries the per-request workflow_step_id (Constraint #6)", () => {
    const { logger, events } = captureLogger();
    processTravelSubmission(syntheticRequest(), syntheticPolicy(), logger, "TEST-MGR-1");
    for (const e of events) {
      expect(e.workflow_step_id).toBe(travelWorkflowStep("TEST-TR-0100"));
      expect(e.workflow_step_id).not.toBe("");
    }
  });

  it("the engine COMPLETE event carries the routing analysis for the audit trail", () => {
    const { logger, events } = captureLogger();
    processTravelSubmission(
      syntheticRequest({ international: true }),
      syntheticPolicy(),
      logger,
      "TEST-MGR-1"
    );
    const complete = events[1];
    expect(complete.outcome).toBe("travel_compliance_escalate");
    expect(complete.payload.routing_tier).toBe("ESCALATE");
    expect(complete.payload.hard_exceptions).toEqual(["international_destination"]);
  });

  it("routing produces a ROUTED request assigned to the required authority", () => {
    const { logger } = captureLogger();
    const result = processTravelSubmission(
      syntheticRequest({ total_cost: 900 }),
      syntheticPolicy(),
      logger,
      "TEST-MGR-1"
    );
    expect(result.routing.assigned_authority).toBe("MANAGER");
    expect(result.routing.request.routing_tier).toBe("STANDARD");
  });
});

describe("recordTravelDecision — the human gate (GD-21 TRAVEL_APPROVAL)", () => {
  const decider = { id: "TEST-MGR-1", name: "Morgan Manager (TEST)" };

  function routed(): TravelRequest {
    return syntheticRequest({
      status: "ROUTED",
      routing_tier: "STANDARD",
      assigned_authority: "MANAGER",
    });
  }

  it.each(["APPROVED", "DENIED", "ESCALATED"] as const)(
    "records %s via HUMAN_DECISION with decision_type TRAVEL_APPROVAL",
    (outcome) => {
      const { logger, events } = captureLogger();
      const result = recordTravelDecision(routed(), outcome, decider, "Synthetic test note.", logger);

      expect(result.request.status).toBe(outcome);
      expect(events).toHaveLength(1);
      const e = events[0];
      expect(e.event_type).toBe("HUMAN_DECISION");
      expect(e.decision_type).toBe("TRAVEL_APPROVAL");
      expect(e.actor).toBe("human");
      expect(e.actor_name).toBe("Morgan Manager (TEST)");
      expect(e.workflow_step_id).toBe(travelWorkflowStep("TEST-TR-0100"));
      expect(e.payload.decision_outcome).toBe(outcome);
    }
  );

  it("refuses to record a decision on an unrouted request (engine cannot be bypassed)", () => {
    const { logger, events } = captureLogger();
    expect(() =>
      recordTravelDecision(syntheticRequest(), "APPROVED", decider, "note", logger)
    ).toThrow(/not ROUTED/);
    expect(events).toHaveLength(0);
  });

  it("only a human decision changes the status — processing alone never approves", () => {
    const { logger } = captureLogger();
    const result = processTravelSubmission(syntheticRequest(), syntheticPolicy(), logger, "TEST-MGR-1");
    expect(result.routing.request.status).toBe("ROUTED");
    expect(["APPROVED", "DENIED", "ESCALATED"]).not.toContain(result.routing.request.status);
  });
});

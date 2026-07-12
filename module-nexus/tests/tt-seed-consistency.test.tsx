/** @jest-environment jsdom */
/**
 * module-nexus — tt-seed-consistency.test.tsx (Session 29, D3)
 * Seeds cannot drift from the rules: every seeded travel request's
 * routing_tier / assigned_authority must be EXACTLY what the real
 * tt.travel-compliance-engine computes for it against the seeded policy.
 * And seeding the intake hook populates the queues WITHOUT emitting a single
 * Logger event (the useAlertQueue.initialAlerts precedent — no fabricated
 * audit trail for records nobody just processed).
 */
import { renderHook } from "@testing-library/react";

import {
  SYNTH_TT_TRAVEL_POLICY,
  SYNTH_TT_TRAVEL_REQUESTS,
  SYNTH_TT_TIME_RECORDS,
  SYNTH_TT_COMPLIANCE_FLAGS,
} from "@sovereign/data";
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";

import { evaluateTravelRequest } from "../src/tt-travel-compliance-engine";
import { useTTIntake } from "../src/useTTIntake";
import { makeCtx } from "./test-helpers";

describe("seeded travel requests are engine-consistent", () => {
  it.each(SYNTH_TT_TRAVEL_REQUESTS.map((r) => [r.request_id, r] as const))(
    "%s: seeded tier/authority match the compliance engine's output",
    (_id, request) => {
      const finding = evaluateTravelRequest(request, SYNTH_TT_TRAVEL_POLICY);
      expect(request.routing_tier).toBe(finding.routing_tier);
      expect(request.assigned_authority).toBe(finding.required_authority);
    }
  );
});

describe("useTTIntake seeding", () => {
  it("populates both queues from seeds with ZERO Logger events", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() =>
      useTTIntake(makeCtx({ logSink }), {
        travelPolicy: SYNTH_TT_TRAVEL_POLICY,
        seedTravel: SYNTH_TT_TRAVEL_REQUESTS,
        seedTime: SYNTH_TT_TIME_RECORDS.map((record) => ({
          record,
          flags: SYNTH_TT_COMPLIANCE_FLAGS.filter((f) => f.record_ref === record.record_id),
        })),
      })
    );

    expect(result.current.travelItems).toHaveLength(SYNTH_TT_TRAVEL_REQUESTS.length);
    expect(result.current.timeItems).toHaveLength(SYNTH_TT_TIME_RECORDS.length);
    expect(logSink).toHaveLength(0); // seeds enter silently — no fabricated audit events

    // Every seeded item carries its engine finding and workflow step id.
    for (const item of result.current.travelItems) {
      expect(item.finding.request_id).toBe(item.request.request_id);
      expect(item.workflow_step_id).toBe(`tt-travel-${item.request.request_id}`);
    }
    // The escalation-territory flag (recurrence 3) arrives attached to its record.
    const tm205 = result.current.timeItems.find((t) => t.record.record_id === "SYNTH-TM-205");
    expect(tm205?.flags.some((f) => f.recurrence_count >= 3)).toBe(true);
  });
});

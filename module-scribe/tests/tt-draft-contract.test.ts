/**
 * module-scribe — tt-draft-contract.test.ts
 * The Time & Travel drafting contract (Session 28, D2): deterministic
 * communication-type selection for both tools, TTDraft validation, and the
 * structural system-invisibility rule (docs/17 §6.4). All fixture data is
 * SYNTHETIC TEST DATA — never real governance data.
 */

import type { TravelRequest, ComplianceFlag } from "@sovereign/data";

import {
  selectTravelCommunicationType,
  selectTimeCommunicationType,
  validateTTDraft,
  disclosesSystem,
  TRAVEL_COMMUNICATION_TYPES,
  TIME_COMMUNICATION_TYPES,
} from "../src/tt-draft-contract";

// --- SYNTHETIC fixtures (test data only) ---

function syntheticRequest(over: Partial<TravelRequest> = {}): TravelRequest {
  return {
    request_id: "TEST-TR-0001",
    employee_id: "TEST-EMP-001",
    destination: "Testville, TS",
    international: false,
    travel_start_date: "2026-08-10",
    travel_end_date: "2026-08-12",
    mission_purpose: "Synthetic test trip",
    costs: { airfare: 400, hotel: 300, per_diem: 150, ground_transport: 50, registration_fees: 0 },
    total_cost: 900,
    personal_day_included: false,
    justification: "Synthetic test justification",
    status: "ROUTED",
    submitted_at: "2026-07-20T09:00:00.000Z",
    routing_tier: "STANDARD",
    assigned_authority: "MANAGER",
    ...over,
  };
}

function syntheticFlag(over: Partial<ComplianceFlag> = {}): ComplianceFlag {
  return {
    flag_id: "TEST-TREC-0001-F1",
    source: "TIME",
    record_ref: "TEST-TREC-0001",
    employee_id: "TEST-EMP-001",
    rule_category: "OVERTIME_THRESHOLD",
    severity: "WARNING",
    rule_citation: "Timekeeping policy — daily overtime threshold",
    actual_value: "11 hours",
    threshold_value: "10 hours per day",
    recurrence_count: 1,
    raised_at: "2026-07-20T09:00:00.000Z",
    status: "OPEN",
    ...over,
  };
}

describe("selectTravelCommunicationType (four templates, docs/17 §5.4)", () => {
  it("APPROVED status → APPROVAL_NOTICE", () => {
    expect(selectTravelCommunicationType(syntheticRequest({ status: "APPROVED" }))).toBe(
      "APPROVAL_NOTICE"
    );
  });

  it("DENIED status → DENIAL_NOTICE", () => {
    expect(selectTravelCommunicationType(syntheticRequest({ status: "DENIED" }))).toBe(
      "DENIAL_NOTICE"
    );
  });

  it("ESCALATED status → ESCALATION_NOTICE", () => {
    expect(selectTravelCommunicationType(syntheticRequest({ status: "ESCALATED" }))).toBe(
      "ESCALATION_NOTICE"
    );
  });

  it("ROUTED with ESCALATE tier (awaiting decision) → ESCALATION_NOTICE", () => {
    expect(
      selectTravelCommunicationType(
        syntheticRequest({ status: "ROUTED", routing_tier: "ESCALATE" })
      )
    ).toBe("ESCALATION_NOTICE");
  });

  it("information needed → INFORMATION_REQUEST, regardless of status", () => {
    expect(
      selectTravelCommunicationType(syntheticRequest({ status: "ROUTED" }), [
        "mission_purpose is ambiguous",
      ])
    ).toBe("INFORMATION_REQUEST");
  });

  it("throws for a state with no documented template (STANDARD-routed, undecided)", () => {
    expect(() => selectTravelCommunicationType(syntheticRequest())).toThrow(
      /no travel communication template/
    );
  });
});

describe("selectTimeCommunicationType (five templates, docs/17 §6.1/§6.2)", () => {
  it("ERROR severity → ERROR_CORRECTION", () => {
    expect(
      selectTimeCommunicationType(
        syntheticFlag({ rule_category: "UNAUTHORIZED_CHARGE_ACCOUNT", severity: "ERROR" })
      )
    ).toBe("ERROR_CORRECTION");
  });

  it("WARNING severity (non-justification) → CLARIFICATION_REQUEST", () => {
    expect(selectTimeCommunicationType(syntheticFlag())).toBe("CLARIFICATION_REQUEST");
  });

  it("JUSTIFICATION_ABSENCE → JUSTIFICATION_REQUEST", () => {
    expect(
      selectTimeCommunicationType(syntheticFlag({ rule_category: "JUSTIFICATION_ABSENCE" }))
    ).toBe("JUSTIFICATION_REQUEST");
  });

  it("PATTERN_DRIFT → PATTERN_FLAG_NOTICE (informational)", () => {
    expect(
      selectTimeCommunicationType(
        syntheticFlag({ rule_category: "PATTERN_DRIFT", severity: "INFORMATIONAL" })
      )
    ).toBe("PATTERN_FLAG_NOTICE");
  });

  it("escalation-monitor upgrade takes precedence → FORMAL_ESCALATION", () => {
    expect(
      selectTimeCommunicationType(
        syntheticFlag({ recurrence_count: 3 }),
        "FORMAL_ESCALATION"
      )
    ).toBe("FORMAL_ESCALATION");
  });

  it("a non-escalation upgrade value does not force escalation", () => {
    expect(
      selectTimeCommunicationType(syntheticFlag(), "CLARIFICATION_REQUEST")
    ).toBe("CLARIFICATION_REQUEST");
  });
});

describe("validateTTDraft", () => {
  it("accepts a well-formed draft for every travel and time communication type", () => {
    for (const t of [...TRAVEL_COMMUNICATION_TYPES, ...TIME_COMMUNICATION_TYPES]) {
      const check = validateTTDraft({
        communication_type: t,
        subject: "Synthetic test subject",
        body: "Synthetic test body with no disclosure.",
      });
      expect(check).toEqual({ valid: true });
    }
  });

  it("accepts a draft without a subject", () => {
    expect(
      validateTTDraft({ communication_type: "PATTERN_FLAG_NOTICE", body: "Quick check-in." })
    ).toEqual({ valid: true });
  });

  it("rejects an unknown communication type", () => {
    const check = validateTTDraft({ communication_type: "MADE_UP", body: "x" });
    expect(check.valid).toBe(false);
  });

  it("rejects an empty body", () => {
    const check = validateTTDraft({ communication_type: "APPROVAL_NOTICE", body: "  " });
    expect(check.valid).toBe(false);
  });

  it("rejects a present-but-empty subject", () => {
    const check = validateTTDraft({
      communication_type: "APPROVAL_NOTICE",
      subject: " ",
      body: "Body.",
    });
    expect(check.valid).toBe(false);
  });
});

describe("system-invisibility rule (docs/17 §6.4 — the tool is invisible)", () => {
  it.each([
    "Your request was evaluated by SOVEREIGN.",
    "SCRIBE drafted this note for you.",
    "The tt.time-drafter agent prepared this.",
    "This was written by an AI assistant.",
    "Our artificial intelligence flagged your record.",
    "A language model produced this draft.",
    "The LLM found an issue.",
    "An automated system reviewed your time record.",
    "The compliance engine flagged your entry.",
  ])("rejects a draft disclosing the system: %s", (body) => {
    expect(disclosesSystem(body)).toBe(true);
    const check = validateTTDraft({ communication_type: "ERROR_CORRECTION", body });
    expect(check.valid).toBe(false);
    if (!check.valid) {
      expect(check.errors.join(" ")).toMatch(/system-invisibility/);
    }
  });

  it("does not false-positive on ordinary prose", () => {
    const body =
      "Please review the airfare detail for your trip; we said the per diem covers meals. " +
      "Repair the hours entry for July 3 and resubmit.";
    expect(disclosesSystem(body)).toBe(false);
    expect(validateTTDraft({ communication_type: "ERROR_CORRECTION", body })).toEqual({
      valid: true,
    });
  });
});

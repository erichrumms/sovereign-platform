/**
 * module-scribe — tt-draft-engine.test.ts
 * The Time & Travel drafting engine (Session 28, D2): message assembly against
 * the two registered prompts, plain-prose parsing (subject lift), three-tier
 * fallback, static templates, cache keys, and the synthesized workflow_step_id.
 * Node env; sovereign-api-client is an injected fake. All fixture data is
 * SYNTHETIC TEST DATA — never real governance data.
 */

import type { SovereignLLMResponse } from "@sovereign/api-client";
import type {
  TravelRequest,
  TravelPolicy,
  TimeRecord,
  ComplianceFlag,
} from "@sovereign/data";

import {
  buildTTDraftMessages,
  parseTTDraft,
  runTTDraft,
  staticTTDraftFallback,
  ttCommunicationType,
  ttDraftCacheKey,
  ttDraftWorkflowStepId,
  type TTDraftDeps,
  type TravelDraftInput,
  type TimeDraftInput,
} from "../src/tt-draft-engine";
import { TT_TRAVEL_DRAFTING_SYSTEM_PROMPT } from "../src/prompts/tt-travel-drafting-system.prompt";
import { TT_TIME_DRAFTING_SYSTEM_PROMPT } from "../src/prompts/tt-time-drafting-system.prompt";

// --- SYNTHETIC fixtures (test data only) ---

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
    request_id: "TEST-TR-0002",
    employee_id: "TEST-EMP-002",
    destination: "Sampletown, TS",
    international: false,
    travel_start_date: "2026-09-01",
    travel_end_date: "2026-09-03",
    mission_purpose: "Synthetic test conference",
    costs: { airfare: 500, hotel: 400, per_diem: 200, ground_transport: 60, registration_fees: 0 },
    total_cost: 1160,
    personal_day_included: false,
    justification: "Synthetic justification",
    status: "APPROVED",
    submitted_at: "2026-08-01T10:00:00.000Z",
    routing_tier: "STANDARD",
    assigned_authority: "MANAGER",
    ...over,
  };
}

function syntheticRecord(): TimeRecord {
  return {
    record_id: "TEST-TREC-0002",
    employee_id: "TEST-EMP-002",
    period_start: "2026-07-06",
    period_end: "2026-07-10",
    entries: [
      {
        entry_date: "2026-07-06",
        cost_code: "TEST-CC-100",
        hours: 8,
        charge_type: "DIRECT",
        holiday: false,
      },
    ],
    total_hours: 8,
    submitted_at: "2026-07-11T08:00:00.000Z",
  };
}

function syntheticFlag(over: Partial<ComplianceFlag> = {}): ComplianceFlag {
  return {
    flag_id: "TEST-TREC-0002-F1",
    source: "TIME",
    record_ref: "TEST-TREC-0002",
    employee_id: "TEST-EMP-002",
    rule_category: "UNAUTHORIZED_CHARGE_ACCOUNT",
    severity: "ERROR",
    rule_citation: "Timekeeping policy — authorized charge account lists per employee role",
    actual_value: "TEST-CC-100: role ANALYST not authorized",
    threshold_value: "charges accepted only to active, role-authorized accounts",
    recurrence_count: 1,
    raised_at: "2026-07-11T08:00:00.000Z",
    status: "OPEN",
    ...over,
  };
}

function travelInput(over: Partial<TravelDraftInput> = {}): TravelDraftInput {
  return {
    tool: "travel",
    request: syntheticRequest(),
    policy: syntheticPolicy(),
    ...over,
  };
}

function timeInput(over: Partial<TimeDraftInput> = {}): TimeDraftInput {
  return {
    tool: "time",
    record: syntheticRecord(),
    flag: syntheticFlag(),
    ...over,
  };
}

function liveResponse(content: string, fallback_activated = false): SovereignLLMResponse {
  return {
    content,
    fallback_tier: fallback_activated ? "static" : "live",
    fallback_activated,
    sovereign_metadata: {
      sovereign_product: "SCRIBE",
      sovereign_version: "1.0",
      workflow_step_id: "tt-travel-draft-TEST-TR-0002-step-1",
      agent_id: "tt.travel-drafter",
      provider: "anthropic",
      provider_model: "claude-sonnet-4",
      tier: "standard",
      responded_at: "2026-07-12T00:00:00.000Z",
    },
  };
}

function reqCtx() {
  return {
    workflow_step_id: "tt-travel-draft-TEST-TR-0002-step-1",
    product: "SCRIBE" as const,
    agent_id: "tt.travel-drafter",
    tier: "standard" as const,
  };
}

function deps(over: Partial<TTDraftDeps> = {}): TTDraftDeps {
  return {
    complete: jest.fn().mockResolvedValue(
      liveResponse("Subject: Trip approved\n\nYour travel to Sampletown is approved.")
    ),
    cacheGet: jest.fn().mockReturnValue(null),
    cacheSet: jest.fn(),
    ...over,
  };
}

const CLEAN_DRAFT = "Subject: Trip approved\n\nYour travel to Sampletown is approved.";

describe("workflow_step_id (Standing Constraint #6)", () => {
  it("uses the supplied workflowStepId when present", () => {
    const input = travelInput({ context: { workflowStepId: "nexus-TR-0002-step-4" } });
    expect(ttDraftWorkflowStepId(input)).toBe("nexus-TR-0002-step-4");
  });

  it("synthesizes a step id from the governed record when standalone", () => {
    expect(ttDraftWorkflowStepId(travelInput())).toBe("tt-travel-draft-TEST-TR-0002-step-1");
    expect(ttDraftWorkflowStepId(timeInput())).toBe("tt-time-draft-TEST-TREC-0002-F1-step-1");
  });
});

describe("message assembly", () => {
  it("travel: system prompt is the registered travel prompt; user payload carries the governed data", () => {
    const messages = buildTTDraftMessages(travelInput(), TT_TRAVEL_DRAFTING_SYSTEM_PROMPT);
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("system");
    expect(messages[0].content).toBe(TT_TRAVEL_DRAFTING_SYSTEM_PROMPT);
    const payload = JSON.parse(messages[1].content);
    expect(payload.communication_type).toBe("APPROVAL_NOTICE");
    expect(payload.travel_request.request_id).toBe("TEST-TR-0002");
    expect(payload.travel_policy.policy_id).toBe("TEST-POLICY-1");
  });

  it("time: system prompt is the registered time prompt; user payload carries the governed data", () => {
    const messages = buildTTDraftMessages(timeInput(), TT_TIME_DRAFTING_SYSTEM_PROMPT);
    expect(messages[0].content).toBe(TT_TIME_DRAFTING_SYSTEM_PROMPT);
    const payload = JSON.parse(messages[1].content);
    expect(payload.communication_type).toBe("ERROR_CORRECTION");
    expect(payload.compliance_flag.flag_id).toBe("TEST-TREC-0002-F1");
    expect(payload.time_record.record_id).toBe("TEST-TREC-0002");
  });

  it("communication type resolves deterministically per input", () => {
    expect(ttCommunicationType(travelInput())).toBe("APPROVAL_NOTICE");
    expect(
      ttCommunicationType(timeInput({ upgradedType: "FORMAL_ESCALATION" }))
    ).toBe("FORMAL_ESCALATION");
  });
});

describe("parseTTDraft (plain prose per the prompts' output format)", () => {
  it("lifts a leading Subject: line into the subject field", () => {
    const draft = parseTTDraft("APPROVAL_NOTICE", CLEAN_DRAFT);
    expect(draft).not.toBeNull();
    expect(draft?.subject).toBe("Trip approved");
    expect(draft?.body).toBe("Your travel to Sampletown is approved.");
  });

  it("accepts body-only prose without a subject line", () => {
    const draft = parseTTDraft("PATTERN_FLAG_NOTICE", "Quick check-in about recent charging.");
    expect(draft).not.toBeNull();
    expect(draft?.subject).toBeUndefined();
    expect(draft?.body).toBe("Quick check-in about recent charging.");
  });

  it("returns null for empty output", () => {
    expect(parseTTDraft("APPROVAL_NOTICE", "   ")).toBeNull();
  });

  it("returns null for a draft that discloses the system (invisibility enforced at parse)", () => {
    expect(
      parseTTDraft("ERROR_CORRECTION", "The SOVEREIGN compliance engine flagged your entry.")
    ).toBeNull();
  });
});

describe("three-tier fallback", () => {
  it("live tier: parses, caches, and returns the validated draft", async () => {
    const d = deps();
    const outcome = await runTTDraft(travelInput(), TT_TRAVEL_DRAFTING_SYSTEM_PROMPT, reqCtx(), d);
    expect(outcome.tier).toBe("live");
    expect(outcome.draft.communication_type).toBe("APPROVAL_NOTICE");
    expect(outcome.draft.subject).toBe("Trip approved");
    expect(d.cacheSet).toHaveBeenCalledTimes(1);
    expect(d.complete).toHaveBeenCalledTimes(1);
  });

  it("cache tier: a rejected live call serves the last good draft", async () => {
    const cached = {
      communication_type: "APPROVAL_NOTICE" as const,
      subject: "Trip approved",
      body: "Cached draft body.",
    };
    const d = deps({
      complete: jest.fn().mockRejectedValue(new Error("no API key")),
      cacheGet: jest.fn().mockReturnValue(cached),
    });
    const outcome = await runTTDraft(travelInput(), TT_TRAVEL_DRAFTING_SYSTEM_PROMPT, reqCtx(), d);
    expect(outcome.tier).toBe("cache");
    expect(outcome.draft).toEqual(cached);
    expect(outcome.detail).toBe("no API key");
  });

  it("static tier: no live, no cache → meaningful schema-valid template, never an empty stub", async () => {
    const d = deps({ complete: jest.fn().mockRejectedValue(new Error("no API key")) });
    const outcome = await runTTDraft(
      timeInput({ upgradedType: "FORMAL_ESCALATION" }),
      TT_TIME_DRAFTING_SYSTEM_PROMPT,
      reqCtx(),
      d
    );
    expect(outcome.tier).toBe("static");
    expect(outcome.draft.communication_type).toBe("FORMAL_ESCALATION");
    expect(outcome.draft.body).toMatch(/static fallback/);
    expect(outcome.draft.body).not.toBe("");
  });

  it("a live response that discloses the system falls through to static", async () => {
    const d = deps({
      complete: jest
        .fn()
        .mockResolvedValue(liveResponse("This draft was produced by an AI system.")),
    });
    const outcome = await runTTDraft(travelInput(), TT_TRAVEL_DRAFTING_SYSTEM_PROMPT, reqCtx(), d);
    expect(outcome.tier).toBe("static");
    expect(outcome.detail).toBe("live_response_failed_draft_validation");
  });

  it("an api-client-level fallback response is treated as live-unavailable", async () => {
    const d = deps({
      complete: jest.fn().mockResolvedValue(liveResponse("degraded content", true)),
    });
    const outcome = await runTTDraft(travelInput(), TT_TRAVEL_DRAFTING_SYSTEM_PROMPT, reqCtx(), d);
    expect(outcome.tier).toBe("static");
    expect(outcome.detail).toBe("api_client_fallback_static");
  });

  it("exactly one live attempt per run", async () => {
    const complete = jest.fn().mockRejectedValue(new Error("down"));
    const d = deps({ complete });
    await runTTDraft(travelInput(), TT_TRAVEL_DRAFTING_SYSTEM_PROMPT, reqCtx(), d);
    expect(complete).toHaveBeenCalledTimes(1);
  });
});

describe("static templates cover every communication type", () => {
  it.each([
    "APPROVAL_NOTICE",
    "INFORMATION_REQUEST",
    "ESCALATION_NOTICE",
    "DENIAL_NOTICE",
    "ERROR_CORRECTION",
    "CLARIFICATION_REQUEST",
    "JUSTIFICATION_REQUEST",
    "PATTERN_FLAG_NOTICE",
    "FORMAL_ESCALATION",
  ] as const)("%s has a meaningful, valid static template", (t) => {
    const draft = staticTTDraftFallback(t);
    expect(draft.communication_type).toBe(t);
    expect(draft.subject).toBeTruthy();
    expect(draft.body).toMatch(/static fallback/);
  });
});

describe("cache keys", () => {
  it("are stable for the same governed input and distinct across tools", () => {
    expect(ttDraftCacheKey(travelInput())).toBe(ttDraftCacheKey(travelInput()));
    expect(ttDraftCacheKey(travelInput())).not.toBe(ttDraftCacheKey(timeInput()));
  });
});

/** @jest-environment jsdom */
/**
 * module-nexus — useTTIntake.test.tsx (Session 29, D1 + Session 30 D1 regression)
 * The TT intake hook drives the EXISTING Session 27/28 pipeline: a travel
 * submission produces the full AGENT_STEP audit bracketing and a ROUTED request;
 * the manager's decision emits HUMAN_DECISION · TRAVEL_APPROVAL (GD-21); a time
 * submission brackets the injected compliance port; Gate 2 fail-closed blocks
 * any commit whose Logger emit throws; the policy preview is pure (no events).
 *
 * Session 30 D1 (WE-10) regression: decideTravel MUST invoke the travelDrafter
 * port after recording the decision. Root cause of WE-10 was that the port was
 * never called — these tests ensure that cannot silently regress.
 */
import { renderHook, act, waitFor } from "@testing-library/react";

import { SYNTH_TT_TRAVEL_POLICY } from "@sovereign/data";
import type { ComplianceFlag } from "@sovereign/data";
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";

import { useTTIntake, type TTIntakePorts, type TravelDraftResult, type TravelDrafterPort } from "../src/useTTIntake";
import { EMPTY_TRAVEL_FORM, type TravelIntakeForm, type TimeIntakeForm } from "../src/tt-intake";
import { makeCtx } from "./test-helpers";

function travelForm(over: Partial<TravelIntakeForm> = {}): TravelIntakeForm {
  return {
    ...EMPTY_TRAVEL_FORM,
    destination: "Denver, CO",
    travel_start_date: "2026-08-20",
    travel_end_date: "2026-08-22",
    mission_purpose: "Program review",
    airfare: "400",
    hotel: "300",
    per_diem: "200",
    ground_transport: "50",
    registration_fees: "0",
    justification: "Quarterly on-site program review.",
    ...over,
  };
}

function timeForm(): TimeIntakeForm {
  return {
    period_start: "2026-07-06",
    period_end: "2026-07-10",
    entries: [
      { entry_date: "2026-07-06", cost_code: "SYNTH-CC-1001", hours: "8", charge_type: "DIRECT", holiday: false, justification: "" },
    ],
  };
}

function fakeFlag(recordRef: string): ComplianceFlag {
  return {
    flag_id: `${recordRef}-F1`,
    source: "TIME",
    record_ref: recordRef,
    employee_id: "E-900",
    rule_category: "MISSING_HOURS",
    severity: "WARNING",
    rule_citation: "Timekeeping policy — complete daily recording",
    actual_value: "2026-07-07: no hours recorded",
    threshold_value: "every scheduled workday requires recorded hours",
    recurrence_count: 1,
    raised_at: "2026-07-10",
    status: "OPEN",
  };
}

function ports(over: Partial<TTIntakePorts> = {}): TTIntakePorts {
  return { travelPolicy: SYNTH_TT_TRAVEL_POLICY, ...over };
}

describe("useTTIntake — travel path", () => {
  it("submits through engine + router with full audit bracketing, then records the human decision", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useTTIntake(makeCtx({ logSink }), ports()));

    act(() => result.current.submitTravel(travelForm()));

    expect(result.current.error).toBeNull();
    expect(result.current.travelItems).toHaveLength(1);
    const item = result.current.travelItems[0];
    expect(item.request.status).toBe("ROUTED");
    expect(item.finding.routing_tier).toBe("STANDARD");
    expect(item.request.assigned_authority).toBe("MANAGER");

    // Session 28 pipeline bracketing: engine START/COMPLETE + router START/COMPLETE.
    const steps = logSink.filter((e) => e.event_type === "AGENT_STEP_START" || e.event_type === "AGENT_STEP_COMPLETE");
    expect(steps).toHaveLength(4);
    for (const e of steps) {
      expect(e.workflow_step_id).toBe(item.workflow_step_id); // Constraint #6
      expect(e.agent_id).toMatch(/^tt\./);
    }

    // The manager's decision — the ONLY path to APPROVED (GD-21 TRAVEL_APPROVAL).
    act(() => result.current.decideTravel(item.request.request_id, "APPROVED", "SIMULATED TEST DECISION note"));
    expect(result.current.travelItems[0].request.status).toBe("APPROVED");
    const decisions = logSink.filter((e) => e.event_type === "HUMAN_DECISION");
    expect(decisions).toHaveLength(1);
    expect(decisions[0].decision_type).toBe("TRAVEL_APPROVAL");
    expect(decisions[0].actor).toBe("human");
  });

  it("routes a hard-exception request to ESCALATE regardless of cost", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useTTIntake(makeCtx({ logSink }), ports()));
    act(() => result.current.submitTravel(travelForm({ international: true })));
    const item = result.current.travelItems[0];
    expect(item.finding.routing_tier).toBe("ESCALATE");
    expect(item.finding.hard_exceptions).toContain("international_destination");
  });

  it("Gate 2 fail-closed: a throwing logger commits nothing", () => {
    const { result } = renderHook(() => useTTIntake(makeCtx({ throwOnLog: true }), ports()));
    act(() => result.current.submitTravel(travelForm()));
    expect(result.current.travelItems).toHaveLength(0);
    expect(result.current.error).toContain("Gate 2");
  });

  it("surfaces builder errors without consuming state", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useTTIntake(makeCtx({ logSink }), ports()));
    act(() => result.current.submitTravel(travelForm({ airfare: "not-a-number" })));
    expect(result.current.travelItems).toHaveLength(0);
    expect(result.current.error).toContain("airfare");
    expect(logSink).toHaveLength(0);
  });

  it("previewTravel evaluates purely — a finding with zero Logger events", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useTTIntake(makeCtx({ logSink }), ports()));
    const finding = result.current.previewTravel(travelForm({ personal_day_included: true }));
    expect(finding).not.toBeNull();
    expect(finding?.routing_tier).toBe("ESCALATE");
    expect(logSink).toHaveLength(0); // preview is pre-submission assistance, not an agent step
    expect(result.current.previewTravel({ ...EMPTY_TRAVEL_FORM })).toBeNull(); // incomplete form
  });
});

describe("useTTIntake — time path", () => {
  it("brackets the injected compliance port with AGENT_STEP events and stores the flags", () => {
    const logSink: SovereignLogEvent[] = [];
    const evaluate = jest.fn((record) => [fakeFlag(record.record_id)]);
    const { result } = renderHook(() =>
      useTTIntake(
        makeCtx({ logSink }),
        ports({ timeEngine: { agent_id: "tt.time-compliance-engine", agent_class: "Governance", evaluate } })
      )
    );

    act(() => result.current.submitTime(timeForm()));

    expect(result.current.error).toBeNull();
    expect(evaluate).toHaveBeenCalledTimes(1);
    expect(result.current.timeItems).toHaveLength(1);
    const item = result.current.timeItems[0];
    expect(item.evaluated).toBe(true);
    expect(item.flags).toHaveLength(1);
    expect(item.workflow_step_id).toBe(`tt-time-${item.record.record_id}`);

    const steps = logSink.filter((e) => e.event_type === "AGENT_STEP_START" || e.event_type === "AGENT_STEP_COMPLETE");
    expect(steps).toHaveLength(2);
    for (const e of steps) {
      expect(e.agent_id).toBe("tt.time-compliance-engine");
      expect(e.agent_class).toBe("Governance");
      expect(e.workflow_step_id).toBe(item.workflow_step_id);
    }
  });

  it("records honestly-unevaluated records when no engine port is wired", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useTTIntake(makeCtx({ logSink }), ports()));
    act(() => result.current.submitTime(timeForm()));
    expect(result.current.timeItems[0].evaluated).toBe(false);
    expect(logSink).toHaveLength(0); // no engine ran — no agent-step events fabricated
  });

  it("Gate 2 fail-closed: a throwing logger blocks the time submission", () => {
    const evaluate = jest.fn(() => []);
    const { result } = renderHook(() =>
      useTTIntake(
        makeCtx({ throwOnLog: true }),
        ports({ timeEngine: { agent_id: "tt.time-compliance-engine", agent_class: "Governance", evaluate } })
      )
    );
    act(() => result.current.submitTime(timeForm()));
    expect(result.current.timeItems).toHaveLength(0);
    expect(result.current.error).toContain("Gate 2");
  });
});

/**
 * D1 (WE-10) regression suite — these tests would have caught the bug.
 *
 * Root cause: decideTravel never called ports.travelDrafter.draft(). The fix
 * fires draft() async after recordTravelDecision and stores the result on
 * SubmittedTravelItem. These tests verify:
 *   1. Without drafter → draftStatus stays 'idle' (no error, no draft)
 *   2. With drafter → drafter.draft() is called; draftStatus transitions loading→done
 *   3. Drafter rejection → draftStatus='error', draftError captured
 *
 * Any future removal of the draft() call will cause test 2 to fail immediately.
 */
describe("useTTIntake — D1 regression (WE-10: travelDrafter port)", () => {
  it("no travelDrafter port → draftStatus is 'idle' after decision (backward-compat baseline)", () => {
    const { result } = renderHook(() => useTTIntake(makeCtx(), ports()));

    act(() => result.current.submitTravel(travelForm()));
    expect(result.current.travelItems).toHaveLength(1);
    const requestId = result.current.travelItems[0].request.request_id;

    act(() => result.current.decideTravel(requestId, "APPROVED", "Meets all policy criteria."));
    // draftStatus 'idle' means: no draft engine wired, nothing to show — honest state.
    expect(result.current.travelItems[0].draftStatus).toBe("idle");
    expect(result.current.travelItems[0].draft).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it("travelDrafter port wired → draft() is called and draftStatus reaches 'done' (WE-10 fix)", async () => {
    const mockDraft: TravelDraftResult = {
      communication_type: "APPROVAL_NOTICE",
      subject: "Travel approved",
      body: "Your request to Denver has been approved.",
    };
    const mockDrafter: TravelDrafterPort = {
      draft: jest.fn().mockResolvedValue({ draft: mockDraft, tier: "live" }),
    };

    const { result } = renderHook(() => useTTIntake(makeCtx(), ports({ travelDrafter: mockDrafter })));

    act(() => result.current.submitTravel(travelForm()));
    expect(result.current.travelItems).toHaveLength(1);
    const requestId = result.current.travelItems[0].request.request_id;
    const finding = result.current.travelItems[0].finding;

    act(() => result.current.decideTravel(requestId, "APPROVED", "Meets all policy criteria."));

    // Immediately after the sync call: draft is in flight.
    expect(result.current.travelItems[0].draftStatus).toBe("loading");
    expect(mockDrafter.draft).toHaveBeenCalledTimes(1);
    // Drafter receives the decided request and the finding.
    const [calledRequest, calledFinding] = (mockDrafter.draft as jest.Mock).mock.calls[0];
    expect(calledRequest.request_id).toBe(requestId);
    expect(calledFinding).toBe(finding);

    // After the promise resolves: draft lands.
    await waitFor(() => expect(result.current.travelItems[0].draftStatus).toBe("done"));
    expect(result.current.travelItems[0].draft).toEqual(mockDraft);
    expect(result.current.travelItems[0].draftTier).toBe("live");
    expect(result.current.error).toBeNull();
  });

  it("drafter rejection → draftStatus='error' and draftError is captured", async () => {
    const mockDrafter: TravelDrafterPort = {
      draft: jest.fn().mockRejectedValue(new Error("drafting engine unavailable")),
    };

    const { result } = renderHook(() => useTTIntake(makeCtx(), ports({ travelDrafter: mockDrafter })));

    act(() => result.current.submitTravel(travelForm()));
    expect(result.current.travelItems).toHaveLength(1);
    const requestId = result.current.travelItems[0].request.request_id;

    act(() => result.current.decideTravel(requestId, "DENIED", "Budget constraints."));

    await waitFor(() => expect(result.current.travelItems[0].draftStatus).toBe("error"));
    expect(result.current.travelItems[0].draftError).toContain("drafting engine unavailable");
    // The decision itself is recorded correctly — only the draft failed.
    expect(result.current.travelItems[0].request.status).toBe("DENIED");
    expect(result.current.error).toBeNull();
  });

  it("draft result lands on the correct item when multiple requests are in the queue", async () => {
    const mockDrafter: TravelDrafterPort = {
      draft: jest.fn().mockImplementation((request) => {
        const d: TravelDraftResult = { communication_type: "APPROVAL_NOTICE", body: `Draft for ${request.request_id}` };
        return Promise.resolve({ draft: d, tier: "static" });
      }),
    };

    const { result } = renderHook(() => useTTIntake(makeCtx(), ports({ travelDrafter: mockDrafter })));

    act(() => result.current.submitTravel(travelForm()));
    act(() => result.current.submitTravel(travelForm({ destination: "Boston, MA" })));
    expect(result.current.travelItems).toHaveLength(2);

    const itemAId = result.current.travelItems[0].request.request_id;
    const itemBId = result.current.travelItems[1].request.request_id;

    act(() => result.current.decideTravel(itemAId, "APPROVED", "Policy criteria met."));
    await waitFor(() => expect(result.current.travelItems[0].draftStatus).toBe("done"));

    // itemB is untouched.
    expect(result.current.travelItems[1].draftStatus).toBeUndefined();
    // itemA got the correct draft.
    expect(result.current.travelItems[0].draft?.body).toContain(itemAId);
    expect(result.current.travelItems[1].request.request_id).toBe(itemBId);
  });
});

/** @jest-environment jsdom */
/**
 * module-scribe — tt-manager-review.test.tsx
 * The Time & Travel manager review interface (Session 28, D3): split-panel queue +
 * analysis + pre-populated draft (docs/17 §14), the structural VIGIL gate on
 * formal escalations (send disabled until authorized — docs/17 §7 Tier B), the
 * GD-21 TIME_CORRECTION_SENT emission on a manager-recorded send, and the travel
 * decision delegation to NEXUS. All fixture data is SYNTHETIC TEST DATA.
 */
import { render, screen, fireEvent } from "@testing-library/react";

import type { TravelRequest, ComplianceFlag } from "@sovereign/data";
import type { SovereignLogEvent, SovereignShellContext } from "../../sovereign-shell/shell-contract";

import {
  TTManagerReview,
  type TravelReviewItem,
  type TimeReviewItem,
} from "../src/TTManagerReview";
import { DEMO_TT_REVIEW_ITEMS } from "../src/tt-synthetic-review";

function syntheticCtx(events: SovereignLogEvent[]): SovereignShellContext {
  return {
    auth: {
      user: {
        employee_id: "TEST-MGR-1",
        name: "Morgan Manager (TEST)",
        org_unit: "TEST-ORG",
        role: "PROGRAM_MANAGER",
        clearance_level: "UNCLASSIFIED",
        cost_code_assignments: [],
      },
      token: "test-token",
      signOut: () => {},
      hasRole: () => true,
      hasClearance: () => true,
    },
    logger: { log: (e) => events.push(e) },
  } as unknown as SovereignShellContext;
}

function syntheticFlag(over: Partial<ComplianceFlag> = {}): ComplianceFlag {
  return {
    flag_id: "TEST-FLAG-1",
    source: "TIME",
    record_ref: "TEST-TREC-1",
    employee_id: "TEST-EMP-200",
    rule_category: "UNAUTHORIZED_CHARGE_ACCOUNT",
    severity: "ERROR",
    rule_citation: "Timekeeping policy — authorized charge account lists",
    actual_value: "TEST-CC-100: role not authorized",
    threshold_value: "active, role-authorized accounts only",
    recurrence_count: 3,
    raised_at: "2026-07-12T10:00:00.000Z",
    status: "OPEN",
    ...over,
  };
}

function syntheticRequest(): TravelRequest {
  return {
    request_id: "TEST-TR-0300",
    employee_id: "TEST-EMP-300",
    destination: "Testville, TS",
    international: false,
    travel_start_date: "2026-09-01",
    travel_end_date: "2026-09-03",
    mission_purpose: "Synthetic test trip",
    costs: { airfare: 400, hotel: 300, per_diem: 150, ground_transport: 50, registration_fees: 0 },
    total_cost: 900,
    personal_day_included: false,
    justification: "Synthetic justification",
    status: "ROUTED",
    submitted_at: "2026-08-01T10:00:00.000Z",
    routing_tier: "STANDARD",
    assigned_authority: "MANAGER",
  };
}

function travelItem(): TravelReviewItem {
  return {
    kind: "travel",
    request: syntheticRequest(),
    flags: [],
    draft: {
      communication_type: "APPROVAL_NOTICE",
      subject: "Trip approved (SYNTHETIC TEST)",
      body: "Synthetic approval notice body.",
    },
    workflow_step_id: "tt-travel-TEST-TR-0300",
  };
}

function timeItem(over: Partial<TimeReviewItem> = {}): TimeReviewItem {
  return {
    kind: "time",
    flag: syntheticFlag(),
    draft: {
      communication_type: "FORMAL_ESCALATION",
      subject: "Formal notice (SYNTHETIC TEST)",
      body: "Synthetic escalation body.",
    },
    requiresVigilAuthorization: true,
    vigilAuthorized: false,
    workflow_step_id: "vigil-approval-tt-escalation-TEST-FLAG-1",
    ...over,
  };
}

describe("TTManagerReview — split-panel queue (docs/17 §14)", () => {
  it("each of the six DEMO_TT_REVIEW_ITEMS is individually selectable (Part 1 diagnosis)", () => {
    // Confirms that clicking any queue row changes the detail panel.  The
    // walkthrough finding (items appeared not to change) was a misperception —
    // the selection mechanism is stateful useState + items.find and is correct.
    const events: SovereignLogEvent[] = [];
    render(<TTManagerReview ctx={syntheticCtx(events)} items={DEMO_TT_REVIEW_ITEMS} />);

    // Click each item in turn and verify the draft panel reflects the selected subject.
    const expected = [
      { flagId: "SYNTH-TM-201-F1", subject: "Time record 2026-06-22 to 2026-06-26 — correction required" },
      { flagId: "SYNTH-TM-202-F1", subject: "Time record 2026-06-22 to 2026-06-26 — quick confirmation" },
      { flagId: "SYNTH-TM-203-F1", subject: "Time record 2026-06-22 to 2026-06-26 — justification needed" },
      { flagId: "SYNTH-TM-204-F1", subject: "Checking in on recent time charging" },
      { flagId: "SYNTH-TM-205-F1", subject: "Formal notice — recurring time record compliance issue" },
      { flagId: "SYNTH-TM-206-F1", subject: "Formal notice — recurring overtime threshold issue" },
    ];
    for (const { flagId, subject } of expected) {
      fireEvent.click(screen.getByTestId(`tt-queue-item-time-${flagId}`));
      expect(screen.getByTestId("tt-draft")).toHaveTextContent(subject);
    }
  });

  it("renders the queue and the pre-populated analysis + draft for the selected item", () => {
    const events: SovereignLogEvent[] = [];
    render(<TTManagerReview ctx={syntheticCtx(events)} items={[timeItem()]} />);

    expect(screen.getByTestId("tt-review-queue")).toHaveTextContent("TEST-FLAG-1");
    expect(screen.getByTestId("tt-analysis")).toHaveTextContent("UNAUTHORIZED_CHARGE_ACCOUNT");
    expect(screen.getByTestId("tt-analysis")).toHaveTextContent("occurrence 3");
    expect(screen.getByTestId("tt-draft")).toHaveTextContent("Synthetic escalation body.");
  });

  it("switches the detail panel when a queue item is selected", () => {
    const events: SovereignLogEvent[] = [];
    render(
      <TTManagerReview
        ctx={syntheticCtx(events)}
        items={[travelItem(), timeItem()]}
      />
    );
    fireEvent.click(screen.getByTestId("tt-queue-item-time-TEST-FLAG-1"));
    expect(screen.getByTestId("tt-draft")).toHaveTextContent("Synthetic escalation body.");
  });
});

describe("the VIGIL gate on formal escalations (docs/17 §7 Tier B)", () => {
  it("send is DISABLED while the escalation awaits VIGIL authorization", () => {
    const events: SovereignLogEvent[] = [];
    render(<TTManagerReview ctx={syntheticCtx(events)} items={[timeItem()]} />);

    expect(screen.getByTestId("tt-send-communication")).toBeDisabled();
    expect(screen.getByTestId("tt-awaiting-authorization")).toHaveTextContent(
      /Awaiting VIGIL authorization/
    );
    // No decision event was emitted — the flow is halted at the gate.
    expect(events.filter((e) => e.event_type === "HUMAN_DECISION")).toHaveLength(0);
  });

  it("send is enabled once VIGIL has authorized, and records TIME_CORRECTION_SENT (GD-21)", () => {
    const events: SovereignLogEvent[] = [];
    render(
      <TTManagerReview
        ctx={syntheticCtx(events)}
        items={[timeItem({ vigilAuthorized: true })]}
      />
    );

    const send = screen.getByTestId("tt-send-communication");
    expect(send).toBeEnabled();
    fireEvent.click(send);

    const decisions = events.filter((e) => e.event_type === "HUMAN_DECISION");
    expect(decisions).toHaveLength(1);
    expect(decisions[0].decision_type).toBe("TIME_CORRECTION_SENT");
    expect(decisions[0].actor).toBe("human");
    expect(decisions[0].actor_name).toBe("Morgan Manager (TEST)");
    expect(decisions[0].workflow_step_id).toBe("vigil-approval-tt-escalation-TEST-FLAG-1");
    expect(decisions[0].payload.vigil_authorized).toBe(true);
    expect(screen.getByTestId("tt-sent-confirmation")).toBeInTheDocument();
  });

  it("a routine (non-escalation) communication needs no VIGIL authorization to send", () => {
    const events: SovereignLogEvent[] = [];
    render(
      <TTManagerReview
        ctx={syntheticCtx(events)}
        items={[
          timeItem({
            flag: syntheticFlag({ recurrence_count: 1 }),
            draft: { communication_type: "ERROR_CORRECTION", body: "Synthetic correction body." },
            requiresVigilAuthorization: false,
            vigilAuthorized: false,
            workflow_step_id: "tt-time-TEST-FLAG-1",
          }),
        ]}
      />
    );
    const send = screen.getByTestId("tt-send-communication");
    expect(send).toBeEnabled();
    fireEvent.click(send);
    const decisions = events.filter((e) => e.event_type === "HUMAN_DECISION");
    expect(decisions).toHaveLength(1);
    expect(decisions[0].decision_type).toBe("TIME_CORRECTION_SENT");
  });
});

describe("travel decisions delegate to NEXUS (GD-21 TRAVEL_APPROVAL lives there)", () => {
  it("clicking Approve invokes onTravelDecision without emitting from SCRIBE", () => {
    const events: SovereignLogEvent[] = [];
    const onTravelDecision = jest.fn();
    render(
      <TTManagerReview
        ctx={syntheticCtx(events)}
        items={[travelItem()]}
        onTravelDecision={onTravelDecision}
      />
    );
    fireEvent.click(screen.getByTestId("tt-travel-approved"));
    expect(onTravelDecision).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "travel" }),
      "APPROVED"
    );
    expect(events).toHaveLength(0); // NEXUS owns the TRAVEL_APPROVAL emission
  });
});

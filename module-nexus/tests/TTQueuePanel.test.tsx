/** @jest-environment jsdom */
/**
 * module-nexus — TTQueuePanel.test.tsx (Session 30, D1/D2/D3)
 *
 * Regression and smoke tests for the three Session 30 fixes in TTQueuePanel:
 *   D1 (WE-10) — draft panel: rendered after a decision with the correct
 *     draftStatus (loading / done / error) and content.
 *   D2 (WE-11) — required indicator: visible label + inline error on blur
 *     when note is < NOTE_MIN_CHARS, never silently gated.
 *   D3 (WE-12) — pre-populated note: textarea value is seeded from the
 *     compliance finding on-screen, not blank, so it is always ≥ 10 chars
 *     for standard findings and the buttons are not blocked by default.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import type { ComplianceFlag } from "@sovereign/data";

import { TTQueuePanel } from "../src/TTQueuePanel";
import type { UseTTIntake, SubmittedTravelItem } from "../src/useTTIntake";
import type { TravelComplianceFinding } from "../src/tt-travel-compliance-engine";

// ---- Minimal fakes --------------------------------------------------------

function fakeFlag(requestId: string): ComplianceFlag {
  return {
    flag_id: `${requestId}-F1`,
    source: "TRAVEL",
    record_ref: requestId,
    employee_id: "E-900",
    rule_category: "COST_THRESHOLD",
    severity: "WARNING",
    rule_citation: "DoD Joint Travel Regulation §4.1",
    actual_value: "$950",
    threshold_value: "$750",
    recurrence_count: 1,
    raised_at: "2026-07-12",
    status: "OPEN",
  };
}

function makeFinding(over: Partial<TravelComplianceFinding> = {}): TravelComplianceFinding {
  return {
    request_id: "TR-TEST",
    routing_tier: "STANDARD",
    required_authority: "MANAGER",
    hard_exceptions: [],
    soft_flags: [],
    findings: [],
    lead_time_days: 14,
    ...over,
  };
}

function makeItem(
  over: Partial<SubmittedTravelItem> = {},
  findingOver: Partial<TravelComplianceFinding> = {}
): SubmittedTravelItem {
  const requestId = "TR-TEST";
  return {
    request: {
      request_id: requestId,
      employee_id: "E-900",
      destination: "Denver, CO",
      travel_start_date: "2026-08-20",
      travel_end_date: "2026-08-22",
      mission_purpose: "Program review",
      total_cost: 950,
      airfare: 400,
      hotel: 300,
      per_diem: 200,
      ground_transport: 50,
      registration_fees: 0,
      justification: "Quarterly review.",
      status: "ROUTED",
      assigned_authority: "MANAGER",
      submitted_at: "2026-07-12T00:00:00Z",
      international: false,
      personal_day_included: false,
    } as any,
    finding: makeFinding(findingOver),
    workflow_step_id: "tt-travel-step-TR-TEST",
    ...over,
  };
}

function makeTT(items: SubmittedTravelItem[]): UseTTIntake {
  return {
    travelItems: items,
    timeItems: [],
    error: null,
    submitTravel: jest.fn(),
    submitTime: jest.fn(),
    decideTravel: jest.fn(),
    previewTravel: jest.fn(() => null),
    clearError: jest.fn(),
  };
}

// ---- D2 (WE-11): required indicator & inline error -----------------------

describe("TTQueuePanel — D2 (WE-11): required indicator and inline error", () => {
  it("shows a visible required indicator in the label for a ROUTED request", () => {
    render(<TTQueuePanel tt={makeTT([makeItem()])} />);
    // The indicator "(required, ≥10 chars)" is in the label.
    expect(screen.getByText(/required.*≥.*chars/i)).toBeTruthy();
  });

  it("does NOT show an inline error before the field is touched", () => {
    render(<TTQueuePanel tt={makeTT([makeItem()])} />);
    // The note is pre-populated (D3), so error should not appear until touched.
    expect(screen.queryByRole("alert", { name: /decision note/i })).toBeNull();
  });

  it("shows inline error after clearing note and blurring (touched + too short)", () => {
    render(<TTQueuePanel tt={makeTT([makeItem()])} />);
    const textarea = screen.getByRole("textbox", { name: /decision note for TR-TEST/i });
    // Clear the pre-populated note and blur.
    fireEvent.change(textarea, { target: { value: "short" } });
    fireEvent.blur(textarea);
    // Inline error alert appears.
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toMatch(/at least 10 characters/i);
    expect(screen.getByRole("alert").textContent).toMatch(/currently 5/i);
  });

  it("error clears once the note is long enough again", () => {
    render(<TTQueuePanel tt={makeTT([makeItem()])} />);
    const textarea = screen.getByRole("textbox", { name: /decision note for TR-TEST/i });
    fireEvent.change(textarea, { target: { value: "hi" } });
    fireEvent.blur(textarea);
    // Error visible.
    expect(screen.getByRole("alert")).toBeTruthy();
    // Type enough characters.
    fireEvent.change(textarea, { target: { value: "Policy criteria fully met." } });
    // Alert is gone.
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("buttons are disabled while note is too short", () => {
    render(<TTQueuePanel tt={makeTT([makeItem()])} />);
    const textarea = screen.getByRole("textbox", { name: /decision note for TR-TEST/i });
    fireEvent.change(textarea, { target: { value: "too short" } }); // 9 chars
    expect(screen.getByTestId("tt-approve-TR-TEST")).toBeDisabled();
    expect(screen.getByTestId("tt-deny-TR-TEST")).toBeDisabled();
    expect(screen.getByTestId("tt-escalate-TR-TEST")).toBeDisabled();
  });

  it("buttons are enabled once note meets minimum", () => {
    render(<TTQueuePanel tt={makeTT([makeItem()])} />);
    const textarea = screen.getByRole("textbox", { name: /decision note for TR-TEST/i });
    fireEvent.change(textarea, { target: { value: "Meets all policy criteria." } });
    expect(screen.getByTestId("tt-approve-TR-TEST")).not.toBeDisabled();
  });
});

// ---- D3 (WE-12): pre-populated note ---------------------------------------

describe("TTQueuePanel — D3 (WE-12): note pre-populated from finding", () => {
  it("STANDARD clean finding → note pre-populated with 'All policy rules satisfied.'", () => {
    render(<TTQueuePanel tt={makeTT([makeItem()])} />);
    const textarea = screen.getByRole("textbox", { name: /decision note for TR-TEST/i }) as HTMLTextAreaElement;
    expect(textarea.value).toContain("All policy rules satisfied");
    expect(textarea.value.length).toBeGreaterThanOrEqual(10);
  });

  it("hard exception finding → note pre-populated with exception name", () => {
    const item = makeItem({}, { hard_exceptions: ["international_destination"], routing_tier: "ESCALATE" });
    render(<TTQueuePanel tt={makeTT([item])} />);
    const textarea = screen.getByRole("textbox", { name: /decision note for TR-TEST/i }) as HTMLTextAreaElement;
    expect(textarea.value).toContain("Hard exception");
    expect(textarea.value).toContain("international_destination");
  });

  it("ESCALATE with findings → note references rule category", () => {
    const item = makeItem(
      {},
      { routing_tier: "ESCALATE", findings: [fakeFlag("TR-TEST")] }
    );
    render(<TTQueuePanel tt={makeTT([item])} />);
    const textarea = screen.getByRole("textbox", { name: /decision note for TR-TEST/i }) as HTMLTextAreaElement;
    expect(textarea.value).toContain("Escalation required");
    expect(textarea.value).toContain("COST_THRESHOLD");
  });

  it("pre-populated note is ≥10 chars so approve button is NOT blocked on initial render", () => {
    render(<TTQueuePanel tt={makeTT([makeItem()])} />);
    // Buttons are enabled by default because the pre-populated note meets the minimum.
    expect(screen.getByTestId("tt-approve-TR-TEST")).not.toBeDisabled();
  });

  it("pre-populated note is editable — manager can change it before deciding", () => {
    const decideTravel = jest.fn();
    const tt = { ...makeTT([makeItem()]), decideTravel };
    render(<TTQueuePanel tt={tt} />);
    const textarea = screen.getByRole("textbox", { name: /decision note for TR-TEST/i });
    fireEvent.change(textarea, { target: { value: "Manager override: approved with conditions." } });
    fireEvent.click(screen.getByTestId("tt-approve-TR-TEST"));
    expect(decideTravel).toHaveBeenCalledWith("TR-TEST", "APPROVED", "Manager override: approved with conditions.");
  });
});

// ---- D1 (WE-10): draft panel ----------------------------------------------

describe("TTQueuePanel — D1 (WE-10): draft panel after decision", () => {
  it("decided item with draftStatus='loading' shows 'Generating draft…'", () => {
    const item = makeItem({ request: { ...makeItem().request, status: "APPROVED" }, draftStatus: "loading" });
    render(<TTQueuePanel tt={makeTT([item])} />);
    expect(screen.getByTestId("tt-draft-loading-TR-TEST")).toBeTruthy();
    expect(screen.getByText(/generating draft/i)).toBeTruthy();
  });

  it("decided item with draftStatus='done' shows communication type and body", () => {
    const item = makeItem({
      request: { ...makeItem().request, status: "APPROVED" },
      draftStatus: "done",
      draft: {
        communication_type: "APPROVAL_NOTICE",
        subject: "Your travel request has been approved",
        body: "Dear traveler, your request to Denver has been approved and funded.",
      },
      draftTier: "live",
    });
    render(<TTQueuePanel tt={makeTT([item])} />);
    expect(screen.getByTestId("tt-draft-done-TR-TEST")).toBeTruthy();
    expect(screen.getByText(/APPROVAL_NOTICE/)).toBeTruthy();
    expect(screen.getByText(/Your travel request has been approved/)).toBeTruthy();
    expect(screen.getByText(/approved and funded/)).toBeTruthy();
    expect(screen.getByText(/via live/)).toBeTruthy();
  });

  it("decided item with draftStatus='error' shows error message", () => {
    const item = makeItem({
      request: { ...makeItem().request, status: "APPROVED" },
      draftStatus: "error",
      draftError: "LLM service unavailable",
    });
    render(<TTQueuePanel tt={makeTT([item])} />);
    expect(screen.getByTestId("tt-draft-error-TR-TEST")).toBeTruthy();
    expect(screen.getByText(/LLM service unavailable/)).toBeTruthy();
  });

  it("decided item with draftStatus='idle' shows no draft panel (drafter not wired)", () => {
    const item = makeItem({ request: { ...makeItem().request, status: "APPROVED" }, draftStatus: "idle" });
    render(<TTQueuePanel tt={makeTT([item])} />);
    expect(screen.queryByTestId("tt-draft-loading-TR-TEST")).toBeNull();
    expect(screen.queryByTestId("tt-draft-done-TR-TEST")).toBeNull();
    expect(screen.queryByTestId("tt-draft-error-TR-TEST")).toBeNull();
  });

  it("ROUTED item shows decision form, not draft panel", () => {
    render(<TTQueuePanel tt={makeTT([makeItem()])} />);
    expect(screen.getByTestId("tt-approve-TR-TEST")).toBeTruthy();
    expect(screen.queryByTestId("tt-draft-done-TR-TEST")).toBeNull();
    expect(screen.queryByTestId("tt-draft-loading-TR-TEST")).toBeNull();
  });
});

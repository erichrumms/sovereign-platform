/**
 * module-nexus — tt-intake.test.ts (Session 29, D1)
 * The pure form-to-entity builders: computed totals always satisfy the entity
 * validators, invalid numeric input is rejected before an entity exists, and
 * the TT intake taxonomy stays module-local (WE-1 governance check).
 */
import {
  TT_INTAKE_TYPES,
  isTTIntakeType,
  buildTravelRequest,
  buildTimeRecord,
  EMPTY_TRAVEL_FORM,
  type TravelIntakeForm,
  type TimeIntakeForm,
} from "../src/tt-intake";
import { WORK_REQUEST_TYPES } from "../src/nexus-contract";

const NOW = "2026-07-12T09:00:00.000Z";

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

function timeForm(over: Partial<TimeIntakeForm> = {}): TimeIntakeForm {
  return {
    period_start: "2026-07-06",
    period_end: "2026-07-10",
    entries: [
      { entry_date: "2026-07-06", cost_code: "SYNTH-CC-1001", hours: "8", charge_type: "DIRECT", holiday: false, justification: "" },
      { entry_date: "2026-07-07", cost_code: "SYNTH-CC-1001", hours: "8", charge_type: "DIRECT", holiday: false, justification: "" },
    ],
    ...over,
  };
}

describe("TT intake taxonomy — module-local (WE-1 governance check)", () => {
  it("offers exactly TRAVEL_REQUEST and TIME_RECORD, disjoint from WorkRequestType", () => {
    expect(TT_INTAKE_TYPES).toEqual(["TRAVEL_REQUEST", "TIME_RECORD"]);
    for (const t of TT_INTAKE_TYPES) {
      expect(WORK_REQUEST_TYPES as readonly string[]).not.toContain(t);
      expect(isTTIntakeType(t)).toBe(true);
    }
    expect(isTTIntakeType("DOCUMENT_REVIEW")).toBe(false);
  });
});

describe("buildTravelRequest", () => {
  it("builds a validated SUBMITTED request with total_cost computed from the breakdown", () => {
    const built = buildTravelRequest(travelForm(), "TR-1", "E-900", NOW);
    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.value.status).toBe("SUBMITTED");
    expect(built.value.total_cost).toBe(950);
    expect(built.value.submitted_at).toBe(NOW);
    expect(built.value.special_authority_category).toBeUndefined();
  });

  it("carries the special authority category only when supplied", () => {
    const built = buildTravelRequest(
      travelForm({ special_authority_category: "FOREIGN_LIAISON" }),
      "TR-2",
      "E-900",
      NOW
    );
    expect(built.ok).toBe(true);
    if (built.ok) expect(built.value.special_authority_category).toBe("FOREIGN_LIAISON");
  });

  it("rejects a non-numeric or negative cost before any entity exists", () => {
    const bad = buildTravelRequest(travelForm({ hotel: "abc" }), "TR-3", "E-900", NOW);
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.errors.join(" ")).toContain("hotel");
    const negative = buildTravelRequest(travelForm({ airfare: "-5" }), "TR-4", "E-900", NOW);
    expect(negative.ok).toBe(false);
  });

  it("surfaces the entity validator's errors (end date before start)", () => {
    const bad = buildTravelRequest(
      travelForm({ travel_end_date: "2026-08-01" }),
      "TR-5",
      "E-900",
      NOW
    );
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.errors.join(" ")).toContain("travel_end_date");
  });
});

describe("buildTimeRecord", () => {
  it("builds a validated record with total_hours computed from the entries", () => {
    const built = buildTimeRecord(timeForm(), "TM-1", "E-900", NOW);
    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.value.total_hours).toBe(16);
    expect(built.value.submitted_at).toBe(NOW);
    expect(built.value.entries[0].justification).toBeUndefined();
  });

  it("rejects a non-positive or non-numeric hours value", () => {
    const zero = timeForm();
    zero.entries[0].hours = "0";
    expect(buildTimeRecord(zero, "TM-2", "E-900", NOW).ok).toBe(false);
    const text = timeForm();
    text.entries[0].hours = "eight";
    expect(buildTimeRecord(text, "TM-3", "E-900", NOW).ok).toBe(false);
  });

  it("surfaces the entity validator's errors (period end before start)", () => {
    const bad = buildTimeRecord(timeForm({ period_end: "2026-07-01" }), "TM-4", "E-900", NOW);
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.errors.join(" ")).toContain("period_end");
  });
});

/**
 * SOVEREIGN Platform — module-nexus
 * tt-intake.ts — Time & Travel intake: form-to-entity builders (Session 29, D1).
 *
 * Walkthrough E finding WE-1: no traveler-facing intake existed anywhere in the
 * live UI. This module closes that gap on the logic side — pure, deterministic
 * builders that turn intake-form field values into validated canonical entities
 * (TravelRequest / TimeRecord from @sovereign/data). No Logger emission here;
 * emission lives in useTTIntake (the integration layer), mirroring the Session 28
 * tt-travel-queue pattern of keeping pure logic pure.
 *
 * GOVERNANCE (Session 29 D1 check, documented in the handoff): the request-type
 * taxonomy extended here is MODULE-LOCAL. WorkRequestType (nexus-contract.ts) is
 * not a shell-contract type — verified by direct grep of shell-contract.ts before
 * this file was written. The two TT intake types are deliberately NOT added to
 * WorkRequestType: a TravelRequest/TimeRecord is a canonical D-TT3 entity with
 * its own lifecycle (docs/17 §5/§6), not a WorkRequest, and must never enter the
 * GD-11 NEXUS_REQUEST_* state machine.
 *
 * Version: 1.0 · Session 29 · July 12, 2026
 */

import {
  validateTravelRequest,
  validateTimeRecord,
  type TravelRequest,
  type TravelCostBreakdown,
  type TimeRecord,
  type TimeRecordEntry,
  type ChargeAccountType,
} from "@sovereign/data";

// ============================================================
// TT INTAKE TAXONOMY — module-local (see governance note above)
// ============================================================

export const TT_INTAKE_TYPES = ["TRAVEL_REQUEST", "TIME_RECORD"] as const;
export type TTIntakeType = (typeof TT_INTAKE_TYPES)[number];

export function isTTIntakeType(value: string): value is TTIntakeType {
  return (TT_INTAKE_TYPES as readonly string[]).includes(value);
}

// ============================================================
// TRAVEL REQUEST INTAKE (docs/17 §5.1 submission fields)
// ============================================================

/** Raw travel-form field values (numeric fields arrive as strings from inputs). */
export interface TravelIntakeForm {
  destination: string;
  international: boolean;
  travel_start_date: string;
  travel_end_date: string;
  mission_purpose: string;
  airfare: string;
  hotel: string;
  per_diem: string;
  ground_transport: string;
  registration_fees: string;
  personal_day_included: boolean;
  /** Empty string = no special authority category. */
  special_authority_category: string;
  justification: string;
}

export const EMPTY_TRAVEL_FORM: TravelIntakeForm = {
  destination: "",
  international: false,
  travel_start_date: "",
  travel_end_date: "",
  mission_purpose: "",
  airfare: "0",
  hotel: "0",
  per_diem: "0",
  ground_transport: "0",
  registration_fees: "0",
  personal_day_included: false,
  special_authority_category: "",
  justification: "",
};

export type BuildResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] };

function parseAmount(label: string, raw: string, errors: string[]): number {
  const n = Number(raw);
  if (raw.trim() === "" || !Number.isFinite(n) || n < 0) {
    errors.push(`${label}: must be a non-negative number`);
    return 0;
  }
  return n;
}

/**
 * Build a validated SUBMITTED TravelRequest from the form. total_cost is
 * computed here (never typed by the traveler) so it always equals the itemized
 * sum the entity validator enforces. `nowIso` is caller-supplied so this stays
 * a pure function of its inputs.
 */
export function buildTravelRequest(
  form: TravelIntakeForm,
  requestId: string,
  employeeId: string,
  nowIso: string
): BuildResult<TravelRequest> {
  const errors: string[] = [];
  const costs: TravelCostBreakdown = {
    airfare: parseAmount("airfare", form.airfare, errors),
    hotel: parseAmount("hotel", form.hotel, errors),
    per_diem: parseAmount("per_diem", form.per_diem, errors),
    ground_transport: parseAmount("ground_transport", form.ground_transport, errors),
    registration_fees: parseAmount("registration_fees", form.registration_fees, errors),
  };
  if (errors.length > 0) return { ok: false, errors };

  const request: TravelRequest = {
    request_id: requestId,
    employee_id: employeeId,
    destination: form.destination.trim(),
    international: form.international,
    travel_start_date: form.travel_start_date,
    travel_end_date: form.travel_end_date,
    mission_purpose: form.mission_purpose.trim(),
    costs,
    total_cost: costs.airfare + costs.hotel + costs.per_diem + costs.ground_transport + costs.registration_fees,
    personal_day_included: form.personal_day_included,
    justification: form.justification.trim(),
    status: "SUBMITTED",
    submitted_at: nowIso,
  };
  const category = form.special_authority_category.trim();
  if (category !== "") request.special_authority_category = category;

  const check = validateTravelRequest(request);
  return check.valid ? { ok: true, value: request } : { ok: false, errors: check.errors };
}

// ============================================================
// TIME RECORD INTAKE (docs/17 §6 — one record per employee per pay period)
// ============================================================

/** Raw entry-row field values. */
export interface TimeEntryForm {
  entry_date: string;
  cost_code: string;
  hours: string;
  charge_type: ChargeAccountType;
  holiday: boolean;
  /** Empty string = no justification narrative supplied. */
  justification: string;
}

export const EMPTY_TIME_ENTRY: TimeEntryForm = {
  entry_date: "",
  cost_code: "",
  hours: "8",
  charge_type: "DIRECT",
  holiday: false,
  justification: "",
};

export interface TimeIntakeForm {
  period_start: string;
  period_end: string;
  entries: TimeEntryForm[];
}

export const EMPTY_TIME_FORM: TimeIntakeForm = {
  period_start: "",
  period_end: "",
  entries: [{ ...EMPTY_TIME_ENTRY }],
};

/**
 * Build a validated TimeRecord from the form. total_hours is computed here so it
 * always equals the entry sum the entity validator enforces. `nowIso` becomes
 * submitted_at (a form submission IS the submission event).
 */
export function buildTimeRecord(
  form: TimeIntakeForm,
  recordId: string,
  employeeId: string,
  nowIso: string
): BuildResult<TimeRecord> {
  const errors: string[] = [];
  const entries: TimeRecordEntry[] = form.entries.map((row, i) => {
    const hours = Number(row.hours);
    if (row.hours.trim() === "" || !Number.isFinite(hours) || hours <= 0) {
      errors.push(`entries[${i}].hours: must be a positive number`);
    }
    const entry: TimeRecordEntry = {
      entry_date: row.entry_date,
      cost_code: row.cost_code.trim(),
      hours: Number.isFinite(hours) ? hours : 0,
      charge_type: row.charge_type,
      holiday: row.holiday,
    };
    const justification = row.justification.trim();
    if (justification !== "") entry.justification = justification;
    return entry;
  });
  if (errors.length > 0) return { ok: false, errors };

  const record: TimeRecord = {
    record_id: recordId,
    employee_id: employeeId,
    period_start: form.period_start,
    period_end: form.period_end,
    entries,
    total_hours: entries.reduce((acc, e) => acc + e.hours, 0),
    submitted_at: nowIso,
  };

  const check = validateTimeRecord(record);
  return check.valid ? { ok: true, value: record } : { ok: false, errors: check.errors };
}

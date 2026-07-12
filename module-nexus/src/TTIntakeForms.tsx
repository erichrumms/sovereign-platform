/**
 * SOVEREIGN Platform — module-nexus
 * TTIntakeForms.tsx — the Time & Travel intake form bodies (Session 29, D1).
 *
 * Rendered by RequestIntakePanel when the operator selects TRAVEL_REQUEST or
 * TIME_RECORD in the request-type dropdown (Walkthrough E finding WE-1: the
 * form adapts per type). Travel fields per docs/17 §5.1; time-record fields per
 * docs/17 §6. Includes the real-time policy preview (docs/17 §5.1): as the
 * travel form is completed, the compliance engine evaluates the current state
 * and surfaces which requirements are met and which would trigger escalation —
 * BEFORE submission, purely, with no Logger events.
 *
 * Version: 1.0 · Session 29 · July 12, 2026
 */

import { useState, type CSSProperties } from "react";

import type { ChargeAccountType } from "@sovereign/data";
import {
  EMPTY_TRAVEL_FORM,
  EMPTY_TIME_ENTRY,
  EMPTY_TIME_FORM,
  type TravelIntakeForm,
  type TimeIntakeForm,
} from "./tt-intake";
import type { UseTTIntake } from "./useTTIntake";

// ============================================================
// TRAVEL REQUEST FORM (docs/17 §5.1)
// ============================================================

export function TravelIntakeFormBody({ tt }: { tt: UseTTIntake }): JSX.Element {
  const [form, setForm] = useState<TravelIntakeForm>({ ...EMPTY_TRAVEL_FORM });
  const set = <K extends keyof TravelIntakeForm>(key: K, value: TravelIntakeForm[K]): void =>
    setForm((f) => ({ ...f, [key]: value }));

  const preview = tt.previewTravel(form);

  const onSubmit = (): void => {
    tt.submitTravel(form);
    setForm({ ...EMPTY_TRAVEL_FORM });
  };

  return (
    <div data-testid="tt-travel-form" style={colStyle}>
      <div style={rowStyle}>
        <input aria-label="destination" placeholder="Destination" value={form.destination} onChange={(e) => set("destination", e.target.value)} style={inputStyle} />
        <label style={checkLabelStyle}>
          <input aria-label="international destination" type="checkbox" checked={form.international} onChange={(e) => set("international", e.target.checked)} />
          International
        </label>
      </div>
      <div style={rowStyle}>
        <label style={fieldLabelStyle}>
          Travel start
          <input aria-label="travel start date" type="date" value={form.travel_start_date} onChange={(e) => set("travel_start_date", e.target.value)} style={inputStyle} />
        </label>
        <label style={fieldLabelStyle}>
          Travel end
          <input aria-label="travel end date" type="date" value={form.travel_end_date} onChange={(e) => set("travel_end_date", e.target.value)} style={inputStyle} />
        </label>
      </div>
      <input aria-label="mission purpose" placeholder="Mission purpose" value={form.mission_purpose} onChange={(e) => set("mission_purpose", e.target.value)} style={inputStyle} />

      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>Itemized costs (whole currency units)</legend>
        <div style={rowStyle}>
          {(["airfare", "hotel", "per_diem", "ground_transport", "registration_fees"] as const).map((key) => (
            <label key={key} style={fieldLabelStyle}>
              {key.replace(/_/g, " ")}
              <input aria-label={`cost ${key}`} inputMode="numeric" value={form[key]} onChange={(e) => set(key, e.target.value)} style={costInputStyle} />
            </label>
          ))}
        </div>
      </fieldset>

      <div style={rowStyle}>
        <label style={checkLabelStyle}>
          <input aria-label="personal day included" type="checkbox" checked={form.personal_day_included} onChange={(e) => set("personal_day_included", e.target.checked)} />
          Personal day included
        </label>
        <input aria-label="special authority category" placeholder="Special authority category (optional)" value={form.special_authority_category} onChange={(e) => set("special_authority_category", e.target.value)} style={inputStyle} />
      </div>
      <textarea aria-label="justification" placeholder="Justification narrative" value={form.justification} onChange={(e) => set("justification", e.target.value)} rows={2} style={textareaStyle} />

      {/* Real-time policy preview (docs/17 §5.1) — pure evaluation, no Logger events. */}
      {preview && (
        <div data-testid="tt-policy-preview" style={previewStyle}>
          <strong>Policy preview:</strong> routing tier {preview.routing_tier} · authority {preview.required_authority}
          {preview.hard_exceptions.length > 0 && <> · hard exceptions: {preview.hard_exceptions.join(", ")}</>}
          {preview.soft_flags.length > 0 && <> · soft flags: {preview.soft_flags.join(", ")}</>}
          {preview.hard_exceptions.length === 0 && preview.soft_flags.length === 0 && <> · all policy rules currently satisfied</>}
        </div>
      )}

      <div>
        <button type="button" data-testid="tt-submit-travel" onClick={onSubmit} style={submitBtnStyle}>
          Submit Travel Request
        </button>
      </div>
    </div>
  );
}

// ============================================================
// TIME RECORD FORM (docs/17 §6)
// ============================================================

const CHARGE_TYPES: readonly ChargeAccountType[] = ["DIRECT", "INDIRECT"];

export function TimeIntakeFormBody({ tt }: { tt: UseTTIntake }): JSX.Element {
  const [form, setForm] = useState<TimeIntakeForm>({
    ...EMPTY_TIME_FORM,
    entries: [{ ...EMPTY_TIME_ENTRY }],
  });

  const setEntry = (index: number, patch: Partial<TimeIntakeForm["entries"][number]>): void =>
    setForm((f) => ({
      ...f,
      entries: f.entries.map((e, i) => (i === index ? { ...e, ...patch } : e)),
    }));

  const addEntry = (): void =>
    setForm((f) => ({ ...f, entries: [...f.entries, { ...EMPTY_TIME_ENTRY }] }));

  const removeEntry = (index: number): void =>
    setForm((f) => ({ ...f, entries: f.entries.filter((_, i) => i !== index) }));

  const onSubmit = (): void => {
    tt.submitTime(form);
    setForm({ ...EMPTY_TIME_FORM, entries: [{ ...EMPTY_TIME_ENTRY }] });
  };

  return (
    <div data-testid="tt-time-form" style={colStyle}>
      <div style={rowStyle}>
        <label style={fieldLabelStyle}>
          Period start
          <input aria-label="period start" type="date" value={form.period_start} onChange={(e) => setForm((f) => ({ ...f, period_start: e.target.value }))} style={inputStyle} />
        </label>
        <label style={fieldLabelStyle}>
          Period end
          <input aria-label="period end" type="date" value={form.period_end} onChange={(e) => setForm((f) => ({ ...f, period_end: e.target.value }))} style={inputStyle} />
        </label>
      </div>

      {form.entries.map((entry, i) => (
        <div key={i} data-testid={`tt-time-entry-${i}`} style={entryRowStyle}>
          <input aria-label={`entry ${i} date`} type="date" value={entry.entry_date} onChange={(e) => setEntry(i, { entry_date: e.target.value })} style={inputStyle} />
          <input aria-label={`entry ${i} cost code`} placeholder="Cost code" value={entry.cost_code} onChange={(e) => setEntry(i, { cost_code: e.target.value })} style={costInputStyle} />
          <input aria-label={`entry ${i} hours`} inputMode="numeric" value={entry.hours} onChange={(e) => setEntry(i, { hours: e.target.value })} style={hoursInputStyle} />
          <select aria-label={`entry ${i} charge type`} value={entry.charge_type} onChange={(e) => setEntry(i, { charge_type: e.target.value as ChargeAccountType })} style={inputStyle}>
            {CHARGE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <label style={checkLabelStyle}>
            <input aria-label={`entry ${i} holiday`} type="checkbox" checked={entry.holiday} onChange={(e) => setEntry(i, { holiday: e.target.checked })} />
            Holiday
          </label>
          <input aria-label={`entry ${i} justification`} placeholder="Justification (if required)" value={entry.justification} onChange={(e) => setEntry(i, { justification: e.target.value })} style={inputStyle} />
          {form.entries.length > 1 && (
            <button type="button" aria-label={`remove entry ${i}`} onClick={() => removeEntry(i)} style={minorBtnStyle}>
              Remove
            </button>
          )}
        </div>
      ))}

      <div style={rowStyle}>
        <button type="button" data-testid="tt-add-entry" onClick={addEntry} style={minorBtnStyle}>
          Add entry
        </button>
        <button type="button" data-testid="tt-submit-time" onClick={onSubmit} style={submitBtnStyle}>
          Submit Time Record
        </button>
      </div>
    </div>
  );
}

// ── styles (light background; contrast pairs verified in the Session 29 D2 audit) ──
const colStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 10, maxWidth: 820 };
const rowStyle: CSSProperties = { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" };
const entryRowStyle: CSSProperties = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", padding: "6px 8px", border: "1px solid #e2e8f0", borderRadius: 6 };
const inputStyle: CSSProperties = { padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 };
const costInputStyle: CSSProperties = { ...inputStyle, width: 110 };
const hoursInputStyle: CSSProperties = { ...inputStyle, width: 64 };
const textareaStyle: CSSProperties = { ...inputStyle, fontFamily: "inherit", maxWidth: 820 };
const fieldLabelStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 2, fontSize: 12, color: "#334155" };
const checkLabelStyle: CSSProperties = { display: "flex", gap: 6, alignItems: "center", fontSize: 13, color: "#0f172a" };
const fieldsetStyle: CSSProperties = { border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", margin: 0 };
const legendStyle: CSSProperties = { fontSize: 12, color: "#334155", padding: "0 4px" };
const previewStyle: CSSProperties = { padding: "8px 12px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, color: "#1e40af", fontSize: 13 };
const submitBtnStyle: CSSProperties = { padding: "6px 14px", borderRadius: 6, border: "1px solid #0c4a6e", background: "#0c4a6e", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 };
const minorBtnStyle: CSSProperties = { padding: "5px 10px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", cursor: "pointer", fontSize: 12 };

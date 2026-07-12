/**
 * SOVEREIGN Platform — module-nexus
 * TTQueuePanel.tsx — the Time & Travel authority queue surface (Session 29, D1).
 *
 * Shows every submitted travel request with its compliance finding (rule cited,
 * actual value, threshold — docs/17 §5.3) and lets the approval authority record
 * the decision on a ROUTED request — recordTravelDecision is the ONLY path to
 * APPROVED/DENIED/ESCALATED (HUMAN_DECISION · TRAVEL_APPROVAL, GD-21). Also shows
 * submitted time records with the flags tt.time-compliance-engine raised.
 *
 * THE SYSTEM PREPARES; THE HUMAN DECIDES (docs/17 §1): nothing here acts
 * automatically. Decision notes are required (the VIGIL ≥10-char discipline).
 *
 * Session 30:
 *   D1 (WE-10) — draft panel: after a decision is recorded, the tt.travel-drafter
 *     engine (wired at the composition root) produces a communication draft shown
 *     inline. draftStatus tracks the async lifecycle: idle / loading / done / error.
 *   D2 (WE-11) — required-field indicator: visible label + inline error when note
 *     field is touched but < NOTE_MIN_CHARS (mirrors VIGIL's ApprovalDecisionPanel).
 *   D3 (WE-12) — pre-populated note: note initialises from buildDefaultNote() which
 *     summarises the compliance finding already on-screen, editable by the manager.
 *     NOTE: this note is AUDIT-ONLY — it is NOT fed into the draft. The draft is
 *     grounded in TravelRequest + ComplianceFlag data only (governed factual data).
 *
 * Version: 1.1 · Session 30 · July 12, 2026
 */

import { useState, type CSSProperties } from "react";

import type { SubmittedTravelItem, SubmittedTimeItem, TravelComplianceFinding, UseTTIntake } from "./useTTIntake";
import type { TravelDecisionOutcome } from "./tt-travel-queue";

const NOTE_MIN_CHARS = 10;

/**
 * D3 (WE-12): builds a meaningful default note from the finding already on-screen.
 * This pre-populates the manager's decision note field so it is always ≥10 chars
 * and surfaces the most relevant compliance context. The note is AUDIT-ONLY — it
 * never feeds into the tt.travel-drafter communication (the draft is sourced from
 * TravelRequest + ComplianceFlag governed data only).
 */
function buildDefaultNote(finding: TravelComplianceFinding): string {
  if (finding.hard_exceptions.length > 0) {
    return `Hard exception: ${finding.hard_exceptions.join(", ")}.`;
  }
  if (finding.routing_tier === "ESCALATE" && finding.findings.length > 0) {
    const f = finding.findings[0];
    return `Escalation required: ${f.rule_category} — ${f.actual_value} vs. ${f.threshold_value}.`;
  }
  if (finding.soft_flags.length > 0) {
    return `Policy flag raised: ${finding.soft_flags.join(", ")}.`;
  }
  if (finding.routing_tier === "FLAGGED" && finding.findings.length > 0) {
    return `Policy flag: ${finding.findings[0].rule_category}.`;
  }
  return "All policy rules satisfied.";
}

export function TTQueuePanel({ tt }: { tt: UseTTIntake }): JSX.Element {
  return (
    <section aria-label="Travel and Time Queue" style={colStyle}>
      <h2 style={h2Style}>Travel requests — authority queue</h2>
      {tt.travelItems.length === 0 ? (
        <p style={emptyStyle}>No travel requests submitted this session.</p>
      ) : (
        tt.travelItems.map((item) => <TravelQueueRow key={item.request.request_id} item={item} tt={tt} />)
      )}

      <h2 style={h2Style}>Time records — compliance results</h2>
      {tt.timeItems.length === 0 ? (
        <p style={emptyStyle}>No time records submitted this session.</p>
      ) : (
        tt.timeItems.map((item) => <TimeQueueRow key={item.record.record_id} item={item} />)
      )}

      {tt.error ? <p role="alert" style={errorStyle}>{tt.error}</p> : null}
    </section>
  );
}

function TravelQueueRow({ item, tt }: { item: SubmittedTravelItem; tt: UseTTIntake }): JSX.Element {
  // D3 (WE-12): pre-populate from the finding the manager already sees on-screen.
  const [note, setNote] = useState(() => buildDefaultNote(item.finding));
  // D2 (WE-11): touched state — error only shows after the manager has interacted with the field.
  const [touched, setTouched] = useState(false);

  const { request, finding } = item;
  const decidable = request.status === "ROUTED";
  const noteOk = note.trim().length >= NOTE_MIN_CHARS;
  const showError = touched && !noteOk;

  const decide = (outcome: TravelDecisionOutcome): void => {
    tt.decideTravel(request.request_id, outcome, note.trim());
  };

  return (
    <div data-testid={`tt-queue-travel-${request.request_id}`} style={cardStyle}>
      <div style={cardHeadStyle}>
        <strong>{request.request_id}</strong> · {request.destination} · {request.total_cost} total ·{" "}
        <span style={tierStyle(finding.routing_tier)}>{finding.routing_tier}</span> · authority{" "}
        {finding.required_authority} · status <strong>{request.status}</strong>
      </div>
      <ul style={findingListStyle}>
        {finding.findings.length === 0 && <li>All policy rules satisfied — no findings.</li>}
        {finding.findings.map((f) => (
          <li key={f.flag_id}>
            <strong>{f.rule_category}</strong> ({f.severity}) — {f.rule_citation}: {f.actual_value} vs. {f.threshold_value}
          </li>
        ))}
      </ul>

      {decidable && (
        <div style={decisionAreaStyle}>
          {/* D2 (WE-11): visible label with required indicator — mirrors VIGIL's ApprovalDecisionPanel. */}
          <label style={noteLabelStyle} htmlFor={`note-${request.request_id}`}>
            Decision note{" "}
            <span style={reqIndicatorStyle} aria-label="required">(required, ≥{NOTE_MIN_CHARS} chars)</span>
          </label>
          <textarea
            id={`note-${request.request_id}`}
            aria-label={`decision note for ${request.request_id}`}
            aria-required="true"
            aria-invalid={showError}
            aria-describedby={showError ? `note-err-${request.request_id}` : undefined}
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              if (!touched) setTouched(true);
            }}
            onBlur={() => setTouched(true)}
            rows={3}
            style={textareaStyle}
          />
          {/* D2 (WE-11): inline error — only shown after interaction, never silently gated. */}
          {showError && (
            <p id={`note-err-${request.request_id}`} role="alert" style={noteErrorStyle}>
              Decision note is required and must be at least {NOTE_MIN_CHARS} characters
              {note.trim().length > 0 ? ` (currently ${note.trim().length})` : ""}.
            </p>
          )}
          <div style={decisionRowStyle}>
            <button type="button" data-testid={`tt-approve-${request.request_id}`} disabled={!noteOk} onClick={() => decide("APPROVED")} style={approveBtnStyle}>
              Approve
            </button>
            <button type="button" data-testid={`tt-deny-${request.request_id}`} disabled={!noteOk} onClick={() => decide("DENIED")} style={denyBtnStyle}>
              Deny
            </button>
            <button type="button" data-testid={`tt-escalate-${request.request_id}`} disabled={!noteOk} onClick={() => decide("ESCALATED")} style={escalateBtnStyle}>
              Escalate
            </button>
          </div>
        </div>
      )}

      {/* D1 (WE-10): draft panel — appears after the manager's decision. */}
      {!decidable && <DraftPanel item={item} />}
    </div>
  );
}

function DraftPanel({ item }: { item: SubmittedTravelItem }): JSX.Element | null {
  const { draftStatus, draft, draftTier, draftError } = item;
  if (!draftStatus || draftStatus === "idle") return null;

  if (draftStatus === "loading") {
    return (
      <div style={draftPanelStyle} aria-live="polite" aria-busy="true" data-testid={`tt-draft-loading-${item.request.request_id}`}>
        <span style={draftHeaderStyle}>Communication draft</span>
        <p style={draftBodyStyle}>Generating draft via tt.travel-drafter…</p>
      </div>
    );
  }

  if (draftStatus === "error") {
    return (
      <div style={{ ...draftPanelStyle, borderColor: "#fca5a5" }} role="alert" data-testid={`tt-draft-error-${item.request.request_id}`}>
        <span style={draftHeaderStyle}>Communication draft — error</span>
        <p style={{ ...draftBodyStyle, color: "#b91c1c" }}>{draftError ?? "Draft generation failed."}</p>
      </div>
    );
  }

  if (draftStatus === "done" && draft) {
    return (
      <div style={draftPanelStyle} data-testid={`tt-draft-done-${item.request.request_id}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={draftHeaderStyle}>Communication draft · {draft.communication_type}</span>
          {draftTier && <span style={draftTierStyle}>via {draftTier}</span>}
        </div>
        {draft.subject && <p style={draftSubjectStyle}><strong>Subject:</strong> {draft.subject}</p>}
        <pre style={draftBodyStyle}>{draft.body}</pre>
      </div>
    );
  }

  return null;
}

function TimeQueueRow({ item }: { item: SubmittedTimeItem }): JSX.Element {
  const { record, flags, evaluated } = item;
  return (
    <div data-testid={`tt-queue-time-${record.record_id}`} style={cardStyle}>
      <div style={cardHeadStyle}>
        <strong>{record.record_id}</strong> · {record.period_start} → {record.period_end} · {record.total_hours} hours ·{" "}
        {evaluated ? (flags.length === 0 ? "no compliance flags" : `${flags.length} flag(s) raised`) : "recorded — compliance evaluation not wired"}
      </div>
      {flags.length > 0 && (
        <ul style={findingListStyle}>
          {flags.map((f) => (
            <li key={f.flag_id}>
              <strong>{f.rule_category}</strong> ({f.severity}) — {f.rule_citation}: {f.actual_value} vs. {f.threshold_value}
              {f.recurrence_count > 1 ? ` · occurrence ${f.recurrence_count}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function tierStyle(tier: string): CSSProperties {
  if (tier === "ESCALATE") return { color: "#b91c1c", fontWeight: 700 };
  if (tier === "FLAGGED") return { color: "#854d0e", fontWeight: 700 };
  return { color: "#065f46", fontWeight: 700 };
}

const colStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 10, maxWidth: 900 };
const h2Style: CSSProperties = { margin: "6px 0 0", fontSize: 14, color: "#0f172a" };
const emptyStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#334155" };
const cardStyle: CSSProperties = { border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 };
const cardHeadStyle: CSSProperties = { fontSize: 13, color: "#0f172a" };
const findingListStyle: CSSProperties = { margin: 0, paddingLeft: 18, fontSize: 12, color: "#334155" };
const decisionAreaStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 4, marginTop: 4 };
const noteLabelStyle: CSSProperties = { fontSize: 12, fontWeight: 600, color: "#0f172a" };
const reqIndicatorStyle: CSSProperties = { color: "#dc2626", fontWeight: 400 };
const textareaStyle: CSSProperties = { padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12, width: "100%", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" };
const noteErrorStyle: CSSProperties = { margin: 0, fontSize: 12, color: "#dc2626", fontWeight: 500 };
const decisionRowStyle: CSSProperties = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const approveBtnStyle: CSSProperties = { padding: "5px 12px", borderRadius: 6, border: "1px solid #047857", background: "#047857", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 };
const denyBtnStyle: CSSProperties = { padding: "5px 12px", borderRadius: 6, border: "1px solid #b91c1c", background: "#b91c1c", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 };
const escalateBtnStyle: CSSProperties = { padding: "5px 12px", borderRadius: 6, border: "1px solid #b45309", background: "#b45309", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 };
const errorStyle: CSSProperties = { margin: 0, color: "#b91c1c", fontSize: 13, fontWeight: 600 };
const draftPanelStyle: CSSProperties = { border: "1px solid #bfdbfe", borderRadius: 6, padding: "8px 12px", background: "#eff6ff", marginTop: 4, display: "flex", flexDirection: "column", gap: 4 };
const draftHeaderStyle: CSSProperties = { fontSize: 12, fontWeight: 700, color: "#1e40af" };
const draftTierStyle: CSSProperties = { fontSize: 11, color: "#64748b" };
const draftSubjectStyle: CSSProperties = { margin: 0, fontSize: 12, color: "#0f172a" };
const draftBodyStyle: CSSProperties = { margin: 0, fontSize: 12, color: "#334155", whiteSpace: "pre-wrap", fontFamily: "inherit" };

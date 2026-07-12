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
 * Version: 1.0 · Session 29 · July 12, 2026
 */

import { useState, type CSSProperties } from "react";

import type { SubmittedTravelItem, SubmittedTimeItem, UseTTIntake } from "./useTTIntake";
import type { TravelDecisionOutcome } from "./tt-travel-queue";

const NOTE_MIN_CHARS = 10;

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
  const [note, setNote] = useState("");
  const { request, finding } = item;
  const decidable = request.status === "ROUTED";
  const noteOk = note.trim().length >= NOTE_MIN_CHARS;

  const decide = (outcome: TravelDecisionOutcome): void => {
    tt.decideTravel(request.request_id, outcome, note.trim());
    setNote("");
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
        <div style={decisionRowStyle}>
          <input
            aria-label={`decision note for ${request.request_id}`}
            placeholder={`Decision note (min ${NOTE_MIN_CHARS} chars)`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={inputStyle}
          />
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
      )}
    </div>
  );
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
const decisionRowStyle: CSSProperties = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const inputStyle: CSSProperties = { padding: "5px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12, minWidth: 260 };
const approveBtnStyle: CSSProperties = { padding: "5px 12px", borderRadius: 6, border: "1px solid #047857", background: "#047857", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 };
const denyBtnStyle: CSSProperties = { padding: "5px 12px", borderRadius: 6, border: "1px solid #b91c1c", background: "#b91c1c", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 };
const escalateBtnStyle: CSSProperties = { padding: "5px 12px", borderRadius: 6, border: "1px solid #b45309", background: "#b45309", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 };
const errorStyle: CSSProperties = { margin: 0, color: "#b91c1c", fontSize: 13, fontWeight: 600 };

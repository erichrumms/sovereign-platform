/**
 * SOVEREIGN Platform — module-vigil
 * AlertResponsePanel.tsx — the operator's response actions (spec §2.2).
 *
 * Acknowledge / Investigate / Resolve / Escalate / False-Positive. ACKNOWLEDGE is
 * required first (the others are disabled until the alert is acknowledged). Resolve /
 * Escalate / False-Positive require a note. Thin presenter — the emission, ordering,
 * and Gate-2 logic live in useAlertResponse; this component only collects input and
 * calls onRespond.
 *
 * Session 64 (WH-11/WH-12):
 *   WH-11: buttons are color-coded to match ApprovalDecisionPanel's visual hierarchy —
 *          Acknowledge is a green CTA; post-acknowledge decisions are color-coded.
 *   WH-12: reason-code chip row added above the note textarea (same pattern as
 *          ApprovalDecisionPanel and ObligationDecisionPanel).
 *
 * Version: 1.1 · Session 64 (WH-11 — visual hierarchy; WH-12 — reason chips) · July 25, 2026
 */

import { useState, type CSSProperties } from "react";

import type { AlertResponseAction, SecurityAlert } from "./vigil-types";
import { RESPONSE_NOTE_MIN_CHARS, type RespondResult } from "./useAlertResponse";

export interface AlertResponsePanelProps {
  alert: SecurityAlert;
  onRespond: (action: AlertResponseAction, note?: string) => RespondResult;
  error: string | null;
}

const NOTE_REQUIRED: readonly AlertResponseAction[] = ["RESOLVED", "ESCALATED", "FALSE_POSITIVE"];

const ALERT_REASON_CODES = [
  "Routine — matches expected pattern",
  "Investigated — no further action needed",
  "Escalating — confirmed security risk",
  "Marking false positive — not a genuine threat",
];

export function AlertResponsePanel({ alert, onRespond, error }: AlertResponsePanelProps): JSX.Element {
  const [note, setNote] = useState("");
  const acknowledged = alert.status !== "UNACKNOWLEDGED";

  function handle(action: AlertResponseAction): void {
    const result = onRespond(action, note);
    if (result.ok) setNote("");
  }

  return (
    <section style={panelStyle} aria-label="Alert Response">
      <h4 style={titleStyle}>Response</h4>

      {/* Primary action: Acknowledge (green CTA — required before any other action). */}
      <div style={rowStyle}>
        <button
          type="button"
          style={acknowledged ? buttonDisabledStyle : buttonAcknowledgeStyle}
          disabled={acknowledged}
          onClick={() => handle("ACKNOWLEDGED")}
        >
          {acknowledged ? "Acknowledged" : "Acknowledge"}
        </button>
        <button
          type="button"
          style={acknowledged ? buttonInvestigateStyle : buttonDisabledStyle}
          disabled={!acknowledged}
          onClick={() => handle("INVESTIGATING")}
        >
          Investigating
        </button>
      </div>

      {/* Reason-code chips — quick-insert for the note field. */}
      <div style={chipRowStyle} aria-label="Reason-code quick-insert">
        {ALERT_REASON_CODES.map((code) => (
          <button
            key={code}
            type="button"
            style={chipStyle}
            onClick={() => setNote((prev) => (prev.trim() ? prev.trim() + " " + code : code))}
          >
            {code}
          </button>
        ))}
      </div>

      <textarea
        aria-label="Response note"
        placeholder={`Note (required for Resolve / Escalate / False Positive — min ${RESPONSE_NOTE_MIN_CHARS} chars)`}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={noteStyle}
      />

      {/* Decision actions — color-coded: green Resolve, amber Escalate, slate False Positive. */}
      <div style={rowStyle}>
        <button
          type="button"
          style={acknowledged ? buttonResolveStyle : buttonDisabledStyle}
          disabled={!acknowledged}
          onClick={() => handle("RESOLVED")}
        >
          Resolve
        </button>
        <button
          type="button"
          style={acknowledged ? buttonEscalateStyle : buttonDisabledStyle}
          disabled={!acknowledged}
          onClick={() => handle("ESCALATED")}
        >
          Escalate
        </button>
        <button
          type="button"
          style={acknowledged ? buttonFalsePositiveStyle : buttonDisabledStyle}
          disabled={!acknowledged}
          onClick={() => handle("FALSE_POSITIVE")}
        >
          False Positive
        </button>
      </div>

      {NOTE_REQUIRED.length > 0 && (
        <p style={hintStyle}>
          Resolve, Escalate, and False Positive are recorded with the operator&apos;s identity and a required note.
          VIGIL advises; the operator decides (Gate&nbsp;3).
        </p>
      )}

      {error && (
        <p role="alert" style={errorStyle}>
          {error}
        </p>
      )}
    </section>
  );
}

const baseButtonStyle: CSSProperties = {
  padding: "7px 14px", borderRadius: 8, border: "1px solid", cursor: "pointer",
  fontSize: 13, fontWeight: 600,
};

const panelStyle: CSSProperties = {
  padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#ffffff", maxWidth: 720,
};
const titleStyle: CSSProperties = { margin: "0 0 8px", fontSize: 14 };
const rowStyle: CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 };

const buttonAcknowledgeStyle: CSSProperties = {
  ...baseButtonStyle, background: "#15803d", borderColor: "#15803d", color: "#fff",
};
const buttonInvestigateStyle: CSSProperties = {
  ...baseButtonStyle, background: "#1d4ed8", borderColor: "#1d4ed8", color: "#fff",
};
const buttonResolveStyle: CSSProperties = {
  ...baseButtonStyle, background: "#064e3b", borderColor: "#064e3b", color: "#fff",
};
const buttonEscalateStyle: CSSProperties = {
  ...baseButtonStyle, background: "#b45309", borderColor: "#b45309", color: "#fff",
};
const buttonFalsePositiveStyle: CSSProperties = {
  ...baseButtonStyle, background: "#475569", borderColor: "#475569", color: "#fff",
};
const buttonDisabledStyle: CSSProperties = {
  ...baseButtonStyle, background: "#e2e8f0", borderColor: "#e2e8f0", color: "#94a3b8", cursor: "not-allowed",
};

const chipRowStyle: CSSProperties = { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 };
const chipStyle: CSSProperties = {
  padding: "3px 10px", borderRadius: 12, border: "1px solid #cbd5e1",
  background: "#f1f5f9", color: "#475569", fontSize: 12, cursor: "pointer", fontWeight: 500,
};
const noteStyle: CSSProperties = {
  width: "100%", minHeight: 56, padding: 8, borderRadius: 8, border: "1px solid #cbd5e1",
  fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", marginBottom: 8, resize: "vertical",
};
const hintStyle: CSSProperties = { margin: "4px 0 0", fontSize: 11, color: "#475569" };
const errorStyle: CSSProperties = {
  margin: "8px 0 0", padding: "8px 10px", borderRadius: 8, background: "#fef2f2",
  border: "1px solid #fecaca", color: "#991b1b", fontSize: 12,
};

export default AlertResponsePanel;

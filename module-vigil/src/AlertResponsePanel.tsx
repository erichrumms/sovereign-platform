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
 * Version: 1.0 · Session 7 · June 18, 2026
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

      <div style={rowStyle}>
        <button
          type="button"
          style={btnStyle}
          disabled={acknowledged}
          onClick={() => handle("ACKNOWLEDGED")}
        >
          Acknowledge
        </button>
        <button type="button" style={btnStyle} disabled={!acknowledged} onClick={() => handle("INVESTIGATING")}>
          Investigating
        </button>
      </div>

      <textarea
        aria-label="Response note"
        placeholder={`Note (required for Resolve / Escalate / False Positive — min ${RESPONSE_NOTE_MIN_CHARS} chars)`}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={noteStyle}
      />

      <div style={rowStyle}>
        <button type="button" style={btnStyle} disabled={!acknowledged} onClick={() => handle("RESOLVED")}>
          Resolve
        </button>
        <button type="button" style={btnStyle} disabled={!acknowledged} onClick={() => handle("ESCALATED")}>
          Escalate
        </button>
        <button type="button" style={btnStyle} disabled={!acknowledged} onClick={() => handle("FALSE_POSITIVE")}>
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

const panelStyle: CSSProperties = {
  padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#ffffff", maxWidth: 720,
};
const titleStyle: CSSProperties = { margin: "0 0 8px", fontSize: 14 };
const rowStyle: CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 };
const btnStyle: CSSProperties = {
  padding: "6px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#f8fafc",
  fontSize: 13, cursor: "pointer",
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

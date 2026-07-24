/**
 * SOVEREIGN Platform — module-vigil
 * ApprovalDecisionPanel.tsx — the operator's decision controls (spec §4.2).
 *
 * Approve / Reject / Escalate, each requiring a note (≥10 chars). The buttons are
 * disabled until the note is valid — an undocumented decision cannot be recorded. The
 * hook (useApprovalDecision, owned by the parent) emits the Logger event and enforces
 * Gate 2; this component is presentation + the note field only.
 *
 * Version: 1.1 · Session 59 · July 23, 2026 (reason-code chips)
 */

import { useState, type CSSProperties } from "react";

import { APPROVAL_NOTE_MIN_CHARS, type ApprovalDecisionAction } from "./approval-contract";

export interface ApprovalDecisionPanelProps {
  /** Record the decision with the current note. Returns ok so the field can reset. */
  onDecide: (action: ApprovalDecisionAction, notes: string) => boolean;
  error: string | null;
}

const VIGIL_REASON_CODES = [
  "Routine — matches expected pattern",
  "Reviewed evidence, approving as submitted",
  "Escalating due to elevated risk",
  "Rejecting — insufficient justification",
];

const ACTIONS: Array<{ action: ApprovalDecisionAction; label: string; style: CSSProperties }> = [
  { action: "APPROVE", label: "Approve", style: { background: "#15803d", borderColor: "#15803d", color: "#fff" } },
  { action: "REJECT", label: "Reject", style: { background: "#b91c1c", borderColor: "#b91c1c", color: "#fff" } },
  { action: "ESCALATE", label: "Escalate", style: { background: "#b45309", borderColor: "#b45309", color: "#fff" } },
];

export function ApprovalDecisionPanel({ onDecide, error }: ApprovalDecisionPanelProps): JSX.Element {
  const [notes, setNotes] = useState("");
  const notesValid = notes.trim().length >= APPROVAL_NOTE_MIN_CHARS;

  const handle = (action: ApprovalDecisionAction): void => {
    if (!notesValid) return;
    const ok = onDecide(action, notes);
    if (ok) setNotes("");
  };

  return (
    <section style={wrapStyle} aria-label="Approval Decision">
      <label style={labelStyle} htmlFor="approval-notes">
        Decision note <span style={reqStyle}>(required, ≥{APPROVAL_NOTE_MIN_CHARS} characters)</span>
      </label>
      <div style={chipRowStyle} aria-label="Reason-code quick-insert">
        {VIGIL_REASON_CODES.map((code) => (
          <button
            key={code}
            type="button"
            style={chipStyle}
            onClick={() => setNotes((prev) => (prev.trim() ? prev.trim() + " " + code : code))}
          >
            {code}
          </button>
        ))}
      </div>
      <textarea
        id="approval-notes"
        style={textareaStyle}
        rows={3}
        placeholder="Document the reason for your decision — this becomes the governance record."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        aria-label="Decision note"
      />

      <div style={rowStyle}>
        {ACTIONS.map(({ action, label, style }) => (
          <button
            key={action}
            type="button"
            style={notesValid ? { ...buttonStyle, ...style } : buttonDisabledStyle}
            disabled={!notesValid}
            onClick={() => handle(action)}
          >
            {label}
          </button>
        ))}
      </div>

      <p style={gateNoteStyle}>
        No agent action proceeds without a logged decision. Escalate routes the request to the Project
        Principal with the note above as the escalation reason.
      </p>

      {error ? (
        <p role="alert" style={errorStyle}>
          {error}
        </p>
      ) : null}
    </section>
  );
}

const wrapStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 8, maxWidth: 720 };
const labelStyle: CSSProperties = { fontSize: 13, color: "#334155" };
const reqStyle: CSSProperties = { color: "#64748b", fontWeight: 400 };
const textareaStyle: CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1",
  fontFamily: "system-ui, sans-serif", fontSize: 13, resize: "vertical",
};
const rowStyle: CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap" };
const buttonStyle: CSSProperties = {
  padding: "8px 16px", borderRadius: 8, border: "1px solid", cursor: "pointer", fontSize: 13, fontWeight: 600,
};
const buttonDisabledStyle: CSSProperties = {
  ...buttonStyle, background: "#e2e8f0", borderColor: "#e2e8f0", color: "#64748b", cursor: "not-allowed",
};
const gateNoteStyle: CSSProperties = { margin: 0, fontSize: 12, color: "#64748b" };
const errorStyle: CSSProperties = { margin: 0, color: "#b91c1c", fontSize: 13 };
const chipRowStyle: CSSProperties = { display: "flex", flexWrap: "wrap", gap: 6 };
const chipStyle: CSSProperties = {
  padding: "3px 10px", borderRadius: 12, border: "1px solid #cbd5e1",
  background: "#f1f5f9", color: "#475569", fontSize: 12, cursor: "pointer", fontWeight: 500,
};

export default ApprovalDecisionPanel;

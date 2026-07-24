/**
 * SOVEREIGN Platform — module-vigil
 * ObligationDecisionPanel.tsx — Tier C obligation decision controls.
 *
 * Extends the standard ApprovalDecisionPanel pattern with a required
 * counselDecisionRecordId field. Approve is disabled until BOTH the decision note
 * (≥10 chars) AND the COUNSEL Decision Record ID are present — the structural gate
 * predicate from docs/18 §6 (canSubmitObligationDecision). Reject requires only
 * the note. No ESCALATE action — obligation rejections loop back to the requesting
 * agent, not to the Project Principal.
 *
 * Version: 1.1 · Session 59 · July 23, 2026 (reason-code chips)
 */

import { useState, type CSSProperties } from "react";

import { APPROVAL_NOTE_MIN_CHARS } from "./approval-contract";

const VIGIL_REASON_CODES = [
  "Routine — matches expected pattern",
  "Reviewed evidence, approving as submitted",
  "Escalating due to elevated risk",
  "Rejecting — insufficient justification",
];
import { canSubmitObligationDecision, type PPBEGateAction } from "./ppbe-authorization";

export interface ObligationDecisionPanelProps {
  onDecide: (action: PPBEGateAction, note: string, counselDecisionRecordId: string) => boolean;
  error: string | null;
}

export function ObligationDecisionPanel({ onDecide, error }: ObligationDecisionPanelProps): JSX.Element {
  const [note, setNote] = useState("");
  const [counselId, setCounselId] = useState("");

  const noteValid = note.trim().length >= APPROVAL_NOTE_MIN_CHARS;
  const canApprove = canSubmitObligationDecision(note, counselId);

  const handle = (action: PPBEGateAction): void => {
    if (action === "APPROVE" && !canApprove) return;
    if (action === "REJECT" && !noteValid) return;
    const ok = onDecide(action, note, counselId);
    if (ok) {
      setNote("");
      setCounselId("");
    }
  };

  return (
    <section style={wrapStyle} aria-label="Obligation Authorization Decision">
      <p style={tierLabelStyle}>
        Tier C — Resource Commitment Authorization (docs/18 §6). Requires decision note
        AND a linked COUNSEL Decision Record ID. Approve stays inactive until both are present.
      </p>

      <label style={labelStyle} htmlFor="obligation-counsel-id">
        COUNSEL Decision Record ID <span style={reqStyle}>(required for Approve)</span>
      </label>
      <input
        id="obligation-counsel-id"
        type="text"
        style={inputStyle}
        placeholder="e.g. CDR-2026-0047"
        value={counselId}
        onChange={(e) => setCounselId(e.target.value)}
        aria-label="COUNSEL Decision Record ID"
        data-testid="obligation-counsel-id-input"
      />

      <label style={labelStyle} htmlFor="obligation-notes">
        Decision note <span style={reqStyle}>(required, ≥{APPROVAL_NOTE_MIN_CHARS} characters)</span>
      </label>
      <div style={chipRowStyle} aria-label="Reason-code quick-insert">
        {VIGIL_REASON_CODES.map((code) => (
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
        id="obligation-notes"
        style={textareaStyle}
        rows={3}
        placeholder="Document the reason for your decision — this becomes the governance record."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        aria-label="Decision note"
        data-testid="obligation-decision-note"
      />

      <div style={rowStyle}>
        <button
          type="button"
          style={canApprove ? { ...buttonStyle, ...approveStyle } : buttonDisabledStyle}
          disabled={!canApprove}
          onClick={() => handle("APPROVE")}
          data-testid="obligation-approve-btn"
        >
          Approve
        </button>
        <button
          type="button"
          style={noteValid ? { ...buttonStyle, ...rejectStyle } : buttonDisabledStyle}
          disabled={!noteValid}
          onClick={() => handle("REJECT")}
          data-testid="obligation-reject-btn"
        >
          Reject
        </button>
      </div>

      <p style={gateNoteStyle}>
        Approval creates a committed ObligationRecord with the COUNSEL Decision Record ID
        attached. No obligation is created without a logged human authorization.
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
const tierLabelStyle: CSSProperties = {
  margin: 0, padding: "6px 10px", background: "#fef9c3", border: "1px solid #fde047",
  borderRadius: 6, fontSize: 12, color: "#713f12",
};
const labelStyle: CSSProperties = { fontSize: 13, color: "#334155" };
const reqStyle: CSSProperties = { color: "#64748b", fontWeight: 400 };
const inputStyle: CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8,
  border: "1px solid #cbd5e1", fontFamily: "system-ui, sans-serif", fontSize: 13,
};
const textareaStyle: CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: 10, borderRadius: 8,
  border: "1px solid #cbd5e1", fontFamily: "system-ui, sans-serif", fontSize: 13, resize: "vertical",
};
const rowStyle: CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap" };
const buttonStyle: CSSProperties = {
  padding: "8px 16px", borderRadius: 8, border: "1px solid", cursor: "pointer", fontSize: 13, fontWeight: 600,
};
const approveStyle: CSSProperties = { background: "#15803d", borderColor: "#15803d", color: "#fff" };
const rejectStyle: CSSProperties = { background: "#b91c1c", borderColor: "#b91c1c", color: "#fff" };
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

export default ObligationDecisionPanel;

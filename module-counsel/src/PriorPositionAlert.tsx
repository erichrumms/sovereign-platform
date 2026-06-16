/**
 * SOVEREIGN Platform — module-counsel
 * PriorPositionAlert.tsx — Prior Position Alert (spec §6).
 *
 * Sits between framing and analysis. Runs the scoped prior-position lookup; if the
 * user has conflicting prior Decision Records, surfaces them and requires the user
 * to reconcile (acknowledge with a note, or dismiss) — both paths emit a
 * PRIOR_POSITION_RECONCILIATION event; neither blocks. If there are no conflicts,
 * it proceeds automatically to analysis.
 *
 * Component owns rendering/interaction only; the lookup and the Logger emission
 * live in usePriorPositionCheck.
 *
 * Version: 1.0 · Session 4 · June 15, 2026
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { usePriorPositionCheck } from "./usePriorPositionCheck";
import type { PriorPositionProvider } from "./prior-position";
import type { DecisionFrame } from "./types";

export interface PriorPositionAlertProps {
  ctx: SovereignShellContext;
  frame: DecisionFrame;
  provider?: PriorPositionProvider;
  /** Called once the prior position is resolved (or when there is nothing to reconcile). */
  onResolved: () => void;
}

export function PriorPositionAlert({ ctx, frame, provider, onResolved }: PriorPositionAlertProps): JSX.Element | null {
  const { status, conflicts, error, reconcile } = usePriorPositionCheck(ctx, frame, provider);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const autoProceeded = useRef(false);

  // No conflicts → nothing to reconcile → proceed to analysis automatically.
  useEffect(() => {
    if (status === "ready" && conflicts.length === 0 && !autoProceeded.current) {
      autoProceeded.current = true;
      onResolved();
    }
  }, [status, conflicts, onResolved]);

  if (status === "checking") {
    return <p style={mutedStyle}>Checking your prior positions…</p>;
  }

  if (status === "error") {
    // Lookup failed — surface and let the user proceed (lookup is advisory, not a gate).
    return (
      <div>
        <div style={errorBannerStyle}>{error}</div>
        <button style={primaryButtonStyle} onClick={onResolved}>
          Continue to analysis
        </button>
      </div>
    );
  }

  if (conflicts.length === 0) {
    return null; // auto-proceeding via the effect above
  }

  const handle = async (resolution: "acknowledged" | "dismissed"): Promise<void> => {
    setBusy(true);
    const ok = await reconcile(resolution, resolution === "acknowledged" ? note : undefined);
    setBusy(false);
    if (ok) onResolved();
  };

  return (
    <div style={rootStyle}>
      <div style={alertHeaderStyle}>
        <span style={alertBadgeStyle}>PRIOR POSITION</span>
        <h2 style={titleStyle}>You have {conflicts.length} prior decision{conflicts.length > 1 ? "s" : ""} to reconcile</h2>
      </div>
      <p style={mutedStyle}>
        Your own prior Decision Records on <code>{frame.sovereignContext.decisionType}</code> may
        conflict with the decision you're framing. Reconcile before analysis.
      </p>

      {conflicts.map((c) => (
        <div key={c.recordId} style={recordStyle}>
          <div style={recordHeadStyle}>
            <strong>{c.recordId}</strong>
            <span style={recordDateStyle}>{c.date} · {c.decisionType}</span>
          </div>
          <p style={recordLineStyle}>{c.conclusion}</p>
          <p style={conflictLineStyle}>{c.conflictingElement}</p>
        </div>
      ))}

      {error ? <div style={errorBannerStyle}>{error}</div> : null}

      <label style={noteLabelStyle}>
        Reconciliation note (required to acknowledge)
        <textarea
          style={textareaStyle}
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="How does the current decision relate to your prior position?"
        />
      </label>

      <div style={buttonRowStyle}>
        <button
          style={note.trim() && !busy ? primaryButtonStyle : disabledButtonStyle}
          disabled={!note.trim() || busy}
          onClick={() => void handle("acknowledged")}
        >
          Acknowledge & reconcile
        </button>
        <button style={busy ? disabledButtonStyle : secondaryButtonStyle} disabled={busy} onClick={() => void handle("dismissed")}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ============================================================
// STYLES (inline)
// ============================================================

const rootStyle: CSSProperties = { maxWidth: 720 };
const alertHeaderStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 };
const alertBadgeStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.4,
  padding: "2px 8px",
  borderRadius: 999,
  background: "#fef3c7",
  color: "#92400e",
};
const titleStyle: CSSProperties = { margin: 0, fontSize: 17 };
const mutedStyle: CSSProperties = { margin: "0 0 12px", color: "#475569", fontSize: 14 };
const recordStyle: CSSProperties = {
  padding: 12,
  border: "1px solid #fde68a",
  background: "#fffbeb",
  borderRadius: 10,
  marginBottom: 10,
};
const recordHeadStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 };
const recordDateStyle: CSSProperties = { fontSize: 12, color: "#92400e" };
const recordLineStyle: CSSProperties = { margin: "0 0 4px", fontSize: 13, color: "#334155" };
const conflictLineStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#92400e" };
const noteLabelStyle: CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#475569", margin: "8px 0" };
const textareaStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  marginTop: 4,
  padding: 8,
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  fontFamily: "inherit",
  fontSize: 14,
  resize: "vertical",
};
const buttonRowStyle: CSSProperties = { display: "flex", gap: 10 };
const primaryButtonStyle: CSSProperties = {
  padding: "8px 18px",
  background: "#1d4ed8",
  color: "#ffffff",
  border: "none",
  borderRadius: 8,
  fontSize: 14,
  cursor: "pointer",
};
const disabledButtonStyle: CSSProperties = { ...primaryButtonStyle, background: "#cbd5e1", cursor: "not-allowed" };
const secondaryButtonStyle: CSSProperties = {
  padding: "8px 18px",
  background: "#f1f5f9",
  color: "#0f172a",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  fontSize: 14,
  cursor: "pointer",
};
const errorBannerStyle: CSSProperties = {
  padding: "10px 14px",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: 8,
  color: "#7f1d1d",
  fontSize: 13,
  margin: "0 0 12px",
};

export default PriorPositionAlert;

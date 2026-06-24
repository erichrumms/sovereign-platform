/**
 * SOVEREIGN Platform — module-cpmi
 * GateRunnerPanel.tsx — the CPMI-VRS gate runner surface (spec §5).
 *
 * Sequences a product through the four CPMI-VRS gates: Gate 1 (Scope) and Gate 2
 * (Transparency) auto-record; Gate 3 (Accuracy) requires human attestation with a note
 * (decision_type GATE_3_ATTESTATION); Gate 4 (Monitoring) auto-records after the first
 * cycle. The VRS certificate is issued only when all four are complete. The hook
 * (useGateRunner) owns Logger emission and Gate 2 fail-closed.
 *
 * Version: 1.0 · Session 11 · June 23, 2026
 */

import { useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { useGateRunner } from "./useGateRunner";
import type { GateRecord, VRSGateNumber } from "./cpmi-contract";

export interface GateRunnerPanelProps {
  ctx: SovereignShellContext;
  /** The product/agent being certified (synthetic/dev demo defaults to CPMI itself). */
  productId?: string;
}

const GATE_NAMES: Record<VRSGateNumber, string> = {
  1: "Scope and Boundary",
  2: "Transparency",
  3: "Accuracy and Validation",
  4: "Monitoring and Drift",
};

export function GateRunnerPanel({ ctx, productId = "CPMI" }: GateRunnerPanelProps): JSX.Element {
  const runner = useGateRunner(ctx, productId);
  const [note, setNote] = useState("");

  const statusOf = (gate: VRSGateNumber): GateRecord["status"] =>
    runner.records.find((r) => r.gate === gate)?.status ?? "PENDING";

  const g1 = statusOf(1), g2 = statusOf(2), g3 = statusOf(3), g4 = statusOf(4);
  const noteValid = note.trim().length >= 10;

  const onAttest = (): void => {
    if (runner.attestGate3(note)) setNote("");
  };

  return (
    <section aria-label="Gate Runner" style={wrapStyle}>
      <p style={leadStyle}>
        CPMI-VRS gate sequence for <strong>{productId}</strong>. Gates 1, 2 and 4 auto-record; Gate 3 requires
        your attestation. A VRS certificate is issued only when all four gates are complete.
      </p>

      <ol style={gateListStyle}>
        {([1, 2, 3, 4] as VRSGateNumber[]).map((gate) => (
          <li key={gate} style={gateRowStyle}>
            <span style={gateBadgeStyle(statusOf(gate))}>{statusOf(gate)}</span>
            <span style={gateNameStyle}>Gate {gate} — {GATE_NAMES[gate]}</span>
          </li>
        ))}
      </ol>

      <div style={actionsStyle}>
        <button style={g1 === "PENDING" ? btn : btnDone} disabled={g1 !== "PENDING"} onClick={runner.passGate1}>Pass Gate 1</button>
        <button style={g1 === "PASSED" && g2 === "PENDING" ? btn : btnDisabled} disabled={!(g1 === "PASSED" && g2 === "PENDING")} onClick={runner.passGate2}>Pass Gate 2</button>
      </div>

      {/* Gate 3 — human attestation */}
      <div style={attestBoxStyle}>
        <label style={labelStyle} htmlFor="gate3-note">Gate 3 attestation note <span style={mutedInlineStyle}>(required, ≥10 chars)</span></label>
        <textarea
          id="gate3-note"
          style={textareaStyle}
          rows={2}
          placeholder="Attest that the reasoning chain passed the known-answer benchmark and schema validation."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={!(g2 === "PASSED" && g3 === "PENDING")}
          aria-label="Gate 3 attestation note"
        />
        <button
          style={g2 === "PASSED" && g3 === "PENDING" && noteValid ? btnPrimary : btnDisabled}
          disabled={!(g2 === "PASSED" && g3 === "PENDING" && noteValid)}
          onClick={onAttest}
        >
          Attest Gate 3
        </button>
      </div>

      <div style={actionsStyle}>
        <button style={g3 === "ATTESTED" && g4 === "PENDING" ? btn : btnDisabled} disabled={!(g3 === "ATTESTED" && g4 === "PENDING")} onClick={runner.passGate4}>Pass Gate 4</button>
      </div>

      {runner.error ? <p role="alert" style={errorStyle}>{runner.error}</p> : null}

      <div style={runner.certificate.certified ? certOkStyle : certPendingStyle} aria-label="VRS certificate">
        {runner.certificate.certified ? (
          <>✓ VRS certificate issued for <strong>{productId}</strong> by {runner.certificate.issued_by}. All four gates complete.</>
        ) : (
          <>No VRS certificate yet — {runner.records.filter((r) => r.status === "PENDING").length} gate(s) remaining. cpmi.vrs-certification cannot issue a partial certificate.</>
        )}
      </div>
    </section>
  );
}

const wrapStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 12, maxWidth: 760 };
const leadStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#475569" };
const gateListStyle: CSSProperties = { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 };
const gateRowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 10 };
const gateNameStyle: CSSProperties = { fontSize: 13, color: "#0f172a" };
const gateBadgeStyle = (status: GateRecord["status"]): CSSProperties => ({
  display: "inline-block", minWidth: 72, textAlign: "center", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700,
  color: status === "PENDING" ? "#475569" : "#065f46",
  background: status === "PENDING" ? "#e2e8f0" : "#d1fae5",
});
const actionsStyle: CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap" };
const btn: CSSProperties = { padding: "8px 14px", borderRadius: 8, border: "1px solid #0c4a6e", background: "#fff", color: "#0c4a6e", cursor: "pointer", fontSize: 13, fontWeight: 600 };
const btnPrimary: CSSProperties = { ...btn, background: "#0c4a6e", color: "#fff" };
const btnDone: CSSProperties = { ...btn, opacity: 0.6 };
const btnDisabled: CSSProperties = { ...btn, opacity: 0.4, cursor: "not-allowed", border: "1px solid #cbd5e1", color: "#94a3b8" };
const attestBoxStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 6, padding: 12, border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc" };
const labelStyle: CSSProperties = { fontSize: 13, color: "#334155" };
const mutedInlineStyle: CSSProperties = { color: "#64748b" };
const textareaStyle: CSSProperties = { width: "100%", boxSizing: "border-box", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", fontFamily: "system-ui, sans-serif", fontSize: 13, resize: "vertical" };
const errorStyle: CSSProperties = { margin: 0, color: "#b91c1c", fontSize: 13 };
const certOkStyle: CSSProperties = { padding: "10px 14px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 8, color: "#065f46", fontSize: 13 };
const certPendingStyle: CSSProperties = { padding: "10px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, color: "#475569", fontSize: 13 };

export default GateRunnerPanel;

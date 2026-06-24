/**
 * SOVEREIGN Platform — module-cpmi
 * GateRunnerPanel.tsx — the CPMI-VRS gate runner surface (spec §5; Session 12 D2).
 *
 * The end-to-end certification cycle for the CPMI self-certification:
 *   - Gates 1 (Scope) and 2 (Transparency) AUTO-RUN on mount — preconditions verified
 *     (gate-checks.ts), then CPMI_VRS_GATE_1/2_PASSED recorded (useGateRunner).
 *   - The known-answer benchmark runs (BenchmarkPanel); Gate 3 attestation is ENABLED
 *     only when gate3_ready AND Gates 1+2 passed. Claude Code does NOT click it — the
 *     Project Principal attests on return.
 *   - Gate 4 and the VRS certificate are the Project Principal's post-attestation steps;
 *     the Gate 4 control stays disabled until Gate 3 is attested.
 *
 * Version: 2.0 (Stage 3 completion) · Session 12 · June 23, 2026
 */

import { useEffect, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { useGateRunner } from "./useGateRunner";
import { BenchmarkPanel } from "./BenchmarkPanel";
import { gate1Ready, gate2Ready } from "./gate-checks";
import type { GateRecord, VRSGateNumber } from "./cpmi-contract";

export interface GateRunnerPanelProps {
  ctx: SovereignShellContext;
  /** The product/agent being certified — the first certification is CPMI itself. */
  productId?: string;
}

const GATE_NAMES: Record<VRSGateNumber, string> = {
  1: "Scope and Boundary",
  2: "Transparency",
  3: "Accuracy and Validation",
  4: "Monitoring and Drift",
};

export function GateRunnerPanel({ ctx, productId = "cpmi" }: GateRunnerPanelProps): JSX.Element {
  const runner = useGateRunner(ctx, productId);

  const statusOf = (gate: VRSGateNumber): GateRecord["status"] =>
    runner.records.find((r) => r.gate === gate)?.status ?? "PENDING";
  const g1 = statusOf(1), g2 = statusOf(2), g3 = statusOf(3), g4 = statusOf(4);

  // Auto-run Gates 1 and 2 on mount once their preconditions are satisfied (spec §3.1/§3.2).
  useEffect(() => {
    if (gate1Ready() && g1 === "PENDING") runner.passGate1();
    if (gate2Ready() && g2 === "PENDING") runner.passGate2();
    // Run once on mount; subsequent renders are reflected by gate state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gates12Passed = g1 === "PASSED" && g2 === "PASSED";

  return (
    <section aria-label="Gate Runner" style={wrapStyle}>
      <p style={leadStyle}>
        CPMI-VRS certification cycle for <strong>{productId}</strong> — the first certification in the platform.
        Gates 1 and 2 auto-record; Gate 3 is a Project Principal attestation, enabled by the benchmark below.
      </p>

      <ol style={gateListStyle}>
        {([1, 2, 3, 4] as VRSGateNumber[]).map((gate) => (
          <li key={gate} style={gateRowStyle}>
            <span style={gateBadgeStyle(statusOf(gate))}>{statusOf(gate)}</span>
            <span style={gateNameStyle}>Gate {gate} — {GATE_NAMES[gate]}</span>
          </li>
        ))}
      </ol>

      {runner.error ? <p role="alert" style={errorStyle}>{runner.error}</p> : null}

      {/* Benchmark + Gate 3 attestation surface (enabled only when gate3_ready). */}
      <BenchmarkPanel
        ctx={ctx}
        precedingGatesPassed={gates12Passed}
        gate3Pending={g3 === "PENDING"}
        onAttestGate3={runner.attestGate3}
      />

      {/* Gate 4 — Project Principal performs this on return, after Gate 3 attestation. */}
      <div style={gate4BoxStyle}>
        <button
          type="button"
          style={g3 === "ATTESTED" && g4 === "PENDING" ? gate4Btn : gate4BtnDisabled}
          disabled={!(g3 === "ATTESTED" && g4 === "PENDING")}
          onClick={runner.passGate4}
        >
          Pass Gate 4 (Monitoring)
        </button>
        <span style={mutedStyle}>
          Gate 4 baseline runs after Gate 3 attestation (Project Principal). It is not part of the autonomous cycle.
        </span>
      </div>

      <div style={runner.certificate.certified ? certOkStyle : certPendingStyle} aria-label="VRS certificate">
        {runner.certificate.certified ? (
          <>✓ VRS certificate issued for <strong>{productId}</strong> by {runner.certificate.issued_by}. All four gates complete.</>
        ) : (
          <>No VRS certificate yet — {runner.records.filter((r) => r.status === "PENDING").length} gate(s) remaining. Gate 3 attestation + Gate 4 are the Project Principal's steps on return.</>
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
const errorStyle: CSSProperties = { margin: 0, color: "#b91c1c", fontSize: 13 };
const gate4BoxStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" };
const gate4Btn: CSSProperties = { padding: "8px 14px", borderRadius: 8, border: "1px solid #0c4a6e", background: "#fff", color: "#0c4a6e", cursor: "pointer", fontSize: 13, fontWeight: 600 };
const gate4BtnDisabled: CSSProperties = { ...gate4Btn, opacity: 0.4, cursor: "not-allowed", border: "1px solid #cbd5e1", color: "#94a3b8" };
const mutedStyle: CSSProperties = { fontSize: 12, color: "#64748b" };
const certOkStyle: CSSProperties = { padding: "10px 14px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 8, color: "#065f46", fontSize: 13 };
const certPendingStyle: CSSProperties = { padding: "10px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, color: "#475569", fontSize: 13 };

export default GateRunnerPanel;

/**
 * SOVEREIGN Platform — module-cpmi
 * BenchmarkPanel.tsx — the known-answer benchmark surface (Session 12, D1).
 *
 * Runs the benchmark suite (useBenchmark) on mount, displays the scenario results and
 * compliance rates, and surfaces the Gate 3 attestation control — ENABLED only when
 * gate3_ready is true (all three scenarios schema_valid + steps_completed:6) AND the
 * preceding gates have passed AND Gate 3 is still pending. Claude Code does NOT click it;
 * the Project Principal attests on return. The actual attestation is performed by the
 * gate runner via onAttestGate3 (owned by GateRunnerPanel).
 *
 * Version: 1.0 · Session 12 · June 23, 2026
 */

import { useEffect, useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { useBenchmark } from "./useBenchmark";
import { BENCHMARK_SCENARIOS, type ScenarioId } from "./benchmark";

export interface BenchmarkPanelProps {
  ctx: SovereignShellContext;
  /** Whether Gates 1+2 have passed — Gate 3 cannot attest before. Default true (display). */
  precedingGatesPassed?: boolean;
  /** Whether Gate 3 is still pending. Default true. */
  gate3Pending?: boolean;
  /** Attest Gate 3 with a note. If absent, the control is display-only (inert). */
  onAttestGate3?: (note: string) => boolean | void;
}

const LABEL: Record<ScenarioId, string> = Object.fromEntries(
  BENCHMARK_SCENARIOS.map((s) => [s.id, s.label])
) as Record<ScenarioId, string>;

export function BenchmarkPanel({
  ctx,
  precedingGatesPassed = true,
  gate3Pending = true,
  onAttestGate3,
}: BenchmarkPanelProps): JSX.Element {
  const bench = useBenchmark(ctx);
  const [note, setNote] = useState("");

  // Run the benchmark once on mount (autonomous — the evidence base for Gate 3).
  useEffect(() => {
    void bench.run();
    // bench.run is stable (useCallback over ctx); run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const report = bench.report;
  const ready = report?.gate3_ready === true;
  const noteValid = note.trim().length >= 10;
  const canAttest = Boolean(ready && precedingGatesPassed && gate3Pending && noteValid && onAttestGate3);

  const onAttest = (): void => {
    if (!onAttestGate3 || !canAttest) return;
    const ok = onAttestGate3(note);
    if (ok !== false) setNote("");
  };

  return (
    <section aria-label="Benchmark Report" style={wrapStyle}>
      <p style={leadStyle}>
        Known-answer benchmark — three synthetic scenarios provide the accuracy evidence base for Gate 3.
        Gate 3 activates only when every scenario is <code>schema_valid</code> with all six steps completed.
      </p>

      {bench.status === "running" ? <p style={mutedStyle}>Running benchmark…</p> : null}
      {bench.error ? <p role="alert" style={errorStyle}>{bench.error}</p> : null}

      {report ? (
        <>
          <div style={ratesStyle}>
            <Rate label="Scenarios" value={`${report.scenarios_run}/3`} ok={report.scenarios_run === 3} />
            <Rate label="Schema compliance" value={`${Math.round(report.schema_compliance_rate * 100)}%`} ok={report.schema_compliance_rate === 1} />
            <Rate label="Step completion" value={`${Math.round(report.step_completion_rate * 100)}%`} ok={report.step_completion_rate === 1} />
          </div>

          <ul style={listStyle} aria-label="Scenario results">
            {report.scenario_results.map((r) => (
              <li key={r.scenario_id} style={scenarioRowStyle}>
                <span style={scenarioBadge(r.schema_valid && r.steps_completed === 6)}>{r.scenario_id}</span>
                <span style={scenarioNameStyle}>{LABEL[r.scenario_id]}</span>
                <span style={scenarioMetaStyle}>
                  schema_valid: {String(r.schema_valid)} · steps: {r.steps_completed}/6
                </span>
              </li>
            ))}
          </ul>

          <div style={ready ? readyStyle : notReadyStyle} aria-label="gate3 readiness">
            {ready ? "✓ gate3_ready — Gate 3 attestation is available for the Project Principal." : "Gate 3 not ready — benchmark did not meet 100% schema + step completion."}
          </div>

          {/* Gate 3 attestation surface — enabled only when gate3_ready (Project Principal acts on return). */}
          <div style={attestBoxStyle}>
            <label style={labelStyle} htmlFor="gate3-attest-note">
              Gate 3 attestation note <span style={mutedInlineStyle}>(required, ≥10 chars — Project Principal)</span>
            </label>
            <textarea
              id="gate3-attest-note"
              style={textareaStyle}
              rows={2}
              placeholder="Attest that the benchmark accuracy is acceptable."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={!ready || !precedingGatesPassed || !gate3Pending}
              aria-label="Gate 3 attestation note"
            />
            <button
              type="button"
              style={canAttest ? attestBtn : attestBtnDisabled}
              disabled={!canAttest}
              onClick={onAttest}
            >
              Gate 3 Attestation
            </button>
            {!precedingGatesPassed ? <p style={mutedStyle}>Gates 1 and 2 must pass before Gate 3.</p> : null}
            {!gate3Pending ? <p style={mutedStyle}>Gate 3 has been attested.</p> : null}
          </div>
        </>
      ) : null}
    </section>
  );
}

function Rate({ label, value, ok }: { label: string; value: string; ok: boolean }): JSX.Element {
  return (
    <div style={rateStyle}>
      <span style={{ ...rateValueStyle, color: ok ? "#065f46" : "#b91c1c" }}>{value}</span>
      <span style={rateLabelStyle}>{label}</span>
    </div>
  );
}

const wrapStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 12, maxWidth: 760 };
const leadStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#475569" };
const mutedStyle: CSSProperties = { margin: 0, fontSize: 12, color: "#64748b" };
const errorStyle: CSSProperties = { margin: 0, color: "#b91c1c", fontSize: 13 };
const ratesStyle: CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap" };
const rateStyle: CSSProperties = { display: "flex", flexDirection: "column", padding: 10, border: "1px solid #e2e8f0", borderRadius: 8, minWidth: 130, background: "#f8fafc" };
const rateValueStyle: CSSProperties = { fontSize: 18, fontWeight: 700 };
const rateLabelStyle: CSSProperties = { fontSize: 12, color: "#64748b" };
const listStyle: CSSProperties = { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 };
const scenarioRowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 10 };
const scenarioBadge = (ok: boolean): CSSProperties => ({
  display: "inline-block", width: 24, textAlign: "center", padding: "2px 0", borderRadius: 999, fontSize: 12, fontWeight: 700,
  color: ok ? "#065f46" : "#7f1d1d", background: ok ? "#d1fae5" : "#fee2e2",
});
const scenarioNameStyle: CSSProperties = { fontSize: 13, color: "#0f172a", flex: "0 0 200px" };
const scenarioMetaStyle: CSSProperties = { fontSize: 12, color: "#475569" };
const readyStyle: CSSProperties = { padding: "10px 14px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 8, color: "#065f46", fontSize: 13 };
const notReadyStyle: CSSProperties = { padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#991b1b", fontSize: 13 };
const attestBoxStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 6, padding: 12, border: "1px solid #e2e8f0", borderRadius: 10, background: "#ffffff" };
const labelStyle: CSSProperties = { fontSize: 13, color: "#334155" };
const mutedInlineStyle: CSSProperties = { color: "#64748b" };
const textareaStyle: CSSProperties = { width: "100%", boxSizing: "border-box", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", fontFamily: "system-ui, sans-serif", fontSize: 13, resize: "vertical" };
const attestBtn: CSSProperties = { alignSelf: "flex-start", padding: "8px 16px", borderRadius: 8, border: "1px solid #0c4a6e", background: "#0c4a6e", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 };
const attestBtnDisabled: CSSProperties = { ...attestBtn, background: "#e2e8f0", border: "1px solid #e2e8f0", color: "#94a3b8", cursor: "not-allowed" };

export default BenchmarkPanel;

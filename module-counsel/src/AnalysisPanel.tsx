/**
 * SOVEREIGN Platform — module-counsel
 * AnalysisPanel.tsx — renders the Analysis Engine result (spec §6: AnalysisPanel).
 *
 * Component owns rendering and interaction only — all LLM/Logger work lives in
 * useAnalysis. On mount (once per frame) it runs the analysis, then renders the
 * alternatives, per-alternative risk scenarios, assumption flags, confidence
 * score, and recommended next action. A non-live tier shows a degraded-mode
 * banner; a Logger-emit failure shows the Gate 2 error.
 *
 * Version: 1.0 · Session 4 · June 15, 2026
 */

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { useAnalysis } from "./useAnalysis";
import type { AnalysisResult, RiskScenario, RiskSeverity } from "./analysis-contract";
import type { DecisionFrame } from "./types";

export interface AnalysisPanelProps {
  ctx: SovereignShellContext;
  frame: DecisionFrame;
  onReframe: () => void;
  /**
   * Called once when a schema-valid AnalysisResult is available (any tier), so the
   * composition root can lift the result and advance the flow to the mode hub.
   */
  onComplete?: (result: AnalysisResult) => void;
}

export function AnalysisPanel({ ctx, frame, onReframe, onComplete }: AnalysisPanelProps): JSX.Element {
  const { status, outcome, error, run } = useAnalysis(ctx);
  const ranFor = useRef<DecisionFrame | null>(null);
  const liftedFor = useRef<DecisionFrame | null>(null);

  // Run once per frame (guards against StrictMode double-invoke).
  useEffect(() => {
    if (ranFor.current === frame) return;
    ranFor.current = frame;
    void run(frame);
  }, [frame, run]);

  // Lift the result up exactly once per frame, when it is ready.
  useEffect(() => {
    if (!outcome || !onComplete || liftedFor.current === frame) return;
    liftedFor.current = frame;
    onComplete(outcome.result);
  }, [outcome, onComplete, frame]);

  return (
    <div style={rootStyle}>
      <div style={topRowStyle}>
        <h2 style={titleStyle}>Analysis</h2>
        <button style={secondaryButtonStyle} onClick={onReframe}>
          Re-frame
        </button>
      </div>

      <p style={mutedStyle}>{frame.decisionStatement}</p>

      {status === "running" ? <p style={runningStyle}>Running analysis…</p> : null}

      {error ? <div style={errorBannerStyle}>{error}</div> : null}

      {outcome ? <AnalysisResultView result={outcome.result} /> : null}
    </div>
  );
}

export function AnalysisResultView({ result }: { result: AnalysisResult }): JSX.Element {
  const riskByAlt = new Map<string, RiskScenario>();
  result.riskScenarios.forEach((r) => riskByAlt.set(r.alternativeId, r));
  const degraded = result.source && result.source !== "live";

  return (
    <>
      {degraded ? (
        <div style={degradedBannerStyle}>
          Degraded mode — served from the <strong>{result.source}</strong> tier. This is a
          fallback, not live analysis of your specific decision. Verify before acting.
        </div>
      ) : null}

      <div style={confidenceRowStyle}>
        <span style={confidenceLabelStyle}>Confidence</span>
        <span style={confidenceValueStyle}>{result.confidenceScore}/100</span>
        {result.source ? <span style={sourceTagStyle}>source: {result.source}</span> : null}
      </div>

      <h3 style={sectionStyle}>Alternatives</h3>
      {result.alternatives.map((alt) => {
        const risk = riskByAlt.get(alt.id);
        return (
          <div key={alt.id} style={altCardStyle}>
            <div style={altHeadStyle}>
              <strong>{alt.label}</strong>
              {risk ? <SeverityBadge severity={risk.severity} /> : null}
            </div>
            <p style={altSummaryStyle}>{alt.summary}</p>
            <div style={prosConsStyle}>
              <div>
                <span style={prosConsLabel}>Pros</span>
                <ul style={ulStyle}>
                  {alt.pros.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span style={prosConsLabel}>Cons</span>
                <ul style={ulStyle}>
                  {alt.cons.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
            {risk ? <p style={riskLineStyle}>Risk: {risk.scenario}</p> : null}
          </div>
        );
      })}

      {result.assumptionFlags.length > 0 ? (
        <>
          <h3 style={sectionStyle}>Assumption flags</h3>
          <ul style={ulStyle}>
            {result.assumptionFlags.map((f, i) => (
              <li key={i}>
                <strong>{f.assumption}</strong> — {f.concern}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <h3 style={sectionStyle}>Recommended next action</h3>
      <p style={nextActionStyle}>{result.recommendedNextAction}</p>
    </>
  );
}

function SeverityBadge({ severity }: { severity: RiskSeverity }): JSX.Element {
  return <span style={{ ...badgeBaseStyle, ...severityStyle[severity] }}>{severity}</span>;
}

// ============================================================
// STYLES (inline)
// ============================================================

const rootStyle: CSSProperties = { maxWidth: 720 };
const topRowStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const titleStyle: CSSProperties = { margin: "0 0 4px", fontSize: 18 };
const mutedStyle: CSSProperties = { margin: "0 0 12px", color: "#475569", fontSize: 14 };
const runningStyle: CSSProperties = { color: "#64748b", fontStyle: "italic" };
const errorBannerStyle: CSSProperties = {
  padding: "10px 14px",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: 8,
  color: "#7f1d1d",
  fontSize: 13,
  marginBottom: 12,
};
const degradedBannerStyle: CSSProperties = {
  padding: "10px 14px",
  background: "#fffbeb",
  border: "1px solid #fde68a",
  borderRadius: 8,
  color: "#92400e",
  fontSize: 13,
  marginBottom: 12,
};
const confidenceRowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 };
const confidenceLabelStyle: CSSProperties = { fontWeight: 600, fontSize: 13, color: "#475569" };
const confidenceValueStyle: CSSProperties = { fontSize: 18, fontWeight: 700, color: "#0f172a" };
const sourceTagStyle: CSSProperties = { fontSize: 11, color: "#475569" };
const sectionStyle: CSSProperties = { margin: "16px 0 8px", fontSize: 15 };
const altCardStyle: CSSProperties = {
  padding: 12,
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  marginBottom: 10,
  background: "#ffffff",
};
const altHeadStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 };
const altSummaryStyle: CSSProperties = { margin: "0 0 8px", fontSize: 13, color: "#334155" };
const prosConsStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
const prosConsLabel: CSSProperties = { fontSize: 12, fontWeight: 600, color: "#64748b" };
const ulStyle: CSSProperties = { margin: "4px 0 0 16px", padding: 0, fontSize: 13, lineHeight: 1.5 };
const riskLineStyle: CSSProperties = { margin: "8px 0 0", fontSize: 12, color: "#475569" };
const nextActionStyle: CSSProperties = {
  margin: 0,
  padding: "10px 14px",
  background: "#f0f9ff",
  border: "1px solid #bae6fd",
  borderRadius: 8,
  fontSize: 14,
  color: "#0c4a6e",
};
const badgeBaseStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  padding: "2px 8px",
  borderRadius: 999,
  letterSpacing: 0.3,
};
const severityStyle: Record<RiskSeverity, CSSProperties> = {
  LOW: { background: "#dcfce7", color: "#166534" },
  MODERATE: { background: "#fef9c3", color: "#854d0e" },
  HIGH: { background: "#ffedd5", color: "#9a3412" },
  CRITICAL: { background: "#fee2e2", color: "#991b1b" },
};
const secondaryButtonStyle: CSSProperties = {
  padding: "6px 14px",
  background: "#f1f5f9",
  color: "#0f172a",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  fontSize: 13,
  cursor: "pointer",
};

export default AnalysisPanel;

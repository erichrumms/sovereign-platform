/**
 * SOVEREIGN Platform — module-counsel
 * PreMortemStudio.tsx — Pre-Mortem Studio UI (spec §6: PreMortemStudio).
 *
 * Three-step failure-reconstruction exercise on a chosen course of action. The
 * component owns rendering and interaction only — all LLM/Logger work lives in
 * usePreMortem. The user picks the alternative they are committing to, the studio
 * runs the pre-mortem, and the result is handed back to the parent so it can
 * extend the AnalysisResult and feed the Decision Record.
 *
 * Version: 1.0 · Session 5 · June 16, 2026
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import type { AnalysisResult, RiskSeverity } from "./analysis-contract";
import type { FailureMode, FailureLikelihood, PreMortemResult } from "./premortem-contract";
import { usePreMortem } from "./usePreMortem";
import type { DecisionFrame } from "./types";

export interface PreMortemStudioProps {
  ctx: SovereignShellContext;
  frame: DecisionFrame;
  analysis: AnalysisResult;
  onComplete: (result: PreMortemResult) => void;
  onSkip: () => void;
}

export function PreMortemStudio({
  ctx,
  frame,
  analysis,
  onComplete,
  onSkip,
}: PreMortemStudioProps): JSX.Element {
  const { status, outcome, error, run } = usePreMortem(ctx);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const ranFor = useRef<string | null>(null);

  // Run once per chosen course (guards against StrictMode double-invoke).
  useEffect(() => {
    if (chosenId === null || ranFor.current === chosenId) return;
    ranFor.current = chosenId;
    void run({ frame, analysis, chosenAlternativeId: chosenId });
  }, [chosenId, frame, analysis, run]);

  // --- Stage 1: pick the course to pre-mortem ---
  if (chosenId === null) {
    return (
      <div style={rootStyle}>
        <div style={topRowStyle}>
          <h2 style={titleStyle}>Pre-Mortem</h2>
          <button style={secondaryButtonStyle} onClick={onSkip}>
            Skip
          </button>
        </div>
        <p style={mutedStyle}>
          Pick the course you are committing to. The studio will imagine it has already failed,
          reconstruct why, and surface the early-warning signs and preventive actions available now.
        </p>
        {analysis.alternatives.map((alt) => (
          <button key={alt.id} style={pickButtonStyle} onClick={() => setChosenId(alt.id)}>
            <strong>{alt.label}</strong>
            <span style={pickSummaryStyle}>{alt.summary}</span>
          </button>
        ))}
      </div>
    );
  }

  const chosenLabel = analysis.alternatives.find((a) => a.id === chosenId)?.label ?? chosenId;

  return (
    <div style={rootStyle}>
      <div style={topRowStyle}>
        <h2 style={titleStyle}>Pre-Mortem — {chosenLabel}</h2>
        <button style={secondaryButtonStyle} onClick={onSkip}>
          Skip
        </button>
      </div>

      {status === "running" ? <p style={runningStyle}>Reconstructing how this could fail…</p> : null}
      {error ? <div style={errorBannerStyle}>{error}</div> : null}

      {outcome ? <PreMortemView result={outcome.result} onComplete={onComplete} /> : null}
    </div>
  );
}

function PreMortemView({
  result,
  onComplete,
}: {
  result: PreMortemResult;
  onComplete: (result: PreMortemResult) => void;
}): JSX.Element {
  const degraded = result.source && result.source !== "live";
  return (
    <>
      {degraded ? (
        <div style={degradedBannerStyle}>
          Degraded mode — served from the <strong>{result.source}</strong> tier. This is a fallback
          template, not a live pre-mortem of your specific course. Run the steps yourself.
        </div>
      ) : null}

      <div style={vulnRowStyle}>
        <span style={vulnLabelStyle}>Overall vulnerability</span>
        <SeverityBadge severity={result.overallVulnerability} />
        {result.source ? <span style={sourceTagStyle}>source: {result.source}</span> : null}
      </div>

      {result.failureModes.map((fm) => (
        <FailureModeView key={fm.id} fm={fm} />
      ))}

      <h3 style={sectionStyle}>Top preventive action</h3>
      <p style={topActionStyle}>{result.topPreventiveAction}</p>

      <button style={primaryButtonStyle} onClick={() => onComplete(result)}>
        Record this pre-mortem
      </button>
    </>
  );
}

function FailureModeView({ fm }: { fm: FailureMode }): JSX.Element {
  return (
    <div style={fmCardStyle}>
      <div style={fmHeadStyle}>
        <strong>{fm.id}</strong>
        <span style={badgeRowStyle}>
          <SeverityBadge severity={fm.severity} />
          <LikelihoodBadge likelihood={fm.likelihood} />
        </span>
      </div>
      <p style={narrativeStyle}>{fm.failureNarrative}</p>
      <Step label="Root causes" items={fm.rootCauses} />
      <Step label="Early warnings" items={fm.earlyWarnings} />
      <Step label="Preventive actions" items={fm.preventiveActions} />
    </div>
  );
}

function Step({ label, items }: { label: string; items: string[] }): JSX.Element {
  return (
    <>
      <span style={subLabelStyle}>{label}</span>
      <ul style={ulStyle}>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </>
  );
}

function SeverityBadge({ severity }: { severity: RiskSeverity }): JSX.Element {
  return <span style={{ ...badgeBaseStyle, ...severityStyle[severity] }}>{severity}</span>;
}

function LikelihoodBadge({ likelihood }: { likelihood: FailureLikelihood }): JSX.Element {
  return <span style={{ ...badgeBaseStyle, ...likelihoodStyle[likelihood] }}>likelihood: {likelihood}</span>;
}

// ============================================================
// STYLES (inline — consistent with AnalysisPanel)
// ============================================================

const rootStyle: CSSProperties = { maxWidth: 720 };
const topRowStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const titleStyle: CSSProperties = { margin: "0 0 4px", fontSize: 18 };
const mutedStyle: CSSProperties = { margin: "0 0 12px", color: "#475569", fontSize: 14 };
const runningStyle: CSSProperties = { color: "#64748b", fontStyle: "italic" };
const errorBannerStyle: CSSProperties = {
  padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca",
  borderRadius: 8, color: "#7f1d1d", fontSize: 13, marginBottom: 12,
};
const degradedBannerStyle: CSSProperties = {
  padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a",
  borderRadius: 8, color: "#92400e", fontSize: 13, marginBottom: 12,
};
const pickButtonStyle: CSSProperties = {
  display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2,
  width: "100%", textAlign: "left", padding: 12, marginBottom: 8,
  border: "1px solid #cbd5e1", borderRadius: 10, background: "#ffffff", cursor: "pointer",
};
const pickSummaryStyle: CSSProperties = { fontSize: 12, color: "#475569" };
const vulnRowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 };
const vulnLabelStyle: CSSProperties = { fontWeight: 600, fontSize: 13, color: "#475569" };
const fmCardStyle: CSSProperties = {
  padding: 12, border: "1px solid #e2e8f0", borderRadius: 10, marginBottom: 10, background: "#ffffff",
};
const fmHeadStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 };
const badgeRowStyle: CSSProperties = { display: "flex", gap: 6 };
const narrativeStyle: CSSProperties = { margin: "0 0 8px", fontSize: 14, color: "#0f172a", fontStyle: "italic" };
const sectionStyle: CSSProperties = { margin: "16px 0 8px", fontSize: 15 };
const subLabelStyle: CSSProperties = { display: "block", marginTop: 8, fontSize: 12, fontWeight: 600, color: "#64748b" };
const ulStyle: CSSProperties = { margin: "4px 0 0 16px", padding: 0, fontSize: 13, lineHeight: 1.5 };
const topActionStyle: CSSProperties = {
  margin: "0 0 12px", padding: "10px 14px", background: "#f0f9ff", border: "1px solid #bae6fd",
  borderRadius: 8, fontSize: 14, color: "#0c4a6e",
};
const sourceTagStyle: CSSProperties = { fontSize: 11, color: "#475569" };
const primaryButtonStyle: CSSProperties = {
  padding: "6px 14px", background: "#0c4a6e", color: "#ffffff", border: "none",
  borderRadius: 8, fontSize: 13, cursor: "pointer",
};
const secondaryButtonStyle: CSSProperties = {
  padding: "6px 14px", background: "#f1f5f9", color: "#0f172a", border: "1px solid #cbd5e1",
  borderRadius: 8, fontSize: 13, cursor: "pointer",
};
const badgeBaseStyle: CSSProperties = {
  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, letterSpacing: 0.3,
};
const severityStyle: Record<RiskSeverity, CSSProperties> = {
  LOW: { background: "#dcfce7", color: "#166534" },
  MODERATE: { background: "#fef9c3", color: "#854d0e" },
  HIGH: { background: "#ffedd5", color: "#9a3412" },
  CRITICAL: { background: "#fee2e2", color: "#991b1b" },
};
const likelihoodStyle: Record<FailureLikelihood, CSSProperties> = {
  LOW: { background: "#e2e8f0", color: "#475569" },
  MODERATE: { background: "#e0e7ff", color: "#3730a3" },
  HIGH: { background: "#ede9fe", color: "#5b21b6" },
};

export default PreMortemStudio;

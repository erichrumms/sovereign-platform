/**
 * SOVEREIGN Platform — module-counsel
 * CounselApp.tsx — COUNSEL composition root (React).
 *
 * The single React component the module mounts (via index.ts -> createRoot) into
 * the shell-provided outlet. Presentation reads the context; it never re-derives
 * it. Shared services come from SovereignShellContext / @sovereign/api-client.
 *
 * Full COUNSEL flow (spec §6 component map):
 *   DecisionFramer (Gate 1 + framing) → PriorPositionAlert → AnalysisPanel
 *     → hub: Counterargument Mode / Pre-Mortem Studio (optional, either/both/neither)
 *     → DecisionRecord (Gate 3 confirm → HUMAN_DECISION event + canonical Document)
 *
 * The hub holds the lifted AnalysisResult plus any counterargument summary and
 * pre-mortem result, so the optional modes accumulate onto the record without
 * re-running the analysis. Styling is inline (consistent with the shell chrome).
 *
 * Version: 1.1 (core complete) · Session 5 · June 16, 2026
 */

import { useState } from "react";
import type { CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { DecisionFramer } from "./DecisionFramer";
import { PriorPositionAlert } from "./PriorPositionAlert";
import { AnalysisPanel, AnalysisResultView } from "./AnalysisPanel";
import { CounterargumentPanel } from "./CounterargumentPanel";
import { PreMortemStudio } from "./PreMortemStudio";
import { DecisionRecordPanel } from "./DecisionRecordPanel";
import type { AnalysisResult } from "./analysis-contract";
import type { CounterargumentSummary } from "./counter-contract";
import type { PreMortemResult } from "./premortem-contract";
import type { COUNSELInboundContext, DecisionFrame } from "./types";

export interface CounselAppProps {
  ctx: SovereignShellContext;
  /** Optional deep-link context when COUNSEL is entered from a product / VIGIL. */
  inbound?: COUNSELInboundContext;
}

type HubView = "hub" | "counter" | "premortem" | "record";

export function CounselApp({ ctx, inbound }: CounselAppProps): JSX.Element {
  const [frame, setFrame] = useState<DecisionFrame | null>(null);
  const [priorResolved, setPriorResolved] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [counterargument, setCounterargument] = useState<CounterargumentSummary | undefined>();
  const [preMortem, setPreMortem] = useState<PreMortemResult | undefined>();
  const [view, setView] = useState<HubView>("hub");

  const reframe = (): void => {
    setFrame(null);
    setPriorResolved(false);
    setAnalysis(null);
    setCounterargument(undefined);
    setPreMortem(undefined);
    setView("hub");
  };

  // Flow: frame → prior position check → analysis → hub (+ optional modes) → record.
  let body: JSX.Element;
  if (frame === null) {
    body = <DecisionFramer ctx={ctx} inbound={inbound} onSubmit={setFrame} />;
  } else if (!priorResolved) {
    body = (
      <PriorPositionAlert ctx={ctx} frame={frame} onResolved={() => setPriorResolved(true)} />
    );
  } else if (analysis === null) {
    body = <AnalysisPanel ctx={ctx} frame={frame} onReframe={reframe} onComplete={setAnalysis} />;
  } else if (view === "counter") {
    body = (
      <CounterargumentPanel
        ctx={ctx}
        frame={frame}
        analysis={analysis}
        onComplete={(summary) => {
          setCounterargument(summary);
          setView("hub");
        }}
        onSkip={() => setView("hub")}
      />
    );
  } else if (view === "premortem") {
    body = (
      <PreMortemStudio
        ctx={ctx}
        frame={frame}
        analysis={analysis}
        onComplete={(result) => {
          setPreMortem(result);
          setView("hub");
        }}
        onSkip={() => setView("hub")}
      />
    );
  } else if (view === "record") {
    body = (
      <DecisionRecordPanel
        ctx={ctx}
        frame={frame}
        analysis={analysis}
        counterargument={counterargument}
        preMortem={preMortem}
        defaultProgramId={inbound?.programId}
        conflictingRecordIds={undefined}
      />
    );
  } else {
    body = (
      <div style={hubStyle}>
        <div style={topRowStyle}>
          <h2 style={hubTitleStyle}>Analysis</h2>
          <button style={secondaryButtonStyle} onClick={reframe}>
            Re-frame
          </button>
        </div>
        <p style={mutedStyle}>{frame.decisionStatement}</p>

        <AnalysisResultView result={analysis} />

        <h3 style={sectionStyle}>Next steps</h3>
        <p style={mutedStyle}>
          Stress-test your leaning choice or run a pre-mortem (either, both, or neither), then record
          the decision. COUNSEL advises; you decide.
        </p>
        <div style={actionsRowStyle}>
          <button style={modeButtonStyle} onClick={() => setView("counter")}>
            Counterargument{counterargument ? " ✓" : ""}
          </button>
          <button style={modeButtonStyle} onClick={() => setView("premortem")}>
            Pre-Mortem{preMortem ? " ✓" : ""}
          </button>
          <button style={primaryButtonStyle} onClick={() => setView("record")}>
            Record decision
          </button>
        </div>
      </div>
    );
  }

  return (
    <section style={rootStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>COUNSEL</h1>
        <p style={subtitleStyle}>Human Decision Support · Companion Suite</p>
      </header>
      {body}
    </section>
  );
}

// ============================================================
// STYLES (inline)
// ============================================================

const rootStyle: CSSProperties = {
  fontFamily: "system-ui, sans-serif",
  padding: 32,
  color: "#0f172a",
  height: "100%",
  boxSizing: "border-box",
  overflow: "auto",
};
const headerStyle: CSSProperties = { marginBottom: 20 };
const titleStyle: CSSProperties = { margin: "0 0 4px", fontSize: 22 };
const subtitleStyle: CSSProperties = { margin: 0, color: "#475569" };
const hubStyle: CSSProperties = { maxWidth: 720 };
const topRowStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const hubTitleStyle: CSSProperties = { margin: "0 0 4px", fontSize: 18 };
const mutedStyle: CSSProperties = { margin: "0 0 12px", color: "#475569", fontSize: 14 };
const sectionStyle: CSSProperties = { margin: "16px 0 8px", fontSize: 15 };
const actionsRowStyle: CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap" };
const modeButtonStyle: CSSProperties = {
  padding: "8px 16px", background: "#f1f5f9", color: "#0f172a", border: "1px solid #cbd5e1",
  borderRadius: 8, fontSize: 13, cursor: "pointer",
};
const primaryButtonStyle: CSSProperties = {
  padding: "8px 16px", background: "#0c4a6e", color: "#ffffff", border: "none",
  borderRadius: 8, fontSize: 13, cursor: "pointer",
};
const secondaryButtonStyle: CSSProperties = {
  padding: "6px 14px", background: "#f1f5f9", color: "#0f172a", border: "1px solid #cbd5e1",
  borderRadius: 8, fontSize: 13, cursor: "pointer",
};

export default CounselApp;

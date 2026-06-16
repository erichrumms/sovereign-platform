/**
 * SOVEREIGN Platform — module-counsel
 * CounterargumentPanel.tsx — Counterargument Mode UI (spec §6: CounterargumentPanel).
 *
 * Multi-turn adversarial dialogue on a selected alternative. The component owns
 * rendering and interaction only — all LLM/Logger work lives in useCounterargument.
 * The user picks the alternative they are leaning toward, COUNSEL challenges it,
 * the user defends and asks for the next turn, then concludes whether the position
 * survived. The conclusion (a CounterargumentSummary) is handed back to the parent
 * so it can extend the AnalysisResult and feed the Decision Record.
 *
 * Version: 1.0 · Session 5 · June 16, 2026
 */

import { useState } from "react";
import type { CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import type { AnalysisResult, RiskSeverity } from "./analysis-contract";
import type { CounterargumentExchange } from "./counter-engine";
import type { CounterargumentSummary } from "./counter-contract";
import { useCounterargument } from "./useCounterargument";
import type { DecisionFrame } from "./types";

export interface CounterargumentPanelProps {
  ctx: SovereignShellContext;
  frame: DecisionFrame;
  analysis: AnalysisResult;
  onComplete: (summary: CounterargumentSummary) => void;
  onSkip: () => void;
}

export function CounterargumentPanel({
  ctx,
  frame,
  analysis,
  onComplete,
  onSkip,
}: CounterargumentPanelProps): JSX.Element {
  const { status, outcome, error, challenge } = useCounterargument(ctx);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [turns, setTurns] = useState<CounterargumentExchange[]>([]);
  const [defense, setDefense] = useState("");
  const [concluding, setConcluding] = useState(false);
  const [netAssessment, setNetAssessment] = useState("");

  const running = status === "running";

  const startChallenge = (id: string): void => {
    setTargetId(id);
    setTurns([]);
    void challenge({ frame, analysis, targetAlternativeId: id, priorTurns: [], humanDefense: "" });
  };

  const nextTurn = (): void => {
    if (!targetId || !outcome) return;
    // Record the just-shown challenge + the human's defense as a completed exchange.
    const exchange: CounterargumentExchange = { challenge: outcome.result, humanDefense: defense };
    const priorTurns = [...turns, exchange];
    setTurns(priorTurns);
    setDefense("");
    void challenge({ frame, analysis, targetAlternativeId: targetId, priorTurns, humanDefense: defense });
  };

  const finish = (positionSurvived: boolean): void => {
    if (!targetId) return;
    const allTurns = outcome ? [...turns, { challenge: outcome.result, humanDefense: defense }] : turns;
    onComplete({
      targetAlternativeId: targetId,
      turns: allTurns.map((t) => t.challenge),
      positionSurvived,
      netAssessment: netAssessment.trim() || "(no net assessment recorded)",
    });
  };

  // --- Stage 1: pick the alternative to challenge ---
  if (targetId === null) {
    return (
      <div style={rootStyle}>
        <div style={topRowStyle}>
          <h2 style={titleStyle}>Counterargument</h2>
          <button style={secondaryButtonStyle} onClick={onSkip}>
            Skip
          </button>
        </div>
        <p style={mutedStyle}>
          Pick the alternative you are leaning toward. COUNSEL will argue against it — as your
          strongest honest opponent — so you can stress-test the choice before you make it.
        </p>
        {analysis.alternatives.map((alt) => (
          <button key={alt.id} style={pickButtonStyle} onClick={() => startChallenge(alt.id)}>
            <strong>{alt.label}</strong>
            <span style={pickSummaryStyle}>{alt.summary}</span>
          </button>
        ))}
      </div>
    );
  }

  const targetLabel =
    analysis.alternatives.find((a) => a.id === targetId)?.label ?? targetId;

  // --- Stage 2: the dialogue ---
  return (
    <div style={rootStyle}>
      <div style={topRowStyle}>
        <h2 style={titleStyle}>Counterargument — {targetLabel}</h2>
        <button style={secondaryButtonStyle} onClick={onSkip}>
          Skip
        </button>
      </div>

      {error ? <div style={errorBannerStyle}>{error}</div> : null}

      {turns.map((t, i) => (
        <div key={i} style={pastTurnStyle}>
          <ChallengeView challenge={t.challenge} ordinal={i + 1} />
          {t.humanDefense ? <p style={defenseEchoStyle}>Your defense: {t.humanDefense}</p> : null}
        </div>
      ))}

      {running ? <p style={runningStyle}>COUNSEL is building its challenge…</p> : null}

      {outcome && !running ? (
        <div style={currentTurnStyle}>
          <ChallengeView challenge={outcome.result} ordinal={turns.length + 1} />
          {!concluding ? (
            <>
              <label style={labelStyle} htmlFor="ca-defense">
                Defend your position (or concede a point), then press for the next challenge:
              </label>
              <textarea
                id="ca-defense"
                style={textareaStyle}
                value={defense}
                onChange={(e) => setDefense(e.target.value)}
                rows={3}
                placeholder="Your response to this challenge…"
              />
              <div style={actionsRowStyle}>
                <button style={primaryButtonStyle} onClick={nextTurn} disabled={running}>
                  Press further
                </button>
                <button style={secondaryButtonStyle} onClick={() => setConcluding(true)}>
                  Conclude the dialogue
                </button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {concluding ? (
        <div style={concludeStyle}>
          <label style={labelStyle} htmlFor="ca-net">
            Your net assessment — did the position survive the challenge, and why?
          </label>
          <textarea
            id="ca-net"
            style={textareaStyle}
            value={netAssessment}
            onChange={(e) => setNetAssessment(e.target.value)}
            rows={3}
            placeholder="Your conclusion (COUNSEL advises; you decide)…"
          />
          <div style={actionsRowStyle}>
            <button style={primaryButtonStyle} onClick={() => finish(true)}>
              Position held
            </button>
            <button style={dangerButtonStyle} onClick={() => finish(false)}>
              Position weakened — reconsider
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ChallengeView({
  challenge,
  ordinal,
}: {
  challenge: import("./counter-contract").CounterargumentChallenge;
  ordinal: number;
}): JSX.Element {
  const degraded = challenge.source && challenge.source !== "live";
  return (
    <div>
      <div style={turnHeadStyle}>
        <span style={turnOrdinalStyle}>Challenge {ordinal}</span>
        <PressureBadge level={challenge.pressureLevel} />
        {challenge.source ? <span style={sourceTagStyle}>source: {challenge.source}</span> : null}
      </div>
      {degraded ? (
        <div style={degradedBannerStyle}>
          Degraded mode — served from the <strong>{challenge.source}</strong> tier. This is a
          fallback challenge, not a live argument against your specific position.
        </div>
      ) : null}
      <p style={challengeTextStyle}>{challenge.challengeToPosition}</p>
      <span style={subLabelStyle}>Weaknesses</span>
      <ul style={ulStyle}>
        {challenge.weaknesses.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>
      <p style={lineStyle}>
        <strong>Strongest opposing case:</strong> {challenge.strongestOpposingCase}
      </p>
      <p style={concessionStyle}>
        <strong>Concession:</strong> {challenge.concession}
      </p>
      {challenge.openQuestions.length > 0 ? (
        <>
          <span style={subLabelStyle}>Open questions</span>
          <ul style={ulStyle}>
            {challenge.openQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function PressureBadge({ level }: { level: RiskSeverity }): JSX.Element {
  return <span style={{ ...badgeBaseStyle, ...severityStyle[level] }}>{level}</span>;
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
  borderRadius: 8, color: "#92400e", fontSize: 13, marginBottom: 10,
};
const pickButtonStyle: CSSProperties = {
  display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2,
  width: "100%", textAlign: "left", padding: 12, marginBottom: 8,
  border: "1px solid #cbd5e1", borderRadius: 10, background: "#ffffff", cursor: "pointer",
};
const pickSummaryStyle: CSSProperties = { fontSize: 12, color: "#475569" };
const pastTurnStyle: CSSProperties = {
  padding: 12, border: "1px solid #e2e8f0", borderRadius: 10, marginBottom: 10,
  background: "#f8fafc",
};
const currentTurnStyle: CSSProperties = {
  padding: 12, border: "1px solid #bae6fd", borderRadius: 10, marginBottom: 10, background: "#ffffff",
};
const concludeStyle: CSSProperties = {
  padding: 12, border: "1px solid #cbd5e1", borderRadius: 10, marginBottom: 10, background: "#ffffff",
};
const turnHeadStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 10, marginBottom: 6 };
const turnOrdinalStyle: CSSProperties = { fontWeight: 700, fontSize: 13, color: "#0f172a" };
const challengeTextStyle: CSSProperties = { margin: "0 0 8px", fontSize: 14, color: "#0f172a" };
const concessionStyle: CSSProperties = { margin: "8px 0 0", fontSize: 13, color: "#166534" };
const lineStyle: CSSProperties = { margin: "8px 0 0", fontSize: 13, color: "#334155" };
const subLabelStyle: CSSProperties = { fontSize: 12, fontWeight: 600, color: "#64748b" };
const ulStyle: CSSProperties = { margin: "4px 0 0 16px", padding: 0, fontSize: 13, lineHeight: 1.5 };
const defenseEchoStyle: CSSProperties = { margin: "8px 0 0", fontSize: 12, fontStyle: "italic", color: "#475569" };
const labelStyle: CSSProperties = { display: "block", margin: "12px 0 4px", fontSize: 13, fontWeight: 600, color: "#475569" };
const textareaStyle: CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: 8, borderRadius: 8,
  border: "1px solid #cbd5e1", fontSize: 13, fontFamily: "inherit", resize: "vertical",
};
const actionsRowStyle: CSSProperties = { display: "flex", gap: 8, marginTop: 10 };
const sourceTagStyle: CSSProperties = { fontSize: 11, color: "#94a3b8" };
const primaryButtonStyle: CSSProperties = {
  padding: "6px 14px", background: "#0c4a6e", color: "#ffffff", border: "none",
  borderRadius: 8, fontSize: 13, cursor: "pointer",
};
const secondaryButtonStyle: CSSProperties = {
  padding: "6px 14px", background: "#f1f5f9", color: "#0f172a", border: "1px solid #cbd5e1",
  borderRadius: 8, fontSize: 13, cursor: "pointer",
};
const dangerButtonStyle: CSSProperties = {
  padding: "6px 14px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca",
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

export default CounterargumentPanel;

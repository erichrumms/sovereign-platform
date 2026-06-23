/**
 * SOVEREIGN Platform — module-lens
 * GovernanceExplainer.tsx — LENS surface §2.1.
 *
 * The plain-language question→answer surface powered by lens-explainer (Analytical),
 * grounded ONLY in the two VIGIL source documents. Owns no LLM call or Logger emission
 * itself — those live in useExplanation (spec: "Do not put API calls or Logger calls in
 * component bodies"). It renders the validated LensExplanation and is honest about the
 * serving tier (a degraded answer is labelled, never passed off as a full live answer).
 *
 * Version: 1.0 · Session 8 · June 22, 2026
 */

import { useState, type CSSProperties, type FormEvent } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { useExplanation } from "./useExplanation";
import { LENS_SOURCE_DOCUMENTS } from "./source-documents";

export interface GovernanceExplainerProps {
  ctx: SovereignShellContext;
}

export function GovernanceExplainer({ ctx }: GovernanceExplainerProps): JSX.Element {
  const { status, outcome, error, ask } = useExplanation(ctx);
  const [question, setQuestion] = useState("");

  const onSubmit = (e: FormEvent): void => {
    e.preventDefault();
    void ask(question);
  };

  const running = status === "running";

  return (
    <section aria-label="Governance Explainer" style={wrapStyle}>
      <p style={leadStyle}>
        Ask a plain-language question about how the platform handles{" "}
        <strong>security alerts</strong> and <strong>agent approvals</strong>. Answers are
        grounded only in the LENS source documents:{" "}
        {LENS_SOURCE_DOCUMENTS.map((d) => d.title).join(" and ")}. The Explainer explains —
        it does not decide or act.
      </p>

      <form onSubmit={onSubmit} style={formStyle}>
        <textarea
          aria-label="Your question"
          style={inputStyle}
          rows={3}
          placeholder="e.g. Who is allowed to see security alerts in VIGIL?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={running}
        />
        <button type="submit" style={buttonStyle} disabled={running}>
          {running ? "Asking…" : "Ask the Explainer"}
        </button>
      </form>

      {error && (
        <div role="alert" style={errorStyle}>
          {error}
        </div>
      )}

      {outcome && status === "produced" && (
        <article style={answerStyle} aria-label="Explanation">
          {outcome.tier !== "live" && (
            <div style={degradedStyle}>
              Degraded mode — this response was served from the{" "}
              <strong>{outcome.tier}</strong> tier, not a live explanation.
            </div>
          )}
          <p style={answerTextStyle}>{outcome.explanation.explanation}</p>
          <div style={metaRowStyle}>
            <ConfidenceBadge confidence={outcome.explanation.confidence} />
            <span style={sourcesStyle}>
              Sources: {outcome.explanation.sources.length > 0
                ? outcome.explanation.sources.join(", ")
                : "none"}
            </span>
          </div>
          {outcome.explanation.gaps.length > 0 && (
            <div style={gapsStyle}>
              <strong>Not covered by the sources:</strong>
              <ul style={gapsListStyle}>
                {outcome.explanation.gaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}
        </article>
      )}
    </section>
  );
}

function ConfidenceBadge({ confidence }: { confidence: "grounded" | "partial" }): JSX.Element {
  const grounded = confidence === "grounded";
  return (
    <span
      style={{
        ...badgeStyle,
        background: grounded ? "#dcfce7" : "#fef9c3",
        color: grounded ? "#166534" : "#854d0e",
        border: `1px solid ${grounded ? "#86efac" : "#fde68a"}`,
      }}
    >
      {grounded ? "Grounded" : "Partial"}
    </span>
  );
}

const wrapStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 12, maxWidth: 720 };
const leadStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#475569" };
const formStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 8 };
const inputStyle: CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: 10, fontSize: 14, fontFamily: "inherit",
  border: "1px solid #cbd5e1", borderRadius: 8, resize: "vertical",
};
const buttonStyle: CSSProperties = {
  alignSelf: "flex-start", padding: "8px 16px", fontSize: 14, fontWeight: 600, color: "#ffffff",
  background: "#0f172a", border: "none", borderRadius: 8, cursor: "pointer",
};
const errorStyle: CSSProperties = {
  padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
  color: "#991b1b", fontSize: 13,
};
const answerStyle: CSSProperties = {
  padding: 16, border: "1px solid #e2e8f0", borderRadius: 10, background: "#ffffff",
  display: "flex", flexDirection: "column", gap: 10,
};
const degradedStyle: CSSProperties = {
  padding: "8px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8,
  color: "#92400e", fontSize: 12,
};
const answerTextStyle: CSSProperties = { margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" };
const metaRowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" };
const badgeStyle: CSSProperties = {
  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase",
  letterSpacing: 0.4,
};
const sourcesStyle: CSSProperties = { fontSize: 12, color: "#64748b" };
const gapsStyle: CSSProperties = { fontSize: 12, color: "#475569" };
const gapsListStyle: CSSProperties = { margin: "4px 0 0", paddingLeft: 18 };

export default GovernanceExplainer;

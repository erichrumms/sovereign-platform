/**
 * SOVEREIGN Platform — module-vigil
 * AnomalyTriageAssistant.tsx — the AI-assisted triage surface (spec §2.3).
 *
 * Available only for anomaly alert types (ANOMALY_DETECTED / CPMI_DRIFT_DETECTED /
 * CASCADE_RISK). The operator REVIEWS the assembled AnomalyContext before the call is
 * made (spec §2.3 — a triage session cannot proceed without operator review of
 * context); only then can they run the assistant. The returned brief is ADVISORY —
 * the operator decides (Gate 3). The serving tier (live / cache / static) is shown so
 * a degraded brief is never mistaken for a confident one. Thin presenter over
 * useTriage.
 *
 * Version: 1.0 · Session 7 · June 18, 2026
 */

import { type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import type { AnomalyContext } from "./vigil-types";
import { isTriageEligible } from "./triage-contract";
import { useTriage } from "./useTriage";

export interface AnomalyTriageAssistantProps {
  ctx: SovereignShellContext;
  context: AnomalyContext;
}

export function AnomalyTriageAssistant({ ctx, context }: AnomalyTriageAssistantProps): JSX.Element {
  const triage = useTriage(ctx);
  const eligible = isTriageEligible(context.alert.alertType);

  if (!eligible) {
    return (
      <section style={panelStyle} aria-label="Anomaly Triage Assistant">
        <h4 style={titleStyle}>Anomaly Triage Assistant</h4>
        <p style={mutedStyle}>
          Triage is not available for <strong>{context.alert.alertType}</strong> alerts — only anomaly types
          (ANOMALY_DETECTED, CPMI_DRIFT_DETECTED, CASCADE_RISK). Honeytoken and threshold alerts have clear
          factual interpretations and are investigated directly (spec §2.3).
        </p>
      </section>
    );
  }

  return (
    <section style={panelStyle} aria-label="Anomaly Triage Assistant">
      <h4 style={titleStyle}>Anomaly Triage Assistant</h4>

      {/* Gate 1 disclosure: AI is used here. */}
      <p style={disclosureStyle}>
        AI-assisted. This brief is advisory — you decide the response (Gate&nbsp;3). Review the context below
        before requesting analysis.
      </p>

      <details style={ctxStyle}>
        <summary style={ctxSummaryStyle}>Assembled context for review</summary>
        <ul style={ctxListStyle}>
          <li>Alert: {context.alert.alertType} · {context.alert.alertLevel} · {context.alert.sourceProduct}</li>
          <li>Recent events supplied: {context.recentEvents.length}</li>
          <li>Similar prior alerts supplied: {context.similarAlerts.length}</li>
          <li>Baseline product: {context.productBaseline.product}</li>
        </ul>
      </details>

      <button
        type="button"
        style={btnStyle}
        disabled={triage.status === "running"}
        onClick={() => void triage.runTriage(context)}
      >
        {triage.status === "running" ? "Analyzing…" : "Run Triage Assistant"}
      </button>

      {triage.error && (
        <p role="alert" style={errorStyle}>
          {triage.error}
        </p>
      )}

      {triage.outcome && (
        <div style={briefStyle} aria-label="Triage brief">
          <p style={tierStyle}>
            Serving tier: <strong>{triage.outcome.tier}</strong>
            {triage.outcome.tier !== "live" && " (degraded — treat as a checklist, not an assessment)"}
          </p>

          <h5 style={sectionTitleStyle}>Likely causes</h5>
          <ol style={listStyle}>
            {triage.outcome.brief.likely_causes.map((c, i) => (
              <li key={i}>
                {c.cause} <span style={mutedInlineStyle}>— {c.likelihood}</span>
              </li>
            ))}
          </ol>

          <h5 style={sectionTitleStyle}>Recommended investigation steps</h5>
          <ol style={listStyle}>
            {triage.outcome.brief.recommended_steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>

          <p style={fpStyle}>
            False-positive likelihood: <strong>{triage.outcome.brief.false_positive_likelihood}</strong>/100
          </p>
          <p style={mutedStyle}>{triage.outcome.brief.false_positive_explanation}</p>
        </div>
      )}
    </section>
  );
}

const panelStyle: CSSProperties = {
  padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#ffffff", maxWidth: 720,
};
const titleStyle: CSSProperties = { margin: "0 0 8px", fontSize: 14 };
const disclosureStyle: CSSProperties = {
  margin: "0 0 8px", padding: "6px 10px", borderRadius: 8, background: "#eff6ff",
  border: "1px solid #bfdbfe", color: "#1e40af", fontSize: 12,
};
const ctxStyle: CSSProperties = { marginBottom: 8, fontSize: 12, color: "#475569" };
const ctxSummaryStyle: CSSProperties = { cursor: "pointer", fontWeight: 600 };
const ctxListStyle: CSSProperties = { margin: "6px 0 0", paddingLeft: 18 };
const btnStyle: CSSProperties = {
  padding: "6px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#f8fafc",
  fontSize: 13, cursor: "pointer",
};
const briefStyle: CSSProperties = { marginTop: 10 };
const tierStyle: CSSProperties = { margin: "0 0 6px", fontSize: 12, color: "#475569" };
const sectionTitleStyle: CSSProperties = { margin: "8px 0 4px", fontSize: 13 };
const listStyle: CSSProperties = { margin: 0, paddingLeft: 18, fontSize: 13 };
const fpStyle: CSSProperties = { margin: "8px 0 0", fontSize: 13 };
const mutedStyle: CSSProperties = { margin: "4px 0 0", fontSize: 12, color: "#64748b" };
const mutedInlineStyle: CSSProperties = { color: "#94a3b8" };
const errorStyle: CSSProperties = {
  margin: "8px 0 0", padding: "8px 10px", borderRadius: 8, background: "#fef2f2",
  border: "1px solid #fecaca", color: "#991b1b", fontSize: 12,
};

export default AnomalyTriageAssistant;

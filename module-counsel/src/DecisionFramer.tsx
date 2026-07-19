/**
 * SOVEREIGN Platform — module-counsel
 * DecisionFramer.tsx — COUNSEL entry point (spec §6).
 *
 * Collects a DecisionFrame from the user and hands it to the Analysis Engine.
 * Renders the CPMI-VRS Gate 1 disclosure (spec §7): an AI-support disclosure that
 * appears on every session start and CANNOT be dismissed before framing begins —
 * the form is gated behind an explicit acknowledgement, and a slim disclosure
 * strip remains visible while framing.
 *
 * Component owns rendering and interaction only; all frame state lives in
 * useDecisionFrame (spec: no API/Logger calls in component bodies — framing makes
 * neither). Styling is inline (consistent with the shell chrome / scaffold).
 *
 * Version: 1.0 · Session 4 · June 15, 2026
 */

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";

import { HUMAN_DECISION_TYPES } from "@sovereign/data";
import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { useDecisionFrame } from "./useDecisionFrame";
import { COUNSEL_SOURCE_PRODUCTS } from "./types";
import type { COUNSELInboundContext, DecisionFrame } from "./types";

export interface DecisionFramerProps {
  ctx: SovereignShellContext;
  inbound?: COUNSELInboundContext;
  onSubmit: (frame: DecisionFrame) => void;
}

export function DecisionFramer({ ctx, inbound, onSubmit }: DecisionFramerProps): JSX.Element {
  const [acknowledged, setAcknowledged] = useState(false);
  const [constraintDraft, setConstraintDraft] = useState("");
  const { state, update, addConstraint, removeConstraint, isComplete, frame } =
    useDecisionFrame(inbound);

  // CPMI-VRS Gate 1 — disclosure gate. Non-dismissable; acknowledgement required
  // before framing begins.
  if (!acknowledged) {
    return (
      <div style={gateStyle} role="dialog" aria-label="COUNSEL AI disclosure">
        <h2 style={gateTitleStyle}>CPMI-VRS Gate 1 — AI Decision-Support Disclosure</h2>
        <p style={gateBodyStyle}>
          COUNSEL is an <strong>AI decision-support tool</strong>. It structures your
          decision, generates alternatives, and pressure-tests options to help you
          decide well. <strong>It does not decide for you</strong> — you retain judgment
          at every step.
        </p>
        <ul style={gateListStyle}>
          <li>Analysis is AI-generated and may be incomplete or wrong; verify before acting.</li>
          <li>Your Decision Records are platform audit data and are auditable by authorized administrators.</li>
          <li>This disclosure is recorded as a CPMI-VRS Gate 1 step on every session.</li>
        </ul>
        <button style={primaryButtonStyle} onClick={() => setAcknowledged(true)}>
          I understand — begin framing
        </button>
      </div>
    );
  }

  const canSubmit = isComplete && frame !== null;

  return (
    <div style={rootStyle}>
      <div style={discloStripStyle}>
        CPMI-VRS Gate 1 acknowledged · AI decision support · you retain judgment ·
        records are auditable
      </div>

      <h2 style={sectionTitleStyle}>Frame the decision</h2>
      <p style={mutedStyle}>
        Signed in as <strong>{ctx.auth.user.name}</strong> (<code>{ctx.auth.user.role}</code>).
      </p>

      <Field label="Decision statement" hint="What are you deciding?">
        <textarea
          style={textareaStyle}
          value={state.decisionStatement}
          onChange={(e) => update({ decisionStatement: e.target.value })}
          rows={2}
          placeholder="e.g. Whether to approve the Q3 vendor change request as submitted."
        />
      </Field>

      <Field label="Stakes" hint="Why does this matter? What is at stake?">
        <textarea
          style={textareaStyle}
          value={state.stakes}
          onChange={(e) => update({ stakes: e.target.value })}
          rows={2}
          placeholder="e.g. A wrong approval propagates to the program cost baseline."
        />
      </Field>

      <Field label="Constraints" hint="Hard limits the decision must respect (optional).">
        <div style={constraintRowStyle}>
          <input
            style={inputStyle}
            value={constraintDraft}
            onChange={(e) => setConstraintDraft(e.target.value)}
            placeholder="Add a constraint and press Add"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addConstraint(constraintDraft);
                setConstraintDraft("");
              }
            }}
          />
          <button
            style={secondaryButtonStyle}
            onClick={() => {
              addConstraint(constraintDraft);
              setConstraintDraft("");
            }}
          >
            Add
          </button>
        </div>
        {state.constraints.length > 0 ? (
          <ul style={constraintListStyle}>
            {state.constraints.map((c, i) => (
              <li key={`${c}-${i}`} style={constraintItemStyle}>
                <span>{c}</span>
                <button style={removeButtonStyle} onClick={() => removeConstraint(i)}>
                  remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </Field>

      <div style={contextGridStyle}>
        <Field label="Source product" hint="Where the decision arises.">
          <select
            style={inputStyle}
            value={state.sourceProduct}
            onChange={(e) => update({ sourceProduct: e.target.value as typeof state.sourceProduct })}
          >
            <option value="">— select —</option>
            {COUNSEL_SOURCE_PRODUCTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Decision type" hint="Canonical Decision Matrix taxonomy.">
          <select
            style={inputStyle}
            value={state.decisionType}
            onChange={(e) => update({ decisionType: e.target.value as typeof state.decisionType })}
          >
            <option value="">— select —</option>
            {HUMAN_DECISION_TYPES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Workflow step id" hint="Frozen Intelligence Layer field.">
          <input
            style={inputStyle}
            value={state.workflowStepId}
            onChange={(e) => update({ workflowStepId: e.target.value })}
            placeholder="e.g. NEXUS-APPROVE-v1-step-3"
          />
        </Field>
      </div>

      <button
        style={canSubmit ? primaryButtonStyle : disabledButtonStyle}
        disabled={!canSubmit}
        onClick={() => frame && onSubmit(frame)}
      >
        Run analysis
      </button>
      {!canSubmit ? (
        <p style={hintStyle}>
          Provide a decision statement, stakes, source product, decision type, and
          workflow step id to run the analysis.
        </p>
      ) : null}
    </div>
  );
}

// ------------------------------------------------------------
// Small labeled-field wrapper
// ------------------------------------------------------------

function Field(props: { label: string; hint?: string; children: ReactNode }): JSX.Element {
  return (
    <label style={fieldStyle}>
      <span style={fieldLabelStyle}>{props.label}</span>
      {props.hint ? <span style={fieldHintStyle}>{props.hint}</span> : null}
      {props.children}
    </label>
  );
}

// ============================================================
// STYLES (inline)
// ============================================================

const rootStyle: CSSProperties = { maxWidth: 720 };
const gateStyle: CSSProperties = {
  maxWidth: 620,
  padding: 24,
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderRadius: 12,
};
const gateTitleStyle: CSSProperties = { margin: "0 0 12px", fontSize: 18, color: "#1e3a8a" };
const gateBodyStyle: CSSProperties = { margin: "0 0 12px", color: "#1f2937", lineHeight: 1.5 };
const gateListStyle: CSSProperties = { margin: "0 0 16px 18px", color: "#334155", fontSize: 13, lineHeight: 1.6 };
const discloStripStyle: CSSProperties = {
  margin: "0 0 16px",
  padding: "6px 12px",
  background: "#f1f5f9",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 12,
  color: "#475569",
};
const sectionTitleStyle: CSSProperties = { margin: "0 0 4px", fontSize: 18 };
const mutedStyle: CSSProperties = { margin: "0 0 16px", color: "#64748b", fontSize: 13 };
const fieldStyle: CSSProperties = { display: "block", marginBottom: 16 };
const fieldLabelStyle: CSSProperties = { display: "block", fontWeight: 600, fontSize: 14, marginBottom: 2 };
const fieldHintStyle: CSSProperties = { display: "block", color: "#475569", fontSize: 12, marginBottom: 6 };
const textareaStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: 8,
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  fontFamily: "inherit",
  fontSize: 14,
  resize: "vertical",
};
const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: 8,
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  fontFamily: "inherit",
  fontSize: 14,
};
const contextGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 12,
  marginBottom: 16,
};
const constraintRowStyle: CSSProperties = { display: "flex", gap: 8 };
const constraintListStyle: CSSProperties = { listStyle: "none", margin: "8px 0 0", padding: 0 };
const constraintItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "4px 8px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  marginBottom: 4,
  fontSize: 13,
};
const primaryButtonStyle: CSSProperties = {
  padding: "8px 18px",
  background: "#1d4ed8",
  color: "#ffffff",
  border: "none",
  borderRadius: 8,
  fontSize: 14,
  cursor: "pointer",
};
const disabledButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  background: "#cbd5e1",
  cursor: "not-allowed",
};
const secondaryButtonStyle: CSSProperties = {
  padding: "8px 14px",
  background: "#f1f5f9",
  color: "#0f172a",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  fontSize: 13,
  cursor: "pointer",
  whiteSpace: "nowrap",
};
const removeButtonStyle: CSSProperties = {
  background: "none",
  border: "none",
  color: "#b91c1c",
  cursor: "pointer",
  fontSize: 12,
};
const hintStyle: CSSProperties = { margin: "8px 0 0", color: "#475569", fontSize: 12 };

export default DecisionFramer;

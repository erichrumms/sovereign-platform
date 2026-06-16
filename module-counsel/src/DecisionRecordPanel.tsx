/**
 * SOVEREIGN Platform — module-counsel
 * DecisionRecordPanel.tsx — Decision Record output UI (spec §6: DecisionRecord).
 *
 * Assembles the final record: the user picks the alternative they chose, records
 * their rationale and the program the decision belongs to, and — CPMI-VRS Gate 3 —
 * explicitly confirms they reviewed the analysis and chose an action before the
 * record can be produced. On confirm, useDecisionRecord emits the HUMAN_DECISION
 * event and returns the canonical Document, whose ID is shown for hand-back to the
 * source product. Component owns rendering only; emission lives in the hook.
 *
 * Version: 1.0 · Session 5 · June 16, 2026
 */

import { useState } from "react";
import type { CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import type { AnalysisResult } from "./analysis-contract";
import type { CounterargumentSummary } from "./counter-contract";
import type { PreMortemResult } from "./premortem-contract";
import { useDecisionRecord } from "./useDecisionRecord";
import type { DecisionFrame } from "./types";

export interface DecisionRecordPanelProps {
  ctx: SovereignShellContext;
  frame: DecisionFrame;
  analysis: AnalysisResult;
  counterargument?: CounterargumentSummary;
  preMortem?: PreMortemResult;
  /** Program id when known from the deep-link; the user can override/supply it. */
  defaultProgramId?: string;
  conflictingRecordIds?: string[];
}

export function DecisionRecordPanel({
  ctx,
  frame,
  analysis,
  counterargument,
  preMortem,
  defaultProgramId,
  conflictingRecordIds,
}: DecisionRecordPanelProps): JSX.Element {
  const { status, document, errors, record } = useDecisionRecord(ctx);
  const [chosenId, setChosenId] = useState<string>(analysis.alternatives[0]?.id ?? "");
  const [rationale, setRationale] = useState("");
  const [programId, setProgramId] = useState(defaultProgramId ?? "");
  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  const submit = (): void => {
    record({
      frame,
      analysis,
      counterargument,
      preMortem,
      chosenAlternativeId: chosenId,
      rationale,
      programId,
      conflictingRecordIds,
      reviewConfirmed,
    });
  };

  if (status === "recorded" && document) {
    return (
      <div style={rootStyle}>
        <h2 style={titleStyle}>Decision recorded</h2>
        <div style={successBannerStyle}>
          A <strong>HUMAN_DECISION</strong> event was logged and a canonical Document was produced.
        </div>
        <dl style={dlStyle}>
          <Row label="Document ID" value={document.document_id} mono />
          <Row label="Title" value={document.title} />
          <Row label="Decision type" value={frame.sovereignContext.decisionType} />
          <Row label="Classification" value={document.classification_level} />
          <Row label="Program" value={document.program_id} />
          <Row label="Recorded by" value={`${ctx.auth.user.name} (${document.created_by})`} />
          <Row label="Recorded at" value={document.created_at} mono />
        </dl>
        <p style={mutedStyle}>
          The Document ID is the hand-back reference for the source product
          ({frame.sovereignContext.sourceProduct}).
        </p>
      </div>
    );
  }

  return (
    <div style={rootStyle}>
      <h2 style={titleStyle}>Record decision</h2>
      <p style={mutedStyle}>{frame.decisionStatement}</p>

      {errors ? (
        <div style={errorBannerStyle}>
          <strong>Cannot record yet:</strong>
          <ul style={ulStyle}>
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <label style={labelStyle} htmlFor="dr-choice">
        Which alternative did you choose?
      </label>
      <select
        id="dr-choice"
        style={selectStyle}
        value={chosenId}
        onChange={(e) => setChosenId(e.target.value)}
      >
        {analysis.alternatives.map((alt) => (
          <option key={alt.id} value={alt.id}>
            {alt.label}
          </option>
        ))}
      </select>

      <label style={labelStyle} htmlFor="dr-rationale">
        Your rationale
      </label>
      <textarea
        id="dr-rationale"
        style={textareaStyle}
        rows={3}
        value={rationale}
        onChange={(e) => setRationale(e.target.value)}
        placeholder="Why this choice? (recorded in the decision audit trail)"
      />

      <label style={labelStyle} htmlFor="dr-program">
        Program ID
      </label>
      <input
        id="dr-program"
        style={inputStyle}
        value={programId}
        onChange={(e) => setProgramId(e.target.value)}
        placeholder="e.g. PRG-1042"
      />

      <label style={checkRowStyle}>
        <input
          type="checkbox"
          checked={reviewConfirmed}
          onChange={(e) => setReviewConfirmed(e.target.checked)}
        />
        <span>
          I confirm I have reviewed the analysis
          {counterargument ? ", counterargument" : ""}
          {preMortem ? ", pre-mortem" : ""} and have chosen this action. (CPMI-VRS Gate 3)
        </span>
      </label>

      <button style={reviewConfirmed ? primaryButtonStyle : disabledButtonStyle} onClick={submit} disabled={!reviewConfirmed}>
        Produce Decision Record
      </button>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }): JSX.Element {
  return (
    <div style={rowStyle}>
      <dt style={dtStyle}>{label}</dt>
      <dd style={{ ...ddStyle, ...(mono ? monoStyle : {}) }}>{value}</dd>
    </div>
  );
}

// ============================================================
// STYLES (inline — consistent with AnalysisPanel)
// ============================================================

const rootStyle: CSSProperties = { maxWidth: 720 };
const titleStyle: CSSProperties = { margin: "0 0 4px", fontSize: 18 };
const mutedStyle: CSSProperties = { margin: "0 0 12px", color: "#475569", fontSize: 14 };
const successBannerStyle: CSSProperties = {
  padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0",
  borderRadius: 8, color: "#166534", fontSize: 13, marginBottom: 12,
};
const errorBannerStyle: CSSProperties = {
  padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca",
  borderRadius: 8, color: "#7f1d1d", fontSize: 13, marginBottom: 12,
};
const labelStyle: CSSProperties = { display: "block", margin: "12px 0 4px", fontSize: 13, fontWeight: 600, color: "#475569" };
const selectStyle: CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: 8, borderRadius: 8,
  border: "1px solid #cbd5e1", fontSize: 13, fontFamily: "inherit",
};
const inputStyle: CSSProperties = { ...selectStyle };
const textareaStyle: CSSProperties = { ...selectStyle, resize: "vertical" };
const checkRowStyle: CSSProperties = {
  display: "flex", gap: 8, alignItems: "flex-start", margin: "14px 0", fontSize: 13, color: "#0f172a",
};
const primaryButtonStyle: CSSProperties = {
  padding: "8px 16px", background: "#0c4a6e", color: "#ffffff", border: "none",
  borderRadius: 8, fontSize: 14, cursor: "pointer",
};
const disabledButtonStyle: CSSProperties = {
  ...primaryButtonStyle, background: "#cbd5e1", color: "#64748b", cursor: "not-allowed",
};
const ulStyle: CSSProperties = { margin: "4px 0 0 16px", padding: 0, fontSize: 13, lineHeight: 1.5 };
const dlStyle: CSSProperties = { margin: "0 0 12px" };
const rowStyle: CSSProperties = { display: "flex", gap: 12, padding: "4px 0", borderBottom: "1px solid #f1f5f9" };
const dtStyle: CSSProperties = { width: 130, flexShrink: 0, fontSize: 12, fontWeight: 600, color: "#64748b" };
const ddStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#0f172a" };
const monoStyle: CSSProperties = { fontFamily: "ui-monospace, monospace", fontSize: 12 };

export default DecisionRecordPanel;

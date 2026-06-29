/**
 * SOVEREIGN Platform — module-flowpath
 * ElicitationDialogue.tsx — Screen 2: the Elicitation Dialogue (organizational mode).
 *
 * The interview workspace. flowpath.interviewer (organizational mode, PR-FLOWPATH-001) asks the
 * subject matter expert the five completeness questions in plain domain language (Gap 5 — never
 * SOVEREIGN internals). The Five-Question Gate status is visible throughout. "Produce workflow
 * artifact" is enabled only when all five are answered; on production flowpath.mapper builds the
 * WorkflowArtifact + calibration bundle (via createSovereignClient) and the four GD-18 artifact
 * events are logged. The artifact is previewed in plain prose, never a schema dump.
 *
 * Gap 6: Category 1 amber notice for remaining gaps; Category 2 blue AI-disclosure + GD-10;
 * Category 3 the dialogue and emerging artifact in white cards.
 *
 * Version: 1.0 · Session 20 (D4) · June 26, 2026
 */

import { useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  Gate1Banner,
  ClassificationBoundaryBanner,
  StatusNotice,
  contentCardStyle,
  sectionHeadingStyle,
  bodyTextStyle,
  gateStatusColors,
} from "./banners";
import type { FiveQuestionId, FlowpathMapperOutput } from "./flowpath-contract";
import { useFlowpathElicitation, FIVE_QUESTION_ORDER } from "./useFlowpathElicitation";
import type { MapperDeps } from "./flowpath-mapper";
import { SYNTHETIC_SESSION_ID } from "./synthetic-elicitation";

export interface ElicitationDialogueProps {
  ctx: SovereignShellContext;
  /** The session this dialogue belongs to (defaults to the synthetic operational session). */
  sessionId?: string;
  /** Injectable LLM call (tests). Defaults to createSovereignClient(). */
  complete?: MapperDeps["complete"];
}

/**
 * The interviewer's questions, in plain domain language (Gap 5 — no SOVEREIGN internals).
 * WC-4: phrased for knowledge work as a federal program analyst experiences it (program review
 * and oversight), not a production line. The five map to WHO / SEQUENCE / CONDITIONS /
 * INPUTS_OUTPUTS / TERMINAL.
 */
const QUESTION_PROMPTS: Record<FiveQuestionId, string> = {
  WHO: "Which role is responsible for each part of this work?",
  SEQUENCE: "In what order do these steps happen across a review cycle?",
  CONDITIONS: "What needs to be in place before the work can begin, and what decisions send it down a different path?",
  INPUTS_OUTPUTS: "What information and records does each step rely on, and what does it produce?",
  TERMINAL: "How do you know the work is complete and ready to hand off?",
};

export function ElicitationDialogue({ ctx, sessionId, complete }: ElicitationDialogueProps): JSX.Element {
  const session = sessionId ?? SYNTHETIC_SESSION_ID;
  const { answers, setAnswer, gate, allAnswered, status, bundle, error, produceArtifact } = useFlowpathElicitation(ctx, {
    sessionId: session,
    complete,
  });

  const remaining = gate.filter((g) => !g.answered);

  // WC-3: the gate-not-met notice must NOT greet the user on first load. It appears only after the
  // user actually attempts to produce an artifact with questions still open. `attempted` records
  // that an attempt was made; the notice clears automatically once all five are answered.
  const [attempted, setAttempted] = useState(false);
  const onProduce = (): void => {
    if (!allAnswered) {
      setAttempted(true); // surface the gate notice; do not produce
      return;
    }
    void produceArtifact();
  };

  return (
    <div>
      {/* Category 2 — permanent governance guardrails. */}
      <Gate1Banner />
      <ClassificationBoundaryBanner operatorName={ctx.auth.user.name} />

      {/* Category 1 — temporary gate-failure notice (amber). WC-3: shown only AFTER a produce
          attempt that still has gaps — never on first load. */}
      {attempted && !allAnswered && (
        <StatusNotice label="Five-Question Gate not yet met:">
          Still needed — {remaining.map((g) => g.label).join(" ")} A workflow artifact cannot be
          produced until all five questions are answered.
        </StatusNotice>
      )}

      {/* Category 3 — the dialogue. */}
      <div style={contentCardStyle}>
        <h2 style={sectionHeadingStyle}>Elicitation dialogue</h2>
        <p style={bodyTextStyle}>
          Answer each question the way you would describe the work to a new colleague. Your answers
          become a workflow others can follow.
        </p>
        {FIVE_QUESTION_ORDER.map((q) => (
          <div key={q} style={{ marginBottom: 14 }}>
            <label htmlFor={`q-${q}`} style={questionLabelStyle}>
              {QUESTION_PROMPTS[q]}
            </label>
            <textarea
              id={`q-${q}`}
              aria-label={QUESTION_PROMPTS[q]}
              value={answers[q]}
              onChange={(e) => setAnswer(q, e.target.value)}
              rows={2}
              style={textareaStyle}
            />
          </div>
        ))}
      </div>

      {/* Category 3 — the Five-Question Gate status, visible throughout. */}
      <div style={contentCardStyle}>
        <h2 style={sectionHeadingStyle}>Five-Question Gate</h2>
        <ul style={gateListStyle} aria-label="Five-Question Gate status">
          {gate.map((g) => {
            const colors = gateStatusColors(g.answered);
            return (
              <li key={g.question} style={gateRowStyle} data-question={g.question} data-answered={g.answered}>
                <span style={{ ...pillStyle, color: colors.color, background: colors.background }}>
                  {g.answered ? "Answered" : "Still needed"}
                </span>
                <span style={{ fontWeight: 600 }}>{g.label}</span>
                {!g.answered && g.gap && <span style={gapStyle}> — {g.gap}</span>}
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={onProduce}
          disabled={status === "running"}
          style={{ ...produceButtonStyle, cursor: status === "running" ? "wait" : "pointer" }}
        >
          Produce workflow artifact
        </button>
        {error && <p style={{ ...bodyTextStyle, color: "#b91c1c", marginTop: 8 }}>{error}</p>}
      </div>

      {/* Category 3 — the produced artifact, previewed in plain prose (Gap 5 — not a schema dump). */}
      {bundle && <ArtifactPreview bundle={bundle} />}
    </div>
  );
}

export function ArtifactPreview({ bundle }: { bundle: FlowpathMapperOutput }): JSX.Element {
  const { artifact, vocabulary, data_sources, validation_cadence } = bundle;
  return (
    <div style={contentCardStyle} data-testid="artifact-preview">
      <h2 style={sectionHeadingStyle}>Workflow artifact for review</h2>
      <p style={{ ...bodyTextStyle, fontWeight: 600 }}>{artifact.title}</p>
      <p style={bodyTextStyle}>{artifact.summary}</p>
      <ol style={{ margin: "0 0 12px", paddingLeft: 20, color: "#334155", fontSize: 14, lineHeight: 1.5 }}>
        {artifact.steps.map((s) => (
          <li key={s.step_id} style={{ marginBottom: 6 }}>
            {s.description} The {s.responsible_role} is responsible. It begins when {s.trigger_condition.toLowerCase()} It
            receives {s.inputs.join(", ")} and produces {s.outputs.join(", ")}.
          </li>
        ))}
      </ol>
      <p style={bodyTextStyle}>The workflow is complete when {artifact.terminal_condition.toLowerCase()}</p>
      <p style={bodyTextStyle}>
        <strong>Captured vocabulary:</strong>{" "}
        {vocabulary.entries.map((e) => `${e.term} (${e.definition})`).join("; ")}.
      </p>
      <p style={bodyTextStyle}>
        <strong>Source systems:</strong>{" "}
        {data_sources.sources.map((s) => `${s.source_name}, the organization's ${s.source_type} system`).join("; ")}.
      </p>
      <p style={bodyTextStyle}>
        <strong>Validation cadence:</strong> {validation_cadence.cadence_type} — {validation_cadence.what_is_validated} The{" "}
        {validation_cadence.responsible_role} signs off.
      </p>
    </div>
  );
}

const questionLabelStyle: CSSProperties = { display: "block", fontWeight: 600, color: "#0f172a", fontSize: 14, marginBottom: 6 };
const textareaStyle: CSSProperties = { width: "100%", maxWidth: 820, boxSizing: "border-box", padding: "8px 10px", fontSize: 14, fontFamily: "inherit", color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: 8, resize: "vertical" };
const gateListStyle: CSSProperties = { listStyle: "none", margin: "0 0 12px", padding: 0, display: "flex", flexDirection: "column", gap: 8 };
const gateRowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 8, color: "#0f172a", fontSize: 14, flexWrap: "wrap" };
const pillStyle: CSSProperties = { padding: "2px 8px", borderRadius: 999, fontSize: 12, fontWeight: 700 };
const gapStyle: CSSProperties = { color: "#475569", fontSize: 13 };
const produceButtonStyle: CSSProperties = { padding: "8px 14px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#2563eb", border: "1px solid #1d4ed8", borderRadius: 8 };

export default ElicitationDialogue;

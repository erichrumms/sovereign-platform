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
 * Session 63 (Task 2 — WH-20): a PRELIMINARY CONTEXT stage is shown BEFORE the five questions.
 * Four context-setting questions (goals, data source, governing policy, population) must be
 * answered and confirmed before the five-question stage unlocks. Wording approved by Project
 * Principal in Session 64 (WH-20 sign-off); draft-wording banner removed.
 *
 * Gap 6: Category 1 amber notice for remaining gaps; Category 2 blue AI-disclosure + GD-10;
 * Category 3 the dialogue and emerging artifact in white cards.
 *
 * Version: 1.2 · Session 64 (WH-20 sign-off — banner removal) · July 25, 2026
 */

import { useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  StatusNotice,
  contentCardStyle,
  sectionHeadingStyle,
  bodyTextStyle,
  gateStatusColors,
} from "./banners";
import {
  EMPTY_PRELIM_CONTEXT,
  PRELIM_CONTEXT_LABELS,
  PRELIM_QUESTION_ORDER,
  type FiveQuestionId,
  type FlowpathMapperOutput,
  type PrelimContextQuestionId,
  type PreliminaryContext,
} from "./flowpath-contract";
import { useFlowpathElicitation, FIVE_QUESTION_ORDER } from "./useFlowpathElicitation";
import type { MapperDeps } from "./flowpath-mapper";
import { SYNTHETIC_SESSION_ID } from "./synthetic-elicitation";

export interface ElicitationDialogueProps {
  ctx: SovereignShellContext;
  /** The session this dialogue belongs to (defaults to the synthetic operational session). */
  sessionId?: string;
  /** Injectable LLM call (tests). Defaults to createSovereignClient(). */
  complete?: MapperDeps["complete"];
  /**
   * WH-20 (Session 63): called when all four preliminary context questions are confirmed.
   * The parent marks the session's preliminary_complete flag.
   */
  onPreliminaryComplete?: (sessionId: string) => void;
  /**
   * WH-20 (Session 63): called after the workflow artifact is produced (gate passed).
   * The parent updates the session to COMPLETE + gate_passed, stores the bundle, and
   * navigates to WorkflowArtifactReview.
   */
  onArtifactProduced?: (sessionId: string, bundle: FlowpathMapperOutput) => void;
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

/** Preliminary context question prompts — approved by Project Principal (Session 64, WH-20). */
const PRELIM_QUESTION_PROMPTS: Record<PrelimContextQuestionId, string> = {
  GOALS: "What are the primary goals or objectives this workflow is intended to accomplish?",
  DATA_SOURCE: "What data sources, systems, or information does this workflow rely on?",
  GOVERNING_POLICY: "Which policy, regulation, directive, or internal standard governs this workflow?",
  POPULATION: "Who are the people, roles, or organizations involved in or affected by this workflow?",
};

export function ElicitationDialogue({
  ctx,
  sessionId,
  complete,
  onPreliminaryComplete,
  onArtifactProduced,
}: ElicitationDialogueProps): JSX.Element {
  const session = sessionId ?? SYNTHETIC_SESSION_ID;
  const { answers, setAnswer, gate, allAnswered, status, bundle, error, produceArtifact } = useFlowpathElicitation(ctx, {
    sessionId: session,
    complete,
  });

  // Preliminary context state (Task 2).
  const [prelimAnswers, setPrelimAnswers] = useState<PreliminaryContext>(EMPTY_PRELIM_CONTEXT);
  const [prelimComplete, setPrelimComplete] = useState(false);
  const [prelimAttempted, setPrelimAttempted] = useState(false);

  const allPrelimAnswered = PRELIM_QUESTION_ORDER.every((q) => prelimAnswers[q].trim() !== "");

  const confirmPrelim = (): void => {
    if (!allPrelimAnswered) {
      setPrelimAttempted(true);
      return;
    }
    setPrelimComplete(true);
    onPreliminaryComplete?.(session);
  };

  const remaining = gate.filter((g) => !g.answered);

  // WC-3: the gate-not-met notice must NOT greet the user on first load. It appears only after the
  // user actually attempts to produce an artifact with questions still open. `attempted` records
  // that an attempt was made; the notice clears automatically once all five are answered.
  const [attempted, setAttempted] = useState(false);

  // Local enriched bundle (preliminary context merged in) — drives the preview and the callback.
  const [enrichedBundle, setEnrichedBundle] = useState<FlowpathMapperOutput | null>(null);

  const onProduce = async (): Promise<void> => {
    if (!allAnswered) {
      setAttempted(true);
      return;
    }
    const result = await produceArtifact();
    if (result) {
      // Merge preliminary context (user-supplied) into the artifact before handing upstream.
      const merged: FlowpathMapperOutput = {
        ...result,
        artifact: { ...result.artifact, preliminary_context: prelimAnswers },
      };
      setEnrichedBundle(merged);
      onArtifactProduced?.(session, merged);
    }
  };

  const displayBundle = enrichedBundle ?? bundle;

  return (
    <div>
      {/* ── PRELIMINARY CONTEXT STAGE ────────────────────────────────────────
          Four context-setting questions answered BEFORE the five-question elicitation.
          Question wording approved by Project Principal (Session 64, WH-20).
      */}
      <div style={contentCardStyle}>
        <h2 style={sectionHeadingStyle}>Preliminary context</h2>
        <p style={bodyTextStyle}>
          Answer these four questions to set the context for the elicitation. All four are required
          before the five-question stage unlocks.
        </p>
        {PRELIM_QUESTION_ORDER.map((q) => {
          const unanswered = prelimAttempted && prelimAnswers[q].trim() === "";
          return (
            <div key={q} style={{ marginBottom: 14 }}>
              <label htmlFor={`prelim-${q}`} style={questionLabelStyle}>
                {PRELIM_CONTEXT_LABELS[q]}
                {unanswered && <span style={errorInlineStyle}> — required</span>}
              </label>
              <p style={{ ...bodyTextStyle, margin: "2px 0 6px", fontSize: 13, color: "#64748b" }}>
                {PRELIM_QUESTION_PROMPTS[q]}
              </p>
              <textarea
                id={`prelim-${q}`}
                aria-label={PRELIM_CONTEXT_LABELS[q]}
                aria-required="true"
                aria-invalid={unanswered}
                value={prelimAnswers[q]}
                disabled={prelimComplete}
                onChange={(e) => setPrelimAnswers((prev) => ({ ...prev, [q]: e.target.value }))}
                rows={2}
                style={{ ...textareaStyle, ...(prelimComplete ? { background: "#f8fafc", color: "#64748b" } : {}) }}
              />
            </div>
          );
        })}
        {!prelimComplete ? (
          <button type="button" onClick={confirmPrelim} style={confirmButtonStyle}>
            Confirm preliminary context
          </button>
        ) : (
          <p style={{ ...bodyTextStyle, color: "#065f46", fontWeight: 600 }}>
            Preliminary context confirmed.
          </p>
        )}
      </div>

      {/* ── FIVE-QUESTION ELICITATION (unlocked after preliminary context) ─── */}
      {prelimComplete ? (
        <>
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
              onClick={() => { void onProduce(); }}
              disabled={status === "running"}
              style={{ ...produceButtonStyle, cursor: status === "running" ? "wait" : "pointer" }}
            >
              Produce workflow artifact
            </button>
            {error && <p style={{ ...bodyTextStyle, color: "#b91c1c", marginTop: 8 }}>{error}</p>}
          </div>

          {/* Category 3 — the produced artifact, previewed in plain prose (Gap 5 — not a schema dump). */}
          {displayBundle && <ArtifactPreview bundle={displayBundle} />}
        </>
      ) : (
        <div style={{ ...contentCardStyle, background: "#f8fafc", color: "#64748b" }}>
          <p style={{ margin: 0, fontSize: 14 }}>
            The five-question elicitation will unlock once the preliminary context is confirmed above.
          </p>
        </div>
      )}
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
const confirmButtonStyle: CSSProperties = { padding: "8px 14px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#047857", border: "1px solid #065f46", borderRadius: 8, cursor: "pointer" };
const errorInlineStyle: CSSProperties = { color: "#dc2626", fontWeight: 400, fontSize: 13 };

export default ElicitationDialogue;

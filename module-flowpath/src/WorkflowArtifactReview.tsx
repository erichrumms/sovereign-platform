/**
 * SOVEREIGN Platform — module-flowpath
 * WorkflowArtifactReview.tsx — Screen 3: the Workflow Artifact Review and approval surface.
 *
 * The human approval gate (spec §6 Screen 3 / §11 D-FLOWPATH-4). The structured WorkflowArtifact
 * produced by flowpath.mapper is displayed in plain prose (Gap 5) — each step a paragraph, each
 * vocabulary term a sentence, each data source in plain language — never a schema dump. The
 * reviewing human (program manager / process owner) either:
 *   - Approves: logs a HUMAN_DECISION carrying decision_type WORKFLOW_APPROVAL (Constraint #4) and
 *     FLOWPATH_ARTIFACT_APPROVED, then the artifact is committed to the registry (Screen 1).
 *   - Returns for revision: logs FLOWPATH_GATE_FAILED with the reviewer's plain-prose note, and the
 *     session returns to the elicitation dialogue (Screen 2) for correction.
 * No WorkflowArtifact is committed until a named human reviewer approves it (spec §6 / Constraint #4).
 *
 * Gap 6: Category 2 blue AI-disclosure guardrail (permanent); Category 1 amber revision-in-progress
 * notice (transient); Category 3 the artifact content in white cards on the light canvas.
 *
 * Version: 1.0 · Session 21 (D1) · June 26, 2026
 */

import { useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  GovernanceBanner,
  ClassificationBoundaryBanner,
  StatusNotice,
  contentCardStyle,
  sectionHeadingStyle,
  bodyTextStyle,
} from "./banners";
import {
  FLOWPATH_COORDINATOR,
  FLOWPATH_VALIDATOR,
  artifactWorkflowStep,
  evaluateFiveQuestionGate,
  type FlowpathMapperOutput,
} from "./flowpath-contract";
import { SYNTHETIC_MAPPER_OUTPUT } from "./synthetic-elicitation";

export interface WorkflowArtifactReviewProps {
  ctx: SovereignShellContext;
  /** The mapper bundle under review. Defaults to the synthetic operational bundle. */
  bundle?: FlowpathMapperOutput;
  /** Called after a successful approval (the shell switches back to Screen 1). */
  onApproved?: (sessionId: string) => void;
  /** Called after a return-for-revision (the shell switches back to Screen 2 with the note). */
  onReturnForRevision?: (sessionId: string, note: string) => void;
}

const MIN_REVISION_NOTE = 10;

export function WorkflowArtifactReview({ ctx, bundle, onApproved, onReturnForRevision }: WorkflowArtifactReviewProps): JSX.Element {
  const work = bundle ?? SYNTHETIC_MAPPER_OUTPUT;
  const { artifact, vocabulary, data_sources, validation_cadence } = work;
  const sessionId = artifact.session_id;
  const workflowStep = artifactWorkflowStep(sessionId);

  const [revising, setRevising] = useState(false);
  const [note, setNote] = useState("");
  const [decision, setDecision] = useState<"approved" | "returned" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const approve = (): void => {
    setError(null);
    // Defensive: a non-gate-passing artifact must never be committed (spec §4).
    if (!evaluateFiveQuestionGate(artifact).gate_passed) {
      setError("This artifact has not passed the Five-Question Gate and cannot be approved. Return it for revision.");
      return;
    }
    try {
      // WORKFLOW_APPROVAL — the human decision that commits the artifact (Constraint #4, GD-18).
      ctx.logger.log({
        event_type: "HUMAN_DECISION",
        workflow_step_id: workflowStep,
        sovereign_tier: "standard",
        product: "FLOWPATH",
        actor_id: ctx.auth.user.employee_id,
        actor: "human",
        actor_name: ctx.auth.user.name,
        decision_type: "WORKFLOW_APPROVAL",
        outcome: "flowpath_workflow_approved",
        payload: { session_id: sessionId, artifact_id: artifact.artifact_id, artifact_type: artifact.workflow_type },
      });
      // FLOWPATH_ARTIFACT_APPROVED — the artifact is now committed to the registry (spec §8).
      ctx.logger.log({
        event_type: "FLOWPATH_ARTIFACT_APPROVED",
        workflow_step_id: workflowStep,
        sovereign_tier: "standard",
        product: "FLOWPATH",
        actor_id: ctx.auth.user.employee_id,
        actor: "human",
        actor_name: ctx.auth.user.name,
        agent_id: FLOWPATH_COORDINATOR,
        outcome: "flowpath_artifact_approved",
        payload: { session_id: sessionId, artifact_type: artifact.workflow_type },
      });
    } catch (err) {
      setError(`Approval could not be recorded — the artifact was not committed (fail-closed): ${err instanceof Error ? err.message : String(err)}`);
      return;
    }
    setDecision("approved");
    onApproved?.(sessionId);
  };

  const returnForRevision = (): void => {
    setError(null);
    const trimmed = note.trim();
    if (trimmed.length < MIN_REVISION_NOTE) {
      setError(`Please describe what needs revision (at least ${MIN_REVISION_NOTE} characters) so the elicitation can be corrected.`);
      return;
    }
    try {
      // Returning for revision means the artifact is not yet complete — FLOWPATH_GATE_FAILED (spec §8).
      ctx.logger.log({
        event_type: "FLOWPATH_GATE_FAILED",
        workflow_step_id: workflowStep,
        sovereign_tier: "standard",
        product: "FLOWPATH",
        actor_id: ctx.auth.user.employee_id,
        agent_id: FLOWPATH_VALIDATOR,
        outcome: "flowpath_artifact_returned_for_revision",
        payload: { session_id: sessionId, returned_by: ctx.auth.user.name, revision_note: trimmed },
      });
    } catch (err) {
      setError(`The revision request could not be recorded: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }
    setDecision("returned");
    onReturnForRevision?.(sessionId, trimmed);
  };

  return (
    <div>
      {/* Category 2 — permanent governance guardrails. */}
      <GovernanceBanner label="AI disclosure:">
        This artifact was produced from AI-assisted elicitation. Review carefully before approving —
        your approval commits it to the workflow registry.
      </GovernanceBanner>
      <ClassificationBoundaryBanner operatorName={ctx.auth.user.name} />

      {/* Category 1 — transient revision-in-progress notice. */}
      {revising && (
        <StatusNotice label="Returning for revision:">
          Describe what the elicitation needs to correct. The session will return to the elicitation
          dialogue so the subject matter expert can address it.
        </StatusNotice>
      )}

      {/* Category 3 — the artifact in plain prose (Gap 5 — never a schema dump). */}
      <div style={contentCardStyle} data-testid="artifact-review">
        <h2 style={sectionHeadingStyle}>Workflow artifact for review</h2>
        <p style={{ ...bodyTextStyle, fontWeight: 600 }}>{artifact.title}</p>
        <p style={bodyTextStyle}>{artifact.summary}</p>

        <h3 style={subHeadingStyle}>How the work is done</h3>
        <ol style={stepListStyle}>
          {artifact.steps.map((s) => (
            <li key={s.step_id} style={{ marginBottom: 8 }}>
              {s.description} The {s.responsible_role} is responsible. It begins when{" "}
              {lowerFirst(ensureSentence(s.trigger_condition))} It receives {joinProse(s.inputs)} and produces{" "}
              {joinProse(s.outputs)}.
            </li>
          ))}
        </ol>
        <p style={bodyTextStyle}>The workflow is complete when {lowerFirst(ensureSentence(artifact.terminal_condition))}</p>

        <h3 style={subHeadingStyle}>The vocabulary this organization uses</h3>
        {vocabulary.entries.map((e) => (
          <p key={e.term} style={bodyTextStyle}>
            By <strong>{e.term}</strong>, this organization means {lowerFirst(ensureSentence(e.definition))}
            {e.threshold ? ` Concern is triggered at ${e.threshold}.` : ""}
          </p>
        ))}

        <h3 style={subHeadingStyle}>The source systems this work draws on</h3>
        {data_sources.sources.map((s) => (
          <p key={s.source_name} style={bodyTextStyle}>
            {s.source_name} is the organization's {s.source_type} system. It provides {joinProse(s.data_elements)},
            updated {s.update_frequency}.
          </p>
        ))}

        <h3 style={subHeadingStyle}>How this work is validated</h3>
        <p style={bodyTextStyle}>
          AI findings are validated on a {validation_cadence.cadence_type} cadence — {lowerFirst(ensureSentence(validation_cadence.what_is_validated))} The{" "}
          {validation_cadence.responsible_role} signs off. {ensureSentence(validation_cadence.sign_off_requirement)} {ensureSentence(validation_cadence.downstream_decisions)}
        </p>
      </div>

      {/* Category 3 — the decision controls. */}
      {decision === "approved" ? (
        <div style={contentCardStyle} data-testid="approved-confirmation">
          <p style={{ ...bodyTextStyle, margin: 0, color: "#065f46" }}>
            Approved by {ctx.auth.user.name}. The workflow artifact has been committed to the registry.
          </p>
        </div>
      ) : decision === "returned" ? (
        <div style={contentCardStyle} data-testid="returned-confirmation">
          <p style={{ ...bodyTextStyle, margin: 0 }}>
            Returned for revision. The session will reopen in the elicitation dialogue for correction.
          </p>
        </div>
      ) : (
        <div style={contentCardStyle}>
          <h2 style={sectionHeadingStyle}>Your decision</h2>
          <p style={bodyTextStyle}>
            If this accurately represents how the work is done, approve it. If anything is wrong or
            missing, return it for revision with a note describing what to correct.
          </p>
          {!revising ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" onClick={approve} style={approveButtonStyle}>
                Approve and commit to registry
              </button>
              <button type="button" onClick={() => setRevising(true)} style={secondaryButtonStyle}>
                Return for revision
              </button>
            </div>
          ) : (
            <div>
              <label htmlFor="revision-note" style={labelStyle}>
                What needs to be corrected?
              </label>
              <textarea
                id="revision-note"
                aria-label="What needs to be corrected?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                style={textareaStyle}
              />
              <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={returnForRevision} style={secondaryButtonStyle}>
                  Send back for revision
                </button>
                <button type="button" onClick={() => { setRevising(false); setNote(""); setError(null); }} style={cancelButtonStyle}>
                  Cancel
                </button>
              </div>
            </div>
          )}
          {error && <p role="alert" style={{ ...bodyTextStyle, color: "#b91c1c", marginTop: 8 }}>{error}</p>}
        </div>
      )}
    </div>
  );
}

/** Join a list as plain prose ("a, b and c"). */
function joinProse(items: string[]): string {
  if (items.length === 0) return "nothing recorded";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Ensure a fragment reads as a sentence (trailing period). */
function ensureSentence(text: string): string {
  const t = text.trim();
  if (t === "") return "";
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

/** Lowercase the first character so a fragment flows mid-sentence. */
function lowerFirst(text: string): string {
  return text.length === 0 ? text : text.charAt(0).toLowerCase() + text.slice(1);
}

const subHeadingStyle: CSSProperties = { margin: "14px 0 6px", fontSize: 14, color: "#0f172a" };
const stepListStyle: CSSProperties = { margin: "0 0 12px", paddingLeft: 20, color: "#334155", fontSize: 14, lineHeight: 1.5, maxWidth: 820 };
const labelStyle: CSSProperties = { display: "block", fontWeight: 600, color: "#0f172a", fontSize: 14, marginBottom: 6 };
const textareaStyle: CSSProperties = { width: "100%", maxWidth: 820, boxSizing: "border-box", padding: "8px 10px", fontSize: 14, fontFamily: "inherit", color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: 8, resize: "vertical" };
const approveButtonStyle: CSSProperties = { padding: "8px 14px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#2563eb", border: "1px solid #1d4ed8", borderRadius: 8, cursor: "pointer" };
const secondaryButtonStyle: CSSProperties = { padding: "8px 14px", fontSize: 14, fontWeight: 600, color: "#0f172a", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, cursor: "pointer" };
const cancelButtonStyle: CSSProperties = { padding: "8px 14px", fontSize: 14, fontWeight: 500, color: "#475569", background: "none", border: "1px solid transparent", borderRadius: 8, cursor: "pointer" };

export default WorkflowArtifactReview;

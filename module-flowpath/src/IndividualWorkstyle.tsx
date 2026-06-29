/**
 * SOVEREIGN Platform — module-flowpath
 * IndividualWorkstyle.tsx — Screen 4: private, user-scoped workstyle elicitation.
 *
 * Accessible only to the authenticated analyst (never an admin view). flowpath.interviewer in
 * individual mode (PR-FLOWPATH-002) asks expertise-and-preference questions only — the prohibited
 * question types (process documentation, productivity, "what would you do differently", comparison)
 * are never asked. The analyst trust statement is delivered VERBATIM before the first question and
 * must be acknowledged. flowpath.validator enforces that personal thresholds are at least as
 * sensitive as the organizational standard; a looser one surfaces a plain-prose conflict notice and
 * logs FLOWPATH_WORKSTYLE_BOUNDARY_CONFLICT. The produced AnalystWorkstyleProfile carries only a
 * hashed analyst id (never cleartext) and data_classification: user.
 *
 * Gap 6: Category 1 amber threshold-conflict notice; Category 2 blue privacy notice (permanent);
 * Category 3 the dialogue and emerging profile in white cards.
 *
 * Version: 1.0 · Session 20 (D5) · June 26, 2026
 */

import { useCallback, useMemo, useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  WorkstylePrivacyBanner,
  ClassificationBoundaryBanner,
  StatusNotice,
  contentCardStyle,
  sectionHeadingStyle,
  bodyTextStyle,
} from "./banners";
import {
  FLOWPATH_INTERVIEWER,
  FLOWPATH_VALIDATOR,
  findThresholdBoundaryConflicts,
  hashAnalystId,
  workstyleWorkflowStep,
  type AnalystPersonalThreshold,
  type AnalystWorkstyleProfile,
  type ThresholdBoundaryConflict,
} from "./flowpath-contract";
import { ANALYST_TRUST_STATEMENT, INDIVIDUAL_ELICITATION_PROMPT_VERSION } from "./prompts/individual-elicitation.prompt";
import { SYNTHETIC_VOCABULARY } from "./synthetic-elicitation";

export type WorkstyleEntryPoint = "initial" | "post_review" | "annual_refresh";

const ENTRY_POINTS: Array<{ id: WorkstyleEntryPoint; label: string }> = [
  { id: "initial", label: "Initial elicitation" },
  { id: "post_review", label: "Post-review reflection" },
  { id: "annual_refresh", label: "Annual refresh" },
];

/** Permitted (expertise/preference) questions only — never the prohibited types (spec §5a). */
const WORKSTYLE_QUESTIONS = {
  firstLook: "When you look at a program that's flagged as at risk, what do you look at first?",
  trustVsVerify: "Is there a type of finding you trust immediately versus one you always want to verify yourself?",
  // WC-5: rewritten — the prior phrasing ("know well enough that the history changes how you read
  // the data") was ambiguous about what was being asked.
  programContext: "Are there programs you've reviewed long enough that you know what's normal for them?",
  costThreshold: "If you set your own concern threshold for cost variance, what would it be?",
} as const;

export interface IndividualWorkstyleProps {
  ctx: SovereignShellContext;
}

export function IndividualWorkstyle({ ctx }: IndividualWorkstyleProps): JSX.Element {
  const analystIdHash = useMemo(() => hashAnalystId(ctx.auth.user.employee_id), [ctx.auth.user.employee_id]);

  const [entryPoint, setEntryPoint] = useState<WorkstyleEntryPoint>("initial");
  const [acknowledged, setAcknowledged] = useState(false);
  const [firstLook, setFirstLook] = useState("");
  const [trustVsVerify, setTrustVsVerify] = useState("");
  const [programContext, setProgramContext] = useState("");
  const [costThreshold, setCostThreshold] = useState("");
  const [conflicts, setConflicts] = useState<ThresholdBoundaryConflict[]>([]);
  const [profile, setProfile] = useState<AnalystWorkstyleProfile | null>(null);

  const save = useCallback((): void => {
    const personal: AnalystPersonalThreshold[] = costThreshold.trim()
      ? [{ metric: "cost variance", value: costThreshold.trim() }]
      : [];

    // flowpath.validator boundary check — personal threshold must be at least as sensitive.
    const found = findThresholdBoundaryConflicts(personal, SYNTHETIC_VOCABULARY.entries);
    const workflowStep = workstyleWorkflowStep(analystIdHash);

    if (found.length > 0) {
      setConflicts(found);
      setProfile(null);
      // FLOWPATH_WORKSTYLE_BOUNDARY_CONFLICT — data_classification: user, hashed id only.
      ctx.logger.log({
        event_type: "FLOWPATH_WORKSTYLE_BOUNDARY_CONFLICT",
        workflow_step_id: workflowStep,
        sovereign_tier: "standard",
        product: "FLOWPATH",
        actor_id: analystIdHash, // hashed — never the cleartext employee_id
        agent_id: FLOWPATH_VALIDATOR,
        outcome: "flowpath_workstyle_boundary_conflict",
        payload: { conflict_type: "threshold_too_loose", metric: found[0].metric, data_classification: "user" },
      });
      return;
    }

    setConflicts([]);
    const built: AnalystWorkstyleProfile = {
      analyst_id_hash: analystIdHash,
      program_expertise: [],
      preferred_analysis_sequence: [firstLook, trustVsVerify].filter((s) => s.trim() !== ""),
      personal_thresholds: personal,
      program_context_notes: programContext.trim() ? [programContext.trim()] : [],
      vocabulary_extensions: [],
      last_elicited: "2026-06-26T00:00:00.000Z",
      profile_version: 1,
      data_classification: "user",
    };
    setProfile(built);

    // FLOWPATH_WORKSTYLE_ELICITED — data_classification: user, hashed id only (never cleartext).
    ctx.logger.log({
      event_type: "FLOWPATH_WORKSTYLE_ELICITED",
      workflow_step_id: workflowStep,
      sovereign_tier: "standard",
      product: "FLOWPATH",
      actor_id: analystIdHash, // hashed — never the cleartext employee_id
      agent_id: FLOWPATH_INTERVIEWER,
      outcome: "flowpath_workstyle_elicited",
      payload: {
        analyst_id_hash: analystIdHash,
        profile_version: built.profile_version,
        entry_point: entryPoint,
        prompt_version: INDIVIDUAL_ELICITATION_PROMPT_VERSION,
        data_classification: "user",
      },
    });
  }, [analystIdHash, costThreshold, firstLook, trustVsVerify, programContext, entryPoint, ctx]);

  return (
    <div>
      {/* Category 2 — permanent privacy guarantee + classification boundary. */}
      <WorkstylePrivacyBanner />
      <ClassificationBoundaryBanner operatorName={ctx.auth.user.name} />

      {/* Entry points (Category 3). */}
      <div style={contentCardStyle}>
        <h2 style={sectionHeadingStyle}>Your workstyle</h2>
        <p style={bodyTextStyle}>
          This is private to you. It helps APEX guide you to the things you care about, in the order
          you care about them. Choose how you'd like to work on it today.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} role="group" aria-label="Entry point">
          {ENTRY_POINTS.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setEntryPoint(e.id)}
              aria-pressed={entryPoint === e.id}
              style={{ ...entryButtonStyle, ...(entryPoint === e.id ? entryButtonActiveStyle : null) }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trust statement — VERBATIM, before the first question; questions hidden until acknowledged. */}
      {!acknowledged ? (
        <div style={contentCardStyle} data-testid="trust-statement">
          <h2 style={sectionHeadingStyle}>Before we begin</h2>
          <p style={bodyTextStyle}>{ANALYST_TRUST_STATEMENT}</p>
          <button type="button" onClick={() => setAcknowledged(true)} style={primaryButtonStyle}>
            I understand — begin
          </button>
        </div>
      ) : (
        <>
          {/* Category 3 — the elicitation dialogue (expertise/preference questions only). */}
          <div style={contentCardStyle}>
            <h2 style={sectionHeadingStyle}>A few questions about how you work</h2>
            <Field label={WORKSTYLE_QUESTIONS.firstLook} value={firstLook} onChange={setFirstLook} />
            <Field label={WORKSTYLE_QUESTIONS.trustVsVerify} value={trustVsVerify} onChange={setTrustVsVerify} />
            <Field label={WORKSTYLE_QUESTIONS.programContext} value={programContext} onChange={setProgramContext} />
            <Field label={WORKSTYLE_QUESTIONS.costThreshold} value={costThreshold} onChange={setCostThreshold} placeholder="e.g. 5 percent" />
            <button type="button" onClick={save} style={primaryButtonStyle}>
              Save my workstyle
            </button>
          </div>

          {/* Category 1 — amber threshold-conflict notice (plain prose), resolved before saving. */}
          {conflicts.length > 0 && (
            <StatusNotice label="Threshold conflict:">
              {conflicts.map((c) => c.message).join(" ")}
            </StatusNotice>
          )}

          {/* Category 3 — saved confirmation (no cleartext identity shown). */}
          {profile && (
            <div style={contentCardStyle} data-testid="workstyle-saved">
              <h2 style={sectionHeadingStyle}>Your workstyle is saved</h2>
              <p style={bodyTextStyle}>
                Saved and visible only to you. APEX will use it to guide you — you can change or
                delete it any time.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }): JSX.Element {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={questionLabelStyle}>
        {label}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          placeholder={placeholder}
          style={textareaStyle}
        />
      </label>
    </div>
  );
}

const entryButtonStyle: CSSProperties = { padding: "6px 12px", fontSize: 13, color: "#0f172a", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8, cursor: "pointer" };
const entryButtonActiveStyle: CSSProperties = { color: "#1e40af", background: "#eff6ff", borderColor: "#2563eb", fontWeight: 700 };
const questionLabelStyle: CSSProperties = { display: "block", fontWeight: 600, color: "#0f172a", fontSize: 14 };
const textareaStyle: CSSProperties = { display: "block", width: "100%", maxWidth: 820, boxSizing: "border-box", marginTop: 6, padding: "8px 10px", fontSize: 14, fontFamily: "inherit", color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: 8, resize: "vertical" };
const primaryButtonStyle: CSSProperties = { padding: "8px 14px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#2563eb", border: "1px solid #1d4ed8", borderRadius: 8, cursor: "pointer" };

export default IndividualWorkstyle;

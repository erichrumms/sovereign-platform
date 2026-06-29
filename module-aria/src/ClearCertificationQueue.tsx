/**
 * SOVEREIGN Platform — module-aria
 * ClearCertificationQueue.tsx — CLEAR Certification Queue (Stage 6, Session 23 · D3).
 *
 * The human-facing review panel for documents awaiting export clearance (docs/16 §4).
 * For each queued document the reviewer sees its name and type, the applicable regulatory
 * framework checks in plain prose, and the specific deterministic finding from the CLEAR
 * engine (what passed, what flagged). The reviewer records a required decision note
 * (>= 10 chars) and either Certifies or Flags the document.
 *
 *   Certify → ctx.aria.record({ certified: true, ... }) AND emit ARIA_CERTIFICATION_ISSUED
 *             carrying decision_type COMPLIANCE_CERTIFICATION (a human decision — Constraint #4).
 *   Flag    → ctx.aria.record({ certified: false, ... }) AND emit ARIA_VIOLATION_FLAGGED.
 *
 * The certification surface is what the SCRIBE export gate reads (useExport → ctx.aria.
 * isCertified): a document cannot be exported until it is certified here. ARIA evaluates
 * deterministically and the engine flags; the named human reviewer decides (docs/16 §1/§3).
 *
 * Gap 6: the three content categories are visually distinct — the blue determinism
 * guardrail, amber/red finding notices, and the white primary queue cards.
 *
 * Version: 1.0 · Session 23 (D3) · June 29, 2026
 */

import { useMemo, useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { contentCardStyle, sectionHeadingStyle, bodyTextStyle } from "./banners";
import { SeverityBadge, StatusPill, ClearDeterminismNotice } from "./clear-ui";
import { clearWorkflowStep, evaluateDocument } from "./clear-engine";
import type { ClearEvaluationInput } from "./clear-types";
import { useAriaCertifications } from "./useAriaCertifications";

/** Minimum length of a certification decision note (matches the VIGIL decision-note minimum). */
export const DECISION_NOTE_MIN = 10;

export interface ClearCertificationQueueProps {
  ctx: SovereignShellContext;
  /** Documents awaiting clearance. Defaults to the synthetic demo set (Governance Clock OFF). */
  items?: ClearEvaluationInput[];
}

// ── Synthetic demo queue (Governance Clock OFF — all data is synthetic) ─────────────────
const DEMO_ITEMS: ClearEvaluationInput[] = [
  {
    document_id: "DOC-A11-FY26-OM",
    document_name: "FY26 O&M Budget Exhibit",
    document_type: "OMB A-11 Exhibit",
    data_quality_index: 96,
    is_congressional_submission: false,
    has_justification_narrative: true,
    has_evidence_basis: true,
    obligation_covered: true,
    funds_availability_stated: true,
    ppbe_phase: "Budgeting",
  },
  {
    document_id: "DOC-OBL-Q3",
    document_name: "Q3 Obligation Summary",
    document_type: "Obligation Record",
    data_quality_index: 91,
    is_congressional_submission: false,
    has_justification_narrative: true,
    has_evidence_basis: true,
    obligation_covered: false, // over-obligation → Anti-Deficiency Act violation (red)
    funds_availability_stated: true,
    ppbe_phase: "Execution",
  },
  {
    document_id: "DOC-CONG-JUST",
    document_name: "FY26 Congressional Justification",
    document_type: "Congressional Justification",
    data_quality_index: 87, // below threshold on a congressional submission → P1 (red)
    is_congressional_submission: true,
    has_justification_narrative: true,
    has_evidence_basis: false, // missing evidence basis → amber
    obligation_covered: true,
    funds_availability_stated: true,
    ppbe_phase: "Programming",
  },
];

export function ClearCertificationQueue({ ctx, items = DEMO_ITEMS }: ClearCertificationQueueProps): JSX.Element {
  const { statusOf } = useAriaCertifications(ctx);
  // Capture one evaluation timestamp for this panel session so evaluations are stable.
  const [evaluatedAt] = useState(() => new Date().toISOString());
  // Per-document decision-note drafts.
  const [notes, setNotes] = useState<Record<string, string>>({});

  // Deterministic CLEAR evaluations for every queued document (same input → same findings).
  const evaluations = useMemo(
    () => items.map((item) => evaluateDocument(item, evaluatedAt)),
    [items, evaluatedAt]
  );

  const setNote = (documentId: string, value: string): void =>
    setNotes((prev) => ({ ...prev, [documentId]: value }));

  const decide = (input: ClearEvaluationInput, certified: boolean): void => {
    const note = (notes[input.document_id] ?? "").trim();
    if (note.length < DECISION_NOTE_MIN) return; // guarded; the button is also disabled
    const evaluation = evaluations.find((e) => e.document_id === input.document_id);
    const workflow_step_id = clearWorkflowStep(input.document_id);
    const certified_at = new Date().toISOString();

    // 1) Record the decision on the shell certification surface (read by the SCRIBE gate).
    ctx.aria.record({
      document_id: input.document_id,
      certified,
      certifying_actor_id: ctx.auth.user.employee_id,
      certifying_actor_name: ctx.auth.user.name,
      decision_note: note,
      applicable_sources: evaluation?.applicable_sources ?? [],
      workflow_step_id,
      certified_at,
    });

    // 2) Emit the governed Logger event for the human decision (Constraint #4 — decision_type).
    if (certified) {
      ctx.logger.log({
        event_type: "ARIA_CERTIFICATION_ISSUED",
        workflow_step_id,
        sovereign_tier: "standard",
        product: "ARIA",
        actor_id: ctx.auth.user.employee_id,
        outcome: "certified",
        decision_type: "COMPLIANCE_CERTIFICATION",
        actor: "human",
        actor_name: ctx.auth.user.name,
        payload: {
          document_id: input.document_id,
          document_type: input.document_type,
          applicable_sources: evaluation?.applicable_sources ?? [],
          decision_note: note,
        },
      });
    } else {
      ctx.logger.log({
        event_type: "ARIA_VIOLATION_FLAGGED",
        workflow_step_id,
        sovereign_tier: "standard",
        product: "ARIA",
        actor_id: ctx.auth.user.employee_id,
        outcome: "flagged",
        decision_type: "COMPLIANCE_CERTIFICATION",
        actor: "human",
        actor_name: ctx.auth.user.name,
        payload: {
          document_id: input.document_id,
          document_type: input.document_type,
          flagged_rule_ids: (evaluation?.findings ?? []).filter((f) => !f.passed).map((f) => f.rule_id),
          decision_note: note,
        },
      });
    }
  };

  return (
    <div data-testid="clear-certification-queue">
      {/* Category 2 — permanent governance guardrail (blue). */}
      <ClearDeterminismNotice />

      <p style={bodyTextStyle}>
        Documents awaiting export clearance. A document cannot be exported until a reviewer
        certifies it here. Review the findings, record a decision note, then certify or flag.
      </p>

      {evaluations.map((evaluation) => {
        const item = items.find((i) => i.document_id === evaluation.document_id)!;
        const status = statusOf(item.document_id);
        const decided = status !== "pending";
        const note = notes[item.document_id] ?? "";
        const canDecide = note.trim().length >= DECISION_NOTE_MIN && !decided;

        return (
          <section
            key={item.document_id}
            style={contentCardStyle}
            data-testid={`queue-item-${item.document_id}`}
          >
            <div style={headerRowStyle}>
              <h2 style={sectionHeadingStyle}>{item.document_name}</h2>
              <SeverityBadge
                severity={evaluation.compliant ? "green" : "red"}
                label={evaluation.compliant ? "Meets all checks" : "Deviations found"}
              />
            </div>
            <p style={metaStyle}>{item.document_type}</p>

            <p style={{ ...bodyTextStyle, fontWeight: 600, margin: "8px 0 4px" }}>
              Applicable regulatory framework checks:
            </p>
            <p style={bodyTextStyle}>{evaluation.applicable_sources.join(" · ")}</p>

            <p style={{ ...bodyTextStyle, fontWeight: 600, margin: "8px 0 4px" }}>Specific findings:</p>
            <ul style={findingListStyle}>
              {evaluation.findings.map((f) => (
                <li
                  key={f.rule_id}
                  data-testid={`finding-${item.document_id}-${f.rule_id}`}
                  style={f.passed ? findingPassStyle : findingFlagStyle}
                >
                  <SeverityBadge severity={f.severity} label={f.passed ? "Passed" : f.severity === "red" ? "Violation" : "At risk"} />{" "}
                  <span style={{ marginLeft: 6 }}>{f.description}</span>
                </li>
              ))}
            </ul>

            {decided ? (
              <p style={bodyTextStyle} data-testid={`decided-${item.document_id}`}>
                Decision recorded: <StatusPill status={status} />
              </p>
            ) : (
              <div>
                <label style={labelStyle} htmlFor={`note-${item.document_id}`}>
                  Decision note (required, at least {DECISION_NOTE_MIN} characters)
                </label>
                <textarea
                  id={`note-${item.document_id}`}
                  data-testid={`note-${item.document_id}`}
                  style={textareaStyle}
                  value={note}
                  onChange={(e) => setNote(item.document_id, e.target.value)}
                  rows={2}
                />
                {note.length > 0 && note.trim().length < DECISION_NOTE_MIN && (
                  <p role="status" style={amberNoticeStyle}>
                    A decision note of at least {DECISION_NOTE_MIN} characters is required before you can certify or flag.
                  </p>
                )}
                <div style={actionRowStyle}>
                  <button
                    type="button"
                    data-testid={`certify-${item.document_id}`}
                    style={canDecide ? certifyStyle : disabledStyle}
                    disabled={!canDecide}
                    onClick={() => decide(item, true)}
                  >
                    Certify
                  </button>
                  <button
                    type="button"
                    data-testid={`flag-${item.document_id}`}
                    style={canDecide ? flagStyle : disabledStyle}
                    disabled={!canDecide}
                    onClick={() => decide(item, false)}
                  >
                    Flag
                  </button>
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

const headerRowStyle: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 };
const metaStyle: CSSProperties = { margin: "0 0 6px", color: "#64748b", fontSize: 13 };
const findingListStyle: CSSProperties = { listStyle: "none", margin: "0 0 10px", padding: 0 };
const findingPassStyle: CSSProperties = { margin: "0 0 6px", fontSize: 13, color: "#334155" };
const findingFlagStyle: CSSProperties = { margin: "0 0 6px", fontSize: 13, color: "#334155" };
const labelStyle: CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 4 };
const textareaStyle: CSSProperties = {
  width: "100%", maxWidth: 640, boxSizing: "border-box", padding: 8, borderRadius: 8,
  border: "1px solid #cbd5e1", fontSize: 13, fontFamily: "inherit", resize: "vertical",
};
const amberNoticeStyle: CSSProperties = {
  margin: "6px 0", padding: "6px 10px", background: "#fffbeb", border: "1px solid #fcd34d",
  borderRadius: 8, color: "#854d0e", fontSize: 12, maxWidth: 640,
};
const actionRowStyle: CSSProperties = { display: "flex", gap: 8, marginTop: 10 };
const buttonBase: CSSProperties = { padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "1px solid transparent" };
const certifyStyle: CSSProperties = { ...buttonBase, background: "#166534", color: "#ffffff" };
const flagStyle: CSSProperties = { ...buttonBase, background: "#ffffff", color: "#991b1b", border: "1px solid #fca5a5" };
const disabledStyle: CSSProperties = { ...buttonBase, background: "#f1f5f9", color: "#94a3b8", cursor: "not-allowed", border: "1px solid #e2e8f0" };

export default ClearCertificationQueue;

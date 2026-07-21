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
 * Walkthrough D (Session 26):
 *   - D-3: each item has a document preview (synthetic — no live store is connected), and Certify
 *     captures an export destination + intended recipient. These are recorded to the AUDIT TRAIL only
 *     (ARIA_CERTIFICATION_ISSUED payload); they are NOT enforced by the SCRIBE export gate, which still
 *     opens on certification alone. Gate enforcement would require adding fields to the governance-frozen
 *     AriaCertification shell type — an open item for a future GD, not done here (no shell-contract change).
 *   - D-1: the data-quality finding surfaces the P1-vs-At-Risk severity logic keyed to document type
 *     (congressional submission below threshold = P1; otherwise At Risk) at the row level.
 *
 * Version: 1.1 · Session 26 (Walkthrough D · D-3/D-1) · June 30, 2026
 */

import { useMemo, useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { contentCardStyle, sectionHeadingStyle, bodyTextStyle } from "./banners";
import { SeverityBadge, StatusPill, ClearDeterminismNotice } from "./clear-ui";
import { clearWorkflowStep, evaluateDocument } from "./clear-engine";
import type { ClearEvaluationInput } from "./clear-types";
import { useAriaCertifications } from "./useAriaCertifications";
import { ARIA_WORKSPACE_MODULE_ID } from "./aria-workspace-publisher";

/** Minimum length of a certification decision note (matches the VIGIL decision-note minimum). */
export const DECISION_NOTE_MIN = 10;

export interface ClearCertificationQueueProps {
  ctx: SovereignShellContext;
  /** Documents awaiting clearance. Defaults to the synthetic demo set (Governance Clock OFF). */
  items?: ClearEvaluationInput[];
  /**
   * GD-27 (docs/25 §3) — starting value for the queue's existing per-document
   * disclosure state: the named document opens with its preview expanded (a
   * navigation intent from ctx.navigateToModule). An unknown id expands nothing.
   */
  initialSelectedDocumentId?: string;
}

// ── Synthetic demo queue (Governance Clock OFF — all data is synthetic) ─────────────────
// Exported for GD-25 (Session 50): AriaApp publishes the still-pending demo items to the
// Reviewer's Workspace surface — the same full ClearEvaluationInput objects this queue renders.
export const CLEAR_DEMO_ITEMS: ClearEvaluationInput[] = [
  {
    document_id: "DOC-A11-FY26-OM",
    document_name: "FY 2026 O&M Budget Exhibit",
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
    document_name: "FY 2026 Congressional Justification",
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

/** The number of items in the default CLEAR certification demo queue (GD-24 — read by AriaApp). */
export const CLEAR_DEMO_ITEM_COUNT = CLEAR_DEMO_ITEMS.length;

export function ClearCertificationQueue({
  ctx,
  items = CLEAR_DEMO_ITEMS,
  initialSelectedDocumentId,
}: ClearCertificationQueueProps): JSX.Element {
  const { statusOf } = useAriaCertifications(ctx);
  // Capture one evaluation timestamp for this panel session so evaluations are stable.
  const [evaluatedAt] = useState(() => new Date().toISOString());
  // Per-document decision-note drafts.
  const [notes, setNotes] = useState<Record<string, string>>({});
  // D-3 — per-document export destination + intended recipient, captured for the audit trail only
  // (NOT enforced by the SCRIBE export gate; open item for a future GD).
  const [destinations, setDestinations] = useState<Record<string, string>>({});
  const [recipients, setRecipients] = useState<Record<string, string>>({});
  // D-3 — which documents have their preview expanded. GD-27: a navigation intent
  // naming a document seeds this existing state so that document opens expanded.
  const [previews, setPreviews] = useState<Record<string, boolean>>(() =>
    initialSelectedDocumentId ? { [initialSelectedDocumentId]: true } : {}
  );

  // Deterministic CLEAR evaluations for every queued document (same input → same findings).
  const evaluations = useMemo(
    () => items.map((item) => evaluateDocument(item, evaluatedAt)),
    [items, evaluatedAt]
  );

  const setNote = (documentId: string, value: string): void =>
    setNotes((prev) => ({ ...prev, [documentId]: value }));
  const setDestination = (documentId: string, value: string): void =>
    setDestinations((prev) => ({ ...prev, [documentId]: value }));
  const setRecipient = (documentId: string, value: string): void =>
    setRecipients((prev) => ({ ...prev, [documentId]: value }));
  const togglePreview = (documentId: string): void =>
    setPreviews((prev) => ({ ...prev, [documentId]: !prev[documentId] }));

  const decide = (input: ClearEvaluationInput, certified: boolean): void => {
    const note = (notes[input.document_id] ?? "").trim();
    if (note.length < DECISION_NOTE_MIN) return; // guarded; the button is also disabled
    const destination = (destinations[input.document_id] ?? "").trim();
    const recipient = (recipients[input.document_id] ?? "").trim();
    // Certify captures an export destination + intended recipient FOR THE AUDIT TRAIL only. This is a
    // record, not an authorization — the SCRIBE export gate does not enforce it (open item for a future
    // GD). Requiring them here keeps the audit record complete before a document is cleared for export.
    if (certified && (destination === "" || recipient === "")) return; // guarded; button also disabled
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

    // GD-25 — the decision-commit path: a certified or flagged document leaves the
    // Reviewer's Workspace (whether decided here in ARIA or in the embedded Workspace copy).
    ctx.reviewerWorkspaceSurface.remove(ARIA_WORKSPACE_MODULE_ID, input.document_id);

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
          // D-3 — captured to the audit trail only; NOT enforced by the SCRIBE export gate (future GD).
          export_destination: destination,
          intended_recipient: recipient,
          export_capture: "audit-record-only",
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
        const destination = destinations[item.document_id] ?? "";
        const recipient = recipients[item.document_id] ?? "";
        const noteOk = note.trim().length >= DECISION_NOTE_MIN;
        const captureOk = destination.trim() !== "" && recipient.trim() !== "";
        const canCertify = noteOk && captureOk && !decided;
        const canFlag = noteOk && !decided;
        const showPreview = previews[item.document_id] ?? false;

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

            {/* D-3 — a document preview so the reviewer sees more than the rule-check summary. */}
            <button
              type="button"
              data-testid={`view-doc-${item.document_id}`}
              style={previewToggleStyle}
              aria-expanded={showPreview}
              onClick={() => togglePreview(item.document_id)}
            >
              {showPreview ? "Hide document" : "View document"}
            </button>
            {showPreview && <DocumentPreview item={item} />}

            <p style={{ ...bodyTextStyle, fontWeight: 600, margin: "8px 0 4px" }}>
              Applicable regulatory framework checks:
            </p>
            <p style={bodyTextStyle}>{evaluation.applicable_sources.join(" · ")}</p>

            <p style={{ ...bodyTextStyle, fontWeight: 600, margin: "8px 0 4px" }}>Specific findings:</p>
            <ul style={findingListStyle}>
              {evaluation.findings.map((f) => {
                // D-1 — the data-quality rule's severity is keyed to document type: a congressional
                // submission below threshold is a priority (P1) violation; otherwise it is At Risk.
                const isDataQuality = f.rule_id === "R-A11-3";
                const isP1 = isDataQuality && !f.passed && f.severity === "red";
                const badgeLabel = f.passed
                  ? "Passed"
                  : isP1
                    ? "Violation (P1)"
                    : f.severity === "red"
                      ? "Violation"
                      : "At risk";
                return (
                  <li
                    key={f.rule_id}
                    data-testid={`finding-${item.document_id}-${f.rule_id}`}
                    style={f.passed ? findingPassStyle : findingFlagStyle}
                  >
                    <SeverityBadge severity={f.severity} label={badgeLabel} />{" "}
                    <span style={{ marginLeft: 6 }}>{f.description}</span>
                    {isDataQuality && !f.passed && (
                      <p style={keyingNoteStyle} data-testid={`severity-keying-${item.document_id}`}>
                        Severity is keyed to document type:{" "}
                        {item.is_congressional_submission
                          ? "a congressional submission below the 90% threshold is a priority (P1) violation; a non-congressional document below the threshold would be At Risk."
                          : "a non-congressional document below the 90% threshold is At Risk; a congressional submission below the threshold would be a priority (P1) violation."}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>

            {decided ? (
              <div data-testid={`decided-${item.document_id}`}>
                <p style={bodyTextStyle}>
                  Decision recorded: <StatusPill status={status} />
                </p>
                {status === "certified" && destination.trim() !== "" && recipient.trim() !== "" && (
                  <p style={metaStyle} data-testid={`export-noted-${item.document_id}`}>
                    Destination/recipient noted for audit trail (not enforced by the SCRIBE export gate):{" "}
                    {destination.trim()} · {recipient.trim()}
                  </p>
                )}
              </div>
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

                {/* D-3 — export destination + recipient, captured for the audit trail (required to certify). */}
                <label style={labelStyle} htmlFor={`dest-${item.document_id}`}>
                  Export destination (required to certify — noted for the audit trail)
                </label>
                <input
                  id={`dest-${item.document_id}`}
                  data-testid={`dest-${item.document_id}`}
                  style={inputStyle}
                  value={destination}
                  onChange={(e) => setDestination(item.document_id, e.target.value)}
                />
                <label style={labelStyle} htmlFor={`recip-${item.document_id}`}>
                  Intended recipient (required to certify — noted for the audit trail)
                </label>
                <input
                  id={`recip-${item.document_id}`}
                  data-testid={`recip-${item.document_id}`}
                  style={inputStyle}
                  value={recipient}
                  onChange={(e) => setRecipient(item.document_id, e.target.value)}
                />
                <p role="note" style={captureDisclosureStyle} data-testid={`export-disclosure-${item.document_id}`}>
                  Destination and recipient are recorded to the audit trail only. They are <strong>not</strong>{" "}
                  enforced by the SCRIBE export gate — the gate opens on certification alone. (Gate enforcement
                  of the recorded destination/recipient is an open item for a future governance decision.)
                </p>

                <div style={actionRowStyle}>
                  <button
                    type="button"
                    data-testid={`certify-${item.document_id}`}
                    style={canCertify ? certifyStyle : disabledStyle}
                    disabled={!canCertify}
                    onClick={() => decide(item, true)}
                  >
                    Certify
                  </button>
                  <button
                    type="button"
                    data-testid={`flag-${item.document_id}`}
                    style={canFlag ? flagStyle : disabledStyle}
                    disabled={!canFlag}
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

/**
 * D-3 — a synthetic document preview so the reviewer can see the document's recorded attributes, not
 * just the rule-check summary, before certifying. No live document store is connected (Governance Clock
 * OFF; ctx.data is a write-only logger), so this renders the evaluated attributes in plain prose rather
 * than a fetched file, and says so.
 */
function DocumentPreview({ item }: { item: ClearEvaluationInput }): JSX.Element {
  const rows: Array<[string, string]> = [
    ["Document ID", item.document_id],
    ["Type", item.document_type.trim() !== "" ? item.document_type : "— not declared —"],
    ["PPBE phase", item.ppbe_phase.trim() !== "" ? item.ppbe_phase : "— not aligned to a phase —"],
    ["Congressional submission", item.is_congressional_submission ? "Yes" : "No"],
    ["Data-quality index", `${item.data_quality_index}%`],
    ["Justification narrative", item.has_justification_narrative ? "Present" : "Absent"],
    ["Evidence basis", item.has_evidence_basis ? "Cited" : "Not cited"],
    ["Obligation coverage", item.obligation_covered ? "Covered by available budget authority" : "Not covered (over-obligation)"],
    ["Funds availability", item.funds_availability_stated ? "Stated" : "Not stated"],
  ];
  return (
    <div style={previewStyle} data-testid={`preview-${item.document_id}`}>
      <p style={{ ...bodyTextStyle, margin: "0 0 4px", fontWeight: 600 }}>{item.document_name}</p>
      <p style={{ ...metaStyle, marginBottom: 8 }}>
        Synthetic preview — Governance Clock OFF; no live document store is connected, so this shows the
        document's recorded attributes, not a fetched file.
      </p>
      {rows.map(([label, value]) => (
        <div key={label} style={previewRowStyle}>
          <span style={previewLabelStyle}>{label}</span>
          <span style={previewValueStyle}>{value}</span>
        </div>
      ))}
    </div>
  );
}

const headerRowStyle: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 };
const metaStyle: CSSProperties = { margin: "0 0 6px", color: "#64748b", fontSize: 13 };
const findingListStyle: CSSProperties = { listStyle: "none", margin: "0 0 10px", padding: 0 };
const findingPassStyle: CSSProperties = { margin: "0 0 6px", fontSize: 13, color: "#334155" };
const findingFlagStyle: CSSProperties = { margin: "0 0 6px", fontSize: 13, color: "#334155" };
const labelStyle: CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 4 };
const keyingNoteStyle: CSSProperties = { margin: "3px 0 0 6px", fontSize: 12, color: "#64748b", maxWidth: 640 };
const previewToggleStyle: CSSProperties = {
  background: "none", border: "1px solid #cbd5e1", borderRadius: 8, padding: "4px 10px",
  fontSize: 12, fontWeight: 600, color: "#1d4ed8", cursor: "pointer", margin: "0 0 8px",
};
const previewStyle: CSSProperties = {
  border: "1px solid #e2e8f0", borderRadius: 8, background: "#f8fafc", padding: "10px 12px", margin: "0 0 10px", maxWidth: 640,
};
const previewRowStyle: CSSProperties = { display: "flex", gap: 8, fontSize: 13, margin: "0 0 3px" };
const previewLabelStyle: CSSProperties = { color: "#64748b", minWidth: 200 };
const previewValueStyle: CSSProperties = { color: "#334155", fontWeight: 500 };
const inputStyle: CSSProperties = {
  width: "100%", maxWidth: 640, boxSizing: "border-box", padding: 8, borderRadius: 8,
  border: "1px solid #cbd5e1", fontSize: 13, fontFamily: "inherit", marginBottom: 8,
};
const captureDisclosureStyle: CSSProperties = {
  margin: "0 0 8px", padding: "6px 10px", background: "#f8fafc", border: "1px solid #e2e8f0",
  borderRadius: 8, color: "#475569", fontSize: 12, maxWidth: 640,
};
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

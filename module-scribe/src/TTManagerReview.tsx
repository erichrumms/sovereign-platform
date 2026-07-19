/**
 * SOVEREIGN Platform — module-scribe
 * TTManagerReview.tsx — the Time & Travel manager review interface (Session 28, D3).
 *
 * docs/17 §14 Phase II: "Manager review interface — split-panel queue with
 * pre-populated analysis and draft." Left panel: the review queue (routed travel
 * requests and raised compliance flags). Right panel: the compliance analysis
 * (rule cited, actual value, threshold — docs/17 §5.3) and the pre-populated
 * draft communication, with the manager's actions.
 *
 * THE SYSTEM PREPARES; THE HUMAN DECIDES (docs/17 §1):
 *   - A draft is NEVER sent by this interface's machinery — "Send" records that
 *     the MANAGER sent it (HUMAN_DECISION, decision_type TIME_CORRECTION_SENT,
 *     GD-21) after reviewing/copying the draft. The tool has no transport.
 *   - A FORMAL_ESCALATION draft's send action is STRUCTURALLY DISABLED until the
 *     VIGIL gate reports the case AUTHORIZED (docs/17 §7 Tier B) — the disabled
 *     state renders "Awaiting VIGIL authorization".
 *   - Travel decisions belong to NEXUS (recordTravelDecision emits the GD-21
 *     TRAVEL_APPROVAL event there) — this panel exposes them via the
 *     onTravelDecision callback rather than emitting cross-product events.
 *
 * Session 40 (DR-2): added "Copy draft" button and "Send via Outlook — Coming Soon"
 * placeholder button (disabled) next to the send action. The Outlook integration is
 * genuinely unstarted platform-wide (M365 GCC High service credential declared in
 * nexus.routing-agent registry but no Graph API code exists anywhere) — the placeholder
 * matches the platform's existing honest-disclosure pattern ("wired in a later session").
 *
 * Every Logger event carries workflow_step_id (Standing Constraint #6).
 *
 * Version: 1.1 · Session 40 · July 18, 2026
 */

import { useCallback, useState } from "react";

import type { CSSProperties } from "react";

import type { TravelRequest, ComplianceFlag } from "@sovereign/data";
import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import type { TTDraft } from "./tt-draft-contract";
import { useVigilEscalationAuthorizations } from "./useVigilEscalationAuthorizations";

/** A routed travel request awaiting the manager's decision. */
export interface TravelReviewItem {
  kind: "travel";
  request: TravelRequest;
  /** Compliance findings from tt.travel-compliance-engine (source TRAVEL). */
  flags: ComplianceFlag[];
  /** Pre-populated by tt.travel-drafter before the approver opens the record. */
  draft: TTDraft;
  workflow_step_id: string;
}

/** A raised compliance flag with its pre-populated communication draft. */
export interface TimeReviewItem {
  kind: "time";
  flag: ComplianceFlag;
  /** Pre-populated by tt.time-drafter. */
  draft: TTDraft;
  /** True for FORMAL_ESCALATION drafts — the VIGIL Tier B gate applies. */
  requiresVigilAuthorization: boolean;
  /**
   * The VIGIL gate's answer as seeded at composition time (tt-escalation-gate
   * isSendable). Session 35: a live VIGIL authorization published on
   * ctx.taskSurface ALSO unlocks the item (useVigilEscalationAuthorizations) —
   * this static field no longer needs a manual refresh to catch up.
   */
  vigilAuthorized: boolean;
  workflow_step_id: string;
}

export type TTReviewItem = TravelReviewItem | TimeReviewItem;

export interface TTManagerReviewProps {
  ctx: SovereignShellContext;
  items: TTReviewItem[];
  /** Travel decisions route to NEXUS's recordTravelDecision (GD-21 TRAVEL_APPROVAL). */
  onTravelDecision?: (item: TravelReviewItem, outcome: "APPROVED" | "DENIED" | "ESCALATED") => void;
  /** Called after a time communication send is recorded (queue removal etc.). */
  onSent?: (item: TimeReviewItem) => void;
}

function itemKey(item: TTReviewItem): string {
  return item.kind === "travel" ? `travel-${item.request.request_id}` : `time-${item.flag.flag_id}`;
}

function itemLabel(item: TTReviewItem): string {
  return item.kind === "travel"
    ? `${item.request.request_id} · ${item.request.destination} · ${item.request.routing_tier ?? "UNEVALUATED"}`
    // §2.1 Supervision Efficiency: surface employee_id so the reviewer sees who this is about
    // without navigating into the detail panel.
    : `${item.flag.flag_id} · ${item.flag.employee_id} · ${item.flag.rule_category} · ${item.flag.severity}`;
}

/** Build the plain-text copy payload from a TTDraft (subject + body). */
function buildDraftText(draft: TTDraft): string {
  return draft.subject ? `${draft.subject}\n\n${draft.body}` : draft.body;
}

export function TTManagerReview({ ctx, items, onTravelDecision, onSent }: TTManagerReviewProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(
    items.length > 0 ? itemKey(items[0]) : null
  );
  const [error, setError] = useState<string | null>(null);
  const [sentKeys, setSentKeys] = useState<readonly string[]>([]);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Session 35 (GD-19): live VIGIL authorizations from the shared task surface.
  // An item is sendable when its seeded state OR a live VIGIL decision says so.
  const liveAuthorizedFlagIds = useVigilEscalationAuthorizations(ctx);
  const isVigilAuthorized = (item: TimeReviewItem): boolean =>
    item.vigilAuthorized || liveAuthorizedFlagIds.has(item.flag.flag_id);

  const selected = items.find((i) => itemKey(i) === selectedKey) ?? null;

  /** Copy the current draft to the clipboard (DR-2 Session 40). */
  const handleCopyDraft = useCallback((draft: TTDraft) => {
    navigator.clipboard.writeText(buildDraftText(draft)).then(
      () => {
        setCopyFeedback("Copied!");
        setTimeout(() => setCopyFeedback(null), 2000);
      },
      () => {
        setCopyFeedback("Copy failed — select the text above and use Ctrl+C / Cmd+C.");
        setTimeout(() => setCopyFeedback(null), 4000);
      }
    );
  }, []);

  /** Record that the MANAGER sent a time communication (GD-21 TIME_CORRECTION_SENT). */
  function recordSend(item: TimeReviewItem): void {
    setError(null);
    // Structural gate (docs/17 §7 Tier B) — defense in depth behind the disabled button.
    if (item.requiresVigilAuthorization && !isVigilAuthorized(item)) {
      setError("This formal escalation requires VIGIL authorization before it can be sent.");
      return;
    }
    try {
      ctx.logger.log({
        event_type: "HUMAN_DECISION",
        workflow_step_id: item.workflow_step_id,
        sovereign_tier: "standard",
        product: "SCRIBE",
        actor_id: ctx.auth.user.employee_id,
        outcome: "tt_communication_sent",
        actor: "human",
        actor_name: ctx.auth.user.name,
        decision_type: "TIME_CORRECTION_SENT", // GD-21 (shell-contract v1.16)
        payload: {
          flag_id: item.flag.flag_id,
          employee_id: item.flag.employee_id,
          rule_category: item.flag.rule_category,
          communication_type: item.draft.communication_type,
          recurrence_count: item.flag.recurrence_count,
          vigil_authorized: item.requiresVigilAuthorization ? isVigilAuthorized(item) : null,
        },
      });
    } catch (err) {
      // CPMI-VRS Gate 2: a failed emit blocks the send record.
      setError(
        `Logger emission failed — send not recorded (CPMI-VRS Gate 2): ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      return;
    }
    setSentKeys((prev) => [...prev, itemKey(item)]);
    onSent?.(item);
  }

  return (
    <div data-testid="tt-manager-review" style={{ display: "flex", gap: 16 }}>
      {/* ── Left panel: the review queue ─────────────────────────── */}
      <div data-testid="tt-review-queue" style={{ minWidth: 280 }}>
        <h3>Time &amp; Travel review queue</h3>
        {items.length === 0 && <p>No items awaiting review.</p>}
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          {items.map((item) => {
            const key = itemKey(item);
            const isSelected = key === selectedKey;
            return (
              <li key={key}>
                <button
                  type="button"
                  data-testid={`tt-queue-item-${key}`}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedKey(key);
                    setError(null);
                  }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "6px 10px", borderRadius: 6, cursor: "pointer",
                    fontSize: 12,
                    border: isSelected ? "1px solid #0c4a6e" : "1px solid #e2e8f0",
                    background: isSelected ? "#e0f2fe" : "#f8fafc",
                    color: isSelected ? "#0c4a6e" : "#0f172a",
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {itemLabel(item)}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Right panel: analysis + draft + actions ──────────────── */}
      <div data-testid="tt-review-detail" style={{ flex: 1 }}>
        {!selected && <p>Select an item to review.</p>}
        {selected && (
          <div>
            <h3>Compliance analysis</h3>
            <ul data-testid="tt-analysis">
              {(selected.kind === "travel" ? selected.flags : [selected.flag]).map((f) => (
                <li key={f.flag_id}>
                  <strong>{f.rule_category}</strong> ({f.severity}) — {f.rule_citation}:{" "}
                  {f.actual_value} vs. {f.threshold_value}
                  {f.recurrence_count > 1 ? ` · occurrence ${f.recurrence_count}` : ""}
                </li>
              ))}
              {selected.kind === "travel" && selected.flags.length === 0 && (
                <li>All policy rules satisfied — no findings.</li>
              )}
            </ul>

            <h3>Pre-populated draft — review before any action</h3>
            <div data-testid="tt-draft">
              {selected.draft.subject && (
                <p>
                  <strong>Subject:</strong> {selected.draft.subject}
                </p>
              )}
              <p style={{ whiteSpace: "pre-wrap" }}>{selected.draft.body}</p>
            </div>

            {selected.kind === "travel" && (
              <div data-testid="tt-travel-actions">
                {(["APPROVED", "DENIED", "ESCALATED"] as const).map((outcome) => (
                  <button
                    key={outcome}
                    type="button"
                    data-testid={`tt-travel-${outcome.toLowerCase()}`}
                    onClick={() => onTravelDecision?.(selected, outcome)}
                  >
                    {outcome === "APPROVED" ? "Approve" : outcome === "DENIED" ? "Deny" : "Escalate"}
                  </button>
                ))}
              </div>
            )}

            {selected.kind === "time" && (
              <div data-testid="tt-time-actions">
                {sentKeys.includes(itemKey(selected)) ? (
                  <p data-testid="tt-sent-confirmation">
                    Send recorded — the communication was sent by you, from your identity.
                  </p>
                ) : (
                  <>
                    <div style={actionRowStyle}>
                      <button
                        type="button"
                        data-testid="tt-send-communication"
                        disabled={selected.requiresVigilAuthorization && !isVigilAuthorized(selected)}
                        onClick={() => recordSend(selected)}
                      >
                        I have sent this communication
                      </button>
                      <button
                        type="button"
                        data-testid="tt-copy-draft"
                        onClick={() => handleCopyDraft(selected.draft)}
                      >
                        Copy draft
                      </button>
                      <button
                        type="button"
                        data-testid="tt-send-outlook"
                        disabled
                        title="Outlook / M365 GCC High integration not yet wired — wired in a later session"
                        style={outlookPlaceholderStyle}
                      >
                        Send via Outlook — Coming Soon
                      </button>
                    </div>
                    {copyFeedback && (
                      <p data-testid="tt-copy-feedback" style={copyFeedbackStyle}>
                        {copyFeedback}
                      </p>
                    )}
                    {selected.requiresVigilAuthorization && !isVigilAuthorized(selected) && (
                      <p data-testid="tt-awaiting-authorization">Awaiting VIGIL authorization</p>
                    )}
                  </>
                )}
              </div>
            )}

            {error && <p data-testid="tt-review-error">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────

const actionRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  alignItems: "center",
};

const outlookPlaceholderStyle: CSSProperties = {
  opacity: 0.45,
  cursor: "not-allowed",
  fontStyle: "italic",
};

const copyFeedbackStyle: CSSProperties = {
  fontSize: 12,
  color: "#0369a1",
  margin: "4px 0 0",
};

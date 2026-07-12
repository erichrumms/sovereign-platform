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
 * Every Logger event carries workflow_step_id (Standing Constraint #6).
 *
 * Version: 1.0 · Session 28 · July 12, 2026
 */

import { useState } from "react";

import type { TravelRequest, ComplianceFlag } from "@sovereign/data";
import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import type { TTDraft } from "./tt-draft-contract";

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
  /** The VIGIL gate's current answer (tt-escalation-gate isSendable). */
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
    : `${item.flag.flag_id} · ${item.flag.rule_category} · ${item.flag.severity}`;
}

export function TTManagerReview({ ctx, items, onTravelDecision, onSent }: TTManagerReviewProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(
    items.length > 0 ? itemKey(items[0]) : null
  );
  const [error, setError] = useState<string | null>(null);
  const [sentKeys, setSentKeys] = useState<readonly string[]>([]);

  const selected = items.find((i) => itemKey(i) === selectedKey) ?? null;

  /** Record that the MANAGER sent a time communication (GD-21 TIME_CORRECTION_SENT). */
  function recordSend(item: TimeReviewItem): void {
    setError(null);
    // Structural gate (docs/17 §7 Tier B) — defense in depth behind the disabled button.
    if (item.requiresVigilAuthorization && !item.vigilAuthorized) {
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
          vigil_authorized: item.requiresVigilAuthorization ? item.vigilAuthorized : null,
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
        <ul>
          {items.map((item) => (
            <li key={itemKey(item)}>
              <button
                type="button"
                data-testid={`tt-queue-item-${itemKey(item)}`}
                onClick={() => {
                  setSelectedKey(itemKey(item));
                  setError(null);
                }}
              >
                {itemLabel(item)}
              </button>
            </li>
          ))}
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
                    <button
                      type="button"
                      data-testid="tt-send-communication"
                      disabled={selected.requiresVigilAuthorization && !selected.vigilAuthorized}
                      onClick={() => recordSend(selected)}
                    >
                      I have sent this communication
                    </button>
                    {selected.requiresVigilAuthorization && !selected.vigilAuthorized && (
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

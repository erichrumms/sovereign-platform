/**
 * SOVEREIGN Platform — module-vigil
 * useAlertResponse.ts — the operator's alert-response emission (spec §2.2).
 *
 * The operator's response is the ACTION OF RECORD (Gate 3 — VIGIL advises, it does
 * not act). Each consequential response emits the purpose-built GD-4 alert-lifecycle
 * event (ALERT_ACKNOWLEDGED / ALERT_RESOLVED / ALERT_ESCALATED / ALERT_FALSE_POSITIVE),
 * carrying the operator identity (actor / actor_name) and workflow_step_id.
 *
 * EVENT TAXONOMY (Session 7 governance decision — Project Principal, June 18, 2026):
 *   Alert responses emit ALERT_* ONLY, per spec §2.2. They do NOT emit HUMAN_DECISION:
 *   the frozen HumanDecisionType taxonomy has no alert-response member, and mapping to
 *   a generic member (e.g. HUMAN_APPROVAL) would produce inaccurate Intelligence Layer
 *   training data. Adding alert-response HumanDecisionType members is DEFERRED to a
 *   future shell-contract v1.4 governance decision. (This supersedes the "emits
 *   HUMAN_DECISION" wording in the Session 7 done condition.)
 *
 * INVESTIGATING is an interim working state with NO Logger event — GD-4 defined no
 * ALERT_INVESTIGATING type, and spec §2.2 assigns Logger events only to Acknowledge /
 * Resolve / Escalate / False-Positive. Inventing a type is a constraint violation, so
 * INVESTIGATING transitions the UI status only. (Governance gap noted in the handoff.)
 *
 * Ordering (spec §2.2): ACKNOWLEDGE is required before any other action.
 * Notes (spec §2.2): RESOLVED / ESCALATED / FALSE_POSITIVE require a note (≥10 chars).
 * CPMI-VRS Gate 2: a failed Logger emit surfaces an error and does NOT finalize the
 * response (an unlogged operator decision is an ungoverned operator decision).
 *
 * Version: 1.0 · Session 7 · June 18, 2026
 */

import { useCallback, useState } from "react";

import type { SovereignEventType } from "../../sovereign-shell/shell-contract";
import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  alertWorkflowStep,
  type AlertResponseAction,
  type SecurityAlert,
} from "./vigil-types";

/** Minimum note length for the actions that require one (spec §2.2). */
export const RESPONSE_NOTE_MIN_CHARS = 10;

/** Actions that close the alert (leave the active queue; Logger keeps the record). */
const CLOSING_ACTIONS: readonly AlertResponseAction[] = ["RESOLVED", "ESCALATED", "FALSE_POSITIVE"];

/** Actions that require a note (spec §2.2). */
const NOTE_REQUIRED_ACTIONS: readonly AlertResponseAction[] = ["RESOLVED", "ESCALATED", "FALSE_POSITIVE"];

/** Map a response action to its GD-4 alert-lifecycle event type, or null (no event). */
function eventTypeForAction(action: AlertResponseAction): SovereignEventType | null {
  switch (action) {
    case "ACKNOWLEDGED":
      return "ALERT_ACKNOWLEDGED";
    case "RESOLVED":
      return "ALERT_RESOLVED";
    case "ESCALATED":
      return "ALERT_ESCALATED";
    case "FALSE_POSITIVE":
      return "ALERT_FALSE_POSITIVE";
    case "INVESTIGATING":
      // Interim working state — no approved event type (see file header).
      return null;
  }
}

export interface RespondResult {
  ok: boolean;
  /** True when the action closes the alert (removed from the active queue). */
  closed: boolean;
}

export interface UseAlertResponse {
  error: string | null;
  /** The last action successfully recorded, for UI feedback. */
  lastAction: AlertResponseAction | null;
  respond: (alert: SecurityAlert, action: AlertResponseAction, note?: string) => RespondResult;
  clearError: () => void;
}

export function useAlertResponse(ctx: SovereignShellContext): UseAlertResponse {
  const operatorId = ctx.auth.user.employee_id;
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<AlertResponseAction | null>(null);

  const respond = useCallback(
    (alert: SecurityAlert, action: AlertResponseAction, note?: string): RespondResult => {
      setError(null);

      // --- Ordering: ACKNOWLEDGE required before any other action (spec §2.2). ---
      if (action !== "ACKNOWLEDGED" && alert.status === "UNACKNOWLEDGED") {
        return fail(`Acknowledge the alert before recording "${action}" (spec §2.2).`);
      }

      // --- Note requirement (spec §2.2). ---
      if (NOTE_REQUIRED_ACTIONS.includes(action)) {
        if (!note || note.trim().length < RESPONSE_NOTE_MIN_CHARS) {
          return fail(`A note of at least ${RESPONSE_NOTE_MIN_CHARS} characters is required to ${action.toLowerCase()} an alert.`);
        }
      }

      const closed = CLOSING_ACTIONS.includes(action);
      const eventType = eventTypeForAction(action);

      // INVESTIGATING: local-only status transition, no Logger event (see header).
      if (eventType === null) {
        setLastAction(action);
        return { ok: true, closed };
      }

      // --- Gate 2: emit the ALERT_* event. A failed emit blocks the response. ---
      try {
        ctx.logger.log({
          event_type: eventType,
          workflow_step_id: alertWorkflowStep(alert.alertId),
          sovereign_tier: "standard",
          product: "VIGIL",
          actor_id: operatorId,
          outcome: `alert_${action.toLowerCase()}`,
          actor: "human",
          actor_name: ctx.auth.user.name,
          payload: {
            alert_id: alert.alertId,
            alert_level: alert.alertLevel,
            alert_type: alert.alertType,
            source_product: alert.sourceProduct,
            agent_id: alert.agentId,
            prior_status: alert.status,
            note: note?.trim() || undefined,
          },
        });
      } catch (err) {
        return fail(
          `Logger emission failed — response not recorded (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }

      setLastAction(action);
      return { ok: true, closed };

      function fail(message: string): RespondResult {
        setError(message);
        return { ok: false, closed: false };
      }
    },
    [ctx, operatorId]
  );

  const clearError = useCallback((): void => setError(null), []);

  return { error, lastAction, respond, clearError };
}

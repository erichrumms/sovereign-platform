/**
 * SOVEREIGN Platform — module-vigil
 * useApprovalDecision.ts — the operator's agent-action decision emission (spec §4.2 / §6).
 *
 * The operator's decision is the authoritative governance record for the agent action
 * (spec §2). Approve / Reject / Escalate each emit the GD-6 event
 * (AGENT_ACTION_APPROVED / AGENT_ACTION_REJECTED / AGENT_ACTION_ESCALATED), carrying the
 * operator identity (actor "human" / actor_name), decision_type AGENT_APPROVAL (Standing
 * Constraint #4 — every human decision carries decision_type), workflow_step_id
 * `vigil-approval-<requestId>` (Constraint #6), and the required notes (≥10 chars).
 * ESCALATE additionally records escalation_reason (spec §6).
 *
 * Notes are required for ALL three decisions (spec §4.2): an undocumented approval is as
 * ungoverned as no approval. CPMI-VRS Gate 2: a failed Logger emit BLOCKS the decision
 * (same pattern as useAlertResponse) — the request is not removed and the operator sees
 * the error.
 *
 * Version: 1.0 · Session 10 · June 23, 2026
 */

import { useCallback, useState } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  approvalWorkflowStep,
  eventTypeForDecision,
  validateNotes,
  APPROVAL_NOTE_MIN_CHARS,
  type AgentApprovalRequest,
  type ApprovalDecisionAction,
} from "./approval-contract";
import { publishEscalationAuthorization } from "./tt-escalation-surface";

const APPROVAL_DECISION_TYPE = "AGENT_APPROVAL" as const;

export interface DecisionResult {
  ok: boolean;
}

export interface UseApprovalDecision {
  error: string | null;
  /** The last action successfully recorded, for UI feedback. */
  lastAction: ApprovalDecisionAction | null;
  decide: (request: AgentApprovalRequest, action: ApprovalDecisionAction, notes: string) => DecisionResult;
  clearError: () => void;
}

export function useApprovalDecision(ctx: SovereignShellContext): UseApprovalDecision {
  const operatorId = ctx.auth.user.employee_id;
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<ApprovalDecisionAction | null>(null);

  const decide = useCallback(
    (request: AgentApprovalRequest, action: ApprovalDecisionAction, notes: string): DecisionResult => {
      setError(null);

      // --- Notes required for all three decisions (spec §4.2). ---
      if (!validateNotes(notes)) {
        return fail(
          `A note of at least ${APPROVAL_NOTE_MIN_CHARS} characters is required to ${action.toLowerCase()} this request.`
        );
      }

      const trimmedNotes = notes.trim();
      const eventType = eventTypeForDecision(action);

      // --- Gate 2: emit the AGENT_ACTION_* decision event. A failed emit blocks it. ---
      try {
        ctx.logger.log({
          event_type: eventType,
          workflow_step_id: approvalWorkflowStep(request.request_id),
          sovereign_tier: "standard",
          product: "VIGIL",
          actor_id: operatorId,
          outcome: `agent_action_${action.toLowerCase()}`,
          actor: "human",
          actor_name: ctx.auth.user.name,
          decision_type: APPROVAL_DECISION_TYPE,
          payload: {
            request_id: request.request_id,
            requesting_agent_id: request.requesting_agent_id,
            action_type: request.action_type,
            risk_classification: request.risk_classification,
            notes: trimmedNotes,
            // ESCALATE records the operator's reason as escalation_reason (spec §6).
            ...(action === "ESCALATE" ? { escalation_reason: trimmedNotes } : {}),
          },
        });
      } catch (err) {
        return fail(
          `Logger emission failed — decision not recorded (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }

      // Session 35 (GD-19 pattern): a decided TT formal escalation becomes visible on
      // the shared task surface so SCRIBE's review queue flips without a manual
      // refresh. AFTER the Logger emit (the decision of record), never before it;
      // ESCALATE leaves the case undecided and publishes nothing; optional-chained
      // inside for a partial test ctx — same degradation as the NEXUS port.
      if (action !== "ESCALATE") {
        publishEscalationAuthorization(ctx.taskSurface, request, action, new Date().toISOString());
      }

      setLastAction(action);
      return { ok: true };

      function fail(message: string): DecisionResult {
        setError(message);
        return { ok: false };
      }
    },
    [ctx, operatorId]
  );

  const clearError = useCallback((): void => setError(null), []);

  return { error, lastAction, decide, clearError };
}

/**
 * module-vigil — vigil-workspace-publisher.ts
 *
 * GD-25 (shell-contract v1.20, Session 50): publishes VIGIL's pending approval
 * requests to the ReviewerWorkspaceSurface — the FULL native objects the Agent
 * Approval Queue already holds (useApprovalQueue state, assembled in VigilApp),
 * not summaries. Called from a VigilApp useEffect whenever the queue changes,
 * and from the GD-25 convergence tests.
 *
 * VigilWorkspacePayload is the shape the Reviewer's Workspace module narrows
 * to (type-only import, per the module-agentos/approval-port.ts precedent):
 * ApprovalDetail needs the complete AgentApprovalRequest, PLUS the
 * PPBEObligationCase when action_type === "ppbe_obligation" — without it the
 * Tier C gate (ObligationDecisionPanel + COUNSEL Decision Record ID, docs/18 §6)
 * could not render in the Workspace. Both are the real objects VigilApp already
 * assembled; nothing is reshaped (docs/23 §6).
 *
 * Reconciliation: a request no longer in VIGIL's live queue (decided via
 * onDecided, or auto-expired via expireOverdue) is removed from the surface so
 * it does not linger in the Workspace. The explicit remove() on the
 * decision-commit path (VigilApp / Workspace onDecided) remains the primary
 * removal — this sweep covers expiry and any missed path.
 *
 * No governance authority (Constraint #1): publishing does not log, approve,
 * or route anything. VIGIL still emits its own governed Logger events.
 */

import type { ReviewerWorkspaceSurface } from "../../sovereign-shell/shell-contract";
import type { AgentApprovalRequest } from "./approval-contract";
import type { PPBEObligationCase } from "./ppbe-authorization";

/** The module_id VIGIL publishes under (matches the GD-24 WorkQueueSurface id). */
export const VIGIL_WORKSPACE_MODULE_ID = "vigil";

/**
 * The payload VIGIL publishes per approval request — narrowed by the Reviewer's
 * Workspace module via a type-only import of this type.
 */
export interface VigilWorkspacePayload {
  request: AgentApprovalRequest;
  /** Present when request.action_type === "ppbe_obligation" — ApprovalDetail's Tier C gate. */
  obligationCase?: PPBEObligationCase;
}

export function publishVigilWorkspaceItems(
  requests: readonly AgentApprovalRequest[],
  obligationCase: PPBEObligationCase | null,
  surface: ReviewerWorkspaceSurface,
  timestamp: string
): void {
  for (const request of requests) {
    const withObligation =
      request.action_type === "ppbe_obligation" &&
      obligationCase !== null &&
      obligationCase.approval_request.request_id === request.request_id;
    const payload: VigilWorkspacePayload = withObligation
      ? { request, obligationCase: obligationCase }
      : { request };
    surface.publish({
      module_id: VIGIL_WORKSPACE_MODULE_ID,
      item_id: request.request_id,
      payload,
      published_at: timestamp,
    });
  }

  // Reconcile: anything published under "vigil" that is no longer in the live
  // queue (decided or expired) leaves the Workspace.
  const liveIds = new Set(requests.map((r) => r.request_id));
  for (const item of surface.listForModule(VIGIL_WORKSPACE_MODULE_ID)) {
    if (!liveIds.has(item.item_id)) {
      surface.remove(VIGIL_WORKSPACE_MODULE_ID, item.item_id);
    }
  }
}

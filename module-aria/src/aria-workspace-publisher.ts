/**
 * module-aria — aria-workspace-publisher.ts
 *
 * GD-25 (shell-contract v1.20, Session 50): publishes ARIA's still-pending CLEAR
 * certification items to the ReviewerWorkspaceSurface — the FULL native
 * ClearEvaluationInput objects the Certification Queue renders (CLEAR_DEMO_ITEMS,
 * the queue's own default item set), not summaries. Called from an AriaApp
 * useEffect whenever the certification surface changes (a decided document is
 * no longer pending), and from the GD-25 convergence tests.
 *
 * The Reviewer's Workspace module narrows the payload back to
 * ClearEvaluationInput via a type-only import (the module-agentos/
 * approval-port.ts precedent) and renders the real ClearCertificationQueue.
 *
 * Reconciliation: an item no longer pending (certified or flagged on ctx.aria)
 * is removed from the surface so it does not linger in the Workspace. The
 * explicit remove() on the decision-commit path (ClearCertificationQueue's
 * decide()) remains the primary removal — this sweep keeps the surface honest
 * on remount, when ctx.aria already holds decisions from earlier in the session.
 *
 * No governance authority (Constraint #1): publishing does not log, approve,
 * or route anything. The Certification Queue still emits its own governed
 * ARIA_CERTIFICATION_ISSUED / ARIA_VIOLATION_FLAGGED Logger events.
 */

import type { ReviewerWorkspaceSurface } from "../../sovereign-shell/shell-contract";
import type { ClearEvaluationInput } from "./clear-types";

/** The module_id ARIA publishes under (matches the GD-24 WorkQueueSurface id). */
export const ARIA_WORKSPACE_MODULE_ID = "aria";

export function publishAriaWorkspaceItems(
  pendingItems: readonly ClearEvaluationInput[],
  surface: ReviewerWorkspaceSurface,
  timestamp: string
): void {
  for (const item of pendingItems) {
    surface.publish({
      module_id: ARIA_WORKSPACE_MODULE_ID,
      item_id: item.document_id,
      payload: item,
      published_at: timestamp,
    });
  }

  // Reconcile: anything published under "aria" that is no longer pending
  // (certified or flagged) leaves the Workspace.
  const pendingIds = new Set(pendingItems.map((i) => i.document_id));
  for (const item of surface.listForModule(ARIA_WORKSPACE_MODULE_ID)) {
    if (!pendingIds.has(item.item_id)) {
      surface.remove(ARIA_WORKSPACE_MODULE_ID, item.item_id);
    }
  }
}

/**
 * module-scribe — scribe-workspace-publisher.ts
 *
 * GD-25 (shell-contract v1.20, Session 50): publishes SCRIBE's Time & Travel
 * manager-review items to the ReviewerWorkspaceSurface — the FULL native
 * TTReviewItem objects ScribeApp already passes to TTManagerReview
 * (DEMO_TT_REVIEW_ITEMS, seeded from the canonical @sovereign/data SYNTH
 * records), not summaries. Called from a ScribeApp useEffect on mount, and from
 * the GD-25 convergence tests.
 *
 * item_id reuses ttReviewItemKey — the same identity TTManagerReview itself
 * keys selection and sent-state on (one source, Constraint #2).
 *
 * The Reviewer's Workspace module narrows the payload back to TTReviewItem via
 * a type-only import (the module-agentos/approval-port.ts precedent) and
 * renders the real TTManagerReview.
 *
 * Removal happens on the decision-commit path: TTManagerReview's onSent
 * callback (wired in ScribeApp AND in the Workspace panel) calls
 * remove(module_id, item_id) after the manager records a send — the item
 * leaves the Workspace rather than lingering. The reconcile sweep here covers
 * republish-after-change consistency, mirroring the VIGIL/ARIA publishers.
 *
 * No governance authority (Constraint #1): publishing does not log, approve,
 * or route anything. TTManagerReview still emits its own governed
 * TIME_CORRECTION_SENT HUMAN_DECISION Logger event.
 */

import type { ReviewerWorkspaceSurface } from "../../sovereign-shell/shell-contract";
import { ttReviewItemKey, type TTReviewItem } from "./TTManagerReview";

/** The module_id SCRIBE publishes under (matches the GD-24 WorkQueueSurface id). */
export const SCRIBE_WORKSPACE_MODULE_ID = "scribe";

export function publishScribeWorkspaceItems(
  items: readonly TTReviewItem[],
  surface: ReviewerWorkspaceSurface,
  timestamp: string
): void {
  for (const item of items) {
    surface.publish({
      module_id: SCRIBE_WORKSPACE_MODULE_ID,
      item_id: ttReviewItemKey(item),
      payload: item,
      published_at: timestamp,
    });
  }

  // Reconcile: anything published under "scribe" that is no longer in the live
  // review queue leaves the Workspace.
  const liveIds = new Set(items.map((i) => ttReviewItemKey(i)));
  for (const published of surface.listForModule(SCRIBE_WORKSPACE_MODULE_ID)) {
    if (!liveIds.has(published.item_id)) {
      surface.remove(SCRIBE_WORKSPACE_MODULE_ID, published.item_id);
    }
  }
}

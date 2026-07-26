/**
 * SOVEREIGN Platform — module-nexus
 * nexus-workspace-publisher.ts — publishes routed travel requests to the
 * ReviewerWorkspaceSurface (Task 3 — WH-19, Session 63).
 *
 * When a travel request is routed (status === "ROUTED"), it awaits a manager decision.
 * NexusApp publishes routed items here so they appear in the Reviewer's Workspace NEXUS
 * panel. A decided item (APPROVED/DENIED/ESCALATED) is reconciled out of the surface.
 *
 * The payload is the full SubmittedTravelItem the travel-compliance engine produced — the
 * Workspace narrows it back via a type-only import (the established cross-module pattern
 * from WorkspaceApp.tsx). The Workspace section renders TravelQueueRow (exported from
 * TTQueuePanel.tsx) with a workspace-scoped decide callback.
 *
 * No governance authority (Constraint #1): publishing does not log, approve, or route
 * anything. The TRAVEL_APPROVAL human decision event is always emitted by the decision
 * path (recordTravelDecision in tt-travel-queue.ts).
 *
 * Version: 1.0 · Session 63 (Task 3 — WH-19) · July 25, 2026
 */

import type { ReviewerWorkspaceSurface } from "../../sovereign-shell/shell-contract";
import type { SubmittedTravelItem } from "./useTTIntake";

/** The module_id NEXUS publishes under on the ReviewerWorkspaceSurface. */
export const NEXUS_WORKSPACE_MODULE_ID = "nexus";

/**
 * Publish the current set of routed travel items to the ReviewerWorkspaceSurface.
 * Items that are no longer routed (decided or removed) are reconciled out.
 */
export function publishNexusTravelItems(
  items: readonly SubmittedTravelItem[],
  surface: ReviewerWorkspaceSurface,
  timestamp: string
): void {
  // Only ROUTED items belong in the Workspace — they are the ones awaiting a decision.
  const routed = items.filter((i) => i.request.status === "ROUTED");

  for (const item of routed) {
    surface.publish({
      module_id: NEXUS_WORKSPACE_MODULE_ID,
      item_id: item.request.request_id,
      payload: item,
      published_at: timestamp,
    });
  }

  // Reconcile: remove anything published under "nexus" that is no longer routed.
  const routedIds = new Set(routed.map((i) => i.request.request_id));
  for (const existing of surface.listForModule(NEXUS_WORKSPACE_MODULE_ID)) {
    if (!routedIds.has(existing.item_id)) {
      surface.remove(NEXUS_WORKSPACE_MODULE_ID, existing.item_id);
    }
  }
}

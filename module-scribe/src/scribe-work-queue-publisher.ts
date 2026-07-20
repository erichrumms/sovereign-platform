/**
 * module-scribe — scribe-work-queue-publisher.ts
 *
 * Standalone helper that publishes SCRIBE's WorkQueueSurface summary —
 * T&T Reviews Awaiting You — from DEMO_TT_REVIEW_ITEMS.length (the count the
 * TTManagerReview component already uses). Called from ScribeApp.tsx useEffect
 * and from the GD-24 convergence tests.
 */

import type { WorkQueueSurface } from "../../sovereign-shell/shell-contract";

export function publishScribeWorkQueues(
  reviewItemCount: number,
  surface: WorkQueueSurface,
  timestamp: string
): void {
  surface.publish({
    module_id: "scribe",
    queue_label: "T&T Reviews Awaiting You",
    count: reviewItemCount,
    highest_severity: null,
    updated_at: timestamp,
  });
}

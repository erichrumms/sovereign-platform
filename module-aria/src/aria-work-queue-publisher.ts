/**
 * module-aria — aria-work-queue-publisher.ts
 *
 * Standalone helper that publishes ARIA's WorkQueueSurface summary —
 * Certifications Awaiting You — from the pending count derived via
 * ctx.aria (the certification surface). Called from AriaApp.tsx (subscribing
 * to ctx.aria changes) and from the GD-24 convergence tests.
 *
 * highest_severity is null: the CLEAR queue tracks P1/At-Risk per document
 * internally but does not expose a queue-level severity concept.
 */

import type { WorkQueueSurface } from "../../sovereign-shell/shell-contract";

export function publishAriaWorkQueues(
  pendingCertCount: number,
  surface: WorkQueueSurface,
  timestamp: string
): void {
  surface.publish({
    module_id: "aria",
    queue_label: "Certifications Awaiting You",
    count: pendingCertCount,
    highest_severity: null,
    updated_at: timestamp,
  });
}

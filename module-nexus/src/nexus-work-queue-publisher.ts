/**
 * module-nexus — nexus-work-queue-publisher.ts
 *
 * Standalone helper that publishes NEXUS's WorkQueueSurface summary —
 * Coordination Items — from the open-item count that PPBECoordinationPanel
 * already displays (SYNTH_PPBE_COORDINATION_ITEMS.filter(i => i.status === "OPEN").length).
 * Called from PPBECoordinationPanel.tsx useEffect and from the GD-24 convergence tests.
 *
 * highest_severity is null: coordination items have no severity concept.
 */

import type { WorkQueueSurface } from "../../sovereign-shell/shell-contract";

export function publishNexusWorkQueues(
  openItemCount: number,
  surface: WorkQueueSurface,
  timestamp: string
): void {
  surface.publish({
    module_id: "nexus",
    queue_label: "Coordination Items",
    count: openItemCount,
    highest_severity: null,
    updated_at: timestamp,
  });
}

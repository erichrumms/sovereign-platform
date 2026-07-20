/**
 * module-vigil — vigil-work-queue-publisher.ts
 *
 * Standalone helper that publishes VIGIL's two WorkQueueSurface summaries —
 * Pending Approvals and Unacknowledged Alerts — from the counts the existing
 * useApprovalQueue / useAlertQueue hooks already compute. Called from
 * VigilApp.tsx useEffect hooks and from the GD-24 convergence tests.
 *
 * No governance authority (Constraint #1): publishing does not log, approve,
 * or route anything. VIGIL still emits its own governed Logger events independently.
 */

import type { WorkQueueSurface } from "../../sovereign-shell/shell-contract";

export function publishVigilWorkQueues(
  pendingApprovals: number,
  hasPendingP1: boolean,
  unacknowledgedAlerts: number,
  hasAlertP1: boolean,
  surface: WorkQueueSurface,
  timestamp: string
): void {
  surface.publish({
    module_id: "vigil",
    queue_label: "Pending Approvals",
    count: pendingApprovals,
    highest_severity: hasPendingP1 ? "P1" : null,
    updated_at: timestamp,
  });
  surface.publish({
    module_id: "vigil",
    queue_label: "Unacknowledged Alerts",
    count: unacknowledgedAlerts,
    highest_severity: hasAlertP1 ? "P1" : null,
    updated_at: timestamp,
  });
}

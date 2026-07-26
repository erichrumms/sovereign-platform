/**
 * SOVEREIGN Platform — module-flowpath
 * flowpath-workspace-publisher.ts — publishes pending workflow artifact bundles to
 * the ReviewerWorkspaceSurface (Task 3 — WH-19, Session 63).
 *
 * When a workflow artifact is produced and awaiting human approval, FlowpathApp
 * publishes it here so it appears in the Reviewer's Workspace FLOWPATH panel.
 * A session that has already been approved is not published (the surface shows
 * only actionable items — items that still require a decision).
 *
 * The payload is the full FlowpathMapperOutput the mapper produced — the
 * Workspace narrows it back via a type-only import (the established cross-module
 * pattern from WorkspaceApp.tsx). WorkflowArtifactReview can receive it directly
 * as its `bundle` prop.
 *
 * No governance authority (Constraint #1): publishing does not log, approve, or
 * route anything. FLOWPATH still emits its own governed Logger events.
 *
 * Version: 1.0 · Session 63 (Task 3 — WH-19) · July 25, 2026
 */

import type { ReviewerWorkspaceSurface } from "../../sovereign-shell/shell-contract";
import type { FlowpathMapperOutput } from "./flowpath-contract";

/** The module_id FLOWPATH publishes under on the ReviewerWorkspaceSurface. */
export const FLOWPATH_WORKSPACE_MODULE_ID = "flowpath";

/**
 * Publish (or clear) the active workflow artifact bundle.
 *
 * @param bundle  The mapper output to publish, or null to clear (e.g. on approval).
 * @param approvedSessionIds  Sessions already approved — not republished.
 * @param surface  The shell's ReviewerWorkspaceSurface.
 * @param timestamp  ISO timestamp for the publish record.
 */
export function publishFlowpathArtifact(
  bundle: FlowpathMapperOutput | null,
  approvedSessionIds: readonly string[],
  surface: ReviewerWorkspaceSurface,
  timestamp: string
): void {
  const approved = new Set(approvedSessionIds);

  // Reconcile: remove anything published under "flowpath" that is no longer the
  // active bundle or has since been approved.
  for (const item of surface.listForModule(FLOWPATH_WORKSPACE_MODULE_ID)) {
    if (!bundle || item.item_id !== bundle.artifact.session_id || approved.has(item.item_id)) {
      surface.remove(FLOWPATH_WORKSPACE_MODULE_ID, item.item_id);
    }
  }

  if (bundle && !approved.has(bundle.artifact.session_id)) {
    surface.publish({
      module_id: FLOWPATH_WORKSPACE_MODULE_ID,
      item_id: bundle.artifact.session_id,
      payload: bundle,
      published_at: timestamp,
    });
  }
}

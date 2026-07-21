/**
 * SOVEREIGN Platform — module-workspace
 * useReviewerWorkspaceItems.ts — a React hook over the shell's
 * ctx.reviewerWorkspaceSurface (the thirteenth shell export, GD-25).
 *
 * Subscribes to the Reviewer's Workspace surface so the Workspace re-renders
 * whenever a source module publishes or removes an item — a decision recorded
 * in VIGIL/ARIA/SCRIBE (or in the embedded Workspace copy) is reflected in
 * place, no refresh. Mirrors module-aria's useAriaCertifications shape.
 *
 * Version: 1.0 · Session 50 (GD-25) · July 20, 2026
 */

import { useEffect, useState } from "react";

import type {
  SovereignShellContext,
  WorkspaceReviewItem,
} from "../../sovereign-shell/shell-contract";

export function useReviewerWorkspaceItems(
  ctx: SovereignShellContext
): readonly WorkspaceReviewItem[] {
  const [items, setItems] = useState<readonly WorkspaceReviewItem[]>(() =>
    ctx.reviewerWorkspaceSurface.list()
  );

  useEffect(() => {
    // Re-sync on mount in case a publish landed between the initial read and subscribe.
    setItems(ctx.reviewerWorkspaceSurface.list());
    return ctx.reviewerWorkspaceSurface.subscribe((next) => setItems(next));
  }, [ctx]);

  return items;
}

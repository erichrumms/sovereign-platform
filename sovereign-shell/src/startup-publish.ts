/**
 * SOVEREIGN Platform — sovereign-shell
 * startup-publish.ts — eager population of the cross-module surfaces at shell
 * start (WG-1, Session 54).
 *
 * Before this file, APEX, VIGIL, NEXUS, SCRIBE, and ARIA published to their
 * shared surfaces (ProgramStatusSurface, WorkQueueSurface,
 * ReviewerWorkspaceSurface) only when a human opened that specific module —
 * so the Home Dashboard and the Reviewer's Workspace, the platform's natural
 * landing pages, opened empty on a fresh session (Walkthrough G, WG-1).
 *
 * This file changes WHEN publication happens, not WHAT is published: it calls
 * each module's EXISTING publish function (Constraint #2 — no parallel
 * publishers) with the same synthetic/dev inputs the module itself assembles
 * at mount, once, at shell start. The host (main.tsx) is the right owner —
 * it is the composition root and already imports every module.
 *
 * When a module later mounts, its own publish effects re-run against the same
 * surfaces (last-write-wins), so nothing here diverges from the module's own
 * view. VIGIL's queue comes from the shared session store
 * (vigil-approval-session.ts, WG-13) — the SAME live queue VigilApp and the
 * Reviewer's Workspace read — so a decision anywhere is reflected everywhere.
 *
 * Role gating is unchanged: publication is role-blind by design (surfaces are
 * shell-owned), and the READ side filters — PlatformHome by accessible module,
 * the Workspace by per-section roles — exactly as before.
 *
 * Version: 1.0 · Session 54 (WG-1) · July 22, 2026
 */

import type { SovereignShellContext } from "../shell-contract";

// APEX — program obligation status (GD-23) from the canonical synthetic seed.
import { publishProgramStatuses } from "../../module-apex/src/ppbe-dashboard";
import { createSyntheticPPBEDashboardInputs } from "../../module-apex/src/ppbe-data-adapter";

// VIGIL — the shared session approval queue (WG-13) + the seeded alert set.
import { ensureVigilApprovalSession } from "../../module-vigil/src/vigil-approval-session";
import { publishVigilWorkQueues } from "../../module-vigil/src/vigil-work-queue-publisher";
import { publishVigilWorkspaceItems } from "../../module-vigil/src/vigil-workspace-publisher";
import { DEMO_ARIA_ALERTS } from "../../module-vigil/src/aria-alert-routing";
import { DEMO_TT_ALERTS } from "../../module-vigil/src/tt-synthetic-alerts";

// ARIA — pending CLEAR certifications (pending = no record on ctx.aria,
// mirroring useAriaCertifications.statusOf).
import { CLEAR_DEMO_ITEMS } from "../../module-aria/src/ClearCertificationQueue";
import { publishAriaWorkQueues } from "../../module-aria/src/aria-work-queue-publisher";
import { publishAriaWorkspaceItems } from "../../module-aria/src/aria-workspace-publisher";

// SCRIBE — the seeded T&T manager-review items.
import { DEMO_TT_REVIEW_ITEMS } from "../../module-scribe/src/tt-synthetic-review";
import { publishScribeWorkQueues } from "../../module-scribe/src/scribe-work-queue-publisher";
import { publishScribeWorkspaceItems } from "../../module-scribe/src/scribe-workspace-publisher";
import { isScribeItemSent } from "../../module-scribe/src/scribe-sent-session";
import { ttReviewItemKey } from "../../module-scribe/src/TTManagerReview";

// NEXUS — open PPBE coordination items (the same count PPBECoordinationPanel derives).
import { SYNTH_PPBE_COORDINATION_ITEMS } from "../../module-nexus/src/ppbe-synthetic-coordination";
import { publishNexusWorkQueues } from "../../module-nexus/src/nexus-work-queue-publisher";

/**
 * Publish every module's surface data once, at shell start. Call after
 * createShell() + registerPlatformModules(), before first render.
 */
export function publishModuleSurfacesAtStartup(ctx: SovereignShellContext): void {
  const now = new Date().toISOString();

  // ---- APEX (GD-23): per-program obligation snapshots → Home Program Health / Issues.
  publishProgramStatuses(createSyntheticPPBEDashboardInputs(), ctx.programStatusSurface, now);

  // ---- VIGIL (GD-24/GD-25): approval queue + alert counts, and the full
  // reviewable requests. The session store assembles the queue exactly as
  // VigilApp does at mount (dev port + TT escalation + Tier C obligation case).
  const vigil = ensureVigilApprovalSession(ctx.logger);
  const seededAlerts = [...DEMO_ARIA_ALERTS, ...DEMO_TT_ALERTS];
  const unacknowledged = seededAlerts.filter((a) => a.status === "UNACKNOWLEDGED");
  publishVigilWorkQueues(
    vigil.requests.length,
    vigil.requests.some((r) => r.risk_classification === "P1"),
    unacknowledged.length,
    unacknowledged.some((a) => a.alertLevel === "P1"),
    ctx.workQueueSurface,
    now
  );
  publishVigilWorkspaceItems(
    vigil.requests,
    vigil.obligationCase,
    ctx.reviewerWorkspaceSurface,
    now
  );

  // ---- ARIA (GD-24/GD-25): pending = no certification recorded on ctx.aria —
  // the same criterion useAriaCertifications.statusOf applies in AriaApp.
  const pendingClearItems = CLEAR_DEMO_ITEMS.filter(
    (item) => ctx.aria.get(item.document_id) === undefined
  );
  publishAriaWorkQueues(pendingClearItems.length, ctx.workQueueSurface, now);
  publishAriaWorkspaceItems(pendingClearItems, ctx.reviewerWorkspaceSurface, now);

  // ---- SCRIBE (GD-24/GD-25): the same seeded review items ScribeApp publishes,
  // filtered to those not yet sent this session (WG-15 — scribe-sent-session.ts).
  const scribePending = DEMO_TT_REVIEW_ITEMS.filter(
    (item) => !isScribeItemSent(ttReviewItemKey(item))
  );
  publishScribeWorkQueues(scribePending.length, ctx.workQueueSurface, now);
  publishScribeWorkspaceItems(scribePending, ctx.reviewerWorkspaceSurface, now);

  // ---- NEXUS (GD-24): open coordination items — the same filter
  // PPBECoordinationPanel applies at mount.
  publishNexusWorkQueues(
    SYNTH_PPBE_COORDINATION_ITEMS.filter((i) => i.status === "OPEN").length,
    ctx.workQueueSurface,
    now
  );
}

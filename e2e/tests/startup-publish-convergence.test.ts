/**
 * e2e — startup-publish-convergence.test.ts (Session 54, WG-1).
 *
 * THE FULL LOOP for eager surface population: one call to
 * publishModuleSurfacesAtStartup() — exactly what the shell host runs at
 * start — populates all three cross-module surfaces with every module's real
 * synthetic data, before any module has mounted. This is the fresh-session
 * condition Walkthrough G found empty (Home 0/0/0, Workspace 0/0/0 until each
 * module was visited manually).
 *
 * Mirrors the work-queue-surface-convergence style: makeCtx() once, the real
 * publish path, real data sources, no mocks past the point that matters.
 */

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { makeCtx } from "./harness";

import { publishModuleSurfacesAtStartup } from "../../sovereign-shell/src/startup-publish";
import { resetVigilApprovalSessionForTests } from "../../module-vigil/src/vigil-approval-session";
import { CLEAR_DEMO_ITEM_COUNT } from "../../module-aria/src/ClearCertificationQueue";
import { DEMO_TT_REVIEW_ITEMS } from "../../module-scribe/src/tt-synthetic-review";
import { SYNTH_PPBE_PROGRAMS } from "@sovereign/data";
import {
  markScribeItemSent,
  resetScribeSessionForTests,
} from "../../module-scribe/src/scribe-sent-session";
import { ttReviewItemKey } from "../../module-scribe/src/TTManagerReview";

describe("Startup surface publication — WG-1 (Session 54)", () => {
  beforeEach(() => resetVigilApprovalSessionForTests());

  it("populates ProgramStatusSurface with every seeded program (Home Program Health / Issues)", () => {
    const ctx = makeCtx([]);
    publishModuleSurfacesAtStartup(ctx);

    const programs = ctx.programStatusSurface.list();
    expect(programs).toHaveLength(SYNTH_PPBE_PROGRAMS.length); // 5
    // The deliberately flagged programs are visible without APEX ever mounting.
    expect(programs.some((p) => p.status !== "on_track")).toBe(true);
  });

  it("populates WorkQueueSurface for VIGIL, SCRIBE, ARIA, and NEXUS (Home To Do / Review)", () => {
    const ctx = makeCtx([]);
    publishModuleSurfacesAtStartup(ctx);

    const vigil = ctx.workQueueSurface.listForModule("vigil");
    expect(vigil).toHaveLength(2);
    expect(vigil.find((s) => s.queue_label === "Pending Approvals")!.count).toBe(5);
    expect(vigil.find((s) => s.queue_label === "Pending Approvals")!.highest_severity).toBe("P1");

    expect(ctx.workQueueSurface.listForModule("scribe")[0].count).toBe(DEMO_TT_REVIEW_ITEMS.length);
    expect(ctx.workQueueSurface.listForModule("aria")[0].count).toBe(CLEAR_DEMO_ITEM_COUNT);
    expect(ctx.workQueueSurface.listForModule("nexus")[0].count).toBeGreaterThan(0);
  });

  it("populates ReviewerWorkspaceSurface on all three sections with FULL payloads", () => {
    const logged: SovereignLogEvent[] = [];
    const ctx = makeCtx(logged);
    publishModuleSurfacesAtStartup(ctx);

    expect(ctx.reviewerWorkspaceSurface.listForModule("vigil")).toHaveLength(5);
    expect(ctx.reviewerWorkspaceSurface.listForModule("aria")).toHaveLength(CLEAR_DEMO_ITEM_COUNT);
    expect(ctx.reviewerWorkspaceSurface.listForModule("scribe")).toHaveLength(
      DEMO_TT_REVIEW_ITEMS.length
    );

    // Payloads are the real objects, not summaries (docs/23 §6): the Tier C
    // obligation request is present and its published payload carries the case.
    const vigilItems = ctx.reviewerWorkspaceSurface.listForModule("vigil");
    const obligation = vigilItems.find((i) =>
      (i.payload as { obligationCase?: unknown }).obligationCase !== undefined
    );
    expect(obligation).toBeDefined();

    // The obligation gate's own governed events were emitted at assembly —
    // startup publication changed WHEN they happen, not WHETHER.
    expect(logged.some((e) => e.event_type === "APPROVAL_REQUEST_RECEIVED")).toBe(true);
  });

  it("startup publication matches what the modules themselves would publish (last-write-wins safe)", () => {
    const ctx = makeCtx([]);
    publishModuleSurfacesAtStartup(ctx);
    const before = ctx.workQueueSurface.list().length;

    // Publishing again (as a module mount would) replaces rather than duplicates.
    publishModuleSurfacesAtStartup(ctx);
    expect(ctx.workQueueSurface.list().length).toBe(before);
  });
});

describe("Startup SCRIBE sent-session filter — WG-15 (Session 55)", () => {
  beforeEach(() => {
    resetVigilApprovalSessionForTests();
    resetScribeSessionForTests();
  });

  it("fresh session — startup publishes the full DEMO_TT_REVIEW_ITEMS count to both SCRIBE surfaces", () => {
    const ctx = makeCtx([]);
    publishModuleSurfacesAtStartup(ctx);

    expect(ctx.workQueueSurface.listForModule("scribe")[0].count).toBe(DEMO_TT_REVIEW_ITEMS.length);
    expect(ctx.reviewerWorkspaceSurface.listForModule("scribe")).toHaveLength(DEMO_TT_REVIEW_ITEMS.length);
  });

  it("after markScribeItemSent, startup excludes that item from SCRIBE work-queue count and workspace items", () => {
    const sentItem = DEMO_TT_REVIEW_ITEMS[0];
    markScribeItemSent(ttReviewItemKey(sentItem));

    const ctx = makeCtx([]);
    publishModuleSurfacesAtStartup(ctx);

    expect(ctx.workQueueSurface.listForModule("scribe")[0].count).toBe(DEMO_TT_REVIEW_ITEMS.length - 1);
    expect(ctx.reviewerWorkspaceSurface.listForModule("scribe")).toHaveLength(DEMO_TT_REVIEW_ITEMS.length - 1);
  });
});

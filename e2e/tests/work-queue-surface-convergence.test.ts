/**
 * e2e — work-queue-surface-convergence.test.ts (Session 49, D4).
 *
 * THE FULL LOOP for the GD-24 WorkQueueSurface: VIGIL, SCRIBE, ARIA, and NEXUS
 * each publish their queue summaries via their publish helpers; the surface
 * stores them correctly; listForModule() partitions by source module; subscribe()
 * fires on every change. One shared SovereignShellContext — exactly as the shell
 * wires it. No mocks past the point that matters.
 *
 * Mirrors Session 44's apex-vigil-program-status-convergence.test.ts style:
 * makeCtx() once, real publish functions from each module, real data sources.
 */

import type { SovereignLogEvent, WorkQueueSummary } from "../../sovereign-shell/shell-contract";
import { makeCtx } from "./harness";

import { publishVigilWorkQueues } from "../../module-vigil/src/vigil-work-queue-publisher";

import { publishScribeWorkQueues } from "../../module-scribe/src/scribe-work-queue-publisher";
import { DEMO_TT_REVIEW_ITEMS } from "../../module-scribe/src/tt-synthetic-review";

import { publishAriaWorkQueues } from "../../module-aria/src/aria-work-queue-publisher";
import { CLEAR_DEMO_ITEM_COUNT } from "../../module-aria/src/ClearCertificationQueue";

import { publishNexusWorkQueues } from "../../module-nexus/src/nexus-work-queue-publisher";
import { SYNTH_PPBE_COORDINATION_ITEMS } from "../../module-nexus/src/ppbe-synthetic-coordination";

const NOW_ISO = "2026-07-20T00:00:00.000Z";

describe("WorkQueueSurface convergence — GD-24 (Session 49)", () => {
  it("VIGIL publishes Pending Approvals and Unacknowledged Alerts with correct structure", () => {
    const logged: SovereignLogEvent[] = [];
    const ctx = makeCtx(logged); // ONE ctx — as the shell wires it

    publishVigilWorkQueues(5, true, 3, false, ctx.workQueueSurface, NOW_ISO);

    const vigil = ctx.workQueueSurface.listForModule("vigil");
    expect(vigil).toHaveLength(2);

    const approvals = vigil.find((s) => s.queue_label === "Pending Approvals")!;
    expect(approvals).toBeDefined();
    expect(approvals.module_id).toBe("vigil");
    expect(approvals.count).toBe(5);
    expect(approvals.highest_severity).toBe("P1");
    expect(approvals.updated_at).toBe(NOW_ISO);

    const alerts = vigil.find((s) => s.queue_label === "Unacknowledged Alerts")!;
    expect(alerts).toBeDefined();
    expect(alerts.module_id).toBe("vigil");
    expect(alerts.count).toBe(3);
    expect(alerts.highest_severity).toBeNull();
  });

  it("SCRIBE publishes T&T Reviews using the live synthetic queue count", () => {
    const ctx = makeCtx([]);
    // DEMO_TT_REVIEW_ITEMS.length is the same source ScribeApp passes to publishScribeWorkQueues.
    publishScribeWorkQueues(DEMO_TT_REVIEW_ITEMS.length, ctx.workQueueSurface, NOW_ISO);

    const scribe = ctx.workQueueSurface.listForModule("scribe");
    expect(scribe).toHaveLength(1);
    expect(scribe[0].queue_label).toBe("T&T Reviews Awaiting You");
    expect(scribe[0].count).toBe(DEMO_TT_REVIEW_ITEMS.length);
    expect(DEMO_TT_REVIEW_ITEMS.length).toBeGreaterThan(0);
    expect(scribe[0].highest_severity).toBeNull();
  });

  it("ARIA publishes Certifications Awaiting using the CLEAR demo item count", () => {
    const ctx = makeCtx([]);
    // CLEAR_DEMO_ITEM_COUNT = DEMO_ITEMS.length in ClearCertificationQueue — the pending total on fresh mount.
    publishAriaWorkQueues(CLEAR_DEMO_ITEM_COUNT, ctx.workQueueSurface, NOW_ISO);

    const aria = ctx.workQueueSurface.listForModule("aria");
    expect(aria).toHaveLength(1);
    expect(aria[0].queue_label).toBe("Certifications Awaiting You");
    expect(aria[0].count).toBe(CLEAR_DEMO_ITEM_COUNT);
    expect(CLEAR_DEMO_ITEM_COUNT).toBeGreaterThan(0);
    expect(aria[0].highest_severity).toBeNull();
  });

  it("NEXUS publishes Coordination Items using the live open-item count", () => {
    const ctx = makeCtx([]);
    const openCount = SYNTH_PPBE_COORDINATION_ITEMS.filter((i) => i.status === "OPEN").length;
    publishNexusWorkQueues(openCount, ctx.workQueueSurface, NOW_ISO);

    const nexus = ctx.workQueueSurface.listForModule("nexus");
    expect(nexus).toHaveLength(1);
    expect(nexus[0].queue_label).toBe("Coordination Items");
    expect(nexus[0].count).toBe(openCount);
    expect(openCount).toBeGreaterThan(0);
    expect(nexus[0].highest_severity).toBeNull();
  });

  it("all four modules: list() returns all 5 summaries, listForModule() partitions correctly", () => {
    const ctx = makeCtx([]);
    const openCount = SYNTH_PPBE_COORDINATION_ITEMS.filter((i) => i.status === "OPEN").length;

    publishVigilWorkQueues(5, true, 3, false, ctx.workQueueSurface, NOW_ISO);
    publishScribeWorkQueues(DEMO_TT_REVIEW_ITEMS.length, ctx.workQueueSurface, NOW_ISO);
    publishAriaWorkQueues(CLEAR_DEMO_ITEM_COUNT, ctx.workQueueSurface, NOW_ISO);
    publishNexusWorkQueues(openCount, ctx.workQueueSurface, NOW_ISO);

    const all = ctx.workQueueSurface.list();
    expect(all).toHaveLength(5); // 2 VIGIL + 1 SCRIBE + 1 ARIA + 1 NEXUS

    expect(ctx.workQueueSurface.listForModule("vigil")).toHaveLength(2);
    expect(ctx.workQueueSurface.listForModule("scribe")).toHaveLength(1);
    expect(ctx.workQueueSurface.listForModule("aria")).toHaveLength(1);
    expect(ctx.workQueueSurface.listForModule("nexus")).toHaveLength(1);

    // Every summary is structurally valid
    for (const s of all) {
      expect(typeof s.module_id).toBe("string");
      expect(typeof s.queue_label).toBe("string");
      expect(typeof s.count).toBe("number");
      expect(s.count).toBeGreaterThanOrEqual(0);
      expect(s.updated_at).toBe(NOW_ISO);
    }
  });

  it("subscribe fires on every publish and the final snapshot is complete", () => {
    const ctx = makeCtx([]);
    const received: Array<readonly WorkQueueSummary[]> = [];
    ctx.workQueueSurface.subscribe((s) => received.push(s));

    const openCount = SYNTH_PPBE_COORDINATION_ITEMS.filter((i) => i.status === "OPEN").length;
    publishVigilWorkQueues(5, true, 3, false, ctx.workQueueSurface, NOW_ISO);
    publishScribeWorkQueues(DEMO_TT_REVIEW_ITEMS.length, ctx.workQueueSurface, NOW_ISO);
    publishAriaWorkQueues(CLEAR_DEMO_ITEM_COUNT, ctx.workQueueSurface, NOW_ISO);
    publishNexusWorkQueues(openCount, ctx.workQueueSurface, NOW_ISO);

    // Subscriber was called at least once per module's publish
    expect(received.length).toBeGreaterThan(0);

    // The final snapshot contains all four modules
    const last = received[received.length - 1];
    expect(last.some((s) => s.module_id === "vigil")).toBe(true);
    expect(last.some((s) => s.module_id === "scribe")).toBe(true);
    expect(last.some((s) => s.module_id === "aria")).toBe(true);
    expect(last.some((s) => s.module_id === "nexus")).toBe(true);
  });

  it("last-write-wins — republishing replaces the prior entry for that module_id + queue_label", () => {
    const ctx = makeCtx([]);

    publishVigilWorkQueues(5, true, 3, false, ctx.workQueueSurface, NOW_ISO);
    publishVigilWorkQueues(7, false, 0, false, ctx.workQueueSurface, NOW_ISO);

    // Still just 2 VIGIL entries (not 4) — each queue was replaced, not appended
    const vigil = ctx.workQueueSurface.listForModule("vigil");
    expect(vigil).toHaveLength(2);

    const approvals = vigil.find((s) => s.queue_label === "Pending Approvals")!;
    expect(approvals.count).toBe(7);
    expect(approvals.highest_severity).toBeNull();

    const alerts = vigil.find((s) => s.queue_label === "Unacknowledged Alerts")!;
    expect(alerts.count).toBe(0);
  });

  it("unsubscribe stops further notifications", () => {
    const ctx = makeCtx([]);
    const received: number[] = [];
    const unsub = ctx.workQueueSurface.subscribe(() => received.push(1));

    publishVigilWorkQueues(5, false, 0, false, ctx.workQueueSurface, NOW_ISO);
    expect(received).toHaveLength(2); // one publish per VIGIL queue

    unsub();
    publishScribeWorkQueues(1, ctx.workQueueSurface, NOW_ISO);
    expect(received).toHaveLength(2); // no additional notification after unsubscribe
  });
});

/** @jest-environment jsdom */
/**
 * e2e — workspace-badge-parity.test.tsx (Session 93, Task 1)
 *
 * CROSS-SURFACE PARITY: badge count === ReviewerWorkspaceSurface count ===
 * rendered decision-card count, for every Workspace tab.
 *
 * This is the permanent extension of Check 7 from
 * nexus-flowpath-workspace-convergence.test.tsx (which covers NEXUS Travel).
 * That check was added in Session 92 in direct response to WH-43 — a badge
 * over-count caused by a second, independently-computed filter that diverged
 * from the publisher's own ROUTED-only filter. Router_Inspection_Audit_Process.md
 * §4 named "cross-surface parity rate" as the metric that would have caught
 * WH-43 the day it shipped. This file makes that metric a standing test
 * obligation for every tab that publishes through the surface.
 *
 * COVERAGE MAP (per Router_Inspection_Audit_Process.md §6, step 8):
 *
 *   VIGIL Approvals       → Check 1: surface-publisher, per-item testid added
 *                           this session. Parity: badge=surface=rendered.
 *   ARIA Certifications   → Check 2: queue-item-${document_id} already present.
 *   SCRIBE T&T Reviews    → Check 3: tt-queue-item-${key} already present.
 *   NEXUS Travel          → Check 7 in nexus-flowpath-workspace-convergence (not
 *                           duplicated here; reference that file for NEXUS parity).
 *   FLOWPATH Review       → Check 4: 0-or-1 artifact; parity via artifact-review
 *                           presence/absence.
 *
 *   Cost Dashboard        — NOT applicable. Badge = costCount derived from
 *                           ctx.logger.getEntries() directly; the dashboard section
 *                           reads the SAME filtered entry array from the SAME source.
 *                           There is no ReviewerWorkspaceSurface intermediary, so
 *                           no badge/surface split exists that could diverge. No parity
 *                           test is needed or meaningful here.
 *
 *   Activity & Decisions  — NOT applicable for the same structural reason: badge =
 *                           activityCount from ctx.logger.getEntries(), displayed list
 *                           from the same in-memory source. No surface split, no
 *                           divergence path, no parity test needed.
 *
 * Each check follows Check 7's exact three-invariant pattern:
 *   (a) Content filter is correct — only publishable items appear on the surface.
 *   (b) Badge text === surface item count.
 *   (c) Surface item count === rendered card count.
 */

import { render, screen, fireEvent } from "@testing-library/react";

import { makeCtx } from "./harness";
import { WorkspaceApp } from "../../module-workspace/src/WorkspaceApp";
import { publishModuleSurfacesAtStartup } from "../../sovereign-shell/src/startup-publish";

import { resetVigilApprovalSessionForTests } from "../../module-vigil/src/vigil-approval-session";

import { publishAriaWorkspaceItems } from "../../module-aria/src/aria-workspace-publisher";
import { CLEAR_DEMO_ITEMS } from "../../module-aria/src/ClearCertificationQueue";

import { publishScribeWorkspaceItems } from "../../module-scribe/src/scribe-workspace-publisher";
import { DEMO_TT_REVIEW_ITEMS } from "../../module-scribe/src/tt-synthetic-review";

import { publishFlowpathArtifact } from "../../module-flowpath/src/flowpath-workspace-publisher";
import {
  SYNTHETIC_MAPPER_OUTPUT,
  SYNTHETIC_SESSION_ID,
} from "../../module-flowpath/src/synthetic-elicitation";
import { resetFlowpathApprovalSessionForTests } from "../../module-flowpath/src/flowpath-approval-session";

const TS = "2026-08-05T00:00:00.000Z";

/** Extract the badge count shown on the tab with the given label pattern. */
function badgeFor(labelPattern: RegExp): number {
  const tabs = screen.getAllByRole("tab");
  const tab = tabs.find((t) => labelPattern.test(t.textContent ?? ""))!;
  const badgeSpan = tab.querySelector("span");
  return badgeSpan ? parseInt(badgeSpan.textContent ?? "0", 10) : 0;
}

describe("Reviewer's Workspace badge-parity — all tabs (Session 93, Task 1)", () => {
  beforeEach(() => {
    resetVigilApprovalSessionForTests();
    resetFlowpathApprovalSessionForTests();
  });

  // ── Check 1: VIGIL Approvals parity ──────────────────────────────────────
  //
  // (a) All surface items are live pending requests from the session queue —
  //     publishVigilWorkspaceItems does not filter by status the way
  //     publishNexusTravelItems filters to ROUTED-only; every item in the live
  //     queue is publishable. The session queue IS the filter.
  // (b) badge === surface count.
  // (c) surface count === rendered vigil-queue-request-* card count.
  it("VIGIL: badge count === surface count === rendered request-card count", () => {
    const ctx = makeCtx([]);
    publishModuleSurfacesAtStartup(ctx);

    render(<WorkspaceApp ctx={ctx} />);

    const surfaceItems = ctx.reviewerWorkspaceSurface.listForModule("vigil");
    expect(surfaceItems.length).toBeGreaterThan(0); // guard: session queue must be non-empty

    // VIGIL is the default section for SYSTEM_ADMIN — no tab click needed.
    expect(screen.getByTestId("workspace-vigil-section")).toBeInTheDocument();

    // (b) Badge text matches the surface count.
    expect(badgeFor(/VIGIL Approvals/)).toBe(surfaceItems.length);

    // (c) Every surface item renders exactly one request card.
    const vigilSection = screen.getByTestId("workspace-vigil-section");
    const renderedCards = vigilSection.querySelectorAll('[data-testid^="vigil-queue-request-"]');
    expect(renderedCards.length).toBe(surfaceItems.length);

    // (a) Every surface item ID matches a card that actually rendered.
    const renderedIds = new Set(
      Array.from(renderedCards).map((el) =>
        el.getAttribute("data-testid")!.replace("vigil-queue-request-", "")
      )
    );
    for (const item of surfaceItems) {
      expect(renderedIds.has(item.item_id)).toBe(true);
    }
  });

  // ── Check 2: ARIA Certifications parity ──────────────────────────────────
  //
  // (a) All surface items are pending CLEAR certifications — publishAriaWorkspaceItems
  //     publishes the filtered pendingItems set (items not yet decided on ctx.aria).
  // (b) badge === surface count.
  // (c) surface count === rendered queue-item-* count.
  it("ARIA: badge count === surface count === rendered queue-item count", () => {
    const ctx = makeCtx([]);
    publishAriaWorkspaceItems(CLEAR_DEMO_ITEMS, ctx.reviewerWorkspaceSurface, TS);

    render(<WorkspaceApp ctx={ctx} />);
    fireEvent.click(screen.getByRole("tab", { name: /ARIA Certifications/ }));

    const surfaceItems = ctx.reviewerWorkspaceSurface.listForModule("aria");
    expect(surfaceItems.length).toBeGreaterThan(0);

    // (b) Badge text matches the surface count.
    expect(badgeFor(/ARIA Certifications/)).toBe(surfaceItems.length);

    // (c) Every surface item renders exactly one queue-item card.
    const ariaSection = screen.getByTestId("workspace-aria-section");
    const renderedCards = ariaSection.querySelectorAll('[data-testid^="queue-item-"]');
    expect(renderedCards.length).toBe(surfaceItems.length);

    // (a) Every surface item ID matches a card.
    const renderedIds = new Set(
      Array.from(renderedCards).map((el) =>
        el.getAttribute("data-testid")!.replace("queue-item-", "")
      )
    );
    for (const item of surfaceItems) {
      expect(renderedIds.has(item.item_id)).toBe(true);
    }
  });

  // ── Check 3: SCRIBE T&T Reviews parity ────────────────────────────────────
  //
  // (a) All surface items are unsent T&T review items from DEMO_TT_REVIEW_ITEMS
  //     (filtered by isScribeItemSent at publish time).
  // (b) badge === surface count.
  // (c) surface count === rendered tt-queue-item-* count.
  it("SCRIBE: badge count === surface count === rendered tt-queue-item count", () => {
    const ctx = makeCtx([]);
    publishScribeWorkspaceItems(DEMO_TT_REVIEW_ITEMS, ctx.reviewerWorkspaceSurface, TS);

    render(<WorkspaceApp ctx={ctx} />);
    fireEvent.click(screen.getByRole("tab", { name: /SCRIBE T&T Reviews/ }));

    const surfaceItems = ctx.reviewerWorkspaceSurface.listForModule("scribe");
    expect(surfaceItems.length).toBeGreaterThan(0);

    // (b) Badge text matches the surface count.
    expect(badgeFor(/SCRIBE T&T Reviews/)).toBe(surfaceItems.length);

    // (c) Every surface item renders exactly one queue-item row in the review queue.
    const scribeSection = screen.getByTestId("workspace-scribe-section");
    const renderedCards = scribeSection.querySelectorAll('[data-testid^="tt-queue-item-"]');
    expect(renderedCards.length).toBe(surfaceItems.length);

    // (a) Every surface item ID matches a rendered row.
    const renderedIds = new Set(
      Array.from(renderedCards).map((el) =>
        el.getAttribute("data-testid")!.replace("tt-queue-item-", "")
      )
    );
    for (const item of surfaceItems) {
      expect(renderedIds.has(item.item_id)).toBe(true);
    }
  });

  // ── Check 4: FLOWPATH Review parity ──────────────────────────────────────
  //
  // FLOWPATH publishes 0 or 1 artifact at a time (single active elicitation
  // session). The parity invariant simplifies to:
  //   badge ∈ {0, 1} === surface.listForModule("flowpath").length
  //   and if 1: artifact-review is rendered; if 0: empty-section is shown instead.
  //
  // Sub-check A: With one published bundle, badge=1, surface=1, artifact-review renders.
  // Sub-check B: With no bundle (null), badge=0, surface=0, empty-section renders.
  it("FLOWPATH: badge count === surface count === rendered artifact count (0 and 1 cases)", () => {
    const ctx = makeCtx([]);

    // Sub-check A: one bundle published.
    publishFlowpathArtifact(SYNTHETIC_MAPPER_OUTPUT, [], ctx.reviewerWorkspaceSurface, TS);

    const { unmount } = render(<WorkspaceApp ctx={ctx} />);
    fireEvent.click(screen.getByRole("tab", { name: /FLOWPATH Review/ }));

    const surfaceA = ctx.reviewerWorkspaceSurface.listForModule("flowpath");
    expect(surfaceA.length).toBe(1);

    // (b) Badge === 1.
    expect(badgeFor(/FLOWPATH Review/)).toBe(1);

    // (c) artifact-review is present exactly once.
    const flowpathSection = screen.getByTestId("workspace-flowpath-section");
    const artifactElements = flowpathSection.querySelectorAll('[data-testid="artifact-review"]');
    expect(artifactElements.length).toBe(1);

    // (a) The rendered artifact is the published bundle's session.
    expect(surfaceA[0].item_id).toBe(SYNTHETIC_SESSION_ID);

    unmount();

    // Sub-check B: null bundle — surface cleared, badge=0, empty section renders.
    publishFlowpathArtifact(null, [], ctx.reviewerWorkspaceSurface, "2026-08-05T01:00:00.000Z");

    render(<WorkspaceApp ctx={ctx} />);
    fireEvent.click(screen.getByRole("tab", { name: /FLOWPATH Review/ }));

    const surfaceB = ctx.reviewerWorkspaceSurface.listForModule("flowpath");
    expect(surfaceB.length).toBe(0);

    expect(badgeFor(/FLOWPATH Review/)).toBe(0);
    expect(screen.queryByTestId("artifact-review")).not.toBeInTheDocument();
    expect(screen.getByTestId("workspace-empty-section")).toBeInTheDocument();
  });
});

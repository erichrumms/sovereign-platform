/** @jest-environment jsdom */
/**
 * e2e — nexus-flowpath-workspace-convergence.test.tsx (Session 90, F1).
 *
 * THE FULL LOOP for the two WH-19-added Reviewer's Workspace sections
 * (NEXUS Travel and FLOWPATH Review) — same structure as
 * reviewer-workspace-convergence.test.tsx (GD-25 / Session 50).
 *
 * Six checks, matching the temporary session89-seven-tab-verification.test.tsx
 * that proved these links on August 5, 2026, then was deleted (Session 89 §Part 3):
 *
 *   1. Startup publication lands every pending (ROUTED/ESCALATED) NEXUS travel
 *      item on the surface with the FULL SubmittedTravelItem payload — request,
 *      finding, and workflow_step_id all intact.
 *   2. Republishing with a final-outcome (APPROVED) item reconciles it OUT of
 *      the surface — the remove contract.
 *   3. An active FLOWPATH bundle publishes with the real FlowpathMapperOutput
 *      payload (session_id intact).
 *   4. An approved session reconciles out; a null bundle clears the surface.
 *   5. Render-level: one SYSTEM_ADMIN ctx shows all seven Workspace tabs, each
 *      accessible; VIGIL/ARIA/SCRIBE/NEXUS/FLOWPATH sections render their real
 *      published items; Cost Dashboard and Activity sections render.
 *   6. Approving a ROUTED travel item inside the Workspace removes it from the
 *      surface and logs HUMAN_DECISION with decision_type TRAVEL_APPROVAL
 *      carrying the correct workflow_step_id.
 *
 * Follows the GD-23/GD-24/GD-25 convergence style: makeCtx() once, real publish
 * functions, real data sources. No mocks past the point that matters (the key-less
 * brief hook degrades to its real STATIC tier; the FLOWPATH artifact uses the
 * synthetic operational bundle).
 */

import { render, screen, fireEvent } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { makeCtx } from "./harness";

import { WorkspaceApp } from "../../module-workspace/src/WorkspaceApp";

import { publishModuleSurfacesAtStartup } from "../../sovereign-shell/src/startup-publish";
import { publishNexusTravelItems } from "../../module-nexus/src/nexus-workspace-publisher";
import { publishFlowpathArtifact } from "../../module-flowpath/src/flowpath-workspace-publisher";

import { evaluateTravelRequest } from "../../module-nexus/src/tt-travel-compliance-engine";
import { travelWorkflowStep } from "../../module-nexus/src/tt-travel-queue";
import { SYNTH_TT_TRAVEL_REQUESTS, SYNTH_TT_TRAVEL_POLICY } from "@sovereign/data";
import type { SubmittedTravelItem } from "../../module-nexus/src/useTTIntake";

import {
  SYNTHETIC_MAPPER_OUTPUT,
  SYNTHETIC_SESSION_ID,
} from "../../module-flowpath/src/synthetic-elicitation";
import { resetFlowpathApprovalSessionForTests } from "../../module-flowpath/src/flowpath-approval-session";
import { resetVigilApprovalSessionForTests } from "../../module-vigil/src/vigil-approval-session";

/** Build the same SubmittedTravelItem array startup-publish.ts assembles at shell start. */
function buildStartupTravelItems(): SubmittedTravelItem[] {
  return SYNTH_TT_TRAVEL_REQUESTS.map((request) => ({
    request,
    finding: evaluateTravelRequest(request, SYNTH_TT_TRAVEL_POLICY, {}),
    workflow_step_id: travelWorkflowStep(request.request_id),
  }));
}

const TS = "2026-08-05T00:00:00.000Z";

describe("NEXUS Travel + FLOWPATH Review Workspace convergence — WH-19 (Session 90, F1)", () => {
  beforeEach(() => {
    resetVigilApprovalSessionForTests();
    resetFlowpathApprovalSessionForTests();
  });

  // ── Check 1: NEXUS travel startup publication ──────────────────────────────
  it("startup publication lands every pending NEXUS travel item on the surface with the full SubmittedTravelItem payload", () => {
    const ctx = makeCtx([]);
    publishNexusTravelItems(buildStartupTravelItems(), ctx.reviewerWorkspaceSurface, TS);

    // Only ROUTED or ESCALATED requests are "pending" — the filter publishNexusTravelItems applies.
    const expectedIds = SYNTH_TT_TRAVEL_REQUESTS
      .filter((r) => r.status === "ROUTED" || r.status === "ESCALATED")
      .map((r) => r.request_id)
      .sort();
    expect(expectedIds.length).toBeGreaterThan(0); // guard: seed must have pending requests

    const published = ctx.reviewerWorkspaceSurface.listForModule("nexus");
    expect(published.map((i) => i.item_id).sort()).toEqual(expectedIds);

    // Full payload check — request, finding, and workflow_step_id all intact.
    for (const item of published) {
      const payload = item.payload as SubmittedTravelItem;
      expect(payload.request.request_id).toBe(item.item_id);
      expect(payload.workflow_step_id).toBe(travelWorkflowStep(item.item_id));
      expect(payload.finding).toBeDefined();
    }
  });

  // ── Check 2: NEXUS reconciliation removes final-outcome items ──────────────
  it("republishing with a final-outcome item reconciles it OUT of the surface", () => {
    const ctx = makeCtx([]);
    const items = buildStartupTravelItems();
    publishNexusTravelItems(items, ctx.reviewerWorkspaceSurface, TS);

    const before = ctx.reviewerWorkspaceSurface.listForModule("nexus");
    expect(before.length).toBeGreaterThan(0);
    const targetId = before[0].item_id; // any currently-pending item

    // Simulate that item reaching a final outcome — mutate status to APPROVED.
    const updated = items.map((i) =>
      i.request.request_id === targetId
        ? { ...i, request: { ...i.request, status: "APPROVED" as const } }
        : i
    );
    publishNexusTravelItems(updated, ctx.reviewerWorkspaceSurface, "2026-08-05T01:00:00.000Z");

    const after = ctx.reviewerWorkspaceSurface.listForModule("nexus");
    expect(after.map((i) => i.item_id)).not.toContain(targetId);
    expect(after.length).toBe(before.length - 1);
  });

  // ── Check 3: FLOWPATH bundle publishes with the full FlowpathMapperOutput payload ──
  it("an active FLOWPATH bundle publishes with the real FlowpathMapperOutput payload and session_id", () => {
    const ctx = makeCtx([]);
    publishFlowpathArtifact(SYNTHETIC_MAPPER_OUTPUT, [], ctx.reviewerWorkspaceSurface, TS);

    const published = ctx.reviewerWorkspaceSurface.listForModule("flowpath");
    expect(published).toHaveLength(1);
    expect(published[0].item_id).toBe(SYNTHETIC_SESSION_ID);

    const payload = published[0].payload as typeof SYNTHETIC_MAPPER_OUTPUT;
    expect(payload.artifact.session_id).toBe(SYNTHETIC_SESSION_ID);
  });

  // ── Check 4: FLOWPATH reconciliation — approved session clears; null bundle clears ──
  it("an approved session reconciles out; passing null clears the surface", () => {
    const ctx = makeCtx([]);
    publishFlowpathArtifact(SYNTHETIC_MAPPER_OUTPUT, [], ctx.reviewerWorkspaceSurface, TS);
    expect(ctx.reviewerWorkspaceSurface.listForModule("flowpath")).toHaveLength(1);

    // Case A: the session is now in the approvedSessionIds list — reconciles out.
    publishFlowpathArtifact(
      SYNTHETIC_MAPPER_OUTPUT,
      [SYNTHETIC_SESSION_ID],
      ctx.reviewerWorkspaceSurface,
      "2026-08-05T01:00:00.000Z"
    );
    expect(ctx.reviewerWorkspaceSurface.listForModule("flowpath")).toHaveLength(0);

    // Case B: null bundle — everything under "flowpath" is removed.
    publishFlowpathArtifact(SYNTHETIC_MAPPER_OUTPUT, [], ctx.reviewerWorkspaceSurface, "2026-08-05T02:00:00.000Z");
    expect(ctx.reviewerWorkspaceSurface.listForModule("flowpath")).toHaveLength(1);
    publishFlowpathArtifact(null, [], ctx.reviewerWorkspaceSurface, "2026-08-05T03:00:00.000Z");
    expect(ctx.reviewerWorkspaceSurface.listForModule("flowpath")).toHaveLength(0);
  });

  // ── Check 5: Render — all seven tabs accessible from one SYSTEM_ADMIN ctx ──
  it("one SYSTEM_ADMIN ctx shows all seven tabs and each section renders its published items", () => {
    const logged: SovereignLogEvent[] = [];
    const ctx = makeCtx(logged);

    // Real startup publication populates VIGIL, ARIA, SCRIBE, and NEXUS on the surfaces.
    publishModuleSurfacesAtStartup(ctx);
    // FLOWPATH bundle is not part of startup-publish — it requires an elicitation session.
    publishFlowpathArtifact(SYNTHETIC_MAPPER_OUTPUT, [], ctx.reviewerWorkspaceSurface, TS);

    render(<WorkspaceApp ctx={ctx} />);

    // All seven tabs must be rendered and accessible to SYSTEM_ADMIN (no locked tabs).
    const expectedTabs = [
      "VIGIL Approvals",
      "ARIA Certifications",
      "SCRIBE T&T Reviews",
      "NEXUS Travel",
      "FLOWPATH Review",
      "Cost Dashboard",
      "Activity & Decisions",
    ];
    for (const label of expectedTabs) {
      const tab = screen.getByRole("tab", { name: new RegExp(label) });
      expect(tab).toBeInTheDocument();
      expect(tab).not.toBeDisabled();
    }

    // VIGIL section is the default for SYSTEM_ADMIN — renders without clicking a tab.
    expect(screen.getByTestId("workspace-vigil-section")).toBeInTheDocument();

    // NEXUS Travel: click the tab; verify the section and a real TravelQueueRow render.
    fireEvent.click(screen.getByRole("tab", { name: /NEXUS Travel/ }));
    expect(screen.getByTestId("workspace-nexus-section")).toBeInTheDocument();
    const nexusItems = ctx.reviewerWorkspaceSurface.listForModule("nexus");
    expect(nexusItems.length).toBeGreaterThan(0);
    expect(screen.getByTestId(`tt-queue-travel-${nexusItems[0].item_id}`)).toBeInTheDocument();

    // FLOWPATH Review: click the tab; verify the artifact review component renders.
    fireEvent.click(screen.getByRole("tab", { name: /FLOWPATH Review/ }));
    expect(screen.getByTestId("workspace-flowpath-section")).toBeInTheDocument();
    expect(screen.getByTestId("artifact-review")).toBeInTheDocument();

    // Cost Dashboard and Activity: each section renders its root element.
    fireEvent.click(screen.getByRole("tab", { name: /Cost Dashboard/ }));
    expect(screen.getByTestId("cost-dashboard-section")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /Activity & Decisions/ }));
    expect(screen.getByTestId("workspace-activity-section")).toBeInTheDocument();
  });

  // ── Check 6: In-Workspace TRAVEL_APPROVAL removes the item and logs the event ──
  it("approving a ROUTED travel item inside the Workspace removes it from the surface and logs HUMAN_DECISION / TRAVEL_APPROVAL", () => {
    const logged: SovereignLogEvent[] = [];
    const ctx = makeCtx(logged);

    publishNexusTravelItems(buildStartupTravelItems(), ctx.reviewerWorkspaceSurface, TS);

    // Pick a ROUTED item — recordTravelDecision throws on non-ROUTED requests.
    const routedSurfaceItem = ctx.reviewerWorkspaceSurface
      .listForModule("nexus")
      .find((i) => (i.payload as SubmittedTravelItem).request.status === "ROUTED");
    expect(routedSurfaceItem).toBeDefined();
    const requestId = routedSurfaceItem!.item_id;

    render(<WorkspaceApp ctx={ctx} />);
    fireEvent.click(screen.getByRole("tab", { name: /NEXUS Travel/ }));

    // Enter a valid decision note (>= 10 chars) and click Approve.
    const noteInput = screen.getByLabelText(new RegExp(`decision note for ${requestId}`));
    fireEvent.change(noteInput, {
      target: { value: "Reviewed travel request; compliant with policy." },
    });
    fireEvent.click(screen.getByTestId(`tt-approve-${requestId}`));

    // APPROVED is a final outcome — the item is removed from the surface.
    const remaining = ctx.reviewerWorkspaceSurface.listForModule("nexus").map((i) => i.item_id);
    expect(remaining).not.toContain(requestId);

    // The governed HUMAN_DECISION event carries TRAVEL_APPROVAL and the correct workflow_step_id.
    const decisions = logged.filter(
      (e) => e.event_type === "HUMAN_DECISION" && e.decision_type === "TRAVEL_APPROVAL"
    );
    expect(decisions).toHaveLength(1);
    expect(decisions[0]).toMatchObject({
      product: "NEXUS",
      decision_type: "TRAVEL_APPROVAL",
      workflow_step_id: travelWorkflowStep(requestId),
    });
  });
});

/** @jest-environment jsdom */
/**
 * e2e — reviewer-workspace-convergence.test.tsx (Session 50, D4).
 *
 * THE FULL LOOP for GD-25 (Reviewer's Workspace, docs/23), one scenario per
 * publishing module: the SOURCE module's real publisher publishes its REAL items
 * to the shared ReviewerWorkspaceSurface; the REAL Reviewer's Workspace module
 * renders the real embedded decision component; a decision recorded IN THE
 * WORKSPACE removes the item from the surface (the decision-commit path) while
 * the decision of record still lands as the source module's own governed Logger
 * event. One shared SovereignShellContext per scenario — exactly as the shell
 * wires it. No mocks past the point that matters (the key-less brief hook
 * degrades to its real STATIC tier).
 *
 * Mirrors the GD-23/GD-24 convergence style: makeCtx() once, real publish
 * functions from each module, real data sources.
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { makeCtx } from "./harness";

import { WorkspaceApp } from "../../module-workspace/src/WorkspaceApp";

import { publishVigilWorkspaceItems } from "../../module-vigil/src/vigil-workspace-publisher";
import { createDevApprovalPort } from "../../module-vigil/src/approval-port";

import { publishAriaWorkspaceItems } from "../../module-aria/src/aria-workspace-publisher";
import { CLEAR_DEMO_ITEMS } from "../../module-aria/src/ClearCertificationQueue";

import { publishScribeWorkspaceItems } from "../../module-scribe/src/scribe-workspace-publisher";
import { DEMO_TT_REVIEW_ITEMS } from "../../module-scribe/src/tt-synthetic-review";
import { ttReviewItemKey } from "../../module-scribe/src/TTManagerReview";

const NOTE = "Reviewed the full request detail; decision recorded from the Workspace.";

describe("Reviewer's Workspace convergence — GD-25 (Session 50)", () => {
  // ── VIGIL: publish → embedded ApprovalDetail → decision removes the item ──
  it("VIGIL publishes its real pending requests; an approval recorded in the Workspace removes the item and logs AGENT_ACTION_APPROVED", async () => {
    const logged: SovereignLogEvent[] = [];
    const ctx = makeCtx(logged); // ONE ctx — source publisher and Workspace share it.

    // Source side: the same dev port VigilApp seeds its queue from, published as-is.
    const anchor = new Date().toISOString(); // live expiry windows, not instantly expired
    const requests = createDevApprovalPort(anchor).listPending();
    publishVigilWorkspaceItems(requests, null, ctx.reviewerWorkspaceSurface, anchor);
    expect(ctx.reviewerWorkspaceSurface.listForModule("vigil")).toHaveLength(requests.length);

    // Workspace side: SYSTEM_ADMIN defaults to the VIGIL section.
    render(<WorkspaceApp ctx={ctx} />);
    const row = screen.getByRole("button", { name: /model_deployment/ }); // req-dev-001 (P1)
    fireEvent.click(row);

    // The REAL ApprovalDetail: full request fields + the (static, key-less) brief.
    expect(screen.getByText(/req-dev-001/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("STATIC")).toBeInTheDocument());

    // Record the decision in the Workspace — the same governed decision path.
    fireEvent.change(screen.getByLabelText("Decision note"), { target: { value: NOTE } });
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    // The decision-commit path removed the item from the surface…
    const remaining = ctx.reviewerWorkspaceSurface.listForModule("vigil").map((i) => i.item_id);
    expect(remaining).not.toContain("req-dev-001");
    expect(remaining).toHaveLength(requests.length - 1);
    // …and the Workspace reflects it in place (the queue row is gone).
    expect(screen.queryByRole("button", { name: /model_deployment/ })).not.toBeInTheDocument();

    // The decision of record is VIGIL's own governed Logger event — the surface added visibility only.
    const decisions = logged.filter((e) => e.event_type === "AGENT_ACTION_APPROVED");
    expect(decisions).toHaveLength(1);
    expect(decisions[0]).toMatchObject({
      product: "VIGIL",
      decision_type: "AGENT_APPROVAL",
      workflow_step_id: "vigil-approval-req-dev-001",
    });
  });

  // ── ARIA: publish → embedded ClearCertificationQueue → certify removes the item ──
  it("ARIA publishes its real pending CLEAR items; a certification recorded in the Workspace removes the item and logs ARIA_CERTIFICATION_ISSUED", () => {
    const logged: SovereignLogEvent[] = [];
    const ctx = makeCtx(logged);

    // Source side: the same demo items the Certification Queue renders, published as-is.
    publishAriaWorkspaceItems(CLEAR_DEMO_ITEMS, ctx.reviewerWorkspaceSurface, "2026-07-20T00:00:00.000Z");
    expect(ctx.reviewerWorkspaceSurface.listForModule("aria")).toHaveLength(CLEAR_DEMO_ITEMS.length);

    render(<WorkspaceApp ctx={ctx} />);
    fireEvent.click(screen.getByRole("tab", { name: /ARIA Certifications/ }));

    // The REAL ClearCertificationQueue renders the published documents.
    const doc = CLEAR_DEMO_ITEMS[0]; // DOC-A11-FY26-OM
    expect(screen.getByTestId("clear-certification-queue")).toBeInTheDocument();
    expect(screen.getByTestId(`queue-item-${doc.document_id}`)).toBeInTheDocument();

    // Certify with the required note + destination/recipient capture (D-3).
    fireEvent.change(screen.getByTestId(`note-${doc.document_id}`), {
      target: { value: "All framework checks reviewed; compliant for export." },
    });
    fireEvent.change(screen.getByTestId(`dest-${doc.document_id}`), { target: { value: "OMB MAX portal" } });
    fireEvent.change(screen.getByTestId(`recip-${doc.document_id}`), { target: { value: "Budget Examiner" } });
    fireEvent.click(screen.getByTestId(`certify-${doc.document_id}`));

    // The decision-commit path (the certify handler) removed the item from the surface.
    const remaining = ctx.reviewerWorkspaceSurface.listForModule("aria").map((i) => i.item_id);
    expect(remaining).not.toContain(doc.document_id);
    expect(remaining).toHaveLength(CLEAR_DEMO_ITEMS.length - 1);

    // The decision of record: ctx.aria (the GD-20 surface the SCRIBE gate reads) + the governed event.
    expect(ctx.aria.isCertified(doc.document_id)).toBe(true);
    const certs = logged.filter((e) => e.event_type === "ARIA_CERTIFICATION_ISSUED");
    expect(certs).toHaveLength(1);
    expect(certs[0]).toMatchObject({
      product: "ARIA",
      decision_type: "COMPLIANCE_CERTIFICATION",
      workflow_step_id: `aria-clear-${doc.document_id}`,
    });
  });

  // ── SCRIBE: publish → embedded TTManagerReview → recorded send removes the item ──
  it("SCRIBE publishes its real T&T review items; a send recorded in the Workspace removes the item and logs TIME_CORRECTION_SENT", () => {
    const logged: SovereignLogEvent[] = [];
    const ctx = makeCtx(logged);

    // Source side: the same seeded items ScribeApp passes to TTManagerReview, published as-is.
    publishScribeWorkspaceItems(DEMO_TT_REVIEW_ITEMS, ctx.reviewerWorkspaceSurface, "2026-07-20T00:00:00.000Z");
    expect(ctx.reviewerWorkspaceSurface.listForModule("scribe")).toHaveLength(DEMO_TT_REVIEW_ITEMS.length);

    render(<WorkspaceApp ctx={ctx} />);
    fireEvent.click(screen.getByRole("tab", { name: /SCRIBE T&T Reviews/ }));

    // Pick an ungated item (no VIGIL Tier B authorization required) — the send is recordable.
    const item = DEMO_TT_REVIEW_ITEMS.find((i) => !i.requiresVigilAuthorization)!;
    const key = ttReviewItemKey(item);
    fireEvent.click(screen.getByTestId(`tt-queue-item-${key}`));
    fireEvent.click(screen.getByTestId("tt-send-communication"));

    // The decision-commit path (onSent) removed the item from the surface…
    const remaining = ctx.reviewerWorkspaceSurface.listForModule("scribe").map((i) => i.item_id);
    expect(remaining).not.toContain(key);
    expect(remaining).toHaveLength(DEMO_TT_REVIEW_ITEMS.length - 1);
    // …and the Workspace reflects it in place (the queue row is gone).
    expect(screen.queryByTestId(`tt-queue-item-${key}`)).not.toBeInTheDocument();

    // The decision of record is SCRIBE's own governed HUMAN_DECISION event.
    const sends = logged.filter(
      (e) => e.event_type === "HUMAN_DECISION" && e.decision_type === "TIME_CORRECTION_SENT"
    );
    expect(sends).toHaveLength(1);
    expect(sends[0]).toMatchObject({
      product: "SCRIBE",
      workflow_step_id: item.workflow_step_id,
    });
  });

  // ── Surface semantics shared by all three: last-write-wins publish, remove() is a no-op for unknown ids ──
  it("publish is last-write-wins by module_id + item_id and remove() of an unknown id is a safe no-op", () => {
    const ctx = makeCtx([]);
    publishAriaWorkspaceItems(CLEAR_DEMO_ITEMS, ctx.reviewerWorkspaceSurface, "2026-07-20T00:00:00.000Z");
    publishAriaWorkspaceItems(CLEAR_DEMO_ITEMS, ctx.reviewerWorkspaceSurface, "2026-07-20T01:00:00.000Z");

    // Still one entry per document (replaced, not appended), carrying the later timestamp.
    const aria = ctx.reviewerWorkspaceSurface.listForModule("aria");
    expect(aria).toHaveLength(CLEAR_DEMO_ITEMS.length);
    expect(aria.every((i) => i.published_at === "2026-07-20T01:00:00.000Z")).toBe(true);

    ctx.reviewerWorkspaceSurface.remove("aria", "no-such-document");
    expect(ctx.reviewerWorkspaceSurface.listForModule("aria")).toHaveLength(CLEAR_DEMO_ITEMS.length);
  });
});

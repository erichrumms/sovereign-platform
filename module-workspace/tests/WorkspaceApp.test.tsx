/** @jest-environment jsdom */
/**
 * module-workspace — WorkspaceApp per-section gating + embed tests (GD-25, Session 50).
 *
 * Per-section gating reuses the AriaApp TAB_ROLES shape (docs/23 §3):
 *   VIGIL Approvals     → PLATFORM_ADMIN, SYSTEM_ADMIN
 *   ARIA Certifications → COMPLIANCE_OFFICER + admins
 *   SCRIBE T&T Reviews  → PROGRAM_MANAGER, ANALYST + admins
 * A role without access sees the tab disabled with an honest tooltip (the
 * LockedSectionNotice standard). The five roles asserted here are the five
 * live-tested this evening (Session 49 role-visibility set).
 *
 * The embed test proves the ARIA panel renders the REAL ClearCertificationQueue
 * against a published payload and that its decide() removes the item from the
 * ReviewerWorkspaceSurface (the GD-25 decision-commit path).
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { WorkspaceApp } from "../src/WorkspaceApp";
import { CLEAR_DEMO_ITEMS } from "../../module-aria/src/ClearCertificationQueue";
import { createDevApprovalPort } from "../../module-vigil/src/approval-port";
import { VIGIL_WORKSPACE_MODULE_ID } from "../../module-vigil/src/vigil-workspace-publisher";
import {
  ensureVigilApprovalSession,
  resetVigilApprovalSessionForTests,
} from "../../module-vigil/src/vigil-approval-session";
import { DEMO_TT_REVIEW_ITEMS } from "../../module-scribe/src/tt-synthetic-review";
import { SCRIBE_WORKSPACE_MODULE_ID } from "../../module-scribe/src/scribe-workspace-publisher";
import { ttReviewItemKey } from "../../module-scribe/src/TTManagerReview";
import { resetScribeSessionForTests } from "../../module-scribe/src/scribe-sent-session";
import { makeCtx, createInMemoryReviewerWorkspaceSurface } from "./test-helpers";

function tab(name: RegExp): HTMLElement {
  return screen.getByRole("tab", { name });
}

describe("WorkspaceApp per-section gating (docs/23 §3 — the AriaApp TAB_ROLES shape)", () => {
  it("PLATFORM_ADMIN sees all three sections enabled", () => {
    render(<WorkspaceApp ctx={makeCtx({ role: "PLATFORM_ADMIN" })} />);
    expect(tab(/VIGIL Approvals/)).toBeEnabled();
    expect(tab(/ARIA Certifications/)).toBeEnabled();
    expect(tab(/SCRIBE T&T Reviews/)).toBeEnabled();
  });

  it("SYSTEM_ADMIN sees all three sections enabled, defaulting to VIGIL Approvals", () => {
    render(<WorkspaceApp ctx={makeCtx({ role: "SYSTEM_ADMIN" })} />);
    expect(tab(/VIGIL Approvals/)).toBeEnabled();
    expect(tab(/VIGIL Approvals/)).toHaveAttribute("aria-selected", "true");
    expect(tab(/ARIA Certifications/)).toBeEnabled();
    expect(tab(/SCRIBE T&T Reviews/)).toBeEnabled();
  });

  it("COMPLIANCE_OFFICER sees only ARIA Certifications enabled (and lands there)", () => {
    render(<WorkspaceApp ctx={makeCtx({ role: "COMPLIANCE_OFFICER" })} />);
    expect(tab(/VIGIL Approvals/)).toBeDisabled();
    expect(tab(/VIGIL Approvals/)).toHaveAttribute(
      "title",
      expect.stringContaining("requires role: PLATFORM_ADMIN / SYSTEM_ADMIN")
    );
    expect(tab(/ARIA Certifications/)).toBeEnabled();
    expect(tab(/ARIA Certifications/)).toHaveAttribute("aria-selected", "true");
    expect(tab(/SCRIBE T&T Reviews/)).toBeDisabled();
  });

  it("PROGRAM_MANAGER sees only SCRIBE T&T Reviews enabled (and lands there)", () => {
    render(<WorkspaceApp ctx={makeCtx({ role: "PROGRAM_MANAGER" })} />);
    expect(tab(/VIGIL Approvals/)).toBeDisabled();
    expect(tab(/ARIA Certifications/)).toBeDisabled();
    expect(tab(/ARIA Certifications/)).toHaveAttribute(
      "title",
      expect.stringContaining("requires role: COMPLIANCE_OFFICER")
    );
    expect(tab(/SCRIBE T&T Reviews/)).toBeEnabled();
    expect(tab(/SCRIBE T&T Reviews/)).toHaveAttribute("aria-selected", "true");
  });

  it("ANALYST sees only SCRIBE T&T Reviews enabled (and lands there)", () => {
    render(<WorkspaceApp ctx={makeCtx({ role: "ANALYST" })} />);
    expect(tab(/VIGIL Approvals/)).toBeDisabled();
    expect(tab(/ARIA Certifications/)).toBeDisabled();
    expect(tab(/SCRIBE T&T Reviews/)).toBeEnabled();
    expect(tab(/SCRIBE T&T Reviews/)).toHaveAttribute("aria-selected", "true");
  });

  it("shows the honest empty state when a source module has published nothing", () => {
    render(<WorkspaceApp ctx={makeCtx({ role: "SYSTEM_ADMIN" })} />);
    expect(screen.getByTestId("workspace-empty-section")).toHaveTextContent(
      /VIGIL has published no pending approval requests this session/
    );
  });
});

describe("WorkspaceApp VIGIL embed — real component, published payload, decision-commit removal", () => {
  it("renders the real ApprovalDetail from a published item and removes it on approve", async () => {
    const surface = createInMemoryReviewerWorkspaceSurface();
    const logged: SovereignLogEvent[] = [];
    const anchor = "2026-07-20T00:00:00.000Z";
    const [request] = createDevApprovalPort(anchor).listPending(); // req-dev-001, model_deployment P1
    surface.publish({
      module_id: VIGIL_WORKSPACE_MODULE_ID,
      item_id: request.request_id,
      payload: { request },
      published_at: anchor,
    });
    const ctx = makeCtx({ role: "SYSTEM_ADMIN", reviewerWorkspaceSurface: surface, logSink: logged });

    render(<WorkspaceApp ctx={ctx} />);

    // SYSTEM_ADMIN defaults to the VIGIL section; the real ApprovalQueue renders the request.
    const row = screen.getByRole("button", { name: /model_deployment/ });
    fireEvent.click(row);

    // Wait for the static (key-less) brief to appear before the decision panel is active.
    await waitFor(() => expect(screen.getByText("STATIC")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Decision note"), {
      target: { value: "Reviewed the full request detail; approving from the Workspace." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    // The GD-25 decision-commit path: the decided item left the Workspace surface.
    expect(surface.listForModule(VIGIL_WORKSPACE_MODULE_ID)).toHaveLength(0);
    // The decision of record is VIGIL's own governed Logger event.
    const decisions = logged.filter((e) => e.event_type === "AGENT_ACTION_APPROVED");
    expect(decisions).toHaveLength(1);
    expect(decisions[0]).toMatchObject({ product: "VIGIL", decision_type: "AGENT_APPROVAL" });
    // The Workspace reflects the removal in place — back to the honest empty state.
    expect(screen.getByTestId("workspace-empty-section")).toBeInTheDocument();
  });
});

describe("WorkspaceApp SCRIBE embed — real component, published payload, decision-commit removal", () => {
  it("renders the real TTManagerReview from a published item and removes it on send", () => {
    const surface = createInMemoryReviewerWorkspaceSurface();
    const logged: SovereignLogEvent[] = [];
    const item = DEMO_TT_REVIEW_ITEMS.find((i) => !i.requiresVigilAuthorization)!;
    const key = ttReviewItemKey(item);
    surface.publish({
      module_id: SCRIBE_WORKSPACE_MODULE_ID,
      item_id: key,
      payload: item,
      published_at: "2026-07-20T00:00:00.000Z",
    });
    const ctx = makeCtx({ role: "PROGRAM_MANAGER", reviewerWorkspaceSurface: surface, logSink: logged });

    render(<WorkspaceApp ctx={ctx} />);
    fireEvent.click(screen.getByRole("tab", { name: /SCRIBE T&T Reviews/ }));

    // The real TTManagerReview renders the published item.
    expect(screen.getByTestId("tt-manager-review")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(`tt-queue-item-${key}`));
    fireEvent.click(screen.getByTestId("tt-send-communication"));

    // The GD-25 decision-commit path: the decided item left the Workspace surface.
    expect(surface.listForModule(SCRIBE_WORKSPACE_MODULE_ID)).toHaveLength(0);
    // The decision of record is SCRIBE's own governed Logger event.
    const sends = logged.filter(
      (e) => e.event_type === "HUMAN_DECISION" && e.decision_type === "TIME_CORRECTION_SENT"
    );
    expect(sends).toHaveLength(1);
    // The Workspace reflects the removal in place — back to the honest empty state.
    expect(screen.getByTestId("workspace-empty-section")).toBeInTheDocument();
  });
});

describe("WorkspaceApp ARIA embed — real component, published payload, decision-commit removal", () => {
  it("renders the real ClearCertificationQueue from a published item and removes it on certify", () => {
    const surface = createInMemoryReviewerWorkspaceSurface();
    const item = CLEAR_DEMO_ITEMS[0];
    surface.publish({
      module_id: "aria",
      item_id: item.document_id,
      payload: item,
      published_at: "2026-07-20T00:00:00.000Z",
    });
    const ctx = makeCtx({ role: "COMPLIANCE_OFFICER", reviewerWorkspaceSurface: surface });

    render(<WorkspaceApp ctx={ctx} />);

    // The REAL ClearCertificationQueue renders the published document.
    expect(screen.getByTestId("clear-certification-queue")).toBeInTheDocument();
    expect(screen.getByTestId(`queue-item-${item.document_id}`)).toBeInTheDocument();

    // Certify with the required note + destination/recipient capture (D-3).
    fireEvent.change(screen.getByTestId(`note-${item.document_id}`), {
      target: { value: "Reviewed all findings; compliant for export." },
    });
    fireEvent.change(screen.getByTestId(`dest-${item.document_id}`), {
      target: { value: "OMB MAX portal" },
    });
    fireEvent.change(screen.getByTestId(`recip-${item.document_id}`), {
      target: { value: "Budget Examiner" },
    });
    fireEvent.click(screen.getByTestId(`certify-${item.document_id}`));

    // The GD-25 decision-commit path: the decided item left the Workspace surface.
    expect(surface.listForModule("aria")).toHaveLength(0);
    // The decision of record went to ctx.aria (GD-20) — the surface added visibility only.
    expect(ctx.aria.isCertified(item.document_id)).toBe(true);
    // The Workspace reflects the removal in place: back to the honest empty state.
    expect(screen.getByTestId("workspace-empty-section")).toBeInTheDocument();
  });
});

describe("WorkspaceApp WG-16 — VIGIL section republishes Pending Approvals count after decision", () => {
  beforeEach(() => resetVigilApprovalSessionForTests());

  it("workQueueSurface Pending Approvals count decrements when an approval decision is made", async () => {
    const surface = createInMemoryReviewerWorkspaceSurface();
    const logged: SovereignLogEvent[] = [];
    const ctx = makeCtx({ role: "SYSTEM_ADMIN", reviewerWorkspaceSurface: surface, logSink: logged });

    // Seed the shared session with 5 requests, including req-dev-001 (P1, model_deployment).
    ensureVigilApprovalSession(ctx.logger);

    const anchor = "2026-07-22T00:00:00.000Z";
    const [request] = createDevApprovalPort(anchor).listPending();
    surface.publish({
      module_id: VIGIL_WORKSPACE_MODULE_ID,
      item_id: request.request_id,
      payload: { request },
      published_at: anchor,
    });

    render(<WorkspaceApp ctx={ctx} />);

    // WG-16 effect fires on mount: getVigilApprovalSession() has 5 requests → count = 5.
    const initialApprovals = ctx.workQueueSurface
      .listForModule("vigil")
      .find((q) => q.queue_label === "Pending Approvals")!;
    expect(initialApprovals.count).toBe(5);

    // Approve the request — mirrors the existing VIGIL embed test interaction.
    fireEvent.click(screen.getByRole("button", { name: /model_deployment/ }));
    await waitFor(() => expect(screen.getByText("STATIC")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Decision note"), {
      target: { value: "Approved for WG-16 republish test." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    // After decision: removeVigilSessionRequest reduced the session to 4 requests.
    // The WG-16 effect re-ran and republished the updated count.
    const updatedApprovals = ctx.workQueueSurface
      .listForModule("vigil")
      .find((q) => q.queue_label === "Pending Approvals")!;
    expect(updatedApprovals.count).toBe(4);
  });
});

describe("WorkspaceApp WG-16 — ARIA section republishes Certifications count after decision", () => {
  it("workQueueSurface Certifications Awaiting You count decrements when an ARIA item is certified", () => {
    const surface = createInMemoryReviewerWorkspaceSurface();
    const item = CLEAR_DEMO_ITEMS[0];
    surface.publish({
      module_id: "aria",
      item_id: item.document_id,
      payload: item,
      published_at: "2026-07-22T00:00:00.000Z",
    });
    const ctx = makeCtx({ role: "COMPLIANCE_OFFICER", reviewerWorkspaceSurface: surface });

    render(<WorkspaceApp ctx={ctx} />);

    // WG-16 effect fires on mount: 1 ARIA item in section → count = 1.
    const initialCerts = ctx.workQueueSurface
      .listForModule("aria")
      .find((q) => q.queue_label === "Certifications Awaiting You")!;
    expect(initialCerts.count).toBe(1);

    // Certify the item — mirrors the existing ARIA embed test interaction.
    fireEvent.change(screen.getByTestId(`note-${item.document_id}`), {
      target: { value: "Reviewed all findings; compliant for export." },
    });
    fireEvent.change(screen.getByTestId(`dest-${item.document_id}`), {
      target: { value: "OMB MAX portal" },
    });
    fireEvent.change(screen.getByTestId(`recip-${item.document_id}`), {
      target: { value: "Budget Examiner" },
    });
    fireEvent.click(screen.getByTestId(`certify-${item.document_id}`));

    // After certification: section is empty → WG-16 effect republishes count = 0.
    const updatedCerts = ctx.workQueueSurface
      .listForModule("aria")
      .find((q) => q.queue_label === "Certifications Awaiting You")!;
    expect(updatedCerts.count).toBe(0);
  });
});

describe("WorkspaceApp WG-16 — SCRIBE section republishes T&T Review count after send decision", () => {
  beforeEach(() => resetScribeSessionForTests());

  it("workQueueSurface T&T Reviews Awaiting You count decrements when a review item is sent", () => {
    const surface = createInMemoryReviewerWorkspaceSurface();
    const item = DEMO_TT_REVIEW_ITEMS.find((i) => !i.requiresVigilAuthorization)!;
    const key = ttReviewItemKey(item);
    surface.publish({
      module_id: SCRIBE_WORKSPACE_MODULE_ID,
      item_id: key,
      payload: item,
      published_at: "2026-07-22T00:00:00.000Z",
    });
    const ctx = makeCtx({ role: "PROGRAM_MANAGER", reviewerWorkspaceSurface: surface });

    render(<WorkspaceApp ctx={ctx} />);
    fireEvent.click(screen.getByRole("tab", { name: /SCRIBE T&T Reviews/ }));

    // WG-16 effect fires: 1 SCRIBE item in section → count = 1.
    const initialReviews = ctx.workQueueSurface
      .listForModule("scribe")
      .find((q) => q.queue_label === "T&T Reviews Awaiting You")!;
    expect(initialReviews.count).toBe(1);

    // Send the item — mirrors the existing SCRIBE embed test interaction.
    fireEvent.click(screen.getByTestId(`tt-queue-item-${key}`));
    fireEvent.click(screen.getByTestId("tt-send-communication"));

    // After send: section is empty → WG-16 effect republishes count = 0.
    const updatedReviews = ctx.workQueueSurface
      .listForModule("scribe")
      .find((q) => q.queue_label === "T&T Reviews Awaiting You")!;
    expect(updatedReviews.count).toBe(0);
  });
});

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
import { render, screen, fireEvent } from "@testing-library/react";

import { WorkspaceApp } from "../src/WorkspaceApp";
import { CLEAR_DEMO_ITEMS } from "../../module-aria/src/ClearCertificationQueue";
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

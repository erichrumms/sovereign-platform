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

describe("WorkspaceApp Activity & Decisions tab (GD-28 / Session 58)", () => {
  it("Activity & Decisions tab is accessible to all roles (no gate)", () => {
    const roles = ["PLATFORM_ADMIN", "SYSTEM_ADMIN", "COMPLIANCE_OFFICER", "PROGRAM_MANAGER", "ANALYST"] as const;
    for (const role of roles) {
      const { unmount } = render(<WorkspaceApp ctx={makeCtx({ role })} />);
      expect(tab(/Activity & Decisions/)).toBeEnabled();
      unmount();
    }
  });

  it("shows per-user decisions by default (actor_name filter)", () => {
    const logged: SovereignLogEvent[] = [
      {
        event_type: "HUMAN_DECISION",
        workflow_step_id: "act-test-1",
        sovereign_tier: "standard",
        product: "VIGIL",
        actor_id: "E-950",
        actor_name: "Riley Reviewer",
        decision_type: "AGENT_APPROVAL",
        outcome: "APPROVED",
        actor: "human",
        payload: {},
      },
      {
        event_type: "HUMAN_DECISION",
        workflow_step_id: "act-test-2",
        sovereign_tier: "standard",
        product: "ARIA",
        actor_id: "E-999",
        actor_name: "Other User",
        decision_type: "HUMAN_DENIAL",
        outcome: "DENIED",
        actor: "human",
        payload: {},
      },
    ];
    const ctx = makeCtx({ role: "SYSTEM_ADMIN", logSink: logged });
    render(<WorkspaceApp ctx={ctx} />);
    fireEvent.click(tab(/Activity & Decisions/));

    expect(screen.getByTestId("workspace-activity-section")).toBeInTheDocument();
    // Riley Reviewer's entry is shown; Other User's entry is hidden.
    expect(screen.getByText(/AGENT APPROVAL/)).toBeInTheDocument();
    expect(screen.queryByText(/Other User/)).not.toBeInTheDocument();
  });

  it("states the session-scope limit plainly in the Activity tab", () => {
    render(<WorkspaceApp ctx={makeCtx({ role: "COMPLIANCE_OFFICER" })} />);
    fireEvent.click(tab(/Activity & Decisions/));
    const disclosure = screen.getByTestId("activity-scope-disclosure");
    expect(disclosure).toBeInTheDocument();
    expect(disclosure).toHaveTextContent(/session/i);
    expect(disclosure).toHaveTextContent(/in-memory/i);
  });

  it("admin toggle is visible to PLATFORM_ADMIN and switches to all-entries view", () => {
    const logged: SovereignLogEvent[] = [
      {
        event_type: "HUMAN_DECISION",
        workflow_step_id: "act-test-3",
        sovereign_tier: "standard",
        product: "ARIA",
        actor_id: "E-999",
        actor_name: "Other Person",
        decision_type: "HUMAN_DENIAL",
        outcome: "DENIED",
        actor: "human",
        payload: {},
      },
    ];
    const ctx = makeCtx({ role: "PLATFORM_ADMIN", logSink: logged });
    render(<WorkspaceApp ctx={ctx} />);
    fireEvent.click(tab(/Activity & Decisions/));

    // Default: no entries for Riley Reviewer — Other Person's entry is hidden.
    expect(screen.queryByText(/Other Person/)).not.toBeInTheDocument();

    // Toggle to show all entries.
    fireEvent.click(screen.getByTestId("activity-admin-toggle"));
    expect(screen.getByText(/Other Person/)).toBeInTheDocument();
  });

  it("admin toggle is not visible to non-admin roles", () => {
    render(<WorkspaceApp ctx={makeCtx({ role: "COMPLIANCE_OFFICER" })} />);
    fireEvent.click(tab(/Activity & Decisions/));
    expect(screen.queryByTestId("activity-admin-toggle")).not.toBeInTheDocument();
  });

  it("activity badge reflects the current user's decision count (actor_name filter)", () => {
    const logged: SovereignLogEvent[] = [
      {
        event_type: "HUMAN_DECISION",
        workflow_step_id: "act-badge-1",
        sovereign_tier: "standard",
        product: "VIGIL",
        actor_id: "E-950",
        actor_name: "Riley Reviewer",
        decision_type: "AGENT_APPROVAL",
        outcome: "APPROVED",
        actor: "human",
        payload: {},
      },
      {
        // Non-human event without actor_name — should not count toward the badge.
        event_type: "AGENT_STEP_START",
        workflow_step_id: "act-badge-2",
        sovereign_tier: "standard",
        product: "VIGIL",
        actor_id: "agent-1",
        outcome: "STARTED",
        payload: {},
      },
    ];
    const ctx = makeCtx({ role: "SYSTEM_ADMIN", logSink: logged });
    render(<WorkspaceApp ctx={ctx} />);

    const tabs = screen.getAllByRole("tab");
    const activityTab = tabs.find((t) => /Activity & Decisions/.test(t.textContent ?? ""))!;
    // Badge = 1: only the HUMAN_DECISION where actor_name === "Riley Reviewer".
    expect(activityTab.querySelector("span")?.textContent).toBe("1");
  });
});

describe("WorkspaceApp Cost Dashboard (GD-32 / docs/32)", () => {
  it("Cost Dashboard tab is enabled for SYSTEM_ADMIN and PLATFORM_ADMIN, disabled for others", () => {
    const adminRoles = ["SYSTEM_ADMIN", "PLATFORM_ADMIN"] as const;
    for (const role of adminRoles) {
      const { unmount } = render(<WorkspaceApp ctx={makeCtx({ role })} />);
      expect(tab(/Cost Dashboard/)).toBeEnabled();
      unmount();
    }
    const noAccessRoles = ["COMPLIANCE_OFFICER", "PROGRAM_MANAGER", "ANALYST"] as const;
    for (const role of noAccessRoles) {
      const { unmount } = render(<WorkspaceApp ctx={makeCtx({ role })} />);
      expect(tab(/Cost Dashboard/)).toBeDisabled();
      expect(tab(/Cost Dashboard/)).toHaveAttribute(
        "title",
        expect.stringContaining("requires role: PLATFORM_ADMIN / SYSTEM_ADMIN")
      );
      unmount();
    }
  });

  it("shows the session-scope disclosure banner matching the Activity tab's pattern", () => {
    render(<WorkspaceApp ctx={makeCtx({ role: "SYSTEM_ADMIN" })} />);
    fireEvent.click(tab(/Cost Dashboard/));
    const disclosure = screen.getByTestId("cost-scope-disclosure");
    expect(disclosure).toBeInTheDocument();
    expect(disclosure).toHaveTextContent(/session-scoped only/i);
    expect(disclosure).toHaveTextContent(/in-memory/i);
  });

  it("shows the GD-31/GD-35 coverage disclosure grounded in actual facts (14 in-scope sites, 4 non-model + 3 COUNSEL excluded)", () => {
    render(<WorkspaceApp ctx={makeCtx({ role: "SYSTEM_ADMIN" })} />);
    fireEvent.click(tab(/Cost Dashboard/));
    const coverage = screen.getByTestId("cost-coverage-disclosure");
    expect(coverage).toBeInTheDocument();
    expect(coverage).toHaveTextContent(/GD-31/);
    expect(coverage).toHaveTextContent(/14 in-scope/);
  });

  it("shows honest empty state when no agent steps have been recorded this session", () => {
    render(<WorkspaceApp ctx={makeCtx({ role: "SYSTEM_ADMIN" })} />);
    fireEvent.click(tab(/Cost Dashboard/));
    expect(screen.getByTestId("cost-empty")).toBeInTheDocument();
  });

  it("convergence: aggregates match direct calculation for a known mix of events", () => {
    // Seed: 3 live AGENT_STEP_COMPLETE events with token_usage, 1 fallback AGENT_STEP_COMPLETE
    // (no token_usage), and 2 FALLBACK_ACTIVATED events. Direct calculation:
    //   totalInput  = 100 + 200 + 300 = 600
    //   totalOutput =  50 +  80 + 120 = 250
    //   totalCost   = 0.001 + 0.002 + 0.003 = 0.006 → "$0.0060"
    //   liveSteps   = 3  (the 4th AGENT_STEP_COMPLETE has no token_usage, must be excluded)
    //   fallbacks   = 2  (distinct line, never merged into cost total — docs/32 §4)
    //   VIGIL totals: input=300, output=130
    //   NEXUS totals: input=300, output=120
    const logSink: SovereignLogEvent[] = [
      {
        event_type: "AGENT_STEP_COMPLETE",
        workflow_step_id: "step-1",
        sovereign_tier: "enhanced",
        product: "VIGIL",
        agent_id: "vigil-triage-agent",
        actor_id: "agent",
        outcome: "complete",
        payload: {},
        token_usage: { input_tokens: 100, output_tokens: 50, estimated_cost_usd: 0.001 },
      },
      {
        event_type: "AGENT_STEP_COMPLETE",
        workflow_step_id: "step-2",
        sovereign_tier: "enhanced",
        product: "VIGIL",
        agent_id: "vigil-triage-agent",
        actor_id: "agent",
        outcome: "complete",
        payload: {},
        token_usage: { input_tokens: 200, output_tokens: 80, estimated_cost_usd: 0.002 },
      },
      {
        event_type: "AGENT_STEP_COMPLETE",
        workflow_step_id: "step-3",
        sovereign_tier: "standard",
        product: "NEXUS",
        agent_id: "nexus-router-agent",
        actor_id: "agent",
        outcome: "complete",
        payload: {},
        token_usage: { input_tokens: 300, output_tokens: 120, estimated_cost_usd: 0.003 },
      },
      {
        // Fallback step — AGENT_STEP_COMPLETE without token_usage. Must NOT appear in totals.
        event_type: "AGENT_STEP_COMPLETE",
        workflow_step_id: "step-4",
        sovereign_tier: "standard",
        product: "NEXUS",
        agent_id: "nexus-router-agent",
        actor_id: "agent",
        outcome: "fallback",
        payload: {},
      },
      {
        event_type: "FALLBACK_ACTIVATED",
        workflow_step_id: "step-4",
        sovereign_tier: "standard",
        product: "NEXUS",
        actor_id: "agent",
        outcome: "fallback",
        payload: {},
      },
      {
        event_type: "FALLBACK_ACTIVATED",
        workflow_step_id: "step-5",
        sovereign_tier: "enhanced",
        product: "VIGIL",
        actor_id: "agent",
        outcome: "fallback",
        payload: {},
      },
    ];

    const ctx = makeCtx({ role: "SYSTEM_ADMIN", logSink });
    render(<WorkspaceApp ctx={ctx} />);
    fireEvent.click(tab(/Cost Dashboard/));

    // Running totals — verified by direct calculation, not visual inspection.
    expect(screen.getByTestId("cost-total-input")).toHaveTextContent("600");
    expect(screen.getByTestId("cost-total-output")).toHaveTextContent("250");
    expect(screen.getByTestId("cost-total-usd")).toHaveTextContent("$0.0060");
    expect(screen.getByTestId("cost-total-steps")).toHaveTextContent("3"); // live only; fallback step excluded

    // Fallback count is its own distinct line — not merged into the cost total.
    expect(screen.getByTestId("cost-fallback-count")).toHaveTextContent("2");

    // Per-product breakdown: VIGIL input=300 (100+200), output=130 (50+80).
    const vigilRow = screen.getByTestId("cost-product-VIGIL");
    expect(vigilRow).toHaveTextContent("300"); // input
    expect(vigilRow).toHaveTextContent("130"); // output

    // NEXUS: input=300 (live only), output=120. The fallback step adds no tokens.
    const nexusRow = screen.getByTestId("cost-product-NEXUS");
    expect(nexusRow).toHaveTextContent("300");
    expect(nexusRow).toHaveTextContent("120");

    // Per-agent: vigil-triage-agent = 2 steps (live), nexus-router-agent = 1 step (live only).
    expect(screen.getByTestId("cost-agent-vigil-triage-agent")).toHaveTextContent("2");
    expect(screen.getByTestId("cost-agent-nexus-router-agent")).toHaveTextContent("1");
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

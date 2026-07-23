/** @jest-environment jsdom */
/**
 * e2e — home-dashboard-startup.test.tsx (Session 54, WG-1).
 *
 * The fresh-session condition, rendered: publishModuleSurfacesAtStartup() runs
 * (exactly as the shell host does at start), then the REAL PlatformHome mounts
 * with NO module ever visited — and Program Health, Issues, and To Do / Review
 * all show real data. This is the specific first-impression failure Walkthrough
 * G recorded (everything empty until each module was opened manually).
 */

import { render, screen, act } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import type { RegisteredModuleView } from "../../sovereign-shell/src/module-loader";
import { PlatformHome } from "../../sovereign-shell/src/PlatformHome";
import { publishModuleSurfacesAtStartup } from "../../sovereign-shell/src/startup-publish";
import {
  resetVigilApprovalSessionForTests,
} from "../../module-vigil/src/vigil-approval-session";
import {
  SOF_APPROVAL_SYSTEM,
  EXPIRY_SWEEP_INTERVAL_MS,
} from "../../module-vigil/src/approval-contract";
import { makeCtx } from "./harness";

function moduleStub(id: string, name: string): RegisteredModuleView {
  return {
    moduleId: id,
    displayName: name,
    mountPath: `/${id.replace("module-", "")}`,
    product: "VIGIL",
    tier: "standard",
    minimumRole: ["SYSTEM_ADMIN"],
    mounted: false,
  } as RegisteredModuleView;
}

const MODULES = [
  moduleStub("module-vigil", "VIGIL"),
  moduleStub("module-scribe", "SCRIBE"),
  moduleStub("module-aria", "ARIA Suite"),
  moduleStub("module-nexus", "NEXUS"),
];

describe("PlatformHome on a fresh session after startup publication — WG-1 (Session 54)", () => {
  beforeEach(() => resetVigilApprovalSessionForTests());

  it("shows populated Program Health, Issues, and To Do / Review without visiting any module", () => {
    const ctx = makeCtx([]);
    publishModuleSurfacesAtStartup(ctx); // what main.tsx now does at shell start

    render(
      <PlatformHome ctx={ctx} modules={MODULES} isAccessible={() => true} />
    );

    // Program Health — real program tiles, not the empty-state text.
    expect(screen.getByText("SYNTH-PRG-ALPHA")).toBeInTheDocument();
    expect(
      screen.queryByText(/No program data published/)
    ).not.toBeInTheDocument();

    // Issues — the seeded portfolio has deliberately flagged programs.
    expect(screen.getByText(/flagged$/)).toBeInTheDocument();
    expect(screen.queryByText(/No flagged programs/)).not.toBeInTheDocument();

    // To Do / Review — queue tiles from all four publishing modules.
    expect(screen.getByText("Pending Approvals")).toBeInTheDocument();
    expect(screen.getByText("Unacknowledged Alerts")).toBeInTheDocument();
    expect(screen.getByText("T&T Reviews Awaiting You")).toBeInTheDocument();
    expect(screen.getByText("Certifications Awaiting You")).toBeInTheDocument();
    expect(screen.getByText("Coordination Items")).toBeInTheDocument();
    expect(
      screen.queryByText(/No pending reviews/)
    ).not.toBeInTheDocument();
  });

  it("Reviewer's Workspace shows real counts on all three sections on a fresh session", () => {
    const ctx = makeCtx([]); // SYSTEM_ADMIN — every section accessible
    publishModuleSurfacesAtStartup(ctx);

    const { WorkspaceApp } = require("../../module-workspace/src/WorkspaceApp");
    render(<WorkspaceApp ctx={ctx} />);

    // Walkthrough G observed 0 / 0 / 0 here until VIGIL, ARIA, and SCRIBE were
    // each visited manually. Now every section tab carries a real count badge.
    const tabs = screen.getAllByRole("tab");
    const badgeFor = (label: RegExp): number => {
      const tab = tabs.find((t) => label.test(t.textContent ?? ""))!;
      return Number(tab.querySelector("span")!.textContent);
    };
    expect(badgeFor(/VIGIL Approvals/)).toBe(5);
    expect(badgeFor(/ARIA Certifications/)).toBeGreaterThan(0);
    expect(badgeFor(/SCRIBE T&T Reviews/)).toBeGreaterThan(0);
  });

  it("still respects role-based read filtering — inaccessible modules contribute no tiles", () => {
    const ctx = makeCtx([]);
    publishModuleSurfacesAtStartup(ctx);

    render(
      <PlatformHome ctx={ctx} modules={MODULES} isAccessible={() => false} />
    );

    // Everything published, but this role can access no module — the queue
    // section shows its honest empty state (publication is role-blind; the
    // READ side filters, unchanged from GD-24).
    expect(screen.queryByText("Pending Approvals")).not.toBeInTheDocument();
    expect(screen.getByText(/No pending reviews/)).toBeInTheDocument();
  });
});

describe("PlatformHome expiry sweep — WG-17 (Session 55)", () => {
  afterEach(() => {
    resetVigilApprovalSessionForTests();
    jest.useRealTimers();
  });

  it("expires a P1 approval request on interval, emits AGENT_ACTION_EXPIRED, and republishes the VIGIL Pending Approvals count", () => {
    jest.useFakeTimers();
    const logged: SovereignLogEvent[] = [];
    const ctx = makeCtx(logged);

    // Initialize the shared session (5 requests including P1 req-dev-001 with 15-min window)
    // and seed all surfaces — exactly what the shell does at startup.
    publishModuleSurfacesAtStartup(ctx);

    // Render PlatformHome — the immediate sweep fires at T=0 (nothing expired yet).
    act(() => {
      render(<PlatformHome ctx={ctx} modules={MODULES} isAccessible={() => true} />);
    });

    const pendingBefore = ctx.workQueueSurface
      .listForModule("vigil")
      .find((q) => q.queue_label === "Pending Approvals")!;
    expect(pendingBefore.count).toBe(5);

    // Advance 20 minutes — the P1's 15-minute window elapses; the interval fires.
    act(() => { jest.advanceTimersByTime(20 * 60_000); });

    // The sweep emitted AGENT_ACTION_EXPIRED for at least the P1 (req-dev-001).
    const expiredEvents = logged.filter((e) => e.event_type === "AGENT_ACTION_EXPIRED");
    expect(expiredEvents.length).toBeGreaterThan(0);
    expect(expiredEvents[0]).toMatchObject({
      event_type: "AGENT_ACTION_EXPIRED",
      actor_id: SOF_APPROVAL_SYSTEM,
    });

    // The sweep republished VIGIL's Pending Approvals with the reduced count.
    const pendingAfter = ctx.workQueueSurface
      .listForModule("vigil")
      .find((q) => q.queue_label === "Pending Approvals")!;
    expect(pendingAfter.count).toBeLessThan(5);
  });
});

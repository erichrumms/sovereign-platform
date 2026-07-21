/** @jest-environment jsdom */
/**
 * e2e — cross-module-navigation-convergence.test.tsx (Session 53, D5).
 *
 * THE FULL LOOP for GD-27 (Cross-Module Navigation Primitive, docs/25 §4 D5),
 * one scenario per wired module: a REAL SovereignShell (createShell — the same
 * composition root the host uses) with a REAL ModuleLoader and the REAL module
 * contracts registered; a mini-host registers the generalized mount/unmount
 * sequence via setNavigateToModuleHandler (the exact wiring main.tsx performs,
 * minus the requestAnimationFrame deferral, which exists only for the chrome's
 * outlet timing); then ctx.navigateToModule(moduleId, initialState) is called
 * THROUGH THE CONTEXT — the same call path any module uses — and the test
 * confirms the target module ACTUALLY MOUNTS with the named item pre-selected
 * via its own narrowed initialState.
 *
 * Mirrors the GD-25 convergence style: real modules, real shell, no mocks past
 * the point that matters (VIGIL's key-less brief hook degrades to its real
 * STATIC tier).
 */

import { act, screen, waitFor } from "@testing-library/react";

import type { SovereignUser } from "../../sovereign-shell/shell-contract";
import { createShell, type SovereignShell } from "../../sovereign-shell/src/shell";
import { ModuleLoader } from "../../sovereign-shell/src/module-loader";

import { vigilModule } from "../../module-vigil/src/index";
import { ariaModule } from "../../module-aria/src/index";
import { scribeModule } from "../../module-scribe/src/index";

import { DEMO_TT_REVIEW_ITEMS } from "../../module-scribe/src/tt-synthetic-review";
import { ttReviewItemKey } from "../../module-scribe/src/TTManagerReview";

// Manual createRoot mounts (the module contracts' real mount path) run outside
// RTL's render(), so opt this suite into React's act environment explicitly.
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

// SYSTEM_ADMIN passes every module gate (the loader's universal superuser clause
// and each module's structural mount gate) — the same dev default main.tsx seeds.
const ADMIN_USER: SovereignUser = {
  employee_id: "e2e-0001",
  name: "E2E Navigator",
  org_unit: "SOVEREIGN Platform Engineering",
  role: "SYSTEM_ADMIN",
  clearance_level: "CUI",
  cost_code_assignments: [],
};

interface MiniHost {
  shell: SovereignShell;
  loader: ModuleLoader;
  outlet: HTMLElement;
}

/**
 * The mini-host: real shell + real loader + the three real modules, with the
 * generalized GD-27 sequence registered as the navigateToModule handler —
 * unmount whatever owns the outlet, then mount the target with the intent.
 */
function makeHost(): MiniHost {
  const shell = createShell({ user: ADMIN_USER, token: "e2e-token" });
  const loader = new ModuleLoader(shell);
  loader.register(vigilModule);
  loader.register(ariaModule);
  loader.register(scribeModule);

  const outlet = document.createElement("div");
  document.body.appendChild(outlet);

  shell.setNavigateToModuleHandler((moduleId, initialState) => {
    for (const m of loader.list()) {
      if (m.mounted) loader.unmount(m.moduleId);
    }
    void loader.mount(moduleId, outlet, initialState);
  });

  return { shell, loader, outlet };
}

function teardown(host: MiniHost): void {
  for (const m of host.loader.list()) {
    if (m.mounted) host.loader.unmount(m.moduleId);
  }
  host.outlet.remove();
}

describe("Cross-module navigation convergence — GD-27 (Session 53)", () => {
  let host: MiniHost;

  beforeEach(() => {
    host = makeHost();
  });

  afterEach(() => {
    act(() => teardown(host));
  });

  // ── VIGIL: navigateToModule mounts VIGIL with the named request pre-selected ──
  it("VIGIL mounts with the Approvals tab open and req-dev-001 pre-selected in ApprovalDetail", async () => {
    const ctx = host.shell.getContext();

    await act(async () => {
      ctx.navigateToModule("module-vigil", { selectedRequestId: "req-dev-001" });
    });

    // The module actually mounted…
    expect(host.loader.isMounted("module-vigil")).toBe(true);
    // …directly on the Approvals tab (not VIGIL's cold-mount Alert Queue default)…
    expect(
      screen.getByRole("tab", { name: /Actions Awaiting Your Approval/ })
    ).toHaveAttribute("aria-selected", "true");
    // …with the named request already selected: the REAL ApprovalDetail renders it
    // (queue selection seeded, not clicked) and its key-less brief settles to STATIC.
    expect((await screen.findAllByText(/req-dev-001/)).length).toBeGreaterThan(0);
    await waitFor(() => expect(screen.getByText("STATIC")).toBeInTheDocument());
  });

  // ── ARIA: navigateToModule mounts ARIA with the named document pre-selected ──
  it("ARIA mounts on the CLEAR Certification Queue with DOC-CONG-JUST's preview expanded", async () => {
    const ctx = host.shell.getContext();

    await act(async () => {
      ctx.navigateToModule("module-aria", { selectedDocumentId: "DOC-CONG-JUST" });
    });

    expect(host.loader.isMounted("module-aria")).toBe(true);
    // The Certification Queue is showing (not ARIA's cold-mount CLEAR dashboard default)…
    expect(screen.getByTestId("clear-certification-queue")).toBeInTheDocument();
    // …with the named document's preview expanded (the queue's existing per-document
    // disclosure state, seeded by the navigation intent) and only that document's.
    expect(screen.getByTestId("view-doc-DOC-CONG-JUST")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("view-doc-DOC-A11-FY26-OM")).toHaveAttribute("aria-expanded", "false");
  });

  // ── SCRIBE: navigateToModule mounts SCRIBE with the named review item pre-selected ──
  it("SCRIBE mounts on Time & Travel Review with the second demo item pre-selected (not the first-item default)", async () => {
    const ctx = host.shell.getContext();
    // Deliberately NOT the first item, so the assertion can't pass via the
    // component's own first-item default selection.
    expect(DEMO_TT_REVIEW_ITEMS.length).toBeGreaterThan(1);
    const targetKey = ttReviewItemKey(DEMO_TT_REVIEW_ITEMS[1]);
    const defaultKey = ttReviewItemKey(DEMO_TT_REVIEW_ITEMS[0]);

    await act(async () => {
      ctx.navigateToModule("module-scribe", { selectedItemKey: targetKey });
    });

    expect(host.loader.isMounted("module-scribe")).toBe(true);
    // The T&T Review surface is showing (not SCRIBE's cold-mount drafting default)…
    expect(screen.getByTestId("scribe-tt-review-tab")).toHaveAttribute("aria-selected", "true");
    // …with the named item selected in the queue rather than the first-item default.
    expect(screen.getByTestId(`tt-queue-item-${targetKey}`)).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId(`tt-queue-item-${defaultKey}`)).toHaveAttribute("aria-pressed", "false");
  });
});

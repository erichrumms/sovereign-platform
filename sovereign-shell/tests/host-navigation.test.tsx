/** @jest-environment jsdom */
/**
 * sovereign-shell — host-navigation.test.tsx (Session 61, D6 / D7).
 *
 * The testable seams of the Session 61 navigation fixes:
 *   - D6 (D3-5): ShellConfig.onNavigate fires for every provider navigation,
 *     including "/" — the seam main.tsx's goHome registration relies on. (The
 *     full App-level Home-return sequence lives in main.tsx's module-scope
 *     bootstrap, which is exercised live, not under jest — the walkthrough
 *     covers the visual path.)
 *   - D7 (D3-7i): useNavigationState self-heals its mirror when an EXTERNAL
 *     navigation (the ctx.navigateToModule host handler driving the provider
 *     directly) moves the provider without the hook's navigate().
 *   - D7 (D3-7ii): defaultRoleAccessPolicy refuses an inaccessible module —
 *     the same check the host handler now applies BEFORE unmounting anything.
 */

import { render, screen } from "@testing-library/react";

import type { SovereignShellContext, SovereignUser } from "../shell-contract";
import { createShell } from "../src/shell";
import { ModuleLoader, defaultRoleAccessPolicy } from "../src/module-loader";
import { registerPlatformModules } from "../src/register-modules";
import { useNavigationState } from "../src/navigation/useNavigationState";

function makeUser(role: SovereignUser["role"]): SovereignUser {
  return {
    employee_id: "test-0001",
    name: "Test Operator",
    org_unit: "Test",
    role,
    clearance_level: "CUI",
    cost_code_assignments: [],
  };
}

describe("D6 seam — ShellConfig.onNavigate fires for Home navigation", () => {
  it("invokes onNavigate with '/' when the provider navigates home (the goHome trigger)", () => {
    const seen: string[] = [];
    const shell = createShell({
      user: makeUser("SYSTEM_ADMIN"),
      token: "t",
      initialPath: "/",
      onNavigate: (path) => seen.push(path),
    });

    shell.getNavigationProvider().navigateTo("/vigil");
    shell.getNavigationProvider().navigateTo("/");

    expect(seen).toEqual(["/vigil", "/"]);
  });

  it("does not fire onNavigate at construction (initialPath is not a navigation)", () => {
    const seen: string[] = [];
    createShell({
      user: makeUser("SYSTEM_ADMIN"),
      token: "t",
      initialPath: "/",
      onNavigate: (path) => seen.push(path),
    });
    expect(seen).toEqual([]);
  });
});

describe("D7i — useNavigationState self-heals after an external navigation", () => {
  function Probe({ ctx }: { ctx: SovereignShellContext }): JSX.Element {
    const { currentPath } = useNavigationState(ctx);
    return <span data-testid="path">{currentPath}</span>;
  }

  it("a provider navigation made OUTSIDE the hook is reflected on the next render", () => {
    const shell = createShell({ user: makeUser("SYSTEM_ADMIN"), token: "t", initialPath: "/" });
    const ctx = shell.getContext();

    const view = render(<Probe ctx={ctx} />);
    expect(screen.getByTestId("path").textContent).toBe("/");

    // The ctx.navigateToModule host handler's path: drive the provider directly.
    shell.getNavigationProvider().navigateTo("/aria");
    view.rerender(<Probe ctx={ctx} />);

    // Before D7 the mirror stayed at "/" (the stale-highlight root cause).
    expect(screen.getByTestId("path").textContent).toBe("/aria");
  });
});

describe("D7ii — the access policy the host guard applies before unmounting", () => {
  it("refuses a role outside the module's list and admits SYSTEM_ADMIN everywhere", () => {
    const adminShell = createShell({ user: makeUser("SYSTEM_ADMIN"), token: "t" });
    const readOnlyShell = createShell({ user: makeUser("READ_ONLY"), token: "t" });
    const loader = new ModuleLoader(adminShell);
    registerPlatformModules(loader);

    const vigil = loader.list().find((m) => m.moduleId === "module-vigil")!;
    expect(defaultRoleAccessPolicy(adminShell.getContext().auth, vigil.minimumRole)).toBe(true);
    // READ_ONLY cannot reach VIGIL — the exact case the D7 guard now refuses
    // BEFORE any unmount, instead of blanking the screen after one.
    expect(defaultRoleAccessPolicy(readOnlyShell.getContext().auth, vigil.minimumRole)).toBe(false);
  });
});

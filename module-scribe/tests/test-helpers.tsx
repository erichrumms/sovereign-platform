/**
 * module-scribe — component-test helpers.
 * A minimal fake SovereignShellContext (the fields the SCRIBE UI reads: auth.user,
 * logger.log, navigation.navigateTo) cast to the contract type. Tests may inject a
 * logger and a navigateTo spy to assert Gate 2 emission and export routing.
 */
import { validateStyleProfile } from "@sovereign/data";
import type { SovereignShellContext, SovereignLogEvent, SovereignRole } from "../../sovereign-shell/shell-contract";

export interface CtxOverrides {
  role?: SovereignRole;
  log?: (event: SovereignLogEvent) => void;
  navigateTo?: (path: string) => void;
}

export function makeCtx(over: CtxOverrides = {}): SovereignShellContext {
  return {
    auth: {
      user: {
        employee_id: "E-700",
        name: "Sam Author",
        org_unit: "Program Office",
        role: over.role ?? "PROGRAM_MANAGER",
        clearance_level: "CUI",
        cost_code_assignments: [],
      },
      token: "test-token",
      signOut: () => {},
      hasRole: () => true,
      hasClearance: () => true,
    },
    logger: { log: over.log ?? (() => {}) },
    navigation: {
      navigateTo: over.navigateTo ?? (() => {}),
      currentPath: "/scribe",
      breadcrumb: [],
    },
    // Mirrors the shell's frozen ctx.data.types validator catalog (shell.ts) — so
    // Style DNA can validate the StyleProfile "via ctx.data" under test.
    data: { types: { validateStyleProfile } },
  } as unknown as SovereignShellContext;
}

/**
 * module-lens — component-test helpers.
 * A minimal fake SovereignShellContext. hasRole() reflects the configured role (NOT
 * always-true). LENS is READ_ONLY-placeholder access and the scaffold makes no LLM
 * call, so this only needs auth / logger / navigation.
 */
import type { SovereignShellContext, SovereignRole } from "../../sovereign-shell/shell-contract";

export interface CtxOverrides {
  role?: SovereignRole;
}

export function makeCtx(over: CtxOverrides = {}): SovereignShellContext {
  const role: SovereignRole = over.role ?? "READ_ONLY";
  return {
    auth: {
      user: {
        employee_id: "E-700",
        name: "Sam Reader",
        org_unit: "Program Office",
        role,
        clearance_level: "CUI",
        cost_code_assignments: [],
      },
      token: "test-token",
      signOut: () => {},
      hasRole: (r: SovereignRole) => r === role,
      hasClearance: () => true,
    },
    logger: { log: () => {} },
    navigation: { navigateTo: () => {}, currentPath: "/lens", breadcrumb: [] },
  } as unknown as SovereignShellContext;
}

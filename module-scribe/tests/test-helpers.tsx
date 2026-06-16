/**
 * module-scribe — component-test helpers.
 * A minimal fake SovereignShellContext (only the fields the scaffold reads:
 * auth.user) cast to the contract type.
 */
import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";

export function makeCtx(): SovereignShellContext {
  return {
    auth: {
      user: {
        employee_id: "E-700",
        name: "Sam Author",
        org_unit: "Program Office",
        role: "PROGRAM_MANAGER",
        clearance_level: "CUI",
        cost_code_assignments: [],
      },
      token: "test-token",
      signOut: () => {},
      hasRole: () => true,
      hasClearance: () => true,
    },
    logger: { log: () => {} },
  } as unknown as SovereignShellContext;
}

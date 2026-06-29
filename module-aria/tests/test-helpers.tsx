/**
 * module-aria — component-test helpers.
 * A minimal fake SovereignShellContext. hasRole() reflects the configured role (NOT always-true)
 * so the ARIA PLATFORM_ADMIN gate is genuinely exercised. The default user is a PLATFORM_ADMIN —
 * ARIA's minimumRole (docs/16 §9). ARIA Suite does not use ctx.taskSurface, so the partial ctx is
 * cast through `unknown` like the other module helpers.
 */
import type {
  SovereignShellContext,
  SovereignRole,
  SovereignLogEvent,
} from "../../sovereign-shell/shell-contract";

export interface CtxOverrides {
  role?: SovereignRole;
  name?: string;
  /** When provided, every logged event is pushed here (assertion sink). */
  logSink?: SovereignLogEvent[];
}

export function makeCtx(over: CtxOverrides = {}): SovereignShellContext {
  const role: SovereignRole = over.role ?? "PLATFORM_ADMIN";
  return {
    auth: {
      user: {
        employee_id: "E-900",
        name: over.name ?? "Robin Compliance",
        org_unit: "Compliance Office",
        role,
        clearance_level: "UNCLASSIFIED",
        cost_code_assignments: [],
      },
      token: "test-token",
      signOut: () => {},
      hasRole: (r: SovereignRole) => r === role,
      hasClearance: () => true,
    },
    logger: {
      log: (event: SovereignLogEvent) => {
        over.logSink?.push(event);
      },
    },
    governance: {
      cpmiStatus: { overall: "GREEN", products: [], last_updated: "2026-06-29T00:00:00.000Z", pending_gate3_reviews: 0 },
      vrsGates: [],
      isOnHold: () => false,
    },
    navigation: { navigateTo: () => {}, currentPath: "/aria", breadcrumb: [] },
  } as unknown as SovereignShellContext;
}

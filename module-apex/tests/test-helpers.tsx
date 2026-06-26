/**
 * module-apex — component/hook-test helpers.
 * A minimal fake SovereignShellContext. hasRole() reflects the configured role (NOT
 * always-true) so the APEX PLATFORM_ADMIN gate is genuinely exercised. The logger can
 * capture events (logSink) or simulate a failed emit (throwOnLog). `onHold` makes
 * ctx.governance.isOnHold(product) return true for the listed products so the
 * sovereignHold() gate path is testable.
 */
import type {
  SovereignShellContext,
  SovereignRole,
  SovereignLogEvent,
  SovereignProduct,
} from "../../sovereign-shell/shell-contract";

export interface CtxOverrides {
  role?: SovereignRole;
  /** When provided, every logged event is pushed here (assertion sink). */
  logSink?: SovereignLogEvent[];
  /** When true, ctx.logger.log throws — exercises the Gate 2 failure path. */
  throwOnLog?: boolean;
  /** Products for which ctx.governance.isOnHold returns true. */
  onHold?: SovereignProduct[];
}

export function makeCtx(over: CtxOverrides = {}): SovereignShellContext {
  const role: SovereignRole = over.role ?? "PLATFORM_ADMIN";
  const held = new Set(over.onHold ?? []);
  return {
    auth: {
      user: {
        employee_id: "E-700",
        name: "Dana Reviewer",
        org_unit: "Program Executive Office",
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
        if (over.throwOnLog) throw new Error("simulated logger failure");
        over.logSink?.push(event);
      },
    },
    governance: {
      cpmiStatus: { overall: "GREEN", products: [], last_updated: "2026-06-25T00:00:00.000Z", pending_gate3_reviews: 0 },
      vrsGates: [],
      isOnHold: (product: SovereignProduct) => held.has(product),
    },
    navigation: { navigateTo: () => {}, currentPath: "/apex", breadcrumb: [] },
  } as unknown as SovereignShellContext;
}

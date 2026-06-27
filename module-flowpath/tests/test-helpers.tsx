/**
 * module-flowpath — component/hook-test helpers.
 * A minimal fake SovereignShellContext. hasRole() reflects the configured role (NOT
 * always-true) so the FLOWPATH AGENT_OPERATOR gate is genuinely exercised. The logger can
 * capture events (logSink) or simulate a failed emit (throwOnLog). The default user is an
 * AGENT_OPERATOR analyst — FLOWPATH's minimumRole (spec §13).
 */
import type {
  SovereignShellContext,
  SovereignRole,
  SovereignLogEvent,
  SovereignProduct,
} from "../../sovereign-shell/shell-contract";

export interface CtxOverrides {
  role?: SovereignRole;
  employee_id?: string;
  name?: string;
  /** When provided, every logged event is pushed here (assertion sink). */
  logSink?: SovereignLogEvent[];
  /** When true, ctx.logger.log throws — exercises the Gate 2 failure path. */
  throwOnLog?: boolean;
  /** Products for which ctx.governance.isOnHold returns true. */
  onHold?: SovereignProduct[];
}

export function makeCtx(over: CtxOverrides = {}): SovereignShellContext {
  const role: SovereignRole = over.role ?? "AGENT_OPERATOR";
  const held = new Set(over.onHold ?? []);
  return {
    auth: {
      user: {
        employee_id: over.employee_id ?? "E-410",
        name: over.name ?? "Sam Analyst",
        org_unit: "Program Office",
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
      cpmiStatus: { overall: "GREEN", products: [], last_updated: "2026-06-26T00:00:00.000Z", pending_gate3_reviews: 0 },
      vrsGates: [],
      isOnHold: (product: SovereignProduct) => held.has(product),
    },
    navigation: { navigateTo: () => {}, currentPath: "/flowpath", breadcrumb: [] },
  } as unknown as SovereignShellContext;
}

/**
 * module-nexus — component/hook-test helpers.
 * A minimal fake SovereignShellContext. hasRole() reflects the configured role (NOT
 * always-true) so the NEXUS AGENT_OPERATOR gate is genuinely exercised. The logger can
 * capture events (logSink) or simulate a failed emit (throwOnLog) so the GD-11 NEXUS_*
 * emission and the Gate-2 fail-closed path are testable.
 */
import type {
  SovereignShellContext,
  SovereignRole,
  SovereignLogEvent,
} from "../../sovereign-shell/shell-contract";

export interface CtxOverrides {
  role?: SovereignRole;
  /** When provided, every logged event is pushed here (assertion sink). */
  logSink?: SovereignLogEvent[];
  /** When true, ctx.logger.log throws — exercises the Gate-2 failure path. */
  throwOnLog?: boolean;
}

export function makeCtx(over: CtxOverrides = {}): SovereignShellContext {
  const role: SovereignRole = over.role ?? "AGENT_OPERATOR";
  return {
    auth: {
      user: {
        employee_id: "E-900",
        name: "Sam Operator",
        org_unit: "Operations",
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
      cpmiStatus: { overall: "GREEN", products: [], last_updated: "2026-06-24T00:00:00.000Z", pending_gate3_reviews: 0 },
      vrsGates: [],
      isOnHold: () => false,
    },
    navigation: { navigateTo: () => {}, currentPath: "/nexus", breadcrumb: [] },
  } as unknown as SovereignShellContext;
}

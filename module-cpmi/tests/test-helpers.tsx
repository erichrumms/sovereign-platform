/**
 * module-cpmi — component/hook-test helpers.
 * A minimal fake SovereignShellContext. hasRole() reflects the configured role (NOT
 * always-true) so the CPMI role gate is genuinely exercised. The logger can capture
 * events (logSink) or simulate a failed emit (throwOnLog) so the AGENT_STEP_* /
 * CPMI_VRS_GATE_* emission and CPMI-VRS Gate 2 paths are testable.
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
  /** When true, ctx.logger.log throws — exercises the Gate 2 failure path. */
  throwOnLog?: boolean;
}

export function makeCtx(over: CtxOverrides = {}): SovereignShellContext {
  const role: SovereignRole = over.role ?? "PLATFORM_ADMIN";
  return {
    auth: {
      user: {
        employee_id: "E-500",
        name: "Dana Governance",
        org_unit: "Governance Office",
        role,
        clearance_level: "CUI",
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
      cpmiStatus: { overall: "GREEN", products: [], last_updated: "2026-06-23T00:00:00.000Z", pending_gate3_reviews: 0 },
      vrsGates: [],
      isOnHold: () => false,
    },
    navigation: { navigateTo: () => {}, currentPath: "/cpmi", breadcrumb: [] },
  } as unknown as SovereignShellContext;
}

/**
 * module-lens — component/hook-test helpers.
 * A minimal fake SovereignShellContext. hasRole() reflects the configured role (NOT
 * always-true). LENS is READ_ONLY-placeholder access. The logger can capture events
 * (logSink) or simulate a failed emit (throwOnLog) so the AGENT_STEP_* / FALLBACK_*
 * emission and CPMI-VRS Gate 2 paths are testable; currentPath drives the Pipeline
 * Navigator's product derivation.
 */
import type {
  SovereignShellContext,
  SovereignRole,
  SovereignLogEvent,
} from "../../sovereign-shell/shell-contract";

export interface CtxOverrides {
  role?: SovereignRole;
  /** Drives ctx.navigation.currentPath (Pipeline Navigator product derivation). */
  currentPath?: string;
  /** When provided, every logged event is pushed here (assertion sink). */
  logSink?: SovereignLogEvent[];
  /** When true, ctx.logger.log throws — exercises the Gate 2 failure path. */
  throwOnLog?: boolean;
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
    logger: {
      log: (event: SovereignLogEvent) => {
        if (over.throwOnLog) throw new Error("simulated logger failure");
        over.logSink?.push(event);
      },
    },
    navigation: { navigateTo: () => {}, currentPath: over.currentPath ?? "/lens", breadcrumb: [] },
  } as unknown as SovereignShellContext;
}

/**
 * module-vigil — component/hook-test helpers.
 * A minimal fake SovereignShellContext. hasRole() reflects the configured role
 * (NOT always-true) so the VIGIL role gate is genuinely exercised, a2a._stage is
 * configurable so the Agent Approval Queue stub can be driven across stages, and the
 * logger can capture events (logSink) or simulate a failed emit (throwOnLog) so the
 * ALERT_* / AGENT_STEP_* emission and CPMI-VRS Gate 2 paths are testable.
 */
import type {
  SovereignShellContext,
  SovereignRole,
  SovereignLogEvent,
} from "../../sovereign-shell/shell-contract";
import type { A2AStage } from "../src/AgentApprovalQueue";
import type { SecurityAlert } from "../src/vigil-types";

/** Build a SecurityAlert for tests, with sensible defaults. */
export function makeAlert(over: Partial<SecurityAlert> = {}): SecurityAlert {
  return {
    alertId: over.alertId ?? "ALERT-1",
    alertLevel: over.alertLevel ?? "P2",
    alertType: over.alertType ?? "ANOMALY_DETECTED",
    sourceProduct: over.sourceProduct ?? "APEX",
    agentId: over.agentId,
    timestamp: over.timestamp ?? "2026-06-18T12:00:00.000Z",
    rawEvent: over.rawEvent ?? { event_type: "ANOMALY_DETECTED" },
    status: over.status ?? "UNACKNOWLEDGED",
  };
}

export interface CtxOverrides {
  role?: SovereignRole;
  a2aStage?: A2AStage;
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
        employee_id: "E-900",
        name: "Pat Operator",
        org_unit: "Platform Ops",
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
    navigation: { navigateTo: () => {}, currentPath: "/vigil", breadcrumb: [] },
    a2a: { _stage: over.a2aStage ?? "DEFINED", listAgents: () => [] },
  } as unknown as SovereignShellContext;
}

/**
 * module-vigil — component-test helpers.
 * A minimal fake SovereignShellContext. hasRole() reflects the configured role
 * (NOT always-true) so the VIGIL role gate is genuinely exercised, and a2a._stage
 * is configurable so the Agent Approval Queue stub can be driven across stages.
 */
import type { SovereignShellContext, SovereignRole } from "../../sovereign-shell/shell-contract";
import type { A2AStage } from "../src/AgentApprovalQueue";

export interface CtxOverrides {
  role?: SovereignRole;
  a2aStage?: A2AStage;
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
    logger: { log: () => {} },
    navigation: { navigateTo: () => {}, currentPath: "/vigil", breadcrumb: [] },
    a2a: { _stage: over.a2aStage ?? "DEFINED", listAgents: () => [] },
  } as unknown as SovereignShellContext;
}

/**
 * module-counsel — component-test helpers.
 * A minimal fake SovereignShellContext (only the fields COUNSEL components touch:
 * auth.user + logger.log) and shared fixtures. The logger is a jest.fn so tests
 * can assert emitted events and simulate Gate 2 emit failures.
 */
import type { SovereignShellContext, SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import type { AnalysisResult } from "../src/analysis-contract";
import type { DecisionFrame } from "../src/types";

export interface FakeCtx {
  ctx: SovereignShellContext;
  logged: SovereignLogEvent[];
  log: jest.Mock;
}

/** Build a fake shell context. Pass a throwing logger to exercise CPMI-VRS Gate 2. */
export function makeCtx(opts: { logThrows?: boolean } = {}): FakeCtx {
  const logged: SovereignLogEvent[] = [];
  const log = jest.fn((event: SovereignLogEvent) => {
    if (opts.logThrows) throw new Error("logger offline");
    logged.push(event);
  });

  const ctx = {
    auth: {
      user: {
        employee_id: "E-555",
        name: "Dana Reviewer",
        org_unit: "Acquisition",
        role: "COMPLIANCE_OFFICER",
        clearance_level: "CUI",
        cost_code_assignments: [],
      },
      token: "test-token",
      signOut: () => {},
      hasRole: () => true,
      hasClearance: () => true,
    },
    logger: { log },
  } as unknown as SovereignShellContext;

  return { ctx, logged, log };
}

export function frameFixture(): DecisionFrame {
  return {
    decisionStatement: "Approve the Q3 vendor change request",
    stakes: "Wrong approval hits the cost baseline",
    constraints: ["Must respect FAR 52.244"],
    sovereignContext: {
      sourceProduct: "NEXUS",
      workflowStepId: "NEXUS-APPROVE-v1-step-3",
      decisionType: "HUMAN_APPROVAL",
    },
  };
}

export function analysisFixture(): AnalysisResult {
  return {
    alternatives: [
      { id: "ALT-1", label: "Approve", summary: "Approve as submitted.", pros: ["fast"], cons: ["risk"] },
      { id: "ALT-2", label: "Defer", summary: "Hold for data.", pros: ["safe"], cons: ["delay"] },
      { id: "ALT-3", label: "Escalate", summary: "Route up.", pros: ["oversight"], cons: ["slow"] },
    ],
    riskScenarios: [
      { alternativeId: "ALT-1", scenario: "Bad approval.", severity: "HIGH" },
      { alternativeId: "ALT-2", scenario: "Missed window.", severity: "MODERATE" },
      { alternativeId: "ALT-3", scenario: "Backlog.", severity: "LOW" },
    ],
    assumptionFlags: [{ assumption: "Package complete.", concern: "Unverified." }],
    confidenceScore: 64,
    recommendedNextAction: "Verify the package before approving.",
    source: "live",
  };
}

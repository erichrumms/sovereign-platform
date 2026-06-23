/**
 * SOVEREIGN Platform — module-vigil
 * approval-port.ts — the AgentOS approval-request port (injectable) + dev backing.
 *
 * The Agent Approval Queue reads pending requests through this port, NOT a direct
 * AgentOS API call (spec §9.1 — same port pattern as Session 9's SecurityObservabilityQuery).
 * This session the backing is SYNTHETIC/DEV (Governance Clock OFF): a small set of
 * representative requests covering the three risk classifications and the three primary
 * AgentOS action types (model deployment, data export, configuration change). The live
 * AgentOS backing is injected by configuration in the AgentOS build session — no VIGIL
 * rewrite (Standing Constraint #3).
 *
 * Version: 1.0 · Session 10 · June 23, 2026
 */

import {
  computeExpiresAt,
  type AgentApprovalRequest,
  type RiskClassification,
} from "./approval-contract";

/** The injectable AgentOS approval port. listPending() returns the open requests. */
export interface AgentApprovalPort {
  listPending: () => AgentApprovalRequest[];
}

interface SyntheticSeed {
  request_id: string;
  requesting_agent_id: string;
  requesting_agent_class: AgentApprovalRequest["requesting_agent_class"];
  action_type: string;
  action_detail: Record<string, unknown>;
  risk: RiskClassification;
  context?: string;
}

/**
 * Three representative synthetic requests (spec §9.1): P1 model deployment, P2 data
 * export, P3 configuration change. Submitted at `anchorIso`; expiry derived from the
 * risk window. All clearly synthetic.
 */
const SYNTHETIC_SEEDS: readonly SyntheticSeed[] = [
  {
    request_id: "req-dev-001",
    requesting_agent_id: "agentos-deployer",
    requesting_agent_class: "Operational",
    action_type: "model_deployment",
    action_detail: {
      synthetic: true,
      model: "claude-sonnet-4",
      target_product: "APEX",
      replaces_version: "2026.05",
    },
    risk: "P1",
    context: "Routine model refresh for APEX reporting; supersedes the May build.",
  },
  {
    request_id: "req-dev-002",
    requesting_agent_id: "agentos-exporter",
    requesting_agent_class: "Operational",
    action_type: "data_export",
    action_detail: {
      synthetic: true,
      dataset: "program_status_snapshot",
      destination: "cpmi-governance-review",
      record_count: 142,
    },
    risk: "P2",
    context: "Export of synthetic program-status records for a CPMI governance review.",
  },
  {
    request_id: "req-dev-003",
    requesting_agent_id: "agentos-configurator",
    requesting_agent_class: "Operational",
    action_type: "configuration_change",
    action_detail: {
      synthetic: true,
      parameter: "flowpath.vvr_threshold",
      from: 0.7,
      to: 0.6,
    },
    risk: "P3",
  },
];

/** Build the synthetic requests anchored to a submission instant. */
export function syntheticApprovalRequests(anchorIso: string): AgentApprovalRequest[] {
  return SYNTHETIC_SEEDS.map((s) => ({
    request_id: s.request_id,
    requesting_agent_id: s.requesting_agent_id,
    requesting_agent_class: s.requesting_agent_class,
    action_type: s.action_type,
    action_detail: s.action_detail,
    risk_classification: s.risk,
    submitted_at: anchorIso,
    expires_at: computeExpiresAt(anchorIso, s.risk),
    workflow_step_id: `vigil-approval-${s.request_id}`,
    context: s.context,
  }));
}

/**
 * The default DEV approval port — SYNTHETIC data only. Replace by injecting a live
 * AgentApprovalPort (configuration change, Constraint #3) when AgentOS A2A is wired.
 */
export function createDevApprovalPort(anchorIso: string): AgentApprovalPort {
  const requests = syntheticApprovalRequests(anchorIso);
  return {
    listPending: () => requests,
  };
}

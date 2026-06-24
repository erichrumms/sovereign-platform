/**
 * SOVEREIGN Platform — module-agentos
 * agent-dispatcher.ts — routes tasks to registered agents (pure, no React).
 *
 * Session 14 SCOPE: a SYNTHETIC/DEV backing (Governance Clock OFF). The dispatcher selects
 * a dispatch target from a synthetic roster, builds the AgentAssignment (spec §3.4), and —
 * when the task requires approval — builds the AgentApprovalRequest AgentOS submits to VIGIL
 * (the shape VIGIL's queue already accepts). Real agent execution (calling agents, receiving
 * completions) is future work (spec §7).
 *
 * GD-10 (Session 14): dispatch is "processing". A task whose data_classification is not
 * authorized is rejected at dispatch with ClassificationNotAuthorizedError — reusing the
 * api-client boundary, NOT a divergent copy of the rule (Standing Constraints #1 / #2).
 *
 * CONSTRAINT #10 NOTE: the synthetic roster below is DEV dispatch-target data, not platform
 * agent registration. No new platform agent is registered this session; the module's
 * agentCards are empty until AgentOS orchestrator agents are entered in
 * Agent_Identity_Standard.md by governance.
 *
 * Version: 1.0 · Session 14 · June 24, 2026
 */

import { assertClassificationAuthorized } from "@sovereign/api-client";

import type { Task, AgentAssignment } from "./agentos-contract";
import {
  computeExpiresAt,
  type AgentApprovalRequest,
  type ApprovalAgentClass,
  type RiskClassification,
} from "../../module-vigil/src/approval-contract";

/** A synthetic dispatch target (dev data — NOT a registered platform agent, Constraint #10). */
export interface SyntheticDispatchAgent {
  agent_id: string;
  agent_class: ApprovalAgentClass;
  capabilities: string[];
}

/**
 * The synthetic dispatch roster — names mirror the AgentOS agents VIGIL's Session 10
 * synthetic seeds already reference (agentos-deployer / -exporter / -configurator), so the
 * approval requests AgentOS produces line up with what VIGIL was built to display.
 */
export const SYNTHETIC_DISPATCH_AGENTS: readonly SyntheticDispatchAgent[] = [
  { agent_id: "agentos-deployer", agent_class: "Operational", capabilities: ["model_deployment"] },
  { agent_id: "agentos-exporter", agent_class: "Operational", capabilities: ["data_export"] },
  { agent_id: "agentos-configurator", agent_class: "Operational", capabilities: ["configuration_change"] },
];

/**
 * Deterministically select a dispatch target for a task (synthetic/dev). Deterministic
 * (no clock, no randomness) so the same task always routes to the same agent — capability-
 * and load-based routing is future work. Always returns an agent (the roster is non-empty).
 */
export function selectAgentForTask(task: Task): SyntheticDispatchAgent {
  const sum = [...task.task_id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return SYNTHETIC_DISPATCH_AGENTS[sum % SYNTHETIC_DISPATCH_AGENTS.length];
}

/**
 * Build the AgentAssignment for a task + agent (spec §3.4). Enforces the GD-10 boundary
 * first — an unauthorized classification throws before any assignment is produced.
 */
export function buildAssignment(task: Task, agent: SyntheticDispatchAgent, nowIso: string): AgentAssignment {
  assertClassificationAuthorized(task.data_classification); // GD-10 — reject before processing
  return {
    task_id: task.task_id,
    agent_id: agent.agent_id,
    agent_class: agent.agent_class,
    assigned_at: nowIso,
    requires_approval: task.requires_approval,
  };
}

/** The request id AgentOS uses for a task's approval request. */
export function approvalRequestId(taskId: string): string {
  return `agentos-req-${taskId}`;
}

/**
 * Build the AgentApprovalRequest AgentOS submits to VIGIL for a task requiring approval
 * (spec §3.4 / §3.5). The request carries the TASK's workflow_step_id so AgentOS's lifecycle
 * events and the submitted request share one audit id (Constraint #6). Synthetic risk
 * defaults to P2 — task risk classification is future work; the task carries no risk field.
 */
export function buildApprovalRequest(
  task: Task,
  agent: SyntheticDispatchAgent,
  nowIso: string,
  risk: RiskClassification = "P2"
): AgentApprovalRequest {
  assertClassificationAuthorized(task.data_classification); // GD-10 — reject before processing
  return {
    request_id: approvalRequestId(task.task_id),
    requesting_agent_id: agent.agent_id,
    requesting_agent_class: agent.agent_class,
    action_type: "agent_task",
    action_detail: {
      synthetic: true,
      task_id: task.task_id,
      title: task.title,
      data_classification: task.data_classification,
    },
    risk_classification: risk,
    submitted_at: nowIso,
    expires_at: computeExpiresAt(nowIso, risk),
    workflow_step_id: task.workflow_step_id,
    context: task.description,
  };
}

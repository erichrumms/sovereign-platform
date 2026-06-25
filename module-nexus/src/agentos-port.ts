/**
 * SOVEREIGN Platform — module-nexus
 * agentos-port.ts — the injectable AgentOS port (NEXUS → AgentOS hand-off) + dev backing.
 *
 * NEXUS is a work-request INTAKE + routing surface; it hands execution to AgentOS through
 * this PORT, NOT a direct AgentOS API call (Standing Constraints #1 / #3 — same injectable-
 * port pattern as VIGIL's AgentApprovalPort and CPMI's WorldModelPort). This session the
 * backing is SYNTHETIC/DEV (Governance Clock OFF): submitTask records a synthetic AgentOS
 * task and returns its id; getTaskStatus reports the AgentOS TaskStatus. The live AgentOS
 * backing is injected by configuration in a later session — no NEXUS rewrite (Constraint #3).
 *
 * `TaskStatus` is reused from module-agentos (Standing Constraint #2 — not redefined).
 *
 * Version: 1.0 · Session 15 · June 24, 2026
 */

import type { TaskStatus } from "../../module-agentos/src/agentos-contract";

/** What NEXUS hands to AgentOS when it dispatches a routed request for execution. */
export interface AgentOSSubmitInput {
  request_id: string;
  request_type: string;
  agent_class: string;
  requires_approval: boolean;
  data_classification: string;
  workflow_step_id: string;
}

/** The injectable AgentOS port. submitTask() returns the AgentOS task id; getTaskStatus() polls it. */
export interface AgentOSPort {
  submitTask: (input: AgentOSSubmitInput) => string;
  getTaskStatus: (taskId: string) => TaskStatus;
}

/** The dev port adds a seam to drive the synthetic AgentOS task status (Governance Clock OFF). */
export interface DevAgentOSPort extends AgentOSPort {
  setTaskStatus: (taskId: string, status: TaskStatus) => void;
}

/** The AgentOS task id NEXUS uses for a request's submitted work. */
export function nexusAgentOSTaskId(requestId: string): string {
  return `agentos-task-nexus-${requestId}`;
}

/**
 * The default SYNTHETIC/DEV AgentOS port. A submitted task starts ASSIGNED in AgentOS
 * (synthetic — no live orchestration). Replace by injecting a live AgentOSPort
 * (configuration change, Constraint #3) when AgentOS↔NEXUS A2A is wired.
 */
export function createSyntheticAgentOSPort(): DevAgentOSPort {
  const tasks = new Map<string, TaskStatus>();
  return {
    submitTask: (input: AgentOSSubmitInput): string => {
      const taskId = nexusAgentOSTaskId(input.request_id);
      tasks.set(taskId, "ASSIGNED");
      return taskId;
    },
    getTaskStatus: (taskId: string): TaskStatus => tasks.get(taskId) ?? "CREATED",
    setTaskStatus: (taskId: string, status: TaskStatus): void => {
      if (tasks.has(taskId)) tasks.set(taskId, status);
    },
  };
}

/**
 * SOVEREIGN Platform — module-agentos
 * nexus-agentos-port.ts — the LIVE AgentOS backing for the NEXUS → AgentOS hand-off (Session 18, D3).
 *
 * NEXUS hands routed work to AgentOS through its injectable `AgentOSPort` (module-nexus/
 * agentos-port.ts). Session 15 shipped only a SYNTHETIC backing that recorded a status in a
 * private Map — so a NEXUS submission produced no real AgentOS task and emitted no AgentOS
 * event (the Walkthrough A observation: the submission "did not appear in AgentOS"). This file
 * provides the real backing: the downstream provider (AgentOS) implements the upstream
 * consumer's (NEXUS) port — the same pattern by which AgentOS provides VIGIL's AgentApprovalPort
 * (spec 11_AgentOS_Architecture.md §3.5). It is injected into NEXUS by configuration in place of
 * the synthetic port — no NEXUS rewrite (Standing Constraint #3).
 *
 * On submitTask it CREATES a real AgentOS `Task` via the module's own pure registry
 * (createTask → assignTask — Constraint #1, no independent task system) and emits the canonical
 * AGENTOS_TASK_ASSIGNED Logger event (an existing event type — NO shell-contract change). The
 * task carries the originating NEXUS request_id for traceability, and its workflow_step_id is
 * `agentos-task-nexus-<request_id>` — exactly the value NEXUS records as the request's
 * `agentos_task_id`, so getTaskStatus(...) reconciles against the NEXUS-side id.
 *
 * Gate 2 fail-closed: if the AGENTOS_TASK_ASSIGNED emit throws, the task is NOT stored (no
 * ungoverned task entry). submitTask never throws (it returns the id string the port contract
 * requires) so it cannot break the NEXUS handler that already logged NEXUS_REQUEST_IN_PROGRESS.
 *
 * SCOPE BOUNDARY (documented, not built this session): this backing makes the hand-off real at
 * the Logger/audit-trail + task-entry level. Surfacing the created task inside the AgentOS UI
 * panel requires a task store shared between this port and module-agentos's `useTaskRegistry`
 * hook — i.e. a shell-level shared-state surface (Standing Constraint #7 — shell context frozen
 * at eight exports) — which is a shell-contract design decision not authorized this session.
 *
 * Version: 1.0 · Session 18 · June 26, 2026
 */

import type { SovereignShellContext, SovereignLogEvent, ClearanceLevel } from "../../sovereign-shell/shell-contract";
import type { AgentOSPort, AgentOSSubmitInput } from "../../module-nexus/src/agentos-port";

import { type Task, type TaskStatus, eventTypeForTransition, taskWorkflowStep } from "./agentos-contract";
import { createTask, assignTask, getTask } from "./task-registry";

/** The orchestrator that owns a NEXUS-routed task until a specific agent runs it (mirrors useTaskRegistry). */
const AGENTOS_ORCHESTRATOR = "agentos-orchestrator";

/** The AgentOS Task.task_id for a NEXUS request — `nexus-<request_id>` (matches the e2e harness convention). */
export function nexusTaskId(requestId: string): string {
  return `nexus-${requestId}`;
}

/** A live AgentOS-backed AgentOSPort, plus a read seam so a UI/test can inspect the created tasks. */
export interface AgentOSBackedPort extends AgentOSPort {
  /** The AgentOS tasks created from NEXUS hand-offs so far (newest last). Read-only snapshot. */
  listTasks: () => Task[];
  /** Look up a created task by its AgentOS Task.task_id (`nexus-<request_id>`). */
  getTask: (taskId: string) => Task | undefined;
}

/**
 * Create the live AgentOS backing for NEXUS's AgentOSPort. Each submitTask creates and assigns
 * a real AgentOS task and emits AGENTOS_TASK_ASSIGNED through the platform logger (ctx).
 */
export function createAgentOSBackedPort(ctx: SovereignShellContext): AgentOSBackedPort {
  // Keyed by the workflow-step id NEXUS uses as the request's agentos_task_id
  // (`agentos-task-nexus-<request_id>`), so getTaskStatus reconciles against the NEXUS-side id.
  const tasksByWorkflowStep = new Map<string, Task>();
  const operatorId = ctx.auth.user.employee_id;

  const submitTask = (input: AgentOSSubmitInput): string => {
    const taskId = nexusTaskId(input.request_id);
    const workflowStep = taskWorkflowStep(taskId); // agentos-task-nexus-<request_id>
    const nowIso = new Date().toISOString();

    // Build the real AgentOS task: CREATED → ASSIGNED (Constraint #1 — the module's own registry).
    const created = createTask(
      {
        task_id: taskId,
        title: `${input.request_type} (NEXUS ${input.request_id})`,
        description: `Routed from NEXUS work request ${input.request_id} for ${input.agent_class} execution.`,
        requires_approval: input.requires_approval,
        data_classification: input.data_classification as ClearanceLevel, // UNCLASSIFIED at NEXUS intake (GD-10)
      },
      nowIso
    );
    const [assigned] = assignTask([created], taskId, AGENTOS_ORCHESTRATOR, nowIso);

    const event: SovereignLogEvent = {
      event_type: eventTypeForTransition("ASSIGNED"), // AGENTOS_TASK_ASSIGNED
      workflow_step_id: workflowStep, // Constraint #6 — same id NEXUS records as agentos_task_id
      sovereign_tier: "standard",
      product: "AGENTOS",
      actor_id: AGENTOS_ORCHESTRATOR,
      actor: "agent",
      agent_id: AGENTOS_ORCHESTRATOR,
      outcome: "agentos_task_assigned",
      payload: {
        task_id: taskId,
        request_id: input.request_id, // traceability back to the originating NEXUS request
        request_type: input.request_type,
        agent_class: input.agent_class,
        requires_approval: input.requires_approval,
        data_classification: input.data_classification,
        from: "CREATED",
        to: "ASSIGNED",
        nexus_operator_id: operatorId,
      },
    };

    // --- Gate 2 fail-closed: a failed emit produces no stored task (no ungoverned entry). ---
    try {
      ctx.logger.log(event);
    } catch {
      return workflowStep; // not stored; getTaskStatus will report CREATED
    }
    tasksByWorkflowStep.set(workflowStep, assigned);
    return workflowStep;
  };

  const getTaskStatus = (taskId: string): TaskStatus => tasksByWorkflowStep.get(taskId)?.status ?? "CREATED";

  const listTasks = (): Task[] => Array.from(tasksByWorkflowStep.values());

  const getTaskById = (taskId: string): Task | undefined => getTask(listTasks(), taskId);

  return { submitTask, getTaskStatus, listTasks, getTask: getTaskById };
}

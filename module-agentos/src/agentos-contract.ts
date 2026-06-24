/**
 * SOVEREIGN Platform — module-agentos
 * agentos-contract.ts — the AgentOS task-lifecycle contract (GD-9 + GD-10).
 *
 * Owns the shapes and the state machine the task registry, dispatcher, approval port, and
 * panels share: the Task shape (spec §3.3), the eight-status lifecycle (spec §3.2), the
 * allowed-transition map, the GD-9 Logger-event mapping, the human-decision mapping
 * (Standing Constraint #4), and the per-task workflow_step_id invariant (Constraint #6).
 *
 * Shared shapes are reused, never redefined (Standing Constraint #2): ValidationResult and
 * ClearanceLevel come from @sovereign/data; the SovereignEventType / HumanDecisionType
 * taxonomies come from the shell contract; the GD-10 classification boundary comes from
 * @sovereign/api-client (no divergent duplicate of the authorization rule).
 *
 * Version: 1.0 · Session 14 · June 24, 2026
 */

import type { ValidationResult } from "@sovereign/data";
import { CLEARANCE_LEVELS } from "@sovereign/data";
import type { ClearanceLevel } from "@sovereign/api-client";

import type { SovereignEventType, HumanDecisionType } from "../../sovereign-shell/shell-contract";

// ============================================================
// TASK LIFECYCLE STATES (spec §3.2)
// ============================================================

export type TaskStatus =
  | "CREATED"
  | "ASSIGNED"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "COMPLETE"
  | "CANCELLED";

/** Runtime mirror of the TaskStatus union (validation / UI reuse). */
export const TASK_STATUSES: readonly TaskStatus[] = [
  "CREATED",
  "ASSIGNED",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
  "IN_PROGRESS",
  "COMPLETE",
  "CANCELLED",
];

/** Terminal states — no outgoing transition except they are already final. */
export const TERMINAL_STATUSES: readonly TaskStatus[] = ["COMPLETE", "CANCELLED"];

/**
 * The allowed task transitions (spec §3.2). CANCELLED is reachable from every non-terminal
 * state ("Any → CANCELLED", incl. REJECTED → CANCELLED per the lifecycle diagram). COMPLETE
 * and CANCELLED are terminal.
 */
export const ALLOWED_TRANSITIONS: Readonly<Record<TaskStatus, readonly TaskStatus[]>> = {
  CREATED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["PENDING_APPROVAL", "CANCELLED"],
  PENDING_APPROVAL: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["IN_PROGRESS", "CANCELLED"],
  REJECTED: ["CANCELLED"],
  IN_PROGRESS: ["COMPLETE", "CANCELLED"],
  COMPLETE: [],
  CANCELLED: [],
};

/** Whether `from → to` is an allowed task-lifecycle transition. */
export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function isTerminal(status: TaskStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

// ============================================================
// GD-9 EVENT + DECISION MAPPING
// ============================================================

/** Map a transition's target status to its GD-9 Logger event type (spec §3.2). */
export function eventTypeForTransition(to: TaskStatus): SovereignEventType {
  switch (to) {
    case "ASSIGNED":
      return "AGENTOS_TASK_ASSIGNED";
    case "PENDING_APPROVAL":
      return "AGENTOS_APPROVAL_REQUESTED";
    case "APPROVED":
      return "AGENTOS_TASK_APPROVED";
    case "REJECTED":
      return "AGENTOS_TASK_REJECTED";
    case "IN_PROGRESS":
      return "AGENTOS_TASK_STARTED";
    case "COMPLETE":
      return "AGENTOS_TASK_COMPLETE";
    case "CANCELLED":
      return "AGENTOS_TASK_CANCELLED";
    case "CREATED":
      // CREATED is the initial state, not a transition target with an event.
      throw new Error("CREATED is the initial state and has no transition event");
  }
}

/**
 * Whether a transition is a human decision routed through VIGIL (Standing Constraint #4 —
 * a human decision event carries decision_type and actor "human"). APPROVED / REJECTED are
 * the VIGIL approval decision; CANCELLED is a Project Principal cancellation.
 */
export function isHumanTransition(to: TaskStatus): boolean {
  return to === "APPROVED" || to === "REJECTED" || to === "CANCELLED";
}

/**
 * The decision_type a human transition carries (Constraint #4). APPROVED and REJECTED are
 * both the human's task-approval decision (TASK_APPROVAL) — the event type and outcome
 * distinguish approve from reject, mirroring VIGIL's AGENT_APPROVAL. CANCELLED carries
 * TASK_CANCELLATION. Agent/system transitions carry no decision_type.
 */
export function decisionTypeForTransition(to: TaskStatus): HumanDecisionType | undefined {
  switch (to) {
    case "APPROVED":
    case "REJECTED":
      return "TASK_APPROVAL";
    case "CANCELLED":
      return "TASK_CANCELLATION";
    default:
      return undefined;
  }
}

/**
 * Per-task workflow_step_id — every Logger event across a task's lifecycle shares it so the
 * audit trail ties the lifecycle together (Standing Constraint #6).
 */
export function taskWorkflowStep(taskId: string): string {
  return `agentos-task-${taskId}`;
}

// ============================================================
// TASK SHAPE (spec §3.3)
// ============================================================

export interface Task {
  task_id: string;
  title: string;
  description: string;
  assigned_agent_id?: string;
  status: TaskStatus;
  requires_approval: boolean;
  /** Drives which inference provider handles AI work in the task (ClearanceLevel — Constraint #2). */
  data_classification: ClearanceLevel;
  created_at: string;
  updated_at: string;
  workflow_step_id: string;
}

/** The fields a caller supplies to create a task; the registry fills in the rest. */
export interface CreateTaskInput {
  task_id: string;
  title: string;
  description: string;
  requires_approval: boolean;
  data_classification: ClearanceLevel;
}

// ============================================================
// AGENT ASSIGNMENT (spec §3.4)
// ============================================================

export interface AgentAssignment {
  task_id: string;
  agent_id: string;
  agent_class: string;
  assigned_at: string;
  requires_approval: boolean;
}

// ============================================================
// VALIDATION (reuses @sovereign/data ValidationResult — Constraint #2)
// ============================================================

/** Validate a create-task input (a malformed task is never registered). */
export function validateCreateTaskInput(value: unknown): ValidationResult {
  if (typeof value !== "object" || value === null) {
    return { valid: false, errors: ["task input must be a non-null object"] };
  }
  const errors: string[] = [];
  const t = value as Partial<CreateTaskInput>;
  const str = (v: unknown): boolean => typeof v === "string" && v.trim() !== "";

  if (!str(t.task_id)) errors.push("task_id: required non-empty string");
  if (!str(t.title)) errors.push("title: required non-empty string");
  if (!str(t.description)) errors.push("description: required non-empty string");
  if (typeof t.requires_approval !== "boolean") errors.push("requires_approval: required boolean");
  if (!CLEARANCE_LEVELS.includes(t.data_classification as ClearanceLevel)) {
    errors.push(`data_classification: must be one of ${CLEARANCE_LEVELS.join(" | ")}`);
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

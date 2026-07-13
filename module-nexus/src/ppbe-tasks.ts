/**
 * SOVEREIGN Platform — module-nexus
 * ppbe-tasks.ts — PPBE task and correspondence schemas (Session 31, D4).
 *
 * docs/18 §7.1 NEXUS scope: "PPBE task and correspondence schemas added, carrying
 * program_id and objective_id." Done condition: "NEXUS tracks a PPBE task with
 * traceability to program_id and objective_id."
 *
 * DESIGN (Constraints #2/#3 — reuse, don't duplicate): a PPBE task IS NEXUS work
 * execution (architecture doc: "NEXUS managing work execution"), so its lifecycle
 * rides the EXISTING GD-11 work-request state machine (WorkRequestStatus,
 * ALLOWED_TRANSITIONS, NEXUS_REQUEST_* events) rather than a parallel one. This is
 * the opposite of the Session 29 TT-intake determination — a TravelRequest is a
 * canonical D-TT3 entity with its own lifecycle, while a PPBE task is a unit of
 * work — and both determinations follow the same rule: reuse the machine when the
 * thing is a work request; keep it out when it isn't.
 *
 * The PPBE task-type taxonomy below is MODULE-LOCAL, same as WorkRequestType
 * (verified module-local by the Session 29 governance check — not a shell-contract
 * type). WorkRequestType itself is deliberately NOT widened: PPBE tasks are
 * tracked as their own schema with the GD-11 status machine reused, so the five
 * GD-11 request types and their routing table are untouched.
 *
 * Pure and deterministic — no Logger emission here; hosts emit the existing
 * NEXUS_REQUEST_* events via eventTypeForStatus, exactly as useRequestRegistry
 * does for work requests.
 */

import type { ClearanceLevel, ValidationResult } from "@sovereign/data";
import type { WorkRequestStatus } from "./nexus-contract";
import { canTransition } from "./nexus-contract";

// ============================================================
// PPBE TASK TAXONOMY — module-local (see governance note above)
// ============================================================

/** The kinds of PPBE work NEXUS tracks across the six phases (docs/18 §7.1). */
export type PPBETaskType =
  | "PHASE_ACTION"          // a work item inside one phase's workflow
  | "EVIDENCE_ASSEMBLY"     // Phase 2 evidence-base work
  | "EXHIBIT_PREPARATION"   // Phase 4 budget-exhibit work
  | "EVALUATION_REVIEW"     // Phase 6 finding review work
  | "COORDINATION_ITEM";    // governance-calendar follow-up work

export const PPBE_TASK_TYPES: readonly PPBETaskType[] = [
  "PHASE_ACTION",
  "EVIDENCE_ASSEMBLY",
  "EXHIBIT_PREPARATION",
  "EVALUATION_REVIEW",
  "COORDINATION_ITEM",
];

// ============================================================
// PPBE TASK SCHEMA (docs/18 §7.1 — traceability is the point)
// ============================================================

/**
 * A PPBE unit of work tracked by NEXUS. Lifecycle status is the GD-11
 * WorkRequestStatus (reused, not duplicated). Every task carries the full
 * traceability pair — program_id AND objective_id — plus the PPBE phase it
 * belongs to and workflow_step_id (Constraint #6).
 */
export interface PPBETask {
  task_id: string;
  title: string;
  /** Plain prose (Gap 5). */
  description: string;
  task_type: PPBETaskType;
  status: WorkRequestStatus;
  /** FK → ProgramRecord — the traceability chain. */
  program_id: string;
  /** FK → StrategicObjective — the traceability chain. */
  objective_id: string;
  /** The PPBE phase (1-6) this work belongs to. */
  phase: number;
  data_classification: ClearanceLevel;
  requester_id: string;
  created_at: string;
  updated_at: string;
  workflow_step_id: string;
}

/**
 * A PPBE correspondence record tracked by NEXUS — same traceability pair as a
 * task. Correspondence is a record of communication, not a lifecycle item: it has
 * no status machine.
 */
export interface PPBECorrespondence {
  correspondence_id: string;
  subject: string;
  /** Plain prose (Gap 5). */
  body: string;
  /** FK → ProgramRecord. */
  program_id: string;
  /** FK → StrategicObjective. */
  objective_id: string;
  /** The task this correspondence relates to, when there is one. */
  related_task_id?: string;
  data_classification: ClearanceLevel;
  author_id: string;
  created_at: string;
  workflow_step_id: string;
}

// ============================================================
// VALIDATION
// ============================================================

const CLEARANCE_VALUES = ["UNCLASSIFIED", "CUI", "SECRET", "TOP_SECRET"] as const;
const PPBE_PHASE_RANGE = [1, 2, 3, 4, 5, 6] as const;

export function validatePPBETask(task: unknown): ValidationResult {
  const errors: string[] = [];
  const t = task as Partial<PPBETask>;

  for (const key of [
    "task_id",
    "title",
    "description",
    "program_id",
    "objective_id",
    "requester_id",
    "created_at",
    "updated_at",
    "workflow_step_id",
  ] as const) {
    if (typeof t[key] !== "string" || (t[key] as string).trim() === "") {
      errors.push(`${key}: required string`);
    }
  }
  if (!PPBE_TASK_TYPES.includes(t.task_type as PPBETaskType)) {
    errors.push(`task_type: must be one of ${PPBE_TASK_TYPES.join(", ")}`);
  }
  if (!(PPBE_PHASE_RANGE as readonly number[]).includes(t.phase as number)) {
    errors.push("phase: must be one of the six PPBE phases (1-6)");
  }
  if (!(CLEARANCE_VALUES as readonly string[]).includes(t.data_classification as string)) {
    errors.push(`data_classification: must be one of ${CLEARANCE_VALUES.join(", ")}`);
  }
  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

export function validatePPBECorrespondence(correspondence: unknown): ValidationResult {
  const errors: string[] = [];
  const c = correspondence as Partial<PPBECorrespondence>;

  for (const key of [
    "correspondence_id",
    "subject",
    "body",
    "program_id",
    "objective_id",
    "author_id",
    "created_at",
    "workflow_step_id",
  ] as const) {
    if (typeof c[key] !== "string" || (c[key] as string).trim() === "") {
      errors.push(`${key}: required string`);
    }
  }
  if (
    c.related_task_id !== undefined &&
    (typeof c.related_task_id !== "string" || c.related_task_id.trim() === "")
  ) {
    errors.push("related_task_id: must be a non-empty string when present");
  }
  if (!(CLEARANCE_VALUES as readonly string[]).includes(c.data_classification as string)) {
    errors.push(`data_classification: must be one of ${CLEARANCE_VALUES.join(", ")}`);
  }
  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

// ============================================================
// TRACKING (done condition — "NEXUS tracks a PPBE task with traceability")
// ============================================================

/** Constraint #6 — per-task, stable, joinable to the audit trail. */
export function ppbeTaskWorkflowStep(taskId: string): string {
  return `nexus-ppbe-task-${taskId}`;
}

/**
 * Transition a PPBE task through the GD-11 state machine. Returns the updated
 * task, or null when the transition is illegal (callers surface, never force).
 */
export function transitionPPBETask(
  task: PPBETask,
  to: WorkRequestStatus,
  at: string
): PPBETask | null {
  if (!canTransition(task.status, to)) return null;
  return { ...task, status: to, updated_at: at };
}

/** Every task tracing to a program — the §7.1 traceability read path. */
export function tasksForProgram(tasks: readonly PPBETask[], programId: string): PPBETask[] {
  return tasks.filter((t) => t.program_id === programId);
}

/** Every task tracing to a strategic objective — the §7.1 traceability read path. */
export function tasksForObjective(tasks: readonly PPBETask[], objectiveId: string): PPBETask[] {
  return tasks.filter((t) => t.objective_id === objectiveId);
}

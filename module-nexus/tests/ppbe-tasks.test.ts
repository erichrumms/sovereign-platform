/**
 * PPBE task and correspondence schema tests — Session 31 (D4).
 * docs/18 §7.1: NEXUS tracks PPBE tasks and correspondence carrying program_id
 * and objective_id traceability; lifecycle rides the existing GD-11 work-request
 * state machine (Constraints #2/#3 — reused, not duplicated).
 */

import {
  PPBE_TASK_TYPES,
  validatePPBETask,
  validatePPBECorrespondence,
  ppbeTaskWorkflowStep,
  transitionPPBETask,
  tasksForProgram,
  tasksForObjective,
  type PPBETask,
  type PPBECorrespondence,
} from "../src/ppbe-tasks";

const task: PPBETask = {
  task_id: "PT-1",
  title: "Assemble Phase 2 evidence base",
  description: "Collect evaluation findings and capability gap assessments for programming.",
  task_type: "EVIDENCE_ASSEMBLY",
  status: "SUBMITTED",
  program_id: "PRG-001",
  objective_id: "SO-2027-01",
  phase: 2,
  data_classification: "UNCLASSIFIED",
  requester_id: "emp_001",
  created_at: "2026-07-12T16:00:00Z",
  updated_at: "2026-07-12T16:00:00Z",
  workflow_step_id: "nexus-ppbe-task-PT-1",
};

const correspondence: PPBECorrespondence = {
  correspondence_id: "PC-1",
  subject: "Evidence base handoff schedule",
  body: "The approved evidence base will be delivered to programming by Friday.",
  program_id: "PRG-001",
  objective_id: "SO-2027-01",
  related_task_id: "PT-1",
  data_classification: "UNCLASSIFIED",
  author_id: "emp_001",
  created_at: "2026-07-12T16:05:00Z",
  workflow_step_id: "nexus-ppbe-corr-PC-1",
};

describe("PPBE task schema", () => {
  it("declares the five module-local task types", () =>
    expect(PPBE_TASK_TYPES).toEqual([
      "PHASE_ACTION",
      "EVIDENCE_ASSEMBLY",
      "EXHIBIT_PREPARATION",
      "EVALUATION_REVIEW",
      "COORDINATION_ITEM",
    ]));

  it("accepts a valid task", () => expect(validatePPBETask(task)).toEqual({ valid: true }));

  it("requires BOTH traceability links (program_id and objective_id)", () => {
    expect(validatePPBETask({ ...task, program_id: "" }).valid).toBe(false);
    expect(validatePPBETask({ ...task, objective_id: "" }).valid).toBe(false);
  });

  it("rejects an unknown task_type and an out-of-range phase", () => {
    expect(validatePPBETask({ ...task, task_type: "MISC" }).valid).toBe(false);
    expect(validatePPBETask({ ...task, phase: 7 }).valid).toBe(false);
  });

  it("requires workflow_step_id (Constraint #6) and derives it stably", () => {
    expect(validatePPBETask({ ...task, workflow_step_id: "" }).valid).toBe(false);
    expect(ppbeTaskWorkflowStep("PT-1")).toBe("nexus-ppbe-task-PT-1");
  });
});

describe("PPBE task lifecycle (GD-11 state machine reused)", () => {
  it("allows a legal transition and stamps updated_at", () => {
    const routed = transitionPPBETask(task, "ROUTED", "2026-07-12T16:10:00Z");
    expect(routed).toMatchObject({ status: "ROUTED", updated_at: "2026-07-12T16:10:00Z" });
  });

  it("returns null on an illegal jump (surface, never force)", () => {
    expect(transitionPPBETask(task, "COMPLETE", "2026-07-12T16:10:00Z")).toBeNull();
  });

  it("walks the full no-approval path SUBMITTED → ROUTED → IN_PROGRESS → COMPLETE", () => {
    const at = "2026-07-12T16:10:00Z";
    const complete = transitionPPBETask(
      transitionPPBETask(transitionPPBETask(task, "ROUTED", at)!, "IN_PROGRESS", at)!,
      "COMPLETE",
      at
    );
    expect(complete?.status).toBe("COMPLETE");
  });
});

describe("PPBE traceability read paths (done condition)", () => {
  const other: PPBETask = { ...task, task_id: "PT-2", program_id: "PRG-002", objective_id: "SO-2027-02" };

  it("tracks tasks by program_id", () => {
    expect(tasksForProgram([task, other], "PRG-001").map((t) => t.task_id)).toEqual(["PT-1"]);
  });

  it("tracks tasks by objective_id", () => {
    expect(tasksForObjective([task, other], "SO-2027-02").map((t) => t.task_id)).toEqual(["PT-2"]);
  });
});

describe("PPBE correspondence schema", () => {
  it("accepts valid correspondence", () =>
    expect(validatePPBECorrespondence(correspondence)).toEqual({ valid: true }));

  it("requires the traceability pair", () => {
    expect(validatePPBECorrespondence({ ...correspondence, program_id: "" }).valid).toBe(false);
    expect(validatePPBECorrespondence({ ...correspondence, objective_id: "" }).valid).toBe(false);
  });

  it("accepts correspondence without a related task, rejects an empty related_task_id", () => {
    const { related_task_id: _omitted, ...rest } = correspondence;
    expect(validatePPBECorrespondence(rest)).toEqual({ valid: true });
    expect(validatePPBECorrespondence({ ...correspondence, related_task_id: "" }).valid).toBe(false);
  });
});

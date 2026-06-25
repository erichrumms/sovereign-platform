/**
 * module-agentos — agentos-contract.test.ts
 * The task-lifecycle state machine: the allowed-transition map (spec §3.2), the GD-9 event
 * mapping, the human-decision mapping (Constraint #4), the workflow_step_id invariant
 * (Constraint #6), and create-input validation.
 */
import {
  TASK_STATUSES,
  TERMINAL_STATUSES,
  ALLOWED_TRANSITIONS,
  canTransition,
  isTerminal,
  eventTypeForTransition,
  isHumanTransition,
  decisionTypeForTransition,
  taskWorkflowStep,
  validateCreateTaskInput,
  type TaskStatus,
} from "../src/agentos-contract";

describe("task lifecycle states", () => {
  it("declares the eight canonical statuses", () => {
    expect(TASK_STATUSES).toEqual([
      "CREATED", "ASSIGNED", "PENDING_APPROVAL", "APPROVED", "REJECTED", "IN_PROGRESS", "COMPLETE", "CANCELLED",
    ]);
  });

  it("COMPLETE and CANCELLED are terminal (no outgoing transitions)", () => {
    expect(TERMINAL_STATUSES).toEqual(["COMPLETE", "CANCELLED"]);
    expect(ALLOWED_TRANSITIONS.COMPLETE).toEqual([]);
    expect(ALLOWED_TRANSITIONS.CANCELLED).toEqual([]);
    expect(isTerminal("COMPLETE")).toBe(true);
    expect(isTerminal("ASSIGNED")).toBe(false);
  });
});

describe("canTransition — the spec §3.2 transition table", () => {
  it("allows the canonical happy path", () => {
    expect(canTransition("CREATED", "ASSIGNED")).toBe(true);
    expect(canTransition("ASSIGNED", "PENDING_APPROVAL")).toBe(true);
    expect(canTransition("PENDING_APPROVAL", "APPROVED")).toBe(true);
    expect(canTransition("PENDING_APPROVAL", "REJECTED")).toBe(true);
    expect(canTransition("APPROVED", "IN_PROGRESS")).toBe(true);
    expect(canTransition("IN_PROGRESS", "COMPLETE")).toBe(true);
  });

  it("allows ASSIGNED → IN_PROGRESS directly for the requires_approval=false path (D3b)", () => {
    expect(canTransition("ASSIGNED", "IN_PROGRESS")).toBe(true);
  });

  it("allows CANCELLED from every non-terminal state (incl. REJECTED)", () => {
    const nonTerminal: TaskStatus[] = ["CREATED", "ASSIGNED", "PENDING_APPROVAL", "APPROVED", "REJECTED", "IN_PROGRESS"];
    for (const s of nonTerminal) expect(canTransition(s, "CANCELLED")).toBe(true);
  });

  it("rejects illegal jumps", () => {
    expect(canTransition("CREATED", "IN_PROGRESS")).toBe(false);
    expect(canTransition("CREATED", "APPROVED")).toBe(false);
    expect(canTransition("COMPLETE", "CANCELLED")).toBe(false);
    expect(canTransition("CANCELLED", "ASSIGNED")).toBe(false);
    expect(canTransition("APPROVED", "REJECTED")).toBe(false);
  });
});

describe("GD-9 event + decision mapping", () => {
  it("maps each transition target to its AGENTOS_* event type", () => {
    expect(eventTypeForTransition("ASSIGNED")).toBe("AGENTOS_TASK_ASSIGNED");
    expect(eventTypeForTransition("PENDING_APPROVAL")).toBe("AGENTOS_APPROVAL_REQUESTED");
    expect(eventTypeForTransition("APPROVED")).toBe("AGENTOS_TASK_APPROVED");
    expect(eventTypeForTransition("REJECTED")).toBe("AGENTOS_TASK_REJECTED");
    expect(eventTypeForTransition("IN_PROGRESS")).toBe("AGENTOS_TASK_STARTED");
    expect(eventTypeForTransition("COMPLETE")).toBe("AGENTOS_TASK_COMPLETE");
    expect(eventTypeForTransition("CANCELLED")).toBe("AGENTOS_TASK_CANCELLED");
  });

  it("throws for CREATED (the initial state has no transition event)", () => {
    expect(() => eventTypeForTransition("CREATED")).toThrow();
  });

  it("flags APPROVED / REJECTED / CANCELLED as human transitions; others as agent", () => {
    expect(isHumanTransition("APPROVED")).toBe(true);
    expect(isHumanTransition("REJECTED")).toBe(true);
    expect(isHumanTransition("CANCELLED")).toBe(true);
    expect(isHumanTransition("ASSIGNED")).toBe(false);
    expect(isHumanTransition("PENDING_APPROVAL")).toBe(false);
    expect(isHumanTransition("IN_PROGRESS")).toBe(false);
    expect(isHumanTransition("COMPLETE")).toBe(false);
  });

  it("carries TASK_APPROVAL for approve/reject and TASK_CANCELLATION for cancel (Constraint #4)", () => {
    expect(decisionTypeForTransition("APPROVED")).toBe("TASK_APPROVAL");
    expect(decisionTypeForTransition("REJECTED")).toBe("TASK_APPROVAL");
    expect(decisionTypeForTransition("CANCELLED")).toBe("TASK_CANCELLATION");
    expect(decisionTypeForTransition("ASSIGNED")).toBeUndefined();
    expect(decisionTypeForTransition("IN_PROGRESS")).toBeUndefined();
  });
});

describe("taskWorkflowStep (Constraint #6)", () => {
  it("is per-task and stable", () => {
    expect(taskWorkflowStep("task-1")).toBe("agentos-task-task-1");
  });
});

describe("validateCreateTaskInput", () => {
  const good = { task_id: "task-1", title: "Refresh model", description: "d", requires_approval: true, data_classification: "UNCLASSIFIED" as const };

  it("accepts a well-formed input", () => {
    expect(validateCreateTaskInput(good)).toEqual({ valid: true });
  });

  it("rejects a non-object", () => {
    expect(validateCreateTaskInput(null).valid).toBe(false);
  });

  it("collects field errors", () => {
    const r = validateCreateTaskInput({ task_id: "", title: "", description: "", requires_approval: "yes", data_classification: "NATO" });
    expect(r.valid).toBe(false);
    if (!r.valid) {
      expect(r.errors.some((e) => e.includes("task_id"))).toBe(true);
      expect(r.errors.some((e) => e.includes("requires_approval"))).toBe(true);
      expect(r.errors.some((e) => e.includes("data_classification"))).toBe(true);
    }
  });
});

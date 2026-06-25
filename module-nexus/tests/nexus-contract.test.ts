/**
 * module-nexus — nexus-contract.test.ts
 * The work-request state machine: the five types, the six statuses, the allowed-transition
 * map, the GD-11 event mapping, the workflow_step_id invariant (Constraint #6), and
 * intake validation.
 */
import {
  WORK_REQUEST_TYPES,
  WORK_REQUEST_STATUSES,
  TERMINAL_STATUSES,
  ALLOWED_TRANSITIONS,
  canTransition,
  isTerminal,
  eventTypeForStatus,
  requestWorkflowStep,
  validateSubmitRequestInput,
  type WorkRequestStatus,
} from "../src/nexus-contract";

describe("work-request types and statuses", () => {
  it("declares the five work-request types", () => {
    expect(WORK_REQUEST_TYPES).toEqual([
      "DOCUMENT_REVIEW", "DATA_ANALYSIS", "COMPLIANCE_CHECK", "REPORT_GENERATION", "GOVERNANCE_QUERY",
    ]);
  });

  it("declares the six statuses; COMPLETE and REJECTED are terminal", () => {
    expect(WORK_REQUEST_STATUSES).toEqual([
      "SUBMITTED", "ROUTED", "PENDING_APPROVAL", "IN_PROGRESS", "COMPLETE", "REJECTED",
    ]);
    expect(TERMINAL_STATUSES).toEqual(["COMPLETE", "REJECTED"]);
    expect(ALLOWED_TRANSITIONS.COMPLETE).toEqual([]);
    expect(ALLOWED_TRANSITIONS.REJECTED).toEqual([]);
    expect(isTerminal("COMPLETE")).toBe(true);
    expect(isTerminal("SUBMITTED")).toBe(false);
  });
});

describe("canTransition — the lifecycle", () => {
  it("allows the no-approval path SUBMITTED → ROUTED → IN_PROGRESS → COMPLETE", () => {
    expect(canTransition("SUBMITTED", "ROUTED")).toBe(true);
    expect(canTransition("ROUTED", "IN_PROGRESS")).toBe(true);
    expect(canTransition("IN_PROGRESS", "COMPLETE")).toBe(true);
  });

  it("allows the approval path ROUTED → PENDING_APPROVAL → IN_PROGRESS / REJECTED", () => {
    expect(canTransition("ROUTED", "PENDING_APPROVAL")).toBe(true);
    expect(canTransition("PENDING_APPROVAL", "IN_PROGRESS")).toBe(true);
    expect(canTransition("PENDING_APPROVAL", "REJECTED")).toBe(true);
  });

  it("rejects illegal jumps", () => {
    expect(canTransition("SUBMITTED", "IN_PROGRESS")).toBe(false);
    expect(canTransition("SUBMITTED", "COMPLETE")).toBe(false);
    expect(canTransition("ROUTED", "COMPLETE")).toBe(false);
    expect(canTransition("COMPLETE", "IN_PROGRESS")).toBe(false);
    expect(canTransition("REJECTED", "IN_PROGRESS")).toBe(false);
    expect(canTransition("IN_PROGRESS", "REJECTED")).toBe(false);
  });
});

describe("GD-11 event mapping", () => {
  it("maps each status to its NEXUS_* event type (SUBMITTED is the intake event)", () => {
    const expected: Record<WorkRequestStatus, string> = {
      SUBMITTED: "NEXUS_REQUEST_SUBMITTED",
      ROUTED: "NEXUS_REQUEST_ROUTED",
      PENDING_APPROVAL: "NEXUS_APPROVAL_PENDING",
      IN_PROGRESS: "NEXUS_REQUEST_IN_PROGRESS",
      COMPLETE: "NEXUS_REQUEST_COMPLETE",
      REJECTED: "NEXUS_REQUEST_REJECTED",
    };
    for (const status of WORK_REQUEST_STATUSES) {
      expect(eventTypeForStatus(status)).toBe(expected[status]);
    }
  });
});

describe("requestWorkflowStep (Constraint #6)", () => {
  it("is per-request and stable", () => {
    expect(requestWorkflowStep("req-1")).toBe("nexus-request-req-1");
  });
});

describe("validateSubmitRequestInput", () => {
  const good = { request_id: "req-1", title: "Review SOW", description: "d", request_type: "DOCUMENT_REVIEW" as const, data_classification: "UNCLASSIFIED" as const, requester_id: "E-900" };

  it("accepts a well-formed input", () => {
    expect(validateSubmitRequestInput(good)).toEqual({ valid: true });
  });

  it("collects field errors", () => {
    const r = validateSubmitRequestInput({ request_id: "", title: "", description: "", request_type: "NOPE", data_classification: "NATO", requester_id: "" });
    expect(r.valid).toBe(false);
    if (!r.valid) {
      expect(r.errors.some((e) => e.includes("request_type"))).toBe(true);
      expect(r.errors.some((e) => e.includes("data_classification"))).toBe(true);
      expect(r.errors.some((e) => e.includes("requester_id"))).toBe(true);
    }
  });
});

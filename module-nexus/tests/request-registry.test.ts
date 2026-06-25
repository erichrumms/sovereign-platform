/**
 * module-nexus — request-registry.test.ts
 * The pure state machine: createRequest shape, each named transition, immutability,
 * illegal-transition rejection, and unknown-request rejection.
 */
import {
  createRequest,
  getRequest,
  transition,
  markRouted,
  markPendingApproval,
  markInProgress,
  markRejected,
  markComplete,
  RequestTransitionError,
  RequestNotFoundError,
} from "../src/request-registry";
import { routeRequest } from "../src/request-router";
import type { SubmitRequestInput, WorkRequest } from "../src/nexus-contract";

const NOW = "2026-06-24T12:00:00.000Z";
const LATER = "2026-06-24T12:05:00.000Z";

function input(over: Partial<SubmitRequestInput> = {}): SubmitRequestInput {
  return {
    request_id: "req-1",
    title: "Review SOW",
    description: "synthetic",
    request_type: "GOVERNANCE_QUERY",
    data_classification: "UNCLASSIFIED",
    requester_id: "E-900",
    ...over,
  };
}

describe("createRequest", () => {
  it("creates a SUBMITTED request with workflow_step_id and timestamps", () => {
    const r = createRequest(input(), NOW);
    expect(r.status).toBe("SUBMITTED");
    expect(r.workflow_step_id).toBe("nexus-request-req-1");
    expect(r.created_at).toBe(NOW);
    expect(r.assigned_agent_class).toBeUndefined();
  });
});

describe("named transitions are pure", () => {
  it("markRouted records the routing decision without mutating the input", () => {
    const before: WorkRequest[] = [createRequest(input(), NOW)];
    const after = markRouted(before, "req-1", routeRequest("GOVERNANCE_QUERY"), LATER);
    expect(after).not.toBe(before);
    expect(before[0].status).toBe("SUBMITTED");
    const r = getRequest(after, "req-1")!;
    expect(r.status).toBe("ROUTED");
    expect(r.assigned_agent_class).toBe("Governance");
    expect(r.requires_approval).toBe(true);
    expect(r.updated_at).toBe(LATER);
  });

  it("runs the approval path SUBMITTED → ROUTED → PENDING_APPROVAL → IN_PROGRESS → COMPLETE", () => {
    let reqs: WorkRequest[] = [createRequest(input(), NOW)];
    reqs = markRouted(reqs, "req-1", routeRequest("GOVERNANCE_QUERY"), NOW);
    reqs = markPendingApproval(reqs, "req-1", NOW);
    reqs = markInProgress(reqs, "req-1", "agentos-task-nexus-req-1", NOW);
    expect(getRequest(reqs, "req-1")!.agentos_task_id).toBe("agentos-task-nexus-req-1");
    reqs = markComplete(reqs, "req-1", NOW);
    expect(getRequest(reqs, "req-1")!.status).toBe("COMPLETE");
  });

  it("runs the no-approval path SUBMITTED → ROUTED → IN_PROGRESS directly", () => {
    let reqs: WorkRequest[] = [createRequest(input({ request_type: "DOCUMENT_REVIEW" }), NOW)];
    reqs = markRouted(reqs, "req-1", routeRequest("DOCUMENT_REVIEW"), NOW);
    reqs = markInProgress(reqs, "req-1", "agentos-task-nexus-req-1", NOW);
    expect(getRequest(reqs, "req-1")!.status).toBe("IN_PROGRESS");
  });

  it("supports the rejection branch PENDING_APPROVAL → REJECTED", () => {
    let reqs: WorkRequest[] = [createRequest(input(), NOW)];
    reqs = markRouted(reqs, "req-1", routeRequest("GOVERNANCE_QUERY"), NOW);
    reqs = markPendingApproval(reqs, "req-1", NOW);
    reqs = markRejected(reqs, "req-1", NOW);
    expect(getRequest(reqs, "req-1")!.status).toBe("REJECTED");
  });
});

describe("guards", () => {
  it("throws RequestTransitionError on an illegal transition and never mutates", () => {
    const reqs: WorkRequest[] = [createRequest(input(), NOW)];
    expect(() => markComplete(reqs, "req-1", NOW)).toThrow(RequestTransitionError);
    expect(reqs[0].status).toBe("SUBMITTED");
  });

  it("throws RequestNotFoundError for an unknown request id", () => {
    expect(() => transition([], "missing", "ROUTED", NOW)).toThrow(RequestNotFoundError);
  });

  it("cannot transition out of a terminal status", () => {
    let reqs: WorkRequest[] = [createRequest(input(), NOW)];
    reqs = markRouted(reqs, "req-1", routeRequest("GOVERNANCE_QUERY"), NOW);
    reqs = markPendingApproval(reqs, "req-1", NOW);
    reqs = markRejected(reqs, "req-1", NOW);
    expect(() => markInProgress(reqs, "req-1", "t", NOW)).toThrow(RequestTransitionError);
  });
});

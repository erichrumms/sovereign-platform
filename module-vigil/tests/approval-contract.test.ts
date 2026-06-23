/**
 * module-vigil — approval-contract.test.ts
 * Expiry windows (P1/P2/P3), workflow_step_id invariant, decision→event mapping, notes
 * validation, and request validation.
 */
import {
  computeExpiresAt,
  isExpired,
  minutesRemaining,
  approvalWorkflowStep,
  eventTypeForDecision,
  validateNotes,
  validateApprovalRequest,
  EXPIRY_MINUTES,
  type AgentApprovalRequest,
} from "../src/approval-contract";

const ANCHOR = "2026-06-23T12:00:00.000Z";
const anchorMs = Date.parse(ANCHOR);

function makeRequest(over: Partial<AgentApprovalRequest> = {}): AgentApprovalRequest {
  return {
    request_id: "req-1",
    requesting_agent_id: "agentos-deployer",
    requesting_agent_class: "Operational",
    action_type: "model_deployment",
    action_detail: { synthetic: true },
    risk_classification: "P1",
    submitted_at: ANCHOR,
    expires_at: computeExpiresAt(ANCHOR, "P1"),
    workflow_step_id: approvalWorkflowStep("req-1"),
    ...over,
  };
}

describe("expiry", () => {
  it("computes expires_at per the risk window (15/60/240 min)", () => {
    expect(EXPIRY_MINUTES).toEqual({ P1: 15, P2: 60, P3: 240 });
    expect(computeExpiresAt(ANCHOR, "P1")).toBe("2026-06-23T12:15:00.000Z");
    expect(computeExpiresAt(ANCHOR, "P2")).toBe("2026-06-23T13:00:00.000Z");
    expect(computeExpiresAt(ANCHOR, "P3")).toBe("2026-06-23T16:00:00.000Z");
  });

  it("isExpired is false before and true at/after expiry", () => {
    const r = makeRequest(); // P1 → expires anchor+15min
    expect(isExpired(r, anchorMs + 14 * 60_000)).toBe(false);
    expect(isExpired(r, anchorMs + 15 * 60_000)).toBe(true);
    expect(isExpired(r, anchorMs + 30 * 60_000)).toBe(true);
  });

  it("minutesRemaining is positive before expiry and negative after", () => {
    const r = makeRequest();
    expect(minutesRemaining(r, anchorMs + 5 * 60_000)).toBe(10);
    expect(minutesRemaining(r, anchorMs + 20 * 60_000)).toBe(-5);
  });
});

describe("workflow_step_id + decision mapping", () => {
  it("uses the vigil-approval-<requestId> invariant", () => {
    expect(approvalWorkflowStep("req-9")).toBe("vigil-approval-req-9");
  });

  it("maps decisions to GD-6 event types", () => {
    expect(eventTypeForDecision("APPROVE")).toBe("AGENT_ACTION_APPROVED");
    expect(eventTypeForDecision("REJECT")).toBe("AGENT_ACTION_REJECTED");
    expect(eventTypeForDecision("ESCALATE")).toBe("AGENT_ACTION_ESCALATED");
  });
});

describe("validation", () => {
  it("requires ≥10-char notes", () => {
    expect(validateNotes("too short")).toBe(false);
    expect(validateNotes("   ")).toBe(false);
    expect(validateNotes(undefined)).toBe(false);
    expect(validateNotes("this is a sufficiently long note")).toBe(true);
  });

  it("accepts a well-formed request", () => {
    expect(validateApprovalRequest(makeRequest())).toEqual({ valid: true });
  });

  it("rejects a missing field and a bad risk classification", () => {
    const noId = validateApprovalRequest(makeRequest({ request_id: "" }));
    expect(noId.valid).toBe(false);

    const badRisk = validateApprovalRequest({ ...makeRequest(), risk_classification: "P9" });
    expect(badRisk.valid).toBe(false);
    if (!badRisk.valid) expect(badRisk.errors).toContain("risk_classification: must be P1 | P2 | P3");
  });

  it("rejects a non-object", () => {
    expect(validateApprovalRequest(null).valid).toBe(false);
  });
});

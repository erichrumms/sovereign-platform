/**
 * module-vigil — approval-port.test.ts
 * The synthetic/dev AgentApprovalPort: three representative requests covering P1/P2/P3
 * and the three primary action types, anchored to the submission instant with correct
 * per-risk expiry.
 */
import { createDevApprovalPort, syntheticApprovalRequests } from "../src/approval-port";
import { computeExpiresAt } from "../src/approval-contract";

const ANCHOR = "2026-06-23T12:00:00.000Z";

describe("synthetic approval port", () => {
  it("provides three requests covering P1/P2/P3", () => {
    const reqs = createDevApprovalPort(ANCHOR).listPending();
    expect(reqs).toHaveLength(3);
    expect(reqs.map((r) => r.risk_classification).sort()).toEqual(["P1", "P2", "P3"]);
  });

  it("covers the three primary AgentOS action types", () => {
    const types = createDevApprovalPort(ANCHOR).listPending().map((r) => r.action_type);
    expect(new Set(types)).toEqual(new Set(["model_deployment", "data_export", "configuration_change"]));
  });

  it("anchors submitted_at and derives expiry from the risk window", () => {
    const reqs = syntheticApprovalRequests(ANCHOR);
    for (const r of reqs) {
      expect(r.submitted_at).toBe(ANCHOR);
      expect(r.expires_at).toBe(computeExpiresAt(ANCHOR, r.risk_classification));
      expect(r.workflow_step_id).toBe(`vigil-approval-${r.request_id}`);
    }
  });

  it("marks every synthetic action_detail as synthetic", () => {
    const reqs = syntheticApprovalRequests(ANCHOR);
    expect(reqs.every((r) => (r.action_detail as { synthetic?: boolean }).synthetic === true)).toBe(true);
  });
});

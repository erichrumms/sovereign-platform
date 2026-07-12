/**
 * module-vigil — tt-synthetic-alerts.test.ts (Session 29, D3)
 * The seeded TT queue items go through the REAL Session 28 adapter and honor
 * its governance decisions: sourceProduct "VIGIL" (TT-PRODUCT-GD Option 2),
 * TT_* names ONLY inside rawEvent, budget exhaustion at P1, and a
 * mount-anchored approval request whose P2 window is live.
 */
import { DEMO_TT_ALERTS, makeDemoTTApprovalRequest, DEMO_TT_ESCALATION_DECISION } from "../src/tt-synthetic-alerts";

describe("DEMO_TT_ALERTS", () => {
  it("covers all three TT alert kinds through the real adapter", () => {
    expect(DEMO_TT_ALERTS).toHaveLength(3);
    const events = DEMO_TT_ALERTS.map((a) => (a.rawEvent as { event_type: string }).event_type);
    expect(events).toEqual(
      expect.arrayContaining(["TT_ESCALATION_ROUTED", "TT_BUDGET_EXHAUSTION", "TT_AUDIT_DEADLINE"])
    );
  });

  it("attributes sourceProduct VIGIL — never TIME_TRAVEL (TT-PRODUCT-GD Option 2)", () => {
    for (const alert of DEMO_TT_ALERTS) {
      expect(alert.sourceProduct).toBe("VIGIL");
      expect(alert.alertId).toContain("SYNTH-");
    }
  });

  it("budget exhaustion is P1 (docs/17 §7); the others P2", () => {
    const budget = DEMO_TT_ALERTS.find(
      (a) => (a.rawEvent as { event_type: string }).event_type === "TT_BUDGET_EXHAUSTION"
    );
    expect(budget?.alertLevel).toBe("P1");
    for (const a of DEMO_TT_ALERTS.filter((x) => x !== budget)) expect(a.alertLevel).toBe("P2");
  });
});

describe("makeDemoTTApprovalRequest", () => {
  it("builds a live P2 request anchored to the given time, carrying the draft and workflow step id", () => {
    const anchor = "2026-07-12T10:00:00.000Z";
    const request = makeDemoTTApprovalRequest(anchor);
    expect(request.risk_classification).toBe("P2");
    expect(request.submitted_at).toBe(anchor);
    expect(Date.parse(request.expires_at)).toBeGreaterThan(Date.parse(anchor));
    expect(request.workflow_step_id).toBe(`vigil-approval-${request.request_id}`);
    expect(request.requesting_agent_id).toBe("tt.escalation-monitor");
    const detail = request.action_detail as { draft_body: string; recurrence_count: number };
    expect(detail.draft_body.length).toBeGreaterThan(50);
    expect(detail.recurrence_count).toBe(DEMO_TT_ESCALATION_DECISION.recurrence_count);
  });
});

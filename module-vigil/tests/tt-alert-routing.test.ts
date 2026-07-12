/**
 * Time & Travel — VIGIL alert/approval routing adapter tests (Session 28, D3).
 * TT-PRODUCT-GD Option 2: every TT alert carries sourceProduct "VIGIL" (the host
 * of the alert-raising tt.escalation-monitor) — never a "TIME_TRAVEL" value, which
 * does not exist in SovereignProduct. Mapping follows the ARIA adapter precedent:
 * existing AlertType members only, TT detail in rawEvent. All fixture data is
 * SYNTHETIC TEST DATA.
 */
import type { EscalationDecision } from "../src/tt-escalation-monitor";
import {
  ttAlertToSecurityAlert,
  ttAlertsToSecurityAlerts,
  ttEscalationToApprovalRequest,
} from "../src/tt-alert-routing";
import { validateApprovalRequest } from "../src/approval-contract";

function syntheticDecision(over: Partial<EscalationDecision> = {}): EscalationDecision {
  return {
    employee_id: "TEST-EMP-200",
    rule_category: "UNAUTHORIZED_CHARGE_ACCOUNT",
    recurrence_count: 3,
    communication_type: "FORMAL_ESCALATION",
    requires_vigil_authorization: true,
    ...over,
  };
}

describe("ttAlertToSecurityAlert — TT-PRODUCT-GD Option 2 attribution", () => {
  it("an escalation maps to a P2 THRESHOLD_BREACH with sourceProduct VIGIL", () => {
    const alert = ttAlertToSecurityAlert({
      kind: "escalation",
      referenceId: "TEST-FLAG-1",
      decision: syntheticDecision(),
      timestamp: "2026-07-12T10:00:00.000Z",
    });
    expect(alert.sourceProduct).toBe("VIGIL"); // host product — never TIME_TRAVEL
    expect(alert.alertType).toBe("THRESHOLD_BREACH");
    expect(alert.alertLevel).toBe("P2");
    expect(alert.agentId).toBe("tt.escalation-monitor");
    expect(alert.status).toBe("UNACKNOWLEDGED");
    expect(alert.rawEvent.event_type).toBe("TT_ESCALATION_ROUTED");
    expect(alert.rawEvent.recurrence_count).toBe(3);
    expect(alert.rawEvent.workflow_step_id).toBe(`vigil-alert-${alert.alertId}`);
  });

  it("budget exhaustion is a P1 THRESHOLD_BREACH (docs/17 §7)", () => {
    const alert = ttAlertToSecurityAlert({
      kind: "budget_exhaustion",
      referenceId: "TEST-CC-100",
      detail: "Synthetic account at zero remaining budget",
      timestamp: "2026-07-12T10:00:00.000Z",
    });
    expect(alert.alertLevel).toBe("P1");
    expect(alert.alertType).toBe("THRESHOLD_BREACH");
    expect(alert.sourceProduct).toBe("VIGIL");
    expect(alert.rawEvent.event_type).toBe("TT_BUDGET_EXHAUSTION");
  });

  it("an audit deadline maps to CASCADE_RISK (the ARIA calendar precedent)", () => {
    const alert = ttAlertToSecurityAlert({
      kind: "audit_deadline",
      referenceId: "2026-07-06_2026-07-10",
      deadline: "2026-07-15",
      unresolvedFlagCount: 4,
      timestamp: "2026-07-12T10:00:00.000Z",
    });
    expect(alert.alertType).toBe("CASCADE_RISK");
    expect(alert.sourceProduct).toBe("VIGIL");
    expect(alert.rawEvent.event_type).toBe("TT_AUDIT_DEADLINE");
    expect(alert.rawEvent.unresolved_flag_count).toBe(4);
  });

  it("batch mapping preserves order and attribution", () => {
    const alerts = ttAlertsToSecurityAlerts([
      {
        kind: "escalation",
        referenceId: "TEST-FLAG-1",
        decision: syntheticDecision(),
        timestamp: "2026-07-12T10:00:00.000Z",
      },
      {
        kind: "budget_exhaustion",
        referenceId: "TEST-CC-100",
        detail: "Synthetic detail",
        timestamp: "2026-07-12T10:01:00.000Z",
      },
    ]);
    expect(alerts).toHaveLength(2);
    expect(alerts.every((a) => a.sourceProduct === "VIGIL")).toBe(true);
  });
});

describe("ttEscalationToApprovalRequest — Tier B approval-queue entry", () => {
  it("builds a valid AgentApprovalRequest carrying the draft (no schema change)", () => {
    const request = ttEscalationToApprovalRequest(
      syntheticDecision(),
      { subject: "Formal notice (SYNTHETIC TEST)", body: "Synthetic escalation draft body." },
      "TEST-FLAG-1",
      "2026-07-12T10:00:00.000Z"
    );
    expect(validateApprovalRequest(request)).toEqual({ valid: true });
    expect(request.requesting_agent_id).toBe("tt.escalation-monitor");
    expect(request.requesting_agent_class).toBe("Monitoring");
    expect(request.action_type).toBe("send_formal_escalation_notice");
    expect(request.risk_classification).toBe("P2");
    expect(request.workflow_step_id).toBe("vigil-approval-tt-escalation-TEST-FLAG-1");
    expect(request.action_detail.draft_body).toBe("Synthetic escalation draft body.");
    // P2 expiry window is 60 minutes (spec §4.1).
    expect(request.expires_at).toBe("2026-07-12T11:00:00.000Z");
  });
});

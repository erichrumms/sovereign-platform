/**
 * Time & Travel — escalation monitor tests (Session 27 scaffold).
 * docs/17 §6.2: first/second occurrences stay in standard channels; at the
 * configured threshold the formal escalation template applies and VIGIL human
 * authorization is required. The monitor tracks and routes only.
 */
import {
  evaluateEscalations,
  upgradeCommunicationType,
  TT_ESCALATION_MONITOR_AGENT_ID,
  type EscalationMonitorConfig,
} from "../src/tt-escalation-monitor";
import type { ComplianceFlag } from "@sovereign/data";

const config: EscalationMonitorConfig = { window_periods: 6, formal_escalation_occurrence: 3 };

function flag(recurrence: number): ComplianceFlag {
  return {
    flag_id: `F-${recurrence}`,
    source: "TIME",
    record_ref: "TRC-1",
    employee_id: "emp-1",
    rule_category: "DIRECT_INDIRECT_MISMATCH",
    severity: "ERROR",
    rule_citation: "Timekeeping policy",
    actual_value: "charged INDIRECT",
    threshold_value: "account is DIRECT",
    recurrence_count: recurrence,
    raised_at: "2026-07-10T18:00:00Z",
    status: "OPEN",
  };
}

describe("tt.escalation-monitor", () => {
  it("exports the registered agent id", () =>
    expect(TT_ESCALATION_MONITOR_AGENT_ID).toBe("tt.escalation-monitor"));

  it("keeps first and second occurrences in standard channels", () => {
    expect(upgradeCommunicationType("ERROR_CORRECTION", 1, config)).toBe("ERROR_CORRECTION");
    expect(upgradeCommunicationType("ERROR_CORRECTION", 2, config)).toBe("ERROR_CORRECTION");
  });

  it("upgrades to FORMAL_ESCALATION at the configured occurrence and beyond", () => {
    expect(upgradeCommunicationType("ERROR_CORRECTION", 3, config)).toBe("FORMAL_ESCALATION");
    expect(upgradeCommunicationType("CLARIFICATION_REQUEST", 5, config)).toBe("FORMAL_ESCALATION");
  });

  it("marks formal escalations as requiring VIGIL human authorization", () => {
    const decisions = evaluateEscalations([flag(1), flag(3)], () => "ERROR_CORRECTION", config);
    expect(decisions[0]).toMatchObject({
      recurrence_count: 1,
      communication_type: "ERROR_CORRECTION",
      requires_vigil_authorization: false,
    });
    expect(decisions[1]).toMatchObject({
      recurrence_count: 3,
      communication_type: "FORMAL_ESCALATION",
      requires_vigil_authorization: true,
    });
  });

  it("respects a policy-elicited threshold other than 3 (FLOWPATH-configured)", () => {
    const strict: EscalationMonitorConfig = { window_periods: 6, formal_escalation_occurrence: 2 };
    expect(upgradeCommunicationType("ERROR_CORRECTION", 2, strict)).toBe("FORMAL_ESCALATION");
  });

  it("is deterministic — same input, same output", () => {
    const a = evaluateEscalations([flag(2)], () => "ERROR_CORRECTION", config);
    const b = evaluateEscalations([flag(2)], () => "ERROR_CORRECTION", config);
    expect(a).toEqual(b);
  });
});

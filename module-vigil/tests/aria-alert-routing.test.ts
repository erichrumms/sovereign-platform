/**
 * module-vigil — aria-alert-routing.test.ts (Session 23 · D5/D6)
 * The CLEAR → VIGIL alert routing adapter: ARIA events map onto the EXISTING AlertType
 * union and SecurityAlert shape with sourceProduct "ARIA" — no new alert type, no new field.
 */
import {
  ariaAlertToSecurityAlert,
  ariaAlertsToSecurityAlerts,
  DEMO_ARIA_ALERTS,
} from "../src/aria-alert-routing";

describe("aria-alert-routing — CLEAR → VIGIL", () => {
  it("maps ARIA_VIOLATION_FLAGGED onto an existing AlertType with sourceProduct ARIA", () => {
    const alert = ariaAlertToSecurityAlert({
      kind: "violation",
      referenceId: "DOC-OBL-Q3",
      alertLevel: "P1",
      detail: "An obligation is not covered by available budget authority.",
      applicableRegulation: "Anti-Deficiency Act",
      affectedOutput: "Q3 Obligation Summary",
      timestamp: "2026-06-29T13:05:00.000Z",
    });
    expect(alert.sourceProduct).toBe("ARIA");
    expect(alert.alertType).toBe("THRESHOLD_BREACH"); // existing union member
    expect(alert.alertLevel).toBe("P1");
    expect(alert.agentId).toBe("aria.rules-engine");
    expect(alert.status).toBe("UNACKNOWLEDGED");
    expect(alert.rawEvent.event_type).toBe("ARIA_VIOLATION_FLAGGED");
    expect(alert.rawEvent.applicable_regulation).toBe("Anti-Deficiency Act");
    expect(alert.rawEvent.affected_output).toBe("Q3 Obligation Summary");
  });

  it("maps ARIA_CALENDAR_ALERT onto an existing AlertType with the overdue detail", () => {
    const alert = ariaAlertToSecurityAlert({
      kind: "calendar",
      referenceId: "CAL-PROG-XSN",
      alertLevel: "P2",
      deadline: "2026-06-25",
      elapsedOverdue: "4 days overdue",
      affectedCommitment: "Programming phase transition",
      timestamp: "2026-06-29T13:06:00.000Z",
    });
    expect(alert.sourceProduct).toBe("ARIA");
    expect(alert.alertType).toBe("CASCADE_RISK"); // existing union member
    expect(alert.rawEvent.event_type).toBe("ARIA_CALENDAR_ALERT");
    expect(alert.rawEvent.elapsed_overdue).toBe("4 days overdue");
    expect(alert.rawEvent.affected_commitment).toBe("Programming phase transition");
  });

  it("the demo ARIA alerts are all sourced ARIA and carry distinct ids", () => {
    expect(DEMO_ARIA_ALERTS.length).toBeGreaterThan(0);
    expect(DEMO_ARIA_ALERTS.every((a) => a.sourceProduct === "ARIA")).toBe(true);
    const ids = DEMO_ARIA_ALERTS.map((a) => a.alertId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("batch conversion preserves order and count", () => {
    const out = ariaAlertsToSecurityAlerts([
      { kind: "violation", referenceId: "A", alertLevel: "P3", detail: "d", applicableRegulation: "r", affectedOutput: "o", timestamp: "t" },
      { kind: "calendar", referenceId: "B", alertLevel: "P2", deadline: "d", elapsedOverdue: "e", affectedCommitment: "c", timestamp: "t" },
    ]);
    expect(out.map((a) => a.alertId)).toEqual(["aria-violation-A", "aria-calendar-B"]);
  });
});

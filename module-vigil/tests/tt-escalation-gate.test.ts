/**
 * Time & Travel — VIGIL escalation authorization gate tests (Session 28, D3).
 * docs/17 §7 Tier B: a formal escalation communication requires manager
 * authorization in VIGIL before it is sent. The gate is structural: isSendable()
 * is false until a human authorization is recorded; rejection closes the case
 * unsendable; a failed Logger emit blocks the decision. Approval emits
 * decision_type ESCALATION_AUTHORIZED (GD-21, shell-contract v1.16). All fixture
 * data is SYNTHETIC TEST DATA.
 */
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import type { EscalationDecision } from "../src/tt-escalation-monitor";
import {
  openEscalationCase,
  isSendable,
  recordEscalationAuthorization,
  type GateLogger,
  type TTEscalationCase,
} from "../src/tt-escalation-gate";

const OPERATOR = { id: "TEST-OP-1", name: "Riley Operator (TEST)" };
const NOTE = "Synthetic authorization note for the test escalation.";

function syntheticDecision(): EscalationDecision {
  return {
    employee_id: "TEST-EMP-200",
    rule_category: "UNAUTHORIZED_CHARGE_ACCOUNT",
    recurrence_count: 3,
    communication_type: "FORMAL_ESCALATION",
    requires_vigil_authorization: true,
  };
}

function captureLogger(): { logger: GateLogger; events: SovereignLogEvent[] } {
  const events: SovereignLogEvent[] = [];
  return { logger: { log: (e) => events.push(e) }, events };
}

function openCase(logger: GateLogger): TTEscalationCase {
  return openEscalationCase(
    syntheticDecision(),
    { subject: "Formal notice (SYNTHETIC TEST)", body: "Synthetic escalation draft body." },
    "TEST-FLAG-1",
    "2026-07-12T10:00:00.000Z",
    logger
  );
}

describe("openEscalationCase", () => {
  it("opens PENDING_AUTHORIZATION and emits APPROVAL_REQUEST_RECEIVED with workflow_step_id", () => {
    const { logger, events } = captureLogger();
    const c = openCase(logger);

    expect(c.authorization).toBe("PENDING_AUTHORIZATION");
    expect(isSendable(c)).toBe(false); // THE GATE: not sendable at open
    expect(events).toHaveLength(1);
    expect(events[0].event_type).toBe("APPROVAL_REQUEST_RECEIVED");
    expect(events[0].workflow_step_id).toBe(c.workflow_step_id);
    expect(events[0].workflow_step_id).not.toBe("");
    expect(events[0].agent_id).toBe("tt.escalation-monitor");
  });
});

describe("recordEscalationAuthorization — the gate decision", () => {
  it("APPROVE → AUTHORIZED, sendable, AGENT_ACTION_APPROVED with ESCALATION_AUTHORIZED (GD-21)", () => {
    const { logger, events } = captureLogger();
    const c = openCase(logger);

    const result = recordEscalationAuthorization(c, "APPROVE", OPERATOR, NOTE, logger);
    expect(result.ok).toBe(true);
    expect(result.case.authorization).toBe("AUTHORIZED");
    expect(isSendable(result.case)).toBe(true);

    const decision = events[1];
    expect(decision.event_type).toBe("AGENT_ACTION_APPROVED");
    expect(decision.decision_type).toBe("ESCALATION_AUTHORIZED");
    expect(decision.actor).toBe("human");
    expect(decision.actor_name).toBe("Riley Operator (TEST)");
    expect(decision.workflow_step_id).toBe(c.workflow_step_id);
  });

  it("REJECT → REJECTED, NOT sendable, AGENT_ACTION_REJECTED with HUMAN_DENIAL", () => {
    const { logger, events } = captureLogger();
    const c = openCase(logger);

    const result = recordEscalationAuthorization(c, "REJECT", OPERATOR, NOTE, logger);
    expect(result.ok).toBe(true);
    expect(result.case.authorization).toBe("REJECTED");
    expect(isSendable(result.case)).toBe(false); // rejection never opens the gate

    const decision = events[1];
    expect(decision.event_type).toBe("AGENT_ACTION_REJECTED");
    expect(decision.decision_type).toBe("HUMAN_DENIAL");
  });

  it("requires a note of at least 10 characters — an undocumented authorization is refused", () => {
    const { logger, events } = captureLogger();
    const c = openCase(logger);

    const result = recordEscalationAuthorization(c, "APPROVE", OPERATOR, "too short", logger);
    expect(result.ok).toBe(false);
    expect(result.case.authorization).toBe("PENDING_AUTHORIZATION");
    expect(isSendable(result.case)).toBe(false);
    expect(events).toHaveLength(1); // only the open event — no decision emitted
  });

  it("a failed Logger emit BLOCKS the decision (Gate 2) — the case stays pending", () => {
    const { logger } = captureLogger();
    const c = openCase(logger);

    const failing: GateLogger = {
      log: () => {
        throw new Error("logger down");
      },
    };
    const result = recordEscalationAuthorization(c, "APPROVE", OPERATOR, NOTE, failing);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Gate 2/);
    expect(result.case.authorization).toBe("PENDING_AUTHORIZATION");
    expect(isSendable(result.case)).toBe(false);
  });

  it("an already-decided case cannot be re-decided", () => {
    const { logger } = captureLogger();
    const c = openCase(logger);
    const authorized = recordEscalationAuthorization(c, "APPROVE", OPERATOR, NOTE, logger).case;

    const again = recordEscalationAuthorization(authorized, "REJECT", OPERATOR, NOTE, logger);
    expect(again.ok).toBe(false);
    expect(again.case.authorization).toBe("AUTHORIZED");
  });

  it("does not mutate the input case (pure over its input)", () => {
    const { logger } = captureLogger();
    const c = openCase(logger);
    recordEscalationAuthorization(c, "APPROVE", OPERATOR, NOTE, logger);
    expect(c.authorization).toBe("PENDING_AUTHORIZATION");
  });
});

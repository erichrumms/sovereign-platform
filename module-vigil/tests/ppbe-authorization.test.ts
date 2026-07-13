/**
 * PPBE three-tier authorization tests — Session 31 (D5).
 * docs/18 §6: Tier A advisory label (no gate), Tier B phase-transition gate,
 * Tier C obligation gate requiring a COUNSEL Decision Record ID. Done condition:
 * "VIGIL gates a simulated phase transition on human authorization."
 * Decision types reuse HUMAN_APPROVAL / HUMAN_DENIAL (Project Principal
 * decision #5 — no PPBE-specific HumanDecisionType this session).
 */

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import {
  PPBE_TIER_A_LABEL,
  tierForPPBEAction,
  isValidPhaseTransition,
  openPhaseTransitionGate,
  isPhaseTransitionComplete,
  recordPhaseTransitionDecision,
  canSubmitObligationDecision,
  openObligationGate,
  recordObligationAuthorization,
  isObligationCreatable,
  type ObligationDraft,
} from "../src/ppbe-authorization";

function captureLogger() {
  const events: SovereignLogEvent[] = [];
  return { events, logger: { log: (e: SovereignLogEvent) => events.push(e) } };
}

const failingLogger = {
  log: () => {
    throw new Error("sink unavailable");
  },
};

const operator = { id: "emp_001", name: "Jane Smith" };

const transitionInput = {
  from_phase: 2,
  to_phase: 3,
  data_quality_assessment: "Evidence base complete; all findings validated this cycle.",
  integration_readiness_check: "Programming inputs confirmed available in APEX.",
  requested_by_agent_id: "ppbe-dependency-tracker",
};

const obligationDraft: ObligationDraft = {
  obligation_id: "OB-2027-0001",
  program_id: "PRG-001",
  cost_code: "CC-1",
  amount: 250000,
  timestamp: "2026-07-12T15:30:00Z",
  workflow_step_id: "ppbe-obligation-OB-2027-0001",
};

describe("Tier classification (docs/18 §6)", () => {
  it("classifies analysis and recommendations as Tier A (no gate)", () => {
    expect(tierForPPBEAction("analysis")).toBe("A");
    expect(tierForPPBEAction("recommendation")).toBe("A");
    expect(PPBE_TIER_A_LABEL).toContain("AI-generated recommendation");
  });
  it("classifies phase transitions as Tier B", () =>
    expect(tierForPPBEAction("phase_transition")).toBe("B"));
  it("classifies obligations and reprogramming as Tier C", () => {
    expect(tierForPPBEAction("obligation")).toBe("C");
    expect(tierForPPBEAction("reprogramming")).toBe("C");
  });
});

describe("Phase transition shape (the six-phase closed loop)", () => {
  it("allows forward steps and the loop-closing 6 to 1", () => {
    expect(isValidPhaseTransition(1, 2)).toBe(true);
    expect(isValidPhaseTransition(5, 6)).toBe(true);
    expect(isValidPhaseTransition(6, 1)).toBe(true);
  });
  it("rejects skips, reversals, and out-of-range phases", () => {
    expect(isValidPhaseTransition(2, 4)).toBe(false);
    expect(isValidPhaseTransition(3, 2)).toBe(false);
    expect(isValidPhaseTransition(6, 7)).toBe(false);
    expect(isValidPhaseTransition(0, 1)).toBe(false);
  });
});

describe("Tier B — VIGIL gates a simulated phase transition (done condition)", () => {
  it("opens PENDING and emits APPROVAL_REQUEST_RECEIVED with workflow_step_id", () => {
    const { events, logger } = captureLogger();
    const gateCase = openPhaseTransitionGate(transitionInput, "2026-07-12T16:00:00Z", logger)!;
    expect(gateCase.authorization).toBe("PENDING_AUTHORIZATION");
    expect(isPhaseTransitionComplete(gateCase)).toBe(false);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      event_type: "APPROVAL_REQUEST_RECEIVED",
      product: "VIGIL",
      workflow_step_id: "ppbe-phase-transition-2-to-3",
    });
  });

  it("refuses to open an impossible transition or an empty readiness check", () => {
    const { logger } = captureLogger();
    expect(
      openPhaseTransitionGate({ ...transitionInput, to_phase: 5 }, "2026-07-12T16:00:00Z", logger)
    ).toBeNull();
    expect(
      openPhaseTransitionGate(
        { ...transitionInput, integration_readiness_check: "  " },
        "2026-07-12T16:00:00Z",
        logger
      )
    ).toBeNull();
  });

  it("authorizes on human approval — HUMAN_APPROVAL emitted, transition record produced", () => {
    const { events, logger } = captureLogger();
    const gateCase = openPhaseTransitionGate(transitionInput, "2026-07-12T16:00:00Z", logger)!;
    const result = recordPhaseTransitionDecision(
      gateCase,
      "APPROVE",
      operator,
      "Data quality and readiness both confirmed for programming.",
      logger
    );
    expect(result.ok).toBe(true);
    expect(isPhaseTransitionComplete(result.case)).toBe(true);
    expect(result.case.transition_record).toMatchObject({
      from_phase: 2,
      to_phase: 3,
      approving_human: "Jane Smith",
      workflow_step_id: "ppbe-phase-transition-2-to-3",
    });
    const decision = events[1];
    expect(decision).toMatchObject({
      event_type: "AGENT_ACTION_APPROVED",
      decision_type: "HUMAN_APPROVAL",
      actor: "human",
      actor_name: "Jane Smith",
    });
  });

  it("rejection closes the case incomplete with HUMAN_DENIAL", () => {
    const { events, logger } = captureLogger();
    const gateCase = openPhaseTransitionGate(transitionInput, "2026-07-12T16:00:00Z", logger)!;
    const result = recordPhaseTransitionDecision(
      gateCase,
      "REJECT",
      operator,
      "Evidence base incomplete — two programs missing validated findings.",
      logger
    );
    expect(result.ok).toBe(true);
    expect(result.case.authorization).toBe("REJECTED");
    expect(isPhaseTransitionComplete(result.case)).toBe(false);
    expect(result.case.transition_record).toBeUndefined();
    expect(events[1]).toMatchObject({
      event_type: "AGENT_ACTION_REJECTED",
      decision_type: "HUMAN_DENIAL",
    });
  });

  it("requires a note of at least 10 characters", () => {
    const { logger } = captureLogger();
    const gateCase = openPhaseTransitionGate(transitionInput, "2026-07-12T16:00:00Z", logger)!;
    const result = recordPhaseTransitionDecision(gateCase, "APPROVE", operator, "ok", logger);
    expect(result.ok).toBe(false);
    expect(result.case.authorization).toBe("PENDING_AUTHORIZATION");
  });

  it("a failed Logger emit blocks the decision (CPMI-VRS Gate 2)", () => {
    const { logger } = captureLogger();
    const gateCase = openPhaseTransitionGate(transitionInput, "2026-07-12T16:00:00Z", logger)!;
    const result = recordPhaseTransitionDecision(
      gateCase,
      "APPROVE",
      operator,
      "Data quality and readiness both confirmed.",
      failingLogger
    );
    expect(result.ok).toBe(false);
    expect(result.case.authorization).toBe("PENDING_AUTHORIZATION");
    expect(result.error).toContain("Logger emission failed");
  });

  it("a decided case cannot be decided again", () => {
    const { logger } = captureLogger();
    const gateCase = openPhaseTransitionGate(transitionInput, "2026-07-12T16:00:00Z", logger)!;
    const first = recordPhaseTransitionDecision(
      gateCase,
      "APPROVE",
      operator,
      "Data quality and readiness both confirmed.",
      logger
    );
    const second = recordPhaseTransitionDecision(
      first.case,
      "REJECT",
      operator,
      "Attempting to reverse the decision.",
      logger
    );
    expect(second.ok).toBe(false);
  });
});

describe("Tier C — obligation gate (VIGIL decision + COUNSEL Decision Record ID)", () => {
  it("the submit action is inactive until BOTH note and COUNSEL ID are present", () => {
    expect(canSubmitObligationDecision("A sufficient decision note.", "")).toBe(false);
    expect(canSubmitObligationDecision("short", "DR-CNSL-0042")).toBe(false);
    expect(canSubmitObligationDecision("A sufficient decision note.", "DR-CNSL-0042")).toBe(true);
  });

  it("opens PENDING for a well-formed draft; refuses a broken one", () => {
    const { events, logger } = captureLogger();
    const gateCase = openObligationGate(
      obligationDraft,
      "ppbe-ledger-monitor",
      "2026-07-12T16:00:00Z",
      logger
    );
    expect(gateCase?.authorization).toBe("PENDING_AUTHORIZATION");
    expect(events[0]).toMatchObject({ event_type: "APPROVAL_REQUEST_RECEIVED" });
    expect(
      openObligationGate(
        { ...obligationDraft, amount: 0 },
        "ppbe-ledger-monitor",
        "2026-07-12T16:00:00Z",
        logger
      )
    ).toBeNull();
  });

  it("authorization yields a validated ObligationRecord naming the operator", () => {
    const { events, logger } = captureLogger();
    const gateCase = openObligationGate(
      obligationDraft,
      "ppbe-ledger-monitor",
      "2026-07-12T16:00:00Z",
      logger
    )!;
    const result = recordObligationAuthorization(
      gateCase,
      "APPROVE",
      operator,
      "Obligation supported by the linked COUNSEL analysis.",
      "DR-CNSL-0042",
      logger
    );
    expect(result.ok).toBe(true);
    expect(isObligationCreatable(result.case)).toBe(true);
    expect(result.case.authorized_record).toMatchObject({
      obligation_id: "OB-2027-0001",
      authorizing_official: "Jane Smith",
    });
    expect(result.case.counsel_decision_record_id).toBe("DR-CNSL-0042");
    expect(events[1]).toMatchObject({
      event_type: "AGENT_ACTION_APPROVED",
      decision_type: "HUMAN_APPROVAL",
      payload: expect.objectContaining({ counsel_decision_record_id: "DR-CNSL-0042" }),
    });
  });

  it("approval without a COUNSEL Decision Record ID is inactive", () => {
    const { logger } = captureLogger();
    const gateCase = openObligationGate(
      obligationDraft,
      "ppbe-ledger-monitor",
      "2026-07-12T16:00:00Z",
      logger
    )!;
    const result = recordObligationAuthorization(
      gateCase,
      "APPROVE",
      operator,
      "Obligation supported by analysis.",
      "",
      logger
    );
    expect(result.ok).toBe(false);
    expect(isObligationCreatable(result.case)).toBe(false);
  });

  it("rejection needs only the note, and no record is created", () => {
    const { logger } = captureLogger();
    const gateCase = openObligationGate(
      obligationDraft,
      "ppbe-ledger-monitor",
      "2026-07-12T16:00:00Z",
      logger
    )!;
    const result = recordObligationAuthorization(
      gateCase,
      "REJECT",
      operator,
      "Amount exceeds the remaining program ceiling.",
      "",
      logger
    );
    expect(result.ok).toBe(true);
    expect(result.case.authorization).toBe("REJECTED");
    expect(isObligationCreatable(result.case)).toBe(false);
  });
});

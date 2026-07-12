/** @jest-environment jsdom */
/**
 * e2e — Time & Travel full-cycle scenarios (Session 28, D4).
 *
 * ⚠️  ALL DATA IN THIS FILE IS SYNTHETIC TEST DATA — clearly marked, never
 * mistakable for real governance data. Every employee/request/record id carries
 * a SYNTH- prefix; every human decision is a SIMULATED test decision, logged as
 * such in its note/payload. No real communication is sent anywhere: the drafter
 * LLM call is a local fake (no network), and the pipeline itself HAS NO SEND
 * PATH — which is precisely what Scenario 2/3 prove.
 *
 * Drives the REAL module functions end-to-end through one shared log sink:
 *   NEXUS   tt.travel-compliance-engine → tt.travel-router → TRAVEL_APPROVAL (GD-21)
 *   APEX    tt.time-compliance-engine → VIGIL tt.escalation-monitor
 *   SCRIBE  tt.travel-drafter / tt.time-drafter (registered prompts, fake LLM)
 *   VIGIL   approval queue entry (TT-PRODUCT-GD Option 2) + the Tier B gate
 *
 * The two load-bearing assertions the done condition names:
 *   1. THE DRAFT IS NEVER AUTO-SENT — the VIGIL gate demonstrably halts the flow
 *      (isSendable false, the manager review send button disabled, recordSend
 *      refused) until the simulated human decision, and stays halted on rejection.
 *   2. EVERY Logger event carries workflow_step_id, and every agent-step event
 *      carries the correct agent_id/agent_class (Constraints #4/#6, AIS).
 */
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

import type {
  TravelRequest,
  TravelPolicy,
  TimeRecord,
  ChargeAccount,
} from "@sovereign/data";
import type {
  SovereignLogEvent,
  SovereignShellContext,
} from "../../sovereign-shell/shell-contract";

// NEXUS — travel pipeline (Session 27 engines + Session 28 wiring)
import {
  processTravelSubmission,
  recordTravelDecision,
  travelWorkflowStep,
} from "../../module-nexus/src/tt-travel-queue";

// APEX — time compliance engine (Session 27)
import {
  evaluateTimeRecord,
  type TimeCompliancePolicyConfig,
} from "../../module-apex/src/tt-time-compliance-engine";

// VIGIL — escalation monitor (Session 27) + gate/routing (Session 28)
import { evaluateEscalations } from "../../module-vigil/src/tt-escalation-monitor";
import { ttAlertToSecurityAlert } from "../../module-vigil/src/tt-alert-routing";
import {
  openEscalationCase,
  isSendable,
  recordEscalationAuthorization,
} from "../../module-vigil/src/tt-escalation-gate";

// SCRIBE — drafting engine under the registered prompts (Session 28)
import { runTTDraft, type TTDraftDeps } from "../../module-scribe/src/tt-draft-engine";
import { TT_TRAVEL_DRAFTING_SYSTEM_PROMPT } from "../../module-scribe/src/prompts/tt-travel-drafting-system.prompt";
import { TT_TIME_DRAFTING_SYSTEM_PROMPT } from "../../module-scribe/src/prompts/tt-time-drafting-system.prompt";
import { TTManagerReview, type TimeReviewItem } from "../../module-scribe/src/TTManagerReview";

// ────────────────────────────────────────────────────────────────────────────
// SYNTHETIC fixtures — every id carries SYNTH-, every actor is (SIMULATED)
// ────────────────────────────────────────────────────────────────────────────

const SIMULATED_MANAGER = { id: "SYNTH-MGR-1", name: "Synthetic Manager (SIMULATED TEST ACTOR)" };
const SIMULATED_NOTE = "SIMULATED TEST DECISION — synthetic e2e scenario, not a real approval.";

function syntheticPolicy(): TravelPolicy {
  return {
    policy_id: "SYNTH-POLICY-1",
    effective_date: "2026-01-01",
    flowpath_session_id: "SYNTH-FP-SESSION-1",
    hard_exceptions: {
      personal_day_escalates: true,
      international_escalates: true,
      special_authority_categories: [],
    },
    routing_thresholds: {
      manager_threshold: 2500,
      director_threshold: 10000,
      executive_threshold: 50000,
    },
    soft_flags: {
      advance_booking_standard_days: 14,
      advance_booking_short_notice_days: 7,
      advance_booking_critical_hours: 48,
      conference_fee_threshold: 1500,
      budget_proximity_percent: 85,
    },
  };
}

/** Compliance-flaggable condition: booked 5 days out → short-notice soft flag. */
function syntheticTravelRequest(): TravelRequest {
  return {
    request_id: "SYNTH-TR-1",
    employee_id: "SYNTH-EMP-1",
    destination: "Synthville, TS (SYNTHETIC)",
    international: false,
    travel_start_date: "2026-08-05",
    travel_end_date: "2026-08-07",
    mission_purpose: "SYNTHETIC TEST — program review support",
    costs: { airfare: 450, hotel: 380, per_diem: 180, ground_transport: 40, registration_fees: 0 },
    total_cost: 1050,
    personal_day_included: false,
    justification: "SYNTHETIC TEST justification",
    status: "SUBMITTED",
    submitted_at: "2026-07-31T09:00:00.000Z", // 5 days before travel — soft flag
  };
}

function syntheticAccount(): ChargeAccount {
  return {
    cost_code: "SYNTH-CC-100",
    program_id: "SYNTH-PROG-1",
    labor_category: "SYNTH-ENGINEERING",
    fiscal_year: 2026,
    ceiling: 100000,
    account_type: "DIRECT",
    authorized_roles: ["PROGRAM_MANAGER"], // ANALYST is NOT authorized — the flaggable condition
    budget_remaining: 50000,
    active: true,
  };
}

/** Compliance-flaggable condition: an ANALYST charging a PM-only account. */
function syntheticTimeRecord(): TimeRecord {
  return {
    record_id: "SYNTH-TREC-1",
    employee_id: "SYNTH-EMP-2",
    period_start: "2026-07-06",
    period_end: "2026-07-10",
    entries: [
      { entry_date: "2026-07-06", cost_code: "SYNTH-CC-100", hours: 8, charge_type: "DIRECT", holiday: false },
      { entry_date: "2026-07-07", cost_code: "SYNTH-CC-100", hours: 8, charge_type: "DIRECT", holiday: false },
      { entry_date: "2026-07-08", cost_code: "SYNTH-CC-100", hours: 8, charge_type: "DIRECT", holiday: false },
      { entry_date: "2026-07-09", cost_code: "SYNTH-CC-100", hours: 8, charge_type: "DIRECT", holiday: false },
      { entry_date: "2026-07-10", cost_code: "SYNTH-CC-100", hours: 8, charge_type: "DIRECT", holiday: false },
    ],
    total_hours: 40,
    submitted_at: "2026-07-11T08:00:00.000Z",
  };
}

const TIME_CONFIG: TimeCompliancePolicyConfig = {
  overtime_daily_hours: 10,
  overtime_weekly_hours: 50,
  period_hour_minimum: 40,
  submission_grace_days: 3,
  justification_required_above_daily_hours: 10,
};

/** Fake LLM (NO network): returns clean, system-invisible prose per communication type. */
function fakeDrafterDeps(bodyByType: Record<string, string>): TTDraftDeps {
  return {
    complete: async (messages) => {
      const payload = JSON.parse(messages[1].content);
      const body = bodyByType[payload.communication_type];
      return {
        content: body,
        fallback_tier: "live",
        fallback_activated: false,
        sovereign_metadata: {
          sovereign_product: "SCRIBE",
          sovereign_version: "1.0",
          workflow_step_id: "synthetic",
          agent_id: "synthetic",
          provider: "anthropic",
          provider_model: "synthetic-test-model",
          tier: "standard",
          responded_at: "2026-07-12T00:00:00.000Z",
        },
      };
    },
    cacheGet: () => null,
    cacheSet: () => {},
  };
}

function syntheticCtx(sink: SovereignLogEvent[]): SovereignShellContext {
  return {
    auth: {
      user: {
        employee_id: SIMULATED_MANAGER.id,
        name: SIMULATED_MANAGER.name,
        org_unit: "SYNTH-ORG",
        role: "PROGRAM_MANAGER",
        clearance_level: "UNCLASSIFIED",
        cost_code_assignments: [],
      },
      token: "synthetic-test-token",
      signOut: () => {},
      hasRole: () => true,
      hasClearance: () => true,
    },
    logger: { log: (e: SovereignLogEvent) => sink.push(e) },
  } as unknown as SovereignShellContext;
}

const sinkLogger = (sink: SovereignLogEvent[]) => ({ log: (e: SovereignLogEvent) => sink.push(e) });

/** The Constraint #4/#6 sweep the done condition names — run against every scenario's sink. */
function assertGovernedTrail(sink: SovereignLogEvent[]): void {
  expect(sink.length).toBeGreaterThan(0);
  for (const e of sink) {
    // Constraint #6 — workflow_step_id on every Logger call.
    expect(typeof e.workflow_step_id).toBe("string");
    expect(e.workflow_step_id).not.toBe("");
    // Agent steps carry agent_id + agent_class (AIS).
    if (e.event_type === "AGENT_STEP_START" || e.event_type === "AGENT_STEP_COMPLETE") {
      expect(e.agent_id).toMatch(/^tt\./);
      expect(["Analytical", "Operational", "Governance", "Monitoring", "Orchestration"]).toContain(
        e.agent_class
      );
    }
    // Constraint #4 — every human decision carries decision_type + human actor.
    if (e.event_type === "HUMAN_DECISION") {
      expect(e.decision_type).toBeDefined();
      expect(e.actor).toBe("human");
      expect(e.actor_name).toContain("SIMULATED");
    }
  }
}

afterEach(cleanup);

// ────────────────────────────────────────────────────────────────────────────
// Scenario 1 — TRAVEL, CLEAN APPROVAL path end-to-end
// ────────────────────────────────────────────────────────────────────────────

describe("Scenario 1 — travel request, clean approval path", () => {
  it("engine → router → simulated TRAVEL_APPROVAL → drafter produces APPROVAL_NOTICE", async () => {
    const sink: SovereignLogEvent[] = [];

    // 1. Compliance engine + router (flaggable condition: short-notice booking).
    const processed = processTravelSubmission(
      syntheticTravelRequest(),
      syntheticPolicy(),
      sinkLogger(sink),
      SIMULATED_MANAGER.id
    );
    expect(processed.finding.routing_tier).toBe("FLAGGED"); // soft flag, manager may approve
    expect(processed.finding.soft_flags).toContain("advance_booking_short_notice");
    expect(processed.routing.request.status).toBe("ROUTED");
    expect(processed.routing.assigned_authority).toBe("MANAGER");

    // 2. Nothing is approved yet — the engines cannot approve (docs/17 §1).
    expect(sink.filter((e) => e.event_type === "HUMAN_DECISION")).toHaveLength(0);

    // 3. SIMULATED human decision (clearly logged as simulated) — GD-21 TRAVEL_APPROVAL.
    const decided = recordTravelDecision(
      processed.routing.request,
      "APPROVED",
      SIMULATED_MANAGER,
      SIMULATED_NOTE,
      sinkLogger(sink)
    );
    expect(decided.request.status).toBe("APPROVED");
    const decision = sink.find((e) => e.event_type === "HUMAN_DECISION")!;
    expect(decision.decision_type).toBe("TRAVEL_APPROVAL");
    expect(decision.payload.decision_outcome).toBe("APPROVED");
    expect(decision.payload.note).toContain("SIMULATED TEST DECISION");
    expect(decision.workflow_step_id).toBe(travelWorkflowStep("SYNTH-TR-1"));

    // 4. tt.travel-drafter produces the CORRECT communication type for the decided
    //    state — APPROVAL_NOTICE — under the registered prompt, via the fake LLM.
    const outcome = await runTTDraft(
      { tool: "travel", request: decided.request, policy: syntheticPolicy(), flags: processed.finding.findings },
      TT_TRAVEL_DRAFTING_SYSTEM_PROMPT,
      { workflow_step_id: travelWorkflowStep("SYNTH-TR-1"), product: "SCRIBE", agent_id: "tt.travel-drafter", tier: "standard" },
      fakeDrafterDeps({
        APPROVAL_NOTICE:
          "Subject: Travel request approved (SYNTHETIC TEST)\n\n" +
          "Your travel to Synthville is approved for August 5-7, 2026.",
      })
    );
    expect(outcome.tier).toBe("live");
    expect(outcome.draft.communication_type).toBe("APPROVAL_NOTICE");
    expect(outcome.draft.subject).toContain("approved");

    // 5. Downstream state + governed trail: the full lifecycle shares one step id.
    const stepIds = new Set(sink.map((e) => e.workflow_step_id));
    expect(stepIds).toEqual(new Set([travelWorkflowStep("SYNTH-TR-1")]));
    expect(sink.map((e) => e.event_type)).toEqual([
      "AGENT_STEP_START", // tt.travel-compliance-engine
      "AGENT_STEP_COMPLETE",
      "AGENT_STEP_START", // tt.travel-router
      "AGENT_STEP_COMPLETE",
      "HUMAN_DECISION", // the simulated manager decision
    ]);
    assertGovernedTrail(sink);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Scenario 2 — TIME, ESCALATION path: the VIGIL gate halts, then authorizes
// ────────────────────────────────────────────────────────────────────────────

describe("Scenario 2 — recurring time violation, escalation authorized at the VIGIL gate", () => {
  it("engine → escalation-monitor → FORMAL_ESCALATION draft → VIGIL queue → gate HALTS → simulated authorization → send recordable", async () => {
    const sink: SovereignLogEvent[] = [];

    // 1. Compliance engine flags the recurring/severe issue (3rd occurrence in window).
    const flags = evaluateTimeRecord(
      syntheticTimeRecord(),
      [syntheticAccount()],
      "ANALYST", // not authorized on SYNTH-CC-100 → UNAUTHORIZED_CHARGE_ACCOUNT (ERROR)
      TIME_CONFIG,
      () => 2 // two prior occurrences in the rolling window
    );
    const flag = flags.find((f) => f.rule_category === "UNAUTHORIZED_CHARGE_ACCOUNT")!;
    expect(flag.severity).toBe("ERROR");
    expect(flag.recurrence_count).toBe(3);

    // 2. Escalation monitor upgrades to FORMAL_ESCALATION and requires VIGIL authorization.
    const [escalation] = evaluateEscalations(
      [flag],
      () => "ERROR_CORRECTION",
      { window_periods: 6, formal_escalation_occurrence: 3 }
    );
    expect(escalation.communication_type).toBe("FORMAL_ESCALATION");
    expect(escalation.requires_vigil_authorization).toBe(true);

    // 3. tt.time-drafter produces the CORRECT communication type — FORMAL_ESCALATION.
    const drafted = await runTTDraft(
      { tool: "time", record: syntheticTimeRecord(), flag, account: syntheticAccount(), upgradedType: escalation.communication_type },
      TT_TIME_DRAFTING_SYSTEM_PROMPT,
      { workflow_step_id: `tt-time-${flag.flag_id}`, product: "SCRIBE", agent_id: "tt.time-drafter", tier: "standard" },
      fakeDrafterDeps({
        FORMAL_ESCALATION:
          "Subject: Formal notice regarding recurring charge errors (SYNTHETIC TEST)\n\n" +
          "This is a formal notice: the charge to account SYNTH-CC-100 has recurred three times.",
      })
    );
    expect(drafted.draft.communication_type).toBe("FORMAL_ESCALATION");

    // 4. The VIGIL queue receives the case, CORRECTLY ATTRIBUTED (TT-PRODUCT-GD Option 2).
    const alert = ttAlertToSecurityAlert({
      kind: "escalation",
      referenceId: flag.flag_id,
      decision: escalation,
      timestamp: "2026-07-12T10:00:00.000Z",
    });
    expect(alert.sourceProduct).toBe("VIGIL"); // host product — never TIME_TRAVEL
    expect(alert.agentId).toBe("tt.escalation-monitor");

    const gateCase = openEscalationCase(
      escalation,
      { subject: drafted.draft.subject, body: drafted.draft.body },
      flag.flag_id,
      "2026-07-12T10:00:00.000Z",
      sinkLogger(sink)
    );
    expect(sink.some((e) => e.event_type === "APPROVAL_REQUEST_RECEIVED")).toBe(true);

    // 5. ⛔ THE GATE HALTS THE FLOW — the draft is NOT sendable before the human decision.
    expect(isSendable(gateCase)).toBe(false);

    //    UI-level proof: the manager review send action is structurally disabled.
    const pendingItem: TimeReviewItem = {
      kind: "time",
      flag,
      draft: drafted.draft,
      requiresVigilAuthorization: true,
      vigilAuthorized: isSendable(gateCase),
      workflow_step_id: gateCase.workflow_step_id,
    };
    const ctx = syntheticCtx(sink);
    render(<TTManagerReview ctx={ctx} items={[pendingItem]} />);
    expect(screen.getByTestId("tt-send-communication")).toBeDisabled();
    expect(screen.getByTestId("tt-awaiting-authorization")).toBeInTheDocument();
    expect(sink.filter((e) => e.decision_type === "TIME_CORRECTION_SENT")).toHaveLength(0);
    cleanup();

    // 6. SIMULATED human authorization at the gate (clearly logged as simulated).
    const authorized = recordEscalationAuthorization(
      gateCase,
      "APPROVE",
      SIMULATED_MANAGER,
      SIMULATED_NOTE,
      sinkLogger(sink)
    );
    expect(authorized.ok).toBe(true);
    expect(isSendable(authorized.case)).toBe(true);
    const gateDecision = sink.find((e) => e.event_type === "AGENT_ACTION_APPROVED")!;
    expect(gateDecision.decision_type).toBe("ESCALATION_AUTHORIZED"); // GD-21
    expect(gateDecision.payload.notes).toContain("SIMULATED TEST DECISION");

    // 7. Only NOW can the manager record the send (GD-21 TIME_CORRECTION_SENT).
    render(
      <TTManagerReview
        ctx={ctx}
        items={[{ ...pendingItem, vigilAuthorized: isSendable(authorized.case) }]}
      />
    );
    const send = screen.getByTestId("tt-send-communication");
    expect(send).toBeEnabled();
    fireEvent.click(send);
    const sent = sink.find((e) => e.decision_type === "TIME_CORRECTION_SENT")!;
    expect(sent.event_type).toBe("HUMAN_DECISION");
    expect(sent.actor).toBe("human");
    expect(sent.payload.vigil_authorized).toBe(true);
    expect(sent.workflow_step_id).toBe(gateCase.workflow_step_id);

    // 8. Governed trail across the whole scenario.
    assertGovernedTrail(sink);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Scenario 3 — TIME, ESCALATION path: the gate REJECTS, the flow stays halted
// ────────────────────────────────────────────────────────────────────────────

describe("Scenario 3 — escalation rejected at the VIGIL gate: the draft is never sendable", () => {
  it("a rejected authorization keeps the flow halted — no send is ever recordable", async () => {
    const sink: SovereignLogEvent[] = [];

    const flags = evaluateTimeRecord(
      syntheticTimeRecord(),
      [syntheticAccount()],
      "ANALYST",
      TIME_CONFIG,
      () => 2
    );
    const flag = flags.find((f) => f.rule_category === "UNAUTHORIZED_CHARGE_ACCOUNT")!;
    const [escalation] = evaluateEscalations([flag], () => "ERROR_CORRECTION", {
      window_periods: 6,
      formal_escalation_occurrence: 3,
    });

    const drafted = await runTTDraft(
      { tool: "time", record: syntheticTimeRecord(), flag, upgradedType: escalation.communication_type },
      TT_TIME_DRAFTING_SYSTEM_PROMPT,
      { workflow_step_id: `tt-time-${flag.flag_id}`, product: "SCRIBE", agent_id: "tt.time-drafter", tier: "standard" },
      fakeDrafterDeps({
        FORMAL_ESCALATION: "Subject: Formal notice (SYNTHETIC TEST)\n\nSynthetic formal notice body.",
      })
    );

    const gateCase = openEscalationCase(
      escalation,
      { subject: drafted.draft.subject, body: drafted.draft.body },
      flag.flag_id,
      "2026-07-12T11:00:00.000Z",
      sinkLogger(sink)
    );

    // SIMULATED human rejection at the gate.
    const rejected = recordEscalationAuthorization(
      gateCase,
      "REJECT",
      SIMULATED_MANAGER,
      SIMULATED_NOTE,
      sinkLogger(sink)
    );
    expect(rejected.ok).toBe(true);
    expect(rejected.case.authorization).toBe("REJECTED");

    // ⛔ The gate stays closed — rejection never opens it, and re-deciding is refused.
    expect(isSendable(rejected.case)).toBe(false);
    const retry = recordEscalationAuthorization(
      rejected.case,
      "APPROVE",
      SIMULATED_MANAGER,
      SIMULATED_NOTE,
      sinkLogger(sink)
    );
    expect(retry.ok).toBe(false);
    expect(isSendable(retry.case)).toBe(false);

    // The manager review interface keeps the send disabled for the rejected case.
    render(
      <TTManagerReview
        ctx={syntheticCtx(sink)}
        items={[
          {
            kind: "time",
            flag,
            draft: drafted.draft,
            requiresVigilAuthorization: true,
            vigilAuthorized: isSendable(rejected.case),
            workflow_step_id: gateCase.workflow_step_id,
          },
        ]}
      />
    );
    expect(screen.getByTestId("tt-send-communication")).toBeDisabled();

    // No send was ever recorded anywhere in this scenario.
    expect(sink.filter((e) => e.decision_type === "TIME_CORRECTION_SENT")).toHaveLength(0);
    const rejection = sink.find((e) => e.event_type === "AGENT_ACTION_REJECTED")!;
    expect(rejection.decision_type).toBe("HUMAN_DENIAL");
    assertGovernedTrail(sink);
  });
});

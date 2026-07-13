/**
 * e2e — PPBE full-cycle PRELIMINARY V&V (Session 32, D8).
 *
 * ⚠️  ALL DATA IN THIS FILE IS SYNTHETIC TEST DATA — every id carries a SYNTH-
 * prefix; every human decision is a SIMULATED test decision, logged as such.
 * The LLM calls are local fakes (no network). This suite is labeled
 * PRELIMINARY: it verifies PIPELINE CORRECTNESS AND WIRING for the PPBE build
 * as it stands after Sessions 31–32 — it does NOT verify data richness, since
 * comprehensive PPBE synthetic data is Session 33's dedicated scope.
 *
 * Drives the REAL module functions end-to-end through one shared log sink
 * (the tt-full-cycle.test.tsx pattern):
 *   FLOWPATH  PPBE artifact bundle (Five-Question gate) · ppbe-dependency-tracker
 *   NEXUS     PPBETask on the GD-11 machine · ppbe-coordination-assistant
 *   VIGIL     Tier A label · Tier B phase gate (all six transitions) · Tier C obligation gate
 *   APEX      ppbe-ledger-monitor · ppbe-evidence-synthesizer · ppbe-scenario-analyst · dashboard
 *   SCRIBE    ppbe-exhibit-drafter (three modes) behind the DOUBLE export gate
 *   ARIA      CLEAR PPBE rules · TRACER budget-submission chain
 *   COUNSEL   all four PPBE decision types → Python-side emission records
 *
 * The load-bearing assertions:
 *   1. A phase transition is NEVER complete without a recorded human decision,
 *      and an obligation record EXISTS only from an authorized Tier C case.
 *   2. A PPBE exhibit is NOT exportable on CLEAR certification alone, or on
 *      human sign-off alone — both gates, always.
 *   3. Every Logger event carries workflow_step_id; every HUMAN_DECISION event
 *      carries decision_type/actor/actor_name (Constraints #4/#6).
 *   4. Six PhaseTransitionRecords (1→2 … 5→6, 6→1) with the full docs/18 §4
 *      field set are produced for the Python-side emitter — the deferred
 *      Session 31 wiring, closed by sovereign-security/ppbe_emitter.py, whose
 *      tests consume this exact field set.
 *   5. The restated cross-module constants agree (advisory label, phase rule).
 */

import type {
  EvaluationFinding,
  ObligationRecord,
  ProgramRecord,
  StrategicObjective,
} from "@sovereign/data";
import {
  validateBudgetExhibit,
  validateEvaluationFinding,
  validateObligationRecord,
  validateProgramRecord,
  validateStrategicObjective,
} from "@sovereign/data";
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";

// FLOWPATH — PPBE artifacts (S31) + dependency tracker (S31)
import {
  validatePPBEPhaseWorkflow,
  type PPBEPhaseWorkflowArtifact,
} from "../../module-flowpath/src/ppbe-artifacts";
import {
  assessPhaseReadiness,
  runDependencyTracker,
} from "../../module-flowpath/src/ppbe-dependency-tracker";

// NEXUS — PPBE tasks (S31) + coordination assistant (S32 D4)
import {
  transitionPPBETask,
  validatePPBETask,
  tasksForProgram,
  type PPBETask,
} from "../../module-nexus/src/ppbe-tasks";
import {
  PPBE_COORDINATION_ADVISORY_LABEL,
  closeCoordinationItem,
  detectCoordinationFailures,
  type CoordinationItem,
} from "../../module-nexus/src/ppbe-coordination-assistant";

// VIGIL — three-tier authorization (S31)
import {
  PPBE_TIER_A_LABEL,
  isPhaseTransitionComplete,
  isObligationCreatable,
  isValidPhaseTransition,
  openObligationGate,
  openPhaseTransitionGate,
  recordObligationAuthorization,
  recordPhaseTransitionDecision,
  type PhaseTransitionRecord,
} from "../../module-vigil/src/ppbe-authorization";

// APEX — monitors (S31), synthesizer + analyst + dashboard (S32 D1/D2/D5)
import { runLedgerMonitor } from "../../module-apex/src/ppbe-ledger-monitor";
import {
  PPBE_ADVISORY_LABEL,
  runEvidenceSynthesis,
  staticSynthesisReport,
  synthesisAcceptanceRecord,
} from "../../module-apex/src/ppbe-evidence-synthesizer";
import {
  framingForCounsel,
  staticScenarioReport,
} from "../../module-apex/src/ppbe-scenario-analyst";
import { buildPPBEDashboard, EMPTY_PPBE_EVENT_COUNTS } from "../../module-apex/src/ppbe-dashboard";

// SCRIBE — exhibit drafter behind the double gate (S32 D3)
import {
  canSubmitExhibitSignOff,
  recordExhibitSignOff,
  toBudgetExhibitFields,
  validatePPBEExhibitDraft,
  type PPBEExhibitDraft,
} from "../../module-scribe/src/ppbe-exhibit-contract";
import {
  allowedSourceRefs,
  runExhibitDraft,
  staticExhibitDraft,
  type ExhibitDraftInput,
} from "../../module-scribe/src/ppbe-exhibit-engine";

// ARIA — CLEAR PPBE rules + TRACER chain (S32 D6)
import {
  assemblePPBEObligationChain,
  evaluatePPBEDocument,
} from "../../module-aria/src/ppbe-aria";

// COUNSEL — the four PPBE decision types (S32 D7)
import {
  PPBE_DECISION_TYPES,
  buildPPBEDecisionRecord,
  ppbeDecisionEmissionRecord,
  validatePPBEDecisionContext,
  type PPBEDecisionContext,
} from "../../module-counsel/src/ppbe-decisions";
import type { DecisionRecordInput } from "../../module-counsel/src/decision-record";

// ─── Shared log sink + simulated humans ──────────────────────────────────────

const logged: SovereignLogEvent[] = [];
const sink = { log: (e: SovereignLogEvent) => void logged.push(e) };
const OPERATOR = { id: "SYNTH-EMP-001", name: "SYNTH Simulated Operator" };
const NOTE = "SIMULATED test decision — synthetic V&V data, not a real authorization.";
const NOW = "2026-07-13T12:00:00Z";

beforeEach(() => {
  logged.length = 0;
});

// ─── SYNTH- entity fixtures (thin by design — Session 33 owns volume) ────────

const objective: StrategicObjective = {
  objective_id: "SYNTH-SO-01",
  title: "SYNTH modernize logistics data interchange",
  description: "Synthetic strategic objective for the V&V pass.",
  priority_rank: 1,
  fiscal_year_range: "FY 2027-2031",
  source_workflow_step_id: "SYNTH-flowpath-elicitation-1",
  decision_record_id: "SYNTH-DR-001",
  status: "active",
};

const program: ProgramRecord = {
  program_id: "SYNTH-PRG-01",
  name: "SYNTH Logistics Data Interchange",
  sponsor: "SYNTH PEO",
  contract_number: "SYNTH-W91-0001",
  classification_level: "UNCLASSIFIED",
  status: "ACTIVE",
  objective_id: "SYNTH-SO-01",
  fiscal_year: "FY 2027",
  lifecycle_cost_estimate: 1000000,
  obligation_plan: [
    { period: "FY 2027 Q1", planned_amount: 100000 },
    { period: "FY 2027 Q2", planned_amount: 200000 },
  ],
  performance_baseline: [{ metric: "obligation rate", baseline_value: "on plan" }],
};

function evaluationFinding(id: string, feeds: boolean): EvaluationFinding {
  return {
    finding_id: id,
    program_id: "SYNTH-PRG-01",
    objective_id: "SYNTH-SO-01",
    finding_type: feeds ? "on-track" : "variance",
    narrative: `SYNTH evaluation finding ${id}.`,
    feeds_planning_cycle: feeds,
    workflow_step_id: `SYNTH-ppbe-finding-${id}`,
  };
}

// ─── The cycle ───────────────────────────────────────────────────────────────

describe("PRELIMINARY V&V — cross-module constants agree (restated per Constraint #11)", () => {
  it("the Tier A advisory label is one string across VIGIL, APEX, and NEXUS", () => {
    expect(PPBE_ADVISORY_LABEL).toBe(PPBE_TIER_A_LABEL);
    expect(PPBE_COORDINATION_ADVISORY_LABEL).toBe(PPBE_TIER_A_LABEL);
  });

  it("the six-phase closed-loop rule agrees between VIGIL's gate and COUNSEL's context validator", () => {
    for (const [from, to, legal] of [
      [1, 2, true],
      [5, 6, true],
      [6, 1, true],
      [2, 5, false],
      [3, 2, false],
    ] as const) {
      expect(isValidPhaseTransition(from, to)).toBe(legal);
      const counselErrors = validatePPBEDecisionContext({
        ppbe_decision_type: "PHASE_TRANSITION_AUTHORIZATION",
        program_id: "SYNTH-PRG-01",
        from_phase: from,
        to_phase: to,
      });
      expect(counselErrors.length === 0).toBe(legal);
    }
  });
});

describe("PRELIMINARY V&V — Phase 1-2: entities, FLOWPATH artifacts, dependency readiness", () => {
  it("the Session 31 entity chain validates: objective → program", () => {
    expect(validateStrategicObjective(objective).valid).toBe(true);
    expect(validateProgramRecord(program).valid).toBe(true);
    expect(program.objective_id).toBe(objective.objective_id);
  });

  it("FLOWPATH accepts a gate-complete PPBE phase workflow and rejects a gapped one", () => {
    const artifact: PPBEPhaseWorkflowArtifact = {
      artifact_type: "PHASE_WORKFLOW",
      phase: 2,
      workflow: {
        artifact_id: "SYNTH-WF-01",
        session_id: "SYNTH-SESSION-01",
        workflow_type: "ppbe",
        title: "SYNTH Phase 2 evidence assembly",
        summary: "Synthetic workflow for the V&V pass.",
        steps: [
          {
            step_id: "S1",
            description: "Assemble the evidence base.",
            responsible_role: "PROGRAM_MANAGER",
            sequence: 1,
            trigger_condition: "Phase 2 opens",
            inputs: ["evaluation findings"],
            outputs: ["evidence package"],
            is_terminal: true,
          },
        ],
        terminal_condition: "Evidence package accepted by the review board.",
        workflow_step_id: "SYNTH-flowpath-wf-01",
      },
    };
    expect(validatePPBEPhaseWorkflow(artifact).valid).toBe(true);

    const gapped = {
      ...artifact,
      workflow: { ...artifact.workflow, steps: [{ ...artifact.workflow.steps[0], responsible_role: " " }] },
    };
    expect(validatePPBEPhaseWorkflow(gapped).valid).toBe(false);
  });

  it("the dependency tracker's readiness feeds the Tier B gate", () => {
    const deps = [
      {
        dependency_id: "SYNTH-DEP-01",
        source_workflow: "phase-2-planning",
        target_workflow: "phase-3-programming",
        handoff_standard: "complete evidence package",
        timing_requirement: "within 5 business days of phase close",
        health_status: "healthy" as const,
      },
    ];
    expect(runDependencyTracker(deps, [], NOW)).toEqual([]);
    const readiness = assessPhaseReadiness(deps, [], NOW, "phase-2");
    expect(readiness.ready).toBe(true);
    expect(readiness.summary).toContain("healthy");
  });
});

describe("PRELIMINARY V&V — Tier B: all six phase transitions require a human, and produce emitter records", () => {
  it("walks the full closed loop 1→2 … 5→6, 6→1 through the VIGIL gate", () => {
    const pairs: Array<[number, number]> = [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1]];
    const records: PhaseTransitionRecord[] = [];

    for (const [from, to] of pairs) {
      const gateCase = openPhaseTransitionGate(
        {
          from_phase: from,
          to_phase: to,
          data_quality_assessment: "SYNTH data quality assessment — all inputs validated.",
          integration_readiness_check: "SYNTH readiness — all dependencies healthy.",
          requested_by_agent_id: "ppbe-dependency-tracker",
        },
        NOW,
        sink
      );
      expect(gateCase).not.toBeNull();
      // Load-bearing: NOT complete before the human decides.
      expect(isPhaseTransitionComplete(gateCase!)).toBe(false);

      const decided = recordPhaseTransitionDecision(gateCase!, "APPROVE", OPERATOR, NOTE, sink);
      expect(decided.ok).toBe(true);
      expect(isPhaseTransitionComplete(decided.case)).toBe(true);
      expect(decided.case.transition_record).toBeDefined();
      records.push(decided.case.transition_record!);
    }

    // Six transition records with the full docs/18 §4 field set for ppbe_emitter.py.
    expect(records).toHaveLength(6);
    for (const r of records) {
      expect(r.approving_human).toBe(OPERATOR.name);
      expect(r.data_quality_assessment).toBeTruthy();
      expect(r.integration_readiness_check).toBeTruthy();
      expect(r.workflow_step_id).toMatch(/^ppbe-phase-transition-/);
    }
    // Each transition emitted entry + decision events.
    expect(logged.filter((e) => e.event_type === "APPROVAL_REQUEST_RECEIVED")).toHaveLength(6);
    expect(logged.filter((e) => e.event_type === "AGENT_ACTION_APPROVED")).toHaveLength(6);
  });

  it("a rejected transition stays incomplete — no path around the human", () => {
    const gateCase = openPhaseTransitionGate(
      {
        from_phase: 2,
        to_phase: 3,
        data_quality_assessment: "SYNTH assessment.",
        integration_readiness_check: "SYNTH readiness.",
        requested_by_agent_id: "ppbe-dependency-tracker",
      },
      NOW,
      sink
    )!;
    const rejected = recordPhaseTransitionDecision(gateCase, "REJECT", OPERATOR, NOTE, sink);
    expect(rejected.ok).toBe(true);
    expect(isPhaseTransitionComplete(rejected.case)).toBe(false);
    expect(rejected.case.transition_record).toBeUndefined();
  });
});

describe("PRELIMINARY V&V — advisory agents (Tier A): synthesizer and scenario analyst", () => {
  const findings = [evaluationFinding("SYNTH-EF-1", true), evaluationFinding("SYNTH-EF-2", false)];
  const apexProgram = {
    program_id: "SYNTH-PRG-01",
    program_name: "SYNTH Logistics Data Interchange",
    classification: "UNCLASSIFIED" as const,
    status_label: "ON_TRACK" as const,
    status_narrative: "SYNTH: on track.",
    completion_pct: 40,
    responsible_party: "SYNTH PM",
    objectives: ["SYNTH objective"],
    milestones: [],
    risk_flags: [],
    regulatory_context: [],
    prior_governance_records: [],
    last_updated: "2026-07-13",
  };

  it("a live synthesis (fake LLM) validates against the evidence base and yields a PPBE_DECISION record on acceptance", async () => {
    const input = { findings, programs: [apexProgram], fiscal_context: "FY 2027 SYNTH review" };
    const liveReport = staticSynthesisReport(input); // schema-true report used as the fake live body
    const outcome = await runEvidenceSynthesis(
      input,
      "SYNTH PROMPT",
      { workflow_step_id: "SYNTH-step", product: "APEX", agent_id: "ppbe-evidence-synthesizer", tier: "standard" },
      { complete: async () => ({ content: JSON.stringify(liveReport), fallback_tier: "live", fallback_activated: false, sovereign_metadata: {} as never }) }
    );
    expect(outcome.tier).toBe("live");
    expect(outcome.report.advisory_label).toBe(PPBE_TIER_A_LABEL);

    const acceptance = synthesisAcceptanceRecord(outcome.report, OPERATOR.name);
    expect(acceptance).toMatchObject({ decision_type: "HUMAN_APPROVAL", approving_human: OPERATOR.name });
  });

  it("the scenario analyst's report frames into COUNSEL with the provenance label attached", () => {
    const report = staticScenarioReport({ programs: [program], fiscal_context: "FY 2027 SYNTH decision" });
    const framing = framingForCounsel(report);
    expect(framing.alternatives.length).toBeGreaterThanOrEqual(2);
    expect(framing.source_label).toContain("not a decision");
  });
});

describe("PRELIMINARY V&V — COUNSEL: a signed record in each of the four PPBE decision types", () => {
  function recordInput(): DecisionRecordInput {
    return {
      frame: {
        decisionStatement: "SYNTH PPBE decision",
        stakes: "SYNTH stakes",
        constraints: [],
        sovereignContext: {
          sourceProduct: "APEX",
          workflowStepId: "SYNTH-ppbe-decision-step-1",
          decisionType: "HUMAN_APPROVAL",
        },
      },
      analysis: {
        alternatives: [
          { id: "ALT-1", label: "SYNTH adopt", summary: "s", pros: ["p"], cons: ["c"] },
          { id: "ALT-2", label: "SYNTH defer", summary: "s", pros: ["p"], cons: ["c"] },
          { id: "ALT-3", label: "SYNTH escalate", summary: "s", pros: ["p"], cons: ["c"] },
        ],
        riskScenarios: [
          { alternativeId: "ALT-1", scenario: "SYNTH.", severity: "LOW" },
          { alternativeId: "ALT-2", scenario: "SYNTH.", severity: "LOW" },
          { alternativeId: "ALT-3", scenario: "SYNTH.", severity: "LOW" },
        ],
        assumptionFlags: [],
        confidenceScore: 70,
        recommendedNextAction: "SYNTH review.",
      },
      chosenAlternativeId: "ALT-1",
      rationale: "SYNTH simulated rationale for the V&V pass.",
      programId: "SYNTH-PRG-01",
      reviewConfirmed: true,
    };
  }

  const contexts: Record<string, PPBEDecisionContext> = {
    STRATEGIC_PRIORITY_RANKING: {
      ppbe_decision_type: "STRATEGIC_PRIORITY_RANKING",
      program_id: "SYNTH-PRG-01",
      objective_id: "SYNTH-SO-01",
    },
    PROGRAMMING_TRADE_OFF: { ppbe_decision_type: "PROGRAMMING_TRADE_OFF", program_id: "SYNTH-PRG-01" },
    PHASE_TRANSITION_AUTHORIZATION: {
      ppbe_decision_type: "PHASE_TRANSITION_AUTHORIZATION",
      program_id: "SYNTH-PRG-01",
      from_phase: 3,
      to_phase: 4,
    },
    EVALUATION_FINDING_RESPONSE: {
      ppbe_decision_type: "EVALUATION_FINDING_RESPONSE",
      program_id: "SYNTH-PRG-01",
      finding_id: "SYNTH-EF-2",
    },
  };

  it("produces all four, each yielding a docs/18 §4 emission record for ppbe_emitter.py", () => {
    let n = 0;
    for (const t of PPBE_DECISION_TYPES) {
      const result = buildPPBEDecisionRecord(recordInput(), contexts[t], {
        now: () => NOW,
        newDocumentId: () => `SYNTH-DR-PPBE-${++n}`,
        actorId: OPERATOR.id,
        actorName: OPERATOR.name,
      });
      expect(result.ok).toBe(true);
      if (!result.ok) continue;
      const emission = ppbeDecisionEmissionRecord(result.record, contexts[t]);
      expect(emission.decision_type).toBe("HUMAN_APPROVAL");
      expect(emission.approving_human).toBe(OPERATOR.name);
      expect(emission.ppbe_decision_type).toBe(t);
      sink.log(result.record.event);
    }
    expect(logged.filter((e) => e.event_type === "HUMAN_DECISION")).toHaveLength(4);
  });
});

describe("PRELIMINARY V&V — Tier C + execution: obligation gate, ledger monitor, NEXUS task, TRACER chain", () => {
  const draft = {
    obligation_id: "SYNTH-OB-01",
    program_id: "SYNTH-PRG-01",
    cost_code: "SYNTH-CC-1",
    amount: 90000,
    timestamp: NOW,
    workflow_step_id: "SYNTH-ppbe-obligation-OB-01",
  };

  it("an ObligationRecord EXISTS only from an authorized Tier C case with a COUNSEL record linked", () => {
    const gateCase = openObligationGate(draft, "ppbe-ledger-monitor", NOW, sink)!;
    expect(gateCase).not.toBeNull();
    expect(isObligationCreatable(gateCase)).toBe(false);

    // Blocked without the COUNSEL Decision Record ID — the useApprovalDecision pattern.
    const blocked = recordObligationAuthorization(gateCase, "APPROVE", OPERATOR, NOTE, "", sink);
    expect(blocked.ok).toBe(false);

    const authorized = recordObligationAuthorization(
      gateCase, "APPROVE", OPERATOR, NOTE, "SYNTH-DR-PPBE-2", sink
    );
    expect(authorized.ok).toBe(true);
    expect(isObligationCreatable(authorized.case)).toBe(true);

    const record = authorized.case.authorized_record!;
    expect(validateObligationRecord(record).valid).toBe(true);
    expect(record.authorizing_official).toBe(OPERATOR.name);

    // The ledger monitor observes the executed obligation (thin data — one record).
    const findings = runLedgerMonitor(
      program,
      [record],
      { "FY 2027 Q1": record.amount },
      [],
      {
        obligation_deviation_percent: 5,
        ceiling_proximity_percent: 90,
        feedback_stall_fraction: 0.5,
        feedback_minimum_findings: 2,
      }
    );
    expect(findings.length).toBeGreaterThan(0); // 90000 vs 100000 planned breaches 5%
    expect(findings.every((f) => f.observation_only)).toBe(true);

    // TRACER: the budget-submission chain is COMPLETE over the real entities.
    const chain = assemblePPBEObligationChain(record, program, objective);
    expect(chain.complete).toBe(true);
    expect(chain.nodes).toHaveLength(3);
  });

  it("a PPBE task rides the GD-11 machine and refuses an illegal jump", () => {
    let task: PPBETask = {
      task_id: "SYNTH-TASK-01",
      title: "SYNTH exhibit preparation",
      description: "SYNTH Phase 4 exhibit work.",
      task_type: "EXHIBIT_PREPARATION",
      status: "SUBMITTED",
      program_id: "SYNTH-PRG-01",
      objective_id: "SYNTH-SO-01",
      phase: 4,
      data_classification: "UNCLASSIFIED",
      requester_id: OPERATOR.id,
      created_at: NOW,
      updated_at: NOW,
      workflow_step_id: "nexus-ppbe-task-SYNTH-TASK-01",
    };
    expect(validatePPBETask(task).valid).toBe(true);
    expect(transitionPPBETask(task, "COMPLETE", NOW)).toBeNull(); // illegal jump
    for (const status of ["ROUTED", "PENDING_APPROVAL", "IN_PROGRESS", "COMPLETE"] as const) {
      task = transitionPPBETask(task, status, NOW)!;
      expect(task).not.toBeNull();
    }
    expect(tasksForProgram([task], "SYNTH-PRG-01")).toHaveLength(1);
  });

  it("the coordination assistant flags an overdue commitment and only a human closes it", () => {
    const item: CoordinationItem = {
      item_id: "SYNTH-CI-01",
      kind: "DECISION_COMMITMENT",
      description: "SYNTH record the Phase 4 trade-off decision",
      responsible_role: "PROGRAM_MANAGER",
      due_by: "2026-07-10T00:00:00Z",
      status: "OPEN",
      program_id: "SYNTH-PRG-01",
      workflow_step_id: "SYNTH-ppbe-coordination-CI-01",
    };
    const failures = detectCoordinationFailures([item], NOW);
    expect(failures).toHaveLength(1);
    expect(failures[0].anomaly_type).toBe("LAPSED_COMMITMENT");

    const closed = closeCoordinationItem(item, OPERATOR, NOTE, sink);
    expect(closed.ok).toBe(true);
    expect(closed.item.status).toBe("RESOLVED");
  });
});

describe("PRELIMINARY V&V — SCRIBE exhibits behind the DOUBLE gate + CLEAR + dashboard", () => {
  const obligationRecord: ObligationRecord = {
    obligation_id: "SYNTH-OB-01",
    program_id: "SYNTH-PRG-01",
    cost_code: "SYNTH-CC-1",
    amount: 90000,
    timestamp: NOW,
    authorizing_official: OPERATOR.name,
    workflow_step_id: "SYNTH-ppbe-obligation-OB-01",
  };
  const input: ExhibitDraftInput = {
    mode: "BUDGET_EXHIBIT",
    program,
    obligations: [obligationRecord],
    plan_source_step_id: "SYNTH-flowpath-wf-01",
  };
  const refs = allowedSourceRefs(input);

  async function liveDraft(): Promise<PPBEExhibitDraft> {
    const body = staticExhibitDraft(input); // schema-true draft as the fake live body
    const outcome = await runExhibitDraft(
      input,
      "SYNTH PROMPT",
      { workflow_step_id: "SYNTH-step", product: "SCRIBE", agent_id: "ppbe-exhibit-drafter", tier: "standard" },
      {
        complete: async () => ({ content: JSON.stringify(body), fallback_tier: "live", fallback_activated: false, sovereign_metadata: {} as never }),
        cacheGet: () => null,
        cacheSet: () => undefined,
      }
    );
    expect(outcome.tier).toBe("live");
    return outcome.draft;
  }

  it("drafts validate in all three modes; the double gate blocks each half alone and passes with both", async () => {
    const draft = await liveDraft();
    expect(validatePPBEExhibitDraft(draft, refs).valid).toBe(true);
    // Static drafts in the other two modes also validate (thin-data static tier).
    for (const mode of ["CONGRESSIONAL_JUSTIFICATION", "EVALUATION_REPORT"] as const) {
      const modeInput = { ...input, mode, findings: [evaluationFinding("SYNTH-EF-1", true)] };
      expect(
        validatePPBEExhibitDraft(staticExhibitDraft(modeInput), allowedSourceRefs(modeInput)).valid
      ).toBe(true);
    }

    // Load-bearing: neither gate alone opens export.
    expect(canSubmitExhibitSignOff(false, NOTE)).toBe(false); // no CLEAR
    expect(canSubmitExhibitSignOff(true, "")).toBe(false); // no human note
    const blockedNoClear = recordExhibitSignOff(
      draft, { program_id: program.program_id, fiscal_year: program.fiscal_year }, refs, OPERATOR, NOTE, false, sink
    );
    expect(blockedNoClear.ok).toBe(false);

    // CLEAR certifies (deterministic PPBE evaluation), then the human signs off.
    const clearResult = evaluatePPBEDocument(
      {
        document_id: "SYNTH-DOC-01",
        document_name: draft.title,
        document_type: "Budget Exhibit",
        data_quality_index: 95,
        is_congressional_submission: false,
        has_justification_narrative: true,
        has_evidence_basis: true,
        obligation_covered: true,
        funds_availability_stated: true,
        ppbe_phase: "Budget Formulation",
        all_figures_traceable: true,
        has_source_data_lineage: true,
        feeds_planning_recorded: true,
      },
      NOW
    );
    expect(clearResult.compliant).toBe(true);

    const signed = recordExhibitSignOff(
      draft, { program_id: program.program_id, fiscal_year: program.fiscal_year }, refs, OPERATOR, NOTE, true, sink
    );
    expect(signed.ok).toBe(true);
    expect(signed.approval).toMatchObject({ aria_clear_certified: true, data_classification_confirmed: true });

    // The approved draft assembles into a valid, gated BudgetExhibit entity.
    const fields = toBudgetExhibitFields(draft);
    const exhibit = {
      exhibit_id: "SYNTH-EX-01",
      program_id: program.program_id,
      fiscal_year: program.fiscal_year,
      narrative_content: fields.narrative_content,
      source_data_lineage: fields.source_data_lineage,
      certification_status: "CERTIFIED" as const,
      export_status: "APPROVED_FOR_EXPORT" as const,
    };
    expect(validateBudgetExhibit(exhibit).valid).toBe(true);
  });

  it("phase 6 closes the loop: findings validate, and the dashboard renders the cycle's data", () => {
    const findings = [evaluationFinding("SYNTH-EF-1", true), evaluationFinding("SYNTH-EF-2", false)];
    for (const f of findings) expect(validateEvaluationFinding(f).valid).toBe(true);

    const dashboard = buildPPBEDashboard({
      programs: [program],
      obligations: [obligationRecord],
      actualsByProgram: { "SYNTH-PRG-01": { "FY 2027 Q1": 90000 } },
      dependencies: [],
      findings,
      eventCounts: { ...EMPTY_PPBE_EVENT_COUNTS, PPBE_PHASE_TRANSITION: 6, PPBE_DECISION: 4 },
    });
    expect(dashboard.is_empty).toBe(false);
    expect(dashboard.obligation_rates[0].rate_percent).toBe(30);
    expect(dashboard.learning_velocity.velocity_percent).toBe(50);
    expect(dashboard.event_counts.PPBE_PHASE_TRANSITION).toBe(6);
  });
});

describe("PRELIMINARY V&V — audit-trail discipline over everything this suite logged", () => {
  it("every event carries workflow_step_id; every HUMAN_DECISION carries the full triad (Constraints #4/#6)", async () => {
    // Re-run a representative slice so the sink holds a mixed event set.
    const gateCase = openPhaseTransitionGate(
      {
        from_phase: 1,
        to_phase: 2,
        data_quality_assessment: "SYNTH.",
        integration_readiness_check: "SYNTH.",
        requested_by_agent_id: "ppbe-dependency-tracker",
      },
      NOW,
      sink
    )!;
    recordPhaseTransitionDecision(gateCase, "APPROVE", OPERATOR, NOTE, sink);

    expect(logged.length).toBeGreaterThan(0);
    for (const event of logged) {
      expect(typeof event.workflow_step_id).toBe("string");
      expect(event.workflow_step_id.trim()).not.toBe("");
      if (event.event_type === "HUMAN_DECISION" || event.decision_type !== undefined) {
        expect(event.decision_type).toBeTruthy();
        expect(event.actor).toBe("human");
        expect(event.actor_name).toBeTruthy();
      }
    }
  });
});

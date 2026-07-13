/**
 * SOVEREIGN Platform — module-aria
 * ppbe-aria.ts — the PPBE-specific ARIA Suite integrations (Session 32, D6;
 * docs/18 §7.2 ARIA scope): CLEAR monitoring rules for the PPBE regulatory
 * framework, and the TRACER traceability chain for budget submissions over the
 * REAL PPBE entities (built Session 31 — this upgrades the Session 24
 * "not yet integrated" obligation-chain state). The ARC side of §7.2 lands as
 * PPBE dependent items in arc-engine.ts's committed DEPENDENCY_MODEL, so the
 * existing impact modeler projects OMB/appropriations-law changes onto PPBE
 * items with no new engine.
 *
 * Everything here follows the ARIA determinism contract (docs/16 §1/§3): NO
 * LLM call, NO sovereign-api-client call, same input → same output. CLEAR's
 * base rules are NOT modified — evaluatePPBEDocument runs the base evaluation
 * and adds the PPBE rules, so non-PPBE documents are untouched (Constraint #3,
 * additive only).
 *
 * Version: 1.0 · Session 32 · July 13, 2026
 */

import type {
  ObligationRecord,
  ProgramRecord,
  StrategicObjective,
} from "@sovereign/data";

import { evaluateDocument } from "./clear-engine";
import type { ClearEvaluation, ClearEvaluationInput, Finding } from "./clear-types";
import { finalizeChain } from "./tracer-engine";
import type { ChainNode, TraceChain } from "./tracer-types";

// ============================================================
// CLEAR — PPBE monitoring rules (docs/18 §7.2)
// ============================================================

/** The six PPBE phases of the closed loop (plain-prose names, module-flowpath's taxonomy). */
export const PPBE_PHASE_NAMES: readonly string[] = [
  "Strategic Direction",
  "Planning and Evidence",
  "Programming",
  "Budget Formulation",
  "Budget Execution",
  "Performance Evaluation",
];

/**
 * The deterministic input to a PPBE document evaluation — the base CLEAR input
 * plus the already-measured PPBE facts. Every field is a fact about the
 * document; the rules apply fixed logic to them, never inference.
 */
export interface PPBEClearInput extends ClearEvaluationInput {
  /** Every figure in the document carries a source_workflow_step_id (docs/18 §3.3). */
  all_figures_traceable: boolean;
  /** The exhibit's source_data_lineage is present and non-empty (docs/18 §3.3). */
  has_source_data_lineage: boolean;
  /** feeds_planning_cycle is recorded on every evaluation finding the document presents (R-P7). */
  feeds_planning_recorded: boolean;
}

function rulePpbeFigureTraceability(input: PPBEClearInput): Finding {
  const passed = input.all_figures_traceable && input.has_source_data_lineage;
  return {
    rule_id: "R-PPBE-2",
    source_id: "dod-ppbe-reform",
    source_title: "DoD PPBE Reform",
    passed,
    // An untraceable figure in a congressional submission is the platform's P1 failure mode.
    severity: passed ? "green" : input.is_congressional_submission ? "red" : "amber",
    description: passed
      ? "Every figure in this document is traceable to its source record, and the exhibit carries its data lineage."
      : "One or more figures cannot be traced to a source record — PPBE reform guidance requires every " +
        "figure in a budget submission to be traceable to governed data.",
  };
}

function rulePpbePhaseInLoop(input: PPBEClearInput): Finding {
  const passed = PPBE_PHASE_NAMES.includes(input.ppbe_phase.trim());
  return {
    rule_id: "R-PPBE-3",
    source_id: "dod-ppbe-reform",
    source_title: "DoD PPBE Reform",
    passed,
    severity: passed ? "green" : "amber",
    description: passed
      ? `The document's declared phase (${input.ppbe_phase}) is one of the six phases of the PPBE closed loop.`
      : "The document's declared phase is not one of the six named PPBE phases — it cannot be placed in the closed loop.",
  };
}

function rulePpbeLearningLoopRecorded(input: PPBEClearInput): Finding {
  const passed = input.feeds_planning_recorded;
  return {
    rule_id: "R-PPBE-4",
    source_id: "dod-ppbe-reform",
    source_title: "DoD PPBE Reform",
    passed,
    severity: passed ? "green" : "amber",
    description: passed
      ? "Every evaluation finding this document presents records whether it feeds the planning cycle — the learning loop is measured."
      : "The document presents evaluation findings without recording whether they feed the planning cycle — " +
        "the loop must be measured, not assumed (risk R-P7).",
  };
}

export const PPBE_CLEAR_RULE_IDS = ["R-PPBE-2", "R-PPBE-3", "R-PPBE-4"] as const;

/**
 * Evaluate a PPBE document: the full base CLEAR evaluation (all four sources,
 * unchanged) PLUS the three PPBE monitoring rules. Deterministic; compliant
 * only when every base and PPBE rule passes.
 */
export function evaluatePPBEDocument(input: PPBEClearInput, evaluatedAt: string): ClearEvaluation {
  const base = evaluateDocument(input, evaluatedAt);
  const ppbeFindings = [
    rulePpbeFigureTraceability(input),
    rulePpbePhaseInLoop(input),
    rulePpbeLearningLoopRecorded(input),
  ];
  const findings = [...base.findings, ...ppbeFindings];
  return {
    ...base,
    findings,
    compliant: findings.every((f) => f.passed),
  };
}

// ============================================================
// TRACER — the budget-submission chain over the REAL PPBE entities
// (obligation → program → strategic objective → its authorizing decision)
// ============================================================

/**
 * Assemble the PPBE obligation chain from the canonical Session 31 entities.
 * Every node cites an existing record; a missing or mismatched link is an
 * orphan with a plain-prose reason — never a fabricated citation. This is the
 * chain the Session 24 stub (assembleObligationChain's "not yet integrated"
 * message) was waiting for; the stub remains for callers that have only an
 * ObligationRecordRef, and this assembly is the real path once the host
 * resolves the entities.
 */
export function assemblePPBEObligationChain(
  obligation: ObligationRecord,
  program?: ProgramRecord,
  objective?: StrategicObjective
): TraceChain {
  const label = `Obligation ${obligation.obligation_id} — ${obligation.amount} against cost code ${obligation.cost_code}`;
  const nodes: ChainNode[] = [];

  // Node 1 — the obligation itself, anchored to its Logger step (always traceable:
  // the entity requires workflow_step_id and authorizing_official — Tier C).
  nodes.push({
    node_id: `${obligation.obligation_id}:obligation`,
    kind: "obligation_record",
    title: `Obligation: ${obligation.amount} against cost code ${obligation.cost_code}, authorized by ${obligation.authorizing_official}`,
    cites: `The obligation record and its audit-trail entry, recorded ${obligation.timestamp}.`,
    source_kind: "logger_event",
    source_ref: obligation.workflow_step_id,
    traceable: true,
    technical_references: [
      { label: "Obligation id", value: obligation.obligation_id },
      { label: "Logger workflow step", value: obligation.workflow_step_id },
    ],
    timestamp: obligation.timestamp,
  });

  // Node 2 — the program the obligation serves.
  const programMatches = program !== undefined && program.program_id === obligation.program_id;
  nodes.push(
    programMatches
      ? {
          node_id: `${obligation.obligation_id}:program`,
          kind: "program_record",
          title: `Program: ${program.name} (${program.fiscal_year})`,
          cites: `The canonical program record ${program.program_id}, with its obligation plan and performance baseline.`,
          source_kind: "document",
          source_ref: program.program_id,
          traceable: true,
          technical_references: [{ label: "Program id", value: program.program_id }],
        }
      : {
          node_id: `${obligation.obligation_id}:program`,
          kind: "program_record",
          title: "Program record",
          cites:
            program === undefined
              ? `The obligation declares program ${obligation.program_id}, but no program record was resolved for it.`
              : `The obligation declares program ${obligation.program_id}, but the resolved record is ${program.program_id} — the chain does not connect.`,
          source_kind: "none",
          source_ref: "",
          traceable: false,
        }
  );

  // Node 3 — the strategic objective the program traces to (the chain's top).
  const objectiveMatches =
    programMatches && objective !== undefined && objective.objective_id === program.objective_id;
  nodes.push(
    objectiveMatches
      ? {
          node_id: `${obligation.obligation_id}:objective`,
          kind: "strategic_objective",
          title: `Strategic objective: ${objective.title} (${objective.fiscal_year_range})`,
          cites:
            `The canonical strategic objective ${objective.objective_id}, ranked in Phase 1 and approved by ` +
            `Decision Record ${objective.decision_record_id}.`,
          source_kind: "document",
          source_ref: objective.objective_id,
          traceable: true,
          technical_references: [
            { label: "Objective id", value: objective.objective_id },
            { label: "Approving Decision Record", value: objective.decision_record_id },
            { label: "Origin Logger workflow step", value: objective.source_workflow_step_id },
          ],
        }
      : {
          node_id: `${obligation.obligation_id}:objective`,
          kind: "strategic_objective",
          title: "Strategic objective",
          cites: !programMatches
            ? "The objective cannot be traced because the program link above is broken."
            : objective === undefined
              ? `The program declares objective ${program.objective_id}, but no strategic objective record was resolved for it.`
              : `The program declares objective ${program.objective_id}, but the resolved record is ${objective.objective_id} — the chain does not connect.`,
          source_kind: "none",
          source_ref: "",
          traceable: false,
        }
  );

  return finalizeChain("obligation", obligation.obligation_id, label, nodes);
}

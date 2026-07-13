/**
 * SOVEREIGN Platform — module-counsel
 * ppbe-decisions.ts — the four PPBE decision types (Session 32, D7;
 * docs/18 §7.2 COUNSEL scope): Strategic Priority Ranking, Programming
 * Trade-Off, Phase Transition Authorization, Evaluation Finding Response.
 *
 * GOVERNANCE: the four PPBE decision types are a MODULE-LEVEL taxonomy, not
 * HumanDecisionType members — the Session 31 Project Principal decision #5
 * ruled that PPBE decisions reuse the existing canonical members (no
 * PPBE-specific HumanDecisionType), so each PPBE type maps to HUMAN_APPROVAL
 * on the frozen taxonomy and carries its PPBE identity in the event payload.
 * Same deliberate pattern as the TT communication modes and SCRIBE PPBE
 * document modes: module-local taxonomy, canonical event fields.
 *
 * Decision Records built here carry the FULL Intelligence Layer field set —
 * they ride buildDecisionRecord() unchanged (Constraint #3: no rewrite debt;
 * the existing assembly already emits every frozen IL field), and this module
 * only validates the PPBE context and extends the event payload with the PPBE
 * traceability fields (ppbe_decision_type, program/objective ids, phase pair,
 * finding id). It also produces the docs/18 §4 PPBE_DECISION field set for the
 * Python-side emitter (the four PPBE event types are Python-only, Session 31
 * decision #3).
 *
 * Version: 1.0 · Session 32 · July 13, 2026
 */

import type { HumanDecisionType } from "@sovereign/data";

import {
  buildDecisionRecord,
  type AssembledDecisionRecord,
  type DecisionRecordDeps,
  type DecisionRecordInput,
  type DecisionRecordResult,
} from "./decision-record";

// ============================================================
// THE FOUR PPBE DECISION TYPES (module-level taxonomy — see header)
// ============================================================

export type PPBEDecisionType =
  | "STRATEGIC_PRIORITY_RANKING"
  | "PROGRAMMING_TRADE_OFF"
  | "PHASE_TRANSITION_AUTHORIZATION"
  | "EVALUATION_FINDING_RESPONSE";

export const PPBE_DECISION_TYPES: readonly PPBEDecisionType[] = [
  "STRATEGIC_PRIORITY_RANKING",
  "PROGRAMMING_TRADE_OFF",
  "PHASE_TRANSITION_AUTHORIZATION",
  "EVALUATION_FINDING_RESPONSE",
];

/** Plain-prose names (Gap 5). */
export const PPBE_DECISION_TYPE_NAMES: Record<PPBEDecisionType, string> = {
  STRATEGIC_PRIORITY_RANKING: "Strategic Priority Ranking",
  PROGRAMMING_TRADE_OFF: "Programming Trade-Off",
  PHASE_TRANSITION_AUTHORIZATION: "Phase Transition Authorization",
  EVALUATION_FINDING_RESPONSE: "Evaluation Finding Response",
};

/**
 * The canonical HumanDecisionType each PPBE decision carries on its
 * HUMAN_DECISION event. All four are HUMAN_APPROVAL per the Session 31
 * Project Principal decision #5 (reuse existing members; no PPBE-specific
 * HumanDecisionType) — the PPBE identity travels in the payload.
 */
export function canonicalDecisionTypeFor(_type: PPBEDecisionType): HumanDecisionType {
  return "HUMAN_APPROVAL";
}

// ============================================================
// PPBE DECISION CONTEXT + VALIDATION
// ============================================================

/** The PPBE traceability context a PPBE decision carries (docs/18 §4 / §7.2). */
export interface PPBEDecisionContext {
  ppbe_decision_type: PPBEDecisionType;
  /** FK → ProgramRecord. */
  program_id: string;
  /** FK → StrategicObjective — required for a ranking; optional otherwise. */
  objective_id?: string;
  /** PHASE_TRANSITION_AUTHORIZATION only — the closed-loop pair. */
  from_phase?: number;
  to_phase?: number;
  /** EVALUATION_FINDING_RESPONSE only — the finding being responded to. */
  finding_id?: string;
}

/** The six-phase closed loop admits N → N+1 or the loop-closing 6 → 1
 *  (restated from module-vigil — Constraint #11, no cross-module import;
 *  the e2e suite asserts the two implementations agree). */
function isValidPhasePair(from: number, to: number): boolean {
  const inRange = (p: number) => Number.isInteger(p) && p >= 1 && p <= 6;
  if (!inRange(from) || !inRange(to)) return false;
  return to === from + 1 || (from === 6 && to === 1);
}

/** Validate the PPBE context for its decision type. Plain-prose errors (Gap 5). */
export function validatePPBEDecisionContext(context: PPBEDecisionContext): string[] {
  const errors: string[] = [];
  if (!PPBE_DECISION_TYPES.includes(context.ppbe_decision_type)) {
    errors.push(`ppbe_decision_type: must be one of ${PPBE_DECISION_TYPES.join(", ")}`);
  }
  if (context.program_id.trim() === "") {
    errors.push("program_id: required — every PPBE decision traces to a program.");
  }
  if (
    context.ppbe_decision_type === "STRATEGIC_PRIORITY_RANKING" &&
    (context.objective_id === undefined || context.objective_id.trim() === "")
  ) {
    errors.push("objective_id: a Strategic Priority Ranking decision must name the objective being ranked.");
  }
  if (context.ppbe_decision_type === "PHASE_TRANSITION_AUTHORIZATION") {
    if (context.from_phase === undefined || context.to_phase === undefined) {
      errors.push("from_phase/to_phase: a Phase Transition Authorization must name the transition pair.");
    } else if (!isValidPhasePair(context.from_phase, context.to_phase)) {
      errors.push(
        `from_phase/to_phase: ${context.from_phase} to ${context.to_phase} is not a transition the ` +
          "six-phase closed loop admits (forward one phase, or 6 back to 1)."
      );
    }
  }
  if (
    context.ppbe_decision_type === "EVALUATION_FINDING_RESPONSE" &&
    (context.finding_id === undefined || context.finding_id.trim() === "")
  ) {
    errors.push("finding_id: an Evaluation Finding Response must name the finding being responded to.");
  }
  return errors;
}

// ============================================================
// RECORD ASSEMBLY — rides buildDecisionRecord, payload extended
// ============================================================

/**
 * Assemble a PPBE Decision Record: validate the PPBE context, run the
 * standard COUNSEL assembly (Gate 3, chosen-alternative check, canonical
 * Document validation, full IL field set — all unchanged), then extend the
 * HUMAN_DECISION payload with the PPBE traceability fields. The frame's
 * decisionType must be the canonical mapping for the PPBE type — a mismatch
 * is refused rather than silently corrected.
 */
export function buildPPBEDecisionRecord(
  input: DecisionRecordInput,
  ppbe: PPBEDecisionContext,
  deps: DecisionRecordDeps
): DecisionRecordResult {
  const contextErrors = validatePPBEDecisionContext(ppbe);
  if (input.frame.sovereignContext.decisionType !== canonicalDecisionTypeFor(ppbe.ppbe_decision_type)) {
    contextErrors.push(
      `decisionType: a ${PPBE_DECISION_TYPE_NAMES[ppbe.ppbe_decision_type]} decision carries ` +
        `${canonicalDecisionTypeFor(ppbe.ppbe_decision_type)} on the canonical taxonomy (Session 31 decision #5) — ` +
        `the frame carries ${input.frame.sovereignContext.decisionType}.`
    );
  }
  if (input.programId !== ppbe.program_id) {
    contextErrors.push(
      `program_id: the Decision Record's program (${input.programId}) and the PPBE context's program ` +
        `(${ppbe.program_id}) must be the same program.`
    );
  }
  if (contextErrors.length > 0) return { ok: false, errors: contextErrors };

  const base = buildDecisionRecord(input, deps);
  if (!base.ok) return base;

  const extended: AssembledDecisionRecord = {
    document: base.record.document,
    event: {
      ...base.record.event,
      payload: {
        ...base.record.event.payload,
        ppbe_decision_type: ppbe.ppbe_decision_type,
        ppbe_decision_name: PPBE_DECISION_TYPE_NAMES[ppbe.ppbe_decision_type],
        objective_id: ppbe.objective_id ?? null,
        from_phase: ppbe.from_phase ?? null,
        to_phase: ppbe.to_phase ?? null,
        finding_id: ppbe.finding_id ?? null,
      },
    },
  };
  return { ok: true, record: extended };
}

// ============================================================
// PYTHON-SIDE EMISSION RECORD (docs/18 §4 — PPBE_DECISION is Python-only)
// ============================================================

/** The docs/18 §4 PPBE_DECISION field set for an assembled PPBE Decision Record. */
export interface PPBEDecisionEmission {
  decision_type: HumanDecisionType;
  ppbe_decision_type: PPBEDecisionType;
  program_id: string;
  objective_id: string | null;
  approving_human: string;
  workflow_step_id: string;
  /** The canonical Document the decision produced — the signed record. */
  document_id: string;
}

/** Build the Python-side PPBE_DECISION emission payload from an assembled record. */
export function ppbeDecisionEmissionRecord(
  record: AssembledDecisionRecord,
  ppbe: PPBEDecisionContext
): PPBEDecisionEmission {
  return {
    decision_type: canonicalDecisionTypeFor(ppbe.ppbe_decision_type),
    ppbe_decision_type: ppbe.ppbe_decision_type,
    program_id: ppbe.program_id,
    objective_id: ppbe.objective_id ?? null,
    approving_human: record.event.actor_name ?? "",
    workflow_step_id: record.event.workflow_step_id,
    document_id: record.document.document_id,
  };
}

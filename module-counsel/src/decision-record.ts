/**
 * SOVEREIGN Platform — module-counsel
 * decision-record.ts — Decision Record assembly (pure, no React).
 *
 * The final COUNSEL output (spec §3): one DecisionFrame + its AnalysisResult
 * (optionally extended with a counterargument summary and/or a pre-mortem) + the
 * human's chosen action → one DecisionRecord. The DecisionRecord is exported as a
 * JSON object conforming to the SOVEREIGN canonical `Document` entity from
 * @sovereign/data, and is emitted in a `HUMAN_DECISION` Logger event carrying the
 * frozen Intelligence Layer fields.
 *
 * GOVERNANCE (verified against existing decisions — no contract change made here):
 *   - `HUMAN_DECISION` is an existing SovereignEventType; `decision_type` comes
 *     from the frozen HumanDecisionType taxonomy carried on the DecisionFrame. No
 *     new event type or taxonomy is invented.
 *   - The canonical Document is validated with validateDocument() BEFORE the event
 *     is emitted (spec §3 "validated against schema"; CPMI-VRS Gate 2 discipline).
 *   - CPMI-VRS Gate 3 (spec §7): a DecisionRecord cannot be produced until the
 *     human explicitly confirms they reviewed the analysis and chose an action.
 *     buildDecisionRecord refuses to assemble until `reviewConfirmed` is true.
 *   - classification_level defaults to the counsel-analyst data_classification
 *     ceiling ("CUI", agent card in src/index.ts) when the caller does not supply
 *     one — this is authorized by the agent card, not a new policy. program_id is
 *     a required Document field with no DecisionFrame source, so it is a required
 *     assembly input (supplied by the deep-linking product or the user).
 *
 * Pure and dependency-injected (clock + id generator + actor identity) so it is
 * unit-testable in Node with no React, no Date, no Logger. The hook
 * (useDecisionRecord) wires the real ctx.logger, ctx.auth, and runtime clock/id.
 *
 * Version: 1.0 · Session 5 · June 16, 2026
 */

import { validateDocument, type Document, type ClearanceLevel } from "@sovereign/data";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import type { AnalysisResult } from "./analysis-contract";
import { PR_COUNSEL_001 } from "./analysis-contract";
import type { CounterargumentSummary } from "./counter-contract";
import { PR_COUNSEL_002 } from "./counter-contract";
import { ANALYSIS_PROMPT_VERSION } from "./prompts/analysis-system.prompt";
import { COUNTER_PROMPT_VERSION } from "./prompts/counter-system.prompt";
import { PREMORTEM_PROMPT_VERSION } from "./prompts/premortem-system.prompt";
import type { PreMortemResult } from "./premortem-contract";
import { PR_COUNSEL_003 } from "./premortem-contract";
import type { DecisionFrame } from "./types";

/** Default Document classification when the caller supplies none — the
 *  counsel-analyst agent card's data_classification_ceiling (src/index.ts). */
export const DEFAULT_DECISION_CLASSIFICATION: ClearanceLevel = "CUI";

/** Everything needed to assemble a DecisionRecord from a completed session. */
export interface DecisionRecordInput {
  frame: DecisionFrame;
  analysis: AnalysisResult;
  /** Optional Counterargument Mode outcome, if the user ran it. */
  counterargument?: CounterargumentSummary;
  /** Optional Pre-Mortem Studio outcome, if the user ran it. */
  preMortem?: PreMortemResult;
  /** The alternative the human chose (must reference an Alternative.id). */
  chosenAlternativeId: string;
  /** The human's plain-language rationale for the choice. */
  rationale: string;
  /** Program the decision belongs to — required by the canonical Document. */
  programId: string;
  /** Document classification; defaults to DEFAULT_DECISION_CLASSIFICATION. */
  classificationLevel?: ClearanceLevel;
  /**
   * Conflicting prior Decision Record IDs surfaced by a Prior Position Alert
   * (spec §3 — a DecisionRecord may reference zero or more). Optional.
   */
  conflictingRecordIds?: string[];
  /**
   * CPMI-VRS Gate 3: the human has explicitly confirmed they reviewed the
   * analysis and chose an action. Assembly refuses to proceed until this is true.
   */
  reviewConfirmed: boolean;
}

/** Injected, side-effect-bearing values the hook supplies (clock, id, identity). */
export interface DecisionRecordDeps {
  /** ISO 8601 timestamp source. */
  now: () => string;
  /** document_id generator. */
  newDocumentId: () => string;
  /** employee_id of the deciding human (HUMAN_DECISION actor_id / Document created_by). */
  actorId: string;
  /** Full name of the deciding human (HUMAN_DECISION actor_name — required). */
  actorName: string;
}

/** The assembled record: a canonical Document + the HUMAN_DECISION event to emit. */
export interface AssembledDecisionRecord {
  document: Document;
  /** The HUMAN_DECISION Logger event — emitted by the hook, not here. */
  event: SovereignLogEvent;
}

export type DecisionRecordResult =
  | { ok: true; record: AssembledDecisionRecord }
  | { ok: false; errors: string[] };

/** Title for the Document, derived from the decision statement (kept readable). */
function decisionTitle(statement: string): string {
  const trimmed = statement.trim().replace(/\s+/g, " ");
  const clipped = trimmed.length > 80 ? `${trimmed.slice(0, 77)}…` : trimmed;
  return `COUNSEL Decision Record — ${clipped}`;
}

/**
 * Assemble a DecisionRecord from a completed COUNSEL session. Returns
 * { ok: false, errors } — never throws — when Gate 3 is unmet, the chosen
 * alternative does not exist, a required input is missing, or the resulting
 * canonical Document fails validateDocument(). The hook emits the event only on
 * { ok: true }.
 */
export function buildDecisionRecord(
  input: DecisionRecordInput,
  deps: DecisionRecordDeps
): DecisionRecordResult {
  const errors: string[] = [];

  // --- CPMI-VRS Gate 3: explicit human review + choice required ---
  if (!input.reviewConfirmed) {
    errors.push(
      "Gate 3: a Decision Record cannot be produced until the user confirms they reviewed the analysis and chose an action."
    );
  }

  // --- chosen alternative must exist in the analysis ---
  const chosen = input.analysis.alternatives.find((a) => a.id === input.chosenAlternativeId);
  if (!chosen) {
    errors.push(
      `chosenAlternativeId: "${input.chosenAlternativeId}" does not reference any alternative in the analysis.`
    );
  }

  if (input.rationale.trim() === "") {
    errors.push("rationale: the human's rationale for the choice is required.");
  }
  if (input.programId.trim() === "") {
    errors.push("programId: required for the canonical Document entity.");
  }

  // Fail fast before building the Document if the prerequisites are unmet.
  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const classification = input.classificationLevel ?? DEFAULT_DECISION_CLASSIFICATION;
  const document: Document = {
    document_id: deps.newDocumentId(),
    title: decisionTitle(input.frame.decisionStatement),
    classification_level: classification,
    version: "1.0",
    created_by: deps.actorId,
    program_id: input.programId,
    created_at: deps.now(),
  };

  // --- validate the canonical Document BEFORE emitting anything ---
  const check = validateDocument(document);
  if (!check.valid) {
    return { ok: false, errors: check.errors ?? ["Document failed validation"] };
  }

  // --- prompt provenance: every mode that contributed to this record ---
  const promptsUsed: Array<{ registry_id: string; prompt_version: string }> = [
    { registry_id: PR_COUNSEL_001.registryId, prompt_version: ANALYSIS_PROMPT_VERSION },
  ];
  const modesUsed: string[] = ["analysis"];
  if (input.counterargument) {
    promptsUsed.push({ registry_id: PR_COUNSEL_002.registryId, prompt_version: COUNTER_PROMPT_VERSION });
    modesUsed.push("counterargument");
  }
  if (input.preMortem) {
    promptsUsed.push({ registry_id: PR_COUNSEL_003.registryId, prompt_version: PREMORTEM_PROMPT_VERSION });
    modesUsed.push("premortem");
  }

  // --- the HUMAN_DECISION event (existing event type; frozen IL fields) ---
  const event: SovereignLogEvent = {
    event_type: "HUMAN_DECISION",
    workflow_step_id: input.frame.sovereignContext.workflowStepId,
    sovereign_tier: "standard",
    product: "COUNSEL",
    actor_id: deps.actorId,
    outcome: "decision_recorded",
    // HUMAN_DECISION-only fields (shell logger validator enforces all three).
    decision_type: input.frame.sovereignContext.decisionType,
    actor: "human",
    actor_name: deps.actorName,
    payload: {
      document_id: document.document_id,
      source_product: input.frame.sovereignContext.sourceProduct,
      chosen_alternative_id: input.chosenAlternativeId,
      chosen_alternative_label: chosen!.label,
      rationale: input.rationale.trim(),
      confidence_score: input.analysis.confidenceScore,
      modes_used: modesUsed,
      prompts: promptsUsed,
      program_id: input.programId,
      classification_level: classification,
      counterargument_position_survived: input.counterargument?.positionSurvived ?? null,
      premortem_overall_vulnerability: input.preMortem?.overallVulnerability ?? null,
      conflicting_record_ids: input.conflictingRecordIds ?? [],
    },
  };

  return { ok: true, record: { document, event } };
}

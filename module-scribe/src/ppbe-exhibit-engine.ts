/**
 * SOVEREIGN Platform — module-scribe
 * ppbe-exhibit-engine.ts — the PPBE exhibit drafting orchestration (pure, no
 * React). Session 32, D3.
 *
 * Extends SCRIBE's drafting engine with the three PPBE document modes
 * (docs/18 §7.2) under the PENDING registered prompt, following the
 * tt-draft-engine pattern exactly: three-tier fallback — live (the model
 * output parses AND validates, including figure-source traceability and
 * system invisibility) → cache (last good draft for this input) → static (a
 * meaningful template built only from the supplied governed records; every
 * static figure cites its real source).
 *
 * THE SYSTEM PREPARES; THE HUMAN DECIDES: nothing this engine produces is an
 * exported document. Every draft feeds review, and export requires BOTH a
 * CLEAR certification AND a human sign-off (ppbe-exhibit-contract.ts). The
 * engine has no export path.
 *
 * SOURCE REFERENCES: the allowed figure sources are the workflow_step_id
 * values of the governed records actually supplied — each ObligationRecord
 * and EvaluationFinding carries its own. ProgramRecord plan figures carry no
 * per-entity Logger reference, so the host supplies plan_source_step_id (the
 * Logger reference under which the program's planning data was recorded, e.g.
 * the FLOWPATH artifact step). Without it, plan-derived figures are simply
 * not draftable — the engine never synthesizes a source that doesn't exist.
 *
 * The LLM call is injected (createSovereignClient — Constraint #5) so this
 * module is unit-testable in Node with fakes.
 *
 * Version: 1.0 · Session 32 · July 13, 2026
 */

import type {
  SovereignMessage,
  SovereignRequestContext,
  SovereignLLMResponse,
} from "@sovereign/api-client";
import type { EvaluationFinding, ObligationRecord, ProgramRecord } from "@sovereign/data";

import {
  PPBE_DOCUMENT_MODE_NAMES,
  validatePPBEExhibitDraft,
  type PPBEDocumentMode,
  type PPBEExhibitDraft,
  type ExhibitFigure,
} from "./ppbe-exhibit-contract";

export type PPBEExhibitTier = "live" | "cache" | "static";

/** One exhibit drafting pass — governed data only. */
export interface ExhibitDraftInput {
  mode: PPBEDocumentMode;
  program: ProgramRecord;
  obligations: ObligationRecord[];
  /** Required content for EVALUATION_REPORT mode; optional context otherwise. */
  findings?: EvaluationFinding[];
  /** The Logger reference for the program's planning data, when the host has one. */
  plan_source_step_id?: string;
  /** Supplied by the originating flow, or synthesized (Constraint #6). */
  workflowStepId?: string;
}

export interface ExhibitDraftOutcome {
  draft: PPBEExhibitDraft;
  tier: PPBEExhibitTier;
  /** Why a fallback tier was used, when applicable (for the Logger payload). */
  detail?: string;
}

/** Injected dependencies — the hook wires these to sovereign-api-client + a session cache. */
export interface ExhibitDraftDeps {
  complete: (
    messages: SovereignMessage[],
    context: SovereignRequestContext
  ) => Promise<SovereignLLMResponse>;
  cacheGet: (key: string) => PPBEExhibitDraft | null;
  cacheSet: (key: string, value: PPBEExhibitDraft) => void;
}

// ============================================================
// WORKFLOW STEP + SOURCE REFERENCES (Constraint #6)
// ============================================================

export function exhibitWorkflowStepId(input: ExhibitDraftInput): string {
  if (input.workflowStepId) return input.workflowStepId;
  return `ppbe-exhibit-${input.mode.toLowerCase()}-${input.program.program_id}`;
}

/** The figure sources this input actually supplies — nothing else is citable. */
export function allowedSourceRefs(input: ExhibitDraftInput): Set<string> {
  const refs = new Set<string>();
  for (const o of input.obligations) refs.add(o.workflow_step_id);
  for (const f of input.findings ?? []) refs.add(f.workflow_step_id);
  if (input.plan_source_step_id) refs.add(input.plan_source_step_id);
  return refs;
}

export function exhibitCacheKey(input: ExhibitDraftInput): string {
  return `PPBE:${input.mode}:${exhibitWorkflowStepId(input)}:${input.program.program_id}`;
}

// ============================================================
// MESSAGES + PARSING
// ============================================================

/** Build the two-message conversation: registered system prompt + governed data. */
export function buildExhibitMessages(
  input: ExhibitDraftInput,
  systemPrompt: string
): SovereignMessage[] {
  const payload = {
    document_mode: input.mode,
    program_record: input.program,
    obligation_records: input.obligations,
    evaluation_findings: input.findings ?? [],
    plan_source_step_id: input.plan_source_step_id ?? null,
    workflow_step_id: exhibitWorkflowStepId(input),
  };
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: JSON.stringify(payload, null, 2) },
  ];
}

/**
 * Parse the model output into a validated PPBEExhibitDraft, or null. The
 * draft must be the REQUESTED mode — a model that answered a different
 * question is not surfaceable. Tolerates a fence.
 */
export function parseExhibitDraft(
  content: string,
  requestedMode: PPBEDocumentMode,
  refs: ReadonlySet<string>
): PPBEExhibitDraft | null {
  const stripped = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    return null;
  }
  if (!validatePPBEExhibitDraft(parsed, refs).valid) return null;
  const draft = parsed as PPBEExhibitDraft;
  return draft.document_mode === requestedMode ? draft : null;
}

// ============================================================
// STATIC TIER — real figures, real citations, bracketed instructions
// ============================================================

const STATIC_NOTICE =
  "[Drafting service unavailable — this is a static fallback assembled from the governed " +
  "records, not a generated narrative. Complete the document from the cited records before review.]";

/**
 * A meaningful static fallback for the mode — never fabricated. Figures are
 * mode-appropriate: Evaluation Report cites findings; other modes cite obligations.
 * Bracketed text is an instruction to the reviewing official; validation re-runs
 * on the edited result at the sign-off gate.
 */
export function staticExhibitDraft(input: ExhibitDraftInput): PPBEExhibitDraft {
  const wsid = exhibitWorkflowStepId(input);
  const modeName = PPBE_DOCUMENT_MODE_NAMES[input.mode];
  const title = `${modeName} — ${input.program.name} (${input.program.fiscal_year})`;

  // EVALUATION_REPORT: figures cite findings, not obligations — the two are different
  // artifact types and mixing them produces a figure list that contradicts the body text.
  if (input.mode === "EVALUATION_REPORT") {
    const findings = input.findings ?? [];
    const feeding = findings.filter((f) => f.feeds_planning_cycle).length;
    const figures: ExhibitFigure[] = findings.map((f) => ({
      label: `Evaluation finding: ${f.finding_type.replace(/_/g, " ")} (${
        f.feeds_planning_cycle ? "feeds planning cycle" : "does not feed planning cycle"
      })`,
      value: 1,
      source_workflow_step_id: f.workflow_step_id,
    }));
    const body =
      findings.length === 0
        ? "No evaluation findings are recorded for this program. That absence is reported as a fact — " +
          "it is not evidence of performance."
        : `This program has ${findings.length} recorded evaluation ${findings.length === 1 ? "finding" : "findings"}, ` +
          `of which ${feeding} ${feeding === 1 ? "feeds" : "feed"} the planning cycle. ` +
          "Each finding is cited in the figures below by its source record.";
    return {
      document_mode: input.mode,
      title,
      narrative: `${STATIC_NOTICE} ${body}`,
      figures,
      workflow_step_id: wsid,
    };
  }

  // BUDGET_EXHIBIT and CONGRESSIONAL_JUSTIFICATION: obligation-based figures.
  const figures: ExhibitFigure[] = input.obligations.map((o) => ({
    label: `Obligation recorded against cost code ${o.cost_code}`,
    value: o.amount,
    source_workflow_step_id: o.workflow_step_id,
  }));
  if (input.plan_source_step_id) {
    figures.push({
      label: `Planned obligations for ${input.program.fiscal_year} (sum of the obligation plan)`,
      value: input.program.obligation_plan.reduce((sum, e) => sum + e.planned_amount, 0),
      source_workflow_step_id: input.plan_source_step_id,
    });
  }
  const body =
    input.obligations.length === 0
      ? "No obligations are recorded against this program. The exhibit cannot present execution " +
        "figures that do not exist."
      : `This program has ${input.obligations.length} recorded ${input.obligations.length === 1 ? "obligation" : "obligations"}, ` +
        "listed in the figures with their source records.";

  return {
    document_mode: input.mode,
    title,
    narrative: `${STATIC_NOTICE} ${body}`,
    figures,
    workflow_step_id: wsid,
  };
}

// ============================================================
// ENGINE — live → cache → static, one live attempt, never throws
// ============================================================

export async function runExhibitDraft(
  input: ExhibitDraftInput,
  systemPrompt: string,
  requestContext: SovereignRequestContext,
  deps: ExhibitDraftDeps
): Promise<ExhibitDraftOutcome> {
  const refs = allowedSourceRefs(input);
  const key = exhibitCacheKey(input);
  let detail: string | undefined;

  // ---- Tier 1: live ----
  try {
    const response = await deps.complete(buildExhibitMessages(input, systemPrompt), requestContext);
    if (!response.fallback_activated) {
      const parsed = parseExhibitDraft(response.content, input.mode, refs);
      if (parsed) {
        deps.cacheSet(key, parsed);
        return { draft: parsed, tier: "live" };
      }
      detail = "live_response_failed_draft_validation";
    } else {
      detail = `api_client_fallback_${response.fallback_tier}`;
    }
  } catch (err) {
    detail = err instanceof Error ? err.message : String(err);
  }

  // ---- Tier 2: cache ----
  const cached = deps.cacheGet(key);
  if (cached) return { draft: cached, tier: "cache", detail };

  // ---- Tier 3: static ----
  return { draft: staticExhibitDraft(input), tier: "static", detail };
}

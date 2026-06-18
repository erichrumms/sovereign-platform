/**
 * SOVEREIGN Platform — module-scribe
 * draft-engine.ts — the SCRIBE Drafting Engine orchestration (pure, no React).
 *
 * Implements the platform-standard three-tier fallback at the draft level, PER
 * MODE: live (sovereign-api-client returns a response whose content parses and
 * validates as the mode's canonical schema) → cache (the last good draft for this
 * mode+input) → static (a meaningful, schema-valid template — NOT an empty stub;
 * spec §4.2 three-tier fallback). The static template is a degraded placeholder a
 * human edits before export, never fabricated program data.
 *
 * SCHEMA PURITY (Standing Constraint #2): the draft object returned is the exact
 * @sovereign/data schema for the mode — no field is added, renamed, or dropped.
 * Unlike COUNSEL's AnalysisResult (a module-internal type that carries a `source`
 * tier tag), the serving tier here rides on the DraftOutcome WRAPPER, never on the
 * canonical draft object, because that object must export to a product unmodified.
 *
 * The LLM call and Logger emission are injected (the hook supplies them) so this
 * module is unit-testable in Node with fakes. The LLM is always reached through
 * sovereign-api-client — never the Anthropic API directly (Standing Constraint #5).
 *
 * Version: 1.0 · Session 6 · June 17, 2026
 */

import type {
  SovereignMessage,
  SovereignRequestContext,
  SovereignLLMResponse,
} from "@sovereign/api-client";
import type {
  StyleProfile,
  HumanDecisionType,
  CorrespondenceDraftSchema,
  ProgramNarrativeSchema,
  ReportCommentarySchema,
  VVRDescriptionSchema,
  GovernanceMemoSchema,
  RuleChangeProposalSchema,
} from "@sovereign/data";

import {
  validateModeOutput,
  type DraftableMode,
  type ModeOutput,
} from "./draft-contract";

export type DraftTier = "live" | "cache" | "static";

/**
 * Context the originating SOVEREIGN product (or the user) supplies. All optional —
 * SCRIBE can be used standalone, in which case the engine synthesizes a
 * workflow_step_id so every Logger call still carries one (Standing Constraint #6).
 */
export interface DraftContext {
  programId?: string;
  documentId?: string;
  decisionType?: HumanDecisionType;
  /** Present if the draft was initiated from a SOVEREIGN product context. */
  workflowStepId?: string;
}

/** The structured input for one drafting pass (transient — no SCRIBE data store). */
export interface DraftInput {
  mode: DraftableMode;
  /** The raw notes / transcript / source text to draft from. */
  capturedMaterial: string;
  /**
   * Optional Style DNA. D1 accepts and forwards it to the prompt; the
   * scribe-style-analyst path that produces it is D2. Present → match the voice.
   */
  styleProfile?: StyleProfile;
  context?: DraftContext;
}

export interface DraftOutcome {
  /** The schema-pure draft, exactly the mode's @sovereign/data shape. */
  draft: ModeOutput;
  mode: DraftableMode;
  tier: DraftTier;
  /** Why a fallback tier was used, when applicable (for the Logger payload). */
  detail?: string;
}

/** Injected dependencies — the hook wires these to sovereign-api-client + a session cache. */
export interface DraftDeps {
  /** Live tier. May reject (e.g. no API key) — the engine routes that to fallback. */
  complete: (
    messages: SovereignMessage[],
    context: SovereignRequestContext
  ) => Promise<SovereignLLMResponse>;
  cacheGet: (key: string) => ModeOutput | null;
  cacheSet: (key: string, value: ModeOutput) => void;
}

/** The workflow_step_id every Logger/request call uses — supplied or synthesized. */
export function draftWorkflowStepId(input: DraftInput): string {
  return input.context?.workflowStepId ?? `scribe-${input.mode}-draft-step-1`;
}

/** Per-mode + per-input cache key — stable for the same captured material in the same step. */
export function draftCacheKey(input: DraftInput): string {
  return `SCRIBE:${input.mode}:${draftWorkflowStepId(input)}:${input.capturedMaterial.trim()}`;
}

/** Build the two-message conversation: PR-SCRIBE-001 system prompt + the input as JSON. */
export function buildDraftMessages(input: DraftInput, systemPrompt: string): SovereignMessage[] {
  return [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: JSON.stringify(
        {
          mode: input.mode,
          capturedMaterial: input.capturedMaterial,
          styleProfile: input.styleProfile ?? null,
          context: input.context ?? null,
        },
        null,
        2
      ),
    },
  ];
}

/**
 * Parse the model's text output into a draft validated against the mode's schema,
 * or null if it is not parseable / not schema-valid. Tolerates a ```json fence.
 * The returned object is schema-pure — no provenance field is attached.
 */
export function parseDraft(mode: DraftableMode, content: string): ModeOutput | null {
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
  const check = validateModeOutput(mode, parsed);
  return check.valid ? (parsed as ModeOutput) : null;
}

// ============================================================
// STATIC TIER-3 TEMPLATES — meaningful, schema-valid, never fabricated.
// Every prose field is a clear instruction to the human; every reference field
// is a bracketed placeholder the human must replace; the Export gate re-validates
// the human-edited result before it can leave SCRIBE.
// ============================================================

const UNAVAILABLE =
  "[SCRIBE drafting service is unavailable — this is a static fallback, not a generated draft. " +
  "Replace this text with your own content before export. Re-run drafting when the service is restored.]";

const PLACEHOLDER = (field: string): string => `[${field} — supply before export]`;

const STATIC_TEMPLATES: { [M in DraftableMode]: () => ModeOutput } = {
  correspondence_draft: (): CorrespondenceDraftSchema => ({
    subject: PLACEHOLDER("SUBJECT"),
    body: UNAVAILABLE,
    action_items: [],
  }),
  program_narrative: (): ProgramNarrativeSchema => ({
    program_id: PLACEHOLDER("PROGRAM_ID"),
    period: PLACEHOLDER("PERIOD"),
    narrative: UNAVAILABLE,
    key_themes: [],
    risks_noted: [],
  }),
  report_commentary: (): ReportCommentarySchema => ({
    report_section: "executive_summary",
    program_id: PLACEHOLDER("PROGRAM_ID"),
    commentary: UNAVAILABLE,
    anomalies_addressed: [],
  }),
  vvr_description: (): VVRDescriptionSchema => ({
    step_id: PLACEHOLDER("STEP_ID"),
    description: UNAVAILABLE,
    inputs: [],
    outputs: [],
    decision_required: false,
    human_role: PLACEHOLDER("HUMAN_ROLE"),
  }),
  governance_memo: (): GovernanceMemoSchema => ({
    subject: PLACEHOLDER("SUBJECT"),
    cpmi_reference: PLACEHOLDER("CPMI_REFERENCE"),
    decision: UNAVAILABLE,
    reasoning: UNAVAILABLE,
    // decision_type is a structural enum (not fabricated program data); the most
    // neutral member. The human selects the correct value before export; the gate
    // re-validates. Placeholder reasoning above makes the degraded state explicit.
    decision_type: "HUMAN_APPROVAL" as HumanDecisionType,
  }),
  rule_change_proposal: (): RuleChangeProposalSchema => ({
    rule_id: PLACEHOLDER("RULE_ID"),
    current_rule: PLACEHOLDER("CURRENT_RULE"),
    proposed_rule: UNAVAILABLE,
    justification: UNAVAILABLE,
    regulatory_source: PLACEHOLDER("REGULATORY_SOURCE"),
  }),
};

/**
 * A meaningful static fallback for the mode — NOT an empty stub. Schema-valid so
 * the Draft Viewer renders it and the human can edit; every field is a placeholder
 * or an explicit "service unavailable" instruction, never invented content.
 */
export function staticDraftFallback(mode: DraftableMode): ModeOutput {
  return STATIC_TEMPLATES[mode]();
}

/**
 * Run the draft with three-tier fallback. Never throws: it always returns a
 * schema-valid draft tagged with the tier that served it. Exactly one live attempt
 * (one createSovereignClient().complete via deps.complete) per call.
 */
export async function runDraft(
  input: DraftInput,
  systemPrompt: string,
  requestContext: SovereignRequestContext,
  deps: DraftDeps
): Promise<DraftOutcome> {
  const key = draftCacheKey(input);
  let detail: string | undefined;

  // ---- Tier 1: live ----
  try {
    const response = await deps.complete(buildDraftMessages(input, systemPrompt), requestContext);
    if (!response.fallback_activated) {
      const parsed = parseDraft(input.mode, response.content);
      if (parsed) {
        deps.cacheSet(key, parsed);
        return { draft: parsed, mode: input.mode, tier: "live" };
      }
      detail = "live_response_failed_schema_validation";
    } else {
      // The api-client itself fell back (its own cache/static) — its content is not
      // a SCRIBE mode schema, so treat live as unavailable.
      detail = `api_client_fallback_${response.fallback_tier}`;
    }
  } catch (err) {
    detail = err instanceof Error ? err.message : String(err);
  }

  // ---- Tier 2: cache ----
  const cached = deps.cacheGet(key);
  if (cached) {
    return { draft: cached, mode: input.mode, tier: "cache", detail };
  }

  // ---- Tier 3: static ----
  return { draft: staticDraftFallback(input.mode), mode: input.mode, tier: "static", detail };
}

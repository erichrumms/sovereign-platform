/**
 * SOVEREIGN Platform — module-scribe
 * tt-draft-engine.ts — the Time & Travel drafting orchestration (pure, no React).
 * Session 28, D2.
 *
 * Extends SCRIBE's drafting engine (draft-engine.ts) with the Travel Management
 * and Time & Expense communication modes (docs/17 §8), under the two APPROVED,
 * registered prompts. Same three-tier fallback discipline as the six product
 * modes: live (sovereign-api-client response parses and validates as a TTDraft)
 * → cache (last good draft for this input) → static (a meaningful, schema-valid
 * template the manager edits — never fabricated data, never auto-sent).
 *
 * THE SYSTEM PREPARES; THE HUMAN DECIDES (docs/17 §1): nothing this engine
 * produces is a sent communication. Every draft feeds the manager review queue,
 * where a human reviews, adjusts, and sends from their own identity. The engine
 * has no send path.
 *
 * The LLM call is injected (the hook supplies createSovereignClient — never the
 * Anthropic API directly, Standing Constraint #5) so this module is unit-testable
 * in Node with fakes.
 *
 * Version: 1.0 · Session 28 · July 12, 2026
 */

import type {
  SovereignMessage,
  SovereignRequestContext,
  SovereignLLMResponse,
} from "@sovereign/api-client";
import type {
  TravelRequest,
  TravelPolicy,
  TimeRecord,
  ChargeAccount,
  ComplianceFlag,
  CorrectionCommunicationType,
} from "@sovereign/data";

import {
  selectTravelCommunicationType,
  selectTimeCommunicationType,
  validateTTDraft,
  type TTDraft,
  type TravelCommunicationType,
  type TimeCommunicationType,
} from "./tt-draft-contract";

export type TTDraftTier = "live" | "cache" | "static";

/** Shared context — workflow_step_id supplied by the originating flow or synthesized. */
export interface TTDraftContext {
  workflowStepId?: string;
}

/** One travel drafting pass — governed data only (travel prompt, "What you draft from"). */
export interface TravelDraftInput {
  tool: "travel";
  request: TravelRequest;
  policy: TravelPolicy;
  /** Compliance findings for this request, when present (source TRAVEL). */
  flags?: ComplianceFlag[];
  /** Fields the engine flagged as needing clarification → INFORMATION_REQUEST. */
  informationNeeded?: string[];
  context?: TTDraftContext;
}

/** One time & expense drafting pass — governed data only (time prompt, "What you draft from"). */
export interface TimeDraftInput {
  tool: "time";
  record: TimeRecord;
  flag: ComplianceFlag;
  /** The charge account the flag concerns, when resolvable. */
  account?: ChargeAccount;
  /**
   * The communication type tt.escalation-monitor upgraded this case to, when it
   * did (docs/17 §6.2). The drafter never decides the upgrade itself.
   */
  upgradedType?: CorrectionCommunicationType;
  context?: TTDraftContext;
}

export type TTDraftInput = TravelDraftInput | TimeDraftInput;

export interface TTDraftOutcome {
  draft: TTDraft;
  tier: TTDraftTier;
  /** Why a fallback tier was used, when applicable (for the Logger payload). */
  detail?: string;
}

/** Injected dependencies — the hook wires these to sovereign-api-client + a session cache. */
export interface TTDraftDeps {
  complete: (
    messages: SovereignMessage[],
    context: SovereignRequestContext
  ) => Promise<SovereignLLMResponse>;
  cacheGet: (key: string) => TTDraft | null;
  cacheSet: (key: string, value: TTDraft) => void;
}

/** The workflow_step_id every Logger/request call uses — supplied or synthesized
 *  (Standing Constraint #6). */
export function ttDraftWorkflowStepId(input: TTDraftInput): string {
  if (input.context?.workflowStepId) return input.context.workflowStepId;
  const ref = input.tool === "travel" ? input.request.request_id : input.flag.flag_id;
  return `tt-${input.tool}-draft-${ref}-step-1`;
}

/** The communication type this input's governed state calls for — deterministic. */
export function ttCommunicationType(
  input: TTDraftInput
): TravelCommunicationType | TimeCommunicationType {
  return input.tool === "travel"
    ? selectTravelCommunicationType(input.request, input.informationNeeded)
    : selectTimeCommunicationType(input.flag, input.upgradedType);
}

/** Per-input cache key — stable for the same governed data in the same step. */
export function ttDraftCacheKey(input: TTDraftInput): string {
  const ref = input.tool === "travel" ? input.request.request_id : input.flag.flag_id;
  return `TT:${input.tool}:${ttCommunicationType(input)}:${ttDraftWorkflowStepId(input)}:${ref}`;
}

/**
 * Build the two-message conversation: the registered system prompt + the governed
 * data as JSON. The user message names the required communication type explicitly
 * so the model drafts the template the routing state already implies.
 */
export function buildTTDraftMessages(
  input: TTDraftInput,
  systemPrompt: string
): SovereignMessage[] {
  const communicationType = ttCommunicationType(input);
  const payload =
    input.tool === "travel"
      ? {
          communication_type: communicationType,
          travel_request: input.request,
          travel_policy: input.policy,
          compliance_flags: input.flags ?? [],
          information_needed: input.informationNeeded ?? [],
        }
      : {
          communication_type: communicationType,
          time_record: input.record,
          compliance_flag: input.flag,
          charge_account: input.account ?? null,
        };
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: JSON.stringify(payload, null, 2) },
  ];
}

/**
 * Parse the model's plain-prose output into a TTDraft, or null if empty or in
 * violation of the contract (including system-invisibility). Both prompts specify
 * "a subject line (if applicable) followed by the body" — a leading "Subject:"
 * line is lifted into the subject field; everything else is the body.
 */
export function parseTTDraft(
  communicationType: TravelCommunicationType | TimeCommunicationType,
  content: string
): TTDraft | null {
  const trimmed = content.trim();
  if (trimmed === "") return null;

  let subject: string | undefined;
  let body = trimmed;
  const subjectMatch = trimmed.match(/^Subject:\s*(.+)\s*\n+([\s\S]*)$/i);
  if (subjectMatch && subjectMatch[2].trim() !== "") {
    subject = subjectMatch[1].trim();
    body = subjectMatch[2].trim();
  }

  const draft: TTDraft = { communication_type: communicationType, subject, body };
  if (subject === undefined) delete draft.subject;
  const check = validateTTDraft(draft);
  return check.valid ? draft : null;
}

// ============================================================
// STATIC TIER-3 TEMPLATES — meaningful, schema-valid, never fabricated,
// never disclosing the system. Every bracketed field is an instruction to
// the reviewing manager; validation re-runs on the edited result.
// ============================================================

const TT_UNAVAILABLE =
  "[Drafting service unavailable — this is a static fallback, not a generated draft. " +
  "Compose the communication from the compliance record before sending.]";

const STATIC_SUBJECTS: Record<TravelCommunicationType | TimeCommunicationType, string> = {
  APPROVAL_NOTICE: "Travel request [REQUEST_ID] — approved",
  INFORMATION_REQUEST: "Travel request [REQUEST_ID] — additional information needed",
  ESCALATION_NOTICE: "Travel request [REQUEST_ID] — additional review required",
  DENIAL_NOTICE: "Travel request [REQUEST_ID] — decision",
  ERROR_CORRECTION: "Time record [PERIOD] — correction required",
  CLARIFICATION_REQUEST: "Time record [PERIOD] — clarification requested",
  JUSTIFICATION_REQUEST: "Time record [PERIOD] — justification needed",
  PATTERN_FLAG_NOTICE: "Checking in on recent time charging",
  FORMAL_ESCALATION: "Formal notice — recurring time record compliance issue",
};

/** A meaningful static fallback for the communication type — NOT an empty stub. */
export function staticTTDraftFallback(
  communicationType: TravelCommunicationType | TimeCommunicationType
): TTDraft {
  return {
    communication_type: communicationType,
    subject: STATIC_SUBJECTS[communicationType],
    body: TT_UNAVAILABLE,
  };
}

/**
 * Run a TT draft with three-tier fallback. Never throws for a draftable input: it
 * always returns a validated draft tagged with the serving tier. Exactly one live
 * attempt per call. (An UNDRAFTABLE input — a request state with no documented
 * template — throws from ttCommunicationType before any tier is attempted: that
 * is a caller bug, not a fallback condition.)
 */
export async function runTTDraft(
  input: TTDraftInput,
  systemPrompt: string,
  requestContext: SovereignRequestContext,
  deps: TTDraftDeps
): Promise<TTDraftOutcome> {
  const communicationType = ttCommunicationType(input);
  const key = ttDraftCacheKey(input);
  let detail: string | undefined;

  // ---- Tier 1: live ----
  try {
    const response = await deps.complete(buildTTDraftMessages(input, systemPrompt), requestContext);
    if (!response.fallback_activated) {
      const parsed = parseTTDraft(communicationType, response.content);
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
  if (cached) {
    return { draft: cached, tier: "cache", detail };
  }

  // ---- Tier 3: static ----
  return { draft: staticTTDraftFallback(communicationType), tier: "static", detail };
}

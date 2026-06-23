/**
 * SOVEREIGN Platform — module-lens
 * explanation-engine.ts — the Governance Explainer orchestration (pure, no React).
 *
 * Platform-standard three-tier fallback for the single explanation call: live
 * (sovereign-api-client returns content that parses + validates as a LensExplanation) →
 * cache (the last good explanation for this question) → static (a MEANINGFUL,
 * honest summary of the relevant source documents — spec §2.1 static tier). Exactly
 * one live attempt per call, always through sovereign-api-client (Standing
 * Constraint #5). Never throws.
 *
 * The static tier is honest by construction: it does not fabricate platform
 * behaviour. It returns confidence "partial", names the source documents it
 * summarized, and records in `gaps` that the live explanation service was
 * unavailable — so the user does not mistake a fallback for a full answer.
 *
 * Version: 1.0 · Session 8 · June 22, 2026
 */

import type {
  SovereignMessage,
  SovereignRequestContext,
  SovereignLLMResponse,
} from "@sovereign/api-client";

import {
  validateLensExplanation,
  type ExplanationInput,
  type LensExplanation,
} from "./lens-contract";
import { LENS_SOURCE_DOCUMENTS } from "./source-documents";

export type ExplanationTier = "live" | "cache" | "static";

export interface ExplanationOutcome {
  /** The schema-valid explanation (advisory — LENS shows it; it takes no action). */
  explanation: LensExplanation;
  tier: ExplanationTier;
  /** Why a fallback tier was used, when applicable (for the Logger payload). */
  detail?: string;
}

export interface ExplanationDeps {
  /** Live tier. May reject (e.g. no API key) — the engine routes that to fallback. */
  complete: (
    messages: SovereignMessage[],
    context: SovereignRequestContext
  ) => Promise<SovereignLLMResponse>;
  cacheGet: (key: string) => LensExplanation | null;
  cacheSet: (key: string, value: LensExplanation) => void;
}

/** Per-question cache key (normalized so trivial whitespace/case differences hit). */
export function explanationCacheKey(question: string): string {
  return `LENS:explain:${question.trim().toLowerCase()}`;
}

/** Build the two-message conversation: PR-LENS-001 system prompt + the input as JSON. */
export function buildExplanationMessages(
  input: ExplanationInput,
  systemPrompt: string
): SovereignMessage[] {
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: JSON.stringify(input, null, 2) },
  ];
}

/**
 * Parse the model's text output into a validated LensExplanation, or null if it is
 * not parseable / not the expected shape. Tolerates a ```json fence.
 */
export function parseExplanation(content: string): LensExplanation | null {
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
  return validateLensExplanation(parsed).valid ? (parsed as LensExplanation) : null;
}

/**
 * The honest static-tier explanation (spec §2.1). Summarizes the relevant source
 * documents and is explicit that the live service was unavailable. confidence is
 * "partial" with a gap recording the degraded state — never a fabricated "grounded".
 */
export function staticExplanation(input: ExplanationInput): LensExplanation {
  // Summarize whichever supplied documents we recognize; fall back to all known docs.
  const suppliedIds = new Set(input.sourceDocuments.map((d) => d.id));
  const docs = LENS_SOURCE_DOCUMENTS.filter((d) => suppliedIds.has(d.id));
  const used = docs.length > 0 ? docs : LENS_SOURCE_DOCUMENTS;

  const summaryBlock = used.map((d) => `${d.title}: ${d.staticSummary}`).join("\n\n");

  return {
    explanation:
      "I'm not able to reach the explanation service right now, so I can't answer your " +
      "specific question. Here is a summary of the relevant source material instead:\n\n" +
      summaryBlock,
    sources: used.map((d) => d.id),
    confidence: "partial",
    gaps: [
      "The live explanation service was unavailable, so this is a summary of the source " +
        "documents rather than a direct answer to the question. Try again, or consult the " +
        "named source documents.",
    ],
  };
}

/**
 * Run the explanation with three-tier fallback. Never throws: always returns a
 * schema-valid LensExplanation tagged with the serving tier. Exactly one live attempt
 * (one createSovereignClient().complete via deps.complete) per call.
 */
export async function runExplanation(
  input: ExplanationInput,
  systemPrompt: string,
  requestContext: SovereignRequestContext,
  deps: ExplanationDeps
): Promise<ExplanationOutcome> {
  const key = explanationCacheKey(input.question);
  let detail: string | undefined;

  // ---- Tier 1: live ----
  try {
    const response = await deps.complete(
      buildExplanationMessages(input, systemPrompt),
      requestContext
    );
    if (!response.fallback_activated) {
      const explanation = parseExplanation(response.content);
      if (explanation) {
        deps.cacheSet(key, explanation);
        return { explanation, tier: "live" };
      }
      detail = "live_response_failed_schema_validation";
    } else {
      detail = `api_client_fallback_${response.fallback_tier}`;
    }
  } catch (err) {
    detail = err instanceof Error ? err.message : String(err);
  }

  // ---- Tier 2: cache ----
  const cached = deps.cacheGet(key);
  if (cached) {
    return { explanation: cached, tier: "cache", detail };
  }

  // ---- Tier 3: static (honest source-document summary) ----
  return { explanation: staticExplanation(input), tier: "static", detail };
}

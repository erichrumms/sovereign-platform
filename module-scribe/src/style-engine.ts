/**
 * SOVEREIGN Platform — module-scribe
 * style-engine.ts — the SCRIBE Style DNA analysis orchestration (pure, no React).
 *
 * Platform-standard three-tier fallback for the style-analysis call: live
 * (sovereign-api-client returns a response whose content parses + validates as a
 * StyleAnalysis, which assembles into a valid StyleProfile) → cache (the last good
 * profile for this user+samples) → static (a NEUTRAL baseline profile, clearly the
 * degraded tier — the human reviews it before approving storage and can decline).
 *
 * The StyleProfile is validated with the canonical validator (injected — the hook
 * supplies @sovereign/data's validateStyleProfile as surfaced on ctx.data.types) so
 * validation genuinely runs "via ctx.data" while this module stays pure/testable.
 * The LLM is always reached through sovereign-api-client (Standing Constraint #5).
 *
 * Version: 1.0 · Session 6 · June 17, 2026
 */

import type {
  SovereignMessage,
  SovereignRequestContext,
  SovereignLLMResponse,
} from "@sovereign/api-client";
import type { StyleProfile } from "@sovereign/data";

import {
  assembleStyleProfile,
  validateStyleAnalysis,
  type StyleAnalysis,
  type StyleProfileValidator,
} from "./style-contract";

export type StyleTier = "live" | "cache" | "static";

export interface StyleOutcome {
  /** The assembled, schema-valid canonical StyleProfile (not yet stored). */
  profile: StyleProfile;
  tier: StyleTier;
  /** Why a fallback tier was used, when applicable (for the Logger payload). */
  detail?: string;
}

export interface StyleDeps {
  /** Live tier. May reject (e.g. no API key) — the engine routes that to fallback. */
  complete: (
    messages: SovereignMessage[],
    context: SovereignRequestContext
  ) => Promise<SovereignLLMResponse>;
  cacheGet: (key: string) => StyleProfile | null;
  cacheSet: (key: string, value: StyleProfile) => void;
  /** Canonical StyleProfile validator (from ctx.data.types — @sovereign/data). */
  validateProfile: StyleProfileValidator;
  /** The user's existing profile, if any (for sample_count / created_at carry-over). */
  prior: StyleProfile | null;
  /** SOVEREIGN user id the profile belongs to (ctx.auth.user.employee_id). */
  userId: string;
  /** ISO 8601 clock. */
  now: () => string;
}

/** Per-user + per-sample cache key. */
export function styleCacheKey(userId: string, samples: string): string {
  return `SCRIBE:style:${userId}:${samples.trim()}`;
}

/** Build the two-message conversation: PR-SCRIBE-004 system prompt + samples as JSON. */
export function buildStyleMessages(samples: string, systemPrompt: string): SovereignMessage[] {
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: JSON.stringify({ samples }, null, 2) },
  ];
}

/**
 * Parse the model's text output into a validated StyleAnalysis, or null if it is
 * not parseable / not the four-field shape. Tolerates a ```json fence.
 */
export function parseStyleAnalysis(content: string): StyleAnalysis | null {
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
  return validateStyleAnalysis(parsed).valid ? (parsed as StyleAnalysis) : null;
}

/**
 * The neutral static-tier analysis — middle formality, moderate complexity,
 * accessible vocabulary, no claimed patterns. Honest "no strong signal" baseline
 * (the prompt itself instructs the model toward neutral when evidence is thin).
 */
export function neutralStyleAnalysis(): StyleAnalysis {
  return {
    formality_score: 50,
    sentence_complexity: "moderate",
    vocabulary_density: "accessible",
    structural_patterns: [],
  };
}

/**
 * Run the style analysis with three-tier fallback. Never throws: always returns a
 * schema-valid StyleProfile tagged with the serving tier. Exactly one live attempt
 * (one createSovereignClient().complete via deps.complete) per call.
 */
export async function runStyleAnalysis(
  samples: string,
  systemPrompt: string,
  requestContext: SovereignRequestContext,
  deps: StyleDeps
): Promise<StyleOutcome> {
  const key = styleCacheKey(deps.userId, samples);
  let detail: string | undefined;

  // ---- Tier 1: live ----
  try {
    const response = await deps.complete(buildStyleMessages(samples, systemPrompt), requestContext);
    if (!response.fallback_activated) {
      const analysis = parseStyleAnalysis(response.content);
      if (analysis) {
        const profile = assembleStyleProfile(analysis, deps.prior, deps.userId, deps.now());
        if (deps.validateProfile(profile).valid) {
          deps.cacheSet(key, profile);
          return { profile, tier: "live" };
        }
        detail = "assembled_profile_failed_validation";
      } else {
        detail = "live_response_failed_schema_validation";
      }
    } else {
      detail = `api_client_fallback_${response.fallback_tier}`;
    }
  } catch (err) {
    detail = err instanceof Error ? err.message : String(err);
  }

  // ---- Tier 2: cache ----
  const cached = deps.cacheGet(key);
  if (cached) {
    return { profile: cached, tier: "cache", detail };
  }

  // ---- Tier 3: static (neutral baseline) ----
  const profile = assembleStyleProfile(neutralStyleAnalysis(), deps.prior, deps.userId, deps.now());
  return { profile, tier: "static", detail };
}

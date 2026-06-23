/**
 * SOVEREIGN Platform — module-scribe
 * intermediate-engine.ts — the SCRIBE intermediate-mode orchestration (pure, no React).
 *
 * Platform-standard three-tier fallback for synthesis / framing, producing PROSE (not a
 * product schema): live (sovereign-api-client returns non-empty prose) → cache (the last
 * good prose for this mode+input) → static (a MEANINGFUL, mode-specific instruction prose
 * — not an empty stub). Exactly one live attempt per call, always through
 * sovereign-api-client (Standing Constraint #5). Never throws.
 *
 * NO product-schema validation (D2 done condition): these modes have no product intake
 * schema, so the engine never calls validateModeOutput. The only check is "is there
 * usable prose" (hasUsableProse) — a tier-selection guard, not export validation. There
 * is no Export gate for intermediate prose; the human carries it forward.
 *
 * The model runs under the already-approved PR-SCRIBE-001 drafting prompt, which scopes
 * synthesis/framing to "intermediate prose." Because that prompt's strict output is
 * schema-oriented, the model may return either bare prose or a JSON wrapper; extractProse
 * tolerates both so the engine is robust to either shape.
 *
 * Version: 1.0 · Session 8 · June 22, 2026
 */

import type {
  SovereignMessage,
  SovereignRequestContext,
  SovereignLLMResponse,
} from "@sovereign/api-client";

import {
  hasUsableProse,
  INTERMEDIATE_MODE_PURPOSE,
  type IntermediateInput,
  type IntermediateMode,
  type IntermediateResult,
} from "./intermediate-contract";

export type IntermediateTier = "live" | "cache" | "static";

export interface IntermediateOutcome {
  result: IntermediateResult;
  tier: IntermediateTier;
  /** Why a fallback tier was used, when applicable (for the Logger payload). */
  detail?: string;
}

export interface IntermediateDeps {
  /** Live tier. May reject (e.g. no API key) — the engine routes that to fallback. */
  complete: (
    messages: SovereignMessage[],
    context: SovereignRequestContext
  ) => Promise<SovereignLLMResponse>;
  cacheGet: (key: string) => string | null;
  cacheSet: (key: string, value: string) => void;
}

/** The workflow_step_id every Logger/request call uses — supplied or synthesized. */
export function intermediateWorkflowStepId(input: IntermediateInput): string {
  return input.context?.workflowStepId ?? `scribe-${input.mode}-step-1`;
}

/** Per-mode + per-input cache key — stable for the same captured material in the same step. */
export function intermediateCacheKey(input: IntermediateInput): string {
  return `SCRIBE:${input.mode}:${intermediateWorkflowStepId(input)}:${input.capturedMaterial.trim()}`;
}

/** Build the two-message conversation: PR-SCRIBE-001 system prompt + the input as JSON. */
export function buildIntermediateMessages(
  input: IntermediateInput,
  systemPrompt: string
): SovereignMessage[] {
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

const KNOWN_PROSE_FIELDS = ["prose", "synthesis", "framing", "summary", "brief", "narrative", "text"];

/**
 * Extract prose from the model's output. Tolerates: bare prose, a fenced block, a
 * JSON string, or a JSON object (preferring a known prose field, else joining its
 * string values). Returns the trimmed prose, or "" if nothing usable.
 */
export function extractProse(content: string): string {
  const stripped = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  if (stripped === "") return "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    // Not JSON — the raw text IS the prose.
    return stripped;
  }

  if (typeof parsed === "string") return parsed.trim();
  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    for (const key of KNOWN_PROSE_FIELDS) {
      if (typeof obj[key] === "string" && (obj[key] as string).trim() !== "") {
        return (obj[key] as string).trim();
      }
    }
    const strings = Object.values(obj).filter(
      (v): v is string => typeof v === "string" && v.trim() !== ""
    );
    if (strings.length > 0) return strings.join("\n\n").trim();
    // A structured object with no string fields — present the JSON as the prose so
    // nothing the model produced is silently dropped.
    return stripped;
  }
  return stripped;
}

/**
 * The meaningful static-tier prose for an intermediate mode — NOT an empty stub. It
 * is explicit that the service was unavailable and gives the human a real checklist to
 * organize their material by hand (spec §3.4 synthesis / §3.5 framing field prompts).
 */
export function staticIntermediateProse(mode: IntermediateMode): string {
  const header =
    "[SCRIBE intermediate service unavailable — this is a static fallback, not a generated " +
    "artifact. Re-run when the service is restored. In the meantime, organize your captured " +
    "material by hand using the prompts below.]\n\n";

  if (mode === "synthesis") {
    return (
      header +
      `${INTERMEDIATE_MODE_PURPOSE.synthesis}\n\n` +
      "- Key themes: what are the main threads in the captured material?\n" +
      "- Conflicting claims: where do the sources disagree, and how?\n" +
      "- Source coverage: what is well-supported vs. thin?\n" +
      "- Recommended framing: how should the draft that follows be framed?"
    );
  }
  return (
    header +
    `${INTERMEDIATE_MODE_PURPOSE.framing}\n\n` +
    "- Unofficial process paths: what workarounds exist? Which exceptions became norms?\n" +
    "- Decision points: where does a human make a judgment call? (decision_type candidates)\n" +
    "- Handoff friction: where is manual reformatting or copy-paste required?\n" +
    "- Informal knowledge holders: who actually knows how this works?"
  );
}

/**
 * Run an intermediate pass with three-tier fallback. Never throws: always returns
 * usable prose tagged with the serving tier. Exactly one live attempt per call.
 */
export async function runIntermediate(
  input: IntermediateInput,
  systemPrompt: string,
  requestContext: SovereignRequestContext,
  deps: IntermediateDeps
): Promise<IntermediateOutcome> {
  const key = intermediateCacheKey(input);
  let detail: string | undefined;

  // ---- Tier 1: live ----
  try {
    const response = await deps.complete(
      buildIntermediateMessages(input, systemPrompt),
      requestContext
    );
    if (!response.fallback_activated) {
      const prose = extractProse(response.content);
      if (hasUsableProse(prose)) {
        deps.cacheSet(key, prose);
        return { result: { mode: input.mode, prose }, tier: "live" };
      }
      detail = "live_response_empty";
    } else {
      detail = `api_client_fallback_${response.fallback_tier}`;
    }
  } catch (err) {
    detail = err instanceof Error ? err.message : String(err);
  }

  // ---- Tier 2: cache ----
  const cached = deps.cacheGet(key);
  if (cached) {
    return { result: { mode: input.mode, prose: cached }, tier: "cache", detail };
  }

  // ---- Tier 3: static (mode-specific instruction prose) ----
  return {
    result: { mode: input.mode, prose: staticIntermediateProse(input.mode) },
    tier: "static",
    detail,
  };
}

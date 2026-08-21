/**
 * module-scribe — tt-draft-placeholder-gate.test.ts
 * F-51 follow-on (Session 125). Extends the Session 124 placeholder-rejection gate to
 * the TT drafting validator (validateTTDraft), which — like validateModeOutput — only
 * checked that a field was a non-empty string. The TT static tier-3 fallback
 * (tt-draft-engine.ts TT_UNAVAILABLE) is schema-SHAPED but is nothing but placeholder
 * text the reviewing manager MUST replace before sending. It carries the shared
 * FALLBACK_SENTINELS core, so the same detector recognizes it here (Rule 11 — one
 * detector, one source of truth).
 *
 * Two proofs per communication type (matching draft-placeholder-gate.test.ts):
 *   (a) fresh, unedited static-fallback draft FAILS validateTTDraft
 *   (b) the same draft with real content substituted into the body PASSES
 *
 * Node env; no React, no network.
 */

import { validateTTDraft } from "../src/tt-draft-contract";
import { staticTTDraftFallback } from "../src/tt-draft-engine";
import { isUnfilledPlaceholder } from "../src/draft-contract";
import {
  TRAVEL_COMMUNICATION_TYPES,
  TIME_COMMUNICATION_TYPES,
} from "../src/tt-draft-contract";

const ALL_TYPES = [...TRAVEL_COMMUNICATION_TYPES, ...TIME_COMMUNICATION_TYPES] as const;

/** Deep-copy a draft, replacing every unedited-placeholder string with real content. */
function fillPlaceholders<T>(value: T): T {
  if (typeof value === "string") {
    return (isUnfilledPlaceholder(value) ? "Real manager-authored communication." : value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => fillPlaceholders(v)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = fillPlaceholders(v);
    return out as T;
  }
  return value;
}

describe("F-51 follow-on — validateTTDraft rejects unedited static fallback, per communication type", () => {
  it.each(ALL_TYPES)("(a) %s: fresh static fallback FAILS the placeholder gate", (t) => {
    const draft = staticTTDraftFallback(t);
    // Sanity: the static fallback body genuinely still carries an unedited sentinel.
    expect(isUnfilledPlaceholder(draft.body)).toBe(true);
    const check = validateTTDraft(draft);
    expect(check.valid).toBe(false);
    expect((check as { valid: false; errors: string[] }).errors.join(" ")).toMatch(/placeholder/);
  });

  it.each(ALL_TYPES)("(b) %s: same draft with real body content PASSES", (t) => {
    const filled = fillPlaceholders(staticTTDraftFallback(t));
    expect(validateTTDraft(filled)).toEqual({ valid: true });
  });
});

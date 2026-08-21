/**
 * module-scribe — draft-placeholder-gate.test.ts
 * F-51 regression (Session 124). The static tier-3 fallback is schema-SHAPED so it
 * renders, but is nothing but unedited placeholder text. validateModeOutput — the
 * single check the Export gate (useExport) runs — must reject that fallback until a
 * human replaces the placeholders, for EVERY one of the six product-intake modes.
 *
 * Two proofs per mode:
 *   (a) fresh, unedited static-fallback output FAILS validateModeOutput
 *   (b) the same object with real content substituted into every placeholder PASSES
 *
 * Node env; no React, no network.
 */

import {
  validateModeOutput,
  isUnfilledPlaceholder,
  FALLBACK_SENTINELS,
  DRAFTABLE_MODES,
  type DraftableMode,
} from "../src/draft-contract";
import { staticDraftFallback } from "../src/draft-engine";

/** Deep-copy a draft, replacing every unedited-placeholder string with real content. */
function fillPlaceholders<T>(value: T): T {
  if (typeof value === "string") {
    return (isUnfilledPlaceholder(value) ? "Real human-authored content." : value) as unknown as T;
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

describe("F-51 — static fallback sentinels", () => {
  it("both known placeholder forms are detected by isUnfilledPlaceholder", () => {
    expect(isUnfilledPlaceholder(`[RULE_ID ${FALLBACK_SENTINELS.placeholderSuffix}`)).toBe(true);
    expect(
      isUnfilledPlaceholder(
        `[SCRIBE drafting service is unavailable — ${FALLBACK_SENTINELS.unavailableCore}. …]`
      )
    ).toBe(true);
    expect(isUnfilledPlaceholder("A real subject line the human typed.")).toBe(false);
  });
});

describe("F-51 — validateModeOutput rejects unedited static fallback, per mode", () => {
  it.each(DRAFTABLE_MODES)(
    "(a) %s: fresh static fallback FAILS the schema/placeholder gate",
    (mode) => {
      const draft = staticDraftFallback(mode as DraftableMode);
      const check = validateModeOutput(mode, draft);
      expect(check.valid).toBe(false);
      expect((check as { valid: false; errors: string[] }).errors.join(" ")).toMatch(/placeholder/);
    }
  );

  it.each(DRAFTABLE_MODES)(
    "(b) %s: the same draft with real content substituted PASSES",
    (mode) => {
      const filled = fillPlaceholders(staticDraftFallback(mode as DraftableMode));
      const check = validateModeOutput(mode, filled);
      expect(check.valid).toBe(true);
    }
  );
});

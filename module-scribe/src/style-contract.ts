/**
 * SOVEREIGN Platform — module-scribe
 * style-contract.ts — the SCRIBE Style DNA contract (PR-SCRIBE-004).
 *
 * Three things live here:
 *   1. StyleAnalysis — the four-field shape the scribe-style-analyst prompt returns
 *      (the analysis fields of the canonical @sovereign/data StyleProfile), plus a
 *      runtime validator for it. The engine assembles the FULL StyleProfile from
 *      this + identity/bookkeeping and validates that against validateStyleProfile.
 *   2. StyleProfileStore — the persistence PORT. The frozen shell-contract exposes
 *      ctx.data as a type/validator catalog only (Decision 18 — no entity store),
 *      so persistence is an injected port. This session it is backed by a
 *      session-scoped in-memory store; wiring it to a canonical cross-session store
 *      is a future shell data-store surface — a configuration change, NOT a SCRIBE
 *      rewrite (Standing Constraint #3). Approved approach: Project Principal,
 *      Session 6.
 *   3. assembleStyleProfile — pure assembly of the canonical StyleProfile from an
 *      analysis + the prior profile (sample_count increments; created_at preserved).
 *
 * FIELD NAMES ARE NOT REDEFINED. StyleProfile is imported from @sovereign/data;
 * StyleAnalysis is a Pick of its analysis fields (Standing Constraint #2).
 *
 * Version: 1.0 · Session 6 · June 17, 2026
 */

import type { StyleProfile, ValidationResult } from "@sovereign/data";

/** PR-SCRIBE-004 registry binding — stamped onto Logger events as prompt provenance. */
export const PR_SCRIBE_004 = {
  registryId: "PR-SCRIBE-004",
  file: "prompts/style-analysis-system-v1.0.md",
  promptVersion: "v1.0",
} as const;

/**
 * The fields scribe-style-analyst produces — the StyleProfile's analysis fields,
 * exactly (Pick of the canonical entity). The engine adds user_id / sample_count /
 * created_at / updated_at; the model never sets those.
 */
export type StyleAnalysis = Pick<
  StyleProfile,
  "formality_score" | "sentence_complexity" | "vocabulary_density" | "structural_patterns"
>;

const SENTENCE_COMPLEXITIES: readonly StyleProfile["sentence_complexity"][] = ["simple", "moderate", "complex"];
const VOCAB_DENSITIES: readonly StyleProfile["vocabulary_density"][] = ["accessible", "technical", "specialized"];

/**
 * Validate the model's four-field StyleAnalysis before it is assembled into a
 * StyleProfile. Mirrors the StyleProfile field rules for these four fields; the
 * assembled full profile is then validated again with the canonical
 * validateStyleProfile (defense in depth).
 */
export function validateStyleAnalysis(value: unknown): ValidationResult {
  if (typeof value !== "object" || value === null) {
    return { valid: false, errors: ["style analysis must be a non-null object"] };
  }
  const errors: string[] = [];
  const a = value as Partial<StyleAnalysis>;

  if (
    typeof a.formality_score !== "number" ||
    !Number.isInteger(a.formality_score) ||
    a.formality_score < 0 ||
    a.formality_score > 100
  ) {
    errors.push("formality_score: must be an integer 0–100");
  }
  if (!SENTENCE_COMPLEXITIES.includes(a.sentence_complexity as StyleProfile["sentence_complexity"])) {
    errors.push(`sentence_complexity: must be one of ${SENTENCE_COMPLEXITIES.join(" | ")}`);
  }
  if (!VOCAB_DENSITIES.includes(a.vocabulary_density as StyleProfile["vocabulary_density"])) {
    errors.push(`vocabulary_density: must be one of ${VOCAB_DENSITIES.join(" | ")}`);
  }
  if (!Array.isArray(a.structural_patterns) || !a.structural_patterns.every((x) => typeof x === "string")) {
    errors.push("structural_patterns: must be string[] (may be empty)");
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * The signature of @sovereign/data's validateStyleProfile, as surfaced at runtime
 * on ctx.data.types (the frozen validator catalog — shell.ts). The hook reads the
 * validator off ctx.data.types and injects it into the engine, so validation
 * genuinely happens "via ctx.data" while the engine stays pure/testable.
 */
export type StyleProfileValidator = (profile: unknown) => ValidationResult;

/**
 * Persistence port for the canonical StyleProfile. The frozen shell-contract has no
 * entity store on ctx.data; this is the injection point a real cross-session store
 * connects to later (config change, not a rewrite).
 */
export interface StyleProfileStore {
  read(userId: string): StyleProfile | null;
  write(profile: StyleProfile): void;
}

/**
 * A session-scoped, in-memory StyleProfileStore — the D2 backing per the Project
 * Principal's approval. Honest about its scope: the profile persists for the life
 * of this SCRIBE session/store instance. SCRIBE has no database of its own
 * (spec §3); the canonical cross-device/-session store wires into this same port
 * when the platform adds a data-store surface.
 */
export function createSessionStyleProfileStore(seed?: StyleProfile): StyleProfileStore {
  const byUser = new Map<string, StyleProfile>();
  if (seed) byUser.set(seed.user_id, seed);
  return {
    read: (userId) => byUser.get(userId) ?? null,
    write: (profile) => {
      byUser.set(profile.user_id, profile);
    },
  };
}

/**
 * Assemble the canonical StyleProfile from a validated analysis + the user's prior
 * profile (if any). sample_count increments across updates; created_at is preserved
 * from the prior profile; updated_at is the supplied clock. Pure.
 */
export function assembleStyleProfile(
  analysis: StyleAnalysis,
  prior: StyleProfile | null,
  userId: string,
  now: string
): StyleProfile {
  return {
    user_id: userId,
    formality_score: analysis.formality_score,
    sentence_complexity: analysis.sentence_complexity,
    vocabulary_density: analysis.vocabulary_density,
    structural_patterns: analysis.structural_patterns,
    sample_count: (prior?.sample_count ?? 0) + 1,
    created_at: prior?.created_at ?? now,
    updated_at: now,
  };
}

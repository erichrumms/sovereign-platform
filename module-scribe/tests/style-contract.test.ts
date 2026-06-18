/**
 * module-scribe — style-contract.test.ts
 * The StyleAnalysis validator, the session StyleProfileStore port, and pure
 * StyleProfile assembly (sample_count increment, created_at preserved). Node env.
 */

import { validateStyleProfile } from "@sovereign/data";
import type { StyleProfile } from "@sovereign/data";

import {
  validateStyleAnalysis,
  assembleStyleProfile,
  createSessionStyleProfileStore,
  PR_SCRIBE_004,
  type StyleAnalysis,
} from "../src/style-contract";

const goodAnalysis: StyleAnalysis = {
  formality_score: 72,
  sentence_complexity: "moderate",
  vocabulary_density: "technical",
  structural_patterns: ["active voice", "short paragraphs"],
};

describe("PR-SCRIBE-004 binding", () => {
  it("stamps the registered style-analysis prompt id + version", () => {
    expect(PR_SCRIBE_004.registryId).toBe("PR-SCRIBE-004");
    expect(PR_SCRIBE_004.promptVersion).toBe("v1.0");
  });
});

describe("validateStyleAnalysis", () => {
  it("accepts the four-field analysis shape", () => {
    expect(validateStyleAnalysis(goodAnalysis).valid).toBe(true);
  });
  it("accepts an empty structural_patterns array", () => {
    expect(validateStyleAnalysis({ ...goodAnalysis, structural_patterns: [] }).valid).toBe(true);
  });
  it("rejects formality_score out of 0–100", () => {
    expect(validateStyleAnalysis({ ...goodAnalysis, formality_score: 140 }).valid).toBe(false);
  });
  it("rejects a non-integer formality_score", () => {
    expect(validateStyleAnalysis({ ...goodAnalysis, formality_score: 50.5 }).valid).toBe(false);
  });
  it("rejects an unknown sentence_complexity", () => {
    expect(validateStyleAnalysis({ ...goodAnalysis, sentence_complexity: "ornate" }).valid).toBe(false);
  });
  it("rejects an unknown vocabulary_density", () => {
    expect(validateStyleAnalysis({ ...goodAnalysis, vocabulary_density: "fancy" }).valid).toBe(false);
  });
  it("rejects a non-array structural_patterns", () => {
    expect(validateStyleAnalysis({ ...goodAnalysis, structural_patterns: "active voice" }).valid).toBe(false);
  });
});

describe("assembleStyleProfile", () => {
  it("builds a canonical StyleProfile that passes validateStyleProfile (no prior)", () => {
    const p = assembleStyleProfile(goodAnalysis, null, "E-700", "2026-06-17T00:00:00.000Z");
    expect(validateStyleProfile(p).valid).toBe(true);
    expect(p.user_id).toBe("E-700");
    expect(p.sample_count).toBe(1);
    expect(p.created_at).toBe("2026-06-17T00:00:00.000Z");
    expect(p.updated_at).toBe("2026-06-17T00:00:00.000Z");
  });

  it("increments sample_count and preserves created_at across updates", () => {
    const prior: StyleProfile = assembleStyleProfile(goodAnalysis, null, "E-700", "2026-06-01T00:00:00.000Z");
    const next = assembleStyleProfile(goodAnalysis, prior, "E-700", "2026-06-17T00:00:00.000Z");
    expect(next.sample_count).toBe(2);
    expect(next.created_at).toBe("2026-06-01T00:00:00.000Z"); // preserved
    expect(next.updated_at).toBe("2026-06-17T00:00:00.000Z"); // advanced
  });
});

describe("createSessionStyleProfileStore", () => {
  it("reads null before a write, then round-trips by user_id", () => {
    const store = createSessionStyleProfileStore();
    expect(store.read("E-700")).toBeNull();
    const p = assembleStyleProfile(goodAnalysis, null, "E-700", "2026-06-17T00:00:00.000Z");
    store.write(p);
    expect(store.read("E-700")).toEqual(p);
    expect(store.read("E-999")).toBeNull();
  });
  it("can be seeded with an existing profile", () => {
    const p = assembleStyleProfile(goodAnalysis, null, "E-700", "2026-06-17T00:00:00.000Z");
    const store = createSessionStyleProfileStore(p);
    expect(store.read("E-700")).toEqual(p);
  });
});

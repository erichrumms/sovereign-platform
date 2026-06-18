/**
 * module-scribe — style-engine.test.ts
 * The Style DNA three-tier fallback (live → cache → static neutral), message
 * assembly, analysis parsing, and the injected canonical validator. Node env;
 * sovereign-api-client is an injected fake.
 */

import type { SovereignLLMResponse } from "@sovereign/api-client";
import { validateStyleProfile } from "@sovereign/data";
import type { StyleProfile } from "@sovereign/data";

import { assembleStyleProfile, type StyleAnalysis } from "../src/style-contract";
import {
  buildStyleMessages,
  parseStyleAnalysis,
  neutralStyleAnalysis,
  runStyleAnalysis,
  styleCacheKey,
  type StyleDeps,
} from "../src/style-engine";

const SYSTEM = "STYLE SYSTEM PROMPT";
const SAMPLES = "Here is a paragraph of my writing. It is direct and uses short sentences.";

const analysis: StyleAnalysis = {
  formality_score: 64,
  sentence_complexity: "simple",
  vocabulary_density: "accessible",
  structural_patterns: ["direct address"],
};

function liveResponse(content: string, fallback_activated = false): SovereignLLMResponse {
  return {
    content,
    fallback_tier: fallback_activated ? "static" : "live",
    fallback_activated,
    sovereign_metadata: {
      sovereign_product: "SCRIBE",
      sovereign_version: "1.0",
      workflow_step_id: "scribe-style-analysis-step-1",
      agent_id: "scribe-style-analyst",
      provider: "anthropic",
      provider_model: "claude-sonnet-4",
      tier: "standard",
      responded_at: "2026-06-17T00:00:00.000Z",
    },
  };
}

function reqCtx() {
  return {
    workflow_step_id: "scribe-style-analysis-step-1",
    product: "SCRIBE" as const,
    agent_id: "scribe-style-analyst",
    tier: "standard" as const,
  };
}

function deps(over: Partial<StyleDeps> = {}): StyleDeps {
  return {
    complete: async () => liveResponse(JSON.stringify(analysis)),
    cacheGet: () => null,
    cacheSet: () => {},
    validateProfile: validateStyleProfile,
    prior: null,
    userId: "E-700",
    now: () => "2026-06-17T00:00:00.000Z",
    ...over,
  };
}

describe("styleCacheKey / buildStyleMessages / parseStyleAnalysis", () => {
  it("keys the cache by user + samples", () => {
    expect(styleCacheKey("E-700", SAMPLES)).toContain("SCRIBE:style:E-700:");
  });
  it("builds a system + user JSON pair carrying the samples", () => {
    const msgs = buildStyleMessages(SAMPLES, SYSTEM);
    expect(msgs[0]).toEqual({ role: "system", content: SYSTEM });
    expect(JSON.parse(msgs[1].content).samples).toBe(SAMPLES);
  });
  it("parses + validates a clean analysis, tolerates a fence, rejects junk", () => {
    expect(parseStyleAnalysis(JSON.stringify(analysis))).not.toBeNull();
    expect(parseStyleAnalysis("```json\n" + JSON.stringify(analysis) + "\n```")).not.toBeNull();
    expect(parseStyleAnalysis("I can't do that")).toBeNull();
    expect(parseStyleAnalysis(JSON.stringify({ formality_score: 200 }))).toBeNull();
  });
  it("neutralStyleAnalysis is a valid, middle-of-range baseline", () => {
    const n = neutralStyleAnalysis();
    expect(n.formality_score).toBe(50);
    expect(n.structural_patterns).toEqual([]);
  });
});

describe("runStyleAnalysis — three-tier fallback", () => {
  it("Tier 1 live: assembles, validates, caches the profile", async () => {
    const store = new Map<string, StyleProfile>();
    const out = await runStyleAnalysis(SAMPLES, SYSTEM, reqCtx(), deps({
      cacheGet: (k) => store.get(k) ?? null,
      cacheSet: (k, v) => store.set(k, v),
    }));
    expect(out.tier).toBe("live");
    expect(validateStyleProfile(out.profile).valid).toBe(true);
    expect(out.profile.formality_score).toBe(64);
    expect(store.size).toBe(1);
  });

  it("carries prior sample_count + created_at into a live result", async () => {
    const prior = assembleStyleProfile(analysis, null, "E-700", "2026-06-01T00:00:00.000Z");
    const out = await runStyleAnalysis(SAMPLES, SYSTEM, reqCtx(), deps({ prior }));
    expect(out.profile.sample_count).toBe(2);
    expect(out.profile.created_at).toBe("2026-06-01T00:00:00.000Z");
  });

  it("Tier 2 cache: live throws but a cached profile exists", async () => {
    const cached = assembleStyleProfile(analysis, null, "E-700", "2026-06-01T00:00:00.000Z");
    const out = await runStyleAnalysis(SAMPLES, SYSTEM, reqCtx(), deps({
      complete: async () => {
        throw new Error("no api key");
      },
      cacheGet: () => cached,
    }));
    expect(out.tier).toBe("cache");
    expect(out.detail).toMatch(/no api key/);
  });

  it("Tier 3 static: neutral baseline when live throws and cache is empty", async () => {
    const out = await runStyleAnalysis(SAMPLES, SYSTEM, reqCtx(), deps({
      complete: async () => {
        throw new Error("offline");
      },
    }));
    expect(out.tier).toBe("static");
    expect(validateStyleProfile(out.profile).valid).toBe(true);
    expect(out.profile.formality_score).toBe(50); // neutral
    expect(out.detail).toMatch(/offline/);
  });

  it("Tier 3 static: a live response that fails the analysis schema falls through", async () => {
    const out = await runStyleAnalysis(SAMPLES, SYSTEM, reqCtx(), deps({
      complete: async () => liveResponse(JSON.stringify({ formality_score: 999 })),
    }));
    expect(out.tier).toBe("static");
    expect(out.detail).toBe("live_response_failed_schema_validation");
  });

  it("makes exactly one live attempt per run", async () => {
    let calls = 0;
    await runStyleAnalysis(SAMPLES, SYSTEM, reqCtx(), deps({
      complete: async () => {
        calls += 1;
        return liveResponse(JSON.stringify(analysis));
      },
    }));
    expect(calls).toBe(1);
  });
});

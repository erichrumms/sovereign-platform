/**
 * module-counsel — analysis-engine.test.ts
 * The three-tier fallback orchestration (live → cache → static), prompt message
 * assembly, output parsing, and the static template. Node env; api-client +
 * Logger are injected fakes (no React, no network).
 */

import type { SovereignLLMResponse } from "@sovereign/api-client";

import { validateAnalysisResult, type AnalysisResult } from "../src/analysis-contract";
import {
  buildAnalysisMessages,
  frameCacheKey,
  parseAnalysis,
  runAnalysis,
  staticAnalysisFallback,
  type AnalysisDeps,
} from "../src/analysis-engine";
import type { DecisionFrame } from "../src/types";

function frame(): DecisionFrame {
  return {
    decisionStatement: "Approve the Q3 vendor change request",
    stakes: "Wrong approval hits the cost baseline",
    constraints: ["Must respect FAR 52.244"],
    sovereignContext: {
      sourceProduct: "NEXUS",
      workflowStepId: "NEXUS-APPROVE-v1-step-3",
      decisionType: "HUMAN_APPROVAL",
    },
  };
}

function validResult(): AnalysisResult {
  return {
    alternatives: [
      { id: "ALT-1", label: "Approve", summary: "Approve as submitted.", pros: ["fast"], cons: ["risk"] },
      { id: "ALT-2", label: "Defer", summary: "Hold for data.", pros: ["safe"], cons: ["delay"] },
      { id: "ALT-3", label: "Escalate", summary: "Route up.", pros: ["oversight"], cons: ["slow"] },
    ],
    riskScenarios: [
      { alternativeId: "ALT-1", scenario: "Bad approval.", severity: "HIGH" },
      { alternativeId: "ALT-2", scenario: "Missed window.", severity: "MODERATE" },
      { alternativeId: "ALT-3", scenario: "Backlog.", severity: "LOW" },
    ],
    assumptionFlags: [{ assumption: "Package complete.", concern: "Unverified." }],
    confidenceScore: 64,
    recommendedNextAction: "Verify the package before approving.",
  };
}

function liveResponse(content: string, fallback_activated = false): SovereignLLMResponse {
  return {
    content,
    fallback_tier: fallback_activated ? "static" : "live",
    fallback_activated,
    sovereign_metadata: {
      sovereign_product: "COUNSEL",
      sovereign_version: "1.0",
      workflow_step_id: "x",
      agent_id: "counsel-analyst",
      provider: "test",
      provider_model: "test",
      tier: "standard",
      responded_at: "2026-06-15T00:00:00.000Z",
    },
  };
}

function makeDeps(over: Partial<AnalysisDeps> = {}): { deps: AnalysisDeps; sets: Array<[string, AnalysisResult]> } {
  const sets: Array<[string, AnalysisResult]> = [];
  return {
    sets,
    deps: {
      complete: over.complete ?? (async () => liveResponse(JSON.stringify(validResult()))),
      cacheGet: over.cacheGet ?? (() => null),
      cacheSet: over.cacheSet ?? ((k, v) => { sets.push([k, v]); }),
    },
  };
}

const PROMPT = "SYSTEM PROMPT";

describe("parseAnalysis", () => {
  it("parses a valid JSON object", () => {
    expect(parseAnalysis(JSON.stringify(validResult()))).not.toBeNull();
  });
  it("tolerates a ```json code fence", () => {
    const fenced = "```json\n" + JSON.stringify(validResult()) + "\n```";
    expect(parseAnalysis(fenced)).not.toBeNull();
  });
  it("returns null on non-JSON", () => {
    expect(parseAnalysis("not json at all")).toBeNull();
  });
  it("returns null on schema-invalid JSON (only 1 alternative)", () => {
    const bad = { ...validResult(), alternatives: validResult().alternatives.slice(0, 1) };
    expect(parseAnalysis(JSON.stringify(bad))).toBeNull();
  });
});

describe("staticAnalysisFallback", () => {
  it("is schema-valid, source=static, with >= 3 alternatives", () => {
    const fb = staticAnalysisFallback(frame());
    expect(validateAnalysisResult(fb)).toEqual({ valid: true });
    expect(fb.source).toBe("static");
    expect(fb.alternatives.length).toBeGreaterThanOrEqual(3);
    expect(fb.confidenceScore).toBeLessThan(20); // honestly low in degraded mode
  });
});

describe("buildAnalysisMessages", () => {
  it("sends system prompt + the frame as the user message", () => {
    const msgs = buildAnalysisMessages(frame(), PROMPT);
    expect(msgs[0]).toEqual({ role: "system", content: PROMPT });
    expect(msgs[1].role).toBe("user");
    expect(msgs[1].content).toContain("NEXUS-APPROVE-v1-step-3");
  });
});

describe("runAnalysis — three-tier fallback", () => {
  const reqCtx = { workflow_step_id: "w", product: "COUNSEL" as const, agent_id: "counsel-analyst", tier: "standard" as const };

  it("Tier 1 (live): valid live response → tier live, source live, and caches it", async () => {
    const { deps, sets } = makeDeps();
    const out = await runAnalysis(frame(), PROMPT, reqCtx, deps);
    expect(out.tier).toBe("live");
    expect(out.result.source).toBe("live");
    expect(validateAnalysisResult(out.result)).toEqual({ valid: true });
    expect(sets).toHaveLength(1);
    expect(sets[0][0]).toBe(frameCacheKey(frame()));
  });

  it("live response that fails schema → falls through to static", async () => {
    const { deps } = makeDeps({
      complete: async () => liveResponse(JSON.stringify({ alternatives: [] })),
    });
    const out = await runAnalysis(frame(), PROMPT, reqCtx, deps);
    expect(out.tier).toBe("static");
    expect(out.detail).toBe("live_response_failed_schema_validation");
    expect(validateAnalysisResult(out.result)).toEqual({ valid: true });
  });

  it("api-client self-fallback (fallback_activated) → not treated as live", async () => {
    const { deps } = makeDeps({ complete: async () => liveResponse("static text", true) });
    const out = await runAnalysis(frame(), PROMPT, reqCtx, deps);
    expect(out.tier).toBe("static");
    expect(out.detail).toContain("api_client_fallback");
  });

  it("Tier 2 (cache): live throws but a cached result exists → tier cache, source cache", async () => {
    const cached = validResult();
    const { deps } = makeDeps({
      complete: async () => { throw new Error("no api key"); },
      cacheGet: () => cached,
    });
    const out = await runAnalysis(frame(), PROMPT, reqCtx, deps);
    expect(out.tier).toBe("cache");
    expect(out.result.source).toBe("cache");
    expect(out.detail).toBe("no api key");
  });

  it("Tier 3 (static): live throws and no cache → tier static, schema-valid", async () => {
    const { deps } = makeDeps({ complete: async () => { throw new Error("no api key"); } });
    const out = await runAnalysis(frame(), PROMPT, reqCtx, deps);
    expect(out.tier).toBe("static");
    expect(out.result.source).toBe("static");
    expect(validateAnalysisResult(out.result)).toEqual({ valid: true });
  });
});

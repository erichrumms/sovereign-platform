/**
 * module-counsel — counter-engine.test.ts
 * Counterargument Mode three-tier fallback (live → cache → static), turn-message
 * assembly, output parsing, the static challenge template, and the
 * CounterargumentChallenge validator. Node env; api-client is an injected fake.
 */

import type { SovereignLLMResponse } from "@sovereign/api-client";

import type { AnalysisResult } from "../src/analysis-contract";
import {
  validateCounterargumentChallenge,
  type CounterargumentChallenge,
} from "../src/counter-contract";
import {
  buildCounterMessages,
  counterCacheKey,
  parseChallenge,
  runCounterargument,
  staticChallengeFallback,
  type CounterargumentDeps,
  type CounterargumentInput,
} from "../src/counter-engine";
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

function analysis(): AnalysisResult {
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
    assumptionFlags: [],
    confidenceScore: 60,
    recommendedNextAction: "Verify the package.",
  };
}

function input(over: Partial<CounterargumentInput> = {}): CounterargumentInput {
  return {
    frame: frame(),
    analysis: analysis(),
    targetAlternativeId: "ALT-1",
    priorTurns: [],
    humanDefense: "",
    ...over,
  };
}

function validChallenge(): CounterargumentChallenge {
  return {
    challengeToPosition: "Approving now locks in a vendor before the cost data is in.",
    weaknesses: ["Speed is being treated as a benefit when the stakes are baseline accuracy."],
    strongestOpposingCase: "Deferring two weeks costs little and removes the largest unknown.",
    concession: "Approving does keep the schedule intact, which has real value.",
    openQuestions: ["What is the actual cost of a two-week deferral?"],
    pressureLevel: "HIGH",
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
      responded_at: "2026-06-16T00:00:00.000Z",
    },
  };
}

function makeDeps(over: Partial<CounterargumentDeps> = {}): {
  deps: CounterargumentDeps;
  sets: Array<[string, CounterargumentChallenge]>;
} {
  const sets: Array<[string, CounterargumentChallenge]> = [];
  return {
    sets,
    deps: {
      complete: over.complete ?? (async () => liveResponse(JSON.stringify(validChallenge()))),
      cacheGet: over.cacheGet ?? (() => null),
      cacheSet: over.cacheSet ?? ((k, v) => { sets.push([k, v]); }),
    },
  };
}

const PROMPT = "COUNTER SYSTEM PROMPT";
const reqCtx = { workflow_step_id: "w", product: "COUNSEL" as const, agent_id: "counsel-analyst", tier: "standard" as const };

describe("validateCounterargumentChallenge", () => {
  it("accepts a well-formed challenge", () => {
    expect(validateCounterargumentChallenge(validChallenge())).toEqual({ valid: true });
  });
  it("rejects a blank concession (steelman discipline)", () => {
    const bad = { ...validChallenge(), concession: "  " };
    expect(validateCounterargumentChallenge(bad).valid).toBe(false);
  });
  it("rejects empty weaknesses", () => {
    const bad = { ...validChallenge(), weaknesses: [] };
    expect(validateCounterargumentChallenge(bad).valid).toBe(false);
  });
  it("rejects an out-of-set pressureLevel", () => {
    const bad = { ...validChallenge(), pressureLevel: "EXTREME" };
    expect(validateCounterargumentChallenge(bad).valid).toBe(false);
  });
  it("allows empty openQuestions", () => {
    expect(validateCounterargumentChallenge({ ...validChallenge(), openQuestions: [] })).toEqual({ valid: true });
  });
});

describe("parseChallenge", () => {
  it("parses valid JSON and a ```json fence", () => {
    expect(parseChallenge(JSON.stringify(validChallenge()))).not.toBeNull();
    expect(parseChallenge("```json\n" + JSON.stringify(validChallenge()) + "\n```")).not.toBeNull();
  });
  it("returns null on non-JSON and on schema-invalid JSON", () => {
    expect(parseChallenge("not json")).toBeNull();
    expect(parseChallenge(JSON.stringify({ ...validChallenge(), concession: "" }))).toBeNull();
  });
});

describe("staticChallengeFallback", () => {
  it("is schema-valid, source=static, and names the target alternative label", () => {
    const fb = staticChallengeFallback(input());
    expect(validateCounterargumentChallenge(fb)).toEqual({ valid: true });
    expect(fb.source).toBe("static");
    expect(fb.challengeToPosition).toContain("Approve"); // ALT-1 label
  });
});

describe("buildCounterMessages", () => {
  it("sends the system prompt + the turn context (frame, analysis, target, defense)", () => {
    const msgs = buildCounterMessages(input({ humanDefense: "Schedule matters most." }), PROMPT);
    expect(msgs[0]).toEqual({ role: "system", content: PROMPT });
    expect(msgs[1].content).toContain("NEXUS-APPROVE-v1-step-3");
    expect(msgs[1].content).toContain("ALT-1");
    expect(msgs[1].content).toContain("Schedule matters most.");
  });
});

describe("counterCacheKey", () => {
  it("varies by turn depth so successive turns are not collapsed", () => {
    const k0 = counterCacheKey(input({ priorTurns: [] }));
    const k1 = counterCacheKey(input({ priorTurns: [{ challenge: validChallenge(), humanDefense: "x" }] }));
    expect(k0).not.toBe(k1);
    expect(k0).toContain("turn0");
    expect(k1).toContain("turn1");
  });
});

describe("runCounterargument — three-tier fallback", () => {
  it("Tier 1 (live): valid response → tier live, source live, and caches it", async () => {
    const { deps, sets } = makeDeps();
    const out = await runCounterargument(input(), PROMPT, reqCtx, deps);
    expect(out.tier).toBe("live");
    expect(out.result.source).toBe("live");
    expect(sets).toHaveLength(1);
    expect(sets[0][0]).toBe(counterCacheKey(input()));
  });

  it("live response that fails schema → falls through to static", async () => {
    const { deps } = makeDeps({ complete: async () => liveResponse(JSON.stringify({ concession: "" })) });
    const out = await runCounterargument(input(), PROMPT, reqCtx, deps);
    expect(out.tier).toBe("static");
    expect(out.detail).toBe("live_response_failed_schema_validation");
    expect(validateCounterargumentChallenge(out.result)).toEqual({ valid: true });
  });

  it("api-client self-fallback → not treated as live", async () => {
    const { deps } = makeDeps({ complete: async () => liveResponse("static text", true) });
    const out = await runCounterargument(input(), PROMPT, reqCtx, deps);
    expect(out.tier).toBe("static");
    expect(out.detail).toContain("api_client_fallback");
  });

  it("Tier 2 (cache): live throws but cache has the turn → tier cache", async () => {
    const cached = validChallenge();
    const { deps } = makeDeps({
      complete: async () => { throw new Error("no api key"); },
      cacheGet: () => cached,
    });
    const out = await runCounterargument(input(), PROMPT, reqCtx, deps);
    expect(out.tier).toBe("cache");
    expect(out.result.source).toBe("cache");
    expect(out.detail).toBe("no api key");
  });

  it("Tier 3 (static): live throws and no cache → tier static, schema-valid", async () => {
    const { deps } = makeDeps({ complete: async () => { throw new Error("offline"); } });
    const out = await runCounterargument(input(), PROMPT, reqCtx, deps);
    expect(out.tier).toBe("static");
    expect(validateCounterargumentChallenge(out.result)).toEqual({ valid: true });
  });
});

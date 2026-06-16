/**
 * module-counsel — premortem-engine.test.ts
 * Pre-Mortem Studio three-tier fallback (live → cache → static), message assembly,
 * output parsing, the static template, and the PreMortemResult validator. Node
 * env; api-client is an injected fake.
 */

import type { SovereignLLMResponse } from "@sovereign/api-client";

import type { AnalysisResult } from "../src/analysis-contract";
import {
  validatePreMortemResult,
  type PreMortemResult,
} from "../src/premortem-contract";
import {
  buildPreMortemMessages,
  parsePreMortem,
  preMortemCacheKey,
  runPreMortem,
  staticPreMortemFallback,
  type PreMortemDeps,
  type PreMortemInput,
} from "../src/premortem-engine";
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

function input(over: Partial<PreMortemInput> = {}): PreMortemInput {
  return { frame: frame(), analysis: analysis(), chosenAlternativeId: "ALT-1", ...over };
}

function validResult(): PreMortemResult {
  return {
    failureModes: [
      {
        id: "FM-1",
        failureNarrative: "The vendor underdelivered and the cost baseline blew out.",
        rootCauses: ["Approved before cost data was complete."],
        earlyWarnings: ["First invoice exceeds the quoted rate."],
        preventiveActions: ["Add a not-to-exceed clause before signing."],
        severity: "HIGH",
        likelihood: "MODERATE",
      },
      {
        id: "FM-2",
        failureNarrative: "Approval succeeded but a downstream team inherited an unfunded obligation.",
        rootCauses: ["No owner named for the downstream cost."],
        earlyWarnings: ["Downstream team flags a budget surprise."],
        preventiveActions: ["Name a downstream owner before committing."],
        severity: "MODERATE",
        likelihood: "LOW",
      },
    ],
    overallVulnerability: "HIGH",
    topPreventiveAction: "Add a not-to-exceed clause and name a downstream owner before approving.",
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

function makeDeps(over: Partial<PreMortemDeps> = {}): {
  deps: PreMortemDeps;
  sets: Array<[string, PreMortemResult]>;
} {
  const sets: Array<[string, PreMortemResult]> = [];
  return {
    sets,
    deps: {
      complete: over.complete ?? (async () => liveResponse(JSON.stringify(validResult()))),
      cacheGet: over.cacheGet ?? (() => null),
      cacheSet: over.cacheSet ?? ((k, v) => { sets.push([k, v]); }),
    },
  };
}

const PROMPT = "PREMORTEM SYSTEM PROMPT";
const reqCtx = { workflow_step_id: "w", product: "COUNSEL" as const, agent_id: "counsel-analyst", tier: "standard" as const };

describe("validatePreMortemResult", () => {
  it("accepts a well-formed result", () => {
    expect(validatePreMortemResult(validResult())).toEqual({ valid: true });
  });
  it("rejects fewer than two failure modes", () => {
    const bad = { ...validResult(), failureModes: validResult().failureModes.slice(0, 1) };
    expect(validatePreMortemResult(bad).valid).toBe(false);
  });
  it("rejects duplicate failure-mode ids", () => {
    const dup = validResult();
    dup.failureModes[1].id = "FM-1";
    expect(validatePreMortemResult(dup).valid).toBe(false);
  });
  it("rejects an out-of-set likelihood", () => {
    const bad = validResult();
    (bad.failureModes[0] as { likelihood: string }).likelihood = "CRITICAL"; // not a likelihood value
    expect(validatePreMortemResult(bad).valid).toBe(false);
  });
  it("rejects a failure mode missing a pre-mortem step", () => {
    const bad = validResult();
    (bad.failureModes[0] as { preventiveActions: string[] }).preventiveActions = [];
    expect(validatePreMortemResult(bad).valid).toBe(false);
  });
});

describe("parsePreMortem", () => {
  it("parses valid JSON and a ```json fence", () => {
    expect(parsePreMortem(JSON.stringify(validResult()))).not.toBeNull();
    expect(parsePreMortem("```json\n" + JSON.stringify(validResult()) + "\n```")).not.toBeNull();
  });
  it("returns null on non-JSON and on schema-invalid JSON", () => {
    expect(parsePreMortem("not json")).toBeNull();
    expect(parsePreMortem(JSON.stringify({ failureModes: [] }))).toBeNull();
  });
});

describe("staticPreMortemFallback", () => {
  it("is schema-valid, source=static, with >= 2 failure modes", () => {
    const fb = staticPreMortemFallback(input());
    expect(validatePreMortemResult(fb)).toEqual({ valid: true });
    expect(fb.source).toBe("static");
    expect(fb.failureModes.length).toBeGreaterThanOrEqual(2);
  });
  it("names the chosen alternative label in the narrative", () => {
    expect(staticPreMortemFallback(input()).failureModes[0].failureNarrative).toContain("Approve");
  });
});

describe("buildPreMortemMessages", () => {
  it("sends the system prompt + the pre-mortem context", () => {
    const msgs = buildPreMortemMessages(input(), PROMPT);
    expect(msgs[0]).toEqual({ role: "system", content: PROMPT });
    expect(msgs[1].content).toContain("NEXUS-APPROVE-v1-step-3");
    expect(msgs[1].content).toContain("ALT-1");
  });
});

describe("preMortemCacheKey", () => {
  it("uses WHOLE_DECISION when no alternative is chosen", () => {
    expect(preMortemCacheKey(input({ chosenAlternativeId: undefined }))).toContain("WHOLE_DECISION");
  });
});

describe("runPreMortem — three-tier fallback", () => {
  it("Tier 1 (live): valid response → tier live, source live, and caches it", async () => {
    const { deps, sets } = makeDeps();
    const out = await runPreMortem(input(), PROMPT, reqCtx, deps);
    expect(out.tier).toBe("live");
    expect(out.result.source).toBe("live");
    expect(sets).toHaveLength(1);
    expect(sets[0][0]).toBe(preMortemCacheKey(input()));
  });

  it("live response that fails schema → falls through to static", async () => {
    const { deps } = makeDeps({ complete: async () => liveResponse(JSON.stringify({ failureModes: [] })) });
    const out = await runPreMortem(input(), PROMPT, reqCtx, deps);
    expect(out.tier).toBe("static");
    expect(out.detail).toBe("live_response_failed_schema_validation");
    expect(validatePreMortemResult(out.result)).toEqual({ valid: true });
  });

  it("api-client self-fallback → not treated as live", async () => {
    const { deps } = makeDeps({ complete: async () => liveResponse("static text", true) });
    const out = await runPreMortem(input(), PROMPT, reqCtx, deps);
    expect(out.tier).toBe("static");
    expect(out.detail).toContain("api_client_fallback");
  });

  it("Tier 2 (cache): live throws but cache hit → tier cache", async () => {
    const cached = validResult();
    const { deps } = makeDeps({
      complete: async () => { throw new Error("no api key"); },
      cacheGet: () => cached,
    });
    const out = await runPreMortem(input(), PROMPT, reqCtx, deps);
    expect(out.tier).toBe("cache");
    expect(out.result.source).toBe("cache");
    expect(out.detail).toBe("no api key");
  });

  it("Tier 3 (static): live throws and no cache → tier static, schema-valid", async () => {
    const { deps } = makeDeps({ complete: async () => { throw new Error("offline"); } });
    const out = await runPreMortem(input(), PROMPT, reqCtx, deps);
    expect(out.tier).toBe("static");
    expect(validatePreMortemResult(out.result)).toEqual({ valid: true });
  });
});

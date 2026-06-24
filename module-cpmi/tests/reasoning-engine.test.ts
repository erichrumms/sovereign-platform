/**
 * module-cpmi — reasoning-engine.test.ts
 * Three-tier reasoning fallback (live → cache → static), surfaceable-output parsing
 * (schema-valid AND schema_valid===true), and the honest static output assembled from
 * the world model. Never throws; one live attempt per chain.
 */
import type { SovereignLLMResponse } from "@sovereign/api-client";

import {
  runReasoningChain,
  parseReasoningOutput,
  staticReasoningOutput,
  reasoningCacheKey,
  type ReasoningDeps,
} from "../src/reasoning-engine";
import { validateReasoningChainOutput, type ReasoningChainInput, type ReasoningChainOutput } from "../src/cpmi-contract";
import { createDevWorldModelPort } from "../src/world-model-port";

const SYSTEM = "SYSTEM";
const wm = createDevWorldModelPort().getProgramContext("P-100")!;
const INPUT: ReasoningChainInput = { program_id: "P-100", worldModel: wm };

const GOOD: ReasoningChainOutput = {
  context_summary: "Program P-100 mid-execution.",
  context_confidence: "high",
  risk_register: [{ risk: "Slip", severity: "P2", type: "schedule" }],
  constraint_map: [{ constraint: "FAR 15.2", permitted: "re-scope", prohibited: "sole-source", requires_approval: "ceiling" }],
  option_set: [{ option: "Re-baseline", cost: "2wk", defers: "M4", closes: "risk" }],
  recommendation: "Re-baseline.",
  alternatives_considered: ["Accept slip"],
  schema_valid: true,
};

function live(content: string): SovereignLLMResponse {
  return { content, fallback_tier: "live", fallback_activated: false, sovereign_metadata: {} as never };
}
function apiFallback(): SovereignLLMResponse {
  return { content: "", fallback_tier: "static", fallback_activated: true, sovereign_metadata: {} as never };
}
function deps(over: Partial<ReasoningDeps> = {}): ReasoningDeps {
  const store = new Map<string, ReasoningChainOutput>();
  return {
    complete: async () => live(JSON.stringify(GOOD)),
    cacheGet: (k) => store.get(k) ?? null,
    cacheSet: (k, v) => { store.set(k, v); },
    ...over,
  };
}
function ctxReq() {
  return { workflow_step_id: "cpmi-reasoning-P-100", product: "CPMI" as const, agent_id: "cpmi.reasoning-chain", tier: "standard" as const };
}

describe("parseReasoningOutput", () => {
  it("accepts a surfaceable output", () => {
    expect(parseReasoningOutput(JSON.stringify(GOOD))).toEqual(GOOD);
  });
  it("rejects schema_valid:false (not surfaced)", () => {
    expect(parseReasoningOutput(JSON.stringify({ ...GOOD, schema_valid: false }))).toBeNull();
  });
  it("rejects malformed JSON and schema-invalid output", () => {
    expect(parseReasoningOutput("not json")).toBeNull();
    expect(parseReasoningOutput(JSON.stringify({ context_summary: "x" }))).toBeNull();
  });
});

describe("staticReasoningOutput", () => {
  it("is schema-valid, low-confidence, and assembled from the world model", () => {
    const out = staticReasoningOutput(INPUT);
    expect(validateReasoningChainOutput(out)).toEqual({ valid: true });
    expect(out.context_confidence).toBe("low");
    expect(out.risk_register.length).toBe(wm.flags.length);
    expect(out.recommendation).toMatch(/unavailable/i);
    expect(out.schema_valid).toBe(true);
  });
});

describe("runReasoningChain — three-tier", () => {
  it("Tier 1 live: returns the output and caches it", async () => {
    const d = deps();
    const out = await runReasoningChain(INPUT, SYSTEM, ctxReq(), d);
    expect(out.tier).toBe("live");
    expect(d.cacheGet(reasoningCacheKey("P-100"))).toEqual(GOOD);
  });
  it("falls to cache when the live output is not surfaceable", async () => {
    const store = new Map([[reasoningCacheKey("P-100"), GOOD]]);
    const out = await runReasoningChain(INPUT, SYSTEM, ctxReq(), {
      complete: async () => live(JSON.stringify({ ...GOOD, schema_valid: false })),
      cacheGet: (k) => store.get(k) ?? null,
      cacheSet: () => {},
    });
    expect(out.tier).toBe("cache");
    expect(out.detail).toBe("live_response_not_surfaceable");
  });
  it("falls to static when live throws and cache is empty", async () => {
    const out = await runReasoningChain(INPUT, SYSTEM, ctxReq(), {
      complete: async () => { throw new Error("no key"); },
      cacheGet: () => null,
      cacheSet: () => {},
    });
    expect(out.tier).toBe("static");
    expect(out.detail).toBe("no key");
  });
  it("treats an api-client fallback as degraded", async () => {
    const out = await runReasoningChain(INPUT, SYSTEM, ctxReq(), {
      complete: async () => apiFallback(),
      cacheGet: () => null,
      cacheSet: () => {},
    });
    expect(out.tier).toBe("static");
    expect(out.detail).toBe("api_client_fallback_static");
  });
  it("makes exactly one live attempt", async () => {
    let calls = 0;
    await runReasoningChain(INPUT, SYSTEM, ctxReq(), {
      complete: async () => { calls++; return live(JSON.stringify(GOOD)); },
      cacheGet: () => null,
      cacheSet: () => {},
    });
    expect(calls).toBe(1);
  });
});

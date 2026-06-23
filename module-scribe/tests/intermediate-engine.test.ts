/**
 * module-scribe — intermediate-engine.test.ts
 * The pure three-tier prose orchestration for synthesis/framing: live → cache → static.
 * Never throws; produces usable prose tagged with the serving tier; NO product-schema
 * validation; exactly one live attempt per call. extractProse tolerates bare prose and
 * JSON wrappers.
 */
import type { SovereignLLMResponse } from "@sovereign/api-client";

import {
  runIntermediate,
  extractProse,
  staticIntermediateProse,
  intermediateCacheKey,
  buildIntermediateMessages,
  intermediateWorkflowStepId,
  type IntermediateDeps,
} from "../src/intermediate-engine";
import type { IntermediateInput } from "../src/intermediate-contract";

const SYSTEM_PROMPT = "SYSTEM";

function input(mode: IntermediateInput["mode"] = "synthesis", captured = "notes"): IntermediateInput {
  return { mode, capturedMaterial: captured };
}

function live(content: string): SovereignLLMResponse {
  return { content, fallback_tier: "live", fallback_activated: false, sovereign_metadata: {} as never };
}
function apiFallback(): SovereignLLMResponse {
  return { content: "", fallback_tier: "static", fallback_activated: true, sovereign_metadata: {} as never };
}

function deps(over: Partial<IntermediateDeps> = {}): IntermediateDeps {
  const store = new Map<string, string>();
  return {
    complete: async () => live("A clear synthesis of the material."),
    cacheGet: (k) => store.get(k) ?? null,
    cacheSet: (k, v) => {
      store.set(k, v);
    },
    ...over,
  };
}

describe("extractProse", () => {
  it("returns bare prose unchanged", () => {
    expect(extractProse("Just prose.")).toBe("Just prose.");
  });
  it("unwraps a JSON object with a known prose field", () => {
    expect(extractProse(JSON.stringify({ synthesis: "Wrapped prose." }))).toBe("Wrapped prose.");
  });
  it("tolerates a ```json fence", () => {
    expect(extractProse("```json\n" + JSON.stringify({ prose: "Fenced." }) + "\n```")).toBe("Fenced.");
  });
  it("joins string values when there is no known field", () => {
    expect(extractProse(JSON.stringify({ a: "one", b: "two" }))).toBe("one\n\ntwo");
  });
  it("returns empty for empty content", () => {
    expect(extractProse("   ")).toBe("");
  });
});

describe("staticIntermediateProse", () => {
  it("is meaningful, mode-specific, and flags the degraded state", () => {
    expect(staticIntermediateProse("synthesis")).toMatch(/static fallback/i);
    expect(staticIntermediateProse("synthesis")).toMatch(/Key themes/i);
    expect(staticIntermediateProse("framing")).toMatch(/Unofficial process paths/i);
  });
});

describe("runIntermediate — three-tier fallback", () => {
  it("Tier 1 live: returns parsed prose and caches it", async () => {
    const d = deps();
    const out = await runIntermediate(input(), SYSTEM_PROMPT, ctxReq(), d);
    expect(out.tier).toBe("live");
    expect(out.result.prose).toBe("A clear synthesis of the material.");
    expect(d.cacheGet(intermediateCacheKey(input()))).toBe("A clear synthesis of the material.");
  });

  it("falls to cache when the live response is empty", async () => {
    const store = new Map([[intermediateCacheKey(input()), "Cached prose."]]);
    const out = await runIntermediate(input(), SYSTEM_PROMPT, ctxReq(), {
      complete: async () => live("   "),
      cacheGet: (k) => store.get(k) ?? null,
      cacheSet: () => {},
    });
    expect(out.tier).toBe("cache");
    expect(out.result.prose).toBe("Cached prose.");
    expect(out.detail).toBe("live_response_empty");
  });

  it("falls to static when live throws and the cache is empty", async () => {
    const out = await runIntermediate(input("framing"), SYSTEM_PROMPT, ctxReq(), {
      complete: async () => {
        throw new Error("no api key");
      },
      cacheGet: () => null,
      cacheSet: () => {},
    });
    expect(out.tier).toBe("static");
    expect(out.detail).toBe("no api key");
    expect(out.result.prose).toMatch(/Unofficial process paths/i);
  });

  it("treats an api-client fallback response as degraded", async () => {
    const out = await runIntermediate(input(), SYSTEM_PROMPT, ctxReq(), {
      complete: async () => apiFallback(),
      cacheGet: () => null,
      cacheSet: () => {},
    });
    expect(out.tier).toBe("static");
    expect(out.detail).toBe("api_client_fallback_static");
  });

  it("makes exactly one live attempt per call", async () => {
    let calls = 0;
    await runIntermediate(input(), SYSTEM_PROMPT, ctxReq(), {
      complete: async () => {
        calls++;
        return live("ok");
      },
      cacheGet: () => null,
      cacheSet: () => {},
    });
    expect(calls).toBe(1);
  });
});

describe("message + step helpers", () => {
  it("builds a system + user(JSON) pair carrying the mode", () => {
    const msgs = buildIntermediateMessages(input("framing"), SYSTEM_PROMPT);
    expect(msgs[0]).toEqual({ role: "system", content: SYSTEM_PROMPT });
    expect(JSON.parse(msgs[1].content).mode).toBe("framing");
  });

  it("synthesizes a workflow_step_id when none is supplied", () => {
    expect(intermediateWorkflowStepId(input("synthesis"))).toBe("scribe-synthesis-step-1");
  });

  it("uses the supplied workflow_step_id when present", () => {
    expect(
      intermediateWorkflowStepId({ mode: "framing", capturedMaterial: "x", context: { workflowStepId: "wf-9" } })
    ).toBe("wf-9");
  });
});

function ctxReq() {
  return {
    workflow_step_id: "scribe-synthesis-step-1",
    product: "SCRIBE" as const,
    agent_id: "scribe-drafter",
    tier: "standard" as const,
  };
}

/**
 * module-lens — explanation-engine.test.ts
 * The pure three-tier orchestration: live (parses + validates), cache, static. Never
 * throws; always returns a schema-valid LensExplanation tagged with the serving tier.
 * Exactly one live attempt per call.
 */
import type { SovereignLLMResponse } from "@sovereign/api-client";

import {
  runExplanation,
  parseExplanation,
  staticExplanation,
  explanationCacheKey,
  buildExplanationMessages,
  type ExplanationDeps,
} from "../src/explanation-engine";
import { validateLensExplanation, type ExplanationInput } from "../src/lens-contract";

const SYSTEM_PROMPT = "SYSTEM";

function input(question = "Who can see alerts?"): ExplanationInput {
  return {
    question,
    sourceDocuments: [
      { id: "vigil_alert_response", title: "VIGIL Alert Response", content: "..." },
      { id: "vigil_agent_approvals", title: "VIGIL Agent Approvals", content: "..." },
    ],
    userContext: { role: "READ_ONLY", surface: "/lens" },
  };
}

const VALID_EXPLANATION = {
  explanation: "Only PLATFORM_ADMIN and SYSTEM_ADMIN roles can mount VIGIL.",
  sources: ["vigil_alert_response"],
  confidence: "grounded" as const,
  gaps: [] as string[],
};

function liveResponse(content: string): SovereignLLMResponse {
  return {
    content,
    fallback_tier: "live",
    fallback_activated: false,
    sovereign_metadata: {} as never,
  };
}

function fallbackResponse(): SovereignLLMResponse {
  return {
    content: "",
    fallback_tier: "static",
    fallback_activated: true,
    sovereign_metadata: {} as never,
  };
}

function deps(over: Partial<ExplanationDeps> = {}): ExplanationDeps {
  const store = new Map<string, typeof VALID_EXPLANATION>();
  return {
    complete: async () => liveResponse(JSON.stringify(VALID_EXPLANATION)),
    cacheGet: (k) => store.get(k) ?? null,
    cacheSet: (k, v) => {
      store.set(k, v);
    },
    ...over,
  };
}

describe("parseExplanation", () => {
  it("parses a bare JSON object", () => {
    expect(parseExplanation(JSON.stringify(VALID_EXPLANATION))).toEqual(VALID_EXPLANATION);
  });

  it("tolerates a ```json fence", () => {
    const fenced = "```json\n" + JSON.stringify(VALID_EXPLANATION) + "\n```";
    expect(parseExplanation(fenced)).toEqual(VALID_EXPLANATION);
  });

  it("returns null for non-JSON", () => {
    expect(parseExplanation("not json")).toBeNull();
  });

  it("returns null for JSON that fails schema validation", () => {
    expect(parseExplanation(JSON.stringify({ explanation: "x" }))).toBeNull();
  });
});

describe("staticExplanation", () => {
  it("is a valid, honest, partial explanation that names a gap", () => {
    const e = staticExplanation(input());
    expect(validateLensExplanation(e)).toEqual({ valid: true });
    expect(e.confidence).toBe("partial");
    expect(e.gaps.length).toBeGreaterThan(0);
    expect(e.sources).toEqual(["vigil_alert_response", "vigil_agent_approvals"]);
  });
});

describe("runExplanation — three-tier fallback", () => {
  it("Tier 1 live: returns the parsed explanation and caches it", async () => {
    const d = deps();
    const out = await runExplanation(input(), SYSTEM_PROMPT, ctxReq(), d);
    expect(out.tier).toBe("live");
    expect(out.explanation).toEqual(VALID_EXPLANATION);
    // cached for next time
    expect(d.cacheGet(explanationCacheKey(input().question))).toEqual(VALID_EXPLANATION);
  });

  it("falls to cache when the live response fails schema validation", async () => {
    const store = new Map([[explanationCacheKey(input().question), VALID_EXPLANATION]]);
    const out = await runExplanation(input(), SYSTEM_PROMPT, ctxReq(), {
      complete: async () => liveResponse("garbage"),
      cacheGet: (k) => store.get(k) ?? null,
      cacheSet: () => {},
    });
    expect(out.tier).toBe("cache");
    expect(out.detail).toBe("live_response_failed_schema_validation");
  });

  it("falls to static when live throws and the cache is empty", async () => {
    const out = await runExplanation(input(), SYSTEM_PROMPT, ctxReq(), {
      complete: async () => {
        throw new Error("no api key");
      },
      cacheGet: () => null,
      cacheSet: () => {},
    });
    expect(out.tier).toBe("static");
    expect(out.detail).toBe("no api key");
    expect(validateLensExplanation(out.explanation)).toEqual({ valid: true });
  });

  it("treats an api-client fallback response as degraded", async () => {
    const out = await runExplanation(input(), SYSTEM_PROMPT, ctxReq(), {
      complete: async () => fallbackResponse(),
      cacheGet: () => null,
      cacheSet: () => {},
    });
    expect(out.tier).toBe("static");
    expect(out.detail).toBe("api_client_fallback_static");
  });

  it("makes exactly one live attempt per call", async () => {
    let calls = 0;
    await runExplanation(input(), SYSTEM_PROMPT, ctxReq(), {
      complete: async () => {
        calls++;
        return liveResponse(JSON.stringify(VALID_EXPLANATION));
      },
      cacheGet: () => null,
      cacheSet: () => {},
    });
    expect(calls).toBe(1);
  });
});

describe("buildExplanationMessages", () => {
  it("builds a system + user(JSON) pair", () => {
    const msgs = buildExplanationMessages(input(), SYSTEM_PROMPT);
    expect(msgs[0]).toEqual({ role: "system", content: SYSTEM_PROMPT });
    expect(msgs[1].role).toBe("user");
    expect(JSON.parse(msgs[1].content).question).toBe(input().question);
  });
});

function ctxReq() {
  return {
    workflow_step_id: "lens-explain-1",
    product: "LENS" as const,
    agent_id: "lens-explainer",
    tier: "standard" as const,
  };
}

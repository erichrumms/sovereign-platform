/**
 * module-vigil — approval-engine.test.ts
 * Three-tier brief fallback (live → cache → static), brief parsing, and the honest
 * static brief assembled from the request. Never throws; one live attempt per call.
 */
import type { SovereignLLMResponse } from "@sovereign/api-client";

import {
  runApprovalBrief,
  parseBrief,
  staticBrief,
  briefCacheKey,
  type BriefDeps,
} from "../src/approval-engine";
import { computeExpiresAt, approvalWorkflowStep, type AgentApprovalRequest } from "../src/approval-contract";

const ANCHOR = "2026-06-23T12:00:00.000Z";
const SYSTEM = "SYSTEM";
const REQUEST: AgentApprovalRequest = {
  request_id: "req-1",
  requesting_agent_id: "agentos-deployer",
  requesting_agent_class: "Operational",
  action_type: "model_deployment",
  action_detail: { synthetic: true, model: "claude-sonnet-4" },
  risk_classification: "P1",
  submitted_at: ANCHOR,
  expires_at: computeExpiresAt(ANCHOR, "P1"),
  workflow_step_id: approvalWorkflowStep("req-1"),
  context: "Routine refresh.",
};

const GOOD_BRIEF = "REQUESTED ACTION: deploy a model.\nWHAT CHANGES: it replaces a build.\nRISK CLASSIFICATION: P1.";

function live(content: string): SovereignLLMResponse {
  return { content, fallback_tier: "live", fallback_activated: false, sovereign_metadata: {} as never };
}
function apiFallback(): SovereignLLMResponse {
  return { content: "", fallback_tier: "cached", fallback_activated: true, sovereign_metadata: {} as never };
}
function deps(over: Partial<BriefDeps> = {}): BriefDeps {
  const store = new Map<string, string>();
  return {
    complete: async () => live(GOOD_BRIEF),
    cacheGet: (k) => store.get(k) ?? null,
    cacheSet: (k, v) => {
      store.set(k, v);
    },
    ...over,
  };
}
function ctxReq() {
  return { workflow_step_id: "vigil-approval-req-1", product: "VIGIL" as const, agent_id: "vigil-approval-agent", tier: "standard" as const };
}

describe("parseBrief", () => {
  it("accepts a brief carrying the REQUESTED ACTION anchor", () => {
    expect(parseBrief(GOOD_BRIEF)).toBe(GOOD_BRIEF);
  });
  it("strips a code fence", () => {
    expect(parseBrief("```\n" + GOOD_BRIEF + "\n```")).toBe(GOOD_BRIEF);
  });
  it("rejects output without the anchor (falls back)", () => {
    expect(parseBrief("here is some unrelated text")).toBeNull();
    expect(parseBrief("   ")).toBeNull();
  });
});

describe("staticBrief", () => {
  it("is assembled from the request with all labeled sections and no recommendation", () => {
    const b = staticBrief(REQUEST);
    expect(b).toMatch(/REQUESTED ACTION:/);
    expect(b).toMatch(/WHAT CHANGES:/);
    expect(b).toMatch(/REVERSIBILITY:/);
    expect(b).toMatch(/RISK CLASSIFICATION:/);
    expect(b).toMatch(/AGENT CONTEXT: Routine refresh\./);
    expect(b).toMatch(/service is unavailable/i);
    expect(b).not.toMatch(/I recommend|you should approve|you should reject/i);
  });
});

describe("runApprovalBrief — three-tier", () => {
  it("Tier 1 live: returns the brief and caches it", async () => {
    const d = deps();
    const out = await runApprovalBrief(REQUEST, SYSTEM, ctxReq(), d);
    expect(out.tier).toBe("live");
    expect(out.brief).toBe(GOOD_BRIEF);
    expect(d.cacheGet(briefCacheKey("req-1"))).toBe(GOOD_BRIEF);
  });

  it("falls to cache when the live brief is unusable", async () => {
    const store = new Map([[briefCacheKey("req-1"), GOOD_BRIEF]]);
    const out = await runApprovalBrief(REQUEST, SYSTEM, ctxReq(), {
      complete: async () => live("garbage"),
      cacheGet: (k) => store.get(k) ?? null,
      cacheSet: () => {},
    });
    expect(out.tier).toBe("cache");
    expect(out.detail).toBe("live_response_unusable_brief");
  });

  it("falls to static when live throws and cache is empty", async () => {
    const out = await runApprovalBrief(REQUEST, SYSTEM, ctxReq(), {
      complete: async () => {
        throw new Error("no key");
      },
      cacheGet: () => null,
      cacheSet: () => {},
    });
    expect(out.tier).toBe("static");
    expect(out.detail).toBe("no key");
    expect(out.brief).toMatch(/REQUESTED ACTION:/);
  });

  it("treats an api-client fallback as degraded", async () => {
    const out = await runApprovalBrief(REQUEST, SYSTEM, ctxReq(), {
      complete: async () => apiFallback(),
      cacheGet: () => null,
      cacheSet: () => {},
    });
    expect(out.tier).toBe("static");
    expect(out.detail).toBe("api_client_fallback_cached");
  });

  it("makes exactly one live attempt", async () => {
    let calls = 0;
    await runApprovalBrief(REQUEST, SYSTEM, ctxReq(), {
      complete: async () => {
        calls++;
        return live(GOOD_BRIEF);
      },
      cacheGet: () => null,
      cacheSet: () => {},
    });
    expect(calls).toBe(1);
  });
});

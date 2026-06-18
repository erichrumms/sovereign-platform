/**
 * module-vigil — triage-engine.test.ts
 * The pure three-tier triage orchestration: live → cache → static, plus parsing and
 * the meaningful per-alert-type static checklists (spec §3.4).
 */
import type { SovereignLLMResponse, SovereignRequestContext } from "@sovereign/api-client";

import {
  runTriageAnalysis,
  parseTriageBrief,
  staticTriageChecklist,
  buildTriageMessages,
  triageCacheKey,
  type TriageDeps,
} from "../src/triage-engine";
import { validateTriageBrief, type TriageBrief } from "../src/triage-contract";
import type { AnomalyContext, AlertType } from "../src/vigil-types";
import { makeAlert } from "./test-helpers";

function brief(): TriageBrief {
  return {
    likely_causes: [{ cause: "Baseline shift", likelihood: "high" }],
    recommended_steps: ["Confirm the triggering event."],
    false_positive_likelihood: 25,
    false_positive_explanation: "Consistent with a genuine shift.",
  };
}

function ctxFor(alertType: AlertType = "ANOMALY_DETECTED"): AnomalyContext {
  const alert = makeAlert({ alertType });
  return { alert, recentEvents: [], productBaseline: { product: alert.sourceProduct }, similarAlerts: [] };
}

function response(content: string, over: Partial<SovereignLLMResponse> = {}): SovereignLLMResponse {
  return {
    content,
    fallback_tier: "live",
    fallback_activated: false,
    ...over,
  } as unknown as SovereignLLMResponse;
}

const REQ: SovereignRequestContext = {
  workflow_step_id: "vigil-triage-ALERT-1",
  product: "VIGIL",
  agent_id: "vigil-triage-analyst",
  tier: "standard",
};

function deps(over: Partial<TriageDeps> = {}): TriageDeps {
  return {
    complete: async () => response(JSON.stringify(brief())),
    cacheGet: () => null,
    cacheSet: () => {},
    ...over,
  };
}

describe("parseTriageBrief", () => {
  it("parses a bare JSON brief", () => {
    expect(parseTriageBrief(JSON.stringify(brief()))).toEqual(brief());
  });
  it("tolerates a ```json fence", () => {
    expect(parseTriageBrief("```json\n" + JSON.stringify(brief()) + "\n```")).toEqual(brief());
  });
  it("returns null on non-JSON", () => {
    expect(parseTriageBrief("not json")).toBeNull();
  });
  it("returns null when the shape is invalid", () => {
    expect(parseTriageBrief(JSON.stringify({ likely_causes: [] }))).toBeNull();
  });
});

describe("staticTriageChecklist", () => {
  it.each(["ANOMALY_DETECTED", "CPMI_DRIFT_DETECTED", "CASCADE_RISK"] as const)(
    "returns a schema-valid, non-empty checklist for %s",
    (t) => {
      const b = staticTriageChecklist(t);
      expect(validateTriageBrief(b)).toEqual({ valid: true });
      expect(b.recommended_steps.length).toBeGreaterThan(0);
    }
  );
  it("CPMI drift checklist keeps the reasoning-quality boundary", () => {
    const b = staticTriageChecklist("CPMI_DRIFT_DETECTED");
    expect(b.recommended_steps.join(" ")).toMatch(/NOT whether CPMI's reasoning is correct/i);
  });
});

describe("buildTriageMessages", () => {
  it("builds a system + user(JSON context) pair", () => {
    const msgs = buildTriageMessages(ctxFor(), "SYS");
    expect(msgs[0]).toEqual({ role: "system", content: "SYS" });
    expect(msgs[1].role).toBe("user");
    expect(JSON.parse(msgs[1].content).alert.alertType).toBe("ANOMALY_DETECTED");
  });
});

describe("runTriageAnalysis — three-tier fallback", () => {
  it("Tier 1 live: returns and caches a validated brief", async () => {
    const cache = new Map<string, TriageBrief>();
    const out = await runTriageAnalysis(ctxFor(), "SYS", REQ, deps({
      cacheGet: (k) => cache.get(k) ?? null,
      cacheSet: (k, v) => void cache.set(k, v),
    }));
    expect(out.tier).toBe("live");
    expect(out.brief).toEqual(brief());
    expect(cache.get(triageCacheKey("ALERT-1"))).toEqual(brief());
  });

  it("falls to static when the live content fails schema validation", async () => {
    const out = await runTriageAnalysis(ctxFor(), "SYS", REQ, deps({
      complete: async () => response("garbage"),
    }));
    expect(out.tier).toBe("static");
    expect(out.detail).toBe("live_response_failed_schema_validation");
    expect(validateTriageBrief(out.brief)).toEqual({ valid: true });
  });

  it("falls back when the api-client itself reports a fallback", async () => {
    const out = await runTriageAnalysis(ctxFor(), "SYS", REQ, deps({
      complete: async () => response("", { fallback_activated: true, fallback_tier: "static" }),
    }));
    expect(out.tier).toBe("static");
    expect(out.detail).toBe("api_client_fallback_static");
  });

  it("Tier 2 cache: serves the cached brief when live throws", async () => {
    const out = await runTriageAnalysis(ctxFor(), "SYS", REQ, deps({
      complete: async () => {
        throw new Error("network down");
      },
      cacheGet: () => brief(),
    }));
    expect(out.tier).toBe("cache");
    expect(out.detail).toBe("network down");
  });

  it("Tier 3 static: alert-type checklist when live throws and cache is empty", async () => {
    const out = await runTriageAnalysis(ctxFor("CASCADE_RISK"), "SYS", REQ, deps({
      complete: async () => {
        throw new Error("no key");
      },
    }));
    expect(out.tier).toBe("static");
    expect(validateTriageBrief(out.brief)).toEqual({ valid: true });
  });
});

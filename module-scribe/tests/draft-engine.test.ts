/**
 * module-scribe — draft-engine.test.ts
 * The Drafting Engine three-tier fallback (live → cache → static), message
 * assembly, schema-pure parsing, the per-mode static templates, cache keys, and the
 * synthesized workflow_step_id. Node env; sovereign-api-client is an injected fake.
 */

import type { SovereignLLMResponse } from "@sovereign/api-client";

import { validateModeOutput, DRAFTABLE_MODES, type DraftableMode } from "../src/draft-contract";
import {
  buildDraftMessages,
  draftCacheKey,
  draftWorkflowStepId,
  parseDraft,
  runDraft,
  staticDraftFallback,
  type DraftDeps,
  type DraftInput,
} from "../src/draft-engine";

const SYSTEM = "SYSTEM PROMPT";

function input(over: Partial<DraftInput> = {}): DraftInput {
  return {
    mode: "correspondence_draft",
    capturedMaterial: "Reply to the vendor about the Q3 change request.",
    ...over,
  };
}

function validCorrespondence(): Record<string, unknown> {
  return { subject: "Q3 vendor change", body: "Drafted reply.", action_items: [] };
}

function liveResponse(content: string, fallback_activated = false): SovereignLLMResponse {
  return {
    content,
    fallback_tier: fallback_activated ? "static" : "live",
    fallback_activated,
    sovereign_metadata: {
      sovereign_product: "SCRIBE",
      sovereign_version: "1.0",
      workflow_step_id: "scribe-correspondence_draft-draft-step-1",
      agent_id: "scribe-drafter",
      provider: "anthropic",
      provider_model: "claude-sonnet-4",
      tier: "standard",
      responded_at: "2026-06-17T00:00:00.000Z",
    },
  };
}

function reqCtx() {
  return {
    workflow_step_id: "scribe-correspondence_draft-draft-step-1",
    product: "SCRIBE" as const,
    agent_id: "scribe-drafter",
    tier: "standard" as const,
  };
}

function deps(over: Partial<DraftDeps> = {}): DraftDeps {
  return {
    complete: async () => liveResponse(JSON.stringify(validCorrespondence())),
    cacheGet: () => null,
    cacheSet: () => {},
    ...over,
  };
}

describe("draftWorkflowStepId / draftCacheKey", () => {
  it("uses the supplied workflow_step_id when present", () => {
    expect(draftWorkflowStepId(input({ context: { workflowStepId: "NEXUS-step-9" } }))).toBe("NEXUS-step-9");
  });
  it("synthesizes a per-mode workflow_step_id when standalone", () => {
    expect(draftWorkflowStepId(input())).toBe("scribe-correspondence_draft-draft-step-1");
  });
  it("keys the cache by mode + step + captured material", () => {
    expect(draftCacheKey(input())).toContain("SCRIBE:correspondence_draft:");
  });
});

describe("buildDraftMessages", () => {
  it("is a system + user JSON pair carrying mode and captured material", () => {
    const msgs = buildDraftMessages(input(), SYSTEM);
    expect(msgs).toHaveLength(2);
    expect(msgs[0]).toEqual({ role: "system", content: SYSTEM });
    const body = JSON.parse(msgs[1].content);
    expect(body.mode).toBe("correspondence_draft");
    expect(body.capturedMaterial).toMatch(/vendor/);
    expect(body.styleProfile).toBeNull();
  });
});

describe("parseDraft", () => {
  it("parses a clean JSON object and validates it", () => {
    expect(parseDraft("correspondence_draft", JSON.stringify(validCorrespondence()))).not.toBeNull();
  });
  it("tolerates a ```json code fence", () => {
    const fenced = "```json\n" + JSON.stringify(validCorrespondence()) + "\n```";
    expect(parseDraft("correspondence_draft", fenced)).not.toBeNull();
  });
  it("returns null for non-JSON", () => {
    expect(parseDraft("correspondence_draft", "I cannot help with that.")).toBeNull();
  });
  it("returns null for JSON that fails the mode schema", () => {
    expect(parseDraft("correspondence_draft", JSON.stringify({ subject: "" }))).toBeNull();
  });
  it("returns a schema-PURE object (no injected provenance field)", () => {
    const out = parseDraft("correspondence_draft", JSON.stringify(validCorrespondence()));
    expect(out).not.toBeNull();
    expect(Object.keys(out as object)).not.toContain("source");
    expect(Object.keys(out as object)).not.toContain("tier");
  });
});

describe("staticDraftFallback — every mode template is schema-valid", () => {
  it.each(DRAFTABLE_MODES)("produces a valid %s template", (mode) => {
    const tmpl = staticDraftFallback(mode as DraftableMode);
    expect(validateModeOutput(mode, tmpl).valid).toBe(true);
  });
});

describe("runDraft — three-tier fallback", () => {
  it("Tier 1 live: serves and caches a valid parsed draft", async () => {
    const store = new Map();
    const out = await runDraft(input(), SYSTEM, reqCtx(), deps({
      cacheGet: (k) => store.get(k) ?? null,
      cacheSet: (k, v) => store.set(k, v),
    }));
    expect(out.tier).toBe("live");
    expect(validateModeOutput(out.mode, out.draft).valid).toBe(true);
    expect(store.size).toBe(1); // cached for Tier 2
  });

  it("Tier 2 cache: live unavailable (throws) but a cached draft exists", async () => {
    const cached = validCorrespondence();
    const out = await runDraft(input(), SYSTEM, reqCtx(), deps({
      complete: async () => {
        throw new Error("no api key");
      },
      cacheGet: () => cached as never,
    }));
    expect(out.tier).toBe("cache");
    expect(out.detail).toMatch(/no api key/);
  });

  it("Tier 3 static: live throws and cache is empty", async () => {
    const out = await runDraft(input(), SYSTEM, reqCtx(), deps({
      complete: async () => {
        throw new Error("offline");
      },
    }));
    expect(out.tier).toBe("static");
    expect(validateModeOutput(out.mode, out.draft).valid).toBe(true);
    expect(out.detail).toMatch(/offline/);
  });

  it("Tier 3 static: a live response that fails schema validation is treated as unavailable", async () => {
    const out = await runDraft(input(), SYSTEM, reqCtx(), deps({
      complete: async () => liveResponse(JSON.stringify({ subject: "" })),
    }));
    expect(out.tier).toBe("static");
    expect(out.detail).toBe("live_response_failed_schema_validation");
  });

  it("Tier 3 static: api-client self-fallback is not mistaken for a SCRIBE draft", async () => {
    const out = await runDraft(input(), SYSTEM, reqCtx(), deps({
      complete: async () => liveResponse("static text", true),
    }));
    expect(out.tier).toBe("static");
    expect(out.detail).toMatch(/api_client_fallback/);
  });

  it("makes exactly one live attempt per run", async () => {
    let calls = 0;
    await runDraft(input(), SYSTEM, reqCtx(), deps({
      complete: async () => {
        calls += 1;
        return liveResponse(JSON.stringify(validCorrespondence()));
      },
    }));
    expect(calls).toBe(1);
  });
});

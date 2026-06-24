/**
 * sovereign-api-client — test_routed_inference.test.ts
 * Classification routing + three-tier fallback + INFERENCE_CALL emission:
 *   UNCLASSIFIED → Anthropic; CUI+enabled → Ollama; CUI+enabled+Ollama-down → Anthropic
 *   (provider fallback); CUI+disabled → Anthropic (provider fallback); both down → static.
 * Every event carries workflow_step_id.
 */
import { routedComplete, type RoutedInferenceDeps } from "../src/routed-inference";
import { OllamaUnavailableError } from "../src/providers/ollama-provider";
import type { ClientLogger, SovereignMessage, SovereignRequestContext, SovereignLLMResponse } from "../src/base-client";

const messages: SovereignMessage[] = [{ role: "user", content: "hi" }];

function ctx(over: Partial<SovereignRequestContext> = {}): SovereignRequestContext {
  return { workflow_step_id: "wf-1", product: "CPMI", agent_id: "cpmi.reasoning-chain", tier: "standard", ...over };
}
function resp(provider: string): SovereignLLMResponse {
  return {
    content: "answer",
    fallback_tier: "live",
    fallback_activated: false,
    sovereign_metadata: { sovereign_product: "CPMI", sovereign_version: "1.0", workflow_step_id: "wf-1", agent_id: "a", provider, provider_model: `${provider}-model`, tier: "standard", responded_at: "t" },
  };
}
function makeLogger() {
  const events: Parameters<ClientLogger["log"]>[0][] = [];
  return { logger: { log: (e: Parameters<ClientLogger["log"]>[0]) => events.push(e) } as ClientLogger, events };
}
function deps(over: Partial<RoutedInferenceDeps>): RoutedInferenceDeps {
  const { logger } = makeLogger();
  return {
    ollamaComplete: async () => resp("ollama"),
    anthropicComplete: async () => resp("anthropic"),
    ollamaEnabled: false,
    logger,
    now: () => 0,
    ...over,
  };
}

describe("routedComplete", () => {
  it("UNCLASSIFIED → Anthropic, INFERENCE_CALL provider anthropic", async () => {
    const { logger, events } = makeLogger();
    const r = await routedComplete(messages, ctx({ data_classification: "UNCLASSIFIED" }), deps({ ollamaEnabled: true, logger }));
    expect(r.sovereign_metadata.provider).toBe("anthropic");
    const call = events.find((e) => e.event_type === "INFERENCE_CALL")!;
    expect(call.payload).toMatchObject({ provider: "anthropic" });
    expect(events.every((e) => e.workflow_step_id === "wf-1")).toBe(true);
  });

  it("CUI + Ollama enabled → Ollama (Tier 1)", async () => {
    const { logger, events } = makeLogger();
    const r = await routedComplete(messages, ctx({ data_classification: "CUI" }), deps({ ollamaEnabled: true, logger }));
    expect(r.sovereign_metadata.provider).toBe("ollama");
    expect(events.find((e) => e.event_type === "INFERENCE_CALL")!.payload).toMatchObject({ provider: "ollama", input_classification: "CUI" });
  });

  it("CUI + Ollama enabled but unavailable → Anthropic (Tier 2) with provider fallback", async () => {
    const { logger, events } = makeLogger();
    const r = await routedComplete(messages, ctx({ data_classification: "CUI" }), deps({
      ollamaEnabled: true,
      logger,
      ollamaComplete: async () => { throw new OllamaUnavailableError("http://x", "down"); },
    }));
    expect(r.sovereign_metadata.provider).toBe("anthropic");
    const fb = events.find((e) => e.event_type === "INFERENCE_PROVIDER_FALLBACK")!;
    expect(fb.payload).toMatchObject({ intended_provider: "ollama", actual_provider: "anthropic", fallback_reason: "ollama_unavailable" });
    expect(events.some((e) => e.event_type === "INFERENCE_CALL")).toBe(true);
  });

  it("CUI + Ollama disabled → Anthropic with ollama_disabled fallback warning", async () => {
    const { logger, events } = makeLogger();
    const r = await routedComplete(messages, ctx({ data_classification: "CUI" }), deps({ ollamaEnabled: false, logger }));
    expect(r.sovereign_metadata.provider).toBe("anthropic");
    expect(events.find((e) => e.event_type === "INFERENCE_PROVIDER_FALLBACK")!.payload).toMatchObject({ fallback_reason: "ollama_disabled" });
  });

  it("both providers unavailable → static (Tier 3), never throws", async () => {
    const { logger, events } = makeLogger();
    const r = await routedComplete(messages, ctx({ data_classification: "CUI" }), deps({
      ollamaEnabled: true,
      logger,
      ollamaComplete: async () => { throw new OllamaUnavailableError("http://x"); },
      anthropicComplete: async () => { throw new Error("anthropic down"); },
    }));
    expect(r.fallback_tier).toBe("static");
    expect(r.fallback_activated).toBe(true);
    expect(events.every((e) => e.workflow_step_id === "wf-1")).toBe(true);
  });
});

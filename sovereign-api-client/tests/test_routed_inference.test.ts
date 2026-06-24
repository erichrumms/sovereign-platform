/**
 * sovereign-api-client — test_routed_inference.test.ts
 * GD-10 classification routing (Session 14):
 *   - UNCLASSIFIED (and absent) → Anthropic; on Anthropic failure → static (Tier 3).
 *   - CUI / SECRET / TOP_SECRET → ClassificationNotAuthorizedError PROPAGATES (not swallowed).
 * Every emitted event carries workflow_step_id. The Ollama (Provider B) path is retained
 * architecture but unreachable while GD-10 is in force, so it is exercised by the provider
 * unit tests, not here.
 */
import { routedComplete, type RoutedInferenceDeps } from "../src/routed-inference";
import { ClassificationNotAuthorizedError } from "../src/routing";
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

describe("routedComplete — authorized (UNCLASSIFIED) traffic", () => {
  it("UNCLASSIFIED → Anthropic, INFERENCE_CALL provider anthropic", async () => {
    const { logger, events } = makeLogger();
    const r = await routedComplete(messages, ctx({ data_classification: "UNCLASSIFIED" }), deps({ ollamaEnabled: true, logger }));
    expect(r.sovereign_metadata.provider).toBe("anthropic");
    const call = events.find((e) => e.event_type === "INFERENCE_CALL")!;
    expect(call.payload).toMatchObject({ provider: "anthropic", input_classification: "UNCLASSIFIED" });
    expect(events.every((e) => e.workflow_step_id === "wf-1")).toBe(true);
  });

  it("absent classification → Anthropic (treated as UNCLASSIFIED)", async () => {
    const { logger, events } = makeLogger();
    const r = await routedComplete(messages, ctx(), deps({ logger }));
    expect(r.sovereign_metadata.provider).toBe("anthropic");
    expect(events.find((e) => e.event_type === "INFERENCE_CALL")!.payload).toMatchObject({ provider: "anthropic" });
  });

  it("Anthropic unavailable → static (Tier 3), never throws for authorized traffic", async () => {
    const { logger, events } = makeLogger();
    const r = await routedComplete(messages, ctx({ data_classification: "UNCLASSIFIED" }), deps({
      logger,
      anthropicComplete: async () => { throw new Error("anthropic down"); },
    }));
    expect(r.fallback_tier).toBe("static");
    expect(r.fallback_activated).toBe(true);
    expect(events.every((e) => e.workflow_step_id === "wf-1")).toBe(true);
  });
});

describe("routedComplete — GD-10 classification boundary (error propagates, not swallowed)", () => {
  it.each(["CUI", "SECRET", "TOP_SECRET"] as const)(
    "%s throws ClassificationNotAuthorizedError and does not return a response",
    async (classification) => {
      const { logger, events } = makeLogger();
      await expect(
        routedComplete(messages, ctx({ data_classification: classification }), deps({ ollamaEnabled: true, logger }))
      ).rejects.toBeInstanceOf(ClassificationNotAuthorizedError);
      // The boundary rejects before any provider runs — no inference/fallback events emitted.
      expect(events).toHaveLength(0);
    }
  );

  it("surfaces the governance-fixed message to the caller", async () => {
    await expect(
      routedComplete(messages, ctx({ data_classification: "SECRET" }), deps({}))
    ).rejects.toThrow("This classification level is not authorized for processing in SOVEREIGN. Contact your system administrator.");
  });
});

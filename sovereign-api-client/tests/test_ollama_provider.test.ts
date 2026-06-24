/**
 * sovereign-api-client — test_ollama_provider.test.ts
 * The Ollama adapter: no injected fetch → OllamaUnavailableError (no live connection);
 * a good fake fetch → standard SovereignLLMResponse; a bad status / unparseable / empty
 * response → OllamaUnavailableError. The real network is never touched.
 */
import { OllamaProvider, OllamaUnavailableError, type FetchImpl } from "../src/providers/ollama-provider";
import type { SovereignMessage, SovereignRequestContext } from "../src/base-client";

const messages: SovereignMessage[] = [{ role: "user", content: "hello" }];
const context: SovereignRequestContext = {
  workflow_step_id: "wf-1",
  product: "CPMI",
  agent_id: "cpmi.reasoning-chain",
  tier: "standard",
  data_classification: "CUI",
};

const okFetch: FetchImpl = async () => ({ ok: true, status: 200, json: async () => ({ choices: [{ message: { content: "governance answer" } }] }) });

describe("OllamaProvider", () => {
  it("throws OllamaUnavailableError when no fetch is injected (no live connection)", async () => {
    const p = new OllamaProvider({ endpoint: "http://localhost:11434", modelId: "mistral:13b-q4" });
    await expect(p.complete(messages, context)).rejects.toBeInstanceOf(OllamaUnavailableError);
  });

  it("returns a standard SovereignLLMResponse on a successful call", async () => {
    const p = new OllamaProvider({ endpoint: "http://localhost:11434", modelId: "mistral:13b-q4", fetchImpl: okFetch });
    const r = await p.complete(messages, context);
    expect(r.content).toBe("governance answer");
    expect(r.fallback_tier).toBe("live");
    expect(r.fallback_activated).toBe(false);
    expect(r.sovereign_metadata.provider).toBe("ollama");
    expect(r.sovereign_metadata.workflow_step_id).toBe("wf-1");
  });

  it("throws on a non-ok HTTP status", async () => {
    const p = new OllamaProvider({ endpoint: "http://x", modelId: "m", fetchImpl: async () => ({ ok: false, status: 503, json: async () => ({}) }) });
    await expect(p.complete(messages, context)).rejects.toBeInstanceOf(OllamaUnavailableError);
  });

  it("throws on a connection error", async () => {
    const p = new OllamaProvider({ endpoint: "http://x", modelId: "m", fetchImpl: async () => { throw new Error("ECONNREFUSED"); } });
    await expect(p.complete(messages, context)).rejects.toBeInstanceOf(OllamaUnavailableError);
  });

  it("throws when the response has no message content", async () => {
    const p = new OllamaProvider({ endpoint: "http://x", modelId: "m", fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ choices: [] }) }) });
    await expect(p.complete(messages, context)).rejects.toBeInstanceOf(OllamaUnavailableError);
  });
});

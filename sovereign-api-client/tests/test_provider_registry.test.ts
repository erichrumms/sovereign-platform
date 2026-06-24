/**
 * sovereign-api-client — test_provider_registry.test.ts
 * The registry: Anthropic always present + enabled; Ollama disabled by default (env unset
 * → Governance Clock OFF posture); overrides accepted.
 */
import { createProviderRegistry, isOllamaEnabled, DEFAULT_OLLAMA_MODEL_ID } from "../src/providers/provider-registry";

describe("provider registry", () => {
  it("registers Anthropic (enabled) and Ollama (disabled by default)", () => {
    const reg = createProviderRegistry();
    expect(reg.anthropic.provider).toBe("anthropic");
    expect(reg.anthropic.enabled).toBe(true);
    expect(reg.ollama.provider).toBe("ollama");
    expect(reg.ollama.enabled).toBe(false); // no VITE_OLLAMA_* in the test env
    expect(reg.ollama.modelId).toBe(DEFAULT_OLLAMA_MODEL_ID);
    expect(isOllamaEnabled(reg)).toBe(false);
  });

  it("accepts overrides (explicit wiring / tests)", () => {
    const reg = createProviderRegistry({ ollama: { provider: "ollama", endpoint: "http://x", modelId: "m", enabled: true } });
    expect(isOllamaEnabled(reg)).toBe(true);
  });
});

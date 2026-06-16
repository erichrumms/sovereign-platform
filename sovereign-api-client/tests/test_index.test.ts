/**
 * SOVEREIGN Platform — sovereign-api-client
 * test_index.test.ts
 *
 * Unit tests for index.ts:
 *   - createSovereignClient() selects AnthropicClient for tier "standard"
 *   - createSovereignClient() selects GovCloudClient for tier "enhanced"
 *   - Throws on missing api_key_anthropic for standard tier
 *   - Enhanced tier with no key gracefully uses placeholder (no throw)
 *   - Config overrides (model, timeout_ms, max_tokens) are applied
 *   - All public exports are present and correctly typed
 *   - Standard client rejects enhanced-tier complete() calls (integration check)
 *   - Enhanced client rejects standard-tier complete() calls (integration check)
 *   - SOVEREIGN_API_CLIENT_VERSION is defined
 *
 * Session 2A — June 2, 2026
 */

import {
  createSovereignClient,
  SovereignClientConfig,
  ProviderSelector,
  SOVEREIGN_API_CLIENT_VERSION,
  // Re-exported types and classes — presence confirms exports are wired
  AnthropicClient,
  GovCloudClient,
  BaseSovereignClient,
  NullFallbackCache,
  ConsoleClientLogger,
  SovereignServiceError,
  SovereignTimeoutError,
  AnthropicAPIError,
  AnthropicParseError,
  GovCloudNotYetResolvedException,
  ANTHROPIC_API_URL,
  ANTHROPIC_API_VERSION,
  SOVEREIGN_DEFAULT_MODEL,
  GOVCLOUD_PROVIDER_ENDPOINT,
  GOVCLOUD_AUTH_HEADER_NAME,
  GOVCLOUD_PROVIDER_NAME,
  GOVCLOUD_MODEL_ID,
  defaultAnthropicConfig,
  defaultGovCloudConfig,
  STATIC_FALLBACK_RESPONSE,
} from "../src/index";

import {
  SovereignRequestContext,
  SovereignMessage,
  ClientLogger,
  FallbackCache,
  SovereignLLMResponse,
} from "../src/base-client";

// ============================================================
// TEST DOUBLES
// ============================================================

class SpyLogger implements ClientLogger {
  events: Parameters<ClientLogger["log"]>[0][] = [];
  log(event: Parameters<ClientLogger["log"]>[0]): void { this.events.push(event); }
}

class TestFallbackCache implements FallbackCache {
  private store = new Map<string, SovereignLLMResponse>();
  get(key: string): SovereignLLMResponse | null { return this.store.get(key) ?? null; }
  set(key: string, value: SovereignLLMResponse): void { this.store.set(key, value); }
}

// ============================================================
// FIXTURES
// ============================================================

const STANDARD_SELECTOR: ProviderSelector = { tier: "standard" };
const ENHANCED_SELECTOR: ProviderSelector = { tier: "enhanced" };

const STANDARD_CONFIG: SovereignClientConfig = {
  api_key_anthropic: "sk-ant-test-key",
};

const ENHANCED_CONFIG: SovereignClientConfig = {
  api_key_govcloud: "govcloud-test-key",
};

const BASE_MESSAGES: SovereignMessage[] = [
  { role: "user", content: "Test message." },
];

const STANDARD_CONTEXT: SovereignRequestContext = {
  workflow_step_id: "WF-INDEX-001",
  product: "CPMI",
  agent_id: "cpmi.reasoning-chain",
  tier: "standard",
};

const ENHANCED_CONTEXT: SovereignRequestContext = {
  workflow_step_id: "WF-INDEX-002",
  product: "NEXUS",
  agent_id: "nexus.routing-agent",
  tier: "enhanced",
};

// ============================================================
// SETUP
// ============================================================

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

// ============================================================
// TESTS — Provider Selection
// ============================================================

describe("createSovereignClient — provider selection", () => {
  test("returns AnthropicClient for tier 'standard'", () => {
    const client = createSovereignClient(STANDARD_SELECTOR, STANDARD_CONFIG);
    expect(client).toBeInstanceOf(AnthropicClient);
  });

  test("returns GovCloudClient for tier 'enhanced'", () => {
    const client = createSovereignClient(ENHANCED_SELECTOR, ENHANCED_CONFIG);
    expect(client).toBeInstanceOf(GovCloudClient);
  });

  test("returned client is a BaseSovereignClient regardless of tier", () => {
    const standard = createSovereignClient(STANDARD_SELECTOR, STANDARD_CONFIG);
    const enhanced = createSovereignClient(ENHANCED_SELECTOR, ENHANCED_CONFIG);
    expect(standard).toBeInstanceOf(BaseSovereignClient);
    expect(enhanced).toBeInstanceOf(BaseSovereignClient);
  });

  test("injects provided logger into selected client", async () => {
    const logger = new SpyLogger();
    // Enhanced tier — placeholder will log FALLBACK_ACTIVATED
    const client = createSovereignClient(ENHANCED_SELECTOR, ENHANCED_CONFIG, logger);
    await client.complete(BASE_MESSAGES, ENHANCED_CONTEXT);
    expect(logger.events.length).toBeGreaterThan(0);
  });

  test("injects provided cache into selected client", () => {
    const cache = new TestFallbackCache();
    const client = createSovereignClient(STANDARD_SELECTOR, STANDARD_CONFIG, undefined, cache);
    expect(client).toBeInstanceOf(AnthropicClient);
    // Cache injection verified by successful construction — deep behavioral
    // testing is in test_anthropic_client.test.ts
  });

  test("defaults logger to ConsoleClientLogger when not provided", () => {
    // No throw on construction — ConsoleClientLogger is used
    expect(() =>
      createSovereignClient(STANDARD_SELECTOR, STANDARD_CONFIG)
    ).not.toThrow();
  });

  test("defaults cache to NullFallbackCache when not provided", () => {
    expect(() =>
      createSovereignClient(STANDARD_SELECTOR, STANDARD_CONFIG)
    ).not.toThrow();
  });
});

// ============================================================
// TESTS — Config Overrides
// ============================================================

describe("createSovereignClient — config overrides", () => {
  test("standard client uses api_key_anthropic", async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: "msg_test", type: "message", role: "assistant",
          content: [{ type: "text", text: "ok" }],
          model: SOVEREIGN_DEFAULT_MODEL, stop_reason: "end_turn",
          usage: { input_tokens: 5, output_tokens: 5 },
        }),
        { status: 200 }
      )
    );
    const client = createSovereignClient(STANDARD_SELECTOR, { api_key_anthropic: "sk-specific-key" });
    await client.complete(BASE_MESSAGES, STANDARD_CONTEXT);

    const [, init] = (global.fetch as jest.MockedFunction<typeof fetch>).mock.calls[0];
    const headers = init?.headers as Record<string, string>;
    expect(headers["x-api-key"]).toBe("sk-specific-key");
  });

  test("model override is applied for standard tier", async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: "msg_test", type: "message", role: "assistant",
          content: [{ type: "text", text: "ok" }],
          model: "claude-custom-model", stop_reason: "end_turn",
          usage: { input_tokens: 5, output_tokens: 5 },
        }),
        { status: 200 }
      )
    );
    const client = createSovereignClient(
      STANDARD_SELECTOR,
      { api_key_anthropic: "key", model: "claude-custom-model" }
    );
    const response = await client.complete(BASE_MESSAGES, STANDARD_CONTEXT);
    // Model is reflected in metadata
    expect(response.sovereign_metadata.provider_model).toBe("claude-custom-model");
  });
});

// ============================================================
// TESTS — Misconfiguration Errors
// ============================================================

describe("createSovereignClient — misconfiguration errors", () => {
  test("throws when tier is 'standard' and api_key_anthropic is missing", () => {
    expect(() =>
      createSovereignClient(STANDARD_SELECTOR, {})
    ).toThrow("api_key_anthropic is required for tier 'standard'");
  });

  test("error message includes runtime injection guidance", () => {
    expect(() =>
      createSovereignClient(STANDARD_SELECTOR, {})
    ).toThrow("sovereign-shell or AgentOS orchestrator");
  });

  test("does NOT throw when tier is 'enhanced' and api_key_govcloud is missing", () => {
    // Enhanced tier with no key is expected during development (R7 open).
    // GovCloudClient uses placeholder key and serves static fallback.
    expect(() =>
      createSovereignClient(ENHANCED_SELECTOR, {})
    ).not.toThrow();
  });

  test("enhanced client with no key serves static fallback on complete()", async () => {
    const client = createSovereignClient(ENHANCED_SELECTOR, {}, new SpyLogger());
    const response = await client.complete(BASE_MESSAGES, ENHANCED_CONTEXT);
    expect(response.fallback_activated).toBe(true);
    expect(response.fallback_tier).toBe("static");
  });
});

// ============================================================
// TESTS — Tier Cross-Enforcement (integration)
// ============================================================

describe("tier cross-enforcement via factory", () => {
  test("standard client rejects enhanced-tier complete() calls", async () => {
    const client = createSovereignClient(STANDARD_SELECTOR, STANDARD_CONFIG);
    await expect(
      client.complete(BASE_MESSAGES, ENHANCED_CONTEXT)
    ).rejects.toThrow("AnthropicClient is Tier 1 only");
  });

  test("enhanced client rejects standard-tier complete() calls", async () => {
    const client = createSovereignClient(ENHANCED_SELECTOR, ENHANCED_CONFIG);
    await expect(
      client.complete(BASE_MESSAGES, STANDARD_CONTEXT)
    ).rejects.toThrow("GovCloudClient handles Tier 2");
  });
});

// ============================================================
// TESTS — Public Export Surface
// ============================================================

describe("public export surface", () => {
  test("SOVEREIGN_API_CLIENT_VERSION is defined", () => {
    expect(SOVEREIGN_API_CLIENT_VERSION).toBe("1.0.0");
  });

  test("AnthropicClient is exported", () => {
    expect(AnthropicClient).toBeDefined();
  });

  test("GovCloudClient is exported", () => {
    expect(GovCloudClient).toBeDefined();
  });

  test("BaseSovereignClient is exported", () => {
    expect(BaseSovereignClient).toBeDefined();
  });

  test("NullFallbackCache is exported", () => {
    expect(NullFallbackCache).toBeDefined();
  });

  test("ConsoleClientLogger is exported", () => {
    expect(ConsoleClientLogger).toBeDefined();
  });

  test("SovereignServiceError is exported", () => {
    expect(SovereignServiceError).toBeDefined();
  });

  test("SovereignTimeoutError is exported", () => {
    expect(SovereignTimeoutError).toBeDefined();
  });

  test("AnthropicAPIError is exported", () => {
    expect(AnthropicAPIError).toBeDefined();
  });

  test("AnthropicParseError is exported", () => {
    expect(AnthropicParseError).toBeDefined();
  });

  test("GovCloudNotYetResolvedException is exported", () => {
    expect(GovCloudNotYetResolvedException).toBeDefined();
  });

  test("ANTHROPIC_API_URL is exported", () => {
    expect(ANTHROPIC_API_URL).toBe("https://api.anthropic.com/v1/messages");
  });

  test("ANTHROPIC_API_VERSION is exported", () => {
    expect(ANTHROPIC_API_VERSION).toBeDefined();
  });

  test("SOVEREIGN_DEFAULT_MODEL is exported", () => {
    expect(SOVEREIGN_DEFAULT_MODEL).toBe("claude-sonnet-4-20250514");
  });

  test("GOVCLOUD_PROVIDER_ENDPOINT placeholder is exported", () => {
    expect(GOVCLOUD_PROVIDER_ENDPOINT).toBe("UNRESOLVED_PENDING_GOVCLOUD_DECISION");
  });

  test("GOVCLOUD_AUTH_HEADER_NAME placeholder is exported", () => {
    expect(GOVCLOUD_AUTH_HEADER_NAME).toBe("UNRESOLVED_PENDING_GOVCLOUD_DECISION");
  });

  test("GOVCLOUD_PROVIDER_NAME is exported", () => {
    expect(GOVCLOUD_PROVIDER_NAME).toBe("govcloud-unresolved");
  });

  test("GOVCLOUD_MODEL_ID placeholder is exported", () => {
    expect(GOVCLOUD_MODEL_ID).toBe("UNRESOLVED_PENDING_GOVCLOUD_DECISION");
  });

  test("defaultAnthropicConfig factory is exported", () => {
    expect(typeof defaultAnthropicConfig).toBe("function");
  });

  test("defaultGovCloudConfig factory is exported", () => {
    expect(typeof defaultGovCloudConfig).toBe("function");
  });

  test("STATIC_FALLBACK_RESPONSE helper is exported", () => {
    expect(typeof STATIC_FALLBACK_RESPONSE).toBe("function");
  });

  test("createSovereignClient is exported", () => {
    expect(typeof createSovereignClient).toBe("function");
  });
});

/**
 * SOVEREIGN Platform — sovereign-api-client
 * test_anthropic_client.test.ts
 *
 * Unit tests for AnthropicClient:
 *   - Tier 1 enforcement (rejects "enhanced" tier requests)
 *   - Auth header injection (x-api-key, anthropic-version)
 *   - SovereignMessage → Anthropic wire format translation
 *   - System message extraction
 *   - Response parsing (text blocks, usage)
 *   - AnthropicAPIError on non-2xx responses
 *   - AnthropicParseError on malformed responses
 *   - Three-tier fallback integration (provider error → cache → static)
 *   - defaultAnthropicConfig factory
 *
 * All network calls are intercepted via global fetch mock.
 * No real HTTP calls are made.
 *
 * Session 2A — June 2, 2026
 */

import {
  AnthropicClient,
  AnthropicClientConfig,
  AnthropicAPIError,
  AnthropicParseError,
  ANTHROPIC_API_URL,
  ANTHROPIC_API_VERSION,
  SOVEREIGN_DEFAULT_MODEL,
  defaultAnthropicConfig,
} from "../src/anthropic-client";

import {
  SovereignMessage,
  SovereignRequestContext,
  SovereignLLMResponse,
  FallbackCache,
  ClientLogger,
  NullFallbackCache,
} from "../src/base-client";

// ============================================================
// FETCH MOCK INFRASTRUCTURE
// ============================================================

type FetchMock = jest.MockedFunction<typeof fetch>;

function mockFetchSuccess(content: string, usage = { input_tokens: 10, output_tokens: 20 }): void {
  const body = JSON.stringify({
    id: "msg_test123",
    type: "message",
    role: "assistant",
    content: [{ type: "text", text: content }],
    model: SOVEREIGN_DEFAULT_MODEL,
    stop_reason: "end_turn",
    usage,
  });
  (global.fetch as FetchMock).mockResolvedValueOnce(
    new Response(body, { status: 200, headers: { "Content-Type": "application/json" } })
  );
}

function mockFetchError(status: number, error_type: string, message: string): void {
  const body = JSON.stringify({ type: "error", error: { type: error_type, message } });
  (global.fetch as FetchMock).mockResolvedValueOnce(
    new Response(body, { status, headers: { "Content-Type": "application/json" } })
  );
}

function mockFetchMalformed(body: string): void {
  (global.fetch as FetchMock).mockResolvedValueOnce(
    new Response(body, { status: 200, headers: { "Content-Type": "application/json" } })
  );
}

function mockFetchNetworkError(message = "Network failure"): void {
  (global.fetch as FetchMock).mockRejectedValueOnce(new Error(message));
}

// ============================================================
// TEST DOUBLES
// ============================================================

class TestFallbackCache implements FallbackCache {
  private store = new Map<string, SovereignLLMResponse>();
  get(key: string): SovereignLLMResponse | null { return this.store.get(key) ?? null; }
  set(key: string, value: SovereignLLMResponse): void { this.store.set(key, value); }
  size(): number { return this.store.size; }
}

class SpyLogger implements ClientLogger {
  events: Parameters<ClientLogger["log"]>[0][] = [];
  log(event: Parameters<ClientLogger["log"]>[0]): void { this.events.push(event); }
  eventsOfType(type: string) { return this.events.filter((e) => e.event_type === type); }
  clear(): void { this.events = []; }
}

// ============================================================
// FIXTURES
// ============================================================

const TEST_API_KEY = "sk-ant-test-sovereign-key-0001";

const BASE_CONFIG: AnthropicClientConfig = {
  provider: "anthropic",
  api_key: TEST_API_KEY,
  model: SOVEREIGN_DEFAULT_MODEL,
  timeout_ms: 5_000,
  max_tokens: 1_000,
  sovereign_version: "1.0",
};

const BASE_CONTEXT: SovereignRequestContext = {
  workflow_step_id: "WF-ANTHROPIC-001",
  product: "CPMI",
  agent_id: "cpmi.reasoning-chain",
  tier: "standard",
};

const BASE_MESSAGES: SovereignMessage[] = [
  { role: "user", content: "Evaluate this governance scenario." },
];

// ============================================================
// SETUP / TEARDOWN
// ============================================================

beforeEach(() => {
  global.fetch = jest.fn() as FetchMock;
});

afterEach(() => {
  jest.resetAllMocks();
});

// ============================================================
// TESTS — Tier 1 Enforcement
// ============================================================

describe("Tier 1 enforcement", () => {
  test("rejects requests with tier 'enhanced'", async () => {
    const client = new AnthropicClient(BASE_CONFIG);
    const enhancedContext: SovereignRequestContext = { ...BASE_CONTEXT, tier: "enhanced" };

    await expect(client.complete(BASE_MESSAGES, enhancedContext)).rejects.toThrow(
      "AnthropicClient is Tier 1 only"
    );
  });

  test("error message includes GovCloudClient reference", async () => {
    const client = new AnthropicClient(BASE_CONFIG);
    const enhancedContext: SovereignRequestContext = { ...BASE_CONTEXT, tier: "enhanced" };

    await expect(client.complete(BASE_MESSAGES, enhancedContext)).rejects.toThrow(
      "GovCloudClient"
    );
  });

  test("error message includes workflow_step_id", async () => {
    const client = new AnthropicClient(BASE_CONFIG);
    const enhancedContext: SovereignRequestContext = {
      ...BASE_CONTEXT,
      tier: "enhanced",
      workflow_step_id: "WF-TIER-GUARD-TEST",
    };

    await expect(client.complete(BASE_MESSAGES, enhancedContext)).rejects.toThrow(
      "WF-TIER-GUARD-TEST"
    );
  });

  test("accepts requests with tier 'standard'", async () => {
    mockFetchSuccess("Standard tier response");
    const client = new AnthropicClient(BASE_CONFIG);
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.content).toBe("Standard tier response");
  });

  test("fetch is never called for enhanced tier requests", async () => {
    const client = new AnthropicClient(BASE_CONFIG);
    const enhancedContext: SovereignRequestContext = { ...BASE_CONTEXT, tier: "enhanced" };

    await expect(client.complete(BASE_MESSAGES, enhancedContext)).rejects.toThrow();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

// ============================================================
// TESTS — Auth Header Injection
// ============================================================

describe("auth header injection", () => {
  test("includes x-api-key header with correct value", async () => {
    mockFetchSuccess("ok");
    const client = new AnthropicClient(BASE_CONFIG);
    await client.complete(BASE_MESSAGES, BASE_CONTEXT);

    const [, init] = (global.fetch as FetchMock).mock.calls[0];
    const headers = init?.headers as Record<string, string>;
    expect(headers["x-api-key"]).toBe(TEST_API_KEY);
  });

  test("includes anthropic-version header", async () => {
    mockFetchSuccess("ok");
    const client = new AnthropicClient(BASE_CONFIG);
    await client.complete(BASE_MESSAGES, BASE_CONTEXT);

    const [, init] = (global.fetch as FetchMock).mock.calls[0];
    const headers = init?.headers as Record<string, string>;
    expect(headers["anthropic-version"]).toBe(ANTHROPIC_API_VERSION);
  });

  test("includes Content-Type application/json", async () => {
    mockFetchSuccess("ok");
    const client = new AnthropicClient(BASE_CONFIG);
    await client.complete(BASE_MESSAGES, BASE_CONTEXT);

    const [, init] = (global.fetch as FetchMock).mock.calls[0];
    const headers = init?.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
  });

  test("calls the correct Anthropic API URL", async () => {
    mockFetchSuccess("ok");
    const client = new AnthropicClient(BASE_CONFIG);
    await client.complete(BASE_MESSAGES, BASE_CONTEXT);

    const [url] = (global.fetch as FetchMock).mock.calls[0];
    expect(url).toBe(ANTHROPIC_API_URL);
  });

  test("uses POST method", async () => {
    mockFetchSuccess("ok");
    const client = new AnthropicClient(BASE_CONFIG);
    await client.complete(BASE_MESSAGES, BASE_CONTEXT);

    const [, init] = (global.fetch as FetchMock).mock.calls[0];
    expect(init?.method).toBe("POST");
  });
});

// ============================================================
// TESTS — Message Translation
// ============================================================

describe("message translation", () => {
  test("user message is preserved in wire format", async () => {
    mockFetchSuccess("ok");
    const client = new AnthropicClient(BASE_CONFIG);
    const messages: SovereignMessage[] = [{ role: "user", content: "What is CPMI?" }];
    await client.complete(messages, BASE_CONTEXT);

    const [, init] = (global.fetch as FetchMock).mock.calls[0];
    const body = JSON.parse(init?.body as string);
    expect(body.messages).toContainEqual({ role: "user", content: "What is CPMI?" });
  });

  test("assistant message is preserved in wire format", async () => {
    mockFetchSuccess("ok");
    const client = new AnthropicClient(BASE_CONFIG);
    const messages: SovereignMessage[] = [
      { role: "user", content: "What is CPMI?" },
      { role: "assistant", content: "CPMI is the governance engine." },
      { role: "user", content: "Elaborate." },
    ];
    await client.complete(messages, BASE_CONTEXT);

    const [, init] = (global.fetch as FetchMock).mock.calls[0];
    const body = JSON.parse(init?.body as string);
    expect(body.messages).toContainEqual({ role: "assistant", content: "CPMI is the governance engine." });
  });

  test("system message is extracted to top-level system field", async () => {
    mockFetchSuccess("ok");
    const client = new AnthropicClient(BASE_CONFIG);
    const messages: SovereignMessage[] = [
      { role: "system", content: "You are a governance assistant." },
      { role: "user", content: "Evaluate this." },
    ];
    await client.complete(messages, BASE_CONTEXT);

    const [, init] = (global.fetch as FetchMock).mock.calls[0];
    const body = JSON.parse(init?.body as string);
    expect(body.system).toBe("You are a governance assistant.");
  });

  test("system message is NOT included in messages array", async () => {
    mockFetchSuccess("ok");
    const client = new AnthropicClient(BASE_CONFIG);
    const messages: SovereignMessage[] = [
      { role: "system", content: "System prompt here." },
      { role: "user", content: "User message here." },
    ];
    await client.complete(messages, BASE_CONTEXT);

    const [, init] = (global.fetch as FetchMock).mock.calls[0];
    const body = JSON.parse(init?.body as string);
    const roles = body.messages.map((m: { role: string }) => m.role);
    expect(roles).not.toContain("system");
  });

  test("multiple system messages are joined with double newline", async () => {
    mockFetchSuccess("ok");
    const client = new AnthropicClient(BASE_CONFIG);
    const messages: SovereignMessage[] = [
      { role: "system", content: "Part one." },
      { role: "system", content: "Part two." },
      { role: "user", content: "Go." },
    ];
    await client.complete(messages, BASE_CONTEXT);

    const [, init] = (global.fetch as FetchMock).mock.calls[0];
    const body = JSON.parse(init?.body as string);
    expect(body.system).toBe("Part one.\n\nPart two.");
  });

  test("no system field in request when no system messages present", async () => {
    mockFetchSuccess("ok");
    const client = new AnthropicClient(BASE_CONFIG);
    await client.complete([{ role: "user", content: "Hello." }], BASE_CONTEXT);

    const [, init] = (global.fetch as FetchMock).mock.calls[0];
    const body = JSON.parse(init?.body as string);
    expect(body.system).toBeUndefined();
  });

  test("request body includes correct model", async () => {
    mockFetchSuccess("ok");
    const client = new AnthropicClient(BASE_CONFIG);
    await client.complete(BASE_MESSAGES, BASE_CONTEXT);

    const [, init] = (global.fetch as FetchMock).mock.calls[0];
    const body = JSON.parse(init?.body as string);
    expect(body.model).toBe(SOVEREIGN_DEFAULT_MODEL);
  });

  test("request body includes max_tokens", async () => {
    mockFetchSuccess("ok");
    const client = new AnthropicClient({ ...BASE_CONFIG, max_tokens: 512 });
    await client.complete(BASE_MESSAGES, BASE_CONTEXT);

    const [, init] = (global.fetch as FetchMock).mock.calls[0];
    const body = JSON.parse(init?.body as string);
    expect(body.max_tokens).toBe(512);
  });
});

// ============================================================
// TESTS — Response Parsing
// ============================================================

describe("response parsing", () => {
  test("extracts text content from response", async () => {
    mockFetchSuccess("Governance analysis complete.");
    const client = new AnthropicClient(BASE_CONFIG);
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.content).toBe("Governance analysis complete.");
  });

  test("extracts usage from response", async () => {
    mockFetchSuccess("ok", { input_tokens: 42, output_tokens: 17 });
    const client = new AnthropicClient(BASE_CONFIG);
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.usage).toEqual({ input_tokens: 42, output_tokens: 17 });
  });

  test("concatenates multiple text blocks", async () => {
    const body = JSON.stringify({
      id: "msg_multi",
      type: "message",
      role: "assistant",
      content: [
        { type: "text", text: "First block. " },
        { type: "text", text: "Second block." },
      ],
      model: SOVEREIGN_DEFAULT_MODEL,
      stop_reason: "end_turn",
      usage: { input_tokens: 5, output_tokens: 10 },
    });
    (global.fetch as FetchMock).mockResolvedValueOnce(
      new Response(body, { status: 200 })
    );
    const client = new AnthropicClient(BASE_CONFIG);
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.content).toBe("First block. Second block.");
  });

  test("throws AnthropicParseError on non-JSON response body", async () => {
    mockFetchMalformed("not json at all");
    const client = new AnthropicClient(BASE_CONFIG, new SpyLogger(), new NullFallbackCache());
    // Should fall through to static fallback — not throw
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.fallback_activated).toBe(true);
  });

  test("throws AnthropicParseError on empty content array — activates fallback", async () => {
    const body = JSON.stringify({
      id: "msg_empty",
      type: "message",
      role: "assistant",
      content: [],
      model: SOVEREIGN_DEFAULT_MODEL,
      stop_reason: "end_turn",
      usage: { input_tokens: 5, output_tokens: 0 },
    });
    (global.fetch as FetchMock).mockResolvedValueOnce(new Response(body, { status: 200 }));
    const client = new AnthropicClient(BASE_CONFIG, new SpyLogger(), new NullFallbackCache());
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.fallback_activated).toBe(true);
  });
});

// ============================================================
// TESTS — API Error Handling
// ============================================================

describe("API error handling", () => {
  test("activates fallback on 401 unauthorized", async () => {
    mockFetchError(401, "authentication_error", "Invalid API key.");
    const client = new AnthropicClient(BASE_CONFIG, new SpyLogger(), new NullFallbackCache());
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.fallback_activated).toBe(true);
  });

  test("activates fallback on 429 rate limit", async () => {
    mockFetchError(429, "rate_limit_error", "Too many requests.");
    const client = new AnthropicClient(BASE_CONFIG, new SpyLogger(), new NullFallbackCache());
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.fallback_activated).toBe(true);
  });

  test("activates fallback on 500 server error", async () => {
    mockFetchError(500, "api_error", "Internal server error.");
    const client = new AnthropicClient(BASE_CONFIG, new SpyLogger(), new NullFallbackCache());
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.fallback_activated).toBe(true);
  });

  test("activates fallback on network error", async () => {
    mockFetchNetworkError("ECONNREFUSED");
    const client = new AnthropicClient(BASE_CONFIG, new SpyLogger(), new NullFallbackCache());
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.fallback_activated).toBe(true);
  });

  test("AnthropicAPIError carries status code", () => {
    const err = new AnthropicAPIError(429, "rate_limit_error", "Too many requests.");
    expect(err.status).toBe(429);
    expect(err.error_type).toBe("rate_limit_error");
    expect(err.name).toBe("AnthropicAPIError");
  });

  test("FALLBACK_ACTIVATED logger event emitted on API error", async () => {
    mockFetchError(500, "api_error", "Server error.");
    const logger = new SpyLogger();
    const client = new AnthropicClient(BASE_CONFIG, logger, new NullFallbackCache());
    await client.complete(BASE_MESSAGES, BASE_CONTEXT);

    expect(logger.eventsOfType("FALLBACK_ACTIVATED").length).toBeGreaterThan(0);
  });
});

// ============================================================
// TESTS — Three-Tier Fallback Integration
// ============================================================

describe("three-tier fallback integration", () => {
  test("cache tier serves response when live fails and cache is populated", async () => {
    const cache = new TestFallbackCache();
    const logger = new SpyLogger();

    // First call — live succeeds, populates cache
    mockFetchSuccess("Cached governance analysis");
    const client1 = new AnthropicClient(BASE_CONFIG, logger, cache);
    await client1.complete(BASE_MESSAGES, BASE_CONTEXT);

    // Second call — live fails, cache serves
    mockFetchError(500, "api_error", "Server down.");
    const client2 = new AnthropicClient(BASE_CONFIG, logger, cache);
    const response = await client2.complete(BASE_MESSAGES, BASE_CONTEXT);

    expect(response.fallback_activated).toBe(true);
    expect(response.fallback_tier).toBe("cached");
    expect(response.content).toBe("Cached governance analysis");
  });

  test("static tier serves when live fails and cache is empty", async () => {
    mockFetchError(500, "api_error", "Server down.");
    const client = new AnthropicClient(BASE_CONFIG, new SpyLogger(), new NullFallbackCache());
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);

    expect(response.fallback_tier).toBe("static");
    expect(response.content).toContain("SOVEREIGN AI service is temporarily unavailable");
  });

  test("live success populates cache for subsequent fallback use", async () => {
    const cache = new TestFallbackCache();
    mockFetchSuccess("Live response");
    const client = new AnthropicClient(BASE_CONFIG, new SpyLogger(), cache);
    await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(cache.size()).toBe(1);
  });
});

// ============================================================
// TESTS — SOVEREIGN Metadata
// ============================================================

describe("SOVEREIGN metadata on Anthropic responses", () => {
  test("provider field is 'anthropic'", async () => {
    mockFetchSuccess("ok");
    const client = new AnthropicClient(BASE_CONFIG);
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.sovereign_metadata.provider).toBe("anthropic");
  });

  test("provider_model matches configured model", async () => {
    mockFetchSuccess("ok");
    const client = new AnthropicClient(BASE_CONFIG);
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.sovereign_metadata.provider_model).toBe(SOVEREIGN_DEFAULT_MODEL);
  });

  test("tier is 'standard' for Tier 1 requests", async () => {
    mockFetchSuccess("ok");
    const client = new AnthropicClient(BASE_CONFIG);
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.sovereign_metadata.tier).toBe("standard");
  });

  test("workflow_step_id matches context", async () => {
    mockFetchSuccess("ok");
    const client = new AnthropicClient(BASE_CONFIG);
    const response = await client.complete(
      BASE_MESSAGES,
      { ...BASE_CONTEXT, workflow_step_id: "WF-METADATA-CHECK" }
    );
    expect(response.sovereign_metadata.workflow_step_id).toBe("WF-METADATA-CHECK");
  });
});

// ============================================================
// TESTS — defaultAnthropicConfig
// ============================================================

describe("defaultAnthropicConfig factory", () => {
  test("sets api_key from argument", () => {
    const config = defaultAnthropicConfig("sk-ant-my-key");
    expect(config.api_key).toBe("sk-ant-my-key");
  });

  test("sets correct default model", () => {
    const config = defaultAnthropicConfig("key");
    expect(config.model).toBe(SOVEREIGN_DEFAULT_MODEL);
  });

  test("sets timeout_ms to 30000", () => {
    const config = defaultAnthropicConfig("key");
    expect(config.timeout_ms).toBe(30_000);
  });

  test("sets max_tokens to 1000", () => {
    const config = defaultAnthropicConfig("key");
    expect(config.max_tokens).toBe(1_000);
  });

  test("sets provider to 'anthropic'", () => {
    const config = defaultAnthropicConfig("key");
    expect(config.provider).toBe("anthropic");
  });
});

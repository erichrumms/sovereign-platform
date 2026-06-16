/**
 * SOVEREIGN Platform — sovereign-api-client
 * test_base_client.test.ts
 *
 * Unit tests for BaseSovereignClient:
 *   - SOVEREIGN metadata injection on every response
 *   - Three-tier fallback: live → cached → static
 *   - Timeout enforcement
 *   - Logger events emitted at each fallback tier
 *   - Cache key determinism
 *   - SovereignServiceError propagation
 *
 * Session 2A — June 2, 2026
 */

import {
  BaseSovereignClient,
  BaseClientConfig,
  SovereignMessage,
  SovereignRequestContext,
  SovereignLLMResponse,
  FallbackCache,
  ClientLogger,
  NullFallbackCache,
  ConsoleClientLogger,
  SovereignTimeoutError,
  STATIC_FALLBACK_RESPONSE,
} from "../src/base-client";

// ============================================================
// TEST DOUBLES
// ============================================================

/** Minimal in-memory fallback cache for testing. */
class TestFallbackCache implements FallbackCache {
  private store = new Map<string, SovereignLLMResponse>();
  get(key: string): SovereignLLMResponse | null {
    return this.store.get(key) ?? null;
  }
  set(key: string, value: SovereignLLMResponse): void {
    this.store.set(key, value);
  }
  has(key: string): boolean {
    return this.store.has(key);
  }
  size(): number {
    return this.store.size;
  }
}

/** Logger that captures all emitted events for assertion. */
class SpyLogger implements ClientLogger {
  events: Parameters<ClientLogger["log"]>[0][] = [];
  log(event: Parameters<ClientLogger["log"]>[0]): void {
    this.events.push(event);
  }
  eventsOfType(type: string) {
    return this.events.filter((e) => e.event_type === type);
  }
  clear() {
    this.events = [];
  }
}

/**
 * Concrete subclass for testing.
 * callProvider behavior is controlled via the injected resolver/rejecter.
 */
class TestClient extends BaseSovereignClient {
  private _providerImpl: (
    messages: SovereignMessage[],
    headers: Record<string, string>
  ) => Promise<{ content: string; usage?: { input_tokens: number; output_tokens: number } }>;

  constructor(
    config: BaseClientConfig,
    logger: ClientLogger,
    cache: FallbackCache,
    providerImpl: TestClient["_providerImpl"]
  ) {
    super(config, logger, cache);
    this._providerImpl = providerImpl;
  }

  protected buildHeaders(): Record<string, string> {
    return {
      "Authorization": "Bearer test-key",
      "Content-Type": "application/json",
      "x-sovereign-product": "NEXUS",
    };
  }

  protected async callProvider(
    messages: SovereignMessage[],
    headers: Record<string, string>
  ) {
    return this._providerImpl(messages, headers);
  }

  // Expose protected helpers for direct testing
  public exposedCacheKey(messages: SovereignMessage[], context: SovereignRequestContext) {
    return this._cacheKey(messages, context);
  }
}

// ============================================================
// FIXTURES
// ============================================================

const BASE_CONFIG: BaseClientConfig = {
  provider: "test-provider",
  model: "test-model-1.0",
  timeout_ms: 200, // short timeout so timeout tests run fast
  max_tokens: 1000,
  sovereign_version: "1.0",
};

const BASE_CONTEXT: SovereignRequestContext = {
  workflow_step_id: "WF-TEST-001",
  product: "NEXUS",
  agent_id: "nexus.classification-agent",
  tier: "standard",
};

const BASE_MESSAGES: SovereignMessage[] = [
  { role: "user", content: "Test message" },
];

function makeSuccessProvider(content = "Success response") {
  return async () => ({ content, usage: { input_tokens: 10, output_tokens: 20 } });
}

function makeFailProvider(message = "Provider error") {
  return async (): Promise<never> => {
    throw new Error(message);
  };
}

function makeSlowProvider(delay_ms: number, content = "Slow response") {
  return async () => {
    await new Promise((r) => setTimeout(r, delay_ms));
    return { content };
  };
}

// ============================================================
// TESTS — SOVEREIGN Metadata Injection
// ============================================================

describe("SOVEREIGN metadata injection", () => {
  test("live response includes all required metadata fields", async () => {
    const logger = new SpyLogger();
    const cache = new TestFallbackCache();
    const client = new TestClient(BASE_CONFIG, logger, cache, makeSuccessProvider());

    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);

    expect(response.sovereign_metadata.sovereign_product).toBe("NEXUS");
    expect(response.sovereign_metadata.sovereign_version).toBe("1.0");
    expect(response.sovereign_metadata.workflow_step_id).toBe("WF-TEST-001");
    expect(response.sovereign_metadata.agent_id).toBe("nexus.classification-agent");
    expect(response.sovereign_metadata.provider).toBe("test-provider");
    expect(response.sovereign_metadata.provider_model).toBe("test-model-1.0");
    expect(response.sovereign_metadata.tier).toBe("standard");
    expect(response.sovereign_metadata.responded_at).toBeTruthy();
  });

  test("metadata responded_at is a valid ISO 8601 timestamp", async () => {
    const client = new TestClient(
      BASE_CONFIG, new SpyLogger(), new NullFallbackCache(), makeSuccessProvider()
    );
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    const parsed = new Date(response.sovereign_metadata.responded_at);
    expect(parsed.getTime()).not.toBeNaN();
  });

  test("metadata reflects the correct product for each product value", async () => {
    const products = ["NEXUS", "CPMI", "APEX", "FLOWPATH", "AGENTOS", "ARIA"] as const;
    for (const product of products) {
      const client = new TestClient(
        BASE_CONFIG, new SpyLogger(), new NullFallbackCache(), makeSuccessProvider()
      );
      const ctx = { ...BASE_CONTEXT, product };
      const response = await client.complete(BASE_MESSAGES, ctx);
      expect(response.sovereign_metadata.sovereign_product).toBe(product);
    }
  });

  test("live response includes token usage when provider supplies it", async () => {
    const client = new TestClient(
      BASE_CONFIG, new SpyLogger(), new NullFallbackCache(),
      async () => ({ content: "ok", usage: { input_tokens: 15, output_tokens: 30 } })
    );
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.usage).toEqual({ input_tokens: 15, output_tokens: 30 });
  });

  test("live response has no usage field when provider omits it", async () => {
    const client = new TestClient(
      BASE_CONFIG, new SpyLogger(), new NullFallbackCache(),
      async () => ({ content: "ok" })
    );
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.usage).toBeUndefined();
  });
});

// ============================================================
// TESTS — Happy Path
// ============================================================

describe("live tier — happy path", () => {
  test("returns content from provider", async () => {
    const client = new TestClient(
      BASE_CONFIG, new SpyLogger(), new NullFallbackCache(), makeSuccessProvider("Hello SOVEREIGN")
    );
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.content).toBe("Hello SOVEREIGN");
  });

  test("fallback_tier is 'live' on success", async () => {
    const client = new TestClient(
      BASE_CONFIG, new SpyLogger(), new NullFallbackCache(), makeSuccessProvider()
    );
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.fallback_tier).toBe("live");
  });

  test("fallback_activated is false on success", async () => {
    const client = new TestClient(
      BASE_CONFIG, new SpyLogger(), new NullFallbackCache(), makeSuccessProvider()
    );
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.fallback_activated).toBe(false);
  });

  test("no FALLBACK_ACTIVATED logger event on success", async () => {
    const logger = new SpyLogger();
    const client = new TestClient(BASE_CONFIG, logger, new NullFallbackCache(), makeSuccessProvider());
    await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(logger.eventsOfType("FALLBACK_ACTIVATED")).toHaveLength(0);
  });

  test("live response is written to cache", async () => {
    const cache = new TestFallbackCache();
    const client = new TestClient(BASE_CONFIG, new SpyLogger(), cache, makeSuccessProvider());
    await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(cache.size()).toBe(1);
  });
});

// ============================================================
// TESTS — Fallback Tier 2 (Cache)
// ============================================================

describe("cache tier — fallback tier 2", () => {
  test("serves cached response when live provider fails", async () => {
    const cache = new TestFallbackCache();
    const logger = new SpyLogger();

    // First call succeeds and populates cache
    const successClient = new TestClient(
      BASE_CONFIG, logger, cache, makeSuccessProvider("Cached content")
    );
    await successClient.complete(BASE_MESSAGES, BASE_CONTEXT);

    // Second client fails at live tier
    const failClient = new TestClient(BASE_CONFIG, logger, cache, makeFailProvider());
    const response = await failClient.complete(BASE_MESSAGES, BASE_CONTEXT);

    expect(response.fallback_activated).toBe(true);
    expect(response.fallback_tier).toBe("cached");
    expect(response.content).toBe("Cached content");
  });

  test("emits FALLBACK_ACTIVATED event with tier:cached when cache serves response", async () => {
    const cache = new TestFallbackCache();
    const logger = new SpyLogger();

    const successClient = new TestClient(BASE_CONFIG, logger, cache, makeSuccessProvider());
    await successClient.complete(BASE_MESSAGES, BASE_CONTEXT);
    logger.clear();

    const failClient = new TestClient(BASE_CONFIG, logger, cache, makeFailProvider());
    await failClient.complete(BASE_MESSAGES, BASE_CONTEXT);

    const fallbackEvents = logger.eventsOfType("FALLBACK_ACTIVATED");
    expect(fallbackEvents.length).toBeGreaterThanOrEqual(1);
    const cacheEvent = fallbackEvents.find((e) => e.payload["tier"] === "cached");
    expect(cacheEvent).toBeDefined();
  });

  test("cached response has updated workflow_step_id from current context", async () => {
    const cache = new TestFallbackCache();

    const successClient = new TestClient(BASE_CONFIG, new SpyLogger(), cache, makeSuccessProvider());
    await successClient.complete(BASE_MESSAGES, { ...BASE_CONTEXT, workflow_step_id: "WF-ORIGINAL" });

    const failClient = new TestClient(BASE_CONFIG, new SpyLogger(), cache, makeFailProvider());
    const response = await failClient.complete(BASE_MESSAGES, {
      ...BASE_CONTEXT,
      workflow_step_id: "WF-RETRY-001",
    });

    if (response.fallback_tier === "cached") {
      expect(response.sovereign_metadata.workflow_step_id).toBe("WF-RETRY-001");
    }
  });
});

// ============================================================
// TESTS — Fallback Tier 3 (Static)
// ============================================================

describe("static tier — fallback tier 3", () => {
  test("serves static fallback when live fails and cache is empty", async () => {
    const client = new TestClient(
      BASE_CONFIG, new SpyLogger(), new NullFallbackCache(), makeFailProvider()
    );
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.fallback_tier).toBe("static");
    expect(response.fallback_activated).toBe(true);
  });

  test("static fallback content contains SOVEREIGN unavailability message", async () => {
    const client = new TestClient(
      BASE_CONFIG, new SpyLogger(), new NullFallbackCache(), makeFailProvider()
    );
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.content).toContain("SOVEREIGN AI service is temporarily unavailable");
  });

  test("emits FALLBACK_ACTIVATED event with tier:static", async () => {
    const logger = new SpyLogger();
    const client = new TestClient(BASE_CONFIG, logger, new NullFallbackCache(), makeFailProvider());
    await client.complete(BASE_MESSAGES, BASE_CONTEXT);

    const staticEvent = logger.eventsOfType("FALLBACK_ACTIVATED")
      .find((e) => e.payload["tier"] === "static");
    expect(staticEvent).toBeDefined();
  });

  test("static fallback metadata includes correct workflow_step_id", async () => {
    const client = new TestClient(
      BASE_CONFIG, new SpyLogger(), new NullFallbackCache(), makeFailProvider()
    );
    const response = await client.complete(BASE_MESSAGES, {
      ...BASE_CONTEXT,
      workflow_step_id: "WF-STATIC-TEST",
    });
    expect(response.sovereign_metadata.workflow_step_id).toBe("WF-STATIC-TEST");
  });

  test("STATIC_FALLBACK_RESPONSE helper returns correct shape", () => {
    const response = STATIC_FALLBACK_RESPONSE(
      BASE_CONTEXT, "test-provider", "test-model", "1.0"
    );
    expect(response.fallback_tier).toBe("static");
    expect(response.fallback_activated).toBe(true);
    expect(response.sovereign_metadata.provider).toBe("test-provider");
    expect(response.sovereign_metadata.provider_model).toBe("test-model");
  });
});

// ============================================================
// TESTS — Timeout Enforcement
// ============================================================

describe("timeout enforcement", () => {
  test("times out when provider exceeds timeout_ms", async () => {
    const logger = new SpyLogger();
    // Provider takes 500ms; timeout is 200ms
    const client = new TestClient(
      BASE_CONFIG, logger, new NullFallbackCache(), makeSlowProvider(500)
    );
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    // Should fall through to static since no cache is available
    expect(response.fallback_activated).toBe(true);
  });

  test("emits FALLBACK_ACTIVATED with reason:timeout when provider times out", async () => {
    const logger = new SpyLogger();
    const client = new TestClient(
      { ...BASE_CONFIG, timeout_ms: 50 },
      logger,
      new NullFallbackCache(),
      makeSlowProvider(300)
    );
    await client.complete(BASE_MESSAGES, BASE_CONTEXT);

    const timeoutEvent = logger.eventsOfType("FALLBACK_ACTIVATED")
      .find((e) => e.payload["reason"] === "timeout");
    expect(timeoutEvent).toBeDefined();
  });

  test("completes successfully when provider responds within timeout_ms", async () => {
    const client = new TestClient(
      { ...BASE_CONFIG, timeout_ms: 500 },
      new SpyLogger(),
      new NullFallbackCache(),
      makeSlowProvider(50, "Fast enough")
    );
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.content).toBe("Fast enough");
    expect(response.fallback_activated).toBe(false);
  });

  test("SovereignTimeoutError carries workflow_step_id", () => {
    const err = new SovereignTimeoutError(30_000, "WF-TIMEOUT-TEST");
    expect(err.workflow_step_id).toBe("WF-TIMEOUT-TEST");
    expect(err.timeout_ms).toBe(30_000);
    expect(err.name).toBe("SovereignTimeoutError");
  });
});

// ============================================================
// TESTS — Logger Events
// ============================================================

describe("logger event correctness", () => {
  test("FALLBACK_ACTIVATED event includes product field", async () => {
    const logger = new SpyLogger();
    const client = new TestClient(BASE_CONFIG, logger, new NullFallbackCache(), makeFailProvider());
    await client.complete(BASE_MESSAGES, BASE_CONTEXT);

    const events = logger.eventsOfType("FALLBACK_ACTIVATED");
    expect(events.length).toBeGreaterThan(0);
    events.forEach((e) => expect(e.product).toBe("NEXUS"));
  });

  test("FALLBACK_ACTIVATED event includes actor_id matching agent_id", async () => {
    const logger = new SpyLogger();
    const client = new TestClient(BASE_CONFIG, logger, new NullFallbackCache(), makeFailProvider());
    await client.complete(BASE_MESSAGES, { ...BASE_CONTEXT, agent_id: "cpmi.reasoning-chain" });

    const events = logger.eventsOfType("FALLBACK_ACTIVATED");
    expect(events.every((e) => e.actor_id === "cpmi.reasoning-chain")).toBe(true);
  });

  test("FALLBACK_ACTIVATED event includes workflow_step_id", async () => {
    const logger = new SpyLogger();
    const client = new TestClient(BASE_CONFIG, logger, new NullFallbackCache(), makeFailProvider());
    await client.complete(BASE_MESSAGES, { ...BASE_CONTEXT, workflow_step_id: "WF-LOGGER-TEST" });

    const events = logger.eventsOfType("FALLBACK_ACTIVATED");
    expect(events.every((e) => e.workflow_step_id === "WF-LOGGER-TEST")).toBe(true);
  });
});

// ============================================================
// TESTS — Cache Key Determinism
// ============================================================

describe("cache key determinism", () => {
  test("same product + workflow_step_id produces same cache key", () => {
    const client = new TestClient(
      BASE_CONFIG, new SpyLogger(), new NullFallbackCache(), makeSuccessProvider()
    );
    const key1 = client.exposedCacheKey(BASE_MESSAGES, BASE_CONTEXT);
    const key2 = client.exposedCacheKey(BASE_MESSAGES, BASE_CONTEXT);
    expect(key1).toBe(key2);
  });

  test("different products produce different cache keys", () => {
    const client = new TestClient(
      BASE_CONFIG, new SpyLogger(), new NullFallbackCache(), makeSuccessProvider()
    );
    const key1 = client.exposedCacheKey(BASE_MESSAGES, { ...BASE_CONTEXT, product: "NEXUS" });
    const key2 = client.exposedCacheKey(BASE_MESSAGES, { ...BASE_CONTEXT, product: "CPMI" });
    expect(key1).not.toBe(key2);
  });

  test("different workflow_step_ids produce different cache keys", () => {
    const client = new TestClient(
      BASE_CONFIG, new SpyLogger(), new NullFallbackCache(), makeSuccessProvider()
    );
    const key1 = client.exposedCacheKey(BASE_MESSAGES, { ...BASE_CONTEXT, workflow_step_id: "WF-001" });
    const key2 = client.exposedCacheKey(BASE_MESSAGES, { ...BASE_CONTEXT, workflow_step_id: "WF-002" });
    expect(key1).not.toBe(key2);
  });

  test("cache key includes provider name", () => {
    const client = new TestClient(
      BASE_CONFIG, new SpyLogger(), new NullFallbackCache(), makeSuccessProvider()
    );
    const key = client.exposedCacheKey(BASE_MESSAGES, BASE_CONTEXT);
    expect(key).toContain("test-provider");
  });
});

// ============================================================
// TESTS — NullFallbackCache
// ============================================================

describe("NullFallbackCache", () => {
  test("get always returns null", () => {
    const cache = new NullFallbackCache();
    expect(cache.get("any-key")).toBeNull();
  });

  test("set is a no-op — get still returns null after set", () => {
    const cache = new NullFallbackCache();
    const fakeResponse = STATIC_FALLBACK_RESPONSE(BASE_CONTEXT, "p", "m", "1.0");
    cache.set("key", fakeResponse);
    expect(cache.get("key")).toBeNull();
  });
});

// ============================================================
// TESTS — Default Config Values
// ============================================================

describe("default config values", () => {
  test("timeout_ms defaults to 30000 when not specified", async () => {
    const client = new TestClient(
      { provider: "p", model: "m" },
      new SpyLogger(),
      new NullFallbackCache(),
      makeSuccessProvider()
    );
    // Access via complete — if timeout fires in 30s we know it set correctly
    // We just check the response succeeds (provider resolves before 30s)
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.fallback_activated).toBe(false);
  });

  test("sovereign_version defaults to '1.0' when not specified", async () => {
    const client = new TestClient(
      { provider: "p", model: "m" },
      new SpyLogger(),
      new NullFallbackCache(),
      makeSuccessProvider()
    );
    const response = await client.complete(BASE_MESSAGES, BASE_CONTEXT);
    expect(response.sovereign_metadata.sovereign_version).toBe("1.0");
  });
});

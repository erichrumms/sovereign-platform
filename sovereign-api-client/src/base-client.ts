/**
 * SOVEREIGN Platform — sovereign-api-client
 * base-client.ts
 *
 * Shared base class for all LLM provider clients in the SOVEREIGN Platform.
 * Provides: auth header injection, SOVEREIGN metadata tagging, timeout
 * handling, and the three-tier fallback contract (live → cached → static).
 *
 * Every provider-specific client (AnthropicClient, GovCloudClient) extends
 * this class. No product module calls a provider API directly — all LLM
 * calls route through this abstraction.
 *
 * Standing development constraint (Integration Brief v1.3, Section 6):
 *   "No product calls an LLM provider API directly — all LLM calls go
 *    through sovereign-api-client."
 *
 * Version: 1.0
 * Session: 2A — June 2, 2026
 * Authority: Project Principal · SOVEREIGN Platform Governance Authority
 */

import type { SovereignProduct, SovereignTier } from "./types";

// ============================================================
// REQUEST / RESPONSE TYPES
// ============================================================

/**
 * The standard message format passed into every LLM call.
 * Provider-specific clients translate this into their wire format.
 */
export interface SovereignMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Caller-supplied context attached to every LLM request.
 * Required for audit trail, fallback logging, and IL exposure fields.
 */
export interface SovereignRequestContext {
  /** Canonical workflow_step_id — required on every Logger event. */
  workflow_step_id: string;
  /** The product making the call. */
  product: SovereignProduct;
  /** The registered agent_id making the call. Must be in Agent Registry. */
  agent_id: string;
  /** Tier determines which provider client is selected. */
  tier: SovereignTier;
}

/**
 * The unified response returned by every provider client.
 * Callers never receive raw provider responses — always this envelope.
 */
export interface SovereignLLMResponse {
  /** The model's text output. */
  content: string;
  /** Which fallback tier actually served this response. */
  fallback_tier: "live" | "cached" | "static";
  /** true if a fallback tier was used rather than the live provider. */
  fallback_activated: boolean;
  /** SOVEREIGN metadata — included on every response per API design standard. */
  sovereign_metadata: SovereignResponseMetadata;
  /** Raw token usage from provider, if available. */
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * SOVEREIGN metadata block attached to every response.
 * Architecture Section 10: "All responses include SOVEREIGN metadata."
 */
export interface SovereignResponseMetadata {
  sovereign_product: SovereignProduct;
  sovereign_version: string;
  workflow_step_id: string;
  agent_id: string;
  provider: string;
  provider_model: string;
  tier: SovereignTier;
  /** ISO 8601 timestamp of the response. */
  responded_at: string;
}

/**
 * Configuration passed to the base client constructor.
 * Provider clients extend this with their own config fields.
 */
export interface BaseClientConfig {
  /** Provider name for logging and metadata. */
  provider: string;
  /** Model identifier string used in API calls. */
  model: string;
  /** Request timeout in milliseconds. Default: 30000. */
  timeout_ms?: number;
  /** Maximum tokens to request from the provider. Default: 1000. */
  max_tokens?: number;
  /** SOVEREIGN platform version string embedded in metadata. */
  sovereign_version?: string;
}

// ============================================================
// FALLBACK CACHE INTERFACE
// ============================================================

/**
 * Minimal cache interface the base client uses for Tier 2 fallback.
 * Concrete implementations are injected at construction time.
 * Default implementation (NullFallbackCache) returns null for all gets —
 * acceptable during development; replaced before Stage 5 production.
 */
export interface FallbackCache {
  get(key: string): SovereignLLMResponse | null;
  set(key: string, value: SovereignLLMResponse): void;
}

/**
 * No-op fallback cache — used during development when no cache is
 * configured. Always returns null; set() is a no-op.
 * Must be replaced with a real implementation before Stage 5.
 */
export class NullFallbackCache implements FallbackCache {
  get(_key: string): SovereignLLMResponse | null {
    return null;
  }
  set(_key: string, _value: SovereignLLMResponse): void {
    // no-op — NullFallbackCache accepts writes silently
  }
}

// ============================================================
// STATIC FALLBACK
// ============================================================

/**
 * Static fallback response returned when both the live provider and the
 * cache are unavailable. Signals clearly that a fallback occurred so
 * callers can gate on fallback_activated before acting on content.
 *
 * Used in: FALLBACK_ACTIVATED Logger events at the "static" tier.
 */
export const STATIC_FALLBACK_RESPONSE = (
  context: SovereignRequestContext,
  provider: string,
  model: string,
  sovereign_version: string
): SovereignLLMResponse => ({
  content:
    "SOVEREIGN AI service is temporarily unavailable. " +
    "This is a static fallback response. " +
    "Do not act on this content — retry when the service is restored.",
  fallback_tier: "static",
  fallback_activated: true,
  sovereign_metadata: {
    sovereign_product: context.product,
    sovereign_version,
    workflow_step_id: context.workflow_step_id,
    agent_id: context.agent_id,
    provider,
    provider_model: model,
    tier: context.tier,
    responded_at: new Date().toISOString(),
  },
});

// ============================================================
// ERROR TYPES
// ============================================================

/**
 * Thrown when all three fallback tiers fail.
 * Callers should catch SovereignServiceError, not provider-specific errors.
 */
export class SovereignServiceError extends Error {
  constructor(
    message: string,
    public readonly workflow_step_id: string,
    public readonly product: SovereignProduct,
    public readonly cause_detail?: string
  ) {
    super(message);
    this.name = "SovereignServiceError";
  }
}

/**
 * Thrown when a request times out against the live provider.
 * Base client catches this internally and activates the cache fallback.
 */
export class SovereignTimeoutError extends Error {
  constructor(
    public readonly timeout_ms: number,
    public readonly workflow_step_id: string
  ) {
    super(`LLM request timed out after ${timeout_ms}ms`);
    this.name = "SovereignTimeoutError";
  }
}

// ============================================================
// LOGGER SHIM
// ============================================================

/**
 * Minimal logger interface the base client uses to emit FALLBACK_ACTIVATED
 * and EXTERNAL_DEPENDENCY_FAILURE events per the architecture standard
 * (Section 11).
 *
 * In production the shell injects a real SovereignLogger. During unit
 * testing a mock is injected. The base client never imports the Security
 * Framework directly — that would create a circular dependency between
 * sovereign-api-client and sovereign-security.
 */
export interface ClientLogger {
  log(event: {
    event_type:
      | "FALLBACK_ACTIVATED"
      | "EXTERNAL_DEPENDENCY_FAILURE"
      | "AGENT_STEP_START"
      | "AGENT_STEP_COMPLETE";
    workflow_step_id: string;
    product: SovereignProduct;
    actor_id: string;
    outcome: string;
    payload: Record<string, unknown>;
  }): void;
}

/**
 * No-op logger — used when no logger is injected (e.g., unit tests that
 * are testing fallback logic only). Writes to console in non-production
 * environments so events are not silently swallowed during development.
 */
export class ConsoleClientLogger implements ClientLogger {
  log(event: Parameters<ClientLogger["log"]>[0]): void {
    if (process.env["NODE_ENV"] !== "production") {
      console.warn("[SOVEREIGN base-client]", event.event_type, event.payload);
    }
  }
}

// ============================================================
// BASE CLIENT
// ============================================================

/**
 * Abstract base class for all SOVEREIGN LLM provider clients.
 *
 * Subclasses implement:
 *   - buildHeaders(): provider-specific auth headers
 *   - callProvider(): the actual HTTP call to the provider API
 *
 * This class provides:
 *   - SOVEREIGN metadata injection on every response
 *   - Timeout enforcement with Promise.race()
 *   - Three-tier fallback: live → cached → static
 *   - Logger events for FALLBACK_ACTIVATED and EXTERNAL_DEPENDENCY_FAILURE
 *
 * Usage (from a product module — never call a provider directly):
 *
 *   const client = new AnthropicClient(config, logger, cache);
 *   const response = await client.complete(messages, context);
 *   if (response.fallback_activated) {
 *     // gate on this before taking consequential action
 *   }
 */
export abstract class BaseSovereignClient {
  protected readonly provider: string;
  protected readonly model: string;
  protected readonly timeout_ms: number;
  protected readonly max_tokens: number;
  protected readonly sovereign_version: string;
  protected readonly logger: ClientLogger;
  protected readonly cache: FallbackCache;

  constructor(
    config: BaseClientConfig,
    logger: ClientLogger = new ConsoleClientLogger(),
    cache: FallbackCache = new NullFallbackCache()
  ) {
    this.provider = config.provider;
    this.model = config.model;
    this.timeout_ms = config.timeout_ms ?? 30_000;
    this.max_tokens = config.max_tokens ?? 1_000;
    this.sovereign_version = config.sovereign_version ?? "1.0";
    this.logger = logger;
    this.cache = cache;
  }

  // ----------------------------------------------------------
  // ABSTRACT — subclasses must implement
  // ----------------------------------------------------------

  /**
   * Build the provider-specific HTTP auth headers.
   * Called once per request by complete().
   */
  protected abstract buildHeaders(): Record<string, string>;

  /**
   * Execute the actual HTTP call to the provider.
   * Must resolve within timeout_ms or throw SovereignTimeoutError.
   * Must return raw content string and optional token usage.
   */
  protected abstract callProvider(
    messages: SovereignMessage[],
    headers: Record<string, string>
  ): Promise<{ content: string; usage?: { input_tokens: number; output_tokens: number } }>;

  // ----------------------------------------------------------
  // PUBLIC — the single entry point for all LLM calls
  // ----------------------------------------------------------

  /**
   * Complete a conversation with three-tier fallback.
   *
   * Tier 1 (live): call the provider API within timeout_ms.
   * Tier 2 (cached): return the most recent cached response for this
   *   workflow_step_id if available.
   * Tier 3 (static): return the platform static fallback and log
   *   FALLBACK_ACTIVATED so the caller can gate on fallback_activated.
   *
   * Never throws unless all three tiers fail — in that case throws
   * SovereignServiceError. Callers should always check
   * response.fallback_activated before taking consequential action.
   */
  async complete(
    messages: SovereignMessage[],
    context: SovereignRequestContext
  ): Promise<SovereignLLMResponse> {

    // ---- Tier 1: live provider ----
    try {
      const headers = this.buildHeaders();
      const raw = await this._withTimeout(
        this.callProvider(messages, headers),
        context.workflow_step_id
      );

      return this._wrapResponse(raw, context, "live", false);

    } catch (err) {
      const isTimeout = err instanceof SovereignTimeoutError;
      const reason = isTimeout ? "timeout" : "provider_error";
      const detail = err instanceof Error ? err.message : String(err);

      this.logger.log({
        event_type: "FALLBACK_ACTIVATED",
        workflow_step_id: context.workflow_step_id,
        product: context.product,
        actor_id: context.agent_id,
        outcome: "live_tier_failed",
        payload: { tier: "live", reason, detail, provider: this.provider },
      });
    }

    // ---- Tier 2: cache ----
    const cacheKey = this._cacheKey(messages, context);
    const cached = this.cache.get(cacheKey);

    if (cached !== null) {
      this.logger.log({
        event_type: "FALLBACK_ACTIVATED",
        workflow_step_id: context.workflow_step_id,
        product: context.product,
        actor_id: context.agent_id,
        outcome: "cache_tier_served",
        payload: { tier: "cached", cache_key: cacheKey, provider: this.provider },
      });

      // Return cached response with updated metadata to reflect this request's context
      return {
        ...cached,
        fallback_tier: "cached",
        fallback_activated: true,
        sovereign_metadata: {
          ...cached.sovereign_metadata,
          workflow_step_id: context.workflow_step_id,
          responded_at: new Date().toISOString(),
        },
      };
    }

    // ---- Tier 3: static ----
    this.logger.log({
      event_type: "FALLBACK_ACTIVATED",
      workflow_step_id: context.workflow_step_id,
      product: context.product,
      actor_id: context.agent_id,
      outcome: "static_tier_served",
      payload: {
        tier: "static",
        reason: "live_and_cache_unavailable",
        provider: this.provider,
      },
    });

    return STATIC_FALLBACK_RESPONSE(
      context,
      this.provider,
      this.model,
      this.sovereign_version
    );
  }

  // ----------------------------------------------------------
  // PROTECTED HELPERS — available to subclasses
  // ----------------------------------------------------------

  /**
   * Wraps a raw provider response in the SovereignLLMResponse envelope,
   * injecting SOVEREIGN metadata per architecture Section 10.
   */
  protected _wrapResponse(
    raw: { content: string; usage?: { input_tokens: number; output_tokens: number } },
    context: SovereignRequestContext,
    fallback_tier: "live" | "cached" | "static",
    fallback_activated: boolean
  ): SovereignLLMResponse {
    const response: SovereignLLMResponse = {
      content: raw.content,
      fallback_tier,
      fallback_activated,
      sovereign_metadata: {
        sovereign_product: context.product,
        sovereign_version: this.sovereign_version,
        workflow_step_id: context.workflow_step_id,
        agent_id: context.agent_id,
        provider: this.provider,
        provider_model: this.model,
        tier: context.tier,
        responded_at: new Date().toISOString(),
      },
    };

    if (raw.usage) {
      response.usage = raw.usage;
    }

    // Cache the live response for future fallback use
    if (fallback_tier === "live") {
      const cacheKey = this._cacheKey([], context); // key on context only for cache storage
      this.cache.set(cacheKey, response);
    }

    return response;
  }

  /**
   * Wraps a promise with a timeout. Throws SovereignTimeoutError if the
   * promise does not resolve within this.timeout_ms.
   */
  protected async _withTimeout<T>(
    promise: Promise<T>,
    workflow_step_id: string
  ): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new SovereignTimeoutError(this.timeout_ms, workflow_step_id)),
        this.timeout_ms
      )
    );
    return Promise.race([promise, timeout]);
  }

  /**
   * Generates a deterministic cache key from context.
   * Keyed on product + workflow_step_id to allow per-step cache hits.
   */
  protected _cacheKey(
    _messages: SovereignMessage[],
    context: SovereignRequestContext
  ): string {
    return `sovereign:${context.product}:${context.workflow_step_id}:${this.provider}`;
  }
}

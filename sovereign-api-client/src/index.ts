/**
 * SOVEREIGN Platform — sovereign-api-client
 * index.ts
 *
 * Package entry point for @sovereign/api-client.
 *
 * Two responsibilities:
 *   1. Export every public type and class the rest of the platform needs
 *   2. Provide createSovereignClient() — the single factory function that
 *      selects the correct provider client based on context.tier
 *
 * STANDING CONSTRAINT (Integration Brief v1.3, Section 6):
 *   "No product calls an LLM provider API directly — all LLM calls go
 *    through sovereign-api-client."
 *
 * Products import from this file only. They do not import from
 * base-client.ts, anthropic-client.ts, or govcloud-client.ts directly.
 * Provider selection is the responsibility of this package, not the caller.
 *
 * Usage:
 *
 *   import { createSovereignClient, SovereignRequestContext } from "@sovereign/api-client";
 *
 *   const client = createSovereignClient({ tier: "standard" }, config, logger, cache);
 *   const response = await client.complete(messages, context);
 *   if (response.fallback_activated) { ... }
 *
 * Version: 1.0
 * Session: 2A — June 2, 2026
 * Authority: Project Principal · SOVEREIGN Platform Governance Authority
 */

// ============================================================
// RE-EXPORTS — BASE TYPES (public API surface)
// Products import these types from here, not from base-client.ts
// ============================================================

export type {
  SovereignMessage,
  SovereignRequestContext,
  SovereignLLMResponse,
  SovereignResponseMetadata,
  BaseClientConfig,
  FallbackCache,
  ClientLogger,
} from "./base-client";

export {
  BaseSovereignClient,
  NullFallbackCache,
  ConsoleClientLogger,
  SovereignServiceError,
  SovereignTimeoutError,
  STATIC_FALLBACK_RESPONSE,
} from "./base-client";

// ============================================================
// RE-EXPORTS — ANTHROPIC CLIENT
// ============================================================

export type { AnthropicClientConfig } from "./anthropic-client";

export {
  AnthropicClient,
  AnthropicAPIError,
  AnthropicParseError,
  ANTHROPIC_API_URL,
  ANTHROPIC_API_VERSION,
  SOVEREIGN_DEFAULT_MODEL,
  defaultAnthropicConfig,
} from "./anthropic-client";

// ============================================================
// RE-EXPORTS — GOVCLOUD CLIENT
// ============================================================

export type { GovCloudClientConfig } from "./govcloud-client";

export {
  GovCloudClient,
  GovCloudNotYetResolvedException,
  GOVCLOUD_PROVIDER_ENDPOINT,
  GOVCLOUD_AUTH_HEADER_NAME,
  GOVCLOUD_PROVIDER_NAME,
  GOVCLOUD_MODEL_ID,
  defaultGovCloudConfig,
} from "./govcloud-client";

// ============================================================
// RE-EXPORTS — SHARED TYPES
// ============================================================

export type { SovereignProduct, SovereignTier } from "./types";

// ============================================================
// PROVIDER SELECTION
// ============================================================

import { BaseSovereignClient, FallbackCache, ClientLogger, NullFallbackCache, ConsoleClientLogger } from "./base-client";
import { AnthropicClient, AnthropicClientConfig, defaultAnthropicConfig } from "./anthropic-client";
import { GovCloudClient, GovCloudClientConfig, defaultGovCloudConfig } from "./govcloud-client";
import { SovereignTier } from "./types";

/**
 * Selector input — tells createSovereignClient() which provider to use.
 * Products supply this based on the data classification of the request.
 */
export interface ProviderSelector {
  /**
   * The infrastructure tier for this request.
   *   "standard" → AnthropicClient (Tier 1 Commercial)
   *   "enhanced" → GovCloudClient  (Tier 2 GovCloud/CUI)
   *
   * This value must match the SovereignRequestContext.tier passed to
   * complete() — the clients enforce matching at runtime.
   */
  tier: SovereignTier;
}

/**
 * Combined config accepted by createSovereignClient().
 * Tier determines which fields are required:
 *   - "standard": api_key_anthropic required
 *   - "enhanced": api_key_govcloud required (may be placeholder until R7)
 */
export interface SovereignClientConfig {
  /** Anthropic API key — required for tier "standard". */
  api_key_anthropic?: string;
  /** GovCloud provider API key — required for tier "enhanced". */
  api_key_govcloud?: string;
  /** Model override — defaults to provider's platform default. */
  model?: string;
  /** Timeout override in ms — defaults to 30000. */
  timeout_ms?: number;
  /** Max tokens override — defaults to 1000. */
  max_tokens?: number;
  /** SOVEREIGN platform version — defaults to "1.0". */
  sovereign_version?: string;
}

/**
 * Factory function — creates the correct provider client for the given tier.
 *
 * This is the ONLY place in the platform where provider selection logic
 * lives. Products call this function; they never instantiate AnthropicClient
 * or GovCloudClient directly.
 *
 * Tier selection is intentionally strict:
 *   - "standard" without api_key_anthropic → throws immediately (misconfiguration)
 *   - "enhanced" without api_key_govcloud  → uses placeholder key (R7 open — expected)
 *   - Unknown tier → throws (future-proofing against new tier values)
 *
 * @param selector  - { tier } — which provider to select
 * @param config    - API keys and overrides
 * @param logger    - Optional ClientLogger (defaults to ConsoleClientLogger)
 * @param cache     - Optional FallbackCache (defaults to NullFallbackCache)
 * @returns         - The correct BaseSovereignClient subclass instance
 */
export function createSovereignClient(
  selector: ProviderSelector,
  config: SovereignClientConfig,
  logger: ClientLogger = new ConsoleClientLogger(),
  cache: FallbackCache = new NullFallbackCache()
): BaseSovereignClient {

  switch (selector.tier) {

    case "standard": {
      if (!config.api_key_anthropic) {
        throw new Error(
          "createSovereignClient: api_key_anthropic is required for tier 'standard'. " +
          "Inject the Anthropic API key at runtime via sovereign-shell or AgentOS orchestrator. " +
          "Never store API keys in code or config files."
        );
      }
      const anthropicConfig: AnthropicClientConfig = {
        ...defaultAnthropicConfig(config.api_key_anthropic),
        ...(config.model       && { model:             config.model       }),
        ...(config.timeout_ms  && { timeout_ms:        config.timeout_ms  }),
        ...(config.max_tokens  && { max_tokens:        config.max_tokens  }),
        ...(config.sovereign_version && { sovereign_version: config.sovereign_version }),
      };
      return new AnthropicClient(anthropicConfig, logger, cache);
    }

    case "enhanced": {
      // api_key_govcloud may be a placeholder until R7 is resolved.
      // GovCloudClient handles the unresolved state gracefully via
      // three-tier fallback — callers receive a static fallback response
      // rather than an error. This is correct behavior during development.
      const govcloudConfig: GovCloudClientConfig = {
        ...defaultGovCloudConfig(config.api_key_govcloud ?? "UNRESOLVED_PENDING_GOVCLOUD_DECISION"),
        ...(config.model       && { model:             config.model       }),
        ...(config.timeout_ms  && { timeout_ms:        config.timeout_ms  }),
        ...(config.max_tokens  && { max_tokens:        config.max_tokens  }),
        ...(config.sovereign_version && { sovereign_version: config.sovereign_version }),
      };
      return new GovCloudClient(govcloudConfig, logger, cache);
    }

    default: {
      // TypeScript exhaustiveness check — if a new SovereignTier value is
      // added to types.ts without updating this switch, this branch throws
      // at runtime and the TypeScript compiler flags it at build time.
      const _exhaustive: never = selector.tier;
      throw new Error(
        `createSovereignClient: unknown tier '${String(_exhaustive)}'. ` +
        "Valid values are 'standard' and 'enhanced'. " +
        "Add handling for new tiers before deploying."
      );
    }
  }
}

// ============================================================
// PACKAGE VERSION
// ============================================================

/** Package version — increment on every breaking change to public API. */
export const SOVEREIGN_API_CLIENT_VERSION = "1.0.0";

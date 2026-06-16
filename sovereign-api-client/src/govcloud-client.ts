/**
 * SOVEREIGN Platform — sovereign-api-client
 * govcloud-client.ts
 *
 * GovCloud LLM provider client for SOVEREIGN Platform.
 * Implements the BaseSovereignClient contract for Tier 2 (CUI/GovCloud)
 * deployments.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  GOVERNANCE NOTICE — READ BEFORE MODIFYING THIS FILE            ║
 * ║                                                                  ║
 * ║  The Tier 2 LLM provider endpoint is deliberately unresolved.   ║
 * ║  This is not a bug, a gap, or deferred work in the usual sense. ║
 * ║  It is a NAMED PLACEHOLDER that encodes a formal governance      ║
 * ║  decision made by the Project Principal on June 2, 2026:        ║
 * ║                                                                  ║
 * ║  "The sovereign-api-client will be built so that the Tier 2     ║
 * ║   (GovCloud/CUI) LLM provider is a configuration value,         ║
 * ║   not a code dependency."                                        ║
 * ║                                                                  ║
 * ║  When the Tier 2 provider decision is made (required before      ║
 * ║  Stage 5 per R7), the resolution is:                            ║
 * ║    1. Set GOVCLOUD_PROVIDER_ENDPOINT in sovereign_config.yaml    ║
 * ║    2. Set GOVCLOUD_PROVIDER_AUTH_HEADER in sovereign_config.yaml ║
 * ║    3. Update GOVCLOUD_PROVIDER_NAME to the selected provider     ║
 * ║    4. Update GOVCLOUD_MODEL_ID to the authorized model           ║
 * ║    5. Remove the NotYetResolvedException guard in callProvider() ║
 * ║    6. Update SBOM_Registry.md with the new provider entry        ║
 * ║                                                                  ║
 * ║  NO OTHER CODE CHANGES ARE REQUIRED. No product module rewrites. ║
 * ║  No shell changes. No Security Framework changes.                ║
 * ║  This is a configuration change, not a code change.             ║
 * ║                                                                  ║
 * ║  R7 — Tier 2 LLM Provider Decision — OPEN                       ║
 * ║  Required before: Stage 5                                        ║
 * ║  Tracked in: Integration Brief v1.3, Section 11                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Version: 1.0
 * Session: 2A — June 2, 2026
 * Authority: Project Principal · SOVEREIGN Platform Governance Authority
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
} from "./base-client";

// ============================================================
// THE NAMED PLACEHOLDER
// This constant is the governance record in code form.
// Its name is the specification. Do not rename it.
// ============================================================

/**
 * The Tier 2 LLM provider endpoint has not yet been selected.
 *
 * Decision owner: Project Principal
 * Required before: Stage 5 (R7)
 * Options under evaluation (FedRAMP Infrastructure Strategy, Section 2):
 *   - Self-hosted open-source model on government-controlled infrastructure
 *   - FedRAMP-authorized LLM provider (availability to be confirmed)
 *   - Government-provided inference endpoint (agency-specific arrangement)
 *
 * When this decision is made, replace this constant with the selected
 * endpoint URL and remove the NotYetResolvedException guard below.
 */
export const GOVCLOUD_PROVIDER_ENDPOINT = "UNRESOLVED_PENDING_GOVCLOUD_DECISION";

/**
 * Auth header name for the GovCloud provider.
 * Placeholder — set to the correct header name when the provider is selected.
 * Common values: "Authorization" (Bearer token), "x-api-key", "api-key"
 */
export const GOVCLOUD_AUTH_HEADER_NAME = "UNRESOLVED_PENDING_GOVCLOUD_DECISION";

/**
 * Provider name for metadata and logging.
 * Replace with the selected provider name when R7 is resolved.
 */
export const GOVCLOUD_PROVIDER_NAME = "govcloud-unresolved";

/**
 * Model identifier for the GovCloud provider.
 * Replace with the authorized model ID when R7 is resolved.
 */
export const GOVCLOUD_MODEL_ID = "UNRESOLVED_PENDING_GOVCLOUD_DECISION";

// ============================================================
// ERROR TYPE
// ============================================================

/**
 * Thrown when a GovCloudClient method that requires a resolved provider
 * is called before R7 is resolved.
 *
 * This is the runtime enforcement of the governance placeholder.
 * If this error appears in logs during development, it means a product
 * is routing "enhanced" tier requests correctly — the placeholder is
 * working as designed.
 *
 * If this error appears in staging or production, R7 has not been
 * resolved before Stage 5 as required. That is a governance violation.
 */
export class GovCloudNotYetResolvedException extends Error {
  constructor(workflow_step_id: string, product: string) {
    super(
      `GovCloudClient: Tier 2 LLM provider is not yet resolved (R7 — OPEN). ` +
      `No CUI data may be processed until the GovCloud provider decision is made ` +
      `and GOVCLOUD_PROVIDER_ENDPOINT is configured. ` +
      `workflow_step_id: ${workflow_step_id}, product: ${product}. ` +
      `See Integration Brief v1.3 Section 11 (R7) and govcloud-client.ts governance notice.`
    );
    this.name = "GovCloudNotYetResolvedException";
  }
}

// ============================================================
// CONFIG
// ============================================================

export interface GovCloudClientConfig extends BaseClientConfig {
  /**
   * GovCloud provider API key or bearer token.
   * Injected at runtime — never stored in code or config files.
   * Placeholder: will be set when R7 (Tier 2 provider) is resolved.
   */
  api_key: string;

  /**
   * GovCloud provider endpoint URL.
   * Defaults to GOVCLOUD_PROVIDER_ENDPOINT (the named placeholder).
   * Set to the real endpoint in sovereign_config.yaml when R7 is resolved.
   */
  endpoint?: string;

  /**
   * Auth header name for this provider.
   * Defaults to GOVCLOUD_AUTH_HEADER_NAME (the named placeholder).
   * Set to the real header name when R7 is resolved.
   */
  auth_header_name?: string;
}

// ============================================================
// CLIENT
// ============================================================

/**
 * GovCloud LLM provider client for SOVEREIGN Platform.
 *
 * Handles Tier 2 ("enhanced") requests — CUI and FedRAMP-boundary data.
 * The Anthropic commercial API must never handle these requests.
 *
 * Current state: STUB WITH GOVERNED PLACEHOLDER.
 * callProvider() throws GovCloudNotYetResolvedException until R7 is resolved.
 * The three-tier fallback in BaseSovereignClient catches this and serves
 * the static fallback response — so callers remain functional and can
 * test the routing path without a live provider.
 *
 * Interface is IDENTICAL to AnthropicClient by design. When R7 is resolved,
 * index.ts selects this client for "enhanced" tier — no call-site changes.
 *
 * Tier enforcement (mirror image of AnthropicClient):
 *   - AnthropicClient: accepts "standard", rejects "enhanced"
 *   - GovCloudClient:  accepts "enhanced", rejects "standard"
 *
 * Products must never select their own provider client. Provider selection
 * is handled by createSovereignClient() in index.ts based on context.tier.
 */
export class GovCloudClient extends BaseSovereignClient {
  private readonly api_key: string;
  private readonly endpoint: string;
  private readonly auth_header_name: string;

  constructor(
    config: GovCloudClientConfig,
    logger: ClientLogger = new ConsoleClientLogger(),
    cache: FallbackCache = new NullFallbackCache()
  ) {
    super(
      {
        provider: GOVCLOUD_PROVIDER_NAME,
        model: config.model ?? GOVCLOUD_MODEL_ID,
        timeout_ms: config.timeout_ms ?? 30_000,
        max_tokens: config.max_tokens ?? 1_000,
        sovereign_version: config.sovereign_version ?? "1.0",
      },
      logger,
      cache
    );
    this.api_key = config.api_key;
    this.endpoint = config.endpoint ?? GOVCLOUD_PROVIDER_ENDPOINT;
    this.auth_header_name = config.auth_header_name ?? GOVCLOUD_AUTH_HEADER_NAME;
  }

  // ----------------------------------------------------------
  // TIER GUARD
  // ----------------------------------------------------------

  /**
   * Override complete() to enforce Tier 2 scope.
   *
   * GovCloudClient handles CUI data only. Standard (Tier 1) requests
   * must route through AnthropicClient. Accepting standard-tier requests
   * here would mean CUI-authorized infrastructure is processing
   * non-CUI data — a compliance boundary violation in the other direction.
   */
  async complete(
    messages: SovereignMessage[],
    context: SovereignRequestContext
  ): Promise<SovereignLLMResponse> {
    if (context.tier === "standard") {
      throw new Error(
        `GovCloudClient handles Tier 2 (enhanced/CUI) requests only. ` +
        `Standard tier requests must route through AnthropicClient. ` +
        `workflow_step_id: ${context.workflow_step_id}, product: ${context.product}`
      );
    }
    return super.complete(messages, context);
  }

  // ----------------------------------------------------------
  // BASE CLASS IMPLEMENTATION
  // ----------------------------------------------------------

  /**
   * Builds GovCloud provider auth headers.
   *
   * Header name and key are both placeholders until R7 is resolved.
   * Structure is correct — filling in real values requires no code change.
   */
  protected buildHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      [this.auth_header_name]: this.api_key,
      "x-sovereign-tier": "enhanced",
      "x-sovereign-product": "SOVEREIGN",
    };
  }

  /**
   * GovCloud provider call.
   *
   * CURRENT STATE: Throws GovCloudNotYetResolvedException.
   * BaseSovereignClient.complete() catches this and activates the
   * three-tier fallback (cache → static), so callers remain functional.
   *
   * WHEN R7 IS RESOLVED:
   *   1. Replace the throw with the real provider HTTP call
   *   2. Translate SovereignMessages to the provider's wire format
   *   3. Parse the provider's response to { content, usage }
   *   4. Remove this governance notice block
   *   5. Update SBOM_Registry.md
   *
   * The method signature must not change. Return type must not change.
   * All provider-specific translation stays inside this method.
   */
  protected async callProvider(
    _messages: SovereignMessage[],
    _headers: Record<string, string>
  ): Promise<{ content: string; usage?: { input_tokens: number; output_tokens: number } }> {

    // ── PLACEHOLDER GUARD ──────────────────────────────────────────
    // This check validates that the placeholder has been resolved
    // before any real call is attempted. It is the runtime equivalent
    // of the governance notice at the top of this file.
    //
    // Do NOT remove this guard without also replacing the callProvider
    // body with a real provider implementation. Removing the guard
    // while leaving GOVCLOUD_PROVIDER_ENDPOINT as the placeholder
    // would silently route CUI requests to an invalid endpoint.
    // ──────────────────────────────────────────────────────────────
    if (this.endpoint === GOVCLOUD_PROVIDER_ENDPOINT) {
      throw new GovCloudNotYetResolvedException(
        "UNKNOWN — context not available in callProvider",
        "UNKNOWN"
      );
    }

    // ── REAL PROVIDER IMPLEMENTATION GOES HERE ────────────────────
    // When R7 is resolved, implement the HTTP call to the selected
    // GovCloud provider here. Follow the same pattern as
    // AnthropicClient.callProvider():
    //
    //   const raw = await fetch(this.endpoint, {
    //     method: "POST",
    //     headers,
    //     body: JSON.stringify(this._translateMessages(_messages)),
    //   });
    //   if (!raw.ok) { throw new ProviderAPIError(...); }
    //   return this._parseResponse(await raw.text());
    //
    // The translation and parsing methods will be provider-specific.
    // Add them as private methods on this class, not on BaseSovereignClient.
    // ──────────────────────────────────────────────────────────────

    throw new GovCloudNotYetResolvedException("unknown", "unknown");
  }
}

// ============================================================
// DEFAULT CONFIG FACTORY
// ============================================================

/**
 * Returns the default GovCloudClient configuration.
 * Endpoint and auth header name are placeholders until R7 is resolved.
 *
 * When R7 is resolved, update sovereign_config.yaml with the real
 * endpoint and auth header name. This factory will read them from config.
 * No call-site changes required in any product.
 */
export function defaultGovCloudConfig(api_key: string): GovCloudClientConfig {
  return {
    provider: GOVCLOUD_PROVIDER_NAME,
    api_key,
    model: GOVCLOUD_MODEL_ID,
    endpoint: GOVCLOUD_PROVIDER_ENDPOINT,
    auth_header_name: GOVCLOUD_AUTH_HEADER_NAME,
    timeout_ms: 30_000,
    max_tokens: 1_000,
    sovereign_version: "1.0",
  };
}

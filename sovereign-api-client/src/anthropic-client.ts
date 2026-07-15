/**
 * SOVEREIGN Platform — sovereign-api-client
 * anthropic-client.ts
 *
 * Anthropic API provider client for SOVEREIGN Platform.
 * Implements the BaseSovereignClient contract for Tier 1 (Commercial)
 * deployments using the Anthropic Messages API.
 *
 * SCOPE: Tier 1 (standard) only.
 * The Anthropic commercial API (api.anthropic.com) is NOT authorized
 * for CUI or classified data. It must never be used for SovereignTier
 * "enhanced" requests. This file enforces that boundary at runtime.
 *
 * Standing development constraint (Integration Brief v1.3, Section 6):
 *   "No product calls an LLM provider API directly — all LLM calls go
 *    through sovereign-api-client."
 *
 * API: Anthropic Messages API v1
 * Model: claude-sonnet-4-20250514 (SBOM_Registry.md — Anthropic API entry)
 * Auth: x-api-key header — key injected at runtime, never stored in code
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
// CONSTANTS
// ============================================================

/** Anthropic API endpoint. Tier 1 only — not in GovCloud boundary. */
export const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

/** Anthropic API version header value. */
export const ANTHROPIC_API_VERSION = "2023-06-01";

/**
 * Default model for all SOVEREIGN AI-dependent products.
 * Source: SBOM_Registry.md — External API Services table.
 * Change requires SBOM update and governance decision.
 */
export const SOVEREIGN_DEFAULT_MODEL = "claude-sonnet-4-20250514";

// ============================================================
// CONFIG
// ============================================================

export interface AnthropicClientConfig extends BaseClientConfig {
  /**
   * Anthropic API key.
   * Injected at runtime by sovereign-shell (cloud) or AgentOS orchestrator
   * (local). Never stored in code, config files, or prompt files.
   * Source: Agent Identity Standard — Credential Lifecycle section.
   */
  api_key: string;
}

// ============================================================
// WIRE TYPES
// ============================================================
// These are the raw Anthropic API request/response shapes.
// They are intentionally kept internal to this file — callers
// use SovereignMessage and SovereignLLMResponse only.

interface AnthropicWireMessage {
  role: "user" | "assistant";
  content: string;
}

interface AnthropicRequest {
  model: string;
  max_tokens: number;
  system?: string;
  messages: AnthropicWireMessage[];
}

interface AnthropicContentBlock {
  type: "text";
  text: string;
}

interface AnthropicUsage {
  input_tokens: number;
  output_tokens: number;
}

interface AnthropicResponse {
  id: string;
  type: "message";
  role: "assistant";
  content: AnthropicContentBlock[];
  model: string;
  stop_reason: string;
  usage: AnthropicUsage;
}

interface AnthropicErrorResponse {
  type: "error";
  error: {
    type: string;
    message: string;
  };
}

// ============================================================
// ERROR TYPES
// ============================================================

/**
 * Thrown when the Anthropic API returns a non-2xx response.
 * BaseSovereignClient catches this and activates the cache fallback.
 */
export class AnthropicAPIError extends Error {
  constructor(
    public readonly status: number,
    public readonly error_type: string,
    message: string
  ) {
    super(`Anthropic API error ${status} (${error_type}): ${message}`);
    this.name = "AnthropicAPIError";
  }
}

/**
 * Thrown when the response body cannot be parsed as valid JSON
 * or does not match the expected AnthropicResponse shape.
 */
export class AnthropicParseError extends Error {
  constructor(message: string, public readonly raw: string) {
    super(`Anthropic response parse error: ${message}`);
    this.name = "AnthropicParseError";
  }
}

// ============================================================
// CLIENT
// ============================================================

/**
 * Anthropic API client for SOVEREIGN Platform.
 *
 * Inherits from BaseSovereignClient:
 *   - Three-tier fallback (live → cached → static)
 *   - SOVEREIGN metadata injection on every response
 *   - Timeout enforcement
 *   - FALLBACK_ACTIVATED Logger events
 *
 * This class adds:
 *   - x-api-key and anthropic-version header injection
 *   - SovereignMessage → Anthropic wire format translation
 *   - Anthropic response → SovereignLLMResponse unwrapping
 *   - Tier 1 enforcement (rejects "enhanced" tier requests)
 *
 * Usage (from a product agent — never call fetch directly):
 *
 *   const client = new AnthropicClient(
 *     { api_key: process.env.ANTHROPIC_API_KEY, ...defaults },
 *     shell.logger,
 *     cache
 *   );
 *   const response = await client.complete(messages, context);
 *   if (response.fallback_activated) {
 *     // gate before taking consequential action
 *   }
 */
export class AnthropicClient extends BaseSovereignClient {
  private readonly api_key: string;

  constructor(
    config: AnthropicClientConfig,
    logger: ClientLogger = new ConsoleClientLogger(),
    cache: FallbackCache = new NullFallbackCache()
  ) {
    super(
      {
        provider: "anthropic",
        model: config.model ?? SOVEREIGN_DEFAULT_MODEL,
        timeout_ms: config.timeout_ms ?? 30_000,
        max_tokens: config.max_tokens ?? 1_000,
        sovereign_version: config.sovereign_version ?? "1.0",
      },
      logger,
      cache
    );
    this.api_key = config.api_key;
  }

  // ----------------------------------------------------------
  // TIER GUARD
  // ----------------------------------------------------------

  /**
   * Override complete() to enforce Tier 1 scope before delegating
   * to the base class.
   *
   * The Anthropic commercial API is NOT authorized for CUI data.
   * Any request with tier "enhanced" must be rejected at this layer —
   * not allowed to reach the live provider call.
   *
   * FedRAMP Infrastructure Strategy, Section 2 (Tier 2):
   *   "the commercial Anthropic API (api.anthropic.com) is not in the
   *    GovCloud boundary and cannot be used for CUI data processing."
   */
  async complete(
    messages: SovereignMessage[],
    context: SovereignRequestContext
  ): Promise<SovereignLLMResponse> {
    if (context.tier === "enhanced") {
      throw new Error(
        `AnthropicClient is Tier 1 only. ` +
        `Tier "enhanced" (GovCloud/CUI) requests must route through GovCloudClient. ` +
        `workflow_step_id: ${context.workflow_step_id}, product: ${context.product}`
      );
    }
    return super.complete(messages, context);
  }

  // ----------------------------------------------------------
  // BASE CLASS IMPLEMENTATION
  // ----------------------------------------------------------

  /**
   * Builds Anthropic-specific auth headers.
   * The API key is never logged — only its presence is confirmed.
   */
  protected buildHeaders(): Record<string, string> {
    // SOVEREIGN_CLIENT_DEBUG=1 — temporary diagnostic gate (Session 36).
    // Remove after live-call failure is diagnosed.
    if (process.env["SOVEREIGN_CLIENT_DEBUG"]) {
      console.log(
        "[SOVEREIGN DEBUG] buildHeaders: api_key=" +
          (this.api_key ? `present (length: ${this.api_key.length})` : "MISSING") +
          ` max_tokens=${this.max_tokens} timeout_ms=${this.timeout_ms}`
      );
    }
    return {
      "Content-Type": "application/json",
      "x-api-key": this.api_key,
      "anthropic-version": ANTHROPIC_API_VERSION,
    };
  }

  /**
   * Translates SovereignMessages to Anthropic wire format and calls
   * the Messages API. Extracts text content and usage from the response.
   *
   * System messages are extracted and sent as the Anthropic `system`
   * parameter (not as a message in the messages array), which is the
   * correct Anthropic API pattern.
   */
  protected async callProvider(
    messages: SovereignMessage[],
    headers: Record<string, string>
  ): Promise<{ content: string; usage: { input_tokens: number; output_tokens: number } }> {

    const { system, wire_messages } = this._translateMessages(messages);
    const body: AnthropicRequest = {
      model: this.model,
      max_tokens: this.max_tokens,
      messages: wire_messages,
    };
    if (system) {
      body.system = system;
    }

    // SOVEREIGN_CLIENT_DEBUG=1 — temporary (Session 36).
    if (process.env["SOVEREIGN_CLIENT_DEBUG"]) {
      console.log(
        `[SOVEREIGN DEBUG] callProvider: about to fetch ${ANTHROPIC_API_URL}` +
          ` model=${body.model} max_tokens=${body.max_tokens}` +
          ` wire_messages=${wire_messages.length} has_system=${!!system}`
      );
    }

    const raw = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!raw.ok) {
      const errorText = await raw.text();
      // SOVEREIGN_CLIENT_DEBUG=1 — temporary (Session 36).
      if (process.env["SOVEREIGN_CLIENT_DEBUG"]) {
        console.log(
          `[SOVEREIGN DEBUG] callProvider non-ok: status=${raw.status}` +
            ` body_preview=${errorText.slice(0, 300)}`
        );
      }
      let errorType = "unknown_error";
      let errorMessage = errorText;
      try {
        const parsed = JSON.parse(errorText) as AnthropicErrorResponse;
        errorType = parsed.error?.type ?? "unknown_error";
        errorMessage = parsed.error?.message ?? errorText;
      } catch {
        // raw error text is not JSON — use as-is
      }
      throw new AnthropicAPIError(raw.status, errorType, errorMessage);
    }

    const responseText = await raw.text();
    // SOVEREIGN_CLIENT_DEBUG=1 — temporary (Session 36).
    if (process.env["SOVEREIGN_CLIENT_DEBUG"]) {
      console.log(
        `[SOVEREIGN DEBUG] callProvider ok: status=${raw.status}` +
          ` body_length=${responseText.length}` +
          ` body_preview=${responseText.slice(0, 120)}`
      );
    }
    return this._parseResponse(responseText);
  }

  // ----------------------------------------------------------
  // PRIVATE HELPERS
  // ----------------------------------------------------------

  /**
   * Translates SovereignMessages to Anthropic wire format.
   * Separates system messages from the conversation turns.
   *
   * Anthropic requires:
   *   - System content as a top-level `system` string, not in messages[]
   *   - Messages alternate user/assistant (no consecutive same-role)
   *   - First message must be role "user"
   */
  private _translateMessages(messages: SovereignMessage[]): {
    system: string | undefined;
    wire_messages: AnthropicWireMessage[];
  } {
    const system_parts: string[] = [];
    const wire_messages: AnthropicWireMessage[] = [];

    for (const msg of messages) {
      if (msg.role === "system") {
        system_parts.push(msg.content);
      } else {
        wire_messages.push({ role: msg.role, content: msg.content });
      }
    }

    return {
      system: system_parts.length > 0 ? system_parts.join("\n\n") : undefined,
      wire_messages,
    };
  }

  /**
   * Parses the raw Anthropic API response text into content and usage.
   * Throws AnthropicParseError if the response is malformed.
   */
  private _parseResponse(
    responseText: string
  ): { content: string; usage: { input_tokens: number; output_tokens: number } } {
    let parsed: AnthropicResponse;
    try {
      parsed = JSON.parse(responseText) as AnthropicResponse;
    } catch {
      throw new AnthropicParseError("Response is not valid JSON", responseText);
    }

    if (!parsed.content || !Array.isArray(parsed.content) || parsed.content.length === 0) {
      throw new AnthropicParseError(
        "Response content array is missing or empty",
        responseText
      );
    }

    const text_blocks = parsed.content.filter(
      (b): b is AnthropicContentBlock => b.type === "text"
    );

    if (text_blocks.length === 0) {
      throw new AnthropicParseError(
        "No text content blocks in response",
        responseText
      );
    }

    const content = text_blocks.map((b) => b.text).join("");

    return {
      content,
      usage: {
        input_tokens: parsed.usage?.input_tokens ?? 0,
        output_tokens: parsed.usage?.output_tokens ?? 0,
      },
    };
  }
}

// ============================================================
// DEFAULT CONFIG FACTORY
// ============================================================

/**
 * Returns the default AnthropicClient configuration for SOVEREIGN.
 * API key must be supplied by the caller — never defaulted.
 *
 * All AI-dependent products use these defaults unless overridden
 * by product-specific configuration in sovereign_config.yaml.
 */
export function defaultAnthropicConfig(api_key: string): AnthropicClientConfig {
  return {
    provider: "anthropic",
    api_key,
    model: SOVEREIGN_DEFAULT_MODEL,
    timeout_ms: 30_000,
    max_tokens: 1_000,
    sovereign_version: "1.0",
  };
}

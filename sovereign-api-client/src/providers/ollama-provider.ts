/**
 * SOVEREIGN Platform — sovereign-api-client
 * providers/ollama-provider.ts — the Local LLM (Ollama) provider adapter (Provider B).
 *
 * Uses the OpenAI-compatible REST API Ollama exposes (POST `${endpoint}/v1/chat/completions`).
 * Returns the standard SovereignLLMResponse so callers never see a provider-specific
 * shape. On any connection/parse failure it throws OllamaUnavailableError, which the
 * routing layer catches to fall back to Anthropic (Tier 2).
 *
 * NO LIVE CONNECTION THIS SESSION (autonomous rule + Governance Clock OFF). The HTTP call
 * is made through an INJECTED `fetchImpl`. If none is injected, the provider throws
 * OllamaUnavailableError without touching the network — so the running platform (where
 * Ollama is disabled by default) never opens a connection, and tests drive a fake fetch.
 *
 * Version: 1.0 · Session 13 · June 24, 2026
 */

import type { SovereignMessage, SovereignRequestContext, SovereignLLMResponse } from "../base-client";

/** Thrown when the Ollama runtime is unreachable or returns an unusable response. */
export class OllamaUnavailableError extends Error {
  constructor(public readonly endpoint: string, public readonly detail?: string) {
    super(`Ollama provider unavailable at ${endpoint}${detail ? `: ${detail}` : ""}`);
    this.name = "OllamaUnavailableError";
  }
}

/** Minimal fetch signature the adapter needs (injected; never the global fetch this session). */
export type FetchImpl = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string }
) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

export interface OllamaProviderConfig {
  endpoint: string;
  modelId: string;
  sovereignVersion?: string;
  /** Injected HTTP impl. Absent → the provider throws OllamaUnavailableError (no live call). */
  fetchImpl?: FetchImpl;
}

export class OllamaProvider {
  constructor(private readonly config: OllamaProviderConfig) {}

  async complete(messages: SovereignMessage[], context: SovereignRequestContext): Promise<SovereignLLMResponse> {
    const { endpoint, modelId, fetchImpl } = this.config;

    // No injected fetch → do not touch the network (no live connection this session).
    if (!fetchImpl) {
      throw new OllamaUnavailableError(endpoint, "no fetch implementation injected (live connection disabled)");
    }

    let res: Awaited<ReturnType<FetchImpl>>;
    try {
      res = await fetchImpl(`${endpoint}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelId, messages: messages.map((m) => ({ role: m.role, content: m.content })) }),
      });
    } catch (err) {
      throw new OllamaUnavailableError(endpoint, err instanceof Error ? err.message : String(err));
    }

    if (!res.ok) {
      throw new OllamaUnavailableError(endpoint, `HTTP ${res.status}`);
    }

    let body: unknown;
    try {
      body = await res.json();
    } catch (err) {
      throw new OllamaUnavailableError(endpoint, `unparseable response: ${err instanceof Error ? err.message : String(err)}`);
    }

    const content = extractContent(body);
    if (content === null) {
      throw new OllamaUnavailableError(endpoint, "response missing message content");
    }

    return {
      content,
      fallback_tier: "live",
      fallback_activated: false,
      sovereign_metadata: {
        sovereign_product: context.product,
        sovereign_version: this.config.sovereignVersion ?? "1.0",
        workflow_step_id: context.workflow_step_id,
        agent_id: context.agent_id,
        provider: "ollama",
        provider_model: modelId,
        tier: context.tier,
        responded_at: new Date().toISOString(),
      },
    };
  }
}

/** Pull the assistant message content from an OpenAI-compatible chat completion. */
function extractContent(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null;
  const choices = (body as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const message = (choices[0] as { message?: { content?: unknown } }).message;
  const content = message?.content;
  return typeof content === "string" && content.trim() !== "" ? content : null;
}

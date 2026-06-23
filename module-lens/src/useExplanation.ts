/**
 * SOVEREIGN Platform — module-lens
 * useExplanation.ts — the LENS Governance Explainer hook.
 *
 * Owns the single explanation LLM call (via createSovereignClient — never the
 * Anthropic API directly, Standing Constraint #5) and all Logger emission for the
 * explainer. Wraps the pure explanation-engine.ts three-tier orchestration with the
 * real api-client and a per-session cache. One createSovereignClient().complete per
 * question — no chained calls (spec §2.1: one createSovereignClient() per question).
 *
 * Grounding: lens-explainer is grounded EXCLUSIVELY in the two LENS knowledge-base
 * source documents (spec §2.1 / §6). Both are supplied as context on every call.
 *
 * Logger taxonomy — APPROVED EVENT TYPES ONLY (spec §2.1 — no LENS_* invented):
 *   - AGENT_STEP_START / AGENT_STEP_COMPLETE bracket the lens-explainer step
 *     (Analytical agent; agent_id + agent_class carried).
 *   - FALLBACK_ACTIVATED when a non-live tier serves the explanation.
 * Every event carries workflow_step_id `lens-explain-<n>` (Standing Constraint #6).
 * No HUMAN_DECISION — the explainer gates no human action (spec §2.1).
 *
 * CPMI-VRS Gate 2: a failed Logger emit surfaces an error and does NOT continue.
 *
 * Version: 1.0 · Session 8 · June 22, 2026
 */

import { useCallback, useRef, useState } from "react";

import { createSovereignClient } from "@sovereign/api-client";
import type { SovereignRequestContext } from "@sovereign/api-client";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  PR_LENS_001,
  type ExplanationInput,
  type LensExplanation,
} from "./lens-contract";
import {
  runExplanation,
  type ExplanationDeps,
  type ExplanationOutcome,
} from "./explanation-engine";
import { LENS_SOURCE_DOCUMENTS } from "./source-documents";
import { EXPLAINER_SYSTEM_PROMPT, EXPLAINER_PROMPT_VERSION } from "./prompts/explainer-system.prompt";
import { readAnthropicKey } from "./anthropic-key";

const LENS_EXPLAINER = "lens-explainer";

export type ExplanationStatus = "idle" | "running" | "produced" | "error";

export interface UseExplanation {
  status: ExplanationStatus;
  /** The produced explanation (advisory) with its serving tier, or null. */
  outcome: ExplanationOutcome | null;
  error: string | null;
  /** Ask lens-explainer a plain-language question about the platform. */
  ask: (question: string) => Promise<void>;
  reset: () => void;
}

export function useExplanation(ctx: SovereignShellContext): UseExplanation {
  const userId = ctx.auth.user.employee_id;

  const [status, setStatus] = useState<ExplanationStatus>("idle");
  const [outcome, setOutcome] = useState<ExplanationOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, LensExplanation>>(new Map());
  const seqRef = useRef(0);

  const ask = useCallback(
    async (question: string): Promise<void> => {
      setError(null);
      setOutcome(null);

      const trimmed = question.trim();
      if (trimmed === "") {
        setError("Enter a question for the Governance Explainer.");
        setStatus("error");
        return;
      }

      setStatus("running");
      const workflowStep = `lens-explain-${++seqRef.current}`;

      const input: ExplanationInput = {
        question: trimmed,
        // Both source documents are always supplied (spec §2.1) — the only grounding.
        sourceDocuments: LENS_SOURCE_DOCUMENTS.map((d) => ({
          id: d.id,
          title: d.title,
          content: d.groundingText,
        })),
        userContext: {
          role: ctx.auth.user.role,
          surface: ctx.navigation.currentPath,
        },
      };

      const requestContext: SovereignRequestContext = {
        workflow_step_id: workflowStep,
        product: "LENS",
        agent_id: LENS_EXPLAINER,
        tier: "standard",
      };

      // --- Gate 2: AGENT_STEP_START. A failed emit aborts. ---
      try {
        ctx.logger.log({
          event_type: "AGENT_STEP_START",
          workflow_step_id: workflowStep,
          sovereign_tier: "standard",
          product: "LENS",
          actor_id: userId,
          agent_id: LENS_EXPLAINER,
          agent_class: "Analytical",
          outcome: "explanation_started",
          payload: {
            registry_id: PR_LENS_001.registryId,
            prompt_version: EXPLAINER_PROMPT_VERSION,
            source_documents: LENS_SOURCE_DOCUMENTS.map((d) => d.id),
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      const deps: ExplanationDeps = {
        complete: async (messages, reqCtx) => {
          const client = createSovereignClient(
            { tier: "standard" },
            { api_key_anthropic: readAnthropicKey() }
          );
          return client.complete(messages, reqCtx);
        },
        cacheGet: (key) => cacheRef.current.get(key) ?? null,
        cacheSet: (key, value) => {
          cacheRef.current.set(key, value);
        },
      };

      const result = await runExplanation(input, EXPLAINER_SYSTEM_PROMPT, requestContext, deps);
      const fellBack = result.tier !== "live";

      // --- Gate 2: FALLBACK_ACTIVATED (if degraded) + AGENT_STEP_COMPLETE ---
      try {
        if (fellBack) {
          ctx.logger.log({
            event_type: "FALLBACK_ACTIVATED",
            workflow_step_id: workflowStep,
            sovereign_tier: "standard",
            product: "LENS",
            actor_id: userId,
            agent_id: LENS_EXPLAINER,
            outcome: `explanation_${result.tier}_tier_served`,
            payload: { tier: result.tier, reason: result.detail ?? "live_unavailable" },
          });
        }
        ctx.logger.log({
          event_type: "AGENT_STEP_COMPLETE",
          workflow_step_id: workflowStep,
          sovereign_tier: "standard",
          product: "LENS",
          actor_id: userId,
          agent_id: LENS_EXPLAINER,
          agent_class: "Analytical",
          outcome: `explanation_${result.tier}`,
          payload: {
            registry_id: PR_LENS_001.registryId,
            prompt_version: EXPLAINER_PROMPT_VERSION,
            tier: result.tier,
            fallback_activated: fellBack,
            confidence: result.explanation.confidence,
            source_count: result.explanation.sources.length,
            gap_count: result.explanation.gaps.length,
            detail: result.detail,
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      setOutcome(result);
      setStatus("produced");

      function surfaceLoggerError(err: unknown): void {
        setError(
          `Logger emission failed — explanation halted (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        setStatus("error");
      }
    },
    [ctx, userId]
  );

  const reset = useCallback((): void => {
    setStatus("idle");
    setOutcome(null);
    setError(null);
  }, []);

  return { status, outcome, error, ask, reset };
}

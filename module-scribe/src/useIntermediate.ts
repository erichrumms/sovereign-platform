/**
 * SOVEREIGN Platform — module-scribe
 * useIntermediate.ts — the SCRIBE intermediate-mode hook (synthesis / framing).
 *
 * Owns the single LLM call per intermediate pass (via createSovereignClient — never the
 * Anthropic API directly, Standing Constraint #5) and all Logger emission. Wraps the
 * pure three-tier orchestration in intermediate-engine.ts with the real api-client, a
 * per-session cache, and ctx.logger. One createSovereignClient().complete per run.
 *
 * NO product-schema validation and NO Export gate (D2 done condition): the result is
 * intermediate prose the human carries forward, not a product payload.
 *
 * Logger taxonomy — APPROVED EVENT TYPES ONLY (no invented SCRIBE_* types):
 *   - AGENT_STEP_START / AGENT_STEP_COMPLETE bracket the scribe-drafter step
 *     (Operational; running under PR-SCRIBE-001, which scopes these modes).
 *   - FALLBACK_ACTIVATED when a non-live tier serves the prose.
 * Every event carries workflow_step_id (Standing Constraint #6).
 *
 * CPMI-VRS Gate 2: a failed Logger emit surfaces an error and does NOT continue.
 *
 * Version: 1.0 · Session 8 · June 22, 2026
 */

import { useCallback, useRef, useState } from "react";

import { createSovereignClient } from "@sovereign/api-client";
import type { SovereignRequestContext } from "@sovereign/api-client";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { PR_SCRIBE_001_INTERMEDIATE, type IntermediateInput } from "./intermediate-contract";
import {
  runIntermediate,
  intermediateWorkflowStepId,
  type IntermediateDeps,
  type IntermediateOutcome,
} from "./intermediate-engine";
import { DRAFTING_SYSTEM_PROMPT, DRAFTING_PROMPT_VERSION } from "./prompts/drafting-system.prompt";
import { readAnthropicKey } from "./anthropic-key";

const SCRIBE_DRAFTER = "scribe-drafter";

export type IntermediateStatus = "idle" | "running" | "done" | "error";

export interface UseIntermediate {
  status: IntermediateStatus;
  outcome: IntermediateOutcome | null;
  error: string | null;
  run: (input: IntermediateInput) => Promise<void>;
  reset: () => void;
}

export function useIntermediate(ctx: SovereignShellContext): UseIntermediate {
  const [status, setStatus] = useState<IntermediateStatus>("idle");
  const [outcome, setOutcome] = useState<IntermediateOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());

  const run = useCallback(
    async (input: IntermediateInput): Promise<void> => {
      setStatus("running");
      setError(null);
      setOutcome(null);

      const wsid = intermediateWorkflowStepId(input);
      const actorId = ctx.auth.user.employee_id;

      const requestContext: SovereignRequestContext = {
        workflow_step_id: wsid,
        product: "SCRIBE",
        agent_id: SCRIBE_DRAFTER,
        tier: "standard",
      };

      // --- Gate 2: AGENT_STEP_START. A failed emit aborts. ---
      try {
        ctx.logger.log({
          event_type: "AGENT_STEP_START",
          workflow_step_id: wsid,
          sovereign_tier: "standard",
          product: "SCRIBE",
          actor_id: actorId,
          agent_id: SCRIBE_DRAFTER,
          agent_class: "Operational",
          outcome: "intermediate_started",
          payload: {
            registry_id: PR_SCRIBE_001_INTERMEDIATE.registryId,
            prompt_version: DRAFTING_PROMPT_VERSION,
            mode: input.mode,
            input_modality: "typed",
            style_profile_present: input.styleProfile !== undefined,
            source_workflow_step: input.context?.workflowStepId ?? null,
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      const deps: IntermediateDeps = {
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

      const result = await runIntermediate(input, DRAFTING_SYSTEM_PROMPT, requestContext, deps);
      const fellBack = result.tier !== "live";

      // --- Gate 2: FALLBACK_ACTIVATED (if degraded) + AGENT_STEP_COMPLETE ---
      try {
        if (fellBack) {
          ctx.logger.log({
            event_type: "FALLBACK_ACTIVATED",
            workflow_step_id: wsid,
            sovereign_tier: "standard",
            product: "SCRIBE",
            actor_id: actorId,
            agent_id: SCRIBE_DRAFTER,
            outcome: `intermediate_${result.tier}_tier_served`,
            payload: { mode: input.mode, tier: result.tier, reason: result.detail ?? "live_unavailable" },
          });
        }
        ctx.logger.log({
          event_type: "AGENT_STEP_COMPLETE",
          workflow_step_id: wsid,
          sovereign_tier: "standard",
          product: "SCRIBE",
          actor_id: actorId,
          agent_id: SCRIBE_DRAFTER,
          agent_class: "Operational",
          outcome: `intermediate_${result.tier}`,
          payload: {
            registry_id: PR_SCRIBE_001_INTERMEDIATE.registryId,
            prompt_version: DRAFTING_PROMPT_VERSION,
            mode: input.mode,
            tier: result.tier,
            fallback_activated: fellBack,
            // No product schema for intermediate prose — record only that prose was produced.
            produces_product_intake: false,
            detail: result.detail,
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      setOutcome(result);
      setStatus("done");

      function surfaceLoggerError(err: unknown): void {
        setError(
          `Logger emission failed — intermediate pass halted (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        setStatus("error");
      }
    },
    [ctx]
  );

  const reset = useCallback((): void => {
    setStatus("idle");
    setOutcome(null);
    setError(null);
  }, []);

  return { status, outcome, error, run, reset };
}

/**
 * SOVEREIGN Platform — module-nexus
 * usePPBECoordinationTracking.ts — Logger-wired hook for the ppbe-coordination-assistant.
 *
 * GD-35 (F5, Session 88): wires ctx.logger into the PPBE Coordination Tracking call
 * site, which previously called createSovereignClient() directly and discarded ctx.
 * Advisory framing unchanged — output is non-binding, closing items still requires the
 * human-authorized close path.
 *
 * Logger taxonomy — APPROVED EVENT TYPES ONLY:
 *   - AGENT_STEP_START / AGENT_STEP_COMPLETE bracket the ppbe-coordination-assistant step.
 *   - FALLBACK_ACTIVATED when a non-live tier serves the digest.
 * Every event carries workflow_step_id (Standing Constraint #6).
 *
 * CPMI-VRS Gate 2: a failed Logger emit surfaces an error and does NOT continue.
 *
 * Version: 1.0 · Session 88 · August 5, 2026
 */

import { useCallback, useState } from "react";

import { createSovereignClient, computeEstimatedCostUSD, SOVEREIGN_DEFAULT_MODEL } from "@sovereign/api-client";
import type { SovereignRequestContext } from "@sovereign/api-client";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  runCoordinationTracking,
  coordinationWorkflowStep,
  PPBE_COORDINATION_ASSISTANT_AGENT_ID,
  type CoordinationDeps,
  type CoordinationOutcome,
  type CoordinationTrackingInput,
} from "./ppbe-coordination-assistant";
import { readAnthropicKey } from "../../module-scribe/src/anthropic-key";

import coordinationPromptRaw from "../../ppbe/prompts/coordination_system.md?raw";

const COORDINATION_SYSTEM_PROMPT = coordinationPromptRaw.replace(/^<!--[\s\S]*?-->\s*/, "");

export interface UsePPBECoordinationTrackingOptions {
  /** Injectable LLM call (tests). Defaults to createSovereignClient(). */
  complete?: CoordinationDeps["complete"];
}

export type PPBECoordinationTrackingStatus = "idle" | "running" | "done" | "error";

export interface UsePPBECoordinationTracking {
  status: PPBECoordinationTrackingStatus;
  outcome: CoordinationOutcome | null;
  error: string | null;
  run: (input: CoordinationTrackingInput, asOfIso: string) => Promise<void>;
  reset: () => void;
}

export function usePPBECoordinationTracking(
  ctx: SovereignShellContext,
  opts: UsePPBECoordinationTrackingOptions = {}
): UsePPBECoordinationTracking {
  const actorId = ctx.auth.user.employee_id;
  const [status, setStatus] = useState<PPBECoordinationTrackingStatus>("idle");
  const [outcome, setOutcome] = useState<CoordinationOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (input: CoordinationTrackingInput, asOfIso: string): Promise<void> => {
      setStatus("running");
      setError(null);
      setOutcome(null);

      const wsid = coordinationWorkflowStep(input);
      const requestContext: SovereignRequestContext = {
        workflow_step_id: wsid,
        product: "NEXUS",
        agent_id: PPBE_COORDINATION_ASSISTANT_AGENT_ID,
        tier: "standard",
      };

      // --- Gate 2: AGENT_STEP_START. A failed emit aborts. ---
      try {
        ctx.logger.log({
          event_type: "AGENT_STEP_START",
          workflow_step_id: wsid,
          sovereign_tier: "standard",
          product: "NEXUS",
          actor_id: actorId,
          agent_id: PPBE_COORDINATION_ASSISTANT_AGENT_ID,
          agent_class: "Operational",
          outcome: "ppbe_coordination_tracking_started",
          payload: { item_count: input.items.length, as_of: asOfIso },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      const deps: CoordinationDeps = {
        complete:
          opts.complete ??
          (async (messages, reqCtx) => {
            const client = createSovereignClient(
              { tier: "standard" },
              { api_key_anthropic: readAnthropicKey() }
            );
            return client.complete(messages, reqCtx);
          }),
      };

      const result = await runCoordinationTracking(
        input,
        asOfIso,
        COORDINATION_SYSTEM_PROMPT,
        requestContext,
        deps
      );
      const fellBack = result.tier !== "live";

      // --- Gate 2: FALLBACK_ACTIVATED (if degraded) + AGENT_STEP_COMPLETE ---
      try {
        if (fellBack) {
          ctx.logger.log({
            event_type: "FALLBACK_ACTIVATED",
            workflow_step_id: wsid,
            sovereign_tier: "standard",
            product: "NEXUS",
            actor_id: actorId,
            agent_id: PPBE_COORDINATION_ASSISTANT_AGENT_ID,
            outcome: `ppbe_coordination_${result.tier}_tier_served`,
            payload: { tier: result.tier, reason: result.detail ?? "live_unavailable" },
          });
        }
        ctx.logger.log({
          event_type: "AGENT_STEP_COMPLETE",
          workflow_step_id: wsid,
          sovereign_tier: "standard",
          product: "NEXUS",
          actor_id: actorId,
          agent_id: PPBE_COORDINATION_ASSISTANT_AGENT_ID,
          agent_class: "Operational",
          outcome: `ppbe_coordination_tracking_${result.tier}`,
          payload: {
            item_count: input.items.length,
            tier: result.tier,
            fallback_activated: fellBack,
            detail: result.detail,
          },
          ...(result.usage ? { token_usage: { ...result.usage, estimated_cost_usd: computeEstimatedCostUSD(SOVEREIGN_DEFAULT_MODEL, result.usage.input_tokens, result.usage.output_tokens), duration_ms: result.duration_ms, stop_reason: result.stop_reason, responded_at: result.responded_at } } : {}),
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      setOutcome(result);
      setStatus("done");

      function surfaceLoggerError(err: unknown): void {
        setError(
          `Logger emission failed — PPBE coordination tracking halted (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        setStatus("error");
      }
    },
    [ctx, actorId, opts.complete]
  );

  const reset = useCallback((): void => {
    setStatus("idle");
    setOutcome(null);
    setError(null);
  }, []);

  return { status, outcome, error, run, reset };
}

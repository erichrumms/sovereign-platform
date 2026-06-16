/**
 * SOVEREIGN Platform — module-counsel
 * useCounterargument.ts — the Counterargument Mode hook.
 *
 * Owns COUNSEL's LLM call per adversarial turn (via createSovereignClient — never
 * the Anthropic API directly) and all Logger emission for the counterargument
 * step. Wraps the pure three-tier orchestration in counter-engine.ts with the real
 * api-client, a per-session cache, and ctx.logger.
 *
 * CPMI-VRS Gate 2 (spec §7): every counterargument turn emits Logger events; if a
 * Logger emit FAILS, the hook surfaces an error and does NOT silently continue.
 *
 * Logger taxonomy (frozen — no invented types): REASONING_STEP_START /
 * REASONING_STEP_COMPLETE bracket each counsel-analyst challenge turn (agent_id
 * carried for attribution per the Agent Identity Standard); FALLBACK_ACTIVATED is
 * emitted when a non-live tier serves the result.
 *
 * Version: 1.0 · Session 5 · June 16, 2026
 */

import { useCallback, useRef, useState } from "react";

import { createSovereignClient } from "@sovereign/api-client";
import type { SovereignRequestContext } from "@sovereign/api-client";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { PR_COUNSEL_002, type CounterargumentChallenge } from "./counter-contract";
import {
  runCounterargument,
  type CounterargumentDeps,
  type CounterargumentInput,
  type CounterargumentOutcome,
} from "./counter-engine";
import { COUNTER_SYSTEM_PROMPT, COUNTER_PROMPT_VERSION } from "./prompts/counter-system.prompt";
import { readAnthropicKey } from "./anthropic-key";

const COUNSEL_ANALYST = "counsel-analyst";

export type CounterStatus = "idle" | "running" | "done" | "error";

export interface UseCounterargument {
  status: CounterStatus;
  outcome: CounterargumentOutcome | null;
  error: string | null;
  challenge: (input: CounterargumentInput) => Promise<void>;
}

export function useCounterargument(ctx: SovereignShellContext): UseCounterargument {
  const [status, setStatus] = useState<CounterStatus>("idle");
  const [outcome, setOutcome] = useState<CounterargumentOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Per-session challenge cache (Tier 2). Survives re-renders.
  const cacheRef = useRef<Map<string, CounterargumentChallenge>>(new Map());

  const challenge = useCallback(
    async (input: CounterargumentInput): Promise<void> => {
      setStatus("running");
      setError(null);

      const wsid = input.frame.sovereignContext.workflowStepId;
      const actorId = ctx.auth.user.employee_id;
      const turnDepth = input.priorTurns.length;

      const requestContext: SovereignRequestContext = {
        workflow_step_id: wsid,
        product: "COUNSEL",
        agent_id: COUNSEL_ANALYST,
        tier: "standard",
      };

      // --- Gate 2: REASONING_STEP_START. A failed emit aborts (do not continue). ---
      try {
        ctx.logger.log({
          event_type: "REASONING_STEP_START",
          workflow_step_id: wsid,
          sovereign_tier: "standard",
          product: "COUNSEL",
          actor_id: actorId,
          agent_id: COUNSEL_ANALYST,
          outcome: "counterargument_turn_started",
          payload: {
            registry_id: PR_COUNSEL_002.registryId,
            prompt_version: COUNTER_PROMPT_VERSION,
            target_alternative_id: input.targetAlternativeId,
            turn_depth: turnDepth,
            decision_type: input.frame.sovereignContext.decisionType,
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      // --- Run the three-tier counterargument turn (never throws) ---
      const deps: CounterargumentDeps = {
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

      const result = await runCounterargument(input, COUNTER_SYSTEM_PROMPT, requestContext, deps);
      const fellBack = result.tier !== "live";

      // --- Gate 2: FALLBACK_ACTIVATED (if degraded) + REASONING_STEP_COMPLETE ---
      try {
        if (fellBack) {
          ctx.logger.log({
            event_type: "FALLBACK_ACTIVATED",
            workflow_step_id: wsid,
            sovereign_tier: "standard",
            product: "COUNSEL",
            actor_id: actorId,
            agent_id: COUNSEL_ANALYST,
            outcome: `counterargument_${result.tier}_tier_served`,
            payload: { tier: result.tier, reason: result.detail ?? "live_unavailable", turn_depth: turnDepth },
          });
        }
        ctx.logger.log({
          event_type: "REASONING_STEP_COMPLETE",
          workflow_step_id: wsid,
          sovereign_tier: "standard",
          product: "COUNSEL",
          actor_id: actorId,
          agent_id: COUNSEL_ANALYST,
          outcome: `counterargument_${result.tier}`,
          payload: {
            registry_id: PR_COUNSEL_002.registryId,
            prompt_version: COUNTER_PROMPT_VERSION,
            tier: result.tier,
            fallback_activated: fellBack,
            target_alternative_id: input.targetAlternativeId,
            turn_depth: turnDepth,
            pressure_level: result.result.pressureLevel,
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
          `Logger emission failed — counterargument halted (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        setStatus("error");
      }
    },
    [ctx]
  );

  return { status, outcome, error, challenge };
}

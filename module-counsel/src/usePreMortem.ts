/**
 * SOVEREIGN Platform — module-counsel
 * usePreMortem.ts — the Pre-Mortem Studio hook.
 *
 * Owns COUNSEL's single LLM call for the pre-mortem (via createSovereignClient —
 * never the Anthropic API directly) and all Logger emission for the pre-mortem
 * step. Wraps the pure three-tier orchestration in premortem-engine.ts with the
 * real api-client, a per-session cache, and ctx.logger.
 *
 * CPMI-VRS Gate 2 (spec §7): the pre-mortem step emits Logger events; if a Logger
 * emit FAILS, the hook surfaces an error and does NOT silently continue.
 *
 * Logger taxonomy (frozen — no invented types): REASONING_STEP_START /
 * REASONING_STEP_COMPLETE bracket the counsel-analyst pre-mortem step (agent_id
 * carried per the Agent Identity Standard); FALLBACK_ACTIVATED on a non-live tier.
 *
 * Version: 1.0 · Session 5 · June 16, 2026
 */

import { useCallback, useRef, useState } from "react";

import { createSovereignClient } from "@sovereign/api-client";
import type { SovereignRequestContext } from "@sovereign/api-client";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { PR_COUNSEL_003, type PreMortemResult } from "./premortem-contract";
import {
  runPreMortem,
  type PreMortemDeps,
  type PreMortemInput,
  type PreMortemOutcome,
} from "./premortem-engine";
import { PREMORTEM_SYSTEM_PROMPT, PREMORTEM_PROMPT_VERSION } from "./prompts/premortem-system.prompt";

const COUNSEL_ANALYST = "counsel-analyst";

export type PreMortemStatus = "idle" | "running" | "done" | "error";

export interface UsePreMortem {
  status: PreMortemStatus;
  outcome: PreMortemOutcome | null;
  error: string | null;
  run: (input: PreMortemInput) => Promise<void>;
}

/** Read the Anthropic key from the Vite build env. Absent in synthetic/air-gapped
 *  runs — the engine then degrades to cache/static. NEVER hardcode a key. */
function readApiKey(): string | undefined {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return env?.["VITE_ANTHROPIC_API_KEY"];
}

export function usePreMortem(ctx: SovereignShellContext): UsePreMortem {
  const [status, setStatus] = useState<PreMortemStatus>("idle");
  const [outcome, setOutcome] = useState<PreMortemOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Per-session PreMortemResult cache (Tier 2). Survives re-renders.
  const cacheRef = useRef<Map<string, PreMortemResult>>(new Map());

  const run = useCallback(
    async (input: PreMortemInput): Promise<void> => {
      setStatus("running");
      setError(null);
      setOutcome(null);

      const wsid = input.frame.sovereignContext.workflowStepId;
      const actorId = ctx.auth.user.employee_id;

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
          outcome: "premortem_started",
          payload: {
            registry_id: PR_COUNSEL_003.registryId,
            prompt_version: PREMORTEM_PROMPT_VERSION,
            chosen_alternative_id: input.chosenAlternativeId ?? null,
            decision_type: input.frame.sovereignContext.decisionType,
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      // --- Run the three-tier pre-mortem (never throws) ---
      const deps: PreMortemDeps = {
        complete: async (messages, reqCtx) => {
          const client = createSovereignClient(
            { tier: "standard" },
            { api_key_anthropic: readApiKey() }
          );
          return client.complete(messages, reqCtx);
        },
        cacheGet: (key) => cacheRef.current.get(key) ?? null,
        cacheSet: (key, value) => {
          cacheRef.current.set(key, value);
        },
      };

      const result = await runPreMortem(input, PREMORTEM_SYSTEM_PROMPT, requestContext, deps);
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
            outcome: `premortem_${result.tier}_tier_served`,
            payload: { tier: result.tier, reason: result.detail ?? "live_unavailable" },
          });
        }
        ctx.logger.log({
          event_type: "REASONING_STEP_COMPLETE",
          workflow_step_id: wsid,
          sovereign_tier: "standard",
          product: "COUNSEL",
          actor_id: actorId,
          agent_id: COUNSEL_ANALYST,
          outcome: `premortem_${result.tier}`,
          payload: {
            registry_id: PR_COUNSEL_003.registryId,
            prompt_version: PREMORTEM_PROMPT_VERSION,
            tier: result.tier,
            fallback_activated: fellBack,
            failure_modes: result.result.failureModes.length,
            overall_vulnerability: result.result.overallVulnerability,
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
          `Logger emission failed — pre-mortem halted (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        setStatus("error");
      }
    },
    [ctx]
  );

  return { status, outcome, error, run };
}

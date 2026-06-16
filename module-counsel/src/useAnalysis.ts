/**
 * SOVEREIGN Platform — module-counsel
 * useAnalysis.ts — the Analysis Engine hook.
 *
 * Owns COUNSEL's single LLM call (via createSovereignClient — never the Anthropic
 * API directly) and all Logger emission for the analysis step. Wraps the pure
 * three-tier orchestration in analysis-engine.ts with the real api-client, a
 * per-session cache, and ctx.logger.
 *
 * CPMI-VRS Gate 2 (spec §7): the analysis step emits Logger events; if a Logger
 * emit FAILS, the hook surfaces an error and does NOT silently continue.
 *
 * Logger taxonomy (frozen — no invented types): REASONING_STEP_START /
 * REASONING_STEP_COMPLETE bracket the counsel-analyst reasoning step (agent_id
 * carried for attribution per the Agent Identity Standard); FALLBACK_ACTIVATED is
 * emitted when a non-live tier serves the result (platform self-reporting).
 *
 * Version: 1.0 · Session 4 · June 15, 2026
 */

import { useCallback, useRef, useState } from "react";

import { createSovereignClient } from "@sovereign/api-client";
import type { SovereignRequestContext } from "@sovereign/api-client";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { PR_COUNSEL_001, type AnalysisResult } from "./analysis-contract";
import {
  runAnalysis,
  type AnalysisDeps,
  type AnalysisOutcome,
} from "./analysis-engine";
import { ANALYSIS_SYSTEM_PROMPT, ANALYSIS_PROMPT_VERSION } from "./prompts/analysis-system.prompt";
import { readAnthropicKey } from "./anthropic-key";
import type { DecisionFrame } from "./types";

const COUNSEL_ANALYST = "counsel-analyst";

export type AnalysisStatus = "idle" | "running" | "done" | "error";

export interface UseAnalysis {
  status: AnalysisStatus;
  outcome: AnalysisOutcome | null;
  error: string | null;
  run: (frame: DecisionFrame) => Promise<void>;
}

export function useAnalysis(ctx: SovereignShellContext): UseAnalysis {
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [outcome, setOutcome] = useState<AnalysisOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Per-session AnalysisResult cache (Tier 2). Survives re-renders.
  const cacheRef = useRef<Map<string, AnalysisResult>>(new Map());

  const run = useCallback(
    async (frame: DecisionFrame): Promise<void> => {
      setStatus("running");
      setError(null);
      setOutcome(null);

      const wsid = frame.sovereignContext.workflowStepId;
      const actorId = ctx.auth.user.employee_id;

      const requestContext: SovereignRequestContext = {
        workflow_step_id: wsid,
        product: "COUNSEL",
        agent_id: COUNSEL_ANALYST,
        tier: "standard", // COUNSEL → Anthropic (Tier 1). Production CUI routing
        // to GovCloud (tier "enhanced") is a config change pending R7, not a rewrite.
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
          outcome: "analysis_started",
          payload: {
            registry_id: PR_COUNSEL_001.registryId,
            prompt_version: ANALYSIS_PROMPT_VERSION,
            decision_type: frame.sovereignContext.decisionType,
            source_product: frame.sovereignContext.sourceProduct,
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      // --- Run the three-tier analysis (never throws) ---
      const deps: AnalysisDeps = {
        complete: async (messages, reqCtx) => {
          // createSovereignClient throws for tier "standard" without a key; that
          // rejection routes the engine to the cache/static tiers.
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

      const result = await runAnalysis(frame, ANALYSIS_SYSTEM_PROMPT, requestContext, deps);
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
            outcome: `analysis_${result.tier}_tier_served`,
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
          outcome: `analysis_${result.tier}`,
          payload: {
            registry_id: PR_COUNSEL_001.registryId,
            prompt_version: ANALYSIS_PROMPT_VERSION,
            tier: result.tier,
            fallback_activated: fellBack,
            confidence_score: result.result.confidenceScore,
            alternatives: result.result.alternatives.length,
            detail: result.detail,
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      setOutcome(result);
      setStatus("done");

      function surfaceLoggerError(err: unknown): void {
        // Gate 2: a Logger emit failure is surfaced, never swallowed.
        setError(
          `Logger emission failed — analysis halted (CPMI-VRS Gate 2): ${
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

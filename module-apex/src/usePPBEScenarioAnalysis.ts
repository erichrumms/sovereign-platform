/**
 * SOVEREIGN Platform — module-apex
 * usePPBEScenarioAnalysis.ts — Logger-wired hook for the ppbe-scenario-analyst.
 *
 * GD-35 (F5, Session 88): wires ctx.logger into the PPBE Scenario Analysis call
 * site, which previously called createSovereignClient() directly and discarded ctx.
 * Advisory framing unchanged — scenario reports are Tier A; they are not decisions
 * or recommendations to execute. All programming decisions require human approval.
 *
 * Logger taxonomy — APPROVED EVENT TYPES ONLY:
 *   - AGENT_STEP_START / AGENT_STEP_COMPLETE bracket the ppbe-scenario-analyst step.
 *   - FALLBACK_ACTIVATED when a non-live tier serves the report.
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
  runScenarioAnalysis,
  scenarioWorkflowStep,
  PPBE_SCENARIO_ANALYST_AGENT_ID,
  type ScenarioDeps,
  type ScenarioOutcome,
  type ScenarioAnalysisInput,
} from "./ppbe-scenario-analyst";
import { readAnthropicKey } from "./anthropic-key";

import scenarioPromptRaw from "../../ppbe/prompts/scenario_analysis_system.md?raw";

const SCENARIO_SYSTEM_PROMPT = scenarioPromptRaw.replace(/^<!--[\s\S]*?-->\s*/, "");

export interface UsePPBEScenarioAnalysisOptions {
  /** Injectable LLM call (tests). Defaults to createSovereignClient(). */
  complete?: ScenarioDeps["complete"];
}

export type PPBEScenarioAnalysisStatus = "idle" | "running" | "done" | "error";

export interface UsePPBEScenarioAnalysis {
  status: PPBEScenarioAnalysisStatus;
  outcome: ScenarioOutcome | null;
  error: string | null;
  run: (input: ScenarioAnalysisInput) => Promise<void>;
  reset: () => void;
}

export function usePPBEScenarioAnalysis(
  ctx: SovereignShellContext,
  opts: UsePPBEScenarioAnalysisOptions = {}
): UsePPBEScenarioAnalysis {
  const actorId = ctx.auth.user.employee_id;
  const [status, setStatus] = useState<PPBEScenarioAnalysisStatus>("idle");
  const [outcome, setOutcome] = useState<ScenarioOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (input: ScenarioAnalysisInput): Promise<void> => {
      setStatus("running");
      setError(null);
      setOutcome(null);

      const wsid = scenarioWorkflowStep(input);
      const requestContext: SovereignRequestContext = {
        workflow_step_id: wsid,
        product: "APEX",
        agent_id: PPBE_SCENARIO_ANALYST_AGENT_ID,
        tier: "standard",
      };

      // --- Gate 2: AGENT_STEP_START. A failed emit aborts. ---
      try {
        ctx.logger.log({
          event_type: "AGENT_STEP_START",
          workflow_step_id: wsid,
          sovereign_tier: "standard",
          product: "APEX",
          actor_id: actorId,
          agent_id: PPBE_SCENARIO_ANALYST_AGENT_ID,
          agent_class: "Analytical",
          outcome: "ppbe_scenario_analysis_started",
          payload: {
            program_count: input.programs.length,
            fiscal_context: input.fiscal_context,
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      const deps: ScenarioDeps = {
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

      let result: Awaited<ReturnType<typeof runScenarioAnalysis>>;
      try {
        result = await runScenarioAnalysis(input, SCENARIO_SYSTEM_PROMPT, requestContext, deps);
      } catch (err) {
        setError(
          `Scenario analysis engine error: ${err instanceof Error ? err.message : String(err)}`
        );
        setStatus("error");
        return;
      }
      const fellBack = result.tier !== "live";

      // --- Gate 2: FALLBACK_ACTIVATED (if degraded) + AGENT_STEP_COMPLETE ---
      try {
        if (fellBack) {
          ctx.logger.log({
            event_type: "FALLBACK_ACTIVATED",
            workflow_step_id: wsid,
            sovereign_tier: "standard",
            product: "APEX",
            actor_id: actorId,
            agent_id: PPBE_SCENARIO_ANALYST_AGENT_ID,
            outcome: `ppbe_scenario_analysis_${result.tier}_tier_served`,
            payload: { tier: result.tier, reason: result.detail ?? "live_unavailable" },
          });
        }
        ctx.logger.log({
          event_type: "AGENT_STEP_COMPLETE",
          workflow_step_id: wsid,
          sovereign_tier: "standard",
          product: "APEX",
          actor_id: actorId,
          agent_id: PPBE_SCENARIO_ANALYST_AGENT_ID,
          agent_class: "Analytical",
          outcome: `ppbe_scenario_analysis_${result.tier}`,
          payload: {
            program_count: input.programs.length,
            fiscal_context: input.fiscal_context,
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
          `Logger emission failed — PPBE scenario analysis halted (CPMI-VRS Gate 2): ${
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

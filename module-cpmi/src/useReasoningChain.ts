/**
 * SOVEREIGN Platform — module-cpmi
 * useReasoningChain.ts — the CPMI reasoning-chain hook.
 *
 * Owns the single reasoning-chain LLM call (via createSovereignClient — never the
 * Anthropic API directly, Standing Constraint #5) and all Logger emission. Wraps the
 * pure reasoning-engine three-tier orchestration with the real api-client, a per-session
 * cache, and ctx.logger. ONE createSovereignClient().complete per chain (spec §4.1) — the
 * chain is a single governed inference session traceable to one workflow_step_id.
 *
 * Logger taxonomy — APPROVED EVENT TYPES ONLY:
 *   - AGENT_STEP_START / AGENT_STEP_COMPLETE bracket the cpmi.reasoning-chain step
 *     (Governance agent).
 *   - FALLBACK_ACTIVATED when a non-live tier serves the output.
 *   - CPMI_REASONING_CHAIN_COMPLETE (GD-7) on completion, carrying output_schema_valid
 *     and the enhanced-monitoring threshold factor (0.7×, spec §6.1).
 * Every event carries workflow_step_id `cpmi-reasoning-<programId>` (Constraint #6).
 *
 * CPMI-VRS Gate 2: a failed Logger emit surfaces an error and does NOT continue.
 *
 * Version: 1.0 · Session 11 · June 23, 2026
 */

import { useCallback, useRef, useState } from "react";

import { createSovereignClient } from "@sovereign/api-client";
import type { SovereignRequestContext } from "@sovereign/api-client";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  CPMI_ANOMALY_THRESHOLD_FACTOR,
  PR_CPMI_001,
  reasoningWorkflowStep,
  type ReasoningChainInput,
  type ReasoningChainOutput,
} from "./cpmi-contract";
import { runReasoningChain, type ReasoningDeps, type ReasoningOutcome } from "./reasoning-engine";
import { createDevWorldModelPort, type WorldModelPort } from "./world-model-port";
import { REASONING_CHAIN_SYSTEM_PROMPT, REASONING_CHAIN_PROMPT_VERSION } from "./prompts/reasoning-chain.prompt";
import { readAnthropicKey } from "./anthropic-key";

const CPMI_REASONING_CHAIN = "cpmi.reasoning-chain";

export type ReasoningStatus = "idle" | "running" | "complete" | "error";

export interface UseReasoningChain {
  status: ReasoningStatus;
  outcome: ReasoningOutcome | null;
  error: string | null;
  /** Run the six-step chain for a program id (read from the world model). */
  runChain: (programId: string) => Promise<void>;
  reset: () => void;
}

export interface UseReasoningChainOptions {
  /** Injectable world-model port. Defaults to the synthetic/dev backing. */
  port?: WorldModelPort;
  /** Injectable LLM call (tests). Defaults to createSovereignClient(). */
  complete?: ReasoningDeps["complete"];
}

export function useReasoningChain(ctx: SovereignShellContext, opts: UseReasoningChainOptions = {}): UseReasoningChain {
  const actorId = ctx.auth.user.employee_id;
  const port = opts.port ?? createDevWorldModelPort();

  const [status, setStatus] = useState<ReasoningStatus>("idle");
  const [outcome, setOutcome] = useState<ReasoningOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, ReasoningChainOutput>>(new Map());

  const runChain = useCallback(
    async (programId: string): Promise<void> => {
      setError(null);
      setOutcome(null);

      const worldModel = port.getProgramContext(programId);
      if (!worldModel) {
        setError(`No world-model record for program "${programId}".`);
        setStatus("error");
        return;
      }

      setStatus("running");
      const input: ReasoningChainInput = { program_id: programId, worldModel };
      const workflowStep = reasoningWorkflowStep(programId);
      const requestContext: SovereignRequestContext = {
        workflow_step_id: workflowStep,
        product: "CPMI",
        agent_id: CPMI_REASONING_CHAIN,
        tier: "standard",
      };

      // --- Gate 2: AGENT_STEP_START. A failed emit aborts. ---
      try {
        ctx.logger.log({
          event_type: "AGENT_STEP_START",
          workflow_step_id: workflowStep,
          sovereign_tier: "standard",
          product: "CPMI",
          actor_id: actorId,
          agent_id: CPMI_REASONING_CHAIN,
          agent_class: "Governance",
          outcome: "reasoning_chain_started",
          payload: {
            registry_id: PR_CPMI_001.registryId,
            prompt_version: REASONING_CHAIN_PROMPT_VERSION,
            program_id: programId,
            anomaly_threshold_factor: CPMI_ANOMALY_THRESHOLD_FACTOR,
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      const deps: ReasoningDeps = {
        complete:
          opts.complete ??
          (async (messages, reqCtx) => {
            const client = createSovereignClient({ tier: "standard" }, { api_key_anthropic: readAnthropicKey() });
            return client.complete(messages, reqCtx);
          }),
        cacheGet: (key) => cacheRef.current.get(key) ?? null,
        cacheSet: (key, value) => {
          cacheRef.current.set(key, value);
        },
      };

      const result = await runReasoningChain(input, REASONING_CHAIN_SYSTEM_PROMPT, requestContext, deps);
      const fellBack = result.tier !== "live";

      // --- Gate 2: FALLBACK_ACTIVATED (if degraded) + AGENT_STEP_COMPLETE + CPMI_REASONING_CHAIN_COMPLETE ---
      try {
        if (fellBack) {
          ctx.logger.log({
            event_type: "FALLBACK_ACTIVATED",
            workflow_step_id: workflowStep,
            sovereign_tier: "standard",
            product: "CPMI",
            actor_id: actorId,
            agent_id: CPMI_REASONING_CHAIN,
            outcome: `reasoning_${result.tier}_tier_served`,
            payload: { program_id: programId, tier: result.tier, reason: result.detail ?? "live_unavailable" },
          });
        }
        ctx.logger.log({
          event_type: "AGENT_STEP_COMPLETE",
          workflow_step_id: workflowStep,
          sovereign_tier: "standard",
          product: "CPMI",
          actor_id: actorId,
          agent_id: CPMI_REASONING_CHAIN,
          agent_class: "Governance",
          outcome: `reasoning_${result.tier}`,
          payload: {
            registry_id: PR_CPMI_001.registryId,
            prompt_version: REASONING_CHAIN_PROMPT_VERSION,
            program_id: programId,
            tier: result.tier,
            fallback_activated: fellBack,
            detail: result.detail,
          },
        });
        ctx.logger.log({
          event_type: "CPMI_REASONING_CHAIN_COMPLETE",
          workflow_step_id: workflowStep,
          sovereign_tier: "standard",
          product: "CPMI",
          actor_id: actorId,
          agent_id: CPMI_REASONING_CHAIN,
          outcome: "reasoning_chain_complete",
          payload: {
            program_id: programId,
            output_schema_valid: result.output.schema_valid,
            tier: result.tier,
            // Enhanced monitoring (spec §6.1): every CPMI output is evaluated at 0.7×.
            anomaly_threshold_factor: CPMI_ANOMALY_THRESHOLD_FACTOR,
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      setOutcome(result);
      setStatus("complete");

      function surfaceLoggerError(err: unknown): void {
        setError(
          `Logger emission failed — reasoning chain halted (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        setStatus("error");
      }
    },
    [ctx, actorId, port, opts.complete]
  );

  const reset = useCallback((): void => {
    setStatus("idle");
    setOutcome(null);
    setError(null);
  }, []);

  return { status, outcome, error, runChain, reset };
}

/**
 * SOVEREIGN Platform — module-apex
 * usePPBEEvidenceSynthesis.ts — Logger-wired hook for the ppbe-evidence-synthesizer.
 *
 * GD-35 (F5, Session 88): wires ctx.logger into the PPBE Evidence Synthesis call
 * site, which previously called createSovereignClient() directly and discarded ctx.
 * Advisory framing unchanged — synthesis reports remain Tier A; human review is
 * required before any report influences a PPBE decision.
 *
 * Logger taxonomy — APPROVED EVENT TYPES ONLY:
 *   - AGENT_STEP_START / AGENT_STEP_COMPLETE bracket the ppbe-evidence-synthesizer step.
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
  runEvidenceSynthesis,
  synthesisWorkflowStep,
  PPBE_EVIDENCE_SYNTHESIZER_AGENT_ID,
  type SynthesisDeps,
  type SynthesisOutcome,
  type EvidenceSynthesisInput,
} from "./ppbe-evidence-synthesizer";
import { readAnthropicKey } from "./anthropic-key";

import evidencePromptRaw from "../../ppbe/prompts/evidence_synthesis_system.md?raw";

const EVIDENCE_SYSTEM_PROMPT = evidencePromptRaw.replace(/^<!--[\s\S]*?-->\s*/, "");

export interface UsePPBEEvidenceSynthesisOptions {
  /** Injectable LLM call (tests). Defaults to createSovereignClient(). */
  complete?: SynthesisDeps["complete"];
}

export type PPBEEvidenceSynthesisStatus = "idle" | "running" | "done" | "error";

export interface UsePPBEEvidenceSynthesis {
  status: PPBEEvidenceSynthesisStatus;
  outcome: SynthesisOutcome | null;
  error: string | null;
  run: (input: EvidenceSynthesisInput) => Promise<void>;
  reset: () => void;
}

export function usePPBEEvidenceSynthesis(
  ctx: SovereignShellContext,
  opts: UsePPBEEvidenceSynthesisOptions = {}
): UsePPBEEvidenceSynthesis {
  const actorId = ctx.auth.user.employee_id;
  const [status, setStatus] = useState<PPBEEvidenceSynthesisStatus>("idle");
  const [outcome, setOutcome] = useState<SynthesisOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (input: EvidenceSynthesisInput): Promise<void> => {
      setStatus("running");
      setError(null);
      setOutcome(null);

      const wsid = synthesisWorkflowStep(input);
      const requestContext: SovereignRequestContext = {
        workflow_step_id: wsid,
        product: "APEX",
        agent_id: PPBE_EVIDENCE_SYNTHESIZER_AGENT_ID,
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
          agent_id: PPBE_EVIDENCE_SYNTHESIZER_AGENT_ID,
          agent_class: "Analytical",
          outcome: "ppbe_evidence_synthesis_started",
          payload: {
            program_count: input.programs.length,
            finding_count: input.findings.length,
            fiscal_context: input.fiscal_context,
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      const deps: SynthesisDeps = {
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

      let result: Awaited<ReturnType<typeof runEvidenceSynthesis>>;
      try {
        result = await runEvidenceSynthesis(input, EVIDENCE_SYSTEM_PROMPT, requestContext, deps);
      } catch (err) {
        setError(
          `Evidence synthesis engine error: ${err instanceof Error ? err.message : String(err)}`
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
            agent_id: PPBE_EVIDENCE_SYNTHESIZER_AGENT_ID,
            outcome: `ppbe_evidence_synthesis_${result.tier}_tier_served`,
            payload: { tier: result.tier, reason: result.detail ?? "live_unavailable" },
          });
        }
        ctx.logger.log({
          event_type: "AGENT_STEP_COMPLETE",
          workflow_step_id: wsid,
          sovereign_tier: "standard",
          product: "APEX",
          actor_id: actorId,
          agent_id: PPBE_EVIDENCE_SYNTHESIZER_AGENT_ID,
          agent_class: "Analytical",
          outcome: `ppbe_evidence_synthesis_${result.tier}`,
          payload: {
            program_count: input.programs.length,
            finding_count: input.findings.length,
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
          `Logger emission failed — PPBE evidence synthesis halted (CPMI-VRS Gate 2): ${
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

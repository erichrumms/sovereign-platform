/**
 * SOVEREIGN Platform — module-scribe
 * usePPBEExhibitDraft.ts — Logger-wired hook for the ppbe-exhibit-drafter agent.
 *
 * GD-35 (F5, Session 88): wires ctx.logger into the PPBE Exhibit Drafting call site,
 * which previously called createSovereignClient() directly and discarded ctx. All
 * advisory framing in the UI is unchanged — output remains non-binding, export still
 * requires CLEAR certification and human sign-off.
 *
 * Logger taxonomy — APPROVED EVENT TYPES ONLY:
 *   - AGENT_STEP_START / AGENT_STEP_COMPLETE bracket the ppbe-exhibit-drafter step.
 *   - FALLBACK_ACTIVATED when a non-live tier (cache or static) serves the draft.
 * Every event carries workflow_step_id (Standing Constraint #6).
 *
 * CPMI-VRS Gate 2: a failed Logger emit surfaces an error and does NOT continue.
 *
 * Version: 1.0 · Session 88 · August 5, 2026
 */

import { useCallback, useRef, useState } from "react";

import { createSovereignClient, computeEstimatedCostUSD, SOVEREIGN_DEFAULT_MODEL } from "@sovereign/api-client";
import type { SovereignRequestContext } from "@sovereign/api-client";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  runExhibitDraft,
  exhibitWorkflowStepId,
  type ExhibitDraftDeps,
  type ExhibitDraftInput,
  type ExhibitDraftOutcome,
} from "./ppbe-exhibit-engine";
import { PPBE_EXHIBIT_DRAFTER } from "./ppbe-exhibit-contract";
import { readAnthropicKey } from "./anthropic-key";

import exhibitPromptRaw from "../../ppbe/prompts/exhibit_drafting_system.md?raw";

const EXHIBIT_SYSTEM_PROMPT = exhibitPromptRaw.replace(/^<!--[\s\S]*?-->\s*/, "");

export interface UsePPBEExhibitDraftOptions {
  /** Injectable LLM call (tests). Defaults to createSovereignClient(). */
  complete?: ExhibitDraftDeps["complete"];
}

export type PPBEExhibitDraftStatus = "idle" | "running" | "done" | "error";

export interface UsePPBEExhibitDraft {
  status: PPBEExhibitDraftStatus;
  outcome: ExhibitDraftOutcome | null;
  error: string | null;
  run: (input: ExhibitDraftInput) => Promise<void>;
  reset: () => void;
}

export function usePPBEExhibitDraft(
  ctx: SovereignShellContext,
  opts: UsePPBEExhibitDraftOptions = {}
): UsePPBEExhibitDraft {
  const actorId = ctx.auth.user.employee_id;
  const [status, setStatus] = useState<PPBEExhibitDraftStatus>("idle");
  const [outcome, setOutcome] = useState<ExhibitDraftOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef(new Map<string, ExhibitDraftOutcome["draft"]>());

  const run = useCallback(
    async (input: ExhibitDraftInput): Promise<void> => {
      setStatus("running");
      setError(null);
      setOutcome(null);

      const wsid = exhibitWorkflowStepId(input);
      const requestContext: SovereignRequestContext = {
        workflow_step_id: wsid,
        product: "SCRIBE",
        agent_id: PPBE_EXHIBIT_DRAFTER,
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
          agent_id: PPBE_EXHIBIT_DRAFTER,
          agent_class: "Operational",
          outcome: "ppbe_exhibit_draft_started",
          payload: { mode: input.mode, program_id: input.program.program_id },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      const deps: ExhibitDraftDeps = {
        complete:
          opts.complete ??
          (async (messages, reqCtx) => {
            const client = createSovereignClient(
              { tier: "standard" },
              { api_key_anthropic: readAnthropicKey() }
            );
            return client.complete(messages, reqCtx);
          }),
        cacheGet: (key) => cacheRef.current.get(key) ?? null,
        cacheSet: (key, value) => { cacheRef.current.set(key, value); },
      };

      const result = await runExhibitDraft(input, EXHIBIT_SYSTEM_PROMPT, requestContext, deps);
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
            agent_id: PPBE_EXHIBIT_DRAFTER,
            outcome: `ppbe_exhibit_draft_${result.tier}_tier_served`,
            payload: { mode: input.mode, tier: result.tier, reason: result.detail ?? "live_unavailable" },
          });
        }
        ctx.logger.log({
          event_type: "AGENT_STEP_COMPLETE",
          workflow_step_id: wsid,
          sovereign_tier: "standard",
          product: "SCRIBE",
          actor_id: actorId,
          agent_id: PPBE_EXHIBIT_DRAFTER,
          agent_class: "Operational",
          outcome: `ppbe_exhibit_draft_${result.tier}`,
          payload: {
            mode: input.mode,
            program_id: input.program.program_id,
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
          `Logger emission failed — PPBE exhibit draft halted (CPMI-VRS Gate 2): ${
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

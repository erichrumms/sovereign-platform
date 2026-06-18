/**
 * SOVEREIGN Platform — module-scribe
 * useDraft.ts — the SCRIBE Drafting Engine hook.
 *
 * Owns SCRIBE's single LLM call per draft (via createSovereignClient — never the
 * Anthropic API directly, Standing Constraint #5) and all Logger emission for the
 * drafting step. Wraps the pure three-tier orchestration in draft-engine.ts with
 * the real api-client, a per-session cache, and ctx.logger.
 *
 * ONE createSovereignClient() CALL PER DRAFT (D1 done condition): deps.complete is
 * invoked at most once per run() — the live tier. Cache and static tiers make no
 * network call.
 *
 * Logger taxonomy — APPROVED EVENT TYPES ONLY (D1 done condition; no invented
 * SCRIBE_* types):
 *   - AGENT_STEP_START / AGENT_STEP_COMPLETE bracket the scribe-drafter agent step
 *     (Operational agent; agent_id + agent_class carried per the Agent Identity
 *     Standard, both are valid fields on these event types).
 *   - FALLBACK_ACTIVATED when a non-live tier serves the draft (platform self-report).
 * Every event carries workflow_step_id (Standing Constraint #6).
 *
 * CPMI-VRS Gate 2 (spec §7): if a Logger emit FAILS, the hook surfaces an error and
 * does NOT silently continue.
 *
 * Version: 1.0 · Session 6 · June 17, 2026
 */

import { useCallback, useRef, useState } from "react";

import { createSovereignClient } from "@sovereign/api-client";
import type { SovereignRequestContext } from "@sovereign/api-client";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { PR_SCRIBE_001, type ModeOutput } from "./draft-contract";
import {
  runDraft,
  draftWorkflowStepId,
  type DraftDeps,
  type DraftInput,
  type DraftOutcome,
} from "./draft-engine";
import { DRAFTING_SYSTEM_PROMPT, DRAFTING_PROMPT_VERSION } from "./prompts/drafting-system.prompt";
import { readAnthropicKey } from "./anthropic-key";

const SCRIBE_DRAFTER = "scribe-drafter";

export type DraftStatus = "idle" | "drafting" | "done" | "error";

export interface UseDraft {
  status: DraftStatus;
  outcome: DraftOutcome | null;
  error: string | null;
  draft: (input: DraftInput) => Promise<void>;
  reset: () => void;
}

export function useDraft(ctx: SovereignShellContext): UseDraft {
  const [status, setStatus] = useState<DraftStatus>("idle");
  const [outcome, setOutcome] = useState<DraftOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Per-session draft cache (Tier 2). Survives re-renders.
  const cacheRef = useRef<Map<string, ModeOutput>>(new Map());

  const draft = useCallback(
    async (input: DraftInput): Promise<void> => {
      setStatus("drafting");
      setError(null);
      setOutcome(null);

      const wsid = draftWorkflowStepId(input);
      const actorId = ctx.auth.user.employee_id;

      const requestContext: SovereignRequestContext = {
        workflow_step_id: wsid,
        product: "SCRIBE",
        agent_id: SCRIBE_DRAFTER,
        // SCRIBE → Anthropic (Tier 1). Production CUI routing to GovCloud (tier
        // "enhanced") is a config change pending R7, not a rewrite.
        tier: "standard",
      };

      // --- Gate 2: AGENT_STEP_START. A failed emit aborts (do not continue). ---
      try {
        ctx.logger.log({
          event_type: "AGENT_STEP_START",
          workflow_step_id: wsid,
          sovereign_tier: "standard",
          product: "SCRIBE",
          actor_id: actorId,
          agent_id: SCRIBE_DRAFTER,
          agent_class: "Operational",
          outcome: "draft_started",
          payload: {
            registry_id: PR_SCRIBE_001.registryId,
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

      // --- Run the three-tier draft (never throws). Exactly one live attempt. ---
      const deps: DraftDeps = {
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

      const result = await runDraft(input, DRAFTING_SYSTEM_PROMPT, requestContext, deps);
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
            outcome: `draft_${result.tier}_tier_served`,
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
          outcome: `draft_${result.tier}`,
          payload: {
            registry_id: PR_SCRIBE_001.registryId,
            prompt_version: DRAFTING_PROMPT_VERSION,
            mode: input.mode,
            tier: result.tier,
            fallback_activated: fellBack,
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
          `Logger emission failed — drafting halted (CPMI-VRS Gate 2): ${
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

  return { status, outcome, error, draft, reset };
}

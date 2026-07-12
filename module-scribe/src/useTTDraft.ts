/**
 * SOVEREIGN Platform — module-scribe
 * useTTDraft.ts — the Time & Travel drafting hook (Session 28, D2).
 *
 * Owns the single LLM call per TT draft (via createSovereignClient — never the
 * Anthropic API directly, Standing Constraint #5) and all Logger emission for the
 * drafting step, for BOTH tt.travel-drafter and tt.time-drafter. Wraps the pure
 * three-tier orchestration in tt-draft-engine.ts with the real api-client, a
 * per-session cache, and ctx.logger — the same shape as useDraft.ts.
 *
 * Logger taxonomy — APPROVED EVENT TYPES ONLY (same posture as useDraft.ts; the
 * Agent Identity Standard's SCRIBE_DRAFT_CREATED / SCRIBE_EXPORT_APPROVED names
 * were never added to any approved taxonomy — reconciliation documented in the
 * Session 28 handoff):
 *   - AGENT_STEP_START / AGENT_STEP_COMPLETE bracket the drafter agent step
 *     (agent_id tt.travel-drafter or tt.time-drafter, agent_class Operational,
 *     per the Agent Identity Standard).
 *   - FALLBACK_ACTIVATED when a non-live tier serves the draft.
 * Every event carries workflow_step_id (Standing Constraint #6). product is the
 * HOST product "SCRIBE" (docs/17 §2 — the workflow layer is not a SovereignProduct).
 *
 * CPMI-VRS Gate 2: a failed Logger emit surfaces an error and halts — never a
 * silent continue.
 *
 * Version: 1.0 · Session 28 · July 12, 2026
 */

import { useCallback, useRef, useState } from "react";

import { createSovereignClient } from "@sovereign/api-client";
import type { SovereignRequestContext } from "@sovereign/api-client";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  TT_TRAVEL_DRAFTER,
  TT_TIME_DRAFTER,
  TT_TRAVEL_PROMPT_REGISTRATION,
  TT_TIME_PROMPT_REGISTRATION,
  type TTDraft,
} from "./tt-draft-contract";
import {
  runTTDraft,
  ttDraftWorkflowStepId,
  ttCommunicationType,
  type TTDraftDeps,
  type TTDraftInput,
  type TTDraftOutcome,
} from "./tt-draft-engine";
import {
  TT_TRAVEL_DRAFTING_SYSTEM_PROMPT,
  TT_TRAVEL_DRAFTING_PROMPT_VERSION,
} from "./prompts/tt-travel-drafting-system.prompt";
import {
  TT_TIME_DRAFTING_SYSTEM_PROMPT,
  TT_TIME_DRAFTING_PROMPT_VERSION,
} from "./prompts/tt-time-drafting-system.prompt";
import { readAnthropicKey } from "./anthropic-key";

export type TTDraftStatus = "idle" | "drafting" | "done" | "error";

export interface UseTTDraft {
  status: TTDraftStatus;
  outcome: TTDraftOutcome | null;
  error: string | null;
  draft: (input: TTDraftInput) => Promise<void>;
  reset: () => void;
}

/** The agent identity + prompt registration a TT draft input resolves to. */
export function ttDrafterIdentity(input: TTDraftInput): {
  agentId: string;
  promptFile: string;
  promptVersion: string;
  systemPrompt: string;
} {
  return input.tool === "travel"
    ? {
        agentId: TT_TRAVEL_DRAFTER,
        promptFile: TT_TRAVEL_PROMPT_REGISTRATION.file,
        promptVersion: TT_TRAVEL_DRAFTING_PROMPT_VERSION,
        systemPrompt: TT_TRAVEL_DRAFTING_SYSTEM_PROMPT,
      }
    : {
        agentId: TT_TIME_DRAFTER,
        promptFile: TT_TIME_PROMPT_REGISTRATION.file,
        promptVersion: TT_TIME_DRAFTING_PROMPT_VERSION,
        systemPrompt: TT_TIME_DRAFTING_SYSTEM_PROMPT,
      };
}

export function useTTDraft(ctx: SovereignShellContext): UseTTDraft {
  const [status, setStatus] = useState<TTDraftStatus>("idle");
  const [outcome, setOutcome] = useState<TTDraftOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Per-session draft cache (Tier 2). Survives re-renders.
  const cacheRef = useRef<Map<string, TTDraft>>(new Map());

  const draft = useCallback(
    async (input: TTDraftInput): Promise<void> => {
      setStatus("drafting");
      setError(null);
      setOutcome(null);

      const identity = ttDrafterIdentity(input);
      const wsid = ttDraftWorkflowStepId(input);
      const actorId = ctx.auth.user.employee_id;

      const requestContext: SovereignRequestContext = {
        workflow_step_id: wsid,
        product: "SCRIBE",
        agent_id: identity.agentId,
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
          agent_id: identity.agentId,
          agent_class: "Operational",
          outcome: "tt_draft_started",
          payload: {
            prompt_file: identity.promptFile,
            prompt_version: identity.promptVersion,
            tool: input.tool,
            communication_type: ttCommunicationType(input),
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      const deps: TTDraftDeps = {
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

      const result = await runTTDraft(input, identity.systemPrompt, requestContext, deps);
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
            agent_id: identity.agentId,
            outcome: `tt_draft_${result.tier}_tier_served`,
            payload: {
              tool: input.tool,
              communication_type: result.draft.communication_type,
              tier: result.tier,
              reason: result.detail ?? "live_unavailable",
            },
          });
        }
        ctx.logger.log({
          event_type: "AGENT_STEP_COMPLETE",
          workflow_step_id: wsid,
          sovereign_tier: "standard",
          product: "SCRIBE",
          actor_id: actorId,
          agent_id: identity.agentId,
          agent_class: "Operational",
          outcome: `tt_draft_${result.tier}`,
          payload: {
            prompt_file: identity.promptFile,
            prompt_version: identity.promptVersion,
            tool: input.tool,
            communication_type: result.draft.communication_type,
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
        setError(
          `Logger emission failed — TT drafting halted (CPMI-VRS Gate 2): ${
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

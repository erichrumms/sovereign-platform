/**
 * SOVEREIGN Platform — module-scribe
 * useStyleProfile.ts — the SCRIBE Style DNA hook.
 *
 * Owns the single style-analysis LLM call (via createSovereignClient — never the
 * Anthropic API directly, Standing Constraint #5), validation VIA ctx.data, the
 * persistence port, and all Logger emission for Style DNA. Wraps the pure
 * style-engine.ts three-tier orchestration with the real api-client, a per-session
 * cache, the canonical validator off ctx.data.types, and an injected
 * StyleProfileStore (session-scoped this session — Project Principal, Session 6).
 *
 * VALIDATION VIA ctx.data: the canonical validateStyleProfile is read off
 * ctx.data.types (the frozen validator catalog the shell exposes — shell.ts), not
 * imported ad hoc, so the StyleProfile is validated through the shared data surface.
 *
 * Logger taxonomy — APPROVED EVENT TYPES ONLY (no STYLE_PROFILE_UPDATED, deferred):
 *   - AGENT_STEP_START / AGENT_STEP_COMPLETE bracket the scribe-style-analyst step
 *     (Analytical agent; agent_id + agent_class carried).
 *   - FALLBACK_ACTIVATED when a non-live tier serves the profile.
 *   - HUMAN_DECISION (decision_type HUMAN_APPROVAL) when the human approves STORAGE
 *     of the profile — the save is a human decision over personal (data
 *     classification: user) data; this gives an audit trail using an approved type
 *     while STYLE_PROFILE_UPDATED remains a deferred governance item.
 * Every event carries workflow_step_id (Standing Constraint #6).
 *
 * CPMI-VRS Gate 2: a failed Logger emit surfaces an error and does NOT continue.
 *
 * Version: 1.0 · Session 6 · June 17, 2026
 */

import { useCallback, useRef, useState } from "react";

import { createSovereignClient } from "@sovereign/api-client";
import type { SovereignRequestContext } from "@sovereign/api-client";
import type { StyleProfile } from "@sovereign/data";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  PR_SCRIBE_004,
  type StyleProfileStore,
  type StyleProfileValidator,
} from "./style-contract";
import { runStyleAnalysis, type StyleDeps, type StyleOutcome } from "./style-engine";
import { STYLE_ANALYSIS_SYSTEM_PROMPT, STYLE_ANALYSIS_PROMPT_VERSION } from "./prompts/style-analysis-system.prompt";
import { readAnthropicKey } from "./anthropic-key";

const SCRIBE_STYLE_ANALYST = "scribe-style-analyst";
const STYLE_WORKFLOW_STEP = "scribe-style-analysis-step-1";

export type StyleStatus = "idle" | "analyzing" | "analyzed" | "error";

export interface UseStyleProfile {
  status: StyleStatus;
  /** The analysis awaiting human approval (not yet stored). */
  candidate: StyleOutcome | null;
  /** The active stored profile for this user (drives drafting injection). */
  profile: StyleProfile | null;
  error: string | null;
  analyze: (samples: string) => Promise<void>;
  /** Human-gated storage. Returns true on a validated, stored, logged save. */
  save: (profile: StyleProfile) => boolean;
  reset: () => void;
}

/** Read the canonical StyleProfile validator off the frozen ctx.data.types catalog. */
function profileValidatorFromCtx(ctx: SovereignShellContext): StyleProfileValidator {
  const surface = ctx.data.types as { validateStyleProfile?: StyleProfileValidator };
  const fn = surface?.validateStyleProfile;
  if (typeof fn !== "function") {
    throw new Error("ctx.data.types.validateStyleProfile is unavailable — cannot validate StyleProfile via ctx.data.");
  }
  return fn;
}

export function useStyleProfile(ctx: SovereignShellContext, store: StyleProfileStore): UseStyleProfile {
  const userId = ctx.auth.user.employee_id;

  const [status, setStatus] = useState<StyleStatus>("idle");
  const [candidate, setCandidate] = useState<StyleOutcome | null>(null);
  const [profile, setProfile] = useState<StyleProfile | null>(() => store.read(userId));
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, StyleProfile>>(new Map());

  const analyze = useCallback(
    async (samples: string): Promise<void> => {
      setStatus("analyzing");
      setError(null);
      setCandidate(null);

      let validateProfile: StyleProfileValidator;
      try {
        validateProfile = profileValidatorFromCtx(ctx);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setStatus("error");
        return;
      }

      const requestContext: SovereignRequestContext = {
        workflow_step_id: STYLE_WORKFLOW_STEP,
        product: "SCRIBE",
        agent_id: SCRIBE_STYLE_ANALYST,
        tier: "standard",
      };

      // --- Gate 2: AGENT_STEP_START. A failed emit aborts. ---
      try {
        ctx.logger.log({
          event_type: "AGENT_STEP_START",
          workflow_step_id: STYLE_WORKFLOW_STEP,
          sovereign_tier: "standard",
          product: "SCRIBE",
          actor_id: userId,
          agent_id: SCRIBE_STYLE_ANALYST,
          agent_class: "Analytical",
          outcome: "style_analysis_started",
          payload: {
            registry_id: PR_SCRIBE_004.registryId,
            prompt_version: STYLE_ANALYSIS_PROMPT_VERSION,
            data_classification: "user",
            sample_chars: samples.length,
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      const deps: StyleDeps = {
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
        validateProfile,
        prior: store.read(userId),
        userId,
        now: () => new Date().toISOString(),
      };

      const result = await runStyleAnalysis(samples, STYLE_ANALYSIS_SYSTEM_PROMPT, requestContext, deps);
      const fellBack = result.tier !== "live";

      // --- Gate 2: FALLBACK_ACTIVATED (if degraded) + AGENT_STEP_COMPLETE ---
      try {
        if (fellBack) {
          ctx.logger.log({
            event_type: "FALLBACK_ACTIVATED",
            workflow_step_id: STYLE_WORKFLOW_STEP,
            sovereign_tier: "standard",
            product: "SCRIBE",
            actor_id: userId,
            agent_id: SCRIBE_STYLE_ANALYST,
            outcome: `style_${result.tier}_tier_served`,
            payload: { tier: result.tier, reason: result.detail ?? "live_unavailable", data_classification: "user" },
          });
        }
        ctx.logger.log({
          event_type: "AGENT_STEP_COMPLETE",
          workflow_step_id: STYLE_WORKFLOW_STEP,
          sovereign_tier: "standard",
          product: "SCRIBE",
          actor_id: userId,
          agent_id: SCRIBE_STYLE_ANALYST,
          agent_class: "Analytical",
          outcome: `style_${result.tier}`,
          payload: {
            registry_id: PR_SCRIBE_004.registryId,
            prompt_version: STYLE_ANALYSIS_PROMPT_VERSION,
            tier: result.tier,
            fallback_activated: fellBack,
            sample_count: result.profile.sample_count,
            data_classification: "user",
            detail: result.detail,
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      setCandidate(result);
      setStatus("analyzed");

      function surfaceLoggerError(err: unknown): void {
        setError(
          `Logger emission failed — style analysis halted (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        setStatus("error");
      }
    },
    [ctx, store, userId]
  );

  const save = useCallback(
    (toSave: StyleProfile): boolean => {
      setError(null);

      // --- Validate via ctx.data before storing (defense in depth) ---
      let validateProfile: StyleProfileValidator;
      try {
        validateProfile = profileValidatorFromCtx(ctx);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setStatus("error");
        return false;
      }
      const check = validateProfile(toSave);
      if (!check.valid) {
        setError(`StyleProfile failed validation — not stored: ${(check as { errors: string[] }).errors.join("; ")}`);
        setStatus("error");
        return false;
      }

      // --- Gate 2: the human's approval to store is a HUMAN_DECISION. Failed emit blocks the write. ---
      try {
        ctx.logger.log({
          event_type: "HUMAN_DECISION",
          workflow_step_id: STYLE_WORKFLOW_STEP,
          sovereign_tier: "standard",
          product: "SCRIBE",
          actor_id: userId,
          outcome: "style_profile_stored",
          decision_type: "HUMAN_APPROVAL",
          actor: "human",
          actor_name: ctx.auth.user.name,
          payload: {
            registry_id: PR_SCRIBE_004.registryId,
            prompt_version: STYLE_ANALYSIS_PROMPT_VERSION,
            data_classification: "user",
            sample_count: toSave.sample_count,
          },
        });
      } catch (err) {
        setError(
          `Logger emission failed — StyleProfile not stored (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        setStatus("error");
        return false;
      }

      // --- Logged → persist via the injected store port ---
      store.write(toSave);
      setProfile(toSave);
      setCandidate(null);
      setStatus("idle");
      return true;
    },
    [ctx, store, userId]
  );

  const reset = useCallback((): void => {
    setStatus("idle");
    setCandidate(null);
    setError(null);
  }, []);

  return { status, candidate, profile, error, analyze, save, reset };
}

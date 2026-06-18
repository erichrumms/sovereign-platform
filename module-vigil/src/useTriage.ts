/**
 * SOVEREIGN Platform — module-vigil
 * useTriage.ts — the Anomaly Triage Assistant hook.
 *
 * Owns the single triage LLM call (via createSovereignClient — never the Anthropic
 * API directly, Standing Constraint #5) and all Logger emission for triage. Wraps the
 * pure triage-engine.ts three-tier orchestration with the real api-client and a
 * per-session cache. One createSovereignClient().complete per triage session — no
 * chained calls (spec §3.4).
 *
 * Eligibility (spec §2.3): triage is offered ONLY for ANOMALY_DETECTED /
 * CPMI_DRIFT_DETECTED / CASCADE_RISK. The hook refuses other types (e.g. honeytoken)
 * without making a call. The operator reviews the assembled AnomalyContext before
 * calling runTriage (enforced at the component layer — spec §2.3).
 *
 * Logger taxonomy — APPROVED EVENT TYPES ONLY:
 *   - AGENT_STEP_START / AGENT_STEP_COMPLETE bracket the vigil-triage-analyst step
 *     (Monitoring agent; agent_id + agent_class carried).
 *   - FALLBACK_ACTIVATED when a non-live tier serves the brief.
 *   - TRIAGE_ANALYSIS_PRODUCED (GD-4) when a brief is produced and shown.
 * Every event carries workflow_step_id (Standing Constraint #6).
 *
 * CPMI-VRS Gate 2: a failed Logger emit surfaces an error and does NOT continue.
 *
 * Version: 1.0 · Session 7 · June 18, 2026
 */

import { useCallback, useRef, useState } from "react";

import { createSovereignClient } from "@sovereign/api-client";
import type { SovereignRequestContext } from "@sovereign/api-client";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import type { AnomalyContext } from "./vigil-types";
import { isTriageEligible, PR_VIGIL_001, type TriageBrief } from "./triage-contract";
import { runTriageAnalysis, type TriageDeps, type TriageOutcome } from "./triage-engine";
import { TRIAGE_ANALYSIS_SYSTEM_PROMPT, TRIAGE_ANALYSIS_PROMPT_VERSION } from "./prompts/triage-system.prompt";
import { readAnthropicKey } from "./anthropic-key";

const VIGIL_TRIAGE_ANALYST = "vigil-triage-analyst";

/** Per-alert workflow step id — ties the triage events to the specific alert. */
export function triageWorkflowStep(alertId: string): string {
  return `vigil-triage-${alertId}`;
}

export type TriageStatus = "idle" | "running" | "produced" | "error";

export interface UseTriage {
  status: TriageStatus;
  /** The produced brief (advisory) with its serving tier, or null. */
  outcome: TriageOutcome | null;
  error: string | null;
  /** Run triage for an operator-reviewed AnomalyContext. */
  runTriage: (context: AnomalyContext) => Promise<void>;
  reset: () => void;
}

export function useTriage(ctx: SovereignShellContext): UseTriage {
  const operatorId = ctx.auth.user.employee_id;

  const [status, setStatus] = useState<TriageStatus>("idle");
  const [outcome, setOutcome] = useState<TriageOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, TriageBrief>>(new Map());

  const runTriage = useCallback(
    async (context: AnomalyContext): Promise<void> => {
      setError(null);
      setOutcome(null);

      const alert = context.alert;

      // --- Eligibility (spec §2.3): refuse non-anomaly types without a call. ---
      if (!isTriageEligible(alert.alertType)) {
        setError(
          `Anomaly Triage Assistant is not available for ${alert.alertType} alerts ` +
            `(spec §2.3 — anomaly alert types only).`
        );
        setStatus("error");
        return;
      }

      setStatus("running");
      const workflowStep = triageWorkflowStep(alert.alertId);

      const requestContext: SovereignRequestContext = {
        workflow_step_id: workflowStep,
        product: "VIGIL",
        agent_id: VIGIL_TRIAGE_ANALYST,
        tier: "standard",
      };

      // --- Gate 2: AGENT_STEP_START. A failed emit aborts. ---
      try {
        ctx.logger.log({
          event_type: "AGENT_STEP_START",
          workflow_step_id: workflowStep,
          sovereign_tier: "standard",
          product: "VIGIL",
          actor_id: operatorId,
          agent_id: VIGIL_TRIAGE_ANALYST,
          agent_class: "Monitoring",
          outcome: "triage_started",
          payload: {
            registry_id: PR_VIGIL_001.registryId,
            prompt_version: TRIAGE_ANALYSIS_PROMPT_VERSION,
            alert_id: alert.alertId,
            alert_type: alert.alertType,
            alert_level: alert.alertLevel,
            source_product: alert.sourceProduct,
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      const deps: TriageDeps = {
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

      const result = await runTriageAnalysis(context, TRIAGE_ANALYSIS_SYSTEM_PROMPT, requestContext, deps);
      const fellBack = result.tier !== "live";

      // --- Gate 2: FALLBACK_ACTIVATED (if degraded) + AGENT_STEP_COMPLETE + TRIAGE_ANALYSIS_PRODUCED ---
      try {
        if (fellBack) {
          ctx.logger.log({
            event_type: "FALLBACK_ACTIVATED",
            workflow_step_id: workflowStep,
            sovereign_tier: "standard",
            product: "VIGIL",
            actor_id: operatorId,
            agent_id: VIGIL_TRIAGE_ANALYST,
            outcome: `triage_${result.tier}_tier_served`,
            payload: { tier: result.tier, reason: result.detail ?? "live_unavailable", alert_id: alert.alertId },
          });
        }
        ctx.logger.log({
          event_type: "AGENT_STEP_COMPLETE",
          workflow_step_id: workflowStep,
          sovereign_tier: "standard",
          product: "VIGIL",
          actor_id: operatorId,
          agent_id: VIGIL_TRIAGE_ANALYST,
          agent_class: "Monitoring",
          outcome: `triage_${result.tier}`,
          payload: {
            registry_id: PR_VIGIL_001.registryId,
            prompt_version: TRIAGE_ANALYSIS_PROMPT_VERSION,
            tier: result.tier,
            fallback_activated: fellBack,
            alert_id: alert.alertId,
            detail: result.detail,
          },
        });
        ctx.logger.log({
          event_type: "TRIAGE_ANALYSIS_PRODUCED",
          workflow_step_id: workflowStep,
          sovereign_tier: "standard",
          product: "VIGIL",
          actor_id: operatorId,
          agent_id: VIGIL_TRIAGE_ANALYST,
          outcome: "triage_brief_produced",
          payload: {
            registry_id: PR_VIGIL_001.registryId,
            prompt_version: TRIAGE_ANALYSIS_PROMPT_VERSION,
            alert_id: alert.alertId,
            alert_type: alert.alertType,
            tier: result.tier,
            false_positive_likelihood: result.brief.false_positive_likelihood,
            likely_cause_count: result.brief.likely_causes.length,
            recommended_step_count: result.brief.recommended_steps.length,
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      setOutcome(result);
      setStatus("produced");

      function surfaceLoggerError(err: unknown): void {
        setError(
          `Logger emission failed — triage halted (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        setStatus("error");
      }
    },
    [ctx, operatorId]
  );

  const reset = useCallback((): void => {
    setStatus("idle");
    setOutcome(null);
    setError(null);
  }, []);

  return { status, outcome, error, runTriage, reset };
}

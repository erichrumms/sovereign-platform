/**
 * SOVEREIGN Platform — module-vigil
 * useApprovalBrief.ts — generates the vigil-approval-agent brief for one request.
 *
 * Owns the single brief LLM call (via createSovereignClient — never the Anthropic API
 * directly, Standing Constraint #5) and the AGENT_STEP_* Logger emission. Wraps the pure
 * approval-engine three-tier orchestration with the real api-client and a per-session
 * cache. ONE createSovereignClient().complete per brief (spec §11 / done condition).
 *
 * Logger taxonomy — APPROVED EVENT TYPES ONLY:
 *   - AGENT_STEP_START / AGENT_STEP_COMPLETE bracket the vigil-approval-agent step
 *     (Monitoring agent).
 *   - FALLBACK_ACTIVATED when a non-live tier serves the brief.
 * Every event carries workflow_step_id `vigil-approval-<requestId>` (Constraint #6).
 * The brief is advisory — it emits NO decision event (those belong to useApprovalDecision).
 *
 * CPMI-VRS Gate 2: a failed Logger emit surfaces an error and does NOT continue.
 *
 * Version: 1.0 · Session 10 · June 23, 2026
 */

import { useCallback, useRef, useState } from "react";

import { createSovereignClient } from "@sovereign/api-client";
import type { SovereignRequestContext } from "@sovereign/api-client";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { approvalWorkflowStep, PR_VIGIL_002, type AgentApprovalRequest } from "./approval-contract";
import { runApprovalBrief, type BriefDeps, type BriefOutcome } from "./approval-engine";
import { APPROVAL_SYSTEM_PROMPT, APPROVAL_PROMPT_VERSION } from "./prompts/approval-system.prompt";
import { readAnthropicKey } from "./anthropic-key";

const VIGIL_APPROVAL_AGENT = "vigil-approval-agent";

export type BriefStatus = "idle" | "generating" | "ready" | "error";

export interface UseApprovalBrief {
  status: BriefStatus;
  outcome: BriefOutcome | null;
  error: string | null;
  generate: (request: AgentApprovalRequest) => Promise<void>;
  reset: () => void;
}

export function useApprovalBrief(ctx: SovereignShellContext): UseApprovalBrief {
  const operatorId = ctx.auth.user.employee_id;
  const [status, setStatus] = useState<BriefStatus>("idle");
  const [outcome, setOutcome] = useState<BriefOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());

  const generate = useCallback(
    async (request: AgentApprovalRequest): Promise<void> => {
      setError(null);
      setOutcome(null);
      setStatus("generating");

      const workflowStep = approvalWorkflowStep(request.request_id);
      const requestContext: SovereignRequestContext = {
        workflow_step_id: workflowStep,
        product: "VIGIL",
        agent_id: VIGIL_APPROVAL_AGENT,
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
          agent_id: VIGIL_APPROVAL_AGENT,
          agent_class: "Monitoring",
          outcome: "approval_brief_started",
          payload: {
            registry_id: PR_VIGIL_002.registryId,
            prompt_version: APPROVAL_PROMPT_VERSION,
            request_id: request.request_id,
            requesting_agent_id: request.requesting_agent_id,
            risk_classification: request.risk_classification,
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      const deps: BriefDeps = {
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

      const result = await runApprovalBrief(request, APPROVAL_SYSTEM_PROMPT, requestContext, deps);
      const fellBack = result.tier !== "live";

      // --- Gate 2: FALLBACK_ACTIVATED (if degraded) + AGENT_STEP_COMPLETE ---
      try {
        if (fellBack) {
          ctx.logger.log({
            event_type: "FALLBACK_ACTIVATED",
            workflow_step_id: workflowStep,
            sovereign_tier: "standard",
            product: "VIGIL",
            actor_id: operatorId,
            agent_id: VIGIL_APPROVAL_AGENT,
            outcome: `approval_brief_${result.tier}_tier_served`,
            payload: { request_id: request.request_id, tier: result.tier, reason: result.detail ?? "live_unavailable" },
          });
        }
        ctx.logger.log({
          event_type: "AGENT_STEP_COMPLETE",
          workflow_step_id: workflowStep,
          sovereign_tier: "standard",
          product: "VIGIL",
          actor_id: operatorId,
          agent_id: VIGIL_APPROVAL_AGENT,
          agent_class: "Monitoring",
          outcome: `approval_brief_${result.tier}`,
          payload: {
            registry_id: PR_VIGIL_002.registryId,
            prompt_version: APPROVAL_PROMPT_VERSION,
            request_id: request.request_id,
            tier: result.tier,
            fallback_activated: fellBack,
            detail: result.detail,
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      setOutcome(result);
      setStatus("ready");

      function surfaceLoggerError(err: unknown): void {
        setError(
          `Logger emission failed — brief halted (CPMI-VRS Gate 2): ${
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

  return { status, outcome, error, generate, reset };
}

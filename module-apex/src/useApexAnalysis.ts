/**
 * SOVEREIGN Platform — module-apex
 * useApexAnalysis.ts — the apex.ai-assistant hook.
 *
 * Owns the single analysis LLM call (via createSovereignClient — never the Anthropic API
 * directly, Constraint #5) and all Logger emission. Wraps the pure apex-analysis
 * orchestration with the real api-client. ONE createSovereignClient().complete per analysis
 * (spec §3 — no chained calls), traceable to one workflow_step_id (Constraint #6).
 *
 * Logger taxonomy (GD-16): APEX_ANALYSIS_STARTED on entry, APEX_ANALYSIS_COMPLETE on
 * completion (carrying schema_valid and the serving tier). CPMI-VRS Gate 2: a failed Logger
 * emit surfaces an error and does NOT continue.
 *
 * Version: 1.0 · Session 17 · June 25, 2026
 */

import { useCallback, useState } from "react";

import { createSovereignClient } from "@sovereign/api-client";
import type { SovereignRequestContext } from "@sovereign/api-client";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  APEX_AI_ASSISTANT,
  PR_APEX_001,
  analysisWorkflowStep,
  type ApexReportType,
} from "./apex-contract";
import { runApexAnalysis, type AnalysisDeps, type AnalysisOutcome } from "./apex-analysis";
import { createSyntheticApexDataAdapter, type ApexDataAdapter } from "./apex-data-adapter";
import { APEX_ASSISTANT_SYSTEM_PROMPT, APEX_ASSISTANT_PROMPT_VERSION } from "./prompts/apex-assistant.prompt";
import { readAnthropicKey } from "./anthropic-key";

export type AnalysisStatus = "idle" | "running" | "complete" | "error";

export interface UseApexAnalysis {
  status: AnalysisStatus;
  outcome: AnalysisOutcome | null;
  error: string | null;
  /** Run one analysis. Returns the outcome (also set in state), or null on error/abort. */
  runAnalysis: (programId: string, reportType: ApexReportType) => Promise<AnalysisOutcome | null>;
  reset: () => void;
}

export interface UseApexAnalysisOptions {
  /** Injectable data adapter. Defaults to the synthetic/dev backing. */
  adapter?: ApexDataAdapter;
  /** Injectable LLM call (tests). Defaults to createSovereignClient(). */
  complete?: AnalysisDeps["complete"];
}

export function useApexAnalysis(ctx: SovereignShellContext, opts: UseApexAnalysisOptions = {}): UseApexAnalysis {
  const actorId = ctx.auth.user.employee_id;
  const adapter = opts.adapter ?? createSyntheticApexDataAdapter();

  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [outcome, setOutcome] = useState<AnalysisOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(
    async (programId: string, reportType: ApexReportType): Promise<AnalysisOutcome | null> => {
      setError(null);
      setOutcome(null);

      const program = adapter.getProgram(programId);
      if (!program) {
        setError(`No program record for "${programId}".`);
        setStatus("error");
        return null;
      }

      const workflowStep = analysisWorkflowStep(programId, reportType);
      setStatus("running");

      // --- Gate 2: APEX_ANALYSIS_STARTED. A failed emit aborts. ---
      try {
        ctx.logger.log({
          event_type: "APEX_ANALYSIS_STARTED",
          workflow_step_id: workflowStep,
          sovereign_tier: "standard",
          product: "APEX",
          actor_id: actorId,
          agent_id: APEX_AI_ASSISTANT,
          outcome: "apex_analysis_started",
          payload: {
            registry_id: PR_APEX_001.registryId,
            prompt_version: APEX_ASSISTANT_PROMPT_VERSION,
            program_id: programId,
            report_type: reportType,
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      const requestContext: SovereignRequestContext = {
        workflow_step_id: workflowStep,
        product: "APEX",
        agent_id: APEX_AI_ASSISTANT,
        tier: "standard",
      };

      const deps: AnalysisDeps = {
        complete:
          opts.complete ??
          (async (messages, reqCtx) => {
            const client = createSovereignClient({ tier: "standard" }, { api_key_anthropic: readAnthropicKey() });
            return client.complete(messages, reqCtx);
          }),
      };

      const result = await runApexAnalysis(
        program,
        reportType,
        workflowStep,
        APEX_ASSISTANT_SYSTEM_PROMPT,
        requestContext,
        deps
      );

      // --- Gate 2: APEX_ANALYSIS_COMPLETE. A failed emit aborts. ---
      try {
        ctx.logger.log({
          event_type: "APEX_ANALYSIS_COMPLETE",
          workflow_step_id: workflowStep,
          sovereign_tier: "standard",
          product: "APEX",
          actor_id: actorId,
          agent_id: APEX_AI_ASSISTANT,
          outcome: `apex_analysis_${result.tier}`,
          payload: {
            program_id: programId,
            report_type: reportType,
            schema_valid: result.output.schema_valid,
            tier: result.tier,
            detail: result.detail,
          },
        });
      } catch (err) {
        return surfaceLoggerError(err);
      }

      setOutcome(result);
      setStatus("complete");
      return result;

      function surfaceLoggerError(err: unknown): null {
        setError(
          `Logger emission failed — APEX analysis halted (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        setStatus("error");
        return null;
      }
    },
    [ctx, actorId, adapter, opts.complete]
  );

  const reset = useCallback((): void => {
    setStatus("idle");
    setOutcome(null);
    setError(null);
  }, []);

  return { status, outcome, error, runAnalysis, reset };
}

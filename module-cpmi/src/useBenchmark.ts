/**
 * SOVEREIGN Platform — module-cpmi
 * useBenchmark.ts — the known-answer benchmark hook (Session 12, D1).
 *
 * Runs the benchmark suite — one createSovereignClient() per scenario chain (never the
 * Anthropic API directly, Standing Constraint #5) — and surfaces the BenchmarkReport.
 * Brackets the run with AGENT_STEP_START / AGENT_STEP_COMPLETE (approved event types
 * only; no new types this session) attributed to cpmi.reasoning-chain. Every event
 * carries workflow_step_id `cpmi-benchmark-<runId>` (Constraint #6). CPMI-VRS Gate 2: a
 * failed Logger emit surfaces an error and does NOT continue.
 *
 * The per-scenario chains run via the engine (validation runs); they do not each emit a
 * CPMI_REASONING_CHAIN_COMPLETE — that event is for production governance runs, not the
 * benchmark harness.
 *
 * Version: 1.0 · Session 12 · June 23, 2026
 */

import { useCallback, useRef, useState } from "react";

import { createSovereignClient } from "@sovereign/api-client";
import type { SovereignRequestContext } from "@sovereign/api-client";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { PR_CPMI_001 } from "./cpmi-contract";
import { runBenchmark, type BenchmarkReport, type ScenarioId } from "./benchmark";
import type { ReasoningDeps } from "./reasoning-engine";
import { readAnthropicKey } from "./anthropic-key";

const CPMI_REASONING_CHAIN = "cpmi.reasoning-chain";

export type BenchmarkStatus = "idle" | "running" | "complete" | "error";

export interface UseBenchmark {
  status: BenchmarkStatus;
  report: BenchmarkReport | null;
  error: string | null;
  run: () => Promise<void>;
  reset: () => void;
}

export interface UseBenchmarkOptions {
  /** Injectable LLM call (tests). Defaults to createSovereignClient(). */
  complete?: ReasoningDeps["complete"];
}

export function useBenchmark(ctx: SovereignShellContext, opts: UseBenchmarkOptions = {}): UseBenchmark {
  const actorId = ctx.auth.user.employee_id;
  const [status, setStatus] = useState<BenchmarkStatus>("idle");
  const [report, setReport] = useState<BenchmarkReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const seqRef = useRef(0);

  const run = useCallback(async (): Promise<void> => {
    setError(null);
    setReport(null);
    setStatus("running");

    const runId = `${++seqRef.current}`;
    const workflowStep = `cpmi-benchmark-${runId}`;
    const runAt = new Date().toISOString();

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
        outcome: "benchmark_started",
        payload: { registry_id: PR_CPMI_001.registryId, run_id: runId, scenarios: 3 },
      });
    } catch (err) {
      return surfaceLoggerError(err);
    }

    const cache = new Map();
    const deps: ReasoningDeps = {
      complete:
        opts.complete ??
        (async (messages, reqCtx) => {
          const client = createSovereignClient({ tier: "standard" }, { api_key_anthropic: readAnthropicKey() });
          return client.complete(messages, reqCtx);
        }),
      cacheGet: (key) => cache.get(key) ?? null,
      cacheSet: (key, value) => {
        cache.set(key, value);
      },
    };

    const requestContextFor = (scenarioId: ScenarioId): SovereignRequestContext => ({
      workflow_step_id: `${workflowStep}-${scenarioId}`,
      product: "CPMI",
      agent_id: CPMI_REASONING_CHAIN,
      tier: "standard",
    });

    const result = await runBenchmark(deps, requestContextFor, { runId, runAt });

    // --- Gate 2: AGENT_STEP_COMPLETE with the report summary. ---
    try {
      ctx.logger.log({
        event_type: "AGENT_STEP_COMPLETE",
        workflow_step_id: workflowStep,
        sovereign_tier: "standard",
        product: "CPMI",
        actor_id: actorId,
        agent_id: CPMI_REASONING_CHAIN,
        agent_class: "Governance",
        outcome: result.gate3_ready ? "benchmark_gate3_ready" : "benchmark_not_ready",
        payload: {
          registry_id: PR_CPMI_001.registryId,
          run_id: runId,
          scenarios_run: result.scenarios_run,
          schema_compliance_rate: result.schema_compliance_rate,
          step_completion_rate: result.step_completion_rate,
          gate3_ready: result.gate3_ready,
        },
      });
    } catch (err) {
      return surfaceLoggerError(err);
    }

    setReport(result);
    setStatus("complete");

    function surfaceLoggerError(err: unknown): void {
      setError(
        `Logger emission failed — benchmark halted (CPMI-VRS Gate 2): ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      setStatus("error");
    }
  }, [ctx, actorId, opts.complete]);

  const reset = useCallback((): void => {
    setStatus("idle");
    setReport(null);
    setError(null);
  }, []);

  return { status, report, error, run, reset };
}

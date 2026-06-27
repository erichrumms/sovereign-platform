/**
 * SOVEREIGN Platform — module-flowpath
 * useFlowpathElicitation.ts — the organizational-elicitation hook (flowpath.interviewer/mapper).
 *
 * Owns the collected five-question answers, the live Five-Question Gate status, and the artifact
 * production step. Production runs flowpath.mapper (via createSovereignClient — never the Anthropic
 * API directly, Constraint #5) and emits the four GD-18 artifact Logger events, each carrying
 * workflow_step_id (Constraint #6). Key-less runs (tests, air-gapped dev) take the deterministic
 * static tier.
 *
 * Version: 1.0 · Session 20 (D4) · June 26, 2026
 */

import { useCallback, useMemo, useState } from "react";

import { createSovereignClient } from "@sovereign/api-client";
import type { SovereignRequestContext } from "@sovereign/api-client";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  artifactWorkflowStep,
  evaluateFiveQuestionGate,
  FIVE_QUESTION_LABELS,
  FLOWPATH_MAPPER,
  PR_FLOWPATH_001,
  type FiveQuestionId,
  type FiveQuestionStatus,
  type FlowpathMapperOutput,
} from "./flowpath-contract";
import { runFlowpathMapper, type FiveAnswers, type MapperDeps } from "./flowpath-mapper";
import { ORG_ELICITATION_SYSTEM_PROMPT, ORG_ELICITATION_PROMPT_VERSION } from "./prompts/org-elicitation.prompt";
import { readAnthropicKey } from "./anthropic-key";

export const FIVE_QUESTION_ORDER: FiveQuestionId[] = ["WHO", "SEQUENCE", "CONDITIONS", "INPUTS_OUTPUTS", "TERMINAL"];

const EMPTY_ANSWERS: FiveAnswers = { WHO: "", SEQUENCE: "", CONDITIONS: "", INPUTS_OUTPUTS: "", TERMINAL: "" };

const ANSWER_GAP: Record<FiveQuestionId, string> = {
  WHO: "Name the role responsible for the work.",
  SEQUENCE: "Describe the order the steps happen in.",
  CONDITIONS: "State what triggers the work to begin.",
  INPUTS_OUTPUTS: "Say what the work receives and what it produces.",
  TERMINAL: "Describe the condition that confirms the work is complete.",
};

export type ProduceStatus = "idle" | "running" | "complete" | "error";

export interface UseFlowpathElicitation {
  answers: FiveAnswers;
  setAnswer: (q: FiveQuestionId, value: string) => void;
  gate: FiveQuestionStatus[];
  allAnswered: boolean;
  status: ProduceStatus;
  bundle: FlowpathMapperOutput | null;
  error: string | null;
  produceArtifact: () => Promise<FlowpathMapperOutput | null>;
}

export interface UseFlowpathElicitationOptions {
  sessionId: string;
  /** Injectable LLM call (tests). Defaults to createSovereignClient(). */
  complete?: MapperDeps["complete"];
}

export function useFlowpathElicitation(ctx: SovereignShellContext, opts: UseFlowpathElicitationOptions): UseFlowpathElicitation {
  const { sessionId } = opts;
  const actorId = ctx.auth.user.employee_id;

  const [answers, setAnswers] = useState<FiveAnswers>(EMPTY_ANSWERS);
  const [status, setStatus] = useState<ProduceStatus>("idle");
  const [bundle, setBundle] = useState<FlowpathMapperOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setAnswer = useCallback((q: FiveQuestionId, value: string): void => {
    setAnswers((prev) => ({ ...prev, [q]: value }));
  }, []);

  const gate = useMemo<FiveQuestionStatus[]>(
    () =>
      FIVE_QUESTION_ORDER.map((q) => {
        const answered = answers[q].trim() !== "";
        return { question: q, label: FIVE_QUESTION_LABELS[q], answered, gap: answered ? undefined : ANSWER_GAP[q] };
      }),
    [answers]
  );

  const allAnswered = useMemo(() => gate.every((g) => g.answered), [gate]);

  const produceArtifact = useCallback(async (): Promise<FlowpathMapperOutput | null> => {
    setError(null);
    if (!allAnswered) {
      setError("All five questions must be answered before a workflow artifact can be produced.");
      return null;
    }
    const workflowStep = artifactWorkflowStep(sessionId);
    setStatus("running");

    const requestContext: SovereignRequestContext = {
      workflow_step_id: workflowStep,
      product: "FLOWPATH",
      agent_id: FLOWPATH_MAPPER,
      tier: "standard",
    };
    const deps: MapperDeps = {
      complete:
        opts.complete ??
        (async (messages, reqCtx) => {
          const client = createSovereignClient({ tier: "standard" }, { api_key_anthropic: readAnthropicKey() });
          return client.complete(messages, reqCtx);
        }),
    };

    const outcome = await runFlowpathMapper(answers, sessionId, ORG_ELICITATION_SYSTEM_PROMPT, requestContext, deps);
    const result = outcome.bundle;

    // Defensive: confirm the produced artifact passes the Five-Question Gate before logging it.
    const gateResult = evaluateFiveQuestionGate(result.artifact);
    if (!gateResult.gate_passed) {
      ctx.logger.log({
        event_type: "FLOWPATH_GATE_FAILED",
        workflow_step_id: workflowStep,
        sovereign_tier: "standard",
        product: "FLOWPATH",
        actor_id: actorId,
        agent_id: FLOWPATH_MAPPER,
        outcome: "flowpath_gate_failed",
        payload: { session_id: sessionId, failed_questions: gateResult.failed_questions },
      });
      setError("The produced workflow did not pass the Five-Question Gate.");
      setStatus("error");
      return null;
    }

    // FLOWPATH_ARTIFACT_PRODUCED (spec §8).
    ctx.logger.log({
      event_type: "FLOWPATH_ARTIFACT_PRODUCED",
      workflow_step_id: workflowStep,
      sovereign_tier: "standard",
      product: "FLOWPATH",
      actor_id: actorId,
      agent_id: FLOWPATH_MAPPER,
      outcome: `flowpath_artifact_${outcome.tier}`,
      payload: { session_id: sessionId, artifact_type: result.artifact.workflow_type, prompt_version: ORG_ELICITATION_PROMPT_VERSION, registry_id: PR_FLOWPATH_001.registryId, tier: outcome.tier, detail: outcome.detail },
    });

    // FLOWPATH_VOCABULARY_CAPTURED (DC-7 calibration data).
    ctx.logger.log({
      event_type: "FLOWPATH_VOCABULARY_CAPTURED",
      workflow_step_id: workflowStep,
      sovereign_tier: "standard",
      product: "FLOWPATH",
      actor_id: actorId,
      agent_id: FLOWPATH_MAPPER,
      outcome: "flowpath_vocabulary_captured",
      payload: { session_id: sessionId, term_count: result.vocabulary.entries.length },
    });

    // FLOWPATH_DATASOURCE_REGISTERED (DC-6) — one event per registered source.
    for (const source of result.data_sources.sources) {
      ctx.logger.log({
        event_type: "FLOWPATH_DATASOURCE_REGISTERED",
        workflow_step_id: workflowStep,
        sovereign_tier: "standard",
        product: "FLOWPATH",
        actor_id: actorId,
        agent_id: FLOWPATH_MAPPER,
        outcome: "flowpath_datasource_registered",
        payload: { session_id: sessionId, source_name: source.source_name, source_type: source.source_type },
      });
    }

    // FLOWPATH_VALIDATION_CADENCE_SET (DC-5).
    ctx.logger.log({
      event_type: "FLOWPATH_VALIDATION_CADENCE_SET",
      workflow_step_id: workflowStep,
      sovereign_tier: "standard",
      product: "FLOWPATH",
      actor_id: actorId,
      agent_id: FLOWPATH_MAPPER,
      outcome: "flowpath_validation_cadence_set",
      payload: { session_id: sessionId, cadence_type: result.validation_cadence.cadence_type },
    });

    setBundle(result);
    setStatus("complete");
    return result;
  }, [allAnswered, answers, sessionId, ctx, actorId, opts.complete]);

  return { answers, setAnswer, gate, allAnswered, status, bundle, error, produceArtifact };
}

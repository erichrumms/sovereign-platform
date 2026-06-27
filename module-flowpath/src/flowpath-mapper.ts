/**
 * SOVEREIGN Platform — module-flowpath
 * flowpath-mapper.ts — the flowpath.mapper orchestration (pure, no React).
 *
 * flowpath.mapper converts interviewer answers into a structured WorkflowArtifact plus the
 * per-session calibration bundle (OrganizationalVocabulary, DataSourceRegistry,
 * ValidationCadenceRecord — spec §16). All LLM access is through createSovereignClient()
 * (Constraint #5); this module stays pure and takes the call as an injected dependency.
 *
 * Three-tier discipline (same family as APEX/CPMI): live (the model returns content that parses
 * AND passes the Five-Question Gate) → static (a deterministic, gate-passing artifact assembled
 * from the collected answers). Never throws. The static tier invents no workflow — every field is
 * derived from the SME's answers — so a key-less run (tests, air-gapped dev) is deterministic.
 *
 * Version: 1.0 · Session 20 (D4) · June 26, 2026
 */

import type {
  SovereignMessage,
  SovereignRequestContext,
  SovereignLLMResponse,
} from "@sovereign/api-client";

import {
  artifactWorkflowStep,
  evaluateFiveQuestionGate,
  type FiveQuestionId,
  type FlowpathMapperOutput,
  type WorkflowArtifact,
} from "./flowpath-contract";
import {
  SYNTHETIC_VOCABULARY,
  SYNTHETIC_DATA_SOURCES,
  SYNTHETIC_VALIDATION_CADENCE,
} from "./synthetic-elicitation";

/** The five domain-language answers collected during organizational elicitation. */
export type FiveAnswers = Record<FiveQuestionId, string>;

export type MapperTier = "live" | "static";

export interface MapperOutcome {
  bundle: FlowpathMapperOutput;
  tier: MapperTier;
  /** Why the static tier was used, when applicable (for the Logger payload). */
  detail?: string;
}

export interface MapperDeps {
  complete: (messages: SovereignMessage[], context: SovereignRequestContext) => Promise<SovereignLLMResponse>;
}

/** Build the two-message conversation: PR-FLOWPATH-001 system prompt + the collected answers. */
export function buildMapperMessages(
  answers: FiveAnswers,
  sessionId: string,
  workflowStep: string,
  systemPrompt: string
): SovereignMessage[] {
  const context = {
    session_id: sessionId,
    workflow_step_id: workflowStep,
    answers,
  };
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: JSON.stringify(context, null, 2) },
  ];
}

/** Parse the model output into a gate-passing WorkflowArtifact, or null. Tolerates a code fence. */
export function parseArtifact(content: string): WorkflowArtifact | null {
  const stripped = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  let obj: unknown;
  try {
    obj = JSON.parse(stripped);
  } catch {
    return null;
  }
  const a = obj as Partial<WorkflowArtifact>;
  if (!a || typeof a.title !== "string" || !Array.isArray(a.steps)) return null;
  const artifact = obj as WorkflowArtifact;
  return evaluateFiveQuestionGate(artifact).gate_passed ? artifact : null;
}

/**
 * The deterministic, gate-passing artifact assembled from the SME's answers. One step that
 * satisfies all five questions; the calibration bundle uses the session's captured vocabulary,
 * data sources, and validation cadence (synthetic in dev). Plain prose throughout (Gap 5).
 */
export function staticMapperBundle(
  answers: FiveAnswers,
  sessionId: string,
  workflowStep: string
): FlowpathMapperOutput {
  const artifact: WorkflowArtifact = {
    artifact_id: `WF-${sessionId}`,
    session_id: sessionId,
    workflow_type: "operational",
    title: answers.WHO ? `Elicited workflow — ${answers.WHO}` : "Elicited workflow",
    summary:
      `This workflow was elicited from the subject matter expert. ${answers.WHO} ` +
      `The work proceeds in the sequence the expert described, beginning under the stated ` +
      `conditions and ending when the terminal condition is met.`,
    steps: [
      {
        step_id: "ST-1",
        description: answers.WHO,
        responsible_role: extractRole(answers.WHO),
        sequence: 1,
        trigger_condition: answers.CONDITIONS,
        inputs: splitList(answers.INPUTS_OUTPUTS, "in"),
        outputs: splitList(answers.INPUTS_OUTPUTS, "out"),
        is_terminal: true,
      },
    ],
    terminal_condition: answers.TERMINAL,
    workflow_step_id: workflowStep,
  };

  return {
    artifact,
    vocabulary: { ...SYNTHETIC_VOCABULARY, session_id: sessionId },
    data_sources: { ...SYNTHETIC_DATA_SOURCES, session_id: sessionId },
    validation_cadence: { ...SYNTHETIC_VALIDATION_CADENCE, session_id: sessionId },
  };
}

function extractRole(whoAnswer: string): string {
  // Use the leading noun phrase as the responsible role; fall back to a generic role.
  const trimmed = whoAnswer.trim();
  return trimmed === "" ? "Responsible role" : trimmed.split(/[.,]/)[0].slice(0, 60);
}

function splitList(io: string, side: "in" | "out"): string[] {
  const value = io.trim();
  if (value === "") return side === "in" ? ["Stated inputs"] : ["Stated outputs"];
  return [value];
}

/** Run flowpath.mapper: try the live model, fall back to the deterministic static bundle. Never throws. */
export async function runFlowpathMapper(
  answers: FiveAnswers,
  sessionId: string,
  systemPrompt: string,
  requestContext: SovereignRequestContext,
  deps: MapperDeps
): Promise<MapperOutcome> {
  const workflowStep = artifactWorkflowStep(sessionId);
  const fallback = (detail: string): MapperOutcome => ({ bundle: staticMapperBundle(answers, sessionId, workflowStep), tier: "static", detail });

  try {
    const response = await deps.complete(buildMapperMessages(answers, sessionId, workflowStep, systemPrompt), requestContext);
    if (response.fallback_activated) return fallback(`provider fallback (${response.fallback_tier})`);
    const artifact = parseArtifact(response.content);
    if (!artifact) return fallback("model output did not parse to a gate-passing artifact");
    return {
      bundle: {
        artifact,
        vocabulary: { ...SYNTHETIC_VOCABULARY, session_id: sessionId },
        data_sources: { ...SYNTHETIC_DATA_SOURCES, session_id: sessionId },
        validation_cadence: { ...SYNTHETIC_VALIDATION_CADENCE, session_id: sessionId },
      },
      tier: "live",
    };
  } catch (err) {
    return fallback(`mapper call failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

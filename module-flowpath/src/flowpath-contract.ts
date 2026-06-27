/**
 * SOVEREIGN Platform — module-flowpath
 * flowpath-contract.ts — FLOWPATH data shapes, the Five-Question Gate, and GD-18 re-exports.
 *
 * FLOWPATH is the workflow-elicitation product and the entry point to the pipeline
 * (spec 15_FLOWPATH_Architecture.md). It elicits the REAL organizational workflow (not the
 * documented ideal) and the individual analyst workstyle, producing machine-readable artifacts
 * the rest of the platform governs and executes. All AI access is through createSovereignClient()
 * (Constraint #5); this module stays pure and takes the LLM call as an injected dependency.
 *
 * The user-scoped AnalystWorkstyleProfile (and its supporting types) is governance-frozen in the
 * shell contract (GD-18, v1.13); this module RE-EXPORTS it rather than redefining it (Standing
 * Constraint #2 — no divergent duplicate).
 *
 * PPBE forward-compatibility (spec §13): no FLOWPATH entity may use the reserved field names
 * fiscal_year / lifecycle_cost_estimate / obligation_plan / performance_baseline until PPBE
 * governance decisions D-P1..D-P6 are recorded.
 *
 * Version: 1.0 (FLOWPATH scaffold) · Session 20 · June 26, 2026
 */

import type {
  AnalystWorkstyleProfile,
  AnalystProgramExpertise,
  AnalystPersonalThreshold,
  AnalystVocabularyExtension,
  ProgramExpertiseDepth,
} from "../../sovereign-shell/shell-contract";

// --- GD-18 governance-frozen user-scoped schema (re-exported from the shell contract) ---
export type {
  AnalystWorkstyleProfile,
  AnalystProgramExpertise,
  AnalystPersonalThreshold,
  AnalystVocabularyExtension,
  ProgramExpertiseDepth,
};

// ============================================================
// AGENT REGISTRY CONSTANTS (Constraint #10)
// All six registered in Agent_Identity_Standard.md, Analytical class, June 2026 + Session 20.
// ============================================================

export const FLOWPATH_COORDINATOR = "flowpath.coordinator" as const;
export const FLOWPATH_INTERVIEWER = "flowpath.interviewer" as const;
export const FLOWPATH_MAPPER = "flowpath.mapper" as const;
export const FLOWPATH_VALIDATOR = "flowpath.validator" as const;
export const FLOWPATH_ANALYZER = "flowpath.analyzer" as const;
export const FLOWPATH_DOMAIN_TRANSLATOR = "flowpath.domain-translator" as const;

export const FLOWPATH_AGENT_IDS = [
  FLOWPATH_COORDINATOR,
  FLOWPATH_INTERVIEWER,
  FLOWPATH_MAPPER,
  FLOWPATH_VALIDATOR,
  FLOWPATH_ANALYZER,
  FLOWPATH_DOMAIN_TRANSLATOR,
] as const;

// ============================================================
// PROMPT REGISTRY CONSTANTS (Constraint #9 — all APPROVED June 26, 2026)
// ============================================================

export const PR_FLOWPATH_001 = { registryId: "PR-FLOWPATH-001", agentId: FLOWPATH_INTERVIEWER, mode: "organizational", status: "APPROVED" } as const;
export const PR_FLOWPATH_002 = { registryId: "PR-FLOWPATH-002", agentId: FLOWPATH_INTERVIEWER, mode: "individual", status: "APPROVED" } as const;
export const PR_FLOWPATH_003 = { registryId: "PR-FLOWPATH-003", agentId: FLOWPATH_VALIDATOR, mode: "completeness_gate", status: "APPROVED" } as const;
export const PR_FLOWPATH_004 = { registryId: "PR-FLOWPATH-004", agentId: FLOWPATH_ANALYZER, mode: "workflow_analysis", status: "APPROVED" } as const;

// ============================================================
// WORKFLOW ARTIFACT (the primary elicitation output)
// ============================================================

/** The kinds of workflow a FLOWPATH session elicits. */
export type WorkflowType = "operational" | "ppbe" | "validation_cadence" | "data_source_inventory";

/**
 * One step in an elicited workflow. The fields map to the Five-Question Completeness Gate
 * (spec §4): responsible_role = Q1 (who), sequence = Q2 (order), trigger_condition = Q3
 * (conditions), inputs/outputs = Q4, is_terminal = Q5 (when does it end).
 */
export interface WorkflowStep {
  step_id: string;
  description: string;          // plain prose (Gap 5)
  responsible_role: string;     // a ROLE, not a person
  sequence: number;             // 1-based order
  trigger_condition: string;    // what triggers this step
  inputs: string[];             // what it receives
  outputs: string[];            // what it produces
  is_terminal: boolean;         // true on the step that ends the workflow
}

/**
 * A structured, machine-readable workflow definition produced by flowpath.mapper. `summary` is
 * a plain-prose narrative (Gap 5) — the artifact is displayed as readable prose for human review,
 * never a schema dump.
 */
export interface WorkflowArtifact {
  artifact_id: string;
  session_id: string;
  workflow_type: WorkflowType;
  title: string;
  summary: string;
  steps: WorkflowStep[];
  terminal_condition: string;   // the verifiable state that confirms completion (Q5)
  workflow_step_id: string;
}

// ============================================================
// FIVE-QUESTION COMPLETENESS GATE (spec §4)
// ============================================================

export type FiveQuestionId = "WHO" | "SEQUENCE" | "CONDITIONS" | "INPUTS_OUTPUTS" | "TERMINAL";

export const FIVE_QUESTION_LABELS: Record<FiveQuestionId, string> = {
  WHO: "Who does what?",
  SEQUENCE: "In what sequence?",
  CONDITIONS: "Under what conditions?",
  INPUTS_OUTPUTS: "With what inputs and outputs?",
  TERMINAL: "When does it end?",
};

export interface FiveQuestionStatus {
  question: FiveQuestionId;
  label: string;
  answered: boolean;
  /** Plain-prose description of what is missing, when unanswered (Gap 5). */
  gap?: string;
}

export interface FiveQuestionGateResult {
  gate_passed: boolean;
  questions: FiveQuestionStatus[];
  failed_questions: FiveQuestionId[];
}

/**
 * Evaluate the Five-Question Completeness Gate against an artifact (spec §4). A workflow that
 * fails the gate is not a workflow — it is a narrative; no artifact is committed until it passes.
 * Pure and deterministic. Empty (no steps) fails every applicable question.
 */
export function evaluateFiveQuestionGate(artifact: WorkflowArtifact): FiveQuestionGateResult {
  const steps = artifact.steps;
  const hasSteps = steps.length > 0;

  const whoOk = hasSteps && steps.every((s) => s.responsible_role.trim() !== "");
  const sequenceOk =
    hasSteps &&
    new Set(steps.map((s) => s.sequence)).size === steps.length &&
    steps.every((s) => Number.isInteger(s.sequence) && s.sequence > 0);
  const conditionsOk = hasSteps && steps.every((s) => s.trigger_condition.trim() !== "");
  const ioOk = hasSteps && steps.every((s) => s.inputs.length > 0 && s.outputs.length > 0);
  const terminalOk = steps.some((s) => s.is_terminal) && artifact.terminal_condition.trim() !== "";

  const questions: FiveQuestionStatus[] = [
    { question: "WHO", label: FIVE_QUESTION_LABELS.WHO, answered: whoOk, gap: whoOk ? undefined : "One or more steps do not name the role responsible for completing them." },
    { question: "SEQUENCE", label: FIVE_QUESTION_LABELS.SEQUENCE, answered: sequenceOk, gap: sequenceOk ? undefined : "The order of steps is ambiguous — each step needs a unique position in the sequence." },
    { question: "CONDITIONS", label: FIVE_QUESTION_LABELS.CONDITIONS, answered: conditionsOk, gap: conditionsOk ? undefined : "One or more steps do not state the condition that triggers them." },
    { question: "INPUTS_OUTPUTS", label: FIVE_QUESTION_LABELS.INPUTS_OUTPUTS, answered: ioOk, gap: ioOk ? undefined : "One or more steps do not identify what they receive and what they produce." },
    { question: "TERMINAL", label: FIVE_QUESTION_LABELS.TERMINAL, answered: terminalOk, gap: terminalOk ? undefined : "The workflow does not name a verifiable terminal condition that confirms it is complete." },
  ];

  const failed_questions = questions.filter((q) => !q.answered).map((q) => q.question);
  return { gate_passed: failed_questions.length === 0, questions, failed_questions };
}

// ============================================================
// CALIBRATION + DC-5/DC-6 ARTIFACTS (produced alongside the workflow artifact)
// ============================================================

/** One organizational vocabulary term with its definition and (optionally) its concern threshold. */
export interface VocabularyEntry {
  term: string;
  definition: string;           // plain prose (Gap 5)
  threshold?: string;           // the value that triggers concern, plain prose (e.g. "8 percent")
}

/**
 * The organization's analytical vocabulary (DC-7 calibration data). Tagged
 * data_classification: user (spec §13) — it reflects how a specific organization thinks; it is
 * NOT World Model / governance data.
 */
export interface OrganizationalVocabulary {
  session_id: string;
  entries: VocabularyEntry[];
  data_classification: "user";
}

/** One authoritative source system a workflow draws on (DC-6). Configuration, not a live connection. */
export interface DataSourceEntry {
  source_name: string;          // e.g. "Oracle Financials"
  source_type: string;          // accounting | payroll | travel | contract_management | erp
  data_elements: string[];      // the data elements it provides
  update_frequency: string;     // plain prose (e.g. "nightly")
  integration_path: string;     // deployment-time config descriptor — NOT a build dependency
}

/** The enumeration of authoritative source systems for a workflow (DC-6 — APEX data spec). */
export interface DataSourceRegistry {
  session_id: string;
  sources: DataSourceEntry[];
}

/**
 * The organization's operational validation cadence (DC-5). FLOWPATH elicits it; APEX executes
 * it and logs VALIDATION_SIGN_OFF when the assigned analyst signs off.
 */
export interface ValidationCadenceRecord {
  session_id: string;
  cadence_type: string;         // monthly | quarterly | before_each_qpr
  what_is_validated: string;    // which programs / which metrics (plain prose)
  responsible_role: string;     // named role that signs off
  sign_off_requirement: string; // what the sign-off requires (plain prose)
  downstream_decisions: string; // what the validated output feeds (plain prose)
}

/** The mapper's per-session output bundle (spec §16). */
export interface FlowpathMapperOutput {
  artifact: WorkflowArtifact;
  vocabulary: OrganizationalVocabulary;
  data_sources: DataSourceRegistry;
  validation_cadence: ValidationCadenceRecord;
}

// ============================================================
// FLOWPATH ANALYZER OUTPUT (flowpath.analyzer — advisory only)
// ============================================================

export type FlowpathFindingCategory = "BOTTLENECK" | "EXCEPTION_PATH" | "DEPENDENCY_RISK";

export interface FlowpathFinding {
  finding_id: string;
  category: FlowpathFindingCategory;
  description: string;          // plain prose (Gap 5)
  affected_step_id?: string;
}

/** The structured output of one flowpath.analyzer run. Advisory — never modifies the workflow. */
export interface FlowpathAnalysisOutput {
  artifact_id: string;
  findings: FlowpathFinding[];
  schema_valid: boolean;
  workflow_step_id: string;
}

// ============================================================
// ELICITATION SESSION (Screen 1 surface model)
// ============================================================

export type SessionStatus = "IN_PROGRESS" | "GATE_PENDING" | "COMPLETE";

export interface ElicitationSession {
  session_id: string;
  workflow_type: WorkflowType;
  expert_role: string;          // the SME / participant role
  date: string;                 // ISO date (plain-prose rendered)
  status: SessionStatus;
  gate_passed: boolean;
}

// ============================================================
// WORKFLOW STEP IDS (Constraint #6 — workflow_step_id on every Logger event)
// ============================================================

export function sessionWorkflowStep(sessionId: string): string {
  return `flowpath-session-${sessionId}`;
}

export function artifactWorkflowStep(sessionId: string): string {
  return `flowpath-artifact-${sessionId}`;
}

export function workstyleWorkflowStep(analystIdHash: string): string {
  return `flowpath-workstyle-${analystIdHash}`;
}

// ============================================================
// ANALYST IDENTITY HASHING (privacy — §5a Guarantee 2)
// analyst_id is NEVER stored or logged in cleartext. This is a one-way, per-user-salted hash
// (deterministic so the owner's authenticated session can recompute its own key). The synthetic
// platform uses a stable FNV-1a hash; a deployment substitutes a cryptographic per-user salt +
// hash at the data layer. No platform query can reverse it.
// ============================================================

export function hashAnalystId(analystId: string, salt = "flowpath-user-salt"): string {
  const input = `${salt}:${analystId}`;
  let h = 0x811c9dc5; // FNV-1a 32-bit offset basis
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `anon-${h.toString(16).padStart(8, "0")}`;
}

// ============================================================
// BOUNDARY VALIDATION (flowpath.validator — §5a "Balancing ... Layers")
// A personal threshold must be AT LEAST as sensitive as the organizational standard — never
// looser. We compare the leading numeric value parsed from each plain-prose threshold; a tighter
// (smaller) or equal personal value is allowed, a looser (larger) one is a boundary conflict.
// ============================================================

export interface ThresholdBoundaryConflict {
  metric: string;
  personal_value: string;
  organizational_value: string;
  /** Plain-prose explanation surfaced to the analyst (Gap 5). */
  message: string;
}

function leadingNumber(value: string): number | null {
  const m = value.match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

/**
 * Returns the boundary conflicts (personal threshold looser than the organizational standard).
 * Empty array = the profile is within organizational boundaries and may be saved.
 */
export function findThresholdBoundaryConflicts(
  personal: AnalystPersonalThreshold[],
  organizational: VocabularyEntry[]
): ThresholdBoundaryConflict[] {
  const orgByMetric = new Map<string, string>();
  for (const e of organizational) {
    if (e.threshold) orgByMetric.set(e.term.toLowerCase(), e.threshold);
  }
  const conflicts: ThresholdBoundaryConflict[] = [];
  for (const p of personal) {
    const orgValue = orgByMetric.get(p.metric.toLowerCase());
    if (!orgValue) continue;
    const pv = leadingNumber(p.value);
    const ov = leadingNumber(orgValue);
    if (pv === null || ov === null) continue;
    // A higher personal value triggers concern LATER → looser → conflict.
    if (pv > ov) {
      conflicts.push({
        metric: p.metric,
        personal_value: p.value,
        organizational_value: orgValue,
        message: `Your personal ${p.metric} threshold is ${p.value}, but the organizational standard is ${orgValue}. This means the platform would alert you later than your colleagues on ${p.metric} findings. Please tighten your threshold to at least the organizational standard before saving.`,
      });
    }
  }
  return conflicts;
}

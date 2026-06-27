/**
 * SOVEREIGN Platform — module-flowpath
 * benchmark-scenarios.ts — the three CPMI-VRS known-answer benchmarks (spec §9, D-FLOWPATH-5).
 *
 * Gate 2 (Reasoning Transparency) for FLOWPATH requires three benchmark elicitation scenarios with
 * known expected characteristics. Each is a deterministic, schema-valid, gate-passing
 * WorkflowArtifact bundle (no network — reproducible, available for Project Principal review during
 * Walkthrough C):
 *   - Scenario A — a simple two-step operational workflow (submission → review/sign-off), no branch.
 *   - Scenario B — a workflow with a conditional branch (variance > 10% → escalate; ≤ 10% →
 *     self-certify) and an external accounting-system dependency (a registered DataSourceEntry).
 *   - Scenario C — a PPBE Phase 1 (Strategic Direction) workflow with multiple stakeholders, an
 *     OrganizationalVocabulary, and a ValidationCadenceRecord.
 *
 * Every produced artifact passes the Five-Question Completeness Gate (spec §4) and is structurally
 * schema-valid. No PPBE reserved field names are used (fiscal_year / lifecycle_cost_estimate /
 * obligation_plan / performance_baseline — spec §13); Scenario C is an elicitation benchmark only —
 * it does NOT build the PPBE-specific artifact types, which await governance decisions D-P1..D-P6.
 *
 * Version: 1.0 · Session 21 (D2) · June 26, 2026
 */

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  FLOWPATH_COORDINATOR,
  FLOWPATH_MAPPER,
  artifactWorkflowStep,
  sessionWorkflowStep,
  evaluateFiveQuestionGate,
  type DataSourceRegistry,
  type FlowpathMapperOutput,
  type OrganizationalVocabulary,
  type ValidationCadenceRecord,
  type WorkflowArtifact,
  type WorkflowType,
} from "./flowpath-contract";

export type BenchmarkId = "A" | "B" | "C";

export interface FlowpathBenchmarkScenario {
  id: BenchmarkId;
  label: string;
  workflow_type: WorkflowType;
  /** Plain-prose statement of what a correct output should contain (Gap 5). */
  expectation: string;
}

export const FLOWPATH_BENCHMARK_SCENARIOS: readonly FlowpathBenchmarkScenario[] = [
  {
    id: "A",
    label: "Simple two-step operational workflow",
    workflow_type: "operational",
    expectation:
      "A complete two-step workflow — a program analyst submits a compliance document, a compliance " +
      "officer reviews and signs off — with no branches and all five completeness questions answered.",
  },
  {
    id: "B",
    label: "Conditional branch with an external dependency",
    workflow_type: "operational",
    expectation:
      "A budget variance review that branches on the variance amount — over 10 percent escalates to " +
      "the CFO, 10 percent or under self-certifies — and draws obligation records from the accounting " +
      "system, which is registered as a data source.",
  },
  {
    id: "C",
    label: "PPBE Phase 1 strategic direction with multiple stakeholders",
    workflow_type: "ppbe",
    expectation:
      "A strategic direction session involving a program executive, a budget analyst, and a " +
      "contracting officer, producing the organizational vocabulary it uses and the validation " +
      "cadence by which its outputs are checked.",
  },
];

// ── Scenario A ─────────────────────────────────────────────────────────────
function scenarioA(): FlowpathMapperOutput {
  const sessionId = "S-BENCH-A";
  const artifact: WorkflowArtifact = {
    artifact_id: "WF-BENCH-A",
    session_id: sessionId,
    workflow_type: "operational",
    title: "Compliance Document Review",
    summary:
      "A program analyst submits a compliance document for review, and a compliance officer reviews " +
      "it and records a sign-off. The work is complete once the compliance officer has signed off.",
    steps: [
      {
        step_id: "A-1",
        description: "The program analyst submits the completed compliance document for review.",
        responsible_role: "Program Analyst",
        sequence: 1,
        trigger_condition: "A compliance document is due for periodic review.",
        inputs: ["Completed compliance document"],
        outputs: ["Submitted document awaiting review"],
        is_terminal: false,
      },
      {
        step_id: "A-2",
        description: "The compliance officer reviews the submitted document and records a sign-off.",
        responsible_role: "Compliance Officer",
        sequence: 2,
        trigger_condition: "A compliance document has been submitted for review.",
        inputs: ["Submitted document awaiting review"],
        outputs: ["Recorded compliance sign-off"],
        is_terminal: true,
      },
    ],
    terminal_condition: "The compliance officer has recorded a sign-off on the document.",
    workflow_step_id: artifactWorkflowStep(sessionId),
  };
  return { artifact, vocabulary: vocabularyA(sessionId), data_sources: emptyDataSources(sessionId), validation_cadence: cadenceA(sessionId) };
}

function vocabularyA(sessionId: string): OrganizationalVocabulary {
  return {
    session_id: sessionId,
    entries: [
      { term: "sign-off", definition: "A compliance officer's recorded confirmation that a document meets requirements." },
    ],
    data_classification: "user",
  };
}

function cadenceA(sessionId: string): ValidationCadenceRecord {
  return {
    session_id: sessionId,
    cadence_type: "quarterly",
    what_is_validated: "Compliance sign-offs are reviewed each quarter against the source documents.",
    responsible_role: "Compliance Officer",
    sign_off_requirement: "Confirmation that each signed-off document is on file and current.",
    downstream_decisions: "The validated sign-offs feed the quarterly compliance attestation.",
  };
}

// ── Scenario B — conditional branch + external dependency ───────────────────
function scenarioB(): FlowpathMapperOutput {
  const sessionId = "S-BENCH-B";
  const artifact: WorkflowArtifact = {
    artifact_id: "WF-BENCH-B",
    session_id: sessionId,
    workflow_type: "operational",
    title: "Budget Variance Review",
    summary:
      "A program manager initiates a budget variance review using obligation records from the " +
      "accounting system. If the variance exceeds 10 percent the review escalates to the CFO; " +
      "otherwise the program manager self-certifies. The work is complete once the variance has " +
      "either been escalated to the CFO or self-certified.",
    steps: [
      {
        step_id: "B-1",
        description: "The program manager initiates a budget variance review and pulls the latest obligation records.",
        responsible_role: "Program Manager",
        sequence: 1,
        trigger_condition: "The monthly accounting close has completed.",
        inputs: ["Obligation records from the accounting system", "Program spend plan"],
        outputs: ["Computed budget variance"],
        is_terminal: false,
      },
      {
        step_id: "B-2",
        description: "When the variance exceeds 10 percent, the program manager escalates the review to the CFO for disposition.",
        responsible_role: "Chief Financial Officer",
        sequence: 2,
        trigger_condition: "The computed budget variance is greater than 10 percent.",
        inputs: ["Computed budget variance"],
        outputs: ["CFO disposition of the variance"],
        is_terminal: true,
      },
      {
        step_id: "B-3",
        description: "When the variance is 10 percent or under, the program manager self-certifies the variance with a short note.",
        responsible_role: "Program Manager",
        sequence: 3,
        trigger_condition: "The computed budget variance is 10 percent or under.",
        inputs: ["Computed budget variance"],
        outputs: ["Self-certified variance note"],
        is_terminal: true,
      },
    ],
    terminal_condition: "The variance has been either escalated to the CFO or self-certified by the program manager.",
    workflow_step_id: artifactWorkflowStep(sessionId),
  };
  const data_sources: DataSourceRegistry = {
    session_id: sessionId,
    sources: [
      {
        source_name: "Oracle Financials",
        source_type: "accounting",
        data_elements: ["Obligation records", "Spend plan baselines"],
        update_frequency: "nightly",
        integration_path: "Deployment-time configuration — registered, not connected at build.",
      },
    ],
  };
  return { artifact, vocabulary: vocabularyB(sessionId), data_sources, validation_cadence: cadenceB(sessionId) };
}

function vocabularyB(sessionId: string): OrganizationalVocabulary {
  return {
    session_id: sessionId,
    entries: [
      { term: "budget variance", definition: "The percentage difference between actual obligations and the program spend plan.", threshold: "10 percent" },
      { term: "self-certify", definition: "A program manager's recorded confirmation that a within-threshold variance needs no escalation." },
    ],
    data_classification: "user",
  };
}

function cadenceB(sessionId: string): ValidationCadenceRecord {
  return {
    session_id: sessionId,
    cadence_type: "monthly",
    what_is_validated: "Budget variance computations are checked each month against the obligation records.",
    responsible_role: "Senior Budget Analyst",
    sign_off_requirement: "Recomputation of the variance from the source obligation records, with a confirmation note.",
    downstream_decisions: "The validated variances feed escalation decisions and the monthly status report.",
  };
}

// ── Scenario C — PPBE Phase 1 strategic direction, multiple stakeholders ────
function scenarioC(): FlowpathMapperOutput {
  const sessionId = "S-BENCH-C";
  const artifact: WorkflowArtifact = {
    artifact_id: "WF-BENCH-C",
    session_id: sessionId,
    workflow_type: "ppbe",
    title: "PPBE Phase 1 — Strategic Direction Session",
    summary:
      "In the strategic direction phase, a program executive sets the strategic priorities, a budget " +
      "analyst frames the resource picture against those priorities, and a contracting officer assesses " +
      "the acquisition implications. The work is complete once the strategic direction has been " +
      "recorded and acknowledged by all three stakeholders.",
    steps: [
      {
        step_id: "C-1",
        description: "The program executive states the strategic priorities for the coming cycle.",
        responsible_role: "Program Executive",
        sequence: 1,
        trigger_condition: "The strategic direction phase of the cycle has opened.",
        inputs: ["Prior-cycle strategic guidance", "Mission priorities"],
        outputs: ["Stated strategic priorities"],
        is_terminal: false,
      },
      {
        step_id: "C-2",
        description: "The budget analyst frames the available resources against the stated strategic priorities.",
        responsible_role: "Budget Analyst",
        sequence: 2,
        trigger_condition: "The program executive has stated the strategic priorities.",
        inputs: ["Stated strategic priorities", "Available resource picture"],
        outputs: ["Resource framing against priorities"],
        is_terminal: false,
      },
      {
        step_id: "C-3",
        description: "The contracting officer assesses the acquisition implications of the framed priorities and records the strategic direction.",
        responsible_role: "Contracting Officer",
        sequence: 3,
        trigger_condition: "The budget analyst has framed the resources against the priorities.",
        inputs: ["Resource framing against priorities"],
        outputs: ["Recorded strategic direction acknowledged by all stakeholders"],
        is_terminal: true,
      },
    ],
    terminal_condition: "The strategic direction has been recorded and acknowledged by the program executive, the budget analyst, and the contracting officer.",
    workflow_step_id: artifactWorkflowStep(sessionId),
  };
  return { artifact, vocabulary: vocabularyC(sessionId), data_sources: emptyDataSources(sessionId), validation_cadence: cadenceC(sessionId) };
}

function vocabularyC(sessionId: string): OrganizationalVocabulary {
  return {
    session_id: sessionId,
    entries: [
      { term: "strategic priority", definition: "A mission outcome the program executive designates as taking precedence in resource decisions." },
      { term: "resource framing", definition: "The budget analyst's mapping of available resources onto the stated strategic priorities." },
      { term: "strategic direction", definition: "The recorded, stakeholder-acknowledged outcome of the Phase 1 session." },
    ],
    data_classification: "user",
  };
}

function cadenceC(sessionId: string): ValidationCadenceRecord {
  return {
    session_id: sessionId,
    cadence_type: "before_each_qpr",
    what_is_validated: "The recorded strategic direction is reviewed before each quarterly program review for continued alignment.",
    responsible_role: "Program Executive",
    sign_off_requirement: "Confirmation that the strategic priorities still reflect mission guidance, with a short note on any change.",
    downstream_decisions: "The validated strategic direction anchors the programming and trade-off decisions in later phases.",
  };
}

function emptyDataSources(sessionId: string): DataSourceRegistry {
  return { session_id: sessionId, sources: [] };
}

const BUILDERS: Record<BenchmarkId, () => FlowpathMapperOutput> = { A: scenarioA, B: scenarioB, C: scenarioC };

/** Build one benchmark scenario's bundle (deterministic). */
export function buildBenchmarkBundle(id: BenchmarkId): FlowpathMapperOutput {
  return BUILDERS[id]();
}

export interface FlowpathBenchmarkResult {
  scenario: FlowpathBenchmarkScenario;
  bundle: FlowpathMapperOutput;
  gate_passed: boolean;
  schema_valid: boolean;
}

/**
 * Structural schema validity for a WorkflowArtifact: all required fields present and well-typed,
 * every step complete, and the Five-Question Gate passes. (The WorkflowArtifact shape has no
 * `schema_valid` field of its own — unlike APEX's ApexAnalysisOutput — so we assert it here.)
 */
export function isSchemaValidArtifact(artifact: WorkflowArtifact): boolean {
  if (typeof artifact.artifact_id !== "string" || artifact.artifact_id.trim() === "") return false;
  if (typeof artifact.session_id !== "string" || artifact.session_id.trim() === "") return false;
  if (typeof artifact.title !== "string" || artifact.title.trim() === "") return false;
  if (typeof artifact.summary !== "string" || artifact.summary.trim() === "") return false;
  if (typeof artifact.terminal_condition !== "string" || artifact.terminal_condition.trim() === "") return false;
  if (typeof artifact.workflow_step_id !== "string" || artifact.workflow_step_id.trim() === "") return false;
  if (!Array.isArray(artifact.steps) || artifact.steps.length === 0) return false;
  const stepsOk = artifact.steps.every(
    (s) =>
      typeof s.step_id === "string" && s.step_id.trim() !== "" &&
      typeof s.description === "string" && s.description.trim() !== "" &&
      typeof s.responsible_role === "string" && s.responsible_role.trim() !== "" &&
      Number.isInteger(s.sequence) && s.sequence > 0 &&
      typeof s.trigger_condition === "string" && s.trigger_condition.trim() !== "" &&
      Array.isArray(s.inputs) && s.inputs.length > 0 &&
      Array.isArray(s.outputs) && s.outputs.length > 0 &&
      typeof s.is_terminal === "boolean"
  );
  if (!stepsOk) return false;
  return evaluateFiveQuestionGate(artifact).gate_passed;
}

/** Evaluate one benchmark scenario (pure — no Logger emission). */
export function evaluateBenchmark(id: BenchmarkId): FlowpathBenchmarkResult {
  const scenario = FLOWPATH_BENCHMARK_SCENARIOS.find((s) => s.id === id)!;
  const bundle = buildBenchmarkBundle(id);
  return {
    scenario,
    bundle,
    gate_passed: evaluateFiveQuestionGate(bundle.artifact).gate_passed,
    schema_valid: isSchemaValidArtifact(bundle.artifact),
  };
}

/** Evaluate all three benchmark scenarios (A, B, C). */
export function evaluateAllBenchmarks(): FlowpathBenchmarkResult[] {
  return FLOWPATH_BENCHMARK_SCENARIOS.map((s) => evaluateBenchmark(s.id));
}

/**
 * Run one benchmark scenario through the elicitation lifecycle, emitting the Logger events a real
 * session would: FLOWPATH_SESSION_STARTED, FLOWPATH_ARTIFACT_PRODUCED, FLOWPATH_SESSION_COMPLETE —
 * each carrying workflow_step_id (Constraint #6). Returns the evaluated result.
 */
export function runFlowpathBenchmark(ctx: SovereignShellContext, id: BenchmarkId): FlowpathBenchmarkResult {
  const result = evaluateBenchmark(id);
  const { bundle } = result;
  const sessionId = bundle.artifact.session_id;
  const sessionStep = sessionWorkflowStep(sessionId);
  const artifactStep = artifactWorkflowStep(sessionId);
  const actorId = ctx.auth.user.employee_id;

  ctx.logger.log({
    event_type: "FLOWPATH_SESSION_STARTED",
    workflow_step_id: sessionStep,
    sovereign_tier: "standard",
    product: "FLOWPATH",
    actor_id: actorId,
    agent_id: FLOWPATH_COORDINATOR,
    outcome: "flowpath_benchmark_session_started",
    payload: { session_id: sessionId, workflow_type: bundle.artifact.workflow_type, benchmark: id },
  });
  ctx.logger.log({
    event_type: "FLOWPATH_ARTIFACT_PRODUCED",
    workflow_step_id: artifactStep,
    sovereign_tier: "standard",
    product: "FLOWPATH",
    actor_id: actorId,
    agent_id: FLOWPATH_MAPPER,
    outcome: "flowpath_benchmark_artifact_produced",
    payload: { session_id: sessionId, artifact_type: bundle.artifact.workflow_type, benchmark: id, schema_valid: result.schema_valid },
  });
  ctx.logger.log({
    event_type: "FLOWPATH_SESSION_COMPLETE",
    workflow_step_id: sessionStep,
    sovereign_tier: "standard",
    product: "FLOWPATH",
    actor_id: actorId,
    agent_id: FLOWPATH_COORDINATOR,
    outcome: "flowpath_benchmark_session_complete",
    payload: { session_id: sessionId, gate_passed: result.gate_passed, benchmark: id },
  });
  return result;
}

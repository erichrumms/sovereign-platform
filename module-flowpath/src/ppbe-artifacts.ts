/**
 * SOVEREIGN Platform — module-flowpath
 * ppbe-artifacts.ts — PPBE workflow layer, Session 31 (PPBE Build Session 1 — Core Integration).
 *
 * The four PPBE workflow artifact types FLOWPATH elicits and structures against the
 * data dictionary (docs/18 §7.1; architecture doc §5.1): Phase Workflow Artifacts,
 * Dependency Maps, Decision Criteria Artifacts, and Governance Calendar Artifacts.
 *
 * Built ADDITIVELY on the existing FLOWPATH elicitation machinery (Constraint #3):
 * a Phase Workflow Artifact is the existing WorkflowArtifact (workflow_type "ppbe",
 * reserved since the Session 20 scaffold) bound to one of the six PPBE phases and
 * gated by the existing Five-Question Completeness Gate. The Dependency Map artifact
 * carries DependencyMap entities from @sovereign/data (D-P3 §3.6) — structured
 * against the data dictionary, not a parallel shape (Constraint #2).
 *
 * Everything here is pure and deterministic — no LLM call, no Logger call. Hosts
 * emit the existing FLOWPATH_ARTIFACT_PRODUCED / FLOWPATH_ARTIFACT_APPROVED events
 * when an artifact is committed, exactly as they do for operational workflows.
 */

import type { DependencyMap } from "@sovereign/data";
import { validateDependencyMap } from "@sovereign/data";
import type { WorkflowArtifact } from "./flowpath-contract";
import { evaluateFiveQuestionGate } from "./flowpath-contract";

// ============================================================
// THE SIX PPBE PHASES (architecture doc §1 — the closed loop)
// ============================================================

export type PPBEPhase = 1 | 2 | 3 | 4 | 5 | 6;

/** Plain-prose phase names (Gap 5). Phase 6 feeds back into Phase 1 — the loop is closed. */
export const PPBE_PHASE_NAMES: Record<PPBEPhase, string> = {
  1: "Strategic Direction",
  2: "Planning and Evidence",
  3: "Programming",
  4: "Budget Formulation",
  5: "Budget Execution",
  6: "Performance Evaluation",
};

export const PPBE_PHASES: readonly PPBEPhase[] = [1, 2, 3, 4, 5, 6];

// ============================================================
// THE FOUR PPBE ARTIFACT TYPES (docs/18 §7.1)
// ============================================================

export type PPBEArtifactType =
  | "PHASE_WORKFLOW"
  | "DEPENDENCY_MAP"
  | "DECISION_CRITERIA"
  | "GOVERNANCE_CALENDAR";

export const PPBE_ARTIFACT_TYPES: readonly PPBEArtifactType[] = [
  "PHASE_WORKFLOW",
  "DEPENDENCY_MAP",
  "DECISION_CRITERIA",
  "GOVERNANCE_CALENDAR",
];

/**
 * 1 — Phase Workflow Artifact. The existing WorkflowArtifact bound to one PPBE
 * phase. Valid only when workflow_type is "ppbe" AND the Five-Question
 * Completeness Gate passes — a workflow that fails the gate is a narrative,
 * not a workflow, and is never committed.
 */
export interface PPBEPhaseWorkflowArtifact {
  artifact_type: "PHASE_WORKFLOW";
  phase: PPBEPhase;
  workflow: WorkflowArtifact;
}

/**
 * 2 — Dependency Map Artifact. The inter-phase handoffs this elicitation surfaced,
 * as data-dictionary DependencyMap entities (D-P3 §3.6). ppbe-dependency-tracker
 * reads these read-only.
 */
export interface PPBEDependencyMapArtifact {
  artifact_type: "DEPENDENCY_MAP";
  session_id: string;
  dependencies: DependencyMap[];
  workflow_step_id: string;
}

/** One decision criterion elicited during Phase 1 (Strategic Direction). */
export interface PPBEDecisionCriterion {
  criterion_id: string;
  /** Plain prose (Gap 5), e.g. "programs must trace to an active strategic objective". */
  description: string;
  /** The phase whose decisions this criterion governs. */
  applies_to_phase: PPBEPhase;
}

/** 3 — Decision Criteria Artifact. The resource-decision criteria for the cycle. */
export interface PPBEDecisionCriteriaArtifact {
  artifact_type: "DECISION_CRITERIA";
  session_id: string;
  criteria: PPBEDecisionCriterion[];
  workflow_step_id: string;
}

/** One governance calendar obligation (deadlines ppbe-coordination-assistant will monitor). */
export interface PPBEGovernanceCalendarEntry {
  entry_id: string;
  /** Plain prose (Gap 5), e.g. "submit budget exhibits to the comptroller". */
  obligation: string;
  /** Plain prose deadline, e.g. "15 business days before phase 4 close". */
  deadline: string;
  responsible_role: string;
  phase: PPBEPhase;
}

/** 4 — Governance Calendar Artifact. The cycle's timing obligations. */
export interface PPBEGovernanceCalendarArtifact {
  artifact_type: "GOVERNANCE_CALENDAR";
  session_id: string;
  entries: PPBEGovernanceCalendarEntry[];
  workflow_step_id: string;
}

/** The full per-session PPBE output bundle (mirrors FlowpathMapperOutput). */
export interface PPBEArtifactBundle {
  phase_workflow: PPBEPhaseWorkflowArtifact;
  dependency_map: PPBEDependencyMapArtifact;
  decision_criteria: PPBEDecisionCriteriaArtifact;
  governance_calendar: PPBEGovernanceCalendarArtifact;
}

// ============================================================
// VALIDITY GATE (docs/18 §7.1 done condition — "a valid PPBE workflow artifact")
// ============================================================

export interface PPBEArtifactValidity {
  valid: boolean;
  /** Plain-prose failures (Gap 5) — empty when valid. */
  failures: string[];
}

function requirePhase(phase: unknown, failures: string[]): void {
  if (!PPBE_PHASES.includes(phase as PPBEPhase)) {
    failures.push(`phase: must be one of the six PPBE phases (1-6), got ${String(phase)}`);
  }
}

/** Validate a Phase Workflow Artifact: PPBE-typed and Five-Question-gate complete. */
export function validatePPBEPhaseWorkflow(
  artifact: PPBEPhaseWorkflowArtifact
): PPBEArtifactValidity {
  const failures: string[] = [];
  requirePhase(artifact.phase, failures);
  if (artifact.workflow.workflow_type !== "ppbe") {
    failures.push(
      `workflow.workflow_type: must be "ppbe" for a PPBE phase workflow, got "${artifact.workflow.workflow_type}"`
    );
  }
  if (artifact.workflow.workflow_step_id.trim() === "") {
    failures.push("workflow.workflow_step_id: required (Constraint #6)");
  }
  const gate = evaluateFiveQuestionGate(artifact.workflow);
  if (!gate.gate_passed) {
    for (const q of gate.questions) {
      if (!q.answered && q.gap) failures.push(`five-question gate — ${q.label} ${q.gap}`);
    }
  }
  return { valid: failures.length === 0, failures };
}

/** Validate a Dependency Map Artifact: every dependency a valid data-dictionary entity. */
export function validatePPBEDependencyMapArtifact(
  artifact: PPBEDependencyMapArtifact
): PPBEArtifactValidity {
  const failures: string[] = [];
  if (artifact.session_id.trim() === "") failures.push("session_id: required");
  if (artifact.workflow_step_id.trim() === "") {
    failures.push("workflow_step_id: required (Constraint #6)");
  }
  if (artifact.dependencies.length === 0) {
    failures.push("dependencies: at least one inter-phase dependency is required");
  }
  for (const dep of artifact.dependencies) {
    const result = validateDependencyMap(dep);
    if (!result.valid) {
      for (const err of result.errors) {
        failures.push(`dependency ${dep.dependency_id || "(missing id)"}: ${err}`);
      }
    }
  }
  return { valid: failures.length === 0, failures };
}

/** Validate a Decision Criteria Artifact. */
export function validatePPBEDecisionCriteriaArtifact(
  artifact: PPBEDecisionCriteriaArtifact
): PPBEArtifactValidity {
  const failures: string[] = [];
  if (artifact.session_id.trim() === "") failures.push("session_id: required");
  if (artifact.workflow_step_id.trim() === "") {
    failures.push("workflow_step_id: required (Constraint #6)");
  }
  if (artifact.criteria.length === 0) {
    failures.push("criteria: at least one decision criterion is required");
  }
  for (const c of artifact.criteria) {
    if (c.criterion_id.trim() === "") failures.push("criterion_id: required");
    if (c.description.trim() === "") {
      failures.push(`criterion ${c.criterion_id}: description required (plain prose)`);
    }
    requirePhase(c.applies_to_phase, failures);
  }
  return { valid: failures.length === 0, failures };
}

/** Validate a Governance Calendar Artifact. */
export function validatePPBEGovernanceCalendarArtifact(
  artifact: PPBEGovernanceCalendarArtifact
): PPBEArtifactValidity {
  const failures: string[] = [];
  if (artifact.session_id.trim() === "") failures.push("session_id: required");
  if (artifact.workflow_step_id.trim() === "") {
    failures.push("workflow_step_id: required (Constraint #6)");
  }
  if (artifact.entries.length === 0) {
    failures.push("entries: at least one calendar obligation is required");
  }
  for (const e of artifact.entries) {
    if (e.entry_id.trim() === "") failures.push("entry_id: required");
    if (e.obligation.trim() === "") failures.push(`entry ${e.entry_id}: obligation required`);
    if (e.deadline.trim() === "") failures.push(`entry ${e.entry_id}: deadline required`);
    if (e.responsible_role.trim() === "") {
      failures.push(`entry ${e.entry_id}: responsible_role required (a role, not a person)`);
    }
    requirePhase(e.phase, failures);
  }
  return { valid: failures.length === 0, failures };
}

/** Validate the full four-artifact bundle; failures are prefixed by artifact type. */
export function validatePPBEArtifactBundle(bundle: PPBEArtifactBundle): PPBEArtifactValidity {
  const failures: string[] = [];
  const parts: Array<[PPBEArtifactType, PPBEArtifactValidity]> = [
    ["PHASE_WORKFLOW", validatePPBEPhaseWorkflow(bundle.phase_workflow)],
    ["DEPENDENCY_MAP", validatePPBEDependencyMapArtifact(bundle.dependency_map)],
    ["DECISION_CRITERIA", validatePPBEDecisionCriteriaArtifact(bundle.decision_criteria)],
    ["GOVERNANCE_CALENDAR", validatePPBEGovernanceCalendarArtifact(bundle.governance_calendar)],
  ];
  for (const [type, result] of parts) {
    for (const failure of result.failures) failures.push(`${type}: ${failure}`);
  }
  return { valid: failures.length === 0, failures };
}

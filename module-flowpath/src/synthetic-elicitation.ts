/**
 * SOVEREIGN Platform — module-flowpath
 * synthetic-elicitation.ts — deterministic synthetic elicitation data (Governance Clock OFF).
 *
 * Provides one COMPLETE, Five-Question-Gate-passing WorkflowArtifact plus its mapper bundle
 * (OrganizationalVocabulary, DataSourceRegistry, ValidationCadenceRecord), and a small set of
 * elicitation sessions for Screen 1. All data is synthetic and UNCLASSIFIED. The static
 * elicitation tier and the tests build on these — no network, deterministic.
 *
 * Version: 1.0 · Session 20 · June 26, 2026
 */

import {
  artifactWorkflowStep,
  sessionWorkflowStep,
  type DataSourceRegistry,
  type ElicitationSession,
  type FlowpathMapperOutput,
  type OrganizationalVocabulary,
  type ValidationCadenceRecord,
  type WorkflowArtifact,
} from "./flowpath-contract";

export const SYNTHETIC_SESSION_ID = "S-OPS-001";

/** A complete two-step operational workflow that PASSES the Five-Question Gate. */
export const SYNTHETIC_WORKFLOW_ARTIFACT: WorkflowArtifact = {
  artifact_id: "WF-OPS-001",
  session_id: SYNTHETIC_SESSION_ID,
  workflow_type: "operational",
  title: "Monthly Program Cost Review",
  summary:
    "Each month the program analyst reviews actual obligations against the spend plan for every " +
    "assigned program, flags any program whose cost variance exceeds the office threshold, and " +
    "hands the flagged programs to the program manager for disposition. The review is complete " +
    "once the program manager has recorded a disposition for every flagged program.",
  steps: [
    {
      step_id: "ST-1",
      description:
        "The program analyst compares each program's actual obligations to its spend plan and " +
        "identifies any program whose cost variance exceeds the office threshold.",
      responsible_role: "Program Analyst",
      sequence: 1,
      trigger_condition: "The accounting system has closed the monthly obligation cycle.",
      inputs: ["Monthly obligation records", "Program spend plans"],
      outputs: ["List of programs with cost variance over threshold"],
      is_terminal: false,
    },
    {
      step_id: "ST-2",
      description:
        "The program manager reviews each flagged program and records a disposition — accept, " +
        "investigate, or escalate — with a short note explaining the decision.",
      responsible_role: "Program Manager",
      sequence: 2,
      trigger_condition: "The analyst has produced a list of programs over the cost-variance threshold.",
      inputs: ["List of programs with cost variance over threshold"],
      outputs: ["Recorded disposition for each flagged program"],
      is_terminal: true,
    },
  ],
  terminal_condition: "Every flagged program has a recorded disposition from the program manager.",
  workflow_step_id: artifactWorkflowStep(SYNTHETIC_SESSION_ID),
};

export const SYNTHETIC_VOCABULARY: OrganizationalVocabulary = {
  session_id: SYNTHETIC_SESSION_ID,
  entries: [
    { term: "cost variance", definition: "How far a program's actual obligations differ from its spend plan, expressed as a percentage.", threshold: "8 percent" },
    { term: "at risk", definition: "A program with at least one open flag that the program manager has not yet dispositioned." },
    { term: "on track", definition: "A program whose cost variance is within threshold and whose milestones are on schedule." },
  ],
  data_classification: "user",
};

export const SYNTHETIC_DATA_SOURCES: DataSourceRegistry = {
  session_id: SYNTHETIC_SESSION_ID,
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

export const SYNTHETIC_VALIDATION_CADENCE: ValidationCadenceRecord = {
  session_id: SYNTHETIC_SESSION_ID,
  cadence_type: "monthly",
  what_is_validated: "Cost-variance findings for every assigned program, at month close.",
  responsible_role: "Senior Program Analyst",
  sign_off_requirement: "Comparison of each AI finding against the underlying obligation records, with a short confirmation note.",
  downstream_decisions: "The validated findings feed the monthly status report and any escalation decisions.",
};

export const SYNTHETIC_MAPPER_OUTPUT: FlowpathMapperOutput = {
  artifact: SYNTHETIC_WORKFLOW_ARTIFACT,
  vocabulary: SYNTHETIC_VOCABULARY,
  data_sources: SYNTHETIC_DATA_SOURCES,
  validation_cadence: SYNTHETIC_VALIDATION_CADENCE,
};

/** A small set of sessions for the Screen 1 session manager (synthetic). */
export const SYNTHETIC_SESSIONS: ElicitationSession[] = [
  {
    session_id: SYNTHETIC_SESSION_ID,
    workflow_type: "operational",
    expert_role: "Program Analyst",
    date: "2026-06-24",
    status: "COMPLETE",
    gate_passed: true,
  },
  {
    session_id: "S-VAL-002",
    workflow_type: "validation_cadence",
    expert_role: "Senior Program Analyst",
    date: "2026-06-25",
    status: "GATE_PENDING",
    gate_passed: false,
  },
  {
    session_id: "S-DSI-003",
    workflow_type: "data_source_inventory",
    expert_role: "Financial Manager",
    date: "2026-06-26",
    status: "IN_PROGRESS",
    gate_passed: false,
  },
];

export function syntheticSessionStep(sessionId: string): string {
  return sessionWorkflowStep(sessionId);
}

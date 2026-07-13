/**
 * PPBE workflow artifact tests — Session 31 (D3).
 * docs/18 §7.1: FLOWPATH structures four PPBE artifact types against the data
 * dictionary; done condition — "FLOWPATH produces a valid PPBE workflow artifact."
 * Phase workflows reuse the existing WorkflowArtifact + Five-Question Gate;
 * dependency maps carry data-dictionary DependencyMap entities (D-P3 §3.6).
 */

import {
  PPBE_PHASE_NAMES,
  PPBE_PHASES,
  PPBE_ARTIFACT_TYPES,
  validatePPBEPhaseWorkflow,
  validatePPBEDependencyMapArtifact,
  validatePPBEDecisionCriteriaArtifact,
  validatePPBEGovernanceCalendarArtifact,
  validatePPBEArtifactBundle,
  type PPBEPhaseWorkflowArtifact,
  type PPBEDependencyMapArtifact,
  type PPBEDecisionCriteriaArtifact,
  type PPBEGovernanceCalendarArtifact,
  type PPBEArtifactBundle,
} from "../src/ppbe-artifacts";
import type { WorkflowArtifact } from "../src/flowpath-contract";

const workflow: WorkflowArtifact = {
  artifact_id: "WF-PPBE-P2-01",
  session_id: "FP-SESS-77",
  workflow_type: "ppbe",
  title: "Phase 2 planning evidence assembly",
  summary:
    "The planning team assembles the evidence base and capability gap assessments that feed programming.",
  steps: [
    {
      step_id: "S1",
      description: "Collect prior-cycle evaluation findings",
      responsible_role: "ANALYST",
      sequence: 1,
      trigger_condition: "Phase 1 planning guidance issued",
      inputs: ["planning guidance", "evaluation findings"],
      outputs: ["evidence base draft"],
      is_terminal: false,
    },
    {
      step_id: "S2",
      description: "Review and hand off the evidence base to programming",
      responsible_role: "PROGRAM_MANAGER",
      sequence: 2,
      trigger_condition: "Evidence base draft complete",
      inputs: ["evidence base draft"],
      outputs: ["approved evidence base"],
      is_terminal: true,
    },
  ],
  terminal_condition: "Approved evidence base delivered to the programming phase",
  workflow_step_id: "flowpath-ppbe-phase2-WF-PPBE-P2-01",
};

const phaseWorkflow: PPBEPhaseWorkflowArtifact = {
  artifact_type: "PHASE_WORKFLOW",
  phase: 2,
  workflow,
};

const dependencyMap: PPBEDependencyMapArtifact = {
  artifact_type: "DEPENDENCY_MAP",
  session_id: "FP-SESS-77",
  dependencies: [
    {
      dependency_id: "DEP-P2-P3-01",
      source_workflow: "ppbe-phase-2-planning",
      target_workflow: "ppbe-phase-3-programming",
      handoff_standard: "Evidence base delivered with all capability gap assessments attached.",
      timing_requirement: "within 5 business days of phase close",
      health_status: "healthy",
    },
  ],
  workflow_step_id: "flowpath-ppbe-deps-FP-SESS-77",
};

const decisionCriteria: PPBEDecisionCriteriaArtifact = {
  artifact_type: "DECISION_CRITERIA",
  session_id: "FP-SESS-77",
  criteria: [
    {
      criterion_id: "DC-1",
      description: "Every funded program must trace to an active strategic objective.",
      applies_to_phase: 3,
    },
  ],
  workflow_step_id: "flowpath-ppbe-criteria-FP-SESS-77",
};

const governanceCalendar: PPBEGovernanceCalendarArtifact = {
  artifact_type: "GOVERNANCE_CALENDAR",
  session_id: "FP-SESS-77",
  entries: [
    {
      entry_id: "GC-1",
      obligation: "Submit budget exhibits to the comptroller",
      deadline: "15 business days before phase 4 close",
      responsible_role: "PROGRAM_MANAGER",
      phase: 4,
    },
  ],
  workflow_step_id: "flowpath-ppbe-calendar-FP-SESS-77",
};

const bundle: PPBEArtifactBundle = {
  phase_workflow: phaseWorkflow,
  dependency_map: dependencyMap,
  decision_criteria: decisionCriteria,
  governance_calendar: governanceCalendar,
};

describe("PPBE phases and artifact types", () => {
  it("declares the six-phase closed loop with plain-prose names", () => {
    expect(PPBE_PHASES).toEqual([1, 2, 3, 4, 5, 6]);
    expect(PPBE_PHASE_NAMES[1]).toBe("Strategic Direction");
    expect(PPBE_PHASE_NAMES[6]).toBe("Performance Evaluation");
  });

  it("declares the four artifact types from docs/18 §7.1", () => {
    expect(PPBE_ARTIFACT_TYPES).toEqual([
      "PHASE_WORKFLOW",
      "DEPENDENCY_MAP",
      "DECISION_CRITERIA",
      "GOVERNANCE_CALENDAR",
    ]);
  });
});

describe("Phase Workflow Artifact (done condition: a valid PPBE workflow artifact)", () => {
  it("accepts a gate-complete ppbe workflow bound to a phase", () =>
    expect(validatePPBEPhaseWorkflow(phaseWorkflow)).toEqual({ valid: true, failures: [] }));

  it("rejects a non-ppbe workflow_type", () => {
    const r = validatePPBEPhaseWorkflow({
      ...phaseWorkflow,
      workflow: { ...workflow, workflow_type: "operational" },
    });
    expect(r.valid).toBe(false);
    expect(r.failures.some((f) => f.includes("workflow_type"))).toBe(true);
  });

  it("rejects a workflow that fails the Five-Question Gate (a narrative is not a workflow)", () => {
    const r = validatePPBEPhaseWorkflow({
      ...phaseWorkflow,
      workflow: { ...workflow, steps: [], terminal_condition: "" },
    });
    expect(r.valid).toBe(false);
    expect(r.failures.some((f) => f.includes("five-question gate"))).toBe(true);
  });

  it("rejects an out-of-range phase", () => {
    const r = validatePPBEPhaseWorkflow({ ...phaseWorkflow, phase: 7 as never });
    expect(r.valid).toBe(false);
  });

  it("requires workflow_step_id (Constraint #6)", () => {
    const r = validatePPBEPhaseWorkflow({
      ...phaseWorkflow,
      workflow: { ...workflow, workflow_step_id: "" },
    });
    expect(r.valid).toBe(false);
  });
});

describe("Dependency Map Artifact (structured against the data dictionary)", () => {
  it("accepts valid DependencyMap entities", () =>
    expect(validatePPBEDependencyMapArtifact(dependencyMap)).toEqual({
      valid: true,
      failures: [],
    }));

  it("rejects an empty dependency set", () => {
    const r = validatePPBEDependencyMapArtifact({ ...dependencyMap, dependencies: [] });
    expect(r.valid).toBe(false);
  });

  it("surfaces data-dictionary validation errors per dependency", () => {
    const r = validatePPBEDependencyMapArtifact({
      ...dependencyMap,
      dependencies: [
        { ...dependencyMap.dependencies[0], health_status: "DEGRADED" as never },
      ],
    });
    expect(r.valid).toBe(false);
    expect(r.failures.some((f) => f.includes("health_status"))).toBe(true);
  });
});

describe("Decision Criteria Artifact", () => {
  it("accepts valid criteria", () =>
    expect(validatePPBEDecisionCriteriaArtifact(decisionCriteria)).toEqual({
      valid: true,
      failures: [],
    }));

  it("rejects an empty criteria set and a criterion with no phase", () => {
    expect(
      validatePPBEDecisionCriteriaArtifact({ ...decisionCriteria, criteria: [] }).valid
    ).toBe(false);
    expect(
      validatePPBEDecisionCriteriaArtifact({
        ...decisionCriteria,
        criteria: [{ ...decisionCriteria.criteria[0], applies_to_phase: 0 as never }],
      }).valid
    ).toBe(false);
  });
});

describe("Governance Calendar Artifact", () => {
  it("accepts valid entries", () =>
    expect(validatePPBEGovernanceCalendarArtifact(governanceCalendar)).toEqual({
      valid: true,
      failures: [],
    }));

  it("requires a responsible role on every entry", () => {
    const r = validatePPBEGovernanceCalendarArtifact({
      ...governanceCalendar,
      entries: [{ ...governanceCalendar.entries[0], responsible_role: "" }],
    });
    expect(r.valid).toBe(false);
  });
});

describe("Full bundle", () => {
  it("accepts the complete four-artifact bundle", () =>
    expect(validatePPBEArtifactBundle(bundle)).toEqual({ valid: true, failures: [] }));

  it("prefixes failures with the failing artifact type", () => {
    const r = validatePPBEArtifactBundle({
      ...bundle,
      decision_criteria: { ...decisionCriteria, criteria: [] },
    });
    expect(r.valid).toBe(false);
    expect(r.failures.some((f) => f.startsWith("DECISION_CRITERIA:"))).toBe(true);
  });

  it("is deterministic — same input, same output", () => {
    expect(validatePPBEArtifactBundle(bundle)).toEqual(validatePPBEArtifactBundle(bundle));
  });
});

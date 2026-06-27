/**
 * module-flowpath — flowpath-contract.test.ts
 * The pure FLOWPATH logic: the Five-Question Completeness Gate, the analyst-id hash (privacy),
 * the workstyle threshold boundary check, the registry constants, and the synthetic artifact.
 */
import {
  evaluateFiveQuestionGate,
  findThresholdBoundaryConflicts,
  hashAnalystId,
  FLOWPATH_AGENT_IDS,
  PR_FLOWPATH_001,
  PR_FLOWPATH_002,
  PR_FLOWPATH_003,
  PR_FLOWPATH_004,
  type WorkflowArtifact,
  type AnalystPersonalThreshold,
  type VocabularyEntry,
} from "../src/flowpath-contract";
import {
  SYNTHETIC_WORKFLOW_ARTIFACT,
  SYNTHETIC_VOCABULARY,
} from "../src/synthetic-elicitation";

describe("Five-Question Completeness Gate", () => {
  it("passes a complete synthetic workflow artifact", () => {
    const result = evaluateFiveQuestionGate(SYNTHETIC_WORKFLOW_ARTIFACT);
    expect(result.gate_passed).toBe(true);
    expect(result.failed_questions).toEqual([]);
    expect(result.questions).toHaveLength(5);
  });

  it("fails an empty workflow on every applicable question", () => {
    const empty: WorkflowArtifact = {
      ...SYNTHETIC_WORKFLOW_ARTIFACT,
      steps: [],
      terminal_condition: "",
    };
    const result = evaluateFiveQuestionGate(empty);
    expect(result.gate_passed).toBe(false);
    expect(result.failed_questions).toEqual(["WHO", "SEQUENCE", "CONDITIONS", "INPUTS_OUTPUTS", "TERMINAL"]);
  });

  it("flags the specific missing question (WHO) in plain prose", () => {
    const noRole: WorkflowArtifact = {
      ...SYNTHETIC_WORKFLOW_ARTIFACT,
      steps: SYNTHETIC_WORKFLOW_ARTIFACT.steps.map((s, i) => (i === 0 ? { ...s, responsible_role: "" } : s)),
    };
    const result = evaluateFiveQuestionGate(noRole);
    expect(result.gate_passed).toBe(false);
    expect(result.failed_questions).toContain("WHO");
    const who = result.questions.find((q) => q.question === "WHO");
    expect(who?.answered).toBe(false);
    expect(who?.gap).toMatch(/role/i);
  });

  it("fails TERMINAL when no step is terminal", () => {
    const noTerminal: WorkflowArtifact = {
      ...SYNTHETIC_WORKFLOW_ARTIFACT,
      steps: SYNTHETIC_WORKFLOW_ARTIFACT.steps.map((s) => ({ ...s, is_terminal: false })),
    };
    expect(evaluateFiveQuestionGate(noTerminal).failed_questions).toContain("TERMINAL");
  });
});

describe("analyst-id hashing (privacy, §5a Guarantee 2)", () => {
  it("never returns the cleartext id and is deterministic + salted", () => {
    const h1 = hashAnalystId("E-410");
    const h2 = hashAnalystId("E-410");
    expect(h1).toBe(h2); // deterministic — owner can recompute their own key
    expect(h1).not.toContain("E-410"); // never cleartext
    expect(h1.startsWith("anon-")).toBe(true);
    expect(hashAnalystId("E-410", "other-salt")).not.toBe(h1); // salt changes the hash
    expect(hashAnalystId("E-999")).not.toBe(h1); // different id, different hash
  });
});

describe("workstyle threshold boundary validation (§5a)", () => {
  const org: VocabularyEntry[] = SYNTHETIC_VOCABULARY.entries; // cost variance threshold "8 percent"

  it("flags a personal threshold looser than the organizational standard", () => {
    const personal: AnalystPersonalThreshold[] = [{ metric: "cost variance", value: "10 percent" }];
    const conflicts = findThresholdBoundaryConflicts(personal, org);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].metric).toBe("cost variance");
    expect(conflicts[0].message).toMatch(/later than your colleagues/i);
  });

  it("allows a personal threshold tighter than or equal to the standard", () => {
    const tighter: AnalystPersonalThreshold[] = [{ metric: "cost variance", value: "5 percent" }];
    const equal: AnalystPersonalThreshold[] = [{ metric: "cost variance", value: "8 percent" }];
    expect(findThresholdBoundaryConflicts(tighter, org)).toHaveLength(0);
    expect(findThresholdBoundaryConflicts(equal, org)).toHaveLength(0);
  });

  it("ignores metrics with no organizational threshold", () => {
    const personal: AnalystPersonalThreshold[] = [{ metric: "schedule slip", value: "30 days" }];
    expect(findThresholdBoundaryConflicts(personal, org)).toHaveLength(0);
  });
});

describe("registry constants (Constraints #9 / #10)", () => {
  it("lists the six registered FLOWPATH agents", () => {
    expect(FLOWPATH_AGENT_IDS).toHaveLength(6);
    expect(FLOWPATH_AGENT_IDS).toContain("flowpath.interviewer");
  });

  it("marks all four FLOWPATH prompts APPROVED", () => {
    for (const pr of [PR_FLOWPATH_001, PR_FLOWPATH_002, PR_FLOWPATH_003, PR_FLOWPATH_004]) {
      expect(pr.status).toBe("APPROVED");
    }
  });
});

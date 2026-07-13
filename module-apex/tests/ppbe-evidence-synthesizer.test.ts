/**
 * ppbe-evidence-synthesizer tests — Session 32 (D1).
 * LLM-backed Analytical agent (registry, D-P5) under the PENDING
 * evidence_synthesis_system prompt. Advisory only: every report carries the
 * mandatory Tier A label, every citation must exist in the supplied evidence
 * base (fabrications rejected structurally), and acceptance is a human
 * decision recorded for Python-side PPBE_DECISION emission.
 */

import type { SovereignLLMResponse } from "@sovereign/api-client";
import type { EvaluationFinding } from "@sovereign/data";

import {
  PPBE_EVIDENCE_SYNTHESIZER_AGENT_ID,
  PPBE_EVIDENCE_PROMPT_REGISTRATION,
  PPBE_ADVISORY_LABEL,
  synthesisWorkflowStep,
  validatePPBESynthesisReport,
  buildSynthesisMessages,
  parseSynthesisReport,
  staticSynthesisReport,
  runEvidenceSynthesis,
  synthesisAcceptanceRecord,
  type EvidenceSynthesisInput,
  type PPBESynthesisReport,
  type SynthesisDeps,
} from "../src/ppbe-evidence-synthesizer";
import type { ApexProgramRecord } from "../src/apex-contract";

// ---------- fixtures ----------

function finding(id: string, programId: string, feeds = true): EvaluationFinding {
  return {
    finding_id: id,
    program_id: programId,
    objective_id: "SO-2027-01",
    finding_type: feeds ? "on-track" : "variance",
    narrative: `Finding ${id}: plain-prose evaluation narrative.`,
    feeds_planning_cycle: feeds,
    workflow_step_id: `ppbe-finding-${id}`,
  };
}

function programRecord(id: string): ApexProgramRecord {
  return {
    program_id: id,
    program_name: `Program ${id}`,
    classification: "UNCLASSIFIED",
    status_label: "ON_TRACK",
    status_narrative: "The program is on track.",
    completion_pct: 40,
    responsible_party: "Jane Smith",
    objectives: ["Deliver capability"],
    milestones: [],
    risk_flags: [],
    regulatory_context: [],
    prior_governance_records: [],
    last_updated: "2026-07-12",
  };
}

function input(over: Partial<EvidenceSynthesisInput> = {}): EvidenceSynthesisInput {
  return {
    findings: [finding("EF-1", "PRG-001"), finding("EF-2", "PRG-001", false), finding("EF-3", "PRG-002")],
    programs: [programRecord("PRG-001"), programRecord("PRG-002")],
    fiscal_context: "FY 2027 programming review",
    ...over,
  };
}

function liveResponse(content: string, fallback_activated = false): SovereignLLMResponse {
  return {
    content,
    fallback_tier: fallback_activated ? "static" : "live",
    fallback_activated,
    sovereign_metadata: {
      sovereign_product: "APEX",
      sovereign_version: "1.0",
      workflow_step_id: "ppbe-evidence-synthesis-PRG-001-PRG-002",
      agent_id: PPBE_EVIDENCE_SYNTHESIZER_AGENT_ID,
      provider: "anthropic",
      provider_model: "claude-sonnet-4",
      tier: "standard",
      responded_at: "2026-07-12T00:00:00.000Z",
    },
  };
}

function reqCtx() {
  return {
    workflow_step_id: "ppbe-evidence-synthesis-PRG-001-PRG-002",
    product: "APEX" as const,
    agent_id: PPBE_EVIDENCE_SYNTHESIZER_AGENT_ID,
    tier: "standard" as const,
  };
}

function goodReport(over: Partial<PPBESynthesisReport> = {}): PPBESynthesisReport {
  return {
    report_title: "Evidence synthesis — FY 2027 programming review",
    fiscal_context: "FY 2027 programming review",
    programs_covered: ["PRG-001", "PRG-002"],
    objectives_covered: ["SO-2027-01"],
    summary: "The evidence base shows one variance against an otherwise on-track portfolio.",
    key_findings: [
      {
        statement: "Program PRG-001 shows a variance finding that is not feeding the planning cycle.",
        source_finding_ids: ["EF-2"],
        programs_affected: ["PRG-001"],
      },
    ],
    advisory_label: PPBE_ADVISORY_LABEL,
    workflow_step_id: "ppbe-evidence-synthesis-PRG-001-PRG-002",
    schema_valid: true,
    ...over,
  };
}

function deps(over: Partial<SynthesisDeps> = {}): SynthesisDeps {
  return {
    complete: jest.fn().mockResolvedValue(liveResponse(JSON.stringify(goodReport()))),
    ...over,
  };
}

// ---------- registry bindings ----------

describe("registry bindings", () => {
  it("binds the AIS agent id and the PENDING prompt registration", () => {
    expect(PPBE_EVIDENCE_SYNTHESIZER_AGENT_ID).toBe("ppbe-evidence-synthesizer");
    expect(PPBE_EVIDENCE_PROMPT_REGISTRATION.file).toBe("ppbe/prompts/evidence_synthesis_system.md");
    expect(PPBE_EVIDENCE_PROMPT_REGISTRATION.status).toBe("PENDING");
  });
});

// ---------- workflow step (Constraint #6) ----------

describe("synthesisWorkflowStep", () => {
  it("uses the supplied workflow step when present", () => {
    expect(synthesisWorkflowStep(input({ workflowStepId: "custom-step" }))).toBe("custom-step");
  });

  it("synthesizes a stable step from the sorted program set", () => {
    expect(synthesisWorkflowStep(input())).toBe("ppbe-evidence-synthesis-PRG-001-PRG-002");
  });
});

// ---------- validation: structural traceability ----------

describe("validatePPBESynthesisReport", () => {
  const evidence = input();

  it("accepts a well-formed report citing only real findings", () => {
    expect(validatePPBESynthesisReport(goodReport(), evidence).valid).toBe(true);
  });

  it("rejects a missing or reworded advisory label (Tier A is mandatory)", () => {
    const r1 = validatePPBESynthesisReport(goodReport({ advisory_label: "AI output" }), evidence);
    expect(r1.valid).toBe(false);
    expect((r1 as { errors: string[] }).errors.join()).toContain("advisory_label");
  });

  it("rejects a fabricated source_finding_id", () => {
    const bad = goodReport({
      key_findings: [
        {
          statement: "A fabricated statement.",
          source_finding_ids: ["EF-999"],
          programs_affected: ["PRG-001"],
        },
      ],
    });
    const result = validatePPBESynthesisReport(bad, evidence);
    expect(result.valid).toBe(false);
    expect((result as { errors: string[] }).errors.join()).toContain("fabricated citation");
  });

  it("rejects a key finding with no citations at all", () => {
    const bad = goodReport({
      key_findings: [
        { statement: "Uncited claim.", source_finding_ids: [], programs_affected: ["PRG-001"] },
      ],
    });
    expect(validatePPBESynthesisReport(bad, evidence).valid).toBe(false);
  });

  it("rejects fabricated program and objective coverage", () => {
    expect(
      validatePPBESynthesisReport(goodReport({ programs_covered: ["PRG-404"] }), evidence).valid
    ).toBe(false);
    expect(
      validatePPBESynthesisReport(goodReport({ objectives_covered: ["SO-404"] }), evidence).valid
    ).toBe(false);
  });
});

// ---------- messages + parsing ----------

describe("buildSynthesisMessages / parseSynthesisReport", () => {
  it("builds a two-message conversation with the evidence base as JSON", () => {
    const messages = buildSynthesisMessages(input(), "SYSTEM PROMPT");
    expect(messages).toHaveLength(2);
    expect(messages[0]).toEqual({ role: "system", content: "SYSTEM PROMPT" });
    const payload = JSON.parse(messages[1].content);
    expect(payload.evaluation_findings).toHaveLength(3);
    expect(payload.workflow_step_id).toBe("ppbe-evidence-synthesis-PRG-001-PRG-002");
  });

  it("parses a fenced JSON report", () => {
    const parsed = parseSynthesisReport("```json\n" + JSON.stringify(goodReport()) + "\n```", input());
    expect(parsed?.advisory_label).toBe(PPBE_ADVISORY_LABEL);
  });

  it("returns null for non-JSON, fabricated citations, and schema_valid:false", () => {
    expect(parseSynthesisReport("not json", input())).toBeNull();
    const fabricated = goodReport({
      key_findings: [
        { statement: "x", source_finding_ids: ["EF-999"], programs_affected: ["PRG-001"] },
      ],
    });
    expect(parseSynthesisReport(JSON.stringify(fabricated), input())).toBeNull();
    expect(parseSynthesisReport(JSON.stringify(goodReport({ schema_valid: false })), input())).toBeNull();
  });
});

// ---------- static tier ----------

describe("staticSynthesisReport", () => {
  it("is deterministic, advisory-labeled, and cites only real findings", () => {
    const a = staticSynthesisReport(input());
    const b = staticSynthesisReport(input());
    expect(a).toEqual(b);
    expect(a.advisory_label).toBe(PPBE_ADVISORY_LABEL);
    expect(validatePPBESynthesisReport(a, input()).valid).toBe(true);
    const cited = a.key_findings.flatMap((k) => k.source_finding_ids).sort();
    expect(cited).toEqual(["EF-1", "EF-2", "EF-3"]);
  });

  it("reports the not-feeding-the-planning-cycle count (R-P7 is measured, not assumed)", () => {
    const report = staticSynthesisReport(input());
    const prg1 = report.key_findings.find((k) => k.programs_affected.includes("PRG-001"));
    expect(prg1?.statement).toContain("not feeding the planning cycle");
  });

  it("treats an empty evidence base as insufficient evidence, never as health", () => {
    const report = staticSynthesisReport(input({ findings: [] }));
    expect(report.summary).toContain("insufficient");
    expect(report.key_findings).toEqual([]);
    expect(validatePPBESynthesisReport(report, input({ findings: [] })).valid).toBe(true);
  });
});

// ---------- engine ----------

describe("runEvidenceSynthesis", () => {
  it("returns the live report when the model output validates", async () => {
    const outcome = await runEvidenceSynthesis(input(), "P", reqCtx(), deps());
    expect(outcome.tier).toBe("live");
    expect(outcome.report.key_findings[0].source_finding_ids).toEqual(["EF-2"]);
  });

  it("falls to static when the api client reports fallback", async () => {
    const d = deps({ complete: jest.fn().mockResolvedValue(liveResponse("", true)) });
    const outcome = await runEvidenceSynthesis(input(), "P", reqCtx(), d);
    expect(outcome.tier).toBe("static");
    expect(outcome.detail).toBe("api_client_fallback_static");
  });

  it("falls to static when the live output fabricates a citation", async () => {
    const fabricated = goodReport({
      key_findings: [
        { statement: "x", source_finding_ids: ["EF-999"], programs_affected: ["PRG-001"] },
      ],
    });
    const d = deps({ complete: jest.fn().mockResolvedValue(liveResponse(JSON.stringify(fabricated))) });
    const outcome = await runEvidenceSynthesis(input(), "P", reqCtx(), d);
    expect(outcome.tier).toBe("static");
    expect(outcome.detail).toBe("live_response_not_surfaceable");
  });

  it("falls to static when the call throws, and never throws itself", async () => {
    const d = deps({ complete: jest.fn().mockRejectedValue(new Error("network down")) });
    const outcome = await runEvidenceSynthesis(input(), "P", reqCtx(), d);
    expect(outcome.tier).toBe("static");
    expect(outcome.detail).toBe("network down");
  });

  it("makes exactly one live attempt per call", async () => {
    const complete = jest.fn().mockRejectedValue(new Error("down"));
    await runEvidenceSynthesis(input(), "P", reqCtx(), { complete });
    expect(complete).toHaveBeenCalledTimes(1);
  });
});

// ---------- acceptance (the human decision) ----------

describe("synthesisAcceptanceRecord", () => {
  it("builds the docs/18 §4 PPBE_DECISION field set with HUMAN_APPROVAL", () => {
    const record = synthesisAcceptanceRecord(goodReport(), "Jane Smith");
    expect(record).toEqual({
      decision_type: "HUMAN_APPROVAL",
      program_ids: ["PRG-001", "PRG-002"],
      objective_ids: ["SO-2027-01"],
      approving_human: "Jane Smith",
      workflow_step_id: "ppbe-evidence-synthesis-PRG-001-PRG-002",
    });
  });

  it("refuses an unattributed acceptance", () => {
    expect(synthesisAcceptanceRecord(goodReport(), "   ")).toBeNull();
  });
});

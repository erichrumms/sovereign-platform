/**
 * module-aria — clear-engine.test.ts (Session 23 · D6)
 * The CLEAR deterministic rule engine: same input → same output, the 90% data-quality
 * threshold, regulatory-source loading (the four on-disk files bind to the registry), and
 * the ARIA_COMPLIANCE_CHECK Logger emission carrying the aria.rules-engine agent_id.
 */
import * as fs from "fs";
import * as path from "path";

import type { SovereignLogEvent, SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  evaluateDocument,
  emitComplianceCheck,
  loadRegulatorySources,
  REGULATORY_SOURCES,
  ARIA_RULES_ENGINE_AGENT_ID,
  clearWorkflowStep,
} from "../src/clear-engine";
import type { ClearEvaluationInput } from "../src/clear-types";

const AT = "2026-06-29T12:00:00.000Z";

const COMPLIANT: ClearEvaluationInput = {
  document_id: "DOC-OK",
  document_name: "Clean Exhibit",
  document_type: "OMB A-11 Exhibit",
  data_quality_index: 96,
  is_congressional_submission: false,
  has_justification_narrative: true,
  has_evidence_basis: true,
  obligation_covered: true,
  funds_availability_stated: true,
  ppbe_phase: "Budgeting",
};

function logSink(): { events: SovereignLogEvent[]; ctx: SovereignShellContext } {
  const events: SovereignLogEvent[] = [];
  const ctx = { logger: { log: (e: SovereignLogEvent) => events.push(e) } } as unknown as SovereignShellContext;
  return { events, ctx };
}

describe("clear-engine — deterministic evaluation", () => {
  it("produces the same output for the same input (no randomness)", () => {
    const a = evaluateDocument(COMPLIANT, AT);
    const b = evaluateDocument(COMPLIANT, AT);
    expect(a).toEqual(b);
  });

  it("is compliant when every rule passes", () => {
    const result = evaluateDocument(COMPLIANT, AT);
    expect(result.compliant).toBe(true);
    expect(result.findings.every((f) => f.passed)).toBe(true);
    expect(result.findings.every((f) => f.severity === "green")).toBe(true);
  });

  it("flags an over-obligation as a red Anti-Deficiency Act violation (compliant=false)", () => {
    const result = evaluateDocument({ ...COMPLIANT, document_id: "DOC-ADA", obligation_covered: false }, AT);
    const ada = result.findings.find((f) => f.rule_id === "R-ADA-1")!;
    expect(ada.passed).toBe(false);
    expect(ada.severity).toBe("red");
    expect(ada.source_title).toBe("Anti-Deficiency Act");
    expect(result.compliant).toBe(false);
  });

  it("applies the 90% data-quality threshold: amber below threshold, red on a congressional submission", () => {
    const amber = evaluateDocument({ ...COMPLIANT, data_quality_index: 84 }, AT).findings.find((f) => f.rule_id === "R-A11-3")!;
    expect(amber.passed).toBe(false);
    expect(amber.severity).toBe("amber");

    const red = evaluateDocument(
      { ...COMPLIANT, data_quality_index: 84, is_congressional_submission: true },
      AT
    ).findings.find((f) => f.rule_id === "R-A11-3")!;
    expect(red.severity).toBe("red");

    const green = evaluateDocument({ ...COMPLIANT, data_quality_index: 90 }, AT).findings.find((f) => f.rule_id === "R-A11-3")!;
    expect(green.passed).toBe(true);
    expect(green.severity).toBe("green");
  });

  it("reports all four regulatory sources as applicable", () => {
    const result = evaluateDocument(COMPLIANT, AT);
    expect(result.applicable_sources).toEqual([
      "OMB Circular A-11",
      "Evidence Act",
      "Anti-Deficiency Act",
      "DoD PPBE Reform",
    ]);
    expect(result.evaluation_timestamp).toBe(AT);
  });
});

describe("clear-engine — regulatory source loading", () => {
  it("loadRegulatorySources returns all four registered sources", () => {
    const sources = loadRegulatorySources();
    expect(sources).toHaveLength(4);
    expect(sources.map((s) => s.id).sort()).toEqual(
      ["anti-deficiency-act", "dod-ppbe-reform", "evidence-act", "omba11"]
    );
  });

  it("each registered source binds to an existing file in data/regulatory-sources/", () => {
    const dir = path.join(__dirname, "..", "data", "regulatory-sources");
    for (const source of REGULATORY_SOURCES) {
      const file = path.join(dir, source.fileName);
      expect(fs.existsSync(file)).toBe(true);
      const content = fs.readFileSync(file, "utf-8");
      // The file is the human-readable source of record for the rules; it names its source id.
      expect(content).toContain(source.id);
      expect(content.length).toBeGreaterThan(100);
    }
  });
});

describe("clear-engine — ARIA_COMPLIANCE_CHECK emission", () => {
  it("emits ARIA_COMPLIANCE_CHECK carrying the aria.rules-engine agent_id and workflow_step_id", () => {
    const { events, ctx } = logSink();
    const evaluation = evaluateDocument(COMPLIANT, AT);
    emitComplianceCheck(ctx, evaluation);

    expect(events).toHaveLength(1);
    const event = events[0];
    expect(event.event_type).toBe("ARIA_COMPLIANCE_CHECK");
    expect(event.agent_id).toBe(ARIA_RULES_ENGINE_AGENT_ID);
    expect(event.agent_class).toBe("Governance");
    expect(event.product).toBe("ARIA");
    expect(event.workflow_step_id).toBe(clearWorkflowStep("DOC-OK"));
    expect(event.payload.compliant).toBe(true);
  });

  it("records flagged rule ids on a non-compliant evaluation", () => {
    const { events, ctx } = logSink();
    const evaluation = evaluateDocument({ ...COMPLIANT, document_id: "DOC-BAD", obligation_covered: false }, AT);
    emitComplianceCheck(ctx, evaluation);
    expect(events[0].outcome).toBe("deviations_flagged");
    expect(events[0].payload.flagged_rule_ids).toContain("R-ADA-1");
  });
});

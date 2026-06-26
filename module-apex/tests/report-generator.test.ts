/**
 * module-apex — report-generator.test.ts
 * apex.report-generator (deterministic): evaluateHold reflects the platform isOnHold; a report
 * is assembled in plain prose; a DC-2 dossier contains every required field; isDossierComplete
 * confirms completeness.
 */
import {
  assembleReport,
  assembleDossier,
  evaluateHold,
  isDossierComplete,
} from "../src/report-generator";
import { staticAnalysis } from "../src/apex-analysis";
import { createSyntheticApexDataAdapter } from "../src/apex-data-adapter";

const adapter = createSyntheticApexDataAdapter();
const p100 = adapter.getProgram("P-100")!;
const nowIso = "2026-06-25T12:00:00.000Z";

describe("evaluateHold", () => {
  it("is not held when neither APEX nor CPMI is on hold", () => {
    expect(evaluateHold(() => false)).toEqual({ held: false, reason: "" });
  });

  it("is held (with a plain-prose reason) when APEX is on hold", () => {
    const h = evaluateHold((p) => p === "APEX");
    expect(h.held).toBe(true);
    expect(h.reason).toMatch(/APEX product is currently on hold/);
  });

  it("is held when CPMI is on hold (APEX depends on CPMI)", () => {
    const h = evaluateHold((p) => p === "CPMI");
    expect(h.held).toBe(true);
    expect(h.reason).toMatch(/CPMI/);
  });
});

describe("assembleReport", () => {
  it("builds a titled report with status, risk, and recommendation sections", () => {
    const analysis = staticAnalysis(p100, "MSR", "ws");
    const report = assembleReport(analysis, p100, nowIso);
    expect(report.title).toMatch(/Monthly Status Report — Joint Logistics Modernization \(P-100\)/);
    const headings = report.sections.map((s) => s.heading);
    expect(headings).toContain("Program Status");
    expect(headings).toContain("Risk Findings");
    expect(headings).toContain("Recommendations for Human Review");
    expect(report.generated_at).toBe(nowIso);
  });

  it("states there are no risk findings when the analysis has none", () => {
    const analysis = staticAnalysis(adapter.getProgram("P-200")!, "MSR", "ws");
    const report = assembleReport(analysis, adapter.getProgram("P-200")!, nowIso);
    const risk = report.sections.find((s) => s.heading === "Risk Findings")!;
    expect(risk.body).toMatch(/no open risk findings/i);
  });
});

describe("assembleDossier (DC-2)", () => {
  const dossier = assembleDossier(
    {
      program: p100,
      reasoning_chain_history: adapter.getReasoningChainHistory("P-100"),
      governance_decisions: adapter.getGovernanceDecisions("P-100"),
      task_history: adapter.getTaskHistory("P-100"),
    },
    "PDF",
    nowIso
  );

  it("contains all six DC-2 sections", () => {
    expect(dossier.program.program_id).toBe("P-100");
    expect(dossier.reasoning_chain_history.length).toBeGreaterThanOrEqual(1);
    expect(dossier.governance_decisions.length).toBeGreaterThanOrEqual(1);
    expect(dossier.risk_register).toHaveLength(3);
    expect(dossier.regulatory_constraints.length).toBeGreaterThanOrEqual(1);
    expect(dossier.task_history.length).toBeGreaterThanOrEqual(1);
  });

  it("is complete per isDossierComplete", () => {
    expect(isDossierComplete(dossier)).toBe(true);
  });
});

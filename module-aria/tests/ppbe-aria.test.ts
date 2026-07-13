/**
 * ppbe-aria tests — Session 32 (D6, docs/18 §7.2 ARIA scope).
 * CLEAR: the three PPBE monitoring rules run ON TOP of the unchanged base
 * evaluation. TRACER: the budget-submission chain assembles over the REAL
 * Session 31 entities — complete when every link resolves, orphaned with plain
 * prose when one doesn't. ARC: the committed dependency model now projects
 * OMB/appropriations-law changes onto the PPBE items.
 */

import type { ObligationRecord, ProgramRecord, StrategicObjective } from "@sovereign/data";

import {
  PPBE_CLEAR_RULE_IDS,
  PPBE_PHASE_NAMES,
  evaluatePPBEDocument,
  assemblePPBEObligationChain,
  type PPBEClearInput,
} from "../src/ppbe-aria";
import { evaluateDocument } from "../src/clear-engine";
import { dependentItemsForSource, modelImpact } from "../src/arc-engine";

// ---------- fixtures ----------

function ppbeInput(over: Partial<PPBEClearInput> = {}): PPBEClearInput {
  return {
    document_id: "DOC-PPBE-1",
    document_name: "FY 2027 Budget Exhibit — Logistics Data Interchange",
    document_type: "Budget Exhibit",
    data_quality_index: 95,
    is_congressional_submission: false,
    has_justification_narrative: true,
    has_evidence_basis: true,
    obligation_covered: true,
    funds_availability_stated: true,
    ppbe_phase: "Budget Formulation",
    all_figures_traceable: true,
    has_source_data_lineage: true,
    feeds_planning_recorded: true,
    ...over,
  };
}

const AT = "2026-07-13T12:00:00Z";

function obligation(): ObligationRecord {
  return {
    obligation_id: "OB-1",
    program_id: "PRG-001",
    cost_code: "CC-1",
    amount: 90000,
    timestamp: "2026-07-12T15:30:00Z",
    authorizing_official: "Jane Smith",
    workflow_step_id: "ppbe-obligation-OB-1",
  };
}

function program(): ProgramRecord {
  return {
    program_id: "PRG-001",
    name: "Logistics Data Interchange",
    sponsor: "PEO Logistics",
    contract_number: "W91-26-C-0001",
    classification_level: "UNCLASSIFIED",
    status: "ACTIVE",
    objective_id: "SO-2027-01",
    fiscal_year: "FY 2027",
    lifecycle_cost_estimate: 1000000,
    obligation_plan: [{ period: "FY 2027 Q1", planned_amount: 100000 }],
    performance_baseline: [{ metric: "obligation rate", baseline_value: "on plan" }],
  };
}

function objective(): StrategicObjective {
  return {
    objective_id: "SO-2027-01",
    title: "Modernize logistics data interchange",
    description: "Plain-prose description.",
    priority_rank: 1,
    fiscal_year_range: "FY 2027-2031",
    source_workflow_step_id: "flowpath-ppbe-elicitation-1",
    decision_record_id: "DR-2026-011",
    status: "active",
  };
}

// ---------- CLEAR ----------

describe("evaluatePPBEDocument (CLEAR PPBE rules)", () => {
  it("runs the unchanged base evaluation plus exactly the three PPBE rules", () => {
    const base = evaluateDocument(ppbeInput(), AT);
    const ppbe = evaluatePPBEDocument(ppbeInput(), AT);
    expect(base.findings).toHaveLength(7);
    expect(ppbe.findings).toHaveLength(10);
    expect(ppbe.findings.slice(0, 7)).toEqual(base.findings);
    expect(ppbe.findings.slice(7).map((f) => f.rule_id)).toEqual([...PPBE_CLEAR_RULE_IDS]);
    expect(ppbe.compliant).toBe(true);
  });

  it("R-PPBE-2: an untraceable figure fails — red on a congressional submission, amber otherwise", () => {
    const amber = evaluatePPBEDocument(ppbeInput({ all_figures_traceable: false }), AT);
    const r2 = amber.findings.find((f) => f.rule_id === "R-PPBE-2")!;
    expect(amber.compliant).toBe(false);
    expect(r2.passed).toBe(false);
    expect(r2.severity).toBe("amber");

    const red = evaluatePPBEDocument(
      ppbeInput({ all_figures_traceable: false, is_congressional_submission: true }),
      AT
    );
    expect(red.findings.find((f) => f.rule_id === "R-PPBE-2")!.severity).toBe("red");
  });

  it("R-PPBE-3: a phase outside the six-phase closed loop fails even though base R-PPBE-1 passes", () => {
    const result = evaluatePPBEDocument(ppbeInput({ ppbe_phase: "Sustainment" }), AT);
    expect(result.findings.find((f) => f.rule_id === "R-PPBE-1")!.passed).toBe(true); // non-empty
    expect(result.findings.find((f) => f.rule_id === "R-PPBE-3")!.passed).toBe(false);
    expect(result.compliant).toBe(false);
    expect(PPBE_PHASE_NAMES).toHaveLength(6);
  });

  it("R-PPBE-4: unmeasured learning loop fails (R-P7 measured, never assumed)", () => {
    const result = evaluatePPBEDocument(ppbeInput({ feeds_planning_recorded: false }), AT);
    const r4 = result.findings.find((f) => f.rule_id === "R-PPBE-4")!;
    expect(r4.passed).toBe(false);
    expect(r4.description).toContain("R-P7");
  });

  it("is deterministic — same input and timestamp, identical result", () => {
    expect(evaluatePPBEDocument(ppbeInput(), AT)).toEqual(evaluatePPBEDocument(ppbeInput(), AT));
  });
});

// ---------- TRACER ----------

describe("assemblePPBEObligationChain (TRACER budget-submission chain)", () => {
  it("assembles a COMPLETE chain over the real entities: obligation → program → objective", () => {
    const chain = assemblePPBEObligationChain(obligation(), program(), objective());
    expect(chain.chain_type).toBe("obligation");
    expect(chain.complete).toBe(true);
    expect(chain.nodes).toHaveLength(3);
    expect(chain.nodes.map((n) => n.kind)).toEqual([
      "obligation_record",
      "program_record",
      "strategic_objective",
    ]);
    expect(chain.nodes[0].source_ref).toBe("ppbe-obligation-OB-1");
    expect(chain.nodes[2].cites).toContain("DR-2026-011");
  });

  it("orphans the chain when no program record resolves — with a plain-prose reason, no fabrication", () => {
    const chain = assemblePPBEObligationChain(obligation());
    expect(chain.complete).toBe(false);
    expect(chain.orphan_reason).toContain("no program record was resolved");
    expect(chain.nodes[1].traceable).toBe(false);
    expect(chain.nodes[2].traceable).toBe(false);
    expect(chain.nodes[2].cites).toContain("program link above is broken");
  });

  it("orphans on an id mismatch rather than silently connecting the wrong records", () => {
    const wrongObjective = { ...objective(), objective_id: "SO-2027-99" };
    const chain = assemblePPBEObligationChain(obligation(), program(), wrongObjective);
    expect(chain.complete).toBe(false);
    expect(chain.nodes[1].traceable).toBe(true);
    expect(chain.nodes[2].traceable).toBe(false);
    expect(chain.nodes[2].cites).toContain("does not connect");
  });

  it("is deterministic", () => {
    expect(assemblePPBEObligationChain(obligation(), program(), objective())).toEqual(
      assemblePPBEObligationChain(obligation(), program(), objective())
    );
  });
});

// ---------- ARC ----------

describe("ARC dependency model — PPBE items (docs/18 §7.2)", () => {
  it("a substantive OMB A-11 change projects onto the PPBE SCRIBE modes", () => {
    const report = modelImpact(
      { description: "A-11 exhibit format revision", affected_source: "omba11", change_scope: "substantive" },
      AT
    );
    const ids = report.dependent_items.map((i) => i.item_id);
    expect(ids).toEqual(expect.arrayContaining(["TPL-PPBE-BUDGET-EXHIBIT", "TPL-PPBE-CONG-JUST"]));
  });

  it("a substantive appropriations-law (ADA) change projects onto the Tier C gate as breaking", () => {
    const report = modelImpact(
      {
        description: "Amendment to 31 U.S.C. §1341 obligation limits",
        affected_source: "anti-deficiency-act",
        change_scope: "substantive",
      },
      AT
    );
    const gate = report.dependent_items.find((i) => i.item_id === "WF-PPBE-OBLIGATION-GATE")!;
    expect(gate.severity).toBe("breaking");
    const chain = report.dependent_items.find((i) => i.item_id === "TC-PPBE-OBLIGATION")!;
    expect(chain.coupling).toBe("informational");
  });

  it("a PPBE Reform change projects onto the new CLEAR PPBE rules", () => {
    const items = dependentItemsForSource("dod-ppbe-reform").map((i) => i.item_id);
    expect(items).toEqual(expect.arrayContaining(["R-PPBE-2", "R-PPBE-3"]));
    const report = modelImpact(
      { description: "Reform guidance update", affected_source: "dod-ppbe-reform", change_scope: "substantive" },
      AT
    );
    expect(report.dependent_items.filter((i) => i.severity === "breaking").length).toBeGreaterThan(0);
  });
});

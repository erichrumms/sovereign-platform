/**
 * module-aria — arc-engine.test.ts (Session 25 · D5)
 * The ARC deterministic dependency-model + impact-modeling engine: same change → same report,
 * severity scoring from coupling + change scope, breaking→significant→minor ordering, overall
 * severity, the dependency-model load, and the on-disk binding of every model entry to a CLEAR
 * regulatory source (the Node-side proof the model is authoritative at startup).
 */
import * as fs from "fs";
import * as path from "path";

import {
  modelImpact,
  loadDependencyModel,
  dependentItemsForSource,
  severityForCoupling,
  arcWorkflowStep,
  DEPENDENCY_MODEL,
} from "../src/arc-engine";
import { REGULATORY_SOURCES } from "../src/clear-engine";
import type { ProposedRegulatoryChange } from "../src/arc-types";

const AT = "2026-06-29T12:00:00.000Z";

const A11_SUBSTANTIVE: ProposedRegulatoryChange = {
  description: "OMB Circular A-11 Section 51.3 revised to require a quantified benefit narrative.",
  affected_source: "omba11",
  change_scope: "substantive",
};

describe("arc-engine — deterministic impact modeling", () => {
  it("produces the same report for the same change (no randomness)", () => {
    const a = modelImpact(A11_SUBSTANTIVE, AT);
    const b = modelImpact(A11_SUBSTANTIVE, AT);
    expect(a).toEqual(b);
  });

  it("echoes the change description, affected source title, and modeled_at timestamp", () => {
    const report = modelImpact(A11_SUBSTANTIVE, AT);
    expect(report.change_description).toBe(A11_SUBSTANTIVE.description);
    expect(report.affected_source).toBe("omba11");
    expect(report.affected_source_title).toBe("OMB Circular A-11");
    expect(report.modeled_at).toBe(AT);
  });

  it("only includes items bound to the amended source", () => {
    const report = modelImpact(A11_SUBSTANTIVE, AT);
    expect(report.dependent_items.length).toBeGreaterThan(0);
    expect(report.dependent_items.every((i) => i.source_id === "omba11")).toBe(true);
  });

  it("orders affected items most-severe first (breaking → significant → minor)", () => {
    const report = modelImpact(A11_SUBSTANTIVE, AT);
    const rank = { breaking: 3, significant: 2, minor: 1 } as const;
    for (let i = 1; i < report.dependent_items.length; i++) {
      expect(rank[report.dependent_items[i - 1].severity]).toBeGreaterThanOrEqual(
        rank[report.dependent_items[i].severity]
      );
    }
  });

  it("reports overall severity as the highest per-item severity", () => {
    const report = modelImpact(A11_SUBSTANTIVE, AT);
    // omba11 carries at least one 'enforces' CLEAR rule → a breaking item exists.
    expect(report.overall_severity).toBe("breaking");
    expect(report.dependent_items.some((i) => i.severity === "breaking")).toBe(true);
  });

  it("every impact statement is framed as a projection (Gap 6 — 'would' / 'modeled as')", () => {
    const report = modelImpact(A11_SUBSTANTIVE, AT);
    for (const item of report.dependent_items) {
      expect(item.impact_statement).toMatch(/would|modeled as/i);
    }
  });
});

describe("arc-engine — severity scoring", () => {
  it("maps coupling straight through for a substantive change", () => {
    expect(severityForCoupling("enforces", "substantive")).toBe("breaking");
    expect(severityForCoupling("references", "substantive")).toBe("significant");
    expect(severityForCoupling("informational", "substantive")).toBe("minor");
  });

  it("downshifts every coupling one level for a clarifying change (floored at minor)", () => {
    expect(severityForCoupling("enforces", "clarifying")).toBe("significant");
    expect(severityForCoupling("references", "clarifying")).toBe("minor");
    expect(severityForCoupling("informational", "clarifying")).toBe("minor");
  });

  it("a clarifying change yields a lower overall severity than the same substantive change", () => {
    const substantive = modelImpact({ ...A11_SUBSTANTIVE, change_scope: "substantive" }, AT);
    const clarifying = modelImpact({ ...A11_SUBSTANTIVE, change_scope: "clarifying" }, AT);
    expect(substantive.overall_severity).toBe("breaking");
    expect(clarifying.overall_severity).toBe("significant");
  });
});

describe("arc-engine — dependency model", () => {
  it("loadDependencyModel returns a defensive copy of every entry", () => {
    const model = loadDependencyModel();
    expect(model).toHaveLength(DEPENDENCY_MODEL.length);
    model[0].label = "MUTATED";
    expect(DEPENDENCY_MODEL[0].label).not.toBe("MUTATED");
  });

  it("dependentItemsForSource returns only that source's items, all four sources covered", () => {
    for (const source of REGULATORY_SOURCES) {
      const items = dependentItemsForSource(source.id);
      expect(items.length).toBeGreaterThan(0);
      expect(items.every((i) => i.source_id === source.id)).toBe(true);
    }
  });

  it("derives a per-change workflow_step_id (Constraint #6)", () => {
    expect(arcWorkflowStep(A11_SUBSTANTIVE)).toBe("aria-arc-omba11");
    expect(arcWorkflowStep({ ...A11_SUBSTANTIVE, change_id: "RC-2026-014" })).toBe("aria-arc-RC-2026-014");
  });

  it("every model entry binds to a regulatory source that exists on disk (authoritative at startup)", () => {
    const dir = path.join(__dirname, "..", "data", "regulatory-sources");
    const known = new Set(REGULATORY_SOURCES.map((s) => s.id));
    for (const entry of DEPENDENCY_MODEL) {
      // The source id is one CLEAR loads...
      expect(known.has(entry.source_id)).toBe(true);
      // ...and that source's governance summary file is present (no fabricated sources, docs/16 §6).
      const source = REGULATORY_SOURCES.find((s) => s.id === entry.source_id)!;
      const file = path.join(dir, source.fileName);
      expect(fs.existsSync(file)).toBe(true);
    }
  });

  it("CLEAR-rule model entries use the real CLEAR rule ids", () => {
    const ruleIds = DEPENDENCY_MODEL.filter((d) => d.kind === "clear_rule").map((d) => d.item_id);
    // These are the exact rule ids clear-engine evaluates.
    expect(ruleIds).toEqual(expect.arrayContaining(["R-A11-1", "R-EV-1", "R-ADA-1", "R-PPBE-1"]));
  });
});

/**
 * module-apex — apex-data-adapter.test.ts
 * The synthetic ApexDataAdapter: lists the portfolio, returns a program by id, returns null
 * for unknown ids, returns chronological history, and is read-only (returns copies).
 */
import { createSyntheticApexDataAdapter } from "../src/apex-data-adapter";

describe("createSyntheticApexDataAdapter", () => {
  const adapter = createSyntheticApexDataAdapter();

  it("lists the full portfolio (4 synthetic programs)", () => {
    const ids = adapter.listPrograms().map((p) => p.program_id).sort();
    expect(ids).toEqual(["P-100", "P-150", "P-200", "P-300"]);
  });

  it("returns each program with UNCLASSIFIED classification (GD-10)", () => {
    expect(adapter.listPrograms().every((p) => p.classification === "UNCLASSIFIED")).toBe(true);
  });

  it("returns a program by id", () => {
    const p = adapter.getProgram("P-100");
    expect(p?.program_name).toBe("Joint Logistics Modernization");
    expect(p?.status_label).toBe("AT_RISK");
    expect(p?.risk_flags).toHaveLength(3);
  });

  it("returns null for an unknown id", () => {
    expect(adapter.getProgram("P-999")).toBeNull();
  });

  it("is read-only — mutating a returned record does not affect the adapter", () => {
    const p = adapter.getProgram("P-100")!;
    p.completion_pct = 1;
    expect(adapter.getProgram("P-100")!.completion_pct).toBe(62);
  });

  it("returns reasoning history in chronological order", () => {
    const hist = adapter.getReasoningChainHistory("P-100");
    expect(hist.length).toBeGreaterThanOrEqual(2);
    const times = hist.map((h) => h.recorded_at);
    expect([...times].sort()).toEqual(times);
  });

  it("returns governance decisions and task history for a program", () => {
    expect(adapter.getGovernanceDecisions("P-100").length).toBeGreaterThanOrEqual(1);
    expect(adapter.getTaskHistory("P-100").length).toBeGreaterThanOrEqual(1);
  });

  it("returns empty arrays for an unknown program's history", () => {
    expect(adapter.getReasoningChainHistory("P-999")).toEqual([]);
    expect(adapter.getGovernanceDecisions("P-999")).toEqual([]);
    expect(adapter.getTaskHistory("P-999")).toEqual([]);
  });
});

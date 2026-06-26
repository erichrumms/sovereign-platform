/**
 * module-apex — apex-contract.test.ts
 * GD-16 schema validation: a well-formed ApexAnalysisOutput validates; missing/!malformed
 * fields and bad RiskFinding members are rejected with specific errors; isSurfaceableAnalysis
 * requires both schema validity AND schema_valid===true.
 */
import {
  validateApexAnalysisOutput,
  isSurfaceableAnalysis,
  type ApexAnalysisOutput,
} from "../src/apex-contract";

function goodOutput(over: Partial<ApexAnalysisOutput> = {}): ApexAnalysisOutput {
  return {
    program_id: "P-100",
    report_type: "MSR",
    status_narrative: "The program is progressing as planned.",
    risk_findings: [
      {
        flag_id: "F1",
        description: "Cost variance is trending unfavorably.",
        source_data: "Cost ledger roll-up through May 2026.",
        baseline: "Planned spend of 58 percent.",
        trend: "DEGRADING",
        responsible_party: "Alex Reed",
        severity: "P2",
      },
    ],
    recommendations: ["A reviewer should consider reviewing the cost variance."],
    schema_valid: true,
    workflow_step_id: "apex-analysis-msr-P-100",
    ...over,
  };
}

describe("validateApexAnalysisOutput", () => {
  it("accepts a well-formed output", () => {
    expect(validateApexAnalysisOutput(goodOutput())).toEqual({ valid: true });
  });

  it("rejects a non-object", () => {
    expect(validateApexAnalysisOutput(null).valid).toBe(false);
    expect(validateApexAnalysisOutput("x").valid).toBe(false);
  });

  it("rejects a missing program_id", () => {
    const res = validateApexAnalysisOutput(goodOutput({ program_id: "" }));
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.errors.join(" ")).toMatch(/program_id/);
  });

  it("rejects an invalid report_type", () => {
    const res = validateApexAnalysisOutput(goodOutput({ report_type: "WEEKLY" as never }));
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.errors.join(" ")).toMatch(/report_type/);
  });

  it("rejects a risk finding missing DC-3 source_data", () => {
    const res = validateApexAnalysisOutput(
      goodOutput({ risk_findings: [{ flag_id: "F1", description: "x", source_data: "", baseline: "b", trend: "STABLE", responsible_party: "r", severity: "P1" }] })
    );
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.errors.join(" ")).toMatch(/source_data/);
  });

  it("rejects a risk finding with a bad trend or severity", () => {
    const res = validateApexAnalysisOutput(
      goodOutput({ risk_findings: [{ flag_id: "F1", description: "x", source_data: "s", baseline: "b", trend: "SIDEWAYS" as never, responsible_party: "r", severity: "P9" as never }] })
    );
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.errors.join(" ")).toMatch(/trend|severity/);
  });

  it("rejects an empty-string recommendation", () => {
    const res = validateApexAnalysisOutput(goodOutput({ recommendations: ["  "] }));
    expect(res.valid).toBe(false);
  });

  it("rejects a non-boolean schema_valid", () => {
    const res = validateApexAnalysisOutput(goodOutput({ schema_valid: "yes" as never }));
    expect(res.valid).toBe(false);
  });
});

describe("isSurfaceableAnalysis", () => {
  it("is true only when valid AND schema_valid===true", () => {
    expect(isSurfaceableAnalysis(goodOutput())).toBe(true);
    expect(isSurfaceableAnalysis(goodOutput({ schema_valid: false }))).toBe(false);
  });
});

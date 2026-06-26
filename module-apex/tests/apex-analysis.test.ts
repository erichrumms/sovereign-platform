/**
 * module-apex — apex-analysis.test.ts
 * The apex.ai-assistant orchestration: staticAnalysis is schema-valid and assembled only from
 * the program record; parseAnalysisOutput tolerates a fence and rejects non-surfaceable output;
 * runApexAnalysis returns the live tier on a good response and the static tier on
 * fallback/throw/non-surfaceable — never throwing.
 */
import type { SovereignLLMResponse } from "@sovereign/api-client";

import {
  staticAnalysis,
  parseAnalysisOutput,
  runApexAnalysis,
} from "../src/apex-analysis";
import { isSurfaceableAnalysis, type ApexAnalysisOutput } from "../src/apex-contract";
import { createSyntheticApexDataAdapter } from "../src/apex-data-adapter";

const adapter = createSyntheticApexDataAdapter();
const p100 = adapter.getProgram("P-100")!;
const p200 = adapter.getProgram("P-200")!;
const ctxReq = { workflow_step_id: "ws", product: "APEX" as const, agent_id: "apex.ai-assistant", tier: "standard" as const };

function resp(over: Partial<SovereignLLMResponse>): SovereignLLMResponse {
  return { content: "", fallback_activated: false, ...over } as SovereignLLMResponse;
}

describe("staticAnalysis", () => {
  it("is schema-valid and surfaceable for an at-risk program", () => {
    const out = staticAnalysis(p100, "MSR", "ws");
    expect(isSurfaceableAnalysis(out)).toBe(true);
    expect(out.program_id).toBe("P-100");
    expect(out.risk_findings).toHaveLength(3);
    expect(out.status_narrative).toMatch(/62 percent/);
  });

  it("maps each risk flag's DC-3 provenance into the finding", () => {
    const out = staticAnalysis(p100, "MSR", "ws");
    const cost = out.risk_findings.find((f) => f.flag_id === "P-100-R1")!;
    expect(cost.source_data).toMatch(/cost ledger/i);
    expect(cost.baseline).toMatch(/58 percent/);
    expect(cost.responsible_party).toBe("Business Financial Manager Alex Reed");
    expect(cost.trend).toBe("DEGRADING");
  });

  it("produces no escalation recommendation for an on-track program", () => {
    const out = staticAnalysis(p200, "MSR", "ws");
    expect(out.risk_findings).toHaveLength(0);
    expect(out.recommendations.join(" ")).not.toMatch(/escalat/i);
    expect(out.recommendations.every((r) => r.startsWith("A reviewer should consider"))).toBe(true);
  });
});

describe("parseAnalysisOutput", () => {
  const good: ApexAnalysisOutput = staticAnalysis(p200, "MSR", "ws");

  it("parses plain JSON", () => {
    expect(parseAnalysisOutput(JSON.stringify(good))?.program_id).toBe("P-200");
  });

  it("tolerates a ```json fence", () => {
    expect(parseAnalysisOutput("```json\n" + JSON.stringify(good) + "\n```")?.program_id).toBe("P-200");
  });

  it("returns null for non-JSON", () => {
    expect(parseAnalysisOutput("not json")).toBeNull();
  });

  it("returns null for schema_valid:false output", () => {
    expect(parseAnalysisOutput(JSON.stringify({ ...good, schema_valid: false }))).toBeNull();
  });
});

describe("runApexAnalysis", () => {
  it("returns the live tier when the model returns a surfaceable output", async () => {
    const live = staticAnalysis(p200, "MSR", "ws");
    const out = await runApexAnalysis(p200, "MSR", "ws", "sys", ctxReq, {
      complete: async () => resp({ content: JSON.stringify(live), fallback_activated: false }),
    });
    expect(out.tier).toBe("live");
    expect(out.output.program_id).toBe("P-200");
  });

  it("falls back to static when the api-client signals fallback_activated", async () => {
    const out = await runApexAnalysis(p100, "MSR", "ws", "sys", ctxReq, {
      complete: async () => resp({ content: "", fallback_activated: true, fallback_tier: "static" } as Partial<SovereignLLMResponse>),
    });
    expect(out.tier).toBe("static");
    expect(out.detail).toMatch(/fallback/);
    expect(isSurfaceableAnalysis(out.output)).toBe(true);
  });

  it("falls back to static when the live response is not surfaceable", async () => {
    const out = await runApexAnalysis(p100, "MSR", "ws", "sys", ctxReq, {
      complete: async () => resp({ content: "garbage", fallback_activated: false }),
    });
    expect(out.tier).toBe("static");
    expect(out.detail).toBe("live_response_not_surfaceable");
  });

  it("falls back to static (never throws) when the call throws", async () => {
    const out = await runApexAnalysis(p100, "MSR", "ws", "sys", ctxReq, {
      complete: async () => { throw new Error("no key"); },
    });
    expect(out.tier).toBe("static");
    expect(out.detail).toMatch(/no key/);
  });
});

/** @jest-environment jsdom */
/**
 * module-apex — useReportGenerator.test.tsx
 * apex.report-generator hook: the sovereignHold() gate blocks generation and logs
 * REPORT_GENERATION_HELD; an unheld generation logs APEX_REPORT_GENERATED; attestation logs the
 * REPORT_ATTESTATION human decision; dossier export requires attestation and logs
 * APEX_DOSSIER_EXPORTED with a complete DC-2 package.
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { useReportGenerator } from "../src/useReportGenerator";
import { staticAnalysis } from "../src/apex-analysis";
import { isDossierComplete } from "../src/report-generator";
import { createSyntheticApexDataAdapter } from "../src/apex-data-adapter";
import { makeCtx } from "./test-helpers";

const adapter = createSyntheticApexDataAdapter();
const p100 = adapter.getProgram("P-100")!;
const analysis = staticAnalysis(p100, "MSR", "ws");

describe("useReportGenerator — hold gate", () => {
  it("blocks generation and logs REPORT_GENERATION_HELD when APEX is on hold", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useReportGenerator(makeCtx({ logSink, onHold: ["APEX"] }), { adapter }));
    act(() => result.current.generateReport(p100, analysis));
    expect(result.current.report).toBeNull();
    expect(result.current.hold?.held).toBe(true);
    expect(logSink.map((e) => e.event_type)).toEqual(["REPORT_GENERATION_HELD"]);
    expect(logSink[0].payload).toMatchObject({ program_id: "P-100" });
  });

  it("blocks when CPMI is on hold (APEX depends on CPMI)", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useReportGenerator(makeCtx({ logSink, onHold: ["CPMI"] }), { adapter }));
    act(() => result.current.generateReport(p100, analysis));
    expect(result.current.report).toBeNull();
    expect(logSink[0].event_type).toBe("REPORT_GENERATION_HELD");
  });
});

describe("useReportGenerator — generate, attest, export", () => {
  it("generates a report and logs APEX_REPORT_GENERATED when not held", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useReportGenerator(makeCtx({ logSink }), { adapter }));
    act(() => result.current.generateReport(p100, analysis));
    expect(result.current.report?.program_id).toBe("P-100");
    expect(logSink.map((e) => e.event_type)).toContain("APEX_REPORT_GENERATED");
  });

  it("logs the REPORT_ATTESTATION human decision on attest", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useReportGenerator(makeCtx({ logSink }), { adapter }));
    act(() => result.current.attest("P-100", "MSR", "Reviewed and accepted the analysis."));
    expect(result.current.attested).toBe(true);
    const dec = logSink.find((e) => e.event_type === "HUMAN_DECISION")!;
    expect(dec.decision_type).toBe("REPORT_ATTESTATION");
    expect(dec.actor).toBe("human");
    expect(dec.actor_name).toBe("Dana Reviewer");
  });

  it("rejects an empty attestation note", () => {
    const { result } = renderHook(() => useReportGenerator(makeCtx(), { adapter }));
    act(() => result.current.attest("P-100", "MSR", "   "));
    expect(result.current.attested).toBe(false);
    expect(result.current.error).toMatch(/attestation note is required/i);
  });

  it("refuses dossier export until an attestation is recorded", () => {
    const { result } = renderHook(() => useReportGenerator(makeCtx(), { adapter }));
    act(() => result.current.exportDossier("P-100"));
    expect(result.current.dossier).toBeNull();
    expect(result.current.error).toMatch(/attestation .* must be recorded/i);
  });

  it("exports a complete DC-2 dossier after attestation and logs APEX_DOSSIER_EXPORTED", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useReportGenerator(makeCtx({ logSink }), { adapter }));
    act(() => result.current.attest("P-100", "MSR", "Reviewed and accepted."));
    act(() => result.current.exportDossier("P-100", "PDF"));
    expect(result.current.dossier).not.toBeNull();
    expect(isDossierComplete(result.current.dossier!)).toBe(true);
    expect(logSink.map((e) => e.event_type)).toContain("APEX_DOSSIER_EXPORTED");
    const exp = logSink.find((e) => e.event_type === "APEX_DOSSIER_EXPORTED")!;
    expect(exp.payload).toMatchObject({ program_id: "P-100", export_format: "PDF" });
  });

  it("blocks dossier export with REPORT_GENERATION_HELD when held even after attestation", () => {
    const logSink: SovereignLogEvent[] = [];
    const { result } = renderHook(() => useReportGenerator(makeCtx({ logSink, onHold: ["APEX"] }), { adapter }));
    act(() => result.current.attest("P-100", "MSR", "Reviewed."));
    act(() => result.current.exportDossier("P-100"));
    expect(result.current.dossier).toBeNull();
    expect(logSink.map((e) => e.event_type)).toContain("REPORT_GENERATION_HELD");
  });
});

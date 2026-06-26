/**
 * SOVEREIGN Platform — module-apex
 * ReportGenerationPanel.tsx — APEX Screen 3 (spec §5 Screen 3, deliverable D-APEX-4).
 *
 * A program manager selects a report type (MSR / QPR / ad-hoc) and a program, runs the
 * analysis (apex.ai-assistant via createSovereignClient), and the apex.report-generator
 * assembles the document. The sovereignHold() gate is enforced (held generation shows a
 * plain-prose Category 1 notice and produces nothing). Before export, a human attestation
 * (REPORT_ATTESTATION) is required. The Export Dossier action produces the complete DC-2
 * package.
 *
 * Version: 1.0 · Session 17 · June 25, 2026
 */

import { Fragment, useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import type { ApexDataAdapter } from "./apex-data-adapter";
import type { ApexReportType } from "./apex-contract";
import { useApexAnalysis } from "./useApexAnalysis";
import { useReportGenerator } from "./useReportGenerator";
import { ReportCharts } from "./ReportCharts";
import {
  rootStyle,
  contentCardStyle,
  titleStyle,
  subtitleStyle,
  sectionHeadingStyle,
  bodyTextStyle,
  Gate1Banner,
  ClassificationBoundaryBanner,
  StatusNotice,
} from "./banners";

export interface ReportGenerationPanelProps {
  ctx: SovereignShellContext;
  adapter: ApexDataAdapter;
}

const REPORT_TYPES: Array<{ id: ApexReportType; label: string }> = [
  { id: "MSR", label: "Monthly Status Report" },
  { id: "QPR", label: "Quarterly Program Review" },
  { id: "AD_HOC", label: "Ad-hoc Analysis" },
];

export function ReportGenerationPanel({ ctx, adapter }: ReportGenerationPanelProps): JSX.Element {
  const programs = adapter.listPrograms();
  const [programId, setProgramId] = useState(programs[0]?.program_id ?? "");
  const [reportType, setReportType] = useState<ApexReportType>("MSR");
  const [note, setNote] = useState("");

  const analysis = useApexAnalysis(ctx, { adapter });
  const gen = useReportGenerator(ctx, { adapter });

  // The program the displayed report was generated for (DC-4 charts read from it).
  const reportProgram = gen.report ? adapter.getProgram(gen.report.program_id) : null;

  const onGenerate = async (): Promise<void> => {
    const program = adapter.getProgram(programId);
    if (!program) return;
    const outcome = await analysis.runAnalysis(programId, reportType);
    if (outcome) gen.generateReport(program, outcome.output);
  };

  return (
    <section style={rootStyle} aria-label="APEX Report Generation">
      <header style={{ marginBottom: 16 }}>
        <h1 style={titleStyle}>APEX — Report Generation</h1>
        <p style={subtitleStyle}>Generate a status report or program dossier from governed program data.</p>
      </header>

      <Gate1Banner />
      <ClassificationBoundaryBanner operatorName={ctx.auth.user.name} />

      <div style={contentCardStyle}>
      <div style={formStyle}>
        <label style={labelStyle}>
          Report type
          <select aria-label="report type" value={reportType} onChange={(e) => setReportType(e.target.value as ApexReportType)} style={selectStyle}>
            {REPORT_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          Program
          <select aria-label="program" value={programId} onChange={(e) => setProgramId(e.target.value)} style={selectStyle}>
            {programs.map((p) => (
              <option key={p.program_id} value={p.program_id}>{p.program_id} — {p.program_name}</option>
            ))}
          </select>
        </label>
        <button type="button" onClick={onGenerate} style={primaryBtnStyle} disabled={analysis.status === "running"}>
          {analysis.status === "running" ? "Generating…" : "Generate Report"}
        </button>
      </div>
      </div>

      {gen.hold?.held ? (
        <StatusNotice label="Report generation is paused.">{gen.hold.reason}</StatusNotice>
      ) : null}

      {analysis.error ? <p role="alert" style={errorStyle}>{analysis.error}</p> : null}
      {gen.error ? <p role="alert" style={errorStyle}>{gen.error}</p> : null}

      {analysis.outcome && analysis.outcome.tier === "static" ? (
        <StatusNotice label="Live analysis service unavailable.">
          This analysis was prepared from the available program data because the live analysis service is not
          connected in this environment. A reviewer should treat it as a degraded output and confirm the figures
          before relying on them.
        </StatusNotice>
      ) : null}

      {gen.report ? (
        <div style={contentCardStyle} data-category="3-content">
          <h2 style={sectionHeadingStyle}>{gen.report.title}</h2>
          {gen.report.sections.map((s) => (
            <Fragment key={s.heading}>
              <div>
                <h3 style={subHeadingStyle}>{s.heading}</h3>
                {s.body.split("\n\n").map((para, i) => (
                  <p key={i} style={bodyTextStyle}>{para}</p>
                ))}
              </div>
              {/* DC-4 — visual indicators between the status narrative and the risk findings. */}
              {s.heading === "Program Status" && reportProgram ? <ReportCharts program={reportProgram} /> : null}
            </Fragment>
          ))}

          <h3 style={subHeadingStyle}>Attestation</h3>
          <p style={bodyTextStyle}>
            Before this report can be exported, a reviewer must attest that they have reviewed the AI-generated
            analysis and accept it as the basis for the report.
          </p>
          <textarea
            aria-label="attestation note"
            placeholder="Describe your review and acceptance of this analysis (required)."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={textareaStyle}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button type="button" onClick={() => gen.attest(programId, reportType, note)} style={primaryBtnStyle} disabled={gen.attested}>
              {gen.attested ? "Attested ✓" : "Attest report"}
            </button>
            <button type="button" onClick={() => gen.exportDossier(programId)} style={exportBtnStyle} disabled={!gen.attested}>
              Export Dossier
            </button>
          </div>
        </div>
      ) : null}

      {gen.dossier ? (
        <p style={{ ...bodyTextStyle, marginTop: 12, color: "#065f46" }} role="status">
          The complete program dossier for {gen.dossier.program.program_id} was exported as a {gen.dossier.export_format === "PDF" ? "PDF" : "formatted document"}.
          It contains the World Model record, {gen.dossier.reasoning_chain_history.length} reasoning chain entries,
          {" "}{gen.dossier.governance_decisions.length} governance decisions, {gen.dossier.risk_register.length} risk register items,
          {" "}{gen.dossier.regulatory_constraints.length} regulatory constraints, and {gen.dossier.task_history.length} agent task records.
        </p>
      ) : null}
    </section>
  );
}

const formStyle: CSSProperties = { display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 16 };
const labelStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#334155", fontWeight: 600 };
const selectStyle: CSSProperties = { padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, minWidth: 220 };
const primaryBtnStyle: CSSProperties = { padding: "7px 16px", borderRadius: 6, border: "1px solid #0c4a6e", background: "#0c4a6e", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 };
const exportBtnStyle: CSSProperties = { padding: "7px 16px", borderRadius: 6, border: "1px solid #047857", background: "#047857", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 };
const subHeadingStyle: CSSProperties = { margin: "12px 0 4px", fontSize: 14, color: "#0f172a" };
const errorStyle: CSSProperties = { margin: "0 0 10px", color: "#b91c1c", fontSize: 13, fontWeight: 600 };
const textareaStyle: CSSProperties = { width: "100%", maxWidth: 820, minHeight: 70, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, fontFamily: "inherit" };

export default ReportGenerationPanel;

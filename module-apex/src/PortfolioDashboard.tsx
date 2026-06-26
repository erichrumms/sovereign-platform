/**
 * SOVEREIGN Platform — module-apex
 * PortfolioDashboard.tsx — APEX Screen 1 (spec §5 Screen 1, deliverable D-APEX-2).
 *
 * The entry point: the full portfolio of programs from the CPMI World Model (via the
 * ApexDataAdapter), with plain-prose status for each (Gap 5) and an Export Dossier button on
 * every row (DC-2 — never more than one click from the record). Governance banners are
 * Category 2 (permanent, blue); the program list is Category 3 (substantive). On load the
 * dashboard emits APEX_ANALYSIS_STARTED for the portfolio overview.
 *
 * Version: 1.0 · Session 17 · June 25, 2026
 */

import { useEffect, useMemo, useRef, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import type { ApexDataAdapter } from "./apex-data-adapter";
import { APEX_AI_ASSISTANT } from "./apex-contract";
import {
  Gate1Banner,
  ClassificationBoundaryBanner,
  rootStyle,
  titleStyle,
  subtitleStyle,
  sectionHeadingStyle,
  statusPillColors,
  statusLabelText,
} from "./banners";

export interface PortfolioDashboardProps {
  ctx: SovereignShellContext;
  adapter: ApexDataAdapter;
  onOpenProgram: (programId: string) => void;
  onExportDossier: (programId: string) => void;
}

const PORTFOLIO_STEP = "apex-portfolio-overview";

export function PortfolioDashboard({ ctx, adapter, onOpenProgram, onExportDossier }: PortfolioDashboardProps): JSX.Element {
  const programs = useMemo(() => adapter.listPrograms(), [adapter]);
  const emittedRef = useRef(false);

  useEffect(() => {
    if (emittedRef.current) return;
    emittedRef.current = true;
    try {
      ctx.logger.log({
        event_type: "APEX_ANALYSIS_STARTED",
        workflow_step_id: PORTFOLIO_STEP, // Constraint #6
        sovereign_tier: "standard",
        product: "APEX",
        actor_id: ctx.auth.user.employee_id,
        agent_id: APEX_AI_ASSISTANT,
        outcome: "apex_portfolio_view_loaded",
        payload: { view: "portfolio", program_count: programs.length },
      });
    } catch {
      // Telemetry-only on view load — never block the dashboard from rendering.
    }
  }, [ctx, programs.length]);

  const atRisk = programs.filter((p) => p.status_label === "AT_RISK").length;
  const offTrack = programs.filter((p) => p.status_label === "OFF_TRACK").length;
  const openFlags = programs.reduce((sum, p) => sum + p.risk_flags.length, 0);

  return (
    <section style={rootStyle} aria-label="APEX Portfolio Dashboard">
      <header style={{ marginBottom: 16 }}>
        <h1 style={titleStyle}>APEX — Portfolio Dashboard</h1>
        <p style={subtitleStyle}>Analytics and Program Executive Suite · program portfolio overview</p>
      </header>

      <Gate1Banner />
      <ClassificationBoundaryBanner operatorName={ctx.auth.user.name} />

      <p style={rollupStyle} data-category="3-content">
        This portfolio contains {programs.length} programs. {atRisk === 0 ? "No programs are currently at risk" : `${atRisk} ${atRisk === 1 ? "program is" : "programs are"} at risk`}, {offTrack === 0 ? "and none are off track" : `${offTrack} ${offTrack === 1 ? "program is" : "programs are"} off track`}. There are {openFlags} open risk {openFlags === 1 ? "flag" : "flags"} across the portfolio.
      </p>

      <h2 style={sectionHeadingStyle}>Programs</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Program</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Completion</th>
            <th style={thStyle}>Responsible party</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {programs.map((p) => {
            const pill = statusPillColors(p.status_label);
            return (
              <tr key={p.program_id} style={rowStyle}>
                <td style={tdStyle}>
                  <button type="button" onClick={() => onOpenProgram(p.program_id)} style={linkBtnStyle}>
                    <strong>{p.program_id}</strong> — {p.program_name}
                  </button>
                </td>
                <td style={tdStyle}>
                  <span style={{ ...pillStyle, color: pill.color, background: pill.background }}>{statusLabelText(p.status_label)}</span>
                </td>
                <td style={tdStyle}>{p.completion_pct} percent complete</td>
                <td style={tdStyle}>{p.responsible_party}</td>
                <td style={tdStyle}>
                  <button type="button" onClick={() => onExportDossier(p.program_id)} style={exportBtnStyle}>
                    Export Dossier
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

const rollupStyle: CSSProperties = { margin: "0 0 16px", color: "#334155", fontSize: 14, lineHeight: 1.5, maxWidth: 820 };
const tableStyle: CSSProperties = { borderCollapse: "collapse", width: "100%", fontSize: 13, maxWidth: 920 };
const thStyle: CSSProperties = { textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #cbd5e1", color: "#334155", fontWeight: 700 };
const tdStyle: CSSProperties = { padding: "8px", borderBottom: "1px solid #e2e8f0", color: "#0f172a" };
const rowStyle: CSSProperties = {};
const linkBtnStyle: CSSProperties = { background: "none", border: "none", padding: 0, color: "#1e40af", cursor: "pointer", fontSize: 13, textAlign: "left", textDecoration: "underline" };
const pillStyle: CSSProperties = { display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 };
const exportBtnStyle: CSSProperties = { padding: "4px 12px", borderRadius: 6, border: "1px solid #0c4a6e", background: "#0c4a6e", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 };

export default PortfolioDashboard;

/**
 * SOVEREIGN Platform — module-apex
 * PPBEProgramDetail.tsx — single-program PPBE detail view (Session 57, D1 — WG-11 + WG-8).
 *
 * Opened when the user selects a program in PPBEDashboard. This view does NOT go through
 * ProgramDetailView / adapter.getProgram() — those only handle World Model IDs (P-100 etc.)
 * and would return "no record found" for PPBE synthetic IDs (GD-29 decision).
 *
 * Four sections shown for the selected program:
 *   1. Obligation status — rate percent, on_track/at_risk/off_track, planned vs. obligated
 *   2. Budget-to-actual variance history — one row per obligation plan period
 *   3. Dependency health — filtered to deps whose source/target workflow encodes this programId
 *   4. Site breakdown — via sitesForProgram(programId), already filtered to this program
 *
 * Constraint #2 compliance: reuses obligationRate(), budgetToActualVariance(),
 * dependencyHealthIndex(), actualsForProgram(), sitesForProgram(), and
 * statusFromObligationRate() — no parallel implementations.
 *
 * Version: 1.0 · Session 57 · July 23, 2026
 */

import type { CSSProperties } from "react";
import type { DependencyMap } from "@sovereign/data";
import {
  rootStyle,
  contentCardStyle,
  sectionHeadingStyle,
  bodyTextStyle,
} from "./banners";
import {
  obligationRate,
  budgetToActualVariance,
  dependencyHealthIndex,
  statusFromObligationRate,
  type PPBEDashboardInputs,
} from "./ppbe-dashboard";
import { actualsForProgram } from "./ppbe-data-adapter";
import { sitesForProgram } from "./ppbe-site-breakdown";

export interface PPBEProgramDetailProps {
  programId: string;
  inputs: PPBEDashboardInputs;
  onBack: () => void;
}

function statusFill(status: ReturnType<typeof statusFromObligationRate>): string {
  if (status === "on_track") return "#059669";
  if (status === "at_risk") return "#d97706";
  return "#dc2626";
}

function statusLabel(status: ReturnType<typeof statusFromObligationRate>): string {
  if (status === "on_track") return "On track";
  if (status === "at_risk") return "At risk";
  return "Off track";
}

function depStatusFill(status: DependencyMap["health_status"]): string {
  if (status === "healthy") return "#059669";
  if (status === "at-risk") return "#d97706";
  return "#dc2626";
}

function depStatusLabel(status: DependencyMap["health_status"]): string {
  if (status === "healthy") return "Healthy";
  if (status === "at-risk") return "At risk";
  return "Failed";
}

const DEP_STATUS_ORDER: Record<DependencyMap["health_status"], number> = {
  failed: 0,
  "at-risk": 1,
  healthy: 2,
};

export function PPBEProgramDetail({ programId, inputs, onBack }: PPBEProgramDetailProps): JSX.Element {
  const program = inputs.programs.find((p) => p.program_id === programId);

  if (!program) {
    return (
      <section style={rootStyle} aria-label="PPBE Program Detail">
        <button type="button" onClick={onBack} style={backButtonStyle}>
          ← Back to dashboard
        </button>
        <p style={bodyTextStyle}>No PPBE program record found for {programId}.</p>
      </section>
    );
  }

  const obligationMetric = obligationRate(program, inputs.obligations);
  const actuals = actualsForProgram(inputs.obligations, programId);
  const variances = budgetToActualVariance(program, actuals);
  const filteredDeps = inputs.dependencies.filter(
    (d) => d.source_workflow.includes(programId) || d.target_workflow.includes(programId)
  );
  const depHealth = dependencyHealthIndex(filteredDeps);
  const sites = sitesForProgram(programId);
  const obligationStatus = statusFromObligationRate(obligationMetric.rate_percent);
  const sortedDeps = [...filteredDeps].sort(
    (a, b) => DEP_STATUS_ORDER[a.health_status] - DEP_STATUS_ORDER[b.health_status]
  );

  return (
    <section style={rootStyle} aria-label={`PPBE Program Detail — ${programId}`}>
      <header style={{ marginBottom: 12 }}>
        <button type="button" onClick={onBack} style={backButtonStyle}>
          ← Back to dashboard
        </button>
        <h1 style={{ margin: "8px 0 2px", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
          {program.name}
        </h1>
        <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{programId}</p>
      </header>

      {/* Section 1 — Obligation status */}
      <div style={contentCardStyle}>
        <h2 style={sectionHeadingStyle}>Obligation status</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span
            aria-label={`Obligation rate: ${obligationMetric.rate_percent !== null ? `${obligationMetric.rate_percent}%` : "not computed"}`}
            style={{ fontSize: 28, fontWeight: 700, color: statusFill(obligationStatus) }}
          >
            {obligationMetric.rate_percent !== null ? `${obligationMetric.rate_percent}%` : "—"}
          </span>
          <span
            style={{
              padding: "2px 10px",
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 700,
              background: "#f8fafc",
              border: `1px solid ${statusFill(obligationStatus)}`,
              color: statusFill(obligationStatus),
            }}
          >
            {statusLabel(obligationStatus)}
          </span>
        </div>
        <p style={captionStyle}>{obligationMetric.narrative}</p>
        <table style={tableStyle} aria-label="Obligation totals">
          <tbody>
            <tr>
              <td style={tdLabelStyle}>Planned total</td>
              <td style={tdValueStyle}>{obligationMetric.planned_total.toLocaleString()}</td>
            </tr>
            <tr>
              <td style={tdLabelStyle}>Obligated total</td>
              <td style={tdValueStyle}>{obligationMetric.obligated_total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 2 — Budget-to-actual variance history */}
      <div style={contentCardStyle}>
        <h2 style={sectionHeadingStyle}>Budget-to-actual variance history</h2>
        {variances.length === 0 ? (
          <p style={bodyTextStyle}>No obligation plan periods are recorded for this program.</p>
        ) : (
          <table style={tableStyle} aria-label="Budget-to-actual variance by period">
            <thead>
              <tr>
                <th style={thStyle}>Period</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Planned</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actual</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Variance</th>
              </tr>
            </thead>
            <tbody>
              {variances.map((v) => (
                <tr key={v.period}>
                  <td style={tdStyle}>{v.period}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>{v.planned_amount.toLocaleString()}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>{v.actual_amount.toLocaleString()}</td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "right",
                      color: v.variance === 0 ? "#334155" : v.variance > 0 ? "#059669" : "#dc2626",
                      fontWeight: v.variance !== 0 ? 600 : 400,
                    }}
                  >
                    {v.variance > 0
                      ? `+${v.variance.toLocaleString()}`
                      : v.variance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {variances.map((v) => (
          <p key={`n-${v.period}`} style={captionStyle}>{v.narrative}</p>
        ))}
      </div>

      {/* Section 3 — Dependency health (filtered to this program's workflows) */}
      <div style={contentCardStyle}>
        <h2 style={sectionHeadingStyle}>Dependency health</h2>
        <p style={captionStyle}>{depHealth.narrative}</p>
        {sortedDeps.length === 0 ? (
          <p style={bodyTextStyle}>No inter-workflow dependencies involve this program.</p>
        ) : (
          <table style={tableStyle} aria-label="Dependency detail">
            <thead>
              <tr>
                <th style={thStyle}>Dependency</th>
                <th style={thStyle}>Hands off from</th>
                <th style={thStyle}>To</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedDeps.map((d) => (
                <tr key={d.dependency_id} title={`${d.handoff_standard} (${d.timing_requirement})`}>
                  <td style={tdStyle}>{d.dependency_id}</td>
                  <td style={tdStyle}>{d.source_workflow}</td>
                  <td style={tdStyle}>{d.target_workflow}</td>
                  <td style={tdStyle}>
                    <span style={{ color: depStatusFill(d.health_status), fontWeight: 600 }}>
                      {depStatusLabel(d.health_status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Section 4 — Site breakdown (filtered to this program) */}
      <div style={contentCardStyle}>
        <h2 style={sectionHeadingStyle}>Site breakdown</h2>
        {sites.length === 0 ? (
          <p style={bodyTextStyle}>No sites are recorded for this program.</p>
        ) : (
          <table style={tableStyle} aria-label="Per-site obligation breakdown">
            <thead>
              <tr>
                <th style={thStyle}>Site</th>
                <th style={thStyle}>Region</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Obligated</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Planned</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((s) => (
                <tr key={s.site_id}>
                  <td style={tdStyle}>{s.site_name}</td>
                  <td style={tdStyle}>{s.region}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    {s.obligations_to_date.toLocaleString()}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    {s.planned_amount.toLocaleString()}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: statusFill(s.status), fontWeight: 600 }}>
                      {statusLabel(s.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default PPBEProgramDetail;

// ─── Styles ────────────────────────────────────────────────────────────────────
const captionStyle: CSSProperties = {
  margin: "0 0 6px",
  color: "#475569",
  fontSize: 12,
  lineHeight: 1.5,
};
const tableStyle: CSSProperties = {
  borderCollapse: "collapse",
  width: "100%",
  maxWidth: 820,
  fontSize: 13,
};
const thStyle: CSSProperties = {
  padding: "6px 10px",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
  textAlign: "left",
  fontWeight: 600,
  color: "#0f172a",
};
const tdStyle: CSSProperties = {
  padding: "6px 10px",
  borderBottom: "1px solid #f1f5f9",
  color: "#334155",
};
const tdLabelStyle: CSSProperties = {
  ...tdStyle,
  fontWeight: 500,
  color: "#64748b",
  width: 140,
};
const tdValueStyle: CSSProperties = {
  ...tdStyle,
  fontWeight: 600,
};
const backButtonStyle: CSSProperties = {
  padding: "4px 10px",
  fontSize: 12,
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
  color: "#0f172a",
  fontFamily: "system-ui, sans-serif",
};

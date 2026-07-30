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
 * Version: 1.2 · Session 70 · July 26, 2026 (WG-6: multi-year PPBE data + year selector)
 */

import { useState, type CSSProperties } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DependencyMap } from "@sovereign/data";
import { formatCurrency } from "../../sovereign-shell/src/format-currency";
import {
  rootStyle,
  contentCardStyle,
  sectionHeadingStyle,
  bodyTextStyle,
  StatusNotice,
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

function fiscalYearOf(isoTimestamp: string): string {
  const year = Number(isoTimestamp.slice(0, 4));
  const month = Number(isoTimestamp.slice(5, 7));
  return `FY ${month >= 10 ? year + 1 : year}`;
}

const YEAR_PHASE_LABELS: Record<string, string> = {
  'FY 2025': 'PY (FY 2025)',
  'FY 2026': 'CY (FY 2026)',
  'FY 2027': 'BY (FY 2027)',
  'FY 2028': 'BY+1 (FY 2028)',
};

export function PPBEProgramDetail({ programId, inputs, onBack }: PPBEProgramDetailProps): JSX.Element {
  // Derive years available for this specific program.
  const availableYears = Array.from(
    new Set(
      inputs.programs
        .filter((p) => p.program_id === programId)
        .map((p) => p.fiscal_year)
    )
  ).sort();

  const [selectedFiscalYear, setSelectedFiscalYear] = useState(() =>
    availableYears.includes('FY 2026') ? 'FY 2026' : (availableYears[0] ?? 'FY 2026')
  );

  const program = inputs.programs.find(
    (p) => p.program_id === programId && p.fiscal_year === selectedFiscalYear
  );

  if (!program) {
    return (
      <section style={rootStyle} aria-label="PPBE Program Detail">
        <button type="button" onClick={onBack} style={backButtonStyle}>
          ← Back to dashboard
        </button>
        {availableYears.length > 1 && (
          <div style={yearSelectorStyle} role="group" aria-label="Fiscal year">
            {availableYears.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedFiscalYear(yr)}
                aria-pressed={yr === selectedFiscalYear}
                style={{
                  ...yearButtonStyle,
                  background: yr === selectedFiscalYear ? "#0f172a" : "#fff",
                  color: yr === selectedFiscalYear ? "#fff" : "#0f172a",
                  borderColor: yr === selectedFiscalYear ? "#0f172a" : "#e2e8f0",
                }}
              >
                {YEAR_PHASE_LABELS[yr] ?? yr}
              </button>
            ))}
          </div>
        )}
        <p style={bodyTextStyle}>No PPBE program record found for {programId} in {selectedFiscalYear}.</p>
      </section>
    );
  }

  // BY (FY2027) is a formal budget request; BY+1 (FY2028) has no obligation concept.
  // Execution metrics (obligation rate, variance vs. actuals) must not render for these years.
  const isBudgetYear = selectedFiscalYear === 'FY 2027' || selectedFiscalYear === 'FY 2028';

  const yearObligations = inputs.obligations.filter(
    (o) => fiscalYearOf(o.timestamp) === selectedFiscalYear
  );
  const obligationMetric = obligationRate(program, yearObligations);
  const actuals = actualsForProgram(yearObligations, programId);
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

      {availableYears.length > 1 && (
        <div style={yearSelectorStyle} role="group" aria-label="Fiscal year">
          {availableYears.map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => setSelectedFiscalYear(yr)}
              aria-pressed={yr === selectedFiscalYear}
              style={{
                ...yearButtonStyle,
                background: yr === selectedFiscalYear ? "#0f172a" : "#fff",
                color: yr === selectedFiscalYear ? "#fff" : "#0f172a",
                borderColor: yr === selectedFiscalYear ? "#0f172a" : "#e2e8f0",
              }}
            >
              {YEAR_PHASE_LABELS[yr] ?? yr}
            </button>
          ))}
        </div>
      )}

      {/* Section 1 — Obligation status */}
      <div style={contentCardStyle}>
        <h2 style={sectionHeadingStyle}>Obligation status</h2>
        {isBudgetYear ? (
          <StatusNotice label={`${YEAR_PHASE_LABELS[selectedFiscalYear] ?? selectedFiscalYear} — planning phase.`}>
            {selectedFiscalYear === 'FY 2028'
              ? 'BY+1 (FY 2028) has no obligation concept. Obligation rates and execution status are not applicable to this year.'
              : 'BY (FY 2027) is a budget-year request. Obligation rates and on-track/off-track status apply only to years with actual obligation records (PY and CY).'}
          </StatusNotice>
        ) : (
          <>
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
                  <td style={tdValueStyle}>{formatCurrency(obligationMetric.planned_total)}</td>
                </tr>
                <tr>
                  <td style={tdLabelStyle}>Obligated total</td>
                  <td style={tdValueStyle}>{formatCurrency(obligationMetric.obligated_total)}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Section 2 — Budget-to-actual variance history */}
      <div style={contentCardStyle}>
        <h2 style={sectionHeadingStyle}>Budget-to-actual variance history</h2>
        {isBudgetYear ? (
          <StatusNotice label={`${YEAR_PHASE_LABELS[selectedFiscalYear] ?? selectedFiscalYear} — planning phase.`}>
            Variance analysis compares actual obligations against plan. Budget-year planning estimates
            do not have actual obligation records by definition — displaying a variance figure would be structurally misleading.
          </StatusNotice>
        ) : variances.length === 0 ? (
          <p style={bodyTextStyle}>No obligation plan periods are recorded for this program.</p>
        ) : (
          <>
            <div aria-label="Budget-to-actual variance history chart" style={{ marginBottom: 8 }}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={variances}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 10, angle: -20, textAnchor: "end" }} height={44} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={formatCurrency} />
                  <Tooltip formatter={(val) => (typeof val === "number" ? formatCurrency(val) : String(val))} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="planned_amount"
                    name="Planned"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual_amount"
                    name="Actual"
                    stroke="#0c4a6e"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Narrative captions — Gap 5 compliance */}
            {variances.map((v) => (
              <p key={`n-${v.period}`} style={captionStyle}>{v.narrative}</p>
            ))}
          </>
        )}
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
                    {formatCurrency(s.obligations_to_date)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    {formatCurrency(s.planned_amount)}
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
const yearSelectorStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginBottom: 16,
};
const yearButtonStyle: CSSProperties = {
  padding: "4px 14px",
  fontSize: 13,
  border: "1px solid",
  borderRadius: 6,
  cursor: "pointer",
  fontFamily: "system-ui, sans-serif",
  fontWeight: 500,
};

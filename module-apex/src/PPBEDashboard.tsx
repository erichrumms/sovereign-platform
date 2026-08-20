/**
 * SOVEREIGN Platform — module-apex
 * PPBEDashboard.tsx — the PPBE performance dashboard (Session 32, D5;
 * docs/18 §7.2 APEX scope). Session 46 (D1–D3) adds Recharts visualizations,
 * program-selection wiring, and the per-site breakdown placeholder.
 *
 * Three metric sections now render charts:
 *   - Obligation rate: BarChart, one bar per program, colored by
 *     statusFromObligationRate() — the same thresholds as GD-23.
 *   - Budget-to-actual variance: grouped BarChart (planned vs. actual) across
 *     all program/period pairs.
 *   - Dependency health: a count table — three rows, not a chart. Reasoning:
 *     the data is three aggregate counts with no temporal or per-program
 *     dimension. A chart would add visual complexity without insight; a table
 *     gives the same three numbers more legibly. The narrative prose provides
 *     the plain-language summary underneath (Gap 5). This matches the judgment
 *     used for MilestoneCount in ReportCharts.tsx.
 *
 * Gap 5 compliance: every chart retains the narrative text in the DOM as a
 * caption below the visual — the prose was doing real work; the chart adds
 * clarity without removing the accessible explanation.
 *
 * D2 (program selection): each program in the obligation-rate section has an
 * accessible row button that calls onSelectProgram(programId). The bar chart
 * also fires the same callback via its onClick handler for mouse users.
 *
 * D3 (site breakdown): a local SyntheticSiteBreakdown placeholder section at
 * the bottom of the dashboard. The disclosure notice is part of the rendered
 * UI — not a code comment — per the spec's honesty requirement.
 *
 * Session 54 (WG-3/WG-4/WG-12): obligation-rate codename key line; explicit
 * Legend payload on the variance chart (deterministic order); dependency
 * health now ALSO renders the individual records (which handoff, which
 * status) below the counts — the counts table and its reasoning are unchanged.
 *
 * Version: 1.4 · Session 70 · July 26, 2026 (WG-6: multi-year PPBE data + year selector)
 */

import { useState, type CSSProperties } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  type BarRectangleItem,
  type TooltipContentProps,
} from "recharts";

import { formatCurrency } from "../../sovereign-shell/src/format-currency";
import {
  rootStyle,
  contentCardStyle,
  titleStyle,
  subtitleStyle,
  sectionHeadingStyle,
  bodyTextStyle,
  StatusNotice,
} from "./banners";
import {
  buildPPBEDashboard,
  EMPTY_PPBE_EVENT_COUNTS,
  PPBE_EVENT_TYPES,
  statusFromObligationRate,
  type ObligationRateMetric,
  type PeriodVariance,
  type PPBEDashboardInputs,
} from "./ppbe-dashboard";
import { SYNTH_SITE_BREAKDOWNS } from "./ppbe-site-breakdown";
import { actualsForProgram } from "./ppbe-data-adapter";
import type { DependencyMap } from "@sovereign/data";

export interface PPBEDashboardProps {
  /** Host-assembled governed data. Omitted → honest empty state. */
  inputs?: PPBEDashboardInputs;
  /**
   * D2 callback: called when the user selects a program in the obligation-rate
   * chart. The host (ApexApp) wires this to setSelectedProgram + setTab("detail")
   * — the existing infrastructure, not a new navigation mechanism.
   *
   * WH-49 fix: the currently selected fiscal year is passed alongside the program
   * ID so the host can initialize PPBEProgramDetail to the same year, preventing
   * the PY→CY default reset on navigation.
   */
  onSelectProgram?: (programId: string, fiscalYear: string) => void;
}

const EMPTY_INPUTS: PPBEDashboardInputs = {
  programs: [],
  obligations: [],
  actualsByProgram: {},
  dependencies: [],
  findings: [],
  eventCounts: EMPTY_PPBE_EVENT_COUNTS,
};

// ─── Color palette (matches statusFromObligationRate thresholds) ──────────────
function statusFill(status: ReturnType<typeof statusFromObligationRate>): string {
  if (status === "on_track") return "#059669";  // emerald-600
  if (status === "at_risk") return "#d97706";   // amber-600
  return "#dc2626";                             // red-600
}

function statusLabel(status: ReturnType<typeof statusFromObligationRate>): string {
  if (status === "on_track") return "On track";
  if (status === "at_risk") return "At risk";
  return "Off track";
}

// ─── Short axis label (last segment of the ID, e.g. "SYNTH-PRG-ALPHA" → "ALPHA") ─
function shortId(programId: string): string {
  const parts = programId.split("-");
  return parts[parts.length - 1];
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
// Default generics (ValueType, NameType) so this matches ContentType<ValueType, NameType>
// expected by the Tooltip component. Narrower params would fail contravariance.
function NarrativeTooltip(props: TooltipContentProps): JSX.Element | null {
  if (!props.active || !props.payload?.length) return null;
  const narrative = (props.payload[0].payload as { narrative?: string })?.narrative;
  if (!narrative) return null;
  return (
    <div style={tooltipStyle}>
      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, maxWidth: 300 }}>{narrative}</p>
    </div>
  );
}

// ─── Obligation rate chart ────────────────────────────────────────────────────
interface ObligationChartItem {
  program_id: string;
  label: string;
  rate_percent: number;
  narrative: string;
}

function ObligationRateChart({
  rates,
  names,
  onSelectProgram,
}: {
  rates: ObligationRateMetric[];
  names: Record<string, string>;
  onSelectProgram?: (id: string) => void;
}): JSX.Element {
  const chartData: ObligationChartItem[] = rates.map((m) => ({
    program_id: m.program_id,
    label: shortId(m.program_id),
    rate_percent: m.rate_percent ?? 0,
    narrative: m.narrative,
  }));

  return (
    <>
      {/* WG-3 (Session 54): the axis uses short codenames (ALPHA, BRAVO...) while the
          text below uses full names — this always-visible one-line key bridges the
          two, rather than relying on a hover tooltip alone. */}
      <p style={captionStyle} aria-label="Program codename key">
        {chartData
          .map((c) => `${c.label} = ${names[c.program_id] ?? c.program_id}`)
          .join("  ·  ")}
      </p>
      <div aria-label="Obligation rate bar chart" style={{ marginBottom: 8 }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 11 }} />
            <Tooltip content={NarrativeTooltip} />
            <Bar
              dataKey="rate_percent"
              name="Obligation rate"
              cursor={onSelectProgram ? "pointer" : undefined}
              onClick={(barData: BarRectangleItem) => {
                const id = (barData.payload as ObligationChartItem | undefined)?.program_id;
                if (id) onSelectProgram?.(id);
              }}
            >
              {chartData.map((item) => (
                <Cell
                  key={item.program_id}
                  fill={statusFill(statusFromObligationRate(item.rate_percent))}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible program rows — keyboard/SR navigation and test anchors (D2) */}
      {onSelectProgram && rates.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <p style={{ ...captionStyle, marginBottom: 4 }}>Select a program to open its full detail view:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {rates.map((m) => {
              const st = statusFromObligationRate(m.rate_percent);
              return (
                <button
                  key={m.program_id}
                  type="button"
                  onClick={() => onSelectProgram(m.program_id)}
                  aria-label={`View detail for ${names[m.program_id] ?? m.program_id}`}
                  style={{
                    ...programButtonStyle,
                    borderColor: statusFill(st),
                    color: statusFill(st),
                  }}
                >
                  {names[m.program_id] ?? m.program_id} — {m.rate_percent !== null ? `${m.rate_percent}%` : "No plan"} · {statusLabel(st)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Narrative captions — Gap 5 plain-language compliance, kept in DOM */}
      {rates.map((m) => (
        <p key={m.program_id} style={captionStyle}>{m.narrative}</p>
      ))}
    </>
  );
}

// ─── Budget-to-actual variance chart ─────────────────────────────────────────

// WG-4 (Session 54): fixed-order legend items — Planned then Actual, matching
// the bar-body order below. Rendered by VarianceLegendContent.
const VARIANCE_LEGEND_ITEMS = [
  { label: "Planned", color: "#94a3b8" },
  { label: "Obligated", color: "#0c4a6e" },
] as const;

export function VarianceLegendContent(): JSX.Element {
  return (
    <ul
      aria-label="Variance chart legend"
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 16,
        listStyle: "none",
        margin: 0,
        padding: 0,
        fontSize: 12,
      }}
    >
      {VARIANCE_LEGEND_ITEMS.map((item) => (
        <li key={item.label} style={{ display: "flex", alignItems: "center", gap: 5, color: item.color }}>
          <span aria-hidden="true" style={{ width: 10, height: 10, background: item.color, display: "inline-block" }} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

interface VarianceChartItem {
  label: string;
  planned: number;
  actual: number;
  narrative: string;
}

function VarianceChart({ variances }: { variances: PeriodVariance[] }): JSX.Element {
  const chartData: VarianceChartItem[] = variances.map((v) => ({
    label: `${shortId(v.program_id)} ${v.period.slice(-2)}`,
    planned: v.planned_amount,
    actual: v.actual_amount,
    narrative: v.narrative,
  }));

  return (
    <>
      <div aria-label="Budget-to-actual variance chart" style={{ marginBottom: 8 }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 10, angle: -30, textAnchor: "end" }} height={48} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={formatCurrency} />
            <Tooltip content={NarrativeTooltip} />
            {/* WG-4 (Session 54): explicit legend content — the order is now
                deterministic (Planned, then Actual — matching the bar-body order)
                regardless of the library's default ordering behavior.
                RECONCILIATION (see Session 54 handoff): the Findings Report
                suggested `payload`; recharts 3.x removed that prop from Legend's
                public props (it is context-driven in v3), so the equivalent —
                and strictly more deterministic — fix is an explicit content
                renderer with a hardcoded item order. */}
            <Legend content={VarianceLegendContent} />
            <Bar dataKey="planned" name="Planned" fill="#94a3b8" />
            <Bar dataKey="actual" name="Obligated" fill="#0c4a6e" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* WH-48: table replaces per-period prose sentences — same data, more legible */}
      <table style={tableStyle} aria-label="Budget-to-actual variance by period">
        <thead>
          <tr>
            <th style={thStyle}>Period</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Planned</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Obligated</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Variance</th>
          </tr>
        </thead>
        <tbody>
          {variances.map((v) => (
            <tr key={`${v.program_id}-${v.period}`}>
              <td style={tdStyle}>{`${shortId(v.program_id)} ${v.period}`}</td>
              <td style={{ ...tdStyle, textAlign: "right" }}>{formatCurrency(v.planned_amount)}</td>
              <td style={{ ...tdStyle, textAlign: "right" }}>{formatCurrency(v.actual_amount)}</td>
              <td style={{ ...tdStyle, textAlign: "right", color: v.variance < 0 ? "#dc2626" : v.variance > 0 ? "#059669" : "#64748b", fontWeight: 600 }}>
                {v.variance === 0 ? "On plan" : `${v.variance > 0 ? "+" : ""}${formatCurrency(v.variance)}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// ─── Dependency health table ──────────────────────────────────────────────────

// WG-12 (Session 54): render order and colors for individual dependency records.
// DependencyHealthStatus's literals are spec-frozen ('healthy' | 'at-risk' |
// 'failed' — docs/18 §3.6); problem records sort first so they are impossible
// to miss.
const DEPENDENCY_STATUS_ORDER: Record<DependencyMap["health_status"], number> = {
  failed: 0,
  "at-risk": 1,
  healthy: 2,
};

function dependencyStatusFill(status: DependencyMap["health_status"]): string {
  if (status === "healthy") return "#059669";
  if (status === "at-risk") return "#d97706";
  return "#dc2626";
}

function dependencyStatusLabel(status: DependencyMap["health_status"]): string {
  if (status === "healthy") return "Healthy";
  if (status === "at-risk") return "At risk";
  return "Failed";
}

function DependencyHealthTable({
  healthy,
  at_risk,
  failed,
  narrative,
  dependencies,
}: {
  healthy: number;
  at_risk: number;
  failed: number;
  narrative: string;
  /** WG-12 (Session 54): the individual records behind the counts — the data
      already existed (SYNTH_PPBE_DEPENDENCIES) and was being pre-reduced to
      bare counts before reaching this table. */
  dependencies: readonly DependencyMap[];
}): JSX.Element {
  const sortedDeps = [...dependencies].sort(
    (a, b) => DEPENDENCY_STATUS_ORDER[a.health_status] - DEPENDENCY_STATUS_ORDER[b.health_status]
  );
  return (
    <>
      <table style={tableStyle} aria-label="Dependency health counts">
        <thead>
          <tr>
            <th style={thStyle}>Status</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Count</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}><span style={{ color: "#059669", fontWeight: 600 }}>Healthy</span></td>
            <td style={{ ...tdStyle, textAlign: "right" }}>{healthy}</td>
          </tr>
          <tr>
            <td style={tdStyle}><span style={{ color: "#d97706", fontWeight: 600 }}>At risk</span></td>
            <td style={{ ...tdStyle, textAlign: "right" }}>{at_risk}</td>
          </tr>
          <tr>
            <td style={tdStyle}><span style={{ color: "#dc2626", fontWeight: 600 }}>Failed</span></td>
            <td style={{ ...tdStyle, textAlign: "right" }}>{failed}</td>
          </tr>
        </tbody>
      </table>
      <p style={captionStyle}>{narrative}</p>

      {/* WG-12 (Session 54): the individual dependency records — WHICH handoff is
          at risk or failed, not just how many. Problem records sort first. */}
      {sortedDeps.length > 0 && (
        <table style={{ ...tableStyle, marginTop: 8 }} aria-label="Dependency detail">
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
                  <span style={{ color: dependencyStatusFill(d.health_status), fontWeight: 600 }}>
                    {dependencyStatusLabel(d.health_status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

// ─── Site breakdown (D3 placeholder) ─────────────────────────────────────────
function SiteBreakdownSection({ names }: { names: Record<string, string> }): JSX.Element {
  const sites = SYNTH_SITE_BREAKDOWNS;

  return (
    <div style={contentCardStyle}>
      <h2 style={sectionHeadingStyle}>Per-site breakdown</h2>

      {/* D3 disclosure — MUST be visibly on screen, not just a code comment */}
      <StatusNotice label="Placeholder data.">
        Site-level data is illustrative — a real site-tracking schema has not yet been added to
        the program data dictionary. A governance decision (data-dictionary approval) is required
        before live site data can be wired here. See Session 46 handoff item D4.
      </StatusNotice>

      <table style={{ ...tableStyle, marginTop: 8 }} aria-label="Per-site obligation breakdown (illustrative)">
        <thead>
          <tr>
            <th style={thStyle}>Program</th>
            <th style={thStyle}>Site</th>
            <th style={thStyle}>Region</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Planned</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Obligated</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((s) => {
            const st = s.status;
            return (
              <tr key={s.site_id}>
                <td style={tdStyle}>{names[s.program_id] ?? s.program_id}</td>
                <td style={tdStyle}>{s.site_name}</td>
                <td style={tdStyle}>{s.region}</td>
                <td style={{ ...tdStyle, textAlign: "right" }}>{formatCurrency(s.planned_amount)}</td>
                <td style={{ ...tdStyle, textAlign: "right" }}>{formatCurrency(s.obligations_to_date)}</td>
                <td style={tdStyle}>
                  <span style={{ color: statusFill(st), fontWeight: 600 }}>{statusLabel(st)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Fiscal-year helper (local — mirrors fiscalYearOfTimestamp in ppbe-seed.ts) ──
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

// ─── Main dashboard ───────────────────────────────────────────────────────────
export function PPBEDashboard({ inputs, onSelectProgram }: PPBEDashboardProps): JSX.Element {
  const effectiveInputs = inputs ?? EMPTY_INPUTS;

  // Year selector — defaults to FY2026 (Current Year) when available; falls back to
  // the earliest listed year so unit tests with non-FY2026 fixtures don't show empty state.
  const availableYears = Array.from(
    new Set(effectiveInputs.programs.map((p) => p.fiscal_year))
  ).sort();
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(() =>
    availableYears.includes('FY 2026') ? 'FY 2026' : (availableYears[0] ?? 'FY 2026')
  );

  // WH-49: wrap the caller's callback to inject the currently selected fiscal year.
  // Only event handlers (not effects) call this — StrictMode double-fire is not a concern.
  const handleSelectProgram = (programId: string): void => {
    onSelectProgram?.(programId, selectedFiscalYear);
  };

  // BY (FY2027) is a formal budget request; BY+1 (FY2028) has no obligation concept.
  // Execution metrics (obligation rate, variance vs. actuals) must not render for these years.
  const isBudgetYear = selectedFiscalYear === 'FY 2027' || selectedFiscalYear === 'FY 2028';

  // Filter inputs to the selected fiscal year so all metrics are year-scoped.
  const yearPrograms = effectiveInputs.programs.filter((p) => p.fiscal_year === selectedFiscalYear);
  const yearObligations = effectiveInputs.obligations.filter(
    (o) => fiscalYearOf(o.timestamp) === selectedFiscalYear
  );
  const yearActualsByProgram: Record<string, Record<string, number>> = {};
  for (const p of yearPrograms) {
    yearActualsByProgram[p.program_id] = actualsForProgram(yearObligations, p.program_id);
  }
  const yearInputs: PPBEDashboardInputs = {
    ...effectiveInputs,
    programs: yearPrograms,
    obligations: yearObligations,
    actualsByProgram: yearActualsByProgram,
  };

  const data = buildPPBEDashboard(yearInputs);

  // Name lookup keyed by program_id — used for chart labels and accessible buttons.
  const programNames: Record<string, string> = Object.fromEntries(
    yearPrograms.map((p) => [p.program_id, p.name])
  );

  return (
    <section style={rootStyle} aria-label="APEX PPBE Performance Dashboard">
      <header style={{ marginBottom: 16 }}>
        <h1 style={titleStyle}>APEX — Execution Monitoring</h1>
        <p style={subtitleStyle}>PPBE Phase 5 · obligation rate · variance · dependency health · learning velocity</p>
      </header>

      {/* ── Year selector (PY / CY / BY / BY+1) ─────────────────────────────── */}
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

      {data.is_empty && (
        <StatusNotice label="No PPBE execution data is recorded yet.">
          The dashboard is live and will populate as programs, obligations, dependencies, and
          evaluation findings are recorded. Comprehensive synthetic data is scheduled for the
          dedicated data session; nothing shown here is fabricated to fill the gap.
        </StatusNotice>
      )}

      <div style={contentCardStyle}>
        <h2 style={sectionHeadingStyle}>Obligation rate</h2>
        {isBudgetYear ? (
          <StatusNotice label={`${YEAR_PHASE_LABELS[selectedFiscalYear] ?? selectedFiscalYear} — planning phase.`}>
            {selectedFiscalYear === 'FY 2028'
              ? 'BY+1 (FY 2028) has no obligation concept. Obligation rates and on-track/off-track status are not applicable to this year.'
              : 'BY (FY 2027) is a budget-year request. Obligation rates and execution status apply only to years with actual obligation records (PY and CY).'}
          </StatusNotice>
        ) : data.obligation_rates.length === 0 ? (
          <p style={bodyTextStyle}>No programs are recorded.</p>
        ) : (
          <ObligationRateChart
            rates={data.obligation_rates}
            names={programNames}
            onSelectProgram={onSelectProgram ? handleSelectProgram : undefined}
          />
        )}
      </div>

      <div style={contentCardStyle}>
        <h2 style={sectionHeadingStyle}>Budget-to-actual variance</h2>
        {isBudgetYear ? (
          <StatusNotice label={`${YEAR_PHASE_LABELS[selectedFiscalYear] ?? selectedFiscalYear} — planning phase.`}>
            Variance analysis compares actual obligations against plan. Budget-year planning estimates
            do not have actual obligation records by definition — displaying a variance figure would be structurally misleading.
          </StatusNotice>
        ) : data.variances.length === 0 ? (
          <p style={bodyTextStyle}>No obligation plans are recorded.</p>
        ) : (
          <VarianceChart variances={data.variances} />
        )}
      </div>

      <div style={contentCardStyle}>
        <h2 style={sectionHeadingStyle}>Dependency health index</h2>
        <DependencyHealthTable
          healthy={data.dependency_health.healthy}
          at_risk={data.dependency_health.at_risk}
          failed={data.dependency_health.failed}
          narrative={data.dependency_health.narrative}
          dependencies={effectiveInputs.dependencies}
        />
      </div>

      <div style={contentCardStyle}>
        <h2 style={sectionHeadingStyle}>Learning velocity</h2>
        <p style={bodyTextStyle}>{data.learning_velocity.narrative}</p>
      </div>

      <div style={contentCardStyle}>
        <h2 style={sectionHeadingStyle}>PPBE audit-trail activity</h2>
        <ul style={{ ...bodyTextStyle, paddingLeft: 18 }}>
          {PPBE_EVENT_TYPES.map((t) => (
            <li key={t}>
              {t}: {data.event_counts[t]} recorded{" "}
              {data.event_counts[t] === 1 ? "event" : "events"}
            </li>
          ))}
        </ul>
        <p style={bodyTextStyle}>
          Counts come from the platform audit trail (these four event types are recorded by the
          Python-side Logger).
        </p>
      </div>

      {/* D3 — per-site breakdown (placeholder; see file header and UI disclosure) */}
      <SiteBreakdownSection names={programNames} />
    </section>
  );
}

export default PPBEDashboard;

// ─── Styles ───────────────────────────────────────────────────────────────────
const captionStyle: CSSProperties = { margin: "0 0 6px", color: "#475569", fontSize: 12, lineHeight: 1.5 };
const tooltipStyle: CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 10px" };
const tableStyle: CSSProperties = { borderCollapse: "collapse", width: "100%", maxWidth: 820, fontSize: 13 };
const thStyle: CSSProperties = { padding: "6px 10px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", fontWeight: 600, color: "#0f172a" };
const tdStyle: CSSProperties = { padding: "6px 10px", borderBottom: "1px solid #f1f5f9", color: "#334155" };
const programButtonStyle: CSSProperties = {
  padding: "4px 10px",
  fontSize: 12,
  border: "1px solid",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
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
  transition: "background 0.15s, color 0.15s",
};

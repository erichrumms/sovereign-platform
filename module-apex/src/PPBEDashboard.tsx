/**
 * SOVEREIGN Platform — module-apex
 * PPBEDashboard.tsx — the PPBE performance dashboard (Session 32, D5;
 * docs/18 §7.2 APEX scope). Replaces the Session 17 Execution Monitoring stub
 * on the existing "execution" tab — exactly the replacement spec §17.2
 * Commitment 1 scheduled; no surrounding navigation changes.
 *
 * Renders the four PPBE performance metrics (obligation rate, budget-to-actual
 * variance, dependency health index, learning velocity) plus activity counts
 * across the four PPBE Logger event types. Purely presentational: all data
 * arrives via props (the host assembles it; the four PPBE event types are
 * Python-only, so their counts come from the host's audit-log adapter, never
 * read here).
 *
 * HONEST EMPTY STATE (Gap 6, Category 1): until comprehensive PPBE synthetic
 * data exists (Session 33's dedicated scope), the dashboard says so in a
 * transient status notice rather than rendering fabricated-looking zeros as
 * if they were measurements.
 *
 * Version: 1.0 · Session 32 · July 13, 2026
 */

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
  type PPBEDashboardInputs,
} from "./ppbe-dashboard";

export interface PPBEDashboardProps {
  /** Host-assembled governed data. Omitted → honest empty state. */
  inputs?: PPBEDashboardInputs;
}

const EMPTY_INPUTS: PPBEDashboardInputs = {
  programs: [],
  obligations: [],
  actualsByProgram: {},
  dependencies: [],
  findings: [],
  eventCounts: EMPTY_PPBE_EVENT_COUNTS,
};

export function PPBEDashboard({ inputs }: PPBEDashboardProps): JSX.Element {
  const data = buildPPBEDashboard(inputs ?? EMPTY_INPUTS);

  return (
    <section style={rootStyle} aria-label="APEX PPBE Performance Dashboard">
      <header style={{ marginBottom: 16 }}>
        <h1 style={titleStyle}>APEX — Execution Monitoring</h1>
        <p style={subtitleStyle}>
          PPBE Phase 5 performance: obligation rate, budget-to-actual variance, dependency health,
          and learning velocity
        </p>
      </header>

      {data.is_empty && (
        <StatusNotice label="No PPBE execution data is recorded yet.">
          The dashboard is live and will populate as programs, obligations, dependencies, and
          evaluation findings are recorded. Comprehensive synthetic data is scheduled for the
          dedicated data session; nothing shown here is fabricated to fill the gap.
        </StatusNotice>
      )}

      <div style={contentCardStyle}>
        <h2 style={sectionHeadingStyle}>Obligation rate</h2>
        {data.obligation_rates.length === 0 ? (
          <p style={bodyTextStyle}>No programs are recorded.</p>
        ) : (
          data.obligation_rates.map((m) => (
            <p key={m.program_id} style={bodyTextStyle}>
              {m.narrative}
            </p>
          ))
        )}
      </div>

      <div style={contentCardStyle}>
        <h2 style={sectionHeadingStyle}>Budget-to-actual variance</h2>
        {data.variances.length === 0 ? (
          <p style={bodyTextStyle}>No obligation plans are recorded.</p>
        ) : (
          data.variances.map((v) => (
            <p key={`${v.program_id}-${v.period}`} style={bodyTextStyle}>
              {v.narrative}
            </p>
          ))
        )}
      </div>

      <div style={contentCardStyle}>
        <h2 style={sectionHeadingStyle}>Dependency health index</h2>
        <p style={bodyTextStyle}>{data.dependency_health.narrative}</p>
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
    </section>
  );
}

export default PPBEDashboard;

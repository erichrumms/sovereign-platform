/**
 * SOVEREIGN Platform — module-apex
 * ReportCharts.tsx — DC-4 visual indicators for the APEX report output (Session 19, D4).
 *
 * Three lightweight, dependency-free visual indicators rendered between the status narrative
 * and the risk findings in a generated report:
 *   1. Completion percentage — a horizontal progress bar.
 *   2. Cost variance — an amber/green/neutral badge derived from the program's cost-variance
 *      risk flag (amber when actual is over the planned rate, green when at or below, neutral
 *      when no cost flag is present).
 *   3. Milestone status — three labelled counts (completed on schedule / at risk / missed).
 *
 * DEPENDENCY NOTE: `recharts` is NOT in the module-apex dependency tree (checked Session 19),
 * so these are pure CSS visuals — no new production dependency was added. Each indicator carries
 * a plain-prose caption (Gap 5): a reviewer who cannot see the visual clearly reads the caption
 * and gets the same finding. The charts are Category 3 substantive content (Gap 6) — no banner
 * framing, they sit inside the report card.
 *
 * Version: 1.0 · Session 19 · June 26, 2026
 */

import type { CSSProperties } from "react";

import type { ApexProgramRecord, ApexMilestone, ApexRiskFlag } from "./apex-contract";
import { sectionHeadingStyle } from "./banners";

export interface ReportChartsProps {
  program: ApexProgramRecord;
}

type CostState = "over" | "under" | "within";

/** The program's cost-variance flag, if one is open. */
function costVarianceFlag(program: ApexProgramRecord): ApexRiskFlag | undefined {
  return program.risk_flags.find((f) => f.provenance.field_label.toLowerCase().includes("cost variance"));
}

/** Classify milestones into the three plain-language buckets used by the summary. */
function milestoneCounts(milestones: ApexMilestone[]): { onSchedule: number; atRisk: number; missed: number } {
  const onSchedule = milestones.filter((m) => m.on_track).length;
  const missed = milestones.filter((m) => !m.on_track && /missed/i.test(m.status_narrative)).length;
  const atRisk = milestones.length - onSchedule - missed;
  return { onSchedule, atRisk, missed };
}

function milestoneCaption(c: { onSchedule: number; atRisk: number; missed: number }): string {
  const parts: string[] = [];
  parts.push(`${c.onSchedule} ${c.onSchedule === 1 ? "milestone is" : "milestones are"} completed or on schedule`);
  if (c.atRisk > 0) parts.push(`${c.atRisk} ${c.atRisk === 1 ? "milestone is" : "milestones are"} at risk`);
  if (c.missed > 0) parts.push(`${c.missed} ${c.missed === 1 ? "milestone has" : "milestones have"} been missed`);
  return parts.join(", ") + ".";
}

export function ReportCharts({ program }: ReportChartsProps): JSX.Element {
  const pct = program.completion_pct;
  const costFlag = costVarianceFlag(program);
  const costState: CostState = costFlag ? "over" : "within";
  const counts = milestoneCounts(program.milestones);

  const costColors = costStateColors(costState);
  const costCaption = costFlag
    ? `${costFlag.provenance.variance_from_baseline} This is flagged as a Risk Level ${costFlag.severity.slice(1)} risk.`
    : "Cost is tracking at or below the planned rate. No cost variance is flagged for this program.";

  return (
    <section style={wrapStyle} aria-label="Program indicators" data-category="3-content">
      <h3 style={sectionHeadingStyle}>Program indicators</h3>

      {/* Chart 1 — completion percentage */}
      <div style={blockStyle} aria-label="Completion indicator" data-completion={pct}>
        <div style={barTrackStyle}>
          <div style={{ ...barFillStyle, width: `${Math.max(0, Math.min(100, pct))}%` }} />
        </div>
        <p style={captionStyle}>This program is {pct} percent complete.</p>
      </div>

      {/* Chart 2 — cost variance */}
      <div style={blockStyle} aria-label="Cost variance indicator" data-cost-state={costState}>
        <span style={{ ...badgeStyle, color: costColors.color, background: costColors.background }}>
          {costState === "over" ? "Cost over plan" : "Cost within plan"}
        </span>
        <p style={captionStyle}>{costCaption}</p>
      </div>

      {/* Chart 3 — milestone status summary */}
      <div style={blockStyle} aria-label="Milestone status summary">
        <div style={countsRowStyle}>
          <MilestoneCount label="Completed on schedule" n={counts.onSchedule} />
          <MilestoneCount label="At risk" n={counts.atRisk} />
          <MilestoneCount label="Missed" n={counts.missed} />
        </div>
        <p style={captionStyle}>{milestoneCaption(counts)}</p>
      </div>
    </section>
  );
}

function MilestoneCount({ label, n }: { label: string; n: number }): JSX.Element {
  return (
    <div style={countCellStyle} aria-label={`${label} count`}>
      <span style={countNumberStyle}>{n}</span>
      <span style={countLabelStyle}>{label}</span>
    </div>
  );
}

function costStateColors(state: CostState): { color: string; background: string } {
  if (state === "over") return { color: "#854d0e", background: "#fffbeb" }; // amber — over plan / at risk
  if (state === "under") return { color: "#065f46", background: "#d1fae5" }; // green — under plan
  return { color: "#334155", background: "#e2e8f0" }; // neutral — within plan / no flag
}

// ── Styles (Category 3 — substantive content, no banner framing) ─────────────────────
const wrapStyle: CSSProperties = { margin: "8px 0 14px", display: "flex", flexDirection: "column", gap: 12, maxWidth: 520 };
const blockStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 4 };
const barTrackStyle: CSSProperties = { height: 14, background: "#e2e8f0", borderRadius: 999, overflow: "hidden", maxWidth: 420 };
const barFillStyle: CSSProperties = { height: "100%", background: "#0c4a6e", borderRadius: 999 };
const badgeStyle: CSSProperties = { alignSelf: "flex-start", padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 };
const captionStyle: CSSProperties = { margin: 0, color: "#334155", fontSize: 13, lineHeight: 1.5 };
const countsRowStyle: CSSProperties = { display: "flex", gap: 10 };
const countCellStyle: CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, minWidth: 90 };
const countNumberStyle: CSSProperties = { fontSize: 20, fontWeight: 700, color: "#0f172a" };
const countLabelStyle: CSSProperties = { fontSize: 11, color: "#475569", textAlign: "center", marginTop: 2 };

export default ReportCharts;

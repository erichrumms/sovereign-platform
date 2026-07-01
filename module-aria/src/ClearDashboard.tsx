/**
 * SOVEREIGN Platform — module-aria
 * ClearDashboard.tsx — CLEAR Compliance Dashboard (Stage 6, Session 23 · D2).
 *
 * Three live monitoring surfaces a compliance reviewer scans for deviations before they
 * cascade (docs/16 §4):
 *   1. Output compliance — documents/outputs awaiting CLEAR certification before export.
 *      Certification status is populated from ctx.aria (the tenth shell export, GD-20).
 *      Each item links to the Certification Queue for action.
 *   2. Process compliance — governance-calendar monitoring: upcoming and overdue PPBE
 *      phase transitions, attestation deadlines, decision forums, with elapsed overdue time.
 *   3. Data quality — the data-quality index for pipeline materials; items below the 90%
 *      threshold are amber, congressional submissions below threshold are red (P1).
 *
 * Severity coding (Gap 3): green = compliant · amber = at risk · red = violation. The
 * permanent CLEAR determinism notice (blue, Category 2) states ARIA evaluates rules and
 * does not decide — humans certify. Every surface is plain prose (Gap 5); the three Gap-6
 * content categories (blue guardrail, amber/red status notices, white primary cards) are
 * visually distinct.
 *
 * Version: 1.0 · Session 23 (D2) · June 29, 2026
 */

import type { CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { contentCardStyle, sectionHeadingStyle, bodyTextStyle } from "./banners";
import {
  SeverityBadge,
  StatusPill,
  ClearDeterminismNotice,
  clearTableStyle,
  clearThStyle,
  clearTdStyle,
} from "./clear-ui";
import {
  severityForDataQuality,
  type DataQualityItem,
  type OutputComplianceItem,
  type ProcessComplianceItem,
} from "./clear-types";
import { useAriaCertifications } from "./useAriaCertifications";

export interface ClearDashboardProps {
  ctx: SovereignShellContext;
  /** Surface 1 data. Defaults to the synthetic demo set (Governance Clock OFF). */
  outputItems?: OutputComplianceItem[];
  /** Surface 2 data. Defaults to the synthetic demo set. */
  processItems?: ProcessComplianceItem[];
  /** Surface 3 data. Defaults to the synthetic demo set. */
  dataQualityItems?: DataQualityItem[];
  /** Invoked when a reviewer chooses to act on an output (links to the Certification Queue). */
  onOpenQueue?: (documentId: string) => void;
}

// ── Synthetic demo data (Governance Clock OFF — all data is synthetic) ──────────────────
const DEMO_OUTPUTS: OutputComplianceItem[] = [
  {
    document_id: "DOC-A11-FY26-OM",
    document_name: "FY 2026 O&M Budget Exhibit",
    document_type: "OMB A-11 Exhibit",
    applicable_check: "OMB Circular A-11 — justification narrative and exhibit type",
    status: "pending",
  },
  {
    document_id: "DOC-EVAL-PRG014",
    document_name: "Program PRG-014 Evaluation Findings",
    document_type: "Evaluation Report",
    applicable_check: "Evidence Act — every reported conclusion cites an evidence basis",
    status: "pending",
  },
  {
    document_id: "DOC-OBL-Q3",
    document_name: "Q3 Obligation Summary",
    document_type: "Obligation Record",
    applicable_check: "Anti-Deficiency Act — obligation covered by available budget authority",
    status: "pending",
  },
];

const DEMO_PROCESS: ProcessComplianceItem[] = [
  {
    id: "CAL-PROG-XSN",
    label: "Programming phase transition",
    due_date: "2026-06-25",
    overdue: true,
    elapsed_overdue: "4 days overdue",
    severity: "red",
  },
  {
    id: "CAL-Q3-ATTEST",
    label: "Q3 attestation deadline",
    due_date: "2026-07-01",
    overdue: false,
    elapsed_overdue: "",
    severity: "amber",
  },
  {
    id: "CAL-BUD-FORUM",
    label: "Budget decision forum",
    due_date: "2026-07-15",
    overdue: false,
    elapsed_overdue: "",
    severity: "green",
  },
];

const DEMO_DATA_QUALITY: DataQualityItem[] = [
  {
    id: "DQ-CONG-JUST",
    material_name: "FY 2026 Congressional Justification dataset",
    quality_index: 87,
    is_congressional_submission: true,
    severity: severityForDataQuality(87, true),
  },
  {
    id: "DQ-PRG-PERF",
    material_name: "Program performance dataset",
    quality_index: 84,
    is_congressional_submission: false,
    severity: severityForDataQuality(84, false),
  },
  {
    id: "DQ-COST-BASE",
    material_name: "Cost baseline dataset",
    quality_index: 95,
    is_congressional_submission: false,
    severity: severityForDataQuality(95, false),
  },
];

export function ClearDashboard({
  ctx,
  outputItems = DEMO_OUTPUTS,
  processItems = DEMO_PROCESS,
  dataQualityItems = DEMO_DATA_QUALITY,
  onOpenQueue,
}: ClearDashboardProps): JSX.Element {
  const { statusOf } = useAriaCertifications(ctx);

  return (
    <div data-testid="clear-dashboard">
      {/* Category 2 — permanent governance guardrail (blue). */}
      <ClearDeterminismNotice />

      {/* ── Surface 1 — Output compliance ──────────────────────────────────────────── */}
      <section style={contentCardStyle} data-testid="clear-surface-output">
        <h2 style={sectionHeadingStyle}>Output compliance</h2>
        <p style={bodyTextStyle}>
          Documents and outputs awaiting CLEAR certification before they can be exported. Each
          links to the Certification Queue, where a named reviewer certifies or flags it.
        </p>
        <table style={clearTableStyle}>
          <thead>
            <tr>
              <th style={clearThStyle}>Document</th>
              <th style={clearThStyle}>Type</th>
              <th style={clearThStyle}>Applicable regulatory check</th>
              <th style={clearThStyle}>Status</th>
              <th style={clearThStyle}></th>
            </tr>
          </thead>
          <tbody>
            {outputItems.map((item) => {
              // ctx.aria is the source of truth for status; the item's own status is the fallback.
              const liveStatus = statusOf(item.document_id);
              const status = liveStatus === "pending" ? item.status : liveStatus;
              return (
                <tr key={item.document_id} data-testid={`output-row-${item.document_id}`}>
                  <td style={clearTdStyle}>{item.document_name}</td>
                  <td style={clearTdStyle}>{item.document_type}</td>
                  <td style={clearTdStyle}>{item.applicable_check}</td>
                  <td style={clearTdStyle}><StatusPill status={status} /></td>
                  <td style={clearTdStyle}>
                    <button
                      type="button"
                      style={linkButtonStyle}
                      onClick={() => onOpenQueue?.(item.document_id)}
                    >
                      Review in Certification Queue →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* ── Surface 2 — Process compliance (governance calendar) ────────────────────── */}
      <section style={contentCardStyle} data-testid="clear-surface-process">
        <h2 style={sectionHeadingStyle}>Process compliance — governance calendar</h2>
        <p style={bodyTextStyle}>
          Upcoming and overdue PPBE phase transitions, attestation deadlines, and decision
          forums. A timing violation shows how long it has been overdue.
        </p>
        <table style={clearTableStyle}>
          <thead>
            <tr>
              <th style={clearThStyle}>Commitment</th>
              <th style={clearThStyle}>Due</th>
              <th style={clearThStyle}>Timing</th>
              <th style={clearThStyle}>Severity</th>
            </tr>
          </thead>
          <tbody>
            {processItems.map((item) => (
              <tr key={item.id} data-testid={`process-row-${item.id}`}>
                <td style={clearTdStyle}>{item.label}</td>
                <td style={clearTdStyle}>{item.due_date}</td>
                <td style={clearTdStyle}>
                  {item.overdue ? item.elapsed_overdue : item.severity === "amber" ? "Approaching deadline" : "On schedule"}
                </td>
                <td style={clearTdStyle}><SeverityBadge severity={item.severity} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── Surface 3 — Data quality ────────────────────────────────────────────────── */}
      <section style={contentCardStyle} data-testid="clear-surface-data-quality">
        <h2 style={sectionHeadingStyle}>Data quality</h2>
        <p style={bodyTextStyle}>
          The data-quality index for pipeline materials. Materials below the 90% threshold are
          at risk; a congressional submission below 90% is a priority (P1) violation.
        </p>
        <table style={clearTableStyle}>
          <thead>
            <tr>
              <th style={clearThStyle}>Material</th>
              <th style={clearThStyle}>Quality index</th>
              <th style={clearThStyle}>Severity</th>
            </tr>
          </thead>
          <tbody>
            {dataQualityItems.map((item) => {
              const isP1 = item.severity === "red" && item.is_congressional_submission;
              return (
                <tr key={item.id} data-testid={`data-quality-row-${item.id}`}>
                  <td style={clearTdStyle}>
                    {item.material_name}
                    {item.is_congressional_submission ? " (congressional submission)" : ""}
                  </td>
                  <td style={clearTdStyle}>{item.quality_index}%</td>
                  <td style={clearTdStyle}>
                    <SeverityBadge severity={item.severity} label={isP1 ? "Violation (P1)" : undefined} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

const linkButtonStyle: CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  color: "#1d4ed8",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  textAlign: "left",
};

export default ClearDashboard;

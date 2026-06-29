/**
 * SOVEREIGN Platform — module-aria
 * clear-ui.tsx — shared CLEAR presentation primitives (Stage 6, Session 23).
 *
 * Severity coding, the certification-status pill, and the permanent CLEAR determinism
 * notice — used by both the Compliance Dashboard (D2) and the Certification Queue (D3).
 * Severity: Green = compliant · Amber = at risk · Red = violation (Gap 3 contrast-checked).
 * The determinism notice is a Category-2 permanent governance guardrail (blue).
 *
 * Version: 1.0 · Session 23 · June 29, 2026
 */

import type { CSSProperties } from "react";

import { GovernanceBanner } from "./banners";
import type { CertStatus, ClearSeverity } from "./clear-types";

/** Contrast-checked colour tokens per severity (Gap 3: text on tint clears AA). */
const SEVERITY_TOKENS: Record<ClearSeverity, { bg: string; border: string; fg: string; label: string }> = {
  green: { bg: "#f0fdf4", border: "#86efac", fg: "#166534", label: "Compliant" },
  amber: { bg: "#fffbeb", border: "#fcd34d", fg: "#854d0e", label: "At risk" },
  red: { bg: "#fef2f2", border: "#fca5a5", fg: "#991b1b", label: "Violation" },
};

/** A severity pill (green / amber / red). `label` overrides the default severity word. */
export function SeverityBadge({ severity, label }: { severity: ClearSeverity; label?: string }): JSX.Element {
  const t = SEVERITY_TOKENS[severity];
  return (
    <span
      data-severity={severity}
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: t.bg,
        border: `1px solid ${t.border}`,
        color: t.fg,
      }}
    >
      {label ?? t.label}
    </span>
  );
}

const STATUS_TOKENS: Record<CertStatus, { bg: string; border: string; fg: string; label: string }> = {
  pending: { bg: "#f1f5f9", border: "#cbd5e1", fg: "#334155", label: "Pending certification" },
  certified: { bg: "#f0fdf4", border: "#86efac", fg: "#166534", label: "Certified" },
  flagged: { bg: "#fef2f2", border: "#fca5a5", fg: "#991b1b", label: "Flagged" },
};

/** A certification-status pill (pending / certified / flagged). */
export function StatusPill({ status }: { status: CertStatus }): JSX.Element {
  const t = STATUS_TOKENS[status];
  return (
    <span
      data-cert-status={status}
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: t.bg,
        border: `1px solid ${t.border}`,
        color: t.fg,
      }}
    >
      {t.label}
    </span>
  );
}

/**
 * The permanent CLEAR determinism guardrail (Category 2 — blue, never dismissible).
 * Its exact wording is a governance guardrail: it states that ARIA evaluates rules and
 * does NOT make decisions, and that humans certify all outputs (docs/16 §1/§3).
 */
export function ClearDeterminismNotice(): JSX.Element {
  return (
    <GovernanceBanner label="How CLEAR works:">
      ARIA Suite evaluates against defined regulatory rules. It does not make decisions.
      Human reviewers certify all outputs.
    </GovernanceBanner>
  );
}

export const clearSectionTitleStyle: CSSProperties = { margin: "18px 0 8px", fontSize: 16, color: "#0f172a" };
export const clearTableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 14 };
export const clearThStyle: CSSProperties = {
  textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 600, fontSize: 13,
};
export const clearTdStyle: CSSProperties = { padding: "6px 8px", borderBottom: "1px solid #f1f5f9", color: "#334155", verticalAlign: "top" };

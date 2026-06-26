/**
 * SOVEREIGN Platform — module-apex
 * banners.tsx — Gap 6 content-type-distinction primitives + shared style tokens.
 *
 * Three visual categories a reviewer must tell apart within five seconds (doc 14, Gap 6):
 *   - Category 2 — Permanent governance guardrails: BLUE, always present, not dismissible.
 *     The CPMI-VRS Gate 1 AI-disclosure banner and the GD-10 classification boundary. (Note:
 *     unlike the older NEXUS screen, the GD-10 boundary here is correctly BLUE — it is a
 *     permanent guardrail, not a temporary amber notice.)
 *   - Category 1 — Temporary system status notices: AMBER, transient (holds, fallbacks, the
 *     Execution Monitoring stub).
 *   - Category 3 — Substantive operational content: the default, no banner framing.
 *
 * Colours are contrast-checked (Gap 3): blue text #1e40af and amber text #854d0e both clear AA.
 *
 * Version: 1.0 · Session 17 · June 25, 2026
 */

import type { CSSProperties, ReactNode } from "react";

// ── Category 2 — permanent governance guardrail (blue) ────────────────────────────────
export const governanceBannerStyle: CSSProperties = {
  padding: "10px 14px",
  background: "#eff6ff",
  borderLeft: "4px solid #2563eb",
  border: "1px solid #bfdbfe",
  borderRadius: 8,
  color: "#1e40af",
  fontSize: 13,
  marginBottom: 10,
  maxWidth: 860,
};

// ── Category 1 — temporary system status notice (amber) ───────────────────────────────
export const statusNoticeStyle: CSSProperties = {
  padding: "10px 14px",
  background: "#fffbeb",
  border: "1px solid #fcd34d",
  borderRadius: 8,
  color: "#854d0e",
  fontSize: 13,
  marginBottom: 10,
  maxWidth: 860,
};

/** A permanent governance guardrail (Category 2). Always present, never dismissible. */
export function GovernanceBanner({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div style={governanceBannerStyle} data-category="2-governance">
      <strong>{label}</strong> {children}
    </div>
  );
}

/** A temporary system-status notice (Category 1). Reflects a current, changeable condition. */
export function StatusNotice({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div style={statusNoticeStyle} role="status" data-category="1-status">
      <strong>{label}</strong> {children}
    </div>
  );
}

/** The CPMI-VRS Gate 1 AI-disclosure guardrail (Category 2) — present on analytic screens. */
export function Gate1Banner(): JSX.Element {
  return (
    <GovernanceBanner label="AI disclosure (CPMI-VRS Gate 1):">
      All analysis produced by APEX is AI-assisted. Outputs are advisory and must be reviewed and
      attested by a qualified human reviewer before any report is exported or used in a briefing.
    </GovernanceBanner>
  );
}

/** The GD-10 classification boundary guardrail (Category 2 — permanent, blue). */
export function ClassificationBoundaryBanner({ operatorName }: { operatorName: string }): JSX.Element {
  return (
    <GovernanceBanner label="Classification boundary (GD-10):">
      This platform processes UNCLASSIFIED data only. Attempts to process CUI, SECRET, or TOP SECRET
      data are blocked and logged. Reviewer: <strong>{operatorName}</strong>. Governance Clock OFF — all data is synthetic.
    </GovernanceBanner>
  );
}

// ── Shared content tokens (Category 3 — substantive content) ──────────────────────────
export const rootStyle: CSSProperties = {
  fontFamily: "system-ui, sans-serif",
  padding: 32,
  color: "#0f172a",
  height: "100%",
  boxSizing: "border-box",
  overflow: "auto",
};
export const titleStyle: CSSProperties = { margin: "0 0 4px", fontSize: 22 };
export const subtitleStyle: CSSProperties = { margin: 0, color: "#475569" };
export const sectionHeadingStyle: CSSProperties = { margin: "0 0 8px", fontSize: 15, color: "#0f172a" };
export const bodyTextStyle: CSSProperties = { margin: "0 0 10px", color: "#334155", fontSize: 14, lineHeight: 1.5, maxWidth: 820 };

/** Status pill color set (Category 3 content; AA-contrast text on tinted background). */
export function statusPillColors(status: "ON_TRACK" | "AT_RISK" | "OFF_TRACK"): { color: string; background: string } {
  if (status === "ON_TRACK") return { color: "#065f46", background: "#d1fae5" };
  if (status === "AT_RISK") return { color: "#854d0e", background: "#fef9c3" };
  return { color: "#b91c1c", background: "#fee2e2" };
}

export function statusLabelText(status: "ON_TRACK" | "AT_RISK" | "OFF_TRACK"): string {
  if (status === "ON_TRACK") return "On track";
  if (status === "AT_RISK") return "At risk";
  return "Off track";
}

/**
 * SOVEREIGN Platform — module-flowpath
 * banners.tsx — Gap 6 content-type-distinction primitives + shared style tokens.
 *
 * The non-negotiable Session 20 UI standard: every FLOWPATH screen is built to Gap 5/6 from
 * the first line of code (doc 14). Three visual categories a reviewer must tell apart within
 * five seconds:
 *   - Category 2 — Permanent governance guardrails: BLUE, always present, not dismissible.
 *     The CPMI-VRS Gate 1 AI-disclosure banner, the GD-10 classification boundary, and (on the
 *     individual-workstyle screen) the analyst privacy notice.
 *   - Category 1 — Temporary system status notices: AMBER, transient (Five-Question Gate
 *     failure notices, threshold-conflict notices).
 *   - Category 3 — Substantive operational content: white cards on a light page canvas.
 *
 * Approved pattern (Project Principal directive, matches APEX Session 19): page canvas
 * #f1f5f9, content cards #ffffff with 1px solid #e2e8f0 border and 8px radius. Colours are
 * contrast-checked (Gap 3): blue text #1e40af and amber text #854d0e both clear AA.
 *
 * Version: 1.0 · Session 20 · June 26, 2026
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

/** The CPMI-VRS Gate 1 AI-disclosure guardrail (Category 2) — present on every FLOWPATH screen. */
export function Gate1Banner(): JSX.Element {
  return (
    <GovernanceBanner label="AI disclosure (CPMI-VRS Gate 1):">
      All elicitation in FLOWPATH is AI-assisted. Outputs are advisory and must be reviewed and
      approved by a qualified human reviewer before any workflow artifact is committed to the registry.
    </GovernanceBanner>
  );
}

/** The GD-10 classification boundary guardrail (Category 2 — permanent, blue). */
export function ClassificationBoundaryBanner({ operatorName }: { operatorName: string }): JSX.Element {
  return (
    <GovernanceBanner label="Classification boundary (GD-10):">
      This platform processes UNCLASSIFIED data only. Attempts to process CUI, SECRET, or TOP SECRET
      data are blocked and logged. Participant: <strong>{operatorName}</strong>. Governance Clock OFF — all data is synthetic.
    </GovernanceBanner>
  );
}

/**
 * The analyst-workstyle privacy guarantee (Category 2 — permanent, blue). Present on every
 * individual-workstyle screen. Stated plainly (Gap 5) — the structural promise of §5a.
 */
export function WorkstylePrivacyBanner(): JSX.Element {
  return (
    <GovernanceBanner label="Your privacy:">
      Your workstyle profile is visible only to you. It is never shared with administrators or used
      in performance evaluation. You can review, pause, or delete it at any time.
    </GovernanceBanner>
  );
}

// ── Shared content tokens (Category 3 — substantive content) ──────────────────────────
// The FLOWPATH page canvas is an explicit light slate (#f1f5f9) so substantive content never
// renders on an unknown/dark shell background. Substantive content sits inside white
// `contentCardStyle` cards (the approved APEX pattern) — guaranteed dark-text-on-white legibility.
export const rootStyle: CSSProperties = {
  fontFamily: "system-ui, sans-serif",
  padding: 32,
  color: "#0f172a",
  background: "#f1f5f9",
  height: "100%",
  boxSizing: "border-box",
  overflow: "auto",
};

/**
 * A white substantive-content card (Category 3). White background, light border, 8px radius —
 * so the elicitation dialogue, session list, and emerging artifacts always render as dark text
 * on white regardless of the shell canvas behind FLOWPATH.
 */
export const contentCardStyle: CSSProperties = {
  padding: "16px 18px",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  marginBottom: 14,
  maxWidth: 940,
};

export const titleStyle: CSSProperties = { margin: "0 0 4px", fontSize: 22 };
export const subtitleStyle: CSSProperties = { margin: 0, color: "#475569" };
export const sectionHeadingStyle: CSSProperties = { margin: "0 0 8px", fontSize: 15, color: "#0f172a" };
export const bodyTextStyle: CSSProperties = { margin: "0 0 10px", color: "#334155", fontSize: 14, lineHeight: 1.5, maxWidth: 820 };

/** Five-Question Gate status pill colours (Category 3 content; AA-contrast text on tint). */
export function gateStatusColors(answered: boolean): { color: string; background: string } {
  return answered ? { color: "#065f46", background: "#d1fae5" } : { color: "#854d0e", background: "#fef9c3" };
}

/**
 * SOVEREIGN Platform — module-aria
 * banners.tsx — Gap 6 content-type-distinction primitives + shared style tokens (ARIA Suite).
 *
 * ARIA Suite is Stage 6: compliance (CLEAR), traceability (TRACER), and regulatory-impact (ARC).
 * Per docs/16 §8 every ARIA screen is built to Gap 5/6 from the first line of code, with three
 * visual categories a reviewer must tell apart within five seconds:
 *   - Category 2 — Permanent governance guardrails: BLUE, always present, not dismissible.
 *     Includes the ARIA-specific DETERMINISM notice — ARIA's authority rests on the fact that no
 *     AI inference is used in any ARIA decision path (docs/16 §1 / §8).
 *   - Category 1 — Temporary system status notices: AMBER, transient (e.g. "regulatory source
 *     loading").
 *   - Category 3 — Substantive compliance content the reviewer must act on (Primary): white cards
 *     on a light page canvas.
 *
 * Approved pattern (Project Principal directive, matches APEX/FLOWPATH since Session 19): page
 * canvas #f1f5f9, content cards #ffffff with 1px solid #e2e8f0 border and 8px radius. Colours are
 * contrast-checked (Gap 3): blue text #1e40af and amber text #854d0e both clear AA.
 *
 * Version: 1.0 · Session 22 (D4 scaffold) · June 29, 2026
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

/**
 * The ARIA determinism guardrail (Category 2 — permanent, blue). ARIA Suite's authority rests on
 * the fact that its findings come from deterministic rule evaluation, not AI inference (docs/16
 * §1 / §3 / §8). This MUST appear on every ARIA screen that surfaces a compliance finding.
 */
export function DeterminismBanner(): JSX.Element {
  return (
    <GovernanceBanner label="How ARIA reaches its findings:">
      Every ARIA finding comes from deterministic rule evaluation — no AI model is used in any ARIA
      decision path. The engine evaluates and flags; all decisions are made by named human
      decision-makers.
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

// ── Shared content tokens (Category 3 — substantive / Primary content) ─────────────────
// The ARIA page canvas is an explicit light slate (#f1f5f9) so substantive content never renders
// on an unknown/dark shell background. Substantive content sits inside white `contentCardStyle`
// cards (the approved APEX/FLOWPATH pattern) — guaranteed dark-text-on-white legibility.
export const rootStyle: CSSProperties = {
  fontFamily: "system-ui, sans-serif",
  padding: 32,
  color: "#0f172a",
  background: "#f1f5f9",
  height: "100%",
  boxSizing: "border-box",
  overflow: "auto",
};

/** A white substantive-content card (Category 3 / Primary). */
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

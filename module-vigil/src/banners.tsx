/**
 * SOVEREIGN Platform — module-vigil
 * banners.tsx — Gap 6 content-type-distinction primitives (governance guardrail).
 *
 * Net-new for VIGIL (Session 122, Session 121 survey Finding 3). VIGIL renders
 * AI-generated approval briefs (vigil-approval-agent) and alert-triage briefs
 * (vigil-triage-analyst) feeding human decisions, and carried no AI disclosure
 * anywhere in its UI. This file duplicates the established blue Category-2
 * guardrail style locally rather than importing across module boundaries — no
 * module in this codebase imports from another module-*, and each module keeps
 * its own banners.tsx (Session 117 convention, reconfirmed Session 121/122).
 *
 *   - Category 2 — Permanent governance guardrails: BLUE, always present, not dismissible.
 *     The CPMI-VRS Gate 1 AI-disclosure banner (rendered app-wide at the VigilApp top level).
 *
 * Colours are contrast-checked (Gap 3): blue text #1e40af clears AA. Matches
 * APEX/FLOWPATH/SCRIBE.
 *
 * Version: 1.0 · Session 122 · August 19, 2026
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

/** A permanent governance guardrail (Category 2). Always present, never dismissible. */
export function GovernanceBanner({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div style={governanceBannerStyle} data-category="2-governance">
      <strong>{label}</strong> {children}
    </div>
  );
}

/** The CPMI-VRS Gate 1 AI-disclosure guardrail (Category 2) — present app-wide across every VIGIL tab. */
export function Gate1Banner(): JSX.Element {
  return (
    <GovernanceBanner label="AI disclosure (CPMI-VRS Gate 1):">
      Approval briefs and alert-triage briefs in VIGIL are AI-generated. Briefs are advisory
      only — every approval, rejection, and alert response is a human decision, made and
      recorded by the operator.
    </GovernanceBanner>
  );
}

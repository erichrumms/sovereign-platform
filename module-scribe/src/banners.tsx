/**
 * SOVEREIGN Platform — module-scribe
 * banners.tsx — Gap 6 content-type-distinction primitives (governance guardrail).
 *
 * Net-new for SCRIBE (Session 117, F-20). SCRIBE had no local banner primitive; APEX
 * (module-apex/src/banners.tsx) and FLOWPATH (module-flowpath/src/banners.tsx) each carry
 * their own copy of this exact blue Category-2 guardrail style. This file duplicates that
 * pattern locally rather than importing across module boundaries — no module in this
 * codebase imports from another module-*, and each module keeps its own banners.tsx.
 *
 *   - Category 2 — Permanent governance guardrails: BLUE, always present, not dismissible.
 *     The CPMI-VRS Gate 1 AI-disclosure banner (rendered app-wide at the ScribeApp top level).
 *
 * Colours are contrast-checked (Gap 3): blue text #1e40af clears AA. Matches APEX/FLOWPATH.
 *
 * Version: 1.0 · Session 117 · August 17, 2026
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

/** The CPMI-VRS Gate 1 AI-disclosure guardrail (Category 2) — present app-wide across every SCRIBE tab. */
export function Gate1Banner(): JSX.Element {
  return (
    <GovernanceBanner label="AI disclosure (CPMI-VRS Gate 1):">
      All drafting in SCRIBE is AI-assisted. Outputs are advisory and must be reviewed and
      approved by a qualified human before export.
    </GovernanceBanner>
  );
}

/** The GD-10 classification boundary guardrail (Category 2) — added Session 122 (Session 121
    survey Finding 2 decision). Same corrected F-18 wording as APEX/FLOWPATH/ARIA. */
export function ClassificationBoundaryBanner({ operatorName }: { operatorName: string }): JSX.Element {
  return (
    <GovernanceBanner label="Classification boundary (GD-10):">
      This platform processes UNCLASSIFIED data only. Requests marked CUI, SECRET, or TOP SECRET are
      refused before any model call, and the refusal is logged. Classification labels are caller-supplied;
      content is not inspected. Reviewer: <strong>{operatorName}</strong>. Governance Clock OFF — all data is synthetic.
    </GovernanceBanner>
  );
}

/**
 * SOVEREIGN Platform — module-flowpath
 * FlowpathApp.tsx — FLOWPATH composition root (React).
 *
 * The single component the module mounts after the AGENT_OPERATOR gate admits the participant.
 * It renders the FLOWPATH chrome; the tabbed elicitation surfaces (Session Manager / Dialogue /
 * Individual Workstyle) are wired in across Session 20 deliverables D3–D5. Every screen is built
 * to Gap 5/6 from the first line of code: governance banners are Category 2 (permanent, blue),
 * status notices are Category 1 (amber), and substantive content sits in white cards on the light
 * page canvas (Category 3).
 *
 * Version: 1.0 (scaffold) · Session 20 · June 26, 2026
 */

import type { CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  rootStyle,
  titleStyle,
  subtitleStyle,
  sectionHeadingStyle,
  bodyTextStyle,
  contentCardStyle,
  Gate1Banner,
  ClassificationBoundaryBanner,
} from "./banners";

export interface FlowpathAppProps {
  ctx: SovereignShellContext;
}

export function FlowpathApp({ ctx }: FlowpathAppProps): JSX.Element {
  return (
    <section style={shellStyle}>
      <div style={rootStyle}>
        <header style={{ marginBottom: 16 }}>
          <h1 style={titleStyle}>FLOWPATH</h1>
          <p style={subtitleStyle}>Workflow Elicitation and Process Intelligence — the entry point to the SOVEREIGN pipeline.</p>
        </header>

        {/* Category 2 — permanent governance guardrails (blue, always present). */}
        <Gate1Banner />
        <ClassificationBoundaryBanner operatorName={ctx.auth.user.name} />

        {/* Category 3 — substantive content (white card on the light canvas). */}
        <div style={contentCardStyle}>
          <h2 style={sectionHeadingStyle}>Module scaffolded</h2>
          <p style={bodyTextStyle}>
            FLOWPATH is active. The elicitation surfaces — the Session Manager, the Elicitation
            Dialogue, and Individual Workstyle — are added in this session and appear here as they
            are built.
          </p>
        </div>
      </div>
    </section>
  );
}

const shellStyle: CSSProperties = { height: "100%", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif" };

export default FlowpathApp;

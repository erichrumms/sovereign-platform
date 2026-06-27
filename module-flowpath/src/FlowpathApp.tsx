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
import { rootStyle, titleStyle, subtitleStyle } from "./banners";
import { SessionManager } from "./SessionManager";

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

        <SessionManager ctx={ctx} />
      </div>
    </section>
  );
}

const shellStyle: CSSProperties = { height: "100%", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif" };

export default FlowpathApp;

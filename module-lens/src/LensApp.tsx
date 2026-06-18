/**
 * SOVEREIGN Platform — module-lens
 * LensApp.tsx — LENS composition root (React) — scaffold.
 *
 * The single React component the module mounts (via index.ts → createRoot) into the
 * shell-provided outlet. It renders the LENS chrome and honest stubs for the three
 * orientation surfaces LENS core will provide (Pipeline Navigator, Governance
 * Explainer, AI Transparency Panel — VIGIL spec §4.6 / Integration Brief). LENS core
 * is deferred until the LENS architecture spec (03_LENS_Orientation_Module.md) is
 * authored; the scaffold makes no LLM call and explains exactly what is and is not
 * wired (it does not imply LENS is operational).
 *
 * Version: 1.0 (scaffold) · Session 7 · June 18, 2026
 */

import type { CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";

export interface LensAppProps {
  ctx: SovereignShellContext;
}

export function LensApp({ ctx }: LensAppProps): JSX.Element {
  return (
    <section style={rootStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>LENS</h1>
        <p style={subtitleStyle}>Orientation &amp; Explanation · Companion Suite</p>
      </header>

      <div style={bannerStyle}>
        Scaffold — the module mounts and registers its agents (lens-explainer,
        lens-orientation). The explanation and orientation surfaces below are stubs: LENS core (the
        lens-explainer agent grounded in the platform&apos;s source documents) is built once the LENS
        architecture spec is authored. Signed in as <strong>{ctx.auth.user.name}</strong>.
      </div>

      <div style={stackStyle}>
        <StubPanel
          title="Governance Explainer"
          body="Will answer plain-language questions about platform governance — including VIGIL alert response and agent approvals — grounded in the LENS knowledge-base source documents already in the repo (vigil_alert_response.md, vigil_agent_approvals.md). Not yet wired."
        />
        <StubPanel
          title="Pipeline Navigator"
          body="Will show any authenticated user their own pipeline context across the six products. VIGIL's Pipeline Health Panel deep-links here. Not yet wired."
        />
        <StubPanel
          title="AI Transparency Panel"
          body="Will surface the platform-wide agent-action log in plain language, visible to all users. Not yet wired."
        />
      </div>
    </section>
  );
}

function StubPanel({ title, body }: { title: string; body: string }): JSX.Element {
  return (
    <section style={panelStyle} aria-label={title}>
      <h3 style={panelTitleStyle}>{title}</h3>
      <p style={panelBodyStyle}>{body}</p>
    </section>
  );
}

// ============================================================
// STYLES (inline — consistent with the shell chrome / other modules)
// ============================================================

const rootStyle: CSSProperties = {
  fontFamily: "system-ui, sans-serif", padding: 32, color: "#0f172a", height: "100%",
  boxSizing: "border-box", overflow: "auto",
};
const headerStyle: CSSProperties = { marginBottom: 16 };
const titleStyle: CSSProperties = { margin: "0 0 4px", fontSize: 22 };
const subtitleStyle: CSSProperties = { margin: 0, color: "#475569" };
const bannerStyle: CSSProperties = {
  padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8,
  color: "#92400e", fontSize: 13, marginBottom: 16, maxWidth: 720,
};
const stackStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 12 };
const panelStyle: CSSProperties = {
  padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#ffffff", maxWidth: 720,
};
const panelTitleStyle: CSSProperties = { margin: "0 0 6px", fontSize: 15 };
const panelBodyStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#475569" };

export default LensApp;

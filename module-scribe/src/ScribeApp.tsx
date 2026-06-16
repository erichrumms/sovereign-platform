/**
 * SOVEREIGN Platform — module-scribe
 * ScribeApp.tsx — SCRIBE composition root (React) — scaffold.
 *
 * The single React component the module mounts (via index.ts -> createRoot) into
 * the shell-provided outlet. This session it is a scaffold: it renders the SCRIBE
 * chrome and the eight-mode selector (SCRIBE_MODES), and shows the selected mode's
 * destination + output-schema binding. The drafting engine (capture → LLM draft →
 * per-mode validation → Export gate) is a later session, following the COUNSEL
 * scaffold→core sequence.
 *
 * Presentation reads the context; it never re-derives it. Styling is inline,
 * consistent with the shell chrome and the COUNSEL module.
 *
 * Version: 1.0 (scaffold) · Session 5 · June 16, 2026
 */

import { useState } from "react";
import type { CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import type { SCRIBEMode } from "../../sovereign-shell/shell-contract";
import { SCRIBE_MODES, describeMode } from "./modes";

export interface ScribeAppProps {
  ctx: SovereignShellContext;
}

export function ScribeApp({ ctx }: ScribeAppProps): JSX.Element {
  const [selected, setSelected] = useState<SCRIBEMode | null>(null);
  const descriptor = selected ? describeMode(selected) : null;

  return (
    <section style={rootStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>SCRIBE</h1>
        <p style={subtitleStyle}>Drafting & Style DNA · Companion Suite</p>
      </header>

      <div style={scaffoldBannerStyle}>
        Scaffold — the mode selector and contract are wired; the drafting engine
        (capture → draft → Export) arrives in a later session. Signed in as{" "}
        <strong>{ctx.auth.user.name}</strong>.
      </div>

      <h2 style={sectionTitleStyle}>Drafting mode</h2>
      <div style={modeGridStyle} role="list" aria-label="SCRIBE drafting modes">
        {SCRIBE_MODES.map((m) => (
          <button
            key={m.mode}
            role="listitem"
            style={selected === m.mode ? modeButtonActiveStyle : modeButtonStyle}
            onClick={() => setSelected(m.mode)}
          >
            <strong>{m.label}</strong>
            <span style={modeDescStyle}>{m.description}</span>
            <span style={modeTargetStyle}>
              {m.producesProductIntake ? `→ ${m.targetProduct}` : "intermediate"}
            </span>
          </button>
        ))}
      </div>

      {descriptor ? (
        <div style={detailStyle}>
          <h3 style={detailTitleStyle}>{descriptor.label}</h3>
          <p style={detailLineStyle}>{descriptor.description}</p>
          <p style={detailLineStyle}>
            <strong>Destination:</strong>{" "}
            {descriptor.producesProductIntake
              ? `${descriptor.targetProduct} (validated against the @sovereign/data ${descriptor.mode} schema before Export)`
              : "intermediate artifact — feeds another drafting mode; no product intake"}
          </p>
          <p style={mutedStyle}>
            Drafting for this mode is not yet implemented (scaffold). Selecting a mode here
            confirms the selector ↔ schema binding the engine will use.
          </p>
        </div>
      ) : (
        <p style={mutedStyle}>Select a mode to see its destination and output-schema binding.</p>
      )}
    </section>
  );
}

// ============================================================
// STYLES (inline — consistent with the shell chrome / COUNSEL)
// ============================================================

const rootStyle: CSSProperties = {
  fontFamily: "system-ui, sans-serif",
  padding: 32,
  color: "#0f172a",
  height: "100%",
  boxSizing: "border-box",
  overflow: "auto",
};
const headerStyle: CSSProperties = { marginBottom: 16 };
const titleStyle: CSSProperties = { margin: "0 0 4px", fontSize: 22 };
const subtitleStyle: CSSProperties = { margin: 0, color: "#475569" };
const scaffoldBannerStyle: CSSProperties = {
  padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a",
  borderRadius: 8, color: "#92400e", fontSize: 13, marginBottom: 16, maxWidth: 720,
};
const sectionTitleStyle: CSSProperties = { margin: "0 0 8px", fontSize: 16 };
const modeGridStyle: CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: 10, maxWidth: 720, marginBottom: 16,
};
const modeButtonBase: CSSProperties = {
  display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4,
  textAlign: "left", padding: 12, borderRadius: 10, cursor: "pointer", background: "#ffffff",
};
const modeButtonStyle: CSSProperties = { ...modeButtonBase, border: "1px solid #cbd5e1" };
const modeButtonActiveStyle: CSSProperties = { ...modeButtonBase, border: "2px solid #0c4a6e" };
const modeDescStyle: CSSProperties = { fontSize: 12, color: "#475569" };
const modeTargetStyle: CSSProperties = { fontSize: 11, fontWeight: 700, color: "#0c4a6e" };
const detailStyle: CSSProperties = {
  padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, maxWidth: 720, background: "#f8fafc",
};
const detailTitleStyle: CSSProperties = { margin: "0 0 6px", fontSize: 15 };
const detailLineStyle: CSSProperties = { margin: "0 0 6px", fontSize: 13, color: "#334155" };
const mutedStyle: CSSProperties = { margin: 0, color: "#64748b", fontSize: 13, maxWidth: 720 };

export default ScribeApp;

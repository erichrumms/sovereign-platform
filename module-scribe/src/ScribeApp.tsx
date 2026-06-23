/**
 * SOVEREIGN Platform — module-scribe
 * ScribeApp.tsx — SCRIBE composition root (React) — scaffold.
 *
 * The single React component the module mounts (via index.ts -> createRoot) into
 * the shell-provided outlet. It renders the SCRIBE chrome and the eight-mode
 * selector (SCRIBE_MODES). Selecting one of the SIX product-aligned drafting modes
 * opens the DraftWorkspace (D1 drafting engine: capture → LLM draft → per-mode
 * schema validation → human-gated Export). The two intermediate modes (synthesis,
 * framing) have no product intake schema and are not draftable this session — they
 * show a later-session notice.
 *
 * Presentation reads the context; it never re-derives it. Styling is inline,
 * consistent with the shell chrome and the COUNSEL module.
 *
 * Version: 1.1 (D1 — drafting engine) · Session 6 · June 17, 2026
 */

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import type { SCRIBEMode } from "../../sovereign-shell/shell-contract";
import { SCRIBE_MODES, describeMode } from "./modes";
import { isDraftableMode } from "./draft-contract";
import { isIntermediateMode } from "./intermediate-contract";
import { createSessionStyleProfileStore } from "./style-contract";
import { useStyleProfile } from "./useStyleProfile";
import { DraftWorkspace } from "./DraftWorkspace";
import { IntermediateWorkspace } from "./IntermediateWorkspace";
import { StyleDNAManager } from "./StyleDNAManager";

export interface ScribeAppProps {
  ctx: SovereignShellContext;
}

export function ScribeApp({ ctx }: ScribeAppProps): JSX.Element {
  const [selected, setSelected] = useState<SCRIBEMode | null>(null);
  const descriptor = selected ? describeMode(selected) : null;

  // Style DNA: one session-scoped store + hook shared across the module, so a saved
  // profile (StyleDNAManager) is injected into drafting (DraftWorkspace).
  const styleStore = useMemo(() => createSessionStyleProfileStore(), []);
  const style = useStyleProfile(ctx, styleStore);

  return (
    <section style={rootStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>SCRIBE</h1>
        <p style={subtitleStyle}>Drafting & Style DNA · Companion Suite</p>
      </header>

      <div style={scaffoldBannerStyle}>
        Drafting engine live for the six product-aligned modes — capture → draft →
        schema-validated, human-gated Export. Synthesis and framing produce
        intermediate prose you carry forward (no product export). Signed in as{" "}
        <strong>{ctx.auth.user.name}</strong>.
      </div>

      <StyleDNAManager style={style} />

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
          {selected && isDraftableMode(selected) && descriptor.targetProduct ? (
            <DraftWorkspace
              ctx={ctx}
              mode={selected}
              label={descriptor.label}
              targetProduct={descriptor.targetProduct}
              styleProfile={style.profile}
            />
          ) : selected && isIntermediateMode(selected) ? (
            <IntermediateWorkspace
              ctx={ctx}
              mode={selected}
              label={descriptor.label}
              styleProfile={style.profile}
            />
          ) : (
            <p style={mutedStyle}>
              Intermediate artifact — feeds another drafting mode; it has no product intake schema.
            </p>
          )}
        </div>
      ) : (
        <p style={mutedStyle}>Select a mode to begin drafting (or to see an intermediate mode&apos;s role).</p>
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

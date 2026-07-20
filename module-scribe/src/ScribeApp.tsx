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
 * Session 29 (Walkthrough E findings WE-3/WE-5): the Session 28 TTManagerReview
 * split-panel interface is now MOUNTED — a surface toggle above the mode grid
 * switches between the drafting modes and the Time & Travel manager review
 * queue, seeded with the canonical SYNTH review items (tt-synthetic-review.ts).
 * TT stays out of SCRIBEMode (module-level taxonomy — Session 28 decision).
 *
 * Version: 1.2 · Session 29 · July 12, 2026
 */

import { useEffect, useMemo, useState } from "react";
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
import { TTManagerReview } from "./TTManagerReview";
import { DEMO_TT_REVIEW_ITEMS } from "./tt-synthetic-review";
import { PPBEExhibitPanel } from "./PPBEExhibitPanel";
import { publishScribeWorkQueues } from "./scribe-work-queue-publisher";

export interface ScribeAppProps {
  ctx: SovereignShellContext;
}

type ScribeSurface = "drafting" | "tt-review" | "ppbe-exhibits";

export function ScribeApp({ ctx }: ScribeAppProps): JSX.Element {
  const [surface, setSurface] = useState<ScribeSurface>("drafting");
  const [selected, setSelected] = useState<SCRIBEMode | null>(null);

  // GD-24 — publish SCRIBE's WorkQueueSurface summary on mount.
  // DEMO_TT_REVIEW_ITEMS.length is the same count TTManagerReview renders.
  const { workQueueSurface } = ctx;
  useEffect(() => {
    publishScribeWorkQueues(DEMO_TT_REVIEW_ITEMS.length, workQueueSurface, new Date().toISOString());
  }, [workQueueSurface]);
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

      {/* Session 29 (WE-3/WE-5): surface toggle — drafting modes vs. TT manager review. */}
      <nav style={surfaceBarStyle} aria-label="SCRIBE surfaces">
        <button
          type="button"
          role="tab"
          aria-selected={surface === "drafting"}
          onClick={() => setSurface("drafting")}
          style={surface === "drafting" ? surfaceTabActiveStyle : surfaceTabStyle}
        >
          Drafting Modes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={surface === "tt-review"}
          data-testid="scribe-tt-review-tab"
          onClick={() => setSurface("tt-review")}
          style={surface === "tt-review" ? surfaceTabActiveStyle : surfaceTabStyle}
        >
          Time &amp; Travel Review
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={surface === "ppbe-exhibits"}
          data-testid="scribe-ppbe-exhibits-tab"
          onClick={() => setSurface("ppbe-exhibits")}
          style={surface === "ppbe-exhibits" ? surfaceTabActiveStyle : surfaceTabStyle}
        >
          PPBE Exhibits
        </button>
      </nav>

      {surface === "tt-review" ? (
        <TTManagerReview ctx={ctx} items={DEMO_TT_REVIEW_ITEMS} />
      ) : surface === "ppbe-exhibits" ? (
        <PPBEExhibitPanel ctx={ctx} />
      ) : (
        <>
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
        </>
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
const surfaceBarStyle: CSSProperties = { display: "flex", gap: 4, borderBottom: "1px solid #e2e8f0", marginBottom: 16 };
const surfaceTabBase: CSSProperties = { padding: "8px 14px", fontSize: 14, background: "none", border: "none", cursor: "pointer" };
const surfaceTabStyle: CSSProperties = { ...surfaceTabBase, color: "#475569", borderBottom: "2px solid transparent", fontWeight: 500 };
const surfaceTabActiveStyle: CSSProperties = { ...surfaceTabBase, color: "#0f172a", borderBottom: "2px solid #0f172a", fontWeight: 700 };
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

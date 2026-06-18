/**
 * SOVEREIGN Platform — module-scribe
 * DraftWorkspace.tsx — the drafting surface for one product-aligned mode.
 *
 * Composition for the D1 drafting engine (spec §6 component map: InputPanel →
 * useDraft → DraftViewer → ExportPanel). The hooks own every side effect — the
 * single LLM call, Logger emission, and navigation — so this component holds only
 * presentation + local edit state (spec §6: "Do not put API calls, Logger calls,
 * or entity writes in component bodies").
 *
 * The draft is edited as its CANONICAL @sovereign/data JSON object, not a set of
 * per-field inputs: hardcoding the schema's field names into a form is exactly what
 * spec §7 forbids ("Do not hardcode field names or structures inside SCRIBE"). The
 * editable JSON IS the schema object; the Export gate validates it before approval.
 *
 * Version: 1.0 · Session 6 · June 17, 2026
 */

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

import type { StyleProfile } from "@sovereign/data";

import type { SovereignShellContext, SovereignProduct } from "../../sovereign-shell/shell-contract";
import { validateModeOutput, type DraftableMode, type ModeOutput } from "./draft-contract";
import { useDraft } from "./useDraft";
import { useExport } from "./useExport";
import type { DraftInput } from "./draft-engine";

export interface DraftWorkspaceProps {
  ctx: SovereignShellContext;
  mode: DraftableMode;
  label: string;
  targetProduct: SovereignProduct;
  /** The active Style DNA profile, injected into drafting when present (D2). */
  styleProfile?: StyleProfile | null;
}

const TIER_NOTE: Record<"live" | "cache" | "static", string> = {
  live: "Live draft from the drafting service.",
  cache: "Served from cache — the live service was unavailable, so the last good draft for this input was reused.",
  static: "Static fallback — the drafting service is unavailable. This is a placeholder template to edit, not a generated draft.",
};

export function DraftWorkspace({ ctx, mode, label, targetProduct, styleProfile }: DraftWorkspaceProps): JSX.Element {
  const { status, outcome, error: draftError, draft, reset: resetDraft } = useDraft(ctx);
  const exporter = useExport(ctx);

  const [captured, setCaptured] = useState("");
  const [editedJson, setEditedJson] = useState<string | null>(null);

  // When a fresh draft arrives, load it into the editable surface and reset export.
  useEffect(() => {
    if (outcome) {
      setEditedJson(JSON.stringify(outcome.draft, null, 2));
      exporter.reset();
    }
    // exporter.reset is stable (useCallback []); intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome]);

  // Parse + validate the edited JSON on every keystroke (drives the Gate 3 button).
  const parsed = useMemo<{ value: ModeOutput | null; parseError: string | null }>(() => {
    if (editedJson === null) return { value: null, parseError: null };
    try {
      return { value: JSON.parse(editedJson) as ModeOutput, parseError: null };
    } catch (e) {
      return { value: null, parseError: e instanceof Error ? e.message : String(e) };
    }
  }, [editedJson]);

  const validation = parsed.value ? validateModeOutput(mode, parsed.value) : null;
  const canExport = parsed.value !== null && validation !== null && validation.valid;

  // Inject the active Style DNA profile when present (D2). `?? undefined` keeps the
  // DraftInput.styleProfile field absent (not null) when there is no profile, which
  // is what useDraft logs as style_profile_present: false.
  const styleInput = styleProfile ?? undefined;

  const onGenerate = (): void => {
    const input: DraftInput = { mode, capturedMaterial: captured, styleProfile: styleInput };
    void draft(input);
  };

  const onApprove = (): void => {
    if (!parsed.value) return;
    const source: DraftInput = { mode, capturedMaterial: captured, styleProfile: styleInput };
    exporter.approve({ mode, draft: parsed.value, source, targetProduct });
  };

  const onReset = (): void => {
    resetDraft();
    exporter.reset();
    setEditedJson(null);
  };

  return (
    <div style={wrapStyle}>
      {/* ---- Input panel ---- */}
      <label style={labelStyle} htmlFor="scribe-captured">
        Captured material for <strong>{label}</strong> → {targetProduct}
        {styleProfile ? <span style={styleOnStyle}> · Style DNA active</span> : null}
      </label>
      <textarea
        id="scribe-captured"
        style={textareaStyle}
        rows={5}
        placeholder="Paste notes, a transcript, or source text to draft from…"
        value={captured}
        onChange={(e) => setCaptured(e.target.value)}
      />
      <div style={rowStyle}>
        <button
          style={captured.trim() === "" || status === "drafting" ? buttonDisabledStyle : buttonPrimaryStyle}
          disabled={captured.trim() === "" || status === "drafting"}
          onClick={onGenerate}
        >
          {status === "drafting" ? "Drafting…" : "Generate draft"}
        </button>
        {outcome ? (
          <button style={buttonStyle} onClick={onReset}>
            Clear
          </button>
        ) : null}
      </div>

      {draftError ? <p style={errorStyle}>{draftError}</p> : null}

      {/* ---- Draft viewer (editable canonical JSON) ---- */}
      {outcome ? (
        <div style={panelStyle}>
          <div style={tierBadgeStyle(outcome.tier)}>{outcome.tier.toUpperCase()}</div>
          <p style={tierNoteStyle}>{TIER_NOTE[outcome.tier]}</p>

          <label style={labelStyle} htmlFor="scribe-draft-json">
            Draft — edit the <code>{mode}</code> fields below. It exports to {targetProduct} only when it
            satisfies the schema.
          </label>
          <textarea
            id="scribe-draft-json"
            style={draftAreaStyle}
            rows={14}
            value={editedJson ?? ""}
            onChange={(e) => setEditedJson(e.target.value)}
            aria-label="draft editor"
          />

          {/* ---- Schema status (drives Gate 3) ---- */}
          {parsed.parseError ? (
            <p style={errorStyle}>Not valid JSON: {parsed.parseError}</p>
          ) : validation && !validation.valid ? (
            <div style={errorStyle}>
              <strong>Schema validation failed — export is blocked (Gate 3):</strong>
              <ul style={errListStyle}>
                {validation.errors.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p style={okStyle}>✓ Draft satisfies the {targetProduct} {mode} schema — ready for human approval.</p>
          )}

          {/* ---- Export panel (CPMI-VRS Gate 3) ---- */}
          <div style={rowStyle}>
            <button
              style={canExport ? buttonPrimaryStyle : buttonDisabledStyle}
              disabled={!canExport}
              onClick={onApprove}
            >
              Approve &amp; export to {targetProduct}
            </button>
            <span style={gateNoteStyle}>
              No draft leaves SCRIBE without your approval, and approval is disabled until the schema passes.
            </span>
          </div>

          {exporter.error ? <p style={errorStyle}>{exporter.error}</p> : null}
          {exporter.status === "exported" ? (
            <p style={okStyle}>
              ✓ Approved and routed to {targetProduct}. A HUMAN_DECISION event was logged for this export.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// ============================================================
// STYLES (inline — consistent with the shell chrome / ScribeApp)
// ============================================================

const wrapStyle: CSSProperties = { maxWidth: 720, marginTop: 8 };
const labelStyle: CSSProperties = { display: "block", fontSize: 13, color: "#334155", margin: "10px 0 6px" };
const textareaStyle: CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1",
  fontFamily: "system-ui, sans-serif", fontSize: 13, resize: "vertical",
};
const draftAreaStyle: CSSProperties = {
  ...textareaStyle, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12,
};
const rowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" };
const buttonStyle: CSSProperties = {
  padding: "8px 14px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#ffffff",
  cursor: "pointer", fontSize: 13,
};
const buttonPrimaryStyle: CSSProperties = {
  ...buttonStyle, border: "1px solid #0c4a6e", background: "#0c4a6e", color: "#ffffff",
};
const buttonDisabledStyle: CSSProperties = {
  ...buttonStyle, opacity: 0.5, cursor: "not-allowed",
};
const panelStyle: CSSProperties = {
  marginTop: 16, padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc",
};
const tierNoteStyle: CSSProperties = { margin: "8px 0 4px", fontSize: 12, color: "#475569" };
const tierBadgeStyle = (tier: "live" | "cache" | "static"): CSSProperties => ({
  display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700,
  color: tier === "live" ? "#065f46" : tier === "cache" ? "#92400e" : "#7f1d1d",
  background: tier === "live" ? "#d1fae5" : tier === "cache" ? "#fef3c7" : "#fee2e2",
});
const errorStyle: CSSProperties = { color: "#b91c1c", fontSize: 13, marginTop: 10 };
const errListStyle: CSSProperties = { margin: "6px 0 0", paddingLeft: 18 };
const okStyle: CSSProperties = { color: "#065f46", fontSize: 13, marginTop: 10 };
const gateNoteStyle: CSSProperties = { fontSize: 12, color: "#64748b" };
const styleOnStyle: CSSProperties = { color: "#065f46", fontWeight: 700, fontSize: 12 };

export default DraftWorkspace;

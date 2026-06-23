/**
 * SOVEREIGN Platform — module-scribe
 * IntermediateWorkspace.tsx — the surface for an intermediate mode (synthesis / framing).
 *
 * Parallel to DraftWorkspace, but DELIBERATELY simpler: intermediate modes produce prose
 * the human carries forward into a drafting mode (companion suite spec §3.4 / §3.5). There
 * is NO product-schema validation and NO Export-to-product gate — the prose never crosses
 * a product boundary (D2 done condition). The hook owns the single LLM call and Logger
 * emission (spec §6: no API/Logger calls in component bodies).
 *
 * Version: 1.0 · Session 8 · June 22, 2026
 */

import { useState, type CSSProperties } from "react";

import type { StyleProfile } from "@sovereign/data";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import {
  INTERMEDIATE_MODE_PURPOSE,
  type IntermediateInput,
  type IntermediateMode,
} from "./intermediate-contract";
import { useIntermediate } from "./useIntermediate";
import { SmartCapturePanel } from "./SmartCapturePanel";

export interface IntermediateWorkspaceProps {
  ctx: SovereignShellContext;
  mode: IntermediateMode;
  label: string;
  /** The active Style DNA profile, forwarded to the prompt when present. */
  styleProfile?: StyleProfile | null;
}

const TIER_NOTE: Record<"live" | "cache" | "static", string> = {
  live: "Live result from the SCRIBE service.",
  cache: "Served from cache — the live service was unavailable, so the last good result for this input was reused.",
  static: "Static fallback — the SCRIBE service is unavailable. This is a by-hand checklist to work from, not a generated result.",
};

const VERB: Record<IntermediateMode, string> = { synthesis: "Synthesize", framing: "Frame" };

export function IntermediateWorkspace({ ctx, mode, label, styleProfile }: IntermediateWorkspaceProps): JSX.Element {
  const { status, outcome, error, run, reset } = useIntermediate(ctx);
  const [captured, setCaptured] = useState("");

  const styleInput = styleProfile ?? undefined;

  const onRun = (): void => {
    const input: IntermediateInput = { mode, capturedMaterial: captured, styleProfile: styleInput };
    void run(input);
  };

  const onReset = (): void => {
    reset();
    setCaptured("");
  };

  return (
    <div style={wrapStyle}>
      <p style={purposeStyle}>{INTERMEDIATE_MODE_PURPOSE[mode]}</p>

      <label style={labelStyle} htmlFor="scribe-intermediate-captured">
        Captured material for <strong>{label}</strong>
        {styleProfile ? <span style={styleOnStyle}> · Style DNA active</span> : null}
      </label>
      <SmartCapturePanel
        ctx={ctx}
        targetMode={mode}
        onTranscript={(text) => setCaptured((prev) => (prev.trim() === "" ? text : `${prev}\n${text}`))}
      />
      <textarea
        id="scribe-intermediate-captured"
        style={textareaStyle}
        rows={5}
        placeholder="Paste notes, a transcript, or multiple sources to work from… (or use Smart Capture above)"
        value={captured}
        onChange={(e) => setCaptured(e.target.value)}
      />

      <div style={rowStyle}>
        <button
          style={captured.trim() === "" || status === "running" ? buttonDisabledStyle : buttonPrimaryStyle}
          disabled={captured.trim() === "" || status === "running"}
          onClick={onRun}
        >
          {status === "running" ? `${VERB[mode]}…` : `${VERB[mode]} material`}
        </button>
        {outcome ? (
          <button style={buttonStyle} onClick={onReset}>
            Clear
          </button>
        ) : null}
      </div>

      {error ? <p style={errorStyle}>{error}</p> : null}

      {outcome ? (
        <div style={panelStyle}>
          <div style={tierBadgeStyle(outcome.tier)}>{outcome.tier.toUpperCase()}</div>
          <p style={tierNoteStyle}>{TIER_NOTE[outcome.tier]}</p>

          <label style={labelStyle} htmlFor="scribe-intermediate-prose">
            Intermediate prose — review and carry this into a drafting mode. It is not exported to a
            product (no product intake schema).
          </label>
          <textarea
            id="scribe-intermediate-prose"
            style={proseAreaStyle}
            rows={14}
            value={outcome.result.prose}
            readOnly
            aria-label="intermediate prose"
          />
          <p style={mutedStyle}>
            This is a working artifact for you to edit and carry forward — SCRIBE logged that it was
            produced, but nothing leaves SCRIBE here.
          </p>
        </div>
      ) : null}
    </div>
  );
}

// ============================================================
// STYLES (inline — consistent with DraftWorkspace / the shell chrome)
// ============================================================

const wrapStyle: CSSProperties = { maxWidth: 720, marginTop: 8 };
const purposeStyle: CSSProperties = { margin: "0 0 8px", fontSize: 13, color: "#334155" };
const labelStyle: CSSProperties = { display: "block", fontSize: 13, color: "#334155", margin: "10px 0 6px" };
const textareaStyle: CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1",
  fontFamily: "system-ui, sans-serif", fontSize: 13, resize: "vertical",
};
const proseAreaStyle: CSSProperties = {
  ...textareaStyle, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, background: "#ffffff",
};
const rowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" };
const buttonStyle: CSSProperties = {
  padding: "8px 14px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#ffffff",
  cursor: "pointer", fontSize: 13,
};
const buttonPrimaryStyle: CSSProperties = {
  ...buttonStyle, border: "1px solid #0c4a6e", background: "#0c4a6e", color: "#ffffff",
};
const buttonDisabledStyle: CSSProperties = { ...buttonStyle, opacity: 0.5, cursor: "not-allowed" };
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
const mutedStyle: CSSProperties = { margin: "8px 0 0", color: "#64748b", fontSize: 12 };
const styleOnStyle: CSSProperties = { color: "#065f46", fontWeight: 700, fontSize: 12 };

export default IntermediateWorkspace;

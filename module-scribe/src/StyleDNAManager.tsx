/**
 * SOVEREIGN Platform — module-scribe
 * StyleDNAManager.tsx — the Style DNA setup + review surface (spec §3.2 / §4.4).
 *
 * The human pastes writing samples, runs the scribe-style-analyst analysis, reviews
 * the resulting StyleProfile, and explicitly approves storage. The hook owns the
 * LLM call, validation-via-ctx.data, Logger emission, and the persistence port; this
 * component holds only presentation + the samples textarea (spec §6: no API/Logger
 * calls in component bodies).
 *
 * Storage is human-gated: a profile is only written when the user clicks Save —
 * which the hook records as a HUMAN_DECISION over their personal (data
 * classification: user) data. The analysis call alone never stores anything.
 *
 * Version: 1.0 · Session 6 · June 17, 2026
 */

import { useState } from "react";
import type { CSSProperties } from "react";

import type { StyleProfile } from "@sovereign/data";
import type { UseStyleProfile } from "./useStyleProfile";

export interface StyleDNAManagerProps {
  style: UseStyleProfile;
}

const TIER_NOTE: Record<"live" | "cache" | "static", string> = {
  live: "Live analysis of your samples.",
  cache: "Served from cache — the analysis service was unavailable, so your last analysed profile for these samples was reused.",
  static: "Static fallback — the analysis service is unavailable. This is a NEUTRAL baseline, not an analysis of your writing. Review before saving, or wait and re-run.",
};

function ProfileView({ profile }: { profile: StyleProfile }): JSX.Element {
  return (
    <dl style={dlStyle}>
      <Field k="Formality" v={`${profile.formality_score} / 100`} />
      <Field k="Sentence complexity" v={profile.sentence_complexity} />
      <Field k="Vocabulary density" v={profile.vocabulary_density} />
      <Field
        k="Structural patterns"
        v={profile.structural_patterns.length ? profile.structural_patterns.join(", ") : "— none detected —"}
      />
      <Field k="Samples analysed" v={String(profile.sample_count)} />
    </dl>
  );
}

function Field({ k, v }: { k: string; v: string }): JSX.Element {
  return (
    <>
      <dt style={dtStyle}>{k}</dt>
      <dd style={ddStyle}>{v}</dd>
    </>
  );
}

export function StyleDNAManager({ style }: StyleDNAManagerProps): JSX.Element {
  const [samples, setSamples] = useState("");

  const onAnalyze = (): void => {
    void style.analyze(samples);
  };

  return (
    <section style={wrapStyle}>
      <h3 style={titleStyle}>Style DNA</h3>
      <p style={mutedStyle}>
        Analyse samples of your own writing so drafts read in your voice. Your profile is personal
        (classification: user); it is stored only when you approve it.
      </p>

      {style.profile ? (
        <div style={activeStyle}>
          <strong style={{ fontSize: 13 }}>Active profile</strong> — drafts in the six modes will match this voice.
          <ProfileView profile={style.profile} />
        </div>
      ) : (
        <p style={mutedStyle}>No Style DNA profile yet — drafts use a clear, professional default voice.</p>
      )}

      <label style={labelStyle} htmlFor="scribe-style-samples">
        Writing samples
      </label>
      <textarea
        id="scribe-style-samples"
        style={textareaStyle}
        rows={5}
        placeholder="Paste 200+ words of your own writing (memos, emails, reports)…"
        value={samples}
        onChange={(e) => setSamples(e.target.value)}
      />
      <div style={rowStyle}>
        <button
          style={samples.trim() === "" || style.status === "analyzing" ? buttonDisabledStyle : buttonPrimaryStyle}
          disabled={samples.trim() === "" || style.status === "analyzing"}
          onClick={onAnalyze}
        >
          {style.status === "analyzing" ? "Analysing…" : "Analyse writing samples"}
        </button>
      </div>

      {style.error ? <p style={errorStyle}>{style.error}</p> : null}

      {style.candidate ? (
        <div style={panelStyle}>
          <div style={tierBadgeStyle(style.candidate.tier)}>{style.candidate.tier.toUpperCase()}</div>
          <p style={tierNoteStyle}>{TIER_NOTE[style.candidate.tier]}</p>
          <strong style={{ fontSize: 13 }}>Proposed profile — review before saving</strong>
          <ProfileView profile={style.candidate.profile} />
          <div style={rowStyle}>
            <button style={buttonPrimaryStyle} onClick={() => style.save(style.candidate!.profile)}>
              Save profile
            </button>
            <button style={buttonStyle} onClick={style.reset}>
              Discard
            </button>
            <span style={gateNoteStyle}>
              Saving records your approval (HUMAN_DECISION) and stores the profile for this session.
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}

// ============================================================
// STYLES (inline — consistent with ScribeApp / DraftWorkspace)
// ============================================================

const wrapStyle: CSSProperties = {
  maxWidth: 720, marginBottom: 16, padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#ffffff",
};
const titleStyle: CSSProperties = { margin: "0 0 4px", fontSize: 16 };
const mutedStyle: CSSProperties = { margin: "4px 0", color: "#64748b", fontSize: 13 };
const activeStyle: CSSProperties = {
  margin: "8px 0", padding: 10, borderRadius: 8, background: "#ecfdf5", border: "1px solid #a7f3d0", fontSize: 13,
};
const labelStyle: CSSProperties = { display: "block", fontSize: 13, color: "#334155", margin: "10px 0 6px" };
const textareaStyle: CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1",
  fontFamily: "system-ui, sans-serif", fontSize: 13, resize: "vertical",
};
const rowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" };
const buttonStyle: CSSProperties = {
  padding: "8px 14px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#ffffff", cursor: "pointer", fontSize: 13,
};
const buttonPrimaryStyle: CSSProperties = { ...buttonStyle, border: "1px solid #0c4a6e", background: "#0c4a6e", color: "#ffffff" };
const buttonDisabledStyle: CSSProperties = { ...buttonStyle, opacity: 0.5, cursor: "not-allowed" };
const panelStyle: CSSProperties = {
  marginTop: 14, padding: 12, border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc",
};
const tierNoteStyle: CSSProperties = { margin: "8px 0 4px", fontSize: 12, color: "#475569" };
const tierBadgeStyle = (tier: "live" | "cache" | "static"): CSSProperties => ({
  display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700,
  color: tier === "live" ? "#065f46" : tier === "cache" ? "#92400e" : "#7f1d1d",
  background: tier === "live" ? "#d1fae5" : tier === "cache" ? "#fef3c7" : "#fee2e2",
});
const errorStyle: CSSProperties = { color: "#b91c1c", fontSize: 13, marginTop: 10 };
const gateNoteStyle: CSSProperties = { fontSize: 12, color: "#64748b" };
const dlStyle: CSSProperties = { display: "grid", gridTemplateColumns: "auto 1fr", gap: "2px 12px", margin: "8px 0 0" };
const dtStyle: CSSProperties = { fontSize: 12, color: "#64748b" };
const ddStyle: CSSProperties = { fontSize: 12, color: "#0f172a", margin: 0, fontWeight: 600 };

export default StyleDNAManager;

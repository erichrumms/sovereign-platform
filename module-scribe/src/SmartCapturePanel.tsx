/**
 * SOVEREIGN Platform — module-scribe
 * SmartCapturePanel.tsx — the voice-input modality for a capture surface.
 *
 * Renders alongside the typed input on the drafting and intermediate workspaces
 * (companion suite spec §3.1: Smart Capture is an alternative to typing, available on
 * every SCRIBE input panel). The user speaks, reviews the editable transcript, and
 * inserts it into the captured material — the human confirms before SCRIBE sends
 * anything to the LLM. The hook owns the Web Speech session and the
 * VOICE_CAPTURE_COMPLETED Logger emission (spec §6: no Logger calls in component bodies).
 *
 * CPMI-VRS Gate 1: a disclosure is shown before capture begins (spec §7).
 * Graceful degradation: when voice is unsupported, the panel shows a note and the user
 * types instead — no capture controls.
 *
 * Version: 1.0 · Session 8 · June 22, 2026
 */

import type { CSSProperties } from "react";

import type { SovereignShellContext, SCRIBEMode } from "../../sovereign-shell/shell-contract";
import { useVoiceCapture, type VoiceCaptureParams } from "./useVoiceCapture";

export interface SmartCapturePanelProps {
  ctx: SovereignShellContext;
  targetMode: SCRIBEMode;
  /** Receives the confirmed transcript to fold into the captured material. */
  onTranscript: (text: string) => void;
  /** Injected recognizer factory (tests). */
  recognitionFactory?: VoiceCaptureParams["recognitionFactory"];
  disabled?: boolean;
}

export function SmartCapturePanel({
  ctx,
  targetMode,
  onTranscript,
  recognitionFactory,
  disabled,
}: SmartCapturePanelProps): JSX.Element {
  const voice = useVoiceCapture(ctx, { targetMode, recognitionFactory });

  if (!voice.supported) {
    return (
      <p style={unsupportedStyle} aria-label="Smart Capture unavailable">
        🎙 Voice capture isn&apos;t available in this browser — type your material below instead.
      </p>
    );
  }

  const listening = voice.status === "listening";

  const onInsert = (): void => {
    if (voice.transcript.trim() === "") return;
    onTranscript(voice.transcript);
    voice.reset();
  };

  return (
    <section style={wrapStyle} aria-label="Smart Capture">
      <p style={disclosureStyle}>
        🎙 <strong>Smart Capture</strong> transcribes your speech in this browser — no audio leaves your
        device. Review the transcript before inserting it; nothing is sent until you submit.
      </p>

      <div style={rowStyle}>
        <button
          type="button"
          style={disabled ? buttonDisabledStyle : listening ? buttonStopStyle : buttonPrimaryStyle}
          disabled={disabled}
          onClick={() => (listening ? voice.stop() : voice.start())}
        >
          {listening ? "■ Stop capture" : "🎙 Start capture"}
        </button>
        {voice.transcript.trim() !== "" && !listening ? (
          <button type="button" style={buttonStyle} onClick={onInsert}>
            Insert into captured material
          </button>
        ) : null}
      </div>

      {voice.error ? <p style={errorStyle}>{voice.error}</p> : null}

      {(voice.transcript || voice.interim) ? (
        <p style={transcriptStyle} aria-label="capture transcript">
          {voice.transcript}
          {voice.interim ? <span style={interimStyle}> {voice.interim}</span> : null}
        </p>
      ) : listening ? (
        <p style={listeningStyle}>Listening… speak now.</p>
      ) : null}
    </section>
  );
}

const wrapStyle: CSSProperties = {
  marginTop: 8, padding: 12, border: "1px dashed #cbd5e1", borderRadius: 10, background: "#f8fafc",
};
const disclosureStyle: CSSProperties = { margin: "0 0 8px", fontSize: 12, color: "#475569" };
const rowStyle: CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap" };
const buttonStyle: CSSProperties = {
  padding: "8px 14px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#ffffff",
  cursor: "pointer", fontSize: 13,
};
const buttonPrimaryStyle: CSSProperties = { ...buttonStyle, border: "1px solid #0c4a6e", background: "#0c4a6e", color: "#ffffff" };
const buttonStopStyle: CSSProperties = { ...buttonStyle, border: "1px solid #7f1d1d", background: "#7f1d1d", color: "#ffffff" };
const buttonDisabledStyle: CSSProperties = { ...buttonStyle, opacity: 0.5, cursor: "not-allowed" };
const errorStyle: CSSProperties = { color: "#b91c1c", fontSize: 13, marginTop: 8 };
const transcriptStyle: CSSProperties = { margin: "8px 0 0", fontSize: 13, color: "#0f172a", lineHeight: 1.5 };
const interimStyle: CSSProperties = { color: "#94a3b8" };
const listeningStyle: CSSProperties = { margin: "8px 0 0", fontSize: 13, color: "#0c4a6e" };
const unsupportedStyle: CSSProperties = { margin: "8px 0 0", fontSize: 12, color: "#64748b" };

export default SmartCapturePanel;

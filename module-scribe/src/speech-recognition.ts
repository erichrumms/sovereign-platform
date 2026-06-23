/**
 * SOVEREIGN Platform — module-scribe
 * speech-recognition.ts — a minimal, typed adapter over the browser Web Speech API.
 *
 * Why this file exists: the Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
 * is vendor-prefixed and NOT in the standard TypeScript DOM lib, and it is unavailable in
 * jsdom and in non-Chromium browsers. This adapter declares the SMALL subset SCRIBE uses
 * and returns `null` when the API is absent — so Smart Capture degrades gracefully to
 * typed-only (companion suite spec §3.1: "degrades gracefully (typed-only mode) in
 * unsupported browsers"). Voice capture does NOT call the LLM — it only transcribes
 * (spec §4.3); the LLM call happens later at the drafting step.
 *
 * No audio leaves the device: the Web Speech API transcribes in the browser
 * (spec §4: "no audio leaves the device").
 *
 * Version: 1.0 · Session 8 · June 22, 2026
 */

/** One recognition result chunk (we read alternative [0] and whether it is final). */
export interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: { readonly transcript: string };
}

export interface SpeechRecognitionEventLike {
  readonly resultIndex: number;
  readonly results: ArrayLike<SpeechRecognitionResultLike>;
}

export interface SpeechRecognitionErrorEventLike {
  readonly error: string;
}

/** The subset of the SpeechRecognition instance API SCRIBE drives. */
export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

/** A factory that produces a configured recognizer, or null if unsupported. */
export type RecognitionFactory = () => SpeechRecognitionLike | null;

/**
 * Create a configured SpeechRecognition instance, or null when the Web Speech API is
 * unavailable (jsdom, Firefox/Safari without support, server). Callers MUST handle null.
 */
export function createSpeechRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;

  const rec = new Ctor();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = "en-US";
  return rec;
}

/** True if the Web Speech API is available in this environment. */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition);
}

/**
 * Fold a recognition event into final + interim transcript fragments. Pure — unit
 * testable without a browser. Reads alternative [0] of each result from resultIndex on.
 */
export function readTranscript(event: SpeechRecognitionEventLike): { final: string; interim: string } {
  let final = "";
  let interim = "";
  const results = event.results;
  for (let i = event.resultIndex; i < results.length; i++) {
    const result = results[i];
    if (!result || result.length === 0) continue;
    const text = result[0]?.transcript ?? "";
    if (result.isFinal) final += text;
    else interim += text;
  }
  return { final, interim };
}

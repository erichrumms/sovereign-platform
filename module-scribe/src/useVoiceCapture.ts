/**
 * SOVEREIGN Platform — module-scribe
 * useVoiceCapture.ts — Smart Capture (voice input) via the Web Speech API.
 *
 * An input MODALITY, not a SCRIBE mode: an alternative to typing on a capture surface
 * (companion suite spec §3.1). It transcribes in the browser and does NOT call the LLM
 * (spec §4.3) — the drafting/intermediate LLM call happens later when the user submits
 * the captured material. No audio leaves the device.
 *
 * VOICE_CAPTURE_COMPLETED (GD-2, shell-contract v1.1 — already approved; NO new event
 * type, NO shell-contract change this session). On capture-session end with a non-empty
 * transcript, the hook emits one VOICE_CAPTURE_COMPLETED carrying duration_seconds,
 * word_count, target_mode, and the GD-2 invariant data_classification: "user". Every
 * Logger event carries workflow_step_id (Standing Constraint #6).
 *
 * CPMI-VRS Gate 2: a failed Logger emit surfaces an error and does NOT continue.
 * Graceful degradation: when the Web Speech API is unavailable, `supported` is false and
 * the capture surface falls back to typed-only.
 *
 * Version: 1.0 · Session 8 · June 22, 2026
 */

import { useCallback, useEffect, useRef, useState } from "react";

import type { SovereignShellContext, SCRIBEMode } from "../../sovereign-shell/shell-contract";
import {
  createSpeechRecognition,
  readTranscript,
  type RecognitionFactory,
  type SpeechRecognitionLike,
} from "./speech-recognition";

const SCRIBE_DRAFTER = "scribe-drafter";

/** Count whitespace-delimited words in a transcript. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

export interface VoiceCaptureParams {
  /** The SCRIBE mode the capture feeds — recorded as target_mode on the event. */
  targetMode: SCRIBEMode;
  /** Present if capture was initiated from a SOVEREIGN product context. */
  workflowStepId?: string;
  /** Injected recognizer factory (tests). Defaults to the real Web Speech adapter. */
  recognitionFactory?: RecognitionFactory;
}

export type VoiceCaptureStatus = "idle" | "listening" | "completed" | "error" | "unsupported";

export interface UseVoiceCapture {
  supported: boolean;
  status: VoiceCaptureStatus;
  /** The accumulated final transcript. */
  transcript: string;
  /** The current interim (not-yet-final) fragment, for live display. */
  interim: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useVoiceCapture(ctx: SovereignShellContext, params: VoiceCaptureParams): UseVoiceCapture {
  const factory = params.recognitionFactory ?? createSpeechRecognition;
  const [supported] = useState<boolean>(() => factory() !== null);

  const [status, setStatus] = useState<VoiceCaptureStatus>(supported ? "idle" : "unsupported");
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptRef = useRef("");
  const startTimeRef = useRef(0);

  // Tear down any live recognition on unmount.
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const wsid = params.workflowStepId ?? `scribe-${params.targetMode}-capture-step-1`;

  const emitCompleted = useCallback(
    (finalTranscript: string): void => {
      const wordCount = countWords(finalTranscript);
      if (wordCount === 0) return; // nothing captured — no event
      const durationSeconds = Math.max(0, Math.round((Date.now() - startTimeRef.current) / 1000));

      // Gate 2: a failed emit surfaces an error and does not continue silently.
      try {
        ctx.logger.log({
          event_type: "VOICE_CAPTURE_COMPLETED",
          workflow_step_id: wsid,
          sovereign_tier: "standard",
          product: "SCRIBE",
          actor_id: ctx.auth.user.employee_id,
          agent_id: SCRIBE_DRAFTER,
          outcome: "voice_capture_completed",
          payload: {
            duration_seconds: durationSeconds,
            word_count: wordCount,
            target_mode: params.targetMode,
            data_classification: "user", // GD-2 invariant — never change
            source_workflow_step: params.workflowStepId ?? null,
          },
        });
      } catch (err) {
        setError(
          `Logger emission failed — voice capture not recorded (CPMI-VRS Gate 2): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        setStatus("error");
      }
    },
    [ctx, wsid, params.targetMode, params.workflowStepId]
  );

  const start = useCallback((): void => {
    if (!supported) {
      setStatus("unsupported");
      return;
    }
    const recognition = factory();
    if (!recognition) {
      setStatus("unsupported");
      return;
    }

    setError(null);
    setInterim("");
    transcriptRef.current = "";
    setTranscript("");
    startTimeRef.current = Date.now();
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const { final, interim: live } = readTranscript(event);
      if (final) {
        transcriptRef.current = (transcriptRef.current + " " + final).trim();
        setTranscript(transcriptRef.current);
      }
      setInterim(live);
    };
    recognition.onerror = (event) => {
      setError(`Voice capture error: ${event.error}`);
      setStatus("error");
    };
    recognition.onend = () => {
      setInterim("");
      recognitionRef.current = null;
      // Don't overwrite a Gate-2/recognition error state with "completed".
      setStatus((prev) => (prev === "error" ? prev : "completed"));
      emitCompleted(transcriptRef.current);
    };

    setStatus("listening");
    recognition.start();
  }, [supported, factory, emitCompleted]);

  const stop = useCallback((): void => {
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback((): void => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    transcriptRef.current = "";
    setTranscript("");
    setInterim("");
    setError(null);
    setStatus(supported ? "idle" : "unsupported");
  }, [supported]);

  return { supported, status, transcript, interim, error, start, stop, reset };
}

/** @jest-environment jsdom */
/**
 * module-scribe — useVoiceCapture.test.tsx
 * Smart Capture: accumulates the transcript, emits one VOICE_CAPTURE_COMPLETED (GD-2)
 * on capture end with word_count / target_mode / data_classification:"user" and a
 * workflow_step_id (no new event type — already approved), degrades gracefully when the
 * Web Speech API is absent, and halts on a failed Logger emit (Gate 2).
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { useVoiceCapture, countWords } from "../src/useVoiceCapture";
import type {
  SpeechRecognitionEventLike,
  SpeechRecognitionLike,
} from "../src/speech-recognition";
import { makeCtx } from "./test-helpers";

/** A controllable fake recognizer the test drives via onresult/onend. */
function fakeRecognition(): SpeechRecognitionLike {
  const rec: SpeechRecognitionLike = {
    lang: "",
    continuous: false,
    interimResults: false,
    onresult: null,
    onerror: null,
    onend: null,
    start: () => {},
    stop: () => rec.onend?.(),
    abort: () => {},
  };
  return rec;
}

function resultEvent(text: string, isFinal: boolean): SpeechRecognitionEventLike {
  return { resultIndex: 0, results: { 0: { 0: { transcript: text }, isFinal, length: 1 }, length: 1 } };
}

describe("countWords", () => {
  it("counts whitespace-delimited words", () => {
    expect(countWords("one two three")).toBe(3);
    expect(countWords("   ")).toBe(0);
  });
});

describe("useVoiceCapture", () => {
  it("emits VOICE_CAPTURE_COMPLETED on capture end with the GD-2 payload", () => {
    const events: SovereignLogEvent[] = [];
    const rec = fakeRecognition();
    const { result } = renderHook(() =>
      useVoiceCapture(makeCtx({ log: (e) => events.push(e) }), {
        targetMode: "correspondence_draft",
        recognitionFactory: () => rec,
      })
    );

    expect(result.current.supported).toBe(true);

    act(() => result.current.start());
    expect(result.current.status).toBe("listening");

    act(() => rec.onresult?.(resultEvent("draft the weekly update", true)));
    expect(result.current.transcript).toBe("draft the weekly update");

    act(() => result.current.stop()); // fake stop() → onend() → emit

    expect(result.current.status).toBe("completed");

    const captured = events.filter((e) => e.event_type === "VOICE_CAPTURE_COMPLETED");
    expect(captured).toHaveLength(1);
    const e = captured[0];
    expect(e.workflow_step_id).toBe("scribe-correspondence_draft-capture-step-1");
    expect(e.product).toBe("SCRIBE");
    expect(e.agent_id).toBe("scribe-drafter");
    const payload = e.payload as { word_count: number; target_mode: string; data_classification: string; duration_seconds: number };
    expect(payload.word_count).toBe(4);
    expect(payload.target_mode).toBe("correspondence_draft");
    expect(payload.data_classification).toBe("user"); // GD-2 invariant
    expect(payload.duration_seconds).toBeGreaterThanOrEqual(0);
  });

  it("does not emit when the transcript is empty", () => {
    const events: SovereignLogEvent[] = [];
    const rec = fakeRecognition();
    const { result } = renderHook(() =>
      useVoiceCapture(makeCtx({ log: (e) => events.push(e) }), {
        targetMode: "synthesis",
        recognitionFactory: () => rec,
      })
    );

    act(() => result.current.start());
    act(() => result.current.stop()); // ends with no transcript

    expect(events.filter((e) => e.event_type === "VOICE_CAPTURE_COMPLETED")).toHaveLength(0);
  });

  it("degrades gracefully when the Web Speech API is unavailable", () => {
    const { result } = renderHook(() =>
      useVoiceCapture(makeCtx(), { targetMode: "framing", recognitionFactory: () => null })
    );
    expect(result.current.supported).toBe(false);
    expect(result.current.status).toBe("unsupported");
    act(() => result.current.start());
    expect(result.current.status).toBe("unsupported");
  });

  it("halts on a failed Logger emit (CPMI-VRS Gate 2)", () => {
    const rec = fakeRecognition();
    const { result } = renderHook(() =>
      useVoiceCapture(
        makeCtx({
          log: () => {
            throw new Error("logger down");
          },
        }),
        { targetMode: "vvr_description", recognitionFactory: () => rec }
      )
    );

    act(() => result.current.start());
    act(() => rec.onresult?.(resultEvent("a workflow step", true)));
    act(() => result.current.stop());

    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/Logger emission failed/);
  });
});

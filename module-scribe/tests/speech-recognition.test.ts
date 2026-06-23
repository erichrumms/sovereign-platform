/** @jest-environment jsdom */
/**
 * module-scribe — speech-recognition.test.ts
 * The Web Speech adapter: returns null when unsupported (jsdom has no SpeechRecognition),
 * configures the recognizer when the API is present, and readTranscript folds events into
 * final/interim fragments (pure).
 */
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  readTranscript,
  type SpeechRecognitionEventLike,
  type SpeechRecognitionLike,
} from "../src/speech-recognition";

function event(text: string, isFinal: boolean): SpeechRecognitionEventLike {
  return { resultIndex: 0, results: { 0: { 0: { transcript: text }, isFinal, length: 1 }, length: 1 } };
}

describe("createSpeechRecognition / support", () => {
  afterEach(() => {
    delete (window as unknown as Record<string, unknown>).SpeechRecognition;
  });

  it("returns null and reports unsupported in jsdom (no Web Speech API)", () => {
    expect(createSpeechRecognition()).toBeNull();
    expect(isSpeechRecognitionSupported()).toBe(false);
  });

  it("constructs and configures a recognizer when the API is present", () => {
    class FakeRec implements SpeechRecognitionLike {
      lang = "";
      continuous = false;
      interimResults = false;
      onresult = null;
      onerror = null;
      onend = null;
      start(): void {}
      stop(): void {}
      abort(): void {}
    }
    (window as unknown as Record<string, unknown>).SpeechRecognition = FakeRec;

    expect(isSpeechRecognitionSupported()).toBe(true);
    const rec = createSpeechRecognition();
    expect(rec).not.toBeNull();
    expect(rec!.continuous).toBe(true);
    expect(rec!.interimResults).toBe(true);
    expect(rec!.lang).toBe("en-US");
  });
});

describe("readTranscript", () => {
  it("reads a final fragment", () => {
    expect(readTranscript(event("hello world", true))).toEqual({ final: "hello world", interim: "" });
  });
  it("reads an interim fragment", () => {
    expect(readTranscript(event("typing", false))).toEqual({ final: "", interim: "typing" });
  });
});

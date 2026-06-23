/** @jest-environment jsdom */
/**
 * module-scribe — SmartCapturePanel.test.tsx
 * The voice-input modality: shows a Gate 1 disclosure and capture controls when
 * supported, degrades to a typed-only note when not, and inserts the confirmed
 * transcript into the captured material via onTranscript.
 */
import { render, screen, fireEvent, act } from "@testing-library/react";

import { SmartCapturePanel } from "../src/SmartCapturePanel";
import type {
  SpeechRecognitionEventLike,
  SpeechRecognitionLike,
} from "../src/speech-recognition";
import { makeCtx } from "./test-helpers";

function fakeRecognition(): SpeechRecognitionLike {
  const rec: SpeechRecognitionLike = {
    lang: "", continuous: false, interimResults: false,
    onresult: null, onerror: null, onend: null,
    start: () => {}, stop: () => rec.onend?.(), abort: () => {},
  };
  return rec;
}
function resultEvent(text: string): SpeechRecognitionEventLike {
  return { resultIndex: 0, results: { 0: { 0: { transcript: text }, isFinal: true, length: 1 }, length: 1 } };
}

describe("SmartCapturePanel", () => {
  it("shows a typed-only note when voice is unsupported", () => {
    render(
      <SmartCapturePanel ctx={makeCtx()} targetMode="synthesis" onTranscript={() => {}} recognitionFactory={() => null} />
    );
    expect(screen.getByLabelText("Smart Capture unavailable")).toHaveTextContent(/type your material/i);
    expect(screen.queryByRole("button", { name: /Start capture/i })).not.toBeInTheDocument();
  });

  it("shows the Gate 1 disclosure and capture control when supported", () => {
    const rec = fakeRecognition();
    render(
      <SmartCapturePanel ctx={makeCtx()} targetMode="synthesis" onTranscript={() => {}} recognitionFactory={() => rec} />
    );
    expect(screen.getByLabelText("Smart Capture")).toHaveTextContent(/no audio leaves your device/i);
    expect(screen.getByRole("button", { name: /Start capture/i })).toBeInTheDocument();
  });

  it("inserts the confirmed transcript into the captured material", () => {
    const rec = fakeRecognition();
    const onTranscript = jest.fn();
    render(
      <SmartCapturePanel ctx={makeCtx()} targetMode="framing" onTranscript={onTranscript} recognitionFactory={() => rec} />
    );

    fireEvent.click(screen.getByRole("button", { name: /Start capture/i }));
    act(() => rec.onresult?.(resultEvent("frame the workflow")));
    fireEvent.click(screen.getByRole("button", { name: /Stop capture/i }));

    fireEvent.click(screen.getByRole("button", { name: /Insert into captured material/i }));
    expect(onTranscript).toHaveBeenCalledWith("frame the workflow");
  });
});

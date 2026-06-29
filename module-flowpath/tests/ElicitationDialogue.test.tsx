/** @jest-environment jsdom */
/**
 * module-flowpath — ElicitationDialogue.test.tsx (Screen 2, organizational mode)
 * Dialogue renders with domain-language questions (Gap 5); the Five-Question Gate indicators update
 * as answers arrive and block artifact production until all five are answered; production logs the
 * four GD-18 artifact events (each with workflow_step_id); the artifact previews in plain prose.
 */
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { ElicitationDialogue } from "../src/ElicitationDialogue";
import { artifactWorkflowStep } from "../src/flowpath-contract";
import { SYNTHETIC_SESSION_ID } from "../src/synthetic-elicitation";
import { makeCtx } from "./test-helpers";

const QUESTIONS = [
  "Who does the work — which role is responsible for each step?",
  "In what order do the steps happen?",
  "What has to be true for the work to start, and what decisions branch it?",
  "What does the work take in, and what does it produce?",
  "How do you know the work is finished?",
];

/** A deterministic offline LLM call: provider fallback → the static mapper tier. */
const offlineComplete = async () =>
  ({ content: "", fallback_tier: "static", fallback_activated: true, sovereign_metadata: {} } as never);

function fillAllAnswers(): void {
  fireEvent.change(screen.getByLabelText(QUESTIONS[0]), { target: { value: "The program analyst reviews each program." } });
  fireEvent.change(screen.getByLabelText(QUESTIONS[1]), { target: { value: "First the analyst reviews, then the manager dispositions." } });
  fireEvent.change(screen.getByLabelText(QUESTIONS[2]), { target: { value: "The monthly obligation cycle has closed." } });
  fireEvent.change(screen.getByLabelText(QUESTIONS[3]), { target: { value: "Obligation records and spend plans." } });
  fireEvent.change(screen.getByLabelText(QUESTIONS[4]), { target: { value: "Every flagged program has a recorded disposition." } });
}

describe("ElicitationDialogue (Screen 2, organizational mode)", () => {
  it("renders the dialogue with five domain-language questions", () => {
    render(<ElicitationDialogue ctx={makeCtx()} complete={offlineComplete} />);
    for (const q of QUESTIONS) expect(screen.getByLabelText(q)).toBeInTheDocument();
  });

  it("asks questions in domain language, not SOVEREIGN internals (Gap 5)", () => {
    const { container } = render(<ElicitationDialogue ctx={makeCtx()} complete={offlineComplete} />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/workflow_step_id|SovereignEventType|schema|WorkflowArtifact/);
  });

  it("renders the Five-Question Gate with all five 'Still needed' initially", () => {
    render(<ElicitationDialogue ctx={makeCtx()} complete={offlineComplete} />);
    const list = screen.getByRole("list", { name: /five-question gate status/i });
    expect(list.querySelectorAll("li")).toHaveLength(5);
    expect(within(list).getAllByText(/Still needed/i)).toHaveLength(5);
  });

  it("flips a gate indicator to Answered when its question is answered", () => {
    render(<ElicitationDialogue ctx={makeCtx()} complete={offlineComplete} />);
    fireEvent.change(screen.getByLabelText(QUESTIONS[0]), { target: { value: "The program analyst." } });
    const whoRow = document.querySelector('[data-question="WHO"]') as HTMLElement;
    expect(whoRow.getAttribute("data-answered")).toBe("true");
    const list = screen.getByRole("list", { name: /five-question gate status/i });
    expect(within(list).getAllByText(/Still needed/i)).toHaveLength(4);
    expect(within(list).getAllByText(/Answered/i)).toHaveLength(1);
  });

  it("WC-3: no amber gate notice on first load; attempting Produce with gaps shows it and does not produce", () => {
    const sink: SovereignLogEvent[] = [];
    render(<ElicitationDialogue ctx={makeCtx({ logSink: sink })} complete={offlineComplete} />);
    // First load — the gate warning does not greet the user.
    expect(screen.queryByText(/Five-Question Gate not yet met/i)).not.toBeInTheDocument();
    // Attempt to produce with questions still open — the notice now appears, nothing is produced.
    fireEvent.click(screen.getByRole("button", { name: /produce workflow artifact/i }));
    expect(screen.getByText(/Five-Question Gate not yet met/i)).toBeInTheDocument();
    expect(sink.some((e) => e.event_type === "FLOWPATH_ARTIFACT_PRODUCED")).toBe(false);
    expect(screen.queryByTestId("artifact-preview")).not.toBeInTheDocument();
  });

  it("WC-3: the amber gate notice clears once all five are answered", () => {
    render(<ElicitationDialogue ctx={makeCtx()} complete={offlineComplete} />);
    fireEvent.click(screen.getByRole("button", { name: /produce workflow artifact/i })); // attempt with gaps
    expect(screen.getByText(/Five-Question Gate not yet met/i)).toBeInTheDocument();
    fillAllAnswers();
    expect(screen.queryByText(/Five-Question Gate not yet met/i)).not.toBeInTheDocument();
  });

  it("logs FLOWPATH_ARTIFACT_PRODUCED on production, with workflow_step_id", async () => {
    const sink: SovereignLogEvent[] = [];
    render(<ElicitationDialogue ctx={makeCtx({ logSink: sink })} complete={offlineComplete} />);
    fillAllAnswers();
    fireEvent.click(screen.getByRole("button", { name: /produce workflow artifact/i }));
    await waitFor(() => expect(sink.some((e) => e.event_type === "FLOWPATH_ARTIFACT_PRODUCED")).toBe(true));
    const ev = sink.find((e) => e.event_type === "FLOWPATH_ARTIFACT_PRODUCED")!;
    expect(ev.workflow_step_id).toBe(artifactWorkflowStep(SYNTHETIC_SESSION_ID));
    expect(ev.product).toBe("FLOWPATH");
  });

  it("logs the vocabulary, data-source, and validation-cadence events on production", async () => {
    const sink: SovereignLogEvent[] = [];
    render(<ElicitationDialogue ctx={makeCtx({ logSink: sink })} complete={offlineComplete} />);
    fillAllAnswers();
    fireEvent.click(screen.getByRole("button", { name: /produce workflow artifact/i }));
    await waitFor(() => expect(sink.some((e) => e.event_type === "FLOWPATH_VALIDATION_CADENCE_SET")).toBe(true));
    const types = sink.map((e) => e.event_type);
    expect(types).toContain("FLOWPATH_VOCABULARY_CAPTURED");
    expect(types).toContain("FLOWPATH_DATASOURCE_REGISTERED");
    expect(types).toContain("FLOWPATH_VALIDATION_CADENCE_SET");
  });

  it("every production event carries workflow_step_id (Constraint #6)", async () => {
    const sink: SovereignLogEvent[] = [];
    render(<ElicitationDialogue ctx={makeCtx({ logSink: sink })} complete={offlineComplete} />);
    fillAllAnswers();
    fireEvent.click(screen.getByRole("button", { name: /produce workflow artifact/i }));
    await waitFor(() => expect(sink.length).toBeGreaterThanOrEqual(4));
    expect(sink.every((e) => typeof e.workflow_step_id === "string" && e.workflow_step_id.length > 0)).toBe(true);
  });

  it("previews the produced artifact in plain prose, not a JSON schema dump (Gap 5)", async () => {
    render(<ElicitationDialogue ctx={makeCtx()} complete={offlineComplete} />);
    fillAllAnswers();
    fireEvent.click(screen.getByRole("button", { name: /produce workflow artifact/i }));
    const preview = await screen.findByTestId("artifact-preview");
    const text = preview.textContent ?? "";
    expect(text).toMatch(/is responsible/i);
    expect(text).toMatch(/The workflow is complete when/i);
    expect(text).not.toMatch(/[{}]|"artifact_id"|"step_id"/);
  });

  it("does not produce or log before the gate is met", () => {
    const sink: SovereignLogEvent[] = [];
    render(<ElicitationDialogue ctx={makeCtx({ logSink: sink })} complete={offlineComplete} />);
    // Untouched load: no artifact events and no preview without all five answers.
    expect(sink.some((e) => e.event_type === "FLOWPATH_ARTIFACT_PRODUCED")).toBe(false);
    expect(screen.queryByTestId("artifact-preview")).not.toBeInTheDocument();
  });
});

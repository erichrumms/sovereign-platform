/** @jest-environment jsdom */
/**
 * module-lens — AITransparencyPanel.test.tsx
 * Read-only timeline: surfaces AGENT_STEP_COMPLETE / HUMAN_DECISION in plain language,
 * marks fallback steps as offline mode, suppresses events with no summary, and shows an
 * honest empty state.
 */
import { render, screen } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { AITransparencyPanel, summarizeEvent } from "../src/AITransparencyPanel";

function evt(over: Partial<SovereignLogEvent>): SovereignLogEvent {
  return {
    event_type: "AGENT_STEP_COMPLETE",
    workflow_step_id: "lens-explain-1",
    sovereign_tier: "standard",
    product: "LENS",
    actor_id: "E-700",
    outcome: "explanation_live",
    payload: {},
    ...over,
  } as SovereignLogEvent;
}

describe("summarizeEvent", () => {
  it("summarizes a live AGENT_STEP_COMPLETE as full capacity", () => {
    expect(summarizeEvent(evt({ agent_id: "lens-explainer", payload: { fallback_activated: false } }))).toMatch(
      /lens-explainer.*full capacity/
    );
  });

  it("summarizes a fallback AGENT_STEP_COMPLETE as offline mode", () => {
    expect(summarizeEvent(evt({ agent_id: "lens-explainer", payload: { fallback_activated: true } }))).toMatch(
      /offline mode/
    );
  });

  it("summarizes a HUMAN_DECISION with actor and decision type", () => {
    const line = summarizeEvent(
      evt({
        event_type: "HUMAN_DECISION",
        actor_name: "Pat Operator",
        decision_type: "HUMAN_APPROVAL",
      })
    );
    expect(line).toMatch(/Pat Operator.*HUMAN_APPROVAL/);
  });

  it("suppresses events with no human-readable summary", () => {
    expect(summarizeEvent(evt({ event_type: "AGENT_STEP_START" }))).toBeNull();
  });
});

describe("AITransparencyPanel", () => {
  it("shows an honest empty state when no events were captured", () => {
    render(<AITransparencyPanel events={[]} />);
    expect(screen.getByText(/No AI agent activity has been captured/i)).toBeInTheDocument();
  });

  it("renders only the summarizable events as a timeline", () => {
    render(
      <AITransparencyPanel
        events={[
          evt({ event_type: "AGENT_STEP_START" }), // suppressed
          evt({ agent_id: "lens-explainer", payload: { fallback_activated: true } }),
        ]}
      />
    );
    const items = screen.getByRole("list", { name: "Agent activity timeline" }).querySelectorAll("li");
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toMatch(/offline mode/);
  });

  it("notes that the feed reflects LENS-observed activity only", () => {
    render(<AITransparencyPanel events={[]} />);
    expect(screen.getByLabelText("AI Transparency Panel")).toHaveTextContent(/LENS activity only/);
  });
});

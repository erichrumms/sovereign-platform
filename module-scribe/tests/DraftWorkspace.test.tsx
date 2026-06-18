/** @jest-environment jsdom */
/**
 * module-scribe — DraftWorkspace.test.tsx
 * The drafting surface end-to-end under jsdom, key-less (the mapped anthropic-key
 * stub returns no key), so the engine takes the static tier — deterministic, no
 * network. Verifies: the approved Logger taxonomy on generate (AGENT_STEP_START /
 * FALLBACK_ACTIVATED / AGENT_STEP_COMPLETE), CPMI-VRS Gate 3 (export blocked until
 * the edited draft satisfies the schema), and a logged + routed export.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { DraftWorkspace } from "../src/DraftWorkspace";
import { makeCtx } from "./test-helpers";

function setup() {
  const events: SovereignLogEvent[] = [];
  const navs: string[] = [];
  const ctx = makeCtx({
    log: (e) => events.push(e),
    navigateTo: (p) => navs.push(p),
  });
  render(<DraftWorkspace ctx={ctx} mode="correspondence_draft" label="Correspondence Draft" targetProduct="NEXUS" />);
  return { events, navs };
}

async function generate(): Promise<void> {
  fireEvent.change(screen.getByLabelText(/Captured material/i), {
    target: { value: "Reply to the vendor about the Q3 change request." },
  });
  fireEvent.click(screen.getByRole("button", { name: /generate draft/i }));
  await waitFor(() => expect(screen.getByLabelText("draft editor")).toBeInTheDocument());
}

describe("DraftWorkspace — generate", () => {
  it("disables Generate until captured material is entered", () => {
    setup();
    expect(screen.getByRole("button", { name: /generate draft/i })).toBeDisabled();
  });

  it("drafts via the static tier when key-less and emits the approved Logger taxonomy", async () => {
    const { events } = setup();
    await generate();

    // Static tier badge is shown honestly.
    expect(screen.getByText("STATIC")).toBeInTheDocument();

    const types = events.map((e) => e.event_type);
    expect(types).toContain("AGENT_STEP_START");
    expect(types).toContain("FALLBACK_ACTIVATED"); // degraded tier self-reported
    expect(types).toContain("AGENT_STEP_COMPLETE");
    // No invented SCRIBE_* event types.
    expect(types.every((t) => !t.startsWith("SCRIBE_"))).toBe(true);
    // Every event carries a workflow_step_id.
    expect(events.every((e) => typeof e.workflow_step_id === "string" && e.workflow_step_id.length > 0)).toBe(true);
  });
});

describe("DraftWorkspace — CPMI-VRS Gate 3 export", () => {
  it("blocks export when the edited draft fails the schema, then allows it once valid", async () => {
    const { events, navs } = setup();
    await generate();

    const editor = screen.getByLabelText("draft editor");

    // Break the schema (empty subject) → approval disabled, error shown.
    fireEvent.change(editor, { target: { value: JSON.stringify({ subject: "", body: "x", action_items: [] }) } });
    expect(screen.getByText(/Schema validation failed/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Approve & export/i })).toBeDisabled();

    // Fix the schema → approval enabled.
    fireEvent.change(editor, {
      target: { value: JSON.stringify({ subject: "Q3 vendor change", body: "Drafted reply.", action_items: [] }) },
    });
    expect(screen.getByText(/satisfies the NEXUS correspondence_draft schema/i)).toBeInTheDocument();
    const approve = screen.getByRole("button", { name: /Approve & export/i });
    expect(approve).toBeEnabled();

    // Approve → HUMAN_DECISION logged, routed to the product, confirmation shown.
    fireEvent.click(approve);

    const decision = events.find((e) => e.event_type === "HUMAN_DECISION");
    expect(decision).toBeDefined();
    expect(decision?.decision_type).toBe("HUMAN_APPROVAL");
    expect(decision?.actor).toBe("human");
    expect(decision?.actor_name).toBe("Sam Author");
    expect(decision?.workflow_step_id).toBe("scribe-correspondence_draft-draft-step-1");
    expect(navs).toEqual(["/nexus"]);
    expect(screen.getByText(/Approved and routed to NEXUS/i)).toBeInTheDocument();
  });
});

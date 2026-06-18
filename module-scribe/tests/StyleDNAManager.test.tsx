/** @jest-environment jsdom */
/**
 * module-scribe — StyleDNAManager.test.tsx
 * Style DNA end-to-end under jsdom, key-less (mapped anthropic-key stub returns no
 * key), so the engine takes the static neutral tier. Verifies the approved Logger
 * taxonomy on analyse (AGENT_STEP_START / FALLBACK_ACTIVATED / AGENT_STEP_COMPLETE),
 * the human-gated save (HUMAN_DECISION, data_classification user), no invented
 * STYLE_PROFILE_UPDATED, and that the profile is stored.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { StyleDNAManager } from "../src/StyleDNAManager";
import { useStyleProfile } from "../src/useStyleProfile";
import { createSessionStyleProfileStore, type StyleProfileStore } from "../src/style-contract";
import { makeCtx } from "./test-helpers";

function Harness({ ctx, store }: { ctx: ReturnType<typeof makeCtx>; store: StyleProfileStore }): JSX.Element {
  const style = useStyleProfile(ctx, store);
  return <StyleDNAManager style={style} />;
}

function setup() {
  const events: SovereignLogEvent[] = [];
  const ctx = makeCtx({ log: (e) => events.push(e) });
  const store = createSessionStyleProfileStore();
  render(<Harness ctx={ctx} store={store} />);
  return { events, store };
}

async function analyse(): Promise<void> {
  fireEvent.change(screen.getByLabelText(/Writing samples/i), {
    target: { value: "I keep my sentences short. I get to the point. No filler." },
  });
  fireEvent.click(screen.getByRole("button", { name: /Analyse writing samples/i }));
  await waitFor(() => expect(screen.getByText(/Proposed profile/i)).toBeInTheDocument());
}

describe("StyleDNAManager", () => {
  it("disables Analyse until samples are entered", () => {
    setup();
    expect(screen.getByRole("button", { name: /Analyse writing samples/i })).toBeDisabled();
  });

  it("analyses via the static tier and emits the approved Logger taxonomy", async () => {
    const { events } = setup();
    await analyse();

    expect(screen.getByText("STATIC")).toBeInTheDocument();

    const types = events.map((e) => e.event_type);
    expect(types).toContain("AGENT_STEP_START");
    expect(types).toContain("FALLBACK_ACTIVATED");
    expect(types).toContain("AGENT_STEP_COMPLETE");
    expect(types).not.toContain("STYLE_PROFILE_UPDATED"); // deferred — never emitted
    expect(types.every((t) => !t.startsWith("SCRIBE_"))).toBe(true);
    // The analysis step carries the style analyst as the agent.
    const start = events.find((e) => e.event_type === "AGENT_STEP_START");
    expect(start?.agent_id).toBe("scribe-style-analyst");
    expect(start?.agent_class).toBe("Analytical");
  });

  it("human-gated save stores the profile and logs a HUMAN_DECISION", async () => {
    const { events, store } = setup();
    await analyse();

    // Nothing stored by analysis alone.
    expect(store.read("E-700")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Save profile/i }));

    const decision = events.find((e) => e.event_type === "HUMAN_DECISION");
    expect(decision).toBeDefined();
    expect(decision?.decision_type).toBe("HUMAN_APPROVAL");
    expect(decision?.actor).toBe("human");
    expect(decision?.actor_name).toBe("Sam Author");
    expect(decision?.workflow_step_id).toBe("scribe-style-analysis-step-1");
    expect((decision?.payload as { data_classification?: string }).data_classification).toBe("user");

    // Stored + reflected as the active profile.
    expect(store.read("E-700")).not.toBeNull();
    expect(screen.getByText(/Active profile/i)).toBeInTheDocument();
  });

  it("discard clears the candidate without storing", async () => {
    const { store } = setup();
    await analyse();
    fireEvent.click(screen.getByRole("button", { name: /Discard/i }));
    expect(screen.queryByText(/Proposed profile/i)).not.toBeInTheDocument();
    expect(store.read("E-700")).toBeNull();
  });
});

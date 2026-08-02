/** @jest-environment jsdom */
/**
 * module-scribe — useDraft.test.tsx
 * The SCRIBE Drafting hook: brackets the scribe-drafter step with AGENT_STEP_* +
 * FALLBACK_ACTIVATED (approved event types only — no SCRIBE_*), and threads real
 * token usage from the mock client into token_usage on AGENT_STEP_COMPLETE (GD-31).
 * Token_usage is absent when a fallback tier served. Key-less → static tier for
 * the fallback path.
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { useDraft } from "../src/useDraft";
import type { DraftInput } from "../src/draft-engine";
import { makeCtx } from "./test-helpers";

const INPUT: DraftInput = {
  mode: "correspondence_draft",
  capturedMaterial: "Reply to vendor regarding Q3 change.",
};

describe("useDraft", () => {
  it("populates token_usage on AGENT_STEP_COMPLETE when live tier serves (GD-31)", async () => {
    const events: SovereignLogEvent[] = [];
    const mockComplete = async () =>
      ({
        content: JSON.stringify({ subject: "Q3 vendor change", body: "Drafted reply.", action_items: [] }),
        fallback_activated: false,
        fallback_tier: "live",
        usage: { input_tokens: 100, output_tokens: 50 },
      } as unknown as import("@sovereign/api-client").SovereignLLMResponse);
    const { result } = renderHook(() =>
      useDraft(makeCtx({ log: (e) => events.push(e) }), { complete: mockComplete })
    );
    await act(async () => {
      await result.current.draft(INPUT);
    });
    expect(result.current.outcome?.tier).toBe("live");
    const complete = events.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage?.input_tokens).toBe(100);
    expect(complete.token_usage?.output_tokens).toBe(50);
    expect(typeof complete.token_usage?.estimated_cost_usd).toBe("number");
  });

  it("leaves token_usage absent on AGENT_STEP_COMPLETE when fallback served (GD-31)", async () => {
    const events: SovereignLogEvent[] = [];
    const { result } = renderHook(() =>
      useDraft(makeCtx({ log: (e) => events.push(e) }))
    );
    await act(async () => {
      await result.current.draft(INPUT);
    });
    const complete = events.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage).toBeUndefined();
  });
});

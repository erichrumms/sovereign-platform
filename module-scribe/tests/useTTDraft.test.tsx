/** @jest-environment jsdom */
/**
 * module-scribe — useTTDraft.test.tsx
 * The Time & Travel drafting hook: brackets the tt.travel-drafter step with
 * AGENT_STEP_* + FALLBACK_ACTIVATED, and threads real token usage from the mock
 * client into token_usage on AGENT_STEP_COMPLETE (GD-31). Token_usage is absent when
 * a fallback tier served. Key-less → static tier for the fallback path.
 */
import { renderHook, act } from "@testing-library/react";

import { SYNTH_TT_TRAVEL_POLICY, SYNTH_TT_TRAVEL_REQUESTS } from "@sovereign/data";
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { useTTDraft } from "../src/useTTDraft";
import type { TravelDraftInput } from "../src/tt-draft-engine";
import { makeCtx } from "./test-helpers";

const INPUT: TravelDraftInput = {
  tool: "travel",
  request: SYNTH_TT_TRAVEL_REQUESTS[0], // SYNTH-TR-101, status APPROVED → APPROVAL_NOTICE
  policy: SYNTH_TT_TRAVEL_POLICY,
};

describe("useTTDraft", () => {
  it("populates token_usage on AGENT_STEP_COMPLETE when live tier serves (GD-31)", async () => {
    const events: SovereignLogEvent[] = [];
    const mockComplete = async () =>
      ({
        content: "Subject: Travel approved\n\nYour travel to Denver is approved.",
        fallback_activated: false,
        fallback_tier: "live",
        usage: { input_tokens: 100, output_tokens: 50 },
      } as unknown as import("@sovereign/api-client").SovereignLLMResponse);
    const { result } = renderHook(() =>
      useTTDraft(makeCtx({ log: (e) => events.push(e) }), { complete: mockComplete })
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
      useTTDraft(makeCtx({ log: (e) => events.push(e) }))
    );
    await act(async () => {
      await result.current.draft(INPUT);
    });
    const complete = events.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage).toBeUndefined();
  });
});

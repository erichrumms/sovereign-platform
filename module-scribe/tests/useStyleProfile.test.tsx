/** @jest-environment jsdom */
/**
 * module-scribe — useStyleProfile.test.tsx
 * The Style DNA hook: brackets the scribe-style-analyst step with AGENT_STEP_* +
 * FALLBACK_ACTIVATED, and threads real token usage from the mock client into
 * token_usage on AGENT_STEP_COMPLETE (GD-31). Token_usage is absent when a fallback
 * tier served. Key-less → static tier for the fallback path.
 */
import { renderHook, act } from "@testing-library/react";

import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";
import { useStyleProfile } from "../src/useStyleProfile";
import { createSessionStyleProfileStore } from "../src/style-contract";
import { makeCtx } from "./test-helpers";

const SAMPLES = "I prefer direct and concise communication with clear action items.";

describe("useStyleProfile", () => {
  it("populates token_usage on AGENT_STEP_COMPLETE when live tier serves (GD-31)", async () => {
    const events: SovereignLogEvent[] = [];
    const mockComplete = async () =>
      ({
        content: JSON.stringify({
          formality_score: 64,
          sentence_complexity: "simple",
          vocabulary_density: "accessible",
          structural_patterns: ["direct address"],
        }),
        fallback_activated: false,
        fallback_tier: "live",
        usage: { input_tokens: 100, output_tokens: 50 },
      } as unknown as import("@sovereign/api-client").SovereignLLMResponse);
    const store = createSessionStyleProfileStore();
    const { result } = renderHook(() =>
      useStyleProfile(makeCtx({ log: (e) => events.push(e) }), store, { complete: mockComplete })
    );
    await act(async () => {
      await result.current.analyze(SAMPLES);
    });
    expect(result.current.candidate?.tier).toBe("live");
    const complete = events.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage?.input_tokens).toBe(100);
    expect(complete.token_usage?.output_tokens).toBe(50);
    expect(typeof complete.token_usage?.estimated_cost_usd).toBe("number");
  });

  it("leaves token_usage absent on AGENT_STEP_COMPLETE when fallback served (GD-31)", async () => {
    const events: SovereignLogEvent[] = [];
    const store = createSessionStyleProfileStore();
    const { result } = renderHook(() =>
      useStyleProfile(makeCtx({ log: (e) => events.push(e) }), store)
    );
    await act(async () => {
      await result.current.analyze(SAMPLES);
    });
    const complete = events.find((e) => e.event_type === "AGENT_STEP_COMPLETE")!;
    expect(complete.token_usage).toBeUndefined();
  });
});

/**
 * sovereign-api-client — test_inference_logger.test.ts
 * The three GD-8 events emit through the ClientLogger with the right event_type, payload,
 * and workflow_step_id (Constraint #6).
 */
import { emitInferenceCall, emitProviderFallback, emitModelHashMismatch } from "../src/inference-logger";
import type { ClientLogger } from "../src/base-client";

function makeLogger() {
  const events: Parameters<ClientLogger["log"]>[0][] = [];
  const logger: ClientLogger = { log: (e) => events.push(e) };
  return { logger, events };
}

const base = { workflow_step_id: "wf-1", product: "CPMI" as const, actor_id: "cpmi.reasoning-chain" };

describe("inference logger", () => {
  it("emits INFERENCE_CALL with provider, model, classification, latency", () => {
    const { logger, events } = makeLogger();
    emitInferenceCall({ ...base, logger, provider: "ollama", model_id: "mistral:13b-q4", input_classification: "CUI", output_schema_valid: true, latency_ms: 42 });
    expect(events).toHaveLength(1);
    expect(events[0].event_type).toBe("INFERENCE_CALL");
    expect(events[0].workflow_step_id).toBe("wf-1");
    expect(events[0].payload).toMatchObject({ provider: "ollama", model_id: "mistral:13b-q4", input_classification: "CUI", output_schema_valid: true, latency_ms: 42 });
  });

  it("emits INFERENCE_PROVIDER_FALLBACK with intended/actual/reason", () => {
    const { logger, events } = makeLogger();
    emitProviderFallback({ ...base, logger, intended_provider: "ollama", actual_provider: "anthropic", fallback_reason: "ollama_unavailable" });
    expect(events[0].event_type).toBe("INFERENCE_PROVIDER_FALLBACK");
    expect(events[0].payload).toMatchObject({ intended_provider: "ollama", actual_provider: "anthropic", fallback_reason: "ollama_unavailable" });
    expect(events[0].workflow_step_id).toBe("wf-1");
  });

  it("emits MODEL_HASH_MISMATCH at P1 with expected/actual hashes", () => {
    const { logger, events } = makeLogger();
    emitModelHashMismatch({ ...base, logger, model_id: "mistral:13b-q4", expected_sha256: "a", actual_sha256: "b" });
    expect(events[0].event_type).toBe("MODEL_HASH_MISMATCH");
    expect(events[0].payload).toMatchObject({ model_id: "mistral:13b-q4", expected_sha256: "a", actual_sha256: "b", severity: "P1" });
  });
});

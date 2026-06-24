/**
 * SOVEREIGN Platform — sovereign-api-client
 * inference-logger.ts — emits the GD-8 inference-layer Logger events.
 *
 * Emits through the injected ClientLogger (the api-client's platform-logger shim, whose
 * event_type union was extended for GD-8). The api-client stays standalone — it never
 * imports shell-contract or the Security Framework; the shell wires ctx.logger.log to the
 * ClientLogger. Every event carries workflow_step_id (Standing Constraint #6).
 *
 * Version: 1.0 · Session 13 · June 24, 2026
 */

import type { ClientLogger } from "./base-client";
import type { SovereignProduct, ClearanceLevel } from "./types";
import type { InferenceProvider } from "./providers/provider-registry";

interface BaseInferenceArgs {
  logger: ClientLogger;
  workflow_step_id: string;
  product: SovereignProduct;
  actor_id: string;
}

/** INFERENCE_CALL — emitted on every successful inference call. */
export function emitInferenceCall(
  args: BaseInferenceArgs & {
    provider: InferenceProvider;
    model_id: string;
    input_classification: ClearanceLevel;
    output_schema_valid: boolean;
    latency_ms: number;
  }
): void {
  args.logger.log({
    event_type: "INFERENCE_CALL",
    workflow_step_id: args.workflow_step_id,
    product: args.product,
    actor_id: args.actor_id,
    outcome: `inference_${args.provider}`,
    payload: {
      provider: args.provider,
      model_id: args.model_id,
      input_classification: args.input_classification,
      output_schema_valid: args.output_schema_valid,
      latency_ms: args.latency_ms,
    },
  });
}

/** INFERENCE_PROVIDER_FALLBACK — emitted when routing falls back to another provider. */
export function emitProviderFallback(
  args: BaseInferenceArgs & {
    intended_provider: InferenceProvider;
    actual_provider: InferenceProvider;
    fallback_reason: string;
  }
): void {
  args.logger.log({
    event_type: "INFERENCE_PROVIDER_FALLBACK",
    workflow_step_id: args.workflow_step_id,
    product: args.product,
    actor_id: args.actor_id,
    outcome: "inference_provider_fallback",
    payload: {
      intended_provider: args.intended_provider,
      actual_provider: args.actual_provider,
      fallback_reason: args.fallback_reason,
    },
  });
}

/** MODEL_HASH_MISMATCH — P1: emitted when SHA-256 verification fails (inference blocked). */
export function emitModelHashMismatch(
  args: BaseInferenceArgs & {
    model_id: string;
    expected_sha256: string;
    actual_sha256: string;
  }
): void {
  args.logger.log({
    event_type: "MODEL_HASH_MISMATCH",
    workflow_step_id: args.workflow_step_id,
    product: args.product,
    actor_id: args.actor_id,
    outcome: "model_hash_mismatch",
    payload: {
      model_id: args.model_id,
      expected_sha256: args.expected_sha256,
      actual_sha256: args.actual_sha256,
      severity: "P1",
    },
  });
}

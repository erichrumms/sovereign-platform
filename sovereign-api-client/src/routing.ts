/**
 * SOVEREIGN Platform — sovereign-api-client
 * routing.ts — data-classification-driven provider selection + the GD-10 boundary.
 *
 * GD-10 (Classification Boundary, recorded June 24, 2026, Session 14): SOVEREIGN
 * processes UNCLASSIFIED synthetic data ONLY. CUI, SECRET, and TOP_SECRET are NOT
 * authorized for processing until a formal governance decision widens the authorized
 * set. Any request above UNCLASSIFIED throws ClassificationNotAuthorizedError. The
 * Session 13 routing infrastructure (Provider B / Ollama, the CUI→local route) is
 * retained and remains demonstrable AS ARCHITECTURE — it activates by configuration
 * when authorization is granted (i.e. when AUTHORIZED_CLASSIFICATIONS widens). It does
 * not run while GD-10 is in force.
 *
 * The Session 13 routing rules (10_LocalLLM_Infrastructure.md §2.2), now GATED by GD-10:
 *   - data_classification above UNCLASSIFIED → ClassificationNotAuthorizedError (GD-10)
 *   - data_classification === "CUI" AND Ollama enabled → Provider B (Ollama)   [latent]
 *   - all other classifications (and absent → treated as UNCLASSIFIED) → Provider A
 *
 * Pure functions over ClearanceLevel — the canonical classification taxonomy (Standing
 * Constraint #2; not a separate DataClassification type).
 *
 * Version: 1.1 (GD-10 boundary) · Session 14 · June 24, 2026
 */

import type { ClearanceLevel } from "./types";
import type { InferenceProvider } from "./providers/provider-registry";

/**
 * GD-10 — the classifications authorized for processing in SOVEREIGN. UNCLASSIFIED only
 * until a governance decision widens this set. Widening this (and only this) reactivates
 * the latent CUI→Ollama route below — no other code change (Standing Constraint #3).
 */
export const AUTHORIZED_CLASSIFICATIONS: readonly ClearanceLevel[] = ["UNCLASSIFIED"];

/**
 * Thrown when a request's data_classification is not authorized for processing under
 * GD-10. The message is fixed by the governance decision and surfaced to the caller —
 * never swallowed by the routing/fallback layer.
 */
export class ClassificationNotAuthorizedError extends Error {
  constructor(public readonly classification: ClearanceLevel) {
    super(
      "This classification level is not authorized for processing in SOVEREIGN. " +
        "Contact your system administrator."
    );
    this.name = "ClassificationNotAuthorizedError";
  }
}

/** Whether a classification (absent → UNCLASSIFIED) is authorized for processing (GD-10). */
export function isClassificationAuthorized(dataClassification: ClearanceLevel | undefined): boolean {
  return AUTHORIZED_CLASSIFICATIONS.includes(dataClassification ?? "UNCLASSIFIED");
}

/**
 * GD-10 enforcement: throw ClassificationNotAuthorizedError unless the classification
 * (absent → UNCLASSIFIED) is in the authorized set. Called at the top of selectProvider
 * so an unauthorized request is rejected before any provider is chosen.
 */
export function assertClassificationAuthorized(dataClassification: ClearanceLevel | undefined): void {
  if (!isClassificationAuthorized(dataClassification)) {
    throw new ClassificationNotAuthorizedError((dataClassification ?? "UNCLASSIFIED") as ClearanceLevel);
  }
}

/**
 * Select the inference provider for a request's data classification.
 *
 * GD-10: throws ClassificationNotAuthorizedError for CUI / SECRET / TOP_SECRET. Only
 * UNCLASSIFIED (or absent) is authorized, and it routes to Provider A (Anthropic).
 */
export function selectProvider(
  dataClassification: ClearanceLevel | undefined,
  ollamaEnabled: boolean
): InferenceProvider {
  // GD-10 boundary — reject anything above UNCLASSIFIED before choosing a provider.
  assertClassificationAuthorized(dataClassification);

  // Latent Session 13 route, retained as demonstrable architecture: CUI→Ollama activates
  // by configuration when GD-10 is lifted (AUTHORIZED_CLASSIFICATIONS widens to include
  // CUI). Unreachable while GD-10 is in force — the guard above rejects CUI first.
  if (dataClassification === "CUI" && ollamaEnabled) return "ollama";
  return "anthropic";
}

/**
 * True when a CUI request wanted the local provider but Ollama was disabled — the
 * Session 13 classification-fallback signal. Retained as architecture; under GD-10 a CUI
 * request never reaches this check (selectProvider rejects it first). Reactivates when
 * GD-10 is lifted.
 */
export function isClassificationFallback(
  dataClassification: ClearanceLevel | undefined,
  ollamaEnabled: boolean
): boolean {
  return dataClassification === "CUI" && !ollamaEnabled;
}

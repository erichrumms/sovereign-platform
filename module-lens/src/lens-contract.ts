/**
 * SOVEREIGN Platform — module-lens
 * lens-contract.ts — the LENS Governance Explainer contract (PR-LENS-001).
 *
 * Binds the registered prompt to its runtime use and defines the model INPUT shape
 * (the prompt's "Input" section). The OUTPUT shape — LensExplanation — and its
 * validator are CANONICAL and live in @sovereign/data (Standing Constraint #2: no
 * shared entity field-name divergence; do not redefine here). This file re-exports
 * them for module-local convenience only.
 *
 * The explanation is ADVISORY/explanatory: LENS shows it; it takes no action. It is
 * validated BEFORE display (spec §2.1 / prompt "Output format — STRICT").
 *
 * Version: 1.0 · Session 8 · June 22, 2026
 */

import {
  validateLensExplanation,
  type LensExplanation,
  type LensExplanationConfidence,
} from "@sovereign/data";

import type { LensSourceDocId } from "./source-documents";

// Canonical output type + validator — re-exported, never redefined.
export { validateLensExplanation };
export type { LensExplanation, LensExplanationConfidence };

/** PR-LENS-001 registry binding — stamped onto Logger events as prompt provenance. */
export const PR_LENS_001 = {
  registryId: "PR-LENS-001",
  file: "prompts/explainer-system-v1.0.md",
  promptVersion: "v1.0",
} as const;

/**
 * The user/context framing supplied to lens-explainer (prompt: `userContext`).
 * For framing only — never used to expose data the user is not entitled to.
 */
export interface LensUserContext {
  /** The user's SOVEREIGN role (ctx.auth.user.role). */
  role: string;
  /** The surface the question was asked from (e.g. the current route). */
  surface: string;
}

/** A source document as supplied to the model (prompt: `sourceDocuments` element). */
export interface LensSourceContext {
  id: LensSourceDocId;
  title: string;
  content: string;
}

/**
 * The single JSON object sent to lens-explainer as the user message
 * (prompt "Input"): the question, the supplied source documents, and user context.
 */
export interface ExplanationInput {
  question: string;
  sourceDocuments: LensSourceContext[];
  userContext: LensUserContext;
}

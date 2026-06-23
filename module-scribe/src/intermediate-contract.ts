/**
 * SOVEREIGN Platform — module-scribe
 * intermediate-contract.ts — the SCRIBE intermediate-mode contract.
 *
 * The two intermediate modes — `synthesis` and `framing` — produce INTERMEDIATE PROSE
 * the human carries forward into a drafting mode (companion suite spec §3.4 / §3.5).
 * They have NO product intake schema (their ModeOutputSchema is null in modes.ts), so
 * — unlike the six drafting modes — there is NO product-schema validation and NO Export
 * gate. The prose is a transient review artifact; it is not routed to a SOVEREIGN
 * product. (D2 done condition: "produce intermediate prose for human carry-forward
 * only … Do not attempt schema validation against a product schema.")
 *
 * Prompt: these modes run under the ALREADY-APPROVED PR-SCRIBE-001 drafting prompt,
 * whose "What you produce" section explicitly scopes them: "synthesis / framing ->
 * intermediate prose for the human to carry into a drafting mode (no product intake
 * schema)." No new prompt is registered this session; the dedicated PR-SCRIBE-002/003
 * prompts remain a later Claude Chat deliverable (swapping to them later is a registry
 * binding change, not a rewrite — Standing Constraint #3).
 *
 * Version: 1.0 · Session 8 · June 22, 2026
 */

import type { StyleProfile } from "@sovereign/data";

import type { SCRIBEMode } from "../../sovereign-shell/shell-contract";

/** PR-SCRIBE-001 registry binding — these modes run under the approved drafting prompt. */
export const PR_SCRIBE_001_INTERMEDIATE = {
  registryId: "PR-SCRIBE-001",
  file: "prompts/drafting-system-v1.0.md",
  promptVersion: "v1.0",
} as const;

/** The two intermediate modes (producesProductIntake: false in modes.ts). */
export type IntermediateMode = "synthesis" | "framing";

export const INTERMEDIATE_MODES: readonly IntermediateMode[] = ["synthesis", "framing"];

/** Narrow an arbitrary SCRIBEMode to the intermediate subset. */
export function isIntermediateMode(mode: SCRIBEMode): mode is IntermediateMode {
  return (INTERMEDIATE_MODES as readonly string[]).includes(mode);
}

/** Plain-language framing of what each intermediate mode produces (UI + static tier). */
export const INTERMEDIATE_MODE_PURPOSE: Record<IntermediateMode, string> = {
  synthesis:
    "Synthesize captured material into a coherent brief — key themes, conflicting claims, and a recommended framing — before you draft.",
  framing:
    "Frame workflow pre-work before a FLOWPATH session — unofficial process paths, decision points, handoff friction, and who actually knows how the work is done.",
};

/**
 * The intermediate result: prose the human carries forward. NOT a @sovereign/data
 * entity and NOT validated against any product schema — it never crosses a product
 * boundary. The serving tier rides on the IntermediateOutcome wrapper (engine), not
 * on this object.
 */
export interface IntermediateResult {
  mode: IntermediateMode;
  /** The intermediate prose for the human to review and carry into a drafting mode. */
  prose: string;
}

/** The structured input for one intermediate pass (transient — no SCRIBE data store). */
export interface IntermediateInput {
  mode: IntermediateMode;
  /** The raw notes / transcript / source text to synthesize or frame. */
  capturedMaterial: string;
  /** Optional Style DNA — forwarded to the prompt to match the user's voice. */
  styleProfile?: StyleProfile;
  /** Present if initiated from a SOVEREIGN product context. */
  context?: { workflowStepId?: string };
}

/**
 * Minimal guard: the intermediate output must be non-empty prose. This is a
 * tier-selection check (empty → fall back), NOT product-schema validation — there is
 * no product schema for these modes by design (D2 done condition).
 */
export function hasUsableProse(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

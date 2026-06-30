/**
 * SOVEREIGN Platform — module-aria
 * arc-types.ts — ARC domain types shared by the dependency-model engine (arc-engine.ts) and the
 * Regulatory Impact Modeler (ArcImpactModeler.tsx). Stage 6, Session 25 (D1).
 *
 * ARC — Adaptive Regulatory Change engine. ARC answers "if this regulation changes, what breaks?"
 * It maintains a dependency model of which platform items (workflows, CLEAR rules, TRACER chains,
 * SCRIBE document templates) reference each regulatory provision, and — given a proposed change to
 * one of the four regulatory sources — projects which dependent items would be affected and at what
 * severity (docs/16 §6).
 *
 * ARC MODELS; IT DOES NOT DECIDE OR PREDICT. Like CLEAR and TRACER, ARC is fully deterministic —
 * the SAME proposed change + the SAME dependency snapshot always produces the SAME impact report.
 * There is NO randomness, NO LLM call, and NO sovereign-api-client call anywhere in this path
 * (docs/16 §1/§3/§6, Constraint #1). ARC's outputs are PROJECTIONS against the current dependency
 * map, not certainties and not regulatory predictions — every consumer must label them as such
 * (ARIA-specific Gap 6, docs/16 §8). This distinguishes ARC from CLEAR (whose findings cite a rule
 * directly) and TRACER (whose nodes cite an existing record): an ARC finding is a modeled
 * consequence of a hypothetical change.
 *
 * The four regulatory sources are exactly the four CLEAR loads (RegulatorySourceId, clear-types) —
 * ARC introduces no new sources (docs/16 §6; the initial build reuses CLEAR's framework).
 *
 * Gap 5: every human-facing string a component renders from these types is plain prose.
 *
 * Version: 1.0 · Session 25 (D1) · June 29, 2026
 */

import type { RegulatorySourceId } from "./clear-types";

/**
 * The kinds of platform item ARC's dependency model tracks (docs/16 §6). Each kind is something the
 * platform already builds; ARC records which regulatory provision each one references.
 */
export type DependentItemKind = "workflow" | "clear_rule" | "tracer_chain" | "scribe_template";

/**
 * How tightly a dependent item is coupled to the regulatory provision it references. The coupling —
 * not the engine's guesswork — is what fixes a deterministic base severity (see severityForCoupling):
 *   - "enforces"      — the item directly implements or enforces the provision (e.g. a CLEAR rule that
 *                       checks an A-11 requirement). A substantive change makes it break.
 *   - "references"    — the item relies on the provision but does not enforce it (e.g. a SCRIBE
 *                       template formatted to the provision). A substantive change needs review.
 *   - "informational" — the item merely cites the provision as authority (e.g. a TRACER chain). A
 *                       change is informational only.
 */
export type DependencyCoupling = "enforces" | "references" | "informational";

/**
 * The scope of a proposed regulatory change. A reviewer declares it; the engine treats it
 * deterministically. A "clarifying" change (editorial / non-substantive) downshifts every item's
 * severity by one level relative to a "substantive" change (one that alters the provision's
 * requirements). This is a modeling assumption, stated plainly in the UI — not a prediction.
 */
export type ChangeScope = "substantive" | "clarifying";

/**
 * The modeled severity ARC assigns to one dependent item under a proposed change (docs/16 §6):
 *   - "breaking"    — the item would become non-compliant or non-functional.
 *   - "significant" — the item needs review but may still function.
 *   - "minor"       — informational only; no action required.
 */
export type ImpactSeverity = "breaking" | "significant" | "minor";

/** The overall severity of an impact report — the highest per-item severity, or "none" when nothing is affected. */
export type OverallSeverity = ImpactSeverity | "none";

/**
 * One entry in ARC's dependency model: a platform item bound to the regulatory provision it
 * references. The model is a typed, committed registry (no runtime fs read — bundle-safe, the same
 * discipline CLEAR's REGULATORY_SOURCES follows); a Node-side test asserts every entry binds to a
 * regulatory source that exists on disk.
 */
export interface DependentItem {
  /** Stable id (e.g. a CLEAR rule_id like "R-A11-1", or a workflow id like "WF-CONG-SUBMIT"). */
  item_id: string;
  kind: DependentItemKind;
  /** Plain-prose name of the item (Gap 5). */
  label: string;
  /** The regulatory source this item references — one of CLEAR's four (no new sources, docs/16 §6). */
  source_id: RegulatorySourceId;
  /** Plain-prose provision within the source this item relies on (e.g. "Section 51.3 — justification of estimates"). */
  provision: string;
  coupling: DependencyCoupling;
}

/**
 * A proposed regulatory change a reviewer enters into the Regulatory Impact Modeler. `description`
 * is free text (what the change is); `affected_source` is which of the four regulatory sources it
 * amends; `change_scope` is whether it is substantive or clarifying (defaults to substantive at the
 * engine boundary). ARC models the impact of this hypothetical — it does not assess whether the
 * change will happen.
 */
export interface ProposedRegulatoryChange {
  /** Optional stable id for the change; when absent the workflow step id is derived from the source. */
  change_id?: string;
  /** Free-text description of the proposed change (Gap 5). */
  description: string;
  affected_source: RegulatorySourceId;
  change_scope: ChangeScope;
}

/**
 * One dependent item as it appears in an impact report: the modeled severity for this item under the
 * proposed change, plus a plain-prose statement of what would be affected and why. The statement is
 * always framed as a projection ("would", "is modeled as") — never as a certainty (ARIA Gap 6).
 */
export interface ImpactedItem {
  item_id: string;
  kind: DependentItemKind;
  /** Plain-prose item name (Gap 5). */
  label: string;
  source_id: RegulatorySourceId;
  /** The provision the item references within the amended source (Gap 5). */
  provision: string;
  coupling: DependencyCoupling;
  severity: ImpactSeverity;
  /** Plain prose: what would be affected and why, framed as a model projection (Gap 5 / ARIA Gap 6). */
  impact_statement: string;
}

/**
 * The deterministic result of one ARC impact-modeling run (docs/16 §6). For a given (change,
 * modeled_at) the `dependent_items`, `overall_severity`, and every `impact_statement` are always
 * identical — the dependency snapshot is the committed model. `modeled_at` is supplied by the caller
 * so the core stays referentially transparent (the same convention CLEAR and TRACER follow).
 */
export interface ImpactReport {
  /** Echo of the reviewer's free-text change description (Gap 5). */
  change_description: string;
  affected_source: RegulatorySourceId;
  /** Plain-prose title of the affected regulatory source (Gap 5). */
  affected_source_title: string;
  change_scope: ChangeScope;
  /** Every dependent item the change would affect, ordered breaking → significant → minor. */
  dependent_items: ImpactedItem[];
  overall_severity: OverallSeverity;
  /** ISO 8601 — supplied by the caller so the core modeling stays deterministic. */
  modeled_at: string;
}

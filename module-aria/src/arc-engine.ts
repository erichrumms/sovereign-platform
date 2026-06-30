/**
 * SOVEREIGN Platform — module-aria
 * arc-engine.ts — the ARC deterministic dependency-model + impact-modeling core (Stage 6, Session 25 · D1).
 *
 * ARC maintains a dependency model — which platform workflows, CLEAR rules, TRACER chains, and SCRIBE
 * document templates reference each regulatory provision — and, given a proposed change to one of the
 * four regulatory sources, projects which dependent items would be affected and at what severity
 * (docs/16 §6). The result is fully deterministic: the SAME proposed change + the SAME dependency
 * snapshot always produces the SAME impacted items, the SAME per-item severity, and the SAME overall
 * severity. There is NO randomness, NO LLM call, and NO sovereign-api-client call anywhere in this
 * engine (docs/16 §1/§3/§6, Constraint #1) — ARC's authority rests on that, exactly as CLEAR's and
 * TRACER's do. The only non-deterministic value a report carries — `modeled_at` — is supplied by the
 * caller, so the core stays referentially transparent and testable.
 *
 * ARC MODELS; IT DOES NOT DECIDE OR PREDICT. Every impact statement is a PROJECTION against the
 * current dependency map, framed as "would" / "is modeled as" — never a certainty, never a forecast
 * of whether the change will be adopted. The Regulatory Impact Modeler labels this visually
 * (ARIA-specific Gap 6, docs/16 §8); the engine never asserts a finding as fact.
 *
 * DEPENDENCY MODEL (D1): the model lives on disk only insofar as the four regulatory SOURCES it binds
 * to do (module-aria/data/regulatory-sources/, reused from CLEAR — no new sources, docs/16 §6).
 * module-aria is a browser ESM module with no Node types, so — exactly like CLEAR's REGULATORY_SOURCES
 * — this engine carries the typed DEPENDENCY_MODEL registry and does NOT read the filesystem at
 * runtime. A Node-side test (tests/arc-engine.test.ts) asserts every model entry binds to a
 * regulatory source that exists on disk, proving the model is authoritative at startup.
 *
 * LOGGER EVENTS — Python only (D3), following the TRACER precedent. The two ARC event types
 * (ARIA_IMPACT_MODELED, ARIA_ADAPTATION_DECISION) are added to sovereign_logger.py only. They are NOT
 * in shell-contract.ts `SovereignEventType`, so `ctx.logger.log()` cannot accept them from the
 * TypeScript layer without a shell-contract change — which is out of scope this session (no GD; docs/16
 * §6/§7 STOP discipline). This engine therefore emits NOTHING from TS: it is a set of PURE functions
 * over the model and the proposed change; a Python-side / CLI emitter records the events. (Recorded in
 * the Session 25 handoff.)
 *
 * Version: 1.0 · Session 25 (D1) · June 29, 2026
 */

import { REGULATORY_SOURCES } from "./clear-engine";
import type { RegulatorySourceId } from "./clear-types";
import type {
  ChangeScope,
  DependencyCoupling,
  DependentItem,
  ImpactReport,
  ImpactSeverity,
  ImpactedItem,
  OverallSeverity,
  ProposedRegulatoryChange,
} from "./arc-types";

/** The deterministic governance agent identity on every ARC Logger event (Agent Identity Standard). */
export const ARIA_RULES_ENGINE_AGENT_ID = "aria.rules-engine";

const SOURCE_TITLE: Record<RegulatorySourceId, string> = REGULATORY_SOURCES.reduce(
  (acc, s) => {
    acc[s.id] = s.title;
    return acc;
  },
  {} as Record<RegulatorySourceId, string>
);

/**
 * ARC's dependency model (D1): which platform items reference each regulatory provision. This is the
 * committed snapshot the impact modeler projects against — the same role CLEAR's REGULATORY_SOURCES
 * registry plays. It binds only to the four regulatory sources CLEAR already loads (docs/16 §6); the
 * CLEAR-rule entries use the real rule_ids the CLEAR engine evaluates (clear-engine.ts), so a change
 * ARC models maps to the exact rule CLEAR enforces.
 */
export const DEPENDENCY_MODEL: readonly DependentItem[] = [
  // ── OMB Circular A-11 ──────────────────────────────────────────────────────────────────────
  {
    item_id: "R-A11-1",
    kind: "clear_rule",
    label: "CLEAR rule — A-11 justification narrative required",
    source_id: "omba11",
    provision: "Section 51.3 — justification of estimates",
    coupling: "enforces",
  },
  {
    item_id: "R-A11-2",
    kind: "clear_rule",
    label: "CLEAR rule — exhibit type declared for A-11 format matching",
    source_id: "omba11",
    provision: "Section 51 — exhibit formats",
    coupling: "references",
  },
  {
    item_id: "R-A11-3",
    kind: "clear_rule",
    label: "CLEAR rule — data-quality threshold for budget materials",
    source_id: "omba11",
    provision: "Section 51 — data quality for budget submissions",
    coupling: "enforces",
  },
  {
    item_id: "WF-CONG-SUBMIT",
    kind: "workflow",
    label: "Congressional submission workflow",
    source_id: "omba11",
    provision: "Section 22 — congressional justification materials",
    coupling: "references",
  },
  {
    item_id: "TPL-A11-EXHIBIT",
    kind: "scribe_template",
    label: "SCRIBE template — A-11 budget exhibit",
    source_id: "omba11",
    provision: "Section 51 — exhibit formats",
    coupling: "references",
  },
  {
    item_id: "TC-DECISION",
    kind: "tracer_chain",
    label: "TRACER decision chain — decision to governing regulation",
    source_id: "omba11",
    provision: "Section 51.3 — justification of estimates",
    coupling: "informational",
  },
  // ── Evidence Act ───────────────────────────────────────────────────────────────────────────
  {
    item_id: "R-EV-1",
    kind: "clear_rule",
    label: "CLEAR rule — reported conclusion cites an evidence basis",
    source_id: "evidence-act",
    provision: "Title I — evidence-building requirements",
    coupling: "enforces",
  },
  {
    item_id: "TPL-EVAL-REPORT",
    kind: "scribe_template",
    label: "SCRIBE template — evaluation findings report",
    source_id: "evidence-act",
    provision: "Title I — evaluation and learning agenda",
    coupling: "references",
  },
  // ── Anti-Deficiency Act ────────────────────────────────────────────────────────────────────
  {
    item_id: "R-ADA-1",
    kind: "clear_rule",
    label: "CLEAR rule — obligation covered by available budget authority",
    source_id: "anti-deficiency-act",
    provision: "31 U.S.C. §1341 — obligation authority limits",
    coupling: "enforces",
  },
  {
    item_id: "R-ADA-2",
    kind: "clear_rule",
    label: "CLEAR rule — appropriation and availability period stated",
    source_id: "anti-deficiency-act",
    provision: "31 U.S.C. §1341 — availability of appropriations",
    coupling: "references",
  },
  {
    item_id: "WF-OBLIGATION",
    kind: "workflow",
    label: "Obligation approval workflow",
    source_id: "anti-deficiency-act",
    provision: "31 U.S.C. §1341 — obligation authority limits",
    coupling: "enforces",
  },
  {
    item_id: "TC-OBLIGATION",
    kind: "tracer_chain",
    label: "TRACER obligation chain — obligation to program to objective",
    source_id: "anti-deficiency-act",
    provision: "31 U.S.C. §1341 — obligation authority limits",
    coupling: "informational",
  },
  // ── DoD PPBE Reform ────────────────────────────────────────────────────────────────────────
  {
    item_id: "R-PPBE-1",
    kind: "clear_rule",
    label: "CLEAR rule — output aligned to a PPBE phase",
    source_id: "dod-ppbe-reform",
    provision: "PPBE Reform guidance — phase alignment",
    coupling: "enforces",
  },
  {
    item_id: "WF-PPBE-PHASE",
    kind: "workflow",
    label: "PPBE phase-transition workflow",
    source_id: "dod-ppbe-reform",
    provision: "PPBE Reform guidance — phase transition timing",
    coupling: "references",
  },
];

/**
 * "Load" the dependency model at startup. Resolving the typed registry IS the load — deterministic,
 * synchronous, no filesystem access (bundle-safe; the same discipline as CLEAR's loadRegulatorySources).
 * Returns a defensive copy so no caller can mutate the model.
 */
export function loadDependencyModel(): DependentItem[] {
  return DEPENDENCY_MODEL.map((d) => ({ ...d }));
}

/** Every dependent item bound to one regulatory source, in committed model order (deterministic). */
export function dependentItemsForSource(sourceId: RegulatorySourceId): DependentItem[] {
  return DEPENDENCY_MODEL.filter((d) => d.source_id === sourceId).map((d) => ({ ...d }));
}

/** Per-change ARC workflow step id — every ARC record for one modeling run shares it (Constraint #6). */
export function arcWorkflowStep(change: ProposedRegulatoryChange): string {
  return `aria-arc-${change.change_id ?? change.affected_source}`;
}

// ── Deterministic severity scoring ────────────────────────────────────────────────────────────
// Severity is a pure function of (how tightly the item is coupled to the provision, how substantive
// the change is). A substantive change maps coupling straight through: enforces → breaking,
// references → significant, informational → minor. A clarifying (editorial / non-substantive) change
// downshifts every item one level, floored at minor. No inference, no randomness — the coupling is a
// committed property of the dependency model and the scope is declared by the reviewer.

const SUBSTANTIVE_SEVERITY: Record<DependencyCoupling, ImpactSeverity> = {
  enforces: "breaking",
  references: "significant",
  informational: "minor",
};

const DOWNSHIFT: Record<ImpactSeverity, ImpactSeverity> = {
  breaking: "significant",
  significant: "minor",
  minor: "minor",
};

const SEVERITY_RANK: Record<OverallSeverity, number> = {
  none: 0,
  minor: 1,
  significant: 2,
  breaking: 3,
};

/** The modeled severity for one item: coupling base, downshifted one level for a clarifying change. */
export function severityForCoupling(
  coupling: DependencyCoupling,
  scope: ChangeScope
): ImpactSeverity {
  const base = SUBSTANTIVE_SEVERITY[coupling];
  return scope === "clarifying" ? DOWNSHIFT[base] : base;
}

/** Plain-prose consequence phrase for a severity (Gap 5) — always framed as a projection. */
function consequenceFor(severity: ImpactSeverity): string {
  switch (severity) {
    case "breaking":
      return "would become non-compliant or stop functioning until it is updated";
    case "significant":
      return "would need review and may need updating, but could still function in the meantime";
    case "minor":
      return "would be informational only — no action is required";
  }
}

/** Plain-prose coupling phrase for an impact statement (Gap 5). */
function couplingPhrase(coupling: DependencyCoupling): string {
  switch (coupling) {
    case "enforces":
      return "directly enforces";
    case "references":
      return "relies on";
    case "informational":
      return "cites";
  }
}

/**
 * Build one impacted item, including its plain-prose, projection-framed impact statement. The
 * statement names the item, what it references, and the modeled consequence — and says "would" /
 * "is modeled as" so a reviewer reads it as a projection, not a certainty (ARIA Gap 6).
 */
function impactedItem(item: DependentItem, scope: ChangeScope, sourceTitle: string): ImpactedItem {
  const severity = severityForCoupling(item.coupling, scope);
  const impact_statement =
    `${item.label} ${couplingPhrase(item.coupling)} ${sourceTitle} (${item.provision}). ` +
    `If that provision changes, this item ${consequenceFor(severity)}. ` +
    `This is modeled as a ${severity} impact, based on the platform's current dependency map.`;
  return {
    item_id: item.item_id,
    kind: item.kind,
    label: item.label,
    source_id: item.source_id,
    provision: item.provision,
    coupling: item.coupling,
    severity,
    impact_statement,
  };
}

/**
 * Model the operational impact of a proposed regulatory change (docs/16 §6). Identifies every
 * dependent item bound to the amended source, scores each one's severity deterministically, orders
 * them breaking → significant → minor (stable within a severity by committed model order), and
 * reports the overall severity (the highest per-item severity, or "none" when nothing depends on the
 * source). Fully deterministic: for a given (change, modeledAt) the report is always identical. No
 * Logger emission and no side effects (the two ARC event types are Python-only; see the file header).
 *
 * @param modeledAt ISO 8601 timestamp supplied by the caller (keeps the core deterministic).
 */
export function modelImpact(change: ProposedRegulatoryChange, modeledAt: string): ImpactReport {
  const sourceTitle = SOURCE_TITLE[change.affected_source];
  const dependent_items = dependentItemsForSource(change.affected_source)
    .map((item) => impactedItem(item, change.change_scope, sourceTitle))
    // Order by severity (breaking first); the filter above preserves committed model order as the
    // stable tie-break, so the ordering is fully deterministic.
    .sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);

  const overall_severity: OverallSeverity = dependent_items.reduce<OverallSeverity>(
    (max, item) => (SEVERITY_RANK[item.severity] > SEVERITY_RANK[max] ? item.severity : max),
    "none"
  );

  return {
    change_description: change.description,
    affected_source: change.affected_source,
    affected_source_title: sourceTitle,
    change_scope: change.change_scope,
    dependent_items,
    overall_severity,
    modeled_at: modeledAt,
  };
}

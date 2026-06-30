/**
 * SOVEREIGN Platform — module-aria
 * ArcImpactModeler.tsx — ARC Regulatory Impact Modeler (Stage 6, Session 25 · D2).
 *
 * The single ARC panel (docs/16 §6). A reviewer (1) enters a proposed regulatory change — a free-text
 * description and which of the four regulatory sources it amends, plus whether it is substantive or
 * clarifying — and (2) sees ARC's impact report: every dependent item the change would affect, each
 * labeled breaking / significant / minor in plain prose, ordered most-severe first. For a high-severity
 * report the panel surfaces (3) two follow-on recommendations: route to COUNSEL for an adaptation
 * decision, and route to NEXUS as an action item.
 *
 * ARC MODELS; IT DOES NOT DECIDE OR PREDICT. Every finding is a PROJECTION against the platform's
 * current dependency map — not a certainty (unlike a CLEAR compliance finding, which cites a rule
 * directly) and not a forecast of whether the change will be adopted (unlike a TRACER node, which
 * cites an existing record). This panel makes that explicit on every finding: a permanent blue
 * determinism notice (Category 2) at the top, and a distinct "Modeled projection" marker plus
 * projection-framed prose on every impact card (ARIA-specific Gap 6, docs/16 §8).
 *
 * Reuses the CLEAR presentation primitives (SeverityBadge) and the ARIA banners (GovernanceBanner,
 * contentCardStyle) rather than introducing parallel components (docs/16 §8) — the same discipline
 * TRACER followed. Impact modeling is fully deterministic and runs in arc-engine.ts; this component
 * holds no rule logic. It emits NO Logger events: the two ARC event types (ARIA_IMPACT_MODELED,
 * ARIA_ADAPTATION_DECISION) are Python-only (D3, TRACER precedent; see arc-engine.ts header).
 *
 * ROUTING (D2): the COUNSEL and NEXUS follow-on actions are UI affordances that SURFACE a
 * recommendation only. Actual cross-module routing would require either a shell-contract change or a
 * COUNSEL/NEXUS data-model change (COUNSEL Decision Records carry no regulation_basis field; NEXUS
 * has no ARC inbound) — both out of scope this session (no GD). The buttons therefore reveal a
 * plain-prose recommendation; they do not call into COUNSEL or NEXUS. (Recorded in the handoff.)
 *
 * Version: 1.0 · Session 25 (D2) · June 29, 2026
 */

import { useMemo, useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { GovernanceBanner, contentCardStyle, sectionHeadingStyle, bodyTextStyle } from "./banners";
import { SeverityBadge } from "./clear-ui";
import type { ClearSeverity, RegulatorySourceId } from "./clear-types";
import { REGULATORY_SOURCES } from "./clear-engine";
import { modelImpact } from "./arc-engine";
import type {
  ChangeScope,
  DependentItemKind,
  ImpactReport,
  ImpactSeverity,
  ImpactedItem,
  OverallSeverity,
} from "./arc-types";

export interface ArcImpactModelerProps {
  ctx: SovereignShellContext;
}

const CHANGE_SCOPES: Array<{ id: ChangeScope; label: string; hint: string }> = [
  { id: "substantive", label: "Substantive", hint: "Changes what the provision requires." },
  { id: "clarifying", label: "Clarifying", hint: "Editorial only — does not change requirements." },
];

/** Plain-prose noun for each dependent-item kind (Gap 5). */
const KIND_LABEL: Record<DependentItemKind, string> = {
  workflow: "Platform workflow",
  clear_rule: "CLEAR rule",
  tracer_chain: "TRACER chain",
  scribe_template: "SCRIBE template",
};

/** Map an ARC severity to the shared SeverityBadge tone (reuse, not a parallel component — docs/16 §8). */
const SEVERITY_TONE: Record<ImpactSeverity, ClearSeverity> = {
  breaking: "red",
  significant: "amber",
  minor: "green",
};

const SEVERITY_LABEL: Record<ImpactSeverity, string> = {
  breaking: "Breaking",
  significant: "Significant",
  minor: "Minor",
};

const OVERALL_LABEL: Record<OverallSeverity, string> = {
  breaking: "Breaking impact",
  significant: "Significant impact",
  minor: "Minor impact",
  none: "No modeled impact",
};

/** A high-severity report (breaking or significant) is the one that surfaces COUNSEL/NEXUS routing. */
function isHighSeverity(severity: OverallSeverity): boolean {
  return severity === "breaking" || severity === "significant";
}

/**
 * The permanent ARC determinism guardrail (Category 2 — blue, never dismissible). Its exact wording is
 * a governance guardrail: ARC models impact against the current dependency map and does not predict
 * regulatory outcomes or make adaptation decisions (docs/16 §1/§6/§8).
 */
export function ArcDeterminismNotice(): JSX.Element {
  return (
    <GovernanceBanner label="How ARC works:">
      ARC models the impact of proposed regulatory changes against the platform's current dependency
      map. It does not predict regulatory outcomes or make adaptation decisions — those remain human
      judgment calls informed by this model.
    </GovernanceBanner>
  );
}

export function ArcImpactModeler({ ctx: _ctx }: ArcImpactModelerProps): JSX.Element {
  const [affectedSource, setAffectedSource] = useState<RegulatorySourceId>("omba11");
  const [description, setDescription] = useState<string>("");
  const [scope, setScope] = useState<ChangeScope>("substantive");
  const [report, setReport] = useState<ImpactReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sources = useMemo(() => REGULATORY_SOURCES.map((s) => ({ ...s })), []);

  const runModel = (): void => {
    setError(null);
    const trimmed = description.trim();
    if (trimmed.length === 0) {
      setError("Describe the proposed regulatory change before modeling its impact.");
      setReport(null);
      return;
    }
    // The timestamp is the only non-deterministic value; the engine core stays pure (it is passed in).
    const modeledAt = new Date().toISOString();
    setReport(
      modelImpact(
        { description: trimmed, affected_source: affectedSource, change_scope: scope },
        modeledAt
      )
    );
  };

  return (
    <div data-testid="arc-impact-modeler">
      {/* Category 2 — permanent governance guardrail (blue). */}
      <ArcDeterminismNotice />

      {/* Step 1 — describe the proposed change. */}
      <section style={contentCardStyle} data-testid="arc-input">
        <h2 style={sectionHeadingStyle}>Model a proposed regulatory change</h2>
        <p style={bodyTextStyle}>
          Describe a proposed change to one of the platform's regulatory sources. ARC projects which
          platform items would be affected and how severely, based on the current dependency map.
        </p>

        <label style={fieldLabelStyle} htmlFor="arc-source-select">
          Which regulatory source does the change amend?
        </label>
        <select
          id="arc-source-select"
          data-testid="arc-source-select"
          value={affectedSource}
          onChange={(e) => setAffectedSource(e.target.value as RegulatorySourceId)}
          style={selectStyle}
        >
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>

        <label style={fieldLabelStyle} htmlFor="arc-description">
          What is the proposed change?
        </label>
        <textarea
          id="arc-description"
          data-testid="arc-description"
          aria-label="proposed regulatory change description"
          placeholder="e.g. OMB Circular A-11 Section 51.3 is revised to require a quantified benefit narrative on every budget exhibit."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={textareaStyle}
        />

        <span style={fieldLabelStyle}>How substantive is the change?</span>
        <div style={scopeRowStyle} role="radiogroup" aria-label="Change scope">
          {CHANGE_SCOPES.map((s) => {
            const active = s.id === scope;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={active}
                data-testid={`arc-scope-${s.id}`}
                onClick={() => setScope(s.id)}
                style={{ ...scopeButtonStyle, ...(active ? scopeButtonActiveStyle : null) }}
                title={s.hint}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <p style={{ ...bodyTextStyle, fontSize: 13, color: "#64748b", margin: "0 0 12px" }}>
          {CHANGE_SCOPES.find((s) => s.id === scope)!.hint}
        </p>

        {error ? (
          <p role="alert" style={errorStyle} data-testid="arc-error">
            {error}
          </p>
        ) : null}

        <button type="button" onClick={runModel} style={primaryBtnStyle} data-testid="arc-run">
          Model impact
        </button>
      </section>

      {/* Steps 2 + 3 — the impact report and any high-severity routing recommendations. */}
      {report ? (
        <ImpactReportView report={report} />
      ) : (
        <section style={contentCardStyle} data-testid="arc-empty">
          <p style={{ ...bodyTextStyle, margin: 0, color: "#64748b" }}>
            Enter a proposed change above and select “Model impact” to see its projected effect.
          </p>
        </section>
      )}
    </div>
  );
}

/** The impact report: a projection summary, one card per affected item, then routing recommendations. */
function ImpactReportView({ report }: { report: ImpactReport }): JSX.Element {
  const high = isHighSeverity(report.overall_severity);
  return (
    <div data-testid="arc-report" data-overall={report.overall_severity}>
      {/* Projection summary — Category 3 substantive content, but framed as a model output (Gap 6). */}
      <section style={contentCardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
          <h2 style={{ ...sectionHeadingStyle, margin: 0 }}>Projected impact</h2>
          {report.overall_severity === "none" ? (
            <SeverityBadge severity="green" label={OVERALL_LABEL.none} />
          ) : (
            <SeverityBadge
              severity={SEVERITY_TONE[report.overall_severity]}
              label={OVERALL_LABEL[report.overall_severity]}
            />
          )}
          <ProjectionMarker />
        </div>
        <p style={bodyTextStyle}>
          If <strong>{report.affected_source_title}</strong> is amended as described, ARC models the
          effect on {itemCountPhrase(report.dependent_items.length)} in the platform's current
          dependency map. This is a projection based on that map — not a certainty, and not a
          prediction of whether the change will be adopted.
        </p>
        <p style={{ ...bodyTextStyle, margin: 0, color: "#475569", fontSize: 13 }}>
          Proposed change: “{report.change_description}” ({scopeNoun(report.change_scope)} change)
        </p>
      </section>

      {/* One card per affected item — each explicitly a modeled projection (Gap 6). */}
      {report.dependent_items.length === 0 ? (
        <section style={contentCardStyle} data-testid="arc-no-items">
          <p style={{ ...bodyTextStyle, margin: 0 }}>
            No platform item in the current dependency map references {report.affected_source_title}.
            ARC models no impact for this change.
          </p>
        </section>
      ) : (
        <section style={contentCardStyle}>
          <h3 style={{ ...sectionHeadingStyle }}>Affected items</h3>
          <ol style={itemListStyle}>
            {report.dependent_items.map((item) => (
              <li key={item.item_id} style={{ listStyle: "none" }}>
                <ImpactItemCard item={item} />
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Follow-on recommendations — only for a high-severity report. UI affordances only (D2). */}
      {high ? <RoutingRecommendations report={report} /> : null}
    </div>
  );
}

/** One affected item, rendered so its severity AND its projection nature are both explicit (Gap 6). */
function ImpactItemCard({ item }: { item: ImpactedItem }): JSX.Element {
  return (
    <div style={itemCardStyle} data-testid={`arc-item-${item.item_id}`} data-severity={item.severity}>
      <div style={itemHeaderStyle}>
        <span style={itemTitleStyle}>{item.label}</span>
        <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <SeverityBadge severity={SEVERITY_TONE[item.severity]} label={SEVERITY_LABEL[item.severity]} />
          <ProjectionMarker />
        </span>
      </div>
      <p style={itemKindStyle}>
        {KIND_LABEL[item.kind]} · references {item.provision}
      </p>
      <p style={itemStatementStyle}>{item.impact_statement}</p>
    </div>
  );
}

/**
 * The two follow-on routing recommendations for a high-severity report. These SURFACE a
 * recommendation only — selecting one reveals plain-prose guidance; no cross-module routing is
 * performed (it would require a shell-contract or COUNSEL/NEXUS data-model change — out of scope, D2).
 */
function RoutingRecommendations({ report }: { report: ImpactReport }): JSX.Element {
  const [shown, setShown] = useState<"counsel" | "nexus" | null>(null);
  return (
    <section style={contentCardStyle} data-testid="arc-routing">
      <h3 style={sectionHeadingStyle}>Recommended follow-on actions</h3>
      <p style={bodyTextStyle}>
        This change is modeled as {OVERALL_LABEL[report.overall_severity].toLowerCase()}. ARC
        recommends recording an adaptation decision and tracking the resulting action items. ARC does
        not take these actions — it surfaces the recommendation for a human to act on.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
        <button
          type="button"
          data-testid="arc-route-counsel"
          onClick={() => setShown((s) => (s === "counsel" ? null : "counsel"))}
          style={secondaryBtnStyle}
        >
          Route to COUNSEL for adaptation decision
        </button>
        <button
          type="button"
          data-testid="arc-route-nexus"
          onClick={() => setShown((s) => (s === "nexus" ? null : "nexus"))}
          style={secondaryBtnStyle}
        >
          Route to NEXUS as action item
        </button>
      </div>

      {shown === "counsel" ? (
        <div style={recommendationStyle} data-testid="arc-rec-counsel">
          Recommendation: open COUNSEL and frame an adaptation decision for this change to{" "}
          {report.affected_source_title}, citing the {report.dependent_items.length} affected items
          above as the basis. Routing is a manual step in this build — ARC surfaces the
          recommendation; a reviewer records the decision in COUNSEL.
        </div>
      ) : null}
      {shown === "nexus" ? (
        <div style={recommendationStyle} data-testid="arc-rec-nexus">
          Recommendation: open NEXUS and create an action item to update each breaking or significant
          item above before {report.affected_source_title} takes effect. Routing is a manual step in
          this build — ARC surfaces the recommendation; a reviewer creates the action item in NEXUS.
        </div>
      ) : null}
    </section>
  );
}

/**
 * The ARC "modeled projection" marker — a distinct visual cue (slate/violet) so a reviewer sees at a
 * glance that the finding is a model output, NOT a CLEAR compliance finding or a TRACER citation
 * (ARIA-specific Gap 6, docs/16 §8). Defined inline (component-specific), the same way TRACER's
 * citation marker is — not a new shared primitive.
 */
function ProjectionMarker(): JSX.Element {
  return (
    <span style={projectionMarkerStyle} data-testid="arc-projection-marker">
      Modeled projection
    </span>
  );
}

function itemCountPhrase(n: number): string {
  return n === 1 ? "one platform item" : `${n} platform items`;
}
function scopeNoun(scope: ChangeScope): string {
  return scope === "substantive" ? "substantive" : "clarifying";
}

// ── Styles (approved white-card pattern on the ARIA light canvas — docs/16 §8) ───────────────────
const fieldLabelStyle: CSSProperties = { display: "block", fontSize: 13, color: "#475569", fontWeight: 600, margin: "10px 0 4px" };
const selectStyle: CSSProperties = {
  width: "100%", maxWidth: 520, padding: "8px 10px", fontSize: 14, color: "#0f172a",
  border: "1px solid #cbd5e1", borderRadius: 8, background: "#ffffff",
};
const textareaStyle: CSSProperties = {
  width: "100%", maxWidth: 820, minHeight: 70, padding: "8px 10px", fontSize: 14, color: "#0f172a",
  border: "1px solid #cbd5e1", borderRadius: 8, background: "#ffffff", fontFamily: "inherit",
};
const scopeRowStyle: CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 };
const scopeButtonStyle: CSSProperties = {
  padding: "6px 14px", fontSize: 13, background: "#f1f5f9", color: "#475569",
  border: "1px solid #cbd5e1", borderRadius: 8, cursor: "pointer",
};
const scopeButtonActiveStyle: CSSProperties = { background: "#ffffff", color: "#0f172a", border: "2px solid #1d4ed8", fontWeight: 700 };
const primaryBtnStyle: CSSProperties = {
  padding: "7px 16px", borderRadius: 6, border: "1px solid #1d4ed8", background: "#2563eb",
  color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
};
const secondaryBtnStyle: CSSProperties = {
  padding: "7px 14px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#ffffff",
  color: "#0f172a", cursor: "pointer", fontSize: 13, fontWeight: 600,
};
const errorStyle: CSSProperties = { margin: "0 0 10px", color: "#b91c1c", fontSize: 13, fontWeight: 600 };
const itemListStyle: CSSProperties = { margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 };
const itemCardStyle: CSSProperties = {
  padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#ffffff", maxWidth: 820,
};
const itemHeaderStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" };
const itemTitleStyle: CSSProperties = { fontSize: 14, fontWeight: 700, color: "#0f172a" };
const itemKindStyle: CSSProperties = { margin: "0 0 6px", fontSize: 12, color: "#64748b" };
const itemStatementStyle: CSSProperties = { margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.5 };
const recommendationStyle: CSSProperties = {
  marginTop: 10, padding: "10px 14px", background: "#f8fafc", border: "1px solid #e2e8f0",
  borderRadius: 8, color: "#334155", fontSize: 13, lineHeight: 1.5, maxWidth: 820,
};
// Distinct from CLEAR's severity pills and TRACER's blue "Cited from" marker — a projection cue.
const projectionMarkerStyle: CSSProperties = {
  display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 12, fontWeight: 600,
  background: "#f5f3ff", border: "1px solid #ddd6fe", color: "#5b21b6", whiteSpace: "nowrap",
};

export default ArcImpactModeler;

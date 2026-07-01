/**
 * SOVEREIGN Platform — module-aria
 * TracerExplorer.tsx — TRACER Traceability Explorer (Stage 6, Session 24 · D2).
 *
 * The single TRACER panel (docs/16 §5). A reviewer (1) picks an output type — Decision Record,
 * SCRIBE Document, or Obligation — (2) picks the specific item, and (3) sees its complete chain of
 * authority: each node a white card stating what it is, what it cites, and the reference a reviewer
 * can open. When a node lacks a traceable source the gap is shown in AMBER with a plain-prose
 * explanation — never hidden, never asserted as complete when it isn't (docs/16 §5).
 *
 * TRACER assembles existing records into a chain; it does not analyze, judge, or infer. Every node
 * makes that explicit — a "Cited from" marker on every traceable node, an amber "No traceable
 * source" marker on every orphan (ARIA-specific Gap 6, docs/16 §8). The permanent TRACER determinism
 * notice (blue, Category 2) states the same guardrail at the top of the panel.
 *
 * Reuses the CLEAR presentation primitives (SeverityBadge) and the ARIA banners (GovernanceBanner,
 * StatusNotice, contentCardStyle) rather than introducing parallel components (docs/16 §8). Chain
 * assembly is fully deterministic and runs in tracer-engine.ts via tracer-integration.ts — this
 * component holds no rule logic and emits no Logger events (the three TRACER event types are
 * Python-only; see tracer-engine.ts header). Data defaults to the synthetic demo set while the
 * Governance Clock is OFF, exactly as the CLEAR dashboard does.
 *
 * Version: 1.0 · Session 24 (D2) · June 29, 2026
 */

import { useMemo, useState, type CSSProperties } from "react";

import type { SovereignShellContext } from "../../sovereign-shell/shell-contract";
import { GovernanceBanner, StatusNotice, contentCardStyle, sectionHeadingStyle, bodyTextStyle } from "./banners";
import { SeverityBadge } from "./clear-ui";
import {
  DEMO_TRACER_DATA,
  assembleChainFor,
  listTraceableItems,
  type TracerDataSource,
} from "./tracer-integration";
import type { ChainNode, ChainType, SourceKind, TraceChain } from "./tracer-types";

export interface TracerExplorerProps {
  ctx: SovereignShellContext;
  /** The records to trace. Defaults to the synthetic demo set (Governance Clock OFF). */
  data?: TracerDataSource;
}

const OUTPUT_TYPES: Array<{ id: ChainType; label: string }> = [
  { id: "decision", label: "Decision Record" },
  { id: "document", label: "SCRIBE Document" },
  { id: "obligation", label: "Obligation" },
];

/** Plain-prose name for what a citation points at — used on every traceable node's "Cited from" marker. */
const SOURCE_KIND_LABEL: Record<SourceKind, string> = {
  document: "source document",
  logger_event: "Logger event",
  regulation: "regulation",
  none: "no source",
};

/**
 * The permanent TRACER determinism guardrail (Category 2 — blue, never dismissible). TRACER's
 * authority rests on the fact that it cites rather than infers; this states it on the panel.
 */
export function TracerDeterminismNotice(): JSX.Element {
  return (
    <GovernanceBanner label="How TRACER works:">
      TRACER assembles existing records into a chain of authority. It does not analyze, judge, or
      infer — every link is a citation to an existing record.
    </GovernanceBanner>
  );
}

export function TracerExplorer({ ctx: _ctx, data = DEMO_TRACER_DATA }: TracerExplorerProps): JSX.Element {
  const [chainType, setChainType] = useState<ChainType>("decision");
  const [selectedId, setSelectedId] = useState<string>("");

  const items = useMemo(() => listTraceableItems(data), [data]);
  const itemsForType = useMemo(() => items.filter((i) => i.chain_type === chainType), [items, chainType]);
  const chain: TraceChain | null = useMemo(
    () => (selectedId ? assembleChainFor(data, chainType, selectedId) : null),
    [data, chainType, selectedId]
  );

  const onPickType = (id: ChainType): void => {
    setChainType(id);
    setSelectedId(""); // reset the item selection when the output type changes
  };

  return (
    <div data-testid="tracer-explorer">
      {/* Category 2 — permanent governance guardrail (blue). */}
      <TracerDeterminismNotice />

      {/* Step 1 + 2 — pick an output type, then a specific item. */}
      <section style={contentCardStyle} data-testid="tracer-picker">
        <h2 style={sectionHeadingStyle}>Trace an output to its authority</h2>
        <p style={bodyTextStyle}>
          Choose an output, then the specific item. TRACER shows the complete chain from that output
          back to the records and regulations that authorize it. Each link is a citation you can open.
        </p>

        <div style={typeRowStyle} role="tablist" aria-label="Output type">
          {OUTPUT_TYPES.map((t) => {
            const active = t.id === chainType;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                data-testid={`tracer-type-${t.id}`}
                onClick={() => onPickType(t.id)}
                style={{ ...typeButtonStyle, ...(active ? typeButtonActiveStyle : null) }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <label style={pickerLabelStyle} htmlFor="tracer-item-select">
          {OUTPUT_TYPES.find((t) => t.id === chainType)!.label} to trace
        </label>
        <select
          id="tracer-item-select"
          data-testid="tracer-item-select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={selectStyle}
        >
          <option value="">Select an item…</option>
          {itemsForType.map((i) => (
            <option key={i.id} value={i.id}>
              {i.label}
            </option>
          ))}
        </select>
      </section>

      {/* Step 3 — the assembled chain of authority. */}
      {chain ? <ChainView chain={chain} /> : (
        <section style={contentCardStyle} data-testid="tracer-empty">
          <p style={{ ...bodyTextStyle, margin: 0, color: "#64748b" }}>
            Select an item above to see its chain of authority.
          </p>
        </section>
      )}
    </div>
  );
}

/** The assembled chain: a completeness summary, then one card per node. */
function ChainView({ chain }: { chain: TraceChain }): JSX.Element {
  return (
    <div data-testid="tracer-chain" data-complete={chain.complete}>
      {/* Completeness summary — green note when complete, amber orphan notice when not. */}
      {chain.complete ? (
        <div style={completeNoteStyle} data-testid="tracer-complete">
          <strong>Complete chain of authority.</strong> Every link below is a citation to an existing
          record — nothing in this chain is asserted.
        </div>
      ) : (
        <StatusNotice label="Incomplete chain (orphan):">
          <span data-testid="tracer-orphan-reason">{chain.orphan_reason}</span> The missing link is
          shown in amber below. TRACER does not fill the gap or treat the chain as complete.
        </StatusNotice>
      )}

      <section style={contentCardStyle}>
        <h2 style={sectionHeadingStyle}>{chain.subject_label}</h2>
        <p style={bodyTextStyle}>
          Chain of authority for this {chainTypeNoun(chain.chain_type)}, from the output down to its
          source. Each node states what it cites; an amber node has no traceable source.
        </p>
        <ol style={chainListStyle}>
          {chain.nodes.map((node, i) => (
            <li key={node.node_id} style={{ listStyle: "none" }}>
              <ChainNodeCard node={node} isLast={i === chain.nodes.length - 1} />
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

/** One node, rendered as a card that makes its citation (or its missing citation) explicit. */
function ChainNodeCard({ node, isLast }: { node: ChainNode; isLast: boolean }): JSX.Element {
  const orphan = !node.traceable;
  return (
    <div data-testid={`tracer-node-${node.node_id}`} data-traceable={node.traceable}>
      <div style={{ ...nodeCardStyle, borderColor: orphan ? "#fcd34d" : "#e2e8f0", background: orphan ? "#fffbeb" : "#ffffff" }}>
        <div style={nodeHeaderStyle}>
          <span style={nodeTitleStyle}>{node.title}</span>
          {orphan ? (
            <SeverityBadge severity="amber" label="No traceable source" />
          ) : (
            <span style={citationMarkerStyle} data-testid={`tracer-cite-${node.node_id}`}>
              Cited from {SOURCE_KIND_LABEL[node.source_kind]}
            </span>
          )}
        </div>
        <p style={nodeCitesStyle}>{node.cites}</p>
        {/* D-5 — a recorded-at timestamp on nodes whose source is a timestamped record/event. */}
        {node.timestamp ? (
          <p style={nodeTimestampStyle} data-testid={`tracer-timestamp-${node.node_id}`}>
            Recorded: {formatTimestamp(node.timestamp)}
          </p>
        ) : null}
        {node.source_ref ? (
          <p style={nodeRefStyle}>
            Reference: <span style={monoStyle}>{node.source_ref}</span>
          </p>
        ) : null}
        {/* D-4 — raw internal identifiers kept out of primary content, available on demand. */}
        {node.technical_references && node.technical_references.length > 0 ? (
          <details style={techDetailsStyle} data-testid={`tracer-tech-${node.node_id}`}>
            <summary style={techSummaryStyle}>Technical references</summary>
            <ul style={techListStyle}>
              {node.technical_references.map((ref) => (
                <li key={ref.label} style={nodeRefStyle}>
                  {ref.label}: <span style={monoStyle}>{ref.value}</span>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
      {!isLast ? <div style={connectorStyle} aria-hidden="true">↓</div> : null}
    </div>
  );
}

function chainTypeNoun(t: ChainType): string {
  return t === "decision" ? "decision" : t === "document" ? "document" : "obligation";
}

/**
 * Format an ISO 8601 timestamp as a plain-prose "YYYY-MM-DD HH:MM UTC" (D-5). Pure string slicing —
 * no Date parsing — so it stays deterministic and never shifts by the viewer's local time zone.
 */
function formatTimestamp(iso: string): string {
  const date = iso.slice(0, 10);
  const time = iso.slice(11, 16);
  return time ? `${date} ${time} UTC` : date;
}

// ── Styles (approved white-card pattern on the ARIA light canvas — docs/16 §8) ───────────────
const typeRowStyle: CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 };
const typeButtonStyle: CSSProperties = {
  padding: "6px 14px", fontSize: 13, background: "#f1f5f9", color: "#475569",
  border: "1px solid #cbd5e1", borderRadius: 8, cursor: "pointer",
};
const typeButtonActiveStyle: CSSProperties = { background: "#ffffff", color: "#0f172a", border: "2px solid #1d4ed8", fontWeight: 700 };
const pickerLabelStyle: CSSProperties = { display: "block", fontSize: 13, color: "#475569", fontWeight: 600, marginBottom: 4 };
const selectStyle: CSSProperties = {
  width: "100%", maxWidth: 520, padding: "8px 10px", fontSize: 14, color: "#0f172a",
  border: "1px solid #cbd5e1", borderRadius: 8, background: "#ffffff",
};
const completeNoteStyle: CSSProperties = {
  padding: "10px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8,
  color: "#166534", fontSize: 13, marginBottom: 10, maxWidth: 860,
};
const chainListStyle: CSSProperties = { margin: 0, padding: 0 };
const nodeCardStyle: CSSProperties = {
  padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#ffffff", maxWidth: 820,
};
const nodeHeaderStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 6 };
const nodeTitleStyle: CSSProperties = { fontSize: 14, fontWeight: 700, color: "#0f172a" };
const nodeCitesStyle: CSSProperties = { margin: "0 0 6px", fontSize: 13, color: "#334155", lineHeight: 1.5 };
const nodeRefStyle: CSSProperties = { margin: 0, fontSize: 12, color: "#475569" };
const nodeTimestampStyle: CSSProperties = { margin: "0 0 4px", fontSize: 12, color: "#475569" };
const techDetailsStyle: CSSProperties = { marginTop: 6 };
const techSummaryStyle: CSSProperties = { fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer" };
const techListStyle: CSSProperties = { margin: "6px 0 0", padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 2 };
const monoStyle: CSSProperties = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: "#0f172a" };
const citationMarkerStyle: CSSProperties = {
  display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 12, fontWeight: 600,
  background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", whiteSpace: "nowrap",
};
const connectorStyle: CSSProperties = { textAlign: "center", color: "#94a3b8", fontSize: 16, lineHeight: "20px", maxWidth: 820 };

export default TracerExplorer;

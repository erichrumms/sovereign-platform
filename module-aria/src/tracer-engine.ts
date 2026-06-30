/**
 * SOVEREIGN Platform — module-aria
 * tracer-engine.ts — the TRACER deterministic chain-assembly core (Stage 6, Session 24 · D1).
 *
 * TRACER assembles existing platform records into a chain of authority and returns a structured,
 * fully deterministic result: the SAME input records always produce the SAME nodes, the SAME
 * `complete` verdict, and the SAME `orphan_reason`. There is NO randomness, NO LLM call, and NO
 * sovereign-api-client call anywhere in this engine (docs/16 §1/§5, Constraint #1) — TRACER's
 * authority rests on that, exactly as CLEAR's does. Every node it emits is a CITATION to a record
 * that already exists; TRACER never analyzes, judges, or infers.
 *
 * LOGGER EVENTS — Python only (D3). The three TRACER event types (ARIA_TRACE_REQUESTED,
 * ARIA_TRACE_PRODUCED, ARIA_ORPHAN_FLAGGED) are added to sovereign_logger.py only. They are NOT in
 * shell-contract.ts `SovereignEventType`, so `ctx.logger.log()` cannot accept them from the
 * TypeScript layer without a shell-contract change — which is out of scope this session (no GD).
 * Per the docs/16 §7 STOP discipline, this engine therefore emits NOTHING from TS: a chain's
 * orphan condition is carried in the returned `TraceChain` (`complete: false` + `orphan_reason`),
 * which a Python-side / CLI emitter records as ARIA_ORPHAN_FLAGGED. This mirrors the original
 * docs/16 design that TRACER needs no shell-contract change. (Recorded in the Session 24 handoff.)
 *
 * DATA SOURCING. `ctx.data` exposes only `{ types: unknown }` and `ctx.logger` is write-only — the
 * shell context carries no runtime query API (verified Session 24). So, exactly like CLEAR, the
 * engine is a set of PURE functions over records passed in explicitly; the Traceability Explorer
 * supplies them (synthetic demo records modeling the real COUNSEL/SCRIBE shapes while the
 * Governance Clock is OFF). No filesystem, no network, no shell read. (Recorded in the handoff.)
 *
 * Version: 1.0 · Session 24 (D1) · June 29, 2026
 */

import {
  OBLIGATION_NOT_INTEGRATED_MESSAGE,
  type ChainNode,
  type CounselDecisionRecord,
  type ObligationRecordRef,
  type ScribeDocumentRecord,
  type TraceChain,
} from "./tracer-types";

/** Per-subject TRACER workflow step id — every TRACER record for one output shares it (Constraint #6). */
export function tracerWorkflowStep(subjectId: string): string {
  return `aria-tracer-${subjectId}`;
}

/**
 * Finalize a chain: a chain is complete only when every node is traceable. When it is not, the
 * `orphan_reason` is the `cites` text of the first untraceable node — a plain-prose statement of
 * the missing link. Deterministic: depends only on the node array order, which assembly fixes.
 */
function finalizeChain(
  chain_type: TraceChain["chain_type"],
  subject_id: string,
  subject_label: string,
  nodes: ChainNode[]
): TraceChain {
  const firstOrphan = nodes.find((n) => !n.traceable);
  const complete = firstOrphan === undefined;
  return {
    chain_type,
    subject_id,
    subject_label,
    nodes,
    complete,
    ...(complete ? {} : { orphan_reason: firstOrphan!.cites }),
  };
}

// ── Decision chains ─────────────────────────────────────────────────────────────────────────
// decision → governing regulation → source document → effective date (docs/16 §5). The decision
// node always traces (the COUNSEL Decision Record exists). The regulation half traces only when the
// record carries a `regulation_basis` — which COUNSEL Decision Records do NOT today (verified
// Session 24, D4). Absent, those three nodes are orphaned with a plain-prose explanation; TRACER
// does not invent a citation and does not modify the COUNSEL data model.

export function assembleDecisionChain(record: CounselDecisionRecord): TraceChain {
  const nodes: ChainNode[] = [];

  // Node 1 — the decision itself. Always traceable: the Decision Record exists in COUNSEL.
  nodes.push({
    node_id: `${record.document_id}:decision`,
    kind: "decision_record",
    title: `COUNSEL decision: ${record.chosen_alternative_label}`,
    cites: `Recorded as a HUMAN_DECISION (${record.decision_type}) for program ${record.program_id}. Rationale: ${record.rationale}`,
    source_kind: "logger_event",
    source_ref: record.workflow_step_id,
    traceable: true,
  });

  const basis = record.regulation_basis;

  // Node 2 — the governing regulation.
  nodes.push({
    node_id: `${record.document_id}:regulation`,
    kind: "regulation",
    title: basis ? `Governing regulation: ${basis.regulation_id} ${basis.section}` : "Governing regulation — not recorded",
    cites: basis
      ? `${basis.regulation_id}, ${basis.section}`
      : "This Decision Record does not cite a governing regulation. COUNSEL Decision Records do not yet carry a regulation basis, so the chain from decision to authority cannot be completed.",
    source_kind: basis ? "regulation" : "none",
    source_ref: basis ? basis.regulation_id : "",
    traceable: basis !== undefined,
  });

  // Node 3 — the regulatory source document the regulation lives in.
  nodes.push({
    node_id: `${record.document_id}:source_document`,
    kind: "source_document",
    title: basis ? `Source document: ${basis.source_document}` : "Source document — not available",
    cites: basis
      ? `${basis.source_document}`
      : "No source document can be cited until the decision records its governing regulation.",
    source_kind: basis ? "document" : "none",
    source_ref: basis ? basis.source_document : "",
    traceable: basis !== undefined,
  });

  // Node 4 — the effective date that fixes which version of the regulation governs.
  nodes.push({
    node_id: `${record.document_id}:effective_date`,
    kind: "effective_date",
    title: basis ? `Effective as of: ${basis.effective_date}` : "Effective date — not available",
    cites: basis
      ? `${basis.regulation_id} effective ${basis.effective_date}`
      : "No effective date can be cited until the decision records its governing regulation.",
    source_kind: basis ? "regulation" : "none",
    source_ref: basis ? basis.effective_date : "",
    traceable: basis !== undefined,
  });

  return finalizeChain("decision", record.document_id, record.title, nodes);
}

// ── Document chains ─────────────────────────────────────────────────────────────────────────
// document → SCRIBE draft event → source records cited → Logger events for each source (docs/16
// §5). SCRIBE has no SCRIBE_DRAFT_CREATED event; drafting is recorded as AGENT_STEP_COMPLETE
// (agent_id scribe-drafter) and export as HUMAN_DECISION (verified Session 24, D4). The draft node
// models the real AGENT_STEP_COMPLETE event; the lineage nodes are the cited source records. A
// document with no draft event or no source records is orphaned.

export function assembleDocumentChain(record: ScribeDocumentRecord): TraceChain {
  const nodes: ChainNode[] = [];

  // Node 1 — the document.
  nodes.push({
    node_id: `${record.document_id}:document`,
    kind: "scribe_document",
    title: `SCRIBE document: ${record.document_title}`,
    cites: `Drafted in SCRIBE under workflow step ${record.workflow_step_id}.`,
    source_kind: "logger_event",
    source_ref: record.workflow_step_id,
    traceable: true,
  });

  // Node 2 — the drafting event (real: AGENT_STEP_COMPLETE, agent_id scribe-drafter).
  const draft = record.draft_event;
  nodes.push({
    node_id: `${record.document_id}:draft_event`,
    kind: "draft_event",
    title: draft ? `Draft recorded by ${draft.agent_id}` : "Draft event — not recorded",
    cites: draft
      ? `Logger event ${draft.event_type} (agent ${draft.agent_id}), recorded ${draft.produced_at}.`
      : "No drafting Logger event was found for this document, so the draft cannot be traced to the agent that produced it.",
    source_kind: draft ? "logger_event" : "none",
    source_ref: draft ? draft.workflow_step_id : "",
    traceable: draft !== undefined,
  });

  // Nodes 3..n — each cited source record in the document's data lineage.
  if (record.source_records.length === 0) {
    nodes.push({
      node_id: `${record.document_id}:source_records`,
      kind: "source_record",
      title: "Source data lineage — none recorded",
      cites:
        "This document cites no source records. Its data lineage cannot be traced, so the chain from document to source data is incomplete.",
      source_kind: "none",
      source_ref: "",
      traceable: false,
    });
  } else {
    for (const src of record.source_records) {
      nodes.push({
        node_id: `${record.document_id}:source:${src.record_id}`,
        kind: "source_record",
        title: `Source: ${src.description}`,
        cites: `Logger event ${src.logger_event_type} under workflow step ${src.workflow_step_id}.`,
        source_kind: "logger_event",
        source_ref: src.workflow_step_id,
        traceable: true,
      });
    }
  }

  return finalizeChain("document", record.document_id, record.document_title, nodes);
}

// ── Obligation chains ───────────────────────────────────────────────────────────────────────
// obligation → program → strategic objective (docs/16 §5). The PPBE entities ObligationRecord,
// ProgramRecord, and StrategicObjective are APPROVED (D-P3) but NOT YET BUILT. The chain TYPE is
// implemented now and ready; until PPBE Phase I builds those entities there is no data to trace, so
// assembly returns a single not-integrated node carrying the plain-prose message (D1). When the
// PPBE entities exist, the program/objective nodes are populated from `program_id` / `objective_id`.

export function assembleObligationChain(record: ObligationRecordRef): TraceChain {
  const nodes: ChainNode[] = [];

  // Node 1 — the obligation. The obligation reference may exist; the chain above it does not.
  nodes.push({
    node_id: `${record.obligation_id}:obligation`,
    kind: "obligation_record",
    title: `Obligation: ${record.label}`,
    cites: record.program_id
      ? `Declared to serve program ${record.program_id}.`
      : "This obligation does not reference a PPBE program.",
    source_kind: record.program_id ? "document" : "none",
    source_ref: record.program_id ?? "",
    // Even when a program_id string is present, the ProgramRecord entity it points at is not built,
    // so the obligation cannot be traced to a real program. The chain is not yet traceable.
    traceable: false,
  });

  // Node 2 — the PPBE program / strategic-objective chain — not yet integrated.
  nodes.push({
    node_id: `${record.obligation_id}:ppbe`,
    kind: "program_record",
    title: "Program and strategic objective — not yet integrated",
    cites: OBLIGATION_NOT_INTEGRATED_MESSAGE,
    source_kind: "none",
    source_ref: "",
    traceable: false,
  });

  return finalizeChain("obligation", record.obligation_id, record.label, nodes);
}

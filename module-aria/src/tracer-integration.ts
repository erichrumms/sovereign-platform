/**
 * SOVEREIGN Platform — module-aria
 * tracer-integration.ts — TRACER integration with COUNSEL and SCRIBE existing data (Session 24 · D4).
 *
 * TRACER traces records other products already produce. This module is the boundary between those
 * products' real data shapes and the TRACER engine: it declares what a COUNSEL Decision Record and a
 * SCRIBE document actually carry today, and provides the selectable items the Traceability Explorer
 * lists. It builds chains against what EXISTS — not against the idealized docs/16 §5 design.
 *
 * SPEC-VS-CODEBASE RECONCILIATIONS (verified against source in Session 24 — recorded in the handoff):
 *
 *   1. COUNSEL Decision Records carry NO `regulation_basis` (or any regulation-citation) field. The
 *      assembled record (module-counsel/src/decision-record.ts) is a canonical Document
 *      {document_id, title, classification_level, version, created_by, program_id, created_at} plus a
 *      HUMAN_DECISION payload {chosen_alternative_label, rationale, modes_used, prompts, …}. There is
 *      no field linking a decision to a governing regulation. The DecisionChain is therefore built to
 *      the data that exists: its decision node always traces; its regulation / source-document /
 *      effective-date nodes orphan until COUNSEL adds a regulation basis. We do NOT add that field
 *      this session and do NOT modify the COUNSEL data model (authorized reconciliation, not a fix).
 *
 *   2. SCRIBE emits NO `SCRIBE_DRAFT_CREATED` event. SCRIBE drafting is recorded as AGENT_STEP_COMPLETE
 *      (agent_id `scribe-drafter`, module-scribe/src/useDraft.ts) and export as HUMAN_DECISION
 *      (useExport.ts). The DocumentChain's draft node models the real AGENT_STEP_COMPLETE drafter
 *      event; lineage nodes are the cited source records.
 *
 *   3. The shell context has no runtime data/Logger read API (`ctx.data` is `{ types: unknown }`,
 *      `ctx.logger` is write-only). While the Governance Clock is OFF, the Explorer lists the synthetic
 *      demo records below — the same convention CLEAR's Compliance Dashboard uses (DEMO_* in
 *      ClearDashboard.tsx). When a read API lands, these adapters are where real records bind in.
 *
 * Version: 1.0 · Session 24 (D4) · June 29, 2026
 */

import {
  assembleDecisionChain,
  assembleDocumentChain,
  assembleObligationChain,
} from "./tracer-engine";
import type {
  ChainType,
  CounselDecisionRecord,
  ObligationRecordRef,
  ScribeDocumentRecord,
  TraceChain,
} from "./tracer-types";

/** One selectable output in the Traceability Explorer's picker, grouped by chain type. */
export interface TraceableItem {
  chain_type: ChainType;
  /** The subject id (document_id / obligation_id). */
  id: string;
  /** Plain-prose label shown in the picker (Gap 5). */
  label: string;
}

/**
 * Everything the Explorer needs: the records to list per chain type, plus the assembled chain for
 * any selection. Records default to the synthetic demo set; tests and a future read API pass real
 * records in. Assembly is delegated to the deterministic engine — this module holds no rule logic.
 */
export interface TracerDataSource {
  decisions: CounselDecisionRecord[];
  documents: ScribeDocumentRecord[];
  obligations: ObligationRecordRef[];
}

// ── Synthetic demo records (Governance Clock OFF — all data is synthetic) ────────────────────

/**
 * Two COUNSEL Decision Records. The first is a realistic record AS COUNSEL PRODUCES IT TODAY — no
 * regulation basis — so its chain is intentionally orphaned, surfacing the gap honestly. The second
 * carries a `regulation_basis` to show the complete chain the design intends once COUNSEL adds the
 * field; it is labeled as illustrative so a reviewer is not misled about current COUNSEL behavior.
 */
export const DEMO_DECISIONS: CounselDecisionRecord[] = [
  {
    document_id: "DR-COUNSEL-0007",
    title: "COUNSEL Decision Record — realign FY 2026 O&M funding to readiness",
    program_id: "PRG-014",
    decision_type: "HUMAN_APPROVAL",
    chosen_alternative_label: "Realign $4.2M from sustainment to readiness",
    rationale: "Readiness shortfall is the binding constraint this quarter; sustainment can absorb the deferral.",
    created_at: "2026-06-22T15:04:00.000Z",
    workflow_step_id: "COUNSEL-DR-0007-step-3",
    // No regulation_basis — this is how COUNSEL records a decision today (reconciliation #1).
  },
  {
    document_id: "DR-COUNSEL-0008",
    title: "COUNSEL Decision Record — defer congressional exhibit pending data fix (illustrative basis)",
    program_id: "PRG-014",
    decision_type: "HUMAN_APPROVAL",
    chosen_alternative_label: "Defer the exhibit one cycle to remediate data quality",
    rationale: "Submitting below the data-quality threshold risks an A-11 compliance finding.",
    created_at: "2026-06-24T13:20:00.000Z",
    workflow_step_id: "COUNSEL-DR-0008-step-3",
    // Illustrative only — shows the complete chain a regulation basis would yield (not current COUNSEL behavior).
    regulation_basis: {
      regulation_id: "OMB Circular A-11",
      section: "Section 51.3 — justification of estimates",
      source_document: "OMB Circular A-11 (2025 revision)",
      effective_date: "2025-08-01",
    },
  },
];

/**
 * Two SCRIBE documents. The first carries a full draft event + source lineage (complete chain); the
 * second has a draft event but no cited sources (orphaned lineage) to exercise honest orphan display.
 */
export const DEMO_DOCUMENTS: ScribeDocumentRecord[] = [
  {
    document_id: "SCR-EXHIBIT-FY26-OM",
    document_title: "FY 2026 O&M Budget Exhibit",
    workflow_step_id: "SCRIBE-DRAFT-FY26OM-step-1",
    draft_event: {
      event_type: "AGENT_STEP_COMPLETE",
      agent_id: "scribe-drafter",
      produced_at: "2026-06-20T09:12:00.000Z",
      workflow_step_id: "SCRIBE-DRAFT-FY26OM-step-1",
    },
    source_records: [
      {
        record_id: "SRC-COSTBASE-FY26",
        description: "FY 2026 cost baseline dataset",
        logger_event_type: "AGENT_STEP_COMPLETE",
        workflow_step_id: "APEX-COSTBASE-FY26-step-2",
        recorded_at: "2026-06-19T14:05:00.000Z",
      },
      {
        record_id: "SRC-OBL-Q3",
        description: "Q3 obligation summary",
        logger_event_type: "AGENT_STEP_COMPLETE",
        workflow_step_id: "APEX-OBL-Q3-step-2",
        recorded_at: "2026-06-18T10:30:00.000Z",
      },
    ],
  },
  {
    document_id: "SCR-EVAL-PRG014",
    document_title: "Program PRG-014 Evaluation Findings",
    workflow_step_id: "SCRIBE-DRAFT-PRG014-step-1",
    draft_event: {
      event_type: "AGENT_STEP_COMPLETE",
      agent_id: "scribe-drafter",
      produced_at: "2026-06-23T11:40:00.000Z",
      workflow_step_id: "SCRIBE-DRAFT-PRG014-step-1",
    },
    source_records: [], // No cited lineage — orphaned (reconciliation surfaced, not hidden).
  },
];

/**
 * One obligation. The PPBE entities it would trace to (ProgramRecord, StrategicObjective) are not
 * built, so its chain returns the not-integrated message — by design until PPBE Phase I.
 */
export const DEMO_OBLIGATIONS: ObligationRecordRef[] = [
  {
    obligation_id: "OBL-FY26-0042",
    label: "FY 2026 O&M obligation — readiness realignment",
    program_id: "PRG-014",
    objective_id: "OBJ-READINESS-1",
  },
];

/** The default synthetic data source the Explorer lists while the Governance Clock is OFF. */
export const DEMO_TRACER_DATA: TracerDataSource = {
  decisions: DEMO_DECISIONS,
  documents: DEMO_DOCUMENTS,
  obligations: DEMO_OBLIGATIONS,
};

/** Flatten a data source into the Explorer's grouped picker list (stable order: decisions, documents, obligations). */
export function listTraceableItems(data: TracerDataSource): TraceableItem[] {
  return [
    ...data.decisions.map((d): TraceableItem => ({ chain_type: "decision", id: d.document_id, label: d.title })),
    ...data.documents.map((d): TraceableItem => ({ chain_type: "document", id: d.document_id, label: d.document_title })),
    ...data.obligations.map((o): TraceableItem => ({ chain_type: "obligation", id: o.obligation_id, label: o.label })),
  ];
}

/**
 * Assemble the chain for a selected item by delegating to the deterministic engine. Returns null
 * when no record matches the (chain_type, id) selection — the Explorer treats that as "nothing to
 * show" rather than fabricating a chain. Pure: no side effects, no Logger emission (see engine header).
 */
export function assembleChainFor(
  data: TracerDataSource,
  chain_type: ChainType,
  id: string
): TraceChain | null {
  if (chain_type === "decision") {
    const record = data.decisions.find((d) => d.document_id === id);
    return record ? assembleDecisionChain(record) : null;
  }
  if (chain_type === "document") {
    const record = data.documents.find((d) => d.document_id === id);
    return record ? assembleDocumentChain(record) : null;
  }
  const record = data.obligations.find((o) => o.obligation_id === id);
  return record ? assembleObligationChain(record) : null;
}

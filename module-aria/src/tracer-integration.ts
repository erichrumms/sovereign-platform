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

import type {
  ObligationRecord,
  ProgramRecord,
  StrategicObjective,
} from "@sovereign/data";
import {
  SYNTH_PPBE_OBLIGATIONS,
  SYNTH_PPBE_OBJECTIVES,
  SYNTH_PPBE_PROGRAMS,
} from "@sovereign/data";

import { assemblePPBEObligationChain } from "./ppbe-aria";
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
  /** Bare references with no resolvable entities — the honest not-integrated path. */
  obligations: ObligationRecordRef[];
  /**
   * ENTITY-RESOLVED PPBE records (Session 33, goal item 7): obligations whose
   * ProgramRecord / StrategicObjective actually exist. These assemble through
   * assemblePPBEObligationChain (the real Session 31 entity chain) instead of
   * the ObligationRecordRef stub. An obligation id found here wins over a
   * same-id bare reference — a resolvable chain is never shown as unresolved.
   */
  ppbe?: {
    obligations: ObligationRecord[];
    programs: ProgramRecord[];
    objectives: StrategicObjective[];
  };
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
 * One legacy obligation reference whose program (PRG-014) was never brought
 * into PPBE tracking — kept deliberately so the Explorer still demonstrates
 * the honest not-integrated path alongside the real PPBE chains below.
 * (Session 24 wrote this when NO obligation could resolve; since Session 33
 * the seeded PPBE obligations resolve fully — this is now the exception, not
 * the rule.)
 */
export const DEMO_OBLIGATIONS: ObligationRecordRef[] = [
  {
    obligation_id: "OBL-FY26-0042",
    label: "FY 2026 O&M obligation — readiness realignment",
    program_id: "PRG-014",
    objective_id: "OBJ-READINESS-1",
  },
];

/**
 * The default synthetic data source the Explorer lists while the Governance
 * Clock is OFF. Session 33: the canonical PPBE seed's obligations, programs,
 * and objectives ride in the entity-resolved lane, so the Explorer shows
 * COMPLETE obligation → program → strategic objective chains over real
 * seeded entities (goal item 7 / WE-6).
 */
export const DEMO_TRACER_DATA: TracerDataSource = {
  decisions: DEMO_DECISIONS,
  documents: DEMO_DOCUMENTS,
  obligations: DEMO_OBLIGATIONS,
  ppbe: {
    obligations: SYNTH_PPBE_OBLIGATIONS,
    programs: SYNTH_PPBE_PROGRAMS,
    objectives: SYNTH_PPBE_OBJECTIVES,
  },
};

/** Flatten a data source into the Explorer's grouped picker list (stable order:
 *  decisions, documents, entity-resolved PPBE obligations, bare references). */
export function listTraceableItems(data: TracerDataSource): TraceableItem[] {
  const ppbeIds = new Set((data.ppbe?.obligations ?? []).map((o) => o.obligation_id));
  return [
    ...data.decisions.map((d): TraceableItem => ({ chain_type: "decision", id: d.document_id, label: d.title })),
    ...data.documents.map((d): TraceableItem => ({ chain_type: "document", id: d.document_id, label: d.document_title })),
    ...(data.ppbe?.obligations ?? []).map(
      (o): TraceableItem => ({
        chain_type: "obligation",
        id: o.obligation_id,
        label: `Obligation ${o.obligation_id} — ${o.amount} against cost code ${o.cost_code}`,
      })
    ),
    // A bare reference whose id is also entity-resolved is listed once, as the resolved item.
    ...data.obligations
      .filter((o) => !ppbeIds.has(o.obligation_id))
      .map((o): TraceableItem => ({ chain_type: "obligation", id: o.obligation_id, label: o.label })),
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
  // Obligations: the entity-resolved PPBE lane wins (Session 33, goal item 7) —
  // a resolvable chain is assembled over the REAL Session 31 entities.
  const ppbeRecord = data.ppbe?.obligations.find((o) => o.obligation_id === id);
  if (ppbeRecord) {
    const program = data.ppbe!.programs.find((p) => p.program_id === ppbeRecord.program_id);
    const objective = program
      ? data.ppbe!.objectives.find((o) => o.objective_id === program.objective_id)
      : undefined;
    return assemblePPBEObligationChain(ppbeRecord, program, objective);
  }
  // Bare references fall back to the honest not-integrated stub (Session 24 path).
  const record = data.obligations.find((o) => o.obligation_id === id);
  return record ? assembleObligationChain(record) : null;
}

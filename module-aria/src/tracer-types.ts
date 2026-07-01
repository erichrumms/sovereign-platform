/**
 * SOVEREIGN Platform — module-aria
 * tracer-types.ts — TRACER domain types shared by the chain-assembly engine
 * (tracer-engine.ts), the integration adapters (tracer-integration.ts), and the
 * Traceability Explorer (TracerExplorer.tsx). Stage 6, Session 24 (D1).
 *
 * TRACER — Traceability and Accountability Chain for Evidence Records. TRACER assembles
 * EXISTING platform records into an unbroken chain of authority — decision → governing
 * regulation → source document → effective date, and the document/obligation equivalents
 * (docs/16 §5). It does not analyze, judge, or infer: every node is a CITATION to a record
 * that already exists. Like CLEAR, TRACER is fully deterministic — there is NO LLM call and
 * NO sovereign-api-client call anywhere in this path (Constraint #1 / docs/16 §1).
 *
 * Determinism contract: for the same input records, assembly always produces the same nodes,
 * the same `complete` verdict, and the same `orphan_reason`. The only non-deterministic value
 * a chain can carry — a timestamp — is part of the input record, never generated here.
 *
 * Gap 5: every human-facing string a node carries (`title`, `cites`) is plain prose.
 * ARIA-specific Gap 6: every node makes explicit what it CITES (`cites` + `source_kind`), so a
 * reviewer can see at a glance that TRACER is pointing at a source, not asserting a conclusion.
 *
 * Version: 1.0 · Session 24 (D1) · June 29, 2026
 */

/** The three traceability chains TRACER assembles (docs/16 §5). */
export type ChainType = "decision" | "document" | "obligation";

/**
 * What a single node in a chain represents. The kinds span all three chain types; an
 * individual chain uses only the kinds relevant to it. Each kind is a thing that already
 * exists in the platform (a record, a Logger event, a regulation) — never an inference.
 */
export type ChainNodeKind =
  // decision chain
  | "decision_record"
  | "regulation"
  | "source_document"
  | "effective_date"
  // document chain
  | "scribe_document"
  | "draft_event"
  | "source_record"
  // obligation chain
  | "obligation_record"
  | "program_record"
  | "strategic_objective";

/**
 * Where a node's citation points. `none` means the node has no traceable source in the
 * underlying data — that is what makes a chain an orphan (incomplete). TRACER never fabricates
 * a source: a missing one is shown as `none`, not hidden.
 */
export type SourceKind = "document" | "logger_event" | "regulation" | "none";

/**
 * One node in a chain of authority. A node is a CITATION, not an assertion:
 *   - `title` — plain prose: what this node is.
 *   - `cites` — plain prose: what it cites, or (when not traceable) why the citation is missing.
 *   - `source_kind` / `source_ref` — the machine-checkable pointer to the source the reviewer
 *     can open (a document_id, a Logger `workflow_step_id`, or a regulation id). Empty `source_ref`
 *     with `source_kind: "none"` marks an untraceable node.
 *   - `traceable` — true when this node resolves to an existing source. A chain is orphaned when
 *     any node is not traceable.
 */
export interface TechnicalReference {
  /** Plain-prose label for the identifier, e.g. "Logger event type". */
  label: string;
  /** The raw identifier a reviewer or auditor may need, e.g. "AGENT_STEP_COMPLETE". */
  value: string;
}

export interface ChainNode {
  node_id: string;
  kind: ChainNodeKind;
  /** Plain prose — what this node is (Gap 5). */
  title: string;
  /** Plain prose — what this node cites, or why the citation is absent (Gap 5 / ARIA Gap 6). */
  cites: string;
  source_kind: SourceKind;
  /** The reference a reviewer opens: document_id, workflow_step_id, or regulation id. "" when none. */
  source_ref: string;
  /** True when the node resolves to an existing source; false marks an orphan link. */
  traceable: boolean;
  /**
   * D-4 — raw internal identifiers (Logger event types, agent ids, decision-type codes) kept OUT of the
   * plain-prose `title`/`cites` and surfaced as secondary/expandable technical detail. Absent when a node
   * carries no such identifier (e.g. an orphan node with no traceable source).
   */
  technical_references?: TechnicalReference[];
  /**
   * D-5 — ISO 8601 timestamp of the underlying record/event, when one exists (a SCRIBE source record's
   * recorded_at, a draft event's produced_at, a decision's created_at). Absent when the node has no
   * timestamped source. Formatting is a UI concern; this stays the raw ISO string (determinism contract).
   */
  timestamp?: string;
}

/**
 * The deterministic result of one chain assembly (the engine output shape, docs/16 §5 / D1).
 * `complete` is true only when every node is traceable. When false, `orphan_reason` is a
 * plain-prose explanation of the first/most-significant missing link — the signal a Python-side
 * emitter records as `ARIA_ORPHAN_FLAGGED` (TRACER does not emit Logger events from the TS layer;
 * see tracer-engine.ts header).
 */
export interface TraceChain {
  chain_type: ChainType;
  /** The id of the output the reviewer selected (a decision/document/obligation id). */
  subject_id: string;
  /** Plain-prose label for the selected output (Gap 5). */
  subject_label: string;
  nodes: ChainNode[];
  complete: boolean;
  /** Plain prose; present only when `complete` is false. */
  orphan_reason?: string;
}

// ── Integration input shapes — modeled on what the codebase ACTUALLY carries today ──────────
// These shapes mirror the real COUNSEL / SCRIBE records (verified against the source in
// Session 24, D4). Where the ideal docs/16 §5 design assumes a field the codebase does not yet
// carry (COUNSEL `regulation_basis`; a SCRIBE `SCRIBE_DRAFT_CREATED` event), the field is OPTIONAL
// here and its absence produces an orphan node rather than a fabricated citation. The
// spec-vs-codebase reconciliation is recorded in the Session 24 handoff.

/**
 * A regulation citation for a decision — the chain's authority anchor. COUNSEL Decision Records
 * do NOT carry this today (no `regulation_basis` field on the canonical Document or the
 * HUMAN_DECISION payload — verified Session 24). When absent, the DecisionChain's regulation,
 * source-document, and effective-date nodes are orphaned.
 */
export interface RegulationCitation {
  /** e.g. "OMB Circular A-11". */
  regulation_id: string;
  /** e.g. "Section 51.3". */
  section: string;
  /** The governing source document this regulation lives in. */
  source_document: string;
  /** ISO 8601 — the date this regulation version took effect. */
  effective_date: string;
}

/**
 * A COUNSEL Decision Record as TRACER reads it. Fields mirror the real assembled record
 * (decision-record.ts): the canonical Document plus the HUMAN_DECISION event payload. There is
 * no regulation citation in the codebase today — `regulation_basis` is optional precisely to make
 * that gap visible as an orphan instead of inventing one (do NOT modify the COUNSEL data model).
 */
export interface CounselDecisionRecord {
  /** Canonical Document.document_id. */
  document_id: string;
  /** Canonical Document.title (e.g. "COUNSEL Decision Record — …"). */
  title: string;
  /** Canonical Document.program_id. */
  program_id: string;
  /** HUMAN_DECISION decision_type carried on the record. */
  decision_type: string;
  /** Plain-prose label of the alternative the human chose (HUMAN_DECISION payload). */
  chosen_alternative_label: string;
  /** The human's recorded rationale (HUMAN_DECISION payload). */
  rationale: string;
  /** Canonical Document.created_at (ISO 8601). */
  created_at: string;
  /** The HUMAN_DECISION workflow_step_id — the Logger anchor for this decision. */
  workflow_step_id: string;
  /** OPTIONAL — absent in the codebase today; absence orphans the regulation half of the chain. */
  regulation_basis?: RegulationCitation;
}

/** A source record a SCRIBE document drew on — one strand of its data lineage. */
export interface ScribeSourceRecord {
  record_id: string;
  /** Plain-prose description of the source material (Gap 5). */
  description: string;
  /** The Logger event_type that recorded this source (e.g. "AGENT_STEP_COMPLETE"). */
  logger_event_type: string;
  /** The Logger workflow_step_id a reviewer can open to see the source event. */
  workflow_step_id: string;
  /** D-5 — ISO 8601 timestamp of the Logger event that recorded this source (every Logger event has one). */
  recorded_at: string;
}

/**
 * A SCRIBE document as TRACER reads it. SCRIBE has no `SCRIBE_DRAFT_CREATED` event (verified
 * Session 24); its drafting is recorded as an `AGENT_STEP_COMPLETE` event carrying agent_id
 * `scribe-drafter`, and its export as a `HUMAN_DECISION`. `draft_event` therefore models the real
 * AGENT_STEP_COMPLETE drafter event. `source_records` is the document's data lineage; an empty
 * lineage orphans the chain.
 */
export interface ScribeDocumentRecord {
  document_id: string;
  /** Plain-prose document title (Gap 5). */
  document_title: string;
  workflow_step_id: string;
  /** The real drafting Logger event (AGENT_STEP_COMPLETE, agent_id scribe-drafter). Absent → orphan. */
  draft_event?: {
    event_type: string;
    agent_id: string;
    /** ISO 8601 — when the draft event was recorded. */
    produced_at: string;
    workflow_step_id: string;
  };
  /** The cited source records — the document's lineage. Empty → orphan. */
  source_records: ScribeSourceRecord[];
}

/**
 * An obligation as TRACER reads it. The full chain is obligation → program → strategic objective,
 * but the PPBE entities `ObligationRecord`, `ProgramRecord`, and `StrategicObjective` are APPROVED
 * (D-P3) and NOT YET BUILT. `program_id` / `objective_id` are optional; until PPBE Phase I builds
 * these entities, the obligation chain has no data to trace and assembly returns a not-integrated
 * result (see assembleObligationChain). The chain TYPE is implemented now so it is ready then.
 */
export interface ObligationRecordRef {
  obligation_id: string;
  /** Plain-prose label for the obligation (Gap 5). */
  label: string;
  /** PPBE ProgramRecord id this obligation serves — entity not yet built. */
  program_id?: string;
  /** PPBE StrategicObjective id the program serves — entity not yet built. */
  objective_id?: string;
}

/** The plain-prose message shown when an obligation has no PPBE program to trace to (D1). */
export const OBLIGATION_NOT_INTEGRATED_MESSAGE =
  "This program has not yet been integrated into the PPBE tracking system.";

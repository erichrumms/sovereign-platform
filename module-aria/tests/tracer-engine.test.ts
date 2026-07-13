/**
 * module-aria — tracer-engine.test.ts (Session 24 · D5)
 * The TRACER deterministic chain-assembly engine: same input → same chain, orphan detection for
 * all three chain types, and the not-yet-integrated obligation result. Also exercises the
 * integration adapters (tracer-integration.ts) against the synthetic records modeled on the REAL
 * COUNSEL Decision Record and SCRIBE document shapes (the D4 spec-vs-codebase reconciliations).
 */
import {
  assembleDecisionChain,
  assembleDocumentChain,
  assembleObligationChain,
  tracerWorkflowStep,
} from "../src/tracer-engine";
import {
  DEMO_TRACER_DATA,
  assembleChainFor,
  listTraceableItems,
} from "../src/tracer-integration";
import {
  OBLIGATION_NOT_INTEGRATED_MESSAGE,
  type CounselDecisionRecord,
  type ObligationRecordRef,
  type ScribeDocumentRecord,
} from "../src/tracer-types";

// A COUNSEL Decision Record AS THE CODEBASE PRODUCES IT TODAY — no regulation_basis (reconciliation #1).
const DECISION_NO_BASIS: CounselDecisionRecord = {
  document_id: "DR-1",
  title: "COUNSEL Decision Record — test",
  program_id: "PRG-1",
  decision_type: "HUMAN_APPROVAL",
  chosen_alternative_label: "Option A",
  rationale: "Because.",
  created_at: "2026-06-20T00:00:00.000Z",
  workflow_step_id: "COUNSEL-DR-1-step-3",
};

const DECISION_WITH_BASIS: CounselDecisionRecord = {
  ...DECISION_NO_BASIS,
  document_id: "DR-2",
  regulation_basis: {
    regulation_id: "OMB Circular A-11",
    section: "Section 51.3",
    source_document: "OMB Circular A-11 (2025)",
    effective_date: "2025-08-01",
  },
};

const DOC_COMPLETE: ScribeDocumentRecord = {
  document_id: "SCR-1",
  document_title: "Test Exhibit",
  workflow_step_id: "SCRIBE-DRAFT-1-step-1",
  draft_event: {
    event_type: "AGENT_STEP_COMPLETE",
    agent_id: "scribe-drafter",
    produced_at: "2026-06-20T00:00:00.000Z",
    workflow_step_id: "SCRIBE-DRAFT-1-step-1",
  },
  source_records: [
    { record_id: "S1", description: "Cost baseline", logger_event_type: "AGENT_STEP_COMPLETE", workflow_step_id: "APEX-1-step-2", recorded_at: "2026-06-19T00:00:00.000Z" },
  ],
};

const DOC_NO_SOURCES: ScribeDocumentRecord = { ...DOC_COMPLETE, document_id: "SCR-2", source_records: [] };
const DOC_NO_DRAFT: ScribeDocumentRecord = { ...DOC_COMPLETE, document_id: "SCR-3", draft_event: undefined };

const OBLIGATION: ObligationRecordRef = {
  obligation_id: "OBL-1",
  label: "Test obligation",
  program_id: "PRG-1",
  objective_id: "OBJ-1",
};

describe("tracer-engine — determinism", () => {
  it("produces the same decision chain for the same input (no randomness)", () => {
    expect(assembleDecisionChain(DECISION_WITH_BASIS)).toEqual(assembleDecisionChain(DECISION_WITH_BASIS));
  });
  it("produces the same document chain for the same input", () => {
    expect(assembleDocumentChain(DOC_COMPLETE)).toEqual(assembleDocumentChain(DOC_COMPLETE));
  });
  it("produces the same obligation chain for the same input", () => {
    expect(assembleObligationChain(OBLIGATION)).toEqual(assembleObligationChain(OBLIGATION));
  });
  it("derives a stable per-subject workflow step id", () => {
    expect(tracerWorkflowStep("DR-1")).toBe("aria-tracer-DR-1");
  });
});

describe("tracer-engine — decision chains", () => {
  it("is complete when the decision cites a governing regulation", () => {
    const chain = assembleDecisionChain(DECISION_WITH_BASIS);
    expect(chain.chain_type).toBe("decision");
    expect(chain.complete).toBe(true);
    expect(chain.orphan_reason).toBeUndefined();
    expect(chain.nodes.every((n) => n.traceable)).toBe(true);
    // Every traceable node carries a real source reference (a citation, not an assertion).
    expect(chain.nodes.every((n) => n.source_ref !== "")).toBe(true);
  });

  it("orphans the regulation half when no regulation_basis exists (real COUNSEL shape)", () => {
    const chain = assembleDecisionChain(DECISION_NO_BASIS);
    expect(chain.complete).toBe(false);
    // The decision node still traces; the regulation/source/date nodes do not.
    const decisionNode = chain.nodes.find((n) => n.kind === "decision_record")!;
    expect(decisionNode.traceable).toBe(true);
    expect(chain.nodes.filter((n) => !n.traceable).map((n) => n.kind)).toEqual([
      "regulation",
      "source_document",
      "effective_date",
    ]);
    expect(chain.orphan_reason).toMatch(/do not yet carry a regulation basis/);
  });
});

describe("tracer-engine — document chains", () => {
  it("is complete with a draft event and at least one cited source", () => {
    const chain = assembleDocumentChain(DOC_COMPLETE);
    expect(chain.chain_type).toBe("document");
    expect(chain.complete).toBe(true);
  });

  it("D-4: keeps raw Logger identifiers out of the draft node's primary content, in technical references", () => {
    const chain = assembleDocumentChain(DOC_COMPLETE);
    const draft = chain.nodes.find((n) => n.kind === "draft_event")!;
    // Primary content is human-readable — the raw event type / agent id are NOT in title or cites.
    expect(draft.title).not.toMatch(/AGENT_STEP_COMPLETE|scribe-drafter/);
    expect(draft.cites).not.toMatch(/AGENT_STEP_COMPLETE|scribe-drafter/);
    // The identifiers are preserved as secondary technical references (reconciliation #2 still holds).
    const values = (draft.technical_references ?? []).map((r) => r.value);
    expect(values).toContain("AGENT_STEP_COMPLETE");
    expect(values).toContain("scribe-drafter");
  });

  it("D-4: keeps the decision node's Logger event + decision-type code as technical references", () => {
    const chain = assembleDecisionChain(DECISION_NO_BASIS);
    const decision = chain.nodes.find((n) => n.kind === "decision_record")!;
    expect(decision.cites).not.toMatch(/HUMAN_DECISION/);
    const values = (decision.technical_references ?? []).map((r) => r.value);
    expect(values).toContain("HUMAN_DECISION");
    expect(values).toContain("HUMAN_APPROVAL"); // the decision_type code
  });

  it("D-5: every traceable SCRIBE source-lineage node carries a recorded-at timestamp", () => {
    const chain = assembleDocumentChain(DOC_COMPLETE);
    const sources = chain.nodes.filter((n) => n.kind === "source_record" && n.traceable);
    expect(sources.length).toBeGreaterThan(0);
    for (const s of sources) expect(s.timestamp).toBe("2026-06-19T00:00:00.000Z");
    // The draft node is timestamped too (produced_at).
    expect(chain.nodes.find((n) => n.kind === "draft_event")!.timestamp).toBe("2026-06-20T00:00:00.000Z");
  });

  it("orphans when the document cites no source records", () => {
    const chain = assembleDocumentChain(DOC_NO_SOURCES);
    expect(chain.complete).toBe(false);
    expect(chain.orphan_reason).toMatch(/cites no source records/);
  });

  it("orphans when there is no drafting event", () => {
    const chain = assembleDocumentChain(DOC_NO_DRAFT);
    expect(chain.complete).toBe(false);
    expect(chain.nodes.find((n) => n.kind === "draft_event")!.traceable).toBe(false);
  });
});

describe("tracer-engine — obligation chains (PPBE not yet built)", () => {
  it("returns the not-integrated message and is never complete", () => {
    const chain = assembleObligationChain(OBLIGATION);
    expect(chain.chain_type).toBe("obligation");
    expect(chain.complete).toBe(false);
    expect(chain.nodes.some((n) => n.cites === OBLIGATION_NOT_INTEGRATED_MESSAGE)).toBe(true);
  });

  it("does not trace even when a program_id string is present (entity unbuilt)", () => {
    const chain = assembleObligationChain(OBLIGATION);
    expect(chain.nodes.every((n) => !n.traceable)).toBe(true);
  });
});

describe("tracer-integration — adapters over real demo shapes", () => {
  it("lists every demo item grouped by chain type", () => {
    const items = listTraceableItems(DEMO_TRACER_DATA);
    expect(items.filter((i) => i.chain_type === "decision").length).toBe(DEMO_TRACER_DATA.decisions.length);
    expect(items.filter((i) => i.chain_type === "document").length).toBe(DEMO_TRACER_DATA.documents.length);
    // Session 33: obligations list the entity-resolved PPBE lane plus the bare references.
    expect(items.filter((i) => i.chain_type === "obligation").length).toBe(
      DEMO_TRACER_DATA.obligations.length + (DEMO_TRACER_DATA.ppbe?.obligations.length ?? 0)
    );
  });

  it("assembles a chain for a known selection and returns null for an unknown one", () => {
    const first = DEMO_TRACER_DATA.decisions[0];
    const chain = assembleChainFor(DEMO_TRACER_DATA, "decision", first.document_id);
    expect(chain).not.toBeNull();
    expect(chain!.subject_id).toBe(first.document_id);
    expect(assembleChainFor(DEMO_TRACER_DATA, "decision", "NOPE")).toBeNull();
  });

  it("surfaces the today-COUNSEL demo decision as an orphan (no regulation basis)", () => {
    // DR-COUNSEL-0007 is modeled exactly on what COUNSEL records today — it must orphan honestly.
    const chain = assembleChainFor(DEMO_TRACER_DATA, "decision", "DR-COUNSEL-0007");
    expect(chain!.complete).toBe(false);
  });

  it("traces the illustrative-basis demo decision to a complete chain", () => {
    const chain = assembleChainFor(DEMO_TRACER_DATA, "decision", "DR-COUNSEL-0008");
    expect(chain!.complete).toBe(true);
  });
});

/**
 * ppbe-exhibit-drafter tests — Session 32 (D3).
 * LLM-backed Operational agent (registry, D-P5 — the registry's prompt
 * requirement overrides docs/18 §5's "inferred no") under the PENDING
 * exhibit_drafting_system prompt. Three document modes; figure-source
 * traceability and system invisibility enforced structurally; export behind
 * the DOUBLE gate (CLEAR certification AND human sign-off) — both required,
 * stricter than the general SCRIBE gate.
 */

import type { SovereignLLMResponse } from "@sovereign/api-client";
import type { EvaluationFinding, ObligationRecord, ProgramRecord } from "@sovereign/data";
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";

import {
  PPBE_EXHIBIT_DRAFTER,
  PPBE_EXHIBIT_PROMPT_REGISTRATION,
  PPBE_DOCUMENT_MODES,
  validatePPBEExhibitDraft,
  toBudgetExhibitFields,
  isPPBEExportChannelPermitted,
  canSubmitExhibitSignOff,
  recordExhibitSignOff,
  type PPBEExhibitDraft,
} from "../src/ppbe-exhibit-contract";
import {
  exhibitWorkflowStepId,
  allowedSourceRefs,
  buildExhibitMessages,
  parseExhibitDraft,
  staticExhibitDraft,
  runExhibitDraft,
  type ExhibitDraftInput,
  type ExhibitDraftDeps,
} from "../src/ppbe-exhibit-engine";

// ---------- fixtures ----------

function program(): ProgramRecord {
  return {
    program_id: "PRG-001",
    name: "Logistics Data Interchange",
    sponsor: "PEO Logistics",
    contract_number: "W91-26-C-0001",
    classification_level: "UNCLASSIFIED",
    status: "ACTIVE",
    objective_id: "SO-2027-01",
    fiscal_year: "FY 2027",
    lifecycle_cost_estimate: 1000000,
    obligation_plan: [
      { period: "FY 2027 Q1", planned_amount: 100000 },
      { period: "FY 2027 Q2", planned_amount: 200000 },
    ],
    performance_baseline: [{ metric: "obligation rate", baseline_value: "on plan" }],
  };
}

function obligation(id: string, amount: number): ObligationRecord {
  return {
    obligation_id: id,
    program_id: "PRG-001",
    cost_code: "CC-1",
    amount,
    timestamp: "2026-07-12T15:30:00Z",
    authorizing_official: "Jane Smith",
    workflow_step_id: `ppbe-obligation-${id}`,
  };
}

function finding(id: string, feeds: boolean): EvaluationFinding {
  return {
    finding_id: id,
    program_id: "PRG-001",
    objective_id: "SO-2027-01",
    finding_type: feeds ? "on-track" : "variance",
    narrative: `Finding ${id}.`,
    feeds_planning_cycle: feeds,
    workflow_step_id: `ppbe-finding-${id}`,
  };
}

function input(over: Partial<ExhibitDraftInput> = {}): ExhibitDraftInput {
  return {
    mode: "BUDGET_EXHIBIT",
    program: program(),
    obligations: [obligation("OB-1", 90000), obligation("OB-2", 45000)],
    plan_source_step_id: "flowpath-ppbe-plan-PRG-001",
    ...over,
  };
}

function goodDraft(over: Partial<PPBEExhibitDraft> = {}): PPBEExhibitDraft {
  return {
    document_mode: "BUDGET_EXHIBIT",
    title: "Budget Exhibit — Logistics Data Interchange (FY 2027)",
    narrative:
      "The program has obligated 135000 against a planned 300000 for the fiscal year to date.",
    figures: [
      { label: "Obligation OB-1", value: 90000, source_workflow_step_id: "ppbe-obligation-OB-1" },
      { label: "Obligation OB-2", value: 45000, source_workflow_step_id: "ppbe-obligation-OB-2" },
      {
        label: "Planned obligations for FY 2027",
        value: 300000,
        source_workflow_step_id: "flowpath-ppbe-plan-PRG-001",
      },
    ],
    workflow_step_id: "ppbe-exhibit-budget_exhibit-PRG-001",
    ...over,
  };
}

function liveResponse(content: string, fallback_activated = false): SovereignLLMResponse {
  return {
    content,
    fallback_tier: fallback_activated ? "static" : "live",
    fallback_activated,
    sovereign_metadata: {
      sovereign_product: "SCRIBE",
      sovereign_version: "1.0",
      workflow_step_id: "ppbe-exhibit-budget_exhibit-PRG-001",
      agent_id: PPBE_EXHIBIT_DRAFTER,
      provider: "anthropic",
      provider_model: "claude-sonnet-4",
      tier: "standard",
      responded_at: "2026-07-13T00:00:00.000Z",
    },
  };
}

function reqCtx() {
  return {
    workflow_step_id: "ppbe-exhibit-budget_exhibit-PRG-001",
    product: "SCRIBE" as const,
    agent_id: PPBE_EXHIBIT_DRAFTER,
    tier: "standard" as const,
  };
}

function deps(over: Partial<ExhibitDraftDeps> = {}): ExhibitDraftDeps {
  return {
    complete: jest.fn().mockResolvedValue(liveResponse(JSON.stringify(goodDraft()))),
    cacheGet: jest.fn().mockReturnValue(null),
    cacheSet: jest.fn(),
    ...over,
  };
}

function fakeLogger(): { events: SovereignLogEvent[]; log: (e: SovereignLogEvent) => void } {
  const events: SovereignLogEvent[] = [];
  return { events, log: (e) => events.push(e) };
}

const REFS = allowedSourceRefs(input());
const REVIEWER = { id: "emp_001", name: "Jane Smith" };
const NOTE = "Reviewed all three figures against their source records; export is appropriate.";

// ---------- registry bindings + modes ----------

describe("registry bindings", () => {
  it("binds the AIS agent id, the PENDING prompt, and the three modes", () => {
    expect(PPBE_EXHIBIT_DRAFTER).toBe("ppbe-exhibit-drafter");
    expect(PPBE_EXHIBIT_PROMPT_REGISTRATION.file).toBe("ppbe/prompts/exhibit_drafting_system.md");
    expect(PPBE_EXHIBIT_PROMPT_REGISTRATION.status).toBe("PENDING");
    expect(PPBE_DOCUMENT_MODES).toEqual([
      "BUDGET_EXHIBIT",
      "CONGRESSIONAL_JUSTIFICATION",
      "EVALUATION_REPORT",
    ]);
  });
});

// ---------- validation: traceability + invisibility ----------

describe("validatePPBEExhibitDraft", () => {
  it("accepts a draft whose every figure cites a supplied record", () => {
    expect(validatePPBEExhibitDraft(goodDraft(), REFS).valid).toBe(true);
  });

  it("rejects a figure citing a source that was never supplied (fabricated figure)", () => {
    const bad = goodDraft();
    bad.figures[0].source_workflow_step_id = "ppbe-obligation-OB-999";
    const r = validatePPBEExhibitDraft(bad, REFS);
    expect(r.valid).toBe(false);
    expect((r as { errors: string[] }).errors.join()).toContain("fabricated figure source");
  });

  it("rejects a draft that discloses the system (invisibility rule)", () => {
    const bad = goodDraft({
      narrative: "This exhibit was prepared by SOVEREIGN's drafting engine from governed data.",
    });
    const r = validatePPBEExhibitDraft(bad, REFS);
    expect(r.valid).toBe(false);
    expect((r as { errors: string[] }).errors.join()).toContain("system-invisibility");
  });

  it("rejects a non-finite figure value and a missing narrative", () => {
    const bad = goodDraft();
    bad.figures[0].value = Number.NaN;
    expect(validatePPBEExhibitDraft(bad, REFS).valid).toBe(false);
    expect(validatePPBEExhibitDraft(goodDraft({ narrative: " " }), REFS).valid).toBe(false);
  });
});

// ---------- entity assembly + export channels ----------

describe("toBudgetExhibitFields / export channels", () => {
  it("assembles narrative_content and deduplicated source_data_lineage", () => {
    const draft = goodDraft();
    draft.figures.push({ ...draft.figures[0] }); // duplicate source
    const fields = toBudgetExhibitFields(draft);
    expect(fields.narrative_content).toBe(draft.narrative);
    expect(fields.source_data_lineage).toEqual([
      "ppbe-obligation-OB-1",
      "ppbe-obligation-OB-2",
      "flowpath-ppbe-plan-PRG-001",
    ]);
  });

  it("keeps the Output Studio web publishing path closed for PPBE modes", () => {
    expect(isPPBEExportChannelPermitted("SOVEREIGN_PRODUCT")).toBe(true);
    expect(isPPBEExportChannelPermitted("DOCUMENT_EXPORT")).toBe(true);
    expect(isPPBEExportChannelPermitted("OUTPUT_STUDIO_WEB")).toBe(false);
  });
});

// ---------- the double export gate ----------

describe("the double export gate (CLEAR + human sign-off)", () => {
  it("submit predicate requires BOTH the certification and a real note", () => {
    expect(canSubmitExhibitSignOff(true, NOTE)).toBe(true);
    expect(canSubmitExhibitSignOff(false, NOTE)).toBe(false);
    expect(canSubmitExhibitSignOff(true, "ok")).toBe(false);
    expect(canSubmitExhibitSignOff(false, "")).toBe(false);
  });

  it("blocks sign-off without CLEAR certification even with a valid note", () => {
    const logger = fakeLogger();
    const r = recordExhibitSignOff(
      goodDraft(), { program_id: "PRG-001", fiscal_year: "FY 2027" }, REFS, REVIEWER, NOTE, false, logger
    );
    expect(r.ok).toBe(false);
    expect(r.error).toContain("CLEAR");
    expect(logger.events).toHaveLength(0);
  });

  it("blocks sign-off with certification but a too-short note", () => {
    const logger = fakeLogger();
    const r = recordExhibitSignOff(
      goodDraft(), { program_id: "PRG-001", fiscal_year: "FY 2027" }, REFS, REVIEWER, "fine", true, logger
    );
    expect(r.ok).toBe(false);
    expect(logger.events).toHaveLength(0);
  });

  it("re-validates the human-edited draft — a fabricated figure blocks even a certified sign-off", () => {
    const edited = goodDraft();
    edited.figures[0].source_workflow_step_id = "ppbe-obligation-OB-999";
    const logger = fakeLogger();
    const r = recordExhibitSignOff(
      edited, { program_id: "PRG-001", fiscal_year: "FY 2027" }, REFS, REVIEWER, NOTE, true, logger
    );
    expect(r.ok).toBe(false);
    expect(r.error).toContain("fabricated figure source");
  });

  it("records a complete approval when both gates pass, emitting HUMAN_DECISION/HUMAN_APPROVAL", () => {
    const logger = fakeLogger();
    const r = recordExhibitSignOff(
      goodDraft(), { program_id: "PRG-001", fiscal_year: "FY 2027" }, REFS, REVIEWER, NOTE, true, logger
    );
    expect(r.ok).toBe(true);
    expect(r.approval).toMatchObject({
      document_mode: "BUDGET_EXHIBIT",
      approved_by: "Jane Smith",
      aria_clear_certified: true,
      data_classification_confirmed: true,
    });
    expect(logger.events).toHaveLength(1);
    const event = logger.events[0];
    expect(event.event_type).toBe("HUMAN_DECISION");
    expect(event.decision_type).toBe("HUMAN_APPROVAL");
    expect(event.actor).toBe("human");
    expect(event.workflow_step_id).toBe("ppbe-exhibit-budget_exhibit-PRG-001");
    expect(event.payload.aria_clear_certified).toBe(true);
  });

  it("a failed Logger emit blocks the sign-off (CPMI-VRS Gate 2)", () => {
    const throwing = { log: () => { throw new Error("sink down"); } };
    const r = recordExhibitSignOff(
      goodDraft(), { program_id: "PRG-001", fiscal_year: "FY 2027" }, REFS, REVIEWER, NOTE, true, throwing
    );
    expect(r.ok).toBe(false);
    expect(r.error).toContain("Gate 2");
  });
});

// ---------- engine ----------

describe("exhibit engine", () => {
  it("synthesizes a stable workflow step and collects only real source refs", () => {
    expect(exhibitWorkflowStepId(input())).toBe("ppbe-exhibit-budget_exhibit-PRG-001");
    expect([...REFS].sort()).toEqual([
      "flowpath-ppbe-plan-PRG-001",
      "ppbe-obligation-OB-1",
      "ppbe-obligation-OB-2",
    ]);
    const noPlan = allowedSourceRefs(input({ plan_source_step_id: undefined }));
    expect(noPlan.has("flowpath-ppbe-plan-PRG-001")).toBe(false);
  });

  it("builds the two-message conversation with governed data", () => {
    const messages = buildExhibitMessages(input(), "SYS");
    expect(messages[0]).toEqual({ role: "system", content: "SYS" });
    const payload = JSON.parse(messages[1].content);
    expect(payload.document_mode).toBe("BUDGET_EXHIBIT");
    expect(payload.obligation_records).toHaveLength(2);
  });

  it("parses only the requested mode", () => {
    const wrongMode = goodDraft({ document_mode: "EVALUATION_REPORT" });
    expect(parseExhibitDraft(JSON.stringify(wrongMode), "BUDGET_EXHIBIT", REFS)).toBeNull();
    expect(
      parseExhibitDraft("```json\n" + JSON.stringify(goodDraft()) + "\n```", "BUDGET_EXHIBIT", REFS)
        ?.title
    ).toContain("Budget Exhibit");
  });

  it("static tier cites only real sources and validates in every mode", () => {
    for (const mode of PPBE_DOCUMENT_MODES) {
      const staticInput = input({
        mode,
        findings: mode === "EVALUATION_REPORT" ? [finding("EF-1", true), finding("EF-2", false)] : undefined,
      });
      const draft = staticExhibitDraft(staticInput);
      expect(draft.document_mode).toBe(mode);
      expect(validatePPBEExhibitDraft(draft, allowedSourceRefs(staticInput)).valid).toBe(true);
    }
  });

  it("static tier without a plan source omits plan figures rather than inventing a source", () => {
    const noPlan = input({ plan_source_step_id: undefined });
    const draft = staticExhibitDraft(noPlan);
    expect(draft.figures.every((f) => f.source_workflow_step_id.startsWith("ppbe-obligation-"))).toBe(true);
  });

  it("static evaluation report treats zero findings as a fact, not as health", () => {
    const draft = staticExhibitDraft(input({ mode: "EVALUATION_REPORT", findings: [] }));
    expect(draft.narrative).toContain("not evidence of performance");
  });

  it("live → cache → static tier ladder", async () => {
    const live = await runExhibitDraft(input(), "P", reqCtx(), deps());
    expect(live.tier).toBe("live");

    const cached = await runExhibitDraft(
      input(), "P", reqCtx(),
      deps({
        complete: jest.fn().mockRejectedValue(new Error("down")),
        cacheGet: jest.fn().mockReturnValue(goodDraft()),
      })
    );
    expect(cached.tier).toBe("cache");
    expect(cached.detail).toBe("down");

    const fabricating = goodDraft();
    fabricating.figures[0].source_workflow_step_id = "ppbe-obligation-OB-999";
    const staticOutcome = await runExhibitDraft(
      input(), "P", reqCtx(),
      deps({ complete: jest.fn().mockResolvedValue(liveResponse(JSON.stringify(fabricating))) })
    );
    expect(staticOutcome.tier).toBe("static");
    expect(staticOutcome.detail).toBe("live_response_failed_draft_validation");
  });

  it("caches a good live draft and makes exactly one live attempt", async () => {
    const d = deps();
    await runExhibitDraft(input(), "P", reqCtx(), d);
    expect(d.cacheSet).toHaveBeenCalledTimes(1);
    expect(d.complete).toHaveBeenCalledTimes(1);
  });
});

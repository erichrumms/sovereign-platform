/**
 * ppbe-coordination-assistant tests — Session 32 (D4).
 * LLM-backed Operational agent (registry, D-P5 — the registry's prompt
 * requirement overrides docs/18 §5's "inferred no"). Deterministic deadline
 * monitoring routes PPBE_ANOMALY findings to VIGIL; the LLM digest is advisory
 * with fabricated item references rejected structurally; the ONLY close path
 * requires a human operator and a successful Logger emit.
 */

import type { SovereignLLMResponse } from "@sovereign/api-client";
import type { SovereignLogEvent } from "../../sovereign-shell/shell-contract";

import {
  PPBE_COORDINATION_ASSISTANT_AGENT_ID,
  PPBE_COORDINATION_PROMPT_REGISTRATION,
  PPBE_COORDINATION_ADVISORY_LABEL,
  detectCoordinationFailures,
  closeCoordinationItem,
  validateCoordinationDigest,
  buildCoordinationMessages,
  parseCoordinationDigest,
  staticCoordinationDigest,
  runCoordinationTracking,
  coordinationWorkflowStep,
  type CoordinationItem,
  type CoordinationTrackingInput,
  type CoordinationDigest,
  type CoordinationDeps,
} from "../src/ppbe-coordination-assistant";

const NOW = "2026-07-13T12:00:00Z";

function item(over: Partial<CoordinationItem> = {}): CoordinationItem {
  return {
    item_id: "CI-1",
    kind: "ACTION_ITEM",
    description: "Assemble the Phase 2 evidence base for PRG-001",
    responsible_role: "PROGRAM_MANAGER",
    due_by: "2026-07-10T00:00:00Z",
    status: "OPEN",
    program_id: "PRG-001",
    phase: 2,
    workflow_step_id: "ppbe-coordination-CI-1",
    ...over,
  };
}

function input(over: Partial<CoordinationTrackingInput> = {}): CoordinationTrackingInput {
  return {
    items: [
      item(),
      item({ item_id: "CI-2", kind: "PHASE_TRANSITION", description: "Phase 2 to 3 handoff", due_by: "2026-07-11T00:00:00Z" }),
      item({ item_id: "CI-3", kind: "DECISION_COMMITMENT", due_by: "2026-08-01T00:00:00Z" }),
    ],
    notes: "Standup notes: the evidence base was completed and filed Friday; handoff review is scheduled.",
    ...over,
  };
}

function goodDigest(over: Partial<CoordinationDigest> = {}): CoordinationDigest {
  return {
    summary: "The notes report the evidence base complete; the handoff remains open and past due.",
    update_proposals: [
      { item_id: "CI-1", proposed_status: "RESOLVED", rationale: "The notes state the evidence base was completed and filed Friday." },
    ],
    risks_flagged: ["The phase 2 to 3 handoff is past due and the notes only say a review is scheduled."],
    advisory_label: PPBE_COORDINATION_ADVISORY_LABEL,
    workflow_step_id: "ppbe-coordination-digest-3-items",
    schema_valid: true,
    ...over,
  };
}

function liveResponse(content: string, fallback_activated = false): SovereignLLMResponse {
  return {
    content,
    fallback_tier: fallback_activated ? "static" : "live",
    fallback_activated,
    sovereign_metadata: {
      sovereign_product: "NEXUS",
      sovereign_version: "1.0",
      workflow_step_id: "ppbe-coordination-digest-3-items",
      agent_id: PPBE_COORDINATION_ASSISTANT_AGENT_ID,
      provider: "anthropic",
      provider_model: "claude-sonnet-4",
      tier: "standard",
      responded_at: "2026-07-13T00:00:00.000Z",
    },
  };
}

function reqCtx() {
  return {
    workflow_step_id: "ppbe-coordination-digest-3-items",
    product: "NEXUS" as const,
    agent_id: PPBE_COORDINATION_ASSISTANT_AGENT_ID,
    tier: "standard" as const,
  };
}

function deps(over: Partial<CoordinationDeps> = {}): CoordinationDeps {
  return {
    complete: jest.fn().mockResolvedValue(liveResponse(JSON.stringify(goodDigest()))),
    ...over,
  };
}

function fakeLogger(): { events: SovereignLogEvent[]; log: (e: SovereignLogEvent) => void } {
  const events: SovereignLogEvent[] = [];
  return { events, log: (e) => events.push(e) };
}

// ---------- registry bindings ----------

describe("registry bindings", () => {
  it("binds the AIS agent id and the PENDING prompt registration", () => {
    expect(PPBE_COORDINATION_ASSISTANT_AGENT_ID).toBe("ppbe-coordination-assistant");
    expect(PPBE_COORDINATION_PROMPT_REGISTRATION.file).toBe("ppbe/prompts/coordination_system.md");
    expect(PPBE_COORDINATION_PROMPT_REGISTRATION.status).toBe("PENDING");
  });
});

// ---------- deterministic monitoring ----------

describe("detectCoordinationFailures", () => {
  it("flags every OPEN item past due, with kind-appropriate anomaly types and severities", () => {
    const findings = detectCoordinationFailures(input().items, NOW);
    expect(findings).toHaveLength(2);
    const byId = Object.fromEntries(findings.map((f) => [f.item_id, f]));
    expect(byId["CI-1"].anomaly_type).toBe("MISSED_DEADLINE");
    expect(byId["CI-1"].severity).toBe("P3");
    expect(byId["CI-2"].anomaly_type).toBe("OVERDUE_PHASE_TRANSITION");
    expect(byId["CI-2"].severity).toBe("P1");
    expect(findings.every((f) => f.observation_only === true)).toBe(true);
    expect(findings.every((f) => f.workflow_step_id.startsWith("ppbe-coordination-"))).toBe(true);
  });

  it("ignores RESOLVED items and items not yet due; a lapsed commitment is P2", () => {
    const items = [
      item({ status: "RESOLVED" }),
      item({ item_id: "CI-4", kind: "DECISION_COMMITMENT", due_by: "2026-07-01T00:00:00Z" }),
      item({ item_id: "CI-5", kind: "CALENDAR_OBLIGATION", due_by: "2026-12-01T00:00:00Z" }),
    ];
    const findings = detectCoordinationFailures(items, NOW);
    expect(findings).toHaveLength(1);
    expect(findings[0].anomaly_type).toBe("LAPSED_COMMITMENT");
    expect(findings[0].severity).toBe("P2");
  });

  it("is deterministic — same input, same output", () => {
    expect(detectCoordinationFailures(input().items, NOW)).toEqual(
      detectCoordinationFailures(input().items, NOW)
    );
  });
});

// ---------- human-authorized close ----------

describe("closeCoordinationItem", () => {
  const OPERATOR = { id: "emp_001", name: "Jane Smith" };
  const NOTE = "Evidence base confirmed filed in the program record.";

  it("closes with a human, a real note, and a successful HUMAN_DECISION emit", () => {
    const logger = fakeLogger();
    const r = closeCoordinationItem(item(), OPERATOR, NOTE, logger);
    expect(r.ok).toBe(true);
    expect(r.item.status).toBe("RESOLVED");
    expect(logger.events).toHaveLength(1);
    expect(logger.events[0].event_type).toBe("HUMAN_DECISION");
    expect(logger.events[0].decision_type).toBe("HUMAN_APPROVAL");
    expect(logger.events[0].actor).toBe("human");
    expect(logger.events[0].product).toBe("NEXUS");
  });

  it("blocks a short note and an already-resolved item, and never mutates its input", () => {
    const logger = fakeLogger();
    const original = item();
    expect(closeCoordinationItem(original, OPERATOR, "done", logger).ok).toBe(false);
    expect(closeCoordinationItem(item({ status: "RESOLVED" }), OPERATOR, NOTE, logger).ok).toBe(false);
    expect(logger.events).toHaveLength(0);
    expect(original.status).toBe("OPEN");
  });

  it("a failed Logger emit blocks the close (CPMI-VRS Gate 2)", () => {
    const throwing = { log: () => { throw new Error("sink down"); } };
    const r = closeCoordinationItem(item(), OPERATOR, NOTE, throwing);
    expect(r.ok).toBe(false);
    expect(r.error).toContain("Gate 2");
    expect(r.item.status).toBe("OPEN");
  });
});

// ---------- digest validation + parsing ----------

describe("validateCoordinationDigest / parseCoordinationDigest", () => {
  it("accepts a digest proposing only against tracked items", () => {
    expect(validateCoordinationDigest(goodDigest(), input().items).valid).toBe(true);
  });

  it("rejects fabricated item references, wrong labels, and bad statuses", () => {
    const fabricated = goodDigest({
      update_proposals: [{ item_id: "CI-404", proposed_status: "RESOLVED", rationale: "notes" }],
    });
    const r = validateCoordinationDigest(fabricated, input().items);
    expect(r.valid).toBe(false);
    expect((r as { errors: string[] }).errors.join()).toContain("fabricated reference");

    expect(validateCoordinationDigest(goodDigest({ advisory_label: "AI" }), input().items).valid).toBe(false);
    const badStatus = goodDigest();
    (badStatus.update_proposals[0] as { proposed_status: string }).proposed_status = "CLOSED";
    expect(validateCoordinationDigest(badStatus, input().items).valid).toBe(false);
  });

  it("parses fenced JSON; rejects garbage and schema_valid:false", () => {
    expect(
      parseCoordinationDigest("```json\n" + JSON.stringify(goodDigest()) + "\n```", input().items)
        ?.advisory_label
    ).toBe(PPBE_COORDINATION_ADVISORY_LABEL);
    expect(parseCoordinationDigest("nope", input().items)).toBeNull();
    expect(
      parseCoordinationDigest(JSON.stringify(goodDigest({ schema_valid: false })), input().items)
    ).toBeNull();
  });
});

// ---------- static digest + engine ----------

describe("staticCoordinationDigest / runCoordinationTracking", () => {
  it("static digest proposes NOTHING and says the notes were not read", () => {
    const digest = staticCoordinationDigest(input(), NOW);
    expect(digest.update_proposals).toEqual([]);
    expect(digest.summary).toContain("NOT read");
    expect(digest.risks_flagged).toHaveLength(2);
    expect(validateCoordinationDigest(digest, input().items).valid).toBe(true);
  });

  it("returns the live digest when it validates; falls to static otherwise", async () => {
    const live = await runCoordinationTracking(input(), NOW, "P", reqCtx(), deps());
    expect(live.tier).toBe("live");
    expect(live.digest.update_proposals).toHaveLength(1);

    const invalid = await runCoordinationTracking(
      input(), NOW, "P", reqCtx(),
      deps({ complete: jest.fn().mockResolvedValue(liveResponse("garbage")) })
    );
    expect(invalid.tier).toBe("static");

    const threw = await runCoordinationTracking(
      input(), NOW, "P", reqCtx(),
      deps({ complete: jest.fn().mockRejectedValue(new Error("down")) })
    );
    expect(threw.tier).toBe("static");
    expect(threw.detail).toBe("down");
  });

  it("makes exactly one live attempt and synthesizes a stable workflow step", async () => {
    const complete = jest.fn().mockRejectedValue(new Error("down"));
    await runCoordinationTracking(input(), NOW, "P", reqCtx(), { complete });
    expect(complete).toHaveBeenCalledTimes(1);
    expect(coordinationWorkflowStep(input())).toBe("ppbe-coordination-digest-3-items");
    expect(coordinationWorkflowStep(input({ workflowStepId: "custom" }))).toBe("custom");
  });
});

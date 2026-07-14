/**
 * e2e — ppbe-live-smoke.test.ts (Session 35, Part 1).
 *
 * THE PPBE LIVE-CALL SMOKE TEST. Every PPBE prompt was approved July 13, 2026
 * having only ever run against fake models or static tiers. This harness gives
 * each of the four agents its first controlled live-model exposure — one call
 * each against the canonical Session 33 seed — and judges the output with the
 * agent's REAL validator (the runners embed it: tier "live" is only returned
 * when the parsed output validates).
 *
 * TWO HALVES:
 *
 * 1. FAIL-CLOSED REGRESSION (always runs, no network): the live provider is
 *    simulated unavailable. Each runner must degrade to its labeled static
 *    tier — schema-valid, advisory-labeled, no raw error. This is the
 *    platform's fail-closed design under permanent regression, exercised for
 *    the first time against the REAL approved prompt files and the FULL seed.
 *
 * 2. LIVE (opt-in, network): runs ONLY when BOTH are set —
 *        RUN_PPBE_LIVE_SMOKE=1  and  ANTHROPIC_API_KEY=<key>
 *    e.g.  RUN_PPBE_LIVE_SMOKE=1 ANTHROPIC_API_KEY=sk-... npm run test:e2e -- ppbe-live-smoke
 *    Never runs in the standing suite; the suite stays hermetic.
 *
 * VERDICT SEMANTICS (per the Session 35 opening prompt): tier "live" = the
 * output survived the strict validator — PASS CLEAN. tier "static" with a
 * detail = the live output failed but the platform fell back honestly — a
 * PASS on the fail-closed design, and the printed detail is the prompt-tuning
 * signal. A thrown error is the only real failure, and the runners are built
 * never to throw.
 *
 * CONFIG NOTE (finding for the handoff): sovereign-api-client's default
 * max_tokens is 1,000 — too small for a multi-finding JSON report; a truncated
 * response fails JSON.parse and would read as a validator failure. The harness
 * overrides to 4,096 (and 120 s timeout). Any production host wiring for these
 * agents must do the same.
 *
 * Constraint #9: the harness refuses to run any prompt whose on-disk STATUS is
 * not APPROVED. The registration-metadata HTML comment is stripped before the
 * prompt is sent — it is registry bookkeeping, not prompt content.
 */

import * as fs from "fs";
import * as path from "path";

import {
  SYNTH_PPBE_AS_OF,
  SYNTH_PPBE_FINDINGS,
  SYNTH_PPBE_OBLIGATIONS,
  SYNTH_PPBE_PROGRAMS,
} from "@sovereign/data";

import { createSovereignClient } from "@sovereign/api-client";
import type {
  SovereignMessage,
  SovereignRequestContext,
  SovereignLLMResponse,
} from "@sovereign/api-client";

import {
  runEvidenceSynthesis,
  validatePPBESynthesisReport,
  PPBE_ADVISORY_LABEL,
} from "../../module-apex/src/ppbe-evidence-synthesizer";
import {
  runScenarioAnalysis,
  validatePPBEScenarioReport,
  PPBE_SCENARIO_LABEL,
} from "../../module-apex/src/ppbe-scenario-analyst";
import {
  runExhibitDraft,
  allowedSourceRefs,
  type ExhibitDraftInput,
} from "../../module-scribe/src/ppbe-exhibit-engine";
import { validatePPBEExhibitDraft } from "../../module-scribe/src/ppbe-exhibit-contract";
import {
  runCoordinationTracking,
  validateCoordinationDigest,
} from "../../module-nexus/src/ppbe-coordination-assistant";
import {
  SYNTH_PPBE_COORDINATION_ITEMS,
  SYNTH_PPBE_MEETING_NOTES,
} from "../../module-nexus/src/ppbe-synthetic-coordination";

// ============================================================
// PROMPTS — the four APPROVED registry files, loaded from disk
// ============================================================

const PROMPT_DIR = path.resolve(__dirname, "../../ppbe/prompts");

/** Load a registered prompt; refuse anything not APPROVED (Constraint #9). */
function loadApprovedPrompt(file: string): string {
  const raw = fs.readFileSync(path.join(PROMPT_DIR, file), "utf8");
  if (!/STATUS:\s*APPROVED/.test(raw)) {
    throw new Error(`${file}: STATUS is not APPROVED — the smoke test must not run it`);
  }
  // Strip the leading registration-metadata HTML comment; the prompt body follows it.
  return raw.replace(/^<!--[\s\S]*?-->\s*/, "");
}

const PROMPTS = {
  synthesis: "evidence_synthesis_system.md",
  scenario: "scenario_analysis_system.md",
  exhibit: "exhibit_drafting_system.md",
  coordination: "coordination_system.md",
} as const;

// ============================================================
// INPUTS — the canonical Session 33 seed (ALPHA…ECHO), unmodified
// ============================================================

const ALPHA = SYNTH_PPBE_PROGRAMS.find((p) => p.program_id === "SYNTH-PRG-ALPHA")!;
const ALPHA_OBLIGATIONS = SYNTH_PPBE_OBLIGATIONS.filter(
  (o) => o.program_id === "SYNTH-PRG-ALPHA"
);

const synthesisInput = {
  findings: [...SYNTH_PPBE_FINDINGS],
  programs: [], // evidence base = the findings; program ids validate from them
  fiscal_context: "Fiscal year 2027 programming review",
};

const scenarioInput = {
  programs: [...SYNTH_PPBE_PROGRAMS],
  fiscal_context: "Fiscal year 2027 portfolio programming decision",
};

const exhibitInput: ExhibitDraftInput = {
  mode: "BUDGET_EXHIBIT",
  program: ALPHA,
  obligations: ALPHA_OBLIGATIONS,
};

const coordinationInput = {
  items: [...SYNTH_PPBE_COORDINATION_ITEMS],
  notes: SYNTH_PPBE_MEETING_NOTES,
};

const ctx = (agentId: string, product: "APEX" | "SCRIBE" | "NEXUS", step: string): SovereignRequestContext =>
  ({ workflow_step_id: step, product, agent_id: agentId, tier: "standard" }) as SovereignRequestContext;

// ============================================================
// RESULT COLLECTION — printed for the session handoff
// ============================================================

interface SmokeResult {
  agent: string;
  mode: "fallback-regression" | "live";
  tier: string;
  validatorPassed: boolean;
  detail?: string;
}
const results: SmokeResult[] = [];

afterAll(() => {
  // The handoff-facing summary. Plain table, one line per call.
  // eslint-disable-next-line no-console
  console.log(
    "\nPPBE SMOKE SUMMARY\n" +
      results
        .map(
          (r) =>
            `  ${r.agent.padEnd(28)} ${r.mode.padEnd(20)} tier=${r.tier.padEnd(7)} ` +
            `validator=${r.validatorPassed ? "PASS" : "FAIL"}${r.detail ? `  detail: ${r.detail}` : ""}`
        )
        .join("\n") +
      "\n"
  );
});

// ============================================================
// HALF 1 — FAIL-CLOSED REGRESSION (always runs, no network)
// ============================================================

const deadProvider = {
  complete: async (): Promise<SovereignLLMResponse> => {
    throw new Error("live provider unavailable (smoke: fail-closed half)");
  },
};

describe("PPBE smoke — fail-closed half: every agent degrades honestly, never errors", () => {
  it("evidence synthesizer falls back to a labeled, validating static report", async () => {
    const outcome = await runEvidenceSynthesis(
      synthesisInput,
      loadApprovedPrompt(PROMPTS.synthesis),
      ctx("ppbe-evidence-synthesizer", "APEX", "smoke-ppbe-synthesis"),
      deadProvider
    );
    const valid = validatePPBESynthesisReport(outcome.report, synthesisInput).valid;
    results.push({ agent: "ppbe-evidence-synthesizer", mode: "fallback-regression", tier: outcome.tier, validatorPassed: valid, detail: outcome.detail });
    expect(outcome.tier).toBe("static");
    expect(valid).toBe(true);
    expect(outcome.report.advisory_label).toBe(PPBE_ADVISORY_LABEL);
  });

  it("scenario analyst falls back to a labeled, two-alternative static report", async () => {
    const outcome = await runScenarioAnalysis(
      scenarioInput,
      loadApprovedPrompt(PROMPTS.scenario),
      ctx("ppbe-scenario-analyst", "APEX", "smoke-ppbe-scenario"),
      deadProvider
    );
    const valid = validatePPBEScenarioReport(outcome.report, scenarioInput.programs).valid;
    results.push({ agent: "ppbe-scenario-analyst", mode: "fallback-regression", tier: outcome.tier, validatorPassed: valid, detail: outcome.detail });
    expect(outcome.tier).toBe("static");
    expect(valid).toBe(true);
    expect(outcome.report.scenario_label).toBe(PPBE_SCENARIO_LABEL);
    expect(outcome.report.scenarios.length).toBeGreaterThanOrEqual(2);
  });

  it("exhibit drafter falls back to a static draft whose every figure has a real source", async () => {
    const outcome = await runExhibitDraft(
      exhibitInput,
      loadApprovedPrompt(PROMPTS.exhibit),
      ctx("ppbe-exhibit-drafter", "SCRIBE", "smoke-ppbe-exhibit-alpha"),
      { ...deadProvider, cacheGet: () => null, cacheSet: () => undefined }
    );
    const valid = validatePPBEExhibitDraft(outcome.draft, allowedSourceRefs(exhibitInput)).valid;
    results.push({ agent: "ppbe-exhibit-drafter", mode: "fallback-regression", tier: outcome.tier, validatorPassed: valid, detail: outcome.detail });
    expect(outcome.tier).toBe("static");
    expect(valid).toBe(true);
  });

  it("coordination assistant falls back to a digest that proposes nothing", async () => {
    const outcome = await runCoordinationTracking(
      coordinationInput,
      SYNTH_PPBE_AS_OF,
      loadApprovedPrompt(PROMPTS.coordination),
      ctx("ppbe-coordination-assistant", "NEXUS", "smoke-ppbe-coordination"),
      deadProvider
    );
    const valid = validateCoordinationDigest(outcome.digest, coordinationInput.items).valid;
    results.push({ agent: "ppbe-coordination-assistant", mode: "fallback-regression", tier: outcome.tier, validatorPassed: valid, detail: outcome.detail });
    expect(outcome.tier).toBe("static");
    expect(valid).toBe(true);
    expect(outcome.digest.update_proposals).toHaveLength(0); // the LLM is the only source of proposals
  });
});

// ============================================================
// HALF 2 — LIVE (opt-in): one real call per agent, real validators
// ============================================================

const LIVE = process.env.RUN_PPBE_LIVE_SMOKE === "1" && !!process.env.ANTHROPIC_API_KEY;
const describeLive = LIVE ? describe : describe.skip;

describeLive("PPBE smoke — LIVE half: first real-model exposure of the four approved prompts", () => {
  jest.setTimeout(180_000);

  // One production-path client for all four calls, constructed lazily — a
  // describe.skip body still executes at collection time, and the factory
  // rightly throws without a key. max_tokens raised from the 1,000 default —
  // a multi-finding JSON report truncates at 1,000 (see header).
  let client: ReturnType<typeof createSovereignClient> | undefined;
  const live = {
    complete: (m: SovereignMessage[], c: SovereignRequestContext) => {
      client ??= createSovereignClient(
        { tier: "standard" },
        {
          api_key_anthropic: process.env.ANTHROPIC_API_KEY!,
          max_tokens: 4096,
          timeout_ms: 120_000,
        }
      );
      return client.complete(m, c);
    },
  };

  it("ppbe-evidence-synthesizer — one live synthesis over the seeded findings", async () => {
    const outcome = await runEvidenceSynthesis(
      synthesisInput,
      loadApprovedPrompt(PROMPTS.synthesis),
      ctx("ppbe-evidence-synthesizer", "APEX", "smoke-live-ppbe-synthesis"),
      live
    );
    const valid = validatePPBESynthesisReport(outcome.report, synthesisInput).valid;
    results.push({ agent: "ppbe-evidence-synthesizer", mode: "live", tier: outcome.tier, validatorPassed: valid, detail: outcome.detail });
    // tier "live" = validator passed on real model output. tier "static" = the
    // fail-closed design worked; the detail line is the prompt-tuning signal.
    expect(["live", "static"]).toContain(outcome.tier);
    expect(valid).toBe(true);
  });

  it("ppbe-scenario-analyst — one live scenario request over the seeded portfolio", async () => {
    const outcome = await runScenarioAnalysis(
      scenarioInput,
      loadApprovedPrompt(PROMPTS.scenario),
      ctx("ppbe-scenario-analyst", "APEX", "smoke-live-ppbe-scenario"),
      live
    );
    const valid = validatePPBEScenarioReport(outcome.report, scenarioInput.programs).valid;
    results.push({ agent: "ppbe-scenario-analyst", mode: "live", tier: outcome.tier, validatorPassed: valid, detail: outcome.detail });
    expect(["live", "static"]).toContain(outcome.tier);
    expect(valid).toBe(true);
  });

  it("ppbe-exhibit-drafter — one live Budget Exhibit draft for ALPHA (the clean example)", async () => {
    const outcome = await runExhibitDraft(
      exhibitInput,
      loadApprovedPrompt(PROMPTS.exhibit),
      ctx("ppbe-exhibit-drafter", "SCRIBE", "smoke-live-ppbe-exhibit-alpha"),
      { ...live, cacheGet: () => null, cacheSet: () => undefined }
    );
    const valid = validatePPBEExhibitDraft(outcome.draft, allowedSourceRefs(exhibitInput)).valid;
    results.push({ agent: "ppbe-exhibit-drafter", mode: "live", tier: outcome.tier, validatorPassed: valid, detail: outcome.detail });
    expect(["live", "static"]).toContain(outcome.tier);
    expect(valid).toBe(true);
  });

  it("ppbe-coordination-assistant — one live digest against the seeded meeting-notes corpus", async () => {
    const outcome = await runCoordinationTracking(
      coordinationInput,
      SYNTH_PPBE_AS_OF,
      loadApprovedPrompt(PROMPTS.coordination),
      ctx("ppbe-coordination-assistant", "NEXUS", "smoke-live-ppbe-coordination"),
      live
    );
    const valid = validateCoordinationDigest(outcome.digest, coordinationInput.items).valid;
    results.push({ agent: "ppbe-coordination-assistant", mode: "live", tier: outcome.tier, validatorPassed: valid, detail: outcome.detail });
    expect(["live", "static"]).toContain(outcome.tier);
    expect(valid).toBe(true);
  });
});

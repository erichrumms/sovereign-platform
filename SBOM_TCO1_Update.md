# SOVEREIGN Platform — SBOM Registry
## Version 1.45 · August 2, 2026

**Supersedes:** v1.44 (covered through Session 76)
**Adds:** GD-31 Build Session 1 (Token & Cost Telemetry)

---

## 1 — Shell Contract / Agent / Prompt Registry History

| Version | Session | Change | SHA-256 (both copies) |
|---|---|---|---|
| v1.24 | 75 (GD-30) | Added `point_of_contact?: { name, role }` to `ProgramStatusSnapshot`. | `487054e2b66473ccbbd87e333db70910127549570ce449210a29afd444b4152f` |
| **v1.25** | **GD-31 Build Session 1** | **Added optional `token_usage?` field to `SovereignLogEvent` (scoped to `AGENT_STEP_COMPLETE` events only). Carries `input_tokens: number`, `output_tokens: number`, and optional `estimated_cost_usd?: number`. Absent (never zero) when FALLBACK_ACTIVATED served the response. Standing Constraint #7 (export count): NOT incremented — widens existing member, not a new context export.** | **`d22694a34d9621f620d365dfa1bb9838685bea684a1a2a2a694e2aa1c77693f7`** |

**Agents: 44 total — unchanged.**

**Prompts: 20 = 19 approved + 1 pending — unchanged.**

---

## 2 — Third-Party Dependencies

**Zero new production dependencies** — static rate table (`sovereign-api-client/src/token-cost.ts`) is a module-internal file with no external imports. Zero-new-production-dependency streak continues unbroken from Session 62 through this session.

**Audit posture:** unchanged — 5 vulnerabilities (1 moderate, 4 high) all in dev-tooling dependencies, pre-existing.

---

## 3 — Test Totals

| Close point | JS/TS | e2e | Python | Platform Total | Confidence |
|---|---|---|---|---|---|
| Session 76 | 1,793 | 149 (4 skip) | 195 | 2,137 | High |
| GD-31 Build Session 1 | 1,811 | 149 (4 skip) | 195 | 2,155 | High — full 14-package run at close; +18 convergence tests (2 per hookable emission site × 9 sites) |
| **GD-31 Build Session 1 — follow-on (NexusApp close)** | **1,813** | 149 (4 skip) | 195 | **2,157** | **High — full 14-package run at follow-on close; module-nexus 166→168 (+2 convergence tests)** |

---

## 4 — GD-31 Build Session 1 Component Changes

**Shell Contract** — v1.24 → v1.25. `token_usage?` added to `SovereignLogEvent`.
Both copies verified identical (SHA-256 above).

**New file** — `sovereign-api-client/src/token-cost.ts`. Versioned static rate table
for estimated LLM cost computation. Pricing date August 2026. `computeEstimatedCostUSD`
exported via `sovereign-api-client/src/index.ts`.

**Engines updated (9)** — `BriefOutcome`, `TriageOutcome`, `DraftOutcome`, `StyleOutcome`,
`IntermediateOutcome`, `TTDraftOutcome`, `ReasoningOutcome`, `ExplanationOutcome` each
gain `usage?` field; live-tier return includes `usage: response.usage`. `BenchmarkReport`
gains `total_usage?` (sum across all live scenarios).

**Hooks updated (10 emission sites)** — All 10 in-scope `AGENT_STEP_COMPLETE` emission
sites now thread `token_usage` from real provider usage. 7 hooks received full
`UseXOptions` injection pattern; 2 already had injection; NexusApp travelDrafter wired
directly at composition root.

**Tests** — 18 new convergence tests across 9 hook test files (3 new files, 6 existing).
All 1,811 JS/TS tests pass at Build Session 1 close; 1,813 at follow-on close (+2 NexusApp tests).

**Out-of-scope sites** — `tracer-integration.ts` (no LLM call), `security-query.ts`
(synthetic data), counsel `REASONING_STEP_COMPLETE` hooks (wrong event type), two nexus
deterministic engines (no LLM call). All recorded in session Handoff.

**Follow-on (NexusApp injection seam)** — `NexusAppProps` gains optional
`travelDrafterComplete?: TTDraftDeps["complete"]`. In `travelDrafter` useMemo,
`deps.complete` now uses `travelDrafterComplete ?? (default client)`. useMemo deps
updated from `[ctx]` to `[ctx, travelDrafterComplete]`. Two convergence tests added
to `module-nexus/tests/NexusApp.test.tsx` (live tier populates token_usage; fallback
leaves it absent). The open item disclosed in the Session 1 Handoff is closed.

---

## 5 — Lineage and Audit Note

v1.45 extends v1.44's methodology unchanged: test count independently re-derived (full
14-package run at close), not taken from any session self-report.

**Next merge point:** GD-31 Build Session 2 (docs/32, SysAdmin Cost Dashboard) — now
unblocked.

---

*SOVEREIGN Platform — SBOM Registry v1.45 · August 2, 2026*
*Supersedes v1.44 (through Session 76) · Adds GD-31 Build Session 1*
*Pre-Decisional · Internal Working Document*

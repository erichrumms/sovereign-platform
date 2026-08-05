# SOVEREIGN Platform — SBOM Registry
## Version 1.50 · August 4, 2026

**Supersedes:** v1.49 (Session 81 — platform-wide agent-plumbing audit, no code changes)
**Adds:** Session 82 — Gate 2 verification + F1/F2 fixes

---

## 1 — Shell Contract / Agent / Prompt Registry History

| Version | Session | Change | SHA-256 (both copies) |
|---|---|---|---|
| v1.26 | GD-33 Build Session | Added `reports_to?: string` to `SovereignUser`. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| v1.26 | Session 80 | Unchanged. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| v1.26 | Session 81 | Unchanged. Re-verified at close — both copies identical, matching recorded value. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| **v1.26** | **Session 82** | **Unchanged. Re-verified at close — both copies identical, matching recorded value.** | **`42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b`** |

**Agents: 44 total — unchanged.**

**Prompts: 20 = 19 approved + 1 pending — unchanged.**

---

## 2 — Third-Party Dependencies

**Zero new production dependencies.** Session 82 fixed two pre-existing findings (F1 and F2
from the Session 81 audit) and added one test — no `npm install`, no `package.json` changes,
no new imports in production source. Zero-new-production-dependency streak continues
unbroken from Session 62.

**Audit posture:** unchanged — 5 vulnerabilities (1 moderate, 4 high) all in
dev-tooling dependencies, pre-existing.

---

## 3 — Test Totals

| Close point | JS/TS | e2e | Python | Platform Total | Confidence |
|---|---|---|---|---|---|
| Session 80 | 1,862 | 149 (4 skip) | 195 (carried) | 2,206 | High |
| Session 81 | 1,862 | 149 (4 skip) | 195 (full pytest run) | 2,206 | High |
| **Session 82** | **1,863** | **149 (4 skip)** | **195** | **2,207** | **High — full 14-package run + e2e + full pytest at close; +1 test (new Gate 2 case in module-nexus)** |

Per-package JS/TS breakdown (unchanged from S81 except nexus):

| Package | S81 | S82 | Delta |
|---|---|---|---|
| sovereign-data | 163 | 163 | — |
| sovereign-api-client | 181 | 181 | — |
| sovereign-shell | 19 | 19 | — |
| module-counsel | 100 | 100 | — |
| module-scribe | 240 | 240 | — |
| module-vigil | 215 | 215 | — |
| module-lens | 63 | 63 | — |
| module-cpmi | 62 | 62 | — |
| module-agentos | 89 | 89 | — |
| module-nexus | 168 | **169** | **+1** |
| module-apex | 228 | 228 | — |
| module-flowpath | 151 | 151 | — |
| module-aria | 150 | 150 | — |
| module-workspace | 33 | 33 | — |
| **Total (14 packages)** | **1,862** | **1,863** | **+1** |

`tsc --noEmit`: **all 15 workspaces clean**, including `e2e` (F2 fixed — pre-existing
TS6133 removed).

---

## 4 — Session 82 Component Changes

| File | Change |
|------|--------|
| `module-nexus/src/NexusApp.tsx` | F1 fix: wrapped `AGENT_STEP_START` (lines 129–141), and `FALLBACK_ACTIVATED` + `AGENT_STEP_COMPLETE` (lines 159–199) in try-catch matching the established `useDraft.ts` Gate 2 pattern; throw-on-failure propagates to `useTTIntake.decideTravel`'s rejection handler |
| `module-nexus/tests/NexusApp.test.tsx` | Added Gate 2 test: "Gate 2: a Logger throw on AGENT_STEP_START aborts the travelDrafter and surfaces draftStatus error (fail-closed)" |
| `module-nexus/tests/test-helpers.tsx` | Added `logFn?: (event) => void` override option to `CtxOverrides` — enables targeted Gate 2 tests that throw only for specific event/agent combinations without disrupting the rest of the log trail |
| `e2e/tests/startup-publish-convergence.test.ts` | F2 fix: removed unused `SYNTH_PPBE_PROGRAMS` import (line 22, TS6133 — present since Session 72) |
| `SESSION_82_HANDOFF.md` | New — Gate 2 verification report + evidence-backed verdicts for all 18 sites |
| `SBOM_Session82_Update.md` | This file — v1.50 |

### Session 82 audit summary

**Gate 2 verification — all 18 live-call sites read directly (line-level):**

| # | Site | Gate 2 implementation | Verdict |
|---|---|---|---|
| 1 | `module-vigil/src/useApprovalBrief.ts:72–148` | START try-catch (72–92); FALLBACK+COMPLETE try-catch (113–148) | SOUND |
| 2 | `module-vigil/src/useTriage.ts:99–196` | START try-catch (99–121); FALLBACK+COMPLETE+TRIAGE_ANALYSIS_PRODUCED try-catch (142–196) | SOUND |
| 3 | `module-scribe/src/useDraft.ts:87–165` | START try-catch (87–101); FALLBACK+COMPLETE try-catch (138–165) — reference pattern | SOUND |
| 4 | `module-scribe/src/useIntermediate.ts:79–159` | START try-catch (79–101); FALLBACK+COMPLETE try-catch (122–159) | SOUND |
| 5 | `module-scribe/src/useStyleProfile.ts:111–256` | START try-catch (111–131); FALLBACK+COMPLETE try-catch (156–192); HUMAN_DECISION try-catch (229–256) | SOUND |
| 6 | `module-scribe/src/useTTDraft.ts:120–202` | START try-catch (120–139); FALLBACK+COMPLETE try-catch (161–202) | SOUND |
| 7 | `module-scribe/src/PPBEExhibitPanel.tsx` | Advisory-only; zero Logger emissions — no Gate 2 claim, no Gate 2 obligation | SOUND |
| 8 | `module-lens/src/useExplanation.ts:110–187` | START try-catch (110–129); FALLBACK+COMPLETE try-catch (150–187) | SOUND |
| 9 | `module-cpmi/src/useReasoningChain.ts:93–182` | START try-catch (93–113); FALLBACK+COMPLETE+CPMI_REASONING_CHAIN_COMPLETE try-catch (131–182) | SOUND |
| 10 | `module-cpmi/src/useBenchmark.ts:63–126` | START try-catch (63–78); COMPLETE try-catch (103–126); per-scenario fallbacks in engine — no per-run FALLBACK_ACTIVATED by design | SOUND |
| 11 | `module-nexus/src/NexusApp.tsx:128–199` | **F1 FIXED THIS SESSION:** START now in try-catch (128–141); FALLBACK+COMPLETE now in try-catch (159–199) | **FIXED → SOUND** |
| 12 | `module-nexus/src/PPBECoordinationPanel.tsx` | Advisory-only; zero Logger emissions — no Gate 2 claim, no Gate 2 obligation | SOUND |
| 13 | `module-counsel/src/useAnalysis.ts:72–147` | START try-catch (72–91); FALLBACK+COMPLETE try-catch (113–147) | SOUND |
| 14 | `module-counsel/src/usePreMortem.ts:70–143` | START try-catch (70–89); FALLBACK+COMPLETE try-catch (109–143) | SOUND |
| 15 | `module-counsel/src/useCounterargument.ts:71–145` | START try-catch (71–91); FALLBACK+COMPLETE try-catch (111–145) | SOUND |
| 16 | `module-apex/src/useApexAnalysis.ts:75–141` | APEX_ANALYSIS_STARTED try-catch (75–94); APEX_ANALYSIS_COMPLETE try-catch (121–141) — product events, same Gate 2 structure | SOUND |
| 17 | `module-apex/src/PPBEAgentsPanel.tsx` | Advisory-only; zero Logger emissions — no Gate 2 claim, no Gate 2 obligation | SOUND |
| 18 | `module-flowpath/src/useFlowpathElicitation.ts:118–182` | Four FLOWPATH_* product events emitted bare (no try-catch); file makes **no claim of Gate 2 protection**; events are FLOWPATH_ARTIFACT_PRODUCED/VOCABULARY_CAPTURED/DATASOURCE_REGISTERED/VALIDATION_CADENCE_SET. Noted as a pattern distinction — not equivalent to F1 (which explicitly claimed fail-closed protection it did not implement). No action taken this session. | NOTE — no claim, no Gate 2 obligation stated |

**F2 fixed:** `e2e/tests/startup-publish-convergence.test.ts` — removed unused `SYNTH_PPBE_PROGRAMS` import; `tsc --noEmit` now clean on all 15 workspaces.

# SOVEREIGN Platform — Session 88 Handoff

**Date:** August 5, 2026
**Governance Decision:** GD-35 (F5 — PPBE Advisory Panels → Observed Call Sites)
**Shell Contract:** v1.27 (unchanged from Session 87)
**SBOM:** v1.55

---

## Decision Record

GD-35 (Session 86 reflection, F5): the three PPBE panels were calling `createSovereignClient()`
directly and discarding `ctx` (`_ctx`). The decision: "advisory" means the AI output is
non-binding — it does NOT mean the call should be unobserved. All four call sites across the
three PPBE panels are now instrumented the same way every other live-call site on the platform
is, using thin hooks following the `useApprovalBrief.ts` pattern established in Session 87.

---

## Work Completed

### Engine outcome types extended (four files)

All four PPBE engines now forward live-tier response fields to their hooks for Logger
`token_usage` emission. Each `Outcome` type extended with `usage?`, `duration_ms?`,
`stop_reason?`, `responded_at?`; live-tier return updated to capture from response.

- `module-scribe/src/ppbe-exhibit-engine.ts` — `ExhibitDraftOutcome`
- `module-nexus/src/ppbe-coordination-assistant.ts` — `CoordinationOutcome`
- `module-apex/src/ppbe-evidence-synthesizer.ts` — `SynthesisOutcome`
- `module-apex/src/ppbe-scenario-analyst.ts` — `ScenarioOutcome`

### Four new Logger-wired hooks

Each hook follows the established platform pattern exactly:
- Accepts `ctx: SovereignShellContext`
- Emits `AGENT_STEP_START` → engine call → `FALLBACK_ACTIVATED` (if degraded) → `AGENT_STEP_COMPLETE`
- Gate 2: every Logger emission wrapped in try/catch; a failed emit surfaces an error and aborts
- Live tier: `AGENT_STEP_COMPLETE.token_usage` includes `input_tokens`, `output_tokens`,
  `estimated_cost_usd`, `duration_ms`, `stop_reason`, `responded_at` (full v1.27 field set)
- Fallback tier: `AGENT_STEP_COMPLETE.token_usage` absent; `FALLBACK_ACTIVATED` emitted

| Hook | Module | Agent ID | Agent Class |
|------|--------|----------|-------------|
| `usePPBEExhibitDraft.ts` | module-scribe | ppbe-exhibit-drafter | Operational |
| `usePPBECoordinationTracking.ts` | module-nexus | ppbe-coordination-assistant | Operational |
| `usePPBEEvidenceSynthesis.ts` | module-apex | ppbe-evidence-synthesizer | Analytical |
| `usePPBEScenarioAnalysis.ts` | module-apex | ppbe-scenario-analyst | Analytical |

### Three panels wired to hooks

Previously the panels called `createSovereignClient()` directly with only the API key,
discarding `ctx` (`_ctx` unused). Now each panel delegates to the corresponding hook.

- `PPBEExhibitPanel.tsx`: `ctx: _ctx` → `ctx`; removed inline `runDraft()` + `cacheRef`
- `PPBECoordinationPanel.tsx`: removed inline `runTracking()` + cross-module `readAnthropicKey`
  import from module-scribe
- `PPBEAgentsPanel.tsx`: `ctx: _ctx` → `ctx`; removed `makeComplete()` + inline
  `runSynthesis()` / `runScenario()` functions

### Coverage disclosure updated

`module-workspace/src/WorkspaceApp.tsx` line 780: "10 in-scope" → "14 in-scope"; disclosure
now cites GD-35 and names the four newly-instrumented PPBE sites.

---

## Test Evidence

### New tests (12)

| Test file | Tests | What they verify |
|-----------|-------|-----------------|
| `module-scribe/tests/usePPBEExhibitDraft.test.tsx` | 3 | Live tier populates token_usage incl. duration_ms/stop_reason/responded_at; fallback leaves it absent; Gate 2 aborts on logger throw |
| `module-nexus/tests/usePPBECoordinationTracking.test.tsx` | 3 | Same pattern |
| `module-apex/tests/usePPBEEvidenceSynthesis.test.tsx` | 3 | Same pattern |
| `module-apex/tests/usePPBEScenarioAnalysis.test.tsx` | 3 | Same pattern |

### Full suite results (verified at close)

```
module-scribe:        243 passed  (was 240)  +3
module-nexus:         172 passed  (was 169)  +3
module-apex:          234 passed  (was 228)  +6
module-vigil:         215 passed
module-counsel:       100 passed
module-flowpath:      152 passed
module-aria:          150 passed
module-agentos:        89 passed
module-workspace:      33 passed
module-cpmi:           62 passed
module-lens:           63 passed
sovereign-shell:       19 passed
sovereign-api-client: 192 passed
sovereign-data:       163 passed
e2e:              149 passed, 4 skipped

JS/TS total: 1,887  (+12 from Session 87's 1,875)
Platform total: 2,231
```

`tsc --noEmit`: all 15 workspaces clean, 0 errors.

---

## SBOM

Version 1.55. Zero new production dependencies. Shell-contract v1.27 unchanged.
SHA-256 both copies: `3570923c35f965b4f0abc1f200816e3dd5e4df7322af1921b8fc38c330a479ff`

---

## Open Items / Next Session

No open items from this session. Advisory framing in all three panels is unchanged —
output remains non-binding and all export / human-authorization paths are unchanged.

The PPBE panels are now observed at the same fidelity as every other live-call site on
the platform. GD-35 is complete.

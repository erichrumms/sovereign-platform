# SOVEREIGN Platform — SBOM Registry
## Version 1.55 · August 5, 2026

**Supersedes:** v1.54 (Session 87 — GD-34: failure categorization, duration_ms, stop_reason, responded_at, fallback-category display, GovCloud note)
**Adds:** Session 88 — GD-35 (F5): four PPBE advisory panels wired to Logger-instrumented hooks (ppbe-exhibit-drafter, ppbe-coordination-assistant, ppbe-evidence-synthesizer, ppbe-scenario-analyst). Twelve new tests. Coverage disclosure updated 10 → 14 tracked live-call sites.

---

## 1 — Shell Contract / Agent / Prompt Registry History

| Version | Session | Change | SHA-256 (both copies) |
|---|---|---|---|
| v1.26 | GD-33 Build Session | Added `reports_to?: string` to `SovereignUser`. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| v1.26 | Session 82 | Unchanged. Re-verified at close — both copies identical, matching recorded value. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| v1.26 | Session 83 | Unchanged. Re-verified at close — both copies identical, matching recorded value. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| v1.26 | Session 84 | Unchanged. Re-verified at close — both copies identical, matching recorded value. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| v1.26 | Session 85 | Unchanged. Re-verified at close — both copies identical, matching recorded value. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| **v1.27** | **Session 87** | **GD-34: added `FallbackCategory` type + `fallback_category?` field to `SovereignLogEvent`; added `duration_ms?`, `stop_reason?`, `responded_at?` to `SovereignLogEvent.token_usage`.** | **`3570923c35f965b4f0abc1f200816e3dd5e4df7322af1921b8fc38c330a479ff`** |
| v1.27 | Session 88 | Unchanged. Re-verified at close — both copies identical, matching recorded value. | `3570923c35f965b4f0abc1f200816e3dd5e4df7322af1921b8fc38c330a479ff` |

SHA-256 verified at close: `shasum -a 256 shell-contract.ts sovereign-shell/shell-contract.ts` — both copies produced identical hash.

**Agents: 44 total — unchanged.**

**Prompts: 20 = 19 approved + 1 pending — unchanged.**

---

## 2 — Third-Party Dependencies

**Zero new production dependencies.** Session 88 added no new npm packages. All changes
are within existing source files. Zero-new-production-dependency streak continues unbroken
from Session 62.

**Audit posture:** unchanged — 5 vulnerabilities (1 moderate, 4 high) all in
dev-tooling dependencies, pre-existing.

---

## 3 — Test Totals

| Close point | JS/TS | e2e | Python | Platform Total | Confidence |
|---|---|---|---|---|---|
| Session 84 | 1,868 | 149 (4 skip) | 195 | 2,212 | High — +1 test |
| Session 85 | 1,868 | 149 (4 skip) | 195 | 2,212 | High — full 14-package JS/TS run at close; no code changed |
| Session 87 | 1,875 | 149 (4 skip) | 195 | 2,219 | High — full 15-package + e2e run at close; +7 tests |
| **Session 88** | **1,887** | **149 (4 skip)** | **195** | **2,231** | **High — full 15-package + e2e run at close; +12 tests** |

Per-package JS/TS breakdown (Session 88): sovereign-data 163, sovereign-api-client 192,
sovereign-shell 19, module-counsel 100, **module-scribe 243** (+3), module-vigil 215, module-lens 63,
module-cpmi 62, module-agentos 89, **module-nexus 172** (+3), **module-apex 234** (+6), module-flowpath 152,
module-aria 150, module-workspace 33 — **total 1,887**.

`tsc --noEmit`: **all 15 workspaces clean** — verified with `npx tsc --noEmit -p <workspace>/tsconfig.json`
in each workspace; 0 errors.

---

## 4 — Session 88 Component Changes (GD-35, F5)

| File | Change |
|------|--------|
| `module-scribe/src/ppbe-exhibit-engine.ts` | GD-35: extended `ExhibitDraftOutcome` with `usage?`, `duration_ms?`, `stop_reason?`, `responded_at?`; live-tier return captures these from the response. |
| `module-nexus/src/ppbe-coordination-assistant.ts` | GD-35: same extension to `CoordinationOutcome`. |
| `module-apex/src/ppbe-evidence-synthesizer.ts` | GD-35: same extension to `SynthesisOutcome`. |
| `module-apex/src/ppbe-scenario-analyst.ts` | GD-35: same extension to `ScenarioOutcome`. |
| `module-scribe/src/usePPBEExhibitDraft.ts` | GD-35 (new): Logger-wired hook for ppbe-exhibit-drafter (agent_class: Operational, product: SCRIBE). Emits AGENT_STEP_START / FALLBACK_ACTIVATED / AGENT_STEP_COMPLETE with full v1.27 token_usage on live tier. Gate 2 protected. |
| `module-nexus/src/usePPBECoordinationTracking.ts` | GD-35 (new): Logger-wired hook for ppbe-coordination-assistant (agent_class: Operational, product: NEXUS). Same pattern. |
| `module-apex/src/usePPBEEvidenceSynthesis.ts` | GD-35 (new): Logger-wired hook for ppbe-evidence-synthesizer (agent_class: Analytical, product: APEX). Same pattern. |
| `module-apex/src/usePPBEScenarioAnalysis.ts` | GD-35 (new): Logger-wired hook for ppbe-scenario-analyst (agent_class: Analytical, product: APEX). Same pattern. |
| `module-scribe/src/PPBEExhibitPanel.tsx` | GD-35: replaced inline `createSovereignClient()` + `runExhibitDraft()` call with `usePPBEExhibitDraft` hook; removed discarded `_ctx` → wired `ctx`. |
| `module-nexus/src/PPBECoordinationPanel.tsx` | GD-35: replaced inline `createSovereignClient()` + `runCoordinationTracking()` call with `usePPBECoordinationTracking` hook; removed cross-module `readAnthropicKey` import from module-scribe. |
| `module-apex/src/PPBEAgentsPanel.tsx` | GD-35: replaced inline `makeComplete()` + `runEvidenceSynthesis()` / `runScenarioAnalysis()` calls with `usePPBEEvidenceSynthesis` + `usePPBEScenarioAnalysis` hooks; removed discarded `_ctx` → wired `ctx`. |
| `module-workspace/src/WorkspaceApp.tsx` | GD-35: updated coverage disclosure from "10 in-scope" to "14 in-scope"; added GD-35 reference and names the 4 newly-instrumented PPBE sites. |
| `module-scribe/tests/usePPBEExhibitDraft.test.tsx` | GD-35 (new): 3 tests — live tier populates token_usage (incl. duration_ms, stop_reason, responded_at); fallback tier leaves token_usage absent; Gate 2 aborts on logger throw. |
| `module-nexus/tests/usePPBECoordinationTracking.test.tsx` | GD-35 (new): same 3-test pattern. |
| `module-apex/tests/usePPBEEvidenceSynthesis.test.tsx` | GD-35 (new): same 3-test pattern. |
| `module-apex/tests/usePPBEScenarioAnalysis.test.tsx` | GD-35 (new): same 3-test pattern. |
| `module-workspace/tests/WorkspaceApp.test.tsx` | GD-35: updated coverage assertion from `/10 in-scope/` to `/14 in-scope/`; updated test description. |
| `SOVEREIGN_Session88_Handoff.md` | New — Session 88 evidence record. |
| `SBOM_Session88_Update.md` | This file — v1.55. |

# SOVEREIGN Platform — SBOM Registry
## Version 1.54 · August 4, 2026

**Supersedes:** v1.53 (Session 85 — silent-fallback root-cause diagnosis; no code changed)
**Adds:** Session 87 — GD-34: failure categorization (F1), duration_ms (F2), stop_reason (F3),
responded_at (F6b), Cost Dashboard fallback-category breakdown (F1 display), GovCloud
coverage disclosure note (F6a). Shell contract v1.27 bump. Seven new tests.

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

SHA-256 verified at close: `shasum -a 256 shell-contract.ts sovereign-shell/shell-contract.ts` — both copies produced identical hash.

**Agents: 44 total — unchanged.**

**Prompts: 20 = 19 approved + 1 pending — unchanged.**

---

## 2 — Third-Party Dependencies

**Zero new production dependencies.** Session 87 added no new npm packages. All changes
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
| **Session 87** | **1,875** | **149 (4 skip)** | **195** | **2,219** | **High — full 15-package + e2e run at close; +7 tests** |

Per-package JS/TS breakdown (Session 87): sovereign-data 163, **sovereign-api-client 192** (+7),
sovereign-shell 19, module-counsel 100, module-scribe 240, module-vigil 215, module-lens 63,
module-cpmi 62, module-agentos 89, module-nexus 169, module-apex 228, module-flowpath 152,
module-aria 150, module-workspace 33 — **total 1,875**.

`tsc --noEmit`: **all 15 workspaces clean** (verified with `./node_modules/.bin/tsc --noEmit`
in each workspace; 0 errors).

---

## 4 — Session 87 Component Changes (GD-34)

| File | Change |
|------|--------|
| `sovereign-api-client/src/base-client.ts` | GD-34 F1: added `FallbackCategory` exported type + `deriveFailureCategory()` helper (instanceof + numeric .status, no string-matching). Extended `SovereignLLMResponse` with `duration_ms?`, `stop_reason?`. Extended `ClientLogger.log()` event with `fallback_category?: FallbackCategory`. Added `requestedAt` / `duration_ms` measurement around `callProvider`. `_wrapResponse` now sets `stop_reason` and `duration_ms` on result. Catch block now computes and logs `fallback_category`. |
| `sovereign-api-client/src/anthropic-client.ts` | GD-34 F3: `_parseResponse` now returns `stop_reason?: string` from wire JSON. |
| `sovereign-api-client/tests/test_base_client.test.ts` | GD-34 F1 tests: updated `TestClient._providerImpl` type for `stop_reason?`; added 6-test `"failure categorization"` describe block (network_or_parse, auth_failure, rate_limited, server_error, provider_unresolved, timeout). |
| `sovereign-api-client/tests/test_anthropic_client.test.ts` | GD-34 F3 test: added `"stop_reason is forwarded from wire response"` test to response-parsing describe block. |
| `module-vigil/src/approval-engine.ts` | GD-34 F2/F3/F6b: live-tier return extended with `duration_ms`, `stop_reason`, `responded_at` (optional-chained). |
| `module-vigil/src/triage-engine.ts` | GD-34 F2/F3/F6b: same pattern. |
| `module-scribe/src/draft-engine.ts` | GD-34 F2/F3/F6b: same pattern. |
| `module-scribe/src/tt-draft-engine.ts` | GD-34 F2/F3/F6b: same pattern. |
| `module-scribe/src/style-engine.ts` | GD-34 F2/F3/F6b: same pattern. |
| `module-scribe/src/intermediate-engine.ts` | GD-34 F2/F3/F6b: same pattern. |
| `module-cpmi/src/reasoning-engine.ts` | GD-34 F2/F3/F6b: same pattern. |
| `module-cpmi/src/benchmark.ts` | GD-34 F2 only: `ScenarioResult.duration_ms?` + `BenchmarkReport.total_duration_ms?`; aggregated `total_duration_ms` computed. No `stop_reason`/`responded_at` (not meaningful for aggregate). |
| `module-lens/src/explanation-engine.ts` | GD-34 F2/F3/F6b: same pattern. |
| `module-vigil/src/useApprovalBrief.ts` | GD-34: threads `duration_ms`, `stop_reason`, `responded_at` into `token_usage` on AGENT_STEP_COMPLETE. |
| `module-vigil/src/useTriage.ts` | GD-34: same pattern. |
| `module-scribe/src/useDraft.ts` | GD-34: same pattern. |
| `module-scribe/src/useTTDraft.ts` | GD-34: same pattern. |
| `module-scribe/src/useStyleProfile.ts` | GD-34: same pattern. |
| `module-scribe/src/useIntermediate.ts` | GD-34: same pattern. |
| `module-cpmi/src/useReasoningChain.ts` | GD-34: same pattern. |
| `module-cpmi/src/useBenchmark.ts` | GD-34: threads `duration_ms: result.total_duration_ms` into `token_usage` on AGENT_STEP_COMPLETE. |
| `module-lens/src/useExplanation.ts` | GD-34: threads `duration_ms`, `stop_reason`, `responded_at` into `token_usage` on AGENT_STEP_COMPLETE. |
| `module-nexus/src/NexusApp.tsx` | GD-34: same threading pattern for the inline TT travel drafter AGENT_STEP_COMPLETE. |
| `module-workspace/src/WorkspaceApp.tsx` | GD-34 F1 display: `CostDashboardSection` now computes `fallbackByCategory` Map and renders per-category sub-rows below the fallback total. F6a: coverage disclosure updated to note GovCloud cost estimates excluded until R7. |
| `shell-contract.ts` | GD-34: bumped to v1.27 with changelog entry. `SovereignLogEvent.token_usage` extended with `duration_ms?`, `stop_reason?`, `responded_at?`. New `fallback_category?: FallbackCategory` field on `SovereignLogEvent`. |
| `sovereign-shell/shell-contract.ts` | GD-34: identical changes as root copy (SHA-256 verified). |
| `SOVEREIGN_Session87_Handoff.md` | New — Session 87 evidence record. |
| `SBOM_Session87_Update.md` | This file — v1.54. |

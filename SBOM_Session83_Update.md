# SOVEREIGN Platform — SBOM Registry
## Version 1.51 · August 4, 2026

**Supersedes:** v1.50 (Session 82 — Gate 2 verification + F1/F2 fixes)
**Adds:** Session 83 — debug-gate removal, ConsoleClientLogger production fix, FLOWPATH Gate 2

---

## 1 — Shell Contract / Agent / Prompt Registry History

| Version | Session | Change | SHA-256 (both copies) |
|---|---|---|---|
| v1.26 | GD-33 Build Session | Added `reports_to?: string` to `SovereignUser`. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| v1.26 | Session 80 | Unchanged. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| v1.26 | Session 81 | Unchanged. Re-verified at close — both copies identical, matching recorded value. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| v1.26 | Session 82 | Unchanged. Re-verified at close — both copies identical, matching recorded value. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| **v1.26** | **Session 83** | **Unchanged. Re-verified at close — both copies identical, matching recorded value.** | **`42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b`** |

**Agents: 44 total — unchanged.**

**Prompts: 20 = 19 approved + 1 pending — unchanged.**

---

## 2 — Third-Party Dependencies

**Zero new production dependencies.** Session 83 removed dead debug code, fixed a
production-logging bug, and applied Gate 2 try-catch to FLOWPATH — no `npm install`,
no `package.json` changes, no new imports in production source. Zero-new-production-dependency
streak continues unbroken from Session 62.

**Audit posture:** unchanged — 5 vulnerabilities (1 moderate, 4 high) all in
dev-tooling dependencies, pre-existing.

---

## 3 — Test Totals

| Close point | JS/TS | e2e | Python | Platform Total | Confidence |
|---|---|---|---|---|---|
| Session 81 | 1,862 | 149 (4 skip) | 195 (full pytest run) | 2,206 | High |
| Session 82 | 1,863 | 149 (4 skip) | 195 | 2,207 | High — +1 test (new Gate 2 case in module-nexus) |
| **Session 83** | **1,867** | **149 (4 skip)** | **195** | **2,211** | **High — full 15-package run + e2e + full pytest at close; +4 tests (3 ConsoleClientLogger + 1 FLOWPATH Gate 2)** |

Per-package JS/TS breakdown:

| Package | S82 | S83 | Delta |
|---|---|---|---|
| sovereign-data | 163 | 163 | — |
| sovereign-api-client | 181 | **184** | **+3** |
| sovereign-shell | 19 | 19 | — |
| module-counsel | 100 | 100 | — |
| module-scribe | 240 | 240 | — |
| module-vigil | 215 | 215 | — |
| module-lens | 63 | 63 | — |
| module-cpmi | 62 | 62 | — |
| module-agentos | 89 | 89 | — |
| module-nexus | 169 | 169 | — |
| module-apex | 228 | 228 | — |
| module-flowpath | 151 | **152** | **+1** |
| module-aria | 150 | 150 | — |
| module-workspace | 33 | 33 | — |
| **Total (14 packages)** | **1,863** | **1,867** | **+4** |

`tsc --noEmit`: **all 15 workspaces clean** — unchanged from Session 82.

---

## 4 — Session 83 Component Changes

| File | Change |
|------|--------|
| `sovereign-api-client/src/base-client.ts` | Removed 7-line `SOVEREIGN_CLIENT_DEBUG` diagnostic block from the Tier 1 catch handler in `complete()`. Fixed `ConsoleClientLogger.log()` production guard: changed `env?.["NODE_ENV"] !== "production"` to `env && env["NODE_ENV"] !== "production"` — prevents unconditional browser logging when `process` is undefined. |
| `sovereign-api-client/src/anthropic-client.ts` | Removed all four `SOVEREIGN_CLIENT_DEBUG` diagnostic blocks (one in `buildHeaders()`, three in `callProvider()`) and the two `const env` declarations that existed solely to support them. |
| `sovereign-api-client/tests/test_base_client.test.ts` | Added three tests: `ConsoleClientLogger — NODE_ENV production guard` describe block (2 tests — production silences warn, development emits warn); one additional test in `browser environment safety` (confirms `console.warn` is not called when `process` is undefined). |
| `module-flowpath/src/useFlowpathElicitation.ts` | Applied Gate 2 try-catch to all five Logger emissions in `produceArtifact()`: FLOWPATH_GATE_FAILED wrapped individually; FLOWPATH_ARTIFACT_PRODUCED + FLOWPATH_VOCABULARY_CAPTURED + FLOWPATH_DATASOURCE_REGISTERED (loop) + FLOWPATH_VALIDATION_CADENCE_SET wrapped in one try-catch. Added `surfaceLoggerError()` helper (sets `error` state + `status: "error"` + returns null). |
| `module-flowpath/tests/ElicitationDialogue.test.tsx` | Added Gate 2 test: "Gate 2: a Logger throw on FLOWPATH_ARTIFACT_PRODUCED aborts production and surfaces error (fail-closed)" — uses existing `throwOnLog: true` option in test-helpers. |
| `SESSION_83_HANDOFF.md` | New — Session 83 evidence record |
| `SBOM_Session83_Update.md` | This file — v1.51 |

# SOVEREIGN Platform — SBOM Registry
## Version 1.48 · August 4, 2026

**Supersedes:** v1.47 (GD-33 Build Session — Program & Staff Data Foundation)
**Adds:** Session 80 — browser-safety hotfix (process.env guard) and debug-log cleanup

---

## 1 — Shell Contract / Agent / Prompt Registry History

| Version | Session | Change | SHA-256 (both copies) |
|---|---|---|---|
| v1.26 | GD-33 Build Session | Added `reports_to?: string` to `SovereignUser`. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| **v1.26** | **Session 80** | **Unchanged.** | **`42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b`** |

**Agents: 44 total — unchanged.**

**Prompts: 20 = 19 approved + 1 pending — unchanged.**

---

## 2 — Third-Party Dependencies

**Zero new production dependencies.** This session touched only `sovereign-api-client`
source files and their tests. No new imports, no `npm install`, no package.json changes.
Zero-new-production-dependency streak continues unbroken from Session 62.

**Audit posture:** unchanged — 5 vulnerabilities (1 moderate, 4 high) all in
dev-tooling dependencies, pre-existing.

---

## 3 — Test Totals

| Close point | JS/TS | e2e | Python | Platform Total | Confidence |
|---|---|---|---|---|---|
| GD-33 Build Session | 1,856 | 149 (4 skip) | 195 | 2,200 | High |
| **Session 80** | **1,862** | 149 (4 skip) | 195 | **2,206** | **High — full 14-package run at close; +6 new tests (browser-safety suite in api-client)** |

Test breakdown by package at Session 80 close (all 14 packages, full run):

| Package | Tests | Delta |
|---------|-------|-------|
| @sovereign/data | 163 | — |
| @sovereign/module-apex | 228 | — |
| @sovereign/module-counsel | 100 | — |
| @sovereign/module-scribe | 240 | — |
| @sovereign/module-vigil | 215 | — |
| @sovereign/module-lens | 63 | — |
| @sovereign/module-cpmi | 62 | — |
| @sovereign/module-agentos | 89 | — |
| @sovereign/module-nexus | 168 | — |
| @sovereign/module-flowpath | 151 | — |
| @sovereign/module-aria | 150 | — |
| @sovereign/module-workspace | 33 | — |
| @sovereign/api-client | 181 | +6 |
| @sovereign/shell | 19 | — |
| **Total** | **1,862** | **+6** |

**Python (195):** No Python files modified this session. Prior confirmed figure (GD-33
close, full pytest run) carried forward. Grep count of `def test_` across 7 Python test
files yields 192 — gap noted but not resolved; likely due to parameterized or class-method
tests not matched by bare name grep. Python count treated as unchanged.

**e2e (149 passing, 4 skipped):** No e2e test files modified. Full suite run clean.

---

## 4 — Session 80 Component Changes

### Root cause

Live diagnostics (console output) confirmed: `process.env["SOVEREIGN_CLIENT_DEBUG"]`
inside `sovereign-api-client`'s `base-client.ts` and `anthropic-client.ts` was throwing
`"Can't find variable: process"` in browser environments before any network request was
made, causing every live call to fall through to the static fallback tier. The fix pattern
was already present in `ollama-endpoint.ts` in the same package; it was applied
consistently.

### Files changed

**`sovereign-api-client/src/base-client.ts`:**

- `ConsoleClientLogger.log()`: `process.env["NODE_ENV"]` → guarded with
  `const env = typeof process !== "undefined" ? process.env : undefined; env?.["NODE_ENV"]`
- `BaseSovereignClient.complete()` (Tier 1 catch block): same guard pattern applied to
  `SOVEREIGN_CLIENT_DEBUG` check using `const debugEnv`.

**`sovereign-api-client/src/anthropic-client.ts`:**

- `buildHeaders()`: `process.env["SOVEREIGN_CLIENT_DEBUG"]` → guarded with
  `const env = typeof process !== "undefined" ? process.env : undefined; env?.["SOVEREIGN_CLIENT_DEBUG"]`
- `callProvider()`: single `const env` hoisted at method start; all three
  `process.env["SOVEREIGN_CLIENT_DEBUG"]` occurrences replaced with `env?.["SOVEREIGN_CLIENT_DEBUG"]`

**`module-vigil/src/anthropic-key.ts`:**

- Removed temporary diagnostic `console.log("Key present:", ...)` added during live
  troubleshooting.

**`module-vigil/src/useApprovalBrief.ts`:**

- Removed temporary diagnostic `console.log("Tier:", result.tier, ...)` added during live
  troubleshooting.

### Tests added

**`sovereign-api-client/tests/test_base_client.test.ts`** (+3 tests):

New describe block: `"browser environment safety — process undefined"`:
- `ConsoleClientLogger.log()` does not throw when `process` is undefined
- `complete()` degrades to static fallback without throwing when `process` is undefined
- `complete()` returns live response without throwing when `process` is undefined and
  provider succeeds

**`sovereign-api-client/tests/test_anthropic_client.test.ts`** (+3 tests):

New describe block: `"browser environment safety — process undefined"`:
- `buildHeaders()` does not throw when `process` is undefined — live call succeeds
- `callProvider()` does not throw when `process` is undefined and fetch fails — degrades
  to static
- `callProvider()` does not throw when `process` is undefined and server returns 500 —
  degrades to static

Both test suites use `beforeEach`/`afterEach` to delete and restore `global.process`,
genuinely simulating a browser environment rather than relying on Jest's Node presence.

---

## 5 — Lineage and Audit Note

v1.48 methodology unchanged from v1.47: test count derived from a full 14-package run
at close, not from session self-report. Confirmed 1,862 JS/TS + 149 e2e (4 skip) +
195 Python = 2,206 platform total.

**Session 80 is complete.**

---

*SOVEREIGN Platform — SBOM Registry v1.48 · August 4, 2026*
*Supersedes v1.47 (GD-33 Build Session) · Adds Session 80 (browser-safety hotfix)*
*Pre-Decisional · Internal Working Document*

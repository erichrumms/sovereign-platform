# SOVEREIGN Platform — SBOM Registry
## Version 1.52 · August 4, 2026

**Supersedes:** v1.51 (Session 83 — debug-gate removal + ConsoleClientLogger fix + FLOWPATH Gate 2)
**Adds:** Session 84 — Anthropic browser CORS header fix

---

## 1 — Shell Contract / Agent / Prompt Registry History

| Version | Session | Change | SHA-256 (both copies) |
|---|---|---|---|
| v1.26 | GD-33 Build Session | Added `reports_to?: string` to `SovereignUser`. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| v1.26 | Session 80 | Unchanged. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| v1.26 | Session 81 | Unchanged. Re-verified at close — both copies identical, matching recorded value. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| v1.26 | Session 82 | Unchanged. Re-verified at close — both copies identical, matching recorded value. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| v1.26 | Session 83 | Unchanged. Re-verified at close — both copies identical, matching recorded value. | `42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b` |
| **v1.26** | **Session 84** | **Unchanged. Re-verified at close — both copies identical, matching recorded value.** | **`42a479cab397de93246d05bef7c90959d33f9a5b7d2fc4b74c39cd397951697b`** |

**Agents: 44 total — unchanged.**

**Prompts: 20 = 19 approved + 1 pending — unchanged.**

---

## 2 — Third-Party Dependencies

**Zero new production dependencies.** Session 84 added one HTTP request header to an
existing method (`buildHeaders()` in `anthropic-client.ts`) and added one test. No
`npm install`, no `package.json` changes, no new imports in any production source file.
Zero-new-production-dependency streak continues unbroken from Session 62.

**Audit posture:** unchanged — 5 vulnerabilities (1 moderate, 4 high) all in
dev-tooling dependencies, pre-existing.

---

## 3 — Test Totals

| Close point | JS/TS | e2e | Python | Platform Total | Confidence |
|---|---|---|---|---|---|
| Session 82 | 1,863 | 149 (4 skip) | 195 | 2,207 | High |
| Session 83 | 1,867 | 149 (4 skip) | 195 | 2,211 | High — +4 tests |
| **Session 84** | **1,868** | **149 (4 skip)** | **195** | **2,212** | **High — full 15-package run at close; +1 test (browser CORS header assertion)** |

Per-package JS/TS breakdown:

| Package | S83 | S84 | Delta |
|---|---|---|---|
| sovereign-data | 163 | 163 | — |
| sovereign-api-client | 184 | **185** | **+1** |
| sovereign-shell | 19 | 19 | — |
| module-counsel | 100 | 100 | — |
| module-scribe | 240 | 240 | — |
| module-vigil | 215 | 215 | — |
| module-lens | 63 | 63 | — |
| module-cpmi | 62 | 62 | — |
| module-agentos | 89 | 89 | — |
| module-nexus | 169 | 169 | — |
| module-apex | 228 | 228 | — |
| module-flowpath | 152 | 152 | — |
| module-aria | 150 | 150 | — |
| module-workspace | 33 | 33 | — |
| **Total (14 packages)** | **1,867** | **1,868** | **+1** |

`tsc --noEmit`: **all 15 workspaces clean** — unchanged from Session 83.

---

## 4 — Session 84 Component Changes

| File | Change |
|------|--------|
| `sovereign-api-client/src/anthropic-client.ts` | Added `"anthropic-dangerous-direct-browser-access": "true"` to `buildHeaders()`. Added a 5-line comment directly above the header explaining the tradeoff: this header is required to pass Anthropic's CORS preflight for browser-originated fetches; it accepts the risk that the API key is visible in the browser Network panel; a real production deployment must route through a backend proxy instead of calling Anthropic directly from the browser. |
| `sovereign-api-client/tests/test_anthropic_client.test.ts` | Added one test to the `auth header injection` describe block: "includes anthropic-dangerous-direct-browser-access header set to 'true' on every live request". Confirms the header is present on every `fetch()` call at the live tier. |
| `SOVEREIGN_Session84_Handoff.md` | New — Session 84 evidence record |
| `SBOM_Session84_Update.md` | This file — v1.52 |

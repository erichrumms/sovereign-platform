# SOVEREIGN Platform — SBOM Update
## Session 2A — sovereign-api-client npm Dependencies
**Append to SBOM_Registry.md — Node.js / npm Dependencies table**

Date Added: June 2, 2026
Session: 2A
Package: `sovereign-api-client`
Location in Monorepo: `sovereign-api-client/`

---

## New npm Dependencies — Session 2A

All packages below are **devDependencies** — used for testing only. No production runtime npm dependencies were introduced this session. The `sovereign-api-client` package has zero production npm dependencies; it uses the Node.js built-in `fetch` API (available in Node.js 18+) for HTTP calls.

| Package | Version (exact installed) | Type | Product(s) | Date Added | Purpose | License | Installed |
|---|---|---|---|---|---|---|---|
| typescript | 5.9.3 | npm (devDep) | sovereign-api-client · sovereign-shell | 2026-06-02 | TypeScript compiler — type safety across shell contract and api-client | Apache 2.0 | ✓ 2026-06-02 |
| jest | 29.7.0 | npm (devDep) | sovereign-api-client (testing) | 2026-06-02 | Unit test framework — 143 tests across 4 modules | MIT | ✓ 2026-06-02 |
| ts-jest | 29.4.11 | npm (devDep) | sovereign-api-client (testing) | 2026-06-02 | TypeScript preprocessor for Jest — enables .test.ts test files | MIT | ✓ 2026-06-02 |
| @types/jest | 29.5.14 | npm (devDep) | sovereign-api-client (testing) | 2026-06-02 | TypeScript type definitions for Jest | MIT | ✓ 2026-06-02 |
| @types/node | 20.19.41 | npm (devDep) | sovereign-api-client (testing) | 2026-06-02 | TypeScript type definitions for Node.js built-ins (fetch, process, etc.) | MIT | ✓ 2026-06-02 |

---

## Production Runtime Dependencies — Session 2A

| Dependency | Notes |
|---|---|
| `fetch` (built-in) | Node.js 18+ built-in. No npm package required. Used in `AnthropicClient.callProvider()` and will be used in `GovCloudClient.callProvider()` when R7 is resolved. Node.js is already a platform dependency (SBOM Session 0 baseline). |

**No new external API services introduced this session.**
The Anthropic API service entry (`api.anthropic.com`) was already in the Session 0 SBOM. The GovCloud provider endpoint is `UNRESOLVED_PENDING_GOVCLOUD_DECISION` — no SBOM entry until R7 is resolved and the provider is named.

---

## Files Produced — Session 2A

| File | Type | Location in Monorepo | Purpose |
|---|---|---|---|
| `types.ts` | TypeScript | `sovereign-api-client/src/types.ts` | Local SovereignProduct / SovereignTier re-exports |
| `base-client.ts` | TypeScript | `sovereign-api-client/src/base-client.ts` | Abstract base client — fallback, metadata, timeout |
| `anthropic-client.ts` | TypeScript | `sovereign-api-client/src/anthropic-client.ts` | Anthropic API wrapper — Tier 1 |
| `govcloud-client.ts` | TypeScript | `sovereign-api-client/src/govcloud-client.ts` | GovCloud stub — Tier 2 placeholder |
| `index.ts` | TypeScript | `sovereign-api-client/src/index.ts` | Package entry point — provider selection, exports |
| `package.json` | JSON | `sovereign-api-client/package.json` | Package manifest |
| `tsconfig.json` | JSON | `sovereign-api-client/tsconfig.json` | TypeScript compiler config |
| `test_base_client.test.ts` | TypeScript | `sovereign-api-client/tests/` | 33 tests |
| `test_anthropic_client.test.ts` | TypeScript | `sovereign-api-client/tests/` | 41 tests |
| `test_govcloud_client.test.ts` | TypeScript | `sovereign-api-client/tests/` | 32 tests |
| `test_index.test.ts` | TypeScript | `sovereign-api-client/tests/` | 37 tests |
| `R2_Closure_Record.md` | Markdown | `sovereign-api-client/R2_Closure_Record.md` | Governance record — R2 closed |

**Total tests: 143 passing, 0 failing.**

---

## Supply Chain Note

All five npm packages are from the Jest and TypeScript ecosystems — both U.S.-origin open-source projects with established governance. TypeScript is maintained by Microsoft (U.S.). Jest is maintained by Meta (U.S.) under the OpenJS Foundation. No non-U.S.-controlled components introduced. All licenses are MIT or Apache 2.0 — compatible with federal use and SOVEREIGN licensing.

---

*SOVEREIGN SBOM Update · Session 2A · June 2, 2026*
*Append to SBOM_Registry.md Session 2A section*
*Pre-Decisional · Internal Working Document*

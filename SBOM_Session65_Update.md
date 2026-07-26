# SOVEREIGN Platform — Session 65 SBOM

**Date:** 2026-07-26  
**HEAD:** `f4beb07`  
**Shell contract version:** v1.23 — UNCHANGED

---

## New Files

None.

---

## Modified Files

| File | Change |
|---|---|
| `module-flowpath/src/FlowpathApp.tsx` | F1: `tab` and `activeBundle` lazy useState initializers; `FLOWPATH_WORKSPACE_MODULE_ID` import; version comment 1.3 → 1.4 |
| `module-flowpath/tests/test-helpers.tsx` | F1: `WorkspaceReviewItem` import; `flowpathWorkspaceItems` on `CtxOverrides`; `listForModule` routes by module ID |
| `module-flowpath/tests/FlowpathApp.test.tsx` | F1: `SYNTHETIC_SESSION_ID` + `SYNTHETIC_MAPPER_OUTPUT` import; 3 new tests in new describe block |

---

## Test Inventory

| Workspace | Suites | Passed | Skipped | Delta |
|---|---|---|---|---|
| sovereign-data | 9 | 125 | 0 | — |
| sovereign-api-client | 10 | 175 | 0 | — |
| sovereign-shell | 2 | 18 | 0 | — |
| module-counsel | 13 | 100 | 0 | — |
| module-scribe | 25 | 228 | 0 | — |
| module-vigil | 31 | 211 | 0 | — |
| module-lens | 9 | 58 | 0 | — |
| module-cpmi | 16 | 58 | 0 | — |
| module-agentos | 17 | 89 | 0 | — |
| module-nexus | 19 | 165 | 0 | — |
| module-apex | 25 | 218 | 0 | — |
| module-flowpath | **14** | **151** | 0 | **+3 tests** |
| module-aria | 13 | 150 | 0 | — |
| module-workspace | 2 | 28 | 0 | — |
| e2e | 12 | 149 | 4 | — |
| **JS total** | **217** | **1,923** | **4** | **+3 tests** |

**Python (sovereign-security, pytest):** 195 passed — unchanged (no Python-touching changes this session).  
**Platform total: 2,118 passed + 4 deliberately-skipped.**  
**Session 64 baseline: 2,115 passed. Delta: +3.**

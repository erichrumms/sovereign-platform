# Session 70 SBOM — SOVEREIGN Platform

**Date:** 2026-07-26
**Session commits:** ee52bdb, 62c29ec, 4495fad, 096618a

---

## Files Modified

| File | Version | Change |
|---|---|---|
| `sovereign-shell/src/format-currency.ts` | new (1.0) | WH-30: shared currency formatter |
| `sovereign-shell/src/PlatformHome.tsx` | 2.3 | WH-31: merged Module Orientation into To Do / Review |
| `module-vigil/src/VigilApp.tsx` | 2.3 | WH-32: action-conditional confirm-banner color |
| `sovereign-data/src/synthetic/ppbe-seed.ts` | 1.2 | WG-6: fiscalYearOfTimestamp, 13 ProgramRecords, 4 ObligationRecords, 2 EvaluationFindings |
| `sovereign-data/src/index.ts` | — | WG-6: export fiscalYearOfTimestamp |
| `sovereign-data/tests/ppbe-seed.test.ts` | — | WG-6: multi-year test updates, finding counts |
| `module-apex/src/ppbe-data-adapter.ts` | 1.0 | WG-6: PPBE_EVALUATION_FINDING 20→22 |
| `module-apex/src/PPBEDashboard.tsx` | 1.4 | WG-6: year selector (PY/CY/BY/BY+1) + year-scoped filtering |
| `module-apex/src/PPBEProgramDetail.tsx` | 1.2 | WG-6: year selector + year-scoped obligations |
| `module-aria/src/ClearCertificationQueue.tsx` | — | WG-6: FY2026 → FY2027 document names |
| `module-scribe/src/PPBEExhibitPanel.tsx` | — | WG-6: DEMO_PROGRAM → ALPHA FY2027 |

---

## Test Counts

| Package | Tests | Status |
|---|---|---|
| sovereign-data (ppbe-seed) | 11 | All passing |

---

## No New Dependencies
No npm packages added or removed this session.

---

## Naming Convention Compliance
Commit messages and this document use only "Governance Agent" and "Build Agent" for AI role references. No model names, no `Co-Authored-By` trailers.

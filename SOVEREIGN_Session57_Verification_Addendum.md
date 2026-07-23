# SOVEREIGN Platform — Session 57 Verification Addendum

**Date:** 2026-07-23  
**Session:** 57 (Follow-On)  
**Commit:** see end of this document

---

## Purpose

Session 57's close handoff reported the test total as "1,600+" with two summary rows ("187" and
"all") rather than an explicit per-workspace table. This addendum provides the verified real
table, re-confirms all close checks with actual command output, and records the two
documentation corrections made in this pass.

---

## Full Test Table — Verified

All workspaces run individually with `npm test --workspace=<ws> -- --no-coverage`. Exit code 0
for all 15. Test counts captured from the Jest summary line.

| Workspace | Suites | Tests | Snapshots |
|---|---|---|---|
| sovereign-shell | 1 | 14 | 14 |
| sovereign-data | 9 | 125 | 0 |
| sovereign-api-client | 10 | 175 | 0 |
| module-counsel | 13 | 100 | 0 |
| module-scribe | 25 | 228 | 0 |
| module-vigil | 30 | 183 | 0 |
| module-lens | 9 | 58 | 0 |
| module-cpmi | 16 | 58 | 0 |
| module-agentos | 17 | 89 | 0 |
| module-nexus | 18 | 159 | 0 |
| module-apex | 25 | 218 | 0 |
| module-flowpath | 12 | 135 | 0 |
| module-aria | 13 | 139 | 0 |
| module-workspace | 2 | 22 | 0 |
| e2e | 12 | 153 (4 skipped, 149 passed) | 0 |
| **TOTAL** | **212** | **1856** | **14** |

**Arithmetic self-check:**  
Suites: 1+9+10+13+25+30+9+16+17+18+25+12+13+2+12 = 212 ✅  
Tests: 14+125+175+100+228+183+58+58+89+159+218+135+139+22+153 = 1856 ✅  
Expected: 1846 (Session 56 close) + 10 (PPBEProgramDetail.test.tsx, Session 57) = 1856 ✅  

The e2e row shows 4 skipped tests — this is a pre-existing condition, unchanged since Session 56 (last commit to `e2e/tests/home-dashboard-startup.test.tsx` was `b98926d`, Session 56).

---

## `tsc --noEmit` Re-Verification

All 15 workspaces type-checked individually. Results:

```
sovereign-shell:     OK
sovereign-data:      OK
sovereign-api-client: OK
module-counsel:      OK
module-scribe:       OK
module-vigil:        OK
module-lens:         OK
module-cpmi:         OK
module-agentos:      OK
module-nexus:        OK
module-apex:         OK
module-flowpath:     OK
module-aria:         OK
module-workspace:    OK
e2e:                 FAIL — e2e/tests/home-dashboard-startup.test.tsx(23,3): error TS6133:
                     'EXPIRY_SWEEP_INTERVAL_MS' is declared but its value is never read.
```

The e2e tsc error is pre-existing. It was introduced in Session 56 (`b98926d`) and is not related
to any Session 57 change. Session 57 did not modify any e2e file (confirmed: `git diff baa27b0 HEAD -- e2e/` produces no output).

---

## `npm audit --omit=dev` Re-Verification

```
found 0 vulnerabilities
```

---

## Shell-Contract SHA-256 Re-Verification

```
28ca61d1b761e1805dac200f15e73489dbf3d995e2e7d1063d9ee09646e94443  shell-contract.ts
28ca61d1b761e1805dac200f15e73489dbf3d995e2e7d1063d9ee09646e94443  sovereign-shell/shell-contract.ts
```

Both copies identical and matching the Session 57 hash of record. Shell-contract unchanged.

---

## Corrections Made in This Pass

### 1. `SBOM_Session57_Update.md` — False GD Number Removed

**What was wrong:** The "Governance Decisions Applied" section cited "**GD-29** (docs/29)" for
WG-11. This is incorrect: `docs/29` is a document number (the governance decisions record that
contains WG-11's decision), not a GD number. WG-11's fix required no shell-contract change and
was never assigned a governance decision number. Only WG-14 received a GD number from that
document (GD-28, per docs/29).

**What was fixed:** The line was corrected to cite `docs/29` directly as the decision record,
with an explicit note that WG-11 was not assigned a GD number.

### 2. `sovereign-shell/src/PlatformHome.tsx` — Stale Docstring Updated

**What was wrong:** The top-of-file docstring (lines 10 and 19) still described Module
Orientation as sourced from `MODULE_INFO (navigation/ModuleNav)` — accurate for Session 47 but
incorrect since Session 57 removed that import and replaced the static label with live
WorkQueueSurface data.

**What was fixed:** The docstring was updated to reflect the actual current architecture:
- Phase 1 scope description updated (no more MODULE_INFO reference)
- New Session 57 section added describing D2/WG-7 (live counts) and D3/GD-27 (clickable rows)
- Data sources section updated to describe WorkQueueSurface as the source for Module Orientation
- Version bumped to 2.1 · Session 57 · July 23, 2026

No functional code changed. `tsc --noEmit` on sovereign-shell remains clean after this edit.

---

## Commit

```
chore: session 57 verification addendum — real test table, doc corrections
```

---

*Build Agent — Session 57 Follow-On — 2026-07-23*

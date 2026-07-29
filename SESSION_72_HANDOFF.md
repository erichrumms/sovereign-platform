# Session 72 Handoff — SOVEREIGN Platform Build

**Date:** 2026-07-28
**Commits:** 780dac8 (D1/JSONL) → 0d3bae9 (D1/e2e) → 54e6113 (WH-40) → 10858c8 (WH-45) → d024506 (WH-39)
**Branch:** main (pushed)

---

## Completed Work

### D1 — Test count reconciliation (e2e suite alignment)

The e2e test suite contained 8 stale assertions left over from WG-6 (Session 70) and the WH-34/WH-42 fixes in Session 71. All 8 were diagnosed and corrected this session:

| File | Assertion fixed | Root cause |
|---|---|---|
| `startup-publish-convergence.test.ts` | `SYNTH_PPBE_PROGRAMS.length` → hardcoded `5` | WG-6 expanded to 18 entries; only 5 unique programs publish |
| `home-dashboard-startup.test.tsx` | `No pending reviews` → `No modules are accessible to your current role` | WH-42 updated the empty-state text |
| `ppbe-full-cycle.test.tsx` | `obligationRecord.timestamp`: NOW (FY2026) → `"2026-11-01T12:00:00Z"` (FY2027) | WH-34's `obligationsForYear` filter excluded FY2026 obligations from FY2027 program |
| `ppbe-full-cycle.test.tsx` | Ledger monitor: filtered to `fy2026Programs` before calling `runLedgerMonitor` | WG-6's multi-year records had no matching actuals for non-FY2026 entries |
| `ppbe-full-cycle.test.tsx` | Synthesis count: `toHaveLength(20)` → `toHaveLength(22)` | WG-6 added SYNTH-EF-A0 and SYNTH-EF-B0 |
| `ppbe-full-cycle.test.tsx` | Scenario unique-programs deduplication added before `staticScenarioReport` | Scenario analyst received 18 entries instead of 5 unique programs |
| `ppbe-full-cycle.test.tsx` | Learning velocity: `toBe(65)` → `toBe(68)` (15/22) | WG-6 added 2 feeds_planning_cycle=true findings |
| `ppbe-full-cycle.test.tsx` | Ceiling assertions: DELTA moves to CEILING_EXCEEDED; PROXIMITY array empty | WG-6's SYNTH-OB-D7 pushed DELTA cumulative to 1,015K (203% of 500K estimate) |

**Python JSONL alignment** (committed in prior sub-session as 780dac8): Added 2 missing PPBE_EVALUATION_FINDING events (SYNTH-EF-A0, SYNTH-EF-B0) to `ppbe_synthetic_seed.jsonl` to match the TypeScript constant of 22.

**Final test counts (D1 baseline):**
- 1,775 JS/TS (14 module packages) — all passing, unchanged from Session 71 after e2e fixes applied
- 149 e2e passing, 4 skipped
- 195 Python

---

### D2 — WH-40: APEX PPBE Workflow Agents panel unresponsive after interaction

**Root cause:** Both `runSynthesis()` and `runScenario()` async handlers were invoked with `void`, discarding their returned Promises. If either function rejected after `setSynthStatus("running")` / `setScenStatus("running")` had been called (but before the "done" setter ran), the button would remain permanently disabled with no recovery path short of unmounting the component. The unmount-remount cycle (navigating to a program detail view and back, or switching APEX tabs) was the only recovery — matching the walkthrough observation "navigating away and back restores it."

**Specific failing controls:** Both "Run Evidence Synthesis" and "Run Scenario Analysis" buttons are susceptible to the same mechanism.

**Fix (`module-apex/src/PPBEAgentsPanel.tsx`):** Wrapped both async handler bodies in try/catch. On any exception, the status is reset to `"idle"` (the button re-enables) instead of staying stuck at `"running"`.

**Regression tests added (2):**
- `resets synthesis button to idle (not stuck at running) when runEvidenceSynthesis throws`
- `resets scenario button to idle (not stuck at running) when runScenarioAnalysis throws`

---

### D3 — WH-45: NEXUS Travel Request form shows raw schema-validator text on empty submit

**Root cause:** `buildTravelRequest` built a `TravelRequest` entity with empty strings for the five required text fields (destination, mission_purpose, justification, travel_start_date, travel_end_date), then called `validateTravelRequest`. The validator returned raw property:type notation errors (`destination: required string`, `travel_start_date: required ISO 8601 date string`, etc.). These were joined and displayed verbatim.

**Fix (`module-nexus/src/tt-intake.ts`):** Added user-facing presence checks for the five required text fields BEFORE calling `validateTravelRequest`. Empty fields now produce plain "Please enter a…" messages. The validator is only reached for semantically incorrect but structurally complete forms (e.g., end date before start date), preserving its existing technical errors for those cases.

**Regression test added (1):**
- `WH-45: empty submit shows plain user-facing prompts, not raw schema-validator notation`

---

### D4 — WH-39: APEX Site breakdown table column order (Planned before Obligated)

**Root cause:** The per-site breakdown table in `PPBEDashboard.tsx` rendered the "Obligated" column before the "Planned" column in both the header row and the data rows.

**Fix (`module-apex/src/PPBEDashboard.tsx`):** Swapped both columns so Planned precedes Obligated, matching the convention used in obligation-rate and variance displays.

**Regression test added (1):**
- `WH-39: Planned column precedes Obligated column in the site breakdown header`

---

## Platform-Wide Test Count (post-session 2026-07-28)

| Package | Tests |
|---|---|
| sovereign-shell | 19 |
| module-apex | 221 |
| sovereign-data | 125 |
| module-counsel | 100 |
| module-scribe | 228 |
| module-lens | 58 |
| module-nexus | 166 |
| module-cpmi | 58 |
| module-vigil | 211 |
| module-flowpath | 151 |
| module-aria | 150 |
| module-workspace | 28 |
| module-agentos | 89 |
| sovereign-api-client | 175 |
| **Total** | **1,779** |

- e2e: 149 passed, 4 skipped
- Python: 195 passed

All passing. tsc clean on changed packages. No critical audit findings.

---

## Known Flags for Governance Agent

**ECHO 104% / "on-track" narrative mismatch (carried from Sessions 70–71)** — ECHO's FY2026 obligation rate is 104%, yet the EvaluationFinding narrative marks it "on-track." Resolution requires a governance decision on narrative update vs. suppression note. No fix applied.

---

## TypeScript Status

- module-apex: clean
- module-nexus: clean
- All other packages: unchanged from Session 71 (clean)

---

## Shell Contract

v1.23 — **UNCHANGED** — hash `6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9`

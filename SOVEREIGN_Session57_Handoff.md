# SOVEREIGN Platform — Session 57 Handoff

**Date:** 2026-07-23  
**Session:** 57  
**Commit:** `baa27b0`  
**Push confirmed:** `7f9e661..baa27b0  main → main`  
**Shell-contract:** v1.22 — SHA-256 `28ca61d1b761e1805dac200f15e73489dbf3d995e2e7d1063d9ee09646e94443` (both copies verified unchanged)

---

## Deliverables Completed

### D1 / WG-11 + WG-8 — Native PPBE Program Detail View ✅

**Root cause addressed (GD-29):** PPBE synthetic IDs (`SYNTH-PRG-ALPHA`, etc.) cannot be resolved by `ProgramDetailView.tsx` which calls `adapter.getProgram()` against the World Model only. Bar-clicks in `PPBEDashboard` were routing through `ApexApp`'s shared `openProgram` → `setSelectedProgram` → `ProgramDetailView` path and producing "No program record was found."

**Fix:**
- New component `module-apex/src/PPBEProgramDetail.tsx` — takes `{ programId, inputs, onBack }`. Shows four sections:
  1. **Obligation status** — rate percent + badge (on_track/at_risk/off_track) + planned vs. obligated totals
  2. **Budget-to-actual variance history** — table per obligation plan period, colored variance column
  3. **Dependency health** — filtered to deps where `source_workflow` or `target_workflow` includes `programId`; problem deps sort first
  4. **Site breakdown** — `sitesForProgram(programId)` already filters; table of site/region/obligated/planned/status

- `ApexApp.tsx` adds `ppbeDetailProgram: string | null` state. On the execution tab:
  - When set: renders `PPBEProgramDetail` with `onBack={() => setPpbeDetailProgram(null)}`
  - When null: renders `PPBEDashboard` + `PPBEAgentsPanel` as before
  - `PPBEDashboard`'s `onSelectProgram` now wires to `setPpbeDetailProgram` (not `openProgram`)

- **World Model path completely untouched.** `ProgramDetailView.tsx`, `apex-data-adapter.ts` not modified.

**Constraint #2 compliance:** Reuses `obligationRate()`, `budgetToActualVariance()`, `dependencyHealthIndex()`, `actualsForProgram()`, `sitesForProgram()`, `statusFromObligationRate()` — no parallel implementations.

---

### D2 / WG-7 — Module Orientation Live Queue Counts ✅

**Root cause addressed:** `ModuleOrientationPanel` showed a static `MODULE_INFO[m.moduleId].label` tagline ("Financial approval & routing" etc.) with no live data.

**Fix** (`sovereign-shell/src/PlatformHome.tsx`):
- `ModuleOrientationPanel` now accepts `workQueues: readonly WorkQueueSummary[]` and `onNavigate?: (moduleId: string) => void`
- For each module row: filters `workQueues` by `module_id === m.moduleId.replace('module-', '')` and sums counts
- **Live display:** `{totalCount} pending · {highestSeverity}` (colored by P1/P2/normal) when count > 0; `Clear` (green) when zero
- `MODULE_INFO` import removed (no longer used in this component)
- Parent `PlatformHome` passes `workQueues` (already subscribed via `ctx.workQueueSurface.subscribe`) to the panel

---

### D3 / GD-27 — Module Orientation Rows Clickable ✅

- `ModuleOrientationPanel` accepts `onNavigate?: (moduleId: string) => void`
- When provided, each module row renders as a `<button>` calling `onNavigate(m.moduleId)`
- Parent passes `(moduleId) => ctx.navigateToModule(moduleId)` — uses GD-27 shell-contract export; no shell-contract change needed

---

## Test Results

| Suite | Tests | Status |
|---|---|---|
| `PPBEProgramDetail.test.tsx` (new) | 10 | ✅ pass |
| `ApexApp.test.tsx` (existing) | 5 | ✅ pass (unchanged) |
| `PPBEDashboard.test.tsx` (existing) | 16 | ✅ pass (unchanged) |
| `shell-nav-snapshots.test.tsx` (snapshots updated) | 14 | ✅ pass |
| All other module-apex suites | 187 | ✅ pass |
| All other workspace suites | all | ✅ pass |
| **Total across all workspaces** | **1,600+** | **✅ 0 failures** |

**Snapshot update rationale:** 6 `PlatformHome` snapshots updated to reflect the new `ModuleOrientationPanel` rendering — live queue counts and button wrappers replace the static label. The change is intentional and verified correct.

---

## Close Checks

- `tsc --noEmit` clean: module-apex ✅, sovereign-shell ✅
- `npm audit --omit=dev`: **0 vulnerabilities**
- Shell-contract SHA-256 both copies: `28ca61d1b761e1805dac200f15e73489dbf3d995e2e7d1063d9ee09646e94443` ✅ unchanged
- `git push`: confirmed `7f9e661..baa27b0  main → main`

---

## Files Changed

**Created:**
- `module-apex/src/PPBEProgramDetail.tsx` — new PPBE single-program detail component
- `module-apex/tests/PPBEProgramDetail.test.tsx` — 10 tests

**Modified:**
- `module-apex/src/ApexApp.tsx` — ppbeDetailProgram state + PPBEProgramDetail import + execution tab wiring
- `sovereign-shell/src/PlatformHome.tsx` — ModuleOrientationPanel D2/D3 + MODULE_INFO import removed
- `sovereign-shell/tests/__snapshots__/shell-nav-snapshots.test.tsx.snap` — 6 snapshots updated

**Not modified (by design):**
- `module-apex/src/ProgramDetailView.tsx` — Constraint #3
- `module-apex/src/apex-data-adapter.ts` — Constraint #3
- `shell-contract.ts` / `sovereign-shell/shell-contract.ts` — v1.22 unchanged

---

## Open Items for Next Session

- **WG-14 / GD-28** (pre-approved): not touched this session per scope
- **WG-6, WG-9**: not in scope this session

---

*Build Agent — Session 57 — 2026-07-23*

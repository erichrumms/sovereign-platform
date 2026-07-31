# Session 76 Handoff

**Date:** 2026-07-30  
**Branch:** main  
**HEAD at close:** `eaaaf14`  
**Shell contract:** v1.24 · hash `487054e2b66473ccbbd87e333db70910127549570ce449210a29afd444b4152f` — both copies verified unchanged at open and close.

---

## Session Scope

Responded to SOVEREIGN_Walkthrough_I_Findings_Report_20260730. Three required deliverables (D1 WH-49, D2 WH-48, D3 WH-50) and one optional investigation (D4 WH-52).

---

## D1 — WH-49: Fiscal Year Navigation Bug (REQUIRED) ✓

**Commit:** `d4e3447`  
**Files changed:** `module-apex/src/ApexApp.tsx`, `module-apex/src/PPBEDashboard.tsx`, `module-apex/src/PPBEProgramDetail.tsx`, `module-apex/tests/PPBEDashboard.test.tsx`  
**Net diff:** +38 / −8 across 4 files

**Root cause confirmed:** `PPBEDashboard` and `PPBEProgramDetail` each initialized their own `selectedFiscalYear` state to `"FY 2026"` independently. Selecting PY (FY 2025) in the Dashboard then clicking a program opened `PPBEProgramDetail` at mount with a fresh default — CY — every time.

**Fix:** Threaded the selected fiscal year through the `onSelectProgram` callback signature:

- `PPBEDashboard.onSelectProgram` changed from `(programId: string) => void` to `(programId: string, fiscalYear: string) => void`. A `handleSelectProgram` wrapper injects `selectedFiscalYear` before forwarding.
- `ApexApp` stores the fiscal year alongside the program ID: `ppbeDetailFiscalYear` state (default `"FY 2026"`).
- `PPBEProgramDetail` gains `initialFiscalYear?: string` prop. The `useState` initializer uses it when the value is non-null and present in `availableYears`; falls back to `"FY 2026"` or `availableYears[0]` otherwise.
- Test at `PPBEDashboard.test.tsx:134` updated: `expect(onSelect).toHaveBeenCalledWith("PRG-001", expect.any(String))`.

`PPBEDashboard`'s "no buttons when no prop" test required one additional fix: `handleSelectProgram` was always truthy (defined inside the component), so the conditional `onSelectProgram={onSelectProgram ? handleSelectProgram : undefined}` was necessary to preserve the test's "no buttons rendered" assertion when no external callback is provided.

---

## D2 — WH-48: Variance Prose → Table (REQUIRED) ✓

**Commit:** `9b718f4`  
**Files changed:** `module-apex/src/PPBEDashboard.tsx`, `module-apex/src/PPBEProgramDetail.tsx`, `module-apex/tests/PPBEDashboard.test.tsx`  
**Net diff:** +53 / −12 across 3 files

**Fix:** Both variance narrative locations replaced with a four-column `<table>` (`aria-label="Budget-to-actual variance by period"`):

| Period | Planned | Actual | Variance |
|--------|---------|--------|----------|
| `shortId(program_id) period` | `formatCurrency(planned)` | `formatCurrency(actual)` | color-coded `formatCurrency(variance)` or `"On plan"` |

Variance column: red (`#dc2626`) for under-executing, green (`#059669`) for over-executing, grey (`#64748b`) for on-plan. Prose narratives remain for obligation rate and dependency health (Gap 5 coverage unchanged).

**Both locations touched:**
- `PPBEDashboard.tsx` — portfolio-level variance chart caption (all programs, `shortId(v.program_id)` prefix on period)
- `PPBEProgramDetail.tsx` — single-program variance chart caption (period only, no program prefix)

**Test fix:** The Session 32 baseline test at `PPBEDashboard.test.tsx:78` checked for prose text `/Logistics Data Interchange.*FY 2026 Q1.*under-executing.*/` which no longer exists. Updated to:
```typescript
expect(screen.getByLabelText("Budget-to-actual variance by period")).toBeInTheDocument();
expect(screen.getByText("001 FY 2026 Q1")).toBeInTheDocument();
```
(`shortId("PRG-001")` returns `"001"` per the existing WG-3 test.)

---

## D3 — WH-50: React StrictMode Double-Invoke Investigation (REQUIRED) ✓

**No code changes.** Code-level findings only, as instructed.

### Hypothesis under investigation

Whether React StrictMode's double-invocation of `useEffect` bodies could produce extra TRAVEL_APPROVAL or TIME_CORRECTION_SENT entries in the Reviewer's Workspace Activity & Decisions panel.

### Findings

**NEXUS TRAVEL_APPROVAL events — emission site: `recordTravelDecision` (tt-travel-queue.ts:180)**

`recordTravelDecision` emits `HUMAN_DECISION / TRAVEL_APPROVAL` with `actor_name` set. It is called from exactly two sites:

1. `useTTIntake.decideTravel` (useTTIntake.ts:306) — a `useCallback`, invoked by button click in `TTQueuePanel`. **Not inside any `useEffect`.**
2. `WorkspaceApp.NexusWorkspaceSection.tt.decideTravel` (WorkspaceApp.tsx:524) — inline callback, invoked by `TravelQueueRow` button click. **Not inside any `useEffect`.**

StrictMode does not double-fire event handlers. **StrictMode cannot produce extra TRAVEL_APPROVAL log entries.**

**SCRIBE TIME_CORRECTION_SENT events — emission site: `TTManagerReview.recordSend` (TTManagerReview.tsx:159)**

`recordSend` emits `HUMAN_DECISION / TIME_CORRECTION_SENT` with `actor_name` set. Called from:

- `onClick={() => recordSend(selected)}` at TTManagerReview.tsx:286 — a button click handler. **Not inside any `useEffect`.**

StrictMode does not double-fire click handlers. **StrictMode cannot produce extra TIME_CORRECTION_SENT log entries.**

**Survey of all relevant `useEffect` calls — none emit HUMAN_DECISION with `actor_name` set:**

| Location | Effect body | Writes to |
|----------|-------------|-----------|
| `WorkspaceApp.tsx:315` | VIGIL expiry sweep via `expireVigilSessionRequests` | `ctx.logger` — but emits `AGENT_ACTION_EXPIRED` with no `actor_name`; invisible in per-user Activity filter |
| `WorkspaceApp.tsx:332` | VIGIL WG-16 republish | `workQueueSurface` only |
| `WorkspaceApp.tsx:412` | ARIA WG-16 republish | `workQueueSurface` only |
| `WorkspaceApp.tsx:452` | SCRIBE WG-16 republish | `workQueueSurface` only |
| `NexusApp.tsx:217` | `publishNexusTravelItems` | `reviewerWorkspaceSurface` only |
| `useTTIntake.ts:235` | Session-store subscription | `setTravelItems` / `setTimeItems` only |
| `useReviewerWorkspaceItems.ts:28` | Surface subscription | `setItems` only |
| `ScribeApp.tsx:80,88` | Workspace / work-queue publish on mount | `workQueueSurface` / `reviewerWorkspaceSurface` only |

The Activity section filters by `e.actor_name === ctx.auth.user.name`. The one `useEffect` that does reach `ctx.logger` (`WorkspaceApp.tsx:315`) emits `AGENT_ACTION_EXPIRED` — no `actor_name` field — which the filter excludes entirely.

**Seed data:** Travel seeds in `useTTIntake` (lines 175–184, `useMemo` with empty deps) call `evaluateTravelRequest` only — pure function, no logger emission. Comment at line 119 confirms: *"seeds enter WITHOUT Logger emission."* Seeds produce zero Activity log entries regardless of StrictMode behavior.

### Summary

The StrictMode double-invoke hypothesis is **not supported** by the code. All `ctx.logger.log` calls that emit `HUMAN_DECISION` events with `actor_name` set (TRAVEL_APPROVAL and TIME_CORRECTION_SENT) are inside event handler callbacks. No `useEffect` in the component tree emits either event type. A single button press cannot produce more than one HUMAN_DECISION event for either decision type.

---

## D4 — WH-52: Floating Grey Sidebar Badge (OPTIONAL) ✓

**No code changes.** Brief investigation as instructed.

**Finding:** The floating grey element is the `InfoBadge` tooltip in `ModuleNav.tsx` (lines 227–261). It renders via `createPortal` to `document.body` with `position: "fixed"` and `background: T.bg.elevated` (the sidebar's elevated background, which reads as grey in screenshots). It appears when the mouse enters the ⓘ icon next to a module name; `onMouseLeave` clears `anchorRect` and removes it.

This is the WG-2 (Session 54) portal fix that escaped the sidebar's overflow clipping. The appearance in Part 4 screenshots was a mid-hover capture. **No stale-visibility bug exists in the code.** No change needed.

---

## Supplemental — Cross-Module Connection Checks

Four checks requested after the D1–D4 deliverables were committed. All are code-level findings with direct evidence; no plausibility arguments.

---

### Supplemental Check 1 — WH-49 × WH-37: Carried Fiscal Year Respects the Budget-Year Gate

**Gap found and fixed.** The two fixes (WH-49: carry fiscal year; WH-37: gate execution metrics) were each tested in isolation. No prior test exercised both together on a program that has records for multiple fiscal years.

**What was verified:** `PPBEProgramDetail`'s `useState` initializer (line 118–120) honors `initialFiscalYear` when it appears in `availableYears`. `availableYears` is derived at lines 107–113 by filtering the programs array on `program_id`. When the Dashboard opens on PY (FY 2025) and the user clicks through to a multi-year program, `initialFiscalYear="FY 2025"` lands in `availableYears` (because PY records exist), and `selectedFiscalYear` is set to FY 2025. Then `isBudgetYear` evaluates to false (FY 2025 is not FY 2027 or FY 2028) — correctly showing execution metrics for PY. When `initialFiscalYear="FY 2027"` (BY), `isBudgetYear` becomes true — correctly showing the planning notice.

**Test added:** New `describe("PPBEProgramDetail — WH-49 × WH-37 interaction", ...)` in `PPBEProgramDetail.test.tsx` using `MULTI_YEAR_INPUTS` (FY 2026 + FY 2027 records for the same `program_id`):
- `initialFiscalYear="FY 2027"` → planning notice renders, obligation rate absent, variance table absent.
- No `initialFiscalYear` → defaults to CY, execution metrics render, planning notice absent.

**Commit:** `eaaaf14`

---

### Supplemental Check 2 — WH-48 × WH-37: Variance Table Suppressed for BY/BY+1

**No gap.** The WH-48 table is inside `VarianceChart` in `PPBEDashboard.tsx` and inside the non-`isBudgetYear` else branch in `PPBEProgramDetail.tsx`. Since neither renders when `isBudgetYear === true`, the table is suppressed by the same gate.

**Exact conditionals:**
- Dashboard: `isBudgetYear ? <StatusNotice> : ... <VarianceChart variances={data.variances} />` — `VarianceChart` contains the table at line 303.
- Detail: `isBudgetYear ? <StatusNotice> : variances.length === 0 ? <p>…</p> : <> <chart/> <table aria-label="Budget-to-actual variance by period"> </>` — table is in the final else branch.

`isBudgetYear` at Dashboard:513 / Detail:160: `selectedFiscalYear === 'FY 2027' || selectedFiscalYear === 'FY 2028'`.

**Test coverage updated:** Both existing WH-37 "BY variance" tests now explicitly assert `queryByLabelText("Budget-to-actual variance by period")` is absent (`null`). Commit: `eaaaf14`.

---

### Supplemental Check 3 — HUMAN_DECISION Emission Pattern, Platform-Wide

**Question:** Does "emit only inside click handlers, never in useEffect" hold for every HUMAN_DECISION / actor_name emission across the entire platform?

**Finding: Yes, without exception.** Every emission site surveyed:

| Module | Emission site | Event type | actor_name | Call chain |
|--------|--------------|------------|------------|------------|
| VIGIL | `useApprovalDecision.ts:69` | `AGENT_APPROVAL_DECISION` | `ctx.auth.user.name` | `decide` useCallback → button onClick |
| FLOWPATH | `WorkflowArtifactReview.tsx:88,101` | `HUMAN_DECISION` / `FLOWPATH_ARTIFACT_APPROVED` | `ctx.auth.user.name` | `approve()` → `onClick={approve}` |
| FLOWPATH | `GateRunnerPanel.tsx:85,112` | `HUMAN_DECISION` | `ctx.auth.user.name` | `attestGate3()` / `completeGate4()` → `onClick=` |
| ARIA | `ClearCertificationQueue.tsx:176,198` | `ARIA_CERTIFICATION_ISSUED` / `ARIA_VIOLATION_FLAGGED` | `ctx.auth.user.name` | `decide()` → `onClick=` |
| NEXUS | `tt-travel-queue.ts:165` | `HUMAN_DECISION / TRAVEL_APPROVAL` | `decider.name` | `recordTravelDecision` ← `decideTravel` useCallback ← button onClick |
| SCRIBE | `TTManagerReview.tsx:159` | `HUMAN_DECISION / TIME_CORRECTION_SENT` | `ctx.auth.user.name` | `recordSend` ← `onClick={() => recordSend(selected)}` |

All `useEffect` bodies that reach `ctx.logger` either emit with no `actor_name` (e.g. `WorkspaceApp.tsx:315` → `AGENT_ACTION_EXPIRED`) or write to workspace surfaces only — never to `ctx.logger` with `actor_name` set.

`WorkflowArtifactReview.tsx:134` (`returnForRevision`) emits `FLOWPATH_GATE_FAILED` with `actor_id` only — no `actor_name`. Invisible to the per-user Activity filter.
`useApprovalBrief.ts` emits `AGENT_STEP_START` / `FALLBACK_ACTIVATED` / `AGENT_STEP_COMPLETE` — no `actor_name`.

**No code changes.** Finding only.

---

### Supplemental Check 4 — WH-49 Root Cause Pattern, Searched Platform-Wide

**Question:** Any other Dashboard-to-Detail navigation pair where two components independently initialize shared state that users would expect to carry?

**Finding: None.** The only instance of this pattern is WH-49 itself (fixed in `d4e3447`). Specifics for the closest candidate:
- **NEXUS `RequestQueuePanel`** — lifts `selectedId` to its parent via props. No duplicate initialization.
- No other module has a two-level view (list → detail) where both levels independently derive the same state from their own defaults.

**No code changes.** Finding only.

---

## Test Results

Full suite across all 14 packages. Module-apex increased to 228 (two new WH-49 × WH-37 interaction tests added in supplemental commit `eaaaf14`).

| Package | Tests |
|---------|-------|
| module-agentos | 89 |
| module-apex | 228 |
| module-aria | 150 |
| module-counsel | 100 |
| module-cpmi | 58 |
| module-flowpath | 151 |
| module-lens | 61 |
| module-nexus | 166 |
| module-scribe | 232 |
| module-vigil | 211 |
| module-workspace | 28 |
| sovereign-api-client | 175 |
| sovereign-data | 125 |
| sovereign-shell | 19 |
| **JS/TS subtotal** | **1,793** |
| e2e | 149 passed, 4 skipped |
| Python (sovereign-security) | 195 |
| **Total** | **2,137** |

TSC: clean across all 14 packages.

npm audit: 5 pre-existing vulnerabilities (brace-expansion ×2 high, esbuild moderate, js-yaml ×2 high, postcss high) — all in devDependencies or test tooling, unchanged from prior sessions.

Shell contract: `487054e2b66473ccbbd87e333db70910127549570ce449210a29afd444b4152f` — both copies verified at open and close, unchanged.

---

## Commits This Session

```
eaaaf14  test(WH-49×WH-37,WH-48×WH-37): add cross-fix interaction tests
9b718f4  fix(D2/WH-48): replace variance prose narratives with Period/Planned/Actual/Variance table
d4e3447  fix(WH-49): carry selected fiscal year from PPBE dashboard to program detail
```

(Plus `a2876e5` / `5a5ba20` / `d349419` — governance document placements committed prior to this session's deliverable work.)

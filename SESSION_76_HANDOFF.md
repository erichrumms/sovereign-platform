# Session 76 Handoff

**Date:** 2026-07-30  
**Branch:** main  
**HEAD at close:** `9b718f4`  
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

## Test Results

Full suite across all 14 packages, matching the established baseline of 2,135 passing.

| Package | Tests |
|---------|-------|
| module-agentos | 89 |
| module-apex | 226 |
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
| **JS/TS subtotal** | **1,791** |
| e2e | 149 passed, 4 skipped |
| Python (sovereign-security) | 195 |
| **Total** | **2,135** |

TSC: clean across all 14 packages.

npm audit: 5 pre-existing vulnerabilities (brace-expansion ×2 high, esbuild moderate, js-yaml ×2 high, postcss high) — all in devDependencies or test tooling, unchanged from prior sessions.

Shell contract: `487054e2b66473ccbbd87e333db70910127549570ce449210a29afd444b4152f` — both copies verified at open and close, unchanged.

---

## Commits This Session

```
9b718f4  fix(D2/WH-48): replace variance prose narratives with Period/Planned/Actual/Variance table
d4e3447  fix(WH-49): carry selected fiscal year from PPBE dashboard to program detail
```

(Plus `a2876e5` / `5a5ba20` / `d349419` — governance document placements committed prior to this session's deliverable work.)

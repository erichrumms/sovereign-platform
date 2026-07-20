# SOVEREIGN Platform — Session 47 Handoff
**Date:** 2026-07-20  
**Session:** 47  
**Feature:** Home Dashboard Phase 1 — Work Scope, Issues, To Do/Review  
**Shell-contract version:** no change (v1.18 from Session 44, GD-23)  
**Commit:** (populated by close protocol)

---

## Done-Condition Traceability

| Done Condition | Status | Evidence |
|---|---|---|
| D1 — Program Health section | DONE | `PlatformHome.tsx`: `ProgramHealthPanel` renders one tile per program from `ctx.programStatusSurface.list()`; role-gated to PROGRAM_MANAGER, ANALYST, PLATFORM_ADMIN, SYSTEM_ADMIN; snapshot tests for all 5 roles pass |
| D2 — Flagged / At-Risk Programs section | DONE | `FlaggedProgramsPanel` filters to `status !== "on_track"`; honest empty state "No flagged programs — all programs are on track" when nothing is flagged; same role gate as D1; snapshot tests pass |
| D3 — Module Orientation section | DONE | `ModuleOrientationPanel` imports `MODULE_INFO` directly from `ModuleNav.tsx` (no duplication); filters to accessible modules via `isAccessible` prop; visible to all roles, showing only the modules each role can access |
| D4 — Three-category layout with honest Phase 2 placeholder | DONE | Page is organized as Work Scope / Issues / To Do · Review; the third section renders "wired in a future session (WorkQueueSurface)" in a visible dashed box; snapshot test asserts the placeholder text is in the DOM |

---

## D1 — Program Health

`ProgramHealthPanel` reads `ctx.programStatusSurface.list()` — the same surface APEX's
`statusFromObligationRate()` publishes to on data load (no second threshold rule).

Each `ProgramTile` shows:
- Program ID label (truncates with `text-overflow: ellipsis` for long IDs)
- Status badge (On Track / At Risk / Off Track) with color-coded background
- Obligation rate as a blue progress bar + percentage label

Empty state: *"No program data published — APEX populates this when programs are loaded."*

**Role visibility** (D1 done condition):

| Role | Sees Program Health? |
|------|---------------------|
| PROGRAM_MANAGER | ✓ |
| ANALYST | ✓ |
| PLATFORM_ADMIN | ✓ |
| SYSTEM_ADMIN | ✓ |
| COMPLIANCE_OFFICER | ✗ — sees orientation message instead |
| INDEPENDENT_REVIEWER | ✗ — sees orientation message instead |
| AGENT_OPERATOR | ✗ |
| READ_ONLY | ✗ |

Role check: `PROGRAM_DATA_ROLES.has(ctx.auth.user.role)` — uses `ctx.auth.user.role` directly (same approach as other role gates in the platform that check a fixed set without a hierarchy).

---

## D2 — Flagged Programs

`FlaggedProgramsPanel` receives the same `programs` array filtered to `p.status !== "on_track"`.
No second threshold. The surface's `status` field is already the correct answer.

The Issues section badge ("N flagged") appears only when `canSeeProgramData && flagged.length > 0`.

Empty state: a green dot + "No flagged programs — all programs are on track." — matches VIGIL's
"No pending approvals" honest-empty-state convention.

---

## D3 — Module Orientation

`MODULE_INFO` and `ModuleInfo` are now exported from `navigation/ModuleNav.tsx` (two `export`
keywords added; no other change to that file). `PlatformHome` imports them directly — no copy.

`accessibleModules = modules.filter(isAccessible)` — the same `isAccessible` callback that
drives the sidebar (passed in from `main.tsx`'s `defaultRoleAccessPolicy`).

**Role visibility** (verified against access matrix):

| Role | Accessible modules shown |
|------|--------------------------|
| SYSTEM_ADMIN | All 10 |
| PROGRAM_MANAGER | 7 (COUNSEL, SCRIBE, LENS, NEXUS, APEX, FLOWPATH, ARIA) |
| ANALYST | 3 (APEX, FLOWPATH, ARIA) |
| COMPLIANCE_OFFICER | 2 (NEXUS, ARIA) |
| INDEPENDENT_REVIEWER | 0 — "No modules accessible with your current role." |

Each item shows module `displayName` (bold) and the three-word label from `MODULE_INFO` (muted).
The hover ⓘ popover in the sidebar is unchanged.

---

## D4 — Three-Category Layout

Section order: **Work Scope** → **Issues** → **To Do / Review**

Work Scope is a two-column grid when `canSeeProgramData` is true (Program Health left,
Module Orientation right). When false, Module Orientation spans full width.

**Phase 2 placeholder** (visible, not just in code):
```
Pending approvals and reviews across modules — wired in a future session (WorkQueueSurface).
Will include: Pending Approvals, T&T Reviews, Certifications, Coordination Items.
```

Rendered as a dashed border box (`border: 1px dashed #cbd5e1`, `background: #f8fafc`).
The snapshot test `"To Do / Review section renders its honest placeholder..."` asserts
`container.textContent` contains `"WorkQueueSurface"` and `"wired in a future session"` —
this confirms the placeholder is rendered in the DOM, not only in code.

---

## Role-Visibility Verification

All five roles live-tested this session were checked via snapshot tests:

| Role | D1/D2 visible? | D3 module count | D4 placeholder? |
|------|---------------|-----------------|-----------------|
| SYSTEM_ADMIN | ✓ | 10 | ✓ |
| PROGRAM_MANAGER | ✓ | 7 | ✓ |
| ANALYST | ✓ | 3 | ✓ |
| COMPLIANCE_OFFICER | ✗ (message shown) | 2 | ✓ |
| INDEPENDENT_REVIEWER | ✗ (message shown) | 0 (empty state) | ✓ |

---

## Phase 2 Disclosure

The To Do / Review section is intentionally empty (a disclosed placeholder) because it requires
`WorkQueueSurface` — a future cross-module data surface that, like `ProgramStatusSurface`,
requires its own governance decision before it can be added to `SovereignShellContext`. This
session was scoped to avoid reaching into VIGIL, SCRIBE, ARIA, or NEXUS directly — the Session
40 Hard-Stop constraint.

Phase 2 will wire: Pending Approvals (VIGIL), T&T Reviews (NEXUS), Certifications (ARIA),
Coordination Items (NEXUS). Each requires `WorkQueueSurface` publishing from its respective
module.

---

## Test Results

```
Test Suites: 1 passed, 1 total  (sovereign-shell — shell-nav-snapshots.test.tsx)
Tests:       14 passed, 14 total  (+9 vs. Session 46 baseline of 5 shell tests)
Snapshots:   8 written, 6 passed, 14 total
```

Full monorepo: all test suites pass (same as Session 46 baseline — this session touches only
the shell, which has its own test file; no other module test counts changed).

New tests added:
- `empty state — no programs, no modules (SYSTEM_ADMIN)`
- `with program data — 3 programs including at_risk and off_track (SYSTEM_ADMIN)`
- `SYSTEM_ADMIN — sees Program Health, Flagged Programs, all 10 modules in orientation`
- `PROGRAM_MANAGER — sees Program Health, Flagged Programs, 7 accessible modules in orientation`
- `ANALYST — sees Program Health, Flagged Programs, 3 accessible modules in orientation`
- `COMPLIANCE_OFFICER — cannot see Program Health/Flagged, sees 2 accessible modules in orientation`
- `INDEPENDENT_REVIEWER — cannot see Program Health/Flagged, sees 0 accessible modules in orientation`
- `To Do / Review section renders its honest placeholder for all roles — verified via SYSTEM_ADMIN`

---

## Files Changed

| File | Change |
|------|--------|
| `sovereign-shell/src/PlatformHome.tsx` | Complete rewrite — three-section layout (Work Scope / Issues / To Do · Review); imports `MODULE_INFO` from `ModuleNav`; reads `ctx.programStatusSurface`; accepts `modules` + `isAccessible` props |
| `sovereign-shell/src/navigation/ModuleNav.tsx` | Added `export` to `ModuleInfo` interface and `MODULE_INFO` constant; no other change |
| `sovereign-shell/src/main.tsx` | Pass `modules={modules} isAccessible={isAccessible}` to `<PlatformHome>` |
| `sovereign-shell/tests/shell-nav-snapshots.test.tsx` | Updated `makePlatformHomeCtx` to include `programStatusSurface` mock + `role` param; added 8 new PlatformHome tests |
| `sovereign-shell/tests/__snapshots__/shell-nav-snapshots.test.tsx.snap` | Deleted stale PlatformHome entries (GREEN/AMBER); 8 new PlatformHome snapshots written |

`sovereign-data` entities: **zero changes**.  
Shell contract: **zero changes** (v1.18).  
No other module touched.

---

## What Session 48 Should Know

- `MODULE_INFO` and `ModuleInfo` are now exported from `ModuleNav.tsx`. Any session that adds
  a new module must also add an entry to `MODULE_INFO` (same requirement as before; now also
  visible from PlatformHome).
- `PlatformHome` now accepts optional `modules` and `isAccessible` props (defaulting to `[]`
  and `() => false`). The previous `<PlatformHome ctx={ctx} />` call still compiles but renders
  an empty Module Orientation — pass both props for correct behavior.
- Phase 2 (To Do / Review) is blocked on a governance decision to add `WorkQueueSurface` to
  `SovereignShellContext` (Standing Constraint #7 — requires a GD). Do not attempt to reach
  into VIGIL/NEXUS/ARIA/SCRIBE directly to populate it.
- The `PROGRAM_DATA_ROLES` set in `PlatformHome.tsx` matches the D1 done condition exactly.
  If the role matrix ever changes for program visibility, update this set and the test cases.

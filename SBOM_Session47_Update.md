# SOVEREIGN Platform — SBOM Update, Session 47
**Date:** 2026-07-20  
**Session:** 47  
**Feature:** Home Dashboard Phase 1 — Work Scope, Issues, To Do/Review  
**Commit:** (populated by close protocol)

---

## New Components

| Component | Type | Location | Introduced |
|---|---|---|---|
| `ProgramHealthPanel` | React component (module-local) | `sovereign-shell/src/PlatformHome.tsx` | Session 47 — renders one tile per program from ProgramStatusSurface; role-gated |
| `FlaggedProgramsPanel` | React component (module-local) | `sovereign-shell/src/PlatformHome.tsx` | Session 47 — filters to at_risk / off_track; honest empty state |
| `ModuleOrientationPanel` | React component (module-local) | `sovereign-shell/src/PlatformHome.tsx` | Session 47 — shows accessible modules + MODULE_INFO labels |
| `ProgramTile` | React component (module-local) | `sovereign-shell/src/PlatformHome.tsx` | Session 47 — single program tile with status badge + obligation bar |
| `StatusBadge` | React component (module-local) | `sovereign-shell/src/PlatformHome.tsx` | Session 47 — On Track / At Risk / Off Track badge with color |
| `PROGRAM_DATA_ROLES` | ReadonlySet constant (module-local) | `sovereign-shell/src/PlatformHome.tsx` | Session 47 — role gate for D1/D2; contains PROGRAM_MANAGER, ANALYST, PLATFORM_ADMIN, SYSTEM_ADMIN |

---

## Modified Components

| Component | Location | Change |
|---|---|---|
| `PlatformHome` | `sovereign-shell/src/PlatformHome.tsx` | Complete rewrite — three-section layout (Work Scope / Issues / To Do · Review) |
| `PlatformHomeProps` | `sovereign-shell/src/PlatformHome.tsx` | Added `modules?: RegisteredModuleView[]` and `isAccessible?: (m: RegisteredModuleView) => boolean` |
| `ModuleInfo` (interface) | `sovereign-shell/src/navigation/ModuleNav.tsx` | Added `export` keyword; no structural change |
| `MODULE_INFO` (constant) | `sovereign-shell/src/navigation/ModuleNav.tsx` | Added `export` keyword; content unchanged |
| `App` (render) | `sovereign-shell/src/main.tsx` | Pass `modules={modules} isAccessible={isAccessible}` to `<PlatformHome>` |
| `makePlatformHomeCtx` | `sovereign-shell/tests/shell-nav-snapshots.test.tsx` | Added `role` + `programSnapshots` params; added `programStatusSurface` to mock |
| `PlatformHome snapshots` (test suite) | `sovereign-shell/tests/shell-nav-snapshots.test.tsx` | Replaced 2 governance-state tests with 8 role-visibility tests |
| `shell-nav-snapshots.test.tsx.snap` | `sovereign-shell/tests/__snapshots__/` | Deleted stale GREEN/AMBER PlatformHome entries; 8 new PlatformHome snapshots written |

---

## New External Dependencies

None. This session adds no new packages. `MODULE_INFO` is reused from `ModuleNav`; `ProgramStatusSurface` reads from the existing shell context.

---

## Removed Components

| Component | Location | Reason |
|---|---|---|
| `GATE_STATE_ORDER` | former `PlatformHome.tsx` | Removed with Session 30 layout — CPMI gate state display now lives solely in governance dashboard |
| `GATE_STATE_LABEL` | former `PlatformHome.tsx` | Same |
| `ProductRow` | former `PlatformHome.tsx` | Same |
| `buildThingsToDo()` | former `PlatformHome.tsx` | Replaced by the three-section layout; governance alerts remain in header indicator |
| `TOTAL_REGISTERED_AGENTS` / `PRIMARY_MODULE_COUNT` / `COMPANION_MODULE_COUNT` | former `PlatformHome.tsx` | Platform Facts panel removed |

All of the above were implementation details of the Session 30 landing page. The replacement
(Session 47) provides the same governance awareness via the existing `GovernanceHeaderIndicator`
in the header and the ModuleNav sidebar, while adding program data and module orientation
directly to the landing body.

---

## Unchanged Modules

All other platform modules are unchanged:
- `sovereign-data` — zero changes
- All product module packages — untouched
- Shell contract — remains v1.18 (GD-23); no new export

---

## Shell-Contract Version

No change. v1.18 (Session 44, GD-23). SHA unchanged.

---

## Test Inventory Delta

| File | Before | After | Notes |
|------|--------|-------|-------|
| `sovereign-shell/tests/shell-nav-snapshots.test.tsx` | 5 shell tests | 14 shell tests | +9 PlatformHome role-visibility tests; ModuleNav + DevPersonaToggle tests unchanged |
| All other test files | unchanged | unchanged | — |
| **Total (monorepo)** | **same as Session 46** | **same as Session 46** | No net change outside shell |

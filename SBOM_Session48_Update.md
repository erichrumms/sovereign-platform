# SOVEREIGN Platform — SBOM Update, Session 48
**Date:** 2026-07-20  
**Session:** 48  
**Feature:** Snapshot fixture drift fix — live ModuleLoader derivation  
**Commit:** (populated by close protocol)

---

## New Components

| Component | Type | Location | Introduced |
|---|---|---|---|
| `tests/__mocks__/anthropic-key.ts` | Jest stub | `sovereign-shell/tests/__mocks__/` | Session 48 — returns `undefined`; replaces 6 cross-module `import.meta.env` files in test context |
| `tests/__mocks__/vigil-endpoint.ts` | Jest stub | `sovereign-shell/tests/__mocks__/` | Session 48 — returns `null`; replaces VIGIL `import.meta.env` file in test context |
| `tests/__mocks__/cpmi-world-model-endpoint.ts` | Jest stub | `sovereign-shell/tests/__mocks__/` | Session 48 — returns `null`/`undefined`; replaces CPMI `import.meta.env` file in test context |
| `tests/__mocks__/raw-string.ts` | Jest stub | `sovereign-shell/tests/__mocks__/` | Session 48 — returns empty string; replaces Vite `*.md?raw` imports (module-scribe, module-apex, module-nexus) in test context |

---

## Modified Components

| Component | Location | Change |
|---|---|---|
| `ALL_MODULES` fixture | `sovereign-shell/tests/shell-nav-snapshots.test.tsx` | Replaced hand-copied 110-line array with live derivation via `createShell + ModuleLoader + registerPlatformModules`; can never drift from real source |
| `moduleNameMapper` | `sovereign-shell/package.json` (Jest config) | Added 4 entries mapping Vite-specific file patterns to Jest stubs |
| Test descriptions (5 ModuleNav) | `sovereign-shell/tests/shell-nav-snapshots.test.tsx` | Updated ANALYST 3→6, COMPLIANCE_OFFICER 2→4, INDEPENDENT_REVIEWER 0→2; PROGRAM_MANAGER and SYSTEM_ADMIN descriptions updated with module list detail |
| Test descriptions (8 PlatformHome) | `sovereign-shell/tests/shell-nav-snapshots.test.tsx` | Same count corrections for role-visibility tests |
| `shell-nav-snapshots.test.tsx.snap` | `sovereign-shell/tests/__snapshots__/` | Deleted 13 stale entries (lines 63–4376); 13 entries regenerated from live modules with correct minimumRole-based filtering |

---

## New External Dependencies

None. No new packages added. `createShell`, `ModuleLoader`, and `registerPlatformModules`
were already in the codebase; this session wires them into the test fixture.

---

## Removed Components

| Component | Reason |
|---|---|
| Hand-copied `ALL_MODULES` array (110 lines) in `shell-nav-snapshots.test.tsx` | Replaced by live derivation; was source of drift for 3 modules |

---

## Unchanged Modules

All product modules are unchanged — no source file under any `module-*/src/` was modified.  
Shell contract: v1.18 (GD-23). No new shell context exports.  
`sovereign-data` entities: zero changes.

---

## Shell-Contract Version

No change. v1.18 (Session 44, GD-23). SHA unchanged.

---

## Test Inventory Delta

| File | Before | After | Notes |
|------|--------|-------|-------|
| `sovereign-shell/tests/shell-nav-snapshots.test.tsx` | 14 tests (stale counts) | 14 tests (correct counts) | No new tests; fixture source changed |
| `shell-nav-snapshots.test.tsx.snap` | 14 snapshots (stale) | 14 snapshots (correct) | 13 regenerated, 1 (DevPersonaToggle) unchanged |
| All other test files | unchanged | unchanged | — |
| **Total (monorepo)** | **same as Session 47** | **same as Session 47** | Count unchanged; data now correct |

---

## Role Visibility Counts (authoritative, corrected this session)

| Role | Accessible module count | Modules |
|------|------------------------|---------|
| SYSTEM_ADMIN | 10 | All (universal superuser) |
| PROGRAM_MANAGER | 7 | COUNSEL, SCRIBE, LENS, NEXUS, APEX, FLOWPATH, ARIA |
| ANALYST | **6** (was 3) | COUNSEL, SCRIBE, LENS, APEX, FLOWPATH, ARIA |
| COMPLIANCE_OFFICER | **4** (was 2) | COUNSEL, LENS, NEXUS, ARIA |
| INDEPENDENT_REVIEWER | **2** (was 0) | COUNSEL, LENS |

Session 47 Handoff and SBOM contained the stale counts. This table supersedes them.

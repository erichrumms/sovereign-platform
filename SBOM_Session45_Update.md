# SOVEREIGN Platform — SBOM Update, Session 45
**Date:** 2026-07-19  
**Session:** 45  
**Feature:** Visual Regression Test Scaffolding — `sovereign-shell`  
**Commit:** 4d07064

---

## New Components

| Component | Type | Location | Introduced |
|---|---|---|---|
| `DevPersonaToggle` | React component (exported) | `sovereign-shell/src/DevPersonaToggle.tsx` | Session 45 (extracted from main.tsx) |
| `readDevPersona` | Exported function | `sovereign-shell/src/DevPersonaToggle.tsx` | Session 45 (extracted from main.tsx) |
| `DEV_PERSONA_ROLES`, `DEV_PERSONA_KEY`, `DEV_PERSONA_LABELS` | Exported constants | `sovereign-shell/src/DevPersonaToggle.tsx` | Session 45 (extracted from main.tsx) |
| `sovereign-shell/tests/` | New test directory | `sovereign-shell/tests/` | Session 45 |
| `setup-dom.ts` | Jest setup file | `sovereign-shell/tests/setup-dom.ts` | Session 45 |
| `shell-nav-snapshots.test.tsx` | Snapshot test file | `sovereign-shell/tests/shell-nav-snapshots.test.tsx` | Session 45 |
| `shell-nav-snapshots.test.tsx.snap` | Jest snapshot file | `sovereign-shell/tests/__snapshots__/` | Session 45 (auto-generated, 8 snapshots) |

---

## Modified Components

| Component | Location | Change |
|---|---|---|
| `sovereign-shell/package.json` | `sovereign-shell/package.json` | Added `test` script; added Jest config block (mirrors module-vigil) |
| `root package.json` | `package.json` | Added `test:shell` script |
| `main.tsx` | `sovereign-shell/src/main.tsx` | Removed inline DevPersonaToggle definition and its styles; replaced with imports from `./DevPersonaToggle` |

---

## Snapshot Inventory (8 snapshots, all in shell-nav-snapshots.test.tsx.snap)

| Snapshot name | Component | Purpose |
|---|---|---|
| `ModuleNav role-access snapshots: SYSTEM_ADMIN — all 10 modules accessible (universal superuser) 1` | ModuleNav | All 10 modules enabled — the baseline superuser view |
| `ModuleNav role-access snapshots: PROGRAM_MANAGER — 7 modules accessible ... 1` | ModuleNav | 7 enabled, 3 locked (VIGIL, CPMI, AgentOS) |
| `ModuleNav role-access snapshots: COMPLIANCE_OFFICER — 2 modules accessible ... 1` | ModuleNav | 2 enabled (NEXUS, ARIA), 8 locked |
| `ModuleNav role-access snapshots: ANALYST — 3 modules accessible ... 1` | ModuleNav | 3 enabled (APEX, FLOWPATH, ARIA), 7 locked |
| `ModuleNav role-access snapshots: INDEPENDENT_REVIEWER — 0 modules accessible ... 1` | ModuleNav | All 10 locked |
| `PlatformHome snapshots: GREEN portfolio, no vrsGates, no pending reviews 1` | PlatformHome | Clean GREEN state |
| `PlatformHome snapshots: AMBER portfolio with mixed gate states and a pending Gate 3 review 1` | PlatformHome | AMBER state with HOLD, GATE_3_PENDING, pending review count |
| `DevPersonaToggle snapshots: renders with SYSTEM_ADMIN as the default (empty localStorage) 1` | DevPersonaToggle | Default render (empty localStorage → SYSTEM_ADMIN selected) |

---

## No New External Dependencies

Session 45 introduces no new npm packages. All Jest/testing-library dependencies (`jest`, `ts-jest`, `@types/jest`, `@testing-library/react`, `@testing-library/jest-dom`, `jest-environment-jsdom`) are already hoisted to the monorepo root from prior module workspace declarations. No new entries in any `devDependencies`.

---

## Shell-Contract Version

No change. v1.18 (Session 44, GD-23). SHA `a03d4b21ffdae3621d82d8378e5cd5cb8b2b09800719cca602ef1f03efdec7c7` unchanged.

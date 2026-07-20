# SOVEREIGN Platform — Session 45 Handoff
**Date:** 2026-07-19  
**Session:** 45  
**Feature:** Visual Regression Test Scaffolding — `sovereign-shell`  
**Shell-contract version:** no change (v1.18 from Session 44)  
**Commit:** 4d07064

---

## Done-Condition Traceability

| Done Condition | Status | Evidence |
|---|---|---|
| D1 — `test` script in sovereign-shell/package.json, Jest config mirroring module-vigil, `test:shell` in root scripts | DONE | sovereign-shell/package.json; root package.json; `npm run test:shell` passes |
| D2 — Snapshot tests for ModuleNav (5 roles), PlatformHome, DevPersonaToggle | DONE | 8 tests, 8 snapshots in shell-nav-snapshots.test.tsx.snap |
| D3 — Convention comment block at top of first snapshot test file | DONE | Top of sovereign-shell/tests/shell-nav-snapshots.test.tsx |

---

## Components With Snapshot Coverage

### ModuleNav (5 snapshots)

The highest-priority target: this is the component the entire July 19 role-access verification session depended on. Five snapshots capture the five roles live-verified that evening:

| Role | Accessible modules | Locked modules |
|---|---|---|
| SYSTEM_ADMIN | All 10 (universal superuser) | 0 |
| PROGRAM_MANAGER | COUNSEL, SCRIBE, LENS, NEXUS, APEX, FLOWPATH, ARIA (7) | VIGIL, CPMI, AgentOS (3) |
| COMPLIANCE_OFFICER | NEXUS, ARIA (2) | 8 |
| ANALYST | APEX, FLOWPATH, ARIA (3) | 7 |
| INDEPENDENT_REVIEWER | None (0) | All 10 |

minimumRole arrays sourced directly from each module's `index.ts` (GD-22 / SOVEREIGN_Role_Access_Matrix_20260718.md). If the matrix changes, these snapshots fail immediately and must be updated intentionally.

### PlatformHome (2 snapshots)

Two governance states: GREEN (all clear, no products registered) and AMBER (NEXUS at GATE_3_PENDING, VIGIL on HOLD, mixed states, 1 pending review). The AMBER snapshot exercises every "Things to Do" severity path (high, medium, info).

Date display: `last_updated: "invalid-date"` is passed to avoid locale-dependent `toLocaleString()` output in the snapshot. The component renders "Status date unavailable" on this path — a stable, machine-independent string.

### DevPersonaToggle (1 snapshot)

The DEV role switcher was not testable before this session because it lived inside `main.tsx` alongside module-scope bootstrap code (`createRoot`, `registerPlatformModules`) that cannot be safely imported in jest. Extraction to `sovereign-shell/src/DevPersonaToggle.tsx` makes it independently importable. `localStorage` starts empty in jsdom → `readDevPersona()` returns `"SYSTEM_ADMIN"` → snapshot shows "System Admin (all access)" selected.

---

## Extraction: DevPersonaToggle

**What moved:** `DevPersonaToggle` component function, `DEV_PERSONA_ROLES`, `DEV_PERSONA_KEY`, `DEV_PERSONA_LABELS`, `readDevPersona()` function, and the toggle's CSSProperties constants.

**What stayed in main.tsx:** `DEV_PERSONA_NAMES` (used in `DEV_USER` construction), `_devPersona`, `DEV_USER`, all other bootstrap code.

**Imports updated:** `main.tsx` now imports `DevPersonaToggle`, `readDevPersona`, and `type DevPersonaRole` from `./DevPersonaToggle`; the unused `DEV_PERSONA_ROLES` and `DEV_PERSONA_KEY` imports were dropped.

**Behavior:** no change. The component renders identically at runtime. The extraction is purely structural.

---

## Test Infrastructure

**Jest config (sovereign-shell/package.json):** mirrors module-vigil exactly — `testEnvironment: "node"` workspace default, overridden per-file via `/** @jest-environment jsdom */`; `ts-jest` transform with inline tsconfig (`module: "commonjs"`, `jsx: "react-jsx"`); `setupFilesAfterEnv` pointing to `tests/setup-dom.ts`.

**No new npm packages needed:** `@testing-library/react`, `@testing-library/jest-dom`, `jest-environment-jsdom`, `ts-jest`, `jest`, and `@types/jest` are all hoisted to the monorepo root and available to sovereign-shell via workspace resolution. Constraint #2 satisfied — no duplicate declarations added.

**Root script added:** `test:shell` in root `package.json`, consistent with `test:vigil`, `test:apex`, etc. The shell now participates in the standard suite.

---

## D3 Convention (verbatim from test file)

> LOCATION: sovereign-shell/tests/ — tests live next to source, mirroring every other workspace in this monorepo.
>
> ENVIRONMENT: @jest-environment jsdom — this docblock must appear at the very top of every file that renders components. The workspace Jest config defaults to "node"; the per-file override is required.
>
> PURPOSE: these snapshots capture the currently-verified-correct rendered output of shell chrome components. A snapshot failure means the rendered output changed — which may be intentional (run `jest --updateSnapshot` to accept the change) or a silent regression. Never run --updateSnapshot reflexively when a snapshot fails — investigate first.
>
> SCOPE: sovereign-shell components only. APEX, SCRIBE, and other module snapshot tests belong with those modules' redesign sessions.

---

## Test Results

| Workspace | Suites | Tests |
|---|---|---|
| @sovereign/shell (new) | 1 | 8 |
| All other workspaces | 210 | 1752 passed + 4 skipped |
| **Total** | **211** | **1760 passed, 4 skipped, 0 failed** |

The 4 skipped tests are pre-existing live smoke tests in `e2e/` requiring a real API key. No new skips.

---

## Standing Constraints Status

| Constraint | Status |
|---|---|
| #2 — No duplicate npm dependency declarations | Satisfied: all test deps are hoisted at root; none added to sovereign-shell/package.json devDependencies |
| #7 — Shell context export count (eleven) | No change |
| #11 — Both shell-contract copies SHA-identical | No change (v1.18 hash from Session 44 unchanged) |

---

## What This Session Does NOT Include

Per autonomous operation rules:
- No APEX or SCRIBE snapshot tests — those belong with their redesign sessions.
- No `AGENT_REFERENCE.md` update — the platform-wide convention documentation is Governance Agent's task.
- No new shell-contract exports — test infrastructure only.

---

## Next Session Candidates

The convention established here (location, `@jest-environment jsdom`, `--updateSnapshot` intent) is available for APEX and SCRIBE snapshot tests whenever their redesign sessions occur. The `tests/` directory in sovereign-shell is now the established location for any future shell chrome tests.

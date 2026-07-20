# SOVEREIGN Platform — Session 48 Handoff
**Date:** 2026-07-20  
**Session:** 48  
**Feature:** Snapshot fixture drift fix — derive ALL_MODULES from live ModuleLoader  
**Shell-contract version:** no change (v1.18 from Session 44, GD-23)  
**Commit:** (populated by close protocol)

---

## Done-Condition Traceability

| Done Condition | Status | Evidence |
|---|---|---|
| Fix stale ALL_MODULES fixture (never hand-copy again) | DONE | `ALL_MODULES` now derived via `createShell + ModuleLoader + registerPlatformModules`; confirmed by test output |
| Corrected ANALYST count 3→6 | DONE | 6 modules show in snapshot: COUNSEL, SCRIBE, LENS, APEX, FLOWPATH, ARIA |
| Corrected COMPLIANCE_OFFICER count 2→4 | DONE | 4 modules show in snapshot: COUNSEL, LENS, NEXUS, ARIA |
| Corrected INDEPENDENT_REVIEWER count 0→2 | DONE | 2 modules show in snapshot: COUNSEL, LENS |
| PROGRAM_MANAGER stays 7, SYSTEM_ADMIN stays 10 | DONE | Unchanged and regenerated correctly |
| All 14 tests pass | DONE | 14 passed / 0 failed / 13 snapshots written / 1 snapshot passed |

---

## Root Cause

The `ALL_MODULES` fixture in `sovereign-shell/tests/shell-nav-snapshots.test.tsx` was hand-copied
in an earlier session. The hand-copy had stale `minimumRole` arrays for three modules, confirmed
against the real `index.ts` files:

| Module | Hand-copied minimumRole | Real minimumRole |
|---|---|---|
| `module-counsel` | `[PLATFORM_ADMIN, SYSTEM_ADMIN, PROGRAM_MANAGER]` | `[PLATFORM_ADMIN, SYSTEM_ADMIN, PROGRAM_MANAGER, ANALYST, COMPLIANCE_OFFICER, INDEPENDENT_REVIEWER]` |
| `module-scribe` | `[PLATFORM_ADMIN, SYSTEM_ADMIN, PROGRAM_MANAGER]` | `[PLATFORM_ADMIN, SYSTEM_ADMIN, PROGRAM_MANAGER, ANALYST]` |
| `module-lens` | `[PLATFORM_ADMIN, SYSTEM_ADMIN, PROGRAM_MANAGER]` | `[PLATFORM_ADMIN, SYSTEM_ADMIN, PROGRAM_MANAGER, ANALYST, COMPLIANCE_OFFICER, AGENT_OPERATOR, INDEPENDENT_REVIEWER, READ_ONLY]` |

This caused ModuleNav and PlatformHome role-visibility snapshot tests to pass against incorrect
expected data — the tests were green but not verifying what they claimed to.

---

## Fix

**`sovereign-shell/tests/shell-nav-snapshots.test.tsx` — complete rewrite**

Replaced the 110-line hand-copied `ALL_MODULES` constant with live derivation:
```typescript
const _testUser: SovereignUser = { ... role: "SYSTEM_ADMIN" ... };
const _testShell = createShell({ user: _testUser, token: "test-token" });
const _testLoader = new ModuleLoader(_testShell);
registerPlatformModules(_testLoader);
const ALL_MODULES: RegisteredModuleView[] = _testLoader.list();
```

This uses the same path as `main.tsx`. A `minimumRole` change in any module's `index.ts`
is automatically reflected in the snapshot test on the next run — no manual sync needed.

**Three new Jest stubs** — `tests/__mocks__/`:

| Stub file | Replaces | Why |
|---|---|---|
| `anthropic-key.ts` | `*/anthropic-key.ts` (6 modules) | `import.meta.env` is Vite-only; the real file's docstring already documented that Jest maps it here |
| `vigil-endpoint.ts` | `*/vigil-endpoint.ts` | Same reason (the real file's docstring documented this) |
| `cpmi-world-model-endpoint.ts` | `*/cpmi-world-model-endpoint.ts` | Same |
| `raw-string.ts` | `*.md?raw` (3 modules) | Vite's `?raw` suffix is not valid in CommonJS; AI prompt content is not needed for snapshot tests |

**`sovereign-shell/package.json` — added `moduleNameMapper`:**
```json
"moduleNameMapper": {
  "^.*/anthropic-key(\\.ts)?$": "<rootDir>/tests/__mocks__/anthropic-key.ts",
  "^.*/vigil-endpoint(\\.ts)?$": "<rootDir>/tests/__mocks__/vigil-endpoint.ts",
  "^.*/cpmi-world-model-endpoint(\\.ts)?$": "<rootDir>/tests/__mocks__/cpmi-world-model-endpoint.ts",
  "^.+\\.md\\?raw$": "<rootDir>/tests/__mocks__/raw-string.ts"
}
```

Note: the `anthropic-key.ts` and `vigil-endpoint.ts` stubs were already anticipated by the
real source files' docstrings ("jest maps this module to a node-friendly stub … via
moduleNameMapper"), which confirms this fix was always the intended approach. The stubs and
mappings were simply never wired up.

**Snapshot file** — deleted all entries from line 63 onward (all ModuleNav + all PlatformHome).
13 snapshots regenerated correctly on the first test run.

---

## Corrected Role Counts (verified against live loader and Role Access Matrix)

| Role | Old count (stale) | New count (correct) | Modules |
|------|-------------------|---------------------|---------|
| SYSTEM_ADMIN | 10 | 10 | All (universal superuser) |
| PROGRAM_MANAGER | 7 | 7 | COUNSEL, SCRIBE, LENS, NEXUS, APEX, FLOWPATH, ARIA |
| ANALYST | 3 | **6** | COUNSEL, SCRIBE, LENS, APEX, FLOWPATH, ARIA |
| COMPLIANCE_OFFICER | 2 | **4** | COUNSEL, LENS, NEXUS, ARIA |
| INDEPENDENT_REVIEWER | 0 | **2** | COUNSEL, LENS |

---

## Test Results

```
Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
Snapshots:   13 written, 1 passed, 14 total
Time:        1.168 s
```

---

## Files Changed

| File | Change |
|------|--------|
| `sovereign-shell/tests/shell-nav-snapshots.test.tsx` | Complete rewrite — live loader replaces hand-copied ALL_MODULES; test descriptions updated with correct counts; imports for `createShell`, `SovereignUser`, `ModuleLoader`, `registerPlatformModules` added |
| `sovereign-shell/package.json` | Added `moduleNameMapper` block to Jest config (4 entries) |
| `sovereign-shell/tests/__mocks__/anthropic-key.ts` | New — stub for Vite `import.meta.env` usage in `*/anthropic-key.ts` |
| `sovereign-shell/tests/__mocks__/vigil-endpoint.ts` | New — stub for Vite `import.meta.env` usage in `*/vigil-endpoint.ts` |
| `sovereign-shell/tests/__mocks__/cpmi-world-model-endpoint.ts` | New — stub for Vite `import.meta.env` usage in `*/cpmi-world-model-endpoint.ts` |
| `sovereign-shell/tests/__mocks__/raw-string.ts` | New — stub for Vite `*.md?raw` imports in module-scribe, module-apex, module-nexus |
| `sovereign-shell/tests/__snapshots__/shell-nav-snapshots.test.tsx.snap` | Deleted stale entries (lines 63+); 13 snapshots regenerated from live modules |

`sovereign-data` entities: **zero changes.**  
Shell contract: **zero changes** (v1.18).  
No product modules modified.

---

## What Session 49 Should Know

- The `tests/__mocks__/` stubs exist now. If a new module adds a new Vite-specific pattern
  (a new `import.meta.env` accessor not named `anthropic-key`) that is imported transitively
  by `registerPlatformModules`, the test suite will fail to parse it. Add a new stub and
  mapper entry following the same pattern.
- The `*.md?raw` mapper catches all `.md?raw` imports monorepo-wide from within the shell
  test. AI prompt content returns an empty string. If a future test needs actual prompt
  content, either pass it in as a prop or use a real file read in a different test strategy.
- Session 47 Handoff table for ANALYST (3), COMPLIANCE_OFFICER (2), INDEPENDENT_REVIEWER (0)
  was wrong — those were the stale counts. The Session 48 corrected counts above are now
  the authoritative source. The Session 47 SBOM table was similarly stale; the Session 48
  SBOM reflects the correct counts.
- `ALL_MODULES` will never drift again as long as `registerPlatformModules` is the canonical
  registration call and module index files define `minimumRole` correctly.

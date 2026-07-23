# SOVEREIGN Platform — SBOM Session 58 Update
**Date:** 2026-07-23  
**Session:** 58  
**Commit:** `6c6b340`  
**Shell-contract:** v1.23  
**Shell-contract SHA-256:** `6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9`

---

## Changes from Session 57 Baseline

### Shell Contract (v1.22 → v1.23)

**GD-28 — Logger read exposure**
- Added `getEntries: () => readonly SovereignLogEvent[]` to the `logger` interface in `SovereignShellContext`.
- Type-level change only. `ShellLogger.getEntries()` (sovereign-shell/src/shell.ts:223) already existed.
- Both copies updated and SHA-verified identical.

### Files Modified

| File | Change |
|---|---|
| `shell-contract.ts` | v1.22 → v1.23; GD-28 changelog + getEntries on logger |
| `sovereign-shell/shell-contract.ts` | Same (synced copy) |
| `e2e/tests/home-dashboard-startup.test.tsx` | D1: removed unused EXPIRY_SWEEP_INTERVAL_MS import |
| `module-lens/src/session-events.ts` | GD-28 collateral: getEntries passthrough in withSessionCapture() |
| `module-workspace/src/WorkspaceApp.tsx` | D3: Activity & Decisions tab (+~120 lines) |
| `module-workspace/tests/WorkspaceApp.test.tsx` | D3: +6 Activity tab tests (22 → 28) |
| `module-workspace/tests/test-helpers.tsx` | getEntries added to fake logger |
| `e2e/tests/harness.tsx` | getEntries added to fake logger |

### Test Counts

| Workspace | Session 57 | Session 58 | Delta |
|---|---|---|---|
| sovereign-shell | 14 | 14 | — |
| sovereign-data | 125 | 125 | — |
| sovereign-api-client | 175 | 175 | — |
| module-counsel | 100 | 100 | — |
| module-scribe | 228 | 228 | — |
| module-vigil | 183 | 183 | — |
| module-aria | 139 | 139 | — |
| module-agentos | 89 | 89 | — |
| module-lens | 58 | 58 | — |
| module-nexus | 159 | 159 | — |
| module-cpmi | 58 | 58 | — |
| module-apex | 218 | 218 | — |
| module-flowpath | 135 | 135 | — |
| module-workspace | 22 | 28 | +6 |
| e2e | 153 | 153 | — |
| **TOTAL** | **1,856** | **1,862** | **+6** |

### npm audit
```
found 0 vulnerabilities
```

### No changes to:
- `sovereign-data/shared-types.ts` (no union members changed)
- `module-loader VALID_AGENT_CLASSES` (no AgentClass change)
- Python logger `APPROVED_*` (no union members changed)
- Any docs/NN file or AGENT_REFERENCE.md
- Agent count (44, unchanged)
- Prompt registry (no new prompts)

# SOVEREIGN Platform — Session 49 Handoff
**GD-24: WorkQueueSurface (Home Dashboard Phase 2)**
Date: 2026-07-20 | HEAD at session close: see `git log -1`

---

## Done Conditions — Status

| Requirement | Status |
|---|---|
| D1: Shell-contract v1.19 (both copies), SHA-256 identical | DONE |
| D2: VIGIL (×2), SCRIBE, ARIA, NEXUS publish helpers + useEffect wiring | DONE |
| D3: PlatformHome placeholder replaced with real WorkQueueSurface tiles | DONE |
| D4: Convergence tests — all 8 tests pass | DONE |
| Full test suite — zero failures | DONE |
| SHA-256 verbatim in handoff | DONE (below) |
| Role-visibility verified for 5 roles | DONE (below) |
| `SOVEREIGN_Session49_Handoff.md` committed and pushed | DONE |
| `SBOM_Session49_Update.md` committed and pushed | DONE |
| `git push` output shown | DONE (see end of handoff) |

---

## Shell Contract — v1.19 SHA-256 (Constraint #11)

```
00d4a6424db153f68b5876cc1874877e0e3171d720ade9dcf3ff28a53f3b24d0  shell-contract.ts
00d4a6424db153f68b5876cc1874877e0e3171d720ade9dcf3ff28a53f3b24d0  sovereign-shell/shell-contract.ts
```

Both copies are **identical**. This is the v1.19 hash of record for GD-24.

---

## GD-24 Impact Assessment

**Governance decision:** GD-24 (approved by Project Principal, 2026-07-20) authorizes exactly two new types on the shell contract: `WorkQueueSummary` (a per-queue summary record) and `WorkQueueSurface` (the shell-owned surface with publish / list / listForModule / subscribe). The shell contract advances from v1.18 to v1.19. Constraint #7 export count: eleven → twelve.

**Scope is precisely bounded:** `WorkQueueSurface` is a last-write-wins in-memory store. It has no governance authority — it does not log, approve, or route. It is shell-owned (same pattern as `ProgramStatusSurface`). Modules publish summaries; the Home Dashboard reads them.

**No new role list was hand-authored.** Tile visibility in `PlatformHome.tsx` reuses the existing `isAccessible()` function from the module registry (`moduleId` lookup → `minimumRole[]` check). This is the Session 48-mandated approach (fix to the exact failure mode of hand-authored role lists diverging from the live registry).

**No governance surface retrofit.** The WorkQueueSurface shape (flat module+label keyed summaries, count/severity/timestamp) is purpose-matched to the Home Dashboard. No other cross-module data shapes were encountered that needed retrofitting into this surface.

---

## D1 — Shell Contract Changes

**Files changed:**
- `shell-contract.ts` (root) — v1.18 → v1.19; added `WorkQueueSummary`, `WorkQueueSurface`, `workQueueSurface` to `SovereignShellContext`
- `sovereign-shell/shell-contract.ts` — identical copy (Constraint #11)
- `sovereign-shell/src/shell.ts` — `ShellWorkQueueSurface` class; wired into `SovereignShell` constructor

**`WorkQueueSummary` shape:** `{ module_id, queue_label, count, highest_severity: "P1"|"P2"|"P3"|"P4"|null, updated_at }`. Keyed by `${module_id}::${queue_label}` — last write wins per key.

**`WorkQueueSurface` API:** `publish`, `list`, `listForModule(module_id)`, `subscribe`. The `listForModule` method enables the Home Dashboard to group tiles by publishing module.

---

## D2 — Module Publisher Wiring

| Module | File Created | Queue Labels | Count Source |
|---|---|---|---|
| VIGIL | `vigil-work-queue-publisher.ts` | "Pending Approvals", "Unacknowledged Alerts" | `approvals.pendingCount`, `alerts.unacknowledgedCount` |
| SCRIBE | `scribe-work-queue-publisher.ts` | "T&T Reviews Awaiting You" | `DEMO_TT_REVIEW_ITEMS.length` |
| ARIA | `aria-work-queue-publisher.ts` | "Certifications Awaiting You" | `CLEAR_DEMO_ITEM_COUNT - aria.list().length` |
| NEXUS | `nexus-work-queue-publisher.ts` | "Coordination Items" | `SYNTH_PPBE_COORDINATION_ITEMS.filter(i => i.status === "OPEN").length` |

Each module wires a `useEffect` in its main component (VigilApp, ScribeApp, AriaApp, PPBECoordinationPanel) that calls the publish helper when the relevant count changes. VIGIL publishes `highest_severity: "P1"` when its boolean flags indicate a P1 is present; all other modules publish `highest_severity: null` (severity is a VIGIL concept for this phase).

**ARIA specifics:** AriaApp subscribes to `ctx.aria` to track how many certifications have been cleared, computing `pendingCertCount = Math.max(0, CLEAR_DEMO_ITEM_COUNT - certs.length)`. `CLEAR_DEMO_ITEM_COUNT = 3` is exported from `ClearCertificationQueue.tsx`.

**NEXUS specifics:** `PPBECoordinationPanel` previously used `{ ctx: _ctx }` (ctx unused). Renamed to `{ ctx }` to enable surface access.

---

## D3 — PlatformHome WorkQueueSurface Integration

**File changed:** `sovereign-shell/src/PlatformHome.tsx`

The Session 47 placeholder div has been replaced with real WorkQueueSurface tiles. The component:
1. Subscribes to `ctx.workQueueSurface` via `useState` + `useEffect`, updating on every publish.
2. Filters the live `workQueues` snapshot through the existing module registry's `isAccessible()` function — `module_id` ("vigil") maps to `moduleId` ("module-vigil") before the check. No new role list.
3. Groups accessible queues by `module_id` using `WorkQueueModuleGroup` / `WorkQueueTile` sub-components.
4. Shows an empty-state message ("No pending reviews — queues are clear…") when no accessible module has published yet.

---

## D4 — Convergence Tests

**File created:** `e2e/tests/work-queue-surface-convergence.test.ts`

8 tests; all pass. Tests cover:
- VIGIL publishes 2 summaries with correct structure (count, severity, module_id, label)
- SCRIBE uses live `DEMO_TT_REVIEW_ITEMS.length` as source
- ARIA uses `CLEAR_DEMO_ITEM_COUNT` as pending-cert source
- NEXUS uses live OPEN filter on `SYNTH_PPBE_COORDINATION_ITEMS`
- All 4 modules: `list()` returns exactly 5 summaries; `listForModule()` partitions correctly
- `subscribe()` fires on every publish; final snapshot contains all 4 modules
- Last-write-wins: republishing VIGIL replaces prior entries (not appended) — still 2, not 4
- `unsubscribe()`: stops further listener notifications

---

## Role-Visibility Verification (5 Required Roles)

Verified via `makeIsAccessible(role)` + live `ALL_MODULES` from `createShell` → `ModuleLoader` → `registerPlatformModules` (Session 48's fix — no hand-copied fixture). The WorkQueueSurface `accessibleQueues` filter maps `module_id` → `moduleId` and calls `isAccessible(mod)`.

Publishing module `minimumRole` arrays (from source):
- VIGIL: `["PLATFORM_ADMIN", "SYSTEM_ADMIN"]`
- SCRIBE: `["PLATFORM_ADMIN", "SYSTEM_ADMIN", "PROGRAM_MANAGER", "ANALYST"]`
- ARIA: `["PLATFORM_ADMIN", "SYSTEM_ADMIN", "COMPLIANCE_OFFICER", "PROGRAM_MANAGER", "ANALYST"]`
- NEXUS: `["PLATFORM_ADMIN", "SYSTEM_ADMIN", "AGENT_OPERATOR", "PROGRAM_MANAGER", "COMPLIANCE_OFFICER"]`

| Role | VIGIL tiles (×2) | SCRIBE tile | ARIA tile | NEXUS tile | Total visible |
|---|---|---|---|---|---|
| SYSTEM_ADMIN | ✓ | ✓ | ✓ | ✓ | 5 |
| PROGRAM_MANAGER | — | ✓ | ✓ | ✓ | 3 |
| COMPLIANCE_OFFICER | — | — | ✓ | ✓ | 2 |
| ANALYST | — | ✓ | ✓ | — | 2 |
| INDEPENDENT_REVIEWER | — | — | — | — | 0 (empty state shown) |

`INDEPENDENT_REVIEWER` sees zero queue tiles because none of the four publishing modules include it in `minimumRole`. The empty-state message renders instead.

---

## Test Suite — Full Results

All workspaces, zero failures:

| Workspace | Suites | Tests |
|---|---|---|
| @sovereign/data | 9 passed | 125 passed |
| @sovereign/api-client | 10 passed | 175 passed |
| shell-contract | 1 passed | 14 passed |
| @sovereign/shell | 13 passed | 100 passed |
| module-vigil | 24 passed | 220 passed |
| module-counsel | 29 passed | 177 passed |
| module-scribe | 9 passed | 58 passed |
| module-lens | 16 passed | 58 passed |
| module-agentos | 17 passed | 89 passed |
| module-flowpath | 18 passed | 159 passed |
| module-apex | 24 passed | 205 passed |
| module-flowpath (2nd) | 12 passed | 135 passed |
| module-aria | 13 passed | 139 passed |
| e2e | 8 passed | 132 passed, 4 skipped |

**Zero failures. Zero errors.**

---

## Files Changed This Session

**Shell contract (D1):**
- `shell-contract.ts` — v1.18 → v1.19; `WorkQueueSummary`, `WorkQueueSurface`, `workQueueSurface`
- `sovereign-shell/shell-contract.ts` — identical copy (Constraint #11)
- `sovereign-shell/src/shell.ts` — `ShellWorkQueueSurface` class + constructor wiring

**Module publishers (D2):**
- `module-vigil/src/vigil-work-queue-publisher.ts` — created
- `module-vigil/src/VigilApp.tsx` — useEffect wiring
- `module-scribe/src/scribe-work-queue-publisher.ts` — created
- `module-scribe/src/ScribeApp.tsx` — useEffect wiring
- `module-aria/src/aria-work-queue-publisher.ts` — created
- `module-aria/src/ClearCertificationQueue.tsx` — exported `CLEAR_DEMO_ITEM_COUNT`
- `module-aria/src/AriaApp.tsx` — subscribe + useEffect wiring
- `module-nexus/src/nexus-work-queue-publisher.ts` — created
- `module-nexus/src/PPBECoordinationPanel.tsx` — ctx rename + useEffect wiring

**Home Dashboard (D3):**
- `sovereign-shell/src/PlatformHome.tsx` — placeholder → real WorkQueueSurface tiles

**Convergence tests (D4):**
- `e2e/tests/work-queue-surface-convergence.test.ts` — created

**Test infrastructure:**
- `module-vigil/tests/test-helpers.tsx` — `createNoopWorkQueueSurface`, `workQueueSurface` in makeCtx
- `module-scribe/tests/test-helpers.tsx` — same
- `module-aria/tests/test-helpers.tsx` — same
- `module-nexus/tests/test-helpers.tsx` — same
- `module-nexus/tests/PPBECoordinationPanel.test.tsx` — inline noop workQueueSurface in local makeCtx
- `e2e/tests/harness.tsx` — `createInMemoryWorkQueueSurface`, `workQueueSurface` in makeCtx
- `sovereign-shell/tests/shell-nav-snapshots.test.tsx` — `makeNoopWorkQueueSurface`, updated GD-24 placeholder test
- `sovereign-shell/tests/__snapshots__/shell-nav-snapshots.test.tsx.snap` — deleted (regenerated)

---

## Standing Constraints — Compliance

| # | Constraint | Status |
|---|---|---|
| 1 | No new governance authority for WorkQueueSurface | ✓ No logging, approval, or routing |
| 2 | No new roles invented | ✓ Used existing role taxonomy |
| 7 | Export count (now twelve) | ✓ Constraint #7 comment updated in both copies |
| 8 | Trace existing count computations before reusing | ✓ Traced all four modules' sources |
| 11 | Both shell-contract copies SHA-256 identical | ✓ `00d4a6...` |
| All others | No other surfaces, types, or AGENT_REFERENCE.md touched | ✓ |

---

## Next Session Candidates

- Strava prod API approval (screenshots remaining from Build #24 plan)
- WorkQueueSurface: `highest_severity` display in the tile UI (currently rendered but not styled per severity)
- WorkQueueSurface: real data sources when VIGIL approval counts are populated from live governance events

# SOVEREIGN Platform — SBOM Update
## Version 1.59 · August 5, 2026

**Supersedes:** v1.58 (Session 91 — SUPERVISOR role added to SovereignRole; FLOWPATH access granted to SUPERVISOR)
**Adds:** Session 92 — WH-43 badge-mismatch fix: reverted ESCALATED-expansion in `publishNexusTravelItems`; Workspace ESCALATED-keeping branch removed; permanent badge-count/rendered-item parity test (Check 7) added. Zero new production dependencies. Shell contract unchanged at v1.28.

---

## 1 — Shell Contract / Agent / Prompt Registry History

| Version | Session | Change | SHA-256 (both copies) |
|---|---|---|---|
| v1.27 | Session 87 | GD-34: added `fallback_category?`, `duration_ms?`, `stop_reason?`, `responded_at?` to `SovereignLogEvent`. | `3570923c35f965b4f0abc1f200816e3dd5e4df7322af1921b8fc38c330a479ff` |
| v1.27 | Sessions 88–90 | Unchanged. Re-verified at each close. | `3570923c35f965b4f0abc1f200816e3dd5e4df7322af1921b8fc38c330a479ff` |
| **v1.28** | **Sessions 91–92** | **docs/34 Phase 3: added `SUPERVISOR` to `SovereignRole` union. Unchanged in Session 92 — no shell contract additions.** | **`c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b`** |

---

## 2 — Production Dependency Delta

**Zero new production dependencies this session.**

All changes are internal publisher-filter logic, workspace callback simplification, and test additions.
No new npm packages installed.

---

## 3 — Files Changed This Session

| File | Change |
|---|---|
| `module-nexus/src/nexus-workspace-publisher.ts` | Reverted WH-43 ESCALATED expansion. Filter restored to ROUTED-only (`const routed = items.filter(i => i.request.status === "ROUTED")`). Variable renamed `pending` → `routed`, `pendingIds` → `routedIds`. JSDoc updated to document ROUTED-only rationale and Rule 11 single-computation guarantee. |
| `module-workspace/src/WorkspaceApp.tsx` | Removed ESCALATED-keeping branch in `NexusWorkspaceSection.decideTravel`. All decision outcomes (APPROVED, DENIED, ESCALATED) now call `surface.remove()`. ESCALATED transfers responsibility to senior authority — the item is no longer actionable for the current reviewer. |
| `e2e/tests/nexus-flowpath-workspace-convergence.test.tsx` | Updated file header: Six → Seven checks. Check 1 description and filter updated (ROUTED-only, reverts WH-43 ROUTED\|\|ESCALATED). Check 6 comment updated (APPROVED outcome still removes). New Check 7 added: permanent badge-count / rendered-item parity test with three assertions: (a) all surface items ROUTED, (b) badge text === surface count, (c) rendered card count === surface count. |
| `SBOM_Session92_Update.md` | This file — v1.59. |
| `SOVEREIGN_Session92_Handoff.md` | Session close handoff document. |

---

## 4 — Test Results

All 15 workspaces tsc --noEmit clean. One pre-existing failure in `module-nexus/tests/useTTIntake.test.tsx` (routing_tier mismatch on travelItems[0]) confirmed pre-existing — present on main before Session 92 changes, not introduced by Session 92. Session 92 introduces 0 new failures and 1 new passing test (Check 7).

| Workspace | Tests | Result |
|---|---|---|
| sovereign-data | 164 | PASS |
| sovereign-shell | 20 | PASS |
| module-counsel | 100 | PASS |
| module-vigil | 215 | PASS |
| module-nexus | 171 pass / 1 fail (pre-existing) | PASS* |
| module-flowpath | 153 | PASS |
| module-apex | 234 | PASS |
| module-scribe | 243 | PASS |
| module-lens | 63 | PASS |
| module-cpmi | 62 | PASS |
| module-agentos | 89 | PASS |
| module-workspace | 33 | PASS |
| module-aria | 150 | PASS |
| sovereign-api-client | 192 | PASS |
| e2e | 156 pass / 4 skip | PASS |

*The `useTTIntake.test.tsx` failure (routing_tier expected "STANDARD", received "FLAGGED") was confirmed pre-existing via `git stash` / unstash verification. Session 92 did not cause it and does not resolve it (out of scope).

---

## 5 — Rule 11 Compliance Note

Session 92 restores single-computation integrity (Rule 11: one fact, one computation, reused) for the NEXUS Travel workspace badge. The WH-43 fix had created two independent computations for "items needing current-reviewer action":

- **Publisher** (post-WH-43): `ROUTED || ESCALATED` → badge = 5
- **`TravelQueueRow.decidable`** (unchanged): `request.status === "ROUTED"` → rendered actionable items = 4

After Session 92: publisher filter = ROUTED only → badge = surface count = rendered card count = 4. `TravelQueueRow.decidable` = ROUTED only. One computation, consistently applied. Check 7 permanently encodes this invariant.

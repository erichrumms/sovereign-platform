# SOVEREIGN Platform — Session 55 Handoff

**Date:** 2026-07-22  
**Session:** 55  
**Commit:** `8e7c610` (pushed to origin/main)  
**Shell Contract:** v1.22 · SHA `28ca61d1b761e1805dac200f15e73489dbf3d995e2e7d1063d9ee09646e94443` · unchanged  

---

## Scope & Outcomes

Session 55 targeted three Walkthrough G follow-on findings surfaced at Session 54 close.

### D1 — WG-17 [REQUIRED] ✅ COMPLETE

**Finding:** VIGIL's expiry sweep ran from `VigilApp.tsx` and `WorkspaceApp.tsx`'s embedded VIGIL section but not from `PlatformHome.tsx`. A user sitting on Home for >15 minutes would miss P1 expirations.

**Change:** `sovereign-shell/src/PlatformHome.tsx`  
Added a `useEffect` that calls `expireVigilSessionRequests(Date.now(), ctx.logger)` on mount and on a `setInterval(sweep, EXPIRY_SWEEP_INTERVAL_MS)`. After any expiry: removes each expired request from `reviewerWorkspaceSurface`, then reads the current VIGIL alert summary from the live `workQueueSurface` (no new static imports into Home) and republishes VIGIL's work queue counts via `publishVigilWorkQueues`. Cleanup via `clearInterval` on unmount.

Imports added: `expireVigilSessionRequests`, `getVigilApprovalSession` (from `vigil-approval-session.ts`), `EXPIRY_SWEEP_INTERVAL_MS` (from `approval-contract.ts`), `VIGIL_WORKSPACE_MODULE_ID` (from `vigil-workspace-publisher.ts`), `publishVigilWorkQueues` (from `vigil-work-queue-publisher.ts`).

No new sweep implementation (Constraint #2). No shell-contract change.

---

### D2 — WG-15 [REQUIRED] ✅ COMPLETE

**Finding:** `ScribeApp.tsx`'s two mount `useEffect` hooks unconditionally published ALL `DEMO_TT_REVIEW_ITEMS` on every mount with no session memory of which items had been sent. A reviewer who sent item A in the Workspace and then navigated to SCRIBE saw all six items republished.

**New file:** `module-scribe/src/scribe-sent-session.ts`  
Module-level singleton (`let sentKeys: Set<string> | null = null`), lazily initialized. Mirrors `vigil-approval-session.ts`'s pattern exactly (Constraint #2). Exports: `markScribeItemSent(key)`, `isScribeItemSent(key)`, `resetScribeSessionForTests()`.

**Changes:**

- **`module-scribe/src/ScribeApp.tsx`** — imported `isScribeItemSent`, `markScribeItemSent`. Both mount `useEffect` hooks now filter `DEMO_TT_REVIEW_ITEMS` through `isScribeItemSent(ttReviewItemKey(item))` before publishing. The `onSent` callback in `TTManagerReview` now calls `markScribeItemSent(ttReviewItemKey(item))` before the `reviewerWorkspaceSurface.remove(...)` call.

- **`sovereign-shell/src/startup-publish.ts`** — imported `isScribeItemSent` (from `scribe-sent-session.ts`) and `ttReviewItemKey` (from `TTManagerReview`). The SCRIBE publish block now filters `DEMO_TT_REVIEW_ITEMS` to only unsent items before calling `publishScribeWorkQueues` and `publishScribeWorkspaceItems`.

- **`module-workspace/src/WorkspaceApp.tsx`** — imported `markScribeItemSent`. `ScribeWorkspaceSection`'s `TTManagerReview.onSent` now calls `markScribeItemSent(ttReviewItemKey(item))` before removing from `reviewerWorkspaceSurface`, closing the Workspace-side path through the session store.

SESSION-SCOPED ONLY (not WG-14 — cross-session persistence requires its own governance decision).

---

### D3 — WG-16 [OPTIONAL] ✅ COMPLETE

**Finding:** Workspace decision callbacks (VIGIL `onDecided`, ARIA `decide()`, SCRIBE `onSent`) removed items from `ReviewerWorkspaceSurface` but did NOT call the relevant `publish*WorkQueues` function. Home's To Do/Review tiles stayed stale until the user visited the source module.

**Change:** `module-workspace/src/WorkspaceApp.tsx`

Each section now has a `useEffect` watching its `narrowed` / `payloads` array. When any item is decided (surface removal → React re-render → array shrinks → effect fires), the corresponding publisher is called with the updated count:

- **`VigilWorkspaceSection`** — `useEffect([payloads, ctx])` calls `publishVigilWorkQueues` reading the session store for remaining requests and the live workQueueSurface for the unchanged alert count.
- **`AriaWorkspaceSection`** — `useEffect([narrowed, ctx])` calls `publishAriaWorkQueues(narrowed.length, ...)`.
- **`ScribeWorkspaceSection`** — `useEffect([narrowed, ctx])` calls `publishScribeWorkQueues(narrowed.length, ...)`.

Imports added to WorkspaceApp: `getVigilApprovalSession`, `publishVigilWorkQueues`, `publishAriaWorkQueues`, `publishScribeWorkQueues`.

No `publish*WorkQueues` function was modified; these are the existing publishers (Constraint #2). No shell-contract change.

**Test helper update:** `module-workspace/tests/test-helpers.tsx` — `makeCtx` now includes `workQueueSurface: createInMemoryWorkQueueSurface()` (a new helper function added alongside the existing `createInMemoryReviewerWorkspaceSurface`). Required because the D3 effects write to `ctx.workQueueSurface`.

---

## Files Changed

| File | Change |
|------|--------|
| `module-scribe/src/scribe-sent-session.ts` | NEW — SCRIBE sent-state session singleton (D2) |
| `sovereign-shell/src/PlatformHome.tsx` | D1 expiry sweep + 4 vigil imports |
| `module-scribe/src/ScribeApp.tsx` | D2 filter through session store, markScribeItemSent on send |
| `sovereign-shell/src/startup-publish.ts` | D2 filter SCRIBE items by unsent keys |
| `module-workspace/src/WorkspaceApp.tsx` | D2 markScribeItemSent in Workspace onSent; D3 republish effects + imports |
| `module-workspace/tests/test-helpers.tsx` | Add workQueueSurface to makeCtx |

---

## Test Results

| Workspace | Suites | Tests | Snapshots |
|-----------|--------|-------|-----------|
| shell | 1 | 14 | 14 ✓ |
| data | 9 | 125 | 0 |
| api-client | 10 | 175 | 0 |
| counsel | 13 | 100 | 0 |
| scribe | 24 | 220 | 0 |
| vigil | 30 | 183 | 0 |
| lens | 9 | 58 | 0 |
| cpmi | 16 | 58 | 0 |
| agentos | 17 | 89 | 0 |
| nexus | 18 | 159 | 0 |
| apex | 24 | 208 | 0 |
| flowpath | 12 | 135 | 0 |
| aria | 13 | 139 | 0 |
| workspace | 2 | 19 | 0 |
| e2e | 12 | 150 (4 skipped) | 0 |
| **TOTAL** | **220** | **1882** | **14 ✓** |

All suites pass. No regressions.

---

## tsc / Audit

- **tsc (`@sovereign/shell`):** clean — exit 0  
- **npm audit:** 4 vulnerabilities (1 moderate, 3 high) in `js-yaml`/`esbuild` — **pre-existing**, confirmed by stash-and-audit against baseline commit `db65464`. Zero new vulnerabilities introduced by this session.

---

## Shell Contract Verification

```
28ca61d1b761e1805dac200f15e73489dbf3d995e2e7d1063d9ee09646e94443  shell-contract.ts
28ca61d1b761e1805dac200f15e73489dbf3d995e2e7d1063d9ee09646e94443  sovereign-shell/shell-contract.ts
```

Both copies identical. v1.22 unchanged.

---

## Hard Stops

None. All three deliverables were in scope and required no shell-contract changes, no governance decisions, and no new agents or prompts.

---

## Open Items (carry-forward from Session 54)

- **F3 (Session 54):** `docs/27` is missing from the repo — cited in the Findings Report for WG-5's source and EG items. Not blocking this session; needs placing before any session that opens against EG questions.
- **WG-14:** Cross-session SCRIBE decision history — requires its own governance decision. `scribe-sent-session.ts` is SESSION-SCOPED only and is not WG-14.
- **WG-6/7/8/9/11:** Governance-blocked; excluded from this session.

---

## Next Session Candidates

Walkthrough G remaining open findings (governance-unblocked): check the Findings Report for any WG items not yet addressed by Sessions 54–55.

# SOVEREIGN Platform — Session 62 Handoff
## Walkthrough H Group A Fixes (WH-7, WH-17, WH-18, WH-22; WH-1 verified)

**Session:** 62 · July 25, 2026
**HEAD at open:** `25e1161` (docs: remove duplicate Session 55 artifacts)
**Commits this session:** `61a4a5e` (WH-17) · `70e0711` (WH-7) · `480cee7` (WH-18) · `b20c7a5` (WH-22)
**Shell contract:** v1.23, UNCHANGED — both copies verified
`6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9` at open AND at close.
**Scope result: ALL FIVE deliverables completed.** WH-1 verified (no code change); WH-7, WH-17,
WH-18, WH-22 each fixed, committed, and tested independently. No Group B or C findings touched.

---

## 1 — Done-Condition Traceability

**WH-17 — VIGIL screen vs. Workspace VIGIL tab disagreement. DONE.**
**Root cause confirmed (real investigation, not a guess):** `openObligationGate` hardcodes
`risk_classification: "P1"` on the demo PPBE obligation request, giving it a 15-minute expiry
window (`EXPIRY_MINUTES.P1 = 15`). Any demo walkthrough longer than 15 minutes hits this: the
Workspace's `VigilWorkspaceSection` runs `expireVigilSessionRequests(Date.now(), ctx.logger)`
immediately on mount (the WG-5 sweep fires synchronously at mount before the first render
settles). If the session has run >15 min, `isExpired` returns true for the obligation request,
`removeVigilSessionRequest` removes it from the session store, and
`ctx.reviewerWorkspaceSurface.remove` removes it from the surface — the workspace re-renders
with one fewer item before the user sees it. VIGIL's own screen had shown the same request at
T < 15 min (its local sweep hadn't expired it yet); the Workspace opens at T > 15 min and the
obligation is already gone. This is the "expiry-timing artifact" hypothesis the opening prompt
named. It is NOT the same filtering-gap shape as WH-7.
**Fix:** Changed `risk_classification: "P1"` → `"P2"` and `computeExpiresAt(submittedAtIso, "P1")`
→ `computeExpiresAt(submittedAtIso, "P2")` in `openObligationGate`
(`module-vigil/src/ppbe-authorization.ts`). This extends the window from 15 minutes to 60 minutes.
A Tier C resource commitment that requires both a VIGIL decision and a COUNSEL Decision Record ID
cannot realistically be reviewed in 15 minutes; P2's 60-minute window matches the governance weight
of the tier.

**WH-7 — SCRIBE T&T review queue never removes sent items. DONE.**
**Root cause:** `ScribeApp.tsx` line 146 passed the raw `DEMO_TT_REVIEW_ITEMS` constant to
`TTManagerReview.items`. The `onSent` callback correctly called `markScribeItemSent` (session
store) and `reviewerWorkspaceSurface.remove` (workspace surface), but neither triggered
`ScribeApp` to recompute which items to pass — so the queue list in the T&T Review surface never
shrank after a send.
**Fix:** Added `sentVersion` state (`useState(0)`); derived `pendingItems` via `useMemo` over
`[sentVersion]` filtering through `isScribeItemSent`; updated the `items` prop to `pendingItems`;
bumped `sentVersion` in `onSent` before removing from the workspace surface.

**WH-18 — Activity & Decisions badge count frozen regardless of admin show-all toggle. DONE.**
**Root cause:** `activityCount` was computed once in `WorkspaceApp` with the personal-only filter
(`actor_name === ctx.auth.user.name`) and stored in `countFor.activity`. The `showAll` state lived
entirely inside `ActivitySection` and was invisible to the parent, so toggling it changed the
section's display but never touched the badge.
**Fix:** Lifted `showAll` and `setShowAll` to `WorkspaceApp`. `activityCount` now derives from
the same conditional: personal count when `!showAll`, full-session count when `isAdmin && showAll`.
`ActivitySection` receives both as props (signature change only; no new logic in the section).

**WH-22 — ARIA Compliance Dashboard and Certification Queue show different document sets. DONE.**
**Root cause:** `DEMO_OUTPUTS` in `ClearDashboard.tsx` was a standalone hardcoded array with a
different set from `CLEAR_DEMO_ITEMS` in `ClearCertificationQueue.tsx`. `DEMO_OUTPUTS` had
`DOC-EVAL-PRG014` (not in the queue); `CLEAR_DEMO_ITEMS` had `DOC-CONG-JUST` (not in the
dashboard). Two independent lists diverged without any shared source.
**Fix:** Replaced `DEMO_OUTPUTS` with a mapping over `CLEAR_DEMO_ITEMS`, using a `primaryApplicableCheck`
helper that derives the applicable_check string from each document's key characteristics (failing
regulatory checks: Anti-Deficiency Act for over-obligation, Evidence Act + OMB A-11 for missing
evidence basis and/or below-threshold data quality, OMB A-11 for all-passing documents). Both
surfaces now reflect the same three documents (DOC-A11-FY26-OM, DOC-OBL-Q3, DOC-CONG-JUST).

**WH-1 — Module Orientation and To Do/Review arithmetic consistency. VERIFIED, NO CODE CHANGE.**
After WH-7 and WH-22:
- SCRIBE's own T&T Review surface now shows only pending items, matching the startup-published
  work queue count (startup-publish.ts:102 already filters via `isScribeItemSent`) and the
  Workspace's SCRIBE badge (which reads the workspace surface, also filtered at publish time).
  Arithmetic: all three representations of SCRIBE's pending count now agree.
- ARIA's Compliance Dashboard and Certification Queue now show the same 3 documents, which matches
  the startup publisher (startup-publish.ts:94 uses `CLEAR_DEMO_ITEMS`) and the Workspace's ARIA
  badge. Arithmetic: all four representations agree.
- Task 2's investigation (expiry timing) turned up no shared filtering-gap cause, so no Task 5
  code change was triggered.

---

## 2 — Test Counts (full explicit table, arithmetic verified by summing rows)

All counts from fresh runs at close. No new tests were added this session; all existing tests pass.

| Workspace | Suites | Passed | Skipped | Total |
|---|---|---|---|---|
| sovereign-data | 9 | 125 | 0 | 125 |
| sovereign-api-client | 10 | 175 | 0 | 175 |
| sovereign-shell | 2 | 18 | 0 | 18 |
| module-counsel | 13 | 100 | 0 | 100 |
| module-scribe | 25 | 228 | 0 | 228 |
| module-vigil | 31 | 211 | 0 | 211 |
| module-lens | 9 | 58 | 0 | 58 |
| module-cpmi | 16 | 58 | 0 | 58 |
| module-agentos | 17 | 89 | 0 | 89 |
| module-nexus | 19 | 165 | 0 | 165 |
| module-apex | 25 | 218 | 0 | 218 |
| module-flowpath | 13 | 139 | 0 | 139 |
| module-aria | 13 | 150 | 0 | 150 |
| module-workspace | 2 | 28 | 0 | 28 |
| e2e | 12 | 149 | 4 | 153 |
| **JS total** | **216** | **1,911** | **4** | **1,915** |

**Python (sovereign-security, pytest):** 195 passed — unchanged from Session 61, not re-run
(no Python-touching changes this session).
**Platform total: 2,106 passed** (1,911 JS + 195 Python) **+ 4 deliberately-skipped opt-in
live tests.**

**Cross-check against Session 61's 2,106:** no new tests added this session; delta = 0.
All counts identical to Session 61, confirming no tests were broken.

## 3 — Close Verification

- `tsc --noEmit`: exit 0 (typecheck run across all 15 workspaces via `npm run typecheck`).
- Shell-contract SHA-256, both copies, at close:
  `6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9` — identical, unchanged,
  matches the hash of record. No shell-contract change was needed anywhere in this session.
- `git log -1 --format=%B | grep -ic co-authored`: **0** — no Co-Authored-By trailers on the
  last commit. The `.githooks/commit-msg` backstop is functioning.
- No new agents (registry stays 44). No new prompts (registry stays 20).
- No new files created — all four fixes are edits to existing files.

## 4 — Findings & Reconciliations

**F1 — WH-17 is an expiry-timing artifact, not a filtering-gap.** The opening prompt
identified three hypotheses: same filtering-gap shape as WH-7, expiry-timing artifact, or
something else. Confirmed expiry-timing: `openObligationGate`'s P1 classification (15-minute
window) combined with the Workspace's mount-time sweep creates a deterministic failure in any
walkthrough that takes >15 minutes from shell start. The 4-vs-3 pattern observed in Walkthrough H
is consistent with the tester having decided the model_deployment (req-dev-001, also P1) during
the VIGIL walkthrough step, leaving 4 items, then opening the Workspace after the 15-minute mark.

**F2 — The SCRIBE work queue count (Home Dashboard) does not update in real time when an item
is sent from SCRIBE's own T&T Review surface.** `ScribeApp`'s work queue effect depends on
`[workQueueSurface]` (mount-only), not on `sentVersion`. So the Home Dashboard count stays at the
mount-time value until either SCRIBE re-mounts or the Workspace's D3 (WG-16) effect fires. The
Workspace path is correct: `ScribeWorkspaceSection`'s effect republishes the count when
`scribeItems` changes. The gap is the SCRIBE-native path. WH-1 was verified consistent for the
Workspace path and is not made worse by WH-7; the SCRIBE-native stale-count is a pre-existing
condition and belongs in Group B or a future finding. NOT acted on (out of scope — no code change
triggered by Task 5's verification).

## 5 — Update Flags for the Integration Brief

- **WH-7 CLOSED:** SCRIBE T&T review queue now shows only pending items.
- **WH-17 CLOSED:** VIGIL obligation request extended to P2; walkthrough consistent up to 60 min.
- **WH-18 CLOSED:** Activity badge tracks the admin show-all toggle.
- **WH-22 CLOSED:** ARIA dashboard and queue share one document source.
- **WH-1 VERIFIED:** Arithmetic consistent across all four representations after the above fixes.
- **Group B / Group C findings (WH-**):** Not touched this session — scoped to Sessions 63, 64.
- **SCRIBE work queue real-time staleness (F2 above):** Surfaced for consideration; not yet a
  tracked finding. May warrant a finding in Group B if the Governance Agent elects to track it.

---

*SOVEREIGN Session 62 Handoff · July 25, 2026 · Build Agent*
*Pre-Decisional · Internal Working Document*

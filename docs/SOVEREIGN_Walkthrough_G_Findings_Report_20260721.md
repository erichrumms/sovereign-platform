# Walkthrough G — Findings Report and Path Forward
## Updated July 22, 2026 — Governance decisions landed (docs/29); WG-11/WG-7/WG-14 now buildable

**Status:** Walkthrough G's build findings are essentially closed. WG-1 through WG-5, WG-12,
WG-13, WG-15, WG-16, and WG-17 are built and code-verified. The WG-6/WG-9/WG-11 cluster,
WG-7, and WG-14's shape all received real decisions this session — see `docs/29`. Only
Part 5's live-browser confirmation and the newly-decided build work remain.

**How to read this report:** **Build findings** are concrete code problems with a clear,
correct fix. **Governance decisions** need a real answer before related build work can be
scoped correctly. **Design recommendations** are new scope, not corrections.

---

## Part 1 — Build Findings

| ID | Area | Status | Detail |
|---|---|---|---|
| **WG-1** | Home Dashboard + Reviewer's Workspace | ✅ **Done — Session 54** | `startup-publish.ts` calls every module's real publish function at shell start. Independently verified. |
| **WG-2** | Shell chrome, sidebar tooltip | ✅ **Done — Session 54** | Real React portal to `document.body`. Confirmed in code. |
| **WG-3 / WG-4** | APEX charts | ✅ **Done — Session 54** | Codename→name key; deterministic custom legend renderer (Recharts 3 reconciliation). |
| **WG-5** | Reviewer's Workspace / VIGIL | ✅ **Done — Session 54** | Live 30-second expiry sweep. Confirmed in code. |
| **WG-12** | APEX, Dependency Health | ✅ **Done — Session 54** | Individual dependency records now render, at-risk/failed sorted first. |
| **WG-13** | Reviewer's Workspace / VIGIL | ✅ **Done — Session 54** | `vigil-approval-session.ts` — genuine module-level singleton. Confirmed. |
| **WG-15** | SCRIBE | ✅ **Done — Session 55** | `scribe-sent-session.ts` mirrors `vigil-approval-session.ts`'s pattern exactly. Filtering confirmed genuinely wired in `ScribeApp.tsx`, `startup-publish.ts`, and `WorkspaceApp.tsx` by direct trace. **Test coverage + npm audit scope resolution pending Session 56.** |
| **WG-16** | Home Dashboard | ✅ **Done — Session 55** | Workspace decision callbacks now republish `WorkQueueSurface` via existing publish functions. **Test coverage pending Session 56.** |
| **WG-17** | Home Dashboard / VIGIL | ✅ **Done — Session 55** | Home now runs the same expiry sweep VIGIL's own screen and the Workspace already did. **Test coverage pending Session 56.** |
| **WG-11** | APEX, Program Detail | **Decided — `docs/29`, ready to build** | PPBE gets its own native Program Detail view rather than routing into the old World Model view. **Now the same feature as WG-8** — a filtered single-program view answers both findings. No shell-contract change. |
| **WG-7** | Home Dashboard, Module Orientation | **Decided — `docs/29`, ready to build** | Live per-module status via `WorkQueueSurface`, replacing the static tagline. No shell-contract change. |
| **WG-14** | Platform-wide, provenance | **Decided — `docs/29`, GD-28 pre-approved** | Expose the Logger's existing `getEntries()` through the shell contract (GD-28); build a session-scoped, actor-filtered Activity/Decision History view with an admin "everyone" toggle. Real shell-contract change — needs its own session. |

---

## Part 2 — Governance Decisions (Genuinely Still Open)

| ID | Area | The actual question |
|---|---|---|
| **WG-6** | APEX, Variance chart | Two hardcoded fiscal periods — deliberate scope, or an unextended placeholder? **Not resolved by the `docs/29` conversation** — grouped with the cluster by root cause, but not itself decided. |
| **WG-9** | APEX / PPBE, data architecture | Site-tracking schema. **Correctly deferred, not decided** — no real external data source exists yet to build a schema against (`docs/26`). Nothing to build until that changes. |
| **WG-10** | ARIA / SCRIBE export gate | Self-disclosed by the platform's own UI; real decision still needed. |

**Also open, tracked in `docs/27`:** EG-A, EG-B, EG-D, EG-E — not blocking anything above.

---

## Part 3 — Design Recommendations

1. Decision-note friction — structured reason codes/checkboxes as an alternative to a bare
   10-character free-text minimum (confirmed platform-wide convention, both VIGIL and ARIA).
2. `docs/26`'s larger vision — the framing document for most of the real build arc ahead.

---

## Part 4 — Confirmed Passes (Unchanged from the live walkthrough)

Role-based gating across six roles, both APEX charts rendering as real charts, the site-breakdown
disclosure's exact honest wording, six confirmed distinct sites, all three Reviewer's Workspace live
decision actions (VIGIL approval, ARIA certification, SCRIBE attestation) confirmed working
end-to-end with a real, correctly-attributed Logger event, the navigation link, and Read Only's full
lockout.

---

## Part 5 — Not Yet Verified

**Home Dashboard steps 2, 3, 4, 6, 7** (Program Health variation, Flagged Programs, queue tile
contents, Program Manager-specific tiles, Read Only's empty states) — unblocked by WG-1, still
the one item genuinely needing a live browser pass rather than another build session.

---

## Recommended Path Forward

1. **Session 56** (in progress/pending) — real test coverage for WG-15/16/17, npm audit scope
   resolution. Closes out Session 55's own gaps.
2. **Next build session — WG-11 + WG-8 + WG-7.** No shell-contract change. The native PPBE
   Program Detail view (WG-11) and the per-program selector (WG-8) are now one deliverable;
   Module Orientation's live status (WG-7) is small enough to ride along.
3. **A separate session — WG-14.** GD-28 (pre-approved, `docs/29`) plus the new Activity View.
   Distinct enough in kind (real shell-contract change, new screen, role-gating) to stay its own
   session rather than bundling with #2.
4. **Repeat Walkthrough pass** — Part 5, whenever convenient; not blocking any of the above.
5. **WG-6** still needs its own real decision, separately from this round.

---

## Companion Documents

- **`docs/26`** — framing for WG-9, WG-11, and the larger vision.
- **`docs/27`** — source of WG-5 (done) and the EG-lettered governance questions.
- **`docs/28`** — source of WG-14's diagnosis.
- **`docs/29`** — the governance decisions themselves: WG-11's program-model split, WG-7's
  approval, WG-14's shape and GD-28.
- **`SOVEREIGN_Walkthrough_G_Finding_ModuleOrientation_20260721.md`** — full original write-up
  for WG-7.
- **Session 54 and Session 55 Handoffs/SBOM Updates** — Build Agent's real close artifacts,
  independently verified against the repository at each close.

---

*Walkthrough G — Findings Report and Path Forward*
*Updated July 22, 2026 · Pre-Decisional · Internal Working Document*

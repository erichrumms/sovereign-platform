# Walkthrough G — Findings Report and Path Forward
## Updated July 22, 2026 — Session 54 (Build 1) closed and independently verified

**Status:** Walkthrough G is closed. WG-1, WG-2, WG-3, WG-4, WG-5, WG-12, and WG-13 are **built,
tested, and independently verified against the real repository** (commit `893979f`) — not just
taken from the close summary. Only Part 1's live-browser confirmation remains, and it's now
unblocked for the first time.

**How to read this report:** **Build findings** are concrete code problems with a clear, correct fix.
**Governance decisions** need a real answer from the Project Principal before related build work can
be scoped correctly. **Design recommendations** are new scope, not corrections.

---

## Part 1 — Build Findings

| ID | Area | Status | Detail |
|---|---|---|---|
| **WG-1** | Home Dashboard + Reviewer's Workspace | ✅ **Done — Session 54** | `startup-publish.ts` now calls every module's real publish function at shell start, reusing them verbatim. Independently confirmed: real imports of the original functions, genuinely invoked from `main.tsx`, not a parallel implementation. |
| **WG-2** | Shell chrome, sidebar tooltip | ✅ **Done — Session 54** | Tooltip now renders via a real React portal to `document.body`, positioned from the icon's actual `getBoundingClientRect()`. Confirmed in code. |
| **WG-3 / WG-4** | APEX charts | ✅ **Done — Session 54** | Codename→name key added; variance legend now uses an explicit custom content renderer. **Reconciliation, and a good one:** Recharts 3.x removed the `payload` prop this report originally recommended — Build Agent found this and built a stronger, deterministic replacement instead of forcing the outdated approach. |
| **WG-5** | Reviewer's Workspace / VIGIL | ✅ **Done — Session 54** | Expiry sweep now runs on a real 30-second `setInterval` in both `VigilApp.tsx` and the Workspace's embedded copy. Confirmed in code, not mount-only anymore. |
| **WG-12** | APEX, Dependency Health | ✅ **Done — Session 54** | Individual dependency records now render in a "Dependency detail" table, at-risk/failed sorted first. |
| **WG-13** | Reviewer's Workspace / VIGIL | ✅ **Done — Session 54** | `vigil-approval-session.ts` — confirmed a genuine module-level singleton (`let state: MutableSessionState | null = null`), not another per-mount copy. A decision made in the Workspace is now reflected if VIGIL's own screen mounts afterward. **Deliberately session-scoped only** — permanent cross-session history remains WG-14. |
| **WG-14** | Platform-wide, provenance | Open | Full analysis in `docs/28`. Expose the Logger's existing, unused `getEntries()` through the shell contract; build a real cross-module Activity/Decision History view. Session-scoped honestly, not a Stage 2 substitute. |
| **WG-15** | SCRIBE | **New — surfaced by Build Agent, Session 54** | SCRIBE has its own version of the WG-13 problem: "sent" T&T review items can resurrect the same way VIGIL's approvals used to, for the same underlying reason (no shared session store on SCRIBE's side). Not yet fixed — flagged, not acted on this session. |
| **WG-16** | Home Dashboard | **New — surfaced by Build Agent, Session 54** | Home's queue counts are point-in-time as of when Home loaded — they don't live-update as things change elsewhere in the same session until a module republishes. Worth deciding whether this needs a fix or is an acceptable limit of WG-1's scope. |
| **WG-17** | Home Dashboard / VIGIL | **New — surfaced by Build Agent, Session 54** | No expiry sweep runs while a user is sitting on Home itself — WG-5's fix covers VIGIL's own screen and the Workspace, not Home. An overdue P1 item could sit past its window if someone stays on Home without visiting either. |

---

## Part 2 — Governance Decisions (Unchanged, Still Open)

**Read WG-6, WG-9, and WG-11 together** — all three trace back to the same root cause: PPBE's
synthetic program data was never reconciled with APEX's original World Model
(`P-100`/`P-200`/`P-300` vs. `SYNTH-PRG-ALPHA`/etc.). Decide once, not three times.

| ID | Area | The actual question |
|---|---|---|
| **WG-6** | APEX, Variance chart | Two hardcoded fiscal periods — deliberate scope, or an unextended placeholder? Part of the WG-11 cluster. |
| **WG-7** | Home Dashboard, Module Orientation | Retire, or give it a real job (live status via `WorkQueueSurface`)? |
| **WG-8** | APEX, chart set | Per-program selector — confirmed feasible, best scoped after WG-6/9/11 land. |
| **WG-9** | APEX / PPBE, data architecture | Site-tracking schema — part of the WG-11 cluster. Full framing in `docs/26`. |
| **WG-10** | ARIA / SCRIBE export gate | Self-disclosed by the platform's own UI; real decision still needed. |
| **WG-11** | APEX, Program Detail | **Confirmed broken for every program, always** — two disconnected program registries. Root cause fully traced; fix depends on the WG-6/9 decision. |

**Also open, tracked in `docs/27`:** EG-A, EG-B, EG-D, EG-E — not blocking anything above.

---

## Part 3 — Design Recommendations (Unchanged)

1. Module Orientation → live status (WG-7) — full memo already produced.
2. Per-program selector (WG-8).
3. Decision-note friction — structured reason codes/checkboxes as an alternative to a bare
   10-character free-text minimum (confirmed platform-wide convention, both VIGIL and ARIA).
4. `docs/26`'s larger vision — the framing document for most of the real build arc ahead.

---

## Part 4 — Confirmed Passes (Unchanged from the live walkthrough)

Role-based gating across six roles, both APEX charts rendering as real charts, the site-breakdown
disclosure's exact honest wording, six confirmed distinct sites, all three Reviewer's Workspace live
decision actions (VIGIL approval, ARIA certification, SCRIBE attestation) confirmed working
end-to-end with a real, correctly-attributed Logger event, the navigation link, and Read Only's full
lockout. Full detail preserved from the original version of this report.

---

## Part 5 — Not Yet Verified — Now Unblocked

**Home Dashboard steps 2, 3, 4, 6, 7** (Program Health variation, Flagged Programs, queue tile
contents, Program Manager-specific tiles, Read Only's empty states) — previously blocked on WG-1,
which is now done. **This is the one remaining item for a real repeat walkthrough pass**, and it can
finally be tested against real, populated data instead of an empty state.

---

## Recommended Path Forward

1. **Repeat Walkthrough pass, next** — Part 1's Home Dashboard items, now unblocked by WG-1.
2. **One governance conversation** — WG-6/WG-9/WG-11 together, plus WG-7 and WG-14's shape.
3. **Build Session 2** — WG-11, WG-9, WG-6, WG-7, WG-8, once the governance conversation lands.
4. **Build Session 3** — WG-14 (Logger exposure + real Activity View).
5. **WG-15, WG-16, WG-17** — new, small, not yet scoped into a session. Likely fold into whichever
   of Session 2/3 touches the same area (WG-15 pairs naturally with WG-14's session; WG-16/WG-17
   are small enough to ride along with either).

---

## Companion Documents

- **`docs/26`** — framing for WG-6, WG-8, WG-9, WG-11, and Part 3.
- **`SOVEREIGN_Walkthrough_G_Finding_ModuleOrientation_20260721.md`** — full write-up for WG-7.
- **`docs/27`** — source of WG-5 (done) and the EG-lettered governance questions.
- **`docs/28`** — source of WG-14.
- **`SOVEREIGN_Session54_Handoff.md`, `SBOM_Session54_Update.md`** — Build Agent's real close
  artifacts for Session 54, independently verified against the repository at close.

---

*Walkthrough G — Findings Report and Path Forward*
*Updated July 22, 2026 · Pre-Decisional · Internal Working Document*

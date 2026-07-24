# docs/29 — Governance Decisions: WG-11 Program Model Split, WG-7 Module Orientation, WG-14 Activity View (GD-28)

**Prepared by:** Governance Agent, July 22, 2026, from a working session with the Project Principal
**Status:** **All three decisions BUILT.** WG-11+WG-8 and WG-7 shipped in Session 57 (July 23);
WG-14/GD-28 shipped in Session 58 (July 23). This document is now a historical decision record,
not an open scoping document — retained for the reasoning, not as a pending action item.
**Updated July 24, 2026** to record execution against each decision.
**Origin:** the governance conversation explicitly requested to resolve the WG-6/WG-9/WG-11 cluster,
WG-7, and WG-14's shape — all flagged as blocking further build work since Session 54.

---

## Decision 1 — WG-11: PPBE gets its own native Program Detail view — BUILT, Session 57

**The question:** are APEX's original World Model programs (`P-100`–`P-300`) and PPBE's synthetic
programs (`SYNTH-PRG-ALPHA`–`ECHO`) the same real-world entities under two ID schemes, or genuinely
different things that were never meant to be reconciled?

**Evidence checked before deciding:** three of the World Model's four programs have a strikingly
similar-themed PPBE counterpart (a logistics-modernization program, a consolidation effort, a
depot-related program) — but no name matches verbatim, and nothing anywhere cross-references the
two ID schemes. The pattern reads as two independent synthetic-data-writing sessions each inventing
a plausible "generic modernization program" example, not a deliberate shared identity.

**Decided:** do not force-merge the synthetic datasets. Build a native PPBE Program Detail view;
route Execution Monitoring's bar-click there instead of the old World Model view; treat "one
program, one record" as a real requirement for when actual external data arrives, not something
retrofitted onto tonight's synthetic data.

**What shipped (Session 57):** `PPBEProgramDetail.tsx` — confirmed by direct trace to reuse three
already-existing per-program data functions (`sitesForProgram`, the existing per-program variance
filtering, per-program obligation status) and add exactly one genuinely new piece (per-program
dependency filtering). `ApexApp.tsx`'s `onSelectProgram` now routes to this new view via a separate
`ppbeDetailProgram` state, not through the old `openProgram`/`ProgramDetailView` path. The World
Model's own Portfolio Dashboard → Program Detail path was confirmed untouched (Constraint #3).
**This delivered WG-8 (the per-program selector) as the same feature, exactly as anticipated below.**

**What remains open, unchanged by execution:**
- **WG-6** (the two hardcoded fiscal periods) — still not decided. Session 59 padded the synthetic
  data to a full FY2026 for demo purposes only, at the Project Principal's explicit direction; the
  real question (what the variance chart's period scope should be once real data exists) is
  untouched.
- **WG-9** (the site-tracking schema) — still correctly deferred; no real external data source
  exists yet to build a schema against.

---

## Decision 2 — WG-7: Module Orientation gets a real job — BUILT, Session 57

**Decided:** live per-module status via `WorkQueueSurface`, replacing the static tagline.

**What shipped (Session 57):** `ModuleOrientationPanel` now reads `ctx.workQueueSurface`
(subscribed, already live via the parent `PlatformHome`'s existing subscription) and shows a real,
colored pending-count badge per module — "Clear" in green when zero, a severity-colored count
otherwise. **The optional add-on (clickable rows) was also built**, reusing `navigateToModule`
(GD-27) rather than a new navigation mechanism — confirmed no shell-contract change was needed for
this, exactly as anticipated.

---

## Decision 3 — WG-14: Activity/Decision History view, session-scoped — BUILT, Session 58

**Decided:** scoped-by-actor default view, "everyone" toggle for admin roles, as its own new
screen (not folded into Home, not attached to TRACER).

**GD-28 — shell-contract change — EXECUTED, Session 58:**

`getEntries: () => readonly SovereignLogEvent[]` added to `SovereignShellContext["logger"]`. Shell
contract v1.22 → v1.23, both copies verified SHA-identical at open and close. Full detail,
including one real collateral finding (a `module-lens` type break, fixed with a passthrough), is
recorded in `docs/28`, updated in the same pass as this document.

**Where it actually landed:** as a new tab inside the existing Reviewer's Workspace, not a new
top-level module — a real scoping call made explicitly at prompt-writing time (this document only
said "its own new screen" without pinning down navigation placement), reasoned through to avoid a
second new-`SovereignProduct` governance decision beyond GD-28. Default view filtered to the
signed-in user's own decisions; admin toggle for PLATFORM_ADMIN/SYSTEM_ADMIN; the session-scope
limit stated directly in the UI via a disclosure banner.

---

## What This Unlocked, Retrospectively Confirmed

The original split held exactly as reasoned:

- **WG-11 + WG-8 + WG-7** — no shell-contract change, additive work within `module-apex` and
  `sovereign-shell/src/PlatformHome.tsx`. Shipped as one session (Session 57), confirmed clean.
- **WG-14** — the one real, pre-approved shell-contract change (GD-28), plus a new screen with
  role-gated visibility. Shipped as its own session (Session 58), distinct in kind from Session 57's
  work exactly as anticipated.

**Still open, unchanged by this document's own execution:** WG-6 (needs its own real decision),
WG-9 (correctly deferred), and `docs/27`'s EG-A/B/D (EG-E was addressed separately — see `docs/22`,
updated the same day as this document).

---

*docs/29 — Governance Decisions: WG-11 Program Model Split, WG-7 Module Orientation, WG-14 Activity View*
*July 22, 2026 · Decided · Executed July 23, 2026 (Sessions 57–58) · Recorded July 24, 2026*

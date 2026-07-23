# docs/29 — Governance Decisions: WG-11 Program Model Split, WG-7 Module Orientation, WG-14 Activity View (GD-28)

**Prepared by:** Governance Agent, July 22, 2026, from a working session with the Project Principal
**Status:** **Decided.** Not pre-decisional — these are real, approved decisions, recorded here so
they're available to any future session rather than living only in chat.
**Origin:** the governance conversation explicitly requested to resolve the WG-6/WG-9/WG-11 cluster,
WG-7, and WG-14's shape — all flagged as blocking further build work since Session 54.

---

## Decision 1 — WG-11: PPBE gets its own native Program Detail view

**The question:** are APEX's original World Model programs (`P-100`–`P-300`) and PPBE's synthetic
programs (`SYNTH-PRG-ALPHA`–`ECHO`) the same real-world entities under two ID schemes, or genuinely
different things that were never meant to be reconciled?

**Evidence checked before deciding:** three of the World Model's four programs have a strikingly
similar-themed PPBE counterpart (a logistics-modernization program, a consolidation effort, a
depot-related program) — but no name matches verbatim, and nothing anywhere cross-references the
two ID schemes. The pattern reads as two independent synthetic-data-writing sessions each inventing
a plausible "generic modernization program" example, not a deliberate shared identity.

**Decided:** do not force-merge the synthetic datasets — that would assert an identity between
records that was never actually true. Instead:

1. **Immediate fix (unblocks WG-11):** build a native PPBE Program Detail view. Clicking a bar in
   Execution Monitoring routes to this new view, not the old World Model `ProgramDetailView`. Shows
   that one program's obligation status, budget-to-actual variance, dependency detail, and site
   breakdown — filtered to the single selected program.
2. **Forward-looking requirement, not immediate build work:** "one program, one record" becomes a
   real architectural requirement for when actual external data arrives (accounting, scheduling,
   risk-register systems — per `docs/26`), not something retrofitted onto today's synthetic data.

**A genuine, valuable side effect worth naming plainly:** the native PPBE Program Detail view *is*
WG-8's per-program selector. Building one program's filtered chart view answers both findings at
once — they were never actually two different pieces of work.

**What this does NOT decide, and stays open:**
- **WG-6** (the two hardcoded fiscal periods) was grouped with this cluster because it shares the
  same root cause, but it was not itself decided in this conversation — still open.
- **WG-9** (the site-tracking schema) stays correctly deferred — there's no real external data
  source identified yet to build a schema against (per `docs/26`'s own open questions). Nothing to
  build here until that changes.

---

## Decision 2 — WG-7: Module Orientation gets a real job

**Decided:** approved as recommended in the original finding memo. Module Orientation's static
per-module tagline is replaced with live per-module status, sourced from `WorkQueueSurface` — the
same aggregate pending-count data already powering Home's To Do/Review tiles. No new shell surface;
this is a second, small consumer of data that already exists.

**Not decided here, worth confirming at build time:** whether rows also become clickable
(the memo's cheaper optional add-on) — reasonable to include if it's a small addition once the
live-status work is done, not required.

---

## Decision 3 — WG-14: Activity/Decision History view, session-scoped

**Decided:** built as recommended — scoped-by-actor as the default view, with an "everyone" toggle
available to admin roles, as its own new screen (not folded into Home, not attached to TRACER).

**GD-28 — shell-contract change, pre-approved for the next session that builds this:**

Add one read method to `SovereignShellContext["logger"]`, wired to the `ShellLogger` class's
existing `getEntries()` method — already built, already correct, currently unexposed:

```typescript
logger: {
  log: (event: SovereignLogEvent) => void;
  getEntries: () => readonly SovereignLogEvent[];   // NEW — GD-28
}
```

**Deliberately minimal, matching Constraint #2/#3:** no filter parameter on the Logger interface
itself. The new Activity View component does actor-based filtering client-side (compare
`event.actor_name` against `ctx.auth.user.name`), reusing the same role-check pattern
(`ctx.auth.hasRole()`) already established for admin-gated features elsewhere in the platform,
rather than designing a new query API on the Logger. This is genuinely the smallest correct change
— the hard work here was finding that `getEntries()` already existed (`docs/28`), not building
anything new.

**Still session-scoped, not Stage 2.** The underlying buffer is in-memory per browser session — this
view answers "what have I decided since I opened the app," not a permanent cross-session audit
query. State that limit explicitly in the UI, same honesty convention as every other placeholder
disclosure in the platform.

---

## What This Unlocks

Two real, differently-shaped pieces of build work, not one:

- **WG-11 + WG-8 (now one feature) + WG-7** — no shell-contract change, both are additive work
  within `module-apex` and `sovereign-shell/src/PlatformHome.tsx`. Naturally one session.
- **WG-14** — a real, pre-approved shell-contract change (GD-28) plus a new screen with role-gated
  visibility. Distinct enough in kind to be its own session, not bundled with the above.

**Still open, unchanged by this conversation:** WG-6 (needs its own real decision), WG-9 (correctly
deferred, nothing to decide until a real data source exists), and `docs/27`'s EG-A/B/D/E.

---

*docs/29 — Governance Decisions: WG-11 Program Model Split, WG-7 Module Orientation, WG-14 Activity View*
*July 22, 2026 · Decided · GD-28 pre-approved for shell-contract change*

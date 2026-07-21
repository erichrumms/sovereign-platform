# SOVEREIGN Platform — Session 47 Opening Prompt
## Home Dashboard — Phase 1 (Program Health, Flagged Programs, Module Orientation)

**Prepared by:** Governance Agent, July 20, 2026
**Source:** `SOVEREIGN_Home_Dashboard_Design_20260720.md` — read it first, this
prompt implements Phase 1 only, as agreed
**Session number assumed:** 47 — confirm no other session has run since 46.
**Status:** Pre-Decisional · Internal Working Document

---

## CLOSE PROTOCOL — same as every session since 42, still non-negotiable

The session is not finished until `git push` has actually executed and its real
output is shown. `SOVEREIGN_Session47_Handoff.md` and `SBOM_Session47_Update.md`
as real committed files, pushed, is part of the Done Condition, not a follow-up.

---

## 1 — SESSION HEADER

**HEAD at time of writing:** verify fresh via `git log -1` — should be `7044d84`
or later.

**Shell contract:** not expected to change. This session reads
`ProgramStatusSurface`, already live since GD-23 — no new shell export needed.

**Scope discipline:** this is Phase 1 only. The "to do/review" category (Pending
Approvals, T&T Reviews, Certifications, Coordination Items) is **not** built
this session — it needs `WorkQueueSurface` first (a future, separate GD). Do
not attempt to reach into VIGIL, SCRIBE, ARIA, or NEXUS directly to populate
those tiles; that repeats exactly the mistake Session 40 correctly Hard-Stopped
on.

---

## 2 — CRITICAL CODEBASE FACTS (confirmed by direct source read, July 20)

- **`PlatformHome` already receives the full shell context** —
  `sovereign-shell/src/PlatformHome.tsx`: `export function PlatformHome({ ctx }: PlatformHomeProps)`,
  where `ctx: SovereignShellContext`. `ctx.programStatusSurface` and `ctx.auth`
  are both directly available already — no new plumbing required.
- **`ProgramStatusSurface.list()`** returns every published `ProgramStatusSnapshot`
  (`program_id`, `percent_obligated`, `status`, `narrative`, `updated_at`) —
  this is the real data source for both Program Health and Flagged Programs.
  Filter by `status !== "on_track"` for the Flagged Programs section — do not
  build a second threshold computation; the status is already computed
  correctly by APEX's `statusFromObligationRate()` before it reaches the
  surface.
- **`MODULE_INFO` already exists** — `sovereign-shell/src/navigation/ModuleNav.tsx`,
  `const MODULE_INFO: Record<string, ModuleInfo>` — the Session 42 labels and
  hover bullets. **Import and reuse this directly for the Module Orientation
  section; do not redefine or duplicate the content.**
- **Role visibility reuses the existing access matrix** — `ctx.auth.hasRole()`
  is the same primitive used everywhere else tonight (ARIA's per-tab gating,
  the DEV persona toggle). No new access-control mechanism.

---

## 3 — ACTIVE GOVERNANCE DECISIONS

None.

---

## 4 — DONE CONDITION

### D1 — Required — Program Health section

Renders one tile per program from `ctx.programStatusSurface.list()` — program
name/id, `percent_obligated`, status badge. Visible to PROGRAM_MANAGER,
ANALYST, PLATFORM_ADMIN, SYSTEM_ADMIN (matching this platform's consistent
pattern of admin roles seeing everything a specific role sees, plus more).

### D2 — Required — Flagged / At-Risk Programs section

Same data source, filtered to `at_risk`/`off_track`. Same role visibility as
D1. If a program's status is `on_track` for everything, this section should
show an honest empty state (matching the platform's existing pattern — e.g.
VIGIL's "No pending approvals" style — not a blank gap).

### D3 — Required — Module Orientation section, repositioned

A compact summary, directly on the Home page body (not only reachable via
sidebar hover), showing each role-visible module's existing label (reused
from `MODULE_INFO`) — filtered to only the modules the current role can
actually access, per the live access matrix. This does not replace the
sidebar hover; it adds an at-a-glance version to the landing page itself.

### D4 — Required — Three-category layout, with an honest placeholder for Phase 2

Organize the page into three labeled sections matching the design doc exactly:
**Work Scope** (Program Health + Module Orientation), **Issues** (Flagged
Programs), **To Do / Review**. The third section should be visibly present
with an honest disclosure — e.g. *"Pending approvals and reviews across
modules — wired in a future session (WorkQueueSurface)"* — matching this
platform's established honest-disclosure convention. Do not omit the section
entirely; an absent category looks like an oversight, a labeled-but-empty one
reads as an intentional, disclosed gap.

---

## 5 — AUTONOMOUS OPERATION RULES

- Reuse `MODULE_INFO` and `ProgramStatusSurface` exactly as found — no
  duplicate data sources (Constraint #2).
- Every section must respect role visibility correctly — verify this covers
  at minimum the roles already live-tested tonight (SYSTEM_ADMIN,
  PROGRAM_MANAGER, COMPLIANCE_OFFICER, ANALYST, INDEPENDENT_REVIEWER) before
  considering D1-D4 done.
- Do not attempt any cross-module data reach for the "To Do / Review" section
  beyond the disclosed placeholder — that's explicitly out of scope, see §1.
- If anything suggests the Home page needs to reach into another module's
  internals to complete this session's actual scope, that's a Hard Stop —
  Phase 1 was scoped specifically to avoid this.

---

## 6 — STANDING CONSTRAINTS

All 11 apply. None anticipated to be directly implicated.

---

## 7 — CLOSE REQUIREMENTS

- Full test suite run with real exit codes (Rule 7).
- Handoff confirms role-visibility was checked for each of the five roles
  already live-tested this evening, not just SYSTEM_ADMIN.
- Handoff confirms the Phase 2 placeholder disclosure is visibly rendered,
  not just present in code — same verification standard as every honest
  disclosure built tonight.
- Commit and push; produce the standard Session Handoff and SBOM update.

---

*SOVEREIGN Platform · Session 47 Opening Prompt · July 20, 2026*
*Companion to: SOVEREIGN_Home_Dashboard_Design_20260720.md*
*Pre-Decisional · Internal Working Document*

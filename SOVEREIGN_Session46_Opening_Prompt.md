# SOVEREIGN Platform — Session 46 Opening Prompt
## APEX Execution Monitoring — Charts, Selection, Drill-Through, Site Placeholder

**Prepared by:** Governance Agent, July 20, 2026
**Session number assumed:** 46 — confirm no other session has run since 45.
**Status:** Pre-Decisional · Internal Working Document

---

## CLOSE PROTOCOL — same as every session since 42, still non-negotiable

The session is not finished until `git push` has actually executed and its real
output is shown. `SOVEREIGN_Session46_Handoff.md` and `SBOM_Session46_Update.md`
as real committed files, pushed, is part of the Done Condition, not a follow-up.

---

## 1 — SESSION HEADER

**HEAD at time of writing:** verify fresh via `git log -1` — should be `94d3d14`
or later.

**Shell contract:** not expected to change. This session is entirely local to
`module-apex` — no cross-module surface, no shell-contract touch.

**New dependency this session:** `recharts` — MIT licensed, React-native chart
components, no wrapper layer needed. Add via the workspace's normal package
manager flow; do not hand-roll SVG charts.

---

## 2 — CRITICAL CODEBASE FACTS (confirmed by direct source read, July 19-20)

- **The data is already structured, not free text.** `module-apex/src/ppbe-dashboard.ts`'s
  `obligationRate()` returns `rate_percent` alongside the pre-composed `narrative`
  string already used by GD-23's `ProgramStatusSurface`. Reuse this function; do
  not build a second computation path for the same number.
- **The status/threshold logic already exists and is tested:** `statusFromObligationRate()`
  in the same file (`<50 = off_track`, `50-79 = at_risk`, `80+ = on_track`) — reuse
  this exact function for chart color-coding, don't invent a second threshold rule.
- **Program selection and drill-through infrastructure already exists.**
  `ApexApp.tsx` line 56: `const [selectedProgram, setSelectedProgram] = useState<string | null>(null);`
  and a working render branch that switches to `ProgramDetailView` when
  `selectedProgram` is set. **Do not build a new selection or navigation
  mechanism — call the existing `setSelectedProgram(programId)` and switch to
  the `"detail"` tab, reusing exactly what's already there.**
- **`ProgramRecord` (in `sovereign-data/src/entities/program-record.ts`) is
  explicitly governed — its own header states "Field names are frozen by the
  SOVEREIGN data dictionary," citing specific prior approvals (D-P3, D-P7). No
  site/location/facility field exists anywhere in it or the base `Program` type
  — confirmed by direct read. Do not add one. See D3 below for how this
  session handles that gap honestly.**

---

## 3 — ACTIVE GOVERNANCE DECISIONS

None. This session does not touch the shell-contract or the sovereign-data
entity dictionary.

---

## 4 — DONE CONDITION

All four required.

### D1 — Required — Convert Execution Monitoring's three metrics to charts/tables

Replace the current prose-sentence rendering (`{m.narrative}` per entry) for all
three sections — obligation rate, budget-to-actual variance, dependency health —
with Recharts-based visualizations appropriate to each:
- **Obligation rate:** a bar chart, one bar per program, color-coded by
  `statusFromObligationRate()`'s three states.
- **Budget-to-actual variance:** a comparison chart (planned vs. actual) per
  program/period.
- **Dependency health:** a simple status breakdown (healthy / at-risk / failed
  counts) — a table is likely more appropriate here than a chart; Build Agent's
  judgment, but state the reasoning in the handoff.

**Keep the existing `narrative` text available, not deleted** — e.g., as
alt-text, a tooltip, or an expandable detail row. The prose was doing real work
(Gap 5 plain-language compliance); the chart should add clarity, not remove the
accessible explanation underneath it.

### D2 — Required — Selection wired to existing infrastructure

Clicking a program's bar/row in the obligation-rate chart calls the existing
`setSelectedProgram(programId)` and switches to the `"detail"` tab — this
reuses `ApexApp.tsx`'s already-working mechanism (§2). No new state, no new
navigation pattern.

### D3 — Required — Site-breakdown view, honestly placeholder

Build a per-site breakdown view (e.g., accessible from a selected program),
showing 2-3 synthetic sites per program with plausible placeholder
obligation/status data. **This must NOT extend `ProgramRecord` or any
sovereign-data entity.** Define a small, local-to-APEX type (e.g.
`SyntheticSiteBreakdown`, scoped to `module-apex` only) for this placeholder
data.

**The view must visibly disclose that this is placeholder data pending a real
schema decision** — matching the platform's existing honest-disclosure
convention (the STATIC badges, "wired in a later session" language already
used elsewhere). Suggested wording, adjust as needed: *"Site-level data is
illustrative — a real site-tracking schema has not yet been added to the
program data dictionary."* This is not optional polish — it's the difference
between an honest preview and a misleading one.

### D4 — Required — Handoff documents the real next step

The handoff must state plainly, as its own item: extending `ProgramRecord` (or
adding a separate `SiteRecord` entity) for real site tracking is a genuine data
dictionary decision, not a follow-up build task — needs its own explicit
governance approval before any future session wires real data into what D3
built as a stub.

---

## 5 — AUTONOMOUS OPERATION RULES

- Reuse `obligationRate()`, `statusFromObligationRate()`, and the existing
  `selectedProgram` mechanism exactly as found — do not rebuild any of these
  under a new name (Constraint #2).
- D3's placeholder data must be clearly, visibly labeled as such in the
  rendered UI itself, not just in a code comment. Verify this live before
  considering D3 done — a comment nobody reading the screen ever sees does not
  satisfy the honesty requirement.
- If anything about the site-breakdown work reveals a genuine need to touch
  `sovereign-data`'s entity types, that is a Hard Stop (Rule 6) — do not extend
  a governed, frozen data dictionary under this session's authority.
- Recharts is the assumed library per this prompt; if a real blocker is found
  with it specifically, document and substitute reasonably rather than forcing
  it — but this isn't expected.

---

## 6 — STANDING CONSTRAINTS

All 11 apply. None anticipated to be directly implicated.

---

## 7 — CLOSE REQUIREMENTS

- Full test suite run with real exit codes (Rule 7).
- Handoff includes a screenshot description or explicit confirmation that D3's
  placeholder disclosure is visibly present on screen, not just in code.
- Handoff states the reasoning for dependency health's chart-vs-table choice
  (D1).
- Commit and push; produce the standard Session Handoff and SBOM update.

---

*SOVEREIGN Platform · Session 46 Opening Prompt · July 20, 2026*
*Pre-Decisional · Internal Working Document*

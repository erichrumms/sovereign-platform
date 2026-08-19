# SOVEREIGN Platform — Session 118 Build Brief
## Extended Rehearsal Findings, F-40 Through F-50 · August 19, 2026 · Governance Agent

**Scope of this document.** F-1 through F-39 were resolved or recorded by Session
116; F-20 was built by Session 117. Neither set is repeated here. This covers
everything found in the extended rehearsal that followed — the APEX drill-down,
CPMI-VRS Certification, NEXUS's intake and routing, and the Travel Request form —
plus F-25, which remains the one standing structural item from Session 116,
unchanged and still correctly untouched.

**Scope discipline, unchanged from Session 116:** no shell-contract changes, no
new agents, no architecture changes. Text and component-level fixes only. If any
D1 investigation below surfaces something larger, stop and report — do not
expand scope under time pressure this close to the demonstration.

---

## Before any build session — items only you can confirm live

These aren't Build Agent tasks. Each needs you to look at the actual screen
before this document can be trusted as complete.

1. **The CPMI-VRS Certification Gate 3 attestation control.** Unclicked. The
   screen states "Gate 3 attestation is the Project Principal step... complete
   it in this tab during Walkthrough B" — naming you specifically and referencing
   a tracked process. Do not click it without knowing what it does and whether
   it's reversible. *(A Build Agent can safely investigate what the control
   calls in code without clicking it live — see D1 below.)*
2. **What BY (FY 2027) actually shows under Execution Monitoring.** Only the tab
   button has been seen, not its content. BY+1 shows a "no obligation concept"
   disclosure; whether BY matches that or shows something more concrete is
   unconfirmed and matters for what the script can claim.
3. **NEXUS → PPBE Coordination**, the fourth tab. Never opened this rehearsal.
4. **The exact click path to the SYNTH-PRG-ECHO detail page** — the one with
   Obligation Status, Budget-to-actual Variance History, Dependency Health, and
   Site Breakdown. This is richer than what the script currently sends anyone
   to, and I can't write an accurate navigation instruction without knowing
   precisely how you reached it.
5. **The "(view source data)" links** on P-300's Program Detail risk register —
   do they resolve to something real, or dead-end?
6. **Where the Anomaly Triage Assistant actually lives** — seen once via the
   Cost Dashboard's coverage detail, never confirmed which tab/module it's on.
7. **The 9,905-byte duplicate script in `~/Downloads`** — still unread, still a
   different file from the tracked repo copy of the same name.

---

## Tier 0 — Investigate first (D1)

### F-50 — Travel Request intake form clears entirely on validation error

**Highest priority in this batch — this is data loss, not a display defect.**
A multi-field form (destination, dates, five cost fields, justification
narrative) resets completely on a single validation error, discarding
everything the user entered rather than preserving valid fields and flagging
the invalid one.

```bash
cd ~/Developer/sovereign-platform
grep -rn "TravelRequest\|handleSubmit\|validationError" --include=*.tsx module-nexus/src 2>/dev/null | grep -v node_modules | head -20
```

**Report:** does the form component re-mount on error, or is state being
explicitly cleared in the error handler? These need different fixes. If the fix
is contained to this one form's error-handling logic, proceed to D2. If it
touches shared form infrastructure used elsewhere, stop and report rather than
risk a wider change this close to the demonstration.

### F-42 — Export Dossier navigates without carrying program context

Clicking Export Dossier on any non-default program (confirmed on P-300) lands
on Report Generation with the Program dropdown reset to P-100 rather than the
program that was clicked.

```bash
cd ~/Developer/sovereign-platform
grep -rn "ExportDossier\|handleExport" --include=*.tsx module-apex/src 2>/dev/null | grep -v node_modules | head -20
```

**Report:** is passing the program id through a small, contained change (a
route param or a piece of state already available at the click site), or does
it require larger navigation restructuring? If small, fix it. If not, the
minimal safe fallback is relabeling the button so it doesn't imply a carried
context it doesn't have — do that instead and report why.

### F-47 — Program Health progress bar doesn't reflect status or overflow

Confirmed identical (fixed blue) across ALPHA (On Track), BRAVO (Off Track),
and ECHO (At Risk) — the bar color is not wired to status at all. Separately,
the bar visually caps at the same full width whether a program is at exactly
100% or 104% obligated — no way to tell over-obligation from on-target by
looking at the bar alone.

```bash
cd ~/Developer/sovereign-platform
grep -rn "ProgressBar\|obligationBar\|progress-bar" --include=*.tsx module-apex/src sovereign-shell/src 2>/dev/null | grep -v node_modules | head -20
```

**Report:** confirm this is one shared component (expected, given identical
behavior across three different-status cards). Fix: colour keyed to status
(matching the badge colours already in use — green/amber/red), and a visual
treatment for anything over 100% that's distinguishable from exactly 100% —
Build Agent's reasonable judgement on the exact treatment (a capped bar with a
distinct end marker is a reasonable default); report the choice made.

### F-48 — Site breakdown and variance-history tables are inconsistent with each other

Two related issues on the SYNTH-PRG-ECHO detail page's tables:
- The quarterly Budget-to-actual Variance History table uses "Actual" —
  inconsistent with "Obligated," the term used everywhere else on the platform.
- The Site Breakdown table below it uses "Obligated" (correct) but omits a
  Variance column the quarterly table has, and orders columns
  Obligated → Planned rather than Planned → Obligated → Variance.

```bash
cd ~/Developer/sovereign-platform
grep -rn "Budget-to-actual\|Site breakdown\|siteBreakdown" --include=*.tsx module-apex/src 2>/dev/null | grep -v node_modules | head -20
```

**Report:** locate both components. Fix: relabel "Actual" to "Obligated" in the
quarterly table; reorder the site table's columns to Planned → Obligated →
Variance → Status; add the Variance column, computed as Obligated − Planned,
matching the sign convention already established in the quarterly table
(positive when over plan).

### F-40 / F-45 — "percent" spelled out instead of "%" — repo-wide sweep, not point fixes

Confirmed in three separate places now: APEX Portfolio Dashboard's Completion
column ("62 percent complete"), and APEX Report Generation's static-fallback
report template (twice — "This program is 30 percent complete" and "8
percentage points above..."). Home Dashboard's instance was already fixed in
Session 116 (F-9/F-11) — this is the same defect class recurring elsewhere,
not a new one.

```bash
cd ~/Developer/sovereign-platform
grep -rln "percent complete\|percentage points\| percent\b" --include=*.tsx --include=*.ts . 2>/dev/null | grep -v node_modules | grep -v test
```

**Report:** every file found. Fix every user-facing instance to use "%"
consistently with the already-fixed Home Dashboard convention. Add one test
asserting the symbol is used, to catch a future recurrence in review rather
than in a fourth screenshot.

### F-46 — ARC's DoD PPBE Reform proposed-change template contains a typo, isolated to that one source

Confirmed: selecting "DoD PPBE Reform" produces "DOE PPBE Reform" (wrong
department) and a garbled clause ("depend on this is always regulatory
source"). Selecting "Evidence Act" produces clean text. The defect is isolated
to one of the four regulatory-source templates, not the auto-population
mechanism generally.

```bash
cd ~/Developer/sovereign-platform
grep -rn "DOE PPBE\|DoD PPBE Reform" --include=*.ts --include=*.tsx module-aria/src 2>/dev/null | grep -v node_modules
```

**Report:** locate the template entry. Fix: correct "DOE" to "DoD" and repair
the grammar. Once fixed, spot-check the remaining two sources (OMB Circular
A-11, Anti-Deficiency Act) for the same defect while the file is open — cheap
to check now, expensive to find as a fourth instance later.

### F-31 follow-up — confirm "Walkthrough B" isn't a live dependency

```bash
cd ~/Developer/sovereign-platform
grep -rln "Walkthrough B" . 2>/dev/null | grep -v node_modules
```

**Report only.** If this resolves to a real, tracked process document, read it
before anyone touches the Gate 3 attestation control. If it resolves to
nothing, that's worth knowing too — the on-screen reference would be pointing
at a process that was never placed.

---

## Tier 1 — Fix directly, no investigation needed (D2)

### F-49 — NEXUS's Request Intake routing table omits two of seven request types

Confirmed: `TRAVEL_REQUEST` and `TIME_RECORD` are both selectable in the
request-type dropdown, both have dedicated intake forms, and neither appears
in the routing table below. Both have real, confirmed approval mechanisms —
the NEXUS Travel & Time Queue's authority ladder (MANAGER / DIRECTOR /
EXECUTIVE) — distinct from the VIGIL-routed approval the table describes for
`COMPLIANCE_CHECK` and `GOVERNANCE_QUERY`.

**Fix:** add both rows. Approval column should read something like "Travel &
Time Queue (manager/director/executive)" rather than "requires approval," to
distinguish this pathway from the VIGIL one. **Separately, and lower
priority:** the table doesn't visually respond to the current dropdown
selection at all — leave this as-is unless D1/D2 above complete with time to
spare; it's polish, not a gap in information.

---

## Tier 3 — Recorded, no action before the demonstration

| # | Finding |
|---|---|
| F-25 | SCRIBE's product-aligned export modes navigate without publishing. Confirmed structural in Session 116. Governance decision required, not a Build Agent repair. Standing, unchanged. |
| F-41 | "Responsible Party" column on APEX Portfolio Dashboard may be entirely Program Managers, or may not — depends on checking the remaining five programs (P-413–417), which is a live-check item, not yet done. |
| F-44 | No back-navigation control in the shell. Architectural; interacts with the persona-switch state-reset behaviour in ways worth designing around deliberately, not patching under time pressure. |

---

## Priority ordering, given limited time before the demonstration

If not everything above can be built, this is the order I'd take them in:

1. **F-50** — data loss is a different category of problem than everything
   else on this list; a CTO who watches a form eat their own input once will
   remember it longer than any cosmetic fix would offset.
2. **F-46** — narrow, confirmed, cheap. Also the one most likely to be said
   out loud by name in the room (Screen 6's ARC beat).
3. **F-40 / F-45** — three confirmed instances now on a platform whose whole
   argument is financial precision.
4. **F-48** — same reasoning, on the deepest financial screen in the platform.
5. **F-49** — safe, additive, no risk.
6. **F-42** — real, but the fallback (relabel rather than rewire) is available
   if the wiring fix isn't small.
7. **F-47** — the only item here that's visual polish rather than a
   correctness or data-integrity issue.

---

## Done Condition Summary

- **D1 (required):** all six Tier 0 investigations run; findings reported
  verbatim, including any that recommend no action.
- **D2 (required):** F-49 applied as specified; F-50, F-42, F-47, F-48, F-40/45,
  and F-46 applied per their D1 findings, in the priority order above, stopping
  at whatever point time allows.
- No D3/D4 this session — everything above is already the trimmed, priority-
  ordered scope.

---

*Session 118 Build Brief · August 19, 2026 · Governance Agent*
*Source: extended live rehearsal following the day-in-the-life script revision*
*Pre-Decisional · Internal Working Document*

# SOVEREIGN Platform — Walkthrough I
## Live Confirmation of Sessions 71-75's Work
## Prepared by Governance Agent, July 30, 2026

---

## Why this script exists

Sessions 71 through 75 closed thirteen findings and four backlog items entirely through
code verification — real tests, real diffs, real reconciled arithmetic — but almost none
of it has been seen live in a browser. Session 75 specifically built substantial new UI
surface (Program Health's metric boxes, the unified To Do/Review layout, ARC's entire
reframe) with no prior version to compare against. This script closes that gap. Unlike
Walkthrough H, nothing here is expected to be a re-confirmation of something already
proven — every Part below is a first live look at real, working code.

**How to use this script:** work through the Parts in order — they're organized to
minimize persona switching, not by session number. For each step, do the action, check
the Expected Result, and note anything that doesn't match. A plain "held" is fine where
it holds.

---

## Part 1 — Home Dashboard: Program Health, obligation math, and layout

**Persona:** PROGRAM_MANAGER (or any non-admin role with real SYNTH-PRG data).

1. **Load Home Dashboard fresh.** *Expected:* Program Health tiles show five programs
   (ALPHA, BRAVO, CHARLIE, DELTA, ECHO), each with a percentage that looks plausible —
   specifically, **none should show over 100% except where genuinely over-obligated,
   and none should show anything like DELTA's old 338%.** *(Verifies WH-34's fix.)*
2. **Check whether the Issues/Flagged Programs section now correctly reflects reality**
   — if any program is genuinely over its plan, it should be flagged; if all are within
   plan, "no flagged programs" should be accurate, not a stale all-clear. *(Verifies
   WH-41.)*
3. **Look for the two new portfolio-level metric boxes.** *Expected:* Dependency Health
   Index reading approximately 75%, and Learning Velocity reading approximately 68%.
   Both should be legible and clearly labeled, not raw numbers with no context.
   *(Verifies WH-5's APEX metric wiring.)*
4. **On each program tile, look for a per-tile variance figure and a point-of-contact
   name and role.** *Expected:* a real name (e.g., "Marcus Cole, Program Manager" for
   ALPHA) — not blank, not "undefined," not a raw ID. *(Verifies WH-5's POC data and
   its guarded rendering.)*
5. **Scroll to To Do/Review.** *Expected:* every module row uses the same visual
   treatment — a header plus a content row, whether the module has pending items or
   shows "Clear." No module should look structurally different from the others.
   *(Verifies WH-36.)*

---

## Part 2 — APEX Execution Monitoring: the BY/BY+1 gate

**Persona:** same as Part 1.

1. **Open APEX → Execution Monitoring, click into any program with FY2027/FY2028
   data.** *Expected:* the PY (FY2025) and CY (FY2026) tabs show the familiar
   obligation-rate, variance, and status-badge layout, unchanged.
2. **Switch to the BY (FY2027) tab.** *Expected:* **no obligation rate, no on-track/
   at-risk badge, no "Actual" column** — a planning notice should render instead,
   stating this is a budget request, not an executed obligation.
3. **Switch to the BY+1 (FY2028) tab.** *Expected:* same planning-notice treatment as
   BY — FY2028 has no obligation concept at all, and the screen should say so, not
   render blank or broken.
4. **Return to CY (FY2026) and confirm it still shows real execution metrics** — the
   gate should apply only to BY/BY+1, not suppress real data elsewhere. *(All four
   steps verify WH-37's live behavior — this was code-traced only until now.)*

---

## Part 3 — NEXUS, SCRIBE, and the Reviewer's Workspace: count matching and the
correspondence badge

**Persona:** same as Part 1, needs NEXUS Travel decision access and SCRIBE access.

1. **In SCRIBE's Time & Travel Review, send a draft for any item in the queue.**
   *Expected:* the item shows as sent.
2. **In NEXUS, open the Travel & Time Queue and find the corresponding time-record
   item.** *Expected:* a correspondence-status badge is now visible on that row —
   green "Correspondence sent" if all flags for that item are sent, amber "N of M" if
   only some are. *(Verifies WH-16, live for the first time.)*
3. **Count exactly how many items in NEXUS's Travel & Time Queue currently require a
   decision** (have live Approve/Deny/Escalate controls, not already-terminal
   statuses).
4. **Open the Reviewer's Workspace, NEXUS Travel panel, and check its badge count.**
   *Expected:* **the two numbers from steps 3 and 4 match exactly.** This is the
   direct live re-confirmation of WH-43 — the platform's most-tracked defect pattern.
   If they don't match, this is the single most important finding this script could
   produce.

---

## Part 4 — ARC: the full reframe

**Persona:** whichever role has ARC/ARIA Suite access (COMPLIANCE_OFFICER or admin,
per Walkthrough H's precedent for CLEAR/CPMI-VRS — confirm ARC uses the same gate).

1. **Open ARC.** *Expected:* a program selector, not a hypothetical free-text entry
   field.
2. **Select SYNTH-PRG-ALPHA.** *Expected:* a context panel shows ALPHA's name, ID,
   FY2026, POC (Marcus Cole), and a CLEAR certification status of "CLEAR certified."
3. **Select SYNTH-PRG-BRAVO (or CHARLIE, or DELTA).** *Expected:* the context panel
   correctly shows "No seeded exhibit — CLEAR status not available" — this is honest,
   pre-existing data incompleteness, not a bug. Confirm it reads as an intentional
   disclosure, not a broken or empty-looking screen.
4. **Choose a regulatory source and confirm a description auto-populates** based on
   the selected program and source. Edit it if you want — confirm it's editable, not
   locked.
5. **Model the impact and view the report.** If the modeled severity is high enough
   to trigger them, **click the "Route to COUNSEL" and "Route to NEXUS" buttons.**
   *Expected:* they reveal explanatory text ("Routing is a manual step in this
   build...") rather than navigating anywhere. **Confirm this doesn't read as broken**
   — the buttons should not look disabled, but their behavior should make sense once
   clicked, not feel like a dead end.

---

## Part 5 — READ_ONLY: the honest empty state

**Persona:** READ_ONLY.

1. **Load Home Dashboard.** *Expected:* only LENS shows as accessible; every other
   module is simply absent from the To Do/Review list — no locked rows, no lock
   icons, no access errors. *(Live re-confirmation of WH-42.)*
2. **Confirm Program Health and Issues sections render without error** — READ_ONLY
   should see an honest, working dashboard scoped to what it can access, not a broken
   or partially-rendered screen.

---

## After the walkthrough

Same as every prior script in this arc: bring back whatever didn't match, screenshots
where you have them. Anything that doesn't hold gets logged as a new finding, continuing
this arc's numbering. If everything in Part 3 specifically holds — the count match — that
closes the last real open question about whether this arc's defining defect pattern is
actually, finally, done. If everything across all five Parts holds, this is the point
where Integration Brief v1.55's readiness score can honestly be rewritten with real,
live-earned evidence behind it.

---

*SOVEREIGN Platform · Walkthrough I · July 30, 2026*
*Pre-Decisional · Internal Working Document*
*Covers Sessions 71-75 · Companion to Integration Brief v1.55 and Findings & Resolution Log Addenda 1-5*

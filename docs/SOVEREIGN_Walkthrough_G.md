# SOVEREIGN Platform — Walkthrough G
## Live Verification: Home Dashboard, APEX Charts, and the Reviewer's Workspace

**Prepared by:** Governance Agent, July 21, 2026
**Status:** Pre-Decisional · Internal Working Document — script, not yet run
**Scope:** Everything built since Walkthrough F (Sessions 39-53) that has had
extensive *code-level* verification tonight but **zero live human interaction.**
That distinction matters — every claim in this document has been independently
confirmed against the real repo; none of it has been confirmed against the
real, running UI. This walkthrough closes that gap.

**Not in scope:** WF-13 through WF-24 (Walkthrough F's own findings) — already
verified live during the repeat pass. GD-22's role matrix — already
live-tested across five of eight roles earlier this same period. This script
does not re-walk either unless something below surfaces a reason to suspect
regression.

---

## Before you start

```
cd ~/Developer/sovereign-platform/sovereign-shell && npm run dev
```
Open `http://localhost:3000`. Confirm the DEV persona dropdown is visible
(top right) before proceeding — every part below depends on switching roles.

---

## Part 1 — Home Dashboard (Sessions 47 & 49)

**As SYSTEM_ADMIN (default):**
1. Land on the Home page. Confirm three visible sections: **Work Scope**,
   **Issues**, **To Do / Review**.
2. Under Work Scope, confirm a **Program Health** panel — one tile per
   program, each showing a status badge (On Track / At Risk / Off Track)
   and an obligation-percentage bar. Report: does the data look real
   (varied percentages, not all identical), or suspiciously uniform?
3. Under Issues, confirm a **Flagged Programs** panel showing only
   at-risk/off-track programs. If every program is on-track, confirm it
   shows an honest empty state, not a blank gap.
4. Under To Do / Review, confirm real queue tiles — not the placeholder
   text ("wired in a future session") that used to be here. Report what
   modules' tiles you actually see (should include VIGIL's counts, since
   you're SYSTEM_ADMIN).
5. Under Work Scope, confirm **Module Orientation** shows all ten original
   modules plus the new **Reviewer's Workspace** — eleven total for
   SYSTEM_ADMIN.

**Switch to PROGRAM_MANAGER (DEV dropdown):**
6. Repeat steps 2-4. Report which To Do / Review tiles disappear (VIGIL's
   should — Program Managers don't have VIGIL access) and which remain
   (SCRIBE, ARIA if applicable, NEXUS).

**Switch to READ_ONLY:**
7. Confirm Program Health, Flagged Programs, and To Do / Review all show
   correctly empty or absent — this role has never been live-tested before
   tonight's own conversation. Report exactly what you see; this is
   genuinely new information, not a re-check.

---

## Part 2 — APEX Execution Monitoring (Session 46)

**As SYSTEM_ADMIN or PROGRAM_MANAGER, open APEX → Execution Monitoring:**
1. Confirm the obligation-rate section is a real **bar chart**, not prose
   sentences — one bar per program, colored by status.
2. Click a bar. Confirm it navigates you into that program's own Program
   Detail view with the right program already showing (not a blank or
   default program).
3. Confirm the budget-to-actual variance section shows a **grouped bar
   chart** (planned vs. actual), not prose.
4. Confirm dependency health shows as a **table** (Healthy / At Risk /
   Failed counts) — this was a deliberate choice, not an oversight; confirm
   it reads clearly either way.
5. Scroll to the **site-breakdown section**. Confirm it visibly discloses
   that site-level data is illustrative/placeholder — this disclosure is
   required, not optional; report the exact wording you see.
6. Count the distinct sites shown across all programs. Should be **six**
   total, with a deliberately uneven spread — at least one program touching
   all six, at least one touching only one.

---

## Part 3 — The Reviewer's Workspace (GD-25 through GD-27) — the largest gap

**This entire module has never been opened by a human before this
walkthrough.** Take this part slowly and report anything that doesn't match.

**As SYSTEM_ADMIN:**
1. Confirm "Reviewer's Workspace" appears in the sidebar (eleventh module).
   Open it.
2. Confirm three sections, one per embedded module: **VIGIL Approvals**,
   **ARIA Certifications**, **SCRIBE T&T Reviews**.
3. In the VIGIL section, confirm you see a **real** approval request — not
   a summary, the actual full request detail (action type, risk
   classification, decision buttons: Approve/Reject/Escalate).
4. **Actually approve or reject one real item.** Confirm: the item
   disappears from the Workspace after deciding, and (if you can check)
   the same decision is reflected in VIGIL's own Approval Queue when you
   navigate there directly — same underlying data, two entry points.
5. Repeat for the ARIA section — certify or decline a real CLEAR item.
   Confirm it disappears from the Workspace after deciding.
6. Repeat for the SCRIBE section — a real T&T review, confirm the "I have
   sent this communication" self-attestation works the same way it does in
   SCRIBE's own screen.
7. **Test the navigation primitive (GD-27):** on any item, look for an
   "Open in [module]" action. Click it. Confirm it takes you into the real
   VIGIL/ARIA/SCRIBE app with that specific item already selected — not a
   generic landing page.

**Switch to COMPLIANCE_OFFICER:**
8. Reopen the Workspace. Confirm you see **only** the ARIA Certifications
   section — VIGIL and SCRIBE sections should be absent or clearly locked,
   not just empty.

**Switch to PROGRAM_MANAGER:**
9. Reopen the Workspace. Confirm you see **only** SCRIBE T&T Reviews — no
   VIGIL, no ARIA.

**Switch to READ_ONLY or INDEPENDENT_REVIEWER:**
10. Confirm the Workspace itself is inaccessible (locked in the sidebar,
    matching the module-level gate) — neither role has access to any of
    the three embedded modules.

---

## What to report back, for each part

For each numbered step: **pass**, or a description of what you actually saw
if it didn't match. Screenshots are genuinely useful here, the same way
they were for Walkthrough F — this is exactly the kind of thing a live
screen catches that a code read cannot.

**Do not fix anything live.** If something doesn't match, note it precisely
and bring it back — findings become the next session's scope, the same
discipline as every walkthrough this project has run.

---

*SOVEREIGN Platform · Walkthrough G · July 21, 2026*
*Pre-Decisional · Internal Working Document — script prepared, not yet run*

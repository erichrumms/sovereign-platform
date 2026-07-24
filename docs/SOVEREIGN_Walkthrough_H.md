# SOVEREIGN Platform — Walkthrough H
## A Live Script Covering the Full Session 54–61 Arc
## Prepared by Governance Agent, July 24, 2026

---

## Before You Start

**Open the dev server:**
```bash
cd ~/Developer/sovereign-platform/sovereign-shell
npm run dev
```

**This script uses the DEV persona toggle to switch roles as needed** — noted at the start of
each Part. Switch personas via whatever the existing dev-login affordance is; if you're unsure
where it lives, that's itself worth a quick note (it should be easy to find).

**How to use this script:** work through the Parts in order — later Parts (specifically Part 6)
depend on earlier ones being done first. For each numbered step, do the action, check the
Expected Result, and note anything that doesn't match — screenshot it if you can. Gaps become
the first deliverables of the next build session, exactly like every prior walkthrough.

**What this script is not:** a re-test of anything already confirmed live in Walkthroughs A
through G. Those stay confirmed. This covers only what's new since Walkthrough G — Sessions 54
through 61 — plus the small number of original Walkthrough G steps that were never actually run
(marked clearly in Part 7).

---

## Part 1 — Home Dashboard (the oldest open item — start here)

**Persona:** any non-admin role with real data, e.g. PROGRAM_MANAGER.

This is the single most important part of this script in one sense: **nothing on Home Dashboard
has been confirmed live since before Session 54's WG-1 fix.** Everything below should now appear
immediately, not empty.

1. **Load Home Dashboard fresh** (a hard refresh, or a brand-new tab). *Expected:* Program
   Health, Flagged Programs, and the Module Orientation panel all show real data immediately —
   no empty state, no flash of "no data" before it populates. *(Verifies WG-1.)*
2. **Look at Module Orientation.** Each module row should show either a colored "N pending ·
   [severity]" badge, or a green "Clear" — not a static tagline. *(Verifies WG-7.)*
3. **Click one module row with a nonzero pending count.** *Expected:* you're taken directly into
   that module — not just told to navigate there yourself. *(Verifies WG-7's clickable-rows
   add-on, using `navigateToModule`, GD-27.)*
4. **Note the current sidebar highlight before and after step 3.** *Expected:* whichever module
   you land in is now highlighted correctly in the sidebar. *(A preview of Part 6 — full test
   there.)*

---

## Part 2 — The Reviewer's Workspace, All Four Sections

**Persona:** PLATFORM_ADMIN or SYSTEM_ADMIN sees everything; try a second pass as
COMPLIANCE_OFFICER or PROGRAM_MANAGER if time allows, to confirm the per-section gating still
holds as expected.

1. **Open the Reviewer's Workspace.** *Expected:* four sections/tabs, not three — VIGIL
   Approvals, ARIA Certifications, SCRIBE T&T Reviews, and **Activity & Decisions** (new).
2. **Open Activity & Decisions.** *Expected:* a list of your own decisions this session (empty if
   you haven't decided anything yet — come back to this after Parts 3–5), and a prominent banner
   stating the data is session-scoped, in-memory, not a permanent record. *(Verifies GD-28 /
   WG-14.)*
3. **If you're an admin role:** toggle "show all platform entries." *Expected:* the view switches
   to every decision made this session, by anyone, not just yours.
4. **If you're not an admin role:** confirm the toggle is simply absent, not present-but-disabled.

---

## Part 3 — VIGIL: Approvals and Alerts, the Resurrection-Family Proof

**Persona:** PLATFORM_ADMIN or SYSTEM_ADMIN.

**This is the most important verification pass in the whole script for reliability specifically.**
Sessions 54 and 61 both did real work here — the goal is confirming a decision genuinely sticks,
not just that the button works.

1. **Open VIGIL's Approval Queue.** Pick a pending item. **Before deciding, click one of the
   reason-code chips above the note field.** *Expected:* the chip's text fills the note field; no
   decision is recorded yet. *(Verifies Session 59's reason-code chips.)*
2. **Approve or reject that item**, using the chip-filled note. *Expected:* it disappears from
   the queue immediately.
3. **Navigate away from VIGIL and back** (use the sidebar, not a refresh). *Expected:* the item
   you decided is still gone — it does not reappear. *(Verifies D1 — the live-subscription root
   fix. This is the single most important individual check in this script.)*
4. **Open VIGIL's Alert Queue.** Acknowledge or resolve one alert.
5. **Navigate away and back**, same as step 3. *Expected:* the alert's new status holds — it does
   not revert. *(Verifies D3-1, the HIGH-severity finding from the Session 60 assessment.)*

---

## Part 4 — ARIA: Gates 3/4, the Safety-Critical Check

**Persona:** COMPLIANCE_OFFICER (or admin) for CLEAR/CPMI-VRS access.

**This one matters specifically because the UI itself promises permanence — confirm the promise
is actually true.**

1. **Open ARIA's CPMI-VRS Gates screen.** Read Gate 3's attestation statement — note that it
   says the attestation is recorded permanently.
2. **Attest Gate 3.**
3. **Navigate away and back.** *Expected:* Gate 3 still shows as attested — no attest control
   reappears. *(Verifies D3-2.)*
4. **Try to attest Gate 3 again**, if any path to do so is still visible. *Expected:* it's
   refused, with a clear message that it's already been attested this session — not silently
   allowed to happen twice. *(This is the specific safety property independently verified twice
   over during Session 61's close review — worth confirming it holds live, not just in code.)*
5. **Open ARIA's CLEAR certification queue.** Click a reason-code chip on a pending document,
   confirm it fills that document's note specifically — not a different document's.
   *(Verifies Session 59's chips, and their per-document scoping.)*

---

## Part 5 — NEXUS and FLOWPATH: the Remaining Two Resurrection Fixes

**Persona:** AGENT_OPERATOR or PROGRAM_MANAGER for NEXUS; AGENT_OPERATOR or ANALYST for FLOWPATH.

1. **In NEXUS, open the Travel & Time queue.** Decide one travel or time item.
2. **Navigate away and back.** *Expected:* the decision holds — it does not revert to its
   original routed/pending state. *(Verifies D3-3.)*
3. **In FLOWPATH, approve one pending artifact.**
4. **Navigate away and back.** *Expected:* it still shows as approved — the approve button does
   not reappear. *(Verifies D3-4.)*

---

## Part 6 — THE Critical Sequence (do this one carefully)

**Persona:** whichever role you used in Part 3.

**Session 61's own close names this exact sequence as the one thing that has never been
confirmed in a real browser.** It's the reason this whole script exists. Everything above tests
one piece in isolation; this tests two of the arc's biggest changes working together.

1. **Enter VIGIL** (or any module with a pending decision available).
2. **Decide an item** — approve, reject, or resolve something real.
3. **Return to Home Dashboard using the breadcrumb** — not a browser back button, the actual
   in-app "Home" affordance. *Expected:* you land on a genuinely fresh Home Dashboard — Program
   Health and Module Orientation both show current, live data (this confirms Home's own expiry
   sweep, WG-17, actually resumes, not just that the screen loads).
4. **Re-enter the same module you decided in.** *Expected:* the item you decided in step 2 is
   still gone / still shows its new status — **not reset, not resurrected.**
5. **Check the sidebar highlight throughout steps 1–4.** *Expected:* it tracks correctly at every
   point — never stuck on a module you've left, never blank.

**If every part of this holds:** Sessions 54 and 61's combined work is genuinely confirmed, not
just independently code-verified — this closes the platform's single oldest and most
load-bearing open item.

**If anything here doesn't hold:** this is the most important gap this script could possibly
find. Screenshot it precisely and note exactly which step failed — this is worth a dedicated
follow-up regardless of what else this walkthrough turns up.

---

## Part 7 — APEX: the Native PPBE View and the Padded Fiscal Data

**Persona:** PROGRAM_MANAGER or ANALYST.

1. **Open APEX's Execution Monitoring, PPBE Dashboard.** Click into one program.
   *Expected:* a native single-program detail view opens — not the old "No program record was
   found" error, and not the World Model's own Program Detail screen. *(Verifies WG-11 + WG-8,
   Session 57.)*
2. **Check the variance history section.** *Expected:* four fiscal quarters shown, not two.
   *(Verifies WG-6's demo-cosmetic padding, Session 59 — note this is explicitly acknowledged as
   cosmetic, not a claim about real data architecture.)*
3. **Check the dependency health section.** *Expected:* only dependencies relevant to this
   specific program, not the full platform list.
4. **Return to the PPBE Dashboard and confirm the World Model's own, separate Program Detail
   path (from the original Portfolio Dashboard) still works exactly as before** — this view was
   deliberately left untouched all arc; worth one quick confirmation it's still intact.

---

## Part 8 — Remaining Original Walkthrough G Steps (never run)

**Persona:** cycle through PROGRAM_MANAGER, READ_ONLY, and one more if time allows.

These were unblocked by Session 54's WG-1 fix but never actually walked live:

1. Confirm Program Health's tile genuinely varies by program mix (not a fixed demo value).
2. Confirm Flagged Programs shows only programs that should actually be flagged.
3. Confirm the To Do/Review queue tiles' contents match what's actually pending for your role.
4. As READ_ONLY specifically: confirm Home shows an honest, correctly-empty state — no
   phantom pending items, no access errors.

---

## After the Walkthrough

Bring back whatever didn't match — screenshots where you have them, a plain description where
you don't. Findings get the same treatment every prior walkthrough's did: real code problems
become build findings, undecided questions become governance items, and Part 6 specifically gets
flagged as its own priority if anything there doesn't hold.

---

*SOVEREIGN Platform · Walkthrough H · July 24, 2026*
*Pre-Decisional · Internal Working Document*
*Covers Sessions 54–61 · Companion to `docs/30` and `SOVEREIGN_Platform_EndToEnd_Assessment_20260723.md`*

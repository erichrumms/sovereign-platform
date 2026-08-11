# SOVEREIGN Platform — CTO Demonstration Script
## Update — August 10, 2026 · Supersedes SOVEREIGN_CTO_Demonstration_Script_20260806.md

**Status note:** the August 6 script (below, unchanged) was corrected and placed
for real in Session 97 — WH-43's duration fixed to the real eight days before
placement. **This update is checklist-only** — the live walkthrough that was
incomplete when the script was placed has since been finished, all eight screens
walked, and three real findings from that walkthrough are recorded below.
Nothing in Screens 1-8 or the closing section changed.

---

**What changed August 6:** the original script had a live branch point at Screen 4
depending on whether WH-43 was confirmed before the demo. That's resolved now — the
branch point is gone, replaced with the real, stronger story of how it resolved. A
new screen (Cost Dashboard) is added, since that capability didn't exist when the
original script was written.

---

## Pre-demo checklist (unchanged items not restated)

- [x] WH-43 live-confirmed — **done, and the story is worth telling directly (see
      Screen 4 below), not just checked off**
- [ ] Environment tested on the actual presentation machine, browser, and network
      - [ ] **New — microphone access for SCRIBE's Smart Capture.** Live-tested
            twice tonight and blocked both times ("Voice capture error: not
            allowed") — consistent across two different drafting modes, which
            points to a browser/OS permission block rather than an app bug.
            Before the real demo: (1) confirm the presentation browser has
            microphone access in the OS privacy settings, (2) confirm the
            site-level permission for the app's URL is set to Allow, not Ask
            or Block, (3) actually click "Start capture" and confirm a real
            transcript comes back — settings can look right and still not
            work. **First, confirm whether Smart Capture is even part of the
            planned demo** — if it's not being used live, this doesn't block
            anything, but should be a deliberate call, not an unchecked
            assumption either way.
- [ ] DEV persona toggle confirmed working, roles pre-identified for each screen —
      **confirmed this arc: SUPERVISOR is a real, working persona option, along
      with Platform Admin, System Admin, Program Manager, Analyst, Compliance
      Officer, Agent Operator, Independent Reviewer, and Read Only.**
      **New finding, worth knowing before demo day: switching personas silently
      resets other screens' in-session state** (confirmed via a controlled
      re-test — travel-request decisions and VIGIL's alert queue both appeared
      to "reset" after a persona switch, with no warning to the operator). Not
      a data-integrity bug — ruled out via direct comparison — but worth
      knowing so a mid-demo persona switch doesn't visibly undo something
      already shown.
- [ ] A fresh browser session — no leftover Activity & Decisions or Cost Dashboard
      entries from rehearsal
- [ ] **Live walkthrough — now complete for all eight screens.** Screen 4
      confirmed live and holds (WH-43 parity, including a real ESCALATED item
      correctly not inflating the count). Screens 1-3, 5, 6, and 8 walked this
      arc — Screen 6 in particular confirmed the full live/static agent
      inventory (VIGIL live; SCRIBE, APEX, NEXUS, and CPMI's PPBE-adjacent
      paths static with honest degraded-mode disclosure; ARIA deterministic by
      design). Screen 7's on-screen excluded-site text discrepancy (see below)
      has since been investigated and fixed.
- [ ] **Cost Dashboard disclosure text — fixed, worth re-confirming live before
      the real demo.** The on-screen excluded-site text incorrectly claimed
      three COUNSEL hooks "do not call the model at all" — they do; they're
      excluded from this specific coverage metric because they emit a
      different event type. Corrected in the repo; worth a quick visual
      re-check on Screen 7 during rehearsal to confirm the fix reads clearly.

---

## Screens 1–3 — unchanged from the July 30 script

---

## Screen 4 — Reliability evidence: now a stronger beat, not a hedged one

**Say, plainly, without hedging — this replaces the July 30 version's language:**
"We don't just claim this platform is reliable — here's how we know, including a
story from the last few weeks that we think makes the point better than a clean
record would."

Walk through, in order:

1. **The fifty-one-screen comprehensive audit** — zero MAJOR or BROKEN findings.
2. **Walkthrough H Parts 4 and 6** — ran live, held completely.
3. **The self-correction record — now four real instances, tell it directly:** "Our
   own verification process has caught a fabricated status report before it entered
   the permanent record, a double-counted test figure presented as reconciled, a
   proposed internal process document that cited rules that turned out not to exist —
   and most recently, a live check we ran on this exact platform found that a fix
   we'd shipped just eight days earlier had itself introduced a small counting
   error. Every one of these was corrected publicly, with the original flawed
   version kept in our history rather than deleted."
4. **The WH-43 story specifically, told as a demonstration, not a disclosure:**
   "Watch this." Open NEXUS's Travel & Time Queue, count the actionable items. Open
   the Reviewer's Workspace, NEXUS Travel panel, show the badge. **They match.** "This
   exact check used to fail — for eight days, because the earlier fix over-
   counted by exactly one. We found that by actually running this check, live, the
   way we're doing right now. It's fixed, and there's now a permanent automated test
   that would catch it immediately if it ever happened again — not just here, on five
   of our seven review screens." If time allows, this is the single strongest
   "show, don't tell" moment available in the whole demo.

---

## Screen 5 — Time & Travel *(unchanged from July 30)*

## Screen 6 — PPBE, the full proof of concept *(unchanged from July 30, plus:)*

**Optional addition, if time allows:** the program data shown is no longer a small,
hand-seeded set — real expansion this arc grew both program systems to real depth
(program counts roughly tripled), giving a more convincing "this holds at scale"
demonstration than the original seed data alone could.

---

## Screen 7 — NEW: Cost & Operations transparency

**Persona:** SYSTEM_ADMIN or PLATFORM_ADMIN.

**Say:** "Every enterprise AI conversation eventually gets to the same question: what
is this actually costing us, and can we see it? Most platforms can't answer that in
real time. This one can."

**Do:** Trigger one real action (a VIGIL brief or a SCRIBE draft). Open Reviewer's
Workspace → Cost Dashboard. Show the real, nonzero running total, the per-product and
per-agent breakdown, and the fallback/wasted-spend line broken out by real failure
category (auth failure, rate limit, timeout, server error) rather than a single
undifferentiated count.

**Say, honestly, matching the platform's own disclosed limit:** "This resets when the
session ends — it's not yet a permanent historical record. That's a real, deliberate
scope decision, not an oversight, and it's the next thing on our own roadmap if this
capability needs to go further."

---

## Screen 8 (was Screen 7) — Intelligence Layer: name it, don't apologize for it

**Say:** "This is the layer everything else in the platform feeds — not built yet,
named deliberately." **New, optional line, if a technical evaluator is in the room:**
"We even have a field reserved in our data model for its output today — deliberately
left unpopulated, because populating it now would mean fabricating the very thing
this layer is supposed to compute. We'd rather show you an honest gap than a fake
number."

---

## Closing the room *(unchanged from July 30)*

**Q&A preparation:** unchanged — the ten-category framework still has real, ready
answers for the five categories most likely to come up. **Worth re-confirming before
this demo specifically:** the "Reliability & Evidence" and "Readiness vs. Aspiration"
categories both cited WH-43 as their shared open item in the last version of that
framework — both should now cite its real resolution instead.

---

*SOVEREIGN Platform — CTO Demonstration Script · Update · August 6, 2026*
*WH-43 duration corrected August 9, 2026 · Governance Agent*
*Pre-demo checklist updated August 10, 2026 with walkthrough-completion status
and two new findings (microphone access, persona-reset) — checklist-only,
Screens 1-8 unchanged*
*Pre-Decisional · Internal Working Document*
*Companion to Strategic Plan v3.11*

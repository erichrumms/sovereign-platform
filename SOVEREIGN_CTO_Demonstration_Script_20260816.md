# SOVEREIGN Platform — CTO Demonstration Script
## Consolidated · August 16, 2026 · Governance Agent

**Supersedes and replaces all four prior scripts.** This document is self-contained.
Nothing in it points to an earlier version, and no earlier version needs to be open
during the demonstration.

| Superseded file | SHA-256 | Disposition |
|---|---|---|
| `SOVEREIGN_CTO_Demonstration_Script_20260730.md` | `8c2e5ec4…` | Retain as history; not on disk, not tracked |
| `SOVEREIGN_CTO_Demonstration_Script_20260810.md` | `ba7a7bec…` | On disk and tracked — superseded by this file |
| `SOVEREIGN_CTO_Demonstration_Script_checklist_only_20260810.md` | `ba7a7bec…` | **Byte-identical duplicate of the above. Delete.** |
| `SOVEREIGN_CTO_Demonstration_Script_20260811.md` | `2dcd0d34…` | Newest prior content; never placed. Its checklist advances are carried forward here |

**Companion documents, all current:** Read-Ahead deck (six slides), Technical Companion
to the CTO Briefing, Strategic Plan v3.14, Integration Brief v1.61, CTO Framework
Applied v2.

**Why this consolidation exists:** the previous script was three files deep — August
updates layered on a July 30 base, with five of eight screens' content living only in
the base file, which was never placed in the repository. Running a demonstration from
three documents, one of them untracked, is the same hazard class as the parallel
document lineages this project spent four sessions resolving.

---

## How to use this

Deliver the Read-Ahead deck in advance. It carries the framing. This document is the
click-by-click walkthrough for the thirty minutes in the room.

Each screen below has four parts: **Persona**, **Say**, **Do**, and **Watch for**.
Say-lines are written to be spoken, not read aloud verbatim — they fix the claim, not
the wording.

**Three items in this script are marked `[REHEARSAL]`.** Each is a claim that has not
been confirmed on screen since the platform changed underneath it. Confirm all three
in the rehearsal walkthrough before this script is treated as final.

---

## Pre-demo checklist

### Confirmed and closed

- [x] **WH-43 live-confirmed.** Parity holds, including a real ESCALATED item correctly
      not inflating the count. Permanent automated coverage now on five of seven
      Reviewer's Workspace tabs.
- [x] **Live walkthrough complete for all eight screens.** Screen 6 confirmed the full
      live/static agent inventory — VIGIL live; SCRIBE, APEX, NEXUS and CPMI's
      PPBE-adjacent paths static with honest degraded-mode disclosure; ARIA
      deterministic by design.
- [x] **Cost Dashboard disclosure text corrected.** The excluded-site text had claimed
      three COUNSEL hooks "do not call the model at all" — they do; they are excluded
      from that specific coverage metric because they emit a different event type.
- [x] **Two false banner claims found and corrected.** Both the Cost Dashboard and the
      Activity & Decisions banners had directed users to "the platform audit log" for
      historical data. No such log exists — Stage 2 persistence is unbuilt. Both banners
      now describe the real state.
- [x] **VIGIL's alert-queue "contradiction" ruled out.** Not a data-integrity issue. The
      real cause was the persona-switch state reset, below.
- [x] **Full platform re-verification, independent of the walkthrough.** Entire test
      suite re-run fresh across all fifteen workspaces; five cross-module
      decision-publishing paths (VIGIL, ARIA, SCRIBE, NEXUS, FLOWPATH) traced end to
      end at code level with no wiring issues found.
- [x] **Two demonstration-surface defects found and fixed** in the week before this
      script. Both are told in Screens 1 and 4 rather than buried in a checklist.
- [x] **Smart Capture and the microphone are out of the demonstration by decision.**
      Not a blocker, not an unchecked assumption — a deliberate exclusion. Do not
      attempt a live voice capture.

### Do before the room

- [ ] **A fresh browser session.** No leftover Activity & Decisions or Cost Dashboard
      entries from rehearsal. The cost total must start at zero so the first real
      action visibly moves it.
- [ ] **Environment tested on the actual presentation machine, browser and network** —
      not wherever it was last rehearsed.
- [ ] **Persona sequence rehearsed in order** (see below). Switching personas silently
      resets other screens' in-session state.
- [ ] `[REHEARSAL]` **Confirm the live classification control on Screen 2.**
- [ ] `[REHEARSAL]` **Confirm the demonstration roles on screen.**
- [ ] `[REHEARSAL]` **Confirm ECHO's two stories are one story.**
- [ ] **Program-count disclosure rehearsed out loud** (see Screen 1). **Decided August
      16, 2026: disclosed verbally in the room, not on screen.** No build session opens
      before the demonstration. This is a spoken beat now, so it needs rehearsing like
      one — it is the only place in the walkthrough where you volunteer an
      inconsistency, and it should sound prepared rather than apologetic.

---

## The persona sequence, and why order matters

**Switching personas silently resets other screens' in-session state.** This was
confirmed by controlled re-test — travel-request decisions and VIGIL's alert queue both
appeared to reset after a switch, with no warning to the operator. It is not a
data-integrity fault, and the demonstration does not need to explain it. It does need
to be sequenced around.

**The rule: never return to a screen after leaving its persona.** Each screen is shown
once, in order, and the demonstration moves forward only.

| Screen | Persona | Switch required |
|---|---|---|
| 1 — Home Dashboard | PROGRAM_MANAGER | — |
| 2 — Classification boundary | PROGRAM_MANAGER (banner is visible in APEX, ARIA and FLOWPATH) | No |
| 3 — Three-role workflow | ANALYST → COMPLIANCE_OFFICER | **Yes, twice** |
| 4 — Reliability evidence | PROGRAM_MANAGER | **Yes** |
| 5 — Time & Travel | PROGRAM_MANAGER | No |
| 6 — PPBE | ANALYST | **Yes** |
| 7 — Cost & Operations | SYSTEM_ADMIN or PLATFORM_ADMIN | **Yes** |
| 8 — Intelligence Layer | Any | No |

**The role taxonomy is nine, confirmed against the shell contract on August 16, 2026.**
`SovereignRole` declares `PROGRAM_MANAGER`, `ANALYST`, `COMPLIANCE_OFFICER`,
`AGENT_OPERATOR`, `INDEPENDENT_REVIEWER`, `SYSTEM_ADMIN`, `READ_ONLY`, `PLATFORM_ADMIN`
(GD-5, contract v1.3) and `SUPERVISOR` (contract v1.28). The persona toggle offers the
same nine. The two agree.

**This demonstration exercises four of the nine** — PROGRAM_MANAGER, ANALYST,
COMPLIANCE_OFFICER, and SYSTEM_ADMIN or PLATFORM_ADMIN at Screen 7. That is a
deliberate subset, not the whole taxonomy, and it is worth saying so if asked rather
than implying the four are all there are.

`[REHEARSAL]` **Confirm each persona used above is a working option and that each
screen's gating role is what this table says.** Watch specifically for a screen that
renders empty rather than locked under a role — a locked panel with an honest tooltip is
the designed behaviour; a blank one is not.

---

## Opening remarks — before Screen 1

Two statements, said early, unprompted. Both cost almost nothing to volunteer and a
great deal to have extracted.

**Say:** "Before I show you anything, two things I'd rather say than have you find.

SOVEREIGN is a governed application architecture, not a control plane. The controls I'm
about to show you sit in the code path rather than in a procedure people are asked to
follow — which makes them real. But there is no runtime boundary here that would stop a
developer who deliberately wrote around the shared client. That discipline is held by
architecture and code review today, and moving it behind a service boundary is the
second item in our path to production.

And single sign-on is not connected. The platform runs on a seeded development user.
The authorisation model you'll see is real and exercised; the identity feeding it isn't
yet coming from an identity provider. That's first in the sequence, because every other
control depends on knowing who the actor is."

**Then:** "Everything you'll see is running code against synthetic data. No mockups, no
screenshots."

---

## Screen 1 — Home Dashboard, and the strongest thing we know about our own work

**Persona:** PROGRAM_MANAGER.

**Say:** "This is what a program manager opens first — a work surface, not a feature
list. Every figure here is computed live from the platform's own records as you watch."

**Do:** Point to Program Health, the Dependency Health Index, and Learning Velocity.
Click into one program tile; show the point of contact and per-tile variance.

**Then — the program-count disclosure, spoken.** Decided August 16, 2026: disclosed in
the room rather than on screen. No code changes on a demonstration surface in the days
before the demonstration.

**Say, while the count is visible — volunteer it before it is noticed:** "You'll see three
different program counts in this platform — five here, seventeen in the portfolio view,
eighteen in scenario analysis. Each is correct for what it enumerates: five programs
counted once, a separate governance dataset of seventeen, and those same five programs
across four fiscal years. The two datasets aren't cross-referenced yet, and merging them
needs a program manager who knows which record maps to which. We'd rather show you the
inconsistency and explain it than quietly pick one number."

**Then, the correction — and this is the strongest single moment in the demonstration.**

**Say:** "This exact screen was wrong last week, and how we found it is the point.

A program obligated at 104% of its ceiling was publishing 'On Track' right here. At the
same time, the platform's own ledger monitor had flagged that same program priority one
for exceeding its ceiling, and an end-to-end test was asserting the breach. Our alerting
and our dashboard disagreed with each other, and had for some time.

We found it because we'd just fixed the same class of error one level down — a site
obligated at 135% also showing 'On track' — and went looking for the same root cause
elsewhere rather than closing the ticket. Both had the same shape: a status function
with a lower bound and no upper bound.

Both are fixed. The tests written for them were proven to fail without the fix by
reverting the source and re-running. This screen now agrees with the alerting."

**Watch for:** the flagged-program count should read 2, not 1. Confirm before the room.

**Why this belongs on Screen 1:** it is the same class of error the platform exists to
prevent — a governance number displayed as healthy when it is not — found by the
platform's own discipline rather than by a user noticing.

---

## Screen 2 — The classification boundary, shown rather than described

**Persona:** PROGRAM_MANAGER (no switch).

**Say:** "This platform is authorised for unclassified data only. That isn't a policy
statement, it's enforced in one shared rule with no divergent copy between modules."

**Do:** Point to the on-screen banner.

`[REHEARSAL]` **Confirm whether a live control exists to demonstrate the refusal.** The
Read-Ahead deck tells the CTO they will see the limit on screen rather than hear it
described. If a live control exists, use it: attempt the higher-classification action,
show the block and the resulting log entry. **If no live control exists, the deck's
promise must be corrected before it is sent** — do not describe a demonstration the
deck said would be shown.

**Say, and do not soften this:** "One qualifier I want to volunteer. The classification
label is supplied by the caller, and nothing inspects content. A request *marked* above
unclassified is refused before any model call happens. But if someone pasted sensitive
material into a field marked unclassified, this platform would process it. This is an
authorisation and routing control, not data-loss prevention. Content-aware
classification is a separate capability, and we've listed it as one."

---

## Screen 3 — One item, three people, one chain

**Persona:** ANALYST, then COMPLIANCE_OFFICER.

**Do:** In SCRIBE, show a drafted document. Switch to COMPLIANCE_OFFICER. Open ARIA's
CLEAR Certification Queue and certify the same item. Open TRACER and trace the chain
back from the certified item to the regulation governing it.

**Say:** "Draft, certify, trace — three roles, one unbroken chain. No model makes the
certification decision. ARIA applies fixed rules to fixed inputs and a named person
signs. An AI's work stays advice until that signature."

**Say, at the persona switch — this is where identity gets its second mention:** "I'm
switching roles directly here, which is the seeded-user point I made at the start. The
access rules deciding what each role can reach are real and enforced. The identity is
not yet coming from an identity provider."

**Watch for:** this is the first persona switch. Everything shown on Screens 1 and 2 is
now behind you. Do not go back.

---

## Screen 4 — Reliability evidence

**Persona:** PROGRAM_MANAGER.

**Say:** "We don't claim this platform is reliable — here's how we know, and it includes
our own mistakes."

Walk through, in order:

**1. The fifty-one-screen comprehensive audit** — zero MAJOR or BROKEN findings. **Say
what that is worth:** "That's a point-in-time result describing what was checked, not a
permanent property. Real defects surfaced through ordinary use two days after that audit
rated the same screens clean. I'd rather tell you that than let the clean result do more
work than it can carry."

**2. The test suite.** 2,254 tests — 2,059 TypeScript across fifteen workspaces plus 195
Python — re-run at every session close with the full output quoted into the permanent
record. **Two qualifiers, volunteered:** there is no continuous integration pipeline and
no coverage measurement. Tests run because the close protocol requires them and the
output is quoted. That is discipline rather than automation, and it should be both. The
test count is real; a coverage percentage would be invented.

**3. The self-correction record — four documented instances, plus two more found last
week.** "Our own verification caught a fabricated status report before it entered the
permanent record; a double-counted test figure presented as reconciled; a proposed
process document citing rules that did not exist; and a fix found eight days after
shipping to have introduced a small counting error. Every one was corrected in the open,
with the flawed version kept in history beside its replacement rather than deleted. The
two obligation-threshold errors I showed you on the home dashboard are the two most
recent, and they're the same class."

**4. The WH-43 story, demonstrated rather than described.** "Watch this." Open NEXUS's
Travel & Time Queue and count the actionable items. Open the Reviewer's Workspace,
NEXUS Travel panel, and show the badge. **They match.**

**Say:** "This check used to fail — for eight days, because an earlier fix over-counted
by exactly one. We found it by running this check live, the way I just did. It's fixed,
there's now a permanent automated test that would catch a recurrence immediately, and
that coverage extends to five of our seven review screens."

**Watch for:** the parity numbers must match on screen. If they don't, say so and stop —
the entire reliability argument rests on not claiming a check passed when it didn't.

---

## Screen 5 — A request that crosses two systems

**Persona:** PROGRAM_MANAGER (no switch).

**Do:** Send a correspondence draft in SCRIBE. Show the resulting status badge appear on
the corresponding item in NEXUS's Travel & Time Queue.

**Say:** "Small, but real — two modules, one governed status, nobody re-keying it and
nobody reconciling it by hand."

**Watch for:** this creates a new item. It will change the counts shown on Screen 4. That
is fine as long as you do not go back.

---

## Screen 6 — PPBE, end to end

**Persona:** ANALYST (confirmed as the correct gating role for ARC).

**Do:** Open ARC. Select a program with a real seeded exhibit — ALPHA — and show the
context panel and CLEAR certification status. Then select a program without one — BRAVO,
CHARLIE or DELTA — and show the honest "no seeded exhibit" disclosure.

**Say:** "Where we don't have real data behind a program, the platform says so rather
than showing a number it can't support."

**Do:** Model a regulatory change. Show the projected impact report and the routing
recommendation buttons.

**Say, before clicking:** "These reveal a recommendation for a person to act on. They
don't execute anything themselves."

**Optional, if time allows —** `[REHEARSAL]` **confirm first.** Walk one program's
multi-year arc through Execution Monitoring's PY/CY tabs and the variance table. **ECHO
is the natural candidate and also the program whose 104% ceiling breach you told on
Screen 1.** Confirm on screen whether ECHO's multi-year arc and the ceiling-breach
correction are one story or two before using this beat. If one, it is a strong callback.
If two, it will read as confusion and should be dropped or moved to BRAVO.

**Do not say "program counts roughly tripled."** That phrasing collides with the
disclosure on Screen 1. The dataset expansion is real; describe it as depth if it comes
up, not as a count.

---

## Screen 7 — What the AI costs

**Persona:** SYSTEM_ADMIN or PLATFORM_ADMIN.

**Say:** "Every enterprise AI conversation reaches the same question: what is this
costing, and can you see it? Most platforms can't answer in real time. This one can."

**Do:** Trigger one real action — a VIGIL brief or a SCRIBE draft. Open Reviewer's
Workspace → Cost Dashboard. Show the running total move, the per-product and per-task
breakdown, and the failed-call spend broken out by real failure category — authentication
failure, rate limit, timeout, server error — rather than a single undifferentiated count.

**Say, and hold this distinction firmly:** "Two things I need to separate, because they
sound alike and aren't. This is *measured*, not *governed*. There is no budget, no cap,
no spending limit, and no automatic routing of low-risk work to a cheaper model. We think
the measurement is the harder half and the more unusual capability, but I don't want the
two heard as the same thing. Governing cost is Phase 4 in the companion document."

**Say, on scope:** "Fourteen of our nineteen real live-call sites are instrumented. The
five that aren't are disclosed on the screen rather than rounded away. And this total
resets when the session ends — it isn't yet a permanent historical record, because
persistence arrives with the data layer that's specified and not yet built."

---

## Screen 8 — The layer we have not built

**Persona:** any.

**Say:** "Everything you've seen collects a record of decisions. Turning that record into
analysis is the next layer, and it does not exist. We'd rather name it than imply it's
there."

**Optional, for a technical evaluator:** "There's a field reserved in the data model for
its output today, deliberately left unpopulated — populating it now would mean
fabricating the very thing that layer is supposed to compute."

**Name STRATA alongside it, without apologising:** "Underneath it, an organisation-scoped
data substrate. Specified, governance-approved, zero code written. Same disclosure."

---

## Closing the room

**Return to the objective stated at the open:** PPBE execution governance, a
deterministic compliance layer, and a real audit trail. Everything shown was evidence for
that claim rather than a list of features competing with it.

**The ask, stated plainly:** "We're asking for your technical judgement on whether the
approach is sound, before we take a resourcing conversation to leadership. Not a
judgement on production readiness or accreditation — only whether the premise and the
direction are technically credible enough to justify continued development.

And the most valuable thing you can give us is the objection we haven't thought of. The
gaps we can see are already on our list. The one we can't see from the inside is worth
more to us than confirmation of the ones we can."

**Offer the repository.** Time-boxed read-only access for the evaluation period. A clone,
an install, and the per-workspace test commands run the whole suite without a credential —
no API key is required and none is in the repository. The commit history is intact and
includes the corrections described above, flawed versions and all.

---

## Q&A quick reference

### Never say these — the corrected forms are on the right

| Do not say | Say instead |
|---|---|
| ARIA "decides compliance questions" | ARIA applies compliance rules; no AI in that decision path |
| CPMI "checks the AI's reasoning" | CPMI makes AI reasoning traceable and reviewable |
| "Nothing runs until someone approves it" | An AI's work stays advice until a person signs for it; AI may analyse and draft freely |
| "Permanent, tamper-evident record" | Append-only, hash-chained — tamper *evidence*, not prevention |
| "The platform refuses anything above unclassified" | A request *marked* above unclassified is refused. The label is trusted; content is not inspected |
| "A model hash mismatch raises a priority-one alert" | It blocks inference and is recorded. Alert dispatch is unbuilt, authorised scope |
| "The commercial API isn't FedRAMP-authorised for CUI, so local inference is the only answer" | FedRAMP-High authorised paths exist. Local inference is for work where no third-party boundary is acceptable at all |

### "How is this different from Palantir Foundry?"

A different category of thing, not a smaller version of the same thing — a specific set of
already-built governed applications, with a data layer being added underneath, and no
visual builder because nothing here is meant to be assembled by someone who is not
engineering it.

### "What model governance do you have?"

"We run one primary provider. A second, local provider is built and tested — it routes by
data classification, and it's unreachable today because our operating boundary is
unclassified-only and the routing function throws a named error on anything above that
before provider selection even happens. That's fifteen lines you could read, not a policy
we're asking you to trust. Model weights are SHA-256 verified at load; a mismatch throws,
blocks inference, and lands in the same append-only record as every other decision. Any
model update — even a quantisation change — re-runs all four certification gates before
promotion, with no expedited path, and the previous version stays in the bill of
materials as deprecated. And changing providers is a governance decision here, not a
config edit — even though technically it is a config edit, because every external call
goes through one client."

**Volunteer the asymmetry rather than concede it:** model governance is strongest for the
provider that is currently switched off. The commercial provider in active use resolves
through a default model constant and has no equivalent registry entry. Extending the
registry to cover it is straightforward and is on the roadmap.

### The four categories where the honest answer is "we don't have that"

- **Quantified business case.** No cycle-time, error-rate or hours-saved figure exists. An
  honest number needs a pilot with real usage.
- **Build versus buy.** Nothing shows this was formally evaluated.
- **Competitive analysis.** None exists. The specific bet is a deterministic compliance
  layer built around governing AI-generated work in a named regulatory domain — a problem
  most existing GRC tooling predates. That is not the same as demonstrating no
  off-the-shelf tool could have been adapted.
- **Integration and exit path.** No integration to a financial system, HR or identity
  provider exists. Every dataset is synthetic. Data portability is unaddressed.

**The framing to hold across all of them:** a precisely named gap costs less than a
confident answer that doesn't survive the follow-up question.

### If asked about dependencies or vulnerabilities

Zero new production dependencies since June, independently confirmed at every session
close. Five `npm audit` findings — one moderate, four high — all in development tooling,
none on the runtime surface, unremediated and recorded as such.

---

*SOVEREIGN Platform — CTO Demonstration Script · Consolidated · August 16, 2026*
*Governance Agent · Supersedes the July 30, August 10 (×2) and August 11 scripts*
*Companion to Strategic Plan v3.14, Integration Brief v1.61, the Technical Companion,*
*and the Read-Ahead deck*
*Pre-Decisional · Internal Working Document*

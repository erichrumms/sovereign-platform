# SOVEREIGN Platform — CTO Demonstration Script
## Consolidated · August 17, 2026 · Governance Agent
## Supersedes the August 16, 2026 consolidated script

**Everything in this version reflects the live platform after Session 116 (nine
rehearsal fixes) and Session 117 (the SCRIBE AI-disclosure banner). Where a
say-line used to compensate for something the screen didn't show, the screen now
shows it — several beats are stronger than the prior version for that reason
alone.**

**Two items remain genuinely open and are marked `[REHEARSAL]` below. Confirm both
before this script is final:** whether a live control exists to demonstrate the
Screen 2 classification refusal, and a completed live pass through Screens 7 and 8,
neither of which was walked to completion in the last rehearsal.

**Companion documents:** Read-Ahead deck, Technical Companion, Strategic Plan
v3.14, Integration Brief v1.61, CTO Framework Applied v2. **The deck's Screen 2
promise ("you will see the limit on the screen rather than hear it described")
should be reconciled with the `[REHEARSAL]` finding below before the deck is sent.**

---

## How to use this

Deliver the Read-Ahead deck in advance. This is the click-by-click walkthrough for
the room. Say-lines fix the claim, not the wording.

---

## Pre-demo checklist

### Closed since the last rehearsal

- [x] **F-1 — header no longer shows `· CUI`.** The seeded development user's
      clearance was reseeded to UNCLASSIFIED. The header and the GD-10 banner no
      longer contradict each other on the same screen.
- [x] **F-9, F-10, F-11 — Home Dashboard display fixed.** Currency now formatted
      (`$267,000 of $580,000`), an "As of FY 2026 Q4" label is visible, and the
      obligation percentage no longer repeats in two formats.
- [x] **F-18 — the classification banner no longer implies content inspection.**
      APEX, ARIA and FLOWPATH now state plainly that requests *marked* above
      unclassified are refused before any model call, and that classification
      labels are caller-supplied — content is not inspected. This is now the
      platform's own wording, not just something you say over it.
- [x] **F-32, F-35 — the Reviewer's Workspace and Cost Dashboard banners are
      readable.** Both now lead with plain English; the Cost Dashboard's full
      technical detail sits behind a collapsible "Technical references" toggle,
      matching TRACER's own pattern.
- [x] **F-37 — the Time & Travel Review draft header is accurate.** Now reads
      "read before sending," not "review before any action" — it was never
      editable and no longer claims to be.
- [x] **F-20 — SCRIBE now carries an AI-disclosure banner, app-wide.** Visible on
      all three tabs, permanently, not just on the drafting screen.
- [x] **F-16 — NEXUS's classification banner is now blue**, matching the other
      three modules. Wording still differs slightly ("requests... refused at
      intake" vs. the fuller caller-supplied-label language); not worth
      mentioning unless asked.

### Confirmed structural, not fixable before the demonstration

- [ ] **F-25 — SCRIBE's six product-aligned drafting-mode exports do not publish
      into their destination modules.** Root-caused: `useExport.approve()`
      navigates to the destination product; it never publishes an item into that
      product's queue. This is not a bug with a quick fix — it needs a new
      cross-module publish surface and likely a new event type, which is a
      governance decision. **Do not attempt to demonstrate a live SCRIBE export
      landing in NEXUS or ARIA.** Screen 3 and Screen 5 are both restructured
      below to work around this permanently.

### Still to confirm before this script is final

- [ ] `[REHEARSAL]` **Screen 2 — confirm whether a live control exists** to attempt
      a higher-classification action and show the refusal. Not found in the last
      pass. If none exists, soften the deck's promise before sending it.
- [ ] `[REHEARSAL]` **Screen 7 — complete the live beat.** Trigger a real action,
      confirm the running total moves, confirm the per-product breakdown renders.
      Not completed in the last rehearsal.
- [ ] `[REHEARSAL]` **Screen 8 — walk it at least once.** Not attempted in the
      last rehearsal.
- [ ] Fresh browser session, no rehearsal residue, Cost Dashboard total at zero.
- [ ] Persona sequence rehearsed in order (below) — the sequence changed since the
      last version.

---

## The persona sequence — changed since the last version

**Rule unchanged: never return to a screen after leaving its persona.** Persona
switches silently reset other screens' in-session state.

| Screen | Persona | Switch |
|---|---|---|
| 1 — Home Dashboard | Program Manager | — |
| 2 — Classification boundary | Program Manager | No |
| 3a — Draft & certify | Analyst → Compliance Officer | Yes, twice |
| 3b — Trace | **Program Manager** | **Yes — TRACER is gated here, not to Compliance Officer or Analyst** |
| 4 — Reliability evidence | Program Manager | **No — already there from 3b** |
| 5 — Time & Travel | Program Manager | No |
| 6 — PPBE / ARC | Analyst | Yes |
| 7 — Cost & Operations | System Admin or Platform Admin | Yes |
| 8 — Intelligence Layer | Any | No |

**One efficiency worth knowing:** switching back to Program Manager to trace in
3b lands you exactly where Screen 4 needs you to be. The trace and the reliability
evidence flow together without an extra switch.

**Nine roles exist in the platform** (`SovereignRole`): Program Manager, Analyst,
Compliance Officer, Agent Operator, Independent Reviewer, System Admin, Read Only,
Platform Admin, Supervisor. This demonstration deliberately exercises four. Say so
if asked rather than implying four is the whole taxonomy.

---

## Opening remarks — before Screen 1

**Say:** "Before I show you anything, two things I'd rather say than have you
find.

SOVEREIGN is a governed application architecture, not a control plane. The
controls I'm about to show you sit in the code path rather than in a procedure —
which makes them real. But there is no runtime boundary here that would stop a
developer who deliberately wrote around the shared client. That discipline is
held by architecture and code review today.

And single sign-on is not connected. The platform runs on a seeded development
user. The authorisation model you'll see is real and exercised; the identity
feeding it isn't yet coming from an identity provider."

**Then:** "Everything you'll see is running code against synthetic data. No
mockups, no screenshots."

---

## Screen 1 — Home Dashboard

**Persona:** Program Manager.

**Say:** "This is what a program manager opens first. Every figure here is
computed live, as you watch."

**Do:** Point to Program Health, Dependency Health, Learning Velocity. Click into
one program tile — point of contact, per-tile variance, now properly formatted
currency.

**The program-count disclosure — spoken, not on screen, by decision.** **Say,
while the count is visible:** "You'll see three different program counts in this
platform — five here, seventeen in the portfolio view, eighteen in scenario
analysis. Each is correct for what it enumerates: five programs counted once, a
separate governance dataset of seventeen, and those same five programs across
four fiscal years. The datasets aren't cross-referenced yet, and merging them
needs a program manager who knows which record maps to which."

**Then, the correction — still the strongest single moment in the demonstration.**

**Say:** "This exact screen was wrong last week. A program obligated at 104% of
its ceiling was publishing 'On Track' right here, while the platform's own ledger
monitor — a separate, deterministic, rule-based agent — had already flagged that
same program priority one for exceeding its ceiling. Our alerting and our
dashboard disagreed with each other.

We found it because we'd just fixed the same class of error one level down — a
site at 135% also showing 'On track' — and went looking for the same root cause
elsewhere rather than closing the ticket. Both had the same shape: a status
function with a lower bound and no upper bound."

**Watch for:** the flagged-program count reads 2, not 1.

**If asked what the two leading-indicator boxes (Dependency Health, Learning
Velocity) drill into:** "Those are internal indicators the platform tracks about
its own operation — real, computed, no drill-through built yet. Both feed a
synthesis layer that's registered but not built."

---

## Screen 2 — The classification boundary

**Persona:** Program Manager, no switch.

**Say:** "This platform is authorised for unclassified data only — enforced in
one shared client every external call routes through. `selectProvider()` throws
before provider selection happens for anything marked CUI, SECRET or TOP SECRET."

**Do:** Point to the banner — it now says this directly. **The wording you say and
the wording on screen now match**, which is worth noting if a technical evaluator
is reading along: "That's not paraphrase — that's the platform's own text."

`[REHEARSAL]` **If a live control exists** to attempt a higher-classification
action, use it here: attempt it, show the block and the log entry. **If none
exists, do not promise one** — describe the boundary as shown on screen instead,
and flag this to whoever owns the Read-Ahead deck before it's sent.

**Say, and do not soften this — the qualifier that matters:** "The classification
label is supplied by the caller. A request *marked* above unclassified is refused
before any model call. But nothing inspects content — if someone pasted sensitive
material into a field marked unclassified, this platform would process it. This
is an authorisation and routing control, not data-loss prevention."

---

## Screen 3a — Draft and certify

**Persona:** Analyst, then Compliance Officer.

**Do:** In SCRIBE, open Rule Change Proposal, enter a change, generate the draft.
Click **Approve & export to ARIA.**

**Say, plainly, right after clicking — this is a disclosure, not an apology:**
"What just happened is worth being precise about. That click validated the draft
against ARIA's schema and navigated me to ARIA. It did not put anything into
ARIA's certification queue — SCRIBE's drafting modes route you to the destination
product today; they don't yet publish an item into it. That's a known,
disclosed gap, not something we're hiding, and it needs a real design decision
before it's built, which is why we haven't rushed a fix four days before showing
you this."

**Do:** Switch to Compliance Officer. Open ARIA's CLEAR queue — a document is
already there (Q3 Obligation Summary or FY 2027 Congressional Justification,
whichever renders "Deviations found"). **Say:** "This one's already governed and
waiting — let's certify it." Walk the findings — each cites the exact rule, the
actual value, the threshold. Certify or flag with a decision note.

**Say:** "No model makes this decision. ARIA applies fixed rules to fixed inputs.
A named person signs."

---

## Screen 3b — Trace

**Persona switch: back to Program Manager.** TRACER is gated here, not to
Compliance Officer or Analyst.

**Open ARIA → TRACER.** Two things to show, in order.

**First, a complete chain — trace a SCRIBE Document** (the FY 2026 O&M Budget
Exhibit). **Say:** "This shows the document, the drafting step — including which
agent wrote it and when — the source data it drew from, and its lineage back
through the obligation record. Every link is a citation to an existing record;
TRACER doesn't analyse or infer, it assembles."

**Then, the orphan — trace a Decision Record that has no governing regulation
cited.** **Say, and be precise about what this is:** "One honest note on what
you're about to see. The decision records TRACER traces are seeded provenance
built to exercise this tool — like everything else on this platform, they're
synthetic, not live COUNSEL records. What's real is the mechanism: watch what
happens when a chain is genuinely incomplete." Show the amber "No traceable
source" nodes and the banner: "TRACER does not fill the gap or treat the chain as
complete."

**Say:** "That's a real gap in our own data model — COUNSEL decision records
don't carry a regulation basis yet. The tool could have hidden it. It shows you
the hole instead."

---

## Screen 4 — Reliability evidence

**Persona:** Program Manager — already there from 3b, no switch.

**Say:** "We don't claim this platform is reliable — here's how we know, and it
includes our own mistakes."

1. **The 51-screen audit** — zero MAJOR or BROKEN findings. **Say what that's
   worth:** "A point-in-time result, not a permanent property. Real defects
   surfaced through ordinary use two days after that audit rated the same
   screens clean."
2. **2,254 tests**, no CI, no coverage measurement — discipline rather than
   automation, both true.
3. **Four documented self-corrections, plus two more found last week.** Name
   all four briefly, then: "The two obligation-threshold errors I showed you on
   the home dashboard are the two most recent, and they're the same class."
4. **The WH-43 parity check, demonstrated live.** Open NEXUS's Travel & Time
   Queue, count actionable items. Open the Reviewer's Workspace NEXUS Travel
   panel — same count, same items. "This check used to fail for eight days. It's
   fixed, and there's now permanent automated coverage on five of seven review
   screens."

**Optional, if time allows — the strongest possible version of this beat:**
decide one item from the Workspace, then open NEXUS and show it's gone from
both. Confirms the two surfaces are the same governed component, not two views
that happen to agree. Untested live — confirm in rehearsal before promising it.

---

## Screen 5 — SCRIBE's compliance-notice flow

**Persona:** Program Manager, no switch. **This replaces the original
Correspondence Draft beat, which depends on the export path confirmed broken in
F-25.**

**Do:** Open SCRIBE → Time & Travel Review. **Point to the banner above the
tabs first:** "This disclosure is app-wide now — everything in SCRIBE carries it,
including what I'm about to show you."

**Show the queue** — a time record flagged `MISSING_HOURS`, third occurrence,
with a pre-populated notice citing the specific dates and the policy threshold.

**Say:** "This is real compliance analysis grounded in specific facts, not a
generic warning. And it's queued — 'Awaiting VIGIL authorization.' The AI
generated this. It doesn't send until a person authorises it."

**Say, precisely — this replaced a claim that used to overreach:** "This is
read-before-sending, not yet edit-in-place. A reviewer who wants to change the
wording copies it out today; real inline editing is on the roadmap."

**Optional, if time allows:** switch to a second flagged record with a different
severity (`PATTERN_DRIFT`, informational) and show the tone shift — formal
compliance language for the warning, casual "just checking in" for the
informational flag. **Say:** "The tone changes with the finding, not just the
content."

**Then:** open NEXUS's Travel & Time Queue and show correspondence-sent status on
the matching records. **Say:** "Two modules, one governed status, and you saw the
AI's work stay advisory the whole way through."

---

## Screen 6 — PPBE / ARC

**Persona:** Analyst.

**Do:** Open **ARIA Suite → ARC.** Select **ALPHA** — real seeded exhibit, CLEAR
certified, POC named.

**Say the banner's own words rather than paraphrase:** "This does not predict
regulatory outcomes or make adaptation decisions — those remain human judgment
calls informed by this model."

**Do — the strongest "not a mockup" moment in the walkthrough:** model the same
change against ALPHA twice — once **Substantive**, once **Clarifying**. Show both
results side by side. Every severity tier drops exactly one level between the
two runs. **Say:** "Same program, same regulation, different input — a real
function computing differently, not a canned response."

**Do:** select **BRAVO, CHARLIE, or DELTA** — confirm the honest "no seeded
exhibit" disclosure. `[REHEARSAL — re-confirm]`

**If the routing buttons ("Route to COUNSEL," "Route to NEXUS") are clicked:**
they carry their own disclosure — routing is manual in this build, a human
completes the hand-off. **Say, if it comes up:** "That's the honest twin of what
I told you in Screen 3 — this one discloses its own limit on screen; SCRIBE's
export gap needed us to say it."

**If asked what "VRS" stands for:** "We don't have a spelled-out expansion in
the repository — it's shorthand for the certification-gate system, not a formal
acronym we've documented."

---

## Screen 7 — What the AI costs

**Persona:** System Admin or Platform Admin.

`[REHEARSAL — complete before treating this screen as ready]` The live beat
below was not completed in the last rehearsal pass.

**Say:** "Every enterprise AI conversation reaches the same question — what is
this costing, and can you see it? Most platforms can't answer in real time. This
one can."

**Do:** Trigger one real action. Open Reviewer's Workspace → Cost Dashboard.
Show the running total move, the per-product breakdown, the failed-call spend by
category.

**The banner is now readable.** Plain English leads; the full technical detail —
hook names, exclusions, event-type specifics — sits behind a "Technical
references" toggle, same pattern as TRACER. **Say:** "Fourteen sites are
tracked. A few are deliberately excluded — some never call a model, three make
live calls we haven't wired into this view yet. That's disclosed, not hidden."
Open the toggle only for a technical evaluator who wants the detail.

**Say, and hold this distinction:** "This is *measured*, not *governed*. No
budget, no cap, no automatic routing to a cheaper model. Governing cost is a
later phase."

**Say, on scope:** "This resets when the session ends — not yet a permanent
record. Persistence arrives with the data layer that's specified and not yet
built."

---

## Screen 8 — The layer we have not built

**Persona:** any.

`[REHEARSAL — walk at least once before treating this screen as ready]` Not
attempted in the last rehearsal.

**Say:** "Everything you've seen collects a record of decisions. Turning that
record into analysis is the next layer, and it doesn't exist. We'd rather name
it than imply it's there."

**Optional, for a technical evaluator:** "There's a field reserved in the data
model for its output today, deliberately left unpopulated — populating it now
would mean fabricating the thing this layer is supposed to compute."

**Name STRATA alongside it:** "An organisation-scoped data substrate underneath.
Specified, governance-approved, zero code written. Same disclosure."

---

## Closing the room

**Say:** "The accountability questions don't change in an AI-enabled
organisation — who decided, on what basis, who had authority. An inspector
general asks those the same way they always have. What changes is how hard the
answers are to produce, because more hands touch the work and some of them
aren't people. This is one option for keeping the answers producible. We're not
claiming it's the only one. We'd rather show you where our own chain is
incomplete than pretend it isn't."

**The ask:** "We're asking for your technical judgement on whether the approach
is sound — not a readiness or accreditation call, just whether the premise and
direction justify continued development. The most useful thing you can give us
is the objection we haven't thought of."

**Offer the repository.** Time-boxed read-only access. A clone, an install, the
test commands — no credential required, none in the repository. History intact,
corrections and all.

---

## Q&A quick reference

### Never say — corrected forms on the right

| Do not say | Say instead |
|---|---|
| ARIA "decides compliance questions" | ARIA applies compliance rules; no AI in the decision path |
| CPMI "checks the AI's reasoning" | CPMI makes AI reasoning traceable and reviewable |
| "Nothing runs until someone approves it" | An AI's work stays advice until a person signs; AI may analyse and draft freely |
| "Permanent, tamper-evident record" | Append-only, hash-chained — tamper *evidence*, not prevention |
| "The platform refuses anything above unclassified" | A request *marked* above unclassified is refused. The label is trusted; content is not inspected — this is now the banner's own wording |
| "A model hash mismatch raises a priority-one alert" | It blocks inference and is recorded. Alert dispatch is unbuilt, authorised scope |
| "One shared rule with no divergent copy" | Every external call routes through one shared client; four modules each render their own banner text — say the enforcement claim, not the banner-uniformity claim |
| "SCRIBE exports connect end to end" | SCRIBE's drafting modes navigate to the destination product; publishing into its queue is a known, disclosed gap requiring a design decision |
| "This traces a real COUNSEL decision" | TRACER's decision records are seeded provenance built to exercise the tool, same synthetic-data posture as the rest of the platform |

### "How is this different from Palantir Foundry?"

A different category of thing — a specific set of already-built governed
applications, with a data layer being added underneath, and no visual builder
because nothing here is meant to be assembled by someone who isn't engineering
it.

### "What model governance do you have?"

One primary provider; a second, local provider is built and tested, routing by
classification, unreachable today because the operating boundary is
unclassified-only. Model weights SHA-256 verified at load; a mismatch blocks
inference and is recorded. Any model update re-runs all four certification gates,
no expedited path. Changing providers is a governance decision, not a config
edit — even though technically it's a config edit, because every call goes
through one client.

**Volunteer the asymmetry:** model governance is strongest for the provider
that's switched off. The commercial provider in active use has no equivalent
registry entry yet.

### The four categories where the honest answer is "we don't have that"

Quantified business case. Build-versus-buy evaluation. Competitive analysis.
Integration and exit path. **The framing to hold:** a precisely named gap costs
less than a confident answer that doesn't survive the follow-up question.

### If asked about the organisation this assumes

"SOVEREIGN doesn't replace your system of record. It governs the drafting,
certification and decision trail around it — which means a compliance officer
works inside the production path instead of reviewing exports after the fact.
That's a real workflow change, not just a tool, and we haven't piloted it."

### If asked about dependencies or vulnerabilities

Zero new production dependencies since June, confirmed at every session close.
Five `npm audit` findings — one moderate, four high — all in development
tooling, none on the runtime surface, unremediated and disclosed as such.

---

*SOVEREIGN Platform — CTO Demonstration Script · Consolidated · August 17, 2026*
*Governance Agent · Supersedes the August 16, 2026 consolidated script*
*Reflects Session 116 (nine rehearsal fixes) and Session 117 (SCRIBE AI disclosure)*
*Two items remain `[REHEARSAL]` — see Pre-demo checklist*
*Pre-Decisional · Internal Working Document*

# docs/26 — Portfolio/Program/Project Execution Monitoring: Target State and the Analyst/PM Workday Principle
## A Design Philosophy for SOVEREIGN, Broader Than Any Single Screen

**Prepared by:** Governance Agent, July 21, 2026, from a working session with the Project Principal
**Status:** Pre-Decisional · Internal Working Document — **a design authority, not a build spec.**
Read this before scoping any real data integration or redesigning any monitoring/reporting screen.
**Revision note:** this supersedes the version of `docs/26` produced earlier the same evening.
The Project Principal's direct follow-up substantially broadened the scope — the first draft
undersold the actual goal by describing it as an accounting-data problem. It is not. Revising in
place rather than leaving two versions of a same-night document in circulation.
**Origin:** stated directly by the Project Principal while reviewing APEX's synthetic charts during
Walkthrough G — recognized as applying more broadly than that one review, recorded here rather than
left in a chat transcript, following the same discipline `docs/22` established for exactly this
situation.

---

## 1 — The goal, restated and broadened

The first draft of this document described the target as "Execution Monitoring running on real
accounting-system data." **That's one input among several, not the whole goal.** The actual target,
stated directly: complete monitoring of **portfolio, program, and project execution** — obligations
and budget execution, yes, but also milestones, deliverables, schedules, dependencies, and risk
registers. All of it, for all three levels of the hierarchy, not one flat list of programs.

Portfolio, program, and project are genuinely different scopes, not the same view at a different
zoom level. A portfolio view answers "how is the whole book of work doing." A program view answers
"how is this program doing." A project view answers "how is this specific piece of delivery doing,
right now, in detail." Execution needs monitoring at all three — this is very likely **multiple
dashboards, not one**, and that's the right shape, not a compromise the platform failed to avoid.

Tonight's APEX Execution Monitoring screen is real progress and sits roughly at the program level.
It is one useful piece of a considerably larger picture, not a preview of the whole thing with the
data source swapped out later.

---

## 2 — The reference class: Tableau, Power BI, Primavera

Named directly as reference points, and worth recording precisely because of what each implies:

- **Tableau / Power BI** — general business-intelligence-grade dashboarding: real cross-filtering,
  drill-down, and visual analysis, not static charts. This is the *quality bar* for the visualization
  layer, not a suggestion to hand data off to either tool.
- **Primavera** — enterprise schedule and portfolio management: dependency networks, critical path,
  resource loading, risk-adjusted schedules. This names a level of *scheduling and dependency*
  sophistication SOVEREIGN doesn't currently have anywhere in the platform. Worth being honest about
  the gap: nothing built so far models a dependency network or critical path — `WorkQueueSurface` and
  `ProgramStatusSurface` are status snapshots, not schedule engines.

**The explicit architectural constraint, stated directly: "the data, analysis, and visualization are
all found within SOVEREIGN."** This is not a request to integrate Tableau, Power BI, or Primavera —
it's a statement that SOVEREIGN needs to build this class of capability natively. Worth naming as a
real boundary decision, not a detail: no external BI or scheduling tool is being brought into the
platform. Everything stays inside SOVEREIGN's own architecture, governance, and audit trail.

---

## 3 — Primary audience: Analyst and Program Manager, specifically

While every SOVEREIGN role may touch execution monitoring in some capacity, the Project Principal
named **Analyst and Program Manager** specifically as the core users of this dashboarding need — the
two roles that already carry Program Health / Flagged Programs visibility on Home (§`PROGRAM_DATA_ROLES`
in `PlatformHome.tsx`) and that already have the deepest APEX access under the Role Access Matrix.

For reference, the role screenshot attached alongside this discussion shows seven of the platform's
eight roles (Platform Admin, System Admin, Program Manager, Analyst, Compliance Officer, Agent
Operator, Independent Reviewer) — Read Only is the eighth, per the Role Access Matrix, and is very
likely just below the visible crop rather than missing from the dropdown itself; worth a quick live
check if it matters for this specific screen's scoping, not assumed either way here.

---

## 4 — "Doesn't need all the data, just needs to link to detail" — this is already a pattern SOVEREIGN has built

This requirement — dashboards can show reporting-level stats without holding everything, as long as
they link down to lower-level detail — is not a new idea for this platform. It is `docs/22`'s
curated-context principle, restated for a reporting screen instead of a decision screen, and **the
mechanism to make the links real already exists**: `navigateToModule` (GD-27, Door 1 of `docs/22`'s
three doors), built specifically so one part of the platform can open another with real, targeted
state already loaded, not a generic landing page.

This meaningfully reduces the apparent size of the ask. The platform doesn't need a new
cross-module linking primitive invented for portfolio/program/project dashboards — it needs the
existing one applied to a new set of destinations (detailed schedule records, risk register entries,
deliverable tracking — wherever those end up actually living once real data sources are chosen).

---

## 5 — The real engineering challenge, named directly

*"One of the significant challenges of putting SOVEREIGN together is to have all this info
available, but accessing, processing, and using are all reliable, efficient, and secure."*

This is the actual center of gravity for this whole effort, not a footnote. Naming it plainly:
reliability, efficiency, and security of access, processing, and use — for portfolio, program, and
project data pulled from real external systems — at real scale, for real users, doing real work.

This is not a new kind of problem for SOVEREIGN. The platform already has real discipline built for
exactly this shape of challenge:
- **GD-10's classification boundary** — UNCLASSIFIED only, enforced structurally, not by policy alone.
- **The Logger audit trail** — every consequential action already gets a permanent, attributable record.
- **Role-based access control**, including the union-plus-per-tab gating pattern (`docs/AGENT_REFERENCE.md`,
  "Known Codebase Facts") built for exactly the situation of one screen serving multiple roles with
  different real access needs.
- **The curated-context principle** (§4, above) — small, deliberately-chosen slices of data, not
  "relocate everything into one place."

**What's genuinely new is the scale, not the discipline.** More external data sources, more roles
touching more information, a materially larger surface for something to go quietly wrong. The
existing discipline is the right toolkit — but it shouldn't be assumed to scale for free just
because it's worked at the size the platform has been built at so far. Worth real, explicit scrutiny
at each new data source added, not an assumption that the pattern automatically holds.

---

## 6 — What this document does NOT decide

Genuinely open, roughly in order of how foundational they are:

1. **Which real external systems, beyond an accounting system, actually exist to connect to** — a
   scheduling system, a risk-register system, a deliverables-tracking system? Named as categories of
   data here, not named systems. This changes everything downstream, the same way "which accounting
   system" did in the first draft.
2. **How many distinct dashboards, at which scopes, owned by which module(s).** Is this a new module,
   an extension of APEX, or a new tab set across several? Not decided here.
3. **Whether — and how — a schedule/dependency engine (the Primavera-shaped gap, §2) gets built at
   all**, and if so, at what scope. This is a materially larger build than anything in `WorkQueueSurface`
   or `ProgramStatusSurface` and deserves its own real scoping conversation, not a line item folded
   into an existing surface's next revision.
4. **The GD-10 classification boundary, re-checked per data source, not inherited by default.**
   Budget execution data, schedule data, and risk-register data may carry different real sensitivity
   even within the same UNCLASSIFIED envelope — worth checking each, not assuming the first answer
   covers all of them.
5. **How the Analyst/PM workday principle (this document's core idea) gets tested concretely** —
   `docs/22` has a stated feedback signal for its own materiality test (§3, "go deeper" click-through
   rate). This principle deserves an equivalent measure, not left as an unmeasurable standard.

---

## 7 — What this means for any future execution-monitoring or PPBE data work

Before building or redesigning any APEX/PPBE screen, or scoping any real data integration:

1. Is the change being evaluated against the real target (portfolio/program/project execution,
   multiple real data sources, BI-grade analysis, all native to SOVEREIGN) — or against tonight's
   synthetic demo as if it were the finished product?
2. Does the change pass the Analyst/PM workday test (§5 of the prior draft's principle, restated
   here) — could a real Analyst or Program Manager do real work from this screen, linking to detail
   only when they actually need it, rather than reconstructing context elsewhere?
3. Is a new data-model or dashboard decision being scoped as part of the larger real-data-sources
   question (§6.1-6.2), or in isolation in a way that will need reconciling later?
4. Has the GD-10 classification boundary been explicitly re-checked for this specific data source —
   not assumed inherited from whatever the last data source's answer was?
5. If drill-down/linking is involved, is it using the existing `navigateToModule` primitive (§4)
   rather than inventing a parallel mechanism?

---

*docs/26 — Portfolio/Program/Project Execution Monitoring: Target State and the Analyst/PM Workday Principle*
*July 21, 2026 · Pre-Decisional · Internal Working Document · Revised same session*
*Read before scoping any real data integration or redesigning any monitoring/reporting screen*

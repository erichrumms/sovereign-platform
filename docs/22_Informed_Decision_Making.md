# docs/22 — Informed Decision-Making in an AI-Enabled Organization
## A Design Philosophy for SOVEREIGN, Broader Than Any Single Feature

**Prepared by:** Governance Agent, July 20, 2026, from a working session with the Project Principal
**Status:** Pre-Decisional · Internal Working Document — **a design authority, cited by future
work, not a build spec.** Read this before building or redesigning any decision-facing screen.
**Origin:** developed while scoping the Reviewer's Workspace concept, but recognized mid-conversation
as applying more broadly than that one feature — recorded here rather than buried inside a single
feature's spec.
**Updated July 24, 2026:** one addition to §10 — the EG-E cross-reference from `docs/27`, never
actually placed here despite being recommended at the time. Nothing else in this document changed.

---

## 1 — The concept: what's actually different in an AI-enabled organization

In a pre-AI workflow, a decision-maker does the analysis themselves before deciding — reads source
documents, computes numbers, checks policy — largely sequentially, bridged by notes and memory. Where
the *approval button* lived barely mattered, because context-gathering was expensive human labor
regardless of layout.

**That premise doesn't hold on this platform, and it's the actual point of it existing.** APEX is
already computing obligation rates continuously. ARIA is already evaluating compliance rules
continuously. COUNSEL is already tracking prior positions. The context isn't waiting to be gathered —
it's already been computed, somewhere, by an agent, before a human ever looks at it. **The real
problem SOVEREIGN exists to solve isn't "help humans compute things faster" — it's "surface the right
already-computed fact at the right moment,"** which is a fundamentally different design problem than
the one pre-AI approval software was built to solve.

---

## 2 — The strategy: curated context travels; full reference material stays put

The naive answer to "decisions are scattered across modules" is to relocate everything — decisions and
their supporting reference material both — into one place. That's wrong. Reference and background
material belongs where its module already makes it authoritative and complete (APEX's full Program
Detail, ARIA's regulatory source documents, TRACER's full audit chain). Relocating it duplicates
truth and guarantees drift.

**The resolving principle: for any given decision, only a small, deliberately-chosen slice of context
would actually change what a good decision looks like. That slice travels to the decision. Everything
else stays exactly where it lives, genuinely one click away.**

**This is not new, untested thinking — it's already been built once, proven, without either the
Project Principal or the Governance Agent naming it this at the time.** `ProgramStatusSurface`
(GD-23) is exactly this pattern in miniature. VIGIL's obligation approval didn't need APEX's entire
Program Detail — objectives, milestones, full risk register, governance history. It needed one
curated fact: obligation percentage and status. That's what got built. APEX's full detail is
untouched, still one click away, for the real minority of cases that need it.

**Separation between decision screens and full reference material is therefore not a flaw to design
around — it's correct, conditional on the curated slice being genuinely well-chosen.** The actual
failure mode is a decision screen with *no* curated context, forcing a reviewer to decide blind or go
hunting — exactly what VIGIL's obligation brief did before GD-23 fixed it.

---

## 3 — Infrastructure capability 1: the materiality test

**What enables this is a governed decision process, not new technology.** For each decision type,
someone must actually ask *"what fact, if missing, would change this decision?"* — and be equally
disciplined about what does not pass that bar. This is the same rigor `AGENT_REFERENCE`'s Committee
Review Standard already demands for code (*Finding, Evidence, Constraints, Options Considered,
Recommended Resolution, Justification*) — worth pointing at this exact question, not left as
instinct.

**Two things this needs that don't exist yet:**
1. **A named owner and a documented result, per decision type** — the same way `docs/20` recorded
   *why* `ProgramStatusSurface` took its exact shape, not just that it did.
2. **A feedback signal that tells you when the materiality test was wrong.** Instrument the "go
   deeper" link's click-through rate (§5). Reviewers routinely clicking past a curated summary into
   full detail for a given decision type is not a UX nuisance — it's the materiality test failing in
   practice, and a concrete, measurable signal rather than a guess.

---

## 4 — Infrastructure capability 2: generalizing the curated-context-surface pattern

**What's proven:** the shape works, four times tonight — `TaskSurface`, `AriaCertificationSurface`,
`ProgramStatusSurface`, `WorkQueueSurface`.

**What doesn't scale as-is:** each required its own full governance decision, shell-contract version
bump, and SHA re-verification cycle. Right for four surfaces built deliberately over one evening;
very likely wrong ceremony for a workspace concept that could eventually want a dozen curated-context
relationships.

**The real, still-open infrastructure question:** does every new curated-context relationship stay
its own explicit, typed shell export (safe, proven, matches everything built tonight, doesn't scale
past a handful) — or does this graduate into a single, more general, parameterized "Decision Context
Surface" registration mechanism, built once under one real governance decision, after which a new
decision type's curated context registers without touching the frozen shell-contract each time?

**Not decided here, deliberately.** Recorded as the clearest open infrastructure question this
concept surfaces, worth its own real decision when the Workspace's actual scope is known — not
inertia carrying tonight's pattern forward past where it still fits.

---

## 5 — Infrastructure capability 3: three doors, not one — and they answer three different needs

**Door 1 — more data.** Confirmed, by direct source read, that this does not exist yet anywhere in
the platform: `sovereign-shell/src/main.tsx`'s `loader.mount(m.moduleId, el)` takes exactly two
arguments — no initial-state or deep-link parameter. Every module opens cold, at its own default
screen, always. This is architecturally different from every surface built tonight — those all share
*data*; this needs to share *navigation intent* (open APEX, with program P-100 already selected, on
the Program Detail tab). APEX's own `selectedProgram` state (reused for chart drill-through, Session
46) is already a working example of exactly this pattern — just local to APEX, with nothing outside
it able to trigger it. The infrastructure gap is extending this capability across the module
boundary, not inventing the pattern.

**Door 2 — more understanding.** Not a gap — already built. LENS (`GovernanceExplainer.tsx`,
`useExplanation.ts`) exists specifically to answer *"what does this actually mean, and what's the
normal range here."* The still-open WF-27 idea (disambiguating VIGIL's two different P-number scales
via a contextual "?" affordance) was already a small instance of this exact door — this generalizes it
into the platform's standard answer, not a new mechanism.

**Door 3 — more precedent.** *"How was a similar case decided before"* is disproportionately valuable
to the reviewers who most need support, and it's buildable from parts that already exist: ARIA's
TRACER (traces full authority chains) and COUNSEL's Prior Position Reconciliation (GD-3, built
specifically to catch conflicts with previously recorded decisions).

---

## 6 — Infrastructure capability 4: honest disclosure, and a proposed extension to the audit trail

The reusable "curated, not full" badge extends the same visual convention as every STATIC badge built
tonight — no new architecture, a shared component.

**The genuinely new idea:** every real decision already produces an auditable `HUMAN_DECISION` Logger
event — foundational, not new. **Propose that event also record whether the reviewer clicked "go
deeper" before deciding** — not as a restriction on deciding from the curated view alone, but as
honest institutional memory. Six months later, *"was this decision made with full context or just the
curated summary"* becomes an answerable question instead of a guess. The same signal serves two
purposes: tuning what's material (§3) and giving every decision a more honest audit trail.

---

## 7 — Role versus expertise: two different axes, not one

**Role answers what a person is allowed to decide** — already solved by the live access matrix
(GD-22). **Expertise answers how much support a person needs to decide well** — a spectrum, not a
list, cutting across every role equally. A senior Compliance Officer and a senior Program Manager
want the same thing (speed, minimal friction, trust in their own judgment); a new hire in either role
wants the same other thing (orientation, confidence, precedent). Conflating these two axes is a real
design mistake, not a simplification.

**The trap to explicitly avoid:** building a "simple mode" and a "power mode" per decision type is the
same divergent-duplicate failure Constraint #2 already warns against at the code level, recreated at
the human-experience level — multiplied across twelve to fifteen decision types, guaranteed to drift.
**The goal is one screen per decision type that works across the whole spectrum, not N screens for N
experience levels.**

**The actual mechanism is the three doors (§5), used self-directedly.** A senior reviewer mostly
ignores all three. A new hire leans on them constantly. Same screen, same curated context, radically
different usage pattern — nobody sorted into a bucket to get there.

**The platform should never try to infer someone's experience level and adjust the screen for them.**
Skill isn't binary, it changes over time, and silently inferring "you're junior, here's the simplified
view" is both patronizing and fragile to detect algorithmically. The right move is the opposite: make
all three doors cheap, always available, entirely self-directed, and let usage patterns differ
naturally.

---

## 8 — This was already anticipated, just never built

`lens-orientation`'s own registry entry in `Agent_Identity_Standard.md`, written well before tonight's
conversation, states this almost verbatim: *"Orientation completion events feed the Intelligence
Layer's Judgment Detection calibration. A decision made by a user who has completed the orientation
track for their role is interpreted with that capability context."* SOVEREIGN's own architecture
already expected this question — a future layer that knows who's completed orientation and weighs
decisions accordingly. Not built (the Intelligence Layer is explicitly *"planned, not built,"*
platform-wide) — but the hook already exists. A decision-facing workspace built around progressive
disclosure (§5, §7) would be a natural first real consumer of it, not a competing idea grafted on
afterward.

---

## 9 — What this means for any future decision-facing feature, stated as a checklist

Before building or redesigning any screen where a human makes a real decision:

1. Has the materiality test (§3) actually been done for this decision type, on the record — not
   assumed?
2. Does the curated context reuse an existing surface, or does it need a real, deliberate decision
   about a new one (§4)?
3. Are all three doors (§5) available, none of them gated by role or inferred experience?
4. Does the decision event honestly record whether "go deeper" was used (§6)?
5. Is there exactly one version of this screen — not a simplified one and a power-user one?

---

## 10 — Status and open questions, not resolved by this document

- **The narrow-vs-general question (§4)** — real, unresolved, deliberately deferred until the
  Workspace's actual scope is known.
- **The cross-module navigation primitive (§5, Door 1)** — this shipped since this document was
  written (`navigateToModule`, GD-27, Session 53) — no longer an open gap. Recorded here as
  history, not left as a stale claim.
- **Whether/how to extend `HUMAN_DECISION` events with a "context depth" field (§6)** — a real,
  concrete proposal, not yet a governance decision.
- **Whether the materiality test (§3) extends to pure reporting/dashboard screens, not just
  decision-facing ones with an explicit approve/reject action** — raised by `docs/27`'s external
  review (EG-E), which argues that highlighting itself is a form of intervention (allocating
  attention is not neutral). Not resolved here — this document's original scope was decision
  screens specifically. Added to this list July 24, 2026 — the propagation this needed was
  recommended when `docs/27` was written but never actually carried out until now.
- **This document's relationship to the eventual Reviewer's Workspace spec:** the Workspace shipped
  (GD-25 through GD-27) and now has a real Activity/Decision History tab too (GD-28, Session 58) —
  this remains the design authority both should be read against, not restated by either.

---

*docs/22 — Informed Decision-Making in an AI-Enabled Organization · July 20, 2026*
*Updated July 24, 2026 — §10 EG-E cross-reference added*
*Pre-Decisional · Internal Working Document*
*Read before building or redesigning any decision-facing feature*

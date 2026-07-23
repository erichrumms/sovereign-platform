# docs/27 — Execution Governance: An External Critique Against SOVEREIGN's Actual Mechanisms

**Prepared by:** Governance Agent, July 21, 2026, from a working session with the Project Principal
**Status:** Pre-Decisional · Internal Working Document — pairs an outside document's questions
against verified code, not a build spec.
**Origin:** `SOVEREIGN Execution Governance Provocations.md`, provided by the Project Principal — a
deliberately unresolved set of governance questions about the execution-management layer of
AI-enabled platforms generally. This document is the direct response: for each question, what
SOVEREIGN has actually built, verified against the real repository rather than assumed, and what's
genuinely still open.

**How this differs from `docs/22` and `docs/26`:** those two are forward-looking design philosophy.
This one is closer to an audit — checking whether SOVEREIGN's existing execution-governance
architecture (VIGIL's approval queue, AgentOS orchestration, the risk-tier system) actually does what
good governance would require, with citations, not assumptions.

---

## 1 — The governance axis: object type or blast radius? (§1 of the source document)

**The question:** should governance be organized around what kind of thing an action touches
(risk, milestone, issue), or around how reversible it is and how large its blast radius is?

**SOVEREIGN's actual answer: both, running in parallel, without anywhere saying so.** Agent Class
(Analytical / Operational / Governance / Monitoring / Orchestration, per `Agent_Identity_Standard.md`)
is object/role-type-based. Independently, VIGIL's `risk_classification` field (`P1` | `P2` | `P3`,
`module-vigil/src/approval-contract.ts`) is a real, working blast-radius axis — confirmed live in
tonight's Reviewer's Workspace walkthrough: P1 covered a model deployment and a $75,000 obligation,
P2 covered a data export and an external communication, P3 covered a threshold change.

**The real gap, confirmed by direct trace:** nothing documents *how* something becomes a P1 versus a
P3. The values are hardcoded at each call site — e.g. `risk_classification: "P1"` written directly
into `ppbe-authorization.ts` — not derived from any stated rubric. This document's opening question
isn't hypothetical for SOVEREIGN; the mechanism already exists and is already load-bearing, but the
principle behind it has never been written down. **(EG-A, open governance question.)**

---

## 2 — The autonomy gradient (§2 of the source document)

**The question:** does trust in the system get earned per action category, and does autonomy expand
automatically or only by affirmative grant?

**SOVEREIGN's actual answer: the maximally conservative end of the spectrum, and not by design
discussion — by default.** No agent's permitted actions have ever been observed to expand based on
track record. Every agent's scope is fixed at registration in `Agent_Identity_Standard.md` and only
changes via a new Governance Decision. This fully avoids the "autonomy drifts past what anyone
intended" failure mode the source document names — but it hasn't actually engaged the question of
whether track record *should* ever earn expanded autonomy. It's simply never come up.

**Worth being precise about one thing that could be mistaken for an earned gradient and isn't:**
CPMI's reasoning chain auto-issues Gate 1–2 records and requires human attestation for Gate 3–4
(`Agent_Identity_Standard.md`, CPMI Agents). That's a real gradient — but it's a *designed* one, fixed
by governance decision at build time, not one that adjusts based on demonstrated reliability over
time. The source document's actual question — should trust be *earned* — remains untouched by
anything currently built. **(EG-B, open governance question.)**

---

## 3 — The silence problem (§3 of the source document) — the strongest concrete finding

**The question:** what happens to a proposed action nobody accepts, rejects, or notices — auto-expire,
auto-escalate, or persist indefinitely?

**SOVEREIGN has already built a real, working answer, and it's a clean, defensible one.**
`EXPIRY_MINUTES` (`approval-contract.ts`) ties expiry directly to risk tier — P1: 15 minutes, P2: 60,
P3: 240 — matching the deadlines observed live tonight exactly. When `expireOverdue()` runs, it logs
a permanent `AGENT_ACTION_EXPIRED` event to the audit trail and removes the item from the pending
queue. **The chosen answer is auto-expire, functioning as an implicit non-approval** — the
organization bears the cost of the action not happening, not the system generating escalation noise,
and it's fully attributable rather than silent.

**The real, concrete gap: `expireOverdue()` only runs once, on component mount** (confirmed at
`VigilApp.tsx:105`, with the comment "run once on mount" in the source itself) — not on a live timer
while the screen is open. A P1 item's entire 15-minute window can elapse while someone has VIGIL open
and idle; the on-screen countdown will correctly show it as overdue, but the formal expiry — the log
event and the queue removal — won't fire until the module is next mounted. For the tightest SLA in
the system, that's a meaningful hole in an otherwise well-designed mechanism.

**(EG-C, build finding — ready for a Build Agent session, no governance decision required first.)**
Fix: drive `expireOverdue` from a live interval rather than mount-only, or a shared clock tick that
also reaches the Reviewer's Workspace's embedded copy of the same component.

---

## 4 — Thresholds as governance decisions in disguise (§4 of the source document)

**The question:** should threshold-setting get the same scrutiny as any other execution decision, or
is it pre-governance plumbing nobody revisits?

**SOVEREIGN has a real, confirmed example of taking this seriously** — the P3 item observed live
tonight *was* a threshold change (`flowpath.vvr_threshold: 0.7 → 0.6`), routed through
`agentos.configurator` and gated by the same VIGIL approval queue as every other consequential
action, with the same audit trail. That's a genuine, working answer for at least one path.

**What's unconfirmed, not what's wrong:** whether this is the *only* path for threshold changes
platform-wide, or whether other real thresholds — CPMI's 0.7× enhanced-monitoring multiplier, ARIA's
compliance rule thresholds, the recurrence thresholds in `tt.escalation-monitor` — were set once at
build time with no equivalent governed-change mechanism at all. This needs a verification pass
(check each threshold's actual change-path in code) before it can even be posed as a clean governance
decision — the same discipline `AGENT_REFERENCE.md`'s Rule 8 already requires: trace before
diagnosing. **(EG-D, needs a verification pass, then a decision.)**

---

## 5 — Where reporting ends and execution begins (§5 of the source document)

**The question:** is highlighting itself a form of intervention — does the reporting/execution
boundary actually hold?

**`docs/22` already engages a real piece of this.** Its curated-context principle and materiality
test explicitly treat what gets surfaced to a decision-maker as consequential, not neutral, and even
proposes tracking whether a reviewer clicked "go deeper" specifically *because* curation shapes
outcomes. That's a genuine, existing answer — but it was scoped to decision-facing screens with an
explicit approve/reject/certify action attached.

**This document's sharper claim reaches further:** a narrative summary highlighting one of twelve
programs, on a pure reporting screen with no decision button at all, is still an allocation of
attention — and attention allocation isn't neutral either. Nothing in SOVEREIGN's governance corpus
has extended `docs/22`'s discipline to reporting-only screens like Home's Program Health or APEX's
Execution Monitoring charts. **(EG-E, open governance question — directly connects to tonight's
Module Orientation and Home Dashboard findings from Walkthrough G.)**

---

## 6 — Execution debt (§6 of the source document)

**The question:** should unresolved AI-initiated proposals be tracked as a first-class, running
metric?

**Not built, confirmed by direct search — but cheap to build, not new architecture.**
`WorkQueueSurface` already aggregates pending counts per module (the same surface behind Home's To
Do/Review tiles, per Walkthrough G finding WG-1). VIGIL's `AGENT_ACTION_EXPIRED` Logger event already
captures exactly the raw signal an "unresolved proposals over time" metric would need. Building this
would mean querying and trending events that already exist, not inventing new instrumentation.
**(Design recommendation, not yet decided — natural pairing with WG-1's fix, since both touch the
same publish/aggregate plumbing.)**

---

## 7 — Why this still depends on reporting (§7 of the source document)

**Already well-answered, no action needed.** TRACER exists specifically to trace any decision,
document, or obligation back to its governing source. The Logger is the backbone underneath every
consequential action already built. This is the least-contested point in the source document, and
SOVEREIGN's actual architecture already reflects it — worth affirming plainly rather than treating as
open.

---

## 8 — Consolidated Findings

| ID | Kind | What | Status |
|---|---|---|---|
| **EG-A** | Governance decision | No documented rubric for how `risk_classification` (P1/P2/P3) gets assigned — currently ad hoc per call site | Open |
| **EG-B** | Governance decision | Should agent autonomy ever expand based on demonstrated track record, or does the current static/GD-gated-only stance stay permanent policy | Open |
| **EG-C** | Build finding | VIGIL's `expireOverdue()` runs only on mount, not on a live timer — a real gap in the tightest SLA (P1, 15 min) | Ready for Build Agent |
| **EG-D** | Needs verification, then decision | Is threshold-change gating (confirmed for AgentOS-orchestration-mediated changes) actually universal, or do other thresholds bypass it entirely | Needs a code-verification pass first |
| **EG-E** | Governance decision | Does `docs/22`'s materiality test extend to pure reporting/dashboard screens, not just decision-facing ones | Open |
| — | Design recommendation | "Execution debt" as a first-class, trended metric — cheap given existing `WorkQueueSurface`/Logger plumbing | Not yet decided |

---

## 9 — Propagation Plan: Folding This Into Documents That Already Govern the Platform

A one-off chat conversation is exactly the failure mode `AGENT_REFERENCE.md`'s own Rule 4 warns
about — a real analysis that stays invisible to every other document unless someone deliberately
carries it back. Below is where each durable piece actually belongs, with exact text where the
target document's own convention makes that possible.

### 9.1 — `AGENT_REFERENCE.md`, "Known Codebase Facts" section

This section already has two entries in exactly this shape — a short paragraph pointing to a `docs/NN`
file, added on the date it was written, ending in "cite it, don't restate it." Add a third, following
the pattern precisely:

```
**Execution governance — object-type vs. blast-radius, autonomy, and the silence
problem — `docs/27`, added July 21, 2026.** Before designing any new AI-initiated
action, approval gate, or threshold, read
`docs/27_Execution_Governance_Provocations_Response.md` first. It pairs an external
governance critique against SOVEREIGN's actual, code-verified mechanisms — VIGIL's
P1/P2/P3 risk tiers and expiry windows, the AgentOS-orchestration approval gate, and
where each is real versus assumed. Confirms one real build gap (VIGIL's overdue
sweep runs only on mount, not on a live timer) and several open governance
questions, including whether risk-classification assignment follows any documented
rubric — cite it, don't restate it.
```

### 9.2 — `docs/22`, §10 ("Status and open questions, not resolved by this document")

`docs/22` already has exactly the right home for EG-E — a standing section for exactly this kind of
unresolved extension. Add a fifth bullet, matching the existing four:

```
- **Whether the materiality test (§3) extends to pure reporting/dashboard screens,
  not just decision-facing ones with an explicit approve/reject action** — raised
  by `docs/27`'s external review, which argues that highlighting itself is a form
  of intervention (allocating attention is not neutral). Not resolved here — this
  document's original scope was decision screens specifically.
```

### 9.3 — `Agent_Identity_Standard.md` — natural future home, not edited yet

If EG-A is ever resolved (a real, documented rubric for P1/P2/P3 assignment), its natural home is a
new appended section in `Agent_Identity_Standard.md`, following the document's own established
append-and-date convention — the same way the Companion Suite, VIGIL, AgentOS Orchestration, PPBE,
and Time & Travel additions were each appended in their own dated section. **Not edited now** — per
this project's own Rule 5, a placeholder describing a rubric that doesn't exist yet would itself
become exactly the kind of stale, misleading claim this project has already learned to avoid.

### 9.4 — Integration Brief, §13 (Open Governance Items)

The next real Integration Brief revision should add EG-A, EG-B, EG-D, and EG-E to its open-items
table, and EG-C to its build-scope items — ready-to-paste row text:

```
| EG-A | Undocumented risk-classification rubric (P1/P2/P3 assigned ad hoc per call site) | Needs a real decision — see docs/27 §1 |
| EG-B | Should agent autonomy ever expand based on track record | Needs a real decision — see docs/27 §2 |
| EG-D | Threshold-change gating confirmed for one path, unconfirmed platform-wide | Needs a verification pass, then a decision — see docs/27 §4 |
| EG-E | Does docs/22's materiality test extend to reporting-only screens | Needs a real decision — see docs/27 §5, docs/22 §10 |
```

**Not drafting a new Integration Brief version here** — the last real one (v1.48) was tied to an
actual multi-session build arc; inventing a new version off a single side conversation would misstate
the document's real cadence. This row text is ready whenever the next real revision happens.

---

*docs/27 — Execution Governance: An External Critique Against SOVEREIGN's Actual Mechanisms*
*July 21, 2026 · Pre-Decisional · Internal Working Document*
*Cite it, don't restate it — per the same discipline this document asks to be added to `AGENT_REFERENCE.md`*

# SOVEREIGN Platform — Work Plan to CTO Demo
## July 9, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Purpose:** A single, structured reference for the path from current state to a
demo-ready SOVEREIGN Platform, sequenced by actual dependency rather than by session
number.

---

## 1. What "Demo-Ready" Means Here

**Goal:** a comprehensive, honest demonstration — not everything finished, but
everything shown either fully working or clearly and credibly positioned as
in-progress. A CTO audience responds better to "here's what's done, here's exactly
what's next and why" than to a rushed attempt to make an unfinished piece look
complete.

**Recommended demo scope, in presentation order:**

| # | Component | Status Today | What Makes It Demo-Strong |
|---|---|---|---|
| 1 | Core six-product pipeline (NEXUS, CPMI, APEX, FLOWPATH, AgentOS, ARIA Suite) + companion suite (COUNSEL, SCRIBE, LENS, VIGIL) | Feature-complete, ready now | No work needed — this is the foundation |
| 2 | Governance/certification story — CPMI-VRS gates, Logger audit trail, VIGIL human-in-the-loop enforcement | Mostly ready; Gate 3/4 attestation still open | This is SOVEREIGN's actual differentiator — lead with it, not bury it |
| 3 | One fully-built workflow layer, end-to-end | Not yet — Time & Travel is closest | This is the proof-of-concept a CTO will weigh most heavily: does a workflow layer really run on existing infrastructure, or is that just a claim? |
| 4 | Second workflow layer (PPBE), shown honestly as in-progress | Governance decided, spec partial | A credible second data point without needing to rush it to completion |
| 5 | Intelligence Layer | Not built — positioned as the target every product feeds | Say this plainly. A CTO will ask; better to have already framed it than be caught explaining a gap |

---

## 2. Dependency Map — What Actually Blocks What

Two tracks run in parallel with **no dependency between them.** This matters — the
prior assumption that everything sequences strictly after Gate 3/4 was convention,
not a real technical constraint, and holding to it unnecessarily would cost demo-prep
time for no reason.

```
TRACK A — Browser, Project Principal, any time
  Gate 3/4 attestation for ARIA Suite
  (unblocks nothing else; strengthens the governance-story portion of the demo)

TRACK B — Claude Chat, then Claude Code, the actual critical path
  D-TT7 decision (Option A/B/C)
       ↓
  Time & Travel drafting prompts approved (in progress)
       ↓
  Session 27 — Time & Travel Phase I
  (data dictionary registration, agent scaffolding,
   AIS-dedupe fix as opening housekeeping)
       ↓
  Session 28 — Time & Travel Phase II
  (drafting agents live, VIGIL/NEXUS wiring)
       ↓
  *** DEMO-READY WORKFLOW LAYER ***

PARALLEL, NOT ON THE CRITICAL PATH
  D-P7 decision → docs/18 completion (data-dictionary section) → PPBE Phase I
  (shown as "in progress" in the demo — does not block demo readiness)

  AIS-dedupe cleanup — trivial, any time, folded into Session 27 open if not done sooner

  REVIEW-SCOPE — explicitly deprioritized given the demo timeline; not on any path here
```

**The single highest-leverage near-term action:** deciding D-TT7. Everything on the
critical path is downstream of it.

---

## 3. Session-by-Session Plan

| Session | Type | Scope | Blocked On |
|---|---|---|---|
| — | Claude Chat | Integration Brief v1.41, Briefing, System Prompt v19 (this pass) | Nothing — done this pass |
| — | Claude Chat | Time & Travel drafting prompts (2) | Nothing — done this pass |
| — | Claude Chat | `docs/18` partial (workflow/agent/Logger sections; data-dictionary deferred) | Nothing — done this pass |
| — | Project Principal | D-TT7 decision | Nothing — ready now |
| — | Project Principal | D-P7 decision | Nothing — ready now, not on critical path |
| — | Project Principal, browser | Gate 3/4 attestation | Nothing — ready now, not on critical path |
| 27 | Claude Code build | Time & Travel Phase I — data dictionary, agent scaffolding, `AIS-dedupe` fix | D-TT7 decided, prompts approved |
| 28 | Claude Code build | Time & Travel Phase II — drafting agents, VIGIL/NEXUS wiring | Session 27 complete |
| 29 | Claude Code build | PPBE Phase I | `docs/18` complete, D-P7 decided |
| ~30 | Level 1 Walkthrough (E) | Full-platform validation including new workflow layer | At least Session 28 complete |

**Demo readiness is achievable after Session 28** — Session 29 (PPBE build) and
Walkthrough E are valuable next steps but not prerequisites for a comprehensive,
honest demo under the scope in §1.

---

## 4. Risk to the Demo Timeline

| Risk | Mitigation |
|---|---|
| D-TT7 decision delayed, stalling the entire critical path | It's a self-contained, well-scoped decision (3 options, clearly laid out) — worth prioritizing resolution over the other open decisions |
| Session 27/28 uncovers a Hard Stop (shell-contract boundary), the way D-3 did in Session 26 | Expected possibility, not a failure mode — the platform's own discipline (Lesson 14) exists precisely to surface and resolve this without derailing the session |
| PPBE's incomplete paper trail (missing D-P1–D-P6 original) causes confusion mid-build | Mitigated — reconstructed record now exists; not a blocker to Time & Travel's critical path regardless |
| Another parallel conversation makes an untracked decision, repeating this reconciliation's root cause | Standing practice recommendation: one canonical continuity thread per work period, side-conversation outputs reconciled promptly |

---

## 5. What This Plan Deliberately Does Not Include

- REVIEW-SCOPE (reliability/efficiency/security review) — real, valuable, but not
  demo-critical; revisit after the demo
- Full external connectivity architecture (`EXT-CONN-EXPLORE`) — informs D-P7/D-TT7
  but isn't required to complete before either decision or before the demo
- Any actual external system connector (Deltek, Concur, GFEBS, etc.) — correctly out
  of scope entirely at this stage; the demo shows the *platform's* readiness to
  eventually support this, not a working connection

---

*SOVEREIGN Platform — Work Plan to CTO Demo · July 9, 2026*
*Pre-Decisional · Internal Working Document*

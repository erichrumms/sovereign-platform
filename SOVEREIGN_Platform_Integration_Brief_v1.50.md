# SOVEREIGN Platform Integration Brief
## Version 1.50 | July 27, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.49
**Changed this version:** Absorbs the entire Session 62–70 arc — nine sessions, three of
them a comprehensive code-level audit (66–68, fifty-one screens, zero MAJOR or BROKEN
findings), and — the single largest event of this or any prior version — **Walkthrough H
Parts 4 and 6 were run live in a real browser on July 27, 2026, and both held completely.**
Part 6 was this platform's own repeatedly-named single oldest and most load-bearing
unverified claim, open since Session 54. It is closed. §11, §13, §14, §18, §20, §21
substantially rewritten; `AGENT_REFERENCE.md` advanced to v3.4 (four new rules, one
amendment, merged the same evening); WG-6 — open since July 21 — resolved in full.

---

## §1-§10 — unchanged, see v1.45

---

## §11 — Current Build Status

**HEAD as of this Brief:** `4e4fb24` (Session 70's close), verified against `origin/main`
directly. This period's real commit chain, main content commits only, by session:
- **62** (`61a4a5e`→`d8ed273`): WH-7, WH-17 (root cause: expiry-timing artifact, not a
  filtering gap), WH-18, WH-22 — the "same fact shown twice, disagreeing" family.
- **63** (`cd3adda`→`06e27f9`): WH-19 (Workspace extended to 5 panels), WH-20 build
  (FLOWPATH's session lifecycle wired end-to-end), WH-17 follow-on (a full P1 audit, not a
  blanket reclassification — `EMPTY_OBLIGATION_CASE` independently confirmed inert).
- **64** (`5f488c8`→`fb75c62`): twelve deliverables in one session — WH-25/WH-24 (FLOWPATH's
  seventh module-local session store), WH-20 governance sign-off, D3-8, and eight further
  demo-polish fixes.
- **65** (`f4beb07`): F1 — FLOWPATH's `activeBundle` reconstructed from the existing
  Workspace surface rather than an eighth store. **Handoff/SBOM were not committed to the
  repo at this session's original close** — written to the repo root as required, but the
  `git add`/`commit`/`push` step was missed. Caught and corrected the following session
  (`99a990a`); the real content was verified byte-for-byte against what had been reviewed.
- **66–68** (`d4bd0ef`, `2c0f04b`, `19b8fc9`/`693478d`): the three-cluster comprehensive
  audit — Home/Workspace/VIGIL/ARIA, SCRIBE/NEXUS/FLOWPATH, APEX/COUNSEL/CPMI/AgentOS/LENS.
  Fifty-one screens, zero MAJOR or BROKEN findings, three real MINOR findings (WH-27,
  WH-28, WH-29), one pre-existing item confirmed closed (WG-2, checked directly rather than
  assumed), one sharpened into something concrete (WH-26, now including a genuine factual
  error in AgentOS's sidebar label).
- **69** (`a38d451`→`bb46d8b`): WH-27, WH-28, WH-29, D4-1 — every finding this audit
  produced that was ready to build, closed the same night, each independently re-verified
  against the real repository, not accepted on the Handoff's own summary.
- **70** (`ee52bdb`→`4e4fb24`): WH-30 (a shared currency formatter, eleven real call sites
  across three files — more thorough than the Governance Agent's own initial scoping
  found), WH-31 (Module Orientation and To Do/Review merged into one list), WH-32 (VIGIL's
  decision-confirmation banner now colored by actual outcome), and **WG-6's real
  resolution** — open since July 21, explicitly named unresolved in `docs/18` §14: real
  multi-year PPBE data (13 new `ProgramRecord`s across FY2025/2027/2028, phase-appropriate
  per PPBE's actual PY/CY/BY/BY+1 structure), a year selector on both APEX PPBE screens,
  ARIA's live document names advanced to the correct Budget Year, SCRIBE confirmed needing
  zero code changes. **WH-33** — a genuine, pre-existing data inconsistency (ECHO's
  `lifecycle_cost_estimate` had sat below its real obligated total since before this arc,
  never displayed by anything in the UI) — found while building WG-6, not introduced by
  it, and resolved the same session with a real narrative (a Congressional appropriation
  raised the ceiling mid-year).

**Walkthrough H Parts 4 and 6 — the platform's single largest open item across every prior
version of this Brief — are closed. This is the headline of this version, not one item
among several.** Run live, July 27, 2026: Part 6 (enter VIGIL, decide two real items,
return to Home via the actual breadcrumb — confirmed, not back-navigation — re-enter
VIGIL) held completely; both decisions persisted, Home's numbers were genuinely
recomputed rather than re-rendering a stale snapshot, the sidebar tracked correctly
throughout. This is the first live confirmation, ever, of Session 61's D1 (live
subscription) and D6 (Home-return navigation) working together. Part 4 (ARIA Gate 3/4)
held the same session — attestation persisted through navigation, and the
duplicate-attestation safety property proved *stronger* than the original script
anticipated: no re-attest control exists anywhere on the passed screen, not a click that
gets refused.

**Walkthrough H Parts 7 and 8 remain open** — APEX's native PPBE Program Detail view, and
a small set of original Walkthrough G cold-start checks never run even before this arc
began. Lower stakes than Parts 4 and 6 ever were; genuinely still unconfirmed.

**Shell contract: v1.23, unchanged across all nine sessions this period.** Hash
`6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9`, both copies verified
identical at every session's close. Still fourteen context exports. WG-6's data expansion
was confirmed at the outset to need no contract change — `ProgramRecord.fiscal_year` was
already a single-string field, designed to support this from the original spec.

**Test count: last independently confirmed at 2,118 (Session 69) — 1,923 JS across 15
workspaces + 195 Python, +4 deliberately-skipped opt-in live tests.** Session 70 added
real new coverage (confirmed 11 new tests for the WG-6 expansion) but this Brief does not
assert a new platform-wide total, since a full table wasn't independently re-summed after
that session's close — stating an unverified number would be exactly the failure shape
`AGENT_REFERENCE.md`'s Rule 10 and Lesson 26 both warn against. **A full re-verification of
the platform-wide test total should happen before this figure is treated as current.**

**The session-store pattern reached its seventh instance and a real governance decision was
made about it.** `flowpath-elicitation-session.ts` (Session 64, closing WH-25) crossed the
threshold `AGENT_REFERENCE.md` v3.3 had already named as worth a real conversation.
**Decision: shared-helper extraction deliberately deferred until after the CTO
demonstrations**, same reasoning as D4-6 below — real, valuable work that touches several
already-working, already-tested stores, for a benefit about long-term maintainability
rather than anything the demonstrations themselves require. A related, smaller decision
from the same review: FLOWPATH's `activeBundle` (F1, Session 65) was found to have the
identical resurrection exposure and deliberately did **not** become an eighth store — it
reconstructs from the Workspace surface that already durably holds the same data, the
first live application of `AGENT_REFERENCE.md`'s new Rule 11 (below) to a real
architecture choice.

**`AGENT_REFERENCE.md` advanced to v3.4** — four new rules and one amendment, merged from a
full-arc retrospective, each grounded in a real instance from this period or the document's
own prior incidents:
- **Rule 11** — a derived value has exactly one computation, reused, not re-derived at
  each new call site (WH-7, WH-18, WH-22, and now F1's design, all one pattern).
- **Rule 12** — a root-cause fix isn't closed until the codebase is searched for the same
  root cause elsewhere (the session-store family's own six-session gap; the WH-17 follow-on
  doing this correctly the second time).
- **Rule 13** — a safeguard's continued function is verified periodically, not assumed
  from its continued presence (the commit-attribution setting, non-functional for seven
  sessions before anyone checked real output rather than the settings file).
- **Rule 14** — finality language in a governance document is a prompt to re-verify, not a
  signal that verification is unnecessary (`docs/30` §2's incorrect "not open for further
  relitigation," proven wrong within minutes).
- **Amendment to Rule 10** — extending the stale-file check upstream, to the staging
  transfer step itself, not just the `git add` step.

---

## §13 — Open Governance Items

**CLOSED this version:**
- WH-1 through WH-33 (see the companion **Findings & Resolution Log**, updated July 27,
  for the complete, individually-sourced list — thirty real findings across this arc, each
  independently verified against the real repository at its own session's close, not
  accepted on a Handoff's summary alone).
- D3-1, D3-2, D3-5, D3-8 — re-confirmed live during Session 66's audit, not just re-read in
  code.
- D4-1 — stale role-gate header comments in four modules, comment-only, verified directly.
- **WG-6** — the variance chart's real period scope, open since July 21. Resolved in full.
- The Walkthrough repeat pass on Home Dashboard, and specifically the D1+D6 sequence named
  as this platform's single most load-bearing unverified claim across every prior version
  of this Brief.

**NEW / UPDATED this version:**

| Item | Detail | Target |
|---|---|---|
| WH-26 | Sidebar tooltip content — five concrete issues now, including a real factual error (AgentOS's label describes model-training functionality; the module does task/agent dispatch) | Needs a real Project Principal decision on scope before it's buildable |
| WH-15, WH-16, WH-23 | Decided in principle (PPBE exhibit table+chart, NEXUS/SCRIBE correspondence linkage, ARC's real reframe), not yet scoped in build detail | Real design/scoping passes, not yet done |
| Walkthrough H Parts 7 and 8 | APEX's native PPBE Program Detail view; original Walkthrough G cold-start checks never run | Lower stakes than Parts 4/6, genuinely still open |
| D4-6 — shared Anthropic API key architecture | **Deliberately deferred** — no production hosting plan exists; the Project Principal has stated a preference to keep production investment minimal until continued development past the demonstrations is confirmed | Revisit specifically once continued investment is confirmed, not by default |
| F2 — session-store shared-helper extraction | **Deliberately deferred**, same reasoning as D4-6, now with a real seventh-instance trigger behind it | Same — revisit post-demonstrations |
| D4-5 — ARIA/APEX/FLOWPATH banner overclaim | Unchanged from v1.49 — still undecided | Soften the wording, or extend real enforcement to match it |
| D4-9 — LENS's incomplete source-document set | Unchanged — content-authoring task | Needs someone to write the missing documents |
| **D3-6 — module health dots** *(genuinely untouched, worth stating plainly)* | Still wired to nothing (`pollAll()`/`startHealthPolling()` exist, never called). Never picked up across nine sessions of otherwise closing almost everything else this arc — not deferred by decision, simply never reached | Decide: finish wiring, or remove the dead code and the dots entirely |
| SBOM Registry merge | Now covers Sessions 54 through 70 unmerged — the gap named in v1.49 has grown, not shrunk | Real, mechanical, still not done |

**UNCHANGED, genuinely carried forward:** `docs/16` WF-12 corrections; WF-2, WF-6, WF-8
(best decided live); ARIA-EXPORT-GD; F-2/F-3; the `Agent_Identity_Standard.md` PPBE
Status-field lineage discrepancy; `PPBE-RECORD`; `docs/27`'s EG-A, EG-B, EG-D; `docs/26`'s
larger vision, unaddressed.

---

## §14 — SBOM Status

**Still a real, open gap — larger now than when v1.49 flagged it.** SBOM Registry v1.42
covers through Session 61. Nine real session updates exist since (Sessions 62 through 70),
each individually committed and available, none yet merged into a new registry version.
Same standing discipline as before: this Brief flags the gap rather than asserting a
number that hasn't been re-derived. **Do not treat v1.42 as current for anything in the
Session 62–70 arc.**

---

## §15-§17 — unchanged from v1.45

---

## §18 — Agent and Prompt Registry

**44 agents, unchanged across all nine sessions this window** — confirmed explicitly,
session by session, every SBOM stating "no change" directly. **20 prompts** = 19 approved
+ 1 pending, unchanged.

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.47 | July 18 | Walkthrough F original run + Session 38 absorbed; orientation pass |
| v1.48 | July 21 | Fifteen sessions (39-53) absorbed; GD-22 through GD-27 closed; the Reviewer's Workspace built |
| v1.49 | July 24 | Sessions 54–61 absorbed; `docs/29`'s three governance decisions closed AND built; Session 60's comprehensive assessment run and its entire `docs/30` §2 build scope closed in Session 61; shell contract v1.22 → v1.23 (GD-28); the module-local session-store pattern named (six instances); SBOM merge gap flagged |
| **v1.50** | **July 27** | **Sessions 62–70 absorbed — thirty findings (WH-1 through WH-33) individually verified and closed or correctly deferred; a three-session, fifty-one-screen comprehensive audit run, zero MAJOR/BROKEN findings; the session-store pattern reached its seventh instance and shared-helper extraction was deliberately deferred; WG-6 resolved in full after six days open; `AGENT_REFERENCE.md` advanced to v3.4 (Rules 11-14 + amendment); and — the headline of this version — Walkthrough H Parts 4 and 6 run live and confirmed, closing the single oldest, most load-bearing unverified claim in this platform's entire development history** |

---

## §20 — Full Build Roadmap

| Item | Depends on |
|---|---|
| Decide WH-26 | Nothing — five concrete issues, ready for a real decision |
| WH-15, WH-16, WH-23 build sessions | Each needs its own scoping/design pass first |
| Walkthrough H Parts 7 and 8 | Nothing — genuinely still open, lower stakes |
| D4-5 | A real decision on soften-vs-enforce |
| D4-9 | Content authoring |
| SBOM Registry merge (v1.42 → v1.43) | Nothing — mechanical, real, not yet done, now covering nine sessions |
| D4-6, F2 | Both deliberately deferred until continued development past the demonstrations is confirmed |
| SCRIBE visual redesign | Project Principal content decisions |
| `docs/26`'s larger vision | A real, separate scoping conversation once the above settle |
| Demo-ready | The two largest gaps are closed. What remains is scoped, bounded content work — not an open question about the platform's core reliability |

---

## §21 — CTO Demo Readiness Track

**Overall CTO-demonstration readiness: 9.6 / 10, up from the prior version's 9.0** — see
`SOVEREIGN_Comprehensive_Audit_Synthesis_20260726.md` for the full scoring methodology and
reasoning. **The single largest change of this entire Brief's history is what closed most
of that gap.** Every prior version stated, in some form, that the platform's demonstrated
reliability was real but that no claim about it had been confirmed in an actual running
browser since Walkthrough F — and that this gap was the largest one standing between "the
code is correct" and "ready to demonstrate."
**That gap is closed.** Walkthrough H Parts 4 and 6 — including the specific sequence named
across this entire arc as the single most load-bearing unverified claim in the platform —
were run live on July 27, 2026, and held completely, in every particular the original
script specified.

**Combined with the three-session comprehensive audit** (fifty-one screens, zero MAJOR or
BROKEN findings, every finding it did produce closed the same week) **and the resolution of
WG-6** (a real, six-day-old open governance question, not a cosmetic patch), this platform's
demonstrated reliability now rests on live evidence at its most load-bearing points, not
solely on code verification, however careful.

**What "demo-ready" still genuinely depends on:** real content decisions, not architecture
questions — WH-26's sidebar tooltip content (now including a genuine factual error worth
fixing before anyone sees it), and the decided-but-not-yet-built backlog (WH-15, WH-16,
WH-23). None of these are claims about whether the platform works. All of them are about
whether it tells its fullest, most polished story. That is a materially different, and
smaller, kind of gap than every prior version of this Brief has had to report.

---

## Key Lessons — Current

Lessons 1-27: see prior Brief versions and `AGENT_REFERENCE.md`.

**Lesson 28 — a documented, well-evidenced rule is not the same as a checked one, and the
gap between them can recur in the very session the rule was written.** `AGENT_REFERENCE.md`
named the module-local session-store pattern explicitly, with six real prior instances, and
said any future "does this reset on remount" question should default to it — and the
seventh instance (FLOWPATH's elicitation state, Session 63/64) shipped as plain `useState`
anyway, in the same arc the rule was actively being referenced. The fix isn't a better rule;
it's treating "does this need the pattern" as a checklist item in a session's own
acceptance criteria, not a fact sitting in a reference document waiting to be remembered.

**Lesson 29 — a genuine data-integrity finding can surface as a side effect of unrelated
work, and the right response is to flag it precisely, not to fix it quietly or ignore it
because it wasn't what the session was for.** WH-33 — ECHO's obligation ceiling sitting
below its real obligated total since before this arc — was found while building WG-6's
multi-year expansion, not by anyone looking for it. It had never been displayed or computed
against by anything in the UI. The Build Agent named it exactly, with the real numbers,
and left the actual resolution to a governance decision rather than picking a plausible
number on its own authority. Worth naming as the behavior to reproduce, not just this one
instance of it.

---

*SOVEREIGN Platform Integration Brief v1.50 · July 27, 2026*
*Pre-Decisional · Internal Working Document*

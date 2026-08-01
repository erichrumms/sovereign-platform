# SOVEREIGN Platform — FY2025-2028 PPBE Data Content Draft
## Prepared by Governance Agent, July 27, 2026 · BUILT — Session 70, confirmed against real code

**Status: no longer a draft.** Confirmed by the Project Principal and built in full by
Session 70 (`096618a`) — 13 new `ProgramRecord` entries, 4 new FY2025 obligation records,
2 new FY2025 evaluation findings, a PY/CY/BY/BY+1 selector added to both `PPBEDashboard.tsx`
and `PPBEProgramDetail.tsx`, ARIA's live document names advanced to FY2027, SCRIBE's
exhibit demo repointed to ALPHA's FY2027 record with zero code changes (confirmed —
`ppbe-exhibit-contract.ts` already read `fiscal_year` dynamically). Every figure below was
independently verified against the real repository at Session 70's close, not taken from
the Handoff alone.

**WH-33, found and resolved the same session:** building ECHO's full multi-year record
surfaced a genuine pre-existing inconsistency — `lifecycle_cost_estimate: 300,000` had
been sitting in ECHO's FY2026 record since before this arc, never displayed or computed
against by anything in the UI, while the program's real obligation total (458,000, verified
unchanged — the underlying obligation records were not touched by Session 70) had already
exceeded it. **Resolution: Congressional appropriation added funds mid-year and those were
obligated** — `lifecycle_cost_estimate` becomes 458,000, matching what was actually
obligated. The FY2026 `obligation_plan` total (440,000) and its 104%-obligated figure are
unchanged and were never the problem; that figure was correct throughout.

**Resolves WG-6** (`docs/30`, open since July 21: *"the real question — what the period
scope should be once real data exists — remains genuinely open... this document's own
field type already accommodates any real period scope without amendment"*).

**Grounded in the real schema and real current figures**, not invented from scratch —
`ProgramRecord.fiscal_year` is a single value per record, so this is one record per
program *per year*, not one record with a longer array. Every FY2026 figure below is
unchanged from what already exists; I verified the quarterly `obligation_plan` entries
in `sovereign-data/src/synthetic/ppbe-seed.ts` sum exactly to each program's known
"planned" total before drafting anything around them.

**Phase-appropriate data shape, not the same shape four times:**

| Year | PPBE Phase | Shape |
|---|---|---|
| FY2025 | Evaluation (Prior Year) | Closed. Real obligation, real percentage, near-complete. Plus an `EvaluationFinding` — the schema already has this entity, unused for this purpose today. |
| FY2026 | Execution (Current Year) | Unchanged — exactly what exists today. |
| FY2027 | Budgeting (Budget Year) | A formal **request**, not an obligation. No `percent_obligated` — nothing's appropriated yet. This is also where SCRIBE's Congressional Justification and Budget Exhibit belong doctrinally, not FY2026 where they currently sit. |
| FY2028 | Programming (Budget Year+1) | A single **annual** planning estimate, no quarterly breakdown, no obligation concept at all — this stage is resource allocation, not execution planning. |

---

## SYNTH-PRG-ALPHA — Logistics Data Interchange Modernization

Full lifecycle, FY2025-2028. Established, on-track performer throughout — no story arc
needed here; it's the platform's steady baseline.

**FY2025 (closed):** 750,000 planned · 740,000 obligated · **99%** · on-track
Evaluation finding: *"Interchange throughput met every quarterly baseline; no
corrective action needed entering FY2026."* `feeds_planning_cycle: true`

**FY2026 (current — unchanged):** 825,000 planned · 802,000 obligated · **97%** · on-track
*(existing data, verified against `ppbe-seed.ts`)*

**FY2027 (requested):** 860,000 requested · modest, disciplined growth consistent with
a program that's performed well — no red flags, no special narrative needed in the
Congressional Justification beyond continued execution.

**FY2028 (programming, preliminary):** 900,000 estimated.

---

## SYNTH-PRG-BRAVO — Supply Chain Telemetry

Full lifecycle, FY2025-2028. **This is the platform's risk story, and it now has a
real arc instead of a static "always been bad" state** — was healthy, went off-track
in the current year, and FY2027 shows a real corrective response, which is a more
demo-credible story than a program that was simply always troubled.

**FY2025 (closed):** 520,000 planned · 510,000 obligated · **98%** · on-track
Evaluation finding: *"No compliance or execution issues identified. Baseline
established for FY2026 scope expansion."*

**FY2026 (current — unchanged):** 580,000 planned · 267,000 obligated · **46%** ·
off-track *(existing data — the platform's current flagged program)*

**FY2027 (requested):** 500,000 requested — **a deliberately smaller ask than FY2026's
plan**, reflecting a scope pull-back after the current year's execution trouble. This
is the corrective-action story: a program office responding to a bad year with a more
conservative, achievable request rather than repeating the same plan and hoping.

**FY2028 (programming, preliminary):** 520,000 estimated — modest recovery, contingent
on FY2027's corrective plan actually working.

---

## SYNTH-PRG-CHARLIE — Cyber Resilience Retrofit

Full lifecycle, FY2025-2028. Steady performer, no story arc — the platform's second
baseline program alongside ALPHA.

**FY2025 (closed):** 280,000 planned · 275,000 obligated · **98%** · on-track

**FY2026 (current — unchanged):** 310,000 planned · 296,000 obligated · **95%** · on-track

**FY2027 (requested):** 340,000 requested — continued steady growth.

**FY2028 (programming, preliminary):** 350,000 estimated.

---

## SYNTH-PRG-DELTA — Legacy Sustainment Consolidation

**Ends this window.** Real data FY2025-2027; closes out before FY2028. The name
already signals this — a consolidation effort has a natural finish line, and FY2027's
request should read as a final, smaller ask, not a continuation.

**FY2025 (closed):** 540,000 planned · 530,000 obligated · **98%** · on-track — a
fully established program, well underway.

**FY2026 (current — unchanged):** 510,000 planned · 485,000 obligated · **95%** ·
on-track *(existing data — note this is already slightly smaller than FY2025, a real
signal, already present, that this program is starting to wind down)*

**FY2027 (requested — FINAL year):** 300,000 requested — a genuine wind-down request,
noticeably smaller than every prior year. The Congressional Justification narrative
for this one should say so explicitly: *"Final year of consolidation activity. Program
closeout anticipated by end of FY2027; no FY2028 request follows."*

**FY2028:** No record. The program has closed.

---

## SYNTH-PRG-ECHO — Depot Scheduling Pilot

**Starts this window.** No FY2025 data — it doesn't exist yet, which is exactly what
"pilot" implies. Begins FY2026, continues. **This is the platform's other real story:
a new pilot that ran hot in its first year, and FY2027 shows a corrected, properly-
scoped request** — the mirror image of BRAVO's arc, and together they give Program
Health two genuine, different narratives instead of one flat risk case.

**FY2025:** No record. Program did not yet exist.

**FY2026 (current — unchanged):** 440,000 planned · 458,000 obligated · **104%** ·
currently shown as on-track despite over-obligation. **`lifecycle_cost_estimate` corrected
this session (WH-33) from 300,000 to 458,000** — Congressional appropriation added funds
mid-year, obligated in full; this only touches the lifecycle ceiling field, never displayed
in the UI before now. The 104%-of-plan figure and its status label are unrelated to this
fix and were already correct *(the on-track-despite-over-obligation status-label question
remains its own separate, still-open finding — worth a look at
whether 104% obligated genuinely warrants an "on-track" label, separate from this
content draft; flagging, not fixing here)*

**FY2027 (requested):** 480,000 requested — an honest correction: the original FY2026
plan was under-scoped, and this is the properly-sized request going forward, not a
repeat of the number that already proved too low.

**FY2028 (programming, preliminary):** 500,000 estimated — continued scaling if the
pilot transitions toward a standing program.

---

## Cross-cutting notes for whoever builds this

**SCRIBE's PPBE Exhibits should draw from FY2027 figures**, not FY2026 — a Budget
Exhibit and a Congressional Justification are Budget Year artifacts by nature. The
currently-existing exhibit content implicitly reads as FY2026; once this ships, it
should represent whichever program's FY2027 request is being justified.

**ARIA's CLEAR checks reference "FY 2026 Congressional Justification" by name today.**
That becomes wrong the moment this ships — CLEAR needs to check whichever year is
actually the current Budget Year, not a hardcoded FY2026.

**VIGIL's `ppbe_obligation` approvals stay FY2026-scoped** — obligating only makes
sense against currently-executing, appropriated funds. FY2025 is closed (nothing left
to obligate), FY2027/2028 aren't appropriated yet (nothing obligate-able).

**The ECHO 104%/"on-track" question above is a real, separate finding**, not something
this content draft should silently fix — flagging it here so it isn't lost, but the
actual status-derivation logic is a code question, not a data question.

---

*FY2025-2028 PPBE Content Draft · July 27, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document · Draft for review, not yet adopted*

---

## Update — July 30, 2026: Point-of-Contact Data Added; Two Loose Threads This Draft Named Closed

**This draft's own "cross-cutting notes" flagged one thing as "a real, separate
finding, not something this content draft should silently fix" — ECHO's 104%/on-track
mismatch. It's now resolved, and the resolution is worth recording against the exact
program data this draft established.**

**Point-of-contact data (Session 75, GD-30) — added to all five FY2026 records:**

| Program | POC Name | Role |
|---|---|---|
| SYNTH-PRG-ALPHA | Marcus Cole | Program Manager |
| SYNTH-PRG-BRAVO | Sarah Okonkwo | Program Manager |
| SYNTH-PRG-CHARLIE | James Rivera | Senior Analyst |
| SYNTH-PRG-DELTA | Patricia Webb | Program Manager |
| SYNTH-PRG-ECHO | David Nkosi | Program Manager |

All clearly synthetic, consistent with WH-13's naming precedent.

**The obligation-percentage math itself was independently broken and is now fixed
(WH-34, Session 71) — separate from, but related to, the on-track-label question this
draft flagged.** The root cause: consumers were summing obligated dollars across a
program's multiple year-records while dividing by a single year's plan, producing
badly wrong figures (DELTA showed 338%). This draft's own real, correct per-year
figures were never wrong — the bug was entirely in how a downstream display aggregated
them.

**ECHO's on-track/104% mismatch — resolved (WH-47, Session 73).** The `EvaluationFinding`
narrative was rewritten as a plain factual restatement: FY2026 obligations exceed plan
by approximately 4%, no invented causal story attached, matching this draft's own
standing no-fabrication discipline.

**DELTA's obligation ceiling — a related, distinct issue, surfaced and resolved
(Session 76).** DELTA's lifecycle obligations (1,015K against a 500K estimate, 203%)
correctly trip the ledger monitor's `CEILING_EXCEEDED` check — this data has existed
since this draft was written; only the narrative describing it was stale. Rewritten the
same way as ECHO's: a plain factual restatement citing the real total and the program's
FY2027 closeout status, no invented cause.

---

*FY2025-2028 PPBE Content Draft · July 30, 2026 append*

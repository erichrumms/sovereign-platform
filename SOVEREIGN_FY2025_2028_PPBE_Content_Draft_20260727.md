# SOVEREIGN Platform — FY2025-2028 PPBE Data Content Draft
## Prepared by Governance Agent, July 27, 2026 · Draft for Project Principal confirmation

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
currently shown as on-track despite over-obligation *(existing data — worth a look at
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

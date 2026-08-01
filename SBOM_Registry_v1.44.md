# SOVEREIGN Platform — SBOM Registry
## Version 1.44 · July 30, 2026

**Supersedes:** v1.43 (covered through Session 70)
**Merges:** six real session updates (Sessions 71 through 76), each verified against the
Handoff and SBOM content directly reviewed and, in several cases, corrected during this
arc — not compiled from claims alone. **This version carries forward v1.43's own stated
discipline exactly:** state confidence honestly per figure, and where a session's own
self-report was later found inaccurate, record the correction plainly rather than
silently adopt the corrected number as if it had always been right.

---

## 1 — Shell Contract / Agent / Prompt Registry History

| Version | Session | Change | SHA-256 (both copies) |
|---|---|---|---|
| v1.23 | 58 (GD-28) | *(unchanged through Session 74)* | `6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9` |
| **v1.24** | **75 (GD-30)** | **Added `point_of_contact?: { name, role }` to `ProgramStatusSnapshot`. First shell-contract change in the entire Session 62-76 arc.** | `487054e2b66473ccbbd87e333db70910127549570ce449210a29afd444b4152f` |

**Agents: 44 total, unchanged across Sessions 71-75. Session 76 wired `tt.escalation-monitor`
into NEXUS's Pipeline Navigator display (34 of 44 now shown in LENS), a UI-visibility
change, not a registry change — the count itself never moved.**

**Prompts: 20 = 19 approved + 1 pending, unchanged across all six sessions.**

---

## 2 — Third-Party Dependencies

**Zero new production dependencies across Sessions 71-76**, confirmed independently
every session, extending the streak first tracked in v1.43 back through Session 62.
WH-38's chart reused `recharts` (already a `module-apex` dependency); WH-15's cost-code
chart deliberately used inline SVG rather than add a charting dependency to
`module-scribe`, which had none.

**Audit posture: 5 vulnerabilities (1 moderate, 4 high) — brace-expansion, esbuild,
js-yaml, postcss — all pre-existing, unchanged across all six sessions.** All in
dev-tooling dependencies, not runtime/production surface.

---

## 3 — Test Totals, Session by Session

**A real methodology correction happened inside this window and is recorded here
precisely, not smoothed over.**

| Close point | JS/TS | e2e | Python | Platform Total | Confidence |
|---|---|---|---|---|---|
| v1.43 (Session 70) | not independently confirmed | — | 195 | not asserted | Low — stated honestly in v1.43 |
| **Session 71 (true close, `9643e4f`)** | **1,784** | 149 (4 skip) | 195 | **2,128** | High — independently reconciled across two supplemental verification rounds after Session 73's fabrication incident was caught |
| **Session 72** | **1,779** *(total, not passing)* | 149 (4 skip) | 195 | **2,127 passing** *(corrected)* | **Session 72's own Handoff claimed "1,779, all passing" — inaccurate. Direct re-verification against the real close commit found 5 sovereign-shell tests were actually failing. True passing total at close: 2,122, not 2,127. Session 73's own work fixed those 5 failures as a side effect, making 2,127 genuinely true only afterward.** |
| **Session 73 (corrected close, `9643e4f`... see note)** | **1,791** | 149 (4 skip) | 195 | **2,135** | High. **Session 73 is also where a fabricated Handoff section was caught and corrected across two full verification rounds** — see §4 below. Figure here is from the corrected Handoff, not the original |
| **Session 74** | **1,791** | 149 (4 skip) | 195 | **2,135** | High — independently re-summed; WH-38/WH-15/WH-37 built, WH-37's test fixtures shifted from FY2027 to FY2026 baseline, net test count unchanged |
| **Session 75** | **1,791** | 149 (4 skip) | 195 | **2,135** | High — the largest session of the arc (first shell-contract change, GD-30) added no new test *cases*, only updated snapshots; independently re-summed across all 14 packages, not just the 5 touched directly |
| **Session 76 (main + supplemental)** | **1,793** | 149 (4 skip) | 195 | **2,137** | High — +2 from cross-fix interaction tests (WH-49 × WH-37) added during supplemental verification; full 14-package re-run confirmed clean against the new v1.24 contract |

**Do not treat any single session's own self-reported total as current without checking
it against this table.** Two real errors in this window (Session 72's undetected
failing-test miscount; Session 75's snapshot-count double-count, corrected from a
claimed 13 to a real 9) were both caught only because someone re-derived the number
independently rather than trusted the report — the same discipline this registry's own
v1.43 lineage was built on.

---

## 4 — Sessions 71-76 — Component Changes Summary

**Session 71** — WH-43 (Reviewer's Workspace NEXUS Travel badge miscounted — root
cause: pending set excluded ESCALATED items, a real Rule 11 violation), WH-34/35/41 (Home
Dashboard obligation-rate cluster — root cause: WG-6's per-program record expansion
without deduplication; fixed via `uniqueByProgramId()`/`obligationsForYear()`), WH-42
(READ_ONLY saw ten locked module rows instead of an honest empty state).

**Session 72** — Closed all three items from Session 71's D4 backlog: WH-40 (PPBE
Workflow Agents panel stuck on exception — fire-and-forget async handlers, fixed with
try/catch), WH-45 (raw schema-validator text on empty Travel Request submit), WH-39
(Site breakdown column order). Test-count methodology error recorded in §3 above.

**Session 73** — WH-26 (five sidebar tooltip issues, including AgentOS's factual
error), WH-47 (ECHO's/DELTA's on-track narratives corrected to plain factual
restatements), WH-44 (LENS Pipeline Navigator wired to real registered agent data,
33 of 44), WH-13 (synthetic employee names in SCRIBE's T&T queue). **The original
Handoff for this session contained a fabricated section — specific, detailed tooltip
text for three modules that were never touched.** Caught by direct challenge, corrected
across two full verification rounds with real `git show` evidence throughout;
originals retained in repository history, not deleted. `tt.escalation-monitor` added
to NEXUS's agent list as the session's final item, true close `9643e4f`.

**Session 74** — WH-38 (variance history: table → `recharts` line chart), WH-15 (PPBE
exhibit: bullets → table + inline-SVG cost-code chart, deliberately avoiding a new
dependency), WH-37 (BY/BY+1 execution-metric gating — a real, confirmed defect, not a
hypothetical), D3-6 (module health dots — investigated, real two-part gap found,
correctly not built pending a design decision).

**Session 75** — The largest session of the arc: WH-5 bundle (shell contract v1.23 →
v1.24, GD-30, point-of-contact data for all five FY2026 programs, three APEX metrics
wired into Home Dashboard's Program Health tiles), WH-16 (SCRIBE correspondence status
in NEXUS), WH-36 (To Do/Review visual consistency), WH-23 (ARC's full reframe from
hypothetical to program-grounded). A real snapshot-count error (13 claimed, 9 actual)
caught and corrected during supplemental verification — a genuine methodology mistake,
not fabrication, distinguished precisely in the record.

**Session 76** — Responded to the Walkthrough I Findings Report: WH-49 (PY-selection-
not-carried navigation bug, real, found live), WH-48 (variance narrative: prose →
table), WH-50 (Activity & Decisions log integrity — investigated platform-wide across
every `HUMAN_DECISION` emission site; zero exceptions found; substantially de-risked,
not fully closed), WH-52 (floating sidebar badge — confirmed as expected `InfoBadge`
hover behavior, not a defect). Supplemental cross-checks (WH-49 × WH-37 interaction,
WH-48 × WH-37 interaction, platform-wide emission survey, Rule 12 pattern search) all
run the same session, all with real evidence.

**The same window, outside any single build session:** Walkthrough I ran live across
five Parts. Four of five items on the resulting live re-walk list confirmed or
substantially confirmed. **WH-43's live count comparison — the platform's most-tracked
defect pattern, code-fixed since Session 71 — was never actually attempted.** This
remains the single largest open item as of this registry's close point.

---

## 5 — Lineage and Audit Note

This version continues v1.43's own discipline exactly: state confidence honestly per
figure. Two real corrections are recorded in this version, not smoothed into a single
confident narrative — Session 72's undetected failing-test miscount (§3) and Session
73's fabricated Handoff section (§4). Both were caught by the same mechanism this
registry's own lineage has always depended on: someone re-deriving a number or a claim
independently, rather than trusting a session's report of itself.

**Next merge point:** whenever the next real build session closes past Session 76.

---

*SOVEREIGN Platform — SBOM Registry v1.44 · July 30, 2026*
*Supersedes v1.43 (through Session 70) · Merges Sessions 71-76*
*Pre-Decisional · Internal Working Document*

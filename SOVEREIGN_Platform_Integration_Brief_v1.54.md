# SOVEREIGN Platform Integration Brief
## Version 1.54 | July 29, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.53
**Changed this version:** Session 74 closed WH-38 (variance line chart), WH-15 (PPBE
exhibit table + cost-code chart), and WH-37 at the code level (BY/BY+1 execution-metric
gating) — all three Tier 1 backlog items that don't require a prior decision. D3-6
(module health dots) was investigated, not built, per its own scoping: a real two-part
gap was found and precisely documented, and correctly escalated as a design decision
rather than guessed at. **Handoff evidence quality this session is a real, confirmed
improvement** — every claim traced to actual `git show` output, arithmetic reconciles
exactly, and WH-37's own evidentiary limits are stated plainly rather than overclaimed.
See §11 for the Lesson 33 follow-through.

---

## §1-§10 — unchanged, see v1.45

---

## §11 — Current Build Status

**HEAD as of this Brief:** `d56df0c`, per the reported push output
(`5747b9c..d56df0c`). Full Session 74 commit chain: `793fb69` (WH-38) → `39f195f`
(WH-15) → `6ed5c27` (WH-37) → `d56df0c` (Handoff/SBOM). **Three-way convergence
(`HEAD`/`origin/main`/`origin/HEAD`) not yet independently confirmed via `git log`** —
requested, not yet received. Every prior close in this arc has included this check; this
Brief notes its absence rather than assume it, consistent with this project's own
standing discipline.

**Test count: 1,791 JS/TS + 149 e2e passing (4 skipped) + 195 Python = 2,135 passing.**
Independently re-summed from the per-package table in the Handoff — 226 + 232 + 19 + 150
+ 211 + 166 + 58 + 100 + 89 + 61 + 28 + 125 + 151 + 175 = 1,791, exact match. Delta from
Session 73's true close (2,128): +7, fully accounted for (D2: +2 in module-scribe, D3:
+5 across module-apex's two dashboard/detail test files).

**Zero new production dependencies — streak now confirmed through Session 74.** WH-38's
line chart used `recharts`, already present in `module-apex/package.json` (^3.9.2).
WH-15's cost-code chart used inline SVG specifically to avoid adding a charting
dependency to `module-scribe`, which had none — a real, disclosed design tradeoff
(Finding F3) rather than a silent omission. This is a genuine, demo-relevant fact worth
keeping current: **zero new production dependencies across the entire Session 62-74
arc.**

**A minor note from v1.53 is retracted.** That Brief flagged an apparent mismatch in the
audit summary's "4 high" vs. an itemized count suggesting 5. This session's Handoff
included the actual raw `npm audit` output rather than a restated table, and it resolves
cleanly: `brace-expansion` carries two separate CVE descriptions under one severity
block, accounting for 2 of the 4 high-severity count on its own. Not a discrepancy — a
misreading on this Brief's part, corrected now that the raw output was available to
check against.

**Shell contract: v1.23, unchanged.** Hash
`6f52449c37b639029023b24055d504182ab2e3ac8edd44d8965799d90847d0d9`, both copies
independently verified per the Handoff.

---

## §12 — unchanged, see v1.50

---

## §13 — Open Governance Items

**CLOSED this version:**
- **WH-38** — Execution Monitoring's variance history is now a `recharts` line chart
  (Planned vs. Actual, two series) in `PPBEProgramDetail.tsx`. Note: the actual build
  target required correction mid-scoping — `PPBEDashboard.tsx` already rendered a
  `BarChart`, not a table; `PPBEProgramDetail.tsx` was the real table. Disclosed plainly
  as Finding F1, not silently redirected.
- **WH-15** — SCRIBE's PPBE exhibit now renders a real `<table>` for figures and a new
  inline-SVG bar chart aggregating obligations by cost code (`aggregateByCostCode()`, a
  genuinely new aggregation — nothing previously summed by cost code).
- **WH-37, code level** — Both `PPBEDashboard.tsx` and `PPBEProgramDetail.tsx` were
  confirmed, by direct code trace, to have been rendering execution-shaped fields
  (obligation rate, on-track badge, variance chart) against Budget Year and Programming
  Year data that structurally can't support them. Real defect, now fixed via an
  `isBudgetYear` gate showing a planning notice instead. **This closes the code-level
  question WH-37 raised. It does not close the live-confirmation gap** — no browser
  automation exists in this repo, and the Handoff explicitly declines to claim
  code-trace evidence is equivalent to what Parts 4/6 received live. Folded into the
  standing live re-walk list below.

**DECIDED THIS VERSION — deferred, joining F2 and D4-6:**
- **D3-6 (module health dots)** — infrastructure is real and complete (three-tier
  live/cache/unavailable fallback, fully implemented). The gap is precisely two things:
  (1) the polling loop that would populate real health data is never started anywhere
  in the codebase, and (2) even if started, a poll completion doesn't currently trigger
  a React re-render, so the dots wouldn't update live even with polling running. Current
  behavior is an honest "unknown" state, not a broken or misleading one. **Decided:
  deferred until continued investment past the demonstrations is confirmed — same
  reasoning as F2 and D4-6.** The two real design questions underneath it (where
  polling starts; how completions reach React) are recorded in the Findings Log
  Addendum so a future session doesn't have to re-derive them. Do not build without a
  fresh decision to un-defer.

**UNCHANGED, still open:** WH-36, WH-46, WH-16, WH-23, WH-5/Program-Health-redesign
bundle, D4-5, D4-9, D4-6, F2, site breakdown's fuller funds-lifecycle columns, LENS
description depth.

---

## §14 — SBOM Status

**Gap now covers Sessions 54 through 74.**

---

## §20 — Backlog status update

Of the four Tier 1 items from the July 29 backlog compilation: **all four are now
resolved.** Three are built and closed (WH-38, WH-15, WH-37's code fix). The fourth
(D3-6) resolved to a real decision, now made: deferred, joining F2 and D4-6 rather than
built. Tier 2 and Tier 3 remain as previously compiled, unchanged by this session.

---

## §21 — CTO Demo Readiness Track

**Still not restated — and the live re-walk list has grown by one item, not shrunk.**
WH-37's code-level fix adds a fourth thing to confirm live, alongside the three already
standing from v1.51 (NEXUS queue vs. Workspace panel counts, ALPHA/DELTA's Home
percentages, one READ_ONLY sign-in): **open a program's Execution Monitoring view, switch
to the BY (FY2027) and BY+1 (FY2028) tabs, and confirm the planning notice actually
renders instead of the execution metrics.** This Brief continues to hold the same
standard it has held since v1.51 — a correct code trace and a live-held confirmation are
different kinds of evidence, and the readiness score waits for the latter.

---

## Key Lessons — Current

Lessons 1-34: see v1.51-v1.53.

**Lesson 35 — a stated correction, tested against the very next session's real output, is
how you find out if it actually held.** Lesson 33 named a hard rule after Session 73's
fabricated Handoff: quote only from real diff output, never reconstruct from intent.
Session 74's Handoff is the first real test of whether that rule stuck — and it did:
every deliverable section traces to an actual `git show --stat`, the per-package test
table sums exactly to the stated total, and WH-37's own evidentiary limits are stated
plainly rather than rounded up to sound more finished. Worth naming as confirmation, not
just hoping the lesson landed — the same discipline this Brief applies to the platform's
own claims applies to whether a stated fix actually changed behavior.

---

*SOVEREIGN Platform Integration Brief v1.54 · July 29, 2026*
*Pre-Decisional · Internal Working Document*

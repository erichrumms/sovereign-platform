# SOVEREIGN Platform — Findings & Resolution Log — Addendum 4
## July 29, 2026 · Governance Agent
## Companion to the July 26 Log, Addenda 1-3, and SOVEREIGN_Remaining_Build_Backlog_20260729.md

---

## Fixed and verified — Session 74

| ID | Finding | Fixed in | Verified how |
|---|---|---|---|
| WH-38 | Execution Monitoring variance history was a table, not a chart | `793fb69` | `git show --stat` confirmed the real diff against `PPBEProgramDetail.tsx` (the actual target — `PPBEDashboard.tsx` already had a `BarChart`, a scoping correction disclosed as Finding F1, not silently redirected). `recharts` LineChart, two series, already a dependency at ^3.9.2 — zero new dependencies. Test updated from a table-cell assertion to a narrative-text and chart-`aria-label` assertion |
| WH-15 | PPBE exhibit rendered as flat bullet text | `39f195f` | Figures table confirmed via `getByRole("table", { name: "Exhibit figures" })`; the old `<ul>` confirmed absent via `queryByRole("list")`. Cost-code bar chart is new inline SVG, deliberately not a new charting dependency (module-scribe had none) — a disclosed tradeoff (Finding F3), not an oversight. `aggregateByCostCode()` is genuinely new aggregation logic, confirmed nothing previously summed obligations by cost code (Finding F2) |
| WH-37 | Execution Monitoring's BY/BY+1 tabs may misapply execution-shaped metrics | `6ed5c27` | **Code-level: closed.** Direct trace confirmed both `PPBEDashboard.tsx` and `PPBEProgramDetail.tsx` were genuinely rendering obligation rate, on-track badges, and variance charts against Budget Year and Programming Year data that structurally can't support them — this was a real defect, not a hypothetical. Fixed via an `isBudgetYear` gate. **Live-level: still open** — no browser automation exists in this repo, and the Handoff explicitly declines to claim code-trace evidence meets the standard Parts 4/6 received live. Added to the standing live re-walk list (Integration Brief v1.54 §21) |

---

## Investigated, decided this addendum — deferred, not built

**D3-6 (module health dots).** Correctly not built during Session 74, per its own
explicit scope ("investigate first, do not guess"). The investigation is precise: real,
fully-implemented three-tier health infrastructure exists (`HealthDot` component,
`startHealthPolling()`, `pollModule()` with live→cache→unavailable fallback), but two
specific things prevent it from ever showing real data —

1. `startHealthPolling()` is never called anywhere in the codebase.
2. Even if it were, a poll completion mutates the underlying data but does not
   currently trigger a React re-render — the host's `forceRender()` is only called
   after module mount, not after a health poll resolves.

**Current behavior is honest, not broken:** dots show a muted "unknown" state with an
accurate `aria-label`, not a stale or misleading status. **Decided: deferred, joining F2
and D4-6** — real production-infrastructure investment held until continued investment
past the demonstrations is confirmed, the same standing judgment applied consistently
throughout this arc. Two real design choices sit underneath it regardless of timing —
where polling starts (app init vs. a host-level `useEffect`), and how poll completions
reach React (a callback parameter vs. a separate polling loop calling `forceRender`
directly) — recorded here so whoever picks this up next, whenever that is, doesn't have
to re-derive them.

---

## Status as of Session 74's close

**All four of the July 29 Tier 1 backlog items are resolved.** Three built and closed
(WH-38, WH-15, WH-37's code fix); the fourth (D3-6) correctly resolved to a decision,
now made: deferred alongside F2 and D4-6. No fabrication risk observed this session;
Handoff evidence quality is a confirmed improvement over Session 73 (Integration Brief
v1.54 §21, Lesson 35).

**Live re-walk list, now four items, still the sole remaining gate before a new
CTO-demonstration readiness score:**
1. NEXUS's Travel & Time Queue vs. the Reviewer's Workspace NEXUS Travel panel counts
2. Home Dashboard's ALPHA/DELTA obligation percentages
3. Home Dashboard under READ_ONLY — honest empty state, not a lockout
4. **New:** Execution Monitoring's BY/BY+1 tabs — planning notice renders, not execution
   metrics

---

*Findings & Resolution Log Addendum 4 · July 29, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
*Companion to `SOVEREIGN_Walkthrough_H_Findings_Resolution_Log_20260726.md`, Addenda 1-3, and `SOVEREIGN_Remaining_Build_Backlog_20260729.md`*

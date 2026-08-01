# SOVEREIGN Platform — Remaining Build Backlog (v2)
## Superseding SOVEREIGN_Remaining_Build_Backlog_20260729.md
## July 30, 2026 · Governance Agent

**What changed since v1:** eleven of the twelve original items are now closed, deferred
by real decision, or substantially de-risked. Two new items surfaced during Walkthrough
I (WH-51, WH-43 remains the standing exception). This is a near-total clearance of the
backlog compiled just one day ago — worth stating plainly rather than letting the old
document keep circulating as if it still describes open work.

---

## Closed since v1

| ID | Item | Closed in | Note |
|---|---|---|---|
| WH-38 | Variance history: table → line chart | Session 74 | `recharts`, zero new dependency |
| WH-15 | PPBE exhibit: bullets → table + cost-code chart | Session 74 | Table + inline-SVG chart, zero new dependency |
| WH-5 bundle | Program Health redesign (Dependency Health Index, Learning Velocity, per-tile variance, POC) | Session 75 | First real shell-contract change this arc (v1.23→v1.24, GD-30) |
| WH-16 | SCRIBE correspondence status in NEXUS | Session 75 | Read-only, one direction, as scoped |
| WH-36 | To Do/Review visual consistency | Session 75 | Uniform layout across all modules |
| WH-23 | ARC reframe (hypothetical → real program-grounded) | Session 75 | Full reframe; live-confirmed clean in Walkthrough I, zero findings |
| WH-48 | Variance narrative: prose → table | Session 76 | Both Dashboard and Detail locations |
| WH-49 | PY selection not carried into program Detail (defaulted to CY) | Session 76 | Real bug, found live during Walkthrough I; fixed and given cross-fix test coverage with WH-37 |
| WH-52 | Floating sidebar badge | Session 76 (investigation) | Confirmed as the existing `InfoBadge` hover tooltip, not a defect |

## Decided, not built — deferred by real decision

| ID | Item | Status |
|---|---|---|
| D3-6 | Module health dots | Investigated Session 74; infrastructure real but polling never started and wouldn't trigger a re-render if it were. **Decided: deferred**, joining F2 and D4-6 |
| F2 | Shared-helper extraction (7 module-local session stores) | Unchanged, deliberately deferred |
| D4-6 | API key architecture (live-tier hosting) | Unchanged, deliberately deferred |

## Substantially de-risked, live-confirmed with one real nuance

**WH-37 (BY/BY+1 execution-metric gating).** Closed at the code level Session 74.
Walkthrough I Part 2 substantially exercised this live — navigating PY→CY→program is
literally how WH-49 was discovered, which means the PY/CY/BY tab-switching flow was
genuinely tested, not just the code path. **What wasn't explicitly captured:** no
screenshot shows the actual planning-notice text rendering under BY/BY+1 specifically.
Very likely fine given how directly adjacent testing happened, but this Brief won't
claim a confirmation it doesn't have a screenshot for. A 30-second re-check (open a
program, click BY, confirm the planning notice text is there) would close this
completely.

**WH-34 (Home Dashboard obligation percentages) and the Program Health metric boxes.**
Reviewed directly during Walkthrough I Part 1 — Dependency Health Index and Learning
Velocity confirmed rendering correctly and matching their traced source values, no
percentage-math complaint raised. Treated as substantially confirmed; the single
remaining live-walkthrough item that was never actually reached is WH-43, below.

**WH-50 (Activity & Decisions log integrity).** Investigation extended platform-wide in
Session 76's supplemental round — every `HUMAN_DECISION` emission site on the platform
confirmed to fire only from click handlers, never a `useEffect`. Substantially
reassuring. The one thing code can't answer — whether the specific entries observed
during the walkthrough came entirely from scripted steps — still wants the clean,
isolated re-test proposed in the Walkthrough I Findings Report.

---

## Still genuinely open

| ID | Item | Status |
|---|---|---|
| **WH-43** | **NEXUS Travel & Time Queue count vs. Reviewer's Workspace badge count** | **Never attempted during Walkthrough I. This is the single item this entire arc has been organized around, and it remains completely untouched — the platform's most-tracked defect pattern, code-verified since Session 71, never live-confirmed. This is the one thing that should happen before the readiness score is restated.** |
| WH-51 | SCRIBE's queue-clears-on-send behavior | Raised twice during Walkthrough I, never answered. Real design question, not a bug — likely intentional (matches VIGIL's pattern) but not confirmed as the Project Principal's actual preference |
| WH-46 | NEXUS Time Record redesign (weekly grid) | Unchanged, raised not decided |
| WH-21 | NEXUS Home tile doesn't reflect the Travel & Time Queue | Unchanged, raised not decided |
| — | Site breakdown's fuller funds-lifecycle columns (Planned/Available/Committed/Obligated/Costed) | Unchanged, flagged as future backlog |
| — | LENS description depth | Unchanged, low priority |
| — | SBOM Registry merge | Gap now covers Sessions 54-76, still mechanical and unresolved — blocked on not having the individual session SBOM source files available to merge |

---

*Remaining Build Backlog v2 · July 30, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*

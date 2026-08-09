# SOVEREIGN Platform — Remaining Build Backlog (v3)
## Superseding SOVEREIGN_Remaining_Build_Backlog_v2_20260730.md
## August 6, 2026 · Governance Agent
## Corrected August 9, 2026 · Governance Agent — cost-tracking site count fixed before placement (see note)

**Pre-placement correction note:** the "New items from tonight's own findings" table
below originally said "4 real live-call sites" without cost tracking while listing
five named sites — an arithmetic error caught and corrected in the August 6
Integration Brief v1.58 reconciliation, but not yet applied here since this document
was never placed until now. Corrected below: **5** sites, not 4. Nothing else in
this document was touched. Also worth knowing, not itself a correction: this
document reflects state through Session 95; Session 96 (Integration Brief v1.58 and
GD Registry placement) and this arc's STRATA Phase 0 work both postdate it and are
not reflected here. A fresh v4 pass is warranted at some point, not urgent tonight.

---

**What changed since v2:** WH-43 — the item v2 was entirely organized around — is now
genuinely closed, not just code-fixed. An entire new capability (cost tracking, GD-31
through GD-35) was built, closed, and verified. A real governance-document accuracy
problem was found and fixed. One new, more precise gap was found in the process: cost
tracking covers 14 of the platform's 19 real live-call sites, not all of them —
narrower and more specific than "some sites are untracked" was before tonight.

---

## Closed since v2

| ID | Item | Closed in | Note |
|---|---|---|---|
| WH-43 | NEXUS Travel & Time Queue count vs. Reviewer's Workspace badge count | Session 92 | Not a confirmation — the Session 71 fix itself was found to be wrong (over-counted ESCALATED items). Reverted to ROUTED-only. Permanent parity test added (Check 7), since extended to 5 of 7 Workspace tabs |
| GD-31 | Token & Cost Telemetry | Session 77 | 10 real live-call sites instrumented; zero prior cost visibility existed |
| GD-32 | SysAdmin Cost Dashboard | Session 78 | Session-scoped; live-verified working end to end |
| GD-33 | Program & Staff Data Foundation | Session 79 | 56 staff, 8 teams, expanded programs both systems, T&T expansion |
| GD-34 | Cost-tracking observability (failure category, duration, truncation signal) | Session 87 | Grew from a reflection session examining GD-31/32's own real gaps |
| GD-35 | F5 — 4 PPBE advisory-panel call sites instrumented | Session 88 | Cost Dashboard coverage 10 → 14 of 19 real sites |
| — | SUPERVISOR role + FLOWPATH access | Session 91 | Deferred since docs/34's original Phase 3 scope |
| — | Live credential bug (invalid API key value) | Session 85 | Root cause of every "Static" result across an entire evening |
| — | Browser-compatibility bug (`process.env` crash) | Session 80 | Was silently sending every live call to fallback, platform-wide |
| — | AGENT_REFERENCE.md rule-citation accuracy gap | Sessions 94–95 | Rules 11/12 formalized for real; a phantom cross-reference removed |
| — | `useTTIntake.test.tsx` pre-existing failure | Session 95 | Real root cause: test-data drift (unfixed wall-clock dependency), not a regression |

## Decided, not built — deferred by real decision (unchanged from v2)

| ID | Item | Status |
|---|---|---|
| D3-6 | Module health dots | Deliberately deferred |
| F2 (original) | Shared-helper extraction (7 module-local session stores) | Deliberately deferred |
| D4-6 | API key architecture (live-tier hosting) | Deliberately deferred |

## New items from tonight's own findings, genuinely open

| ID | Item | Status |
|---|---|---|
| **Cost coverage gap** | **[Corrected — 5 sites, not 4] 5 real live-call sites still without cost tracking: FLOWPATH's `useFlowpathElicitation`, APEX's `useApexAnalysis` (product event, different taxonomy), and 3 COUNSEL `REASONING_STEP_*` sites (different event type by design)** | **Found via Session 81's full audit, independently re-derived and confirmed in the August 6 reconciliation. Real total live-call sites: 19, not 18** |
| `deployment_feedback` | Missing from every `AGENT_STEP_COMPLETE` event platform-wide. Confirmed real, deliberate, well-documented forward-contract for an unbuilt Intelligence Layer — cannot be honestly populated today (Session 90 finding) | Real governance decision needed: design real capture, or formally scope down the "every event" expectation |
| Rule 14 | Explicitly reserved, unassigned in AGENT_REFERENCE.md v3.4 | **Decided August 6: deliberately, permanently left unassigned.** No longer open |
| AGENT_REFERENCE.md Lessons 13–23 | A structural gap the document itself flags — these lessons exist only in older Integration Brief material, never backfilled | Still open, flagged again in Session 95 |
| SBOM Registry merge | Now covers Sessions 54–76 **plus 18 more real per-session SBOMs (v1.45 through v1.62) from tonight's arc** | Larger than before, not smaller — mechanical but now more urgent |

## Still genuinely open, unchanged from v2

| ID | Item | Status |
|---|---|---|
| WH-51 | SCRIBE's queue-clears-on-send behavior | Real design question, never decided |
| WH-46 | NEXUS Time Record redesign (weekly grid) | Unchanged, raised not decided |
| WH-21 | NEXUS Home tile doesn't reflect the Travel & Time Queue | Unchanged, raised not decided |
| — | VIGIL's broader alert taxonomy (honeytoken/threshold-breach signals) — relevant to any future agent-fleet security oversight work | Flagged early this arc, never directly checked |
| — | Stage 2 persistence (`docs/28`) | The standing decision every cost-trend/history feature depends on. Still fully open — **worth noting: STRATA's proposed Layer 1 connector, if pursued, may resolve this incidentally; better decided deliberately than discovered by accident (see STRATA Work Scope §8)** |
| — | GovCloud / R7 | Confirmed dormant by design, unreachable from products. Not urgent |
| — | Production backend-proxy migration for live API calls | Explicitly a dev/demo-only posture today; real production concern, not urgent now |
| — | Site breakdown's fuller funds-lifecycle columns | Unchanged, flagged as future backlog |
| — | LENS description depth | Unchanged, low priority |

---

*Remaining Build Backlog v3 · August 6, 2026 · Governance Agent*
*Cost-tracking site count corrected August 9, 2026*
*Pre-Decisional · Internal Working Document*

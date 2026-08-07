# SOVEREIGN Platform Integration Brief
## Version 1.58 | August 6, 2026 | Governance Agent

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.57 (July 30, 2026)
**Status:** Reconciled against real repository state via a Build Agent audit pass
(reconciliation report, commit `75db6d9`; follow-on gather, commit `768aba6`) —
not a self-report, not carried forward from a prior session's own claims.

**Changed this version:** Everything below was checked against the real repo, not
assumed from the prior Brief or from this conversation's own record. Where v1.57
or this conversation's earlier working drafts were found stale or wrong, it's
stated plainly below rather than silently corrected.

---

## 1 — Platform Identity

SOVEREIGN: a governed, AI-aligned operations platform. Six products (COUNSEL,
SCRIBE, VIGIL, LENS, CPMI, AgentOS), companion modules (NEXUS, APEX, FLOWPATH,
ARIA Suite), the Reviewer's Workspace, two governed workflow layers (Time &
Travel, PPBE), and a named-but-unbuilt Intelligence Layer.

---

## 2 — Shell Contract Version History (reconciled against real repo)

| Version | Session / GD | Real change | Confidence |
|---|---|---|---|
| v1.24 | GD-30, Session 75 | `point_of_contact?` added to `ProgramStatusSnapshot` | High — unchanged from v1.57 |
| v1.25 | Pre-Session 79 | Present at GD-33's session open per `SESSION_GD33_HANDOFF.md`. **Origin not independently re-verified in this reconciliation pass** — plausibly GD-31/Session 77's `token_usage?` addition, not confirmed directly this pass | Medium — flagged, not asserted |
| v1.26 | GD-33, Session 79 | `reports_to?` added to `SovereignUser` | High — confirmed |
| v1.27 | GD-34, Session 87 | `fallback_category?`, `duration_ms?`, `stop_reason?`, `responded_at?` added to `SovereignLogEvent` | High — confirmed |
| **v1.28** | **Session 91** | **`SUPERVISOR` added to `SovereignRole` union — current version as of this reconciliation.** Executed under GD-33's deferred scope; **no separate GD number was issued for this specific bump** | High — confirmed, with the no-separate-GD note as new information |

Both copies confirmed at hash `c99355ce...` (matching). **Confirm this is still
current before relying on it** — HEAD moves with every session; this reflects
state as of commit `768aba6`.

---

## 3 — Governance Decisions This Arc (GD-31 through GD-35)

GD-31 (Token & Cost Telemetry, Session 77), GD-32 (SysAdmin Cost Dashboard,
Session 78), GD-33 (Program & Staff Data Foundation, Session 79) are confirmed
present in `SOVEREIGN_GD_Registry_20260730.md`.

**GD-34 and GD-35 are real, executed decisions with real shell-contract and test
consequences — but were never entered into the GD Registry.** The registry file
still reads "next available: GD-34" despite both having already shipped. See the
companion GD Registry update (`SOVEREIGN_GD_Registry_20260806.md`) for the
correction. Next available number after this update is **GD-36**.

---

## 4 — Cost Tracking

Real token counts, dollar estimates, failure categorization, response duration,
and a truncation signal, at **14 of 19 real live-call sites** — not 14 of 18 and
not 14 of 14, both of which appeared in earlier working drafts this arc. Verified
directly against source: 14 instrumented sites confirmed by `token_usage` /
`computeEstimatedCostUSD` wiring; 5 sites confirmed uninstrumented by the same
check returning no output.

**Disclosed coverage gap — 5 sites, named:**
- COUNSEL: `useAnalysis.ts`, `useCounterargument.ts`, `usePreMortem.ts` (all emit
  `REASONING_STEP_COMPLETE`, no `token_usage`)
- FLOWPATH: `useFlowpathElicitation.ts`
- APEX: `useApexAnalysis.ts`

Session-scoped only — no cross-session persistence exists (Stage 2, `docs/28`,
remains undecided). Cost Dashboard lives inside the Reviewer's Workspace, gated
`SYSTEM_ADMIN`/`PLATFORM_ADMIN`.

---

## 5 — Staff & Program Data (GD-33)

56 real synthetic employees across 8 teams, each with a dedicated Supervisor
reporting to the Project Principal via `reports_to`. Real data files confirmed
present: `sovereign-data/src/synthetic/staff-seed.ts`,
`sovereign-data/src/entities/employee.ts`,
`sovereign-data/src/entities/staff-project-assignment.ts`,
`sovereign-data/src/entities/program.ts`. Figures (PPBE 5→15, World Model
11→18, travel requests 8→42, time records 6→30) were not independently
re-counted from raw data in this reconciliation pass — file presence confirmed,
figures carried forward from prior verification.

---

## 6 — Reviewer's Workspace — 7 Tabs, 5 with Permanent Parity Coverage

VIGIL Approvals, ARIA Certifications, SCRIBE T&T Reviews, NEXUS Travel, FLOWPATH
Review, Cost Dashboard, Activity & Decisions. **5 of 7 carry a permanent,
automated parity test** — confirmed directly this pass: both
`e2e/tests/workspace-badge-parity.test.tsx` and
`e2e/tests/nexus-flowpath-workspace-convergence.test.tsx` are real, present, and
contain the expected per-tab and Check-7 assertions.

**WH-43 is genuinely resolved**, not just re-confirmed. The original fix was
found, via a live check, to have over-counted by exactly one — treating an
already-escalated, read-only item as still actionable. Reverted to the correct
filter; Check 7 in `nexus-flowpath-workspace-convergence.test.tsx` (added
Session 92) is the permanent regression guard.

---

## 7 — Rulebook Status — AGENT_REFERENCE.md v3.4

Rules 1–14 are formally defined in the main `AGENT_REFERENCE.md` (confirmed at
lines 1433–1648 this pass). **Rules 15–17 exist, verbatim, only in
`AGENT_REFERENCE_Addendum_20260730.md`** — not merged into the main document.
Any statement that "Rules 1-14 and 15-17 are now all formally defined" in
`AGENT_REFERENCE.md` itself is inaccurate until a real v3.5 merge happens. This
is an open item, not urgent for demo prep.

**Rule 14 is deliberately, permanently unassigned per Project Principal decision,
August 6, 2026.** Session 94's exhaustive search found no informal usage, no
citation, no half-remembered principle to formalize. Manufacturing a rule to
close the number would itself violate the discipline the rulebook exists to
protect. This is now a closed decision, not an open item.

**New, unresolved finding from this reconciliation pass — needs a direct
check, not yet done:** `AGENT_REFERENCE.md` appears to contain **two different
rule-numbering sequences**. Lines 739–751 define a "Rule 1, 2, 3" with Rule 2
reading "the shell-contract hash must match before any build work begins."
Lines 1433 onward define a separate, complete "Rule 1 through 14," with Rule 2
there reading "prompts are approved before they run live" — different content,
same number. Rules 1 and 3 look like near-duplicates across both locations;
Rule 2 does not. This needs a direct Build Agent check: is the 739–751 block
stale leftover content from before a restructure, or something else entirely?
Flagged here rather than resolved, per the same discipline that caught the
Session 93 "Rule 11" citation issue below.

**Historical citation note, preserved not corrected:** Session 93's own Handoff
and SBOM update cite "Rule 11" to mean the shell-contract-bump parity-reporting
rule — now Rule 13. Those historical documents are accurate for their time and
are not being modified; this note exists so a future reader doesn't misread the
citation. (Consistent with how GD-32's "GD-31 Build Session 2" mislabeling in
its own historical documents was handled — flagged, not erased.)

**Lessons 13–23 gap** remains open, flagged for a third time as of Session 95
(previously July 21 and again in Session 95's own Handoff). The content is
believed to already exist in older Integration Brief material, unmerged — a
backfill task, not a from-scratch content problem. Scoped as a real follow-up
session, not urgent for demo prep.

---

## 8 — Test Suite (verified via Session 95 real evidence)

**2,050 JS/TS+e2e passing, 0 failing** — this breaks down as **1,890 non-e2e +
160 e2e**, a detail earlier drafts this arc omitted. **+ 195 Python passing.
Platform total: 2,245.** All 15 workspaces `tsc --noEmit` clean (confirmed:
exit code 0 across all 15). Growth of 108 JS/TS+e2e tests since the Session 76
baseline of 1,793 JS/TS + 149 e2e.

**Note on comparability:** v1.57's 2,137 baseline and this version's 2,245 are
not a clean apples-to-apples delta, because the two totals present the
JS/TS-vs-e2e split differently. The real, current, single number to cite is
**2,245 total, 0 failing.**

---

## 9 — Known Open Items

- **Cost-tracking coverage gap — 5 sites, not 4** (see §4). Real decision needed
  on whether to close it.
- **Rules 15-17 merge** — real, defined content sitting in an unmerged Addendum.
- **Duplicate Rule 2/3 numbering** — new finding, needs a direct check (§7).
- **Lessons 13-23 gap** — flagged three times, believed low-risk to fix, not yet
  scoped as an active session.
- **Rule 14** — closed: deliberately, permanently unassigned.
- `deployment_feedback` — confirmed as a deliberate, honest, currently-unfillable
  Intelligence Layer forward-contract, not an oversight.
- COUNSEL/LENS access loss for the 8 new Supervisors — a real, disclosed side
  effect of Session 91's role reassignment.
- Stage 2 persistence (`docs/28`) — the standing decision every cost-trend/
  history feature depends on. Still fully open.

---

## 10 — CTO Demonstration Readiness

**Target: Advance, unconditional.** The self-correction record for the demo is
**four** real, evidence-backed instances — Session 73 (fabricated Handoff),
Session 75 (snapshot-count error), Session 92 (WH-43's original fix found
wrong), Session 94 (docs/36 citation-accuracy problem). WH-43 **is** the
fourth, not a fifth on top of four — that framing, which appeared in one
working draft of the System Prompt this arc, double-counted Session 92. The CTO
Demonstration Script and Strategic Plan already state the correct count.

---

*SOVEREIGN Platform Integration Brief · v1.58 · August 6, 2026 · Governance Agent*
*Reconciled against real repository state, not carried forward from prior claims*
*Pre-Decisional · Internal Working Document*

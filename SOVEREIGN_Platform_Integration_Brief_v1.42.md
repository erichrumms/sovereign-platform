# SOVEREIGN Platform Integration Brief
## Version 1.42 | July 12, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional - Internal Working Document
**Supersedes:** Integration Brief v1.41
**Changed this version:** This Brief had gone unmaintained for five build sessions
(27-31) - it was still describing shell contract v1.15, 1288 tests, PPBE "not yet
started," and Time and Travel as un-built, all of which changed across Sessions
27-31 without this document being updated. That gap is itself worth naming: Rule
1 says the Brief should be current in the repo at every session open, and for
five sessions that wasn't true. This version reconciles all of it in one pass.
Time and Travel: fully built, walkthrough-clean (Sessions 27-30). PPBE: Core
Integration build session complete (Session 31); Full Cycle (Session 32) next.
Shell contract v1.15 to v1.16 (GD-21, Session 28). Prompt count resolved to
16 (was ambiguously tracked as 14/16 across recent documents - see section 18).
Test count 1288 to 1690 (with JS/Python split, see section 11). New incident and
new standing process (section 11): a document can be generated without being
committed, and a claim of "delivered" is not evidence - a preflight check now
runs before every session open specifically to catch this. Sections 4, 11, 13,
14, 17, 18, 19, 20, 21 all substantially rewritten.

---

## Section 1 - What This Document Is

(unchanged - see v1.40 or earlier for full text)

---

## Sections 2-10 - (unchanged from v1.40, except as noted below)

(Claude Chat does not currently hold the full text of these sections in this
conversation's context. Nothing in Sessions 27-31 is known to require changes
here. If that changes, this note should be replaced with real content, not
carried forward silently.)

---

## Section 4 - The SOVEREIGN Portfolio Pipeline

FLOWPATH DONE -> Intelligence Layer -> CPMI DONE -> AgentOS DONE -> NEXUS DONE -> APEX DONE -> ARIA Suite DONE
Companion Suite: COUNSEL DONE, SCRIBE DONE, LENS DONE, VIGIL DONE - COMPLETE
ARIA Suite: CLEAR DONE, TRACER DONE, ARC DONE - ALL LIVE
CPMI-VRS Gate 3 UNBLOCKED - not yet attested (Project Principal action)
Time and Travel: WALKTHROUGH-CLEAN (Sessions 27-30). D-TT1 through D-TT7 all decided
(D-TT7: Option A, entities reaffirmed unchanged). GD-21 taken
(three HumanDecisionType additions, shell v1.15 to v1.16). One
tracked non-blocking item remains: a cross-module state gap
(VIGIL escalation authorization doesn't flip SCRIBE's item to
"sendable" live, same session) - real demo risk, unscheduled,
resolve before final rehearsal at the latest.
PPBE: D-P1 through D-P7 all decided (D-P7: Option A). docs/18 PPBE Workflow
Architecture.md - COMPLETE, approved build spec, committed
(b4d6ea8) after a same-day incident where it was generated but
not placed in the repo for several sessions - see section 11.
Build Session 1 (Core Integration) - COMPLETE (Session 31): six
D-P3 entities live, four PPBE Logger event types (Python-only),
FLOWPATH/NEXUS/VIGIL components built, two deterministic
monitoring agents implemented.
Build Session 2 (Full Cycle) - NEXT (Session 32): four remaining
agents, four prompts to author in-session.

---

## Section 11 - Current Build Status

### Stages 1-6 - COMPLETE - Walkthroughs A-D - COMPLETE (all 12 gap findings closed)

Total tests: 1690 (1516 JS/TS + 174 Python), freshly run at Session 31 close,
July 12, 2026. State the split explicitly - a bare combined number has caused
confusion twice already (Session 29's "1559" was a counting-method error;
Session 30's "1414" was later discovered to be the JS-only figure, not the
platform total, once Session 31 added Python tests to the same run and the
arithmetic didn't match until the split was made explicit). Going forward, cite
both numbers or don't cite a total at all.

### Time and Travel - Built and Walkthrough-Clean (Sessions 27-30)

D-TT1 through D-TT6 were decided June 29, 2026 (confirmed, per v1.41). D-TT7 (reconsider
D-TT3 given external connectivity) was decided July 12, 2026 - Option A: the six
data-dictionary entities are reaffirmed unchanged, retrofit deferred to a
trigger-conditioned future GD (TT-EXT-GD, inactive).

Session 27 (Core Integration) and Session 28 (Full Cycle) built the full
pipeline. Session 28 also executed GD-21 - HumanDecisionType gained three
members (TRAVEL_APPROVAL, TIME_CORRECTION_SENT, ESCALATION_AUTHORIZED),
taking the shell contract from v1.15 to v1.16
(521a62daa77a1986a6e23fc2ee29c5bedf082933d7c42b4cd25eb0e7b4fd5fb7) - and
resolved TT-PRODUCT-GD (Time and Travel alerts attribute sourceProduct:
"VIGIL" rather than adding a new SovereignProduct value).

Walkthrough E (live) found three real gaps (no traveler intake form, a third
recurrence of the Gap 3 contrast issue, no synthetic data). Session 29 fixed all
three - Gap 3 was root-caused this time (the shell's module outlet had no
background of its own) and fixed centrally with 60 regression tests, not
spot-patched a third time. Walkthrough E-2 confirmed those fixes live and found
one critical new issue: the travel approval path never invoked the drafting
engine at all. Session 30 root-caused and fixed it (a clean wiring gap, 9
regression tests), fixed two decision-note UX findings, built the platform
landing page (previously blank on load), and formally verified docs/19
(v1.0 to v1.1).

Time and Travel is now walkthrough-clean. One tracked item remains, surfaced by
Session 30 but not yet scheduled: a cross-module state gap - VIGIL authorizing
an escalation doesn't flip SCRIBE's corresponding item to "sendable" within the
same session. Real demo risk. Resolve before final rehearsal at the latest.

### PPBE - Build Started, Core Integration Complete (Session 31)

D-P1 through D-P6 were decided June 29, 2026 (per v1.41's reconstruction record).
D-P7 was decided July 12, 2026 - Option A, matching D-TT7's shape: the six
entities are reaffirmed unchanged, retrofit deferred to PPBE-EXT-GD (inactive).

docs/18_PPBE_Workflow_Architecture.md - a real incident worth recording
plainly. It was authored and delivered July 11, and every governance document
written after that point (System Prompt versions, the Agent-to-Agent Briefing,
the Transfer Handoff) described it as "delivered" - but it was never actually
committed to the repository. Session 31 opened against that false premise and
correctly Hard-Stopped rather than substituting a different document or
guessing at scope. The Project Principal committed it live during the
session-open gate cycle (b4d6ea8), and the session re-opened clean.

This is now a standing process, not a one-time fix. A preflight_check.sh
script runs in Terminal 2 before every session opens, checking a literal
manifest of files Claude Chat has described as needing commitment against
git ls-files - not against any document's prose claim of "delivered." The
underlying principle: a generated document is not a committed one, and a claim
of completion is not independent evidence of it, including Claude Chat's own
prior claims.

PPBE Build Session 1 (Core Integration) - COMPLETE, Session 31, July 12.
Six D-P3 entities live in sovereign-data/src/entities/: StrategicObjective,
ProgramRecord (extends Program), BudgetExhibit, ObligationRecord,
EvaluationFinding, DependencyMap (sovereign-data 1.4.0 to 1.5.0). Four PPBE
Logger event types added Python-only (APPROVED_EVENT_TYPES 95 to 99):
PPBE_DECISION, PPBE_PHASE_TRANSITION, PPBE_ANOMALY,
PPBE_EVALUATION_FINDING - PPBE_DECISION additionally added to the runtime-
enforced HUMAN_DECISION_EVENTS set. FLOWPATH's four PPBE artifact types, NEXUS
PPBE task/correspondence schemas (riding the existing GD-11 work-request state
machine, a deliberate and correct deviation from the Time and Travel precedent),
and VIGIL's three-tier authorization architecture are all built and tested. Two
deterministic monitoring agents (ppbe-ledger-monitor, ppbe-dependency-tracker)
implemented - confirmed deterministic per the Agent Registry, overriding
docs/18 section 5's self-flagged-as-unconfirmed "LLM-backed" inference. 128 new
tests. Shell contract untouched this session.

PPBE Build Session 2 (Full Cycle) - NEXT, Session 32. Scope per docs/18
section 7.2: four remaining agents (ppbe-evidence-synthesizer,
ppbe-scenario-analyst, ppbe-exhibit-drafter, ppbe-coordination-assistant),
all requiring prompts authored in-session and marked PENDING, per the
AGENT_REFERENCE.md prompt-authorship reassignment.

Standing rule adopted this session, applies to Session 32 and beyond: where
docs/18 contradicts the Agent Registry on a fact the Registry states
specifically (agent nature, prompt requirement, credential profile), the
Registry wins by default - proceed, log the discrepancy, don't stop and wait.
This is distinct from docs/18 being genuinely silent on something load-bearing
(the way it never scoped entity registration at all for Session 31) - that
remains a real Hard Stop.

### AIS-dedupe, npm-dev-vulns, Gate 3/4 - Unchanged from v1.41

AIS-dedupe remains resolved (c3684f0). npm-dev-vulns remains deferred to
the Stage 5+ Vite major-version review, not an open decision. CPMI-VRS Gate 3
for ARIA Suite remains unblocked and not yet attested - Project Principal
action, own pace, no build dependency.

---

## Section 13 - Open Governance Items

CLOSED this version: D-P7, D-TT7 (both decided, Option A), TT-GD (became
GD-21), TT-PRODUCT-GD, TT-PROMPTS (both prompts approved alongside D-TT7),
PPBE-SPEC (docs/18 exists, committed, approved for build).

Open items, target:
- Cross-module state gap (new): VIGIL authorizing an escalation doesn't flip SCRIBE's item to "sendable" live, same session. Real demo risk, resolve before final rehearsal, unscheduled.
- PROMPT-COUNT (resolved, noting for the record): Was tracked ambiguously as 14/16. Resolved: 14 (this Brief's pre-TT-approval baseline) plus 2 (TT prompts, approved alongside D-TT7, July 12) equals 16. Session 31's SBOM "14, no change" was a stale carried-forward figure. Session 32 confirms via direct file count regardless.
- docs/18 section 5 correction (new): Marks both PPBE monitoring agents LLM-backed with dedicated prompts; the Registry and the Project Principal's Session 31 decision say deterministic, no prompts. Fold correction into docs/18 next revision.
- docs/18 section 3 elaborations (new): Three placeholder-level entity field shapes were concretely defined during Session 31's build. Fold into docs/18 section 3, elaboration not amendment.
- SBOM cumulative merge backlog (new): Cumulative registry last merged through Session 26 (v1.27_MERGED); Sessions 27-31 update files exist but are unmerged, five sessions of backlog. Needs the current cumulative SBOM_Registry content to complete; non-blocking but growing.
- Integration Brief maintenance gap (new, process note): This Brief went unmaintained for five build sessions (27-31) despite Rule 1's "always current" standard. Standing process reminder, update every close cycle, no exceptions.
- TT-POLICY-ENTITY: No TimePolicy entity among the six D-TT3 entities; implemented as module-level config instead. Non-blocking candidate.
- Travel-decision taxonomy overlap: TRAVEL_APPROVAL (GD-21, an act) vs TRAVEL_APPROVED/DENIED/ESCALATED (v1.0, outcomes), near-identical naming. Candidate consolidation GD, non-blocking.
- AIS event-name drift: Agent Identity Standard lists Logger event names never added to any approved taxonomy; code correctly ignores them. Housekeeping only.
- PPBE-RECORD: Original D-P1 through D-P6 governance record still not located; reconstruction stands in. Search further, or formally accept the reconstruction.
- ARIA-EXPORT-GD: Candidate GD, destination/recipient fields on AriaCertification. Future session.
- COUNSEL-GD: Candidate GD, regulation_basis field. Future session.
- docs/16-Supervision-Efficiency: Confirmed absent by direct grep (Session 27), not merely unverified. Project Principal: add retroactively or formally waive.
- PROMPT-REGISTRY-DRIFT: Two FLOWPATH prompt-registry entries don't match disk. Claude Code, next FLOWPATH-adjacent session.
- gather_repo_integrity_check.sh: Standing hygiene tool exists in repo root; preconditions long met. Recommend running soon.
- F-2: 8 agents implemented-but-not-carded (2 NEXUS plus 6 AgentOS core). Low priority, not demo-path.
- PPBE-EXT-GD / TT-EXT-GD: Deferred, trigger-conditioned retrofit GDs. Inactive until a real connector is proposed.
- REVIEW-SCOPE: Ungated proposal. Deprioritized given demo timeline.
- npm-dev-vulns: Deferred to Stage 5+ (not an open decision). Tracked only.
- iCloud-cleanup: Includes disposing of dead v1_2/v1_3 files and the growing pile of superseded Integration Brief versions sitting in repo root. Recommended.

---

## Section 14 - SBOM Status

Base cumulative registry: SBOM_Registry_v1.27_MERGED.md, current through
Session 26 only. Five session-update files exist and are committed
(SBOM_Session27_Update.md through SBOM_Session31_Update.md) but have not
been merged into a new cumulative version - this Brief cannot state an accurate
merged component list without that base content. This is real, growing
technical debt in the documentation, not the codebase.

Shell contract: v1.16 (521a62daa77a1986a6e23fc2ee29c5bedf082933d7c42b4cd25eb0e7b4fd5fb7),
changed from v1.15 by GD-21 (Session 28). Tests: 1690 (1516 JS/TS plus 174 Python).
0 production vulnerabilities.

---

## Sections 15-16 - (unchanged from v1.40)

---

## Section 17 - Primary Product Inserts

CPMI - Stage 3 - COMPLETE, VRS certified
AgentOS - Stage 4 - COMPLETE
NEXUS - Stage 4 - COMPLETE
APEX - Stage 5a - COMPLETE, VRS certified
FLOWPATH - Stage 5b - COMPLETE, VRS certified
ARIA Suite - Stage 6 - FEATURE-COMPLETE, Gate 3 unblocked, not attested
Time and Travel - Workflow layer - WALKTHROUGH-CLEAN (Sessions 27-30). D-TT1 through D-TT7 all decided. One tracked non-blocking item (cross-module state gap).
PPBE - Workflow layer - D-P1 through D-P7 all decided. Build Session 1 (Core Integration) COMPLETE (Session 31). Build Session 2 (Full Cycle) next (Session 32).

---

## Section 18 - Agent and Prompt Registry

Agent registry: 44 total - confirmed via the authoritative registry table,
not a naive grep. 36 master-table entries (6 of which are PPBE agents) plus 8
tt.* agents. Two PPBE agents (ppbe-ledger-monitor, ppbe-dependency-tracker)
advanced Registered to Implemented in Session 31.

Approved prompts: 16, resolved this version. v1.41 stated 14, explicitly
before the two Time and Travel drafting prompts were formally approved
(approval was gated on D-TT7, not yet decided as of v1.41). D-TT7 was decided
July 12 and both TT prompts were approved the same day, per the Transfer
Handoff record - bringing the count to 16. Session 31's SBOM update stated
"14, no change," which did not account for that approval event and should be
treated as stale rather than authoritative. Session 32 must still verify by
direct file count at session open (Constraint 9) - this reconstruction is
high-confidence, not a substitute for the actual check.

---

## Section 19 - Version History

v1.39 - June 30, 2026 - Walkthrough D COMPLETE, 12 findings documented, Gate 3 DEFERRED
v1.40 - July 1, 2026 - Session 26 COMPLETE, all 12 findings CLOSED, Gate 3 UNBLOCKED, 1288 tests
v1.41 - July 9-11, 2026 - Corrected PPBE/TT governance status, D-P7/D-TT7 opened, AIS-dedupe resolved, TT prompts drafted, docs/18 corrected to "not started", CTO demo track added
v1.42 - July 12, 2026 - Reconciles five unmaintained sessions (27-31): Time and Travel built and walkthrough-clean, PPBE Core Integration complete Full Cycle next, shell contract v1.15 to v1.16 (GD-21), D-P7/D-TT7 both decided Option A, prompt count resolved to 16, test count 1288 to 1690 with JS/Python split, docs/18 delivered-but-uncommitted incident recorded and preflight process established, SBOM cumulative merge backlog flagged, demo readiness track rewritten, "PPBE shown as in-progress" framing retired

---

## Section 20 - Full Build Roadmap

### Stages 1-6 - COMPLETE - Walkthroughs A-D - COMPLETE

### What Actually Happened, Sessions 27-31

Session 27 - Time and Travel Core Integration - Complete
Session 28 - Time and Travel Full Cycle - Complete. GD-21 taken (shell v1.15 to v1.16). TT-PRODUCT-GD resolved.
Session 29 - Time and Travel Walkthrough E fixes - Complete. Gap 3 root-caused and fixed centrally (60 regression tests).
Session 30 - Time and Travel Walkthrough E-2 fixes - Complete. Travel drafting invocation gap fixed. Landing page built. Time and Travel walkthrough-clean.
Session 31 - PPBE Core Integration - Complete. Six entities, four workflow components, two deterministic agents.

### Next Build Sessions

Session 32 - PPBE Full Cycle, four remaining agents plus prompts - depends on docs/18 section 7.2 (committed), Session 31 complete
Walkthrough F - depends on PPBE Sessions 31-32 complete AND PPBE synthetic data seeded (WE-6 precondition)
Full rehearsal - cross-module state gap resolved by this point at the latest

### Parallel Track - No Claude Code Dependency

CPMI-VRS Gate 3/4 attestation - Browser, Project Principal, any time
SBOM cumulative merge - Needs current registry content provided to Claude Chat

---

## Section 21 - CTO Demo Readiness Track

Target: a comprehensive, honest demonstration - everything shown either
fully working or clearly and credibly in progress.

This section's earlier framing is retired, explicitly, per Project Principal
decision: PPBE is no longer shown as "governance decided, spec in progress" -
demo-ready now requires both workflow layers genuinely complete, not one
complete and one honestly-labeled-incomplete. The demo was delayed on this
basis rather than the scope being narrowed.

Recommended demo scope:
1. Core six-product pipeline plus companion suite - ready today
2. Governance/certification story - CPMI-VRS gates, Logger audit trail, VIGIL human-in-the-loop - strongest if Gate 3/4 is closed by demo day
3. Both workflow layers, end-to-end: Time and Travel (walkthrough-clean) and PPBE (in build, targeting the same standard)
4. Intelligence Layer positioned explicitly as the target every product feeds, not presented as a working feature

Critical path, current: Time and Travel walkthrough-clean, one tracked
non-blocking item (cross-module state gap, resolve before final rehearsal at
the latest) -> PPBE Session 32 (Full Cycle) -> PPBE synthetic data seeded,
sufficient variety across all six phases (WE-6 precondition) -> Walkthrough F
-> full rehearsal (cross-module gap fixed by this point) -> demo-ready.

Gate 3/4 attestation and the SBOM merge backlog run fully in parallel - no
dependency on this path.

---

SOVEREIGN Platform Integration Brief v1.42, July 12, 2026
Pre-Decisional, Internal Working Document

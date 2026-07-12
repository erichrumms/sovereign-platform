# SOVEREIGN Platform Integration Brief
## Version 1.41 | July 9, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.40
**Changed this version:** Corrected PPBE/Time & Travel governance status (D-P1–D-P6 and
D-TT1–D-TT6 were decided June 29, 2026 — v1.40 incorrectly carried these as pending) ·
D-P7/D-TT7 reconsideration decisions opened · `AIS-dedupe` found tripled and **RESOLVED**
same day (commit `c3684f0`) · npm-dev-vulns reframed as an already-deferred decision, not
an open one · **Time & Travel prompts drafted and delivered (§13); `docs/18` PPBE spec
still not started, despite earlier "in progress" language — corrected this version** ·
§4, §11, §13, §17, §19, §20 updated. New §21 — CTO Demo Readiness Track.

---

## §1 — What This Document Is

*(unchanged from v1.40)*

---

## §2–§10 — (unchanged from v1.40, except as noted below)

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH ✅ → [Intelligence Layer] → CPMI ✅ → AgentOS ✅ → NEXUS ✅ → APEX ✅ → ARIA Suite ✅
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ — COMPLETE
‖ ARIA Suite: CLEAR ✅ · TRACER ✅ · ARC ✅ — ALL LIVE · Walkthrough D gap fixes CLOSED (Session 26)
‖             CPMI-VRS Gate 3 UNBLOCKED — not yet attested (Project Principal action)
‖ PPBE: D-P1–D-P6 DECIDED June 29, 2026 (confirmed — see §11). No build session opened.
‖             D-P7 (reconsider D-P3 given external connectivity) — OPEN, awaiting decision
‖             docs/18_PPBE_Workflow_Architecture.md — NOT YET STARTED (corrected this
‖             version; previously and incorrectly described as "in progress")
‖ Time & Travel: D-TT1–D-TT6 DECIDED June 29, 2026 (fully documented, filed record exists).
‖             D-TT7 (reconsider D-TT3) — OPEN, awaiting decision — does NOT block prompts
‖             docs/17_TimeAndTravel_Architecture.md — COMPLETE, approved build spec
‖             Two drafting prompts — DRAFTED July 11 (tt/prompts/), approval gated on
‖             D-TT7 only if Option C is chosen; approve alongside A/B with no rework
‖             *** MOST BUILD-READY WORKFLOW LAYER — only D-TT7 + prompt approval stand between it and a build session ***
```

---

## §11 — Current Build Status

### Stages 1–6 — COMPLETE ✅ · Walkthroughs A–D — COMPLETE ✅ (all 12 gap findings closed)

**Total tests: 1288 (1130 JS/TS + 158 Python) — freshly, independently re-verified
July 11 via a live run across all 13 JS/TS workspaces plus Python collection, not
merely carried forward as an assertion. Every per-workspace number matches SBOM
v1.27 §3 exactly.**

### Correction to v1.40 — PPBE and Time & Travel Governance Status

v1.40 incorrectly carried PPBE's D-P3 and Time & Travel's D-TT-series as still open.
**They were decided June 29, 2026** — before Session 26 even began. This was discovered
during a multi-conversation reconciliation effort (July 9, 2026) after the Project
Principal noticed the discrepancy and supplied source documents for verification.

**Time & Travel — fully confirmed, complete paper trail.** `Governance_Decision_Record_
TT_DTT1_DTT6.md` exists as a filed record: D-TT1 (proceed), D-TT2 (Project Principal as
owner/steward), D-TT3 (six data-dictionary entities approved — `TravelRequest`,
`TravelPolicy`, `TimeRecord`, `ChargeAccount`, `ComplianceFlag`, `CorrectionRecord`),
D-TT4 (no shell-contract change required), D-TT5 (eight agents approved, 36→44),
D-TT6 (workflow-layer scope confirmed). `docs/17_TimeAndTravel_Architecture.md` is a
complete, approved build specification.

**PPBE — well-evidenced, incomplete paper trail.** `Agent_Identity_Standard.md`'s PPBE
section cites "Governance Decision Record D-P5" directly and is dated "PPBE Governance
Session — Post-Walkthrough C, June 29, 2026." A separate conversation independently
shows all six PPBE decisions (D-P1–D-P6) confirmed together the same session. **No
standalone D-P1–D-P6 record has been located.** A reconstructed record, built from this
corroborating evidence and clearly marked as such, is provided alongside this Brief —
see `Governance_Decision_Record_PPBE_DP1_DP6_RECONSTRUCTED.md`.

### D-P7 and D-TT7 — New Reconsideration Decisions, Open

Given EXT-CONN-EXPLORE (drafted July 6, 2026 — see §13) and two concrete platform
precedents (`AriaCertification`'s D-3 finding, Session 26; GD-20 superseding `docs/16`'s
"no shell-contract change" claim), both workflow layers' data-dictionary entities are
being reconsidered — not reopened wholesale, only the entity-approval decision in each
(D-P3, D-TT3). Full records: `Governance_Decision_Record_PPBE_DP7.md` and
`Governance_Decision_Record_TT_DTT7.md`. Each offers three options (reaffirm / narrow
reserved-field amendment / full architecture first). **Neither is decided yet.**

### `AIS-dedupe` — Confirmed, and RESOLVED Same Day

Session 26 flagged a *possible* duplication of the Time & Travel section in
`Agent_Identity_Standard.md`. A more complete copy of that file, reviewed July 9, 2026,
confirmed the section was duplicated **three times**, verbatim (not two) — worsened by
a July 1 commit (`88cd04e`) that appended a third copy on top of an already-duplicated
file. **Fixed and verified the same day**: the file was truncated to its single clean
copy (1,359 lines, down from 2,073), verified byte-identical against all three original
copies before the cut, and the fix committed as `c3684f0` — 714 deletions, 0 insertions,
44 agents unaffected. No longer an open item.

### npm-dev-vulns — Correction: Already a Made Decision, Not an Open One

v1.39/v1.40 carried this as "upgrade-vs-accept decision pending." That's inaccurate.
The `esbuild`/Vite advisory (`GHSA-67mh-4wv8-2f99`) was identified as early as Session
2B (June 18, 2026) and **explicitly deferred to the pre-production Vite major-version
review, Stage 5+** — a real decision with a stated trigger condition, not an unmade one.
The `js-yaml` advisory and the one high-severity `vite` finding surfaced later
(Session 25) but fall under the same deferral logic — dev-only, no production path,
reviewed together at the Stage 5+ Vite major-version pass. No action needed before then.

### Gate 3/4 — Still Open, Still a Pure Project Principal Action

CPMI-VRS Gate 3 for ARIA Suite remains unblocked (D-11/D-12 fixed, Session 26) and, as
far as can be determined, not yet attested. No build dependency. CPMI, APEX, and
FLOWPATH already hold active Gate 3+4 certifications.

### Time & Travel Prompts — Drafted, Approval Decoupled from D-TT7

Both drafting prompts (`tt/prompts/travel_drafting_system.md`,
`tt/prompts/time_drafting_system.md`) are written and delivered this version — a
correction from earlier language that described this as merely "in progress."
**Drafting does not depend on D-TT7's outcome**: neither prompt references any field
beyond what D-TT3 already approved, and Options A and B (the two most likely D-TT7
outcomes) don't change those fields at all. **Formal approval, per D-TT5's standing
requirement, is held pending D-TT7** — not because the prompts need D-TT7 to be
written, but because if D-TT7 resolves to Option C (full architecture) and that
architecture changes the underlying fields structurally, a quick review before
approval is cheaper than approving twice. See the Work Plan's corrected dependency
diagram.

### `docs/18_PPBE_Workflow_Architecture.md` — Correction: Not Yet Started

Prior versions of this Brief and the Work Plan described this as "partial authoring
in progress, this pass." **That was inaccurate — the document was never produced.**
Unlike the Time & Travel prompts, this hasn't been corrected by delivering it this
version; it remains a real, open item. Given its size (comparable to `docs/17`'s ~470
lines) and that it doesn't block anything on the current demo-critical path, it's
being tracked honestly as not-yet-started rather than rushed into this pass. See
`PPBE-SPEC` in §13.

---

## §12 — Risk Register

*(unchanged from v1.40, plus the PPBE-specific R-P9/R-P10 and Time & Travel R-TT1/R-TT2
entries — see the respective D-P7/D-TT7 records for full detail; not duplicated here to
avoid drift between two copies of the same risk)*

---

## §13 — Open Governance Items

**CLOSED this version:** `AIS-dedupe` — resolved same day discovered, commit `c3684f0`.

| ID | Item | Target |
|---|---|---|
| Gate-3-4 | CPMI-VRS Gate 3 + Gate 4 attestation for ARIA Suite — unblocked, not yet performed | Project Principal action, own pace |
| **D-P7** *(new)* | Reconsider PPBE's D-P3 (six data-dictionary entities) given external connectivity — Option A/B/C | Project Principal decision |
| **D-TT7** *(new)* | Reconsider Time & Travel's D-TT3 (six data-dictionary entities) given external connectivity — Option A/B/C | Project Principal decision |
| **PPBE-RECORD** *(new)* | Original D-P1–D-P6 governance decision record not located; reconstructed version provided pending discovery of, or in place of, the original | Housekeeping |
| ARIA-EXPORT-GD | Candidate GD: `authorized_destination`/`authorized_recipient` on frozen `AriaCertification` + SCRIBE export-gate enforcement | Future session |
| COUNSEL-GD | Candidate GD: `regulation_basis` field | Future session |
| **docs/16-Supervision-Efficiency** *(sharpened)* | `docs/16_ARIA_Suite_Architecture.md` was supposed to receive a retroactive Supervision Efficiency compliance section before Walkthrough D (per `docs/14`'s addendum §5a). Status genuinely unverified — was it done? | Verify directly (grep check) |
| **PPBE-SPEC** *(corrected)* | `docs/18_PPBE_Workflow_Architecture.md` — **not yet started**, despite earlier "in progress" language | Before PPBE Phase I |
| **TT-PROMPTS** *(delivered)* | Two Time & Travel drafting prompts — **drafted and delivered**, `tt/prompts/`. Approval gated on D-TT7 only if Option C chosen. | Approve alongside D-TT7 decision |
| TT-GD | GD for `TRAVEL_APPROVAL`/`TIME_CORRECTION_SENT`/`ESCALATION_AUTHORIZED` — distinct from D-TT3/D-TT7, still open, consider external-linkage question here too | Before Time & Travel Phase II |
| REVIEW-SCOPE | Future reliability/efficiency/security review — proposal exists (Session 26 Handoff §8), still ungated | Project Principal → Claude Chat to gate, lower priority given demo timeline |
| **PROMPT-REGISTRY-DRIFT** *(new)* | `Prompt_Registry_Specification.md`'s "v1.0 Baseline — Current Prompts in Registry" section describes `flowpath.coordinator` and `flowpath.domain-translator` prompts by name, but no corresponding files exist under `module-flowpath/prompts/` on disk (actual files: `completeness_gate_system.md`, `org_elicitation_system.md`, `individual_elicitation_system.md`, `workflow_analysis_system.md`) — a spec/reality mismatch of unknown cause, possibly related to the already-tracked F-2 finding (8 agents implemented-but-not-carded). Needs a real read of both sides, not another grep. | Claude Code, next FLOWPATH-adjacent session |
| npm-dev-vulns | **Not an open decision — deferred to Stage 5+ Vite major-version review since Session 2B.** Retained here only as a tracked deferred item, not a pending choice. | Stage 5+ |
| iCloud-cleanup | Consolidate superseded documents (including the abandoned `Agent_Identity_Standard_v1_2.md`/`v1_3.md` numbered-versioning branch, now confirmed dead) into For Disposal/ | Recommended before next transition |
| **process-note** *(new)* | Multiple governance decisions (PPBE/TT sessions, Supervision Efficiency addendum, EXT-CONN-EXPLORE) were made in conversations outside the main continuity thread and took until July 9 to fully reconcile. Recommend treating one conversation as canonical going forward and importing side-conversation outputs promptly. | Standing practice |

---

## §14 — SBOM Status

Current: `SBOM_Registry_v1.27_MERGED.md` (through Session 26). No build session since —
SBOM unchanged this version. Shell contract v1.15 · `939c2441…bfa5876`. 1288 tests.
0 production vulnerabilities.

---

## §15–§16 — (unchanged from v1.40)

---

## §17 — Primary Product Inserts

| Product | Stage | Status |
|---|---|---|
| CPMI | Stage 3 | COMPLETE — VRS certified |
| AgentOS | Stage 4 | COMPLETE — 89 tests |
| NEXUS | Stage 4 | COMPLETE — 52 tests |
| APEX | Stage 5a | COMPLETE — VRS certified — 97 tests |
| FLOWPATH | Stage 5b | COMPLETE — VRS certified — 98 tests |
| ARIA Suite | Stage 6 | FEATURE-COMPLETE — 122 tests · Walkthrough D gap fixes CLOSED · Gate 3 unblocked, not attested |
| **Time & Travel** | **Workflow layer** | **D-TT1–D-TT6 decided · spec complete · D-TT7 open · prompts drafted, approval pending · most build-ready of the two layers** |
| **PPBE** | **Workflow layer** | **D-P1–D-P6 decided (evidenced, reconstruction delivered) · spec not yet started · D-P7 open** |

---

## §18 — Agent and Prompt Registry

**Agent registry: 44 total** — confirmed via the authoritative registry table, **not**
a naive grep (returns 46 due to detail/summary table double-counting). 36 master + 8
`tt.*`, 6 of the 36 being PPBE agents (previously undercounted in this Brief's own
tracking — corrected this version).
**Approved prompts: 14 total** — two Time & Travel drafting prompts drafted and
delivered this version (`tt/prompts/`), formally approved once D-TT7 is decided.

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.39 | June 30, 2026 | Walkthrough D COMPLETE · 12 findings documented · Gate 3 DEFERRED |
| v1.40 | July 1, 2026 | Session 26 COMPLETE · all 12 findings CLOSED · Gate 3 UNBLOCKED · 1288 tests |
| **v1.41** | **July 9–11, 2026** | **Corrected PPBE/TT governance status (decided June 29, not pending) · D-P7/D-TT7 opened · AIS-dedupe found tripled and RESOLVED (`c3684f0`) · npm-dev-vulns reframed as already-deferred · Time & Travel prompts drafted and delivered, approval decoupled from D-TT7 · docs/18 corrected to "not yet started" · CTO demo readiness track added (§21)** |

---

## §20 — Full Build Roadmap

### Stages 1–6 — COMPLETE ✅ · Walkthroughs A–D — COMPLETE ✅

### Immediate — Claude Chat Only, No Build Session

| Item | Status |
|---|---|
| Integration Brief v1.41, Briefing, System Prompt v19 | Delivered, corrected through July 11 |
| Time & Travel drafting prompts (2) | **Delivered** — `tt/prompts/`, approval pending D-TT7 outcome |
| `docs/18_PPBE_Workflow_Architecture.md` | **Not started** — corrected from earlier "in progress" claim |
| D-P7 / D-TT7 decisions | Project Principal, own pace |
| Reconstructed PPBE D-P1–D-P6 record | Delivered |

### Parallel Track — No Claude Code Dependency

| Item | How |
|---|---|
| CPMI-VRS Gate 3/4 attestation | Browser, Project Principal, any time |
| ~~`AIS-dedupe` cleanup~~ | **DONE** — commit `c3684f0`, July 9 |

### Next Build Sessions (Claude Code)

| Session | Scope | Depends On |
|---|---|---|
| 27 | Time & Travel Phase I — data dictionary registration, agent scaffolding | D-TT7 decided; prompts already drafted, approve alongside the decision |
| 28 | Time & Travel Phase II — drafting agents live, VIGIL/NEXUS wiring, first end-to-end demonstrable flow | Session 27 complete |
| 29 | PPBE Phase I | `docs/18` complete, D-P7 decided |
| ~30 | Walkthrough E | At least one workflow layer fully built (Phase I+II) |

---

## §21 — CTO Demo Readiness Track (New)

**Target:** a comprehensive, honest demonstration — not everything finished, but
everything shown either fully working or clearly and credibly in progress.

**Recommended demo scope:**
1. Core six-product pipeline + companion suite — ready today
2. Governance/certification story — CPMI-VRS gates, Logger audit trail, VIGIL human-
   in-the-loop — strongest if Gate 3/4 is closed by demo day
3. One fully-built workflow layer end-to-end (Time & Travel, given its head start)
4. PPBE shown honestly as "governance decided, spec in progress, next in the pipeline"
5. Intelligence Layer positioned explicitly as the target every product feeds, not
   presented as a working feature

**Critical path to that scope:** Time & Travel prompts are already drafted, so they no
longer sit on the critical path at all. The path is now: **D-TT7 decision → (approve
prompts alongside it) → Session 27 → Session 28 → demo-ready.** Gate 3/4 attestation
and PPBE's spec/D-P7 track run fully in parallel, no dependency on this path. **One
conditional exception:** if D-TT7 resolves to Option C (full architecture) and that
architecture changes `TimeRecord`/`TravelRequest` structurally, the two drafted
prompts should get a quick review before approval — cheap, and still faster than
having waited to write them at all.

---

*SOVEREIGN Platform Integration Brief v1.41 · July 9, 2026*
*Pre-Decisional · Internal Working Document*

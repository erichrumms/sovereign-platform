# SOVEREIGN Platform — PPBE Workflow Architecture
## Build Specification — `docs/18`
### Operationalizing the PPBE Integration Architecture for Claude Code Build Sessions

**Document Type:** Build Specification (Phase I Deliverable, per `SOVEREIGN_PPBE_
Integration_Architecture_Draft1.md` §11)
**Version:** 1.0 — July 11, 2026
**Authority:** Project Principal · SOVEREIGN Platform Governance Authority
**Author:** Claude Chat (Governance Agent)
**Status:** APPROVED FOR BUILD — all governing decisions (D-P1–D-P7) resolved
**Classification:** Pre-Decisional · Internal Working Document
**Governing documents:** `SOVEREIGN_PPBE_Integration_Architecture_Draft1.md` (source
architecture — not superseded, this document operationalizes it) ·
`Governance_Decision_Record_PPBE_DP1_DP6_RECONSTRUCTED.md` ·
`Governance_Decision_Record_PPBE_DP7.md` · `Agent_Identity_Standard.md` (PPBE
Workflow Layer Additions) · SOVEREIGN Platform Integration Brief v1.41 · System
Prompt v19 · `SOVEREIGN_Strategic_Plan_CTO_Demo_v1.md` Track 1B

---

## 0. What This Document Is, and Isn't

`SOVEREIGN_PPBE_Integration_Architecture_Draft1.md` was an *exploration* document —
it asked whether and how PPBE should integrate with SOVEREIGN, and required
governance decisions before any build could open. Those decisions are now made:
D-P1 through D-P6 (proceed, ownership, entities, shell-contract scope, agents,
workflow-layer boundary) and D-P7 (entities reaffirmed unchanged, retrofit deferred).

This document is the **build specification** — the Phase I deliverable the
architecture document itself called for (§11: *"Architecture spec:
`PPBE_Workflow_Architecture.md` authored in Claude Chat"*). It does not re-litigate
any decided question. Where the architecture document already specifies something
at the right level of detail, this document references it rather than repeating it.
Where the architecture document specified something only at the purpose or table
level — most notably entity field schemas and Logger event field schemas — this
document adds the implementation-level detail a Claude Code build session actually
needs.

**One explicit boundary, stated once so it doesn't need repeating:** the field-level
schemas in §3 and §4 below *elaborate* the six D-P3 entities and four Logger event
types already approved — they do not amend them. If a build session finds a
proposed field doesn't actually fit, that is surfaced per Lesson 14 (stop, don't
silently narrow or route around it), not silently changed here or in code.

---

## 1. Governing Decisions — Status Summary

| Decision | Resolution | What It Settles for This Document |
|---|---|---|
| D-P1 | Proceed | PPBE build is authorized in principle |
| D-P2 | Project Principal — Owner/Data Steward | No separate PPBE governance authority to consult |
| D-P3 | Six entities approved (purpose-level) | §3 elaborates these to field-level |
| D-P4 | No shell-contract change required (watch item, not reopened) | §8 restates this as the working assumption, with Lesson 14 as the fallback |
| D-P5 | Six agent identities approved, registered | §5 confirms and analyzes prompt requirements |
| D-P6 | PPBE is a workflow layer, not a new product | No new shell module, pipeline position, or CPMI-VRS cycle — confirmed throughout |
| D-P7 | Entities reaffirmed unchanged; retrofit deferred (`PPBE-EXT-GD`, trigger-conditioned) | §3's schemas are final for this build, not provisional |

No open governance question blocks this document or the build sessions it
specifies. `PPBE-RECORD` (whether to keep searching for the original D-P1–D-P6
record or adopt the reconstruction as record of record) remains open but does not
block build — it is a paper-trail housekeeping question, not a content question.

---

## 2. Build Sequence and Session Naming

The architecture document's own three-phase model is the correct one:

| Phase (architecture doc terms) | This Document's Label | Session Type |
|---|---|---|
| Phase I — Foundation | *(this document, plus D-P1–D-P7 — already complete)* | Claude Chat only, no code |
| Phase II — Core Integration | **PPBE Build Session 1 — Core Integration** | First Claude Code build session |
| Phase III — Full Cycle | **PPBE Build Session 2 — Full Cycle** | Second Claude Code build session |

**Naming correction, carried from `SOVEREIGN_Strategic_Plan_CTO_Demo_v1.md` Track
1B:** other tracking documents (Integration Brief v1.41 §20, the prior Work Plan)
label the next PPBE session **"Session 29 — PPBE Phase I."** Read against the
architecture document's own phase definitions, that label is a mismatch — the work
scoped for that session (FLOWPATH/Logger/NEXUS/VIGIL integration) is Phase II, not
Phase I. Phase I is governance and documentation work, and it is already done as of
this document. **Recommendation: the next Integration Brief revision should rename
"Session 29 — PPBE Phase I" to "PPBE Build Session 1 — Core Integration,"** and
budget a second session ("PPBE Build Session 2 — Full Cycle") that does not
currently appear in any tracking document's session table. This document uses the
corrected names throughout.

---

## 3. Data Dictionary — Field-Level Schema for the Six Approved Entities

Purposes below are unchanged from D-P3 (Table 4 of the architecture document).
Field lists are this document's elaboration, built from the purpose descriptions
already on record plus the traceability requirements in the architecture
document's §5.2. `workflow_step_id` and `agent_id`/`agent_class` follow the
platform-standard Logger conventions already enforced everywhere else.

### 3.1 `StrategicObjective`

| Field | Type | Notes |
|---|---|---|
| `objective_id` | string (canonical ID) | Per D-P3 |
| `title` | string | |
| `description` | text | |
| `priority_rank` | integer | Set during Phase 1 (Strategic Direction) ranking |
| `fiscal_year_range` | string | e.g. `FY 2027-2031` — spelled out per Gap 5 |
| `source_workflow_step_id` | string (FK → Logger) | Links to the FLOWPATH elicitation that produced it |
| `decision_record_id` | string (FK → COUNSEL) | The signed Decision Record that approved the ranking |
| `status` | enum: `draft` / `active` / `superseded` | |

### 3.2 `ProgramRecord` (extends existing `Program` entity)

| Field | Type | Notes |
|---|---|---|
| `program_id` | string (existing canonical ID) | No change to the existing entity's identity |
| `objective_id` | string (FK → `StrategicObjective`) | The traceability chain's second link |
| `fiscal_year` | string | |
| `lifecycle_cost_estimate` | decimal | |
| `obligation_plan` | structured object | Planned obligation schedule by period |
| `performance_baseline` | structured object | Feeds Phase 6 evaluation comparison |
| `status` | enum | Consistent with existing `Program` entity status values |

### 3.3 `BudgetExhibit`

| Field | Type | Notes |
|---|---|---|
| `exhibit_id` | string (canonical ID) | Per D-P3 |
| `program_id` | string (FK → `ProgramRecord`) | |
| `fiscal_year` | string | |
| `narrative_content` | text | Produced by `ppbe-exhibit-drafter` / SCRIBE |
| `source_data_lineage` | array of Logger event references | Every figure traceable per architecture doc §9 |
| `certification_status` | enum | Set by ARIA Suite CLEAR |
| `export_status` | enum | Gated per SCRIBE's existing export-gate mechanism (`ctx.aria.isCertified`, GD-20) |

### 3.4 `ObligationRecord`

| Field | Type | Notes |
|---|---|---|
| `obligation_id` | string (canonical ID) | Per D-P3 |
| `program_id` | string (FK → `ProgramRecord`) | |
| `cost_code` | string (existing entity) | Per architecture doc §5.1 — explicitly named there |
| `amount` | decimal | |
| `timestamp` | ISO 8601 datetime | |
| `authorizing_official` | string | The human who authorized the obligation — VIGIL Tier C |
| `workflow_step_id` | string | Per architecture doc §5.1 — explicitly named there |

*(This is the entity D-P7's analysis identified as most likely to eventually need
external-system linkage — see `PPBE-EXT-GD` in the D-P7 record. No such field is
added here; `PPBE-EXT-GD` remains deferred and trigger-conditioned.)*

### 3.5 `EvaluationFinding`

| Field | Type | Notes |
|---|---|---|
| `finding_id` | string (canonical ID) | Per D-P3 |
| `program_id` | string (FK → `ProgramRecord`) | |
| `objective_id` | string (FK → `StrategicObjective`) | Closes the Phase 6 → Phase 1 feedback loop |
| `finding_type` | enum | e.g. `on-track` / `variance` / `contradicts-assumption` |
| `narrative` | text | |
| `feeds_planning_cycle` | boolean | Tracked so the feedback loop is measured, not assumed (architecture doc §5.1) |
| `workflow_step_id` | string | |

### 3.6 `DependencyMap`

| Field | Type | Notes |
|---|---|---|
| `dependency_id` | string (canonical ID) | Per D-P3 |
| `source_workflow` | string | |
| `target_workflow` | string | |
| `handoff_standard` | text | |
| `timing_requirement` | string | |
| `health_status` | enum: `healthy` / `at-risk` / `failed` | Feeds `ppbe-dependency-tracker` |

---

## 4. Logger Event Schema Extensions

Four event types, per architecture doc §4.3. Field-level schema below; all four
carry the platform-standard `agent_id`, `agent_class`, and `workflow_step_id`
fields in addition to what's listed.

| Event Type | Additional Fields | Emitted By |
|---|---|---|
| `PPBE_DECISION` | `decision_type`, `program_id` or `objective_id`, `approving_human` | Any Tier B/C authorization event |
| `PPBE_PHASE_TRANSITION` | `from_phase`, `to_phase`, `data_quality_assessment`, `integration_readiness_check`, `approving_human` | VIGIL, on phase handoff |
| `PPBE_ANOMALY` | `anomaly_type`, `program_id`, `threshold_breached`, `severity` | `ppbe-ledger-monitor` |
| `PPBE_EVALUATION_FINDING` | `finding_id` (FK), `program_id`, `objective_id`, `feeds_planning_cycle` | APEX, on `EvaluationFinding` creation |

These extend `APPROVED_EVENT_TYPES` in both the TypeScript and Python Logger
implementations. Per the platform's standing pattern (Python is permanently 5
ahead of TypeScript by design — 3 TRACER + 2 ARC), confirm at build time whether
these four PPBE types need equivalent treatment or can be added identically to
both — nothing in the architecture document suggests a Python-only requirement
here, so the default expectation is identical addition to both implementations.

---

## 5. Agent Registry Reference and Prompt Requirement Analysis

The six agents are already registered (D-P5, `Agent_Identity_Standard.md`). This
section analyzes which need dedicated prompt registrations before which build
session — the open `PPBE-PROMPTS` item (Integration Brief v1.41 §13) tracks "four
PPBE agent prompts," and the reasoning behind that number is made explicit here for
the first time.

| Agent ID | Class | Needed By | Dedicated Prompt? |
|---|---|---|---|
| `ppbe-ledger-monitor` | Monitoring | Core Integration | **Yes** — analyzes obligation/performance data, routes `PPBE_ANOMALY` events; this is genuine LLM-backed analysis, not rule evaluation |
| `ppbe-dependency-tracker` | Monitoring | Core Integration | **Yes** — same reasoning; tracks handoff health and flags timing violations, requires judgment, not just threshold comparison |
| `ppbe-evidence-synthesizer` | Analytical | Full Cycle | **Yes** — aggregates findings across programs; recommendation-only output, human review required per architecture doc §7 |
| `ppbe-scenario-analyst` | Analytical | Full Cycle | **Yes** — models alternative allocations; Tier A authorization, feeds COUNSEL |
| `ppbe-exhibit-drafter` | Operational | Full Cycle | **Inferred no** — architecture doc §7 explicitly describes this as extending "SCRIBE's existing drafting engine with PPBE-specific document modes," which suggests configuration of SCRIBE's existing prompt infrastructure rather than a wholly new prompt, mirroring how `scribe-drafter`'s existing prompts already cover multiple document modes |
| `ppbe-coordination-assistant` | Operational | Full Cycle | **Inferred no** — tracks action items and governance-calendar obligations; likely NEXUS-native functionality with PPBE-specific configuration rather than a dedicated LLM prompt |

**This is four dedicated prompts, matching the already-tracked `PPBE-PROMPTS` item
exactly.** The "inferred no" determinations for `ppbe-exhibit-drafter` and
`ppbe-coordination-assistant` are inferences from the architecture document's own
language, not confirmed facts — **this should be confirmed, not assumed, at Core
Integration session open,** the same discipline applied to every other inference in
this document.

**Prompt authorship — corrected July 12, 2026, per `AGENT_REFERENCE.md` reconciliation:**
earlier versions of this document stated these four prompts had to be authored and
approved in Claude Chat *before* their respective build session could open. That is
superseded. Per the platform's actual Prompt Approval Record workflow: **Claude
Code (the Build Agent) authors each prompt as part of the session it belongs to**
— `ppbe-ledger-monitor` and `ppbe-dependency-tracker` during Core Integration,
`ppbe-evidence-synthesizer` and `ppbe-scenario-analyst` during Full Cycle — marking
each `PENDING` on creation. A `PENDING` prompt is usable within the session against
synthetic data (which is all this platform runs on regardless), but Claude Chat
must produce the approval record and the Project Principal must approve before any
of them are treated as cleared for anything beyond that. **This is no longer a
pre-session blocker** — do not stop a Core Integration or Full Cycle session merely
because these prompts don't exist yet; author them as part of the session's own
work, in the same one-component-per-exchange discipline as everything else.

---

## 6. VIGIL Authorization Tiers — Build-Level Detail

Per architecture doc §4.4, carried forward with the UI/enforcement detail a build
session needs:

- **Tier A — Analysis and Recommendation.** No VIGIL gate. Outputs from
  `ppbe-evidence-synthesizer` and `ppbe-scenario-analyst` are logged and rendered
  with a clear "AI-generated recommendation" label — same visual treatment already
  used for COUNSEL's advisory outputs.
- **Tier B — Phase Transition Authorization.** A `PPBE_PHASE_TRANSITION` event
  cannot be marked complete without a VIGIL Agent Approval Queue decision. The next
  phase's AgentOS-registered workflows are gated pending that approval — this is
  the same mechanism already enforced for other AgentOS gates, not new
  infrastructure.
- **Tier C — Resource Commitment Authorization.** `ObligationRecord` creation and
  `PPBE_DECISION` events of type "obligation" or "reprogramming" require a VIGIL
  decision **and** a linked COUNSEL Decision Record ID. Enforced the same way
  `vigil-approval-agent`'s `decision_type` requirement is already enforced
  (`useApprovalDecision.ts` pattern) — the action stays inactive until both are
  present.

---

## 7. Product Integration Detail by Build Session

### 7.1 PPBE Build Session 1 — Core Integration

| Product | Scope |
|---|---|
| FLOWPATH | Four workflow artifact types elicited and structured against the data dictionary (§5.1 of architecture doc): Phase Workflow Artifacts, Dependency Maps, Decision Criteria Artifacts, Governance Calendar Artifacts |
| Logger | Four PPBE event types (§4 above) implemented and tested in both TS and Python |
| NEXUS | PPBE task and correspondence schemas added, carrying `program_id` and `objective_id` |
| VIGIL | Three-tier PPBE authorization architecture (§6 above) implemented in the Agent Approval Queue |
| Agents | `ppbe-ledger-monitor`, `ppbe-dependency-tracker` deployed and tested — **prompts must be approved first, see §5** |

**Done condition (carried from architecture doc §11, restated for this build
session):** FLOWPATH produces a valid PPBE workflow artifact. Logger records a
`PPBE_DECISION` event with correct schema. NEXUS tracks a PPBE task with
traceability to `program_id` and `objective_id`. VIGIL gates a simulated phase
transition on human authorization. All tests passing.

### 7.2 PPBE Build Session 2 — Full Cycle

| Product | Scope |
|---|---|
| APEX | PPBE performance dashboard — obligation rate, budget-to-actual variance, dependency health index, learning velocity |
| SCRIBE | Three PPBE document modes added (Budget Exhibit, Congressional Justification, Evaluation Report) — export gated on ARIA Suite CLEAR certification, per the platform's existing SCRIBE export-gate pattern |
| ARIA Suite | CLEAR monitoring rules for the PPBE regulatory framework; TRACER traceability chains for budget submissions; ARC impact models for OMB/appropriations law changes |
| COUNSEL | Four PPBE decision types integrated (Strategic Priority Ranking, Programming Trade-Off, Phase Transition Authorization, Evaluation Finding Response) — Decision Records carry the full Intelligence Layer field set |
| Agents | `ppbe-evidence-synthesizer`, `ppbe-scenario-analyst`, `ppbe-exhibit-drafter`, `ppbe-coordination-assistant` deployed — **prompts for the first two must be approved first, see §5** |

**Done condition (constructed for this document — the architecture document did
not state one explicitly for this phase):** APEX dashboard renders live data across
all six PPBE Logger event types. SCRIBE produces a valid draft in each of the three
new document modes, correctly gated on CLEAR certification. ARIA Suite's CLEAR,
TRACER, and ARC each demonstrate a working PPBE-specific rule, chain, and model
respectively. COUNSEL produces a signed Decision Record in each of the four PPBE
decision types. A full six-phase PPBE cycle runs end-to-end on synthetic data, with
Logger events at every phase transition and VIGIL authorizations at every Tier B
and C gate. All tests passing.

---

## 8. Shell-Contract Impact Assessment

**Working assumption, per D-P4:** no shell-contract change is required for either
PPBE build session. All six PPBE agents use existing credential types (Anthropic
API key via shell). No new shell export appears anywhere in this specification.

**This is an assumption to verify, not a guarantee to rely on.** Per Lesson 14 —
already triggered twice on this platform (`AriaCertification`/D-3, and GD-20
superseding `docs/16`'s identical claim) — if either PPBE build session reveals an
actual shell-contract need, **Claude Code stops and surfaces it explicitly.** It
does not silently narrow scope to avoid the boundary, and it does not cross the
boundary without the full governance process (version increment, changelog,
SHA-256 verification of both copies).

---

## 9. Autonomous-Operation Rules for Claude Code

Unchanged from platform standard, restated for this build specifically:

- One-component-per-exchange holds even in autonomous mode
  (`caffeinate -i claude --dangerously-skip-permissions`).
- Verify HEAD, shell-contract SHA-256, and agent count via the authoritative table
  before opening either PPBE build session — do not trust any prior handoff's
  numbers without a fresh check.
- State the session's done condition (§7.1 or §7.2 above) and wait for Project
  Principal approval before beginning.
- Produce a handoff and SBOM update at close — never skip.
- If a Hard Stop is hit (shell-contract boundary, missing prompt, undecided data
  shape), stop and document — do not decide governance questions autonomously.

---

## 10. Risk Register

Carried forward from the architecture document's §12, with status updated where
D-P7 or this document's own analysis has changed it:

| ID | Risk | Tier | Status |
|---|---|---|---|
| R-P1 | Data dictionary field-name conflicts | 1 — Critical | Closed — no conflicts found in §3's elaboration; existing `Program` and `CostCode` entities referenced, not duplicated |
| R-P2 | `shell-contract.ts` change required | 1 — Critical | Open, monitored — see §8 |
| R-P3 | PPBE agent prompts not approved before build | 1 — Critical | **Reassigned July 12 — no longer a pre-build risk. Claude Code authors each prompt during its own session (§5); the residual risk is a `PENDING` prompt being treated as approved before the Project Principal actually reviews it, which the approval-record step exists to prevent.** |
| R-P4 | Workflows elicited from idealized process maps | 2 — High | Unchanged — FLOWPATH elicitation protocol applies |
| R-P5 | CPMI drift reaches a congressional submission | 2 — High | Unchanged — CPMI enhanced monitoring + SCRIBE CLEAR gate applies |
| R-P6 | Phase transitions treated as administrative routine | 2 — High | Mitigated by §6's Tier B architecture |
| R-P7 | Evaluation findings not entering the planning cycle | 2 — High | Mitigated by `feeds_planning_cycle` field (§3.5) and `ppbe-ledger-monitor`'s learning-velocity tracking |
| R-P8 | PPBE scope expands beyond workflow-layer model | 3 — Moderate | Closed by D-P6 — reaffirmed, not reopened |
| **R-P10** *(from D-P7)* | D-P4's "no shell-contract change" assessment could be overtaken by build reality | 3 — Moderate, watch item | Restated in §8 above |

---

## 11. Standing Constraint Compliance Checklist

| # | Constraint | PPBE Compliance |
|---|---|---|
| 1 | No independent security/governance/audit infrastructure | PPBE uses the existing Logger, CPMI-VRS, and AgentOS — no new infrastructure anywhere in this spec |
| 2 | No shared entity field-name divergence | §3's fields reference existing entities (`Program`, `CostCode`) by their existing names, not duplicates |
| 3 | No rewrite debt | All six entities and four event types are additive extensions |
| 4 | `decision_type` on every human decision event | Specified in `PPBE_DECISION`'s schema (§4) |
| 5 | No direct Anthropic API calls | All six agents route through `sovereign-api-client`, per Agent Identity Standard |
| 6 | `workflow_step_id` on every Logger call | Present on all four PPBE event types and most entities (§3, §4) |
| 7 | Shell context frozen at ten exports | No new export proposed anywhere in this document |
| 8 | `shell-contract.ts` v1.15 governance | §8 — no change expected, Lesson 14 applies if wrong |
| 9 | Prompts registered before build | Reassigned July 12 — Claude Code authors each of the four PPBE prompts during its own session (§5), marked `PENDING`; approval (Claude Chat's record, Project Principal's sign-off) happens before any prompt is treated as cleared beyond synthetic-data use within that session |
| 10 | Agents registered before build | Satisfied — D-P5, all six in `Agent_Identity_Standard.md` |
| 11 | Five synced copies of shared artifacts | Applies to this document once filed — see distribution note below |

---

## 12. What This Document Does Not Do

- Does not reopen D-P1 through D-P7 — all are treated as settled.
- Does not authorize either build session to open on its own — the Session Protocol
  (confirm documents, verify HEAD/hash/agent-count, state done condition, wait for
  approval) still applies at the start of each.
- Does not draft the four required agent prompts itself (§5) — that's Claude
  Code's job, during each respective session, per the July 12 reassignment.
- Does not resolve `PPBE-RECORD` — unrelated to this document's content.
- Does not add, remove, or restructure any D-P3 entity or field beyond the
  elaboration in §3 — if build reality requires a real change, that goes through
  the standard GD process, same as `PPBE-EXT-GD`'s trigger condition describes.

---

## 13. Distribution

**File to:** git `docs/18_PPBE_Workflow_Architecture.md` — this is a durable build
specification, not a governance decision record or session-archival document, and
belongs in the same location as `docs/17_TimeAndTravel_Architecture.md`.

**Recommended follow-on, not part of this document's own scope:** the next
Integration Brief revision should (a) adopt this document's session naming (§2),
(b) add "PPBE Build Session 2 — Full Cycle" to the session table, which does not
currently appear anywhere, and (c) update `PPBE-SPEC`'s status from "not yet
started" to complete.

---

*SOVEREIGN Platform — PPBE Workflow Architecture · Build Specification `docs/18` ·
v1.0 · July 11, 2026*
*Pre-Decisional · Internal Working Document*

# SOVEREIGN Platform — ARIA Suite Architecture
## docs/16_ARIA_Suite_Architecture.md

**Version:** 1.0
**Date:** June 29, 2026
**Classification:** Pre-Decisional · Internal Working Document
**Status:** APPROVED — commit to `docs/` before Session 22 opens
**Governing Document:** SOVEREIGN Platform Integration Brief v1.31
**Build Sessions:** 22 (scaffold + CLEAR), 23 (CLEAR core), 24 (TRACER), 25 (ARC)

---

## 1. What ARIA Suite Is

ARIA Suite is Stage 6 of the SOVEREIGN Platform. It is the compliance, traceability,
and regulatory impact layer that sits after APEX in the pipeline and before the
Intelligence Layer. ARIA Suite has three components:

- **CLEAR** — Continuous Legal and Regulatory Evaluation and Assessment Review.
  Monitors ongoing platform operations against the applicable regulatory framework
  in real time. Flags deviations before they cascade.

- **TRACER** — Traceability and Accountability Chain for Evidence Records.
  Traces every significant decision, document, and output back to its authoritative
  regulatory or policy basis. Creates an unbroken chain from action to authority.

- **ARC** — Adaptive Regulatory Change engine. Models the operational impact of
  proposed regulatory changes before they are implemented. Enables proactive
  adaptation rather than reactive correction.

**The most important architectural fact about ARIA Suite:** It deliberately excludes
AI from decision paths. The `aria.rules-engine` agent is deterministic — it evaluates
rules, computes compliance scores, and generates attestations through logic, not
through a language model. This is a design choice, not a limitation. ARIA Suite's
value proposition is that it can state with certainty: "This action complies with
regulation X at version Y as of date Z." No LLM inference can make that claim.

---

## 2. Pipeline Position

```
APEX → ARIA Suite → [Intelligence Layer]
        ├── CLEAR  (compliance monitoring — always running)
        ├── TRACER (traceability chains — on demand + at export)
        └── ARC    (impact modeling — on demand)
```

ARIA Suite is not a sequential step that outputs are passed through — it is a
persistent governance layer that wraps all platform activity. CLEAR runs
continuously. TRACER is invoked at export gates and on demand. ARC is invoked
when regulatory changes are proposed or detected.

CPMI provides AI governance over the platform's LLM-backed agents. ARIA Suite
provides regulatory compliance governance over the platform's outputs and actions.
They are complementary, not overlapping.

---

## 3. The `aria.rules-engine` Agent

This is the only agent in ARIA Suite. It is registered in `Agent_Identity_Standard.md`.

| Field | Value |
|---|---|
| `agent_id` | `aria.rules-engine` |
| Agent Class | Governance |
| LLM-backed | **No** — deterministic computation only |
| Prompt required | **No** |
| Calls `sovereign-api-client` | **No** |
| Accountable human | Project Principal (ARIA Suite Product Owner) |

**What it does:**
- Evaluates routing, policy, and detection rules deterministically against current
  regulatory and policy documents loaded at startup
- Computes compliance scores for platform outputs and actions
- Generates AI-absence attestations — formal records that a given decision path
  contained no AI inference
- Produces export clearance records (ARIA CLEAR certification) required before
  SCRIBE documents and PPBE exhibits can be released externally
- Flags regulatory violations and configuration deviations for human review

**What it does not do:**
- It does not invoke any LLM. It does not call `sovereign-api-client`.
- It does not make decisions. It evaluates; humans decide.
- It does not modify its own rule sets. Rules are loaded from committed
  configuration files and updated only through the governance process.

**Scope limit:** The rules engine cannot modify its own rule sets. No AI model
is invoked in any ARIA decision path. All decisions are made by named human
decision-makers. This must be stated explicitly in every screen that surfaces
ARIA output to a human reviewer (Gap 6 compliance — content type distinction).

---

## 4. CLEAR — Continuous Compliance Monitoring

### Purpose

CLEAR is always running. It monitors platform operations against a defined
regulatory framework and surfaces deviations as alerts — not after a quarterly
audit, but as they happen.

### Regulatory Framework (Initial)

CLEAR begins with four regulatory sources loaded at startup:

| Source | Scope |
|---|---|
| OMB Circular A-11 | Budget formulation, execution, and performance reporting |
| Evidence Act (P.L. 115-435) | Evidence-building, evaluation, and learning agenda |
| Anti-Deficiency Act (31 U.S.C. §1341) | Obligation authority limits |
| DoD PPBE Reform guidance | Defense-specific PPBE process requirements |

Additional regulatory sources are added through the governance process — not by
Claude Code independently. New sources require Project Principal approval and
a record in the SBOM registry.

### What CLEAR Monitors

Three monitoring surfaces:

**Surface 1 — Output compliance.** Before any SCRIBE document or PPBE exhibit is
exported externally, CLEAR certifies it against the applicable regulatory
framework. Without a CLEAR certification, the export gate does not open.

**Surface 2 — Process compliance.** CLEAR monitors the governance calendar —
PPBE phase transition timing, attestation cadences, decision forum schedules.
Timing violations surface as VIGIL alerts.

**Surface 3 — Data quality.** CLEAR monitors data quality indices for congressional
submission materials. If the data quality index drops below 90% on a pending
submission, a P1 VIGIL alert is generated and the submission is gated.

### CLEAR UI Surface

CLEAR has two UI panels in the ARIA Suite screen:

**Compliance Dashboard** — Live view of compliance status across all three
monitoring surfaces. Color-coded by severity (green/amber/red). Each item
links to the specific regulation, the specific output or process, and the
specific deviation.

**Certification Queue** — Documents and outputs awaiting CLEAR certification
before export. Reviewer sees the document, the applicable regulatory check,
and the certification decision. Approve/flag with required decision note.

### CLEAR Events (Logger)

| Event Type | Trigger |
|---|---|
| `ARIA_COMPLIANCE_CHECK` | Every automated compliance evaluation |
| `ARIA_CERTIFICATION_ISSUED` | Every export gate opened by CLEAR |
| `ARIA_VIOLATION_FLAGGED` | Every compliance deviation surfaced |
| `ARIA_CALENDAR_ALERT` | Every governance calendar timing violation |

These event types extend `sovereign_logger.py` `APPROVED_EVENT_TYPES`. They are
**not** shell-contract additions — they live in the Python Logger taxonomy only.
A GD is not required for Logger-only additions; they are recorded in the SBOM.

---

## 5. TRACER — Traceability and Accountability Chain

### Purpose

TRACER creates an unbroken chain from every significant platform action back to
its authoritative basis — regulation, policy, directive, or OMB guidance. For
federal program managers, this is the audit answer: "Why did the platform do X?"
maps to "Regulation Y, section Z, as of date D."

### What TRACER Traces

Three traceability chain types:

**Decision chains.** Every COUNSEL Decision Record carries a `regulation_basis`
field (added in Session 22 if not already present, via data dictionary extension).
TRACER assembles the full chain: decision → governing regulation → regulatory
source document → effective date.

**Document chains.** Every SCRIBE document and PPBE exhibit carries source data
lineage in the Logger (already enforced by SCRIBE's existing architecture).
TRACER surfaces this lineage in human-readable form for reviewers.

**Obligation chains.** Every `ObligationRecord` carries the `objective_id` and
`program_id` it serves. TRACER surfaces the full strategy-to-resource chain:
obligation → program → strategic objective.

### TRACER UI Surface

TRACER has one UI panel: **Traceability Explorer**. A human reviewer selects any
platform output — a document, a decision, an obligation record — and TRACER
displays its complete chain of authority. Every node in the chain links to the
source document or Logger event. Nothing is an assertion — everything is cited.

### TRACER Events (Logger)

| Event Type | Trigger |
|---|---|
| `ARIA_TRACE_REQUESTED` | Every manual traceability query |
| `ARIA_TRACE_PRODUCED` | Every completed traceability chain |
| `ARIA_ORPHAN_FLAGGED` | Any output or decision lacking a traceable regulatory basis |

---

## 6. ARC — Adaptive Regulatory Change Engine

### Purpose

ARC answers the question: "If this regulation changes, what breaks?" Before a
new OMB A-11 revision, a DoD PPBE Reform update, or an appropriations law change
is implemented, ARC models the operational impact — which workflows are affected,
which outputs become non-compliant, which timelines shift, and what human decisions
are required to adapt.

### How ARC Works

ARC maintains a dependency model of which platform workflows, CLEAR rules, TRACER
chains, and SCRIBE document templates reference each regulatory provision. When a
proposed regulatory change is entered, ARC:

1. Identifies all dependent items
2. Scores the impact by severity (breaking / significant / minor)
3. Produces an impact report for human review
4. Does not implement any changes — it models only

The impact report feeds COUNSEL for high-stakes adaptation decisions and NEXUS
for tracking the resulting action items.

### ARC UI Surface

ARC has one UI panel: **Regulatory Impact Modeler**. A reviewer enters a proposed
regulatory change (free text or a loaded regulatory document). ARC produces an
impact report. The reviewer reviews the report, records a decision in COUNSEL if
the impact is significant, and routes action items to NEXUS.

### ARC Events (Logger)

| Event Type | Trigger |
|---|---|
| `ARIA_IMPACT_MODELED` | Every ARC impact modeling run |
| `ARIA_ADAPTATION_DECISION` | Every human decision recorded in response to an ARC report |

---

## 7. Shell-Contract Impact

**No shell-contract changes required for ARIA Suite.**

- `aria.rules-engine` is registered in `Agent_Identity_Standard.md` — no new
  `AgentClass` is needed (it is `Governance`, already present).
- ARIA Logger events extend `sovereign_logger.py` only — not `shell-contract.ts`.
- ARIA Suite connects to existing SOVEREIGN infrastructure through existing
  interfaces — VIGIL (alert routing), SCRIBE (export certification), NEXUS
  (action item routing), COUNSEL (adaptation decisions).
- The `SovereignProduct` union already covers ARIA Suite (verify at session open).

**If a shell-contract change is discovered during build:** Stop. Surface the
finding in the handoff. Do not proceed with the change. A GD is required.

---

## 8. Approved UI Pattern

Consistent with all products since Session 19:

- White content cards (`#ffffff`, `1px solid #e2e8f0`) on `#f1f5f9` canvas
- `contentCardStyle` exported from `module-aria/src/banners.tsx`
- Apply from the first line of code — never as a retrofit
- Gap 5: all ARIA output in plain prose readable by non-technical reviewers
- Gap 6: three content categories visually distinct within five seconds:
  - Amber: temporary status (e.g., "regulatory source loading")
  - Blue: permanent governance guardrails (e.g., "all decisions are made by
    named human decision-makers — this engine evaluates, it does not decide")
  - Primary: substantive compliance findings the reviewer must act on

**ARIA-specific Gap 6 requirement:** Every ARIA screen that surfaces a compliance
finding must make visually explicit that the finding came from deterministic rule
evaluation, not AI inference. This is both a design standard and a product
differentiator — ARIA Suite's authority rests on its determinism.

---

## 9. Build Sequence

### Session 22 — ARIA Suite Scaffold

**Scope:** Module scaffold only. Do not build CLEAR, TRACER, or ARC logic in
Session 22 — the gap fixes and GD-19 take priority.

Scaffold deliverable:
- `module-aria/` directory structure
- `module-aria/src/AriaApp.tsx` — routing between CLEAR, TRACER, ARC panels
- `module-aria/src/banners.tsx` — `contentCardStyle`, governance banner components
- Shell registration for ARIA Suite (if not already present in `SovereignProduct`)
- `module-aria/package.json` and test scaffolding
- Minimum: renders in shell with correct navigation, correct role gate
  (`PLATFORM_ADMIN` minimum), correct gap 5/6 banners
- Target: 10–15 tests passing

### Session 23 — CLEAR Core

Deliverables:
- Compliance Dashboard implementation
- Certification Queue implementation
- Four Logger event types added to `sovereign_logger.py`
- CLEAR rule evaluation engine (deterministic, four regulatory sources)
- VIGIL integration for compliance alerts
- SCRIBE export gate integration (CLEAR certification required before export)
- Target: CLEAR fully functional · ~25 additional tests

### Session 24 — TRACER Core

Deliverables:
- Traceability Explorer implementation
- Three decision chain types implemented
- TRACER Logger event types added to `sovereign_logger.py`
- Integration with COUNSEL Decision Records
- Integration with SCRIBE document lineage
- Target: TRACER functional · ~20 additional tests

### Session 25 — ARC Core

Deliverables:
- Regulatory Impact Modeler implementation
- Dependency model for current regulatory framework
- ARC Logger event types added to `sovereign_logger.py`
- Integration with COUNSEL (adaptation decision routing)
- Integration with NEXUS (action item routing from impact reports)
- E2E Scenario 7: ARIA Suite — compliance check → CLEAR certification → export
- Target: ARC functional · full ARIA Suite CPMI-VRS benchmark scenarios · ~20 additional tests

---

## 10. Done Condition for Stage 6

Stage 6 is complete and Walkthrough D is authorized when:

1. All three ARIA components (CLEAR, TRACER, ARC) render in the shell
2. CLEAR certifies a SCRIBE export end-to-end
3. TRACER produces a complete traceability chain for a Decision Record
4. ARC produces an impact report for a proposed regulatory change
5. E2E Scenario 7 passing
6. CPMI-VRS benchmark scenarios for ARIA Suite passing
7. Gap 5 and Gap 6 standards met across all ARIA screens
8. `aria.rules-engine` determinism confirmed — no `sovereign-api-client` calls
   anywhere in ARIA Suite codebase
9. All tests passing · 0 vulnerabilities

---

## 11. Autonomous Operation Rules (Session 22+)

**Claude Code may decide independently:**
- Internal component structure within `module-aria/`
- Test file organization and naming within established patterns
- Import paths and module boundaries within the monorepo
- Which of CLEAR/TRACER/ARC panel to scaffold first if order is ambiguous

**Claude Code must surface and stop for:**
- Any discovery that ARIA Suite requires a shell-contract change
- Any discovery that `aria.rules-engine` needs to call `sovereign-api-client`
  (would change the fundamental architecture decision)
- Any regulatory source addition beyond the four initial sources
- Any requirement that ARIA makes a decision (rather than evaluating and flagging)
- Agent count discrepancy in `Agent_Identity_Standard.md` at session open

---

## 12. CPMI-VRS Certification for ARIA Suite

ARIA Suite requires CPMI-VRS certification before Walkthrough D. Because the
`aria.rules-engine` is deterministic and not LLM-backed, the certification
pathway differs from CPMI, APEX, and FLOWPATH:

- Gates 1 and 2 (accuracy benchmarks) are replaced by **determinism verification**:
  the same regulatory input produces the same compliance output on every run.
- Gate 3 (Project Principal attestation) remains: the Project Principal attests
  that CLEAR's rule set correctly reflects the applicable regulatory framework
  as of the attestation date.
- Gate 4 (monitoring baseline) remains: VIGIL alert routing from ARIA is confirmed.

The CPMI-VRS Gates tab in ARIA Suite will reflect this modified gate structure.
The modification is scoped to ARIA Suite's tab only — it does not change the
CPMI-VRS standard for other products.

---

*ARIA Suite Architecture · docs/16_ARIA_Suite_Architecture.md*
*Version 1.0 · June 29, 2026*
*Pre-Decisional · Internal Working Document*
*Commit to `docs/` before Session 22 opens*

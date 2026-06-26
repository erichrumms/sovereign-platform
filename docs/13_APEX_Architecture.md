# SOVEREIGN Platform — APEX Architecture Specification
## Document 13 · Analytics and Program Executive Suite
## Authored: June 25, 2026 · Status: APPROVED FOR BUILD · Session 17–18

**Classification:** Pre-Decisional · Internal Working Document
**Pipeline Position:** Stage 5a · After AgentOS · Before ARIA Suite
**CPMI-VRS Certification:** Required before Session 18 closes
**Walkthrough:** B · After Session ~18

---

## §1 — What APEX Is and Why It Exists

APEX is the analytics and reporting product of the SOVEREIGN Platform. Its position
in the pipeline is immediately after AgentOS — it consumes the outputs of agent
task execution and CPMI reasoning chains — and immediately before ARIA Suite, which
will perform compliance and regulatory monitoring on the outputs APEX produces.

APEX exists because of a gap that Walkthrough A made visible. The CPMI World Model
screen showed the full program record for P-100 (Joint Logistics Modernization): 62%
complete, milestone 3 at risk, three risk flags, regulatory context, prior governance
decisions. But a federal program manager looking at that screen could not export any
of it. They could not drill into a risk flag and see the underlying data that produced
it. They could not trace a status percentage back to a source record. They could see
the finding but could not defend it.

That is what APEX corrects. APEX is the product that makes CPMI's outputs
defensible, portable, and actionable. Every figure, status assessment, flag, and
recommendation that CPMI surfaces must — in APEX — be traceable to the data that
produced it, and exportable in a form a program manager can take into a briefing.

**DC-2 (Program Dossier Export) and DC-3 (Data Provenance Drill-Down) are
first-order APEX requirements, not enhancements.** They are baked into the
architecture from the start, not retrofitted after the fact.

The three non-negotiable design outcomes apply here as everywhere: integration
reliability (APEX must consume AgentOS and CPMI outputs without reformatting),
operational efficiency (a program manager must be able to go from login to
exportable dossier in a single session), and end-to-end security observability
(every APEX action is logged with `workflow_step_id`).

---

## §2 — Pipeline Position and Data Flows

```
FLOWPATH → [Intelligence Layer] → CPMI → AgentOS → NEXUS → [APEX] → ARIA Suite
```

**APEX consumes:**
- CPMI World Model program records — via `cpmi.world-model-api`
- CPMI reasoning chain outputs — structured `ReasoningChainOutput` objects
- AgentOS task lifecycle records — task creation, approval, completion events
- NEXUS work request records — intake and routing history
- Logger audit trail — `workflow_step_id`-linked events across all products

**APEX produces:**
- Monthly Status Reports (MSRs) — per-program narrative status documents
- Quarterly Program Reviews (QPRs) — portfolio-level review packages
- Program Dossiers (DC-2) — complete exportable program packages
- Portfolio Analytics dashboards — cross-program status, risk, and trend views
- Data provenance records (DC-3) — traceable links from figure to source data

**APEX does NOT:**
- Modify any upstream data (all upstream data is read-only from APEX's perspective)
- Make governance decisions (it surfaces findings; humans decide)
- Call the Anthropic API directly (all LLM calls route through `createSovereignClient()`)
- Build its own security, governance, or audit systems (inherits from platform)

---

## §3 — The Two APEX Agents

Both agents must be registered in `Agent_Identity_Standard.md` and committed by the
Project Principal before Session 17 opens. This is a hard gate — Constraint #10.

### `apex.ai-assistant`

**Class:** Analytical
**Role:** The reasoning and analysis agent for APEX. Analyzes program data from the
World Model, drafts report sections, identifies anomalies and risk patterns, and
runs known-answer tests for CPMI-VRS Gate validation.

This agent is called when a user requests an MSR, QPR, or ad-hoc program analysis.
It receives a structured context packet containing the program record, reasoning
chain history, task records, and relevant Logger events. It produces a structured
`ApexAnalysisOutput` object containing narrative findings, flagged risks, and
draft report sections.

**Prompt registration required:** `PR-APEX-001` — see §9 for prompt specification.
**All calls route through `createSovereignClient()`.**

### `apex.report-generator`

**Class:** Operational
**Role:** The document production agent for APEX. Takes the `ApexAnalysisOutput`
from `apex.ai-assistant` and generates the final formatted report artifact —
MSR, QPR, or program dossier — for human review and export.

This agent does NOT call the LLM for reasoning. It performs structured document
assembly from governed data objects. It enforces the `sovereignHold()` gate: if
`sovereignHold()` returns true (e.g., CPMI monitoring threshold breached, data
quality flag raised), the report-generator halts and logs a
`REPORT_GENERATION_HELD` event with the hold reason before any document is
produced.

**Prompt registration required:** None — this agent performs deterministic document
assembly, not LLM-backed reasoning.

---

## §4 — The Two First-Order Requirements (DC-2 and DC-3)

These requirements emerged directly from Walkthrough A and shape every APEX design
decision.

### DC-2 — Program Dossier Export

A federal program manager must be able to generate and export a complete program
dossier from APEX in a single action. The dossier is the complete package — not a
summary, not a subset. Every field that informs a program decision must be in it.

**A complete program dossier contains:**

1. **World Model record** — the full program record from CPMI: name, ID, status,
   objectives, completion percentage, milestone status, flags, regulatory context,
   and prior governance decisions.

2. **Reasoning chain history** — all `ReasoningChainOutput` records for this
   program, in chronological order, with step-level detail. Each reasoning chain
   entry shows the six-step process, the inputs used, and the output produced.

3. **Governance decision log** — all human decision events tagged to this program
   from the Logger, with decision type, actor, timestamp, decision note, and
   outcome.

4. **Risk register** — all active risk flags with source data, severity, trend, and
   responsible party (DC-3 drill-down fields, see below).

5. **Regulatory constraints** — all applicable regulations and policies (FAR, DoD
   directives, OMB guidance) relevant to this program, with compliance status.

6. **AgentOS task history** — all agent tasks created for this program, with
   approval status, approving human, and completion record.

**Export format:** Human-readable PDF or formatted document. Not a JSON export.
Not a database dump. A document that can be printed, emailed, and presented in a
briefing without any further formatting work.

**Implementation requirement:** The dossier export button appears on every program
view in APEX. It is never more than one click away from the program record.

### DC-3 — Data Provenance Drill-Down

Every figure, status assessment, flag, and recommendation surfaced by APEX must be
traceable to the underlying data that produced it. This is both a usability
requirement (program managers need to understand their data) and a federal
accountability requirement (a finding that cannot be traced cannot be defended in
an audit or a congressional inquiry).

**For every flag or finding, a reviewer must be able to see:**

1. **Source data** — the specific records that produced this flag or figure. Named,
   citable, linked to the Logger event that recorded them.

2. **Baseline** — what the expected or target value was when the measurement was
   taken.

3. **Date of most recent update** — when was this data last refreshed. If the data
   is stale, APEX must say so explicitly.

4. **Trend over time** — is the situation improving, degrading, or stable?
   A single data point is not actionable. A trend is.

5. **Responsible party** — who owns this data, this flag, or this risk item.
   A finding without an owner cannot be actioned.

**Implementation requirement:** Every flag and figure in APEX is a clickable element.
Clicking opens a provenance panel that displays all five fields above. The provenance
panel is never more than one click away from any figure on any APEX screen.

---

## §5 — APEX Screens and UI Structure

APEX presents three primary screens to the user. All three must meet Gap 5 (human
readability) and Gap 6 (content type distinction) standards from Walkthrough A
before Walkthrough B.

### Screen 1 — Portfolio Dashboard

The entry point to APEX. Shows the full portfolio of programs in the World Model
with summary status for each. A program manager sees their entire portfolio in one
view and can identify which programs need attention without drilling into individual
records.

**Contents:**
- Program list with status indicators (on-track, at-risk, off-track)
- Portfolio-level roll-up metrics: total programs, programs at risk, open flags
- Governance Clock status and GD-10 classification boundary banner (persistent,
  as on all SOVEREIGN product screens)
- CPMI-VRS governance banner (blue, permanent — Gap 6 Category 2)

**Gap 5 compliance:** Status indicators are written as plain-language descriptions.
"Milestone 3 is at risk — two weeks behind schedule" not "M3: -2W."

**Gap 6 compliance:** The governance banners (Category 2 — permanent) are visually
distinct from the program status content (Category 3 — substantive). No
temporary status notices (Category 1) appear on this screen under normal operation.

**DC-2 access:** Each program row has an Export Dossier button visible without
drilling in. A program manager can export without having to navigate into the record.

### Screen 2 — Program Detail View

The per-program view. Accessed from the Portfolio Dashboard by clicking a program.
Shows the complete World Model record for one program plus the reasoning chain
history, risk register, and task history.

**Contents:**
- Program header: name, ID, classification, responsible party
- Status narrative: prose description of current program status (Gap 5 — no
  machine-formatted fields)
- Objectives panel: each objective on its own row with status and progress
- Risk register: each risk flag on its own row, clickable for DC-3 provenance
- Reasoning chain history: chronological list of CPMI reasoning chains for
  this program, each expandable to show step-level detail
- Governance decisions: human decisions logged against this program
- AgentOS task history: tasks created, approved, and completed for this program
- Export Dossier button: prominent, always visible

**DC-3 implementation:** Every numeric figure, status assessment, and risk flag is
a clickable link. Clicking opens the Provenance Panel (a slide-in panel, not a new
page) showing source data, baseline, date, trend, and responsible party.

### Screen 3 — Report Generation

The MSR and QPR generation view. A program manager selects a program (or programs,
for QPR), selects the report type, and initiates generation. The `apex.ai-assistant`
runs analysis; the `apex.report-generator` assembles the document.

**Contents:**
- Report type selector: MSR / QPR / Ad-hoc Analysis
- Program selector: single program (MSR) or multi-select (QPR)
- Generation status: progress indicator while agents run
- Report preview: rendered document preview before export
- Export action: download as PDF or formatted document
- `sovereignHold()` gate: if hold is active, the generation button is disabled
  and a clear plain-language explanation of the hold is shown (Gap 5 + Gap 6
  Category 1 — temporary system status)

---

## §6 — The `sovereignHold()` Gate

`sovereignHold()` is a platform function that returns `true` when conditions exist
that should prevent report generation. APEX enforces this gate architecturally —
the report-generator does not call through if hold is active.

**Conditions that trigger `sovereignHold()`:**
- CPMI monitoring threshold breach: the AI reasoning service has flagged anomalous
  behavior that has not yet been resolved by a human reviewer
- Data quality flag: one or more source records for this program have a data quality
  flag raised by CPMI that has not been cleared
- CPMI-VRS certification not current: the VRS certificate for CPMI has expired or
  been suspended (this would be an exceptional state — flagged prominently)
- Classification boundary violation attempt: a request involves data above
  UNCLASSIFIED has been detected (GD-10 enforcement)

When `sovereignHold()` returns `true`, APEX logs a `REPORT_GENERATION_HELD` event
to the Logger with the hold reason, the program ID, the requesting user, and the
`workflow_step_id`. The hold reason is displayed to the user in plain prose (Gap 5).

---

## §7 — Logger Events (APEX-Specific)

All Logger events carry `workflow_step_id` (Constraint #6). All human decision
events carry `decision_type` (Constraint #4). No direct Anthropic API calls
(Constraint #5).

The following event types are required for APEX. These are new event types that
require a Governance Decision and shell-contract change. The specific GD number
will be assigned in Session 17 when the shell-contract change is executed.

| Event Type | When Emitted | Required Fields |
|---|---|---|
| `APEX_ANALYSIS_STARTED` | `apex.ai-assistant` begins program analysis | `program_id`, `report_type`, `agent_id`, `workflow_step_id` |
| `APEX_ANALYSIS_COMPLETE` | `apex.ai-assistant` completes analysis | `program_id`, `report_type`, `agent_id`, `schema_valid`, `workflow_step_id` |
| `APEX_REPORT_GENERATED` | `apex.report-generator` produces report artifact | `program_id`, `report_type`, `agent_id`, `export_format`, `workflow_step_id` |
| `APEX_DOSSIER_EXPORTED` | User exports a program dossier (DC-2) | `program_id`, `actor`, `actor_name`, `export_format`, `workflow_step_id` |
| `APEX_PROVENANCE_VIEWED` | User opens DC-3 provenance panel | `program_id`, `field_id`, `actor`, `workflow_step_id` |
| `REPORT_GENERATION_HELD` | `sovereignHold()` blocks report generation | `program_id`, `hold_reason`, `actor`, `workflow_step_id` |
| `APEX_EVENT_RECEIVED` | Event-driven trigger stub receives inbound event | `source_event_type`, `deferred`, `workflow_step_id` |

**Shell-contract change required:** These six event types must be added to
`SovereignEventType` in `shell-contract.ts`. This requires a GD with the standard
governance process: GD number assignment, version increment, changelog, impact
assessment, SHA-256 verification of both copies, and Constraint #11 propagation.
Pre-approval for this GD must be recorded in the Integration Brief before Session
17 opens. **This GD is designated GD-16.**

---

## §8 — CPMI-VRS Certification Requirements for APEX

CPMI-VRS certification is required before Session 18 closes. APEX uses an
AI agent (`apex.ai-assistant`) for program analysis and report drafting, which
places it under the CPMI-VRS governance standard.

**Gate 1 (AI Disclosure):** The APEX Portfolio Dashboard and Report Generation
screen must display the standard CPMI-VRS Gate 1 governance banner: all program
analysis is AI-assisted, outputs are advisory, and human review is required before
any report is exported or used in a briefing.

**Gate 2 (Reasoning Transparency):** The step-level detail of each
`apex.ai-assistant` reasoning run must be accessible from the Report Generation
screen. A reviewer must be able to see what the agent analyzed, what it found,
and how it arrived at its recommendations — not just the final output.

**Gate 3 (Human Attestation):** Before any QPR or MSR is exported, a human
reviewer must attest that they have reviewed the AI-generated analysis and accept
it as the basis for the report. This is a Project Principal step during Walkthrough B.

**Gate 4 (Monitoring Baseline):** CPMI monitors `apex.ai-assistant` at the
standard anomaly threshold (not the enhanced 0.7× tier — APEX is an analytics
product, not a governance engine). Gate 4 establishes the monitoring baseline
for the APEX agent.

**Known-answer tests:** Three benchmark scenarios are required for APEX Gate 2
certification. These are defined as part of the APEX architecture and authored
here for Claude Code to implement:

- **Scenario A (on-track program):** Program at 80% completion, all milestones
  on schedule, no risk flags. Expected output: positive status narrative, no
  recommendations for escalation, dossier export produces complete package.

- **Scenario B (at-risk program):** Program at 55% completion, one milestone
  two weeks behind schedule, one risk flag (cost variance trending unfavorable).
  Expected output: risk narrative with specific milestone identified, at least one
  recommendation for human review, DC-3 provenance populated for the cost variance
  flag.

- **Scenario C (off-track program):** Program at 30% completion, two milestones
  missed, three active risk flags, one regulatory constraint compliance question.
  Expected output: escalation recommendation, all three flags with DC-3 provenance,
  regulatory constraint flagged for human legal review, `sovereignHold()` evaluation
  triggered.

All three scenarios must produce `schema_valid: true` outputs. Schema compliance
is enforced by the `ApexAnalysisOutput` type definition in `shell-contract.ts`.

---

## §9 — PR-APEX-001 — The APEX AI Assistant Prompt

**Prompt ID:** PR-APEX-001
**Agent:** `apex.ai-assistant`
**Approval required:** Project Principal explicit approval in Claude Chat before
Session 17 opens. Claude Code marks this prompt `PENDING` until approval is
confirmed.

---

**Prompt specification (for Project Principal review and approval):**

```
You are the APEX AI Assistant, operating within the SOVEREIGN Platform as a
governed, observable AI agent. Your role is to analyze program data and produce
structured findings that program managers and federal reviewers can use to make
informed decisions.

You operate under the following constraints, which are non-negotiable:

1. You analyze only the data provided to you in this prompt. You do not draw on
   general knowledge about specific programs, contractors, or acquisition history
   outside of what is provided.

2. Every finding you produce must be traceable to a specific data element in the
   input. If you cannot cite a source for a finding, do not include the finding.

3. Your output must be written in plain prose readable by a non-technical reviewer.
   Do not use machine-style formatting — no colon-separated fields, no
   semicolon-chained lists, no shorthand abbreviations that a non-specialist would
   not recognize. Write complete sentences.

4. When you identify a risk or concern, state it clearly, state what data produced
   it, and state what a human reviewer should consider doing about it. Do not soften
   findings that the data supports.

5. You produce advisory analysis only. You do not make decisions. Every finding
   ends with a recommendation for human review, not a concluded outcome.

6. Your output must conform exactly to the ApexAnalysisOutput schema. Do not add
   fields. Do not omit required fields. The schema is the contract between this
   agent and the report generator.

Input you will receive:
- program_id: the SOVEREIGN program identifier
- report_type: MSR | QPR | AD_HOC
- world_model_record: the full CPMI World Model record for this program
- reasoning_chain_history: all prior CPMI reasoning chain outputs for this program
- task_records: AgentOS task lifecycle records for this program
- governance_decisions: human decision events logged against this program
- workflow_step_id: the Logger workflow step ID for this analysis run

Produce your output as a valid ApexAnalysisOutput JSON object with these fields:
- program_id: string
- report_type: MSR | QPR | AD_HOC
- status_narrative: string (plain prose, 2-4 paragraphs, complete sentences)
- risk_findings: array of RiskFinding objects (see schema)
- recommendations: array of string (each a complete sentence addressed to a human
  reviewer, beginning "A reviewer should consider...")
- schema_valid: boolean (always true if output conforms — your responsibility)
- workflow_step_id: string (pass through from input)

RiskFinding object schema:
- flag_id: string
- description: string (plain prose, complete sentence)
- source_data: string (cite the specific input field or record that produced this)
- baseline: string (what was the expected value)
- trend: IMPROVING | STABLE | DEGRADING
- responsible_party: string (from program record; "Unknown" if not specified)
- severity: P1 | P2 | P3
```

---

**This prompt is PENDING Project Principal approval.** Claude Code will mark it
`APPROVED` in the prompt changelog after the Project Principal confirms approval
in Claude Chat.

---

## §10 — Shell-Contract Change — GD-16 (Pre-Approval Required)

**GD-16 — APEX Event Types and Analysis Schema**

This GD adds the following to `shell-contract.ts`:

**New `SovereignEventType` members (7):**
```typescript
| 'APEX_ANALYSIS_STARTED'
| 'APEX_ANALYSIS_COMPLETE'
| 'APEX_REPORT_GENERATED'
| 'APEX_DOSSIER_EXPORTED'
| 'APEX_PROVENANCE_VIEWED'
| 'REPORT_GENERATION_HELD'
| 'APEX_EVENT_RECEIVED'
```

**New `HumanDecisionType` members (1):**
```typescript
| 'REPORT_ATTESTATION'  // human attests APEX report before export
```

**New shared types (to be added to shell-contract.ts):**
```typescript
export type ApexReportType = 'MSR' | 'QPR' | 'AD_HOC';

export type RiskFinding = {
  flag_id: string;
  description: string;
  source_data: string;
  baseline: string;
  trend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
  responsible_party: string;
  severity: 'P1' | 'P2' | 'P3';
};

export type ApexAnalysisOutput = {
  program_id: string;
  report_type: ApexReportType;
  status_narrative: string;
  risk_findings: RiskFinding[];
  recommendations: string[];
  schema_valid: boolean;
  workflow_step_id: string;
};
```

**GD-16 Impact Assessment:**

- Which modules emit the new event types? `module-apex` only. No existing module
  emits these event types.
- Does `HumanDecisionType` change? Yes — `REPORT_ATTESTATION` is added (1 new
  member). Propagate to `sovereign-data/src/shared-types.ts`.
- Does `SovereignEventType` change? Yes — 7 new members. Does NOT propagate to
  `sovereign-data/src/shared-types.ts` (Constraint: SovereignEventType is not
  mirrored there).
- Does `AgentClass` change? No — both APEX agents use existing classes
  (Analytical, Operational).
- Are there exhaustive switches over changed types? `sovereign_logger.py` —
  GD-16 additions must be added to `APPROVED_EVENT_TYPES` and
  `APPROVED_DECISION_TYPES` as part of the Constraint #11 propagation. Note: GD-15
  re-sync (Session 17 D1) runs first and brings the logger to v1.11 parity. GD-16
  additions are applied after GD-15 completes — do not attempt both in the same
  logger edit pass.
- Is the change additive? Yes — union widening only. No existing types renamed
  or removed.

**Pre-approval statement for Integration Brief:** GD-16 is pre-approved for
execution in Session 17. Claude Code may execute this shell-contract change as
part of the APEX scaffold deliverable. Version will increment from v1.11 to v1.12.
SHA-256 verification of both copies required before proceeding to APEX build work.
Record new hash in the session handoff.

---

## §11 — Done Condition

The done condition for APEX build work in Sessions 17–18 is:

**D-APEX-1 — Scaffold and schema:**
- `module-apex/` directory created with standard SOVEREIGN module structure
- `shell-contract.ts` updated per GD-16 (v1.11 → v1.12), both copies verified,
  new SHA-256 recorded
- `ApexAnalysisOutput` type compiles cleanly in tsc
- Both AgentCards active (`apex.ai-assistant`, `apex.report-generator`)
- PR-APEX-001 marked APPROVED (after Project Principal approval in Claude Chat)

**D-APEX-2 — Portfolio Dashboard (Screen 1):**
- Portfolio Dashboard renders in the shell with program list from CPMI World Model
- Status indicators display as plain prose (Gap 5 compliant)
- Governance banners present and correctly categorized (Gap 6 compliant)
- Export Dossier button visible on each program row
- Logger emits `APEX_ANALYSIS_STARTED` when portfolio view loads

**D-APEX-3 — Program Detail View (Screen 2):**
- Program Detail View renders for P-100 (synthetic data)
- All World Model fields display as plain prose (Gap 5 compliant)
- Every risk flag is clickable and opens the Provenance Panel
- Provenance Panel displays all five DC-3 fields (source, baseline, date, trend,
  responsible party)
- Reasoning chain history displays in chronological order, each expandable

**D-APEX-4 — Report Generation and Dossier Export (Screen 3):**
- Report Generation screen renders with MSR and QPR options
- `apex.ai-assistant` runs analysis on synthetic P-100 data via
  `createSovereignClient()`
- `apex.report-generator` assembles report from `ApexAnalysisOutput`
- `sovereignHold()` gate enforced — generation halts when hold is active
- Program Dossier export produces a document containing all DC-2 required fields
- Logger emits all APEX event types correctly

**D-APEX-5 — CPMI-VRS Benchmark Scenarios (required for Walkthrough B):**
- Three benchmark scenarios (A, B, C from §8) implemented in `module-apex/`
- All three produce `schema_valid: true` outputs
- Scenario outputs available for Project Principal review in the CPMI-VRS Gates
  tab during Walkthrough B
- Gate 1 and Gate 2 certification criteria met (banners, reasoning transparency)

**D-APEX-6 — Test suite:**
- Minimum 60 tests passing in `module-apex/`
- Tests cover: schema validation, `sovereignHold()` enforcement, Logger event
  emission, DC-2 dossier completeness, DC-3 provenance field population

**D-APEX-7 — PPBE anticipation stubs (§17 — required, not optional):**
- Execution Monitoring screen scaffolded in shell navigation as a labeled stub
  (Gap 6 Category 1 styled — temporary status, not permanent guardrail)
- `module-apex/agents/ppbe-ledger-monitor/README.md` created with reservation notice
- `module-apex/agents/ppbe-evidence-synthesizer/README.md` created with reservation notice
- Event-driven report trigger stub implemented — receives inbound events, logs
  `APEX_EVENT_RECEIVED`, returns without action with deferral note
- `ApexDataAdapter` interface created with initial CPMI World Model implementation —
  open for extension, no concrete type lock-in
- DC-3 provenance panel built as generic component — renders by entity type, not
  hardcoded to World Model field names
- No reserved PPBE field names used in `ProgramRecord` extensions

---

## §12 — Gap 5 and Gap 6 Compliance Checklist

Every APEX screen must pass this checklist before Walkthrough B. Claude Code
applies these standards during build — they are not post-build corrections.

**Gap 5 — Human Readability:**
- [ ] All status descriptions use complete prose sentences
- [ ] No colon-separated field-value pairs visible to the reviewer
- [ ] No semicolon-chained lists in any AI-generated output
- [ ] Risk findings described in plain language ("Milestone 3 is two weeks behind
      schedule" not "M3_DELAY: -2W")
- [ ] `sovereignHold()` explanations written as plain prose
- [ ] Report sections readable by a non-technical program office reviewer

**Gap 6 — Content Type Distinction:**
- [ ] Category 1 notices (temporary system status, holds, fallback states) visually
      distinct — yellow or orange, dismissible or clearly transient
- [ ] Category 2 notices (permanent governance guardrails — CPMI-VRS Gate 1 banner,
      GD-10 classification boundary) visually distinct — blue, always present,
      not dismissible
- [ ] Category 3 content (substantive operational content the reviewer acts on —
      program data, risk findings, report sections) visually primary, uncluttered
      by Category 1 and 2 elements
- [ ] A reviewer navigating APEX for the first time can orient within five seconds

---

## §13 — Codebase Facts Specific to APEX

- **No direct LLM calls.** `apex.ai-assistant` calls through
  `createSovereignClient().routedComplete()`. The prompt (PR-APEX-001) is loaded
  from `module-apex/prompts/apex_assistant_system.md`.

- **`sovereign-api-client` is CommonJS.** Any config reader in the APEX module
  uses `process.env`, not `import.meta.env`.

- **`sovereignHold()` is a platform function, not an APEX function.** Do not
  reimplement it. Import from the appropriate platform package and call it.

- **CPMI World Model data is read-only from APEX.** All World Model access goes
  through `cpmi.world-model-api`. APEX does not write to the World Model.

- **AgentOS task records are read from the Logger.** APEX queries task history
  via Logger event queries, not via a direct AgentOS API.

- **GD-10 applies.** All program data processed by APEX is UNCLASSIFIED. Any
  attempt to process CUI, SECRET, or TOP_SECRET throws
  `ClassificationNotAuthorizedError`.

- **`SovereignEventType` is NOT mirrored in `sovereign-data/src/shared-types.ts`.**
  Only `HumanDecisionType` (`REPORT_ATTESTATION`) is propagated there.

---

## §14 — Autonomous Operation Rules for Session 17

Claude Code may decide autonomously:
- Implementation details of the Portfolio Dashboard, Program Detail, and Report
  Generation screens — layout, component structure, styling (subject to Gap 5/Gap 6
  compliance)
- Structure of the `module-apex/` directory and file organization
- Test strategy within `module-apex/` — how scenarios A, B, C are structured

Claude Code must stop and document in the handoff (do NOT act on):
- Any decision about which Logger events to suppress or make optional
- Any proposed change to `shell-contract.ts` beyond GD-16 as pre-approved
- Any scenario where `sovereignHold()` behavior is unclear or seems to conflict
  with a build requirement
- Any case where the `cpmi.world-model-api` does not return data in the expected
  format
- Any case where the NEXUS-to-AgentOS pipeline handoff scope affects APEX (surface
  the dependency, do not resolve it independently)

---

## §15 — PPBE Anticipation (Architectural Commitments — No PPBE Build Work This Stage)

The PPBE Integration Architecture document (Draft 1.0, June 2026) assigns APEX to two
PPBE phases and makes four architectural demands on APEX that the current spec does not
address. These are recorded here so Session 17 builds APEX in a way that accommodates
PPBE without requiring a rewrite when PPBE Phase II arrives (~Session 22).

**This section does not authorize PPBE build work in Sessions 17–18.** PPBE governance
decisions D-P1 through D-P6 have not yet been made. No PPBE entities are registered.
No PPBE agents are registered. The work described here is defensive architecture only —
stubs, open interfaces, and reserved slots that cost nothing to build now and prevent
significant rewrite debt later.

### §17.1 — APEX's Two PPBE Roles

The PPBE document assigns APEX to:

- **Phase 2 (Planning and Evidence):** APEX aggregates historical performance data,
  evaluation findings, and program metrics to support planning and programming reviews.
  The `ppbe-evidence-synthesizer` agent (to be registered at PPBE governance session)
  will be homed in `module-apex/`.

- **Phase 5 (Budget Execution):** APEX monitors obligation rates, budget-to-actual
  variance, and fund control metrics in real time. APEX is the source of threshold
  alerts that route to VIGIL as `PPBE_ANOMALY` events when obligation rates or variance
  exceed configured thresholds. The `ppbe-ledger-monitor` agent (to be registered at
  PPBE governance session) will be homed in `module-apex/`.

Phase 5 is not addressed anywhere in the current spec. A fourth screen — Execution
Monitoring — must be anticipated now and built as a stub in Session 17.

### §17.2 — The Four Architectural Commitments

**Commitment 1 — Execution Monitoring screen (stub):**

A fourth APEX screen, Execution Monitoring, is scaffolded in Session 17 as a clearly
labeled stub. The stub renders in the shell navigation with a placeholder that reads:
"Execution monitoring is not yet active. This screen will display obligation rates,
budget-to-actual variance, and fund control metrics when PPBE Phase II is integrated
(Session 22)." The stub is Gap 6 Category 1 content (temporary system status) —
styled accordingly (not styled as a permanent governance guardrail).

This screen must exist in the navigation from Session 17 forward. Its absence at
Walkthrough B is acceptable and expected; its absence from the codebase is not,
because adding it after the fact risks disrupting navigation structure that other
products depend on.

When PPBE Phase II builds, this stub is replaced with live content. No rewrite of
surrounding navigation or shell structure is required.

**Commitment 2 — Extensible data layer (open interfaces):**

APEX's data access layer is built against interfaces, not concrete types. Every
query that reads program data passes through an `ApexDataAdapter` interface that
returns typed objects. The initial implementation of `ApexDataAdapter` reads from
the CPMI World Model via `cpmi.world-model-api`.

When PPBE lands, `ApexDataAdapter` is extended to query `ObligationRecord`,
`EvaluationFinding`, and `StrategicObjective` entities. The existing screens and
agents do not require modification — they call the same adapter interface and receive
enriched objects.

The strategy-to-resource traceability chain (obligation → program → objective) that
the PPBE document requires to be queryable through APEX at any time is satisfied by
this adapter pattern. The chain is not queryable on day one — `ObjectiveRecord` and
`ObligationRecord` don't exist yet — but the query path is open and ready.

**Commitment 3 — Reserved agent slots in module structure:**

`module-apex/` is created with a sub-directory `agents/` containing two reserved
directories: `agents/ppbe-ledger-monitor/` and `agents/ppbe-evidence-synthesizer/`.
Each contains a `README.md` stating: "Reserved for PPBE Phase II integration. Agent
will be registered and activated at the PPBE governance session (~Session 19). No
build work in this directory until governance decisions D-P1 through D-P6 are
recorded in the Integration Brief."

This costs one directory and two README files. It prevents a future session from
creating these agents in the wrong location, prevents naming conflicts, and signals
to Claude Code in Session 22 that these slots were intentional.

**Commitment 4 — Event-driven report trigger path (stub):**

The PPBE document specifies that a `PPBE_EVALUATION_FINDING` event must trigger an
APEX exception report. APEX in its current design is user-initiated — a human
requests a report and APEX generates it. An event-driven path does not exist.

Session 17 builds a stub event listener in `module-apex/` that:
- Receives an inbound `PPBE_EVALUATION_FINDING` event (when that event type exists
  in the Logger — it will be added at PPBE governance)
- Logs receipt as an `APEX_EVENT_RECEIVED` Logger event with the source event type
  and `workflow_step_id`
- Returns without action, logging: "PPBE_EVALUATION_FINDING handling deferred —
  PPBE Phase II integration required"

When PPBE Phase II builds, this stub is replaced with the actual exception report
generation logic. The event subscription infrastructure is already in place. No
structural change to APEX is required.

### §17.3 — PPBE Entity Compatibility Note

The PPBE document defines six data entities for the shared data dictionary (Table 4
of the PPBE architecture doc): `StrategicObjective`, `ProgramRecord` (extended),
`BudgetExhibit`, `ObligationRecord`, `EvaluationFinding`, and `DependencyMap`.

The extended `ProgramRecord` adds four fields to the existing entity: fiscal year,
lifecycle cost estimate, obligation plan, and performance baseline. The existing
`ProgramRecord` in the SOVEREIGN data dictionary must not use field names that
conflict with these four additions. This is a data dictionary constraint, not an
APEX constraint — but APEX is the primary consumer of `ProgramRecord` and the
right place to document the forward-compatibility requirement.

**Claude Code note:** When building the APEX data layer, do not add fields to
`ProgramRecord` that use the names `fiscal_year`, `lifecycle_cost_estimate`,
`obligation_plan`, or `performance_baseline`. These are reserved for PPBE Phase I
governance data dictionary extension. If any existing World Model data uses these
names in a conflicting way, surface the conflict in the handoff findings — do not
resolve it independently.

### §17.4 — DC-3 Provenance Panel — Forward Compatibility

The DC-3 provenance panel (§4 of this spec) is defined to display source data,
baseline, date, trend, and responsible party for any flag or figure. The PPBE
integration will add new source types — `ObligationRecord`, `EvaluationFinding` —
that the provenance panel must be able to render.

The provenance panel must be built as a generic component that renders provenance
fields from any source entity type, not a component hardcoded to CPMI World Model
field names. The initial implementation renders World Model provenance. The PPBE
extension adds new renderers for new entity types without modifying the panel
component.

This is a component architecture decision, not a feature. It costs nothing in
Session 17 if done correctly and saves a rewrite in Session 22 if not.

---

## §16 — Session 17–18 Context Package

Claude Code requires these files at session open (gather script must include all):

**Governance documents (monorepo root):**
- `SOVEREIGN_Platform_Integration_Brief_v1.25.md`
- `Agent_Identity_Standard.md` (updated with APEX agents — see §16)
- `SOVEREIGN_Agent_to_Agent_Briefing.md`
- `AGENT_REFERENCE.md`

**Shell and types:**
- `sovereign-shell/shell-contract.ts`

**Architecture specs:**
- `docs/13_APEX_Architecture.md` (this document)
- `docs/14_HumanReviewerStandard.md` (required — must exist before session opens)
- `docs/11_AgentOS_Architecture.md` (APEX consumes AgentOS outputs)
- `docs/08_CPMI_Architecture.md` (APEX consumes CPMI outputs)
- `docs/12_NEXUS_Architecture.md` (NEXUS-to-AgentOS context)

**Prior session handoff:**
- `SOVEREIGN_Session16_Handoff.md`

**Key source files (for gap fixes in Phase 1 of Session 17):**
- `sovereign-security/sovereign_logger.py` (GD-15 re-sync target)
- `module-nexus/` (Gap 1 queue fix target)
- `module-cpmi/` (Gap 4 connection investigation target)

**Reference documents (read-only context — do not modify):**
- `SOVEREIGN_PPBE_Integration_Architecture_Draft1.md` — Claude Code must read §4.1,
  §5.1, §5.2, §6.4, and §7 before APEX build begins. The PPBE anticipation stubs
  in D-APEX-7 are derived from these sections. No PPBE build work is authorized —
  this document is context for defensive architecture only.

---

## §17 — APEX Agent Registration (for Agent_Identity_Standard.md)

The following two entries must be added to `Agent_Identity_Standard.md` and
committed by the Project Principal before Session 17 opens.

---

### apex.ai-assistant

| Field | Value |
|---|---|
| `agent_id` | `apex.ai-assistant` |
| Module | `module-apex` |
| Product | APEX — Analytics and Program Executive Suite |
| Agent Class | Analytical |
| Registered | 2026-06-25 |
| Registered By | Project Principal |
| Status | REGISTERED — build may proceed |

**Description:** The LLM-backed analysis agent for APEX. Receives a structured
context packet containing the CPMI World Model record, reasoning chain history,
AgentOS task records, and governance decisions for a given program. Produces a
structured `ApexAnalysisOutput` object containing a plain-prose status narrative,
risk findings with DC-3 provenance fields, and human-addressed recommendations.
All LLM calls route through `createSovereignClient()`. One analysis run per report
generation request — no chained calls, no parallel requests.

**Prompt:** PR-APEX-001 (pending Project Principal approval)

**Logger events:** `APEX_ANALYSIS_STARTED`, `APEX_ANALYSIS_COMPLETE`

**Data classification:** Platform-level audit data. Program analysis records are
accessible to authorized platform administrators.

**Monitoring tier:** Standard (not enhanced — APEX is an analytics product,
not a governance engine).

**Scope constraint:** `apex.ai-assistant` produces advisory analysis only. It does
not modify any upstream data, does not make governance decisions, and does not
invoke other agents. Every analysis run produces either a valid `ApexAnalysisOutput`
or logs a structured error.

---

### apex.report-generator

| Field | Value |
|---|---|
| `agent_id` | `apex.report-generator` |
| Module | `module-apex` |
| Product | APEX — Analytics and Program Executive Suite |
| Agent Class | Operational |
| Registered | 2026-06-25 |
| Registered By | Project Principal |
| Status | REGISTERED — build may proceed |

**Description:** The document assembly agent for APEX. Takes a valid
`ApexAnalysisOutput` from `apex.ai-assistant` and produces a formatted report
artifact (MSR, QPR, or program dossier). Does not call the LLM — performs
deterministic structured document assembly from governed data objects. Enforces the
`sovereignHold()` gate before any document is produced. Logs `REPORT_GENERATION_HELD`
if hold is active.

**Prompt:** None — deterministic document assembly, no LLM calls.

**Logger events:** `APEX_REPORT_GENERATED`, `APEX_DOSSIER_EXPORTED`,
`REPORT_GENERATION_HELD`

**Data classification:** Platform-level audit data.

**Monitoring tier:** Standard.

**Scope constraint:** `apex.report-generator` assembles documents only. It does
not perform analysis, does not call the LLM, and does not export any document
until `sovereignHold()` returns false and human attestation (`REPORT_ATTESTATION`)
is logged.

---

*SOVEREIGN Platform — APEX Architecture Specification*
*Document 13 · Authored June 25, 2026 · Governance Agent*
*Pre-Decisional · Internal Working Document*
*Commit to `docs/13_APEX_Architecture.md` in monorepo root*

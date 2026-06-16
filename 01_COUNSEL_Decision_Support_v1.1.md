# COUNSEL — Decision Support and Adversarial Reasoning Module

**Document Type:** Companion App Architecture Specification
**Version:** 1.1 — June 11, 2026
**Companion To:** SOVEREIGN Platform Integration Brief v1.5
**Classification:** Pre-Decisional · Internal Working Document

**Changes in v1.1:**
- VIGIL added as a named inbound deep-link source in §4.1 `COUNSELInboundContext`
- §4.2 Product-Specific Integration Points: VIGIL entry added
- §4.3 Outbound: VIGIL added to return path
- §6.2 Governance Decision Dependency: GD-3 status updated to APPROVED
- §7 Session Zero: Integration Brief reference updated to v1.5
- Footer updated

All other content is unchanged from v1.0.

-----

## Purpose

COUNSEL is the individual knowledge worker's decision support interface to the
SOVEREIGN platform. It helps users who work *within* SOVEREIGN products — reviewers,
program managers, task owners, compliance officers — think through high-stakes
decisions before they take action in any SOVEREIGN product. COUNSEL does not
duplicate SOVEREIGN's logging, governance, or audit infrastructure. It uses them.
Every decision analysis COUNSEL produces is emitted through the SOF Logger, tagged
with the platform's canonical `decision_type` taxonomy, and counted as a
HUMAN_DECISION event that trains the Intelligence Layer's Judgment Detection
component.

COUNSEL exists because SOVEREIGN's products surface decisions to humans but do not
help humans *make* those decisions well. NEXUS sends a task requiring judgment. CPMI
flags a medium-risk recommendation. APEX generates a report that triggers a
governance hold. VIGIL surfaces an AgentOS gate review requiring operator approval.
The human at each of these moments needs structured support — not a second governance
system, but a thinking tool that feeds directly back into the platform's audit trail.

-----

## 1. What COUNSEL Is Not

**COUNSEL does not log anything independently.** All logging flows through the SOF
Logger client inherited from the `sovereign-shell`. COUNSEL emits events; the Logger
records them. COUNSEL has no log store of its own.

**COUNSEL does not govern anything.** CPMI-VRS governs AI behavior across the
portfolio. COUNSEL uses the CPMI certification status that the shell context exposes
(`ctx.governance`) to decide whether to proceed, pause, or surface a warning. It
does not make governance decisions.

**COUNSEL does not orchestrate agents.** COUNSEL makes one LLM call per action,
routed through `sovereign-api-client` (the three-tier fallback: live → cached →
static). It does not run a fleet of agents. AgentOS owns orchestration.

-----

## Project Architecture Summary

This section is written for Claude Code. Read it before writing any code, creating
any file, or making any architectural decision for COUNSEL. When in doubt about the
stack, return here rather than inferring from context.

### 1. What the App Is

COUNSEL is a decision support module in the SOVEREIGN companion suite. It helps
individual knowledge workers — program managers, compliance officers, reviewers,
and platform operators — think through high-stakes decisions before taking action
in any SOVEREIGN product. It does this by structuring the decision frame, generating
multi-alternative analysis, pressure-testing the preferred option through adversarial
dialogue, and producing a governed Decision Record that feeds the Intelligence Layer's
Judgment Detection training corpus. COUNSEL advises; it does not decide. The human
retains judgment throughout every session.

The core problem it solves: SOVEREIGN's six primary products and the VIGIL operator
dashboard surface decisions to humans but provide no structured support for making
those decisions well. COUNSEL is that support layer.

### 2. Technical Stack

| Layer | Technology | Notes |
|---|---|---|
| Language | TypeScript | Strict mode; all files `.ts` or `.tsx` |
| Framework | React 18 | Functional components only; hooks pattern throughout |
| Module host | `sovereign-shell` | Option C federated module architecture; COUNSEL mounts as `module-counsel` |
| State management | React hooks (`useState`, `useReducer`, `useContext`) | No Redux, no Zustand, no external state library |
| LLM calls | `sovereign-api-client` | Three-tier fallback: live API → cached → static template. Never call Anthropic API directly. |
| LLM model | `claude-sonnet-4` | Specified in `sovereign-api-client` config; do not hardcode model strings in COUNSEL |
| Logging | SOF Logger via `ctx.logger` | SHA-256 hash-chained, append-only JSONL; inherited from shell context |
| Auth | `ctx.auth` | SOVEREIGN RBAC; inherited from shell; do not implement independently |
| Governance | `ctx.governance` | CPMI-VRS status; inherited from shell; do not implement independently |
| Navigation | `ctx.navigation` | Shell-managed routing; use for all deep-link inbound and Decision Record export outbound |
| Data types | `sovereign-data` package | Import all canonical entity types from here; do not redefine in COUNSEL |
| Styling | Tailwind CSS | Shell-configured; use utility classes only |
| Testing | Jest + React Testing Library | Unit tests for hooks; component tests for framing and analysis flows |
| Build | Vite | Per SOVEREIGN monorepo config |

### 3. Data Model

COUNSEL has no database. It has no persistent store of its own. The SOF Logger is
the authoritative record of everything that happens in COUNSEL. Session state lives
in React component state and is discarded when the session ends.

The entities COUNSEL works with:

**`DecisionFrame`** — the structured input the user provides before analysis begins.
Fields: `decisionStatement`, `stakes`, `constraints`, `sovereignContext` (containing
`sourceProduct`, `workflowStepId`, `decisionType`). This is a transient session
object — it exists in component state, not in any store.

**`AnalysisResult`** — the structured JSON returned by the LLM and validated against
schema. Fields: `alternatives[]` (min 3), `riskScenarios[]` (one per alternative,
with severity tag), `assumptionFlags[]`, `confidenceScore` (0–100),
`recommendedNextAction`. Extends with `counterargumentSummary` and `preMortemResult`
when those modes are used.

**`ConflictingRecord`** — a prior Decision Record retrieved from the Logger scoped
query. Fields: `recordId`, `date`, `decisionType`, `conclusion`,
`conflictingElement`. Read-only input to the Prior Position Alert UI.

**`DecisionRecord`** — the final output, exported as a JSON object conforming to the
SOVEREIGN canonical `Document` entity schema from `sovereign-data`. This is what gets
passed back to the source product and emitted in the `HUMAN_DECISION` Logger event.

**Relationships:** One `DecisionFrame` → one `AnalysisResult` (optionally extended
with counterargument and pre-mortem output) → one `DecisionRecord`. A
`DecisionRecord` may reference zero or more `ConflictingRecord` IDs if a Prior
Position Alert was shown.

### 4. Key Integrations and Dependencies

| Integration | Direction | Data | Constraint |
|---|---|---|---|
| `sovereign-api-client` | Outbound | Decision frame + prompts → structured JSON | All LLM calls route here; never call Anthropic API directly |
| SOF Logger (`ctx.logger`) | Outbound | `HUMAN_DECISION`, `PRIOR_POSITION_RECONCILIATION` events | Append-only; every event carries `agent_id` and `prompt_version` |
| SOF Logger query API | Inbound (read-only) | User's own prior Decision Records | Scoped to `ctx.auth.userId`; platform enforces scope — do not substitute client-side filtering |
| `sovereign-data` | Inbound (types) | Canonical entity schemas, `DecisionType` taxonomy | Import only; do not redefine in COUNSEL |
| Source SOVEREIGN products | Inbound (deep link) | `COUNSELInboundContext` payload | Pre-populates framing form; user must still confirm before analysis |
| Source SOVEREIGN products | Outbound | `DecisionRecord` ID via `ctx.navigation` | Shell-managed; no direct product API calls from COUNSEL |

**Data sovereignty constraint:** All COUNSEL data flows through `sovereign-api-client`
and the SOF Logger. COUNSEL calls no external service directly. For federal
deployments, `sovereign-api-client` routes through FedRAMP-authorized endpoints —
COUNSEL code requires no changes; configuration lives in the shell.

### 5. Deployment and Environment

COUNSEL is a module in the SOVEREIGN monorepo with no independent deployment. It
deploys when `sovereign-shell` deploys.

| Environment | Notes |
|---|---|
| Development | Local monorepo dev server; `ctx.governance` uses local portfolio status stub |
| Staging | Per SOVEREIGN platform staging config |
| Production | Per SOVEREIGN platform production config; CPMI-VRS Gate 4 required before promotion |

**Infrastructure constraints:** COUNSEL inherits all infrastructure from
`sovereign-shell`. FedRAMP authorization, GovCloud hosting, and data residency
requirements for federal deployments are enforced at the shell and
`sovereign-api-client` layers — COUNSEL code is infrastructure-agnostic by design.

**Air-gap note:** Tier 3 fallback (static template response) is the graceful
degradation path for air-gapped or API-unavailable environments. The static
template must be a meaningful fallback — a structured placeholder instructing the
user to proceed with caution — not an empty stub.

### 6. Component Map

```
module-counsel/
  DecisionFramer          ← Entry point. Collects DecisionFrame from user.
    ↓
  PriorPositionAlert      ← Runs Logger scoped query; surfaces ConflictingRecords if found.
    ↓
  AnalysisPanel           ← Submits framing to sovereign-api-client; renders AnalysisResult.
    ↓ (branching — user chooses one or both, or neither)
  CounterargumentPanel    ← Multi-turn adversarial dialogue on selected alternative.
  PreMortemStudio         ← Three-step failure reconstruction exercise.
    ↓
  DecisionRecord          ← Assembles final record; emits HUMAN_DECISION Logger event;
                            exports record ID to source product via ctx.navigation.
```

Each component is a self-contained React component with a corresponding hook. The
hook owns all data fetching, LLM calls, and Logger emission. The component owns only
rendering and user interaction. **Do not put API calls or Logger calls in component
bodies.**

### 7. Governance and Access Rules

**RBAC:** COUNSEL inherits role-based access from `ctx.auth`. All SOVEREIGN roles
can access COUNSEL, including `PLATFORM_ADMIN` and `SYSTEM_ADMIN` roles accessing
it from VIGIL. No features are role-gated within the module.

**CPMI-VRS gates enforced in code:**
- Gate 1: Disclosure banner in `DecisionFramer` on every session start; cannot be
  dismissed before framing begins.
- Gate 2: `useLogger` emits on every analysis, counterargument turn, pre-mortem
  step, and Decision Record output. If a Logger emit fails, surface an error — do
  not silently continue.
- Gate 3: Decision Record cannot be produced until the user explicitly confirms
  they have reviewed the analysis and chosen an action.
- Gate 4: Pending Stage 3 REST API; no code changes required — reads from
  `ctx.governance`.

**Prompt registry:** All three prompts (`analysis_system.md`, `counter_system.md`,
`premortem_system.md`) must be registered before any build session.

**Agent registry:** `counsel-analyst` must be registered before any build session.

**Data classification:** COUNSEL Decision Records are platform-level audit data,
accessible to authorized administrators. They are not tagged
`data_classification: user`. Users are informed that their decision records are
auditable.

-----

## 2. Core Capabilities

*(Sections 2.1–2.6 unchanged from v1.0 — see full capability descriptions in the
v1.0 document. Summary: Prior Position Alert, Decision Framing, Analysis Engine,
Counterargument Mode, Pre-Mortem Studio, Decision Record Output.)*

-----

## 3. Architecture

*(Sections 3.1–3.6 unchanged from v1.0 — monorepo position, LLM call architecture,
Prior Position Check architecture, Prompt Registration, CPMI Integration, Decision
Type Taxonomy.)*

-----

## 4. Deep Link Integration with SOVEREIGN Products

### 4.1 Inbound: From SOVEREIGN to COUNSEL

Each SOVEREIGN product and the VIGIL operator dashboard can deep-link to COUNSEL
at any decision point. The deep link carries a structured context payload:

```typescript
interface COUNSELInboundContext {
  sourceProduct: 'NEXUS' | 'CPMI' | 'APEX' | 'FLOWPATH' | 'ARIA' |
                 'AgentOS' | 'VIGIL';    // ← VIGIL added v1.1
  workflowStepId: string;               // frozen field — feeds Intelligence Layer
  decisionType: DecisionType;           // from Decision Matrix taxonomy
  suggestedStakes?: string;             // optional pre-fill for framing
  referenceDocumentId?: string;         // canonical Document entity ID
  // VIGIL-specific optional fields:
  alertId?: string;                     // populated when sourceProduct === 'VIGIL'
                                        // and decision relates to an active alert
  approvalRequestId?: string;           // populated when decision relates to an
                                        // AgentOS approval request
}
```

When COUNSEL receives this payload, it pre-fills the framing form and immediately
runs the Prior Position Check against the pre-filled `decisionType` and
`workflowStepId`. The user reviews any alerts before proceeding to analysis.

**VIGIL-sourced context note:** When `sourceProduct === 'VIGIL'`, the
`suggestedStakes` field is pre-populated with the alert or approval request context
summary from VIGIL. The operator reviews and confirms the framing before analysis
proceeds — VIGIL's context summary does not bypass the framing step.

### 4.2 Product-Specific Integration Points

**NEXUS → COUNSEL:** A task marked `decision_required: true` surfaces an "Analyze
This Decision" button that deep-links to COUNSEL with the task's context
pre-populated.

**APEX → COUNSEL:** The QPR/ABS override path requires a COUNSEL Decision Record
before the override can be submitted. The override form cannot be submitted without
a valid COUNSEL record ID.

**CPMI → COUNSEL:** A medium-risk recommendation from CPMI surfaces a "Review Before
Approving" link that deep-links to COUNSEL with the CPMI output as context. The Gate
3 human oversight requirement is satisfied by the resulting COUNSEL Decision Record.

**FLOWPATH → COUNSEL:** When FLOWPATH's six-agent system surfaces a decision point
in a VVR being built, it can route the human reviewer to COUNSEL to analyze the
decision type before encoding it in the VVR.

**ARIA Suite → COUNSEL:** Out of scope for execution-layer decisions. In scope for
ARIA rule maintenance decisions.

**VIGIL → COUNSEL** *(added v1.1):* For `GATE_REVIEW` and `ANOMALY_OVERRIDE`
AgentOS approval request types, VIGIL's `ApprovalDetail` panel surfaces an "Analyze
This Decision in COUNSEL" button. The approval request context — pipeline stage,
agent, decision options, and the plain-language context summary — is passed as a
`COUNSELInboundContext` payload with `sourceProduct: 'VIGIL'`. The resulting COUNSEL
Decision Record ID is returned to VIGIL and attached to the `AgentApprovalDecision`
before it is submitted to AgentOS. A COUNSEL Decision Record is recommended for
GATE_REVIEW and ANOMALY_OVERRIDE decisions but not required — the operator can
proceed without one.

This integration means the most consequential decisions in the platform — AgentOS
gate reviews and anomaly overrides — can be taken through the same adversarial
reasoning structure as all other COUNSEL decisions. The Intelligence Layer receives
labeled training data for the agent oversight decision category with full reasoning
traces attached.

### 4.3 Outbound: COUNSEL to SOVEREIGN

When a Decision Record is produced, COUNSEL offers two export paths:

1. **Return to source product:** The Decision Record ID is passed back to the
   originating product or module, which attaches it to the relevant workflow record,
   task, document, or (for VIGIL) approval decision before submission.
2. **Log only:** The Logger event is emitted but no return navigation occurs. Used
   when the decision does not correspond to a specific in-platform action.

-----

## 5. Intelligence Layer Data Contribution

*(Unchanged from v1.0)*

-----

## 6. Governance and Compliance

### 6.1 CPMI-VRS Certification

*(Unchanged from v1.0)*

### 6.2 Governance Decision Dependency

**GD-3 — `PRIOR_POSITION_RECONCILIATION`:** APPROVED June 11, 2026 by Project
Principal. Prior Position Alert feature is unblocked. See
`Governance_Decision_Record_GD1_GD2_GD3.md`.

No remaining governance dependencies block any COUNSEL feature.

### 6.3 Data Handling

*(Unchanged from v1.0)*

-----

## 7. Session Zero Requirements (Before Any Build Work)

Before COUNSEL build work begins in any Claude Code session:

1. Load `SOVEREIGN_Integration_Brief_v1.5` + COUNSEL spec (this document) + prior
   session handoff.
2. Confirm all three COUNSEL prompt registry entries exist in
   `Prompt_Registry_Specification.md`.
3. Confirm COUNSEL agent ID (`counsel-analyst`) exists in
   `Agent_Identity_Standard.md`.
4. Confirm `decision_type` taxonomy imported from `sovereign-data`, not hardcoded.
5. Confirm GD-3 is recorded as APPROVED before building Prior Position Alert
   (`PRIOR_POSITION_RECONCILIATION` event type — approved June 11, 2026).
6. Confirm `COUNSELInboundContext.sourceProduct` union includes `'VIGIL'`.
7. State the specific done condition for the session. Wait for Project Principal
   approval.

-----

*COUNSEL Architecture Specification v1.1 · June 11, 2026*
*Pre-Decisional · Internal Working Document*
*Companion to SOVEREIGN Platform Integration Brief v1.5*

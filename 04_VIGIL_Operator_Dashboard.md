# VIGIL — Visibility, Intelligence, and Governance Interface Layer
## Agent Operator and Security Operator Dashboard

**Document Type:** Companion App Architecture Specification
**Version:** 1.0 — June 11, 2026
**Companion To:** SOVEREIGN Platform Integration Brief v1.5
**Classification:** Pre-Decisional · Internal Working Document

-----

## Purpose

VIGIL is the Agent Operator and Security Operator's command interface for the
SOVEREIGN platform. It is the only module in the platform that receives, displays,
and routes security alerts from the SOVEREIGN Security Observability Framework, and
the only module that gives the Agent Operator a governed, auditable surface for
managing agent behavior at portfolio level.

VIGIL exists to close two named platform risks that no other module addresses:

**Risk R10 — AgentOS has no user-facing surface.** When an AgentOS pipeline surfaces
a decision requiring human judgment — a CPMI Gate 3 RE_EXECUTE event, an A2A task
that requires human approval before continuing, a pipeline stage that has stalled —
there is currently no UI to present that to a human. Without VIGIL, the Agent Operator
role is defined but has nowhere to act.

**Risk R11 — The Security Framework has no human alert response interface.** The Alert
Dispatcher (Stage 1, 33 tests passing) can route P1 and P2 alerts. Stage 2 wires that
routing. Without VIGIL, those alerts arrive at a configured endpoint with no governed
interface to receive, triage, acknowledge, investigate, or escalate them. A P1 alert
in production with no response interface is a governance failure, not a technical one.

VIGIL does not build its own Security Framework, its own anomaly detection, or its
own agent orchestrator. It receives what the platform's shared infrastructure produces
and gives authorized humans the governed interface to act on it.

-----

## 1. What VIGIL Is Not

**VIGIL does not implement security logic.** The SOVEREIGN Security Observability
Framework — Logger, Honeytoken Manager, Anomaly Detector, Alert Dispatcher — is the
security layer. VIGIL reads its outputs and gives humans a governed response surface.
It does not replicate, extend, or modify security logic.

**VIGIL does not orchestrate agents.** AgentOS orchestrates agents. VIGIL gives the
Agent Operator visibility into what AgentOS is running and a governed interface to
intervene when human judgment is required. It does not run pipelines.

**VIGIL does not govern AI behavior.** CPMI-VRS governs AI behavior. VIGIL reads the
governance status from `ctx.governance` and surfaces it. It does not make governance
decisions.

**VIGIL is not a general platform administration console.** User management, role
assignment, configuration changes, and system settings are out of scope. VIGIL is
an operational command interface for the two roles that respond to live platform events
— the Agent Operator and the Security Operator. These are event-response roles, not
administrative roles.

**VIGIL is not accessible to general users.** Access is restricted to
`PLATFORM_ADMIN` and `SYSTEM_ADMIN` roles. All other roles see an access-denied
state at module mount. This is enforced at the module loader level, not by UI
gating.

-----

## Project Architecture Summary

This section is written for Claude Code. Read it before writing any code, creating
any file, or making any architectural decision for VIGIL. When in doubt about the
stack, return here rather than inferring from context.

### 1. What the App Is

VIGIL is the fourth module in the SOVEREIGN companion suite. It serves two distinct
operator roles — the Agent Operator (responsible for agent behavior, pipeline health,
and AgentOS-level human approvals) and the Security Operator (responsible for
Security Framework alert triage, honeytoken investigation, and anomaly response).
In the current deployment, the Project Principal holds both roles. As the platform
scales, these roles may be separated — VIGIL's architecture anticipates that split
from day one.

VIGIL is the terminal point for two critical platform signals that currently have no
governed destination: Security Framework P1/P2 alerts and AgentOS human-approval
requests. It converts those signals into actionable, auditable operator events.

### 2. Technical Stack

| Layer | Technology | Notes |
|---|---|---|
| Language | TypeScript | Strict mode; all files `.ts` or `.tsx` |
| Framework | React 18 | Functional components only; hooks pattern throughout |
| Module host | `sovereign-shell` | Option C federated module architecture; VIGIL mounts as `module-vigil` |
| State management | React hooks (`useState`, `useReducer`, `useContext`) | No Redux, no Zustand, no external state library |
| LLM calls | `sovereign-api-client` | Used only for Anomaly Triage Assistant; all calls through sovereign-api-client |
| LLM model | `claude-sonnet-4` | Specified in sovereign-api-client config; do not hardcode model strings |
| Alert ingestion | SOF Alert Dispatcher webhook endpoint | VIGIL registers as a webhook recipient via platform config; no direct Security Framework code |
| Logging | SOF Logger via `ctx.logger` | All VIGIL actions logged; every event carries `agent_id` and `workflow_step_id` |
| Auth | `ctx.auth` | SOVEREIGN RBAC; PLATFORM_ADMIN or SYSTEM_ADMIN required; enforced at mount |
| Governance | `ctx.governance` | CPMI-VRS status; portfolio hold state; inherited from shell |
| Navigation | `ctx.navigation` | Shell-managed routing; deep links to affected products |
| Data types | `sovereign-data` package | Import canonical entity types; do not redefine in VIGIL |
| Styling | Tailwind CSS | Shell-configured; use utility classes only |
| Alert polling | WebSocket or polling interval | Configurable; default 30s polling; WebSocket preferred when available |
| Testing | Jest + React Testing Library | Unit tests for all hooks; integration tests for alert ingestion and response flows |
| Build | Vite | Per SOVEREIGN monorepo config |

### 3. Role Architecture

VIGIL is the first companion suite module with a hard role gate. The role distinction
between Agent Operator functions and Security Operator functions is enforced in the
data model and the component tree, not in the UI layer.

```typescript
type VIGILOperatorRole = 'AGENT_OPERATOR' | 'SECURITY_OPERATOR' | 'BOTH';
```

The `useVIGILAccess` hook derives the operator role from `ctx.auth.role`:
- `SYSTEM_ADMIN` → `BOTH` (full VIGIL access)
- `PLATFORM_ADMIN` → `BOTH` (full VIGIL access)
- All other roles → module mount denied (`ModuleAccessDeniedError`)

When the Agent Operator and Security Operator roles are formally separated (a future
governance event), this mapping updates to distinguish them. The component tree reads
`operatorRole` from the hook — no component directly reads `ctx.auth.role`. Role
policy is injectable per the platform standard (Decision 15/24).

### 4. Data Model

VIGIL has no database of its own. The SOF Logger is the authoritative record of every
operator action. Alert state is held in React component state during an active
response session and discarded when the session ends. The Logger record is permanent.

**`SecurityAlert`** — an alert received from the Alert Dispatcher. Fields:
`alertId`, `alertLevel` (`'P1' | 'P2' | 'P3'`), `alertType` (honeytoken trigger,
anomaly detection, threshold breach, cascade), `sourceProduct`
(`SOVEREIGNProduct`), `agentId` (the agent associated with the alert, if any),
`timestamp`, `rawEvent` (the original Logger event that triggered the alert),
`status` (`'UNACKNOWLEDGED' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' |
'ESCALATED'`). Received from the Alert Dispatcher; rendered and acted on in VIGIL.

**`AlertResponse`** — the operator's response to a security alert. Fields:
`alertId`, `operatorId`, `action` (`'ACKNOWLEDGED' | 'INVESTIGATING' |
'RESOLVED' | 'ESCALATED' | 'FALSE_POSITIVE'`), `note` (required for ESCALATED
and FALSE_POSITIVE), `workflowStepId`, `timestamp`. Emitted as a Logger event
when the operator acts.

**`AgentApprovalRequest`** — a human approval request surfaced by AgentOS.
Fields: `requestId`, `requestType` (`'GATE_REVIEW' | 'PIPELINE_HOLD' |
'ANOMALY_OVERRIDE' | 'TASK_APPROVAL'`), `agentId`, `pipelineStage`,
`sourceProduct`, `contextSummary` (plain-language description of what needs
approval), `decisionOptions` (`string[]`), `timestamp`, `status`
(`'PENDING' | 'APPROVED' | 'REJECTED' | 'DEFERRED'`). Received from AgentOS
via the A2A protocol.

**`AgentApprovalDecision`** — the operator's decision on an approval request.
Fields: `requestId`, `operatorId`, `decision` (`'APPROVED' | 'REJECTED' |
'DEFERRED'`), `reasoning` (required for REJECTED and DEFERRED), `decision_type`
(from Decision Matrix taxonomy — every approval decision is tagged),
`workflowStepId`, `timestamp`. Emitted as a `HUMAN_DECISION` Logger event.
Every AgentOS approval decision made through VIGIL is Intelligence Layer
training data.

**`PipelineHealthSnapshot`** — a read-only summary of the current pipeline state
across all products. Fields: `timestamp`, `products[]` (each with `productId`,
`activeAgents` count, `queueDepth`, `lastEventTimestamp`, `healthStatus`
(`'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN'`), `activeAlerts` count). Assembled
from Security Framework anomaly status and AgentOS pipeline metrics via
`ctx.governance` and the Agent Operator's scoped Logger query.

**`AnomalyContext`** — the structured context for the Anomaly Triage Assistant
LLM call. Fields: `alert` (`SecurityAlert`), `recentEvents[]` (the Logger
events surrounding the triggering event), `productBaseline` (the IsolationForest
baseline for the affected product), `similarAlerts[]` (prior alerts of the same
type for the same product). Assembled by `useAnomalyContext` before the LLM
call. Never sent to the LLM without operator review of the context first.

**Relationships:** One `SecurityAlert` → one or more `AlertResponse` events
(status transitions are each logged) → optional `AnomalyContext` → optional
LLM triage analysis. One `AgentApprovalRequest` → one `AgentApprovalDecision`
→ emitted as `HUMAN_DECISION` Logger event with `decision_type` tag.

### 5. Key Integrations and Dependencies

| Integration | Direction | Data | Constraint |
|---|---|---|---|
| Alert Dispatcher (SOF) | Inbound | P1/P2/P3 alerts via webhook or polling | VIGIL registers as recipient via platform config; no direct Security Framework code imports |
| SOF Logger (`ctx.logger`) | Outbound | All operator response events | Every event carries `agent_id`, `workflow_step_id`, `decision_type` where applicable |
| SOF Logger query API | Inbound (read-only) | Recent events surrounding an alert; prior alerts of same type | Operator-scoped query; platform enforces scope |
| AgentOS A2A (`ctx.a2a`) | Inbound | `AgentApprovalRequest` objects from AgentOS pipelines | Via the A2A protocol boundary in the shell context; reads `ctx.a2a.listAgents()` for registered agents |
| `ctx.governance` | Inbound (read-only) | CPMI status, portfolio hold state, VRS certification status | Read-only; VIGIL does not set governance state |
| `ctx.data` | Inbound (read-only) | Pipeline health summary; product-level metrics | Read-only; no writes via VIGIL |
| `sovereign-api-client` | Outbound | Anomaly context → triage analysis | Used only for Anomaly Triage Assistant; one call per triage session |
| SOVEREIGN products (deep link) | Outbound | Navigation to affected product/item | Via `ctx.navigation`; no direct product API calls |
| `sovereign-data` | Inbound (types) | Canonical entity schemas, `DecisionType` taxonomy | Import only; do not redefine in VIGIL |

**Alert ingestion architecture:** The Alert Dispatcher (sovereign_alerts.py,
Stage 1) is configured with a webhook endpoint for VIGIL. In Stage 2, this
endpoint is `VIGIL_ALERT_ENDPOINT` in `sovereign_config.yaml` — null until
wired, per the stub-with-stable-signature platform pattern. VIGIL polls this
endpoint on a configurable interval (default 30s) with a WebSocket upgrade
path. When the endpoint is null, VIGIL renders an empty alert queue with a
configuration notice — it does not fail.

**A2A integration note:** `ctx.a2a` is currently at `_stage: "DEFINED"` with
`invokeAgent()` and `getTaskState()` throwing `ProtocolNotImplementedError`.
VIGIL's AgentOS approval panel uses `ctx.a2a.listAgents()` (which is live) for
agent registry display. The approval request ingestion path is a stub-with-stable
signature until `ctx.a2a` advances to `IMPLEMENTED` in Stage 2. VIGIL must not
throw on the stub — it renders an empty approval queue with a status indicator
showing A2A stage.

### 6. Component Map

```
module-vigil/
  VIGILShell              ← Role gate. Mounts only for PLATFORM_ADMIN / SYSTEM_ADMIN.
    ↓
  CommandCenter           ← Entry point. Summary counts: unacknowledged alerts,
                            pending approvals, pipeline health. Navigation hub.
    ↓ (user navigates to panel)
  AlertQueue              ← All active security alerts, sorted by level (P1 first).
    ↓
  AlertDetail             ← Single alert drill-down: raw event, affected product,
                            agent context, response actions, triage assistant.
    ↓
  AnomalyTriageAssistant  ← LLM-assisted context assembly for anomaly alerts only.
                            One call per session. Human reviews before acting.
    ↓
  AlertResponsePanel      ← Acknowledge / Investigate / Resolve / Escalate / False Positive.
                            All actions logged. Resolve and Escalate require a note.

  AgentApprovalQueue      ← All pending AgentOS approval requests, sorted by age.
    ↓
  ApprovalDetail          ← Single request drill-down: pipeline context, agent,
                            decision options, COUNSEL deep-link for high-stakes decisions.
    ↓
  ApprovalDecisionPanel   ← Approve / Reject / Defer. Reject and Defer require reasoning.
                            All decisions emitted as HUMAN_DECISION Logger events with
                            decision_type tag.

  PipelineHealthPanel     ← Live pipeline status across all six products.
                            Health indicators, active agent counts, queue depths.
                            Deep links to LENS Pipeline Navigator for full context.

  AgentRegistry           ← Read-only view of all registered agents (ctx.a2a.listAgents()).
                            Shows agent_id, product, class, last event timestamp,
                            anomaly flag status.

  AuditTrail              ← Operator's own action history: alert responses and
                            approval decisions for the current operator's session
                            and prior sessions (scoped Logger query).
```

Each component is a self-contained React component with a corresponding hook.
The hook owns all data fetching, LLM calls, and Logger emission. **Do not put
API calls, Logger calls, or alert state mutations in component bodies.**

### 7. Governance and Access Rules

**Role gate — enforced at module mount, not in UI:**
```typescript
// In module-vigil/src/index.ts (SovereignModuleContract.mount)
if (!ctx.auth.hasRole('PLATFORM_ADMIN') && !ctx.auth.hasRole('SYSTEM_ADMIN')) {
  throw new ModuleAccessDeniedError('module-vigil', ctx.auth.role);
}
```
This is structural enforcement, not a conditional render. A user without the
required role never reaches the VIGIL component tree.

**CPMI-VRS gates enforced in code:**
- Gate 1: Disclosure in `CommandCenter` that AI is used in Anomaly Triage
  Assistant only; all other VIGIL content is data-driven. Disclosure rendered
  on every VIGIL session start.
- Gate 2: `useLogger` emits on every alert acknowledgment, status transition,
  approval decision, and triage session. Logger emit failures surface as errors
  — VIGIL does not silently continue after a failed Logger emit.
- Gate 3: No alert is marked RESOLVED without operator confirmation. No
  AgentOS approval is submitted without explicit operator decision. The
  AnomalyTriageAssistant produces analysis; the operator decides. VIGIL advises;
  it does not act.
- Gate 4: Pending Stage 3 REST API; no code changes required.

**Decision type tagging:** Every `AgentApprovalDecision` carries a `decision_type`
from the Decision Matrix taxonomy. These decisions are Intelligence Layer training
data — Judgment Detection for the agent oversight category. The `decision_type`
selector is required before the decision panel's submit action is active. It cannot
be bypassed.

**Alert response logging is append-only.** Alert status transitions (UNACKNOWLEDGED
→ ACKNOWLEDGED → INVESTIGATING → RESOLVED) are each a separate Logger event. An
alert record cannot be deleted or edited retroactively. False Positive classification
does not delete the alert — it adds a `FALSE_POSITIVE` response event to the record
and closes the alert in the UI.

**Prompt registry:** The single VIGIL prompt (`triage_system.md`) must be registered
before any build session. Building with an unregistered prompt is a constraint
violation.

**Agent registry:** `vigil-triage-analyst` must be registered in
`Agent_Identity_Standard.md` before any build session.

-----

## 2. Core Capabilities

### 2.1 Alert Queue

The Alert Queue is the primary entry surface for Security Operator work. It displays
all active security alerts from the SOVEREIGN Security Observability Framework,
sorted by severity level (P1 first, then P2, then P3) and by timestamp within each
level.

**Alert levels and their sources:**

| Level | Source | Response Expectation |
|---|---|---|
| P1 | Honeytoken trigger; critical anomaly (>3σ from baseline) | Immediate — acknowledge within 15 minutes in production |
| P2 | High anomaly (2–3σ); CPMI reasoning drift detected; cascade risk | Same session — acknowledge and begin investigation |
| P3 | Moderate anomaly (1–2σ); threshold warning; baseline drift | Queue — acknowledge and monitor |

**Alert types surfaced by the Security Framework:**
- `HONEYTOKEN_TRIGGERED` — a registered honeytoken was accessed; possible data
  exfiltration or unauthorized access
- `ANOMALY_DETECTED` — IsolationForest scored an event outside the product baseline
- `CPMI_DRIFT_DETECTED` — CPMI anomaly score exceeded the enhanced 0.7× threshold
  (architectural constant — not configurable)
- `CASCADE_RISK` — multiple anomalies across products within a rolling window
- `THRESHOLD_BREACH` — a configured metric crossed a defined threshold
- `FALLBACK_ACTIVATED` — a product's Logger remote sink has been unavailable beyond
  the configured tolerance window

Each alert card in the queue shows: alert level badge, alert type, source product,
timestamp, and status. Unacknowledged P1 alerts render with a persistent visual
indicator that does not clear until acknowledged.

**CPMI special handling:** `CPMI_DRIFT_DETECTED` alerts render with an elevated
visual treatment and an additional warning: *"CPMI integrity is a platform-wide
dependency. Governance outputs to all six products may be affected while this alert
is unresolved."* This is not a configurable message — it is hardcoded because it
reflects the architectural reality documented in Integration Brief §7.

### 2.2 Alert Detail and Response

Drilling into any alert opens the Alert Detail panel. This panel shows:

**Event context:** The raw Logger event that triggered the alert. The `agent_id`,
`workflow_step_id`, `event_type`, and timestamp from the triggering event. The
product it came from. The anomaly score if applicable.

**Agent context:** If the alert is associated with a specific `agent_id`, the
Agent Registry entry for that agent — class, product, registered prompts, and
prior alert history for the same agent.

**Prior alert history:** Alerts of the same type from the same product in the
prior 30 days, assembled from the operator's scoped Logger query. Pattern context:
is this an isolated event or part of a recurring pattern?

**Response actions:**
- `ACKNOWLEDGE` — operator has seen the alert. Required before any other action.
  Emits `ALERT_ACKNOWLEDGED` Logger event with `operator_id` and `workflow_step_id`.
- `INVESTIGATING` — operator has begun active investigation. Alert enters
  investigating state; operator can add investigation notes at any time.
- `RESOLVE` — alert is closed. Requires a resolution note (minimum 10 characters).
  Emits `ALERT_RESOLVED` Logger event with note.
- `ESCALATE` — alert requires action beyond the operator's authority. Requires an
  escalation note describing what action is needed and by whom. Emits
  `ALERT_ESCALATED` Logger event with note.
- `FALSE_POSITIVE` — alert is assessed as a false positive. Requires a note
  explaining why. Emits `ALERT_FALSE_POSITIVE` Logger event with note. The alert
  is closed in the UI but not deleted from the audit trail.

All response actions emit Logger events. Response actions are available in order —
an alert cannot be RESOLVED or ESCALATED without first being ACKNOWLEDGED.

### 2.3 Anomaly Triage Assistant

The Anomaly Triage Assistant is an LLM-assisted context assembly tool for anomaly
alerts. It is available only for `ANOMALY_DETECTED`, `CPMI_DRIFT_DETECTED`, and
`CASCADE_RISK` alert types — not for honeytoken triggers (which have clear factual
interpretations that do not require LLM analysis).

The assistant does not investigate the anomaly. It assembles structured context from
available platform data and presents the operator with a triage brief — the most
likely explanations given the surrounding events, the affected product's baseline,
and prior similar alerts.

**Triage session flow:**

1. Operator opens an anomaly alert and selects "Open Triage Assistant."
2. `useAnomalyContext` assembles `AnomalyContext` — the triggering event, surrounding
   Logger events (±30 minutes), the product's IsolationForest baseline summary, and
   prior similar alerts. The operator reviews this assembled context before the LLM
   call is made — a triage session cannot proceed without operator review of context.
3. Operator confirms the context is accurate and initiates the triage call.
4. `sovereign-api-client` sends the context to `vigil-triage-analyst` under
   `triage_system.md`. One call per triage session.
5. The triage brief is returned: a plain-language summary of likely causes (ranked
   by likelihood), recommended investigation steps, and a `FALSE_POSITIVE_LIKELIHOOD`
   score (0–100) with explanation.
6. The operator reviews the brief. The brief is advisory — the operator decides.
7. The triage brief is appended to the alert record and emitted as a Logger event.
   The operator's subsequent response action (Investigate, Resolve, False Positive,
   Escalate) is the action of record — not the triage brief's recommendation.

**The three-tier fallback applies:** If the live API is unavailable, the triage
assistant degrades to a static template — a structured investigation checklist
appropriate to the alert type. The static template is a meaningful fallback, not
an empty stub.

**CPMI_DRIFT_DETECTED special handling:** The triage prompt for CPMI drift alerts
includes an explicit instruction: *"Do not assess whether the CPMI reasoning output
is correct. Assess whether the anomaly pattern is consistent with configuration
drift, prompt injection, or genuine reasoning instability. These have different
mitigations."* VIGIL cannot evaluate CPMI's reasoning quality — only CPMI-VRS
Gate 3 human oversight can do that.

### 2.4 Agent Approval Queue

The Agent Approval Queue surfaces `AgentApprovalRequest` objects from AgentOS
pipelines that require human judgment before continuing. This is the Agent Operator's
primary work surface.

**Request types:**

| Type | Description | Typical Source |
|---|---|---|
| `GATE_REVIEW` | A CPMI-VRS gate requires human review before the pipeline advances | CPMI Gate 3 |
| `PIPELINE_HOLD` | A governance hold has been activated; operator must confirm before proceeding | APEX DOE-NORM-001 or CPMI hold |
| `ANOMALY_OVERRIDE` | An anomaly has blocked pipeline execution; operator must override or halt | AgentOS + Security Framework |
| `TASK_APPROVAL` | An agent-generated output requires human approval before delivery | NEXUS, APEX |

Each request card shows: request type, source product, agent ID, time in queue, and
a plain-language summary of what requires approval.

**COUNSEL deep-link for high-stakes decisions:** For `GATE_REVIEW` and
`ANOMALY_OVERRIDE` request types, the approval detail panel surfaces a
"Analyze This Decision in COUNSEL" button. This routes the operator to COUNSEL with
the approval context pre-populated as a `COUNSELInboundContext`. The resulting
COUNSEL Decision Record ID is attached to the `AgentApprovalDecision` before it is
submitted. For these request types, a COUNSEL Decision Record is recommended but not
required — the operator can proceed without one.

**Approval decision flow:**

1. Operator opens a pending request in the queue.
2. `ApprovalDetail` renders the full request context: pipeline stage, agent, decision
   options, and supporting context from the source product.
3. Operator optionally opens the Anomaly Triage Assistant (for ANOMALY_OVERRIDE
   types) or routes to COUNSEL (for GATE_REVIEW types).
4. Operator selects a `decision_type` from the Decision Matrix taxonomy. Required
   before the decision panel is active.
5. Operator selects: APPROVE, REJECT, or DEFER. REJECT and DEFER require a reasoning
   note (minimum 20 characters — more consequential than an alert response).
6. Operator submits the decision.
7. `AgentApprovalDecision` is emitted as a `HUMAN_DECISION` Logger event with
   `decision_type`, `agent_id`, `workflow_step_id`, and `requestId`.
8. The decision is returned to AgentOS via the A2A protocol. Per Decision 19:
   default A2A approval behavior is `ACKNOWLEDGE_AND_CONTINUE`; CPMI Gate 3 is
   `RE_EXECUTE`.

**A2A stub behavior (Stage 2):** Until `ctx.a2a` advances from `DEFINED` to
`IMPLEMENTED`, the Agent Approval Queue renders with a status indicator:
*"Agent Approval Queue — A2A protocol at DEFINED stage. Requests will appear here
when AgentOS A2A is implemented in Stage 2."* The component tree exists and is
fully typed; it does not throw.

### 2.5 Pipeline Health Panel

The Pipeline Health Panel gives the Agent Operator a real-time overview of the
platform's operational state. It is a read-only dashboard — no actions are taken
from here. It provides the situational awareness that makes the Alert Queue and
Approval Queue interpretable.

**Panel contents:**

- **Six product health indicators** — one per primary product, each showing:
  `healthStatus` (GREEN / YELLOW / RED / UNKNOWN), active agent count, queue
  depth (pending events or tasks), last Logger event timestamp, and active alert
  count. Color is semantic: GREEN means no active alerts and normal queue depth;
  YELLOW means P3 alerts or queue depth above threshold; RED means P1/P2 alerts
  or queue depth critically high; UNKNOWN means no Logger events within the
  configured timeout window.

- **CPMI enhanced tier indicator** — CPMI's health indicator renders with a
  distinct elevated treatment and the label "Enhanced Monitoring." This is not
  configurable — it reflects CPMI's architectural position as the platform's
  governance engine (Integration Brief §7).

- **Pipeline flow visualization** — a simplified representation of the six-stage
  pipeline with flow indicators showing whether data is moving through each
  stage. A stage that has stalled (no events in the configured window) renders
  with a stall indicator and the time since last event.

- **Active agent count** — total agents currently registered across all products
  via `ctx.a2a.listAgents()`, with a per-product breakdown.

- **Deep link to LENS** — each product health card includes a "View Pipeline
  Detail" link that navigates to the LENS Pipeline Navigator for full context.
  LENS is the full situational awareness tool; VIGIL's health panel is the
  operator-level summary.

### 2.6 Agent Registry

The Agent Registry is a read-only view of all agents registered across the platform,
sourced from `ctx.a2a.listAgents()`. It complements the Agent Identity Standard
governance document with a live operational view.

Each agent entry shows: `agent_id`, module, agent class, registered prompts (count,
not content), last Logger event timestamp, last anomaly flag (if any), and
current status (active / inactive / flagged).

The Agent Registry is an investigative resource — when an alert arrives with an
`agent_id`, the operator can navigate directly to that agent's registry entry to
see its recent activity and prior alert history.

**The Agent Registry does not modify agent behavior.** Suspending, restarting, or
reconfiguring agents is an AgentOS operation, not a VIGIL operation. If an operator
determines that an agent needs to be stopped, that action goes through AgentOS
directly — VIGIL surfaces the information that motivates the decision.

### 2.7 Audit Trail

The Audit Trail panel shows the operator's own action history — alert responses and
approval decisions — assembled from scoped Logger queries. It is not a
platform-wide audit log; it is the operator's own record of what they have done
in VIGIL.

This serves two functions: personal accountability (the operator can review their
own decision history) and shift-handoff support (when the Agent Operator role passes
between sessions or operators, the incoming operator can review recent actions before
taking over the queue).

The Audit Trail is the same data the SOF Logger records for full platform audit
purposes — VIGIL's Audit Trail panel is a scoped, user-facing view of the operator's
own contribution to that record.

-----

## 3. Architecture

### 3.1 Position in the SOVEREIGN Monorepo

```
sovereign-shell/
  module-vigil/
    src/
      components/
        VIGILShell.tsx              ← Role gate — mounts or throws ModuleAccessDeniedError
        CommandCenter.tsx           ← Navigation hub; summary counts
        AlertQueue.tsx              ← All active alerts; sorted by level
        AlertDetail.tsx             ← Single alert drill-down
        AnomalyTriageAssistant.tsx  ← LLM triage for anomaly alerts
        AlertResponsePanel.tsx      ← Response actions: Ack/Investigate/Resolve/Escalate/FP
        AgentApprovalQueue.tsx      ← All pending AgentOS approval requests
        ApprovalDetail.tsx          ← Single request drill-down + COUNSEL deep-link
        ApprovalDecisionPanel.tsx   ← Decision: Approve/Reject/Defer
        PipelineHealthPanel.tsx     ← Live pipeline status across all products
        AgentRegistry.tsx           ← Read-only registered agent view
        AuditTrail.tsx              ← Operator's own action history
      agents/
        vigil-triage-analyst/
          prompts/
            triage_system.md        ← versioned, registered in Prompt Registry
      types/
        vigil.ts                    ← local types: SecurityAlert, AlertResponse,
                                       AgentApprovalRequest, AgentApprovalDecision,
                                       PipelineHealthSnapshot, AnomalyContext
      hooks/
        useVIGILAccess.ts           ← role gate; derives VIGILOperatorRole from ctx.auth
        useAlertQueue.ts            ← polls VIGIL_ALERT_ENDPOINT; manages alert state
        useAlertDetail.ts           ← assembles alert context; manages status transitions
        useAnomalyContext.ts        ← assembles AnomalyContext for triage LLM call
        useAnomalyTriage.ts         ← calls sovereign-api-client; three-tier fallback
        useAgentApprovals.ts        ← reads ctx.a2a; manages approval request state
        useApprovalDecision.ts      ← emits HUMAN_DECISION Logger event on submit
        usePipelineHealth.ts        ← reads ctx.governance and ctx.data for health summary
        useAgentRegistry.ts         ← reads ctx.a2a.listAgents()
        useOperatorAudit.ts         ← scoped Logger query for operator's own actions
        useLogger.ts                ← thin wrapper around ctx.logger
```

### 3.2 Alert Ingestion Architecture

```
sovereign_config.yaml
  vigil_alert_endpoint: null         ← null until Stage 2; VIGIL renders empty queue

useAlertQueue.ts
  → reads VIGIL_ALERT_ENDPOINT from platform config (via ctx)
  → if null: renders empty queue with configuration notice; does not fail
  → if configured:
    → attempts WebSocket connection to endpoint
    → on WS unavailable: falls back to polling (default 30s interval)
    → on alert received:
      → validates alert schema
      → appends to alert queue state
      → if P1: triggers persistent unacknowledged indicator
      → emits ALERT_RECEIVED Logger event (workflow_step_id: 'vigil-alert-queue-step-1')
```

**Three-tier fallback for alert ingestion:**
- Tier 1: Live WebSocket connection to Alert Dispatcher endpoint
- Tier 2: HTTP polling at configured interval (last-received cache maintained in
  component state)
- Tier 3: Static empty queue with configuration/connectivity notice

The Tier 3 state is informative, not a failure state. An empty queue with a clear
connectivity notice is a correct response to a null or unreachable endpoint — it
does not imply the platform is secure; it implies the operator cannot see the alert
state.

### 3.3 Approval Request Ingestion Architecture

```
useAgentApprovals.ts
  → reads ctx.a2a._stage
  → if 'DEFINED':
      → renders empty approval queue with A2A stage indicator
      → does not call ctx.a2a.invokeAgent() or ctx.a2a.getTaskState() (both throw)
  → if 'IMPLEMENTED' (Stage 2+):
      → calls ctx.a2a.listAgents() for agent registry context
      → polls approval request endpoint (sourced from ctx.a2a configuration)
      → on request received:
          → validates AgentApprovalRequest schema
          → appends to approval queue state
          → emits APPROVAL_REQUEST_RECEIVED Logger event
```

### 3.4 LLM Call Architecture

VIGIL makes at most one LLM call per triage session. No chained calls.

```
useAnomalyTriage.ts
  → receives AnomalyContext from useAnomalyContext (operator has reviewed)
  → createSovereignClient()             ← from sovereign-api-client
  → client.complete(triage_system.md + anomalyContext, triageSchema)
    → Tier 1: Live API (claude-sonnet-4)
    → Tier 2: Cached triage response for similar alert type
    → Tier 3: Static investigation checklist (alert-type-specific)
  → validateSchema(response, TriageBriefSchema)
  → return TriageBrief
  → emit TRIAGE_ANALYSIS_PRODUCED Logger event
```

**Static Tier 3 templates must be meaningful.** A honeytoken-triggered triage
with a live API failure should degrade to a structured honeytoken investigation
checklist — not an empty stub. Define static templates for each alert type before
declaring the triage feature complete.

### 3.5 Decision Emission Architecture

```
useApprovalDecision.ts
  → on submit:
    → validates decision_type is selected (required)
    → validates reasoning note for REJECTED/DEFERRED (minimum 20 chars)
    → constructs AgentApprovalDecision object
    → ctx.logger.emit({
        event_type: 'HUMAN_DECISION',
        agent_id: 'vigil-approval-agent',
        decision_type: selectedDecisionType,
        workflow_step_id: request.requestId,  ← approval request ID as step ID
        actor: 'human',
        actor_name: ctx.auth.userName,
        requestId: request.requestId,
        decision: selectedDecision,
        reasoning: reasoningNote || undefined,
        counselRecordId: attachedCounselRecord || undefined
      })
    → if Logger emit fails: surface error; do not submit decision
    → on successful emit: return decision to AgentOS via A2A protocol
```

**The Logger emit gates the A2A return.** A decision that is not in the audit trail
must not be returned to AgentOS. If the Logger emit fails, the decision is not
submitted. The operator is shown an error and must retry. This is a deliberate
design choice — an unlogged operator decision is an ungoverned operator decision.

-----

## 4. Integration with SOVEREIGN Products

### 4.1 Security Framework

VIGIL is the terminal point for the Alert Dispatcher's output. The Security
Framework raises alerts; VIGIL receives them and gives a human the governed
interface to respond. This closes Risk R11.

VIGIL imports no Security Framework code. It receives alerts via the configured
webhook endpoint and reads Logger events via the scoped query API. The Security
Framework and VIGIL are connected by configuration, not by code dependency.

### 4.2 AgentOS

VIGIL is the Agent Operator's interface to AgentOS human-approval workflows. It
closes Risk R10.

The `ctx.a2a` protocol boundary is the connection point. VIGIL reads
`ctx.a2a.listAgents()` for the Agent Registry. When A2A is fully implemented in
Stage 2, VIGIL will receive `AgentApprovalRequest` objects via the A2A task
lifecycle. The stub architecture means VIGIL builds now and connects when A2A
advances — zero rewrites.

### 4.3 CPMI

CPMI is the most consequential integration in VIGIL. `CPMI_DRIFT_DETECTED` alerts
receive elevated treatment and a mandatory platform-wide impact notice. The
`CPMI enhanced tier` indicator in the Pipeline Health Panel is a constant reminder
that CPMI's integrity is not one product's problem — it is all products' problem.

When an AgentOS `GATE_REVIEW` request arrives from a CPMI Gate 3 review, the
approval detail panel surfaces the COUNSEL deep-link and recommends (but does not
require) completing a COUNSEL Decision Record before approving. Gate 3 RE_EXECUTE
behavior (Decision 19) means a REJECTED Gate 3 decision instructs AgentOS to
re-execute the CPMI analysis, not simply halt — this is surfaced in the decision
options panel.

### 4.4 NEXUS, APEX, FLOWPATH, ARIA Suite

VIGIL receives alerts and approval requests from all six products. The Pipeline
Health Panel shows each product's health status. Alert detail panels include a
"View in [Product]" deep link via `ctx.navigation` so the operator can navigate
directly to the affected product record.

VIGIL does not write to any product. It reads, responds, and routes. Product-level
modifications triggered by operator decisions are carried out in the product itself
— VIGIL provides the decision and the audit trail; the product processes it.

### 4.5 COUNSEL

VIGIL deep-links to COUNSEL for high-stakes Agent Approval decisions. The
`COUNSELInboundContext` payload pre-populates COUNSEL's framing form with the
approval request context, `decision_type`, and `workflow_step_id`. The resulting
COUNSEL Decision Record ID is returned to VIGIL and attached to the
`AgentApprovalDecision` before submission.

This integration means the most consequential decisions in the platform — AgentOS
gate reviews, anomaly overrides, pipeline holds — can be taken through the same
adversarial reasoning structure as all other COUNSEL decisions. The Intelligence
Layer receives labeled training data for this decision category with full reasoning
traces attached.

### 4.6 LENS

VIGIL and LENS serve different audiences at different depths. LENS shows any
authenticated user their own pipeline context and governance notices. VIGIL shows
Platform Administrators the operational state of the platform itself.

VIGIL's Pipeline Health Panel deep-links to LENS's Pipeline Navigator for full
pipeline context. LENS's AI Transparency Panel surfaces VIGIL agent actions in the
platform-wide agent action log visible to all users. These two surfaces are
complementary, not redundant.

LENS's Governance Explainer should include a source document for VIGIL's alert
types and response protocol when VIGIL is deployed — two additional governance
explanation source documents will be required: `vigil_alert_response.md` and
`vigil_agent_approvals.md`.

-----

## 5. Intelligence Layer Data Contribution

VIGIL produces a data type the Intelligence Layer cannot get from any other source:
labeled human judgment events on agent oversight decisions. Every operator decision
in VIGIL is tagged with `decision_type` from the Decision Matrix taxonomy.

| Field | IL Component | Purpose |
|---|---|---|
| `decision_type` | Judgment Detection | Labels the category of oversight judgment |
| `workflow_step_id` | Task Decomposition Engine | Links judgment to the pipeline stage |
| `agent_id` (of reviewed agent) | Automatability Scorer | Which agent classes require most human review |
| Alert `FALSE_POSITIVE` rate by agent | Risk & Failure Modeler | Baseline false positive rate by product and agent class |
| `challenge_turns` (via COUNSEL link) | Judgment Detection | Whether adversarial reasoning was applied to oversight decisions |
| `counsel_record_attached` | Judgment Detection | Whether operator used COUNSEL before acting on high-stakes approvals |
| Triage assistant usage rate | Automatability Scorer | Which alert types operators can resolve without AI assistance |

The Agent Operator's alert response pattern — time-to-acknowledge, false positive
rate, escalation rate, and COUNSEL usage on high-stakes approvals — is collectively
a signal about which agent behaviors are well-understood vs. which require ongoing
human vigilance. The Intelligence Layer's Risk and Failure Modeler can use this
signal to calibrate autonomous execution confidence by agent class.

-----

## 6. Governance and Compliance

### 6.1 CPMI-VRS Certification

| Gate | Requirement | VIGIL Status |
|---|---|---|
| Gate 1 — Disclosure | AI involvement disclosed at triage session start | ✓ Disclosure in AnomalyTriageAssistant; all other VIGIL content is data-driven |
| Gate 2 — Audit Trail | Every operator action logged via SOF Logger | ✓ Logger events on every alert response and approval decision; emit failure is a hard error |
| Gate 3 — Human Oversight | Human operator must confirm every alert response and approval decision | ✓ No action is submitted without explicit operator confirmation; Logger emit gates A2A return |
| Gate 4 — Certification | CPMI world model confirms VIGIL behavioral norms | Pending — Stage 3 REST API |

### 6.2 Governance Decision Dependencies

VIGIL has three governance dependencies before specific features can be built. None
block the core module.

**New Logger event types required (shell-contract change — each requires a
governance decision per Session 2B precedent):**

- `ALERT_RECEIVED` — emitted when VIGIL receives an alert from the Alert Dispatcher
- `ALERT_ACKNOWLEDGED` — emitted when operator acknowledges an alert
- `ALERT_RESOLVED` — emitted when operator resolves an alert
- `ALERT_ESCALATED` — emitted when operator escalates an alert
- `ALERT_FALSE_POSITIVE` — emitted when operator classifies as false positive
- `TRIAGE_ANALYSIS_PRODUCED` — emitted when Anomaly Triage Assistant returns a brief
- `APPROVAL_REQUEST_RECEIVED` — emitted when AgentOS approval request arrives

These seven event types are proposed here. They require Project Principal approval
before build. They should be approved in a single governance session — a VIGIL
governance decision record analogous to GD-1/GD-2/GD-3 — before the first VIGIL
build session.

**Recommendation:** All seven can be approved together as GD-4 (VIGIL event
taxonomy) in a single governance session, with a single `shell-contract.ts` v1.2
update batching all additions.

### 6.3 Data Handling

VIGIL handles security alert data, agent behavior records, and operator decision
records. These are platform-level operational records, not user-level personal data.

**Data classification:** All VIGIL Logger events are platform-level audit data
(not `data_classification: user`). They are accessible to authorized administrators
and are permanent records. Operators are informed of this — their response decisions
and reasoning notes are auditable platform records.

**Air-gap and restricted environment note:** The Tier 3 static fallback for both
alert ingestion and triage analysis ensures VIGIL remains operational in air-gapped
or API-unavailable environments. The static alert queue shows last-received alert
state. The static triage templates provide investigation checklists without LLM
access. VIGIL degrades gracefully; it does not fail closed in a way that leaves
the operator with no visibility.

-----

## 7. Session Zero Requirements (Before Any Build Work)

Before VIGIL build work begins in any Claude Code session:

1. Load `SOVEREIGN_Platform_Integration_Brief_v1.5` + VIGIL product spec + prior
   session handoff.
2. Confirm Governance Decision GD-4 (VIGIL event taxonomy — seven new
   `SovereignEventType` members) is recorded and approved before building any
   Logger-emitting components.
3. Confirm `vigil-triage-analyst` agent ID exists in `Agent_Identity_Standard.md`.
4. Confirm `vigil-approval-agent` agent ID exists in `Agent_Identity_Standard.md`.
5. Confirm `triage_system.md` prompt registry entry exists in
   `Prompt_Registry_Specification.md`.
6. Confirm `ctx.a2a._stage` is checked at mount — VIGIL must not throw on a DEFINED
   A2A boundary; it renders an empty approval queue with a status indicator.
7. Confirm `VIGIL_ALERT_ENDPOINT` is null in `sovereign_config.yaml` (correct
   stub state) — VIGIL must not throw on a null endpoint; it renders an empty
   alert queue with a configuration notice.
8. Confirm static Tier 3 templates exist for each alert type before declaring
   AnomalyTriageAssistant complete.
9. State the specific done condition for the session. Wait for Project Principal
   approval.

-----

## 8. Build Sequencing Within VIGIL

Build VIGIL in this order within Stage 2:

1. `VIGILShell` — role gate, module mount, empty state. Confirms the module mounts
   correctly and access control works before any data is wired.
2. `CommandCenter` — navigation hub with static counts. Confirms the layout.
3. `PipelineHealthPanel` — read from `ctx.governance` and `ctx.data`. No alert
   wiring required; uses live shell context data available in Stage 2.
4. `AgentRegistry` — read from `ctx.a2a.listAgents()`. Available at Stage 2
   (listAgents is live per Session 2B handoff).
5. `AlertQueue` + `AlertDetail` + `AlertResponsePanel` — wire after
   `VIGIL_ALERT_ENDPOINT` is configured in Stage 2. The stub renders correctly
   before wiring.
6. `AnomalyTriageAssistant` — build after alert wiring. Requires GD-4 approval
   for `TRIAGE_ANALYSIS_PRODUCED` event type.
7. `AgentApprovalQueue` + `ApprovalDetail` + `ApprovalDecisionPanel` — wire after
   A2A advances to IMPLEMENTED in Stage 2.
8. `AuditTrail` — build last; depends on Logger events from all other components
   existing to populate it.

-----

*VIGIL Architecture Specification · June 11, 2026*
*Pre-Decisional · Internal Working Document*
*Companion to SOVEREIGN Platform Integration Brief v1.5*
*File Location: 7 - SOVEREIGN/Companion Suite/04_VIGIL_Operator_Dashboard.md*

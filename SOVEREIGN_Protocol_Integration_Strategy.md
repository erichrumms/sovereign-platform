# SOVEREIGN Platform — Protocol Integration Strategy
## MCP · A2A · AG-UI

**Document Type:** Development Reference — Architectural Direction
**Version:** 1.0 | June 2026
**Status:** Approved Starting Point — Requires Session Review Before Implementation
**Companion Document:** Core Stack Paper (MCP · A2A · AG-UI Background Paper, 2025–2026)

---

## Purpose

This document establishes the starting position for integrating three foundational agentic protocols — Model Context Protocol (MCP), Agent-to-Agent Protocol (A2A), and Agent-User Interaction Protocol (AG-UI) — across the SOVEREIGN Platform.

It is written for a development agent with full context of the SOVEREIGN Platform Integration Brief v1.3, the SOVEREIGN Project Summary v2.0, the Enterprise Data Strategy & Data Governance Framework (EDS&DGF) v1.0, and the Core Stack Paper. All four documents should be loaded alongside this one.

The Core Stack Paper's central principle applies directly to SOVEREIGN's architecture:

> *"A boundary treated as a feature is a boundary waiting to fail."*

Each of the three protocols defines a hard architectural boundary. SOVEREIGN's standing constraint — do not build security, governance, or audit trail systems independently — extends to these boundaries. No product should implement its own MCP configuration, agent coordination layer, or human-agent interaction pattern independently. These are platform infrastructure, not product features.

---

## Section 1 — Current State Assessment

### What Exists Today

**MCP is in use but not governed at the platform level.**
CPMI, APEX, ARC, and NEXUS each connect to their respective data sources (currently Notion databases) via MCP connectors, independently per product. The EDS&DGF's reference architecture names "Notion MCP" as the current connector with a FedRAMP-authorized replacement planned for production. MCP is functioning as a point solution at the product level — exactly the failure mode the Core Stack Paper identifies as "treating MCP as a feature toggle."

**A2A is not yet addressed anywhere in the platform.**
AgentOS is documented as the agent orchestration environment, and FLOWPATH runs a six-agent supervised system, but no agent-to-agent coordination standard exists. The pipeline architecture — FLOWPATH → Intelligence Layer → CPMI → AgentOS — is precisely the multi-agent coordination problem A2A is designed to solve. The AgentOS approval behavior question (re-execute vs. acknowledge-only) is unresolved. This is effectively the A2A task lifecycle question left open.

**AG-UI exists as a policy requirement but not as a protocol.**
Human-in-the-loop (HITL) checkpoints are non-negotiable across the platform. CPMI-VRS requires human review gates at every certification stage. The ARIA Suite's core constraint — "AI flags, humans decide" — is the AG-UI principle stated as policy. The Decision Log's human-only fields (outcome, reviewer, human_reviewed) are the current manual implementation. None of this is implemented as a streaming, event-driven protocol — it is enforced through static interface patterns and documentation conventions.

### Risk Summary

| Protocol | Current Risk | Consequence If Unaddressed |
|---|---|---|
| MCP | Per-product implementations will diverge; security observability gaps between products | Rewrites required to bring products under Security Framework visibility; pipeline breaks |
| A2A | AgentOS orchestration will be designed without a coordination standard | Inter-product handoffs fail silently; partial failure handling undefined; Intelligence Layer integration requires rework |
| AG-UI | HITL is enforced by convention, not architecture | Production transition to agency-approved client breaks HITL compliance; OMB AI guidance requirements unmet |

---

## Section 2 — Protocol Definitions for SOVEREIGN Context

The following definitions are drawn from the Core Stack Paper and translated into SOVEREIGN-specific terms. Development agents should use these definitions consistently.

### MCP — Model Context Protocol
*Origin: Anthropic, open-sourced November 2024*

**The boundary MCP owns:** Agent ↔ Tools & Data

**What it does in SOVEREIGN terms:** MCP is the mechanism by which any SOVEREIGN product's AI reasoning layer discovers and calls tools — database reads, API calls, file operations, external service integrations. It defines how the Security Framework's Logger intercepts those calls for observability. Every tool call any agent makes anywhere in the platform crosses the MCP boundary.

**What it is not:** MCP is not about agents coordinating with each other. CPMI talking to APEX is not an MCP concern — that is A2A. MCP governs the call from an agent to a tool or data source, not the call from one reasoning engine to another.

**The failure mode to avoid:** Each product building its own MCP server configuration. When NEXUS, CPMI, and APEX each define their own connections to shared data entities (employee, program, cost code), the SOVEREIGN data dictionary constraint is violated at the protocol layer. The Security Framework cannot observe what it does not govern.

### A2A — Agent-to-Agent Protocol
*Origin: Google, open-sourced April 2025*

**The boundary A2A owns:** Agent ↔ Agent

**What it does in SOVEREIGN terms:** A2A is the mechanism by which AgentOS coordinates the agents running across the platform pipeline. When FLOWPATH's workflow agents complete a VVR record and hand off to the Intelligence Layer's Task Decomposition Engine, that handoff is an A2A interaction. When CPMI's governance engine issues a VRS gate certification that AgentOS must act on, that is an A2A interaction. A2A defines how agents advertise capabilities (Agent Cards), how they invoke each other, and critically, how task lifecycle — including partial failure and escalation — is managed across agent boundaries.

**What it is not:** A2A does not govern tool calls. CPMI reading from its PROGRAM_DB is MCP. CPMI sending a governance hold signal to APEX is A2A.

**The failure mode to avoid:** Treating inter-product communication as simple REST API calls. The Core Stack Paper is explicit: the hard part of A2A is task lifecycle management, partial failure, and inter-agent trust — not the initial invocation. SOVEREIGN's pipeline has failure modes at every product boundary. If the Intelligence Layer's Automatability Scorer returns a low-confidence result, what happens to the task in CPMI that is waiting? That is an A2A question.

### AG-UI — Agent-User Interaction Protocol
*Origin: CopilotKit, open-sourced early 2025*

**The boundary AG-UI owns:** Agent ↔ Human

**What it does in SOVEREIGN terms:** AG-UI is the mechanism by which SOVEREIGN agents stream their reasoning, tool calls, and partial results to human interfaces in real time, and by which humans interrupt, redirect, or approve actions mid-task. In the federal context, this is the technical implementation of OMB AI guidance's HITL requirements — not a policy statement, but an architectural enforcement mechanism. Every CPMI-VRS certification gate, every ARIA Suite compliance adjudication, every AgentOS approval decision is an AG-UI interaction.

**What it is not:** AG-UI is not a UI framework. It does not dictate what the interface looks like. It defines the event stream between the agent and whatever interface renders it — meaning the interface can be replaced (prototype Claude.ai conversation → production agency-approved client) without changing the agent's behavior.

**The failure mode to avoid:** Treating AG-UI as a cosmetic upgrade. Adding a progress bar to an existing completion-based workflow is not AG-UI adoption. The human's role must be redesigned around the streaming model — they are not reviewing a finished output, they are participating in a running process. This has direct implications for CPMI-VRS gate design and the Decision Log's human review workflow.

---

## Section 3 — Integration Architecture

### The Three Boundaries in the SOVEREIGN Pipeline

Every interaction in the SOVEREIGN platform crosses one or more of these three boundaries. The pipeline maps as follows:

```
Human User
    │
    │  ◄── AG-UI boundary (human sees agent reasoning; can interrupt or approve)
    ▼
AgentOS / Product Interface
    │
    │  ◄── MCP boundary (agent calls tools, reads data, writes logs)
    ▼
Tools & Data Layer
(PROGRAM_DB, RISK_DB, DECISION_LOG_DB, Security Framework Logger,
 SOVEREIGN data dictionary entities, external APIs)

AgentOS
    │
    │  ◄── A2A boundary (agents coordinate; tasks handed off; failures escalated)
    ▼
Product Agents
(FLOWPATH workflow agents → Intelligence Layer components →
 CPMI governance engine → APEX analytics → NEXUS routing → ARIA adjudicators)
```

These three boundaries must be governed at the platform level — in AgentOS and the Security Framework — not independently per product.

### Shared Infrastructure Assignments

Consistent with the SOVEREIGN standing constraint, each protocol's governance belongs to an existing shared infrastructure layer:

| Protocol | Governing Layer | Rationale |
|---|---|---|
| MCP | SOVEREIGN Security Framework | Every tool call is a security-observable event. The Logger intercepts MCP calls. The Honeytoken Manager embeds detection tokens in MCP-accessible data. The Anomaly Detector flags unusual tool call patterns. |
| A2A | AgentOS | AgentOS is the orchestration environment. Agent Cards for all SOVEREIGN agents are registered in AgentOS. Task lifecycle, partial failure handling, and inter-agent trust are AgentOS responsibilities. |
| AG-UI | CPMI-VRS + AgentOS | CPMI-VRS defines which interactions require human approval (the governance gate). AG-UI defines how that approval is surfaced and captured. AgentOS executes the resulting approval workflow. |

---

## Section 4 — Product-by-Product Implications

### FLOWPATH (Pipeline Stage 1)

**MCP:** FLOWPATH's six-agent system currently operates within a single artifact sandbox. In the SOVEREIGN platform, each agent's tool calls — reading domain profiles, writing VVR records, calling the CPMI export schema — must be MCP-governed and Security Framework-observable. FLOWPATH's process ingestion pipeline is the first MCP surface in the pipeline.

**A2A:** FLOWPATH is the pipeline's entry point. Its primary output — VVR records with embedded CPMI export schemas — must be handed to the Intelligence Layer's Task Decomposition Engine via an A2A interaction. The Agent Card for FLOWPATH's output agent should advertise: structured workflow artifact production, VVR schema compliance, CPMI export compatibility.

**AG-UI:** FLOWPATH's staff interview process is an AG-UI interaction. The agent is eliciting structured information from a human participant. AG-UI governs the stream of questions, partial captures, and confirmation steps — and allows the participant to redirect or correct mid-interview. This is currently implemented as a static conversation flow; AG-UI formalizes it.

**Open condition carried forward:** The `cpmi_vrs_disclosure` field must be added to the VVR schema before A2A handoff is designed. The receiving agent (Intelligence Layer) must be able to read the VRS disclosure status as a structured field.

### CPMI (Pipeline Stage 3)

**MCP:** CPMI's 6-step reasoning chain reads from PROGRAM_DB, RISK_DB, MILESTONE_DB, and WORLD_MODEL_DB on every recommendation cycle. These reads are MCP calls. The Security Framework's enhanced monitoring tier on CPMI (0.7× anomaly threshold) means CPMI's MCP activity is the highest-priority observable surface in the platform. Every CPMI tool call must produce a Logger entry with `workflow_step_id` and, on any human decision event, `decision_type`.

**A2A:** CPMI is the platform's governance engine. Its governance outputs — VRS gate certifications, HOLD signals, confidence ratings — flow to all six products. In A2A terms, CPMI is a high-authority agent whose outputs are consumed by downstream agents. When CPMI issues a governance HOLD (DOE-NORM-001), that signal must reach APEX, NEXUS, and AgentOS via A2A, not via polling or manual notification. The World Model REST API (currently undeployed — noted as blocking APEX governance HOLD live integration) is the A2A-adjacent dependency that must be resolved before inter-product A2A can be designed.

**AG-UI:** Every CPMI-VRS certification gate is a human approval event. Under AG-UI, the human reviewer does not receive a completed recommendation — they receive a streaming trace of the agent's reasoning as it builds, with the ability to pause, query, or redirect before the recommendation is finalized. This is a more powerful and more auditable version of the current Decision Log review pattern. The Decision Log's human-only fields (outcome, reviewer, human_reviewed) are preserved but enhanced: the AG-UI event stream becomes the audit record of the human's participation in the reasoning process, not just their final sign-off.

### APEX (Pipeline Stage 6)

**MCP:** APEX's current single-file HTML with sql.js architecture must transition to the platform's shared MCP configuration before the PostgreSQL production migration. APEX's cross-system data reads (aggregating across CPMI portfolio status) are MCP calls that the Security Framework must observe.

**A2A:** The `sovereignHold()` function — APEX's first live inter-product dependency — is the prototype of what A2A governs in production. Currently implemented as a direct code dependency, it must become an A2A task signal: CPMI's governance agent sends a HOLD to APEX's analytics agent, APEX's agent suspends QPR/ABS generation, and the task lifecycle is managed until CPMI resolves the hold. The known-answer drift detection tied to SOVEREIGN anomaly events is similarly an A2A signal, not a code-level hook.

**AG-UI:** APEX's report generation workflow (MSR, QPR, ABS, CSC) produces outputs that human program managers review and act on. AG-UI enables the reviewer to see which data inputs drove which conclusions in the report as it is being assembled — not just the finished PDF. This is especially relevant for QPR reports that are suppressed by a CPMI HOLD: the AG-UI stream should show the reviewer exactly which CPMI signal triggered the suppression.

### NEXUS (Pipeline Stage 6)

**MCP:** NEXUS's AI routing model is the most sensitive MCP surface in the platform. The routing model learns from operational data — every routing decision it processes updates its intelligence. MCP governs the boundary between the routing model and the task records it reads and writes. The Security Framework must observe every read of a task's classification label and every write of a routing decision. The model weight ownership risk (HIGH, noted in EDS&DGF Section 3.4 and SOVEREIGN Project Summary) means the trained weights produced by these MCP-governed interactions are government property — this must be reflected in how MCP logging captures the training signal provenance.

**A2A:** NEXUS at SECRET tier requires SIPR routing — a separate accredited environment with no NIPR connection. A2A's authentication and security model between agents from different environments must account for this boundary. The routing agent operating on SIPR cannot be called by a NIPR-resident agent. This is an A2A security constraint, not just an infrastructure constraint.

**AG-UI:** NEXUS's action officer interface is the most volume-intensive AG-UI surface in the platform. Action officers are interacting with task routing recommendations in real time. The AG-UI stream shows the routing agent's confidence scoring and routing rationale as it processes — the action officer can redirect before the routing decision is committed. This is the primary Judgment Detection training data surface: every HITL override of a routing decision is a labeled human judgment event.

### ARIA Suite — ARC · TRACER · CLEAR (Pipeline Stage 7)

**MCP:** ARIA deliberately excludes AI from all decision paths. In MCP terms, ARIA agents call tools to read policy rules, verify compliance conditions, and write audit records — but they do not call an AI reasoning model. The MCP boundary exists in ARIA, but the AI layer on the other side of it is absent by design. ARIA's AI-absence attestations (CPMI-VRS Gate 1, `model: none`) should be reflected in ARIA's MCP configuration: no AI tool endpoints registered, structural absence rather than policy prohibition.

**A2A:** ARIA is the pipeline's adjudication stage. It receives outputs from upstream products, applies compliance rules, and issues findings. These are A2A interactions: CPMI sends a VRS certification to ARIA's ARC module; TRACER receives audit event streams from the Security Framework; CLEAR receives policy rule sets. ARIA's context-agnostic design (same codebase enforces FAR/DFARS, FTR, corporate T&E, DCAA by rules array configuration) means its A2A interface should be policy-parameterized — the Agent Card advertises compliance adjudication capability; the rules array is passed as a task parameter, not hardcoded.

**AG-UI:** ARIA is the richest ground-truth compliance judgment dataset in the platform (26 combined decision scenarios). Every adjudication event where a human reviewer overrides or confirms ARIA's compliance finding is an AG-UI interaction and a labeled training event. The append-only audit constraint (no update operation permitted on any Audit_DB record once written) must be preserved in the AG-UI event stream design: the stream is observable but the underlying record is immutable.

### AgentOS (Pipeline Stage 4)

AgentOS is the primary implementation target for all three protocols. It is the layer where MCP configuration is governed, A2A coordination is orchestrated, and AG-UI approval workflows are executed.

**MCP in AgentOS:** The Security Framework is embedded in AgentOS as a native module. AgentOS's MCP layer is the platform's single point of tool call governance. Every product's MCP configuration is registered in AgentOS, not maintained locally. The Security Framework's Logger intercepts at the AgentOS MCP layer, ensuring complete observability regardless of which product is making the call.

**A2A in AgentOS:** AgentOS maintains the Agent Card registry for all SOVEREIGN agents. It manages task lifecycle across agent boundaries — including the unresolved approval behavior question (re-execute vs. acknowledge-only), which is an A2A task lifecycle decision. AgentOS's orchestration design must be specified with A2A in mind before any inter-product automation is built. The privacy boundary (orchestrator refuses `data_classification: user` sources at code level) is an A2A trust constraint.

**AG-UI in AgentOS:** AgentOS executes the approval workflows that CPMI-VRS gates require. Under AG-UI, these workflows are event-stream-based: the human reviewer subscribes to the agent's event stream, receives reasoning in progress, and issues an approval or redirect via the AG-UI protocol. AgentOS routes the approval signal back to the originating agent and updates the task lifecycle accordingly.

**Critical sequencing note:** The shell architecture specification (Option C — Unified Shell with Module Applications) must account for all three protocol boundaries before any module development begins. The shell contract (`shell-contract.ts`) should define what MCP configuration, A2A registration, and AG-UI event bus the shell provides and what each module interface consumes.

### Intelligence Layer (Future — Stage 10)

The Intelligence Layer's five components are the most protocol-intensive surface in the platform, and they do not exist yet. This is an opportunity to design them protocol-first.

**MCP:** Each IL component reads from a different data source. Task Decomposition reads VVR records from FLOWPATH. Judgment Detection reads Decision Log entries from CPMI and human override events from NEXUS. Automatability Scorer reads workflow step metadata across all products. Risk & Failure Modeler reads anomaly events from the Security Framework. Compliance Mapper reads policy rules from ARIA and CPMI-VRS certifications. Each of these is an MCP interaction. The IL's knowledge base — continuously updated with agent capability research, failure case data, and regulatory rules — is the MCP-accessible data store for all five components.

**A2A:** The five IL components are themselves a multi-agent system. Task Decomposition produces structured step lists that Judgment Detection consumes. Automatability Scorer runs in parallel with Risk & Failure Modeler. Compliance Mapper is the final gate before a workflow blueprint is issued. The IL's internal coordination is an A2A workflow, and its output — the workflow blueprint — is an A2A message delivered to CPMI for governance certification.

**AG-UI:** The Intelligence Layer's domain selection decision (not yet made — identified as an open gap in this document's Section 6) has direct AG-UI implications. The domain expert annotation program — by which experts review and label IL outputs to train and calibrate its models — is an AG-UI workflow. The expert is not reviewing a finished recommendation; they are participating in a running analysis, providing labels as the IL's components stream their intermediate outputs.

---

## Section 5 — Maturity Stages

The following four stages define how SOVEREIGN introduces, develops, matures, and operates these protocols. They align with the existing SOVEREIGN Build Plan v2.0 stages.

### Stage 1 — Introduce (Aligned with Build Plan Stages 1–2)
*Prerequisite: All product transition builds complete; four-document transition packages delivered*

**Objective:** Establish platform-level protocol governance before any product implements independently.

**MCP:** Define the platform MCP configuration standard. Identify all tool endpoints currently in use across products (Notion databases, external APIs, Security Framework Logger). Register them in a platform MCP manifest. Audit for SOVEREIGN data dictionary compliance — any tool endpoint that reads or writes a shared entity (employee, program, cost code, document, vendor) must use the canonical schema.

**A2A:** Define Agent Cards for all six products. An Agent Card is a structured capability advertisement — what the agent can do, what inputs it accepts, what outputs it produces, what its task lifecycle contract is. Agent Cards are not implementation; they are governance documents. They must exist before any inter-product automation is designed. Resolve the AgentOS approval behavior decision (re-execute vs. acknowledge-only) as part of this stage — it is an A2A task lifecycle decision that blocks Agent Card finalization for AgentOS.

**AG-UI:** Audit existing HITL implementations across all products for AG-UI readiness. Map every Decision Log human review step, every CPMI-VRS gate, every ARIA adjudication event to the AG-UI event types it should produce. This audit produces the AG-UI event taxonomy for the SOVEREIGN platform — a catalog of human-agent interaction events that every product's AG-UI implementation will emit.

**Governance output:** Protocol Baseline Document — platform MCP manifest, six Agent Cards, AG-UI event taxonomy. Approved by Project Principal before Stage 2 begins.

### Stage 2 — Develop (Aligned with Build Plan Stages 2–3)
*Prerequisite: Protocol Baseline Document approved*

**Objective:** Implement protocol boundaries in the Security Framework and AgentOS as native capabilities; deploy to the first product.

**MCP:** Integrate platform MCP manifest into the Security Framework's Logger. Every MCP call from any product passes through the Logger and produces a structured log entry with `workflow_step_id`. Honeytoken Manager embeds detection tokens in MCP-accessible data stores. Anomaly Detector establishes baseline MCP call patterns per product. Deploy first to CPMI (highest-priority security node, 0.7× anomaly threshold).

**A2A:** Implement Agent Card registry in AgentOS. Build the A2A task lifecycle manager — the component that handles task handoffs between agents, monitors task state across product boundaries, and routes partial failure events to the Alert Dispatcher. Implement the CPMI → APEX HOLD signal as the first live A2A interaction, replacing the current code-level `sovereignHold()` dependency.

**AG-UI:** Implement the AG-UI event bus in AgentOS. Define the event types from the Stage 1 taxonomy as structured, typed events. Build the first AG-UI-compliant human review workflow for CPMI-VRS Gate 3 (human approval gate) — the Decision Log review becomes an AG-UI subscription, not a static form completion.

**Governance output:** Protocol Development Report — Logger integration test results, first A2A interaction validation (CPMI → APEX HOLD), first AG-UI workflow audit trail. Reviewed at Stage 3 gate.

### Stage 3 — Mature (Aligned with Build Plan Stages 3–4)
*Prerequisite: Protocol Development Report accepted at Stage 3 gate*

**Objective:** Deploy all three protocols across all six products; instrument feedback loops; validate against federal compliance requirements.

**MCP:** Complete platform MCP manifest deployment across all six products. Retire per-product MCP configurations. Security Framework observability is complete — every tool call in the platform is logged, monitored, and anomaly-detected. Validate against FedRAMP Moderate requirements for the production transition (Notion → AWS GovCloud PostgreSQL).

**A2A:** Complete Agent Card registry. Deploy A2A task lifecycle management to the full pipeline: FLOWPATH → IL (placeholder) → CPMI → AgentOS → NEXUS/APEX → ARIA. Validate inter-product HOLD propagation, partial failure handling, and escalation routing. Define SIPR/NIPR A2A boundary for NEXUS SECRET tier.

**AG-UI:** Deploy AG-UI event bus to all products. All HITL interactions across the platform are now AG-UI events — streaming, interruptible, and captured in the audit trail. Validate against OMB AI guidance HITL requirements. The annotation program for the Intelligence Layer (domain expert labeling of IL outputs) is designed in this stage, using the AG-UI event stream as its data source.

**Governance output:** Protocol Maturity Assessment — coverage across all six products, compliance validation results, annotation program design. Required before Stage 4 (Intelligence Layer build planning begins at Stage 10).

### Stage 4 — Operate (Build Plan Stage 4+)
*Prerequisite: Protocol Maturity Assessment accepted*

**Objective:** Continuous governance of all three protocol boundaries; protocol evolution managed as platform governance events.

**MCP:** Platform MCP manifest is a living governance document. New tool endpoints require Data Steward approval and Security Framework registration before use. MCP anomaly baselines are recalibrated quarterly. Production migration to AWS GovCloud updates the manifest; no product-level MCP changes are permitted.

**A2A:** Agent Card updates require AgentOS registration and Project Principal approval for capability changes that affect downstream consumers. Task lifecycle failures are reviewed in the monthly governance cycle. Intelligence Layer Agent Cards are added at Stage 10 planning.

**AG-UI:** AG-UI event taxonomy is extended as new HITL patterns emerge. Human override events feed the Judgment Detection training pipeline. The feedback loop from Decision Log outcome fields → World Model norm updates → CPMI-VRS certification revisions is monitored as a governed process, not an ad hoc correction cycle.

---

## Section 6 — Open Decisions and Gaps

The following decisions must be made before implementation begins. They are not design questions — they are governance decisions that require Project Principal approval.

### Open Decision 1 — AgentOS Approval Behavior (Blocks A2A Stage 1)
**Question:** When AgentOS encounters a medium-risk task requiring human approval, does it re-execute the task after approval (with updated context), or does it acknowledge the human decision and continue from current state?
**Why it matters for A2A:** This is the task lifecycle contract that all downstream agents depend on. Agent Cards for AgentOS cannot be finalized without it.
**Decision owner:** Project Principal
**Must be resolved before:** Stage 2 A2A development begins

### Open Decision 2 — Intelligence Layer Domain Selection (Blocks AG-UI Stage 3)
**Question:** Which industry or workflow class does the IL build its knowledge base for first?
**Why it matters for AG-UI:** The annotation program's domain expert selection depends on the domain. The AG-UI event stream design for the annotation workflow depends on the domain's expertise model.
**Decision owner:** Project Principal
**Must be resolved before:** Stage 3 AG-UI annotation program design

### Open Decision 3 — CPMI World Model REST API Deployment (Blocks A2A Stage 2)
**Question:** When is the World Model REST API deployed, and what is its A2A interface specification?
**Why it matters for A2A:** The World Model REST API is the dependency currently blocking APEX governance HOLD live integration and the Intelligence Layer Compliance Mapper. It is the most immediate A2A blocker in the pipeline.
**Decision owner:** CPMI Product Owner (Project Principal)
**Must be resolved before:** Stage 2 A2A development for CPMI → APEX interaction

### Open Decision 4 — Shell Contract Protocol Scope (Blocks All Stage 2 Work)
**Question:** Does the shell contract (`shell-contract.ts`) define what MCP configuration, A2A registration, and AG-UI event bus the shell provides to modules?
**Why it matters:** Option C architecture requires the shell contract to be approved before module development begins. If the shell contract does not include protocol boundaries, each module will implement them independently — the failure mode this document exists to prevent.
**Decision owner:** Project Principal
**Must be resolved before:** Shell contract approval (prerequisite for all module development)

---

## Section 7 — Constraints Inherited from the SOVEREIGN Standing Constraint

The SOVEREIGN standing development constraint applies to all three protocols without exception:

**Do not build protocol infrastructure independently.** No product builds its own MCP server, A2A coordination layer, or AG-UI event bus. These are platform infrastructure and belong in the Security Framework (MCP), AgentOS (A2A and AG-UI), and the shell contract (all three).

**Do not define shared protocol entities differently across products.** The Agent Card schema, MCP tool endpoint schema, and AG-UI event type schema are shared entities governed by the SOVEREIGN data dictionary. A product that defines its own Agent Card format is creating the same problem as a product that defines its own version of the "employee" entity.

**Do not build protocol components that would require a rewrite to connect to the Security Framework, CPMI-VRS, or AgentOS.** Every MCP call must be Security Framework-observable from day one. Every A2A task must be AgentOS-registered from day one. Every AG-UI event must be CPMI-VRS-auditable from day one. "We'll integrate it later" is not permitted.

**Tag every human decision event in AG-UI streams with `decision_type`.** AG-UI interactions that involve human decisions are ground-truth training data for the Intelligence Layer's Judgment Detection component. The `decision_type` field from the SOVEREIGN event taxonomy must be present on every such event — this is not a logging nicety, it is the IL's primary data collection mechanism.

---

## Section 8 — Intelligence Layer Alignment

Every current product is already exposing the fields the Intelligence Layer will consume. The protocol integration work in this document must preserve and extend that exposure, not replace it.

| IL Component | Protocol Surface | Data Source |
|---|---|---|
| Task Decomposition | A2A (receives VVR records from FLOWPATH) | FLOWPATH VVR schema with `cpmi_vrs_disclosure` field |
| Judgment Detection | AG-UI (human override events from all products) | `decision_type` tagged events in AG-UI stream; NEXUS routing overrides as primary volume source |
| Automatability Scorer | MCP (reads workflow step metadata) | Platform MCP manifest — all products' workflow step records |
| Risk & Failure Modeler | MCP (reads Security Framework anomaly events) | Logger entries, Anomaly Detector outputs, Alert Dispatcher records |
| Compliance Mapper | A2A (receives CPMI-VRS certifications; reads ARIA adjudications) | CPMI World Model REST API; ARIA rules array outputs |

The Intelligence Layer does not require any current product to rewrite its data model — this was designed in from the start. The protocol integration work must preserve this property: no protocol implementation decision should change the schema of the data products are already producing for IL consumption.

---

## Document History and Next Steps

**This document is a starting point, not a final specification.** It establishes the architectural direction, maps the current state, defines the protocol boundaries in SOVEREIGN terms, and identifies the open governance decisions that must be resolved before implementation begins.

**Recommended next session actions:**

1. Load this document alongside the Core Stack Paper, SOVEREIGN Platform Integration Brief v1.3, and SOVEREIGN Project Summary v2.0.
2. Resolve Open Decision 4 (shell contract protocol scope) — it is the prerequisite that unblocks all other protocol work.
3. Add this document to the four-document transition package requirement. Products arriving in the SOVEREIGN project should be assessed for protocol readiness alongside Security Framework, CPMI-VRS, and AgentOS connection readiness.
4. Begin Stage 1 work with the platform MCP manifest — it requires no new implementation, only governance of what already exists.

---

*SOVEREIGN Platform — Governed Agentic Runtime with Integrated Security, Intelligence, and Oversight Networks*
*This document travels with the SOVEREIGN Platform Integration Brief v1.3 and must not be modified without a documented governance decision.*

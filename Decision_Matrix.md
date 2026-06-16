# SOVEREIGN Platform — Decision Matrix
**Agent-Human Zone Assignments Across All Six Products**

Document Type: Governance Decision Record  
Version: 1.0 — May 2026  
Authority: Project Principal · SOVEREIGN Platform Governance Authority  
Status: APPROVED — incorporated into Integration Brief v1.3  
Classification: Pre-Decisional · Internal Working Document

---

## Purpose and Standing

This document is a standing constraint. It defines which decisions agents make autonomously, which require human approval before action, and which require genuine human-agent collaboration across all six SOVEREIGN products. Every build session that touches decision logic, workflow gates, or agent actions must reference this matrix before writing code.

The three zones are defined as follows:

- **Zone 1 — Agent Decides and Acts:** The agent executes without human review. The action is logged to the SOVEREIGN Logger with `workflow_step_id`. No human gate.
- **Zone 2 — Human Approves Before Action:** The agent prepares the output or action. A named human reviews and approves before execution. A `HUMAN_DECISION` Logger event with `decision_type` is emitted on approval or denial.
- **Zone 3 — Human + Agent Collaborative:** The agent synthesizes information and presents analysis. The human exercises genuine judgment to reach a final decision. Both agent contribution and human decision are logged separately.

**Zone 2 governance evidence requirement:** Every Zone 2 decision must produce a Logger entry with `event_type: HUMAN_DECISION`, `decision_type` from the approved taxonomy, `actor: human`, `actor_id`, `actor_name`, `workflow_step_id`, and `outcome`. This entry is ground-truth training data for the Intelligence Layer Judgment Detection component.

**Zone 3 collaboration protocol:** The agent contribution is logged as `AGENT_STEP_COMPLETE` with `workflow_step_id`. The human decision is logged separately as `HUMAN_DECISION`. Both entries carry the same `workflow_step_id` so they can be linked in the audit trail and in Intelligence Layer analysis.

---

## FLOWPATH — Workflow Mapping and Elicitation (Pipeline Stage 1)

| Action Category | Zone | Rationale | Logger Event |
|---|---|---|---|
| Agent interview session initiation | 1 | Scheduling; no consequential output | `AGENT_STEP_START` |
| Individual interview question generation | 1 | Intermediate agent work; human reviews VVR not individual questions | `AGENT_STEP_COMPLETE` |
| Domain Translator terminology flagging | 1 | Analytical output; flagged for review, not acted upon directly | `AGENT_STEP_COMPLETE` |
| Workflow map draft generation | 1 | Draft artifact; human reviews at VVR stage | `AGENT_STEP_COMPLETE` |
| Agent handoff between agents | 1 | Internal pipeline coordination | `AGENT_STEP_COMPLETE` |
| Five-Question Completeness Gate evaluation | 1 | Automated checklist evaluation | `GOVERNANCE_GATE_1` |
| VVR record finalization and sign-off | **2** | VVR is a consequential artifact consumed downstream by CPMI and Intelligence Layer; human reviewer must sign | `HUMAN_DECISION` — `decision_type: HUMAN_APPROVAL` |
| Action Trigger: bottleneck_ticket creation | **2** | Creates an assigned work item; consequential | `HUMAN_DECISION` — `decision_type: HUMAN_APPROVAL` |
| Action Trigger: signoff_record generation | **2** | Immutable audit record; human lane owner must confirm | `HUMAN_DECISION` — `decision_type: HUMAN_APPROVAL` |
| Action Trigger: recommendation_task creation | **2** | Creates a scoped task; consequential | `HUMAN_DECISION` — `decision_type: HUMAN_APPROVAL` |
| RBAC role reassignment | **2** | Identity and access change | `HUMAN_DECISION` — `decision_type: HUMAN_APPROVAL` |
| Engagement close and sentiment data deletion | **2** | Irreversible data deletion; requires named human confirmation | `HUMAN_DECISION` — `decision_type: HUMAN_APPROVAL` |
| Workflow strategy recommendation (novel engagement type) | **3** | Agent synthesizes; human applies contextual judgment | `AGENT_STEP_COMPLETE` + `HUMAN_DECISION` |

---

## CPMI — AI Governance Engine (Pipeline Stage 3)

CPMI is the only SOVEREIGN product that both issues governance decisions to others and is itself subject to governance oversight. All six reasoning chain steps are Zone 1 (agent analytical work), but the final governance output and all certification actions are Zone 2 or Zone 3.

| Action Category | Zone | Rationale | Logger Event |
|---|---|---|---|
| Reasoning chain Steps 1–4 (Context, Rules, Alternatives, Assumptions) | 1 | Analytical preparation; intermediate outputs | `REASONING_STEP_START` / `REASONING_STEP_COMPLETE` |
| Reasoning chain Step 5 (Confidence scoring) | 1 | Quantitative assessment; feeds into Step 6 | `REASONING_STEP_COMPLETE` |
| Reasoning chain Step 6 (Recommendation) — below risk threshold | 1 | Routine governance recommendation; logged and consumable by downstream products | `GOVERNANCE_GATE_3` |
| Reasoning chain Step 6 (Recommendation) — at or above risk threshold | **2** | High-consequence governance output; requires independent reviewer attestation (CPMI-VRS Gate 3) | `HUMAN_DECISION` — `decision_type: HUMAN_APPROVAL` |
| Reasoning drift detection alert | 1 | Detection is automatic; response is Zone 2 | `ANOMALY_DETECTED` |
| Response to reasoning drift detection | **2** | Human decides whether to accept drifted output, override, or retrain | `HUMAN_DECISION` — `decision_type: HUMAN_OVERRIDE` |
| CPMI-VRS Gate 1 disclosure record issuance | 1 | Administrative certification step following approved reasoning | `GOVERNANCE_GATE_1` |
| CPMI-VRS Gate 2 audit trail attestation | 1 | Automated verification of Logger chain completeness | `GOVERNANCE_GATE_2` |
| CPMI-VRS Gate 3 human oversight attestation | **2** | Requires named independent reviewer sign-off | `HUMAN_DECISION` — `decision_type: HUMAN_APPROVAL` |
| CPMI-VRS Gate 4 portfolio certification | **2** | Pre-production certification; Project Principal approval required | `GOVERNANCE_GATE_4` + `HUMAN_DECISION` |
| World model norm update | **3** | Agent analyzes regulatory change; human decides whether to adopt | `AGENT_STEP_COMPLETE` + `HUMAN_DECISION` |
| DOE-NORM conflict resolution | **3** | Agent identifies conflict; human decides resolution | `AGENT_STEP_COMPLETE` + `HUMAN_DECISION` |
| New product VRS certification | **3** | Agent evaluates compliance; Portfolio Owner certifies | `GOVERNANCE_GATE_4` + `HUMAN_DECISION` |

---

## AgentOS — MLOps and Agent Orchestration (Pipeline Stage 4)

AgentOS risk classification (low / medium / high / blocked) maps directly to Zones 1, 2, and blocked. The Decision Matrix formalizes this mapping and adds Zone 3 for pipeline strategy decisions.

| Action Category | Zone | Risk Level | Rationale | Logger Event |
|---|---|---|---|---|
| Data ingestion to feature store | 1 | low | Routine pipeline step; validated by data quality gate | `AGENT_STEP_START` / `AGENT_STEP_COMPLETE` |
| Schema validation | 1 | low | Automated verification | `AGENT_STEP_COMPLETE` |
| Training job launch | 1 | medium | Flagged in briefing; agent executes, human reviews outcome | `AGENT_STEP_COMPLETE` |
| Drift baseline update | 1 | medium | Agent executes; human reviews in daily briefing | `AGENT_STEP_COMPLETE` |
| Accuracy / bias / drift gate evaluation | 1 | low | Automated gate; result determines next step | `GOVERNANCE_GATE_1` |
| Retrain alert queuing | 1 | low | Alert generation is automatic; response is Zone 2 | `ANOMALY_DETECTED` |
| Retrain decision in response to alert | **2** | medium | Human decides whether drift warrants retrain | `HUMAN_DECISION` — `decision_type: HUMAN_APPROVAL` |
| Model deployment / active model swap | **2** | high | Consequential infrastructure change; requires named approval | `HUMAN_DECISION` — `decision_type: HUMAN_APPROVAL` |
| Rollback to prior model version | **2** | high | Consequential infrastructure change | `HUMAN_DECISION` — `decision_type: HUMAN_APPROVAL` |
| Any action classified blocked | Blocked | blocked | Never executes | — |
| Program Office Suite pipeline strategy | **3** | — | Agent proposes pipeline design; human approves architecture | `AGENT_STEP_COMPLETE` + `HUMAN_DECISION` |
| Autonomy stage progression (Stage 1 → 2 → 3) | **3** | — | Human evaluates track record; agent provides evidence | `AGENT_STEP_COMPLETE` + `HUMAN_DECISION` |
| New pipeline addition | **3** | — | Agent scopes; human approves before any code is written | `AGENT_STEP_COMPLETE` + `HUMAN_DECISION` |

---

## NEXUS — Task and Correspondence Management (Pipeline Stage 6)

NEXUS operates at program or enterprise-scale DAU. Zone 1 actions execute automatically at volume. Zone 2 actions are risk-stratified — not every task routing decision requires individual human review. See the Human Review Volume Architecture note below.

| Action Category | Zone | Rationale | Logger Event |
|---|---|---|---|
| AI classification of incoming task/correspondence | 1 | Classification is preparation; routing decision is Zone 2 | `AGENT_STEP_COMPLETE` |
| Routing recommendation generation | 1 | Draft recommendation; human approves routing | `AGENT_STEP_COMPLETE` |
| Routine task routing — low consequence | 1 | Defined risk tier; statistical sampling governs quality (see note) | `APPROVAL_GATE_CLOSE` |
| Routing of congressional inquiries, SES-level items, or classified correspondence | **2** | High-consequence correspondence requires named human routing decision | `HUMAN_DECISION` — `decision_type: HUMAN_APPROVAL` |
| AI-drafted correspondence acceptance | **2** | Human reviews and accepts draft before it is sent | `HUMAN_DECISION` — `decision_type: HUMAN_APPROVAL` |
| Human routing override of AI recommendation | **2** | Override is a consequential decision; must be logged | `HUMAN_DECISION` — `decision_type: HUMAN_OVERRIDE` |
| Approval gate open / close | **2** | Approval gate passage is a Zone 2 event by definition | `APPROVAL_GATE_OPEN` / `APPROVAL_GATE_CLOSE` + `HUMAN_DECISION` |
| Task escalation | **2** | Escalation routing is consequential | `HUMAN_DECISION` — `decision_type: HUMAN_APPROVAL` |
| PPTX/document generation (Track B) | 1 | Agent generates; human reviews before use | `AGENT_STEP_COMPLETE` |
| Tenant context validation | 1 | Automated security check; blocks on failure | `AGENT_STEP_COMPLETE` |
| Anomaly detected in task stream | **2** | Human decides response to flagged anomaly | `HUMAN_DECISION` — `decision_type: HUMAN_APPROVAL` |
| Novel task type requiring policy determination | **3** | No existing routing rule; agent synthesizes context; human decides policy | `AGENT_STEP_COMPLETE` + `HUMAN_DECISION` |

**Human Review Volume Note — NEXUS:** At program or enterprise-scale volume, Zone 2 cannot mean "review every output." Risk-stratified review tiers must be defined before Stage 5 production build. Routine low-consequence routing operates under statistical sampling with defined quality thresholds. Congressional inquiries, SES-level items, and classified correspondence always receive individual substantive review. Escalation thresholds must be set before production deployment.

---

## APEX — Portfolio Analytics and Reporting (Pipeline Stage 6)

| Action Category | Zone | Rationale | Logger Event |
|---|---|---|---|
| Known-answer test execution | 1 | Automated accuracy baseline check | `GOVERNANCE_GATE_1` |
| Drift delta computation | 1 | Automated metric; alert fires if threshold exceeded | `AGENT_STEP_COMPLETE` |
| Drift alert at `drift_delta > 0.05` | 1 | Alert generation is automatic | `ANOMALY_DETECTED` |
| Response to drift alert | **2** | Human decides whether drift warrants action | `HUMAN_DECISION` — `decision_type: HUMAN_APPROVAL` |
| Monthly Status Report (MSR) generation | 1 | Routine report; no structural hold | `AGENT_STEP_COMPLETE` |
| Cost Summary Card (CSC) generation | 1 | Routine report | `AGENT_STEP_COMPLETE` |
| Quarterly Progress Report (QPR) generation — CPMI status green | 1 | No hold condition | `AGENT_STEP_COMPLETE` |
| QPR/ABS generation — CPMI portfolio status red | Blocked | DOE-NORM-001 structural hold; `sovereignHold()` prevents generation | `GOVERNANCE_GATE_2` — HOLD |
| Report review and acceptance by program manager | **2** | Human reviews AI-generated report before it is formally submitted | `HUMAN_DECISION` — `decision_type: HUMAN_APPROVAL` |
| Work package creation | **2** | Creates a cost-code-linked work record | `HUMAN_DECISION` — `decision_type: HUMAN_APPROVAL` |
| AI assistant query for program analysis | **3** | Agent synthesizes program data; human decides action | `AGENT_STEP_COMPLETE` + `HUMAN_DECISION` |
| DOE-NORM conflict identification | **3** | Agent flags conflict; human determines resolution | `AGENT_STEP_COMPLETE` + `HUMAN_DECISION` |

---

## ARIA Suite — Authorization, Travel, and Timecard and Labor Charging Compliance (Pipeline Stage 7)

ARIA deliberately excludes AI from all decision paths. All agent activity in ARIA is Zone 1 (rule evaluation and analysis). All decisions are Zone 2. There are no Zone 3 decisions in ARIA — the policy-as-data architecture makes every decision deterministic against a defined rule set, not a collaborative judgment call.

### ARC — Authorization Lifecycle

| Action Category | Zone | Rationale | Logger Event |
|---|---|---|---|
| Authorization request intake | 1 | Administrative receipt | `AGENT_STEP_START` |
| Routing rule evaluation (all 10 rules) | 1 | Deterministic rule evaluation; no AI in path | `AGENT_STEP_COMPLETE` |
| Anomaly score computation | 1 | Continuous 0.00–1.00 scoring | `AGENT_STEP_COMPLETE` |
| Anomaly score < 0.75 — route to approval chain | 1 | Below AUDIT_HOLD threshold; proceeds to human approver | `AGENT_STEP_COMPLETE` |
| Anomaly score ≥ 0.75 — AUDIT_HOLD | 1 | Automatic hold trigger; alert generated | `ANOMALY_DETECTED` |
| Authorization approval | **2** | Named human decision; self-approval structurally impossible | `HUMAN_DECISION` — `decision_type: AUTHORIZATION_APPROVED` |
| Authorization denial | **2** | Named human decision | `HUMAN_DECISION` — `decision_type: AUTHORIZATION_DENIED` |
| AUDIT_HOLD resolution | **2** | Compliance officer decision; consequential | `HUMAN_DECISION` — `decision_type: AUDIT_HOLD_RESOLVED` |
| Escalation decision | **2** | Named human escalation decision | `HUMAN_DECISION` — `decision_type: ESCALATION_DECISION` |
| AI-absence attestation generation | 1 | Automatic CPMI-VRS Gate 1 record; emitted on every adjudication | `GOVERNANCE_GATE_1` |

### TRACER — Travel Compliance

| Action Category | Zone | Rationale | Logger Event |
|---|---|---|---|
| Policy rule evaluation (all 6 rules) | 1 | Deterministic; no AI | `AGENT_STEP_COMPLETE` |
| Reasoning chain generation | 1 | Explanatory output for human reviewer | `AGENT_STEP_COMPLETE` |
| APPROVE recommendation generation | 1 | Recommendation only; human decides | `AGENT_STEP_COMPLETE` |
| APPROVE WITH AWARENESS recommendation | 1 | Recommendation only | `AGENT_STEP_COMPLETE` |
| ESCALATE recommendation generation | 1 | Recommendation only | `AGENT_STEP_COMPLETE` |
| Travel request approval (PM role only) | **2** | Named human decision; analyst role structurally blocked | `HUMAN_DECISION` — `decision_type: TRAVEL_APPROVED` |
| Travel request denial (PM role only) | **2** | Named human decision | `HUMAN_DECISION` — `decision_type: TRAVEL_DENIED` |
| Travel escalation (PM role only) | **2** | Named human decision | `HUMAN_DECISION` — `decision_type: TRAVEL_ESCALATED` |
| Approve with awareness (PM role only) | **2** | Named human decision with documented awareness | `HUMAN_DECISION` — `decision_type: TRAVEL_AWARE_APPROVED` |
| Role-blocked decision attempt | 1 | Structural block logged automatically | `DECISION_BLOCKED_INSUFFICIENT_ROLE` |
| AI-absence attestation generation | 1 | Automatic CPMI-VRS Gate 1 record | `GOVERNANCE_GATE_1` |

### CLEAR — Timecard and Labor Charging Compliance

| Action Category | Zone | Rationale | Logger Event |
|---|---|---|---|
| Detection rule evaluation (all 10 rules) | 1 | Deterministic; no AI | `AGENT_STEP_COMPLETE` |
| Recurrence detection (rolling 6-period window) | 1 | Automated pattern detection | `AGENT_STEP_COMPLETE` |
| Pattern drift flag (PM-only visibility) | 1 | Information surface; no action triggered automatically | `AGENT_STEP_COMPLETE` |
| Email template generation | 1 | Draft only; human reviews before any communication | `AGENT_STEP_COMPLETE` |
| Labor correction approval | **2** | Named human decision (PM role only) | `HUMAN_DECISION` — `decision_type: LABOR_CORRECTION_APPROVED` |
| Clarification communication approval | **2** | Human reviews draft and approves before sending | `HUMAN_DECISION` — `decision_type: LABOR_CLARIFICATION_SENT` |
| Escalation initiation | **2** | Named human decision | `HUMAN_DECISION` — `decision_type: LABOR_ESCALATION_INITIATED` |
| Pattern acknowledgment | **2** | Human acknowledges pattern flag | `HUMAN_DECISION` — `decision_type: PATTERN_ACKNOWLEDGED` |
| Role-blocked decision attempt | 1 | Structural block logged automatically | `DECISION_BLOCKED_INSUFFICIENT_ROLE` |
| AI-absence attestation generation | 1 | Automatic CPMI-VRS Gate 1 record | `GOVERNANCE_GATE_1` |

---

## Cross-Product Standing Rules

These rules apply to every product without exception:

**Rule 1:** Every Zone 2 decision emits a `HUMAN_DECISION` Logger event. No Zone 2 decision is complete until the Logger event is written.

**Rule 2:** `decision_type` is required on every `HUMAN_DECISION` event. The value must come from the approved taxonomy in this document. Free-text decision descriptions are not acceptable.

**Rule 3:** Zone 1 actions that fail emit `ANOMALY_DETECTED` or the appropriate gate event. They do not silently pass.

**Rule 4:** Zone 3 decisions always produce two Logger entries: `AGENT_STEP_COMPLETE` (agent contribution) and `HUMAN_DECISION` (human decision). Both carry the same `workflow_step_id`.

**Rule 5:** Self-approval is impossible in any zone. The human who initiates a request cannot be the human who approves it. This is enforced architecturally, not by policy.

**Rule 6:** The zone assignment for a given action is fixed by this document. It cannot be changed by a developer, a session instruction, or a user request. Zone changes require a documented governance decision by the Project Principal and an update to this document and the Integration Brief.

---

## Intelligence Layer Implications

Every `HUMAN_DECISION` event produced under this matrix is training data for the Intelligence Layer Judgment Detection component. Consistent `decision_type` tagging across all products is what makes this training data useful. Inconsistent tagging is noise.

The Decision Matrix is therefore not only a governance document — it is a training data specification. The quality of the Intelligence Layer's Judgment Detection model depends directly on the discipline with which this matrix is implemented across all six products.

---

## Approved `decision_type` Taxonomy

The following values are approved. No other values may appear in `decision_type` fields.

```
HUMAN_APPROVAL
HUMAN_OVERRIDE
HUMAN_DENIAL
AUTHORIZATION_APPROVED
AUTHORIZATION_DENIED
ESCALATION_DECISION
AUDIT_HOLD_RESOLVED
TRAVEL_APPROVED
TRAVEL_DENIED
TRAVEL_ESCALATED
TRAVEL_AWARE_APPROVED
LABOR_CORRECTION_APPROVED
LABOR_CLARIFICATION_SENT
LABOR_ESCALATION_INITIATED
PATTERN_ACKNOWLEDGED
```

---

*SOVEREIGN Decision Matrix v1.0 · May 2026 · Project Principal approved*  
*Pre-Decisional · Internal Working Document*  
*Incorporated into SOVEREIGN Platform Integration Brief v1.3*

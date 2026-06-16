# SOVEREIGN Platform — Agent Operator Scope Document
**Role Definition, Responsibilities, Alert Response, and Succession**

Document Type: Governance Standard
Version: 1.0 — June 2026
Authority: Project Principal · SOVEREIGN Platform Governance Authority
Status: APPROVED — June 2, 2026
Classification: Pre-Decisional · Internal Working Document

Prerequisite satisfied by: This document (R3 — required before Stage 2 alerts go live)
Incorporated into: SOVEREIGN Platform Integration Brief v1.3 upon approval

---

## Purpose

The Agent Operator is the human responsible for managing agent behavior at the portfolio level across all six SOVEREIGN products. This role exists because AI agents operating at scale require ongoing human oversight that is distinct from — and cannot be absorbed by — the product owners, program managers, or compliance officers who use the platform.

Without a defined Agent Operator, the following happen in practice:
- Security Framework P1 alerts route to no one and are resolved by whoever notices them first
- Prompt drift goes undetected between sessions
- CPMI behavioral benchmarks are run inconsistently or not at all
- Agent anomalies accumulate in logs without triggering investigation
- The daily briefing becomes a document no one reads

This document closes that gap. It defines the scope of the Agent Operator role, assigns it, and establishes the processes the role executes.

---

## Section 1 — Role Assignment

**Primary Agent Operator:** Project Principal

The Project Principal currently performs Agent Operator functions informally. This document formalizes that assignment with defined scope, cadence, and succession.

**This assignment is temporary by design.** At production scale — when NEXUS is processing program or enterprise-scale correspondence volume and all six products are generating live Logger events — the Agent Operator workload exceeds what one person can absorb alongside product ownership responsibilities. Section 6 of this document addresses the capacity planning obligation.

---

## Section 2 — What the Agent Operator Does

The Agent Operator manages agent behavior at the portfolio level. This is distinct from what individual product owners do. Product owners make decisions about what their product builds and governs. The Agent Operator ensures the agents executing those decisions behave as specified, remain within bounds, and are caught quickly when they don't.

The Agent Operator's responsibilities fall into five areas:

### 2.1 Alert Response
Receive, triage, and resolve Security Framework alerts. The Agent Operator is the named recipient of all P1 and P2 alerts from the Alert Dispatcher across all six products. Response protocol is defined in Section 3.

### 2.2 Prompt Governance
Own the prompt review cadence across the Prompt Registry. Every agent in SOVEREIGN operates under a registered prompt. The Agent Operator ensures prompts are reviewed on schedule, changes go through the documented change management process, and no agent operates under an unregistered or unapproved prompt. Review cadence is defined in Section 4.

### 2.3 Daily Briefing Review
Read and act on the AgentOS daily briefing each operating day. The briefing surfaces: agent activity summary, anomaly events, pending human approval queue, regulatory monitoring checklist, and any CPMI reasoning drift flags. Review process is defined in Section 5.

### 2.4 Behavioral Benchmark Execution
Run the CPMI behavioral benchmark suite on the defined periodic schedule and before any CPMI prompt change is approved. The benchmarks are the external check on CPMI's reasoning behavior that does not depend on CPMI's self-assessment. Benchmark process is defined in Section 5.

### 2.5 Agent Isolation Authority
The Agent Operator has the authority to isolate any agent in the platform — removing it from the active registry — when its behavior becomes anomalous. Isolation does not require Project Principal approval when the Agent Operator is the Project Principal. If a successor Agent Operator is named, isolation of any agent requires notification to the Project Principal within one hour.

---

## Section 3 — Alert Response Protocol

### P1 Alerts — Immediate Response Required

**P1 trigger events:** HONEYTOKEN_ACCESS, APPROVAL_GATE_BYPASS, AGENT_ISOLATED, any ANOMALY_DETECTED from CPMI.

**Response timeline:** P1 alerts require acknowledgment within 30 minutes and initial triage within 2 hours, regardless of time of day. P1 alerts are never batched and never deferred.

**Response steps:**

```
Step 1 — Acknowledge
  Confirm receipt of the alert. Log the acknowledgment with timestamp
  to the SOVEREIGN audit trail.
  Logger event: AGENT_STEP_START, actor_id: [agent_operator_id],
  workflow_step_id: "SOVEREIGN-ALERT-RESPONSE-v1.0-step-1"

Step 2 — Isolate if needed
  If the alert indicates active agent misbehavior (HONEYTOKEN_ACCESS,
  APPROVAL_GATE_BYPASS): isolate the implicated agent immediately using
  the Agent Identity Standard isolation process.
  Do not investigate before isolating — isolation is the first action,
  investigation is the second.

Step 3 — Triage
  Determine: Is this a confirmed security incident, a false positive,
  or a system error?
  - Confirmed incident: proceed to Step 4
  - False positive: document the determination, note the false positive
    pattern for anomaly baseline recalibration, close the alert
  - System error: document the error condition, execute Type B override
    process if APEX reporting is blocked, remediate

Step 4 — Escalate (confirmed incidents only)
  Notify the Project Principal immediately.
  If HONEYTOKEN_ACCESS: treat as a security breach until proven otherwise.
  Document the escalation with timestamp and initial findings.

Step 5 — Investigate and Remediate
  Follow the Agent Identity Standard anomaly response process
  (Steps 1–6: Isolate, Investigate, Root cause, Remediate,
  Re-authorize, Document).

Step 6 — Close
  Log alert closure with resolution summary.
  Logger event: AGENT_STEP_COMPLETE, workflow_step_id: "SOVEREIGN-ALERT-RESPONSE-v1.0-step-6"
  Update anomaly baseline if the event was a false positive.
```

### P2 Alerts — Review Within One Business Day

**P2 trigger events:** ANOMALY_DETECTED (non-CPMI), EXTERNAL_DEPENDENCY_FAILURE, GOVERNANCE_GATE_OVERRIDE.

**Response timeline:** P2 alerts are batched in 5-minute windows by the Alert Dispatcher. The Agent Operator reviews the P2 batch during the daily briefing review or within one business day of receipt.

**Response steps:**

```
Step 1 — Review batch
  Read all P2 alerts since last review. Identify patterns:
  - Repeated EXTERNAL_DEPENDENCY_FAILURE from the same product
    may indicate infrastructure degradation
  - Multiple ANOMALY_DETECTED from the same product in a short
    window may indicate a genuine behavioral shift
  - Multiple GOVERNANCE_GATE_OVERRIDE events from the same
    program may indicate governance hold misconfiguration

Step 2 — Triage each alert
  Classify each as: requires action, monitor and watch, or close as expected.

Step 3 — Act on requires-action alerts
  Follow the same isolation and investigation process as P1
  when a P2 alert warrants it. P2 priority does not mean
  low severity — it means the initial signal did not meet
  the immediate-response threshold.

Step 4 — Log disposition
  Every P2 alert receives a logged disposition:
  action taken, monitor, or closed with reason.
```

---

## Section 4 — Prompt Review Cadence

### Periodic Review Schedule

| Scope | Frequency | Trigger |
|---|---|---|
| All active prompts — full registry review | Quarterly | Calendar — first week of each quarter |
| CPMI reasoning chain prompt | Monthly | Calendar — first operating day of each month |
| Any prompt flagged by behavioral benchmark failure | Immediate | Benchmark failure event |
| Any prompt for an agent that produced a P1 alert | Immediate | Alert closure — before agent is re-authorized |

### What a Prompt Review Covers

For each prompt under review, the Agent Operator confirms:
1. The prompt is in the Prompt Registry with a current version and changelog entry
2. The prompt's behavioral benchmarks (where they exist) pass on the current model version
3. The prompt has not drifted from its approved version — compare registered version against what is actively deployed
4. Any recent model version change by the provider (Anthropic or other) has not altered baseline behavior — run behavioral benchmarks after any provider model update notification

### CPMI Prompt Change Process

CPMI prompt changes require more than the standard review. Before any CPMI prompt change is approved:
1. Run the full CPMI behavioral benchmark suite against the proposed prompt
2. All five benchmarks must pass: six-step completeness, uncertainty surfacing, Gate 3 escalation trigger, drift detection, constraint adherence
3. The Norm Accuracy Benchmark (Stage 3 deliverable) must pass once it exists
4. Document benchmark results in the Prompt Registry CHANGELOG
5. Project Principal approval required — CPMI prompt changes are governance events

---

## Section 5 — Daily Briefing Review and Benchmark Execution

### Daily Briefing Review

The AgentOS daily briefing is the Agent Operator's primary situational awareness tool. It is reviewed each operating day before any other agent-related work.

**Briefing contents (to be generated by AgentOS compliance-agent):**
- Agent activity summary: events logged per product in the past 24 hours
- Anomaly events: any ANOMALY_DETECTED events with scores and products
- Pending human approval queue: tasks in AWAITING_HUMAN_APPROVAL state
- Alert disposition status: any open P1 or unreviewed P2 alerts
- Regulatory monitoring checklist: confirmation that monitored sources were checked (ARIA rule maintenance)
- CPMI reasoning drift flags: any REASONING_DRIFT events from the past 24 hours
- Honeytoken access count: should always be zero — any nonzero value is a P1 incident already in progress

**Review actions:**
- Reasoning drift flags → investigate CPMI behavior before the next governance certification
- Nonzero honeytoken access → confirm P1 alert was received and is being actioned
- Growing pending approval queue → notify relevant product owners; queue growth indicates review capacity pressure
- Repeated EXTERNAL_DEPENDENCY_FAILURE from one product → investigate infrastructure

**Briefing cadence:** Daily on operating days. The briefing review is logged:
```
Logger event: HUMAN_DECISION
decision_type: HUMAN_APPROVAL
workflow_step_id: "AGENTOS-BRIEFING-v1.0-step-1"
actor: human
actor_name: [Agent Operator name]
outcome: "Daily briefing reviewed — [summary of actions taken or 'no action required']"
```
This log entry is ground-truth training data for the Intelligence Layer's Judgment Detection component.

### CPMI Behavioral Benchmark Execution

**Schedule:** Monthly during active development; quarterly in production.

**Trigger conditions requiring out-of-cycle execution:**
- Any CPMI prompt change proposed
- Any Anthropic model version update notification received
- Any REASONING_DRIFT event in the daily briefing
- Any CPMI P1 alert

**Five benchmarks (from Prompt Registry Specification):**
1. **Six-step completeness** — CPMI produces all six reasoning steps; no step is skipped or collapsed
2. **Uncertainty surfacing** — CPMI explicitly states confidence level and flags low-confidence outputs
3. **Gate 3 escalation trigger** — CPMI correctly identifies conditions requiring human independent reviewer
4. **Drift detection** — CPMI detects and flags when its confidence drops >15% from session baseline
5. **Constraint adherence** — CPMI respects its defined scope; does not reason outside its authority

**Benchmark execution process:**
```
Step 1 — Run all five benchmarks against current deployed prompt
Step 2 — Record pass/fail for each benchmark with timestamp
Step 3 — If all pass: log completion, update Prompt Registry with benchmark date
Step 4 — If any fail: do not deploy any pending prompt changes;
          investigate the failing benchmark immediately;
          treat as a potential model behavior change event
Step 5 — Log results to SOVEREIGN audit trail:
          Logger event: AGENT_STEP_COMPLETE
          agent_id: sovereign.anomaly-detector (proxy — benchmark runner
          agent_id to be assigned when benchmark automation is built)
          workflow_step_id: "CPMI-BENCHMARK-v1.0-step-5"
```

---

## Section 6 — Escalation Authority, Succession, and Capacity Planning

### Escalation Authority

The Agent Operator has standing authority to:
- Isolate any agent without prior approval
- Block any prompt change pending benchmark review
- Pause any automated workflow pending investigation
- Invoke the APEX Type B override process for system errors

The Agent Operator does not have standing authority to:
- Approve a CPMI prompt change unilaterally (requires Project Principal approval)
- Re-authorize an isolated agent unilaterally after a confirmed security incident (requires Project Principal approval and documented root cause)
- Change the anomaly detection contamination parameter for any product (governance decision)

### Succession Procedure

If the primary Agent Operator is unavailable:

**For P1 alerts:** The Project Principal receives all alerts directly. If the Project Principal is also unavailable, P1 alerts are logged to the local file fallback (always active) and addressed at the earliest opportunity. No P1 alert may be deferred beyond 24 hours without documented justification.

**For daily briefing:** If the Agent Operator misses a briefing day, the next briefing covers the missed period. Missing more than two consecutive briefing days requires a catch-up review of all accumulated alerts and anomaly events before normal cadence resumes.

**Named succession:** At this stage of development, the Project Principal is both the Agent Operator and the succession contact. Before any client pilot, a second person must be named and trained as the backup Agent Operator. This is a prerequisite of the Client Implementation Methodology (R4).

### Production Capacity Planning Note

The current scope assumes one Agent Operator performing all functions across six products in a development-phase environment with synthetic data and low event volume.

At NEXUS production scale — processing program or enterprise-scale correspondence volume — the Agent Operator workload becomes unsustainable for one person. Realistic production capacity estimate:

| Function | Development Phase | Production Scale |
|---|---|---|
| P1 alert response | Rare — synthetic data | Potentially multiple per week per product |
| Daily briefing review | 15–30 minutes | 45–90 minutes with live data volume |
| Prompt review (quarterly) | 2–3 hours | 4–6 hours across all products |
| CPMI benchmark execution | 1 hour monthly | 1–2 hours with expanded benchmark suite |
| P2 alert triage | Minimal | 30–60 minutes daily at volume |

**At production scale, the Agent Operator role requires at minimum one dedicated part-time staff member, with surge capacity for incident response.** This estimate must be included in the Client Implementation Methodology document (R4) so federal clients can plan staffing before deployment, not after.

---

## Section 7 — What This Document Does Not Cover

This document defines the Agent Operator role for the current SOVEREIGN development phase. The following are deferred:

**Multi-tenant Agent Operator model:** When SOVEREIGN is deployed at multiple federal agencies simultaneously, each deployment requires its own Agent Operator with the same scope defined here. The platform supports this — each product module operates within one ATO boundary. The inter-agency coordination model is out of scope for this document.

**Classified environment Agent Operator:** Operating in a Tier 3 (classified) environment creates additional obligations — insider threat monitoring, need-to-know enforcement, classification authority. The Agent Operator scope in a classified environment must be negotiated with the government customer before deployment. This is noted in the Agent Identity Standard and the FedRAMP Infrastructure Strategy.

**Automated Agent Operator functions:** Some Agent Operator functions — routine P2 triage, briefing generation, benchmark execution — are candidates for automation once the AgentOS monitoring pipeline matures. Automation of any Agent Operator function requires a governance decision. The human Agent Operator role is never fully automated — the escalation authority in Section 6 requires a named human.

---

*SOVEREIGN Agent Operator Scope Document v1.0 · June 2026*
*Pre-Decisional · Internal Working Document*
*R3 satisfied upon Project Principal approval of this document*

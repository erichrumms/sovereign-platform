# VIGIL Module — Agent Approval Flow
## Document ID: 05_VIGIL_Agent_Approval.md | Version 1.0 | June 23, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Parent Brief:** SOVEREIGN Platform Integration Brief v1.14
**Status:** Approved for Session 10 Build

---

## §1 — Purpose and Scope

This document defines the architecture of the VIGIL Agent Approval flow — the live
feature set that activates the `vigil-approval-agent` and the Agent Approval Queue
surface within `module-vigil`. It is the architecture spec that unblocks Session 10.

The Agent Approval flow is the mechanism by which AgentOS routes agent actions that
require human authorization to a human operator before the action proceeds. VIGIL is
the human-facing surface that receives these requests, presents them for review, and
records the human decision. The approval decision is the authoritative governance
record for that agent action.

**What this document covers:**
- The role of `vigil-approval-agent` and how it differs from `vigil-triage-analyst`
- The Agent Approval Queue: what it displays, what decisions it supports
- The approval decision event schema (GD-4 compliance)
- The prompt for `vigil-approval-agent` (PR-VIGIL-002, to be approved)
- Integration with AgentOS and the shell contract
- Session 10 done condition

---

## §2 — Big Picture: What the Agent Approval Flow Does

SOVEREIGN's companion suite already handles two human-oversight functions:

- **VIGIL Triage Assistant** (`vigil-triage-analyst`) — when an anomaly is detected,
  it helps the human operator understand what happened and decide how to respond.
  It is reactive: it responds to events that have already occurred.

- **VIGIL Agent Approval Queue** (`vigil-approval-agent`) — when an AgentOS agent
  wants to take a consequential action, it submits an approval request before acting.
  The human reviews the request and approves or rejects it. The agent then proceeds
  (or does not) based on the human's decision. It is proactive: it intercepts actions
  before they occur.

Together these two flows give the human operator full visibility and control: awareness
of what went wrong (Triage), and authority over what happens next (Approval). They are
the operational implementation of SOVEREIGN's human-in-the-loop governance requirement.

**The governance principle:**
No consequential agent action proceeds without a logged human decision. The approval
record is not a notification. It is the authorization that makes the action legitimate.

---

## §3 — Agent Roles

### 3.1 vigil-approval-agent

| Property | Value |
|---|---|
| **Agent ID** | `vigil-approval-agent` |
| **Module** | VIGIL |
| **Class** | Monitoring |
| **Prompt** | PR-VIGIL-002 (to be authored and approved this session) |
| **Status** | Registered in Agent_Identity_Standard.md v1.1 — not yet implemented |
| **Approval behavior** | `ACKNOWLEDGE_AND_CONTINUE` (platform default per Agent Identity Standard Session 1 update) |

**What it does:** Receives approval requests from AgentOS, formats them into
human-readable briefs for the operator, presents the brief in the Agent Approval Queue,
and records the human's decision as a Logger event. It does not approve requests
autonomously. Its only job is to surface requests clearly and record decisions
faithfully.

**What it does not do:** It does not evaluate whether the request is wise. It does not
make recommendations. It does not self-approve. It does not act on the platform on
behalf of the human. It is a conduit and a record-keeper.

### 3.2 Relationship to vigil-triage-analyst

| | vigil-triage-analyst | vigil-approval-agent |
|---|---|---|
| **Trigger** | Anomaly detected (reactive) | Agent action pending (proactive) |
| **Input** | Security alert from Alert Queue | Approval request from AgentOS |
| **Output** | Triage brief for operator review | Decision record (approved / rejected) |
| **Prompt** | PR-VIGIL-001 (APPROVED June 17) | PR-VIGIL-002 (Session 10) |
| **Human role** | Reviews brief, decides response | Reviews request, approves or rejects |
| **Logger event** | `ALERT_*` events (GD-4) | `AGENT_ACTION_APPROVED` / `AGENT_ACTION_REJECTED` (GD-4, new) |

---

## §4 — Agent Approval Queue Surface

### 4.1 What It Displays

The Agent Approval Queue is a tab within `VigilApp.tsx`. It displays pending approval
requests submitted by AgentOS agents. Each request card shows:

| Field | Description |
|---|---|
| **Request ID** | Unique identifier for this approval request |
| **Requesting Agent** | `agent_id` and `agent_class` of the agent making the request |
| **Action Type** | Human-readable description of the action being requested |
| **Action Detail** | Structured data describing the specific action (model deployment, data export, configuration change, etc.) |
| **Risk Classification** | P1 / P2 / P3 — set by AgentOS based on action type |
| **Submitted At** | Timestamp of request submission |
| **Context Brief** | The `vigil-approval-agent` formatted brief — what the action does, what changes, what is reversible |
| **Expiry** | Time remaining before the request expires (P1: 15 min, P2: 60 min, P3: 4 hours) |

### 4.2 Decision Actions

The operator has three decisions for each request:

| Decision | Logger Event | Notes |
|---|---|---|
| **Approve** | `AGENT_ACTION_APPROVED` | Required: notes field (≥10 chars). Agent proceeds with action. |
| **Reject** | `AGENT_ACTION_REJECTED` | Required: notes field (≥10 chars). Agent does not proceed. |
| **Escalate** | `AGENT_ACTION_ESCALATED` | Required: notes field (≥10 chars). Routes to Project Principal with urgent flag. |

Notes are required for all three decisions. An undocumented approval is as ungoverned
as no approval — the Logger record must be complete. Gate 2: a failed Logger emit
blocks the decision (same pattern as alert response in `useAlertResponse.ts`).

### 4.3 Queue States

| State | Display |
|---|---|
| No pending requests | "No pending approvals — all agent actions are authorized or idle." |
| Requests present | Sorted P1-first, then by submission time (oldest first within priority). |
| Expired request | Shown with EXPIRED badge. Expired requests are automatically rejected with a system actor Logger event. |
| `vigil-approval-agent` unregistered | Not applicable — agent is registered (Session 7). Build activates it. |

---

## §5 — Approval Request Schema

AgentOS submits approval requests to VIGIL via an injectable port (same pattern as
`SecurityObservabilityQuery` in Session 9 — port-based, not a direct API call).

```typescript
interface AgentApprovalRequest {
  request_id: string;              // UUID
  requesting_agent_id: string;     // canonical agent_id from Agent Identity Standard
  requesting_agent_class: string;  // Analytical | Operational | Governance | Monitoring
  action_type: string;             // human-readable action category
  action_detail: Record<string, unknown>;  // structured action data
  risk_classification: 'P1' | 'P2' | 'P3';
  submitted_at: string;            // ISO timestamp
  expires_at: string;              // ISO timestamp
  workflow_step_id: string;        // Standing Constraint 6
  context?: string;                // optional free-text context from requesting agent
}
```

The port is injectable — synthetic/dev backing this session (same as Session 9
Security Framework wiring), live AgentOS backing by configuration in a later session.
No AgentOS rewrite is required when the live backing is injected (Constraint #3).

---

## §6 — Logger Event Schema (GD-4 Extension)

Two new `SovereignEventType` values are added to `shell-contract.ts` this session.
This is the only shell-contract change in Session 10 — it requires the governance
process: version increment to v1.4, changelog entry, impact assessment, and SHA-256
verification of both copies after the change.

### New Event Types

**`AGENT_ACTION_APPROVED`**

| Field | Required | Value |
|---|---|---|
| `event_type` | Yes | `AGENT_ACTION_APPROVED` |
| `request_id` | Yes | The approval request UUID |
| `requesting_agent_id` | Yes | The agent whose action was approved |
| `action_type` | Yes | The action type from the request |
| `actor` | Yes | `project_principal` |
| `actor_name` | Yes | Project Principal name |
| `workflow_step_id` | Yes — invariant | `vigil-approval-<requestId>` |
| `decision_type` | Yes | `AGENT_APPROVAL` — new HumanDecisionType member |
| `notes` | Yes | Operator notes (≥10 chars) |

**`AGENT_ACTION_REJECTED`**

Same schema as `AGENT_ACTION_APPROVED` with `event_type: AGENT_ACTION_REJECTED`.

**`AGENT_ACTION_ESCALATED`**

Same schema with `event_type: AGENT_ACTION_ESCALATED` and an additional
`escalation_reason` field.

**`AGENT_ACTION_EXPIRED`**

| Field | Required | Value |
|---|---|---|
| `event_type` | Yes | `AGENT_ACTION_EXPIRED` |
| `request_id` | Yes | The expired request UUID |
| `requesting_agent_id` | Yes | The agent whose request expired |
| `actor` | Yes | `sof-approval-system` (system actor) |
| `workflow_step_id` | Yes | `vigil-approval-<requestId>` |

### New HumanDecisionType Member

`AGENT_APPROVAL` — records a human decision to approve or reject a pending agent
action. This is the alert-response `HumanDecisionType` gap first noted in Session 7
(open governance item #18 in Integration Brief v1.14 §13) applied to the approval
context. This closes that gap for the approval flow specifically; alert-response
`HumanDecisionType` members remain deferred to a future v1.4 batch for the remaining
gap items.

---

## §7 — Shell Contract Change (v1.3 → v1.4)

Session 10 requires the **only shell-contract change** in the companion suite build.

**Additions to `shell-contract.ts`:**

```typescript
// New SovereignEventType values
'AGENT_ACTION_APPROVED'
'AGENT_ACTION_REJECTED'
'AGENT_ACTION_ESCALATED'
'AGENT_ACTION_EXPIRED'

// New HumanDecisionType member
'AGENT_APPROVAL'
```

**Governance requirements (Constraint #8 — all mandatory):**
1. Version increment: v1.3 → v1.4
2. Changelog entry documenting the additions and rationale
3. Impact assessment: which modules are affected (module-vigil only — new event types
   are VIGIL-exclusive; no existing module emits them)
4. SHA-256 verification of both copies after the change — both must match the new v1.4
   hash before any other build work proceeds
5. Project Principal approval recorded (this document serves as the pre-approval;
   Claude Code confirms before making the change)

This is the first shell-contract change since v1.3 was applied in Session 3. It is
deliberate, minimal, and closes a named governance gap.

---

## §8 — Prompt: PR-VIGIL-002

**Registry ID:** PR-VIGIL-002
**Agent:** `vigil-approval-agent`
**Status:** PENDING Project Principal approval — approve in Claude Chat before Session 10 opens

---

**Prompt file:** `module-vigil/prompts/approval-system-v1.0.md`

```
You are vigil-approval-agent, a Monitoring agent in the SOVEREIGN Platform.

Your role is to help the Security Operator review and decide on pending agent
action approval requests. You receive a structured approval request from AgentOS
and produce a clear, concise brief that helps the operator make an informed decision.

Your brief must include:
1. What action the requesting agent wants to take (in plain language)
2. What will change if the action is approved
3. What is reversible and what is not
4. The risk classification and why it was assigned
5. Any context the requesting agent provided

Your brief must not include:
- A recommendation (approve or reject) — the decision belongs to the operator
- Speculation about the requesting agent's intent
- Information not present in the approval request
- Any instruction to approve or reject

You are grounded only in the approval request submitted to you. You do not
access platform systems, query data, or take any action. You produce a brief
and wait for the operator's decision.

Format your brief with these labeled sections:
REQUESTED ACTION: (one sentence)
WHAT CHANGES: (two to four sentences)
REVERSIBILITY: (one sentence — what can be undone, what cannot)
RISK CLASSIFICATION: (P1/P2/P3 with one sentence of rationale)
AGENT CONTEXT: (the requesting agent's optional context, or "None provided")

If any field in the approval request is missing or malformed, state what is
missing and do not produce a brief. An incomplete request cannot be approved.
```

---

## §9 — Integration Points

### 9.1 AgentOS Connection (Injectable Port)

The `AgentApprovalQueue` reads pending requests through an injectable
`AgentApprovalPort`. This session uses a synthetic/dev backing — a small set of
representative approval requests covering the three risk classifications and the three
primary AgentOS action types (model deployment, data export, configuration change).

The live AgentOS backing is injected by configuration in the AgentOS build session.
No VIGIL rewrite is required (Constraint #3).

### 9.2 Shell Contract Seam

`vigil-approval-agent` is the first companion suite agent that requires a
shell-contract change. The change is minimal and deliberate — four event types and one
`HumanDecisionType` member. It has been deferred since Session 7 precisely so it could
be made once, cleanly, with proper governance documentation.

### 9.3 Existing VIGIL Patterns Reused

Session 10 follows the patterns already established in VIGIL rather than introducing
new ones:

| Pattern | Origin | Session 10 Reuse |
|---|---|---|
| Gate 2 fail-closed (failed Logger emit blocks decision) | `useAlertResponse.ts` | `useApprovalDecision.ts` |
| P1-first sort | `useAlertQueue.ts` | `useApprovalQueue.ts` |
| Serving-tier disclosure | `AnomalyTriageAssistant.tsx` | `ApprovalBrief.tsx` |
| Injectable port for external data | `security-query.ts` (Session 9) | `AgentApprovalPort` |
| System actor Logger event | `useAlertQueue.ts` (ALERT_RECEIVED) | `AGENT_ACTION_EXPIRED` |

---

## §10 — Files to Build (Session 10 Scope)

### New files in `module-vigil/src/`

| File | Purpose |
|---|---|
| `approval-contract.ts` | `AgentApprovalRequest` shape, decision types, `PR_VIGIL_002` binding, expiry logic |
| `approval-port.ts` | Injectable `AgentApprovalPort` + synthetic/dev backing |
| `approval-engine.ts` | Brief generation via `vigil-approval-agent` (three-tier fallback: live → cached → static) |
| `useApprovalQueue.ts` | Queue management hook — loads requests, handles expiry, P1-first sort |
| `useApprovalDecision.ts` | Decision hook — Approve / Reject / Escalate; Gate 2 fail-closed; Logger emission |
| `ApprovalQueue.tsx` | Queue surface — card list, priority badges, expiry countdown |
| `ApprovalDetail.tsx` | Request detail — full request fields + generated brief |
| `ApprovalDecisionPanel.tsx` | Decision controls — Approve / Reject / Escalate with required notes |
| `prompts/approval-system-v1.0.md` | PR-VIGIL-002 prompt file |
| `prompts/approval-system.prompt.ts` | Runtime copy of PR-VIGIL-002 (created after approval) |
| `prompts/CHANGELOG.md` | Updated with PR-VIGIL-002 APPROVED entry |

### Changed files

| File | Change |
|---|---|
| `sovereign-shell/shell-contract.ts` | v1.3 → v1.4: add 4 event types + `AGENT_APPROVAL` HumanDecisionType |
| `src/VigilApp.tsx` | Add Agent Approval Queue tab |
| `src/index.ts` | Register `vigil-approval-agent` card |

### Tests

Full test coverage required for: `approval-contract`, `approval-port`,
`approval-engine`, `useApprovalQueue`, `useApprovalDecision`, `ApprovalQueue`,
`ApprovalDetail`, `ApprovalDecisionPanel`.

---

## §11 — Session 10 Done Condition

**D1 — Shell Contract v1.4**
- Add `AGENT_ACTION_APPROVED`, `AGENT_ACTION_REJECTED`, `AGENT_ACTION_ESCALATED`,
  `AGENT_ACTION_EXPIRED` to `SovereignEventType`
- Add `AGENT_APPROVAL` to `HumanDecisionType`
- Version increment v1.3 → v1.4, changelog entry, impact assessment
- SHA-256 verify both copies — both must match new v1.4 hash before proceeding

**D2 — Agent Approval Flow**
- `vigil-approval-agent` implemented and registered
- Agent Approval Queue built and wired into `VigilApp.tsx`
- Brief generation via `vigil-approval-agent` with three-tier fallback
- All three decision types (Approve / Reject / Escalate) with Gate 2 fail-closed
- Expiry handling with `AGENT_ACTION_EXPIRED` system-actor Logger event
- Synthetic/dev `AgentApprovalPort` backing (live AgentOS port injectable by config)
- PR-VIGIL-002 runtime copy created; prompt marked APPROVED in CHANGELOG

**Close requirements (standard):**
- Full test suite passing — all six JS suites + 127 Python
- `tsc --noEmit` clean — sovereign-shell, module-vigil
- `npm audit --omit=dev` — zero production vulnerabilities
- Both shell-contract.ts copies SHA-256 identical at v1.4 hash
- Commit D1 and D2 separately; push to origin
- Session 10 Handoff + SBOM_Session10_Update.md

---

## §12 — Prompt Approval Required Before Session 10

PR-VIGIL-002 (`approval-system-v1.0.md`) is defined in §8 of this document.

**Project Principal action required:** Review the prompt text in §8. If approved,
record the approval here and in the Claude Chat governance record. Claude Code will
mark PR-VIGIL-002 as APPROVED in `prompts/CHANGELOG.md` during the Session 10 build.

PR-VIGIL-002 approval is the final pre-Session 10 blocker.

---

*SOVEREIGN Platform · 05_VIGIL_Agent_Approval.md · v1.0 · June 23, 2026*
*Pre-Decisional · Internal Working Document*

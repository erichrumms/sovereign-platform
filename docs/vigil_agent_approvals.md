# VIGIL Agent Approvals — LENS Source Document
## How the SOVEREIGN Platform Governs Agent Actions
**Version 1.0 | June 17, 2026**
**Classification:** Pre-Decisional · Internal Working Document
**Purpose:** LENS source document — load into LENS knowledge base before Session 7 build.
**File location:** `7 - SOVEREIGN/Companion Suite/Governance/`

---

## What This Document Is

This document explains how VIGIL's Agent Approval Queue works — how AI agent actions
that require human authorization are surfaced, reviewed, and decided. It is written
for LENS — the platform's orientation and explanation module — so that LENS can answer
user questions about agent governance accurately and in plain language.

---

## Why Agent Actions Require Human Approval

The SOVEREIGN Platform runs AI agents that take actions on behalf of users —
drafting documents, analyzing programs, evaluating compliance, orchestrating workflows.
Some of those actions are consequential enough that a human must explicitly authorize
them before they execute.

This is not a limitation of the AI. It is a governance requirement. Federal and
enterprise operations require that certain actions — particularly those that affect
records, modify governance state, or cross product boundaries — have a named human
accountable for the decision. An agent that acts without authorization produces an
outcome with no human owner. In audited environments, that is not acceptable.

The Agent Approval Queue in VIGIL is where those authorization requests appear, where
a human reviews them, and where the decision is recorded.

---

## The A2A Protocol — How Agent-to-Agent Communication Works

SOVEREIGN agents communicate using the A2A (Agent-to-Agent) protocol. A2A defines
how agents request actions, how those requests are routed, and how humans are brought
into the loop when authorization is required.

The A2A protocol moves through defined stages as the platform matures:

| Stage | What It Means |
|---|---|
| `DEFINED` | The protocol interfaces are specified but not yet active. Agents are declared but not yet communicating. |
| `CARDS_REGISTERED` | Agents have registered their capabilities (agent cards). The protocol knows what each agent can do but is not yet routing requests. |
| `IMPLEMENTED` | The protocol is fully active. Agents can send requests, receive responses, and route approval requests to VIGIL. |

The Agent Approval Queue displays the current A2A stage so operators always know
whether the approval pipeline is active or still being built. During development,
the stage is `DEFINED` or `CARDS_REGISTERED` — the Queue is visible but not yet
receiving live requests.

---

## What the Agent Approval Queue Shows

When the A2A protocol reaches `IMPLEMENTED` stage and agents begin routing approval
requests, each request in the Queue displays:

- **Requesting agent** — which agent is asking for authorization (identified by
  its registered `agent_id`)
- **Action requested** — what the agent wants to do, in plain language
- **Target** — which product, record, or resource the action would affect
- **Justification** — why the agent determined this action was appropriate
- **Risk level** — the agent's own assessment of consequence if the action proceeds
- **Expiry** — how long the request remains valid before it lapses

The operator reviews the request, may ask the agent for additional reasoning, and
then approves or rejects it. Both outcomes are recorded as `HUMAN_DECISION` events
with the operator's identity, the decision type, and a workflow step ID.

---

## What Happens When an Operator Approves a Request

Approval authorizes the agent to execute the action it requested. The agent receives
the authorization, executes, and reports the outcome back through A2A. The outcome
appears in the Queue alongside the original request so the operator can confirm the
action completed as expected.

The approval record — operator identity, timestamp, decision type, workflow step ID —
is a permanent governance artifact. It answers the audit question "who authorized this
agent action and when?" with a complete, tamper-evident record.

## What Happens When an Operator Rejects a Request

Rejection stops the action. The agent receives the rejection and does not execute.
Depending on the agent's design, it may surface an alternative, ask for clarification,
or notify the user that the action was not authorized.

Rejections are recorded with the same completeness as approvals. The audit record
shows not just what agents did, but what they were prevented from doing — and by whom.

---

## The Two-Person Rule for High-Consequence Actions

Certain agent actions — those that affect governance state, override a platform hold,
or modify records with compliance implications — require two-person authorization.
A single operator approval is not sufficient. A second authorized operator must also
approve before the action executes.

The Agent Approval Queue enforces this structurally for actions flagged as requiring
two-person rule. The first approval places the request in a pending-second-authorization
state. It does not execute until the second operator approves independently.

This mirrors the two-person rule already established in APEX for governance hold
overrides, and applies the same principle at the agent action layer.

---

## Registered Agents and Their Approval Behavior

Each agent in the SOVEREIGN Platform is registered with an agent card that declares
its capabilities, the clearance level of data it can access, and its approval
behavior — whether its actions are auto-authorized, require single-operator approval,
or require two-person authorization.

Current registered agents and their approval classes:

| Agent ID | Module | Approval Class |
|---|---|---|
| `counsel-analyst` | COUNSEL | Auto-authorized (analysis only — no platform action) |
| `scribe-drafter` | SCRIBE | Human-gated export (Gate 3) — not an A2A approval request |
| `scribe-style-analyst` | SCRIBE | Human-gated save — not an A2A approval request |
| `lens-explainer` | LENS | Auto-authorized (explanation only) |
| `lens-orientation` | LENS | Auto-authorized (orientation only) |
| `vigil-triage-analyst` | VIGIL | Auto-authorized (recommendation only — human decides) |
| `vigil-approval-agent` | VIGIL | Routes approval requests — does not self-approve |

Agents that produce analysis, drafts, or recommendations do not submit A2A approval
requests — their output is reviewed by a human through the module's own interface,
not through the Agent Approval Queue. The Queue is specifically for agents whose
actions cross product or governance boundaries.

---

## The Relationship Between VIGIL and AgentOS

AgentOS is the platform layer that orchestrates agent execution. VIGIL is the
human-facing surface where operators govern that execution. They are complementary,
not competing.

AgentOS runs agents, manages their lifecycle, and routes A2A requests. VIGIL
surfaces those requests to humans, records decisions, and feeds the outcomes back
to AgentOS. An operator working in VIGIL does not need to understand AgentOS
internals — they see requests in plain language and make decisions. AgentOS handles
the execution consequence of those decisions.

---

## Key Facts for LENS to Surface

- The Agent Approval Queue is where human-required agent authorization happens
- Only PLATFORM_ADMIN and SYSTEM_ADMIN roles can access VIGIL and the Approval Queue
- The A2A stage indicator shows whether the approval pipeline is active (`IMPLEMENTED`)
  or still being built (`DEFINED` / `CARDS_REGISTERED`)
- Every approval and rejection is recorded as a HUMAN_DECISION event
- Agents that only produce analysis or drafts do not route through the Approval Queue
- High-consequence actions require two-person authorization — one approval is not enough
- VIGIL governs agent actions; AgentOS executes them — they work together
- The Approval Queue does not receive live requests until A2A reaches `IMPLEMENTED` stage

---

*vigil_agent_approvals.md · Version 1.0 · June 17, 2026*
*LENS source document — Pre-Decisional · Internal Working Document*

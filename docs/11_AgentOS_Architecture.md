# AgentOS — Architecture Document
## Document ID: 11_AgentOS_Architecture.md | Version 1.0 | June 24, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Parent Brief:** SOVEREIGN Platform Integration Brief v1.20
**Status:** Approved for Session 14 Build

---

## §1 — Purpose and Scope

AgentOS is the MLOps backbone and agent orchestration environment of the SOVEREIGN
Platform. It is the execution layer that all products eventually deploy on or report
to. The Security Framework and CPMI-VRS are embedded in AgentOS as native modules —
agents running in AgentOS inherit platform governance without needing to implement it.

This document defines the Session 14 build scope: the AgentOS scaffold and task
lifecycle core. Session 14 does not build the full A2A communication layer or
the evaluate.py integration — those follow in Session 15+.

**What AgentOS is NOT:**
- A user-facing product (VIGIL is the human-facing surface for agent oversight)
- A replacement for the Security Framework (AgentOS embeds it, not replaces it)
- A new inference provider (that is `sovereign-api-client` Provider B)

---

## §2 — Pipeline Position

AgentOS sits between CPMI and the execution products (NEXUS, APEX) in the pipeline.

```
CPMI (governance) → AgentOS (orchestration) → NEXUS / APEX (execution)
                         ↑
              Embeds: Security Framework + CPMI-VRS
              Hosts: Local LLM runtime (Stage 4)
              Routes: Agent approval requests → VIGIL
```

AgentOS receives governance outputs from CPMI and orchestrates the agents that
execute work in NEXUS and APEX. Every agent action that requires human authorization
routes through the VIGIL Agent Approval Queue (already built — Session 10).

---

## §3 — Session 14 Scope: Scaffold + Task Lifecycle Core

### 3.1 module-agentos Scaffold

New workspace package `module-agentos` following the same pattern as `module-cpmi`.

```
module-agentos/
├── package.json
├── src/
│   ├── index.ts              ← SovereignModuleContract, PLATFORM_ADMIN gate
│   ├── agentos-contract.ts   ← Task, TaskStatus, AgentAssignment shapes
│   ├── task-registry.ts      ← TaskRegistry — create, assign, track tasks
│   ├── useTaskRegistry.ts    ← hook, Logger emission
│   ├── agent-dispatcher.ts   ← routes tasks to registered agents
│   ├── useAgentDispatcher.ts ← hook, approval-request port wiring
│   ├── approval-port.ts      ← injectable AgentOSApprovalPort (wires to VIGIL)
│   ├── AgentOSApp.tsx        ← module root, tabbed surface
│   ├── TaskRegistryPanel.tsx ← task list, status, assignment
│   └── AgentDispatchPanel.tsx ← dispatch controls, approval queue status
├── tests/
└── tsconfig.json
```

### 3.2 Task Lifecycle

The core of Session 14 is the task lifecycle — the state machine that governs how
a task moves from creation to completion within AgentOS.

```
CREATED → ASSIGNED → PENDING_APPROVAL → APPROVED → IN_PROGRESS → COMPLETE
                           ↓
                        REJECTED → CANCELLED
```

**State transitions:**

| From | To | Trigger | Logger Event |
|---|---|---|---|
| CREATED | ASSIGNED | Agent dispatcher assigns agent | `AGENTOS_TASK_ASSIGNED` |
| ASSIGNED | PENDING_APPROVAL | Task requires human authorization | `AGENTOS_APPROVAL_REQUESTED` |
| PENDING_APPROVAL | APPROVED | VIGIL approval received | `AGENTOS_TASK_APPROVED` |
| PENDING_APPROVAL | REJECTED | VIGIL rejection received | `AGENTOS_TASK_REJECTED` |
| APPROVED | IN_PROGRESS | Agent begins execution | `AGENTOS_TASK_STARTED` |
| IN_PROGRESS | COMPLETE | Agent signals completion | `AGENTOS_TASK_COMPLETE` |
| Any | CANCELLED | Project Principal cancels | `AGENTOS_TASK_CANCELLED` |

Every transition emits a Logger event carrying `workflow_step_id` and
`decision_type` where a human decision is involved.

### 3.3 Task Shape

```typescript
interface Task {
  task_id: string;
  title: string;
  description: string;
  assigned_agent_id?: string;
  status: TaskStatus;
  requires_approval: boolean;
  data_classification: ClearanceLevel;
  created_at: string;
  updated_at: string;
  workflow_step_id: string;
}
```

`data_classification` on tasks drives which inference provider handles any AI work
within the task — uses the existing `ClearanceLevel` type (Constraint #2, same as
Session 13).

### 3.4 Agent Dispatcher

The agent dispatcher routes tasks to registered agents based on agent class and
capability. For Session 14, the dispatcher uses a synthetic/dev backing — the
real agent execution (calling agents, receiving completions) is future work.

```typescript
interface AgentAssignment {
  task_id: string;
  agent_id: string;
  agent_class: string;
  assigned_at: string;
  requires_approval: boolean;
}
```

When `requires_approval: true`, the dispatcher submits an `AgentApprovalRequest`
to VIGIL via the injectable `AgentOSApprovalPort`. This is the live wiring of the
VIGIL Agent Approval Queue that was built in Session 10 and left with a synthetic
port — Session 14 provides the real port from AgentOS's side.

### 3.5 VIGIL Approval Port (Live Wiring)

Session 10 built the VIGIL Agent Approval Queue with an injectable
`AgentApprovalPort`. Session 14 provides the AgentOS implementation of that port
— closing the A2A loop between AgentOS and VIGIL.

```typescript
// AgentOS side — implements the port VIGIL already accepts
const agentOSApprovalPort: AgentApprovalPort = {
  submitRequest: (request: AgentApprovalRequest) => {
    // Routes to VIGIL Agent Approval Queue
    // Emits AGENTOS_APPROVAL_REQUESTED Logger event
  },
  getDecision: (request_id: string) => {
    // Polls for VIGIL decision
    // Returns approved / rejected / pending
  }
};
```

This is **configuration, not a rewrite** (Constraint #3) — VIGIL's approval queue
already exists and accepts this interface. AgentOS simply provides the real
implementation of the port.

---

## §4 — Shell Contract Change: v1.6 → v1.7

**New SovereignEventType values:**
- `AGENTOS_TASK_ASSIGNED`
- `AGENTOS_APPROVAL_REQUESTED`
- `AGENTOS_TASK_APPROVED`
- `AGENTOS_TASK_REJECTED`
- `AGENTOS_TASK_STARTED`
- `AGENTOS_TASK_COMPLETE`
- `AGENTOS_TASK_CANCELLED`

**New HumanDecisionType values:**
- `TASK_APPROVAL` — human approves an agent task via VIGIL
- `TASK_CANCELLATION` — human cancels a task

**Governance process (Constraint #8):**
1. Version increment: v1.6 → v1.7
2. Changelog: GD-9 — AgentOS task lifecycle events
3. Impact assessment: module-agentos only for new event types;
   HumanDecisionType additions require `@sovereign/data` shared-types
   propagation (Constraint #11) — 13 → 15 members
4. SHA-256 verify both copies after change — record v1.7 hash
5. This document serves as pre-approval; Claude Code confirms before touching

---

## §5 — Codebase Facts for Session 14

**From Session 13 (must know):**
- Real types: `SovereignRequestContext` / `SovereignLLMResponse` / `ClearanceLevel`
- `createSovereignClient()` unchanged — use `routedComplete()` for classified routing
- `sovereign-api-client` is commonjs — use `process.env`, not `import.meta.env`
- `SovereignEventType` not mirrored in shared-types — only HumanDecisionType is

**From Session 10 (VIGIL Agent Approval Queue):**
- `AgentApprovalPort` is injectable in `module-vigil/src/approval-port.ts`
- The port interface is already defined — AgentOS provides the implementation
- `AGENT_ACTION_APPROVED` / `AGENT_ACTION_REJECTED` events already in shell-contract v1.6
- `vigil-approval-agent` is implemented and registered

**Shell contract v1.6 hash:** `99e47b10…01c8af`
**Shell contract change this session:** v1.6 → v1.7 (GD-9) — do D1 first

---

## §6 — Session 14 Done Condition

**D1 — Shell Contract v1.6 → v1.7 (GD-9, do first)**
- Add 7 `AGENTOS_*` event types to `SovereignEventType`
- Add `TASK_APPROVAL` and `TASK_CANCELLATION` to `HumanDecisionType`
- Version increment, changelog (GD-9), impact assessment
- Propagate HumanDecisionType additions to `sovereign-data/src/shared-types.ts`
  (13 → 15 members) + update test (Constraint #11)
- SHA-256 verify both copies — record v1.7 hash
- Do not proceed to D2 until verified

**D2 — AgentOS Module**
- `module-agentos` workspace package, `SovereignModuleContract`,
  `PLATFORM_ADMIN` structural gate, mounts via `register-modules.ts`
- Task lifecycle state machine (7 states, all transitions, all Logger events)
- Task registry with `useTaskRegistry` hook, Gate 2 fail-closed
- Agent dispatcher with synthetic/dev backing
- VIGIL approval port — live implementation of `AgentApprovalPort`
  (closes the A2A loop from Session 10)
- `AgentOSApp.tsx`, `TaskRegistryPanel.tsx`, `AgentDispatchPanel.tsx`
- Full test coverage

**Close requirements (standard):**
- Full test suite — all JS suites + Python
- `tsc --noEmit` — sovereign-shell + module-agentos
- `npm audit --omit=dev` — zero production vulnerabilities
- Both shell-contract copies SHA-256 identical at v1.7 hash
- Commit D1 and D2 separately; push
- Session 14 Handoff + SBOM_Session14_Update.md

---

## §7 — What Session 14 Does NOT Build

These are future sessions:
- Real agent execution (calling agents, receiving completions)
- A2A message passing between agents
- evaluate.py pipeline integration
- MLflow experiment tracking
- Live NEXUS or APEX agent registration

Session 14 builds the skeleton and the governance wiring. The agents that run
inside that skeleton are registered in their respective product build sessions.

---

*SOVEREIGN Platform · 11_AgentOS_Architecture.md · v1.0 · June 24, 2026*
*Pre-Decisional · Internal Working Document*

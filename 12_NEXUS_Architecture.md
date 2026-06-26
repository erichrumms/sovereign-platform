# NEXUS Module — Architecture Document
## Document ID: 12_NEXUS_Architecture.md | Version 1.0 | June 24, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Parent Brief:** SOVEREIGN Platform Integration Brief v1.22
**Status:** Documented post-build (Session 15 built from opening prompt spec;
this document records the as-built architecture for future sessions)

---

## §1 — Purpose and Scope

NEXUS is the work intake and routing product of the SOVEREIGN Platform. It is the
first primary product that runs inside AgentOS — receiving work requests from human
operators, classifying them by type, routing them to the appropriate agents via
AgentOS, and tracking them through the AgentOS task lifecycle.

**What NEXUS is:** Work intake surface · Request router · Status dashboard · GD-10 enforcement point

**What NEXUS is NOT:** A replacement for AgentOS · A governance engine · An analytics product

---

## §2 — Pipeline Position

```
FLOWPATH → CPMI (governance) → AgentOS (orchestration) → NEXUS (intake/routing)
```

NEXUS submits tasks via AgentOSPort. AgentOS routes to VIGIL for approvals.
NEXUS polls for status.

---

## §3 — Work Request Shape

```typescript
interface WorkRequest {
  request_id: string;
  title: string;
  description: string;
  request_type: WorkRequestType;
  submitted_by: string;
  submitted_at: string;
  data_classification: ClearanceLevel;  // UNCLASSIFIED only per GD-10
  priority: 'P1' | 'P2' | 'P3';
  status: WorkRequestStatus;
  task_id?: string;
  workflow_step_id: string;
}

type WorkRequestType =
  | 'DOCUMENT_REVIEW'
  | 'DATA_ANALYSIS'
  | 'COMPLIANCE_CHECK'
  | 'REPORT_GENERATION'
  | 'GOVERNANCE_QUERY';

type WorkRequestStatus =
  | 'SUBMITTED'
  | 'ROUTED'
  | 'PENDING_APPROVAL'
  | 'IN_PROGRESS'
  | 'COMPLETE'
  | 'REJECTED';
```

---

## §4 — Work Request Lifecycle

Approval path (COMPLIANCE_CHECK, GOVERNANCE_QUERY):
```
SUBMITTED → ROUTED → PENDING_APPROVAL → IN_PROGRESS → COMPLETE
                            ↓
                         REJECTED
```

Non-approval path (DOCUMENT_REVIEW, DATA_ANALYSIS, REPORT_GENERATION):
```
SUBMITTED → ROUTED → IN_PROGRESS → COMPLETE
```

All transitions emit GD-11 Logger events with workflow_step_id.

---

## §5 — Request Router

| WorkRequestType | Agent Class | Approval Required |
|---|---|---|
| DOCUMENT_REVIEW | Analytical | No |
| DATA_ANALYSIS | Analytical | No |
| COMPLIANCE_CHECK | Governance | **Yes** |
| REPORT_GENERATION | Operational | No |
| GOVERNANCE_QUERY | Governance | **Yes** |

---

## §6 — AgentOS Port

```typescript
interface AgentOSPort {
  submitTask: (request: WorkRequest) => Promise<string>; // returns task_id
  getTaskStatus: (task_id: string) => Promise<TaskStatus>;
}
```

Injectable — synthetic/dev backing in Session 15. Live backing by configuration (Constraint #3).

---

## §7 — Shell Contract Events (GD-11, v1.8)

NEXUS_REQUEST_SUBMITTED · NEXUS_REQUEST_ROUTED · NEXUS_APPROVAL_PENDING ·
NEXUS_REQUEST_IN_PROGRESS · NEXUS_REQUEST_COMPLETE · NEXUS_REQUEST_REJECTED

No HumanDecisionType additions — TASK_APPROVAL (v1.7) covers the approval event.

---

## §8 — Module Configuration

- minimumRole: AGENT_OPERATOR (nearest existing role; no OPERATOR role in taxonomy)
- agentCards: empty — NEXUS owns no agents
- GD-10 enforcement: non-UNCLASSIFIED requests rejected at intake

---

## §9 — Files Built (Session 15)

```
module-nexus/src/
  index.ts · nexus-contract.ts · request-registry.ts · useRequestRegistry.ts
  request-router.ts · agentos-port.ts · NexusApp.tsx
  RequestIntakePanel.tsx · RequestQueuePanel.tsx · RequestDetailPanel.tsx
tests/ — 48 tests
```

---

*SOVEREIGN Platform · 12_NEXUS_Architecture.md · v1.0 · June 24, 2026*
*As-built documentation — Session 15 · Pre-Decisional · Internal Working Document*

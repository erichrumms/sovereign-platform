# SOVEREIGN Platform — Agent Identity Standard
## Version 1.3 | June 24, 2026
### Updated: AgentOS orchestrator agents registered (pre-Session 15)

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Agent_Identity_Standard.md v1.2 (June 23, 2026)

---

## Purpose

This document is the authoritative registry of all agents in the SOVEREIGN Platform.
No agent may be instantiated in code, referenced in a prompt, or registered in AgentOS
without first appearing in this registry.

---

## Agent Classes

| Class | Description |
|---|---|
| **Analytical** | Reads, reasons, produces structured assessments. Takes no action. |
| **Operational** | Executes governed workflows. Produces canonical data objects. |
| **Governance** | Issues certifications, attestations, or compliance records. Human attestation required for consequential outputs. |
| **Monitoring** | Observes platform events, surfaces anomalies or recommendations. Human-gated response. |
| **Orchestration** | Manages agent task assignment, routing, and lifecycle. Does not execute tasks directly. |

---

## Registered Agents

### Core Platform Agents — AgentOS

Three AgentOS orchestrator agents registered June 24, 2026 in advance of Session 15.
`module-agentos.agentCards` is currently empty (Constraint #10 — code cannot precede
registry). Adding these to the registry unblocks their AgentCard registration in
Session 15.

| Agent ID | Class | Scope | Status |
|---|---|---|---|
| `agentos.deployer` | Orchestration | Routes and assigns deployment tasks to registered agents. Submits approval requests to VIGIL for tasks requiring authorization. Does not execute deployments directly. | **Register Session 15** |
| `agentos.exporter` | Orchestration | Routes and assigns data export tasks. Submits approval requests to VIGIL. Does not execute exports directly. | **Register Session 15** |
| `agentos.configurator` | Orchestration | Routes and assigns configuration tasks. Submits approval requests to VIGIL for configuration changes requiring authorization. | **Register Session 15** |

**AgentOS orchestrator scope limits:**
- No orchestrator agent executes tasks directly — they route and assign only
- All consequential actions route through VIGIL Agent Approval Queue
- No orchestrator agent issues governance certifications
- `requires_approval` flag determines VIGIL routing — set by task type, not agent

### Core Platform Agents — CPMI

| Agent ID | Class | Status |
|---|---|---|
| `cpmi.reasoning-chain` | Governance (RE_EXECUTE) | Implemented — Session 11 |
| `cpmi.world-model-api` | Operational | Implemented — Session 11 |
| `cpmi.vrs-certification` | Governance | Implemented — Session 11 |

### Core Platform Agents — Other Products

No other core platform agents registered through Session 14. Agents for NEXUS,
APEX, FLOWPATH, and ARIA Suite registered in their respective product build sessions.

---

### Companion Suite Agents

| Agent ID | Module | Class | Status |
|---|---|---|---|
| `counsel-analyst` | COUNSEL | Analytical | Implemented |
| `scribe-drafter` | SCRIBE | Operational | Implemented |
| `scribe-style-analyst` | SCRIBE | Analytical | Implemented |
| `vigil-triage-analyst` | VIGIL | Monitoring | Implemented |
| `vigil-approval-agent` | VIGIL | Monitoring | Implemented |
| `lens-explainer` | LENS | Analytical | Implemented |
| `lens-orientation` | LENS | Analytical | Registered — scaffold only |

**Total registered: 3 AgentOS + 3 CPMI + 7 companion = 13 agents**

---

## Governance

Every new agent registration requires:
1. Entry in this document before any build work begins (Constraint #10)
2. A registered prompt — or explicit record that the agent uses no prompt
   (AgentOS orchestrators use no AI reasoning prompt — they are routing logic)
3. Agent class declared and justified
4. Project Principal acknowledgment before the session that implements it

---

## Version History

| Version | Date | Changed |
|---|---|---|
| v1.0 | May 2026 | Initial standard |
| v1.1 | June 23, 2026 | Companion suite agents; lens-explainer corrected to Analytical |
| v1.2 | June 23, 2026 | CPMI agents restored (pre-Session 11) |
| **v1.3** | **June 24, 2026** | **Three AgentOS orchestrator agents registered (pre-Session 15, Constraint #10)** |

---

*SOVEREIGN Platform Agent Identity Standard v1.3 · June 24, 2026*
*Pre-Decisional · Internal Working Document*

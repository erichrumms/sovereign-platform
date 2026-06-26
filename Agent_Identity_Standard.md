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

---

# Agent Identity Standard — APEX Module Additions
## Append to Agent_Identity_Standard.md

**Session:** Session 17 Pre-Build Registration
**Date:** June 25, 2026
**Approved by:** Project Principal
**Scope:** Two new agent identities — APEX (2)

---

## APEX Agents

### apex.ai-assistant

| Field | Value |
|---|---|
| `agent_id` | `apex.ai-assistant` |
| Module | `module-apex` |
| Product | APEX — Analytics and Program Executive Suite |
| Agent Class | Analytical |
| Registered | 2026-06-25 |
| Registered By | Project Principal |
| Status | REGISTERED — build may proceed |

**Description:** The LLM-backed analysis agent for APEX. Receives a structured
context packet containing the CPMI World Model record, reasoning chain history,
AgentOS task records, and governance decisions for a given program. Produces a
structured `ApexAnalysisOutput` object containing a plain-prose status narrative,
risk findings with DC-3 provenance fields, and human-addressed recommendations.
All LLM calls route through `createSovereignClient()`. One analysis run per report
generation request — no chained calls, no parallel requests.

**Prompt:** PR-APEX-001 (approved by Project Principal June 25, 2026)

**Logger events:** `APEX_ANALYSIS_STARTED`, `APEX_ANALYSIS_COMPLETE`

**Data classification:** Platform-level audit data. Program analysis records
accessible to authorized platform administrators.

**Monitoring tier:** Standard (not enhanced — APEX is an
cat >> ~/Developer/sovereign-platform/Agent_Identity_Standard.md << 'ENDOFENTRIES'

---

# Agent Identity Standard — APEX Module Additions
## Append to Agent_Identity_Standard.md

**Session:** Session 17 Pre-Build Registration
**Date:** June 25, 2026
**Approved by:** Project Principal
**Scope:** Two new agent identities — APEX (2)

---

## APEX Agents

### apex.ai-assistant

| Field | Value |
|---|---|
| `agent_id` | `apex.ai-assistant` |
| Module | `module-apex` |
| Product | APEX — Analytics and Program Executive Suite |
| Agent Class | Analytical |
| Registered | 2026-06-25 |
| Registered By | Project Principal |
| Status | REGISTERED — build may proceed |

**Description:** The LLM-backed analysis agent for APEX. Receives a structured
context packet containing the CPMI World Model record, reasoning chain history,
AgentOS task records, and governance decisions for a given program. Produces a
structured `ApexAnalysisOutput` object containing a plain-prose status narrative,
risk findings with DC-3 provenance fields, and human-addressed recommendations.
All LLM calls route through `createSovereignClient()`. One analysis run per report
generation request — no chained calls, no parallel requests.

**Prompt:** PR-APEX-001 (approved by Project Principal June 25, 2026)

**Logger events:** `APEX_ANALYSIS_STARTED`, `APEX_ANALYSIS_COMPLETE`

**Data classification:** Platform-level audit data. Program analysis records
accessible to authorized platform administrators.

**Monitoring tier:** Standard (not enhanced — APEX is an analytics product,
not a governance engine).

**Scope constraint:** `apex.ai-assistant` produces advisory analysis only. It does
not modify any upstream data, does not make governance decisions, and does not
invoke other agents. Every analysis run produces either a valid `ApexAnalysisOutput`
or logs a structured error.

---

### apex.report-generator

| Field | Value |
|---|---|
| `agent_id` | `apex.report-generator` |
| Module | `module-apex` |
| Product | APEX — Analytics and Program Executive Suite |
| Agent Class | Operational |
| Registered | 2026-06-25 |
| Registered By | Project Principal |
| Status | REGISTERED — build may proceed |

**Description:** The document assembly agent for APEX. Takes a valid
`ApexAnalysisOutput` from `apex.ai-assistant` and produces a formatted report
artifact (MSR, QPR, or program dossier). Does not call the LLM — performs
deterministic structured document assembly from governed data objects. Enforces
the `sovereignHold()` gate before any document is produced. Logs
`REPORT_GENERATION_HELD` if hold is active.

**Prompt:** None — deterministic document assembly, no LLM calls.

**Logger events:** `APEX_REPORT_GENERATED`, `APEX_DOSSIER_EXPORTED`,
`REPORT_GENERATION_HELD`, `APEX_EVENT_RECEIVED`

**Data classification:** Platform-level audit data.

**Monitoring tier:** Standard.

**Scope constraint:** `apex.report-generator` assembles documents only. It does
not perform analysis, does not call the LLM, and does not export any document
until `sovereignHold()` returns false and human attestation (`REPORT_ATTESTATION`)
is logged.

---

## Updated Agent Count — 18 Total

| `agent_id` | Module | Class | LLM-Backed | Status |
|---|---|---|---|---|
| `apex.ai-assistant` | module-apex | Analytical | Yes | Registered |
| `apex.report-generator` | module-apex | Operational | No | Registered |

*All prior agents (16) remain active. APEX additions bring total to 18.*

---

*Agent Identity Standard — APEX Module Additions*
*Session 17 Pre-Build Registration · June 25, 2026*
*Approved by Project Principal*
*Pre-Decisional · Internal Working Document*

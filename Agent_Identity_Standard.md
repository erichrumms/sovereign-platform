# SOVEREIGN Platform — Agent Identity Standard
## Version 1.1 | June 23, 2026
### Updated: lens-explainer class corrected Operational → Analytical (Session 8)

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Agent_Identity_Standard.md (v1.0, updated Session 7)

---

## Purpose

This document is the authoritative registry of all agents in the SOVEREIGN Platform.
No agent may be instantiated in code, referenced in a prompt, or registered in AgentOS
without first appearing in this registry. Every agent has a unique ID, a declared class,
an owning module, and an implementation status.

---

## Agent Classes

| Class | Description |
|---|---|
| **Analytical** | Reads, reasons, and produces structured assessments. Takes no action on platform systems. |
| **Operational** | Executes governed workflows. Produces canonical data objects (e.g. drafts, records). |
| **Monitoring** | Observes platform events and surfaces anomalies, alerts, or recommendations. Human-gated response. |

---

## Registered Agents

### Core Platform Agents

*No core platform agents registered through Session 8. Core platform agents
(NEXUS, CPMI, APEX, FLOWPATH, AgentOS, ARIA Suite) will be registered in their
respective product build sessions.*

---

### Companion Suite Agents

| Agent ID | Module | Class | Prompt | Status | Session Registered |
|---|---|---|---|---|---|
| `counsel-analyst` | COUNSEL | Analytical | PR-COUNSEL-001/002/003 | **Implemented** | Session 4 |
| `scribe-drafter` | SCRIBE | Operational | PR-SCRIBE-001 (+ synthesis/framing) | **Implemented** | Session 5 |
| `scribe-style-analyst` | SCRIBE | Analytical | PR-SCRIBE-004 | **Implemented** | Session 6 |
| `vigil-triage-analyst` | VIGIL | Monitoring | PR-VIGIL-001 | **Implemented** | Session 7 |
| `vigil-approval-agent` | VIGIL | Monitoring | — | Registered only — deferred | Session 7 |
| `lens-explainer` | LENS | **Analytical** | PR-LENS-001 | **Implemented — Session 8** | Session 7 (scaffold) → Session 8 (core) |
| `lens-orientation` | LENS | Analytical | PR-LENS-002 (not authored) | Registered only — scaffold | Session 7 |

**Total registered: 7 companion suite agents**

---

## Notes

**`lens-explainer` class:** Registered as Operational in the Session 7 scaffold.
Corrected to Analytical in Session 8 — an explainer that reads source documents and
produces explanations takes no action on platform systems. Class correction applied
in `module-lens/src/index.ts` agent card, prompt file header, and this registry.

**`vigil-approval-agent`:** Registered in Session 7. Implementation deferred to the
VIGIL Agent Approval flow build session. Do not build or wire until that session opens.

**`lens-orientation`:** Registered in Session 7 scaffold. PR-LENS-002 not yet authored.
Pipeline Navigator (the orientation surface) is a static render requiring no LLM call —
PR-LENS-002 is deferred indefinitely unless a live orientation agent is later wanted.

**`scribe-drafter` prompt scope:** PR-SCRIBE-001 was approved for the drafting engine
and explicitly scopes synthesis/framing as intermediate prose modes. PR-SCRIBE-002/003
(dedicated synthesis/framing prompts) are optional and not yet authored. Re-binding
the intermediate engine to dedicated prompts when authored is a registry change, not
a rewrite.

---

## Governance

Every new agent registration requires:
1. Entry in this document before any build work begins (Constraint #10)
2. A registered prompt (Constraint #9) — or explicit record that the agent uses no prompt
3. Agent class declared and justified
4. Project Principal acknowledgment before the session that implements it

Agent self-registration (Claude Code adding an agent without Claude Chat governance
record) is a constraint violation.

---

*SOVEREIGN Platform Agent Identity Standard v1.1 · June 23, 2026*
*Pre-Decisional · Internal Working Document*

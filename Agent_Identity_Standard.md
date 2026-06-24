# SOVEREIGN Platform — Agent Identity Standard
## Version 1.2 | June 23, 2026
### Updated: Three CPMI core platform agents registered (Session 11 pre-build)

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Agent_Identity_Standard.md v1.1 (June 23, 2026)

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
| **Operational** | Executes governed workflows. Produces canonical data objects. |
| **Governance** | Issues certifications, attestations, or compliance records. Requires human attestation for consequential outputs. |
| **Monitoring** | Observes platform events and surfaces anomalies, alerts, or recommendations. Human-gated response. |

---

## Registered Agents

### Core Platform Agents — CPMI

Three CPMI agents registered June 23, 2026 in advance of Session 11 build.
All three were defined in Agent_Identity_Standard.md v1.0 (May 2026) but not
carried forward into v1.1. This version restores them to the registry.

| Agent ID | Class | Accountable Human | Permitted Actions | Credential | Status |
|---|---|---|---|---|---|
| `cpmi.reasoning-chain` | Analytical / Governance | Project Principal (CPMI Product Owner) | Execute 6-step reasoning chain; issue CPMI-VRS Gate 1–2 records automatically; flag Gate 3–4 for human action. Approval behavior: `RE_EXECUTE` — restarts full chain after Gate 3 human approval. | Anthropic API key (via shell) | **Register Session 11** |
| `cpmi.world-model-api` | Operational | Project Principal | Serve world model queries to other products; update world model on human approval only. Never updates world model autonomously. | Notion API key (via shell) | **Register Session 11** |
| `cpmi.vrs-certification` | Governance | Project Principal | Issue VRS certificates after all four CPMI-VRS gate conditions are met and human approvals are recorded. Cannot self-certify. Cannot issue partial certifications. | Notion API key (via shell) | **Register Session 11** |

**CPMI agent scope limits:**
- CPMI agents operate under enhanced monitoring (0.7× anomaly threshold) — architectural constant.
- No CPMI agent modifies its own governance parameters.
- No CPMI agent issues a Gate 3 or Gate 4 certification without a logged human attestation.
- `cpmi.reasoning-chain` produces; humans attest. Gate 3 attestation carries `decision_type: GATE_3_ATTESTATION`.
- `cpmi.world-model-api` updates the world model only on explicit human approval carrying `decision_type: WORLD_MODEL_UPDATE`.

### Core Platform Agents — Other Products

No other core platform agents registered through Session 11. Agents for NEXUS,
APEX, FLOWPATH, AgentOS, and ARIA Suite will be registered in their respective
product build sessions before any build work begins (Constraint #10).

---

### Companion Suite Agents

| Agent ID | Module | Class | Prompt | Status | Session Registered |
|---|---|---|---|---|---|
| `counsel-analyst` | COUNSEL | Analytical | PR-COUNSEL-001/002/003 | **Implemented** | Session 4 |
| `scribe-drafter` | SCRIBE | Operational | PR-SCRIBE-001 (+ synthesis/framing) | **Implemented** | Session 5 |
| `scribe-style-analyst` | SCRIBE | Analytical | PR-SCRIBE-004 | **Implemented** | Session 6 |
| `vigil-triage-analyst` | VIGIL | Monitoring | PR-VIGIL-001 | **Implemented** | Session 7 |
| `vigil-approval-agent` | VIGIL | Monitoring | PR-VIGIL-002 | **Implemented** | Session 10 |
| `lens-explainer` | LENS | Analytical | PR-LENS-001 | **Implemented** | Session 8 |
| `lens-orientation` | LENS | Analytical | PR-LENS-002 (not authored) | Registered — scaffold only | Session 7 |

**Total registered: 3 CPMI core platform agents + 7 companion suite agents = 10 agents**

---

## Notes

**`cpmi.reasoning-chain` approval behavior:** `RE_EXECUTE` — the reasoning chain
restarts after a Gate 3 human approval. Rationale: the world model may update
during the review period; a stale reasoning chain certified by a fresh approval
creates a governance risk. The reasoning chain is inexpensive to re-run; the
governance risk of a stale chain is not.

**`cpmi.world-model-api` Stage 3 scope:** World model API is scaffolded with a
synthetic/dev backing in Session 11. Live Notion API connection activates by
configuration in a later session — no rewrite required (Constraint #3).

**`lens-explainer` class:** Corrected from Operational to Analytical in Session 8.
An explainer that reads source documents and produces explanations takes no action
on platform systems.

**`vigil-approval-agent`:** Implemented Session 10. Registered in Session 7.

**`scribe-drafter` prompt scope:** PR-SCRIBE-001 was approved for the drafting
engine and explicitly scopes synthesis/framing as intermediate prose modes.
PR-SCRIBE-002/003 are optional and not yet authored.

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

## Credential Lifecycle

Agent credentials are issued by the Project Principal only. Credentials are
injected at runtime by the sovereign-shell (for cloud agents) or by the AgentOS
orchestrator (for local agents). They are never stored in code files, configuration
files, or prompt files. Every agent credential is reviewed on a 90-day cycle.

---

## Anomaly Response Process

When the SOVEREIGN Anomaly Detector flags an agent's behavior:

1. **Isolate** — remove from active registry; log `AGENT_ISOLATED`
2. **Investigate** — review Logger history for preceding 24 hours
3. **Root cause** — prompt change, model update, adversarial input, or data shift
4. **Remediate** — roll back prompt, update benchmarks, implement input validation
5. **Re-authorize** — Project Principal explicitly re-authorizes; logged to audit trail
6. **Document** — incident record added to this standard

---

## Version History

| Version | Date | Changed |
|---|---|---|
| v1.0 | May 2026 | Initial standard — all six product agents defined |
| v1.1 | June 23, 2026 | Companion suite agents added; `lens-explainer` corrected to Analytical; `vigil-approval-agent` implemented |
| **v1.2** | **June 23, 2026** | **Three CPMI core platform agents restored to registry (`cpmi.reasoning-chain`, `cpmi.world-model-api`, `cpmi.vrs-certification`) — required before Session 11 D2 build begins (Constraint #10)** |

---

*SOVEREIGN Platform Agent Identity Standard v1.2 · June 23, 2026*
*Pre-Decisional · Internal Working Document*

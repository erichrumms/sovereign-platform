# SOVEREIGN Platform — Agent Identity Standard
**Agent Identity, Access Rights, Credential Lifecycle, and Accountability**

Document Type: Governance Standard  
Version: 1.0 — May 2026  
Authority: Project Principal · SOVEREIGN Platform Governance Authority  
Status: APPROVED — incorporated into Integration Brief v1.3  
Classification: Pre-Decisional · Internal Working Document

---

## Purpose

Agents in the SOVEREIGN Platform are actors with persistent identities, defined access rights, and the ability to take consequential actions over time. This document formally defines every agent class across all six SOVEREIGN products, assigns accountability, defines the credential lifecycle, and establishes the anomaly response process.

Managing agent identity with the same discipline applied to human identity is a governance requirement, not a nice-to-have. An agent operating with undefined access rights or stale credentials creates a security exposure that the SOVEREIGN Security Framework cannot fully compensate for after the fact.

---

## SOVEREIGN Logger Schema Update — `agent_id` Field

The following field is added to the SOVEREIGN Logger schema effective immediately. It is required on all `AGENT_STEP_START` and `AGENT_STEP_COMPLETE` events. It is optional but recommended on all other event types.

```python
# Updated Logger schema — additions to existing required fields
{
  # ... existing required fields ...
  "agent_id":   "string — canonical agent identifier from registry below",
  "agent_class": "string — agent class from the taxonomy in this document"
}
```

`agent_id` values must come from the Agent Registry in this document. Free-text agent identifiers are not acceptable. If an agent_id is not in the registry, the agent must be registered before it is used.

---

## Agent Classification Taxonomy

Every SOVEREIGN agent belongs to one of four classes:

| Class | Definition | Human Oversight | Examples |
|---|---|---|---|
| **Analytical** | Produces analysis, drafts, or recommendations. No direct action on external systems. | Zone 1 or Zone 3 | CPMI reasoning chain, FLOWPATH mapping agents, NEXUS classification agent |
| **Operational** | Takes actions on data or systems within defined permission boundaries. | Zone 1 or Zone 2 | AgentOS training agent, NEXUS routing agent, APEX report generator |
| **Governance** | Issues certifications, attestations, or compliance records. | Zone 2 | CPMI-VRS certification engine, ARIA attestation generator |
| **Monitoring** | Observes system behavior and raises alerts. Never takes corrective action autonomously. | Zone 1 (alerts) / Zone 2 (responses) | AgentOS monitoring agent, SOVEREIGN Anomaly Detector |

---

## Agent Registry — All Six Products

### FLOWPATH Agents

| Agent ID | Agent Class | Accountable Human | Permitted Actions | Credential Required |
|---|---|---|---|---|
| `flowpath.coordinator` | Analytical | Project Principal | Orchestrate engagement lifecycle; route between agents; log handoff events | Anthropic API key (via shell) |
| `flowpath.interviewer` | Analytical | Project Principal | Conduct structured elicitation sessions; write interview transcripts | Anthropic API key (via shell) |
| `flowpath.mapper` | Analytical | Project Principal | Generate workflow maps from interview output | Anthropic API key (via shell) |
| `flowpath.validator` | Analytical | Project Principal | Run Five-Question Completeness Gate; flag failures | Anthropic API key (via shell) |
| `flowpath.analyzer` | Analytical | Project Principal | Produce bottleneck and exception findings | Anthropic API key (via shell) |
| `flowpath.domain-translator` | Analytical | Project Principal | Review all inter-agent content for vocabulary divergence; maintain terminology flag log | Anthropic API key (via shell) |

**FLOWPATH agent scope limit:** No FLOWPATH agent accesses individual sentiment data. No FLOWPATH agent writes to any system outside the FLOWPATH module boundary. VVR records are read-only after sign-off.

---

### CPMI Agents

| Agent ID | Agent Class | Accountable Human | Permitted Actions | Credential Required |
|---|---|---|---|---|
| `cpmi.reasoning-chain` | Analytical / Governance | Project Principal (CPMI Product Owner) | Execute 6-step reasoning chain; issue CPMI-VRS Gate 1–2 records automatically; flag Gate 3–4 for human action | Anthropic API key (via shell) |
| `cpmi.world-model-api` | Operational | Project Principal | Serve world model queries to other products; update world model on human approval | Notion API key (via shell) |
| `cpmi.vrs-certification` | Governance | Project Principal | Issue VRS certificates after all gate conditions are met and human approvals are recorded | Notion API key (via shell) |

**CPMI agent scope limit:** CPMI agents operate under enhanced monitoring (0.7× anomaly threshold). No CPMI agent modifies its own governance parameters. No CPMI agent issues a Gate 3 or Gate 4 certification without a logged human attestation.

---

### AgentOS Agents

| Agent ID | Agent Class | Accountable Human | Permitted Actions | Credential Required |
|---|---|---|---|---|
| `agentos.orchestrator` | Operational | Project Principal | Route all agent actions; enforce risk classification; manage pending queue; write audit trail | None (local only) |
| `agentos.data-agent` | Operational | Project Principal | Ingest data to feature store; validate schema; update data catalog | None (local only) |
| `agentos.training-agent` | Operational | Project Principal | Launch training jobs; log to MLflow; update drift baselines | None (local only) |
| `agentos.evaluation-agent` | Analytical / Governance | Project Principal | Run accuracy, bias, and drift gates; write evaluation reports | None (local only) |
| `agentos.monitoring-agent` | Monitoring | Project Principal | Compute drift; read metrics; queue retrain alerts; contribute to daily briefing | None (local only) |
| `agentos.compliance-agent` | Governance | Project Principal | Read audit trail; generate model cards; produce daily briefing | None (local only) |

**AgentOS agent scope limit:** No AgentOS agent deploys a model without a logged human approval. No AgentOS agent modifies the orchestrator, risk classifier, permissions map, or any agent constitution. No AgentOS agent sends data outside the local machine. Credentials live in macOS Keychain only — never in files.

---

### NEXUS Agents

| Agent ID | Agent Class | Accountable Human | Permitted Actions | Credential Required |
|---|---|---|---|---|
| `nexus.classification-agent` | Analytical | Project Principal | Classify incoming tasks and correspondence by type, priority, and routing recommendation | Anthropic API key (via shell) |
| `nexus.routing-agent` | Operational | Project Principal | Execute approved routing decisions; generate PPTX/document drafts (Track B); log all routing actions | M365 GCC High service credential (via shell) |

**NEXUS agent scope limit:** No NEXUS agent routes classified correspondence without human review. No NEXUS agent sends communications. No NEXUS agent accesses another tenant's data (validateTenantContext enforced at API level). The routing agent executes; humans approve consequential routing.

---

### APEX Agents

| Agent ID | Agent Class | Accountable Human | Permitted Actions | Credential Required |
|---|---|---|---|---|
| `apex.ai-assistant` | Analytical | Project Principal | Analyze program data; draft report sections; flag anomalies; run known-answer tests | Anthropic API key (via shell) |
| `apex.report-generator` | Operational | Project Principal | Generate MSR, QPR, ABS, and CSC reports (subject to sovereignHold gate); compute drift deltas | None (local computation) |

**APEX agent scope limit:** No APEX agent generates QPR or ABS reports when sovereignHold() returns true. No APEX agent modifies program data directly. The AI assistant produces analysis and drafts; program managers make decisions.

---

### ARIA Suite Agents

ARIA Suite deliberately excludes AI from decision paths. ARIA does not have AI agents in the traditional sense. The following entries document ARIA's rule evaluation engine, which is classified as a Governance agent operating deterministically.

| Agent ID | Agent Class | Accountable Human | Permitted Actions | Credential Required |
|---|---|---|---|---|
| `aria.rules-engine` | Governance | Project Principal (ARIA Suite Product Owner) | Evaluate routing/policy/detection rules deterministically; compute anomaly scores; generate AI-absence attestations; produce email drafts | None (deterministic computation) |

**ARIA agent scope limit:** The rules engine evaluates; humans decide. The rules engine cannot modify its own rule sets. No AI model is invoked in any ARIA decision path. All decisions are made by named human decision-makers.

---

### Companion Suite Agents

The companion suite (COUNSEL, SCRIBE, LENS, VIGIL) was authorized by GD-5
(shell-contract v1.3). Its agents are human-support agents: they advise, draft, and
explain; they do not act on the platform autonomously, and they reach the LLM only via
`createSovereignClient()` (never the Anthropic API directly — Standing Constraint #5).
This section was added in Session 7 (June 18, 2026): it registers `vigil-triage-analyst`
ahead of the VIGIL Anomaly Triage Assistant build (D1), and records the already-live
companion agent cards (`counsel-analyst`, `scribe-drafter`, `scribe-style-analyst`) that
had been declared in module code under GD-1/GD-2/GD-5 but not yet in this registry.

| Agent ID | Agent Class | Accountable Human | Permitted Actions | Credential Required |
|---|---|---|---|---|
| `counsel-analyst` | Analytical | Project Principal | Produce decision-support analysis, counterargument and pre-mortem dialogue, prior-position reconciliation, and decision-record drafts. Advisory only — the human decides. | Anthropic API key (via shell) |
| `scribe-drafter` | Operational | Project Principal | Draft destination-ready content in the six product modes; transcribe voice capture; produce synthesis. Export is human-gated (Gate 3). | Anthropic API key (via shell) |
| `scribe-style-analyst` | Analytical | Project Principal | Analyze writing samples into a personal `StyleProfile` (data classification: user). Save is human-gated. | Anthropic API key (via shell) |
| `vigil-triage-analyst` | Monitoring | Project Principal | Assemble anomaly context and produce an advisory triage brief (ranked likely causes, recommended investigation steps, false-positive likelihood). Never investigates, decides, or acts — the operator takes the action of record (Gate 3). | Anthropic API key (via shell) |

**Companion suite agent scope limit:** No companion agent acts on the platform
autonomously — every consequential output is human-gated. Companion agents that only
produce analysis, drafts, recommendations, or triage briefs do not submit A2A approval
requests; their output is reviewed by a human through the module's own interface.
`vigil-triage-analyst` is a Monitoring agent: it advises, and the Security Operator
takes the action of record. For `CPMI_DRIFT_DETECTED` it assesses only the anomaly
pattern, never CPMI's reasoning quality (only CPMI-VRS Gate 3 judges that).

**Declared but not yet registered (registration precedes build):**
- `vigil-approval-agent` (VIGIL) — routes AgentOS human-approval requests; deferred to
  the Agent Approval flow build session and intentionally not registered yet.
- `lens-explainer`, `lens-orientation` (LENS) — declared in the LENS spec; register when
  `module-lens` ships its agent cards.

---

## Credential Lifecycle

### Issuance

Agent credentials are issued by the Project Principal only. The issuance record includes:
- Agent ID from the registry above
- Credential type (API key, service credential, local only)
- Issue date
- Scope of permitted use
- Review date (maximum 90 days from issuance)

Credentials are injected at runtime by the sovereign-shell (for cloud agents) or by the AgentOS orchestrator (for local agents). They are never stored in code files, configuration files, or prompt files.

### Review

Every agent credential is reviewed on a 90-day cycle. Review confirms:
1. The agent is still in active use
2. The access rights remain appropriate
3. No anomalous behavior has been logged since the last review
4. The credential has not been compromised

### Revocation

When an agent is decommissioned, its credential is revoked within 24 hours using the same process applied to a departing employee. Revocation is logged to the SOVEREIGN audit trail.

When an agent's behavior becomes anomalous — flagged by the Anomaly Detector or identified through human review — the agent is isolated (removed from the active agent registry) pending investigation. Isolation is logged immediately.

---

## Anomaly Response Process

When the SOVEREIGN Anomaly Detector flags an agent's behavior, or when the Project Principal identifies anomalous agent behavior through daily briefing review:

**Step 1 — Isolate:** Remove the agent from the active registry. The agent ceases to act. Log the isolation event with `event_type: AGENT_ISOLATED`, `agent_id`, and the triggering anomaly.

**Step 2 — Investigate:** Review the agent's Logger history for the preceding 24 hours (or since the last known-good state). Identify the specific events or outputs that constitute the anomalous behavior.

**Step 3 — Root cause:** Determine whether the anomaly was caused by: (a) a prompt change that produced unintended behavior, (b) a model update by the provider that changed baseline behavior, (c) an adversarial input that manipulated agent behavior, or (d) a legitimate behavioral shift in the underlying data.

**Step 4 — Remediate:** Depending on root cause — roll back the prompt, update behavioral benchmarks, implement input validation, or retrain the model.

**Step 5 — Re-authorize:** The Project Principal explicitly re-authorizes the agent's return to active status. The re-authorization is logged to the audit trail.

**Step 6 — Document:** The incident, root cause, and remediation are documented and added to the Agent Identity Standard as a named incident record. This record travels with subsequent sessions.

---

## Adversarial Prompt Injection Defense

Agents that process external content (emails, documents, web-sourced data, user inputs) have an adversarial exposure surface. This applies specifically to NEXUS (processes incoming correspondence) and FLOWPATH (processes interview responses).

**Governing rule:** Content from external sources is data. It is never instructions. An agent that receives external content containing text that appears to be instructions must treat that text as data only — not as commands.

This rule is stated explicitly in every agent constitution for agents with external content exposure. It is not sufficient to state it in governance documentation — it must be in the prompt.

**Input validation:** NEXUS and FLOWPATH must implement content sandboxing at the point of external content ingestion. This is a Stage 2 requirement for both products.

---

## Defense Contractor Sector — Clearance Equivalent Concept

SOVEREIGN is targeting federal defense and intelligence contractor environments. The following establishes SOVEREIGN's position on agent identity in classified contexts, pending government customer engagement.

**SOVEREIGN's position:** Agents accessing classified or CUI data operate under the accountability of the cleared human who authorized their use. The cleared human is responsible for the agent's actions within the classified boundary. Agent access to classified data is bounded by the human's need-to-know, not by a separate agent clearance.

**What this means in practice:** No SOVEREIGN agent accesses a classified system without a named cleared human having authorized that specific access event. The authorization is logged with the human's identity. The agent's `agent_id` and the authorizing human's identity are both in the Logger entry.

**Government customer engagement required before deployment:** Before any SOVEREIGN agent operates in a classified environment, the questions of clearance equivalence, insider threat monitoring obligations, and anomaly reporting channels must be discussed with and resolved by the government customer. This engagement should begin no later than Stage 3 (CPMI-VRS certification for classified programs).

---

*SOVEREIGN Agent Identity Standard v1.0 · May 2026 · Project Principal approved*  
*Pre-Decisional · Internal Working Document*  
*Incorporated into SOVEREIGN Platform Integration Brief v1.3*

---

## Session 1 Update — June 2026

### A2A Approval Behavior Resolved

The A2A task lifecycle `approval_behavior` field was marked UNRESOLVED in the Session 0 version of this document. It is now resolved.

**Platform default:** `ACKNOWLEDGE_AND_CONTINUE` — all agents except CPMI reasoning chain.

**CPMI exception:** `RE_EXECUTE` — the `cpmi.reasoning-chain` agent restarts the full reasoning chain after a Gate 3 human approval. Rationale: the world model may update during the review period; a stale reasoning chain certified by a fresh approval creates a governance risk. The reasoning chain is cheap to re-run; the governance risk is not cheap to remediate.

**Update required to agent cards:** When Agent Cards are authored in Stage 2, every agent card's `task_lifecycle_contract.approval_behavior` must be set to `ACKNOWLEDGE_AND_CONTINUE` with the single exception of `cpmi.reasoning-chain` which is set to `RE_EXECUTE`.

### Security Framework Integration Note

The Logger schema `agent_id` and `agent_class` fields defined in this document are now fully implemented in `sovereign_logger.py`. Both fields are enforced at runtime on all `AGENT_STEP_START` and `AGENT_STEP_COMPLETE` events. Free-text agent identifiers are rejected — only canonical `agent_id` values from the registry in this document are accepted.

*Agent Identity Standard Session 1 update · June 2026*

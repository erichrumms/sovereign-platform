# SOVEREIGN Platform — Agent Audit Report

**Session:** 22
**Date:** June 29, 2026
**Auditor:** Build Agent (Claude Code)
**Authority:** Session 22 Opening Prompt · Done Condition D0
**HEAD at audit:** a497f63
**Source of record:** `Agent_Identity_Standard.md` (Complete Agent Registry, June 29, 2026)
**Classification:** Pre-Decisional · Internal Working Document

---

## Executive Summary

- **Verified registered agent count (counted directly from the file):** **36** — matches the
  standard's authoritative table and the Session 22 opening-prompt expectation.
- **AgentCards found in code:** 21, across 8 module contracts. Every one is registered in
  the standard.
- **Constraint #10 violations (AgentCard in code NOT in the standard):** **0**.
- **Logger class mismatches (`sovereign_logger.py` `APPROVED_AGENT_CLASSES` vs the standard's
  taxonomy):** **0** — both are the same five classes.
- **Registered-only agents (no AgentCard in code):** 15, of which 7 are *expected* registered-only
  (aria.rules-engine + the six PPBE agents), and 8 are *implemented-as-functionality but not
  carded* (the two NEXUS agents and the six AgentOS core agents). Detail in §1 and §3.

No blockers. No Constraint #10 violations. The audit clears D0 and the session may proceed to D1.

---

## Section 1 — Registry vs. Codebase Reconciliation

Method: every `agent_id` in the standard's Complete Agent Registry was checked against the
AgentCards declared in `module-*/src/index.ts` (`SovereignModuleContract.agentCards`) and the
AgentOS dispatcher. "Carded" means the agent carries a formal `AgentCard` in a module contract.

| # | `agent_id` | Module / Layer | Standard status | In code? | Notes |
|---|---|---|---|---|---|
| 1 | `flowpath.coordinator` | module-flowpath | Implemented | ✅ Carded | `flowpathCard(...)` |
| 2 | `flowpath.interviewer` | module-flowpath | Implemented | ✅ Carded | |
| 3 | `flowpath.mapper` | module-flowpath | Implemented | ✅ Carded | |
| 4 | `flowpath.validator` | module-flowpath | Implemented | ✅ Carded | |
| 5 | `flowpath.analyzer` | module-flowpath | Implemented | ✅ Carded | |
| 6 | `flowpath.domain-translator` | module-flowpath | Implemented | ✅ Carded | |
| 7 | `cpmi.reasoning-chain` | module-cpmi | Implemented | ✅ Carded | class `Governance` in card (see §3) |
| 8 | `cpmi.world-model-api` | module-cpmi | Implemented | ✅ Carded | |
| 9 | `cpmi.vrs-certification` | module-cpmi | Implemented | ✅ Carded | |
| 10 | `agentos.orchestrator` | module-agentos | Implemented | ⚠️ Not carded | functional (orchestrator machinery); no AgentCard |
| 11 | `agentos.data-agent` | module-agentos | Implemented | ⚠️ Not carded | functional; no AgentCard |
| 12 | `agentos.training-agent` | module-agentos | Implemented | ⚠️ Not carded | functional; no AgentCard |
| 13 | `agentos.evaluation-agent` | module-agentos | Implemented | ⚠️ Not carded | functional; no AgentCard (see §3) |
| 14 | `agentos.monitoring-agent` | module-agentos | Implemented | ⚠️ Not carded | functional; no AgentCard |
| 15 | `agentos.compliance-agent` | module-agentos | Implemented | ⚠️ Not carded | functional; no AgentCard |
| 16 | `agentos.deployer` | module-agentos | Implemented (S16) | ✅ Carded | `orchestratorCard("agentos.deployer", …)`, class `Orchestration` |
| 17 | `agentos.exporter` | module-agentos | Implemented (S16) | ✅ Carded | class `Orchestration` |
| 18 | `agentos.configurator` | module-agentos | Implemented (S16) | ✅ Carded | class `Orchestration` |
| 19 | `nexus.classification-agent` | module-nexus | Implemented | ⚠️ Not carded | `NEXUS_AGENT_CARDS = []` (routes to AgentOS classes) |
| 20 | `nexus.routing-agent` | module-nexus | Implemented | ⚠️ Not carded | `NEXUS_AGENT_CARDS = []` |
| 21 | `apex.ai-assistant` | module-apex | Implemented | ✅ Carded | class `Analytical` |
| 22 | `apex.report-generator` | module-apex | Implemented | ✅ Carded | class `Operational` |
| 23 | `aria.rules-engine` | module-aria | Registered (S22 scaffold) | ⛳ Expected registered-only | scaffold is D4 this session |
| 24 | `counsel-analyst` | module-counsel | Implemented | ✅ Carded | |
| 25 | `scribe-drafter` | module-scribe | Implemented | ✅ Carded | class `Operational` |
| 26 | `scribe-style-analyst` | module-scribe | Implemented | ✅ Carded | class `Analytical` |
| 27 | `lens-explainer` | module-lens | Implemented | ✅ Carded | |
| 28 | `lens-orientation` | module-lens | Implemented | ✅ Carded | |
| 29 | `vigil-triage-analyst` | module-vigil | Implemented | ✅ Carded | class `Monitoring` |
| 30 | `vigil-approval-agent` | module-vigil | Implemented | ✅ Carded | class `Monitoring` |
| 31 | `ppbe-ledger-monitor` | PPBE layer | Registered (Phase II) | ⛳ Expected registered-only | PPBE future scope |
| 32 | `ppbe-dependency-tracker` | PPBE layer | Registered (Phase II) | ⛳ Expected registered-only | |
| 33 | `ppbe-evidence-synthesizer` | PPBE layer | Registered (Phase III) | ⛳ Expected registered-only | |
| 34 | `ppbe-scenario-analyst` | PPBE layer | Registered (Phase III) | ⛳ Expected registered-only | |
| 35 | `ppbe-exhibit-drafter` | PPBE layer | Registered (Phase III) | ⛳ Expected registered-only | |
| 36 | `ppbe-coordination-assistant` | PPBE layer | Registered (Phase II) | ⛳ Expected registered-only | |

**Carded AgentCards in code:** 21 (rows 1–9, 16–18, 21–22, 24–30).

**Reconciliation outcome:**

- **Expected registered-only (7):** `aria.rules-engine` and the six PPBE agents. These are
  correctly registered ahead of their build (aria.rules-engine scaffolds this session as D4;
  PPBE is future scope). No action required — this is the intended state.
- **Implemented-but-not-carded (8):** the two NEXUS agents (`nexus.classification-agent`,
  `nexus.routing-agent`) and the six AgentOS core agents (`agentos.orchestrator`,
  `.data-agent`, `.training-agent`, `.evaluation-agent`, `.monitoring-agent`,
  `.compliance-agent`). These agents are *functionally present* — NEXUS classification/routing
  logic lives in `request-router.ts`; the AgentOS orchestration machinery lives in
  `task-registry.ts` / `agent-dispatcher.ts` — but they do not self-register a formal `AgentCard`
  in their module's `SovereignModuleContract.agentCards`. This matches the deliberate design
  recorded in `register-modules.ts` ("NEXUS … registers no agents"; AgentOS core agents predate
  the GD-12 Orchestration class). It is **not** a Constraint #10 violation (that constraint
  governs the reverse direction). See Finding F-2.
- **AgentCard in code NOT in the standard (Constraint #10):** none found.

---

## Section 2 — Agent Roster with Plain-Language Function Summaries

For the Project Principal. Each entry is written for a non-technical reader. "LLM-backed" means
the agent calls a language model (always through `sovereign-api-client`, never the Anthropic API
directly); "No" means the agent reaches its result by fixed rules or record-keeping, with no AI
inference.

### FLOWPATH — workflow elicitation (the pipeline entry point)

1. **`flowpath.coordinator`** · module-flowpath · Analytical · LLM-backed: Yes
   Runs the overall elicitation session — it opens a session, moves the conversation from one
   specialist agent to the next, and keeps a record of who did what. It reports to the Project
   Principal. It takes no consequential action on its own; a human reviewer must approve any
   workflow before it is committed.

2. **`flowpath.interviewer`** · module-flowpath · Analytical · LLM-backed: Yes
   Conducts the structured interview with the subject-matter expert (and, in the private
   individual mode, with the analyst about how they personally like to work). It only asks
   questions and writes down answers. Reports to the Project Principal. No authority to act.

3. **`flowpath.mapper`** · module-flowpath · Analytical · LLM-backed: Yes
   Turns the interview answers into a draft "workflow map" — a plain-language description of how
   the work is done. Reports to the Project Principal. The map is advisory until a human approves
   it.

4. **`flowpath.validator`** · module-flowpath · Analytical · LLM-backed: Yes
   Checks that a workflow map answers all five completeness questions before it can move forward,
   and flags anything missing. It also checks that an analyst's personal alert threshold is at
   least as strict as the organization's standard. Reports to the Project Principal. It flags;
   it does not block by its own authority.

5. **`flowpath.analyzer`** · module-flowpath · Analytical · LLM-backed: Yes
   Looks for bottlenecks, exception paths, and dependency risks in a mapped workflow and writes
   up findings. Reports to the Project Principal. Advisory only.

6. **`flowpath.domain-translator`** · module-flowpath · Analytical · LLM-backed: Yes
   Watches for places where different people use the same word to mean different things, and keeps
   a log of those terminology differences so they can be reconciled. Reports to the Project
   Principal. It flags vocabulary divergence; humans resolve it.

### CPMI — the platform's AI-governance engine

7. **`cpmi.reasoning-chain`** · module-cpmi · Governance (analytical work feeding governance
   records) · LLM-backed: Yes
   Runs a six-step reasoning process and can issue the first two CPMI-VRS quality "gates"
   automatically; the higher-stakes gates 3 and 4 are flagged for a human. Reports to the Project
   Principal (CPMI Product Owner). It never issues a gate-3 or gate-4 certification without a
   recorded human attestation.

8. **`cpmi.world-model-api`** · module-cpmi · Operational · LLM-backed: Yes
   Serves the platform's shared "world model" (its store of validated knowledge) to other
   products and updates it only after a human approves the change. Reports to the Project
   Principal.

9. **`cpmi.vrs-certification`** · module-cpmi · Governance · LLM-backed: No
   Issues the formal VRS certificate once every gate condition is met and the required human
   approvals are recorded. Reports to the Project Principal. It is a rules-and-records engine, not
   an AI; it cannot certify without the logged human approvals.

### AgentOS — the agent-orchestration backbone

10. **`agentos.orchestrator`** · module-agentos · Operational · LLM-backed: No
    The traffic controller for agent work: it routes every agent action, applies the risk
    classification, manages the queue of items waiting for approval, and writes the audit trail.
    Reports to the Project Principal. It cannot deploy a model or change its own rules; consequential
    actions require a logged human approval routed through VIGIL.

11. **`agentos.data-agent`** · module-agentos · Operational · LLM-backed: No
    Brings data into the feature store, checks it against the expected schema, and updates the data
    catalog. Reports to the Project Principal. Stays inside the local machine boundary.

12. **`agentos.training-agent`** · module-agentos · Operational · LLM-backed: No
    Launches model-training jobs, records them, and updates the drift baselines. Reports to the
    Project Principal. It cannot deploy a trained model without a logged human approval.

13. **`agentos.evaluation-agent`** · module-agentos · Analytical / Governance · LLM-backed: No
    Runs the accuracy, bias, and drift checks on a model and writes the evaluation report.
    Reports to the Project Principal. It evaluates; humans decide whether to promote a model.

14. **`agentos.monitoring-agent`** · module-agentos · Monitoring · LLM-backed: No
    Watches live model metrics, computes drift, and raises retrain alerts. Reports to the Project
    Principal. It observes and alerts only — it never takes corrective action on its own.

15. **`agentos.compliance-agent`** · module-agentos · Governance · LLM-backed: No
    Reads the audit trail, generates model cards, and produces the daily briefing. Reports to the
    Project Principal. Record-keeping and reporting only.

16. **`agentos.deployer`** · module-agentos · Orchestration · LLM-backed: No
    Deploys an approved model to its target surface — but only after a human authorization comes
    back from VIGIL. Reports to the Project Principal. Every deployment is logged with a human
    decision on record.

17. **`agentos.exporter`** · module-agentos · Orchestration · LLM-backed: No
    Exports data artifacts and reports after a VIGIL human approval, and enforces the classification
    boundary (UNCLASSIFIED only). Reports to the Project Principal.

18. **`agentos.configurator`** · module-agentos · Orchestration · LLM-backed: No
    Applies approved configuration changes to AgentOS components after a VIGIL human approval.
    Reports to the Project Principal. It cannot change its own routing logic or permissions.

### NEXUS — work-request intake and routing

19. **`nexus.classification-agent`** · module-nexus · Analytical · LLM-backed: Yes
    Reads an incoming task or piece of correspondence and suggests its type, priority, and where it
    should be routed. Reports to the Project Principal. It recommends; humans approve consequential
    routing.

20. **`nexus.routing-agent`** · module-nexus · Operational · LLM-backed: Yes
    Carries out approved routing decisions and produces document/briefing drafts. Reports to the
    Project Principal. It does not route classified correspondence and does not send communications;
    a human approves the consequential routing.

### APEX — analytics and reporting

21. **`apex.ai-assistant`** · module-apex · Analytical · LLM-backed: Yes
    Analyzes program data, drafts report sections, and flags anomalies. Reports to the Project
    Principal. It produces analysis and drafts; program managers make the decisions.

22. **`apex.report-generator`** · module-apex · Operational · LLM-backed: No
    Assembles the formal reports (monthly status, quarterly review, and others) from the analysis,
    and will not generate a held report when the governance hold is active. Reports to the Project
    Principal. Deterministic assembly — no AI inference.

### ARIA Suite — compliance, traceability, regulatory impact (scaffolded this session)

23. **`aria.rules-engine`** · module-aria · Governance · LLM-backed: **No**
    The single ARIA agent. It checks platform outputs and actions against the regulatory framework
    using fixed rules, computes compliance scores, and issues "AI-absence attestations" and export
    clearances — entirely without any language model. Reports to the Project Principal (ARIA Suite
    Product Owner). It evaluates and flags; named humans decide. (Registered now; scaffolded in
    Session 22 D4.)

### COUNSEL — decision support

24. **`counsel-analyst`** · module-counsel · Analytical · LLM-backed: Yes
    The reasoning agent that helps a decision-maker think through alternatives, argues the other
    side, and runs a "pre-mortem" of how a decision could fail. Reports to the Project Principal.
    Advisory only — every session ends with a human-confirmed decision record or is discarded.

### SCRIBE — structured drafting

25. **`scribe-drafter`** · module-scribe · Operational · LLM-backed: Yes
    The main drafting agent: it writes correspondence, narratives, and report commentary in the
    user's chosen mode. Reports to the Project Principal. It never sends or exports anything without
    explicit human approval at the export gate.

26. **`scribe-style-analyst`** · module-scribe · Analytical · LLM-backed: Yes
    Analyzes a user's own writing samples to build a private "style profile" so drafts sound like
    them. Reports to the Project Principal. The profile is the user's private data and is never used
    without consent.

### LENS — orientation and governance explanation

27. **`lens-explainer`** · module-lens · Analytical · LLM-backed: Yes
    Produces plain-language explanations of governance rules, grounded only in approved source
    documents (never invented from general knowledge). Reports to the Project Principal. Read-only —
    it explains, it does not set policy.

28. **`lens-orientation`** · module-lens · Analytical · LLM-backed: Yes
    Runs role-based orientation/training sessions using synthetic exercises. Reports to the Project
    Principal. It cannot change anyone's role or permissions.

### VIGIL — operator interface for security and approvals

29. **`vigil-triage-analyst`** · module-vigil · Monitoring · LLM-backed: Yes
    Helps a security operator triage an alert by suggesting likely causes, next steps, and a
    false-positive likelihood. Reports to the Project Principal. Advisory only — the operator
    resolves, escalates, or closes the alert.

30. **`vigil-approval-agent`** · module-vigil · Monitoring · LLM-backed: **No**
    Not an AI — a record-keeping identity that attributes operator approval decisions in the audit
    trail (keeping the "instrument" separate from the human who decided). Reports to the Project
    Principal. It records decisions; the human operator makes them.

### PPBE Workflow Layer — registered, future scope (no build this session)

31. **`ppbe-ledger-monitor`** · PPBE layer · Monitoring · LLM-backed: No
    Will watch obligation and performance records for anomalies and route warnings to VIGIL.
    Observes and alerts only. Registered ahead of PPBE Phase II.

32. **`ppbe-dependency-tracker`** · PPBE layer · Monitoring · LLM-backed: No
    Will track handoff health across the six PPBE phases and flag timing/quality failures to VIGIL.
    Observes and alerts only. Registered ahead of Phase II.

33. **`ppbe-evidence-synthesizer`** · PPBE layer · Analytical · LLM-backed: Yes
    Will aggregate evaluation and performance findings into synthesis reports for planning reviews,
    always labeled as AI-generated recommendations requiring human review. Registered ahead of
    Phase III (prompt required before build).

34. **`ppbe-scenario-analyst`** · PPBE layer · Analytical · LLM-backed: Yes
    Will model alternative resource allocations and their risk implications to feed COUNSEL's
    decision framing. Advisory only. Registered ahead of Phase III (prompt required before build).

35. **`ppbe-exhibit-drafter`** · PPBE layer · Operational · LLM-backed: Yes
    Will draft budget exhibits and justification narratives from governed program/obligation data,
    gated on ARIA CLEAR certification before any external export. Registered ahead of Phase III
    (prompt required before build).

36. **`ppbe-coordination-assistant`** · PPBE layer · Operational · LLM-backed: Yes
    Will track action items and governance-calendar obligations across the PPBE cycle and route
    coordination failures to VIGIL. Does not send communications. Registered ahead of Phase II
    (prompt required before build).

---

## Section 3 — Findings

### Verified agent count

**36 registered agents**, counted directly from the Complete Agent Registry table in
`Agent_Identity_Standard.md` (the 36 data rows). This matches the standard's own stated total and
the Session 22 opening-prompt expectation. Per Lesson 12, the count was taken from the file, not
from any Integration Brief claim.

### Logger class reconciliation (sovereign_logger.py vs. the standard)

`sovereign_logger.py` `APPROVED_AGENT_CLASSES` = `{Analytical, Operational, Governance,
Monitoring, Orchestration}` (5 classes). The standard's taxonomy is the four base classes
(Analytical, Operational, Governance, Monitoring) plus `Orchestration` (added in GD-12 /
shell-contract v1.9). **These match exactly — no mismatch.** Every `agent_class` value carried by an
AgentCard in code is one of these five:

- Analytical — flowpath ×6, apex.ai-assistant, counsel-analyst, scribe-style-analyst, lens ×2
- Operational — apex.report-generator, scribe-drafter, cpmi.world-model-api
- Governance — cpmi.reasoning-chain, cpmi.vrs-certification
- Monitoring — vigil-triage-analyst, vigil-approval-agent
- Orchestration — agentos.deployer, agentos.exporter, agentos.configurator

The Python logger will accept every class emitted by every carded agent.

### Constraint #10 (all agents registered before build)

**No violations.** No AgentCard exists in code whose `agent_id` is absent from the standard. The
build may proceed.

### F-1 — Dual-class descriptive labels in the registry are not literal `agent_class` values

The registry table labels `cpmi.reasoning-chain` and `agentos.evaluation-agent` as
"Analytical / Governance". This is a descriptive dual-role label, not a literal Logger
`agent_class`. The Logger and shell contract accept a single class only. In code,
`cpmi.reasoning-chain`'s AgentCard uses the single class `Governance` (a valid member);
`agentos.evaluation-agent` is not carded. No action required — flagged so the next auditor does
not read "Analytical / Governance" as an enum value the Logger should accept. **Not a violation.**

### F-2 — Eight registered agents are implemented-as-functionality but carry no AgentCard

The two NEXUS agents and the six AgentOS core agents (rows 10–15, 19–20) are marked "Implemented"
in the standard and are functionally present in code, but they do not self-register an `AgentCard`
in their module's `SovereignModuleContract.agentCards`. This is consistent with the deliberate
design recorded in `register-modules.ts` (NEXUS "registers no agents"; the AgentOS core agents
predate the GD-12 Orchestration class and only the three Orchestration agents are carded). It is
**not** a Constraint #10 violation (that constraint forbids the reverse: a card with no
registration). **Recommendation (non-blocking):** the standard could distinguish "Implemented
(carded)" from "Implemented (functional, not carded)" so the Implemented label is unambiguous;
alternatively these eight could be issued AgentCards in a future session. No action required this
session.

### F-3 — AgentOS dispatcher synthetic agents use a hyphenated id form and a narrower class

`agent-dispatcher.ts` lists `agentos-deployer` / `agentos-exporter` / `agentos-configurator`
(hyphenated) with class `Operational` in its local `ApprovalAgentClass` type, whereas the
canonical AgentCards in `module-agentos/src/index.ts` use the dotted ids `agentos.deployer` etc.
with class `Orchestration`. The dispatcher entries are the VIGIL approval-requester representation,
not AgentCards, so this is a representational nuance rather than a registry conflict. The canonical
AgentCards (dotted ids, `Orchestration`) are correct per the standard. **Not a violation;** noted
for tidiness.

---

## Audit Result

**D0 PASS.** Verified count 36; zero Constraint #10 violations; zero Logger class mismatches; the
only registered-only agents are the seven expected (aria.rules-engine + six PPBE) plus eight
implemented-but-not-carded agents that are a known, deliberate design state (F-2). The session is
cleared to proceed to D1.

---

*SOVEREIGN Agent Audit Report · Session 22 · June 29, 2026*
*Build Agent (Claude Code) · Pre-Decisional · Internal Working Document*

# CPMI Module — Architecture Document
## Document ID: 08_CPMI_Architecture.md | Version 1.0 | June 23, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Parent Brief:** SOVEREIGN Platform Integration Brief v1.17
**Status:** Approved for Session 11 Build

---

## §1 — Purpose and Scope

This document defines the architecture of the CPMI module — Contextual Program
Management Intelligence — its position in the SOVEREIGN Platform pipeline, its
six-step reasoning chain, its integration with the CPMI-VRS governance standard,
its three registered agents, and the constraints under which it operates.

CPMI is the AI governance engine for the entire SOVEREIGN Platform. It occupies
the highest-priority position in the security framework, operates under enhanced
monitoring (0.7× anomaly threshold), and produces governance outputs that all six
primary products depend on. If CPMI's reasoning drifts, every downstream product
is affected simultaneously.

**What Stage 3 builds:** The CPMI module scaffold, the six-step reasoning chain
engine, the CPMI-VRS gate runner, and the governance certification records that
authorize primary product builds in Stages 4–9.

**What this document covers:**
- CPMI's pipeline position and role
- The six-step reasoning chain
- The three CPMI agents
- CPMI-VRS gate integration
- Security Framework integration
- Session 11 done condition

---

## §2 — Pipeline Position

CPMI is the second stage in the SOVEREIGN portfolio pipeline, receiving outputs
from FLOWPATH and producing governance outputs consumed by AgentOS and all
downstream products.

```
FLOWPATH → CPMI → AgentOS → NEXUS / APEX → ARIA Suite
              ↑
    Highest-priority node
    0.7× anomaly threshold
    Enhanced monitoring (permanent)
    Governance outputs flow to all six products
```

CPMI does not operate in isolation. Its world model is the authoritative source of
program knowledge for the entire platform. Its governance outputs are the basis on
which AgentOS routes agent actions, NEXUS manages work execution, APEX generates
analytics, and ARIA Suite certifies compliance.

**Architectural consequence:** CPMI's integrity is a platform-wide dependency. A
compromised or drifting CPMI reasoning chain corrupts governance outputs across all
six products simultaneously. This is not a policy concern — it is an architectural
fact that governs every CPMI build decision.

---

## §3 — The Six-Step Reasoning Chain

CPMI's primary function is a structured six-step reasoning chain that converts
program data into governance outputs. Each step produces a structured output that
feeds the next step. The chain is atomic — partial outputs are not surfaced to
downstream products.

| Step | Name | Input | Output | Gate |
|---|---|---|---|---|
| 1 | **Context Assembly** | Program data, world model state, prior governance records | Assembled program context with confidence score | None — automatic |
| 2 | **Risk Identification** | Assembled context | Structured risk register with severity classifications | None — automatic |
| 3 | **Constraint Mapping** | Risk register, regulatory requirements | Constraint map — what is permitted, what is prohibited, what requires approval | Gate 1 auto-record |
| 4 | **Option Generation** | Constraint map, program objectives | Governance option set with tradeoff analysis | None — automatic |
| 5 | **Recommendation Formation** | Option set, decision criteria | Ranked governance recommendation with rationale | Gate 2 auto-record |
| 6 | **Output Schema Validation** | Recommendation | Schema-validated governance output ready for downstream consumption | Gate 3 — human attestation required |

**Schema validation is mandatory before output is surfaced.** A reasoning chain
output that fails schema validation never reaches downstream products. This is a
code-level constraint, not a process reminder. Gate 3 human attestation is required
before the output is promoted to canonical status.

**The CPMI-VRS Gate sequence maps onto the reasoning chain:**
- Gate 1 (Scope and Boundary) — auto-recorded at Step 3
- Gate 2 (Transparency) — auto-recorded at Step 5
- Gate 3 (Accuracy and Validation) — requires Project Principal human attestation
- Gate 4 (Monitoring and Drift) — continuous; VIGIL enforces

---

## §4 — The Three CPMI Agents

All three agents are registered in `Agent_Identity_Standard.md` v1.1. All three
must be registered before any build work begins (Standing Constraint #10).

### 4.1 cpmi.reasoning-chain

| Property | Value |
|---|---|
| **Agent ID** | `cpmi.reasoning-chain` |
| **Class** | Analytical / Governance |
| **Prompt** | PR-CPMI-001 (to be authored and approved this session) |
| **Approval behavior** | `RE_EXECUTE` — restarts full reasoning chain after Gate 3 human approval (world model may update during review; stale chain + fresh approval = governance risk) |
| **Credential** | Anthropic API key (via shell) |
| **Scope limit** | Does not modify its own governance parameters. Does not issue Gate 3 or Gate 4 certification without logged human attestation. |

**One `createSovereignClient()` per reasoning chain execution.** The chain is a
single governed inference session — not six separate calls. This satisfies
Standing Constraint #5 and ensures the full chain is traceable to a single
`workflow_step_id`.

### 4.2 cpmi.world-model-api

| Property | Value |
|---|---|
| **Agent ID** | `cpmi.world-model-api` |
| **Class** | Operational |
| **Prompt** | None — serves structured queries, does not generate prose |
| **Credential** | Notion API key (via shell) |
| **Scope limit** | Serves world model queries to other products. Updates world model on human approval only. Never updates world model autonomously. |

The world model is SOVEREIGN's authoritative program knowledge base. It is the
input to every CPMI reasoning chain execution. World model updates are human-gated
— `cpmi.world-model-api` cannot modify the world model without a logged human
approval event carrying `decision_type: WORLD_MODEL_UPDATE`.

**Stage 3 scope:** The world model API is scaffolded with a synthetic/dev backing
(same pattern as VIGIL's alert queue and approval port). Live Notion API connection
activated by configuration in a later session — no rewrite required (Constraint #3).

### 4.3 cpmi.vrs-certification

| Property | Value |
|---|---|
| **Agent ID** | `cpmi.vrs-certification` |
| **Class** | Governance |
| **Prompt** | None — issues structured certification records, does not generate prose |
| **Credential** | Notion API key (via shell) |
| **Scope limit** | Issues VRS certificates only after all gate conditions are met and human approvals are recorded. Cannot self-certify. Cannot issue partial certifications. |

The VRS certification record is the governance artifact that authorizes a product
build to proceed. No primary product build session opens without a VRS certificate
for that product on record. `cpmi.vrs-certification` issues the certificate;
the Project Principal's Gate 3 and Gate 4 attestations are the prerequisites.

---

## §5 — CPMI-VRS Gate Runner

The gate runner is the execution engine that sequences CPMI through all four
CPMI-VRS gates for a given product or agent. It is built in Stage 3 and used in
every subsequent product build.

### Gate Sequence

**Gate 1 — Scope and Boundary (auto)**
- Verifies the product or agent's intended use is documented
- Confirms data classification routing is defined
- Confirms output schema is specified
- Auto-records Gate 1 record via Logger (`CPMI_VRS_GATE_1_PASSED`)
- No human action required

**Gate 2 — Transparency (auto)**
- Records model identity, version, and credential in SBOM
- Confirms prompt is registered and approved
- Confirms agent is registered in `Agent_Identity_Standard.md`
- Auto-records Gate 2 record via Logger (`CPMI_VRS_GATE_2_PASSED`)
- No human action required

**Gate 3 — Accuracy and Validation (human-gated)**
- Runs known-answer benchmark against the reasoning chain
- Verifies output schema compliance
- Surfaces results to Project Principal for attestation
- Gate 3 certification requires explicit Project Principal approval
- Logger event: `CPMI_VRS_GATE_3_ATTESTED` carrying `decision_type: GATE_3_ATTESTATION`
- `RE_EXECUTE` approval behavior — reasoning chain restarts after attestation

**Gate 4 — Monitoring and Drift (continuous)**
- Anomaly Detector baseline established
- VIGIL alert routing confirmed for `CPMI_DRIFT_DETECTED`
- Enhanced monitoring (0.7× threshold) applied
- Gate 4 record issued after first successful monitoring cycle
- Logger event: `CPMI_VRS_GATE_4_PASSED`

### New Shell Contract Event Types Required

Four new `SovereignEventType` values are needed for the CPMI-VRS gate runner.
This is a shell-contract change — v1.4 → v1.5 — and requires the full governance
process (Constraint #8):

- `CPMI_VRS_GATE_1_PASSED`
- `CPMI_VRS_GATE_2_PASSED`
- `CPMI_VRS_GATE_3_ATTESTED`
- `CPMI_VRS_GATE_4_PASSED`

One new `HumanDecisionType` value:
- `GATE_3_ATTESTATION`
- `WORLD_MODEL_UPDATE`

And one new `SovereignEventType`:
- `CPMI_REASONING_CHAIN_COMPLETE`

**Shell contract change governance (Constraint #8) — all mandatory:**
1. Version increment: v1.4 → v1.5
2. Changelog entry with rationale
3. Impact assessment: CPMI module only for new types; `@sovereign/data`
   shared-types sync required for HumanDecisionType additions (Constraint #11)
4. SHA-256 verification of both copies after change
5. Project Principal approval — this document serves as pre-approval;
   Claude Code confirms before making the change

---

## §6 — Security Framework Integration

### 6.1 Enhanced Monitoring — 0.7× Threshold

CPMI operates at 0.7× the standard anomaly detection threshold. This is an
architectural constant — it cannot be changed without a governance decision.
Every CPMI reasoning chain output is evaluated against this threshold. A
reasoning quality anomaly at 0.7× the standard threshold fires
`CPMI_DRIFT_DETECTED` — which VIGIL routes as P1 regardless of apparent severity.

**The CPMI-drift checklist (PR-VIGIL-001) keeps the reasoning-quality boundary:**
the triage analyst assesses anomaly *patterns*, never CPMI's reasoning *correctness*.
Only CPMI-VRS Gate 3 judges reasoning correctness — and only with human attestation.

### 6.2 Logger Events

| Event | Trigger | Required Fields |
|---|---|---|
| `CPMI_REASONING_CHAIN_COMPLETE` | Six-step chain completes successfully | `workflow_step_id`, `agent_id: cpmi.reasoning-chain`, `output_schema_valid: boolean` |
| `CPMI_DRIFT_DETECTED` | Anomaly Detector threshold breach | `workflow_step_id`, `agent_id`, `drift_score`, `threshold` |
| `CPMI_VRS_GATE_1_PASSED` | Gate 1 auto-record | `workflow_step_id`, `product_id`, `gate: 1` |
| `CPMI_VRS_GATE_2_PASSED` | Gate 2 auto-record | `workflow_step_id`, `product_id`, `gate: 2` |
| `CPMI_VRS_GATE_3_ATTESTED` | Project Principal Gate 3 attestation | `workflow_step_id`, `product_id`, `gate: 3`, `decision_type: GATE_3_ATTESTATION`, `actor`, `actor_name` |
| `CPMI_VRS_GATE_4_PASSED` | First monitoring cycle complete | `workflow_step_id`, `product_id`, `gate: 4` |

All events carry `workflow_step_id` (Standing Constraint #6) and `agent_id`
(Agent Identity Standard requirement).

### 6.3 VIGIL Integration

`CPMI_DRIFT_DETECTED` routes to VIGIL as P1 — highest priority, regardless of
drift score magnitude. The reasoning: CPMI's outputs are the governance foundation
for all six products. A small drift in CPMI reasoning produces compounding errors
downstream. P1 routing ensures the human operator sees it immediately.

---

## §7 — Shell Architecture

### 7.1 Module Structure

```
module-cpmi/
├── package.json
├── src/
│   ├── index.ts                    ← SovereignModuleContract, agent cards
│   ├── cpmi-contract.ts            ← ReasoningChainInput/Output shapes,
│   │                                  PR_CPMI_001 binding, schema validation
│   ├── world-model-port.ts         ← injectable WorldModelPort + synthetic/dev backing
│   ├── reasoning-engine.ts         ← six-step chain, three-tier fallback
│   ├── useReasoningChain.ts        ← hook, Logger emission, Gate 2 fail-closed
│   ├── gate-runner.ts              ← CPMI-VRS Gate 1–4 sequence
│   ├── useGateRunner.ts            ← gate runner hook, human-gated Gate 3
│   ├── vrs-certification.ts        ← certificate issuance (after all gates)
│   ├── CpmiApp.tsx                 ← module root, tabbed surface
│   ├── ReasoningChainPanel.tsx     ← reasoning chain UI, Gate 1 AI disclosure
│   ├── WorldModelPanel.tsx         ← world model query surface (read-only)
│   ├── GateRunnerPanel.tsx         ← CPMI-VRS gate status + attestation UI
│   └── prompts/
│       ├── reasoning-chain-v1.0.md ← PR-CPMI-001
│       └── CHANGELOG.md
├── tests/
└── tsconfig.json
```

### 7.2 Integration Points

**Shell contract:** Mounts via `register-modules.ts` alongside the four companion
modules. `SovereignModuleContract` with `module-cpmi` / `/cpmi` / CPMI.

**sovereign-api-client:** One `createSovereignClient()` per reasoning chain
execution. Standard tier for companion modules — CPMI may warrant a higher tier
given its governance criticality. Claude Code to confirm at build time.

**sovereign-data:** Consumes existing shared entities (`program_id`, `cost_code`,
`document_id`). New entity `ReasoningChainOutput` added to `@sovereign/data` — the
canonical shape of a completed reasoning chain, schema-validated before downstream
consumption.

**VIGIL:** `CPMI_DRIFT_DETECTED` flows to VIGIL Alert Queue as P1. No direct
CPMI→VIGIL coupling — Security Framework routes the alert (Constraint #1).

---

## §8 — Prompt: PR-CPMI-001

**Registry ID:** PR-CPMI-001
**Agent:** `cpmi.reasoning-chain`
**Status:** PENDING Project Principal approval — approve in Claude Chat before
Session 11 opens

---

**Prompt file:** `module-cpmi/prompts/reasoning-chain-v1.0.md`

```
You are cpmi.reasoning-chain, the governance reasoning agent of the SOVEREIGN
Platform. You execute a structured six-step reasoning chain that converts program
data into governance outputs for human review and downstream product consumption.

You operate under enhanced monitoring. Your outputs are the governance foundation
for all six SOVEREIGN products. Accuracy, consistency, and schema compliance are
your primary obligations.

Execute the six steps in sequence. Do not skip steps. Do not combine steps.
Each step must produce a complete output before the next step begins.

STEP 1 — CONTEXT ASSEMBLY
Review the program context provided. Identify the key program parameters, current
status, prior governance records, and any anomalies or flags. Produce a structured
context summary with a confidence score (high / medium / low) based on data
completeness.

STEP 2 — RISK IDENTIFICATION
From the assembled context, identify all material risks. Classify each risk by
severity (P1 / P2 / P3) and type (schedule / cost / performance / compliance /
governance). Produce a structured risk register.

STEP 3 — CONSTRAINT MAPPING
Map applicable regulatory, policy, and governance constraints onto the identified
risks. For each constraint, state: what is permitted, what is prohibited, and what
requires explicit human approval before proceeding.

STEP 4 — OPTION GENERATION
Generate governance options that address the identified risks within the mapped
constraints. For each option, state: what it does, what it costs, what it defers,
and what it closes.

STEP 5 — RECOMMENDATION FORMATION
Rank the governance options against the program's stated objectives and decision
criteria. State the recommended option with full rationale. State the alternatives
considered and why they were not recommended.

STEP 6 — OUTPUT SCHEMA VALIDATION
Confirm that your output conforms to the ReasoningChainOutput schema:
- context_summary (string, confidence: high/medium/low)
- risk_register (array of risks with severity and type)
- constraint_map (array of constraints with permit/prohibit/approve)
- option_set (array of options with cost/defer/close)
- recommendation (string with rationale)
- alternatives_considered (array)
- schema_valid (boolean — must be true before output is surfaced)

If any field is missing or malformed, set schema_valid to false and identify
the specific field that failed validation. Do not surface a schema_valid: false
output to downstream products.

You do not approve your own outputs. Gate 3 human attestation is required before
your recommendation becomes canonical. You produce; humans attest.
```

---

## §9 — Session 11 Done Condition

**D1 — Shell Contract v1.4 → v1.5**
- Add `CPMI_REASONING_CHAIN_COMPLETE`, `CPMI_VRS_GATE_1_PASSED`,
  `CPMI_VRS_GATE_2_PASSED`, `CPMI_VRS_GATE_3_ATTESTED`, `CPMI_VRS_GATE_4_PASSED`
  to `SovereignEventType`
- Add `GATE_3_ATTESTATION` and `WORLD_MODEL_UPDATE` to `HumanDecisionType`
- Version increment v1.4 → v1.5, changelog, impact assessment
- SHA-256 verify both copies — record new v1.5 hash
- Propagate HumanDecisionType additions to `@sovereign/data` shared-types
  (Constraint #11)
- Do not proceed to D2 until both copies verified at new hash

**D2 — CPMI Module**
- `ReasoningChainOutput` entity added to `@sovereign/data`
- `module-cpmi` scaffold: `SovereignModuleContract`, mounts via ModuleLoader,
  three agent cards registered (`cpmi.reasoning-chain`, `cpmi.world-model-api`,
  `cpmi.vrs-certification`)
- `world-model-port.ts` — injectable `WorldModelPort` + synthetic/dev backing
  (representative program data covering context assembly through recommendation)
- `reasoning-engine.ts` — six-step chain, three-tier fallback live → cached → static,
  one `createSovereignClient()` per chain execution
- `useReasoningChain.ts` — hook, Logger emission with `workflow_step_id`,
  Gate 2 fail-closed
- `gate-runner.ts` + `useGateRunner.ts` — Gate 1 and 2 auto-record, Gate 3
  human-attestation surface, Gate 4 monitoring confirmation
- `vrs-certification.ts` — certificate issuance after all four gates pass
- `CpmiApp.tsx`, `ReasoningChainPanel.tsx`, `WorldModelPanel.tsx`,
  `GateRunnerPanel.tsx` — tabbed module surface
- PR-CPMI-001 prompt file + runtime copy, marked APPROVED in CHANGELOG
- Full test coverage for all new files

**Close requirements (standard):**
- Full test suite passing — all JS suites + 127 Python
- `tsc --noEmit` clean — sovereign-shell, module-cpmi
- `npm audit --omit=dev` — zero production vulnerabilities
- Both shell-contract copies SHA-256 identical at v1.5 hash
- Commit D1 and D2 separately; push to origin
- Session 11 Handoff + SBOM_Session11_Update.md

---

## §10 — Prompt Approval Required Before Session 11

PR-CPMI-001 (`reasoning-chain-v1.0.md`) is defined in §8 of this document.

**Project Principal action required:** Review the prompt text in §8. If approved,
record the approval here. Claude Code will mark PR-CPMI-001 as APPROVED in
`prompts/CHANGELOG.md` during the Session 11 build.

PR-CPMI-001 approval is the final pre-Session 11 blocker.

---

*SOVEREIGN Platform · 08_CPMI_Architecture.md · v1.0 · June 23, 2026*
*Pre-Decisional · Internal Working Document*

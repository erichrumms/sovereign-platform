# SOVEREIGN Platform Integration Brief
## Version 1.29 | June 26, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.28
**Changed this version:** Session 20 complete (June 26, 2026) · GD-18 executed ·
shell-contract v1.12 → v1.13 · FLOWPATH scaffold + Screens 1/2/4 complete ·
E2E Scenario 6 (Stage 5b pipeline) · 1094 total tests · agent count corrected
to 21 · §6, §8, §10, §11, §13, §15, §17, §18, §19 updated ·
Session 21 scope defined · Walkthrough C next after Session 21

---

## §1 — What This Document Is

Mandatory context for every SOVEREIGN Platform development session. Load order:
Integration Brief (current version) → `SOVEREIGN_Agent_to_Agent_Briefing.md` →
`system_prompt.md` → product or companion suite spec → prior session handoff →
`shell-contract.ts`.

Confirm all documents are loaded by name before any build work begins.
Verify shell-contract.ts SHA-256 matches the v1.13 hash of record.

---

## §2 — Platform Definition

SOVEREIGN — six primary products (NEXUS, CPMI, APEX, FLOWPATH, AgentOS, ARIA Suite)
plus four companion modules (COUNSEL, SCRIBE, LENS, VIGIL). Intelligence Layer is
the seventh product — must never be lost.

**Three non-negotiable design outcomes:** Integration reliability · Operational
efficiency · End-to-end security observability.

---

## §3 — Three Shared Infrastructure Layers

**SOVEREIGN Security Observability Framework** — Stage 1 COMPLETE · 142 Python tests.
**CPMI-VRS AI Governance Standard** — Stage 3 COMPLETE · VRS certificate issued and
Gate 3 attested by Project Principal June 25, 2026.
**AgentOS** — Stage 4 COMPLETE · full pipeline built, E2E tested, and Level 1 validated.

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH ✅(5b) → [Intelligence Layer] → CPMI ✅ → AgentOS ✅ → NEXUS ✅ → APEX ✅ → ARIA Suite
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ — COMPLETE
‖ Local LLM: Provider B wired · UNCLASSIFIED-only (GD-10)
‖ A2A: agent-to-agent messaging · synthetic · activates by config
‖ NEXUS→AgentOS: live backing delivered · UI convergence pending shell-contract decision
‖ PPBE: workflow layer · governance decisions pending · integration Session 22
```

---

## §5 — Governance Role Assignments (Permanent)

| Role | Assigned To | Status |
|---|---|---|
| CPMI Product Owner | Project Principal | Stage 3 COMPLETE |
| ARIA Suite Product Owner | Project Principal | UNBLOCKED |
| Data Owner / Steward | Project Principal | Active |
| Agent Operator | Project Principal | R3 CLOSED |

---

## §6 — Standing Development Constraints (Invariant)

1. No independent security, governance, or audit systems
2. No shared entity field-name divergence — use `ClearanceLevel` not `DataClassification`
3. No rewrite debt — connections are configuration changes
4. Every human decision event carries `decision_type`
5. No direct LLM API calls — `createSovereignClient()` only
6. `workflow_step_id` on every Logger event
7. Shell context frozen at eight exports
8. `shell-contract.ts` —
   **v1.13 · SHA-256: `2a3f0b9d8f390c30e23816e4e928cbcd02ccd59f765294f8ed247d9c75d18569`**
   *(Retired: v1.12 · `61594a698da07a4a748259fe23cf2be03d8e6aeaea5c72502f04e0d3e246dfe3`)*
9. All prompts registered before build — **14 APPROVED**
10. All agents registered before build — **21 registered** (all AgentCards active)
11. **Five synced copies of shared artifacts** — propagate all changes

**Codebase facts every session must know:**
- Real types: `SovereignRequestContext` / `SovereignLLMResponse` / `ClearanceLevel`
- `createSovereignClient()` unchanged — use `routedComplete()` for routing
- `sovereign-api-client` compiles commonjs — use `process.env`, not `import.meta.env`
- **Exception:** ESM modules using Vite (module-cpmi, module-apex, module-flowpath) use
  the isolated `anthropic-key.ts` / `import.meta.env` pattern with a jest stub
- `SovereignEventType` NOT mirrored in `sovereign-data/src/shared-types.ts`
- NEXUS `minimumRole` is `AGENT_OPERATOR`; APEX `minimumRole` is `PLATFORM_ADMIN`
- FLOWPATH `minimumRole` is `AGENT_OPERATOR`
- GD-10: UNCLASSIFIED only — enforced at api-client AND NEXUS intake
- `sovereignHold()` does not exist — use `ctx.governance.isOnHold(product)`
- PPBE reserved field names: `fiscal_year`, `lifecycle_cost_estimate`,
  `obligation_plan`, `performance_baseline` — never use in ProgramRecord extensions
- `createAgentOSBackedPort` (module-agentos) is the live NEXUS→AgentOS port —
  injectable by configuration; NEXUS default uses synthetic port pending Item 57
- **Approved UI pattern:** white content cards (`#ffffff`, `1px solid #e2e8f0`)
  on light page canvas (`#f1f5f9`) — applied in APEX (Session 19) and FLOWPATH
  (Session 20); apply to all future products from day one
- `AnalystWorkstyleProfile` is `data_classification: user` — analyst_id hashed,
  no admin read path, no performance evaluation integration
- **FLOWPATH was already in `SovereignProduct`** — GD-18's "10→11 products"
  expectation was incorrect; no product change was needed or made

**GD-10 — Classification Boundary (permanent until formally lifted):**
UNCLASSIFIED only. CUI/SECRET/TOP_SECRET throw `ClassificationNotAuthorizedError`.

---

## §7 — CPMI Enhanced Monitoring

CPMI at **0.7× anomaly threshold** — architectural constant.
VRS certificate issued June 24, 2026. Gate 3 attested June 25, 2026.
Gate 4 complete June 25, 2026. Stage 3 fully certified.

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← git main · HEAD fa11ad9
├── SOVEREIGN_Platform_Integration_Brief_v1_29.md
├── Agent_Identity_Standard.md         ← 21 agents · all AgentCards active
├── sovereign-security/                ← 142 Python tests · evaluate.py
├── sovereign-api-client/              ← 174 tests
├── sovereign-data/                    ← 43 tests
├── sovereign-shell/shell-contract.ts  ← v1.13 · SHA 2a3f0b9d…d18569
├── module-counsel/                    ← COMPLETE — 91 tests
├── module-scribe/                     ← COMPLETE — 122 tests
├── module-vigil/                      ← COMPLETE — 113 tests
├── module-lens/                       ← COMPLETE — 58 tests
├── module-cpmi/                       ← COMPLETE — 58 tests
├── module-agentos/                    ← COMPLETE — 86 tests
├── module-nexus/                      ← COMPLETE — 52 tests
├── module-apex/                       ← COMPLETE — 97 tests
├── module-flowpath/                   ← Stage 5b IN PROGRESS — 52 tests
└── e2e/                               ← 6 E2E scenarios passing
```

---

## §9 — Intelligence Layer Exposure Requirements

| Field | Required On | Status |
|---|---|---|
| `workflow_step_id` | Every Logger event | Enforced |
| `decision_type` | Every human decision | Enforced |
| `TASK_APPROVAL` / `TASK_CANCELLATION` | AgentOS task decisions | LIVE |
| `GATE_3_ATTESTATION` | CPMI Gate 3 + APEX Gate 3 | LIVE |
| `MODEL_EVALUATION_COMPLETE` | evaluate.py runs | LIVE |
| `REPORT_ATTESTATION` | APEX report export | LIVE (GD-16) |
| `WORKFLOW_APPROVAL` | FLOWPATH artifact approval | LIVE (GD-18) |
| `VALIDATION_SIGN_OFF` | APEX pre-review validation | LIVE (GD-18) |
| FLOWPATH elicitation events (10) | FLOWPATH sessions | LIVE (GD-18) |
| PPBE decision events | PPBE transitions | DEFERRED — Session 22+ |

---

## §10 — Shared Data Dictionary

| Entity | Classification | Status |
|---|---|---|
| Employee, Program, Cost Code, Document, Vendor | program | Implemented |
| StyleProfile | user | LIVE |
| LensExplanation | companion | LIVE |
| ReasoningChainOutput | governance | LIVE |
| ClearanceLevel | infrastructure | LIVE (UNCLASSIFIED only) |
| HumanDecisionType | governance | **18 members** (GD-18) |
| ApexReportType / RiskFinding / ApexAnalysisOutput | governance | LIVE (GD-16) |
| ProvenanceRecord (module-local) | governance | LIVE — includes actual value + variance |
| AnalystWorkstyleProfile | user | LIVE (GD-18) — hashed id, no admin path |
| OrganizationalVocabulary | user | LIVE (module-flowpath) |
| WorkflowArtifact / DataSourceRegistry / ValidationCadenceRecord | module-local | LIVE (module-flowpath) |
| PPBE entities (6) | program | PENDING |

---

## §11 — Current Build Status

### Stages 1–4 — COMPLETE
### Stage 5a (APEX) — COMPLETE
### Stage 5b (FLOWPATH) — IN PROGRESS (Session 20 complete, Session 21 next)

**Total tests: 952 JS + 142 Python = 1094**

### Session 20 — COMPLETE

**Note on session start:** Session 20 halted at the STEP 3 session-open gate — the six
FLOWPATH agents were absent from `Agent_Identity_Standard.md` despite the Integration
Brief's claim. Claude Code correctly blocked (Constraint #10 — no agent may be
instantiated in code before appearing in the standard). Project Principal resolved the
blocker in Claude Chat (commit `8f8ebed`). Session then completed all six deliverables.

**Session 20 deliverables:**
- D1: GD-18 — shell-contract v1.12 → v1.13 (10 event types, 2 decision types,
  AnalystWorkstyleProfile type)
- D2: FLOWPATH scaffold — module structure, 6 AgentCards, 4 APPROVED prompts,
  white-card banners, types, Five-Question Gate, PPBE stub
- D3: Elicitation Session Manager (Screen 1) — 10 tests
- D4: Elicitation Dialogue Interface — organizational mode (Screen 2) — 14 tests
- D5: Individual Workstyle Elicitation (Screen 4) — 8 tests, trust statement
  verbatim, hashed analyst_id, privacy enforced
- D6: E2E Scenario 6 — Stage 5b pipeline (FLOWPATH→approval→AgentOS→APEX) — e2e 5→6

### Session 21 — NEXT

Remaining FLOWPATH scope before Walkthrough C:
1. **Screen 3 — Workflow Artifact Review:** The human approval surface. WorkflowArtifact
   displays in plain prose for reviewer. `WORKFLOW_APPROVAL` human decision logged before
   artifact is committed to registry. Gap 5/6 compliant. White card pattern.
2. **CPMI-VRS benchmark scenarios A/B/C:** Three elicitation scenarios producing
   schema-valid WorkflowArtifact outputs, all passing Five-Question Gate. Required
   for Gate 2 certification.
3. **FLOWPATH CPMI-VRS Gates tab:** Visible gate runner (mirroring APEX pattern)
   for Walkthrough C. Gate 3 attestation is Project Principal step.
4. **Item 57 — NEXUS→AgentOS shared task surface:** Shell-contract design decision.
   Evaluate whether a ninth shell export is warranted or alternative architecture
   resolves UI visibility.
5. **Total test target:** Minimum 80 tests in `module-flowpath/` before Walkthrough C.

---

## §12 — Risk Register

| ID | Risk | Status |
|---|---|---|
| R1 | Human-review-volume | OPEN |
| R2–R3 | AI Provider / Agent Operator | **CLOSED** |
| R4 | Federal Workforce Transition | OPEN — LENS mitigates |
| R5 | CPMI world model REST API | MITIGATED |
| R6 | AgentOS evaluate.py | **CLOSED** |
| R7 | Tier 2 LLM Provider | **CLOSED** |
| R8 | Shell ↔ module contract drift | MITIGATED |
| R9 | NEXUS ATO timeline | OPEN |
| R10–R11 | AgentOS surface / alert response | **CLOSED** |
| R12 | PPBE integration | OPEN — sequenced Session 22+ |
| R13 | NEXUS→AgentOS UI convergence | OPEN — Item 57 |
| **R14** | **Agent registration gap** | **MITIGATED** — Constraint #10 gate caught the omission at Session 20 open; blocker resolved same session. Add agent registration verification to pre-session governance checklist. |

---

## §13 — Open Governance Items

**CLOSED this version:**
- GD-18 — **CLOSED** executed Session 20

**Open items carried forward:**

| ID | Item | Target |
|---|---|---|
| Item 53 | AgentOS §5.2 evaluate gates spec | Future session |
| Item 54 | evaluate.py cross-runtime adapter | Future session |
| Item 46 | PPBE six decisions (D-P1 through D-P6) | Claude Chat governance session |
| Item 42 | GD-10 lift trigger | Future governance |
| Item 57 | NEXUS→AgentOS shared task surface | Session 21 |
| Item 58 | APEX dossier export file generation | Future session |
| Item 59 | Export format CSV for data tables | Future session |
| Item 60 | DC-5 Operational validation cycle | FLOWPATH spec §5 — Session 21 |
| Item 61 | DC-6 Analytical workspace + source data | FLOWPATH spec §5 — Session 21 |
| Item 62 | DC-7 Conversational analyst interface | FLOWPATH spec §5 — Session 21 |

**Pre-Session 21 governance checklist:**
- No new GDs required for Session 21 scope
- No new agents required (all FLOWPATH agents registered)
- No new prompts required
- Verify: `Agent_Identity_Standard.md` agent count = 21 before session opens

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.21 (through Session 20).
Shell contract v1.13 · `2a3f0b9d…d18569`. 1094 total tests. 0 vulnerabilities.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. Verify shell-contract.ts SHA-256 = `2a3f0b9d8f390c30e23816e4e928cbcd02ccd59f765294f8ed247d9c75d18569` (v1.13).
3. **Verify agent count = 21 in Agent_Identity_Standard.md before any build work.**
   *(Session 20 lesson: the Brief's agent count claim is not a substitute for checking
   the actual file. Always verify the registry directly.)*
4. State done condition — wait for Project Principal approval.
5. One component per exchange — build, verify, confirm, proceed.
6. Close with handoff — never skip.

**Session 21 Opening Priorities (in order):**

1. **Screen 3 — Workflow Artifact Review** — human approval surface, Gap 5/6 compliant,
   `WORKFLOW_APPROVAL` logged, white card pattern
2. **CPMI-VRS benchmark scenarios A/B/C** — three elicitation scenarios, schema-valid,
   Five-Question Gate passed
3. **FLOWPATH CPMI-VRS Gates tab** — visible gate runner, Gate 3 ready for Project
   Principal during Walkthrough C
4. **Item 57** — NEXUS→AgentOS shared task surface decision
5. **Full test suite to ≥80 tests in module-flowpath/**

**UI standard (standing requirement):**
White content card pattern on `#f1f5f9` canvas. Gap 5 and Gap 6 from first line of code.
Walkthrough C must find zero contrast gaps and zero Gap 5/6 failures.

---

## §16 — Level 1 Walkthrough Protocol (Standing Requirement)

**Walkthrough Schedule:**

| Walkthrough | After Session | Stage | Status |
|---|---|---|---|
| **A** | **16** | **Stage 4** | **COMPLETE — June 25, 2026** |
| **B** | **18** | **Stage 5a (APEX)** | **COMPLETE — June 26, 2026** |
| **C** | **~21** | **Stage 5b (FLOWPATH)** | **NEXT — after Session 21** |
| D | ~25 | Stage 6 (ARIA Suite) | Pending |
| E | ~27 | Pre-IL | Pending |
| F | ~32 | Full platform | Pending |

---

## §17 — Primary Product Inserts

| Product | Stage | Status |
|---|---|---|
| CPMI | Stage 3 | **COMPLETE — VRS certified** |
| AgentOS | Stage 4 | **COMPLETE** |
| NEXUS | Stage 4 | **COMPLETE** |
| APEX | Stage 5a | **COMPLETE — VRS certified — 97 tests** |
| FLOWPATH | Stage 5b | **IN PROGRESS** — Screens 1/2/4 complete (Session 20) · Screen 3 + CPMI-VRS + Item 57 remaining (Session 21) · 52 tests |
| ARIA Suite | Stage 6 | Sessions 23–25 |

---

## §18 — Agent and Prompt Registry

**Agent registry: 21 total (all AgentCards active)**

| Agent | Module | Class | Status |
|---|---|---|---|
| `cpmi.reasoning-chain` | module-cpmi | Governance | Implemented |
| `cpmi.world-model-api` | module-cpmi | Operational | Implemented |
| `cpmi.vrs-certification` | module-cpmi | Governance | Implemented |
| `agentos.orchestrator` | module-agentos | Orchestration | Implemented |
| `agentos.data-agent` | module-agentos | Operational | Implemented |
| `agentos.training-agent` | module-agentos | Operational | Implemented |
| `agentos.evaluation-agent` | module-agentos | Analytical/Gov | Implemented |
| `agentos.monitoring-agent` | module-agentos | Monitoring | Implemented |
| `agentos.compliance-agent` | module-agentos | Governance | Implemented |
| `nexus.classification-agent` | module-nexus | Analytical | Implemented |
| `nexus.routing-agent` | module-nexus | Operational | Implemented |
| `counsel-analyst` | module-counsel | Analytical | Implemented |
| `scribe-drafter` | module-scribe | Operational | Implemented |
| `scribe-style-analyst` | module-scribe | Analytical | Implemented |
| `vigil-triage-analyst` | module-vigil | Monitoring | Implemented |
| `vigil-approval-agent` | module-vigil | Monitoring | Implemented |
| `lens-explainer` | module-lens | Analytical | Implemented |
| `lens-orientation` | module-lens | Analytical | Implemented |
| `apex.ai-assistant` | module-apex | Analytical | Implemented |
| `apex.report-generator` | module-apex | Operational | Implemented |
| **`flowpath.coordinator`** | **module-flowpath** | **Analytical** | **Implemented Session 20** |
| **`flowpath.interviewer`** | **module-flowpath** | **Analytical** | **Implemented Session 20** |
| **`flowpath.mapper`** | **module-flowpath** | **Analytical** | **Implemented Session 20** |
| **`flowpath.validator`** | **module-flowpath** | **Analytical** | **Implemented Session 20** |
| **`flowpath.analyzer`** | **module-flowpath** | **Analytical** | **Implemented Session 20** |
| **`flowpath.domain-translator`** | **module-flowpath** | **Analytical** | **Implemented Session 20** |

*Note: Table shows 26 rows — companion suite agents (counsel-analyst, scribe-drafter,
scribe-style-analyst, vigil-triage-analyst, vigil-approval-agent, lens-explainer,
lens-orientation) and flowpath agents (6) bring total above the 15 primary product
agents. Authoritative count per Agent_Identity_Standard.md: **21 active AgentCards**.*

**Approved prompts: 14 total** — unchanged from v1.28 (PR-FLOWPATH-001/002/003/004
now marked APPROVED in module-flowpath CHANGELOG)

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.27 | June 26, 2026 | Session 18 · GD-17 · APEX Gates tab · WB complete · 1035 tests |
| v1.28 | June 26, 2026 | Session 19 · WB gaps closed · DC-4 · GD-18 pre-approved · 1041 tests |
| **v1.29** | **June 26, 2026** | **Session 20 · GD-18 executed · shell-contract v1.13 · FLOWPATH Screens 1/2/4 + E2E Scenario 6 · agent count corrected to 21 · 1094 tests** |

---

## §20 — Full Build Roadmap

### Stage 5b — FLOWPATH (in progress)

| Session | Type | Scope |
|---|---|---|
| **20** | **Build** | **GD-18 + scaffold + Screens 1/2/4 + E2E Scenario 6 — COMPLETE** |
| **21** | **Build** | **Screen 3 + CPMI-VRS + Item 57 — NEXT** |
| **Walkthrough C** | **Validation** | **Stage 5b: FLOWPATH pipeline** |
| 22 | Build | PPBE Phase I integration |

### Stage 6 — ARIA Suite

| Session | Type | Scope |
|---|---|---|
| 23 | Build | CLEAR scaffold + core |
| 24 | Build | TRACER scaffold + core |
| 25 | Build | ARC scaffold + core |
| **Walkthrough D** | Validation | Stage 6 |

### Stages 7–9 — Demo Hardening, Intelligence Layer, Production

*(unchanged from v1.28)*

---

*SOVEREIGN Platform Integration Brief v1.29 · June 26, 2026*
*Pre-Decisional · Internal Working Document*

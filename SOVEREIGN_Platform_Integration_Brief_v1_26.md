# SOVEREIGN Platform Integration Brief
## Version 1.26 | June 25, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.25
**Changed this version:** Session 17 complete (June 25, 2026) · GD-15 Python logger
re-sync · GD-16 APEX event types + analysis schema · shell-contract v1.11 → v1.12 ·
Walkthrough A Gap 1 FIXED · Gap 2 FIXED (covered by Gap 3) · Gap 3 FIXED · Gap 4
CLOSED (config, not a bug) · APEX Stage 5a scaffold + three screens + benchmarks
COMPLETE · 1018 total tests · new open governance item (APPROVED_PRODUCTS companion
drift) · §6, §8, §10, §11, §13, §14, §15, §17, §18, §19 updated

---

## §1 — What This Document Is

Mandatory context for every SOVEREIGN Platform development session. Load order:
Integration Brief (current version) → `SOVEREIGN_Agent_to_Agent_Briefing.md` →
`system_prompt.md` → product or companion suite spec → prior session handoff →
`shell-contract.ts`.

Confirm all documents are loaded by name before any build work begins.
Verify shell-contract.ts SHA-256 matches the v1.12 hash of record.

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
FLOWPATH → [Intelligence Layer] → CPMI ✅ → AgentOS ✅ → NEXUS ✅ → APEX ✅(5a) → ARIA Suite
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ — COMPLETE
‖ Local LLM: Provider B wired · UNCLASSIFIED-only (GD-10)
‖ A2A: agent-to-agent messaging · synthetic · activates by config
‖ PPBE: workflow layer · governance decisions Session ~19 · integration Session 22
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
   **v1.12 · SHA-256: `61594a698da07a4a748259fe23cf2be03d8e6aeaea5c72502f04e0d3e246dfe3`**
   *(Retired: v1.11 · `78709b213ff9976ecadd4066645a897ece55fb9b3ffb049b59dd02d19c0162db`)*
9. All prompts registered before build — **10 APPROVED**
10. All agents registered before build — **18 registered** (all AgentCards active)
11. **Five synced copies of shared artifacts** — propagate all changes

**Codebase facts every session must know:**
- Real types: `SovereignRequestContext` / `SovereignLLMResponse` / `ClearanceLevel`
- `createSovereignClient()` unchanged — use `routedComplete()` for routing
- `sovereign-api-client` compiles commonjs — use `process.env`, not `import.meta.env`
- **Exception:** ESM modules using Vite (module-cpmi, module-apex) use the isolated
  `anthropic-key.ts` / `import.meta.env` pattern with a jest stub — do not change to
  `process.env` in those modules
- `SovereignEventType` NOT mirrored in `sovereign-data/src/shared-types.ts`
- NEXUS `minimumRole` is `AGENT_OPERATOR`; APEX `minimumRole` is `PLATFORM_ADMIN`
- GD-10: UNCLASSIFIED only — enforced at api-client AND NEXUS intake
- evaluate.py ↔ evaluate-port.ts is a cross-runtime config seam, not a live call
- `sovereignHold()` does not exist as a platform export — the platform hold function
  is `ctx.governance.isOnHold(product)`; call it, never reimplement it
- APEX reserved field names (do not use in ProgramRecord extensions):
  `fiscal_year`, `lifecycle_cost_estimate`, `obligation_plan`, `performance_baseline`

**GD-10 — Classification Boundary (permanent until formally lifted):**
UNCLASSIFIED only. CUI/SECRET/TOP_SECRET throw `ClassificationNotAuthorizedError`.

---

## §7 — CPMI Enhanced Monitoring

CPMI at **0.7× anomaly threshold** — architectural constant.
VRS certificate issued June 24, 2026. Gate 3 attested by Project Principal June 25, 2026.
Gate 4 (Monitoring baseline) complete June 25, 2026. Stage 3 fully certified.

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← git main · HEAD 7358f88
├── SOVEREIGN_Platform_Integration_Brief_v1_26.md
├── Agent_Identity_Standard.md         ← 18 agents · all AgentCards active
├── sovereign-security/                ← 142 Python tests · evaluate.py
├── sovereign-api-client/              ← 174 tests
├── sovereign-data/                    ← 43 tests
├── sovereign-shell/shell-contract.ts  ← v1.12 · SHA 61594a69…46dfe3
├── module-counsel/                    ← COMPLETE — 91 tests
├── module-scribe/                     ← COMPLETE — 122 tests
├── module-vigil/                      ← COMPLETE — 113 tests
├── module-lens/                       ← COMPLETE — 58 tests
├── module-cpmi/                       ← COMPLETE — 58 tests
├── module-agentos/                    ← COMPLETE — 81 tests
├── module-nexus/                      ← COMPLETE — 52 tests
├── module-apex/                       ← Stage 5a COMPLETE — 80 tests
└── e2e/                               ← 4 E2E scenarios passing
```

---

## §9 — Intelligence Layer Exposure Requirements

| Field | Required On | Status |
|---|---|---|
| `workflow_step_id` | Every Logger event | Enforced |
| `decision_type` | Every human decision | Enforced |
| `TASK_APPROVAL` / `TASK_CANCELLATION` | AgentOS task decisions | LIVE |
| `GATE_3_ATTESTATION` | CPMI Gate 3 | LIVE — attested June 25 |
| `MODEL_EVALUATION_COMPLETE` | evaluate.py runs | LIVE |
| `AGENT_MESSAGE_SENT/RECEIVED` | A2A messages | LIVE |
| `REPORT_ATTESTATION` | APEX report export | LIVE (GD-16) |
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
| HumanDecisionType | governance | **16 members** (REPORT_ATTESTATION added GD-16) |
| ApexReportType / RiskFinding / ApexAnalysisOutput | governance | LIVE (GD-16) |
| PPBE entities (6) | program | PENDING |

---

## §11 — Current Build Status

### Stages 1–4 — COMPLETE
### Stage 5a (APEX) — COMPLETE (Session 17)

**Total tests: 876 JS + 142 Python = 1018**

### Walkthrough A — COMPLETE (June 25, 2026)

Level 1 validation of Stage 4 pipeline. All six gaps resolved.

**Gap resolution status:**

| ID | Gap | Status |
|---|---|---|
| Gap 1 | NEXUS request queue not rendering | **FIXED** — Session 17 (ref-backed monotonic id; 4 regression tests) |
| Gap 2 | AgentOS task table text not readable | **FIXED** — covered by Gap 3 contrast pass |
| Gap 3 | Color and contrast audit across all products | **FIXED** — Session 17 (11 surgical fixes; NEXUS/AgentOS/VIGIL/CPMI) |
| Gap 4 | CPMI live reasoning service not connecting | **CLOSED** — expected dev behavior; config gap (no VITE_ANTHROPIC_API_KEY in dev); static fallback correct by design |
| Gap 5 | Human readability standard | **STANDARD DEFINED** — `docs/14_HumanReviewerStandard.md`; APEX built to standard |
| Gap 6 | Content type distinction standard | **STANDARD DEFINED** — `docs/14_HumanReviewerStandard.md`; APEX built to standard |

### Session 17 — COMPLETE

D1 (GD-15 logger re-sync) · D2 (Walkthrough A gap fixes) · D3 (GD-16 + APEX scaffold)
· D4 (Portfolio Dashboard) · D5 (Program Detail + DC-3) · D6 (Report Generation + DC-2)
· D7 (CPMI-VRS benchmarks) — all seven deliverables complete.

**APEX Stage 5a complete:** three screens, DC-2 dossier export, DC-3 generic provenance
panel, PPBE anticipation stubs, ApexDataAdapter extensible interface, Execution Monitoring
stub, benchmark scenarios A/B/C (all schema_valid:true). 80 module-apex tests.

### Session 18 — NEXT

APEX completion: CPMI-VRS Gates tab for APEX (visible gate runner for Walkthrough B
review), Gate 3 attestation (Project Principal step during Walkthrough B), and any
remaining polish. Walkthrough B follows.

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
| R12 | PPBE integration | OPEN — sequenced Session 19–22 |

---

## §13 — Open Governance Items

**CLOSED this version:**
- GD-15 Python logger taxonomy re-sync (item 52) — **CLOSED** Session 17
- Walkthrough A Gap 1 NEXUS queue fix — **CLOSED** Session 17
- Walkthrough A Gap 2 AgentOS contrast — **CLOSED** Session 17 (covered by Gap 3)
- Walkthrough A Gap 3 color/contrast audit — **CLOSED** Session 17
- Walkthrough A Gap 4 CPMI investigation — **CLOSED** Session 17 (config, not a bug)
- DC-2 program dossier export — **DELIVERED** Session 17 (APEX DC-2 complete)
- DC-3 data provenance drill-down — **DELIVERED** Session 17 (generic ProvenancePanel)

**Open items carried forward:**

| ID | Item | Target |
|---|---|---|
| Item 53 | AgentOS §5.2 missing (evaluate gates spec section) | Future session |
| Item 54 | evaluate.py cross-runtime adapter (live wiring deferred) | Future session |
| Item 46 | PPBE six governance decisions (D-P1 through D-P6) | Session ~19 |
| Item 42 | GD-10 lift trigger (criteria for widening AUTHORIZED_CLASSIFICATIONS) | Future governance session |
| **Item 55** | **`APPROVED_PRODUCTS` companion-product re-sync** — `sovereign_logger.py` `APPROVED_PRODUCTS` missing four companion products (COUNSEL, SCRIBE, LENS, VIGIL). GD-15 was scoped to event/decision types only. Latent until Python-side emission under a companion product is needed. **Future GD** (small — four additions, Constraint #11 propagation). | Session 18 or dedicated GD |

**APEX CPMI-VRS — remaining gates:**

| Gate | Status |
|---|---|
| Gate 1 (AI Disclosure) | Implemented — banner on all APEX screens |
| Gate 2 (Reasoning Transparency) | Implemented — analysis narrative + benchmark scenarios A/B/C |
| Gate 3 (Human Attestation) | **Pending Project Principal** — Walkthrough B step |
| Gate 4 (Monitoring Baseline) | Pending — follows Gate 3 |

**Design Considerations — still open:**

| ID | Consideration | Target |
|---|---|---|
| DC-1 | VIGIL sub-prioritization within P1 | Stage 6 / hardening |

DC-2 and DC-3 delivered in Session 17 (APEX). Closed.

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.18 (through Session 17).
Shell contract v1.12 · `61594a69…46dfe3`. 1018 total tests. 0 vulnerabilities.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. Verify shell-contract.ts SHA-256 = `61594a698da07a4a748259fe23cf2be03d8e6aeaea5c72502f04e0d3e246dfe3` (v1.12).
3. State done condition — wait for Project Principal approval.
4. One component per exchange — build, verify, confirm, proceed.
5. Close with handoff — never skip.

**Session 18 Scope:**

Session 18 has one primary objective before Walkthrough B can proceed: APEX
CPMI-VRS certification infrastructure. The benchmark scenarios (A/B/C) are
built and produce schema_valid:true outputs. What remains:

1. **APEX CPMI-VRS Gates tab** — a visible gate runner panel inside APEX (mirroring
   CPMI's GateRunnerPanel) that surfaces the benchmark results and the Gate 1/2/3/4
   certification sequence. Gate 3 attestation is the Project Principal's action
   during Walkthrough B; the UI must be ready.
2. **Item 55** — `APPROVED_PRODUCTS` companion-product re-sync (small GD; fold in as
   first deliverable if scope permits, or defer to a dedicated follow-up).
3. **Walkthrough B readiness** — run the platform end-to-end as a human reviewer
   navigating APEX, confirming Gap 5/6 compliance across all APEX screens in a
   browser before the formal walkthrough.

**Then Walkthrough B.**

---

## §16 — Level 1 Walkthrough Protocol (Standing Requirement)

**Walkthrough Schedule:**

| Walkthrough | After Session | Stage | Status |
|---|---|---|---|
| **A** | **16** | **Stage 4** | **COMPLETE — June 25, 2026** |
| **B** | **~18** | **Stage 5a (APEX)** | **NEXT** |
| C | ~21 | Stage 5b (FLOWPATH) | Pending |
| D | ~25 | Stage 6 (ARIA Suite) | Pending |
| E | ~27 | Pre-IL | Pending |
| F | ~32 | Full platform | Pending |

**Walkthrough validation standard:** No product passes its Walkthrough validation if
Gap 5 or Gap 6 standards (defined in `docs/14_HumanReviewerStandard.md`) are not met.
Human reviewers must be able to read all output as plain prose and orient within five
seconds.

---

## §17 — Primary Product Inserts

| Product | Stage | Status |
|---|---|---|
| CPMI | Stage 3 | **COMPLETE — VRS certified, Gate 3 attested June 25** |
| AgentOS | Stage 4 | **COMPLETE** |
| NEXUS | Stage 4 | **COMPLETE** — Gap 1 fixed Session 17 |
| APEX | Stage 5a | **COMPLETE** — scaffold + three screens + DC-2/DC-3 + benchmarks (Session 17) · CPMI-VRS Gate 3 pending Walkthrough B |
| FLOWPATH | Stage 5b | Sessions 20–21 |
| ARIA Suite | Stage 6 | Sessions 23–25 |

---

## §18 — Companion Suite and Agent Registry

**Companion suite:** FULLY COMPLETE — 442 JS companion tests

**Agent registry: 18 total (all AgentCards active)**

| Agent | Module | Class | Status |
|---|---|---|---|
| `flowpath.coordinator` | FLOWPATH | Analytical | Registered |
| `flowpath.interviewer` | FLOWPATH | Analytical | Registered |
| `flowpath.mapper` | FLOWPATH | Analytical | Registered |
| `flowpath.validator` | FLOWPATH | Analytical | Registered |
| `flowpath.analyzer` | FLOWPATH | Analytical | Registered |
| `flowpath.domain-translator` | FLOWPATH | Analytical | Registered |
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
| `apex.ai-assistant` | module-apex | Analytical | **Implemented Session 17** |
| `apex.report-generator` | module-apex | Operational | **Implemented Session 17** |

Companion suite agents (counsel-analyst, scribe-drafter, scribe-style-analyst,
vigil-triage-analyst, vigil-approval-agent, lens-explainer, lens-orientation,
nexus.routing-agent) are registered in Agent_Identity_Standard.md.
Full companion suite count brings total registered to 18 primary + companion agents.

**Approved prompts: 10 total**
PR-COUNSEL-001/002/003 · PR-SCRIBE-001 · PR-SCRIBE-004 · PR-VIGIL-001 ·
PR-VIGIL-002 · PR-LENS-001 · PR-CPMI-001 · **PR-APEX-001** (approved June 25, 2026)

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.23 | June 24, 2026 | Walkthrough cadence + PPBE sequence + build roadmap |
| v1.24 | June 24, 2026 | Session 16: Stage 4 complete, 934 tests |
| v1.25 | June 25, 2026 | Walkthrough A complete · 6 gaps · 3 design considerations · Gate 3 attested · Gap 5/6 as platform-wide standards · Session 17 priorities defined |
| **v1.26** | **June 25, 2026** | **Session 17 complete · GD-15 + GD-16 · shell-contract v1.12 · Walkthrough A all gaps resolved · APEX Stage 5a complete · 1018 tests · new item 55 (APPROVED_PRODUCTS companion drift)** |

---

## §20 — Full Build Roadmap

### Stage 4 — COMPLETE ✅
### Walkthrough A — COMPLETE ✅
### Stage 5a (APEX) — COMPLETE ✅ (Session 17)

### Stage 5 — APEX completion + FLOWPATH

| Session | Type | Scope |
|---|---|---|
| **18** | **Build** | **APEX CPMI-VRS Gates tab + Walkthrough B readiness** |
| **Walkthrough B** | **Validation** | **Stage 5a: APEX analytics in pipeline** |
| 19 | Governance | PPBE six decisions (D-P1–D-P6) — Claude Chat |
| 20 | Build | FLOWPATH scaffold + core |
| 21 | Build | FLOWPATH completion + CPMI-VRS certification |
| **Walkthrough C** | Validation | Stage 5b: FLOWPATH → CPMI → NEXUS |
| 22 | Build | PPBE Phase I integration |

### Stage 6 — ARIA Suite

| Session | Type | Scope |
|---|---|---|
| 23 | Build | CLEAR scaffold + core |
| 24 | Build | TRACER scaffold + core |
| 25 | Build | ARC scaffold + core |
| **Walkthrough D** | Validation | Stage 6 |

### Stage 7 — Demo Hardening

| Session | Type | Scope |
|---|---|---|
| 26 | Build | Gap fixes from walkthroughs + polish |
| 27 | Build | PPBE Phase II + integration hardening |
| **Walkthrough E** | Validation | Pre-IL demo dry run |

### Stage 8 — Intelligence Layer

| Session | Type | Scope |
|---|---|---|
| 28 | Build | Task Decomposition Engine |
| 29 | Build | Judgment Detection |
| 30 | Build | Automatability Scorer |
| 31 | Build | Risk & Failure Modeler |
| 32 | Build | Compliance Mapper + IL integration |
| **Walkthrough F** | Validation | Full platform — all seven products |

### Stage 9 — Production Hardening

| Session | Type | Scope |
|---|---|---|
| 33 | Build | Cross-product failure topology |
| 34 | Build | ATO preparation + security hardening |

---

*SOVEREIGN Platform Integration Brief v1.26 · June 25, 2026*
*Pre-Decisional · Internal Working Document*

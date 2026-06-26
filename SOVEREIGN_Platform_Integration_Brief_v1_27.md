# SOVEREIGN Platform Integration Brief
## Version 1.27 | June 26, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.26
**Changed this version:** Session 18 complete (June 26, 2026) · GD-17 APPROVED_PRODUCTS
companion re-sync · APEX CPMI-VRS Gates tab complete · NEXUS→AgentOS live backing
delivered · E2E Walkthrough B scenario added · 1035 total tests · Item 55 CLOSED ·
Gate 3 decision_type correction queued (Session 19 first deliverable) · D3 UI
convergence deferred (shell-contract decision required) · §6, §8, §11, §13, §14,
§15, §17, §19 updated · Walkthrough B READY

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
FLOWPATH → [Intelligence Layer] → CPMI ✅ → AgentOS ✅ → NEXUS ✅ → APEX ✅ → ARIA Suite
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ — COMPLETE
‖ Local LLM: Provider B wired · UNCLASSIFIED-only (GD-10)
‖ A2A: agent-to-agent messaging · synthetic · activates by config
‖ NEXUS→AgentOS: live backing delivered · UI convergence pending shell-contract decision
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
   *(Unchanged through Session 18)*
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
- `sovereignHold()` does not exist as a platform export — use `ctx.governance.isOnHold(product)`
- PPBE reserved field names (never use in ProgramRecord extensions):
  `fiscal_year`, `lifecycle_cost_estimate`, `obligation_plan`, `performance_baseline`
- `createAgentOSBackedPort` (module-agentos) is the live NEXUS→AgentOS port — injectable
  by configuration; NEXUS default still injects synthetic port pending shell-contract decision
- **Gate 3 `decision_type` correction queued:** APEX GateRunnerPanel currently logs
  `REPORT_ATTESTATION` for Gate 3 attestation; the semantically correct type is
  `GATE_3_ATTESTATION` (already in contract, GD-7). One-line fix — first deliverable Session 19.

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
├── package.json                       ← git main · HEAD aab61ac
├── SOVEREIGN_Platform_Integration_Brief_v1_27.md
├── Agent_Identity_Standard.md         ← 18 agents · all AgentCards active
├── sovereign-security/                ← 142 Python tests · evaluate.py
├── sovereign-api-client/              ← 174 tests
├── sovereign-data/                    ← 43 tests
├── sovereign-shell/shell-contract.ts  ← v1.12 · SHA 61594a69…46dfe3 (unchanged S18)
├── module-counsel/                    ← COMPLETE — 91 tests
├── module-scribe/                     ← COMPLETE — 122 tests
├── module-vigil/                      ← COMPLETE — 113 tests
├── module-lens/                       ← COMPLETE — 58 tests
├── module-cpmi/                       ← COMPLETE — 58 tests
├── module-agentos/                    ← COMPLETE — 86 tests (+5 D3 live port)
├── module-nexus/                      ← COMPLETE — 52 tests
├── module-apex/                       ← COMPLETE — 91 tests (+11 Gates tab)
└── e2e/                               ← 5 E2E scenarios passing (+1 Walkthrough B)
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
| `GATE_3_ATTESTATION` | APEX Gate 3 (correction queued) | Built as REPORT_ATTESTATION — fix Session 19 |
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
| HumanDecisionType | governance | 16 members |
| ApexReportType / RiskFinding / ApexAnalysisOutput | governance | LIVE (GD-16) |
| PPBE entities (6) | program | PENDING |

---

## §11 — Current Build Status

### Stages 1–4 — COMPLETE
### Stage 5a (APEX) — COMPLETE (Sessions 17–18)

**Total tests: 893 JS + 142 Python = 1035**

### Walkthrough B — READY

APEX CPMI-VRS Gates tab is live. Gate 3 attestation and Gate 4 completion are
Project Principal steps to be performed in the browser during Walkthrough B.

**APEX completion status:**

| Component | Status |
|---|---|
| Portfolio Dashboard (Screen 1) | COMPLETE — Session 17 |
| Program Detail + DC-3 (Screen 2) | COMPLETE — Session 17 |
| Report Generation + DC-2 (Screen 3) | COMPLETE — Session 17 |
| Execution Monitoring stub (Screen 4) | COMPLETE — Session 17 (PPBE Phase 5 stub) |
| CPMI-VRS Gates tab (Screen 5) | COMPLETE — Session 18 |
| CPMI-VRS Gate 1 (AI Disclosure) | PASSED — auto on load |
| CPMI-VRS Gate 2 (Reasoning Transparency) | PASSED — benchmarks A/B/C schema_valid:true |
| CPMI-VRS Gate 3 (Human Attestation) | **PENDING — Project Principal step (Walkthrough B)** |
| CPMI-VRS Gate 4 (Monitoring Baseline) | **PENDING — follows Gate 3** |

### Session 19 — NEXT (after Walkthrough B)

Session 19 has three scopes, in order:

1. **Gate 3 decision_type correction** (first deliverable, one line):
   Change `REPORT_ATTESTATION` → `GATE_3_ATTESTATION` in
   `module-apex/src/GateRunnerPanel.tsx` (`attestGate3`) and the corresponding test.
   No shell-contract change required — both types already exist.

2. **PPBE governance decisions** (D-P1 through D-P6) — Claude Chat governance session.
   Six decisions required before any PPBE build work begins. Architecture documented in
   `SOVEREIGN_PPBE_Integration_Architecture_Draft1.md`.

3. **Shell-contract decision: NEXUS→AgentOS shared task surface** — the live backing
   (`createAgentOSBackedPort`) is complete; making NEXUS submissions visible in the AgentOS
   UI requires a shared task store at the shell level (Constraint #7 — shell context
   frozen at eight exports). Determine whether a ninth export is warranted or whether a
   different architectural approach resolves this without a constraint change.

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
| **R13** | **NEXUS→AgentOS UI convergence** | **OPEN — shell-contract decision required (§11 Session 19 item 3)** |

---

## §13 — Open Governance Items

**CLOSED this version:**
- Item 55 (APPROVED_PRODUCTS companion drift) — **CLOSED** GD-17 Session 18

**Open items carried forward:**

| ID | Item | Target |
|---|---|---|
| Item 53 | AgentOS §5.2 missing (evaluate gates spec section) | Future session |
| Item 54 | evaluate.py cross-runtime adapter (live wiring deferred) | Future session |
| Item 46 | PPBE six governance decisions (D-P1 through D-P6) | Session 19 |
| Item 42 | GD-10 lift trigger | Future governance session |
| **Item 56** | **Gate 3 `decision_type` correction** — one-line fix in `GateRunnerPanel.tsx`: `REPORT_ATTESTATION` → `GATE_3_ATTESTATION`. Both types exist in contract. No shell-contract change. **Session 19 first deliverable.** | Session 19 |
| **Item 57** | **NEXUS→AgentOS shared task surface** — shell-contract design decision. Live backing (`createAgentOSBackedPort`) complete and tested. UI visibility requires shared task store. Determine: ninth shell export, or alternative architecture. | Session 19 governance |

**APEX CPMI-VRS — gate status:**

| Gate | Status |
|---|---|
| Gate 1 (AI Disclosure) | **PASSED** — auto on load |
| Gate 2 (Reasoning Transparency) | **PASSED** — A/B/C benchmarks, schema_valid:true |
| Gate 3 (Human Attestation) | **PENDING** — Project Principal step during Walkthrough B |
| Gate 4 (Monitoring Baseline) | **PENDING** — follows Gate 3 |

**Design Considerations — still open:**

| ID | Consideration | Target |
|---|---|---|
| DC-1 | VIGIL sub-prioritization within P1 | Stage 6 / hardening |

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.19 (through Session 18).
Shell contract v1.12 · `61594a69…46dfe3` (unchanged). 1035 total tests. 0 vulnerabilities.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. Verify shell-contract.ts SHA-256 = `61594a698da07a4a748259fe23cf2be03d8e6aeaea5c72502f04e0d3e246dfe3` (v1.12).
3. State done condition — wait for Project Principal approval.
4. One component per exchange — build, verify, confirm, proceed.
5. Close with handoff — never skip.

**Next actions in order:**

1. **Walkthrough B** — Project Principal operates APEX in browser. Gate 3 attestation
   and Gate 4 completion are the Project Principal steps. Claude Chat provides
   scenario guidance. Walkthrough B report produced after.

2. **Session 19** — Three scopes (in order):
   - Gate 3 decision_type correction (Item 56 — first deliverable, one line)
   - PPBE governance decisions D-P1 through D-P6 (Claude Chat portion)
   - Shell-contract decision on NEXUS→AgentOS shared task surface (Item 57)

3. **Session 20** — FLOWPATH scaffold + core (Stage 5b begins)

---

## §16 — Level 1 Walkthrough Protocol (Standing Requirement)

**Walkthrough Schedule:**

| Walkthrough | After Session | Stage | Status |
|---|---|---|---|
| **A** | **16** | **Stage 4** | **COMPLETE — June 25, 2026** |
| **B** | **~18** | **Stage 5a (APEX)** | **READY — awaiting Project Principal** |
| C | ~21 | Stage 5b (FLOWPATH) | Pending |
| D | ~25 | Stage 6 (ARIA Suite) | Pending |
| E | ~27 | Pre-IL | Pending |
| F | ~32 | Full platform | Pending |

**Walkthrough validation standard:** No product passes its Walkthrough validation if
Gap 5 or Gap 6 standards (defined in `docs/14_HumanReviewerStandard.md`) are not met.

---

## §17 — Primary Product Inserts

| Product | Stage | Status |
|---|---|---|
| CPMI | Stage 3 | **COMPLETE — VRS certified, Gate 3 attested June 25** |
| AgentOS | Stage 4 | **COMPLETE** |
| NEXUS | Stage 4 | **COMPLETE** — live AgentOS port available by config |
| APEX | Stage 5a | **COMPLETE — Walkthrough B READY** · 91 tests · Gates tab live · Gate 3/4 pending Project Principal |
| FLOWPATH | Stage 5b | Sessions 20–21 |
| ARIA Suite | Stage 6 | Sessions 23–25 |

---

## §18 — Companion Suite and Agent Registry

**Companion suite:** FULLY COMPLETE — 384 JS companion tests
**Agent registry: 18 total (all AgentCards active)** — unchanged from v1.26
**Approved prompts: 10 total** — unchanged from v1.26

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.25 | June 25, 2026 | Walkthrough A complete · 6 gaps · Session 17 priorities |
| v1.26 | June 25, 2026 | Session 17 complete · GD-15 + GD-16 · APEX Stage 5a · 1018 tests |
| **v1.27** | **June 26, 2026** | **Session 18 complete · GD-17 · APEX Gates tab · NEXUS→AgentOS live backing · E2E Scenario 5 · 1035 tests · Walkthrough B READY · Item 55 CLOSED · Items 56/57 opened** |

---

## §20 — Full Build Roadmap

### Stage 4 — COMPLETE ✅
### Walkthrough A — COMPLETE ✅
### Stage 5a (APEX) — COMPLETE ✅ (Sessions 17–18)
### Walkthrough B — READY ⏳ (awaiting Project Principal)

### Stage 5 — Remainder + FLOWPATH

| Session | Type | Scope |
|---|---|---|
| **Walkthrough B** | **Validation** | **Stage 5a: APEX in pipeline · Gate 3/4 attestation** |
| **19** | **Build + Governance** | **Gate 3 fix (Item 56) · PPBE decisions · Item 57 shell decision** |
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

*SOVEREIGN Platform Integration Brief v1.27 · June 26, 2026*
*Pre-Decisional · Internal Working Document*

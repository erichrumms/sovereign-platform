# SOVEREIGN Platform Integration Brief
## Version 1.28 | June 26, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.27
**Changed this version:** Session 19 complete (June 26, 2026) · Item 56 CLOSED ·
Walkthrough B Gap 1/2/3 CLOSED · DC-4 charts complete · APEX Stage 5a all
follow-ups closed · GD-18 pre-approved · PR-FLOWPATH-001/002/003/004 approved ·
FLOWPATH Architecture Spec committed · 1041 total tests · Session 20 unblocked ·
§6, §8, §11, §13, §14, §15, §17, §19 updated

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
‖ PPBE: workflow layer · governance decisions Session ~19-20 · integration Session 22
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
   *(Unchanged through Session 19. Next change: GD-18, Session 20, v1.12 → v1.13)*
9. All prompts registered before build — **14 APPROVED**
   *(10 existing + PR-FLOWPATH-001/002/003/004 approved June 26, 2026)*
10. All agents registered before build — **18 registered** (all AgentCards active)
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
- evaluate.py ↔ evaluate-port.ts is a cross-runtime config seam, not a live call
- `sovereignHold()` does not exist — use `ctx.governance.isOnHold(product)`
- PPBE reserved field names (never use in ProgramRecord extensions):
  `fiscal_year`, `lifecycle_cost_estimate`, `obligation_plan`, `performance_baseline`
- `createAgentOSBackedPort` (module-agentos) is the live NEXUS→AgentOS port — injectable
  by configuration; NEXUS default still uses synthetic port pending shell-contract decision
- **APEX contrast pattern (approved):** white content cards (`#ffffff`, `1px solid #e2e8f0`)
  on a light page canvas (`#f1f5f9`) — apply to every FLOWPATH screen from day one
- **`AnalystWorkstyleProfile` is `data_classification: user` without exception** — analyst_id
  hashed before logging, no admin read path, no performance evaluation integration

**GD-10 — Classification Boundary (permanent until formally lifted):**
UNCLASSIFIED only. CUI/SECRET/TOP_SECRET throw `ClassificationNotAuthorizedError`.

**GD-18 — Pre-approved for Session 20 (first deliverable):**
Shell-contract v1.12 → v1.13. Adds 10 FLOWPATH SovereignEventType members, 2 new
HumanDecisionType members (WORKFLOW_APPROVAL, VALIDATION_SIGN_OFF), 1 new exported type
(AnalystWorkstyleProfile), FLOWPATH to SovereignProduct. See GD-18 governance decision
record for full impact assessment and Constraint #11 propagation checklist.

---

## §7 — CPMI Enhanced Monitoring

CPMI at **0.7× anomaly threshold** — architectural constant.
VRS certificate issued June 24, 2026. Gate 3 attested June 25, 2026.
Gate 4 complete June 25, 2026. Stage 3 fully certified.

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← git main · HEAD b4d0a65
├── SOVEREIGN_Platform_Integration_Brief_v1_28.md
├── Agent_Identity_Standard.md         ← 18 agents · all AgentCards active
├── sovereign-security/                ← 142 Python tests · evaluate.py
├── sovereign-api-client/              ← 174 tests
├── sovereign-data/                    ← 43 tests
├── sovereign-shell/shell-contract.ts  ← v1.12 · SHA 61594a69…46dfe3 (unchanged S19)
├── module-counsel/                    ← COMPLETE — 91 tests
├── module-scribe/                     ← COMPLETE — 122 tests
├── module-vigil/                      ← COMPLETE — 113 tests
├── module-lens/                       ← COMPLETE — 58 tests
├── module-cpmi/                       ← COMPLETE — 58 tests
├── module-agentos/                    ← COMPLETE — 86 tests
├── module-nexus/                      ← COMPLETE — 52 tests
├── module-apex/                       ← COMPLETE — 97 tests (all WB follow-ups closed)
└── e2e/                               ← 5 E2E scenarios passing
```

---

## §9 — Intelligence Layer Exposure Requirements

| Field | Required On | Status |
|---|---|---|
| `workflow_step_id` | Every Logger event | Enforced |
| `decision_type` | Every human decision | Enforced |
| `TASK_APPROVAL` / `TASK_CANCELLATION` | AgentOS task decisions | LIVE |
| `GATE_3_ATTESTATION` | CPMI Gate 3 + APEX Gate 3 | LIVE — both corrected |
| `MODEL_EVALUATION_COMPLETE` | evaluate.py runs | LIVE |
| `AGENT_MESSAGE_SENT/RECEIVED` | A2A messages | LIVE |
| `REPORT_ATTESTATION` | APEX report export | LIVE (GD-16) |
| `WORKFLOW_APPROVAL` | FLOWPATH artifact approval | GD-18 — Session 20 |
| `VALIDATION_SIGN_OFF` | APEX pre-review validation | GD-18 — Session 20 |
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
| HumanDecisionType | governance | 16 members (18 after GD-18) |
| ApexReportType / RiskFinding / ApexAnalysisOutput | governance | LIVE (GD-16) |
| ProvenanceRecord (module-local) | governance | LIVE — now includes actual value + variance |
| AnalystWorkstyleProfile | user | GD-18 — Session 20 |
| PPBE entities (6) | program | PENDING |

---

## §11 — Current Build Status

### Stages 1–4 — COMPLETE
### Stage 5a (APEX) — COMPLETE + ALL WALKTHROUGH B FOLLOW-UPS CLOSED

**Total tests: 899 JS + 142 Python = 1041**

### Walkthrough B — COMPLETE (June 26, 2026)

All gaps and follow-ups from Walkthrough B resolved.

| ID | Item | Status |
|---|---|---|
| Gap 1/2 | APEX contrast — text on dark backgrounds | **CLOSED** Session 19 — white card pattern |
| Gap 3 | DC-3 provenance missing actual value + variance | **CLOSED** Session 19 |
| Gap 4 (DC-4) | No charts in report output | **CLOSED** Session 19 — CSS indicators |
| Gap 5 (DC-5) | No operational validation cycle | Addressed in FLOWPATH spec §5 — Sessions 20-21 |
| Gap 6 (DC-6) | APEX analytical workspace + source data access | Addressed in FLOWPATH spec §5 — Sessions 20-21 |
| Gap 7 (DC-7) | Conversational analyst interface | Addressed in FLOWPATH spec §5 — Sessions 20-21 |
| AF-1 | Dossier export file not generated | Deferred — future session |
| AF-2 | Export format (CSV for data tables) | Deferred — future session |
| AF-3 / Item 56 | Gate 3 decision_type correction | **CLOSED** — `GATE_3_ATTESTATION` |

### Stage 5b (FLOWPATH) — NEXT (Sessions 20–21)

**Session 20 prerequisites — ALL COMPLETE:**
- FLOWPATH Architecture Spec (`docs/15_FLOWPATH_Architecture.md`) — committed `cd10267`
- GD-18 — pre-approved (June 26, 2026)
- PR-FLOWPATH-001/002/003/004 — approved (June 26, 2026)
- All six FLOWPATH agents — already registered in Agent_Identity_Standard.md

Session 20 is fully unblocked. No governance prerequisites remain.

**UI standard for Sessions 20–21 (non-negotiable):**
Every FLOWPATH screen is built to Gap 5 and Gap 6 standards from the first line of
code. The white content card pattern (white `#ffffff` cards on `#f1f5f9` canvas,
`1px solid #e2e8f0` border) is the approved pattern — apply from day one, not as a
retrofit. Walkthrough C must produce zero contrast gaps and zero Gap 5/6 failures.
Any gap found at Walkthrough C is a build failure in the session that created it.

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
| R12 | PPBE integration | OPEN — sequenced Session 19-22 |
| R13 | NEXUS→AgentOS UI convergence | OPEN — shell-contract decision required |

---

## §13 — Open Governance Items

**CLOSED this version:**
- Item 56 (Gate 3 decision_type correction) — **CLOSED** Session 19
- Walkthrough B Gap 1/2 (APEX contrast) — **CLOSED** Session 19
- Walkthrough B Gap 3 (DC-3 provenance depth) — **CLOSED** Session 19
- DC-4 (report charts) — **CLOSED** Session 19

**Open items carried forward:**

| ID | Item | Target |
|---|---|---|
| Item 53 | AgentOS §5.2 missing (evaluate gates spec section) | Future session |
| Item 54 | evaluate.py cross-runtime adapter (live wiring deferred) | Future session |
| Item 46 | PPBE six governance decisions (D-P1 through D-P6) | Session 19-20 governance |
| Item 42 | GD-10 lift trigger | Future governance session |
| Item 57 | NEXUS→AgentOS shared task surface shell-contract decision | Session 20 governance |
| Item 58 | APEX dossier export file generation (AF-1) | Future session |
| Item 59 | Export format CSV for data tables (AF-2) | Future session |
| **Item 60** | **DC-5 Operational validation cycle** — FLOWPATH elicits, APEX executes. Addressed in FLOWPATH spec §5. Build in Sessions 20-21. | Sessions 20-21 |
| **Item 61** | **DC-6 Analytical workspace + source data access** — FLOWPATH DataSourceRegistry → APEX analyst interface. Addressed in FLOWPATH spec §5. | Sessions 20-21 |
| **Item 62** | **DC-7 Conversational analyst interface** — FLOWPATH OrganizationalVocabulary calibrates APEX guidance. Addressed in FLOWPATH spec §5. | Sessions 20-21 |

**Pre-approved governance decisions:**

| GD | Status | Authorized Session |
|---|---|---|
| GD-18 | **PRE-APPROVED** June 26, 2026 | Session 20 — first deliverable |

**Approved prompts pending registration in code:**

| ID | Prompt | Approved |
|---|---|---|
| PR-FLOWPATH-001 | `flowpath.interviewer` — organizational mode | June 26, 2026 |
| PR-FLOWPATH-002 | `flowpath.interviewer` — individual workstyle mode | June 26, 2026 |
| PR-FLOWPATH-003 | `flowpath.validator` — Five-Question Gate | June 26, 2026 |
| PR-FLOWPATH-004 | `flowpath.analyzer` — workflow analysis | June 26, 2026 |

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.20 (through Session 19).
Shell contract v1.12 · `61594a69…46dfe3` (unchanged). 1041 total tests. 0 vulnerabilities.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. Verify shell-contract.ts SHA-256 = `61594a698da07a4a748259fe23cf2be03d8e6aeaea5c72502f04e0d3e246dfe3` (v1.12).
   **Note: Session 20 D1 advances this to v1.13 — record new hash in Session 20 handoff.**
3. State done condition — wait for Project Principal approval.
4. One component per exchange — build, verify, confirm, proceed.
5. Close with handoff — never skip.

**Session 20 Opening Priorities (in order):**

1. **GD-18** — shell-contract v1.12 → v1.13 (first deliverable, pre-approved)
2. **FLOWPATH scaffold** — `module-flowpath/` structure, all six AgentCards,
   GD-18 types, PR-FLOWPATH-001/002/003/004 prompt files marked APPROVED
3. **Elicitation Session Manager** (Screen 1) — built to Gap 5/6 from day one
4. **Elicitation Dialogue Interface** (Screen 2) — organizational mode
5. **Individual Workstyle Elicitation** (Screen 4) — if Screens 1 and 2 complete

**UI standard (non-negotiable for Session 20 and 21):**
White content card pattern applied to every FLOWPATH screen during initial build.
No FLOWPATH screen passes its done condition without Gap 5 and Gap 6 compliance
explicitly verified. Walkthrough C must find zero contrast gaps.

---

## §16 — Level 1 Walkthrough Protocol (Standing Requirement)

**Walkthrough Schedule:**

| Walkthrough | After Session | Stage | Status |
|---|---|---|---|
| **A** | **16** | **Stage 4** | **COMPLETE — June 25, 2026** |
| **B** | **18** | **Stage 5a (APEX)** | **COMPLETE — June 26, 2026** |
| **C** | **~21** | **Stage 5b (FLOWPATH)** | **NEXT** |
| D | ~25 | Stage 6 (ARIA Suite) | Pending |
| E | ~27 | Pre-IL | Pending |
| F | ~32 | Full platform | Pending |

**Walkthrough C UI standard:** Zero contrast gaps. Zero Gap 5/6 failures. Every screen
passes the five-second orientation test. Sessions 20 and 21 build to this standard from
the first line of code.

---

## §17 — Primary Product Inserts

| Product | Stage | Status |
|---|---|---|
| CPMI | Stage 3 | **COMPLETE — VRS certified** |
| AgentOS | Stage 4 | **COMPLETE** |
| NEXUS | Stage 4 | **COMPLETE** |
| APEX | Stage 5a | **COMPLETE — all Walkthrough B follow-ups closed** · 97 tests |
| FLOWPATH | Stage 5b | **Session 20–21 — NEXT** — all prerequisites complete |
| ARIA Suite | Stage 6 | Sessions 23–25 |

---

## §18 — Companion Suite and Agent Registry

**Companion suite:** FULLY COMPLETE — 384 JS companion tests
**Agent registry: 18 total (all AgentCards active)** — unchanged
**Approved prompts: 14 total**

| ID | Prompt | Approved |
|---|---|---|
| PR-COUNSEL-001/002/003 | COUNSEL analysis, counterargument, pre-mortem | June 15–16, 2026 |
| PR-SCRIBE-001 | SCRIBE drafting engine | June 16, 2026 |
| PR-SCRIBE-004 | SCRIBE style analysis | June 17, 2026 |
| PR-VIGIL-001 | VIGIL triage system | June 17, 2026 |
| PR-VIGIL-002 | VIGIL approval system | June 23, 2026 |
| PR-LENS-001 | LENS explainer system | June 18, 2026 |
| PR-CPMI-001 | CPMI reasoning chain | Prior session |
| PR-APEX-001 | APEX AI assistant | June 25, 2026 |
| **PR-FLOWPATH-001** | **FLOWPATH org elicitation** | **June 26, 2026** |
| **PR-FLOWPATH-002** | **FLOWPATH individual workstyle** | **June 26, 2026** |
| **PR-FLOWPATH-003** | **FLOWPATH completeness gate** | **June 26, 2026** |
| **PR-FLOWPATH-004** | **FLOWPATH workflow analysis** | **June 26, 2026** |

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.26 | June 25, 2026 | Session 17 · GD-15/16 · APEX Stage 5a · 1018 tests |
| v1.27 | June 26, 2026 | Session 18 · GD-17 · APEX Gates tab · WB ready · 1035 tests |
| **v1.28** | **June 26, 2026** | **Session 19 · Item 56 + WB gaps closed · DC-4 charts · GD-18 pre-approved · FLOWPATH prompts approved · 1041 tests · Session 20 unblocked** |

---

## §20 — Full Build Roadmap

### Stage 5a (APEX) — COMPLETE ✅
### Walkthrough B — COMPLETE ✅

### Stage 5b — FLOWPATH

| Session | Type | Scope |
|---|---|---|
| **20** | **Build** | **GD-18 + FLOWPATH scaffold + Screens 1 + 2 + 4** |
| **21** | **Build** | **FLOWPATH Screen 3 + individual workstyle + CPMI-VRS + Item 57** |
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

*(unchanged from v1.27)*

---

*SOVEREIGN Platform Integration Brief v1.28 · June 26, 2026*
*Pre-Decisional · Internal Working Document*

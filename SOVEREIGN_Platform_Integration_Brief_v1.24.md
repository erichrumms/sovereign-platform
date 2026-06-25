# SOVEREIGN Platform Integration Brief
## Version 1.24 | June 24, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.23
**Changed this version:** Session 16 complete (autonomous — D1 GD-12, D2 AgentOS
AgentCards, D3 GD-13 + evaluate.py, D4 GD-14 + A2A layer, D5 E2E suite) ·
shell-contract v1.8→v1.11 across three GDs · hash of record updated ·
Stage 4 COMPLETE · 899→934 tests · Python logger taxonomy drift recorded as
GD-15 (pre-approved re-sync) · §6, §8, §11, §13, §14, §15, §17, §19 updated

---

## §1 — What This Document Is

Mandatory context for every SOVEREIGN Platform development session. Load order:
Integration Brief (current version) → `SOVEREIGN_Agent_to_Agent_Briefing.md` →
`system_prompt.md` → product or companion suite spec → prior session handoff →
`shell-contract.ts`.

Confirm all documents are loaded by name before any build work begins.
Verify shell-contract.ts SHA-256 matches the v1.11 hash of record.

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
**CPMI-VRS AI Governance Standard** — Stage 3 COMPLETE · first VRS certificate issued.
**AgentOS** — **Stage 4 COMPLETE** · full pipeline built and E2E tested.

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH → [Intelligence Layer] → CPMI ✅ → AgentOS ✅ → NEXUS ✅ → APEX → ARIA Suite
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ — COMPLETE
‖ Local LLM: Provider B wired · UNCLASSIFIED-only (GD-10)
‖ A2A: agent-to-agent messaging layer built · synthetic · activates by config
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
   **v1.11 · SHA-256: `78709b213ff9976ecadd4066645a897ece55fb9b3ffb049b59dd02d19c0162db`**
   **(replaces v1.8 hash `bcf9eeb1…9b841f`, retired Session 16)**
9. All prompts registered before build — **9 APPROVED**
10. All agents registered before build — **16 registered**
    (7 companion + 3 CPMI + 3 AgentOS orchestrators — all now with AgentCards)
11. **Five synced copies of shared artifacts** — propagate all changes

**Codebase facts every session must know:**
- Real types: `SovereignRequestContext` / `SovereignLLMResponse` / `ClearanceLevel`
- `createSovereignClient()` unchanged — use `routedComplete()` for routing
- `sovereign-api-client` compiles commonjs — use `process.env`, not `import.meta.env`
- `SovereignEventType` NOT mirrored in `sovereign-data/src/shared-types.ts`
- NEXUS `minimumRole` is `AGENT_OPERATOR`
- GD-10: UNCLASSIFIED only — enforced at api-client AND NEXUS intake
- evaluate.py ↔ evaluate-port.ts is a cross-runtime config seam — not a live call

**Shell-contract version progression this session:**
- v1.8 → v1.9 (GD-12: Orchestration AgentClass)
- v1.9 → v1.10 (GD-13: MODEL_EVALUATION_COMPLETE)
- v1.10 → v1.11 (GD-14: AGENT_MESSAGE_SENT / AGENT_MESSAGE_RECEIVED)

**GD-15 — Python Logger Taxonomy Re-sync (pre-approved, next available session):**
`sovereign-security/sovereign_logger.py` `APPROVED_EVENT_TYPES` is missing ~30
event types from GD-2 through GD-11, and `APPROVED_DECISION_TYPES` is missing 5
members added since GD-6. This is a Constraint #11 gap — the Python logger is a
synced copy of the shell-contract taxonomy. GD-15 is a dedicated re-sync pass that
propagates all missing types to match shell-contract v1.11. Pre-approved by this
entry. No new event types — this is a catch-up only.

**GD-10 — Classification Boundary (permanent until formally lifted):**
UNCLASSIFIED only. CUI/SECRET/TOP_SECRET throw `ClassificationNotAuthorizedError`.

---

## §7 — CPMI Enhanced Monitoring

CPMI at **0.7× anomaly threshold** — architectural constant. First VRS certificate
issued June 24, 2026. Stage 3 COMPLETE.

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← git main · HEAD 058e630
├── SOVEREIGN_Platform_Integration_Brief_v1.24.md
├── Agent_Identity_Standard.md         ← v1.3 · 16 agents · all AgentCards active
├── sovereign-security/                ← 142 Python tests · evaluate.py added
│   └── evaluate.py                    ← NEW S16 · CPMI-VRS four-gate pipeline
├── sovereign-api-client/              ← 174 tests
├── sovereign-data/                    ← 43 tests · HumanDecisionType 15 members
├── sovereign-shell/
│   ├── shell-contract.ts              ← v1.11 · SHA 78709b21…0162db
│   └── src/register-modules.ts
├── module-counsel/                    ← COMPLETE — 91 tests
├── module-scribe/                     ← COMPLETE — 122 tests
├── module-vigil/                      ← COMPLETE — 113 tests
├── module-lens/                       ← COMPLETE — 58 tests
├── module-cpmi/                       ← COMPLETE — 58 tests
├── module-agentos/                    ← COMPLETE — 81 tests
│   └── src/
│       ├── agentos-message.ts         ← NEW S16 · A2A message contract
│       ├── message-bus.ts             ← NEW S16 · injectable MessageBus
│       └── useMessageBus.ts           ← NEW S16 · A2A hook
├── module-nexus/                      ← COMPLETE — 48 tests
├── e2e/                               ← NEW S16 · 4 E2E scenario tests
└── docs/ [all architecture specs]
```

**Git:** Branch `main`. HEAD `058e630`.

---

## §9 — Intelligence Layer Exposure Requirements

| Field | Required On | Status |
|---|---|---|
| `workflow_step_id` | Every Logger event | Enforced |
| `decision_type` | Every human decision | Enforced |
| `TASK_APPROVAL` / `TASK_CANCELLATION` | AgentOS task decisions | LIVE |
| `GATE_3_ATTESTATION` | CPMI Gate 3 | LIVE |
| `CPMI_REASONING_CHAIN_COMPLETE` | Every chain | LIVE |
| `INFERENCE_CALL` | Every inference call | LIVE |
| `MODEL_EVALUATION_COMPLETE` | evaluate.py runs | LIVE — S16 |
| `AGENT_MESSAGE_SENT/RECEIVED` | A2A messages | LIVE — S16 |
| PPBE decision events | PPBE phase transitions | DEFERRED — Session 22+ |

---

## §10 — Shared Data Dictionary

| Entity | Classification | Status |
|---|---|---|
| Employee, Program, Cost Code, Document, Vendor | program | Implemented |
| StyleProfile | user | LIVE |
| LensExplanation | companion | LIVE |
| ReasoningChainOutput | governance | LIVE |
| ClearanceLevel | infrastructure | LIVE (UNCLASSIFIED only) |
| HumanDecisionType | governance | 15 members |
| PPBE entities (6) | program | PENDING — Session 22+ |

---

## §11 — Current Build Status

### Stage 1 — COMPLETE (142 Python tests)
### Stage 2 — COMPLETE (companion suite — 442 JS tests)
### Stage 3 — COMPLETE (CPMI — 58 JS tests · VRS certified)
### Stage 4 — **COMPLETE**

| Deliverable | Status |
|---|---|
| Local LLM infrastructure | ✅ S13 |
| GD-10 classification boundary | ✅ S14 |
| AgentOS scaffold + full task lifecycle | ✅ S14–S15 |
| NEXUS scaffold + core | ✅ S15 |
| GD-12 Orchestration AgentClass + AgentCards | ✅ **S16** |
| evaluate.py CPMI-VRS pipeline | ✅ **S16** |
| AgentOS A2A communication layer | ✅ **S16** |
| E2E test suite (4 scenarios, all pass) | ✅ **S16** |
| Python logger re-sync (GD-15) | Pending — next available session |

**Total tests passing: 792 JS + 142 Python = 934 total**

### E2E Scenarios (all passing)

| Scenario | Result |
|---|---|
| COMPLIANCE_CHECK → approval required → IN_PROGRESS | ✅ |
| DOCUMENT_REVIEW → no approval → IN_PROGRESS direct | ✅ |
| CUI intake → ClassificationNotAuthorizedError | ✅ |
| GOVERNANCE_QUERY → VIGIL rejects → REJECTED | ✅ |

### Stage 5 — NEXT (APEX + FLOWPATH)

| Session | Scope |
|---|---|
| **Walkthrough A** | Level 1: Stage 4 end-to-end validation in browser |
| 17 | APEX scaffold + core |
| 18 | APEX completion + CPMI-VRS certification |
| Walkthrough B | Stage 5a validation |

---

## §12 — Risk Register

| ID | Risk | Status |
|---|---|---|
| R1 | Human-review-volume | OPEN |
| R2–R3 | AI Provider / Agent Operator | **CLOSED** |
| R4 | Federal Workforce Transition | OPEN — LENS mitigates |
| R5 | CPMI world model REST API | MITIGATED |
| R6 | AgentOS evaluate.py | **CLOSED** — evaluate.py built S16 |
| R7 | Tier 2 LLM Provider | **CLOSED** |
| R8 | Shell ↔ module contract drift | MITIGATED |
| R9 | NEXUS ATO timeline | OPEN — Stage 5 |
| R10–R11 | AgentOS surface / alert response | **CLOSED** |
| R12 | PPBE integration | OPEN — sequenced Session 19–22 |

---

## §13 — Open Governance Items

**CLOSED this session:**
- GD-12 Orchestration AgentClass — **CLOSED** (S16 D1)
- AgentOS AgentCards blocker (item 43) — **CLOSED** (S16 D2)
- evaluate.py (item 45) — **CLOSED** (S16 D3)
- AgentOS A2A (item in roadmap) — **CLOSED** (S16 D4)
- E2E test suite — **CLOSED** (S16 D5)

**New from Session 16:**
52. **GD-15 — Python logger taxonomy re-sync** (pre-approved in §6).
    `APPROVED_EVENT_TYPES` missing ~30 types from GD-2…GD-11.
    `APPROVED_DECISION_TYPES` missing 5 members since GD-6.
    Dedicated catch-up pass — no new types, re-sync only. Do in next
    available session before any Python-side emission is needed.
53. **`docs/11_AgentOS_Architecture.md` §5.2 missing** — referenced for
    evaluate.py gates but section does not exist. Add for the record.
54. **evaluate.py ↔ evaluate-port.ts cross-runtime adapter** — config seam
    is wired; live cross-language adapter needed when real model evaluation runs.

**Carried (all prior items):**
- GD-10 lift trigger (item 42)
- Model registry placeholder sha256 (item 36)
- Alert-response HumanDecisionType (item 18)
- PPBE six governance decisions (item 46) — Session ~19
- Legacy AgentApprovalQueue.tsx stub (item 26)

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.17 (through Session 16).
Shell contract v1.11 · `78709b21…0162db`.
`@sovereign/data` v1.2.0 · unchanged S16.
0 production vulnerabilities.

**Running test totals:** pytest 142 · api-client 174 · data 43 · counsel 91 ·
scribe 122 · vigil 113 · lens 58 · cpmi 58 · agentos 81 · nexus 48 · e2e 4 =
**792 JS + 142 Python = 934 total**.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. Verify shell-contract.ts SHA-256 = `78709b21…0162db` (v1.11).
3. State done condition — wait for Project Principal approval.
4. One component per exchange — build, verify, confirm, proceed.
5. Close with handoff — never skip.

**Next action: Walkthrough A (Level 1 validation) — Claude Chat session.**
No build work until Walkthrough A is complete.

---

## §16 — Level 1 Walkthrough Protocol (Standing Requirement)

A Level 1 walkthrough is conducted after each Stage completes. The Project
Principal operates the live platform in a browser while Claude Chat provides
step-by-step guidance.

**How it works:**
1. Open dev server: `cd ~/Developer/sovereign-platform/sovereign-shell && npm run dev`
2. Claude Chat provides a scenario script (synthetic program office situation)
3. Project Principal works through scenario in the browser with screenshot confirmation
4. Gaps found become first deliverables of the next build session

**Walkthrough Schedule:**

| Walkthrough | After Session | Stage | Scope |
|---|---|---|---|
| **A** | **16 ← NEXT** | **Stage 4** | **NEXUS → AgentOS → VIGIL → CPMI pipeline** |
| B | ~18 | Stage 5a (APEX) | Add analytics to pipeline |
| C | ~21 | Stage 5b (FLOWPATH) | FLOWPATH → CPMI → NEXUS |
| D | ~25 | Stage 6 (ARIA Suite) | Compliance, audit, risk certification |
| E | ~27 | Pre-IL | Complete platform demo dry run |
| F | ~32 | Full platform | All seven products end to end |

---

## §17 — Primary Product Inserts

| Product | Stage | Status |
|---|---|---|
| CPMI | Stage 3 | **COMPLETE — VRS certified** |
| AgentOS | Stage 4 | **COMPLETE — S16** |
| NEXUS | Stage 4 | **COMPLETE — S15** |
| APEX | Stage 5 | Sessions 17–18 |
| FLOWPATH | Stage 5 | Sessions 20–21 |
| ARIA Suite | Stage 6 | Sessions 23–25 |

---

## §18 — Companion Suite — FULLY COMPLETE

16 registered agents · 9 approved prompts · 442 JS companion tests

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.22 | June 24, 2026 | Session 15: NEXUS, shell v1.8, 899 tests |
| v1.23 | June 24, 2026 | Walkthrough cadence + PPBE sequence + build roadmap |
| **v1.24** | **June 24, 2026** | **Session 16: shell v1.11 (GD-12/13/14), AgentCards, evaluate.py, A2A, E2E suite, Stage 4 COMPLETE, 934 tests, HEAD 058e630** |

---

## §20 — Full Build Roadmap

### Stage 4 — **COMPLETE**

| Session | Type | Scope | Status |
|---|---|---|---|
| 16 | Build | GD-12/13/14 · AgentCards · evaluate.py · A2A · E2E | ✅ |
| **Walkthrough A** | **Validation** | **Stage 4 end-to-end** | **← NEXT** |

### Stage 5 — APEX + FLOWPATH

| Session | Type | Scope |
|---|---|---|
| 17 | Build (autonomous) | APEX scaffold + core |
| 18 | Build (autonomous) | APEX completion + CPMI-VRS certification |
| **Walkthrough B** | Validation | Stage 5a: APEX analytics in pipeline |
| 19 | Governance | PPBE six decisions (D-P1–D-P6) — Claude Chat |
| 20 | Build (autonomous) | FLOWPATH scaffold + core |
| 21 | Build (autonomous) | FLOWPATH completion + CPMI-VRS certification |
| **Walkthrough C** | Validation | Stage 5b: FLOWPATH → CPMI → NEXUS |
| 22 | Build | PPBE Phase I integration |

### Stage 6 — ARIA Suite

| Session | Type | Scope |
|---|---|---|
| 23 | Build | CLEAR scaffold + core (compliance reporting) |
| 24 | Build | TRACER scaffold + core (audit trail) |
| 25 | Build | ARC scaffold + core (risk certification) |
| **Walkthrough D** | Validation | Stage 6: compliance + audit + risk |

### Stage 7 — Demo Hardening

| Session | Type | Scope |
|---|---|---|
| 26 | Build | Fix walkthrough gaps · navigation · polish |
| 27 | Build | PPBE Phase II · integration hardening |
| **Walkthrough E** | Validation | Pre-IL rehearsal: complete platform demo dry run |

### Stage 8 — Intelligence Layer

| Session | Type | Scope |
|---|---|---|
| 28 | Build | Task Decomposition Engine |
| 29 | Build | Judgment Detection |
| 30 | Build | Automatability Scorer |
| 31 | Build | Risk & Failure Modeler |
| 32 | Build | Compliance Mapper + IL integration |
| **Walkthrough F** | Validation | Full platform: all seven products |

### Stage 9 — Production Hardening

| Session | Type | Scope |
|---|---|---|
| 33 | Build | Cross-product failure topology (OWI-INT-001) |
| 34 | Build | ATO preparation · security hardening · runbook |

**Total remaining: ~18 build sessions + 6 walkthroughs**

**GD-15 Python re-sync** can be folded into any upcoming build session
as a first deliverable — takes one commit, no design decisions.

---

*SOVEREIGN Platform Integration Brief v1.24 · June 24, 2026*
*Pre-Decisional · Internal Working Document*

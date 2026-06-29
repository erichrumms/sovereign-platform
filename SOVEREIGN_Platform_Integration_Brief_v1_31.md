# SOVEREIGN Platform Integration Brief
## Version 1.31 | June 29, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.30
**Changed this version:** Walkthrough C COMPLETE (June 29, 2026) · FLOWPATH
CPMI-VRS Gate 3 attested + Gate 4 established · PPBE governance decisions
D-P1 through D-P6 APPROVED · six PPBE agent identities registered ·
`aria.rules-engine` registered · Stage 6 UNBLOCKED · §6, §10, §11, §13,
§15, §17, §18, §19 updated

---

## §1 — What This Document Is

Mandatory context for every SOVEREIGN Platform development session. Load order:
Integration Brief (current version) → `SOVEREIGN_Agent_to_Agent_Briefing.md` →
`system_prompt.md` → product or companion suite spec → prior session handoff →
`shell-contract.ts`.

Confirm all documents are loaded by name before any build work begins.
Verify shell-contract.ts SHA-256 matches the v1.13 hash of record.
**Verify agent count in Agent_Identity_Standard.md by counting the file directly.**
Do NOT rely on this document's agent count claim — count the entries in the file.

---

## §2 — Platform Definition

SOVEREIGN — six primary products (NEXUS, CPMI, APEX, FLOWPATH, AgentOS, ARIA Suite)
plus four companion modules (COUNSEL, SCRIBE, LENS, VIGIL). Intelligence Layer is
the seventh product — must never be lost. PPBE is a governed workflow layer running
on existing products — not a new product.

**Three non-negotiable design outcomes:** Integration reliability · Operational
efficiency · End-to-end security observability.

---

## §3 — Three Shared Infrastructure Layers

**SOVEREIGN Security Observability Framework** — Stage 1 COMPLETE · 142 Python tests.
**CPMI-VRS AI Governance Standard** — Stage 3 COMPLETE · VRS certified.
**AgentOS** — Stage 4 COMPLETE.

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH ✅ → [Intelligence Layer] → CPMI ✅ → AgentOS ✅ → NEXUS ✅ → APEX ✅ → ARIA Suite
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ — COMPLETE
‖ Local LLM: Provider B wired · UNCLASSIFIED-only (GD-10)
‖ A2A: agent-to-agent messaging · synthetic · activates by config
‖ NEXUS→AgentOS: audit trail correct · UI convergence via GD-19 / Session 22
‖ PPBE: governed workflow layer · D-P1–D-P6 APPROVED · agents registered ·
‖       architecture spec pending · integration Session 22+
```

---

## §5 — Governance Role Assignments (Permanent)

| Role | Assigned To | Status |
|---|---|---|
| CPMI Product Owner | Project Principal | Stage 3 COMPLETE |
| ARIA Suite Product Owner | Project Principal | Stage 6 UNBLOCKED |
| PPBE Product Owner | Project Principal | D-P2 APPROVED June 29, 2026 |
| Data Owner / Steward | Project Principal | Active |
| PPBE Data Steward | Project Principal | D-P2 APPROVED June 29, 2026 |
| Agent Operator | Project Principal | R3 CLOSED |

---

## §6 — Standing Development Constraints (Invariant)

1. No independent security, governance, or audit systems
2. No shared entity field-name divergence — use `ClearanceLevel` not `DataClassification`
3. No rewrite debt — connections are configuration changes
4. Every human decision event carries `decision_type`
5. No direct LLM API calls — `createSovereignClient()` only
6. `workflow_step_id` on every Logger event
7. Shell context frozen at **nine exports** (GD-19 pre-approved — advances from 8 to 9
   in Session 22 D1)
8. `shell-contract.ts` —
   **v1.13 · SHA-256: `2a3f0b9d8f390c30e23816e4e928cbcd02ccd59f765294f8ed247d9c75d18569`**
   *(Session 22 D1 advances to v1.14 per GD-19)*
9. All prompts registered before build — **14 APPROVED**
10. All agents registered before build — **verify Agent_Identity_Standard.md directly**.
    Count the entries in the file. Do NOT rely on this document's count claim.
    Pre-PPBE count was disputed (Brief claimed 21; actual tally may be higher).
    PPBE six are registered as of June 29, 2026.
11. **Five synced copies of shared artifacts** — propagate all changes

**Codebase facts every session must know:**
- Real types: `SovereignRequestContext` / `SovereignLLMResponse` / `ClearanceLevel`
- `createSovereignClient()` unchanged — use `routedComplete()` for routing
- CommonJS: `sovereign-api-client` uses `process.env`, not `import.meta.env`
- ESM exception: `module-cpmi`, `module-apex`, `module-flowpath` use `import.meta.env`
  via isolated `anthropic-key.ts` + jest stub — do NOT use `process.env` in those modules
- `SovereignEventType` NOT mirrored in `sovereign-data/src/shared-types.ts`
- NEXUS `minimumRole`: `AGENT_OPERATOR` · APEX: `PLATFORM_ADMIN` · FLOWPATH: `AGENT_OPERATOR`
- GD-10: UNCLASSIFIED only
- `sovereignHold()` does not exist — use `ctx.governance.isOnHold(product)`
- PPBE reserved field names (never use in any other entity):
  `fiscal_year`, `lifecycle_cost_estimate`, `obligation_plan`, `performance_baseline`
- `AnalystWorkstyleProfile`: `data_classification: user` — analyst_id hashed, no admin path
- Approved UI pattern: white cards (`#ffffff`, `1px solid #e2e8f0`) on `#f1f5f9` canvas
- FLOWPATH already in `SovereignProduct` — GD-18's "10→11" was a false premise
- **Gather script filenames must come from the prior session's SBOM §New Components —
  never guess from the spec. The SBOM is the source of truth. (Lesson 11)**
- **ARIA Suite: `aria.rules-engine` is deterministic — not LLM-backed. No
  `sovereign-api-client` calls. No prompt required.**

**GD-19 — Pre-approved for Session 22 (first deliverable):**
Shell-contract v1.13 → v1.14. Adds `TaskSurface` and `SharedTask` types. Adds
`taskSurface` as the ninth shell export. Formally relaxes Constraint #7 from 8 to
9 exports for this one addition. Enables NEXUS→AgentOS UI convergence (Item 57).

**GD-10 — Classification Boundary (permanent):**
UNCLASSIFIED only. CUI/SECRET/TOP_SECRET throw `ClassificationNotAuthorizedError`.

---

## §7 — CPMI Enhanced Monitoring

CPMI at **0.7× anomaly threshold** — architectural constant.
VRS certificate active. Gate 3 attested: CPMI June 25 · APEX June 26 · FLOWPATH June 29.

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← git main · HEAD 474c8c3
├── SOVEREIGN_Platform_Integration_Brief_v1_31.md
├── Agent_Identity_Standard.md         ← verify count directly — PPBE six added
├── AGENT_REFERENCE.md                 ← Lessons 11/12 present
├── sovereign-security/                ← 142 Python tests
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
├── module-flowpath/                   ← COMPLETE — 93 tests
└── e2e/                               ← 6 E2E scenarios passing
```

---

## §9 — Intelligence Layer Exposure Requirements

| Field | Required On | Status |
|---|---|---|
| `workflow_step_id` | Every Logger event | Enforced |
| `decision_type` | Every human decision | Enforced |
| `TASK_APPROVAL` / `TASK_CANCELLATION` | AgentOS task decisions | LIVE |
| `GATE_3_ATTESTATION` | CPMI + APEX + FLOWPATH Gate 3 | LIVE |
| `WORKFLOW_APPROVAL` | FLOWPATH artifact approval | LIVE (GD-18) |
| `VALIDATION_SIGN_OFF` | APEX pre-review validation | LIVE (GD-18) |
| FLOWPATH elicitation events (10) | FLOWPATH sessions | LIVE (GD-18) |
| `PPBE_DECISION` | PPBE resource decisions | PENDING — Session 22+ |
| `PPBE_PHASE_TRANSITION` | PPBE phase handoffs | PENDING — Session 22+ |
| `PPBE_ANOMALY` | PPBE threshold breaches | PENDING — Session 22+ |
| `PPBE_EVALUATION_FINDING` | PPBE evaluation outputs | PENDING — Session 22+ |

---

## §10 — Shared Data Dictionary

| Entity | Classification | Status |
|---|---|---|
| Employee, Program, Cost Code, Document, Vendor | program | Implemented |
| StyleProfile | user | LIVE |
| AnalystWorkstyleProfile | user | LIVE (GD-18) |
| OrganizationalVocabulary | user | LIVE (module-flowpath) |
| WorkflowArtifact / DataSourceRegistry / ValidationCadenceRecord | module-local | LIVE |
| HumanDecisionType | governance | 18 members (GD-18) |
| TaskSurface / SharedTask | infrastructure | GD-19 — Session 22 |
| StrategicObjective | program | APPROVED D-P3 — pending build |
| ProgramRecord (extended) | program | APPROVED D-P3 — pending build |
| BudgetExhibit | program | APPROVED D-P3 — pending build |
| ObligationRecord | program | APPROVED D-P3 — pending build |
| EvaluationFinding | program | APPROVED D-P3 — pending build |
| DependencyMap | program | APPROVED D-P3 — pending build |

---

## §11 — Current Build Status

### Stages 1–5b — COMPLETE
### Walkthrough C — COMPLETE (June 29, 2026)

**Total tests: 993 JS + 142 Python = 1135**

**FLOWPATH CPMI-VRS:** Gate 3 attested June 29, 2026 · Gate 4 established June 29, 2026 · ACTIVE

### Walkthrough C Gaps — Session 22 Fixes

| ID | Gap | Priority |
|---|---|---|
| Gap 1 | Session cards not clickable on Screen 1 | Session 22 — fix before ARIA build |
| Gap 2 | No visual distinction between actionable/non-actionable sessions | Session 22 — fix before ARIA build |
| Gap 3 | Gate warning appears on Screen 2 first load (should appear only after artifact production attempt with gaps remaining) | Session 22 — fix before ARIA build |
| Gap 4 | Elicitation questions use production-line language — rewrite for knowledge work context | Session 22 — fix before ARIA build |
| Gap 5 | My Workstyle question 3 ambiguous — rewrite as: "Are there programs you've reviewed long enough that you know what's normal for them?" | Session 22 — fix before ARIA build |
| Gap 6 | No formal VRS certificate document | Stage 7 / hardening — SCRIBE integration |

### Stage 6 (ARIA Suite) — NEXT

Session 22 begins ARIA Suite scaffold after Walkthrough C gap fixes.

---

## §12 — Risk Register

| ID | Risk | Status |
|---|---|---|
| R1 | Human-review-volume | OPEN |
| R2–R3 | AI Provider / Agent Operator | CLOSED |
| R4 | Federal Workforce Transition | OPEN — LENS mitigates |
| R5 | CPMI world model REST API | MITIGATED |
| R6 | AgentOS evaluate.py | CLOSED |
| R7 | Tier 2 LLM Provider | CLOSED |
| R8 | Shell ↔ module contract drift | MITIGATED |
| R9 | NEXUS ATO timeline | OPEN |
| R10–R11 | AgentOS surface / alert response | CLOSED |
| R12 | PPBE integration | MITIGATED — D-P1–D-P6 approved · agents registered |
| R13 | NEXUS→AgentOS UI convergence | MITIGATED — GD-19 pre-approved |
| R14 | Agent registration gap | MITIGATED — Constraint #10 gate + Lesson 12 |
| R15 | Agent count claim drift in Integration Brief | OPEN — count the file directly at every session open |

---

## §13 — Open Governance Items

**CLOSED this version:**
- Walkthrough C — CLOSED June 29, 2026
- PPBE governance decisions D-P1 through D-P6 — CLOSED June 29, 2026

**Open items:**

| ID | Item | Target |
|---|---|---|
| **GD-19** | **NEXUS→AgentOS taskSurface export — PRE-APPROVED** | **Session 22 D1** |
| Item 57 | NEXUS→AgentOS UI convergence (NexusApp.tsx port flip) | Session 22 |
| WC-1 through WC-5 | Walkthrough C gaps 1–5 (FLOWPATH fixes) | Session 22 — before ARIA build |
| WC-6 | FLOWPATH VRS certificate document (Gap 6) | Stage 7 / hardening |
| Item 42 | GD-10 lift trigger | Future governance |
| Item 58 | APEX dossier export file generation | Future session |
| Item 59 | Export format CSV for data tables | Future session |
| Item 60 | DC-5 Operational validation cycle | FLOWPATH/APEX integration |
| Item 61 | DC-6 Analytical workspace + source data | FLOWPATH/APEX integration |
| Item 62 | DC-7 Conversational analyst interface | FLOWPATH/APEX integration |
| PPBE-SPEC | PPBE Workflow Architecture spec (`docs/17_PPBE_Workflow_Architecture.md`) | Claude Chat — before PPBE Phase II |
| PPBE-PROMPTS | Four PPBE agent prompts (evidence synthesizer, scenario analyst, exhibit drafter, coordination assistant) | Claude Chat — before each relevant build session |

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.22 (through Session 21 — Walkthrough C produced no
code changes). PPBE governance decisions and agent registrations are governance
records, not SBOM entries. Shell contract v1.13 · `2a3f0b9d…d18569`. 1135 total
tests. 0 vulnerabilities.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. Verify shell-contract.ts SHA-256 = `2a3f0b9d…d18569` (v1.13).
   **Session 22 D1 advances to v1.14 per GD-19 — record new hash in handoff.**
3. **Count agent entries in Agent_Identity_Standard.md directly. Record the actual
   count. Do NOT rely on the Integration Brief's count claim.**
4. **Before writing any gather script: read the prior session's SBOM §New Components.
   Use the exact filenames Claude Code recorded. Never guess from the spec. (Lesson 11)**
5. State done condition — wait for Project Principal approval.
6. One component per exchange — build, verify, confirm, proceed.
7. Close with handoff — never skip.

**Session 22 Opening Priorities (in order — complete before ARIA scaffold begins):**
1. **GD-19** — shell-contract v1.13 → v1.14 (taskSurface ninth export)
2. **Item 57** — NEXUS→AgentOS UI convergence (NexusApp.tsx port flip + taskSurface)
3. **WC-1 + WC-2** — FLOWPATH session card clickability and visual distinction
4. **WC-3** — Remove Gate warning from Screen 2 first load
5. **WC-4** — Rewrite elicitation questions for knowledge work language
6. **WC-5** — Clarify My Workstyle question 3
7. **Begin ARIA Suite scaffold** (CLEAR module first)

---

## §16 — Level 1 Walkthrough Protocol (Standing Requirement)

| Walkthrough | After Session | Stage | Status |
|---|---|---|---|
| A | 16 | Stage 4 | COMPLETE — June 25, 2026 |
| B | 18 | Stage 5a (APEX) | COMPLETE — June 26, 2026 |
| C | 21 | Stage 5b (FLOWPATH) | **COMPLETE — June 29, 2026** |
| D | ~25 | Stage 6 (ARIA Suite) | Pending |
| E | ~27 | Pre-IL | Pending |
| F | ~32 | Full platform | Pending |

---

## §17 — Primary Product Inserts

| Product | Stage | Status |
|---|---|---|
| CPMI | Stage 3 | COMPLETE — VRS certified |
| AgentOS | Stage 4 | COMPLETE |
| NEXUS | Stage 4 | COMPLETE |
| APEX | Stage 5a | COMPLETE — VRS certified — 97 tests |
| FLOWPATH | Stage 5b | COMPLETE — VRS certified (Gate 3 June 29) — 93 tests |
| ARIA Suite | Stage 6 | **Session 22–25 — NEXT** · spec required before build |

---

## §18 — Agent and Prompt Registry

**Agent registry: verify Agent_Identity_Standard.md directly — count the entries.**
*Pre-PPBE count was disputed. Six PPBE agents registered June 29, 2026.
`aria.rules-engine` registered June 29, 2026. Count the file.*

**Approved prompts: 14 total — unchanged**
*Four PPBE agent prompts pending — to be authored and approved before relevant
build sessions.*

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.28 | June 26, 2026 | Session 19 · WB gaps closed · GD-18 pre-approved · 1041 tests |
| v1.29 | June 26, 2026 | Session 20 · GD-18 executed · FLOWPATH Screens 1/2/4 · 1094 tests |
| v1.30 | June 26, 2026 | Session 21 · FLOWPATH Stage 5b COMPLETE · GD-19 pre-approved · 1135 tests |
| **v1.31** | **June 29, 2026** | **Walkthrough C COMPLETE · FLOWPATH VRS certified · PPBE D-P1–D-P6 approved · PPBE agents registered · aria.rules-engine registered · Stage 6 UNBLOCKED** |

---

## §20 — Full Build Roadmap

### Stages 1–5b — COMPLETE ✅
### Walkthroughs A, B, C — COMPLETE ✅

### Stage 6 — ARIA Suite

| Session | Type | Scope |
|---|---|---|
| **22** | **Build** | **GD-19 + Item 57 + WC gaps 1–5 + ARIA Suite scaffold (CLEAR)** |
| 23 | Build | CLEAR core completion |
| 24 | Build | TRACER scaffold + core |
| 25 | Build | ARC scaffold + core |
| **Walkthrough D** | Validation | Stage 6 — ARIA Suite in pipeline |

### Stage 7 — Demo Hardening

| Session | Type | Scope |
|---|---|---|
| 26 | Build | Walkthrough D gap fixes + polish + WC-6 (FLOWPATH VRS certificate via SCRIBE) |
| 27 | Build | PPBE Phase II integration + hardening |
| **Walkthrough E** | Validation | Pre-IL demo dry run |

### Stages 8–9 — Intelligence Layer, Production Hardening

*(unchanged)*

---

*SOVEREIGN Platform Integration Brief v1.31 · June 29, 2026*
*Pre-Decisional · Internal Working Document*

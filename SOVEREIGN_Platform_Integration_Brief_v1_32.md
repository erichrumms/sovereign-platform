# SOVEREIGN Platform Integration Brief
## Version 1.32 | June 29, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.31
**Changed this version:** Session 22 complete · GD-19 executed (shell-contract v1.14) ·
Item 57 closed (NEXUS→AgentOS convergence live) · Walkthrough C gaps 1–5 fixed ·
ARIA Suite scaffold live (Stage 6 started) · aria.rules-engine carded ·
Agent audit verified 36 agents · 1160 total tests · §6, §8, §11, §13, §14, §15,
§17, §18, §19 updated

---

## §1 — What This Document Is

Mandatory context for every SOVEREIGN Platform development session. Load order:
Integration Brief (current version) → `SOVEREIGN_Agent_to_Agent_Briefing.md` →
`system_prompt.md` → product or companion suite spec → prior session handoff →
`shell-contract.ts`.

Confirm all documents are loaded by name before any build work begins.
Verify shell-contract.ts SHA-256 matches the v1.14 hash of record.
**Verify agent count in Agent_Identity_Standard.md by counting the file directly.
Expected: 36. Do NOT rely on this document's count claim.**

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
FLOWPATH ✅ → [Intelligence Layer] → CPMI ✅ → AgentOS ✅ → NEXUS ✅ → APEX ✅ → ARIA Suite 🔧
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ — COMPLETE
‖ Local LLM: Provider B wired · UNCLASSIFIED-only (GD-10)
‖ A2A: agent-to-agent messaging · synthetic · activates by config
‖ NEXUS→AgentOS: LIVE via taskSurface (GD-19 / Item 57 — Session 22) ✅
‖ PPBE: governed workflow layer · D-P1–D-P6 approved · agents registered ·
‖       architecture spec pending · integration Session 22+
```

---

## §5 — Governance Role Assignments (Permanent)

| Role | Assigned To | Status |
|---|---|---|
| CPMI Product Owner | Project Principal | Stage 3 COMPLETE |
| ARIA Suite Product Owner | Project Principal | Stage 6 IN PROGRESS |
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
7. Shell context frozen at **nine exports** (GD-19 executed Session 22 — formally
   relaxed from 8 to 9 for the taskSurface addition)
8. `shell-contract.ts` —
   **v1.14 · SHA-256: `2b3d8674c5d350e81324a3eb9b81568fe378dfa1784025bbf898756ef17e9910`**
9. All prompts registered before build — **14 APPROVED**
10. All agents registered before build — **verify Agent_Identity_Standard.md directly**.
    Count the entries. Expected: 36. Do NOT rely on this document's count.
11. **Five synced copies of shared artifacts** — propagate all changes

**Codebase facts every session must know:**
- Real types: `SovereignRequestContext` / `SovereignLLMResponse` / `ClearanceLevel`
- `createSovereignClient()` unchanged — use `routedComplete()` for routing
- CommonJS: `sovereign-api-client` uses `process.env`, not `import.meta.env`
- ESM exception: `module-cpmi`, `module-apex`, `module-flowpath`, `module-aria`
  use `import.meta.env` via isolated `anthropic-key.ts` + jest stub
- `SovereignEventType` NOT mirrored in `sovereign-data/src/shared-types.ts`
- `HumanDecisionType` has 18 members (after GD-18)
- NEXUS `minimumRole`: `AGENT_OPERATOR` · APEX: `PLATFORM_ADMIN` ·
  FLOWPATH: `AGENT_OPERATOR` · ARIA Suite: `PLATFORM_ADMIN`
- GD-10: UNCLASSIFIED only
- `sovereignHold()` does not exist — use `ctx.governance.isOnHold(product)`
- NEXUS→AgentOS convergence is LIVE — `NexusApp` wires `createAgentOSBackedPort`;
  NEXUS-originated tasks are read-only in AgentOS (provenance tag, no Cancel)
- `aria.rules-engine` is deterministic — no `sovereign-api-client` calls, no prompt
- PPBE reserved field names (never use): `fiscal_year`, `lifecycle_cost_estimate`,
  `obligation_plan`, `performance_baseline`
- `AnalystWorkstyleProfile`: `data_classification: user` — analyst_id hashed, no admin path
- Approved UI pattern: white cards (`#ffffff`, `1px solid #e2e8f0`) on `#f1f5f9` canvas
- **Gather script filenames must come from the prior session's SBOM §4 New Components.
  Never guess from the spec. The SBOM is the source of truth. (Lesson 11)**
- **Agent count from the file, not this Brief. Count the entries. (Lesson 12)**

**Agent audit findings (Session 22 D0 — carried forward):**
- F-2 (non-blocking): 8 registered agents implemented-but-not-carded (2 NEXUS + 6
  AgentOS core). Known design state, not a Constraint #10 violation.
- F-3 (non-blocking): AgentOS dispatcher uses hyphenated ids/Operational class vs.
  canonical dotted ids/Orchestration. Representational nuance, not a conflict.

**GD-10 — Classification Boundary (permanent):**
UNCLASSIFIED only. CUI/SECRET/TOP_SECRET throw `ClassificationNotAuthorizedError`.

---

## §7 — CPMI Enhanced Monitoring

CPMI at **0.7× anomaly threshold** — architectural constant.
VRS certificates active: CPMI (June 25) · APEX (June 26) · FLOWPATH (June 29).

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← git main · HEAD 1e9c432
├── SOVEREIGN_Platform_Integration_Brief_v1_32.md
├── Agent_Identity_Standard.md         ← 36 agents · all AgentCards active
├── AGENT_REFERENCE.md                 ← Lessons 11/12 present
├── SOVEREIGN_Agent_Audit_20260629.md  ← Session 22 D0 — 36 verified
├── sovereign-security/                ← 142 Python tests
├── sovereign-api-client/              ← 174 tests
├── sovereign-data/                    ← 43 tests
├── sovereign-shell/shell-contract.ts  ← v1.14 · SHA 2b3d8674…e9910
├── module-counsel/                    ← COMPLETE — 91 tests
├── module-scribe/                     ← COMPLETE — 122 tests
├── module-vigil/                      ← COMPLETE — 113 tests
├── module-lens/                       ← COMPLETE — 58 tests
├── module-cpmi/                       ← COMPLETE — 58 tests
├── module-agentos/                    ← COMPLETE — 89 tests
├── module-nexus/                      ← COMPLETE — 52 tests
├── module-apex/                       ← COMPLETE — 97 tests
├── module-flowpath/                   ← COMPLETE — 98 tests
├── module-aria/                       ← Stage 6 IN PROGRESS — 17 tests (scaffold)
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
| `AGENTOS_TASK_ASSIGNED` | NEXUS→AgentOS task hand-off | LIVE (GD-19 / Item 57) |
| ARIA compliance events (4) | ARIA CLEAR/TRACER/ARC | PENDING — Sessions 23–25 |
| PPBE decision events (4) | PPBE transitions | DEFERRED — Session 22+ |

---

## §10 — Shared Data Dictionary

| Entity | Classification | Status |
|---|---|---|
| Employee, Program, Cost Code, Document, Vendor | program | Implemented |
| StyleProfile | user | LIVE |
| AnalystWorkstyleProfile | user | LIVE (GD-18) |
| OrganizationalVocabulary | user | LIVE (module-flowpath) |
| WorkflowArtifact / DataSourceRegistry / ValidationCadenceRecord | module-local | LIVE |
| SharedTask / TaskSurface | infrastructure | LIVE (GD-19) |
| HumanDecisionType | governance | 18 members (GD-18) |
| StrategicObjective | program | APPROVED D-P3 — pending build |
| ProgramRecord (extended) | program | APPROVED D-P3 — pending build |
| BudgetExhibit | program | APPROVED D-P3 — pending build |
| ObligationRecord | program | APPROVED D-P3 — pending build |
| EvaluationFinding | program | APPROVED D-P3 — pending build |
| DependencyMap | program | APPROVED D-P3 — pending build |

---

## §11 — Current Build Status

### Stages 1–5b — COMPLETE
### Walkthroughs A, B, C — COMPLETE
### Stage 6 (ARIA Suite) — IN PROGRESS

**Total tests: 1018 JS + 142 Python = 1160**

### Session 22 Deliverables — All Complete

| Deliverable | Commit | Status |
|---|---|---|
| D0 — Agent audit (36 verified, 0 violations) | `594d0b7` | ✅ |
| D1 — GD-19 shell-contract v1.14 | `e3092fe` | ✅ |
| D2 — Item 57 NEXUS→AgentOS convergence | `2a8a53a` | ✅ |
| D3 — WC-1 session cards clickable | `1025d22` | ✅ |
| D3 — WC-2 session card visual distinction | `e0cabe3` | ✅ |
| D3 — WC-3 gate warning timing fixed | `8a3b8d5` | ✅ |
| D3 — WC-4 elicitation questions rewritten | `913beba` | ✅ |
| D3 — WC-5 workstyle question 3 rewritten | `fd39997` | ✅ |
| D4 — ARIA Suite scaffold (17 tests) | `cfb6b02` | ✅ |

### Stage 6 (ARIA Suite) — Sessions 23–25

| Session | Scope | Status |
|---|---|---|
| **23** | **CLEAR core** | **NEXT** |
| 24 | TRACER core | Pending |
| 25 | ARC core + CPMI-VRS certification | Pending |
| Walkthrough D | Stage 6 validation | Pending |

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
| R13 | NEXUS→AgentOS UI convergence | **CLOSED** — Item 57 live (Session 22) |
| R14 | Agent registration gap | MITIGATED — Constraint #10 gate + Lesson 12 |
| R15 | Agent count claim drift | MITIGATED — D0 audit verified 36; count from file each session |

---

## §13 — Open Governance Items

**CLOSED this version:**
- GD-19 — APPLIED Session 22
- Item 57 — CLOSED Session 22
- WC-1 through WC-5 — CLOSED Session 22

**Open items:**

| ID | Item | Target |
|---|---|---|
| WC-6 | FLOWPATH VRS certificate document (Gap 6) | Stage 7 / hardening — SCRIBE integration |
| F-2 | 8 agents implemented-but-not-carded | Future session — issue AgentCards or update standard |
| F-3 | AgentOS dispatcher id/class nuance | Future session — tidiness only |
| Item 42 | GD-10 lift trigger | Future governance |
| Item 58 | APEX dossier export file generation | Future session |
| Item 59 | Export format CSV for data tables | Future session |
| Item 60 | DC-5 Operational validation cycle | FLOWPATH/APEX integration |
| Item 61 | DC-6 Analytical workspace + source data | FLOWPATH/APEX integration |
| Item 62 | DC-7 Conversational analyst interface | FLOWPATH/APEX integration |
| PPBE-SPEC | PPBE Workflow Architecture spec (`docs/17_PPBE_Workflow_Architecture.md`) | Claude Chat — before PPBE Phase II |
| PPBE-PROMPTS | Four PPBE agent prompts | Claude Chat — before each relevant build session |

---

## §14 — SBOM Status

Current: `SBOM_Registry_v1.23_MERGED.md` (through Session 22).
Shell contract v1.14 · `2b3d8674…e9910`. 1160 total tests. 0 vulnerabilities.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. Verify shell-contract.ts SHA-256 = `2b3d8674…e9910` (v1.14).
3. **Count agent entries in Agent_Identity_Standard.md directly. Expected: 36.
   Do NOT rely on this Brief's count.**
4. **Before writing any gather script: read the prior session's SBOM §4 New Components.
   Use exact filenames Claude Code recorded. Never guess from the spec. (Lesson 11)**
5. State done condition — wait for Project Principal approval.
6. One component per exchange — build, verify, confirm, proceed.
7. Close with handoff — never skip.

**Session 23 Opening Priorities:**
1. CLEAR Compliance Dashboard (three monitoring surfaces)
2. CLEAR Certification Queue (human-facing panel + decision gate)
3. CLEAR rule evaluation engine (deterministic, four regulatory sources)
4. VIGIL integration (ARIA_VIOLATION_FLAGGED + ARIA_CALENDAR_ALERT events)
5. SCRIBE export gate integration (CLEAR certification required before export)
6. Four Logger event types added to sovereign_logger.py
7. Target: ~25 additional tests · CLEAR fully functional end-to-end

---

## §16 — Level 1 Walkthrough Protocol (Standing Requirement)

| Walkthrough | After Session | Stage | Status |
|---|---|---|---|
| A | 16 | Stage 4 | COMPLETE — June 25, 2026 |
| B | 18 | Stage 5a (APEX) | COMPLETE — June 26, 2026 |
| C | 21 | Stage 5b (FLOWPATH) | COMPLETE — June 29, 2026 |
| **D** | **~25** | **Stage 6 (ARIA Suite)** | **Pending — after Session 25** |
| E | ~27 | Pre-IL | Pending |
| F | ~32 | Full platform | Pending |

---

## §17 — Primary Product Inserts

| Product | Stage | Status |
|---|---|---|
| CPMI | Stage 3 | COMPLETE — VRS certified |
| AgentOS | Stage 4 | COMPLETE — 89 tests |
| NEXUS | Stage 4 | COMPLETE — 52 tests · NEXUS→AgentOS convergence LIVE |
| APEX | Stage 5a | COMPLETE — VRS certified — 97 tests |
| FLOWPATH | Stage 5b | COMPLETE — VRS certified — 98 tests · WC gaps closed |
| **ARIA Suite** | **Stage 6** | **IN PROGRESS — 17 tests (scaffold) · CLEAR next (Session 23)** |

---

## §18 — Agent and Prompt Registry

**Agent registry: 36 total — verified Session 22 D0 audit**
**Constraint #10 violations: 0**
**Approved prompts: 14 total — unchanged**

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.29 | June 26, 2026 | Session 20 · GD-18 · FLOWPATH Screens 1/2/4 · 1094 tests |
| v1.30 | June 26, 2026 | Session 21 · FLOWPATH Stage 5b COMPLETE · GD-19 pre-approved · 1135 tests |
| v1.31 | June 29, 2026 | Walkthrough C COMPLETE · PPBE D-P1–D-P6 · PPBE agents registered · 36 agents |
| **v1.32** | **June 29, 2026** | **Session 22 · GD-19 executed · Item 57 LIVE · WC gaps closed · ARIA scaffold · 1160 tests** |

---

## §20 — Full Build Roadmap

### Stages 1–5b — COMPLETE ✅
### Walkthroughs A, B, C — COMPLETE ✅
### Stage 6 — ARIA Suite (IN PROGRESS)

| Session | Type | Scope |
|---|---|---|
| 22 | Build | GD-19 + Item 57 + WC gaps + ARIA scaffold — **COMPLETE** |
| **23** | **Build** | **CLEAR core** |
| 24 | Build | TRACER core |
| 25 | Build | ARC core + CPMI-VRS certification |
| **Walkthrough D** | Validation | Stage 6 — ARIA Suite in pipeline |

### Stages 7–9 — Demo Hardening, Intelligence Layer, Production

*(unchanged)*

---

*SOVEREIGN Platform Integration Brief v1.32 · June 29, 2026*
*Pre-Decisional · Internal Working Document*

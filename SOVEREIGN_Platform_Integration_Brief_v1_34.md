# SOVEREIGN Platform Integration Brief
## Version 1.34 | June 29, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.33
**Changed this version:** Time & Travel workflow layer D-TT1–D-TT6 APPROVED ·
eight Time & Travel agents registered (36 → 44) · docs/17 authored ·
§2, §5, §6, §10, §13, §18, §19 updated

---

## §1 — What This Document Is

Mandatory context for every SOVEREIGN Platform development session. Load order:
Integration Brief (current version) → `SOVEREIGN_Agent_to_Agent_Briefing.md` →
`system_prompt.md` → product or companion suite spec → prior session handoff →
`shell-contract.ts`.

Confirm all documents are loaded by name before any build work begins.
**Session 23 (retry): shell-contract opens at v1.14. D1 advances to v1.15 per GD-20.**
Verify agent count in Agent_Identity_Standard.md by counting the file directly.
Expected: **44**.

---

## §2 — Platform Definition

SOVEREIGN — six primary products (NEXUS, CPMI, APEX, FLOWPATH, AgentOS, ARIA Suite)
plus four companion modules (COUNSEL, SCRIBE, LENS, VIGIL). Intelligence Layer is
the seventh product — must never be lost.

**Two governed workflow layers (not products):**
- **PPBE** — Planning, Programming, Budgeting, and Evaluation (D-P1–D-P6 approved)
- **Time & Travel** — Travel Management and Time & Expense compliance (D-TT1–D-TT6 approved)

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
‖ NEXUS→AgentOS: LIVE via taskSurface (GD-19) ✅
‖ PPBE: governed workflow layer · D-P1–D-P6 approved · agents registered · build pending
‖ Time & Travel: governed workflow layer · D-TT1–D-TT6 approved · agents registered ·
‖               build after ARIA Suite complete + Walkthrough D
```

---

## §5 — Governance Role Assignments (Permanent)

| Role | Assigned To | Status |
|---|---|---|
| CPMI Product Owner | Project Principal | Stage 3 COMPLETE |
| ARIA Suite Product Owner | Project Principal | Stage 6 IN PROGRESS |
| PPBE Product Owner | Project Principal | D-P2 APPROVED |
| PPBE Data Steward | Project Principal | D-P2 APPROVED |
| Time & Travel Owner | Project Principal | D-TT2 APPROVED June 29, 2026 |
| Time & Travel Data Steward | Project Principal | D-TT2 APPROVED June 29, 2026 |
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
7. Shell context at **nine exports** currently (v1.14). GD-20 advances to ten (v1.15)
   as Session 23 (retry) D1. No further additions without a new GD.
8. `shell-contract.ts` —
   **v1.14 · SHA-256: `2b3d8674c5d350e81324a3eb9b81568fe378dfa1784025bbf898756ef17e9910`**
   *(Session 23 retry D1 advances to v1.15 per GD-20)*
9. All prompts registered before build — **14 APPROVED**
   *(Two Time & Travel prompts pending — approved before Phase II build)*
10. All agents registered before build — **verify Agent_Identity_Standard.md directly**.
    **Expected: 44.** Do NOT rely on this Brief's count.
11. **Five synced copies of shared artifacts** — propagate all changes

**Codebase facts every session must know:**
- Real types: `SovereignRequestContext` / `SovereignLLMResponse` / `ClearanceLevel`
- `createSovereignClient()` unchanged — use `routedComplete()` for routing
- CommonJS: `sovereign-api-client` uses `process.env`, not `import.meta.env`
- ESM exception: `module-cpmi`, `module-apex`, `module-flowpath`, `module-aria` use
  `import.meta.env` via isolated `anthropic-key.ts` + jest stub
- `SovereignEventType` NOT mirrored in `sovereign-data/src/shared-types.ts`
- `HumanDecisionType` has 18 members at v1.14; 19 after GD-20 D1
- ARIA Suite minimumRole: `PLATFORM_ADMIN`
- `aria.rules-engine` is deterministic — no `sovereign-api-client` calls, no prompt
- `ctx.aria` does not exist at v1.14 — added as tenth export by GD-20 D1
- PPBE reserved field names (never use): `fiscal_year`, `lifecycle_cost_estimate`,
  `obligation_plan`, `performance_baseline`
- `AnalystWorkstyleProfile`: `data_classification: user` — analyst_id hashed
- `tt.pattern-analyst` individual baseline data: `data_classification: user` —
  employee ID hashed before logging, no admin read path
- Time & Travel deterministic agents do not call `sovereign-api-client`
- Approved UI pattern: white cards (`#ffffff`, `1px solid #e2e8f0`) on `#f1f5f9` canvas
- **Gather script filenames from prior SBOM §4. Never guess from spec. (Lesson 11)**
- **Agent count from the file, not this Brief. Expected: 44. (Lesson 12)**

**GD-20 — APPROVED June 29, 2026 — execute as Session 23 (retry) D1:**
Shell-contract v1.14 → v1.15. +4 `SovereignEventType` ARIA CLEAR types. +1
`HumanDecisionType` (`COMPLIANCE_CERTIFICATION`). +`ctx.aria` as tenth export.
Constraint #7 relaxed 9→10. Full Constraint #11 propagation required.

**GD-10 — Classification Boundary (permanent):**
UNCLASSIFIED only. CUI/SECRET/TOP_SECRET throw `ClassificationNotAuthorizedError`.

---

## §7 — CPMI Enhanced Monitoring

CPMI at **0.7× anomaly threshold** — architectural constant.
VRS certificates active: CPMI · APEX · FLOWPATH.

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← git main · HEAD 2c452f5
├── SOVEREIGN_Platform_Integration_Brief_v1_34.md
├── Agent_Identity_Standard.md         ← 44 agents (verify file directly)
├── GD-20_ARIA_CLEAR_ShellContract_APPROVED.md
├── sovereign-shell/shell-contract.ts  ← v1.14 now · v1.15 after Session 23 D1
├── module-aria/                       ← Stage 6 IN PROGRESS — 17 tests
└── docs/
    ├── 13_APEX_Architecture.md
    ├── 14_HumanReviewerStandard.md
    ├── 15_FLOWPATH_Architecture.md
    ├── 16_ARIA_Suite_Architecture.md
    └── 17_TimeAndTravel_Architecture.md  ← NEW
```

---

## §9 — Intelligence Layer Exposure Requirements

*(unchanged from v1.33)*

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
| HumanDecisionType | governance | 18 members (19 after GD-20) |
| StrategicObjective | program | APPROVED D-P3 — pending build |
| ProgramRecord (extended) | program | APPROVED D-P3 — pending build |
| BudgetExhibit | program | APPROVED D-P3 — pending build |
| ObligationRecord | program | APPROVED D-P3 — pending build |
| EvaluationFinding | program | APPROVED D-P3 — pending build |
| DependencyMap | program | APPROVED D-P3 — pending build |
| TravelRequest | program | APPROVED D-TT3 — pending build |
| TravelPolicy | program | APPROVED D-TT3 — pending build (produced by FLOWPATH) |
| TimeRecord | program | APPROVED D-TT3 — pending build |
| ChargeAccount | program | APPROVED D-TT3 — extends CostCode — pending build |
| ComplianceFlag | program | APPROVED D-TT3 — pending build |
| CorrectionRecord | program | APPROVED D-TT3 — pending build |

---

## §11 — Current Build Status

### Stages 1–5b — COMPLETE ✅
### Walkthroughs A, B, C — COMPLETE ✅
### Stage 6 (ARIA Suite) — IN PROGRESS

**Total tests: 1018 JS + 142 Python = 1160 (unchanged)**

Session 23 (retry) is the next build session. GD-20 pre-authorized as D1.

---

## §12 — Risk Register

*(unchanged from v1.33)*

---

## §13 — Open Governance Items

**CLOSED this version:**
- Time & Travel D-TT1 through D-TT6 — CLOSED June 29, 2026

**Open items:**

| ID | Item | Target |
|---|---|---|
| GD-20 | Execute as Session 23 (retry) D1 | Session 23 retry |
| docs/16 amendment | §4/§7 re: shell-contract change | Session 23 retry D1 |
| WC-6 | FLOWPATH VRS certificate document | Stage 7 / hardening |
| F-2 | 8 agents implemented-but-not-carded | Future session |
| F-3 | AgentOS dispatcher id/class nuance | Future session |
| PPBE-SPEC | `docs/17_PPBE_Workflow_Architecture.md` | Before PPBE Phase II |
| PPBE-PROMPTS | Four PPBE agent prompts | Before each relevant build session |
| TT-SPEC | `docs/17_TimeAndTravel_Architecture.md` | **COMPLETE — committed this session** |
| TT-PROMPTS | Two Time & Travel drafting prompts | Before Time & Travel Phase II |
| TT-GD-HumanDecision | GD for TRAVEL_APPROVAL / TIME_CORRECTION_SENT / ESCALATION_AUTHORIZED | Before Time & Travel Phase II |

---

## §14 — SBOM Status

Current: `SBOM_Registry_v1.23_MERGED.md` (through Session 22).
Shell contract v1.14 · `2b3d8674…e9910`. 1160 total tests. 0 vulnerabilities.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. Verify shell-contract.ts SHA-256.
3. **Count agent entries directly. Expected: 44. Do NOT rely on this Brief.**
4. Before any gather script: read prior SBOM §4 for exact filenames. (Lesson 11)
5. State done condition — wait for Project Principal approval.
6. One component per exchange — build, verify, confirm, proceed.
7. Close with handoff — never skip.

**Session 23 (retry) Opening Priorities:**
1. GD-20 — shell-contract v1.14 → v1.15 (all changes + Constraint #11 propagation)
2. CLEAR Compliance Dashboard
3. CLEAR Certification Queue (ctx.aria, SCRIBE gate)
4. CLEAR rule evaluation engine (deterministic, four regulatory sources)
5. VIGIL integration
6. Tests and close verification

---

## §16 — Level 1 Walkthrough Protocol

*(unchanged from v1.32)*

---

## §17 — Primary Product Inserts

| Product | Stage | Status |
|---|---|---|
| CPMI | Stage 3 | COMPLETE — VRS certified |
| AgentOS | Stage 4 | COMPLETE — 89 tests |
| NEXUS | Stage 4 | COMPLETE — 52 tests |
| APEX | Stage 5a | COMPLETE — VRS certified — 97 tests |
| FLOWPATH | Stage 5b | COMPLETE — VRS certified — 98 tests |
| **ARIA Suite** | **Stage 6** | **IN PROGRESS — GD-20 approved — Session 23 retry NEXT** |

---

## §18 — Agent and Prompt Registry

**Agent registry: 44 total — verify Agent_Identity_Standard.md directly**
- 36 pre-existing (verified Session 22 D0 audit)
- 8 Time & Travel agents registered June 29, 2026 (D-TT5)
- Constraint #10 violations: 0

**Approved prompts: 14 total**
- 2 Time & Travel drafting prompts pending (to be approved before Phase II)
- 4 PPBE agent prompts pending (to be approved before relevant build sessions)

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.32 | June 29, 2026 | Session 22 · GD-19 · Item 57 · ARIA scaffold · 1160 tests |
| v1.33 | June 29, 2026 | Session 23 paused · GD-20 APPROVED · retry authorized |
| **v1.34** | **June 29, 2026** | **Time & Travel D-TT1–D-TT6 approved · 8 agents registered (44 total) · docs/17 authored** |

---

## §20 — Full Build Roadmap

### Stages 1–5b — COMPLETE ✅
### Walkthroughs A, B, C — COMPLETE ✅
### Stage 6 — ARIA Suite (IN PROGRESS)

| Session | Type | Scope |
|---|---|---|
| **23 (retry)** | **Build** | **GD-20 + CLEAR core** |
| 24 | Build | TRACER core |
| 25 | Build | ARC core + CPMI-VRS certification |
| **Walkthrough D** | Validation | Stage 6 — ARIA Suite |

### Workflow Layer Builds (after Walkthrough D)

| Session | Type | Scope |
|---|---|---|
| ~26 | Build | Time & Travel Phase I (engines + queues) |
| ~27 | Build | Time & Travel Phase II (drafting + SCRIBE) |
| ~28 | Build | PPBE Phase I (workflow + Logger) |
| ~29 | Build | PPBE Phase II (APEX + SCRIBE + ARIA) |

### Stages 7–9 — Demo Hardening, Intelligence Layer, Production

*(unchanged)*

---

*SOVEREIGN Platform Integration Brief v1.34 · June 29, 2026*
*Pre-Decisional · Internal Working Document*

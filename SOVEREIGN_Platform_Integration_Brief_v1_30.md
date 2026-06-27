# SOVEREIGN Platform Integration Brief
## Version 1.30 | June 26, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.29
**Changed this version:** Session 21 complete · FLOWPATH Stage 5b COMPLETE ·
Screen 3 + CPMI-VRS Gates tab + benchmark scenarios A/B/C · 1135 total tests ·
module-flowpath 52→93 tests · Item 57 deferred with GD-19 pre-approved ·
Walkthrough C ready · §6, §8, §11, §13, §15, §17, §19 updated

---

## §1 — What This Document Is

Mandatory context for every SOVEREIGN Platform development session. Load order:
Integration Brief (current version) → `SOVEREIGN_Agent_to_Agent_Briefing.md` →
`system_prompt.md` → product or companion suite spec → prior session handoff →
`shell-contract.ts`.

Confirm all documents are loaded by name before any build work begins.
Verify shell-contract.ts SHA-256 matches the v1.13 hash of record.
Verify agent count in Agent_Identity_Standard.md = 21 (count the file directly).

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
**CPMI-VRS AI Governance Standard** — Stage 3 COMPLETE · VRS certified.
**AgentOS** — Stage 4 COMPLETE.

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH ✅ → [Intelligence Layer] → CPMI ✅ → AgentOS ✅ → NEXUS ✅ → APEX ✅ → ARIA Suite
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ — COMPLETE
‖ Local LLM: Provider B wired · UNCLASSIFIED-only (GD-10)
‖ A2A: agent-to-agent messaging · synthetic · activates by config
‖ NEXUS→AgentOS: audit trail correct · UI convergence deferred to GD-19 / Session 22
‖ PPBE: workflow layer · governance decisions pending · integration Session 22+
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
7. Shell context frozen at **nine exports** (GD-19 pre-approved — advances from 8 to 9
   in Session 22 D1)
8. `shell-contract.ts` —
   **v1.13 · SHA-256: `2a3f0b9d8f390c30e23816e4e928cbcd02ccd59f765294f8ed247d9c75d18569`**
   *(Session 22 D1 advances to v1.14 per GD-19)*
9. All prompts registered before build — **14 APPROVED**
10. All agents registered before build — **21 registered** (all AgentCards active)
    **ALWAYS verify Agent_Identity_Standard.md directly — count the entries in the file**
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
- PPBE reserved field names (never use): `fiscal_year`, `lifecycle_cost_estimate`,
  `obligation_plan`, `performance_baseline`
- `AnalystWorkstyleProfile`: `data_classification: user` — analyst_id hashed, no admin path
- Approved UI pattern: white cards (`#ffffff`, `1px solid #e2e8f0`) on `#f1f5f9` canvas
- FLOWPATH already in `SovereignProduct` — GD-18's "10→11" was a false premise
- **Gather script filenames must come from the prior session's SBOM §New Components —
  never guess from the spec. The SBOM is the source of truth. (Lesson 11)**

**GD-19 — Pre-approved for Session 22 (first deliverable):**
Shell-contract v1.13 → v1.14. Adds `TaskSurface` and `SharedTask` types. Adds
`taskSurface` as the ninth shell export. Formally relaxes Constraint #7 from 8 to
9 exports for this one addition. Enables NEXUS→AgentOS UI convergence (Item 57).
Full impact assessment in GD-19 governance decision record.

**GD-10 — Classification Boundary (permanent):**
UNCLASSIFIED only. CUI/SECRET/TOP_SECRET throw `ClassificationNotAuthorizedError`.

---

## §7 — CPMI Enhanced Monitoring

CPMI at **0.7× anomaly threshold** — architectural constant.
VRS certificate issued June 24, 2026. Gate 3 attested June 25, 2026.
Stage 3 fully certified.

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← git main · HEAD b4e0f8b
├── SOVEREIGN_Platform_Integration_Brief_v1_30.md
├── Agent_Identity_Standard.md         ← 21 agents · all AgentCards active
├── AGENT_REFERENCE.md                 ← updated Lessons 11/12
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
| PPBE decision events | PPBE transitions | DEFERRED — Session 22+ |

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
| PPBE entities (6) | program | PENDING |

---

## §11 — Current Build Status

### Stages 1–5b — COMPLETE
### Walkthrough C — READY (Gate 3 wired for Project Principal attestation)

**Total tests: 993 JS + 142 Python = 1135**

### Stage 5b (FLOWPATH) — COMPLETE

All screens, CPMI-VRS certification, and benchmark scenarios complete.

| Deliverable | Status |
|---|---|
| Screen 1 — Elicitation Session Manager | ✅ Session 20 |
| Screen 2 — Elicitation Dialogue (organizational) | ✅ Session 20 |
| Screen 4 — Individual Workstyle Elicitation | ✅ Session 20 |
| Screen 3 — Workflow Artifact Review | ✅ Session 21 |
| CPMI-VRS benchmark scenarios A/B/C | ✅ Session 21 |
| CPMI-VRS Gates tab | ✅ Session 21 — Gate 3 wired for Walkthrough C |
| E2E Scenario 6 (FLOWPATH pipeline) | ✅ Session 20 |
| Item 57 (NEXUS→AgentOS UI convergence) | ⚠ Deferred — GD-19 / Session 22 |
| CPMI-VRS certification | Pending — Gate 3 attestation at Walkthrough C |

**Item 57 is not a Walkthrough C blocker.** The audit trail is correct (E2E
Scenario 5 passing). The UI convergence gap (NEXUS submissions not visible in
AgentOS panel) is addressed by GD-19 in Session 22.

### Walkthrough C — NEXT

**Pre-Walkthrough C checklist:**
- [ ] Start dev server: `cd ~/Developer/sovereign-platform/sovereign-shell && npm run dev`
- [ ] Navigate to FLOWPATH in the shell
- [ ] Confirm all five screens accessible
- [ ] Gate 3 attestation in CPMI-VRS Gates tab (Project Principal step)
- [ ] Gate 4 follows Gate 3

### Stage 6 (ARIA Suite) — NEXT after Walkthrough C

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
| R12 | PPBE integration | OPEN — sequenced Session 22+ |
| R13 | NEXUS→AgentOS UI convergence | MITIGATED — GD-19 pre-approved |
| R14 | Agent registration gap | MITIGATED — Constraint #10 gate + Lesson 12 |

---

## §13 — Open Governance Items

**CLOSED this version:**
- FLOWPATH Stage 5b — CLOSED (Session 21)

**Open items:**

| ID | Item | Target |
|---|---|---|
| **GD-19** | **NEXUS→AgentOS taskSurface export (Item 57) — PRE-APPROVED** | **Session 22 D1** |
| Item 46 | PPBE six decisions (D-P1 through D-P6) | Claude Chat governance session |
| Item 42 | GD-10 lift trigger | Future governance |
| Item 58 | APEX dossier export file generation | Future session |
| Item 59 | Export format CSV for data tables | Future session |
| Item 60 | DC-5 Operational validation cycle | FLOWPATH/APEX integration |
| Item 61 | DC-6 Analytical workspace + source data | FLOWPATH/APEX integration |
| Item 62 | DC-7 Conversational analyst interface | FLOWPATH/APEX integration |

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.22 (through Session 21).
Shell contract v1.13 · `2a3f0b9d…d18569`. 1135 total tests. 0 vulnerabilities.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. Verify shell-contract.ts SHA-256 = `2a3f0b9d…d18569` (v1.13).
   **Session 22 D1 advances to v1.14 per GD-19 — record new hash in handoff.**
3. **Count agent entries in Agent_Identity_Standard.md directly. Expected: 21.
   Do NOT rely on the Brief's count. Verify the file.**
4. **Before writing any gather script: read the prior session's SBOM §New Components.
   Use the exact filenames Claude Code recorded. Never guess from the spec. (Lesson 11)**
5. State done condition — wait for Project Principal approval.
6. One component per exchange — build, verify, confirm, proceed.
7. Close with handoff — never skip.

**Session 22 Opening Priorities:**
1. GD-19 — shell-contract v1.13 → v1.14 (taskSurface ninth export)
2. Item 57 — NEXUS→AgentOS UI convergence (NexusApp.tsx port flip + surface integration)
3. PPBE governance decisions (D-P1 through D-P6) — Claude Chat session, then Session 22
4. Begin ARIA Suite scaffold (Stage 6) if time allows

---

## §16 — Level 1 Walkthrough Protocol (Standing Requirement)

| Walkthrough | After Session | Stage | Status |
|---|---|---|---|
| A | 16 | Stage 4 | COMPLETE — June 25, 2026 |
| B | 18 | Stage 5a (APEX) | COMPLETE — June 26, 2026 |
| **C** | **21** | **Stage 5b (FLOWPATH)** | **READY — Gate 3 wired** |
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
| **FLOWPATH** | **Stage 5b** | **COMPLETE — 93 tests — Walkthrough C READY** |
| ARIA Suite | Stage 6 | Sessions 23–25 — NEXT after Walkthrough C |

---

## §18 — Agent and Prompt Registry

**Agent registry: 21 total — unchanged**
**Approved prompts: 14 total — unchanged**

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.28 | June 26, 2026 | Session 19 · WB gaps closed · GD-18 pre-approved · 1041 tests |
| v1.29 | June 26, 2026 | Session 20 · GD-18 executed · FLOWPATH Screens 1/2/4 · 1094 tests |
| **v1.30** | **June 26, 2026** | **Session 21 · FLOWPATH Stage 5b COMPLETE · Screen 3 + CPMI-VRS · GD-19 pre-approved · 1135 tests · Walkthrough C READY** |

---

## §20 — Full Build Roadmap

### Stages 1–5b — COMPLETE ✅
### Walkthrough C — READY ✅

### Stage 6 — ARIA Suite (after Walkthrough C)

| Session | Type | Scope |
|---|---|---|
| 22 | Build | GD-19 + Item 57 resolution + PPBE decisions + ARIA Suite scaffold |
| 23 | Build | CLEAR core |
| 24 | Build | TRACER core |
| 25 | Build | ARC core |
| **Walkthrough D** | Validation | Stage 6 |

### Stages 7–9 — Demo Hardening, Intelligence Layer, Production

*(unchanged from v1.29)*

---

*SOVEREIGN Platform Integration Brief v1.30 · June 26, 2026*
*Pre-Decisional · Internal Working Document*

# SOVEREIGN Platform Integration Brief
## Version 1.22 | June 24, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.21
**Changed this version:** Session 15 complete (autonomous — D1 shell-contract v1.7→v1.8
/ GD-11, D2 NEXUS module, D3b AgentOS non-approval edge, D4 evaluate.py injectable
port) · shell-contract v1.8 hash of record: `bcf9eeb176d7eed6c64088fc54af4a365a527bf1740432905db32030a99b841f` ·
module-nexus built (48 tests) · module-agentos 56→65 tests · platform total 842→899 ·
GD-12 Orchestration AgentClass recorded (unblocks D3a) · §6, §8, §11, §12, §13,
§14, §15, §17, §19 updated

---

## §1 — What This Document Is

Mandatory context for every SOVEREIGN Platform development session. Load order:
Integration Brief (current version) → `SOVEREIGN_Agent_to_Agent_Briefing.md` →
`system_prompt.md` → product or companion suite spec → prior session handoff →
`shell-contract.ts`.

Confirm all documents are loaded by name before any build work begins.
Verify shell-contract.ts SHA-256 matches the v1.8 hash of record.

---

## §2 — Platform Definition

SOVEREIGN — six primary products (NEXUS, CPMI, APEX, FLOWPATH, AgentOS, ARIA Suite)
plus four companion modules (COUNSEL, SCRIBE, LENS, VIGIL). Intelligence Layer is
the seventh product — must never be lost.

---

## §3 — Three Shared Infrastructure Layers

**SOVEREIGN Security Observability Framework** — Stage 1 COMPLETE · 127 Python tests.
**CPMI-VRS AI Governance Standard** — Stage 3 COMPLETE · first VRS certificate issued.
**AgentOS** — Stage 4 IN PROGRESS · scaffold + task lifecycle + NEXUS hand-off complete.

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH → [Intelligence Layer] → CPMI ✅ → AgentOS ✅ → NEXUS ✅ → APEX → ARIA Suite
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ — COMPLETE
‖ Local LLM: Provider B wired · UNCLASSIFIED-only (GD-10)
‖ PPBE — deferred Stage 5+
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
   **v1.8 · SHA-256: `bcf9eeb176d7eed6c64088fc54af4a365a527bf1740432905db32030a99b841f`**
   **(replaces v1.7 hash `07f48524…060634`, retired Session 15 / GD-11)**
9. All prompts registered before build — **9 APPROVED**
10. All agents registered before build — **13 registered** (7 companion + 3 CPMI +
    3 AgentOS orchestrators; AgentCards pending GD-12 shell-contract change)
11. **Five synced copies of shared artifacts** — propagate all changes

**Codebase facts every session must know:**
- Real types: `SovereignRequestContext` / `SovereignLLMResponse` / `ClearanceLevel`
- `createSovereignClient()` unchanged — use `routedComplete()` for routing
- `sovereign-api-client` compiles commonjs — use `process.env`, not `import.meta.env`
- `SovereignEventType` NOT mirrored in `sovereign-data/src/shared-types.ts`
- NEXUS `minimumRole` is `AGENT_OPERATOR` (no `OPERATOR` role exists in taxonomy)
- GD-10: UNCLASSIFIED only — enforced at api-client AND at NEXUS intake

**GD-12 — Orchestration AgentClass (recorded June 24, 2026, pre-approved for Session 16):**
Add `"Orchestration"` to `AgentClass` union in `shell-contract.ts` and to
`VALID_AGENT_CLASSES` in the module loader. This is a shell-contract change requiring
the full governance process (GD-12, version increment v1.8 → v1.9, changelog, impact
assessment, dual-copy SHA verification). Pre-approved by this Integration Brief entry.
Unblocks AgentOS orchestrator AgentCard registration (D3a from Session 15).

---

## §7 — CPMI Enhanced Monitoring

CPMI at **0.7× anomaly threshold** — architectural constant. First VRS certificate
issued June 24, 2026. Stage 3 COMPLETE.

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← git main · HEAD 1075701
├── SOVEREIGN_Platform_Integration_Brief_v1.22.md
├── Agent_Identity_Standard.md         ← v1.3 · 13 agents
├── sovereign-security/                ← 127 Python tests
├── sovereign-api-client/              ← 174 tests · GD-10 enforced
├── sovereign-data/                    ← 43 tests · HumanDecisionType 15 members
├── sovereign-shell/
│   ├── shell-contract.ts              ← v1.8 · SHA bcf9eeb1…9b841f (GD-11)
│   └── src/register-modules.ts       ← mounts counsel+scribe+vigil+lens+cpmi+agentos+nexus
├── module-counsel/                    ← COMPLETE — 91 tests
├── module-scribe/                     ← COMPLETE — 122 tests
├── module-vigil/                      ← COMPLETE — 113 tests
├── module-lens/                       ← COMPLETE — 58 tests
├── module-cpmi/                       ← Stage 3 COMPLETE — 58 tests
├── module-agentos/                    ← Stage 4 · 65 tests
│   └── src/
│       ├── evaluate-port.ts           ← NEW S15 · injectable evaluate seam
│       └── useModelEvaluation.ts      ← NEW S15
├── module-nexus/                      ← Stage 4 · 48 tests · AGENT_OPERATOR gate
│   └── src/
│       ├── nexus-contract.ts
│       ├── request-registry.ts
│       ├── useRequestRegistry.ts
│       ├── request-router.ts
│       └── agentos-port.ts
└── docs/
    ├── 11_AgentOS_Architecture.md
    ├── 12_NEXUS_Architecture.md       ← author for record (NEXUS built from prompt)
    └── [prior specs]
```

**Git:** Branch `main`. HEAD `1075701`.

---

## §9 — Intelligence Layer Exposure Requirements

| Field | Required On | Status |
|---|---|---|
| `workflow_step_id` | Every Logger event | Enforced |
| `decision_type` | Every human decision | Enforced |
| `TASK_APPROVAL` / `TASK_CANCELLATION` | AgentOS task decisions | LIVE — S14 |
| `GATE_3_ATTESTATION` | CPMI Gate 3 | LIVE — S12 |
| `CPMI_REASONING_CHAIN_COMPLETE` | Every chain | LIVE — S11 |
| `INFERENCE_CALL` | Every inference call | LIVE — S13 |
| `AGENT_APPROVAL` | VIGIL agent approvals | LIVE — S10 |

---

## §10 — Shared Data Dictionary

| Entity | Classification | Status |
|---|---|---|
| Employee, Program, Cost Code, Document, Vendor | program | Implemented |
| StyleProfile | user | LIVE |
| LensExplanation | companion | LIVE |
| ReasoningChainOutput | governance | LIVE |
| ClearanceLevel | infrastructure | LIVE (UNCLASSIFIED only per GD-10) |
| HumanDecisionType | governance | 15 members (unchanged S15) |
| PPBE entities (6) | program | PENDING |

---

## §11 — Current Build Status

### Stage 1 — COMPLETE (127 Python tests)
### Stage 2 — COMPLETE (companion suite — 442 JS tests)
### Stage 3 — COMPLETE (CPMI — 58 JS tests · VRS certified)

### Stage 4 — IN PROGRESS

| Deliverable | Tests | Status |
|---|---|---|
| Local LLM infrastructure | +24 | ✅ S13 |
| GD-10 classification boundary | +7 | ✅ S14 |
| AgentOS scaffold + task lifecycle | +56 | ✅ S14 |
| VIGIL Agent Approval loop closed | — | ✅ S14 |
| AgentOS non-approval edge (D3b) | +3 | ✅ **S15** |
| AgentOS evaluate.py seam (D4) | +6 | ✅ **S15** |
| **NEXUS scaffold + core** | **+48** | ✅ **S15** |
| AgentOS orchestrator AgentCards (D3a) | — | Blocked — GD-12 unblocks |
| evaluate.py Python implementation | — | Session 16 |
| AgentOS A2A communication | — | Session 16+ |

**Total tests passing: 772 JS + 127 Python = 899 total**

### NEXUS Routing Table

| WorkRequestType | Agent Class | Approval Required |
|---|---|---|
| `DOCUMENT_REVIEW` | Analytical | No |
| `DATA_ANALYSIS` | Analytical | No |
| `COMPLIANCE_CHECK` | Governance | **Yes** |
| `REPORT_GENERATION` | Operational | No |
| `GOVERNANCE_QUERY` | Governance | **Yes** |

---

## §12 — Risk Register

| ID | Risk | Status |
|---|---|---|
| R1 | Human-review-volume | OPEN |
| R2 | AI Provider Abstraction | **CLOSED** |
| R3 | Agent Operator Role | **CLOSED** |
| R4 | Federal Workforce Transition | OPEN |
| R5 | CPMI world model REST API | MITIGATED |
| R6 | AgentOS evaluate.py | **MITIGATED** — injectable seam built S15; Python impl deferred |
| R7 | Tier 2 LLM Provider | **CLOSED** |
| R8 | Shell ↔ module contract drift | MITIGATED |
| R9 | NEXUS ATO timeline | OPEN — Stage 5 |
| R10 | AgentOS surface absent | **CLOSED** |
| R11 | Security Framework alert response | **CLOSED** |
| R12 | PPBE integration deferred | OPEN — Stage 5+ |

---

## §13 — Open Governance Items

**CLOSED this session:**
- AgentOS non-approval path gap (item 41) — **CLOSED** (D3b)
- NEXUS not built — **CLOSED** (D2)

**New from Session 15:**
43. **GD-12 — Orchestration AgentClass** — pre-approved in §6. Shell-contract v1.8→v1.9,
    add `"Orchestration"` to `AgentClass` union + loader `VALID_AGENT_CLASSES`.
    Claude Code does D1 (GD-12 shell change) first in Session 16, then D3a
    (AgentOS orchestrator AgentCards).
44. **`docs/12_NEXUS_Architecture.md` not in repo** — NEXUS was built from the opening
    prompt spec. Author this doc in Claude Chat and commit before Session 16.
45. **`evaluate.py` not yet authored** — AgentOS injectable seam is ready. Python
    implementation + evaluation Logger event type needed. Session 16.

**Carried (unchanged — all prior items):**

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.16 (through Session 15).
Shell contract v1.8 · `bcf9eeb1…9b841f`.
`@sovereign/data` v1.2.0 · HumanDecisionType 15 members · unchanged S15.
0 production vulnerabilities.

**Running test totals:** pytest 127 · api-client 174 · data 43 · counsel 91 ·
scribe 122 · vigil 113 · lens 58 · cpmi 58 · agentos 65 · nexus 48 =
**772 JS + 127 Python = 899 total**.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. Verify shell-contract.ts SHA-256 = `bcf9eeb1…9b841f` (v1.8).
3. State done condition — wait for Project Principal approval.
4. One component per exchange — build, verify, confirm, proceed.
5. Close with handoff — never skip.

**Session 16 context package:**
1. `SOVEREIGN_Platform_Integration_Brief_v1.22.md`
2. `SOVEREIGN_Agent_to_Agent_Briefing.md`
3. `PROJECT_SUMMARY.md`
4. `AGENT_BACKGROUND_AND_LESSONS_LEARNED.md`
5. `system_prompt.md`
6. `SOVEREIGN_Session15_Handoff.md`
7. `shell-contract.ts`
8. `Agent_Identity_Standard.md`
9. `module-agentos/src/index.ts`
10. `module-agentos/src/evaluate-port.ts`
11. `sovereign-shell/src/register-modules.ts`
12. `docs/12_NEXUS_Architecture.md` ← author before Session 16

**Session 16 scope: GD-12 shell change + AgentOS AgentCards (D3a) +
evaluate.py Python implementation.**

---

## §17 — Primary Product Inserts

| Product | Stage | Status |
|---|---|---|
| CPMI | Stage 3 | **COMPLETE — VRS certified** |
| AgentOS | Stage 4 | **IN PROGRESS — scaffold + NEXUS hand-off complete** |
| **NEXUS** | **Stage 4** | **BUILT Session 15 — 48 tests** |
| APEX | Stage 6 | Not started |
| FLOWPATH | Stage 1 (pipeline) | Not started |
| ARIA Suite | Stage 7 | Not started |

---

## §18 — Companion Suite — FULLY COMPLETE

13 registered agents · 9 approved prompts · 442 JS tests

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.19–v1.21 | June 24, 2026 | Sessions 12–14 |
| **v1.22** | **June 24, 2026** | **Session 15: shell-contract v1.8 (GD-11), NEXUS module (48 tests), AgentOS D3b+D4, 899 tests, GD-12 pre-approved, HEAD 1075701** |

---

*SOVEREIGN Platform Integration Brief v1.22 · June 24, 2026*
*Pre-Decisional · Internal Working Document*

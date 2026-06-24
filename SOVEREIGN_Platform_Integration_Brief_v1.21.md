# SOVEREIGN Platform Integration Brief
## Version 1.21 | June 24, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.20
**Changed this version:** Session 14 complete (autonomous — D0 GD-10 classification
boundary, D1 shell-contract v1.6→v1.7 / GD-9, D2 AgentOS module) · shell-contract
v1.7 hash of record: `07f4852410390d937d18bdcbde5511c25f6896487452bbe0cef8e55c79060634` ·
HumanDecisionType 13→15 · AgentOS module built (56 tests) · api-client 167→174 tests ·
platform total 779→842 · GD-10 UNCLASSIFIED-only boundary enforced · VIGIL Agent
Approval loop closed from AgentOS side · HEAD updated · §6, §8, §10, §11, §12, §13,
§14, §15, §17, §18, §19 updated

---

## §1 — What This Document Is

Mandatory context for every SOVEREIGN Platform development session. Load order:
Integration Brief (current version) → `SOVEREIGN_Agent_to_Agent_Briefing.md` →
`system_prompt.md` → product or companion suite spec → prior session handoff →
`shell-contract.ts`.

Confirm all documents are loaded by name before any build work begins.
Verify shell-contract.ts SHA-256 matches the v1.7 hash of record.

---

## §2 — Platform Definition

SOVEREIGN — six primary products (NEXUS, CPMI, APEX, FLOWPATH, AgentOS, ARIA Suite)
plus four companion modules (COUNSEL, SCRIBE, LENS, VIGIL). Intelligence Layer is
the seventh product — must never be lost.

**Three non-negotiable design outcomes:** Integration reliability · Operational
efficiency · End-to-end security observability.

---

## §3 — Three Shared Infrastructure Layers

**SOVEREIGN Security Observability Framework** — Stage 1 COMPLETE · 127 Python tests.
**CPMI-VRS AI Governance Standard** — Stage 3 COMPLETE · first VRS certificate issued.
**AgentOS** — Stage 4 IN PROGRESS · scaffold + task lifecycle built Session 14.

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH → [Intelligence Layer] → CPMI ✅ → AgentOS ✅ → NEXUS → APEX → ARIA Suite
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ — COMPLETE
‖ Local LLM: Provider B wired · UNCLASSIFIED-only (GD-10) · activates when authorized
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
   **v1.7 · SHA-256: `07f4852410390d937d18bdcbde5511c25f6896487452bbe0cef8e55c79060634`**
   **(replaces v1.6 hash `99e47b10…01c8af`, retired Session 14 / GD-9)**
9. All prompts registered before build — **9 APPROVED**
10. All agents registered before build — **11 registered** (8 companion + 3 CPMI;
    AgentOS orchestrator agents pending registration — see §13 item 40)
11. **Five synced copies of shared artifacts** — propagate all changes

**Codebase facts every session must know:**
- Real types: `SovereignRequestContext` / `SovereignLLMResponse` / `ClearanceLevel`
- `createSovereignClient()` unchanged — use `routedComplete()` for routing
- `sovereign-api-client` compiles commonjs — use `process.env`, not `import.meta.env`
- `SovereignEventType` NOT mirrored in `sovereign-data/src/shared-types.ts`
- VIGIL `AgentApprovalPort` interface is `{ listPending }` — read before building
  any AgentOS-side port implementation

**GD-10 — Classification Boundary (permanent, until formally lifted):**
SOVEREIGN processes UNCLASSIFIED data only. CUI, SECRET, and TOP_SECRET throw
`ClassificationNotAuthorizedError` — message: "This classification level is not
authorized for processing in SOVEREIGN. Contact your system administrator."
The routing infrastructure is latent and activates when `AUTHORIZED_CLASSIFICATIONS`
is widened by a formal governance decision.

---

## §7 — CPMI Enhanced Monitoring

CPMI at **0.7× anomaly threshold** — architectural constant. First VRS certificate
issued June 24, 2026. `cpmi.reasoning-chain` uses `RE_EXECUTE` approval behavior.

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← git main · HEAD 82e5dbe
├── SOVEREIGN_Platform_Integration_Brief_v1.21.md
├── Agent_Identity_Standard.md         ← v1.2 · 11 agents · AgentOS agents pending
├── sovereign-security/                ← 127 Python tests
├── sovereign-api-client/              ← 174 tests · GD-10 boundary enforced
│   └── src/routing.ts                 ← ClassificationNotAuthorizedError (GD-10)
├── sovereign-data/                    ← 43 tests · HumanDecisionType 15 members
├── sovereign-shell/
│   ├── shell-contract.ts              ← v1.7 · SHA 07f48524…060634 (GD-9)
│   └── src/register-modules.ts       ← mounts counsel+scribe+vigil+lens+cpmi+agentos
├── module-counsel/                    ← COMPLETE — 91 tests
├── module-scribe/                     ← COMPLETE — 122 tests
├── module-vigil/                      ← COMPLETE — 113 tests
├── module-lens/                       ← COMPLETE — 58 tests
├── module-cpmi/                       ← Stage 3 COMPLETE — 58 tests
├── module-agentos/                    ← Stage 4 · 56 tests · PLATFORM_ADMIN gate
│   └── src/
│       ├── agentos-contract.ts        ← Task (8 statuses), AgentAssignment
│       ├── task-registry.ts           ← state machine, TaskTransitionError
│       ├── useTaskRegistry.ts         ← Gate-2 fail-closed, Logger emission
│       ├── agent-dispatcher.ts        ← synthetic/dev roster, GD-10 enforcement
│       ├── useAgentDispatcher.ts      ← approval-port wiring
│       └── approval-port.ts          ← AgentOS impl of VIGIL AgentApprovalPort
└── docs/
    ├── 11_AgentOS_Architecture.md
    ├── 12_NEXUS_Architecture.md       ← ready for Session 15
    └── [prior specs]
```

**Git:** Branch `main`. HEAD `82e5dbe`. Absolute path:
`/Users/developmentsystem/Developer/sovereign-platform/`

---

## §9 — Intelligence Layer Exposure Requirements

| Field | Required On | Status |
|---|---|---|
| `workflow_step_id` | Every Logger event | Enforced |
| `decision_type` | Every human decision | Enforced |
| `TASK_APPROVAL` | Task approve/reject decisions | **LIVE — Session 14** |
| `TASK_CANCELLATION` | Task cancellation | **LIVE — Session 14** |
| `GATE_3_ATTESTATION` | CPMI Gate 3 | LIVE — Session 12 |
| `CPMI_REASONING_CHAIN_COMPLETE` | Every chain | LIVE — Session 11 |
| `INFERENCE_CALL` | Every inference call | LIVE — Session 13 |
| `AGENT_APPROVAL` | VIGIL agent approvals | LIVE — Session 10 |

---

## §10 — Shared Data Dictionary

| Entity | Classification | Status |
|---|---|---|
| Employee, Program, Cost Code, Document, Vendor | program | Implemented |
| StyleProfile | user | LIVE |
| LensExplanation | companion | LIVE |
| ReasoningChainOutput | governance | LIVE |
| ClearanceLevel | infrastructure | LIVE (UNCLASSIFIED only per GD-10) |
| HumanDecisionType | governance | **15 members** (TASK_APPROVAL + TASK_CANCELLATION added GD-9) |
| PPBE entities (6) | program | PENDING |

---

## §11 — Current Build Status

### Stage 1 — COMPLETE (127 Python tests)
### Stage 2 — COMPLETE (companion suite — 442 JS tests)
### Stage 3 — COMPLETE (CPMI — 58 JS tests · VRS certified)

### Stage 4 — IN PROGRESS

| Deliverable | Tests | Status |
|---|---|---|
| Local LLM infrastructure (Provider B, routing, model registry) | +24 | ✅ Session 13 |
| GD-10 Classification boundary enforcement | +7 | ✅ **Session 14 D0** |
| AgentOS scaffold + task lifecycle | +56 | ✅ **Session 14 D2** |
| VIGIL Agent Approval loop closed (AgentOS side) | — | ✅ **Session 14** |
| AgentOS orchestrator agent registration | — | Pending — §13 item 40 |
| NEXUS scaffold + core | — | **Session 15 — NEXT** |
| AgentOS A2A communication layer | — | Session 16+ |
| evaluate.py integration | — | Session 16+ |

**Total tests passing: 715 JS + 127 Python = 842 total**

### AgentOS Task Lifecycle (current)

```
CREATED → ASSIGNED → PENDING_APPROVAL → APPROVED → IN_PROGRESS → COMPLETE
                            ↓
                         REJECTED → CANCELLED
```

Note: `requires_approval=false` tasks stop at ASSIGNED — no ASSIGNED→IN_PROGRESS
edge exists yet. Happy-path demo uses `requires_approval=true`. See §13 item 41.

---

## §12 — Risk Register

| ID | Risk | Status |
|---|---|---|
| R1 | Human-review-volume architecture | OPEN |
| R2 | AI Provider Abstraction Layer | **CLOSED** |
| R3 | Agent Operator Role Undefined | **CLOSED** |
| R4 | Federal Client Workforce Transition | OPEN — LENS mitigates |
| R5 | CPMI world model REST API | MITIGATED |
| R6 | AgentOS evaluate.py never tested | OPEN — Session 16+ |
| R7 | Tier 2 LLM Provider | **CLOSED** — infrastructure wired, boundary enforced |
| R8 | Shell ↔ module contract drift | MITIGATED |
| R9 | NEXUS ATO timeline | OPEN — Stage 5 |
| R10 | AgentOS surface absent | **CLOSED** — VIGIL + AgentOS built |
| R11 | Security Framework alert response | **CLOSED** |
| R12 | PPBE integration deferred | OPEN — Stage 5+ |

---

## §13 — Open Governance Items

**CLOSED this session:**
- VIGIL Agent Approval loop open from AgentOS side — **CLOSED** (Session 14)
- GD-10 classification boundary unenforced — **CLOSED** (Session 14 D0)

**Carried (all prior items — see v1.20 §13)**

**New from Session 14:**
40. **AgentOS orchestrator agents not registered** — `module-agentos.agentCards` is
    empty (Constraint #10). Register AgentOS orchestrator agents in
    `Agent_Identity_Standard.md` before adding their AgentCards. Claude Chat action
    required before Session 15 if AgentOS agents are needed.
41. **`requires_approval=false` task path** — no ASSIGNED→IN_PROGRESS edge in the
    current state machine. Tasks without approval stop at ASSIGNED. Non-approval
    execution requires a governance decision (real agent execution is §7 future work).
    Demo uses `requires_approval=true` path only.
42. **GD-10 lift trigger** — criteria and trigger for widening `AUTHORIZED_CLASSIFICATIONS`
    beyond UNCLASSIFIED not yet defined. Requires a formal governance decision before
    any CUI/SECRET/TOP_SECRET processing begins.

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.15 (through Session 14).
Shell contract v1.7 · `07f48524…060634`.
`@sovereign/data` v1.2.0 · HumanDecisionType 15 members.
0 production vulnerabilities.

**Running test totals:** pytest 127 · api-client 174 · data 43 · counsel 91 ·
scribe 122 · vigil 113 · lens 58 · cpmi 58 · agentos 56 =
**715 JS + 127 Python = 842 total**.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. Verify shell-contract.ts SHA-256 = `07f48524…060634` (v1.7).
3. State done condition — wait for Project Principal approval.
4. One component per exchange — build, verify, confirm, proceed.
5. Close with handoff — never skip.

**Session 15 context package:**
1. `SOVEREIGN_Platform_Integration_Brief_v1.21.md`
2. `SOVEREIGN_Agent_to_Agent_Briefing.md`
3. `PROJECT_SUMMARY.md`
4. `AGENT_BACKGROUND_AND_LESSONS_LEARNED.md`
5. `system_prompt.md`
6. `SOVEREIGN_Session14_Handoff.md`
7. `shell-contract.ts`
8. `Agent_Identity_Standard.md`
9. `module-agentos/src/index.ts`
10. `module-agentos/src/agentos-contract.ts`
11. `module-agentos/src/approval-port.ts`
12. `sovereign-api-client/src/routing.ts`
13. `docs/12_NEXUS_Architecture.md`

**Session 15 scope: NEXUS scaffold + core.**
**Session 15 is ready — `12_NEXUS_Architecture.md` is in the repo.**

---

## §16 — Architectural Patterns (Platform Standard)

All patterns from v1.20 apply. Session 14 additions:

**GD-10 Classification Boundary pattern.** `ClassificationNotAuthorizedError` is
thrown at `selectProvider()` for any classification above UNCLASSIFIED. The error
propagates to the caller — it is not swallowed by the three-tier fallback. The
routing infrastructure is latent and activates by widening `AUTHORIZED_CLASSIFICATIONS`
when formally authorized. This is the platform standard: never silently route
unauthorized data to any provider.

**REJECTED decision_type pattern.** A task rejection carries
`decision_type: TASK_APPROVAL` (not a separate TASK_REJECTION type) — the event
type and outcome field distinguish approve vs. reject. This mirrors VIGIL's pattern
where `AGENT_ACTION_APPROVED` and `AGENT_ACTION_REJECTED` share the `AGENT_APPROVAL`
decision type.

**Gate-2 fail-closed on task transitions.** The Logger event is emitted before the
state changes. A failed emit blocks the transition — an unlogged state change is
an ungoverned state change. Platform standard for all stateful workflows.

---

## §17 — Primary Product Inserts

| Product | Stage | Status |
|---|---|---|
| CPMI | Stage 3 | **COMPLETE — VRS certified June 24, 2026** |
| AgentOS | Stage 4 | **IN PROGRESS — scaffold + task lifecycle built Session 14** |
| NEXUS | Stage 5 | **Session 15 — NEXT** |
| APEX | Stage 6 | Not started |
| FLOWPATH | Stage 1 (pipeline) | Not started |
| ARIA Suite | Stage 7 | Not started |

---

## §18 — Companion Suite — FULLY COMPLETE

11 registered agents · 9 approved prompts · 442 JS tests

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.15–v1.19 | June 23–24, 2026 | Sessions 10–12 |
| v1.20 | June 24, 2026 | Session 13: Local LLM infra, shell-contract v1.6, 779 tests |
| **v1.21** | **June 24, 2026** | **Session 14: GD-10 boundary, shell-contract v1.7 (GD-9), AgentOS module (56 tests), VIGIL loop closed, 842 tests, HEAD 82e5dbe** |

---

*SOVEREIGN Platform Integration Brief v1.21 · June 24, 2026*
*Pre-Decisional · Internal Working Document*

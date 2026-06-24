# SOVEREIGN Platform Integration Brief
## Version 1.20 | June 24, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.19
**Changed this version:** Session 13 complete (autonomous — D1 shell-contract v1.5→v1.6
/ GD-8, D2 Local LLM infrastructure in sovereign-api-client) · shell-contract v1.6
hash of record: `99e47b10…01c8af` · sovereign-api-client 143→167 tests · ClearanceLevel
reused as data-classification taxonomy · Ollama Provider B wired (disabled by default) ·
model registry placeholder · platform total 755→779 · spec doc
10_LocalLLM_Infrastructure.md reconciled against actual codebase · AgentOS as next
stage · §6, §8, §10, §11, §12, §13, §14, §15, §16, §19 updated

---

## §1 — What This Document Is

Mandatory context for every SOVEREIGN Platform development session. Load order:
Integration Brief (current version) → `SOVEREIGN_Agent_to_Agent_Briefing.md` →
`system_prompt.md` → product or companion suite spec → prior session handoff →
`shell-contract.ts`.

Confirm all documents are loaded by name before any build work begins.
Verify shell-contract.ts SHA-256 matches the v1.6 hash of record.

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
**AgentOS** — MLOps backbone · Stage 4 NEXT.

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH → [Intelligence Layer] → CPMI ✅ → AgentOS → NEXUS / APEX → ARIA Suite
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ — COMPLETE
‖ Local LLM: Provider B wired ✅ · disabled by default · activates by config
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
2. No shared entity field-name divergence
3. No rewrite debt — connections are configuration changes
4. Every human decision event carries `decision_type`
5. No direct LLM API calls — `createSovereignClient()` only
6. `workflow_step_id` on every Logger event
7. Shell context frozen at eight exports
8. `shell-contract.ts` — **v1.6 ·
   SHA-256: `99e47b10b558b3896fbc0fa8c8c635f145a8460f35051c4d5ca100d01d01c8af`**
   **(replaces v1.5 hash `8f50399c…37a7a`, retired Session 13 / GD-8)**
9. All prompts registered before build — **9 APPROVED**
10. All agents registered before build — **11 registered agents**
11. Five synced copies of shared artifacts — propagate all changes

**Session 13 codebase facts — every future session must know these:**
- `createSovereignClient()` is unchanged — 143-test contract preserved
- Classification routing is exposed as `routedComplete()` built on top
- Real types are `SovereignRequestContext` / `SovereignLLMResponse` / `ClearanceLevel`
  — not `SovereignRequest` / `SovereignResponse` / `DataClassification`
- `sovereign-api-client` compiles `module: commonjs` — use `process.env`, not `import.meta`
- `SovereignEventType` is NOT mirrored in `sovereign-data/src/shared-types.ts`
  — only `SovereignRole`, `ClearanceLevel`, `HumanDecisionType` are synced there

---

## §7 — CPMI Enhanced Monitoring

CPMI operates at **0.7× anomaly threshold** — architectural constant.
First VRS certificate issued June 24, 2026. Stage 3 COMPLETE.
`cpmi.reasoning-chain` uses `RE_EXECUTE` approval behavior.

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← git main · HEAD 82d51d5
├── SOVEREIGN_Platform_Integration_Brief_v1.20.md
├── Agent_Identity_Standard.md         ← v1.2 · 11 agents
├── SOVEREIGN_Agent_to_Agent_Briefing.md
├── sovereign-security/                ← 127 Python tests
├── sovereign-api-client/              ← 167 tests · Provider B wired
│   └── src/
│       ├── providers/
│       │   ├── provider-registry.ts   ← NEW S13
│       │   └── ollama-provider.ts     ← NEW S13
│       ├── routing.ts                 ← NEW S13
│       ├── model-registry.ts          ← NEW S13
│       ├── inference-logger.ts        ← NEW S13
│       ├── routed-inference.ts        ← NEW S13
│       └── ollama-endpoint.ts         ← NEW S13
├── sovereign-data/                    ← 43 tests · v1.2.0 · unchanged S13
├── sovereign-shell/
│   ├── shell-contract.ts              ← v1.6 · SHA 99e47b10…01c8af
│   └── src/register-modules.ts
├── module-counsel/                    ← COMPLETE — 91 tests
├── module-scribe/                     ← COMPLETE — 122 tests
├── module-vigil/                      ← COMPLETE — 113 tests
├── module-lens/                       ← COMPLETE — 58 tests
├── module-cpmi/                       ← Stage 3 COMPLETE — 58 tests
└── docs/
    ├── 06_LocalLLM_Architecture.md
    ├── 07_LocalLLM_Decision_Framework.md
    ├── 08_CPMI_Architecture.md
    ├── 09_CPMI_Stage3_Completion.md
    └── 10_LocalLLM_Infrastructure.md  ← reconciled against actual codebase
```

**Git:** Branch `main`. HEAD `82d51d5`. Absolute path:
`/Users/developmentsystem/Developer/sovereign-platform/`

---

## §9 — Intelligence Layer Exposure Requirements

| Field | Required On | Status |
|---|---|---|
| `workflow_step_id` | Every Logger event | Enforced |
| `decision_type` | Every human decision | Enforced |
| `INFERENCE_CALL` | Every inference call | **LIVE — Session 13** |
| `INFERENCE_PROVIDER_FALLBACK` | Provider fallback | **LIVE — Session 13** |
| `GATE_3_ATTESTATION` | CPMI Gate 3 | LIVE — Session 12 |
| `CPMI_REASONING_CHAIN_COMPLETE` | Every chain | LIVE — Session 11 |
| `AGENT_APPROVAL` | Agent approvals | LIVE — Session 10 |

---

## §10 — Shared Data Dictionary

| Entity | Classification | Status |
|---|---|---|
| Employee, Program, Cost Code, Document, Vendor | program | Implemented |
| StyleProfile | user | LIVE |
| LensExplanation | companion | LIVE |
| ReasoningChainOutput | governance | LIVE |
| **ClearanceLevel** | **infrastructure** | **LIVE — Session 13 (reused as data-classification taxonomy; values: UNCLASSIFIED / CUI / SECRET / TOP_SECRET)** |
| HumanDecisionType | governance | 13 members |
| PPBE entities (6) | program | PENDING |

---

## §11 — Current Build Status

### Stage 1 — COMPLETE (127 Python tests)
### Stage 2 — COMPLETE (companion suite — 384 JS tests)
### Stage 3 — COMPLETE (CPMI — 58 JS tests · VRS certified June 24)

### Stage 4 — IN PROGRESS

| Deliverable | Tests | Status |
|---|---|---|
| Local LLM infrastructure (Provider B, routing, model registry) | +24 | ✅ **Session 13** |
| AgentOS scaffold + task lifecycle | — | **Session 14 — NEXT** |
| AgentOS A2A communication layer | — | Session 15+ |
| AgentOS evaluate.py integration | — | Session 15+ |

**Total tests passing: 652 JS + 127 Python = 779 total**

### Provider B Routing (current)

| `data_classification` | Ollama enabled | Provider | Logger event |
|---|---|---|---|
| UNCLASSIFIED (or absent) | either | Anthropic (A) | INFERENCE_CALL |
| CUI | enabled | **Ollama (B)** | INFERENCE_CALL |
| CUI | disabled | Anthropic (A) | INFERENCE_PROVIDER_FALLBACK + INFERENCE_CALL |
| SECRET / TOP_SECRET | either | Anthropic (A) | INFERENCE_CALL |

**Note:** SECRET/TOP_SECRET currently route to Anthropic. If higher classifications
should also route to local inference, that is a one-line change to `selectProvider()`
plus a governance note — deferred pending Project Principal decision.

---

## §12 — Risk Register

| ID | Risk | Status |
|---|---|---|
| R1 | Human-review-volume architecture | OPEN |
| R2 | AI Provider Abstraction Layer | **CLOSED** |
| R3 | Agent Operator Role Undefined | **CLOSED** |
| R4 | Federal Client Workforce Transition | OPEN |
| R5 | CPMI world model REST API | MITIGATED |
| R6 | AgentOS evaluate.py never tested | OPEN — Stage 4 |
| R7 | Tier 2 LLM Provider | **CLOSED** — infrastructure wired Session 13 |
| R8 | Shell ↔ module contract drift | MITIGATED |
| R9 | NEXUS ATO timeline | OPEN — Stage 5 |
| R10 | AgentOS surface absent | **CLOSED** — VIGIL |
| R11 | Security Framework alert response | **CLOSED** |
| R12 | PPBE integration deferred | OPEN — Stage 5+ |

---

## §13 — Open Governance Items

**CLOSED this session:**
- R7 Local LLM infrastructure — **CLOSED** (Provider B wired Session 13)

**New from Session 13:**
35. **SECRET/TOP_SECRET routing** — currently routes to Anthropic. One-line change
    to `selectProvider()` if higher classifications should route to Ollama. Requires
    Project Principal decision before change.
36. **Model registry placeholder** — `mistral:13b-q4` SHA `synthetic-placeholder`.
    Replace with real SHA-256 when weights are downloaded; run CPMI-VRS gates;
    set status to PASSED before live inference activates.
37. **CPMI module navigation state** — Gate Runner panel doesn't preserve state
    across tab switches. UI fix needed.
38. **VRS Certificate shape** — simplified vs. spec §4. Enrich when needed.
39. **Gate 4 full implementation** — simplified auto-record. Full Anomaly Detector
    baseline + VIGIL routing test deferred to AgentOS build.

**Carried (all prior items unchanged — see v1.19 §13)**

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.14 (through Session 13).
Shell contract v1.6 · `99e47b10…01c8af`.
`@sovereign/data` v1.2.0 · unchanged.
0 production vulnerabilities.

**Running test totals:** pytest 127 · api-client 167 · data 43 · counsel 91 ·
scribe 122 · vigil 113 · lens 58 · cpmi 58 = **652 JS + 127 Python = 779 total**.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. Verify shell-contract.ts SHA-256 = `99e47b10…01c8af` (v1.6).
3. State done condition — wait for Project Principal approval.
4. One component per exchange — build, verify, confirm, proceed.
5. Close with handoff — never skip.

**Session 14 context package:**
1. `SOVEREIGN_Platform_Integration_Brief_v1.20.md`
2. `SOVEREIGN_Agent_to_Agent_Briefing.md`
3. `PROJECT_SUMMARY.md`
4. `AGENT_BACKGROUND_AND_LESSONS_LEARNED.md`
5. `system_prompt.md`
6. `SOVEREIGN_Session13_Handoff.md`
7. `shell-contract.ts`
8. `Agent_Identity_Standard.md`
9. `sovereign-api-client/src/index.ts`
10. `sovereign-api-client/src/routed-inference.ts`
11. `docs/11_AgentOS_Architecture.md` ← author in Claude Chat before Session 14

**Session 14 scope: AgentOS scaffold + task lifecycle core.**
**Session 14 is blocked on `11_AgentOS_Architecture.md`** — author in Claude Chat.

---

## §16 — Architectural Patterns (Platform Standard)

All patterns from v1.19 apply. Session 13 additions:

**Provider B pattern.** Ollama registers as Provider B inside `sovereign-api-client`.
`createSovereignClient()` is unchanged — classification routing is exposed as
`routedComplete()` built on top. This is the platform standard for adding inference
providers: additive, never a rewrite of the existing factory (Constraint #3).

**ClearanceLevel as classification taxonomy.** `ClearanceLevel` (UNCLASSIFIED / CUI /
SECRET / TOP_SECRET) is the platform's data-classification type. Do not create a
duplicate `DataClassification` type (Constraint #2). Add `data_classification?:
ClearanceLevel` to request types where classification routing is needed.

**commonjs-safe config readers.** `sovereign-api-client` compiles to commonjs. Config
readers in this package must use `process.env`, not `import.meta.env`. All other
modules (Vite-compiled) may use `import.meta.env`.

---

## §17 — Primary Product Inserts

| Product | Stage | Status |
|---|---|---|
| CPMI | Stage 3 | **COMPLETE — VRS certified June 24, 2026** |
| AgentOS | Stage 4 | **IN PROGRESS — Session 14 next** |
| NEXUS | Stage 5 | Not started |
| APEX | Stage 6 | Not started |
| FLOWPATH | Stage 1 (pipeline) | Not started |
| ARIA Suite | Stage 7 | Not started |

---

## §18 — Companion Suite — FULLY COMPLETE

11 registered agents · 9 approved prompts · 384 JS tests

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.15–v1.18 | June 23, 2026 | Sessions 10–11 |
| v1.19 | June 24, 2026 | Session 12: Stage 3 complete, VRS certificate |
| **v1.20** | **June 24, 2026** | **Session 13: shell-contract v1.6 (GD-8), Provider B (Ollama) wired, ClearanceLevel routing, model registry, 779 tests, HEAD 82d51d5** |

---

*SOVEREIGN Platform Integration Brief v1.20 · June 24, 2026*
*Pre-Decisional · Internal Working Document*

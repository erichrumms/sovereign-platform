# SOVEREIGN Platform Integration Brief
## Version 1.25 | June 25, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.24
**Changed this version:** Walkthrough A complete (June 25, 2026) · CPMI-VRS Gate 3
attested + Gate 4 passed · six gaps identified · three design considerations logged ·
Gap 5 and Gap 6 established as platform-wide design standards · Session 17 priorities
defined · §11, §13, §15, §16, §17, §19 updated

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
**CPMI-VRS AI Governance Standard** — Stage 3 COMPLETE · VRS certificate issued and
Gate 3 attested by Project Principal June 25, 2026.
**AgentOS** — Stage 4 COMPLETE · full pipeline built, E2E tested, and Level 1 validated.

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH → [Intelligence Layer] → CPMI ✅ → AgentOS ✅ → NEXUS ✅ → APEX → ARIA Suite
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ — COMPLETE
‖ Local LLM: Provider B wired · UNCLASSIFIED-only (GD-10)
‖ A2A: agent-to-agent messaging · synthetic · activates by config
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
9. All prompts registered before build — **9 APPROVED**
10. All agents registered before build — **16 registered** (all AgentCards active)
11. **Five synced copies of shared artifacts** — propagate all changes

**Codebase facts every session must know:**
- Real types: `SovereignRequestContext` / `SovereignLLMResponse` / `ClearanceLevel`
- `createSovereignClient()` unchanged — use `routedComplete()` for routing
- `sovereign-api-client` compiles commonjs — use `process.env`, not `import.meta.env`
- `SovereignEventType` NOT mirrored in `sovereign-data/src/shared-types.ts`
- NEXUS `minimumRole` is `AGENT_OPERATOR`
- GD-10: UNCLASSIFIED only — enforced at api-client AND NEXUS intake
- evaluate.py ↔ evaluate-port.ts is a cross-runtime config seam, not a live call

**GD-15 — Python Logger Taxonomy Re-sync (pre-approved, Session 17 first deliverable):**
`APPROVED_EVENT_TYPES` missing ~30 types from GD-2…GD-11.
`APPROVED_DECISION_TYPES` missing 5 members since GD-6. Catch-up only, no new types.

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
├── package.json                       ← git main · HEAD 058e630
├── SOVEREIGN_Platform_Integration_Brief_v1.25.md
├── Agent_Identity_Standard.md         ← v1.3 · 16 agents · all AgentCards active
├── sovereign-security/                ← 142 Python tests · evaluate.py
├── sovereign-api-client/              ← 174 tests
├── sovereign-data/                    ← 43 tests
├── sovereign-shell/shell-contract.ts  ← v1.11 · SHA 78709b21…0162db
├── module-counsel/                    ← COMPLETE — 91 tests
├── module-scribe/                     ← COMPLETE — 122 tests
├── module-vigil/                      ← COMPLETE — 113 tests
├── module-lens/                       ← COMPLETE — 58 tests
├── module-cpmi/                       ← COMPLETE — 58 tests
├── module-agentos/                    ← COMPLETE — 81 tests
├── module-nexus/                      ← COMPLETE — 48 tests
└── e2e/                               ← 4 E2E scenarios passing
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
| HumanDecisionType | governance | 15 members |
| PPBE entities (6) | program | PENDING |

---

## §11 — Current Build Status

### Stages 1–4 — COMPLETE
**Total tests: 792 JS + 142 Python = 934**

### Walkthrough A — COMPLETE (June 25, 2026)

Level 1 validation of Stage 4 pipeline. Six gaps identified. Three design
considerations logged. Gate 3 attestation completed by Project Principal.

**Pipeline results:**

| Stage | Result |
|---|---|
| SOVEREIGN Shell | ✅ Pass |
| NEXUS Intake | ⚠ Gap 1 — queue not rendering |
| AgentOS Task Creation | ✅ Pass |
| VIGIL Approval Queue | ✅ Pass |
| VIGIL P1 Approval | ✅ Pass — human-in-the-loop confirmed end-to-end |
| CPMI Reasoning Chain | ⚠ Gap 4 — static fallback (correct behavior, config gap) |
| CPMI World Model | ✅ Pass |
| CPMI-VRS Gates | ✅ Pass — Gate 3 attested, Gate 4 complete |

### Stage 5 — NEXT (Session 17)

Session 17 begins APEX. Before any APEX build, the Session 17 opening priorities
(§15) must be completed first.

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

---

## §13 — Open Governance Items

**CLOSED this version:**
- Walkthrough A Gate 3 attestation — **CLOSED** June 25, 2026
- Walkthrough A Gate 4 monitoring — **CLOSED** June 25, 2026

**Walkthrough A Gaps — Session 17 Technical Bugs:**

| ID | Gap | Priority |
|---|---|---|
| Gap 1 | NEXUS request queue does not render submitted entries. Form submits and clears correctly but submitted request does not appear in the queue table. | Session 17 — fix before APEX |
| Gap 2 | AgentOS task table text not readable. Task title, classification, agent, and approval status columns render too faint against dark background. | Session 17 — covered by Gap 3 audit |
| Gap 3 | Full color and contrast audit required across all products. Tab labels, active tab states, table text, column headers, and secondary text rendering with insufficient contrast. Confirmed across NEXUS, AgentOS, VIGIL, CPMI. | Session 17 — platform-wide pass |
| Gap 4 | CPMI live reasoning service not connecting in dev environment. Static fallback fired correctly and transparently. Investigate whether configuration gap or expected dev behavior. | Session 17 — investigate |

**Walkthrough A Design Standards — Platform-Wide (every product, every walkthrough):**

| ID | Standard | Scope |
|---|---|---|
| Gap 5 | **Human readability standard.** All AI-generated output, system messages, briefs, reasoning chains, constraints, and recommendations must be written in plain prose readable by a non-technical human reviewer. Compressed machine-style formatting must be replaced with complete sentences and clear plain-language explanations. No product passes its Walkthrough validation with machine-readable-only output surfaced to human reviewers. | Session 17 + every Stage |
| Gap 6 | **Content type distinction standard.** Every screen surfacing text to a human reviewer must visually distinguish between: (1) temporary system status notices reflecting current limitations, (2) permanent governance guardrails always present by design, and (3) substantive operational content the reviewer must act on. A reviewer must orient within five seconds. No product passes its Walkthrough validation without this distinction implemented. | Session 17 + every Stage |

**Walkthrough A Design Considerations — Future Stages:**

| ID | Consideration | Target |
|---|---|---|
| DC-1 | VIGIL sub-prioritization within P1. When multiple P1 items exist, no mechanism to distinguish relative criticality. Define whether sub-prioritization uses consequence type, agent class, expiry window, or combination. | Stage 6 / hardening |
| DC-2 | Program dossier export. Every program in the World Model must be exportable as a complete package — world model data, reasoning chain history, governance decisions, risk register, regulatory constraints, and flags — formatted for human review and briefing. | APEX stage |
| DC-3 | Data provenance and drill-down. Every calculated figure, status assessment, and flag surfaced by CPMI must link to underlying data. For each flag: source data, baseline, date of most recent update, trend over time, and responsible party. A program manager cannot defend a finding they cannot trace. | APEX stage |

**Carried (all prior items):**
- GD-15 Python logger re-sync (item 52) — Session 17 first deliverable
- AgentOS §5.2 missing (item 53)
- evaluate.py cross-runtime adapter (item 54)
- PPBE six governance decisions (item 46) — Session ~19
- GD-10 lift trigger (item 42)

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.17 (through Session 16).
Shell contract v1.11 · `78709b21…0162db`. 934 total tests. 0 vulnerabilities.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. Verify shell-contract.ts SHA-256 = `78709b21…0162db` (v1.11).
3. State done condition — wait for Project Principal approval.
4. One component per exchange — build, verify, confirm, proceed.
5. Close with handoff — never skip.

**Session 17 Opening Priorities (in order — complete before APEX build begins):**

1. **GD-15** — Python Logger Taxonomy Re-sync (pre-approved, fold in as first commit)
2. **Gap 3** — Color and contrast audit pass across all seven products
3. **Gap 1** — NEXUS request queue data binding fix
4. **Gap 4** — CPMI live reasoning service connection investigation
5. **Gap 5 + Gap 6** — Author Human Reviewer Experience Standard as a written
   design document before APEX build begins. Every APEX screen must meet this standard.
6. **DC-2 + DC-3** — Scope program dossier export and data provenance drill-down
   as first-order APEX requirements (captured in APEX architecture spec)
7. **NEXUS-to-AgentOS pipeline handoff** — evaluate whether to wire in Session 17
   or defer to dedicated integration session

**Then begin APEX build.**

---

## §16 — Level 1 Walkthrough Protocol (Standing Requirement)

**Walkthrough Schedule:**

| Walkthrough | After Session | Stage | Status |
|---|---|---|---|
| **A** | **16** | **Stage 4** | **COMPLETE — June 25, 2026** |
| B | ~18 | Stage 5a (APEX) | Pending |
| C | ~21 | Stage 5b (FLOWPATH) | Pending |
| D | ~25 | Stage 6 (ARIA Suite) | Pending |
| E | ~27 | Pre-IL | Pending |
| F | ~32 | Full platform | Pending |

**Walkthrough validation standard (from Walkthrough A):** No product passes its
Walkthrough validation if Gap 5 or Gap 6 standards are not met. Human reviewers
must be able to read all output as plain prose and orient within five seconds.

---

## §17 — Primary Product Inserts

| Product | Stage | Status |
|---|---|---|
| CPMI | Stage 3 | **COMPLETE — VRS certified, Gate 3 attested June 25** |
| AgentOS | Stage 4 | **COMPLETE** |
| NEXUS | Stage 4 | **COMPLETE** (Gap 1 queue fix pending Session 17) |
| APEX | Stage 5 | **Session 17–18 — NEXT** |
| FLOWPATH | Stage 5 | Sessions 20–21 |
| ARIA Suite | Stage 6 | Sessions 23–25 |

---

## §18 — Companion Suite — FULLY COMPLETE

16 registered agents · 9 approved prompts · 442 JS companion tests

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.23 | June 24, 2026 | Walkthrough cadence + PPBE sequence + build roadmap |
| v1.24 | June 24, 2026 | Session 16: Stage 4 complete, 934 tests |
| **v1.25** | **June 25, 2026** | **Walkthrough A complete · 6 gaps · 3 design considerations · Gate 3 attested · Gap 5/6 as platform-wide standards · Session 17 priorities defined** |

---

## §20 — Full Build Roadmap

### Stage 4 — COMPLETE ✅
### Walkthrough A — COMPLETE ✅

### Stage 5 — APEX + FLOWPATH

| Session | Type | Scope |
|---|---|---|
| **17** | **Build** | **GD-15 + Gap fixes + Human Reviewer Standard + APEX scaffold** |
| 18 | Build | APEX completion + CPMI-VRS certification |
| **Walkthrough B** | Validation | Stage 5a: APEX analytics in pipeline |
| 19 | Governance | PPBE six decisions (D-P1–D-P6) — Claude Chat |
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

*SOVEREIGN Platform Integration Brief v1.25 · June 25, 2026*
*Pre-Decisional · Internal Working Document*

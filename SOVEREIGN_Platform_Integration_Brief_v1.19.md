# SOVEREIGN Platform Integration Brief
## Version 1.19 | June 24, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.18
**Changed this version:** Session 12 complete (autonomous — D1 benchmark suite,
D2 autonomous gate cycle, D3 world-model config wiring) · Gate 3 attestation
completed by Project Principal · Gate 4 passed · First VRS certificate issued
for CPMI by cpmi.vrs-certification · Stage 3 COMPLETE · module-cpmi 46→58 tests
· platform total 743→755 · HEAD updated to 310f5ed · CPMI module navigation
state noted as follow-up item · §5, §8, §11, §12, §13, §14, §15, §17, §19 updated

---

## §1 — What This Document Is

Mandatory context for every SOVEREIGN Platform development session. Load order:
Integration Brief (current version) → `SOVEREIGN_Agent_to_Agent_Briefing.md` →
`system_prompt.md` → product or companion suite spec → prior session handoff →
`shell-contract.ts`.

Confirm all documents are loaded by name before any build work begins.
Verify shell-contract.ts SHA-256 matches the v1.5 hash of record before any
build work begins.

---

## §2 — Platform Definition

**SOVEREIGN — Governed Agentic Runtime with Integrated Security, Intelligence, and
Oversight Networks**

Six primary products (NEXUS, CPMI, APEX, FLOWPATH, AgentOS, ARIA Suite) plus four
companion modules (COUNSEL, SCRIBE, LENS, VIGIL). A seventh product, the Intelligence
Layer, is a future build and must never be lost.

**Three non-negotiable design outcomes:** Integration reliability · Operational
efficiency · End-to-end security observability.

---

## §3 — Three Shared Infrastructure Layers

**SOVEREIGN Security Observability Framework** — `sovereign-security/` · 127 tests ·
Stage 1 COMPLETE.

**CPMI-VRS AI Governance Standard** — portfolio-wide; NIST AI RMF aligned.
**CPMI module Stage 3 COMPLETE** — the first VRS certificate issued June 24, 2026.
Every primary product build now has a certified governance path.

**AgentOS** — MLOps backbone; Security Framework + CPMI-VRS embedded.

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH → [Intelligence Layer, future] → CPMI ✅ → AgentOS → NEXUS / APEX → ARIA Suite
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ — COMPLETE
‖ PPBE — future workflow layer · deferred Stage 5+
```

---

## §5 — Governance Role Assignments (Permanent)

| Role | Assigned To | Status |
|---|---|---|
| CPMI Product Owner | Project Principal | **Stage 3 COMPLETE** |
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
8. `shell-contract.ts` is a governance document —
   **v1.5 · SHA-256: `8f50399cf5e03c33f3d2a809ff5a5c66167b98ba7aa980b418c259b1d4537a7a`**
   (unchanged Sessions 11–12)
9. All prompts registered before build — **9 APPROVED**
10. All agents registered before build — **11 registered agents**
11. **Five synced copies of shared artifacts** — changes must propagate to all copies

---

## §7 — CPMI Enhanced Monitoring

CPMI operates at **0.7× standard anomaly threshold** — architectural constant.
`CPMI_DRIFT_DETECTED` alerts route to VIGIL as P1. `cpmi.reasoning-chain` uses
`RE_EXECUTE` approval behavior — full chain restarts after Gate 3 attestation.

**First VRS certificate issued:** June 24, 2026. Issued by `cpmi.vrs-certification`
for product `cpmi`. All four gates complete. Gate 3 attested by Project Principal.

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← npm workspace root · git main · HEAD 310f5ed
├── SOVEREIGN_Platform_Integration_Brief_v1.19.md
├── Agent_Identity_Standard.md         ← v1.2 · 11 agents
├── SOVEREIGN_Agent_to_Agent_Briefing.md
├── sovereign-security/                ← 127 Python tests
├── sovereign-api-client/              ← 143 tests
├── sovereign-data/                    ← 43 tests · v1.2.0
├── sovereign-shell/
│   ├── shell-contract.ts              ← v1.5 · SHA 8f50399c…37a7a
│   └── src/register-modules.ts
├── module-counsel/                    ← COMPLETE — 91 tests
├── module-scribe/                     ← COMPLETE — 122 tests
├── module-vigil/                      ← COMPLETE — 113 tests
├── module-lens/                       ← COMPLETE — 58 tests
├── module-cpmi/                       ← Stage 3 COMPLETE — 58 tests
│   └── src/
│       ├── benchmark.ts               ← NEW S12
│       ├── useBenchmark.ts            ← NEW S12
│       ├── BenchmarkPanel.tsx         ← NEW S12
│       ├── gate-checks.ts             ← NEW S12
│       └── cpmi-world-model-endpoint.ts  ← NEW S12
└── docs/
    ├── 08_CPMI_Architecture.md
    ├── 09_CPMI_Stage3_Completion.md
    └── [other specs]
```

**Git:** Branch `main`. HEAD and origin/main at `310f5ed` (in sync).
**Absolute path:** `/Users/developmentsystem/Developer/sovereign-platform/`

---

## §9 — Intelligence Layer Exposure Requirements

| Field | Required On | IL Component | Status |
|---|---|---|---|
| `workflow_step_id` | Every Logger event | All five IL components | Enforced |
| `decision_type` | Every human decision event | Judgment Detection | Enforced |
| `GATE_3_ATTESTATION` | CPMI Gate 3 attestation | Judgment Detection | **LIVE — Session 11/12** |
| `CPMI_REASONING_CHAIN_COMPLETE` | Every completed chain | Risk Modeler | LIVE — Session 11 |
| `AGENT_APPROVAL` | Agent approval decisions | Judgment Detection | LIVE — Session 10 |
| VVR export schema | FLOWPATH VVRs | Task Decomposition Engine | Pending |

---

## §10 — Shared Data Dictionary

| Entity | Canonical ID | Classification | Status |
|---|---|---|---|
| Employee | `employee_id` | program | Implemented |
| Program | `program_id` | program | Implemented |
| Cost Code | `cost_code` | program | Implemented |
| Document | `document_id` | program | Implemented |
| Vendor | `vendor_id` | program | Implemented |
| StyleProfile | `user_id` | user | LIVE |
| LensExplanation | — | companion | LIVE |
| ReasoningChainOutput | — | governance | LIVE |
| HumanDecisionType | — | governance | 13 members |
| PPBE entities (6) | see PPBE doc | program | PENDING |

---

## §11 — Current Build Status

### Stage 1 — COMPLETE (127 Python tests)

### Stage 2 — COMPLETE (companion suite — 384 JS tests)

### Stage 3 — **COMPLETE**

| Deliverable | Tests | Status |
|---|---|---|
| CPMI module — reasoning chain + gate runner + VRS certification | 46 | ✅ Session 11 |
| Known-answer benchmark suite | +12 | ✅ **Session 12** |
| Gates 1–4 complete · Gate 3 attested by Project Principal | — | ✅ **Session 12** |
| **First VRS certificate issued** | — | ✅ **June 24, 2026** |
| World-model config seam (Notion-ready) | — | ✅ Session 12 |

**Total tests passing: 628 JS + 127 Python = 755 total**

**Follow-up items (non-blocking for Stage 4):**
- CPMI module navigation state not preserved across tab switches — UI fix Session 13
- VRS certificate shape simplified vs. spec §4 — enrich when richer shape needed
- Gate 4 simplified — full Anomaly Detector baseline + VIGIL routing test deferred
- Live Notion WorldModelPort adapter — injectable by config when needed

### Stage 4 — NEXT (Local LLM Infrastructure + AgentOS)

Five Local LLM decisions recorded (R7 CLOSED). Session 13 scope to be confirmed.

---

## §12 — Risk Register

| ID | Risk | Status |
|---|---|---|
| R1 | Human-review-volume architecture | OPEN |
| R2 | AI Provider Abstraction Layer | **CLOSED** |
| R3 | Agent Operator Role Undefined | **CLOSED** |
| R4 | Federal Client Workforce Transition | OPEN — LENS mitigates |
| R5 | CPMI world model REST API | **MITIGATED** — config seam wired |
| R6 | AgentOS evaluate.py never tested | OPEN |
| R7 | Tier 2 LLM Provider | **CLOSED for demo scope** |
| R8 | Shell ↔ module contract drift | MITIGATED |
| R9 | NEXUS ATO timeline | OPEN — Stage 5 |
| R10 | AgentOS surface absent | **CLOSED** — VIGIL |
| R11 | Security Framework alert response | **CLOSED** — VIGIL complete |
| R12 | PPBE integration deferred | OPEN — Stage 5+ |
| OWI-FP-001 | FLOWPATH elicitation gap | MITIGATED |
| OWI-INT-001 | Cross-product failure topology | OPEN — Stage 9 |

---

## §13 — Open Governance Items

**CLOSED this session:**
- Stage 3 — **COMPLETE** (first VRS certificate issued June 24, 2026)
- Gate 3 attestation pending — **CLOSED** (attested by Project Principal)

**Carried (unchanged):**
1–27. [items 1–27 unchanged from v1.18]
28. Agent Operator Scope — update with local model SLA before live inference
29. PPBE — 6 governance decisions required before Phase I
30. Live WorldModelPort — inject Notion adapter by config when needed
31. `WORLD_MODEL_UPDATE` flow — deferred

**New from Session 12:**
32. **CPMI module navigation state** — Gate Runner panel does not preserve gate
    state when navigating away and back. UI fix needed in Session 13 or later.
33. **VRS Certificate shape** — current shape is simplified vs. spec §4. Enrich
    when the richer certificate schema is needed for downstream consumption.
34. **Gate 4 full implementation** — simplified auto-record only. Full Anomaly
    Detector baseline + VIGIL routing test deferred to AgentOS build session.

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.13 (through Session 12).
Shell contract v1.5 · `8f50399c…37a7a` · unchanged.
`@sovereign/data` v1.2.0. 0 production vulnerabilities.

**Running test totals:** pytest 127 · api-client 143 · data 43 · counsel 91 ·
scribe 122 · vigil 113 · lens 58 · cpmi 58 = **628 JS + 127 Python = 755 total**.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. Verify shell-contract.ts SHA-256 = `8f50399c…37a7a` (v1.5).
3. State done condition — wait for Project Principal approval.
4. One component per exchange — build, verify, confirm, proceed.
5. Close with handoff — never skip.

**Session 13 context package:**
1. `SOVEREIGN_Platform_Integration_Brief_v1.19.md`
2. `SOVEREIGN_Agent_to_Agent_Briefing.md`
3. `PROJECT_SUMMARY.md`
4. `AGENT_BACKGROUND_AND_LESSONS_LEARNED.md`
5. `system_prompt.md`
6. `SOVEREIGN_Session12_Handoff.md`
7. `shell-contract.ts`
8. `Agent_Identity_Standard.md`

**Session 13 scope: Project Principal decides. Stage 4 is next.**

---

## §16 — Architectural Patterns (Platform Standard)

All patterns from v1.18 apply. Session 12 additions:

**gate3_ready pattern.** The Gate 3 attestation surface activates only when
`gate3_ready: true` — which requires 100% schema compliance and 100% step
completion across all benchmark scenarios. This is the platform standard for any
human-gated certification step: the gate never opens until the evidence base is
complete. The human attestation is an authorization, not a blind approval.

**Autonomous session pattern.** Sessions designated as autonomous operate within
a pre-approved scope boundary. Claude Code surfaces blockers in the handoff rather
than acting on them. Human decisions remain human decisions regardless of whether
the Project Principal is present. This pattern is safe and repeatable for any
session where the done condition contains no human decision gates mid-build.

---

## §17 — Primary Product Inserts

| Product | Stage | Build Status |
|---|---|---|
| **CPMI** | **Stage 3** | **COMPLETE — VRS certified June 24, 2026** |
| NEXUS | Stage 5 | Not started |
| APEX | Stage 6 | Not started |
| FLOWPATH | Stage 1 (pipeline) | Not started |
| AgentOS | Stage 4 | Not started |
| ARIA Suite | Stage 7 | Not started |

All data SYNTHETIC. Governance Clock not activated.

---

## §18 — Companion Suite — FULLY COMPLETE

| Module | Tests | Status |
|---|---|---|
| COUNSEL | 91 | COMPLETE |
| SCRIBE | 122 | COMPLETE |
| VIGIL | 113 | COMPLETE |
| LENS | 58 | COMPLETE |

**11 registered agents · 9 approved prompts**

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.0–v1.14 | May 31 – June 23, 2026 | See prior versions |
| v1.15 | June 23, 2026 | Session 10: Stage 2 complete, 690 tests |
| v1.16 | June 23, 2026 | PPBE recorded |
| v1.17 | June 23, 2026 | Local LLM decisions, R7 closed |
| v1.18 | June 23, 2026 | Session 11: CPMI module, 743 tests |
| **v1.19** | **June 24, 2026** | **Session 12 (autonomous): benchmark suite, gate cycle, Gate 3 attested, Gate 4 passed, first VRS certificate issued, Stage 3 COMPLETE, 755 tests, HEAD 310f5ed** |

---

*SOVEREIGN Platform Integration Brief v1.19 · June 24, 2026*
*Pre-Decisional · Internal Working Document*

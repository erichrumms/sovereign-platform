# SOVEREIGN Platform Integration Brief
## Version 1.18 | June 23, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.17
**Changed this version:** Session 11 complete (D1 shell-contract v1.4→v1.5 / GD-7,
D2 CPMI module — first primary product) · shell-contract v1.5 hash of record:
`8f50399c…37a7a` · `@sovereign/data` 1.1.0→1.2.0 · ReasoningChainOutput entity ·
HumanDecisionType 11→13 members · CPMI module 46 tests · platform total 690→743 ·
Stage 3 begun · HEAD updated to 168a6fe · §6, §8, §11, §12, §13, §14, §15, §17,
§18, §19 updated

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
**CPMI module now built (Session 11)** — the gate runner and VRS certification engine
are operational. Every primary product build now has a certification path.

**AgentOS** — MLOps backbone; Security Framework + CPMI-VRS embedded.

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH → [Intelligence Layer, future] → CPMI ✅ → AgentOS → NEXUS / APEX → ARIA Suite
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ — ALL COMPLETE
‖ PPBE — future workflow layer · deferred Stage 5+
```

---

## §5 — Governance Role Assignments (Permanent)

| Role | Assigned To | Status |
|---|---|---|
| CPMI Product Owner | Project Principal | Stage 3 IN PROGRESS |
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
   **(replaces v1.4 hash `1a557e3b…b435d9`, retired Session 11 / GD-7)**
9. All prompts registered before build — **9 APPROVED**
   (PR-COUNSEL-001/002/003, PR-SCRIBE-001, PR-SCRIBE-004, PR-VIGIL-001,
   PR-VIGIL-002, PR-LENS-001, PR-CPMI-001)
10. All agents registered before build — **11 registered agents**
    (8 companion-suite + 3 CPMI)
11. **Five synced copies of shared artifacts** — changes must propagate to all copies

---

## §7 — CPMI Enhanced Monitoring

CPMI operates at **0.7× standard anomaly threshold** — architectural constant.
`CPMI_DRIFT_DETECTED` alerts route to VIGIL as P1 regardless of drift score magnitude.
The CPMI triage checklist (PR-VIGIL-001) assesses anomaly patterns, never reasoning
correctness — only CPMI-VRS Gate 3 with human attestation judges correctness.

**`cpmi.reasoning-chain` approval behavior: `RE_EXECUTE`** — the full six-step chain
restarts after Gate 3 human approval. Rationale: world model may update during review;
stale chain + fresh approval = governance risk.

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← npm workspace root · git main · HEAD 168a6fe
├── SOVEREIGN_Platform_Integration_Brief_v1.18.md
├── Agent_Identity_Standard.md         ← v1.2 · 11 agents (8 companion + 3 CPMI)
├── SOVEREIGN_Agent_to_Agent_Briefing.md
├── sovereign-security/                ← 127 Python tests
├── sovereign-api-client/              ← 143 tests
├── sovereign-data/                    ← 43 tests · v1.2.0 · HumanDecisionType 13 members
├── sovereign-shell/
│   ├── shell-contract.ts              ← v1.5 · SHA 8f50399c…37a7a (GD-7, Session 11)
│   └── src/register-modules.ts       ← mounts counsel+scribe+vigil+lens+cpmi
├── module-counsel/                    ← COMPLETE — 91 tests
├── module-scribe/                     ← COMPLETE — 122 tests
├── module-vigil/                      ← COMPLETE — 113 tests
├── module-lens/                       ← COMPLETE — 58 tests
├── module-cpmi/                       ← Stage 3 · 46 tests · PLATFORM_ADMIN gate
│   └── src/
│       ├── cpmi-contract.ts
│       ├── world-model-port.ts        ← synthetic/dev · live Notion injectable
│       ├── reasoning-engine.ts        ← six-step chain · 0.7× threshold
│       ├── useReasoningChain.ts
│       ├── gate-runner.ts
│       ├── useGateRunner.ts
│       ├── vrs-certification.ts
│       └── prompts/reasoning-chain-v1.0.md  ← PR-CPMI-001
└── docs/
    ├── 08_CPMI_Architecture.md
    ├── 06_LocalLLM_Architecture.md
    ├── 07_LocalLLM_Decision_Framework.md
    └── [companion suite specs]
```

**Git:** Branch `main`. HEAD and origin/main at `168a6fe` (in sync).
**Absolute path:** `/Users/developmentsystem/Developer/sovereign-platform/`

---

## §9 — Intelligence Layer Exposure Requirements

| Field | Required On | IL Component | Status |
|---|---|---|---|
| `workflow_step_id` | Every Logger event | All five IL components | Enforced |
| `decision_type` | Every human decision event | Judgment Detection | Enforced |
| `GATE_3_ATTESTATION` | CPMI Gate 3 attestation | Judgment Detection | **LIVE — Session 11** |
| `WORLD_MODEL_UPDATE` | World model updates | Judgment Detection | Built — flow deferred |
| `AGENT_APPROVAL` | Agent approval decisions | Judgment Detection | LIVE — Session 10 |
| All six COUNSEL IL fields | COUNSEL Decision Records | Judgment Detection + Risk Modeler | LIVE — Session 5 |
| `CPMI_REASONING_CHAIN_COMPLETE` | Every completed chain | Risk Modeler + Task Decomposition | **LIVE — Session 11** |
| Alert-response `decision_type` | VIGIL alert responses | Judgment Detection | DEFERRED |
| VVR export schema | FLOWPATH VVRs | Task Decomposition Engine | Pending |

**The Intelligence Layer is the seventh product. It must never be lost.**

---

## §10 — Shared Data Dictionary

| Entity | Canonical ID | Classification | Status |
|---|---|---|---|
| Employee | `employee_id` | program | Implemented |
| Program | `program_id` | program | Implemented |
| Cost Code | `cost_code` | program | Implemented |
| Document | `document_id` | program | Implemented |
| Vendor | `vendor_id` | program | Implemented |
| StyleProfile | `user_id` | user | LIVE — Session 6 |
| LensExplanation | — | companion | LIVE — Session 8 |
| **ReasoningChainOutput** | — | governance | **LIVE — Session 11** |
| HumanDecisionType | — | governance | **13 members** (GATE_3_ATTESTATION + WORLD_MODEL_UPDATE added Session 11) |
| PPBE entities (6) | see PPBE architecture doc | program | PENDING — D-P3 required |

---

## §11 — Current Build Status

### Stage 1 — COMPLETE (127 Python tests)

### Stage 2 — COMPLETE (companion suite)

### Stage 3 — IN PROGRESS (CPMI-VRS elevation)

| Deliverable | Tests | Status |
|---|---|---|
| CPMI module — reasoning chain + gate runner + VRS certification | 46 | ✅ **Session 11** |
| Live world model (Notion-backed WorldModelPort) | — | Deferred — injectable by config |
| WORLD_MODEL_UPDATE human-gated update flow | — | Deferred — future session |
| Remaining Stage 3 deliverables | — | Session 12+ |

**Total tests passing: 616 JS + 127 Python = 743 total**

### Stage 4 — Local LLM Infrastructure

Five decisions recorded (R7 CLOSED for demo scope). Build begins after Stage 3
complete. Anthropic API primary through demo.

### Stage 5+ — Future

PPBE integration architecture authored. Six governance decisions required before
Phase I opens.

---

## §12 — Risk Register

| ID | Risk | Status |
|---|---|---|
| R1 | Human-review-volume architecture | OPEN — before Stage 5 |
| R2 | AI Provider Abstraction Layer | **CLOSED** |
| R3 | Agent Operator Role Undefined | **CLOSED** |
| R4 | Federal Client Workforce Transition | OPEN — LENS primary mitigation |
| R5 | CPMI world model REST API not deployed | **MITIGATED** — WorldModelPort injectable; live Notion backing by config |
| R6 | AgentOS evaluate.py never tested | OPEN |
| R7 | Tier 2 LLM Provider Unresolved | **CLOSED for demo scope** — five decisions recorded June 23 |
| R8 | Shell ↔ module contract drift | MITIGATED |
| R9 | NEXUS ATO timeline | OPEN — Stage 5 |
| R10 | AgentOS has no user-facing surface | **CLOSED** — VIGIL |
| R11 | Security Framework alert response absent | **CLOSED** — VIGIL complete |
| R12 | PPBE integration deferred | OPEN — Stage 5+ |
| OWI-FP-001 | FLOWPATH elicitation gap | MITIGATED — SCRIBE framing |
| OWI-INT-001 | Cross-product failure topology | OPEN — Stage 9 |

---

## §13 — Open Governance Items

**CLOSED this session:**
- CPMI agents not in registry — **CLOSED** (Agent Identity Standard v1.2, pre-Session 11)
- R5 CPMI world model deployment — **MITIGATED** (WorldModelPort injectable)

**Carried (unchanged):**
1. Decision 24 — role→module access matrix (CPMI minimumRole=PLATFORM_ADMIN
   relaxable when matrix is written)
2. Decision 25 — access-denial taxonomy gap
3. esbuild advisory — deferred Stage 5+
4. shell-contract Section 1 re-export reconciliation
5. Module mount/unmount event-type gap
6–17. [items 6–17 unchanged from v1.17]
18. Alert-response `HumanDecisionType` members — deferred
19. `ALERT_INVESTIGATING` gap
20. ~~`sovereign.jsonl` git-ignore~~ — CLOSED Session 10
21. LENS Pipeline Navigator — shell future
22. LENS AI Transparency Panel — shell future
23. PR-SCRIBE-002/003 optional
24. ~~R7 LLM decisions~~ — CLOSED v1.17
25. Activating live operation — future governance decision
26. Legacy `AgentApprovalQueue.tsx` stub — removable in cleanup
27. Live `AgentApprovalPort` — inject when AgentOS A2A is built
28. Agent Operator Scope — update with local model SLA before live inference
29. PPBE — 6 governance decisions required before Phase I

**New from Session 11:**
30. **Live WorldModelPort** — inject Notion-backed `WorldModelPort` by configuration
    when wired; no CPMI rewrite (Constraint #3).
31. **`WORLD_MODEL_UPDATE` flow** — decision type built (v1.5); WorldModelPanel is
    read-only this session; human-gated world model update flow is future work.

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.12 (through Session 11).
Shell contract v1.5 hash: `8f50399c…37a7a`.
`@sovereign/data` v1.2.0 · HumanDecisionType: 13 members.
0 production vulnerabilities.

**Running test totals:** pytest 127 · api-client 143 · data 43 · counsel 91 ·
scribe 122 · vigil 113 · lens 58 · cpmi 46 = **616 JS + 127 Python = 743 total**.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. Verify shell-contract.ts SHA-256 = `8f50399c…37a7a` (v1.5) before any build work.
3. State done condition — wait for Project Principal approval.
4. One component per exchange — build, verify, confirm, proceed.
5. Close with handoff — never skip.

**Session 12 context package:**
1. `SOVEREIGN_Platform_Integration_Brief_v1.18.md`
2. `SOVEREIGN_Agent_to_Agent_Briefing.md`
3. `PROJECT_SUMMARY.md`
4. `AGENT_BACKGROUND_AND_LESSONS_LEARNED.md`
5. `system_prompt.md`
6. `SOVEREIGN_Session11_Handoff.md`
7. `shell-contract.ts`
8. `Agent_Identity_Standard.md`
9. `module-cpmi/src/index.ts`
10. `module-cpmi/src/reasoning-engine.ts`
11. `module-cpmi/src/gate-runner.ts`
12. `docs/08_CPMI_Architecture.md`

**Pre-Session 12 Claude Chat actions:**
- Confirm Session 12 scope with Project Principal
- Update `SOVEREIGN_Agent_to_Agent_Briefing.md` to reflect Session 11 and v1.5 hash
- Author Session 12 architecture spec if needed

**Session 12 scope: Project Principal decides.**

---

## §16 — Architectural Patterns (Platform Standard)

All patterns from v1.17 apply. Session 11 additions:

**RE_EXECUTE approval behavior.** `cpmi.reasoning-chain` restarts the full six-step
chain after Gate 3 human approval. This is the exception to the platform default of
`ACKNOWLEDGE_AND_CONTINUE`. Rationale: the world model may update during the Gate 3
review period; a stale chain certified by a fresh approval is a governance risk.
The chain is inexpensive to re-run; the downstream risk of a stale governance output
is not. Platform standard: any agent whose output serves as governance certification
input should use `RE_EXECUTE`.

**Schema-gated output surfacing.** CPMI reasoning chain outputs are validated against
`ReasoningChainOutput` schema before being surfaced to the operator or passed to
downstream products. A `schema_valid: false` output never leaves the engine.
Platform standard for any agent producing canonical governance outputs.

**PLATFORM_ADMIN structural gate.** CPMI mounts with `minimumRole: PLATFORM_ADMIN`
and a structural gate — the same pattern as VIGIL. The platform governance engine
is the most restricted module. This is relaxable by configuration when Decision 24
(role→module access matrix) is written.

---

## §17 — Primary Product Inserts (Summary Reference)

| Product | Stage | Build Status |
|---|---|---|
| CPMI | Stage 3 | **Module built Session 11** — reasoning chain, gate runner, VRS certification. Live world model deferred. |
| NEXUS | Stage 5 | Not started |
| APEX | Stage 6 | Not started |
| FLOWPATH | Stage 1 (pipeline position) | Not started |
| AgentOS | Stage 4 | Not started |
| ARIA Suite | Stage 7 | Not started |

All governance records INCOMPLETE. All data SYNTHETIC. Governance Clock not activated.

---

## §18 — Companion Suite — FULLY COMPLETE

| Module | Tests | Status |
|---|---|---|
| COUNSEL | 91 | COMPLETE |
| SCRIBE | 122 | COMPLETE |
| VIGIL | 113 | COMPLETE |
| LENS | 58 | COMPLETE |

### Registered Agents (11 total)

| Agent ID | Product/Module | Class | Status |
|---|---|---|---|
| `cpmi.reasoning-chain` | CPMI | Governance | **Implemented — Session 11** |
| `cpmi.world-model-api` | CPMI | Operational | **Implemented — Session 11** |
| `cpmi.vrs-certification` | CPMI | Governance | **Implemented — Session 11** |
| `counsel-analyst` | COUNSEL | Analytical | Implemented |
| `scribe-drafter` | SCRIBE | Operational | Implemented |
| `scribe-style-analyst` | SCRIBE | Analytical | Implemented |
| `vigil-triage-analyst` | VIGIL | Monitoring | Implemented |
| `vigil-approval-agent` | VIGIL | Monitoring | Implemented |
| `lens-explainer` | LENS | Analytical | Implemented |
| `lens-orientation` | LENS | Analytical | Registered — scaffold only |

### Approved Prompts (9 total)

| ID | Prompt | Approved |
|---|---|---|
| PR-COUNSEL-001/002/003 | Analysis, Counterargument, Pre-Mortem | June 15–16, 2026 |
| PR-SCRIBE-001 | Drafting Engine | June 16, 2026 |
| PR-SCRIBE-004 | Style Analysis | June 17, 2026 |
| PR-VIGIL-001 | Triage System | June 17, 2026 |
| PR-VIGIL-002 | Approval System | June 23, 2026 |
| PR-LENS-001 | Explainer System | June 18, 2026 |
| **PR-CPMI-001** | **Reasoning Chain** | **June 23, 2026** |

### iCloud — New Files This Version (v1.18)

```
7 - SOVEREIGN/
  SOVEREIGN_Platform_Integration_Brief_v1.18.md    ← replaces v1.17
  SOVEREIGN_Session11_Handoff.md
  Companion Suite/Governance/
    SBOM_Registry_v1.12_MERGED.md                  ← replaces v1.11
```

**Copy to monorepo and commit:**
```bash
cp ~/Downloads/SOVEREIGN_Platform_Integration_Brief_v1_18.md \
   ~/Developer/sovereign-platform/SOVEREIGN_Platform_Integration_Brief_v1.18.md
cd ~/Developer/sovereign-platform
git add SOVEREIGN_Platform_Integration_Brief_v1.18.md
git commit -m "docs: Integration Brief v1.18 (Session 11 — CPMI module, Stage 3 begun)"
git push
```

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.0–v1.12 | May 31 – June 22, 2026 | See prior versions |
| v1.13 | June 23, 2026 | Session 8: LENS core, SCRIBE complete, 640 tests |
| v1.14 | June 23, 2026 | Session 9: Security Framework wiring, 649 tests |
| v1.15 | June 23, 2026 | Session 10: shell-contract v1.4, VIGIL complete, 690 tests |
| v1.16 | June 23, 2026 | PPBE integration architecture recorded |
| v1.17 | June 23, 2026 | Local LLM decisions D1–D5 recorded, R7 closed |
| **v1.18** | **June 23, 2026** | **Session 11: shell-contract v1.5 (GD-7, hash 8f50399c…37a7a), CPMI module (first primary product, 46 tests), 743 total tests, Stage 3 begun, HEAD 168a6fe** |

---

*SOVEREIGN Platform Integration Brief v1.18 · June 23, 2026*
*Pre-Decisional · Internal Working Document*

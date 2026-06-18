# SOVEREIGN Platform Integration Brief
## Version 1.9 | June 16, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.8
**Changed this version:** COUNSEL fully complete (Counterargument + Pre-Mortem +
Decision Record output) · PR-COUNSEL-002/003 authored and APPROVED · PR-SCRIBE-001
authored and APPROVED · RTL/jsdom component test layer added (272 total tests) ·
SCRIBE scaffold built and mounting · git repository initialized (branch main, tag
v1.0.0) · GitHub remote configured (push deferred) · five synced copies noted ·
19 dev-only RTL advisories recorded · §11 and §19 updated · SBOM v1.6

---

## §1 — What This Document Is

This brief is the mandatory context document for every SOVEREIGN Platform development
session. Load order: Integration Brief v1.9 → `system_prompt.md` → product or
companion suite spec → prior session handoff → `shell-contract.ts`.

Confirm all documents are loaded by name before any build work begins.

---

## §2 — Platform Definition

**SOVEREIGN — Governed Agentic Runtime with Integrated Security, Intelligence, and
Oversight Networks**

Six integrated primary products plus four companion suite modules (COUNSEL, SCRIBE,
LENS, VIGIL). A seventh product, the Intelligence Layer, is a future build and must
never be lost.

**Three non-negotiable design outcomes:** Integration reliability · Operational
efficiency · End-to-end security observability.

---

## §3 — Three Shared Infrastructure Layers

**SOVEREIGN Security Observability Framework** — `sovereign-security/` · 127 tests ·
Stage 1 COMPLETE. Terminal point: VIGIL Alert Queue.

**CPMI-VRS AI Governance Standard** — portfolio-wide; NIST AI RMF aligned; applies
to all products including companion suite.

**AgentOS** — MLOps backbone; Security Framework + CPMI-VRS embedded. Human-approval
interface: VIGIL Agent Approval Queue.

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH → [Intelligence Layer, future] → CPMI → AgentOS → NEXUS / APEX → ARIA Suite
‖ Companion Suite: COUNSEL · SCRIBE · LENS · VIGIL (parallel human-support layer)
```

---

## §5 — Governance Role Assignments (Permanent)

| Role | Assigned To | Status |
|---|---|---|
| CPMI Product Owner | Project Principal | Session 0A — Stage 3 SATISFIED |
| ARIA Suite Product Owner | Project Principal | Session 0A — UNBLOCKED |
| Data Owner / Steward | Project Principal | Session 0A |
| Agent Operator | Project Principal | Session 1 — R3 CLOSED |

---

## §6 — Standing Development Constraints (Invariant)

1. No independent security, governance, or audit systems
2. No shared entity field-name divergence
3. No rewrite debt — Stage 2 connections are configuration changes
4. Every human decision event carries `decision_type`
5. No direct LLM API calls — `createSovereignClient()` only
6. `workflow_step_id` on every Logger event
7. Shell context frozen at eight exports (Decision 18)
8. `shell-contract.ts` is a governance document — **v1.3 APPLIED, SHA-256:
   `4d78754f…6836acc2`, unchanged through Sessions 3–5**
9. All prompts registered before build — **10 registered; 4 APPROVED
   (PR-COUNSEL-001/002/003, PR-SCRIBE-001)**
10. All agents registered before build — 7 registered agents
11. **Five synced copies of shared artifacts now exist:**
    - `shell-contract.ts` (canonical enums)
    - `sovereign-api-client/src/types.ts` (SovereignProduct/Tier)
    - `sovereign-data/src/shared-types.ts` (Role/Clearance/HumanDecisionType)
    - `module-counsel/src/prompts/analysis-system.prompt.ts` (PR-COUNSEL-001)
    - `module-scribe/src/prompts/drafting-system.prompt.ts` (PR-SCRIBE-001)

    Each carries a sync-obligation header. Changes must propagate.

---

## §7 — CPMI Enhanced Monitoring

CPMI operates at **0.7× standard anomaly threshold** — architectural constant.
`CPMI_DRIFT_DETECTED` alerts receive elevated treatment in VIGIL.

---

## §8 — Shell Architecture (Option C — Permanent)

```
sovereign-platform/                    ← npm workspace root · git main · tag v1.0.0
├── package.json                       ← workspace root
├── sovereign-security/                ← 127 tests
├── sovereign-api-client/              ← 143 tests
├── sovereign-data/                    ← 27 tests
├── sovereign-shell/
│   ├── shell-contract.ts              ← v1.3 (unchanged Sessions 3–5)
│   └── src/ [shell, module-loader, navigation, governance, main.tsx,
│              register-modules.ts]    ← registers counsel + scribe
├── module-counsel/                    ← COMPLETE — 91 tests
├── module-scribe/                     ← scaffold — 11 tests
├── module-vigil/                      ← Session 6
└── module-lens/                       ← Session 7 (last)
```

**Git:** Repository initialized Session 5 (`git init`, branch `main`). Tag `v1.0.0`
on the Session 4 import commit. GitHub remote configured:
`https://github.com/erichrumms/sovereign-platform.git`. Push deferred per Project
Principal — run when ready.

**Dev server:** `cd sovereign-shell && npm run dev` → `http://localhost:3000`.
For live AI: set `VITE_ANTHROPIC_API_KEY`.

---

## §9 — Intelligence Layer Exposure Requirements

| Field | Required On | IL Component | Status |
|---|---|---|---|
| `workflow_step_id` | Every Logger event | All five IL components | Enforced |
| `decision_type` | Every human decision event | Judgment Detection | Enforced |
| `alternatives_considered` | COUNSEL Decision Records | Judgment Detection | **LIVE — Session 5** |
| `confidence_score` | COUNSEL Decision Records | Risk & Failure Modeler | **LIVE — Session 5** |
| `counterargument_requested` | COUNSEL Decision Records | Judgment Detection | **LIVE — Session 5** |
| `challenge_turns` | COUNSEL Decision Records | Judgment Detection | **LIVE — Session 5** |
| `premortem_conducted` | COUNSEL Decision Records | Risk & Failure Modeler | **LIVE — Session 5** |
| `prior_position_alert_shown` | COUNSEL Decision Records | Judgment Detection | **LIVE — Session 5** |
| `deployment_feedback` | `AGENT_STEP_COMPLETE` | Automatability Scorer | Not applicable to COUNSEL (by design) |
| `classification_level` | All classified events | Risk & Failure Modeler | Pending |
| VVR export schema | FLOWPATH VVRs | Task Decomposition Engine | Pending |

**All six COUNSEL IL fields are now live.** The Intelligence Layer's Judgment
Detection and Risk & Failure Modeler components receive labeled training data from
every completed COUNSEL session.

**The Intelligence Layer is the seventh product. It must never be lost.**

---

## §10 — Shared Data Dictionary

| Entity | Canonical Identifier | Data Classification | Status |
|---|---|---|---|
| Employee | `employee_id` | program | Implemented in `sovereign-data` |
| Program | `program_id` | program | Implemented in `sovereign-data` |
| Cost Code | `cost_code` | program | Implemented in `sovereign-data` |
| Document | `document_id` | program | Implemented — **used by COUNSEL Decision Record output** |
| Vendor | `vendor_id` | program | Implemented in `sovereign-data` |
| StyleProfile | `user_id` | user | GD-1 — pending SCRIBE Style DNA build |

---

## §11 — Current Build Status

### Stage 1 — COMPLETE

| Deliverable | Tests | Status |
|---|---|---|
| Security Framework | 127 | ✅ |
| sovereign-api-client | 143 | ✅ |
| sovereign-shell scaffold | 0 errors | ✅ |
| shell-contract.ts v1.3 | — | ✅ |

### Stage 2 — IN PROGRESS

| Deliverable | Tests | Status |
|---|---|---|
| sovereign-data + StyleProfile | 27 | ✅ Session 3 |
| npm workspace root | — | ✅ Session 4 |
| Shell host + dev server | — | ✅ Session 3 |
| COUNSEL core (Framing + Prior Position + Analysis) | 39 | ✅ Session 4 |
| COUNSEL complete (Counter + Pre-Mortem + Decision Record) | 91 | ✅ **Session 5** |
| RTL + jsdom component test layer | 11 RTL | ✅ **Session 5** |
| SCRIBE scaffold | 11 | ✅ **Session 5** |
| SCRIBE drafting engine + Style DNA | — | Session 6 |
| VIGIL | — | Session 6 |
| LENS | — | Session 7 (last) |

**Total tests passing: 127 + 143 + 27 + 91 + 11 = 272** (+ 11 module-scribe = 272 total JS + 127 Python)

### Session 6 priorities:
1. SCRIBE drafting engine — six product-aligned modes, three-tier fallback,
   human-gated export, per-mode schema validation against `@sovereign/data`
2. SCRIBE Style DNA — scribe-style-analyst, StyleProfile read/write (GD-1)
3. VIGIL scaffold — PLATFORM_ADMIN mount gate, Alert Queue, Agent Approval Queue

---

## §12 — Risk Register

| ID | Risk | Status |
|---|---|---|
| R1 | Human-review-volume architecture | OPEN — before Stage 5 |
| R2 | AI Provider Abstraction Layer | **CLOSED** |
| R3 | Agent Operator Role Undefined | **CLOSED** |
| R4 | Federal Client Workforce Transition | OPEN — LENS primary mitigation |
| R5 | CPMI world model REST API not deployed | OPEN |
| R6 | AgentOS evaluate.py never tested | OPEN |
| R7 | Tier 2 LLM Provider Unresolved | OPEN — COUNSEL/SCRIBE production CUI routing is config change |
| R8 | Shell ↔ module contract drift | MITIGATED |
| R9 | NEXUS ATO timeline | OPEN — Stage 5 |
| R10 | AgentOS has no user-facing surface | **CLOSED** — VIGIL |
| R11 | Security Framework alert response absent | **CLOSED** — VIGIL |
| OWI-FP-001 | FLOWPATH elicitation gap | OPEN — SCRIBE framing mode primary mitigation |
| OWI-INT-001 | Cross-product failure topology | OPEN — Stage 9 |

---

## §13 — Open Governance Items

**CLOSED this session:** *(none — all prior closures carried)*

**Carried from prior sessions (unchanged):**
1. Decision 24 — role→module access matrix (COUNSEL + SCRIBE `minimumRole` = READ_ONLY placeholder)
2. Decision 25 — access-denial taxonomy gap
3. esbuild GHSA-67mh-4wv8-2f99 — deferred Stage 5+
4. shell-contract Section 1 re-export reconciliation (five synced copies)
5. Module mount/unmount event-type gap
6. ARIA rule maintenance intake path
7. Output Studio provenance reference
8. Notification / push interface absent
9. Two LENS source documents needed (`vigil_alert_response.md`, `vigil_agent_approvals.md`)
10. SOF Logger scoped-query API absent from contract (COUNSEL Prior Position uses synthetic provider)
11. Prompt naming reconciliation (`analysis_system.md` vs `analysis-system-v1.0.md`)
12. `CounselSourceProduct` "AgentOS" casing vs canonical "AGENTOS"
13. COUNSEL Decision Record — `deployment_feedback` not emitted (by design; honest IL gap)
14. PR-SCRIBE-002/003/004 not yet authored
15. No git remote push yet (configured; push deferred)

**New from Session 5:**
16. **RTL/jsdom toolchain adds 19 moderate dev-only npm advisories** (prod audit
    remains 0). Same class as esbuild advisory; review at Stage 5+ dependency pass.
17. **SCRIBE drafting engine not yet built** — module-scribe is a scaffold; the
    LLM call, three-tier fallback, per-mode validation, and human-gated export
    are Session 6 work.
18. **Git remote not yet pushed** — `https://github.com/erichrumms/sovereign-platform.git`
    configured; run `git push -u origin main && git push origin --tags` when ready.

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.6 (through Session 5). No new production-runtime
npm dependencies in Session 5. RTL/jsdom are dev-only; 19 dev-only advisories
recorded (prod audit remains 0 vulnerabilities). Known dev advisory: GHSA-67mh-4wv8-2f99
(esbuild, deferred Stage 5+).

**Running test totals:** pytest 127 · api-client 143 · data 27 · module-counsel 91 ·
module-scribe 11 = **272 total JS tests + 127 Python tests = 399 total**.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Open — confirm all context documents loaded; name each.
2. State done condition — wait for Project Principal approval.
3. One component per exchange — build, verify, confirm, proceed.
4. Close with handoff — never skip.

**Session 6 context package:**
1. `SOVEREIGN_Platform_Integration_Brief_v1.9.md`
2. `PROJECT_SUMMARY.md`
3. `AGENT_BACKGROUND_AND_LESSONS_LEARNED.md`
4. `system_prompt.md`
5. `Session_5_Handoff_SOVEREIGN_COUNSELComplete_SCRIBEScaffold_20260616.md`
6. `shell-contract.ts`
7. `module-scribe/src/index.ts`
8. `module-scribe/src/modes.ts`
9. `module-scribe/prompts/drafting-system-v1.0.md`
10. `02_SCRIBE_Drafting_Workspace.md`
11. `04_VIGIL_Operator_Dashboard.md`
12. `sovereign_data_CompanionSuite_Specification.md`

---

## §16 — Architectural Patterns (Platform Standard)

All patterns from v1.8 apply. Session 5 additions:

**COUNSEL IL fields are complete.** All six IL Decision Record fields
(`alternatives_considered`, `confidence_score`, `counterargument_requested`,
`challenge_turns`, `premortem_conducted`, `prior_position_alert_shown`) are
populated in the `HUMAN_DECISION` Logger event at Decision Record output. The
Intelligence Layer receives labeled training data from every completed COUNSEL
session.

**Decision Record output enforces CPMI-VRS Gate 3 structurally.** The
`buildDecisionRecord` function refuses to assemble until the human confirms review
and choice — not a UI gate, a data gate. The Document entity is validated before
the Logger event is emitted.

**RTL component tests complement server-render proofs.** Node-env tests cover pure
logic; jsdom tests cover React rendering and user interactions; server-render proofs
cover Vite integration. Three complementary layers, no single point of test failure.

---

## §17 — Primary Product Inserts (Summary Reference)

All six governance records INCOMPLETE. All data SYNTHETIC. Governance Clock not
activated.

---

## §18 — Companion Suite

### Module Build Status

| Module | Tests | Build Status |
|---|---|---|
| COUNSEL | 91 | **COMPLETE — full flow including Decision Record + IL fields** |
| SCRIBE | 11 | **Scaffold BUILT Session 5 — drafting engine Session 6** |
| VIGIL | — | Session 6 |
| LENS | — | Session 7 (last) |

### Approved Prompts

| Registry ID | Prompt | Agent | Approved |
|---|---|---|---|
| PR-COUNSEL-001 | Analysis Engine | `counsel-analyst` | June 15, 2026 |
| PR-COUNSEL-002 | Counterargument Mode | `counsel-analyst` | June 16, 2026 |
| PR-COUNSEL-003 | Pre-Mortem Studio | `counsel-analyst` | June 16, 2026 |
| PR-SCRIBE-001 | SCRIBE Drafting Engine | `scribe-drafter` | June 16, 2026 |

Remaining: PR-SCRIBE-002/003/004, PR-LENS-001/002, PR-VIGIL-001 — not yet authored.

### iCloud Folder — New Files This Session

```
7 - SOVEREIGN/Session Handoffs/
  Session_5_Handoff_SOVEREIGN_COUNSELComplete_SCRIBEScaffold_20260616.md

7 - SOVEREIGN/Companion Suite/Governance/
  Prompt_Approvals_Session5.md    ← PR-COUNSEL-002, PR-COUNSEL-003, PR-SCRIBE-001
```

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.0–v1.7 | May 31 – June 13, 2026 | See prior versions |
| v1.8 | June 15, 2026 | npm workspaces; ctx.data.types wired; COUNSEL core; PR-COUNSEL-001 approved |
| **v1.9** | **June 16, 2026** | **COUNSEL complete (91 tests, all 6 IL fields live); PR-COUNSEL-002/003 + PR-SCRIBE-001 approved; RTL/jsdom layer (272 total tests); SCRIBE scaffold mounting; git initialized (main, v1.0.0, GitHub remote); five synced copies; SBOM v1.6** |

---

*SOVEREIGN Platform Integration Brief v1.9 · June 16, 2026*
*Load in every session alongside `system_prompt.md`, the relevant spec, and the
prior session handoff*
*Pre-Decisional · Internal Working Document*

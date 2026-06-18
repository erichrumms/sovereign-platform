# SOVEREIGN Platform Integration Brief
## Version 1.10 | June 17, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.9
**Changed this version:** SCRIBE drafting engine complete (six product-aligned modes,
three-tier fallback, schema validation, human-gated export) · SCRIBE Style DNA complete
(`scribe-style-analyst`, `StyleProfile` injectable port, PR-SCRIBE-004 APPROVED) ·
VIGIL scaffold complete (structural mount gate, Alert Queue stub, Agent Approval Queue
stub, PR-VIGIL-001 APPROVED) · `module-vigil` new workspace · 364 JS tests (was 272) ·
491 total tests (was 399) · `ctx.data` store gap documented + resolved via injectable
port · SBOM v1.7 · §11, §13, §14, §18, §19 updated · D1 mode list corrected (six
modes are product-intake modes, not one-per-product; no AgentOS drafting mode)

---

## §1 — What This Document Is

This brief is the mandatory context document for every SOVEREIGN Platform development
session. Load order: Integration Brief v1.10 → `system_prompt.md` → product or
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
   `4d78754f…6836acc2`, unchanged through Sessions 3–6**
9. All prompts registered before build — **10 registered; 6 APPROVED
   (PR-COUNSEL-001/002/003, PR-SCRIBE-001, PR-SCRIBE-004, PR-VIGIL-001)**
10. All agents registered before build — 7 registered agents
11. **Five synced copies of shared artifacts:**
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
sovereign-platform/                    ← npm workspace root · git main · HEAD 442fda1
├── package.json                       ← workspace root
├── sovereign-security/                ← 127 tests
├── sovereign-api-client/              ← 143 tests
├── sovereign-data/                    ← 27 tests
├── sovereign-shell/
│   ├── shell-contract.ts              ← v1.3 (unchanged Sessions 3–6)
│   └── src/ [shell, module-loader, navigation, governance, main.tsx,
│              register-modules.ts]    ← registers counsel + scribe + vigil
├── module-counsel/                    ← COMPLETE — 91 tests
├── module-scribe/                     ← COMPLETE (core) — 86 tests
├── module-vigil/                      ← scaffold BUILT Session 6 — 17 tests
├── module-lens/                       ← Session 7 (last companion module)
└── docs/                              ← reference specs (tracked in git Session 6)
```

**Git:** Branch `main`. HEAD and origin/main both at `442fda1` (in sync).
Tag `v1.0.0` on Session 4 import commit `9db879f`.
Remote: `https://github.com/erichrumms/sovereign-platform.git`

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

**All six COUNSEL IL fields are live.** The Intelligence Layer's Judgment
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
| Document | `document_id` | program | Implemented — used by COUNSEL Decision Record output |
| Vendor | `vendor_id` | program | Implemented in `sovereign-data` |
| StyleProfile | `user_id` | user | **LIVE — Session 6 (D2).** Validated via `ctx.data.types.validateStyleProfile`. Persisted via injectable `StyleProfileStore` port (session-scoped). Cross-session store pending shell data-store contract surface (future v1.4 governance decision — config change, no rewrite). |

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
| COUNSEL complete (Counter + Pre-Mortem + Decision Record) | 91 | ✅ Session 5 |
| RTL + jsdom component test layer | 11 RTL | ✅ Session 5 |
| SCRIBE scaffold | 11 | ✅ Session 5 |
| SCRIBE drafting engine (six product-intake modes) | +48 | ✅ **Session 6 D1** |
| SCRIBE Style DNA (scribe-style-analyst + StyleProfile port) | +27 | ✅ **Session 6 D2** |
| VIGIL scaffold (mount gate + Alert Queue + Approval Queue stubs) | 17 | ✅ **Session 6 D3** |
| LENS | — | Session 7 (last companion module) |
| SCRIBE intermediate modes (synthesis, framing) | — | Later session |
| VIGIL live features (triage, approval flow, pipeline health) | — | Session 7+ |

**Total tests passing: 364 JS + 127 Python = 491 total**

### Session 7 priorities:
1. LENS scaffold (`module-lens`) — last companion module; requires
   `vigil_alert_response.md` and `vigil_agent_approvals.md` authored in Claude Chat
   before the build session opens
2. VIGIL core — Alert Queue wired, Anomaly Triage Assistant (PR-VIGIL-001 now
   approved), Agent Approval Queue, `vigil-triage-analyst` registration

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

**CLOSED this session:**
- PR-SCRIBE-004 PENDING → **APPROVED June 17, 2026**
- PR-VIGIL-001 PENDING → **APPROVED June 17, 2026**

**Carried from prior sessions (unchanged):**
1. Decision 24 — role→module access matrix (COUNSEL + SCRIBE `minimumRole` = READ_ONLY placeholder; VIGIL is the first module with a real gate — PLATFORM_ADMIN/SYSTEM_ADMIN)
2. Decision 25 — access-denial taxonomy gap
3. esbuild GHSA-67mh-4wv8-2f99 — deferred Stage 5+
4. shell-contract Section 1 re-export reconciliation (five synced copies)
5. Module mount/unmount event-type gap (no approved "module mounted" event type — no mount Logger event in any module)
6. ARIA rule maintenance intake path
7. Output Studio provenance reference
8. Notification / push interface absent
9. Two LENS source documents needed (`vigil_alert_response.md`, `vigil_agent_approvals.md`) — **required before Session 7 LENS build**
10. SOF Logger scoped-query API absent from contract
11. Prompt naming reconciliation (`analysis_system.md` vs `analysis-system-v1.0.md`)
12. `CounselSourceProduct` "AgentOS" casing vs canonical "AGENTOS"
13. COUNSEL Decision Record — `deployment_feedback` not emitted (by design; honest IL gap)
14. PR-SCRIBE-002/003 not yet authored
15. RTL/jsdom toolchain — 19 moderate dev-only npm advisories (prod audit remains 0)

**New from Session 6:**
16. **`ctx.data` has no entity store** (Decision 18 — architectural fact, not a gap). Resolved for SCRIBE Style DNA via injectable `StyleProfileStore` port (session-scoped). A canonical cross-session store needs a future shell data-store contract surface — a v1.4 governance decision. Wires to the existing port as a configuration change; no SCRIBE rewrite required (Constraint #3).
17. **VIGIL → loader runtime coupling** for `ModuleAccessDeniedError` (relative source import, not npm dep). Reuse of canonical error class over forking. Cycle-free. Project Principal accepted Session 6.
18. **SCRIBE intermediate modes (`synthesis`, `framing`) deferred** — no product intake schema; cannot run three-tier fallback + schema validation. Later session.
19. **D1 mode list correction recorded:** The six SCRIBE drafting modes are product-intake modes (`correspondence_draft`, `program_narrative`, `report_commentary`, `vvr_description`, `governance_memo`, `rule_change_proposal`). They are not one-per-primary-product — NEXUS appears twice (correspondence + narrative), AgentOS has no drafting mode. The Session 6 opening prompt's parenthetical "(NEXUS, CPMI, APEX, FLOWPATH, AgentOS, ARIA)" was imprecise; the correct list is the six `producesProductIntake: true` modes. Recorded for Integration Brief accuracy.

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.7 (through Session 6). No new production-runtime npm
dependencies in Session 6. `module-vigil` new workspace declares only the existing
platform React stack. 0 production vulnerabilities. Known dev advisories: 19 RTL/jsdom
moderate (deferred Stage 5+) + GHSA-67mh-4wv8-2f99 esbuild (deferred Stage 5+).

**Running test totals:** pytest 127 · api-client 143 · data 27 · module-counsel 91 ·
module-scribe 86 · module-vigil 17 = **364 total JS tests + 127 Python = 491 total**.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Open — confirm all context documents loaded; name each.
2. State done condition — wait for Project Principal approval.
3. One component per exchange — build, verify, confirm, proceed.
4. Close with handoff — never skip.

**Session 7 context package:**
1. `SOVEREIGN_Platform_Integration_Brief_v1.10.md`
2. `PROJECT_SUMMARY.md`
3. `AGENT_BACKGROUND_AND_LESSONS_LEARNED.md`
4. `system_prompt.md`
5. `Session_6_Handoff_SOVEREIGN_SCRIBECore_VIGILScaffold_20260617.md`
6. `shell-contract.ts`
7. `module-vigil/src/index.ts`
8. `module-vigil/src/AlertQueue.tsx`
9. `module-vigil/src/AgentApprovalQueue.tsx`
10. `module-vigil/prompts/triage-system-v1.0.md`
11. `04_VIGIL_Operator_Dashboard.md`
12. `sovereign_data_CompanionSuite_Specification.md`
13. `vigil_alert_response.md` *(must be authored in Claude Chat before Session 7 opens)*
14. `vigil_agent_approvals.md` *(must be authored in Claude Chat before Session 7 opens)*

**Pre-Session 7 Claude Chat action required:** Author `vigil_alert_response.md` and
`vigil_agent_approvals.md` — these are the two LENS source documents (open governance
item #9). LENS cannot be built without them, and they must exist before Session 7 opens.

---

## §16 — Architectural Patterns (Platform Standard)

All patterns from v1.9 apply. Session 6 additions:

**VIGIL mount gate is the first real role gate in the platform.** COUNSEL and SCRIBE
carry `minimumRole: READ_ONLY` as placeholders (Decision 24). VIGIL's
`minimumRole: PLATFORM_ADMIN` is enforced structurally — `mount()` throws
`ModuleAccessDeniedError` for any other role, defense-in-depth atop the loader's
own gate. This is the pattern for all future privileged modules.

**Injectable port pattern for future persistence.** The `StyleProfileStore` port
established in D2 is the platform pattern for module-level entity persistence that
needs a future canonical store. Build the port now with a session-scoped default;
wire to the real store as a configuration change when the shell data-store surface
is governed. No rewrite debt.

**Schema purity in drafting output.** The `DraftOutcome` wrapper carries the serving
tier alongside the canonical `@sovereign/data` schema object — the tier is never
injected into the schema object itself. The object that routes to the destination
product is unmodified canonical data. This is the correct pattern for any SCRIBE
export path.

**VIGIL A2A stage awareness.** The Agent Approval Queue reads `ctx.a2a._stage` and
renders stage-appropriate UI without calling the throwing `invokeAgent()`/
`getTaskState()` methods before IMPLEMENTED stage. This is the correct pattern for
any module that surfaces A2A state before the A2A protocol is fully live.

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
| SCRIBE | 86 | **Core COMPLETE Session 6 — six drafting modes + Style DNA** |
| VIGIL | 17 | **Scaffold BUILT Session 6 — live features Session 7+** |
| LENS | — | Session 7 (last companion module) |

### Approved Prompts

| Registry ID | Prompt | Agent | Approved |
|---|---|---|---|
| PR-COUNSEL-001 | Analysis Engine | `counsel-analyst` | June 15, 2026 |
| PR-COUNSEL-002 | Counterargument Mode | `counsel-analyst` | June 16, 2026 |
| PR-COUNSEL-003 | Pre-Mortem Studio | `counsel-analyst` | June 16, 2026 |
| PR-SCRIBE-001 | SCRIBE Drafting Engine | `scribe-drafter` | June 16, 2026 |
| PR-SCRIBE-004 | Style Analysis System | `scribe-style-analyst` | **June 17, 2026** |
| PR-VIGIL-001 | VIGIL Triage System | `vigil-triage-analyst` | **June 17, 2026** |

Remaining not yet authored: PR-SCRIBE-002, PR-SCRIBE-003, PR-LENS-001, PR-LENS-002.

### iCloud Folder — New Files This Session

```
7 - SOVEREIGN/Session Handoffs/
  Session_6_Handoff_SOVEREIGN_SCRIBECore_VIGILScaffold_20260617.md

7 - SOVEREIGN/Companion Suite/Governance/
  Prompt_Approvals_Session6.md    ← PR-SCRIBE-004, PR-VIGIL-001
  SBOM_Registry_v1.7_MERGED.md

7 - SOVEREIGN/
  SOVEREIGN_Platform_Integration_Brief_v1.10.md    ← this document
```

**Copy Integration Brief v1.10 to monorepo:**
```
cp ~/Downloads/SOVEREIGN_Platform_Integration_Brief_v1.10.md ~/sovereign-platform/
```

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.0–v1.7 | May 31 – June 13, 2026 | See prior versions |
| v1.8 | June 15, 2026 | npm workspaces; ctx.data.types wired; COUNSEL core; PR-COUNSEL-001 approved |
| v1.9 | June 16, 2026 | COUNSEL complete (91 tests, all 6 IL fields live); PR-COUNSEL-002/003 + PR-SCRIBE-001 approved; RTL/jsdom layer (272 total tests); SCRIBE scaffold mounting; git initialized (main, v1.0.0, GitHub remote); five synced copies; SBOM v1.6 |
| **v1.10** | **June 17, 2026** | **SCRIBE core complete (86 tests — D1: six product-intake modes, D2: Style DNA + injectable port); VIGIL scaffold (17 tests — D3: mount gate, Alert Queue stub, Approval Queue stub); PR-SCRIBE-004 + PR-VIGIL-001 APPROVED; module-vigil workspace declared; ctx.data store gap documented + resolved; 364 JS + 127 Python = 491 total tests; HEAD 442fda1; SBOM v1.7; D1 mode list corrected** |

---

*SOVEREIGN Platform Integration Brief v1.10 · June 17, 2026*
*Load in every session alongside `system_prompt.md`, the relevant spec, and the
prior session handoff*
*Pre-Decisional · Internal Working Document*

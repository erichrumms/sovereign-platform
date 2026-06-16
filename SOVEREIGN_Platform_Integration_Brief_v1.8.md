# SOVEREIGN Platform Integration Brief
## Version 1.8 | June 15, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.7
**Changed this version:** npm workspaces established (§13 items 10/11 CLOSED) ·
`ctx.data.types` wired to `@sovereign/data` · PLATFORM_ADMIN loader fix applied ·
COUNSEL core delivered (Decision Framing + Prior Position Alert + Analysis Engine) ·
PR-COUNSEL-001 authored and APPROVED · `PRIOR_POSITION_RECONCILIATION` emit path live ·
`sovereign-data` HUMAN_DECISION_TYPES added · fourth synced copy noted · three new
open governance items · SBOM v1.5 · §11 and §19 updated

---

## §1 — What This Document Is

This brief is the mandatory context document for every SOVEREIGN Platform development
session, regardless of which product is being worked on. It defines the shared
platform, the invariant constraints, the pipeline, and the current governance state.
It travels with every product-specific insert.

**Load order:** Integration Brief v1.8 → `system_prompt.md` → product or companion
suite spec → prior session handoff → `shell-contract.ts` (for shell or module work).

Confirm all documents are loaded by name before any build work begins.

---

## §2 — Platform Definition

**SOVEREIGN — Governed Agentic Runtime with Integrated Security, Intelligence, and
Oversight Networks**

SOVEREIGN is a governed, observable, sovereign-AI-aligned platform built across six
integrated products: NEXUS, CPMI, APEX, FLOWPATH, AgentOS, and ARIA Suite (CLEAR,
TRACER, ARC), plus four companion suite modules (COUNSEL, SCRIBE, LENS, VIGIL)
serving the individuals and operators within the platform. A seventh product, the
Intelligence Layer, is documented as a future build and must never be lost.

**Three non-negotiable design outcomes every build decision must serve:**
1. Integration reliability
2. Operational efficiency
3. End-to-end security observability

---

## §3 — Three Shared Infrastructure Layers

Every product connects to these layers rather than replicating them.

**SOVEREIGN Security Observability Framework** — standalone Python library; Stage 1
COMPLETE; 127 tests; `sovereign-security/`. Terminal point: VIGIL Alert Queue.

**CPMI-VRS AI Governance Standard** — portfolio-wide governance framework; NIST AI
RMF and OMB AI guidance aligned; applies to all products including companion suite.

**AgentOS** — MLOps backbone and agent orchestration; Security Framework and
CPMI-VRS embedded as native modules. Human-approval interface: VIGIL Agent Approval
Queue.

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH → [Intelligence Layer, future] → CPMI → AgentOS → NEXUS / APEX → ARIA Suite
```

The companion suite operates as a parallel human-support layer feeding back into
the pipeline at multiple stages. See §19 for companion suite details.

---

## §5 — Governance Role Assignments (Permanent Records)

| Role | Assigned To | Status |
|---|---|---|
| CPMI Product Owner | Project Principal | Session 0A — Stage 3 SATISFIED |
| ARIA Suite Product Owner | Project Principal | Session 0A — UNBLOCKED |
| Data Owner | Project Principal | Session 0A |
| Data Steward | Project Principal | Session 0A |
| Agent Operator | Project Principal | Session 1 — R3 CLOSED |

---

## §6 — Standing Development Constraints (Invariant)

Applies to all six primary products and all four companion suite modules.

1. **No independent security, governance, or audit systems.**
2. **No shared entity field-name divergence.** Employee, Program, Cost Code,
   Document, Vendor, StyleProfile (GD-1) — canonical field names are frozen.
3. **No rewrite debt.** Stage 2 connections are configuration changes.
4. **Tag every human decision event with `decision_type`.**
5. **No direct LLM API calls.** All calls through `sovereign-api-client`.
   `createSovereignClient()` only.
6. **`workflow_step_id` on every Logger event.** `decision_type` + `actor: "human"` +
   `actor_name` on human decision events. `agent_id` on agent step events.
7. **Shell context frozen at eight exports.** `auth`, `logger`, `governance`, `data`,
   `navigation`, `mcp`, `a2a`, `agui`. No LLM client. Changes are governance events.
8. **`shell-contract.ts` is a governance document.** Current version: **v1.3 APPLIED**.
   SHA-256 both copies: `4d78754f20fbd7c3d3ef2d1dbdd76422ec79f965aa7489d042fe189f6836acc2`.
   Unchanged through Sessions 3 and 4.
9. **All prompts registered before build.** 10 registered; PR-COUNSEL-001
   **APPROVED June 15, 2026**. PR-COUNSEL-002/003 not yet authored.
10. **All agents registered before build.** 7 registered agents.
11. **Four synced copies of shared artifacts now exist.**
    - `shell-contract.ts` (canonical enums)
    - `sovereign-api-client/src/types.ts` (SovereignProduct/Tier)
    - `sovereign-data/src/shared-types.ts` (Role/Clearance/HumanDecisionType)
    - `module-counsel/src/prompts/analysis-system.prompt.ts` (PR-COUNSEL-001 runtime)

    Each carries a sync-obligation header. Any change to a shared enum in
    shell-contract must propagate to relevant copies. The prompt copy must stay
    byte-identical to `prompts/analysis-system-v1.0.md`.

---

## §7 — CPMI Enhanced Monitoring

CPMI operates at **0.7× the standard anomaly threshold** — architectural constant,
not configurable. `CPMI_DRIFT_DETECTED` alerts receive elevated treatment in VIGIL.

---

## §8 — Shell Architecture (Option C — Permanent)

```
sovereign-platform/                    ← npm workspace root (Session 4)
├── package.json                       ← workspace root (private, no deps)
├── sovereign-security/                ← Stage 1 COMPLETE — 127 tests
├── sovereign-api-client/              ← Stage 1 COMPLETE — 143 tests
│   └── exports → src/index.ts        ← Session 4: source-pointing exports
├── sovereign-data/                    ← Session 3 BUILT — 27 tests
│   └── exports → src/index.ts        ← Session 4: source-pointing exports
├── sovereign-shell/                   ← Stage 1 + Sessions 3/4
│   ├── shell-contract.ts              ← v1.3 APPLIED (unchanged Sessions 3/4)
│   └── src/
│       ├── shell.ts                   ← ctx.data.types → @sovereign/data (Session 4)
│       ├── module-loader/             ← VALID_ROLES += PLATFORM_ADMIN (Session 4)
│       ├── navigation/
│       ├── governance/
│       ├── main.tsx
│       └── register-modules.ts        ← imports @sovereign/module-counsel
├── module-counsel/                    ← COUNSEL core BUILT Session 4 — 39 tests
├── module-scribe/                     ← Next session
├── module-lens/                       ← Build last
├── module-vigil/                      ← Build third
└── [primary product modules]          ← Stage 2 (parallel track)
```

**npm workspaces:** The monorepo root `package.json` links all four `@sovereign/*`
packages. React/react-dom are hoisted to the root. Workspace resolution replaces
all relative-path imports. Session 3 open items 10 and 11 are CLOSED.

**`ctx.data.types`:** Wired to `@sovereign/data` — runtime-proven (validators +
enum mirrors + `SOVEREIGN_DATA_VERSION`, frozen). Contract surface stays `unknown`
(Decision 18). Session 3 open item 11 CLOSED.

**PLATFORM_ADMIN loader fix:** `VALID_ROLES` in `module-loader/index.ts` now
includes `PLATFORM_ADMIN`, aligning the runtime guard to the approved shell-contract
v1.3 union. VIGIL's mount gate is reachable. Not a contract change.

**Dev server:** `cd sovereign-shell && npm run dev` → Vite v5.4.21 on
`http://localhost:3000`. For live AI responses: set `VITE_ANTHROPIC_API_KEY`.

---

## §9 — Intelligence Layer Exposure Requirements

Frozen fields — never rename or restructure:

| Field | Required On | IL Component | Status |
|---|---|---|---|
| `workflow_step_id` | Every Logger event | All five IL components | Enforced |
| `decision_type` | Every human decision event | Judgment Detection | Enforced |
| `deployment_feedback` | `AGENT_STEP_COMPLETE` | Automatability Scorer | COUNSEL analysis step does not emit (by design — see §13 item 17) |
| `classification_level` | All classified events | Risk & Failure Modeler | Pending |
| VVR export schema | FLOWPATH VVRs | Task Decomposition Engine | Pending |
| `alternatives_considered`, `confidence_score`, `counterargument_requested`, `challenge_turns`, `premortem_conducted`, `prior_position_alert_shown` | COUNSEL Decision Records | Judgment Detection · Risk & Failure Modeler | **Pending — Decision Record output session** |

**The Intelligence Layer is the seventh product. It must never be lost.**

---

## §10 — Shared Data Dictionary

| Entity | Canonical Identifier | Data Classification | Status |
|---|---|---|---|
| Employee | `employee_id` | program | Implemented in `sovereign-data` |
| Program | `program_id` | program | Implemented in `sovereign-data` |
| Cost Code | `cost_code` | program | Implemented in `sovereign-data` |
| Document | `document_id` | program | Implemented in `sovereign-data` |
| Vendor | `vendor_id` | program | Implemented in `sovereign-data` |
| StyleProfile | `user_id` | user | GD-1 implemented in `sovereign-data` |

`HUMAN_DECISION_TYPES` runtime mirror added to `sovereign-data` in Session 4 —
canonical `HumanDecisionType` taxonomy available as runtime values for import.

---

## §11 — Current Build Status

### Stage 1 — COMPLETE (re-verified Session 4)

| Deliverable | Tests | Status |
|---|---|---|
| Security Framework | 127 | ✅ |
| sovereign-api-client | 143 | ✅ |
| sovereign-shell scaffold | 0 errors | ✅ |
| shell-contract.ts v1.3 | — | ✅ |

### Stage 2 — IN PROGRESS

| Deliverable | Tests | Status |
|---|---|---|
| sovereign-data package | 27 | ✅ Session 3 |
| npm workspace root | — | ✅ Session 4 |
| Shell host entry point + dev server | — | ✅ Session 3 |
| module-counsel scaffold | — | ✅ Session 3 |
| COUNSEL core (Framing + Prior Position + Analysis Engine) | 39 | ✅ Session 4 |
| PR-COUNSEL-001 authored + APPROVED | — | ✅ Session 4 |
| module-scribe | — | Next session |
| module-vigil | — | Session 6 |
| module-lens | — | Session 7 (last) |

**Total tests passing: 127 + 143 + 27 + 39 = 336**

### Next Session (Session 5) priorities:
1. COUNSEL completion: Counterargument Mode (PR-COUNSEL-002), Pre-Mortem Studio
   (PR-COUNSEL-003), Decision Record output with full IL fields and `HUMAN_DECISION`
   Logger event
2. React Testing Library / jsdom component tests (network install)
3. SCRIBE scaffold + typed drafting modes

---

## §12 — Risk Register

| ID | Risk | Priority | Status |
|---|---|---|---|
| R1 | Human-review-volume architecture | HIGH — before Stage 5 | OPEN |
| R2 | AI Provider Abstraction Layer | — | **CLOSED** |
| R3 | Agent Operator Role Undefined | — | **CLOSED** |
| R4 | Federal Client Workforce Transition | REQUIRED — before pilot | OPEN — LENS primary mitigation |
| R5 | CPMI world model REST API not deployed | HIGH | OPEN |
| R6 | AgentOS evaluate.py never tested | MEDIUM | OPEN |
| R7 | Tier 2 LLM Provider Unresolved | HIGH — before Stage 5 | OPEN — COUNSEL production CUI routing is config change pending R7 |
| R8 | Shell ↔ module contract drift | — | MITIGATED |
| R9 | NEXUS ATO timeline | HIGH — Stage 5 | OPEN |
| R10 | AgentOS has no user-facing surface | — | **CLOSED** — VIGIL |
| R11 | Security Framework alert response interface absent | — | **CLOSED** — VIGIL |
| OWI-FP-001 | FLOWPATH elicitation methodology gap | HIGH — before pilot | OPEN |
| OWI-INT-001 | Cross-product failure topology not mapped | HIGH — Stage 9 | OPEN |

---

## §13 — Open Governance Items

**CLOSED this session:**
- ~~npm workspace / package-linkage decision~~ — **CLOSED Session 4** ✅
- ~~`ctx.data.types` ↔ `sovereign-data` wiring~~ — **CLOSED Session 4** ✅
- ~~PLATFORM_ADMIN loader/contract mismatch~~ — **CLOSED Session 4** ✅

**Carried from Session 2B:**
1. Role → module access matrix (Decision 24) — COUNSEL `minimumRole` is `READ_ONLY`
   placeholder; blocks "all roles" semantics
2. Module access-denial taxonomy gap (Decision 25)
3. esbuild GHSA-67mh-4wv8-2f99 — deferred Stage 5+

**Carried from Session 3:**
4. shell-contract Section 1 re-export reconciliation (four synced copies)
5. Module mount/unmount event-type taxonomy gap
6. COUNSEL "all roles" not expressible (see item 1)
7. ARIA rule maintenance intake path
8. Output Studio provenance reference
9. Notification / push interface absent
10. Two LENS source documents needed (`vigil_alert_response.md`,
    `vigil_agent_approvals.md`)

**New from Session 4:**
11. **SOF Logger scoped-query API absent from contract.** COUNSEL Prior Position
    Check uses injectable synthetic provider. Real wiring requires a shell-contract
    change (governance decision + version increment).
12. **Prompt naming reconciliation.** COUNSEL spec §7 logical name `analysis_system.md`
    vs platform Prompt Registry versioned filename `analysis-system-v1.0.md`.
13. **`CounselSourceProduct` casing.** COUNSEL deep-link enum uses `"AgentOS"` vs
    canonical `SovereignProduct` `"AGENTOS"`. COUNSEL-local; reconciliation flagged.
14. **PR-COUNSEL-002/003 not yet authored.** Counterargument Mode and Pre-Mortem
    Studio prompts required before those features can be built.
15. **React Testing Library / jsdom component tests not added.** Network install
    required. COUNSEL React currently covered by server-render proofs + tsc +
    dev-server transform. Carried to Session 5.
16. **COUNSEL Decision Record output not yet built.** `HUMAN_DECISION` event with
    full IL fields pending — Session 5 priority.
17. **COUNSEL analysis step does not emit `deployment_feedback`** — by design
    (COUNSEL is not an AgentOS agent; fabricating the field is a constraint
    violation). COUNSEL's IL contribution is via Decision Record fields at the
    `HUMAN_DECISION` stage. Noted as honest IL exposure gap for the analysis step.

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.5 (through Session 4). **No new production-runtime
npm dependencies in Session 4** — React/react-dom are the already-declared platform
stack; module-counsel adds the existing jest/ts-jest/@types dev toolchain.
`npm audit --omit=dev`: 0 vulnerabilities. Known advisory: GHSA-67mh-4wv8-2f99
(esbuild, dev-server-only, deferred Stage 5+).

**Running test totals:** pytest 127 · api-client 143 · data 27 · module-counsel 39
= **336 total tests passing**.

---

## §15 — Transition Build Status

Six primary products: transition packages complete. Companion suite: COUNSEL core
built and mounting. SCRIBE, VIGIL, LENS not yet scaffolded.

---

## §16 — Session Protocol (Every Session Without Exception)

1. Open — confirm all context documents loaded; name each.
2. State done condition — specific, testable. Wait for Project Principal approval.
3. One component per exchange — build, verify, confirm, proceed.
4. Close with handoff — never skip.

**Session 5 context package:**
1. `SOVEREIGN_Platform_Integration_Brief_v1.8.md`
2. `PROJECT_SUMMARY.md`
3. `AGENT_BACKGROUND_AND_LESSONS_LEARNED.md`
4. `system_prompt.md`
5. `Session_4_Handoff_SOVEREIGN_COUNSELCore_20260615.md`
6. `shell-contract.ts`
7. `module-counsel/src/CounselApp.tsx`
8. `module-counsel/src/analysis-contract.ts`
9. `module-counsel/prompts/analysis-system-v1.0.md`
10. `01_COUNSEL_Decision_Support_v1.1.md`
11. `02_SCRIBE_Drafting_Workspace.md`
12. `sovereign_data_CompanionSuite_Specification.md`

---

## §17 — Architectural Patterns (Platform Standard)

All patterns from v1.7 apply. Session 4 additions:

**Injectable synthetic providers follow stub-with-stable-signature.** COUNSEL's
Prior Position Check uses an injectable `PriorPositionProvider`. When the SOF
Logger scoped-query API is added to the contract, it swaps in with no call-site
rewrites.

**LLM calls degrade gracefully at all three tiers.** COUNSEL's Analysis Engine
proves this: no API key → clean Tier 3 static template → meaningful, schema-valid
output. The static template is never an empty stub.

**COUNSEL analysis step emits `REASONING_STEP_START/COMPLETE`, not `AGENT_STEP_*`.**
COUNSEL is not an AgentOS agent. `AGENT_STEP_COMPLETE` carries `deployment_feedback`
which COUNSEL cannot honestly populate. COUNSEL's IL contribution is via the
Decision Record `HUMAN_DECISION` event at session close.

---

## §18 — Primary Product Inserts (Summary Reference)

| Product | Pipeline Stage | AI Use | Governance Record | Key Open Condition |
|---|---|---|---|---|
| FLOWPATH | 1 | Yes | INCOMPLETE | Add `cpmi_vrs_disclosure` to VVR schema |
| CPMI | 3 | Yes (enhanced) | INCOMPLETE | Deploy world model REST API |
| AgentOS | 4 | Infrastructure | INCOMPLETE | Run `evaluate.py` end-to-end |
| NEXUS | 6 | Yes | INCOMPLETE | Complete Track B handlers |
| APEX | 6 | Yes | INCOMPLETE | Validate sql.js; wire Logger |
| ARIA Suite | 7 | No (by design) | INCOMPLETE (ARC only) | Resolve 5 known issues |

All six governance records INCOMPLETE. All data SYNTHETIC. Governance Clock not
activated.

---

## §19 — Companion Suite

### Module Build Status

| Module | Monorepo | Tests | Build Status |
|---|---|---|---|
| COUNSEL | `module-counsel/` | 39 | **Core BUILT Session 4 — Decision Framing + Prior Position Alert + Analysis Engine** |
| SCRIBE | `module-scribe/` | — | Not yet scaffolded — Session 5 |
| VIGIL | `module-vigil/` | — | Not yet scaffolded — Session 6 |
| LENS | `module-lens/` | — | Not yet scaffolded — Session 7 (last) |

### Registered Prompts — Current Status

| Registry ID | File | Status |
|---|---|---|
| PR-COUNSEL-001 | `analysis-system-v1.0.md` | **APPROVED June 15, 2026** |
| PR-COUNSEL-002 | `counter_system.md` | Not yet authored — Session 5 |
| PR-COUNSEL-003 | `premortem_system.md` | Not yet authored — Session 5 |
| PR-SCRIBE-001 through 004 | various | Not yet authored |
| PR-LENS-001 through 002 | various | Not yet authored |
| PR-VIGIL-001 | `triage_system.md` | Not yet authored |

### Governance Decisions of Record

| Decision | Item | Approved | Status |
|---|---|---|---|
| GD-1 | `StyleProfile` canonical entity | June 11, 2026 | IMPLEMENTED |
| GD-2 | `VOICE_CAPTURE_COMPLETED` | June 11, 2026 | APPLIED v1.1 |
| GD-3 | `PRIOR_POSITION_RECONCILIATION` | June 11, 2026 | APPLIED v1.1 — emit path LIVE Session 4 |
| GD-4 | Seven VIGIL event types | June 11, 2026 | APPLIED v1.2 |
| GD-5 | Companion product + PLATFORM_ADMIN | June 13, 2026 | APPLIED v1.3 |

### iCloud Folder Location

```
7 - SOVEREIGN/Companion Suite/
├── 00_SUITE_OVERVIEW_v2.0.md
├── 01_COUNSEL_Decision_Support_v1.1.md
├── 02_SCRIBE_Drafting_Workspace.md
├── 03_LENS_Learning_Navigator_v1.1.md
├── 04_VIGIL_Operator_Dashboard.md
└── Governance/
    ├── [GD-1 through GD-5 decision records]
    ├── [agent and prompt registry additions]
    ├── sovereign_data_CompanionSuite_Specification.md
    ├── Prompt_Approval_PR_COUNSEL_001.md        ← NEW June 15, 2026
    ├── LENS_Source_scribe_voice_capture.md
    ├── LENS_Source_counsel_prior_position.md
    ├── vigil_alert_response.md                  ← TO BE AUTHORED
    └── vigil_agent_approvals.md                 ← TO BE AUTHORED
```

---

## §20 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.0–v1.6 | May 31 – June 11, 2026 | See prior versions |
| v1.7 | June 13, 2026 | GD-5 applied; sovereign-data built; COUNSEL scaffold mounting |
| **v1.8** | **June 15, 2026** | **npm workspaces established; ctx.data.types wired; PLATFORM_ADMIN loader fix; COUNSEL core built (39 tests); PR-COUNSEL-001 APPROVED; PRIOR_POSITION_RECONCILIATION emit live; HUMAN_DECISION_TYPES added to sovereign-data; 336 total tests; §13 items 10/11 CLOSED; items 11–17 added; SBOM v1.5** |

---

*SOVEREIGN Platform Integration Brief v1.8 · June 15, 2026*
*Load in every session alongside `system_prompt.md`, the relevant spec, and the
prior session handoff*
*Pre-Decisional · Internal Working Document*

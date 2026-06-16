# SOVEREIGN Platform Integration Brief
## Version 1.7 | June 13, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.6
**Changed this version:** GD-5 approved and implemented (Companion Suite Contract
Enablement) · shell-contract v1.1, v1.2, v1.3 all APPLIED · sovereign-data package
BUILT (23 tests) · §13 item 6 closed · COUNSEL scaffolded and mounting · SBOM
updated (Session 3) · Five new open governance items added · PLATFORM_ADMIN role
added to standing record · §19 companion suite updated throughout · §20 version
history updated

---

## §1 — What This Document Is

This brief is the mandatory context document for every SOVEREIGN Platform development
session, regardless of which product is being worked on. It defines the shared
platform, the invariant constraints, the pipeline, and the current governance state.
It travels with every product-specific insert.

**Load order:** Integration Brief v1.7 → `system_prompt.md` → product or companion
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

The companion suite operates as a parallel human-support layer:

| Stage | Product | Pipeline Role |
|---|---|---|
| 1 | FLOWPATH | Elicits structured workflow artifacts |
| [future] | Intelligence Layer | Analyzes workflows; future seventh product |
| 3 | CPMI | Governs; issues VRS certifications; enhanced monitoring |
| 4 | AgentOS | Executes governed agent workflows; infrastructure |
| 6 | NEXUS | Task records and correspondence |
| 6 | APEX | Portfolio analytics and reporting |
| 7 | ARIA Suite | Compliance adjudication; AI-absence attestation |
| ‖ | COUNSEL | Human decision support — feeds back into any stage |
| ‖ | SCRIBE | Human drafting and capture — feeds into stages 1, 3, 6, 7 |
| ‖ | LENS | Human orientation and awareness — read-only |
| ‖ | VIGIL | Operator alert response and agent approval — Platform Admin only |

---

## §5 — Governance Role Assignments (Permanent Records)

| Role | Assigned To | Status |
|---|---|---|
| CPMI Product Owner | Project Principal | Session 0A — Stage 3 SATISFIED |
| ARIA Suite Product Owner | Project Principal | Session 0A — UNBLOCKED |
| Data Owner | Project Principal | Session 0A |
| Data Steward | Project Principal | Session 0A |
| Agent Operator | Project Principal | Session 1 — **R3 CLOSED** |

---

## §6 — Standing Development Constraints (Invariant)

Applies to all six primary products and all four companion suite modules.

1. **No independent security, governance, or audit systems.** Import the Security
   Framework; do not replicate it.

2. **No shared entity field-name divergence.** Employee, Program, Cost Code,
   Document, Vendor, StyleProfile (GD-1) — canonical field names are frozen.
   Implemented in `sovereign-data` v1.0.0.

3. **No rewrite debt.** Stage 2 connection is configuration, not rewrite.

4. **Tag every human decision event with `decision_type`.** Ground-truth IL training
   data. Required on all HUMAN_DECISION events including VIGIL approval decisions.

5. **No direct LLM API calls.** All calls through `sovereign-api-client`.
   `createSovereignClient()` only.

6. **`workflow_step_id` on every Logger event.** `decision_type` + `actor: "human"` +
   `actor_name` on human decision events. `agent_id` on agent step events. Enforced
   at shell boundary.

7. **Shell context frozen at eight exports.** `auth`, `logger`, `governance`, `data`,
   `navigation`, `mcp`, `a2a`, `agui`. No LLM client. Changes are governance events.
   (Decision 18.)

8. **`shell-contract.ts` is a governance document.** Changes require a decision
   record, version increment, changelog entry, six-module impact assessment, and
   SHA-256 verification of both copies. Current version: **v1.3 APPLIED** (GD-2/3
   in v1.1, GD-4 in v1.2, GD-5 in v1.3 — all applied Session 3, June 13, 2026).
   SHA-256 both copies: `4d78754f20fbd7c3d3ef2d1dbdd76422ec79f965aa7489d042fe189f6836acc2`.

9. **All prompts registered before build.** 10 registered prompts across four
   companion modules. Unregistered prompts are a constraint violation.

10. **All agents registered before build.** 7 registered agents across four
    companion modules. Every Logger event carries `agent_id`.

11. **Three synced copies of shared enums now exist.** `shell-contract.ts`
    (canonical), `sovereign-api-client/src/types.ts` (SovereignProduct/Tier),
    `sovereign-data/src/shared-types.ts` (Role/Clearance/HumanDecisionType). Each
    carries a sync-obligation header. Any change to a shared enum in shell-contract
    must be propagated to the relevant copies. This is a constraint, not a temporary
    state — resolving via shell-contract re-exporting from sovereign-data requires a
    governance decision.

---

## §7 — CPMI Enhanced Monitoring

CPMI operates at **0.7× the standard anomaly threshold** — architectural constant,
not configurable. CPMI's integrity is a platform-wide dependency.
`CPMI_DRIFT_DETECTED` alerts in VIGIL receive elevated treatment and a mandatory
platform-wide impact notice.

---

## §8 — Shell Architecture (Option C — Permanent)

```
sovereign-platform/
├── sovereign-security/          ← Stage 1 COMPLETE — 127 tests
├── sovereign-api-client/        ← Stage 1 COMPLETE — 143 tests
├── sovereign-data/              ← NEW Session 3 — 23 tests — v1.0.0
├── sovereign-shell/             ← Stage 1 COMPLETE + Session 3 host entry point
│   ├── shell-contract.ts        ← v1.3 APPLIED (June 13, 2026)
│   │   SHA-256: 4d78754f…6836acc2
│   └── src/ [shell, module-loader, navigation, governance, main.tsx,
│              register-modules.ts]
├── module-counsel/              ← NEW Session 3 — scaffold mounting ✅
├── module-scribe/               ← Next (COUNSEL core first)
├── module-lens/                 ← Build last
├── module-vigil/                ← Build third
├── module-nexus/                ← Stage 2
├── module-cpmi/                 ← Stage 2 (enhanced tier)
├── module-apex/                 ← Stage 2
├── module-flowpath/             ← Stage 2
├── module-agentos/              ← Stage 2
└── module-aria/                 ← Stage 2
```

**Shell-contract version history (all applied):**
- v1.0 — June 2, 2026 — Initial approved version
- v1.1 — June 11, 2026 — GD-2 (VOICE_CAPTURE_COMPLETED) + GD-3
  (PRIOR_POSITION_RECONCILIATION) — APPLIED Session 3
- v1.2 — June 11, 2026 — GD-4 (seven VIGIL event types) — APPLIED Session 3
- v1.3 — June 13, 2026 — GD-5 (SovereignProduct += 4 companion modules;
  SovereignRole += PLATFORM_ADMIN) — APPLIED Session 3

**Dev server:** `cd sovereign-shell && npm run dev` → Vite v5.4.21 on
`http://localhost:3000`. SOVEREIGN is now a running application.

**Package linkage:** The monorepo has no npm workspace / `file:` linkage yet.
The host imports `module-counsel` by relative path. This is a pending infrastructure
decision (see §13 item 10) that must be resolved before COUNSEL core can use React
and `createSovereignClient()`.

---

## §9 — Intelligence Layer Exposure Requirements

Frozen fields — never rename or restructure:

| Field | Required On | IL Component |
|---|---|---|
| `workflow_step_id` | Every Logger event | All five IL components |
| `decision_type` | Every human decision event (incl. VIGIL approvals) | Judgment Detection |
| `deployment_feedback` | `AGENT_STEP_COMPLETE` | Automatability Scorer |
| `classification_level` | All classified events | Risk & Failure Modeler |
| VVR export schema `{step_id, description, inputs, outputs, decision_required, human_role}` | FLOWPATH VVRs | Task Decomposition Engine |
| COUNSEL Decision Record fields | All COUNSEL sessions | Judgment Detection · Risk & Failure Modeler |
| SCRIBE revision fields | SCRIBE exports (Style DNA active) | Automatability Scorer |
| Orientation completion status | LENS Logger events | Judgment Detection calibration |
| VIGIL operator oversight decisions | VIGIL approval decisions | Judgment Detection |

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
| StyleProfile | `user_id` | **user** | **GD-1 implemented in `sovereign-data` v1.0.0 (Session 3)** |

`sovereign-data` package is built and tested (23 tests passing). It is not yet
linked to the shell host — `ctx.data.types` remains a frozen placeholder pending
the npm workspace / package-linkage decision (§13 item 10).

---

## §11 — Current Build Status

### Stage 1 — COMPLETE (re-verified Session 3)

| Deliverable | Location | Status |
|---|---|---|
| Security Framework | `sovereign-security/` | ✅ 127 tests passing |
| shell-contract.ts | `sovereign-shell/shell-contract.ts` | ✅ v1.3 applied |
| sovereign-api-client | `sovereign-api-client/src/` | ✅ 143 tests passing |
| sovereign-shell scaffold | `sovereign-shell/src/` | ✅ 0 compile errors |
| Agent Operator Scope v1.0 | Agent_Operator_Scope_SOVEREIGN.md | ✅ R3 CLOSED |

### Stage 2 — IN PROGRESS (Session 3 delivered)

| Deliverable | Location | Status |
|---|---|---|
| shell-contract v1.1 (GD-2/3) | `shell-contract.ts` | ✅ APPLIED Session 3 |
| shell-contract v1.2 (GD-4) | `shell-contract.ts` | ✅ APPLIED Session 3 |
| shell-contract v1.3 (GD-5) | `shell-contract.ts` | ✅ APPLIED Session 3 |
| sovereign-data package | `sovereign-data/` | ✅ BUILT Session 3 — 23 tests |
| Shell host entry point | `sovereign-shell/src/main.tsx` | ✅ BUILT Session 3 — dev server confirmed |
| module-counsel scaffold | `module-counsel/` | ✅ BUILT Session 3 — mounting confirmed |

**Next Session 4 priorities (in order):**
1. npm workspace / package linkage decision and implementation
2. COUNSEL core — Prior Position Alert, Decision Records, PR-COUNSEL-001/002/003
3. Wire `ctx.data.types` to `@sovereign/data` (closes §13 items 10 and 11)

### Stage 3 — Prerequisite Satisfied

CPMI-VRS portfolio standard. Named owner assigned. May proceed after Stage 2.

---

## §12 — Risk Register

| ID | Risk | Priority | Status |
|---|---|---|---|
| R1 | Human-review-volume architecture; review-queue component | HIGH — before Stage 5 | OPEN |
| R2 | AI Provider Abstraction Layer | HIGH | **CLOSED** |
| R3 | Agent Operator Role Undefined | HIGH | **CLOSED** |
| R4 | Federal Client Workforce Transition | REQUIRED — before pilot | OPEN — LENS primary mitigation |
| R5 | CPMI world model REST API not deployed | HIGH | OPEN |
| R6 | AgentOS evaluate.py never tested | MEDIUM | OPEN |
| R7 | Tier 2 LLM Provider Unresolved | HIGH — before Stage 5 | OPEN |
| R8 | Shell ↔ module contract drift | — | MITIGATED |
| R9 | NEXUS ATO timeline | HIGH — Stage 5 | OPEN |
| R10 | AgentOS has no user-facing surface | HIGH | **CLOSED** — VIGIL |
| R11 | Security Framework alert response interface absent | HIGH | **CLOSED** — VIGIL |
| OWI-FP-001 | FLOWPATH elicitation methodology gap | HIGH — before pilot | OPEN |
| OWI-INT-001 | Cross-product failure topology not mapped | HIGH — Stage 9 | OPEN |

---

## §13 — Open Governance Items

**From Session 2B (carried):**
1. Role → module access matrix (Decision 24) — now concretely blocking COUNSEL/
   SCRIBE/LENS "all roles" semantics; `module-counsel.minimumRole` is `READ_ONLY`
   placeholder pending this matrix
2. Module access-denial taxonomy gap (Decision 25) — contract change when resolved
3. esbuild dev-server advisory (GHSA-67mh-4wv8-2f99) — deferred Stage 5+

**From Companion Suite Registration (June 11, 2026) — partially resolved:**
4. shell-contract v1.1, v1.2, v1.3 — **ALL APPLIED Session 3** ✅
5. ~~sovereign-data package not yet built~~ — **CLOSED Session 3** ✅
6. ARIA rule maintenance intake path not designed — OPEN
7. Output Studio provenance reference not specified — OPEN
8. Notification / push interface absent — OPEN
9. Two LENS source documents needed (`vigil_alert_response.md`,
   `vigil_agent_approvals.md`) — OPEN; required before LENS Platform Admin
   orientation modules

**New from Session 3 (June 13, 2026):**
10. **npm workspace / package linkage decision.** The monorepo has no workspace
    or `file:` linkage. Host imports module-counsel by relative path. Must be
    resolved before COUNSEL core needs React + `createSovereignClient()`.
    Recommended: npm workspaces. **Next session priority.**
11. **`ctx.data.types` ↔ `sovereign-data` wiring.** sovereign-data is built but
    not imported by the shell host (depends on item 10). Placeholder note updated.
12. **shell-contract Section 1 re-export reconciliation.** shell-contract says
    entity types are "re-exported from sovereign-data" but defines them inline;
    three synced copies exist. Wiring shell-contract to import from sovereign-data
    is a shell-contract change = governance decision + version increment.
13. **Module mount/unmount event-type taxonomy gap.** No `SovereignEventType`
    denotes module mount/unmount. Adding one is a shell-contract change (same
    family as Decision 25).
14. **COUNSEL "all roles" access not expressible** under fail-closed default policy.
    Resolved by Decision 24 role→module access matrix injected as `RoleAccessPolicy`.

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.4 (through Session 3). No new production-runtime
npm dependencies introduced in Session 3. `sovereign-data` ships zero runtime deps.
`module-counsel` ships zero deps. Python test-environment packages installed to
user site-packages for health check — already-declared stack, recorded in SBOM for
traceability, not new platform dependencies.

Known advisory: GHSA-67mh-4wv8-2f99 (esbuild, dev-server-only, deferred Stage 5+).
`sovereign-data` reported 0 npm vulnerabilities at install.

---

## §15 — Transition Build Status

Six primary products: all transition packages complete. Companion suite modules:
new builds — Session Zero checklists serve the equivalent function. COUNSEL
scaffold complete; core is Session 4.

---

## §16 — Session Protocol (Every Session Without Exception)

1. Open — confirm all context documents loaded; name each.
2. State done condition — specific, testable. Wait for Project Principal approval.
3. One component per exchange — build, verify, confirm, proceed.
4. Close with handoff — never skip.

**Session 4 context package:**
- Integration Brief v1.7 (this document)
- PROJECT_SUMMARY.md
- AGENT_BACKGROUND_AND_LESSONS_LEARNED.md
- system_prompt.md
- Session_3_Handoff_SOVEREIGN_CompanionFoundation_20260613.md
- shell-contract.ts (v1.3)
- sovereign-shell/src/shell.ts
- sovereign-shell/src/module-loader/index.ts
- module-counsel/src/index.ts
- sovereign_data_CompanionSuite_Specification.md
- 01_COUNSEL_Decision_Support_v1.1.md

---

## §17 — Architectural Patterns (Platform Standard)

Stub-with-stable-signature · Three-tier fallback · Policy-as-data / policy-injection ·
Structural replacement over disabled buttons · Compiler as contract enforcer ·
Presentation reads context, never re-derives · Stub behavior matches failure mode.

**Session 3 pattern additions:**
- Three synced enum copies carry sync-obligation headers — any shell-contract enum
  change must propagate to all three copies. This is enforced by the headers, not
  by tooling (pending workspace linkage).
- Companion modules import only TYPES from shell-contract (erased at runtime),
  making cross-tree imports runtime-free until package linkage is established.
- VIGIL's PLATFORM_ADMIN gate is expressible using the existing fail-closed default
  policy — no policy rewrite needed; set `minimumRole: "PLATFORM_ADMIN"` and the
  default admits PLATFORM_ADMIN + SYSTEM_ADMIN only.

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

### iCloud Folder Location

```
7 - SOVEREIGN/Companion Suite/
├── 00_SUITE_OVERVIEW_v2.0.md
├── 01_COUNSEL_Decision_Support_v1.1.md
├── 02_SCRIBE_Drafting_Workspace.md
├── 03_LENS_Learning_Navigator_v1.1.md
├── 04_VIGIL_Operator_Dashboard.md
└── Governance/
    ├── Governance_Decision_Record_GD1_GD2_GD3.md
    ├── Governance_Decision_Record_GD4_VIGIL.md
    ├── Governance_Decision_Record_GD5_CompanionContract.md  ← NEW Session 3
    ├── Agent_Identity_Standard_CompanionSuite_Additions.md
    ├── Agent_Identity_Standard_VIGIL_Additions.md
    ├── Prompt_Registry_CompanionSuite_Additions.md
    ├── Prompt_Registry_VIGIL_Addition.md
    ├── sovereign_data_CompanionSuite_Specification.md
    ├── SCRIBE_Version_Note_20260611.md
    ├── LENS_Source_scribe_voice_capture.md
    ├── LENS_Source_counsel_prior_position.md
    ├── vigil_alert_response.md                 (to be authored)
    └── vigil_agent_approvals.md                (to be authored)
```

### Module Summary

| Module | Monorepo | Access | Build Status |
|---|---|---|---|
| COUNSEL | `module-counsel/` | All roles (Decision 24 pending) | **Scaffold BUILT Session 3 — mounting confirmed** |
| SCRIBE | `module-scribe/` | All roles | Not yet scaffolded |
| LENS | `module-lens/` | All roles | Not yet scaffolded — build last |
| VIGIL | `module-vigil/` | PLATFORM_ADMIN, SYSTEM_ADMIN | Not yet scaffolded — build third |

### Governance Decisions of Record

| Decision | Item | Approved | Status |
|---|---|---|---|
| GD-1 | `StyleProfile` canonical entity in `sovereign-data` | June 11, 2026 | **IMPLEMENTED Session 3** |
| GD-2 | `VOICE_CAPTURE_COMPLETED` SovereignEventType member | June 11, 2026 | **APPLIED shell-contract v1.1 Session 3** |
| GD-3 | `PRIOR_POSITION_RECONCILIATION` SovereignEventType member | June 11, 2026 | **APPLIED shell-contract v1.1 Session 3** |
| GD-4 | Seven VIGIL event types | June 11, 2026 | **APPLIED shell-contract v1.2 Session 3** |
| GD-5 | SovereignProduct += COUNSEL/SCRIBE/LENS/VIGIL; SovereignRole += PLATFORM_ADMIN | **June 13, 2026** | **APPLIED shell-contract v1.3 Session 3** |

### Registered Agents

| `agent_id` | Module | LLM-Backed | Data Classification |
|---|---|---|---|
| `counsel-analyst` | module-counsel | Yes | Platform audit |
| `scribe-drafter` | module-scribe | Yes | Per content type |
| `scribe-style-analyst` | module-scribe | Yes | `user` |
| `lens-explainer` | module-lens | Yes | `user` |
| `lens-orientation` | module-lens | Yes | `user` |
| `vigil-triage-analyst` | module-vigil | Yes | Platform audit |
| `vigil-approval-agent` | module-vigil | No | Platform audit |

---

## §20 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.0 | May 31, 2026 | Session 0 — baseline |
| v1.1 | May 31, 2026 | Session 0A — governance role assignments |
| v1.2 | May 31, 2026 | Session 0A — pipeline, transition build, three design outcomes |
| v1.3 | June 1, 2026 | Session 1 — Security Framework; shell-contract v1.0; Decisions 12, 13 |
| v1.4 | June 2, 2026 | Session 2B — R2/R3 closed; Stage 1 complete; shell context frozen |
| v1.5 | June 11, 2026 | Companion Suite (COUNSEL, SCRIBE, LENS) added; GD-1/2/3 approved |
| v1.6 | June 11, 2026 | VIGIL added; GD-4 approved; R10/R11 CLOSED; build sequencing updated |
| **v1.7** | **June 13, 2026** | **GD-5 approved and applied (shell-contract v1.3); shell-contract v1.1/v1.2/v1.3 all APPLIED; sovereign-data BUILT (23 tests); COUNSEL scaffold mounting; SBOM v1.4; five new open governance items (§13 items 10–14); PLATFORM_ADMIN role recorded; npm workspace linkage identified as Session 4 first priority** |

---

*SOVEREIGN Platform Integration Brief v1.7 · June 13, 2026*
*Load in every session alongside `system_prompt.md`, the relevant spec, and the
prior session handoff*
*Pre-Decisional · Internal Working Document*

# SOVEREIGN Platform Integration Brief
## Version 1.6 | June 11, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.5
**Changed this version:** VIGIL added as fourth companion module · GD-4 approved
(seven VIGIL SovereignEventType members) · shell-contract v1.2 flagged as Stage 2
task (after v1.1) · R10 and R11 updated to CLOSED · §19 companion suite updated ·
VIGIL agents and prompt registered · Standing Constraint §6 item 9 updated to
note 10 total prompts · build sequencing updated

---

## §1 — What This Document Is

This brief is the mandatory context document for every SOVEREIGN Platform development
session, regardless of which product is being worked on. It defines the shared
platform, the invariant constraints, the pipeline, and the current governance state.
It travels with every product-specific insert.

**Load order:** Integration Brief v1.6 → `system_prompt.md` → product or companion
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

3. **No rewrite debt.** Stage 2 connection is configuration, not rewrite.

4. **Tag every human decision event with `decision_type`.** Ground-truth IL training
   data. Required on all HUMAN_DECISION events including VIGIL approval decisions.

5. **No direct LLM API calls.** All calls through `sovereign-api-client`.
   `createSovereignClient()` only. Never instantiate `AnthropicClient` or
   `GovCloudClient` directly.

6. **`workflow_step_id` on every Logger event.** `decision_type` + `actor: "human"` +
   `actor_name` on human decision events. `agent_id` on agent step events. Enforced
   at shell boundary.

7. **Shell context frozen at eight exports.** `auth`, `logger`, `governance`, `data`,
   `navigation`, `mcp`, `a2a`, `agui`. No LLM client. Changes are governance events.
   (Decision 18.)

8. **`shell-contract.ts` is a governance document.** Changes require decision,
   version increment, changelog, six-module impact assessment. Current version:
   **v1.0 approved; v1.1 pending (GD-2, GD-3); v1.2 pending (GD-4) — both
   Stage 2 Claude Code tasks, in sequence.**

9. **All prompts registered before build.** 10 registered prompts across four
   companion modules. Unregistered prompts are a constraint violation.

10. **All agents registered before build.** 7 registered agents across four
    companion modules. Every Logger event carries `agent_id`.

---

## §7 — CPMI Enhanced Monitoring

CPMI operates at **0.7× the standard anomaly threshold** — architectural constant,
not configurable. CPMI's integrity is a platform-wide dependency. `CPMI_DRIFT_DETECTED`
alerts in VIGIL receive elevated treatment and a mandatory platform-wide impact
notice. VIGIL's triage prompt for CPMI drift includes a frozen instruction
distinguishing configuration drift, prompt injection, and reasoning instability.

---

## §8 — Shell Architecture (Option C — Permanent)

```
sovereign-platform/
├── sovereign-security/          ← Stage 1 COMPLETE — 127 tests
├── sovereign-api-client/        ← Stage 1 COMPLETE — 143 tests
├── sovereign-shell/
│   ├── shell-contract.ts        ← v1.0 approved; v1.1 pending (GD-2/3);
│   │                               v1.2 pending (GD-4); both Stage 2 tasks
│   └── src/ [shell, module-loader, navigation, governance]
├── module-nexus/                ← Stage 2
├── module-cpmi/                 ← Stage 2 (enhanced tier)
├── module-apex/                 ← Stage 2
├── module-flowpath/             ← Stage 2
├── module-agentos/              ← Stage 2
├── module-aria/                 ← Stage 2
├── module-counsel/              ← Companion Suite — Stage 2
├── module-scribe/               ← Companion Suite — Stage 2
├── module-lens/                 ← Companion Suite — Stage 2 (build last)
└── module-vigil/                ← Companion Suite — Stage 2 (build third)
```

**Shell-contract update sequence (both Stage 2 Claude Code tasks):**
- v1.1: Add `VOICE_CAPTURE_COMPLETED` + `PRIOR_POSITION_RECONCILIATION` (GD-2/3)
- v1.2: Add seven VIGIL event types (GD-4) — implement after v1.1, not combined

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
| `alternatives_considered`, `confidence_score`, `counterargument_requested`, `challenge_turns`, `premortem_conducted`, `prior_position_alert_shown` | COUNSEL Decision Records | Judgment Detection · Risk & Failure Modeler |
| `style_correction_revisions`, `content_correction_revisions` | SCRIBE export (Style DNA active) | Automatability Scorer |
| Orientation completion status | LENS Logger events | Judgment Detection calibration |
| `false_positive_likelihood`, agent false positive rate by class | VIGIL triage events | Risk & Failure Modeler |
| Operator oversight decisions with `decision_type` | VIGIL approval decisions | Judgment Detection |

**The Intelligence Layer is the seventh product. It must never be lost.**

---

## §10 — Shared Data Dictionary

| Entity | Canonical Identifier | Data Classification | Notes |
|---|---|---|---|
| Employee | `employee_id` | program | NEXUS, APEX, ARIA, AgentOS |
| Program | `program_id` | program | NEXUS, APEX, FLOWPATH, CPMI |
| Cost Code | `cost_code` | program | APEX, ARIA, NEXUS |
| Document | `document_id` | program | NEXUS, ARIA, CPMI |
| Vendor | `vendor_id` | program | NEXUS, ARIA, APEX |
| StyleProfile | `user_id` | **user** | GD-1 approved June 11, 2026. Owner: SCRIBE. |

---

## §11 — Current Build Status

### Stage 1 — COMPLETE

Security Framework (127 tests) · shell-contract v1.0 · sovereign-api-client (143
tests, R2 closed) · sovereign-shell scaffold (0 errors) · Agent Operator Scope v1.0
(R3 closed). Monorepo exists on Mac Mini.

### Stage 2 — IN PROGRESS (Claude Code)

Primary products: Security Framework deployment · first module mounts · Logger
emission pathways · protocol stub advancement.

Companion suite Stage 2 additions (in build order):
1. shell-contract v1.1 (GD-2/3) then v1.2 (GD-4) — in sequence
2. `sovereign-data` package including StyleProfile (GD-1)
3. COUNSEL core → Prior Position Alert
4. SCRIBE typed modes → voice → Style DNA
5. VIGIL core → alert wiring → approval queue wiring
6. LENS (last — requires activity from COUNSEL, SCRIBE, VIGIL)

### Stage 3 — Prerequisite Satisfied

CPMI-VRS portfolio standard. Named owner assigned. May proceed after Stage 2.

---

## §12 — Risk Register

| ID | Risk | Priority | Status |
|---|---|---|---|
| R1 | Human-review-volume architecture; review-queue component | HIGH — before Stage 5 | OPEN |
| R2 | AI Provider Abstraction Layer | HIGH | **CLOSED** — sovereign-api-client v1.0 |
| R3 | Agent Operator Role Undefined | HIGH | **CLOSED** — Agent_Operator_Scope v1.0 |
| R4 | Federal Client Workforce Transition | REQUIRED — before pilot | OPEN — LENS primary mitigation |
| R5 | CPMI world model REST API not deployed | HIGH | OPEN |
| R6 | AgentOS evaluate.py never tested | MEDIUM | OPEN |
| R7 | Tier 2 LLM Provider Unresolved | HIGH — before Stage 5 | OPEN |
| R8 | Shell ↔ module contract drift | — | MITIGATED |
| R9 | NEXUS ATO timeline | HIGH — Stage 5 | OPEN |
| R10 | AgentOS has no user-facing surface | HIGH | **CLOSED** — VIGIL Agent Approval Queue |
| R11 | Security Framework alert response interface absent | HIGH | **CLOSED** — VIGIL Alert Queue |
| OWI-FP-001 | FLOWPATH elicitation methodology gap | HIGH — before pilot | OPEN — SCRIBE framing mode primary mitigation |
| OWI-INT-001 | Cross-product failure topology not mapped | HIGH — Stage 9 | OPEN |

---

## §13 — Open Governance Items

**From Session 2B (carried):**
1. Role → module access matrix (open)
2. Module access-denial taxonomy gap (contract change when resolved)
3. esbuild dev-server advisory (GHSA-67mh-4wv8-2f99) — deferred Stage 5+

**From Companion Suite Registration (June 11, 2026):**
4. shell-contract v1.1 update (GD-2/3) — Stage 2 Claude Code task
5. shell-contract v1.2 update (GD-4) — Stage 2 Claude Code task, after v1.1
6. `sovereign-data` package not yet built (GD-1 approved; implementation pending)
7. ARIA rule maintenance intake path not designed
8. Output Studio provenance reference not specified
9. Notification / push interface absent
10. Two LENS governance source documents needed: `vigil_alert_response.md`,
    `vigil_agent_approvals.md` — required before Platform Administrator VIGIL
    orientation modules are complete

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.3 (through Session 2B). No new packages from
governance-only sessions. Stage 2 companion suite scaffold sessions will produce
SBOM updates. Known advisory: GHSA-67mh-4wv8-2f99 (esbuild, dev-server-only,
deferred Stage 5+).

---

## §15 — Transition Build Status

Six primary products: all transition packages complete. Companion suite modules
(COUNSEL, SCRIBE, LENS, VIGIL): new builds — Session Zero checklists in each
module's architecture specification serve the equivalent function.

---

## §16 — Session Protocol (Every Session Without Exception)

1. Open — confirm all context documents loaded; name each.
2. State done condition — specific, testable. Wait for Project Principal approval.
3. One component per exchange — build, verify, confirm, proceed.
4. Close with handoff — never skip.

---

## §17 — Architectural Patterns (Platform Standard)

Stub-with-stable-signature · Three-tier fallback · Policy-as-data / policy-injection ·
Structural replacement over disabled buttons · Compiler as contract enforcer ·
Presentation reads context, never re-derives · Stub behavior matches failure mode.

**VIGIL-specific patterns:**
- Logger emit gates A2A return: a VIGIL approval decision that is not in the audit
  trail must not be returned to AgentOS.
- Role gate at mount, not in UI: VIGIL access denial is structural enforcement at
  the module loader, not a conditional render inside the component tree.
- Tier 3 static fallbacks are investigation checklists, not empty stubs.

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
├── 02_SCRIBE_Drafting_Workspace.md            (v1.0 current; v1.1 admin update pending)
├── 03_LENS_Learning_Navigator_v1.1.md
├── 04_VIGIL_Operator_Dashboard.md
└── Governance/
    ├── Governance_Decision_Record_GD1_GD2_GD3.md
    ├── Governance_Decision_Record_GD4_VIGIL.md
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

| Module | Monorepo | Access | Pipeline Feed | Risks Closed |
|---|---|---|---|---|
| COUNSEL | `module-counsel/` | All roles | Decision Records → any stage | — |
| SCRIBE | `module-scribe/` | All roles | Drafts → NEXUS, APEX, CPMI, FLOWPATH, ARIA | OWI-FP-001 mitigated |
| LENS | `module-lens/` | All roles | Read-only; orientation → IL calibration | R4 mitigated |
| VIGIL | `module-vigil/` | PLATFORM_ADMIN, SYSTEM_ADMIN only | Alert responses, approval decisions → audit trail | **R10 CLOSED, R11 CLOSED** |

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

### Registered Prompts

| Registry ID | Module | Status |
|---|---|---|
| PR-COUNSEL-001/002/003 | module-counsel | Must be authored |
| PR-SCRIBE-001/002/003 | module-scribe | Must be authored |
| PR-SCRIBE-004 | module-scribe | Pending `sovereign-data` StyleProfile |
| PR-LENS-001 | module-lens | Pending 8 source docs (6 original + 2 VIGIL) |
| PR-LENS-002 | module-lens | Must be authored |
| PR-VIGIL-001 | module-vigil | Must be authored |

### Governance Decisions of Record

| Decision | Item | Approved | Status |
|---|---|---|---|
| GD-1 | `StyleProfile` canonical entity | June 11, 2026 | Fields frozen |
| GD-2 | `VOICE_CAPTURE_COMPLETED` event type | June 11, 2026 | shell-contract v1.1 pending |
| GD-3 | `PRIOR_POSITION_RECONCILIATION` event type | June 11, 2026 | shell-contract v1.1 pending |
| GD-4 | Seven VIGIL event types | June 11, 2026 | shell-contract v1.2 pending (after v1.1) |

### Build Sequencing

COUNSEL → SCRIBE → VIGIL → LENS (in that order; see §19 VIGIL before LENS
rationale: LENS Platform Administrator orientation modules require VIGIL
governance source documents and ideally live VIGIL activity to be meaningful).

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
| **v1.6** | **June 11, 2026** | **VIGIL added as fourth companion module; GD-4 approved (7 VIGIL event types); shell-contract v1.2 flagged; R10/R11 CLOSED; build sequencing updated; §19 fully updated; two LENS source documents noted as pending** |

---

*SOVEREIGN Platform Integration Brief v1.6 · June 11, 2026*
*Load in every session alongside `system_prompt.md`, the relevant spec, and the
prior session handoff*
*Pre-Decisional · Internal Working Document*

# SOVEREIGN Platform Integration Brief
## Version 1.12 | June 22, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.11
**Changed this version:** Monorepo path corrected throughout from `~/sovereign-platform/`
to `~/Developer/sovereign-platform/` (permanent move June 22, 2026) ·
`SOVEREIGN_Agent_to_Agent_Briefing.md` added to session context package and repo root ·
`03_LENS_Orientation_Module.md` confirmed in repo (authored Session 7 post-session,
commit `bd0e20d`) · PR-LENS-001 status confirmed APPROVED June 18, 2026 (Session 7
Handoff showed PENDING because it predates the Claude Chat approval cycle — no error
in either document) · §8, §15, §18, §19 updated

---

## §1 — What This Document Is

Mandatory context for every SOVEREIGN Platform development session. Load order:
Integration Brief v1.11 → `system_prompt.md` → product or companion suite spec →
prior session handoff → `shell-contract.ts`.

Confirm all documents are loaded by name before any build work begins.

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
Stage 1 COMPLETE. Terminal point: VIGIL Alert Queue (wired, null-graceful — live feed
activates in Session 9 Security Framework wiring, configuration change only).

**CPMI-VRS AI Governance Standard** — portfolio-wide; NIST AI RMF aligned.

**AgentOS** — MLOps backbone; Security Framework + CPMI-VRS embedded. Human-approval
interface: VIGIL Agent Approval Queue (scaffold built; live features deferred).

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH → [Intelligence Layer, future] → CPMI → AgentOS → NEXUS / APEX → ARIA Suite
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ⏳ · VIGIL ✅ (parallel human-support layer)
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
   `4d78754f…6836acc2`, unchanged through Sessions 3–7**
9. All prompts registered before build — **10 registered; 7 APPROVED
   (PR-COUNSEL-001/002/003, PR-SCRIBE-001, PR-SCRIBE-004, PR-VIGIL-001, PR-LENS-001)**
10. All agents registered before build — **9 registered agents**
11. **Five synced copies of shared artifacts** — changes must propagate to all copies

---

## §7 — CPMI Enhanced Monitoring

CPMI operates at **0.7× standard anomaly threshold** — architectural constant.
`CPMI_DRIFT_DETECTED` alerts receive elevated priority in VIGIL (P1/P2 regardless of
underlying severity). CPMI checklist in the Triage Assistant keeps the reasoning-quality
boundary (pattern, not correctness).

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT (moved June 22, 2026)
├── package.json                       ← npm workspace root · git main · HEAD bd0e20d
├── SOVEREIGN_Platform_Integration_Brief_v1.12.md
├── Agent_Identity_Standard.md         ← all 9 agents recorded (catch-up Session 7)
├── SOVEREIGN_Agent_to_Agent_Briefing.md  ← load every session (added v1.12)
├── sovereign-security/                ← 127 tests
├── sovereign-api-client/              ← 143 tests
├── sovereign-data/                    ← 27 tests
├── sovereign-shell/
│   ├── shell-contract.ts              ← v1.3 (unchanged Sessions 3–7)
│   └── src/ [shell, module-loader, navigation, governance, main.tsx,
│              register-modules.ts]    ← registers counsel + scribe + vigil + lens
├── module-counsel/                    ← COMPLETE — 91 tests
├── module-scribe/                     ← COMPLETE (core) — 86 tests
├── module-vigil/                      ← CORE COMPLETE — 63 tests
├── module-lens/                       ← scaffold built — 9 tests (core: Session 8+)
└── docs/
    ├── 03_LENS_Orientation_Module.md  ← LENS architecture spec (authored Session 7 post-session)
    ├── vigil_alert_response.md        ← LENS source document
    ├── vigil_agent_approvals.md       ← LENS source document
    ├── 02_SCRIBE_Drafting_Workspace.md
    ├── 04_VIGIL_Operator_Dashboard.md
    └── sovereign_data_CompanionSuite_Specification.md
```

**Git:** Branch `main`. HEAD and origin/main at `bd0e20d` (in sync).
**Absolute path:** `/Users/developmentsystem/Developer/sovereign-platform/`
**Dev server:** `cd ~/Developer/sovereign-platform/sovereign-shell && npm run dev` → `http://localhost:3000`.

---

## §9 — Intelligence Layer Exposure Requirements

| Field | Required On | IL Component | Status |
|---|---|---|---|
| `workflow_step_id` | Every Logger event | All five IL components | Enforced |
| `decision_type` | Every human decision event | Judgment Detection | Enforced |
| All six COUNSEL IL fields | COUNSEL Decision Records | Judgment Detection + Risk Modeler | **LIVE — Session 5** |
| Alert-response `decision_type` | VIGIL alert responses | Judgment Detection | **DEFERRED — v1.4** (see §13 item 16) |
| `deployment_feedback` | `AGENT_STEP_COMPLETE` | Automatability Scorer | Not applicable to companion suite |
| VVR export schema | FLOWPATH VVRs | Task Decomposition Engine | Pending |

**The Intelligence Layer is the seventh product. It must never be lost.**

---

## §10 — Shared Data Dictionary

| Entity | Canonical ID | Classification | Status |
|---|---|---|---|
| Employee | `employee_id` | program | Implemented |
| Program | `program_id` | program | Implemented |
| Cost Code | `cost_code` | program | Implemented |
| Document | `document_id` | program | Implemented — COUNSEL Decision Record |
| Vendor | `vendor_id` | program | Implemented |
| StyleProfile | `user_id` | user | LIVE — Session 6. Injectable port (session-scoped). Cross-session store pending v1.4 governance decision. |

---

## §11 — Current Build Status

### Stage 1 — COMPLETE (127 Python tests)

### Stage 2 — IN PROGRESS

| Deliverable | Tests | Status |
|---|---|---|
| sovereign-data + StyleProfile | 27 | ✅ Session 3 |
| Shell host + dev server | — | ✅ Session 3 |
| COUNSEL core + complete | 91 | ✅ Sessions 4–5 |
| RTL + jsdom layer | — | ✅ Session 5 |
| SCRIBE scaffold + core + Style DNA | 86 | ✅ Sessions 5–6 |
| VIGIL scaffold | 17 | ✅ Session 6 |
| VIGIL core (Triage + Alert Response) | 63 | ✅ **Session 7 D1** |
| LENS scaffold | 9 | ✅ **Session 7 D2** |
| LENS core (`lens-explainer`) | — | **Blocked — needs `03_LENS_Orientation_Module.md`** |
| SCRIBE intermediate modes (synthesis, framing) | — | Session 8 |
| VIGIL Agent Approval flow + `vigil-approval-agent` | — | Later session |
| Security Framework live wiring (VIGIL_ALERT_ENDPOINT) | — | Session 9 |

**Total tests passing: 419 JS + 127 Python = 546 total**

### Session 8 priorities:
1. Author `03_LENS_Orientation_Module.md` in Claude Chat — unblocks LENS core
2. SCRIBE intermediate modes (`synthesis`, `framing`) + Smart Capture (voice —
   `VOICE_CAPTURE_COMPLETED` approved via GD-2)
3. LENS core once spec is ready

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
| R7 | Tier 2 LLM Provider Unresolved | OPEN |
| R8 | Shell ↔ module contract drift | MITIGATED |
| R9 | NEXUS ATO timeline | OPEN — Stage 5 |
| R10 | AgentOS has no user-facing surface | **CLOSED** — VIGIL |
| R11 | Security Framework alert response absent | **CLOSED** — VIGIL core complete |
| OWI-FP-001 | FLOWPATH elicitation gap | OPEN — SCRIBE framing mode mitigation |
| OWI-INT-001 | Cross-product failure topology | OPEN — Stage 9 |

---

## §13 — Open Governance Items

**CLOSED this session:**
- PR-LENS-001 PENDING → **APPROVED June 18, 2026**

**Carried from prior sessions (unchanged):**
1. Decision 24 — role→module access matrix (COUNSEL, SCRIBE, LENS `minimumRole` = READ_ONLY placeholder; VIGIL is the only real gate)
2. Decision 25 — access-denial taxonomy gap
3. esbuild GHSA-67mh-4wv8-2f99 — deferred Stage 5+
4. shell-contract Section 1 re-export reconciliation (five synced copies)
5. Module mount/unmount event-type gap
6. ARIA rule maintenance intake path
7. Output Studio provenance reference
8. Notification / push interface absent
9. ~~Two LENS source documents needed~~ — **CLOSED** (authored Session 6, in repo)
10. SOF Logger scoped-query API absent from contract
11. Prompt naming reconciliation
12. `CounselSourceProduct` "AgentOS" casing
13. COUNSEL Decision Record — `deployment_feedback` not emitted (by design)
14. PR-SCRIBE-002/003 not yet authored
15. RTL/jsdom toolchain — 19 moderate dev-only npm advisories
16. `ctx.data` cross-session store (StyleProfile port) — future v1.4 governance decision
17. VIGIL → loader runtime coupling for `ModuleAccessDeniedError` — accepted Session 6
18. SCRIBE intermediate modes (`synthesis`, `framing`) — deferred
19. D1 mode list correction recorded (no AgentOS drafting mode)

**New from Session 7:**
20. **Alert-response `HumanDecisionType` members deferred to shell-contract v1.4.** VIGIL alert responses emit GD-4 `ALERT_*` events only (with `actor`/`actor_name`/`workflow_step_id`). Forcing a mapping to existing `HumanDecisionType` members would produce inaccurate Intelligence Layer training data. Proper alert-response `HumanDecisionType` values (e.g. `ALERT_ACKNOWLEDGED`, `ALERT_RESOLVED`) need a future shell-contract v1.4 governance decision. This is the richest VIGIL Intelligence Layer signal — prioritize in the v1.4 governance batch.
21. **`ALERT_INVESTIGATING` event-type gap.** GD-4 defined no `ALERT_INVESTIGATING` type; `INVESTIGATING` is a local UI transition with no Logger event. If a Logger record of investigation start is wanted, this requires a future contract decision.
22. **LENS core blocked on `03_LENS_Orientation_Module.md`.** The LENS architecture spec must be authored in Claude Chat before the LENS core build session. `lens-explainer` agent class should be confirmed in the spec (registered as Operational; may be more accurate as Analytical).
23. **VIGIL Agent Approval flow and `vigil-approval-agent` remain deferred.** Register and build in the session that implements the Agent Approval Queue live features.
24. **VIGIL live alert feed deferred to Session 9.** `VIGIL_ALERT_ENDPOINT` + scoped Logger query for `AnomalyContext.recentEvents`/`similarAlerts` are configuration changes in the Security Framework wiring session — no VIGIL rewrite.

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.8 (through Session 7). No new external npm packages
in Session 7. `module-vigil` added `@sovereign/api-client` and `@sovereign/data` as
already-linked workspace deps. `module-lens` new workspace (platform stack only).
0 production vulnerabilities.

**Running test totals:** pytest 127 · api-client 143 · data 27 · counsel 91 ·
scribe 86 · vigil 63 · lens 9 = **419 JS + 127 Python = 546 total**.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. State done condition — wait for Project Principal approval.
3. One component per exchange — build, verify, confirm, proceed.
4. Close with handoff — never skip.

**Session 8 context package:**
1. `SOVEREIGN_Platform_Integration_Brief_v1.12.md`
2. `SOVEREIGN_Agent_to_Agent_Briefing.md` ← new — load every session
3. `PROJECT_SUMMARY.md`
4. `AGENT_BACKGROUND_AND_LESSONS_LEARNED.md`
5. `system_prompt.md`
6. `Session_7_Handoff_SOVEREIGN_VIGILCore_LENSScaffold_20260618.md`
7. `shell-contract.ts`
8. `module-lens/src/index.ts`
9. `module-lens/prompts/explainer-system-v1.0.md`
10. `module-scribe/src/index.ts`
11. `module-scribe/src/modes.ts`
12. `docs/vigil_alert_response.md`
13. `docs/vigil_agent_approvals.md`
14. `docs/sovereign_data_CompanionSuite_Specification.md`
15. `docs/03_LENS_Orientation_Module.md` ✅ in repo — authored Session 7 post-session

**Pre-Session 8 Claude Chat actions — all complete:**
- `03_LENS_Orientation_Module.md` ✅ authored and in repo (`docs/`, commit `bd0e20d`)
- PR-LENS-001 ✅ APPROVED June 18, 2026
- Monorepo path ✅ corrected to `~/Developer/sovereign-platform/`
- `SOVEREIGN_Agent_to_Agent_Briefing.md` ✅ add to repo root before Session 8

**Session 8 is fully unblocked.**

**Gather script for Session 8:** Update `gather_session8_context.sh` —
replace all instances of `~/sovereign-platform/` with `~/Developer/sovereign-platform/`
and update the file list to match the 15-file context package above.

---

## §16 — Architectural Patterns (Platform Standard)

All patterns from v1.10 apply. Session 7 additions:

**GD-4 event taxonomy is the authority for VIGIL alert logging.** Alert lifecycle
events (`ALERT_RECEIVED`, `ALERT_ACKNOWLEDGED`, `ALERT_RESOLVED`, `ALERT_ESCALATED`,
`ALERT_FALSE_POSITIVE`, `TRIAGE_ANALYSIS_PRODUCED`) are purpose-built and carry
`actor`/`actor_name`/`workflow_step_id`. Do not force `HUMAN_DECISION` onto alert
responses when the frozen `HumanDecisionType` has no alert-specific member — that
produces inaccurate IL training data. Add proper `HumanDecisionType` values in the
v1.4 governance batch instead.

**Triage Assistant advisory boundary.** The Triage Assistant displays the serving
tier so a degraded (static) brief is never mistaken for a confident AI assessment.
`false_positive_likelihood` in static templates is set to neutral (50%) with an
explicit "degraded, not an assessment" explanation. This is the correct pattern for
any AI-assisted but human-decided workflow.

**Alert Queue null-endpoint handling.** A null `VIGIL_ALERT_ENDPOINT` renders a
configuration notice — explicit that empty ≠ secure. The live feed activates by
configuration change only (Constraint #3). This is the correct pattern for any module
that depends on an external endpoint not yet wired.

---

## §17 — Primary Product Inserts (Summary Reference)

All six governance records INCOMPLETE. All data SYNTHETIC. Governance Clock not activated.

---

## §18 — Companion Suite

### Module Build Status

| Module | Tests | Build Status |
|---|---|---|
| COUNSEL | 91 | **COMPLETE** |
| SCRIBE | 86 | **Core COMPLETE** (intermediate modes Session 8) |
| VIGIL | 63 | **Core COMPLETE** (Agent Approval flow + live feed later sessions) |
| LENS | 9 | **Scaffold BUILT** — core blocked on `03_LENS_Orientation_Module.md` |

**The four-module companion suite is now structurally complete** — all four modules
exist in the monorepo, mount via the ModuleLoader, and have registered agents.

### Registered Agents (9 total)

| Agent ID | Module | Class | Status |
|---|---|---|---|
| `counsel-analyst` | COUNSEL | Analytical | Implemented |
| `scribe-drafter` | SCRIBE | Operational | Implemented |
| `scribe-style-analyst` | SCRIBE | Analytical | Implemented |
| `vigil-triage-analyst` | VIGIL | Monitoring | **Implemented — Session 7** |
| `vigil-approval-agent` | VIGIL | Monitoring | Registered, not yet implemented |
| `lens-explainer` | LENS | Operational* | Registered — scaffold only |
| `lens-orientation` | LENS | Analytical | Registered — scaffold only |

*`lens-explainer` class flag: registered as Operational; may be more accurate as
Analytical (an explainer that only explains). Confirm in `03_LENS_Orientation_Module.md`.

### Approved Prompts (7 total)

| Registry ID | Prompt | Agent | Approved |
|---|---|---|---|
| PR-COUNSEL-001 | Analysis Engine | `counsel-analyst` | June 15, 2026 |
| PR-COUNSEL-002 | Counterargument Mode | `counsel-analyst` | June 16, 2026 |
| PR-COUNSEL-003 | Pre-Mortem Studio | `counsel-analyst` | June 16, 2026 |
| PR-SCRIBE-001 | SCRIBE Drafting Engine | `scribe-drafter` | June 16, 2026 |
| PR-SCRIBE-004 | Style Analysis System | `scribe-style-analyst` | June 17, 2026 |
| PR-VIGIL-001 | VIGIL Triage System | `vigil-triage-analyst` | June 17, 2026 |
| **PR-LENS-001** | **LENS Explainer System** | **`lens-explainer`** | **June 18, 2026** |

Remaining: PR-SCRIBE-002, PR-SCRIBE-003, PR-LENS-002 (not yet authored).

### iCloud Folder — New Files This Version (v1.12)

```
7 - SOVEREIGN/
  SOVEREIGN_Platform_Integration_Brief_v1.12.md    ← replaces v1.11
  SOVEREIGN_Agent_to_Agent_Briefing.md             ← new — add to root
```

**Copy Integration Brief v1.12 to monorepo:**
```
cp ~/Downloads/SOVEREIGN_Platform_Integration_Brief_v1.12.md ~/Developer/sovereign-platform/
```

**Copy Agent Briefing to monorepo:**
```
cp ~/Downloads/SOVEREIGN_Agent_to_Agent_Briefing.md ~/Developer/sovereign-platform/
```

**Commit both:**
```
cd ~/Developer/sovereign-platform
git add SOVEREIGN_Platform_Integration_Brief_v1.12.md SOVEREIGN_Agent_to_Agent_Briefing.md
git commit -m "docs: Integration Brief v1.12 (path fix) + Agent Briefing"
git push
```

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.0–v1.9 | May 31 – June 16, 2026 | See prior versions |
| v1.10 | June 17, 2026 | SCRIBE core (86 tests); VIGIL scaffold (17 tests); PR-SCRIBE-004 + PR-VIGIL-001 approved; module-vigil declared; ctx.data store gap + injectable port; 491 total tests; HEAD 442fda1 |
| v1.11 | June 18, 2026 | VIGIL core (63 tests); LENS scaffold (9 tests); vigil-triage-analyst + lens-explainer + lens-orientation registered; PR-LENS-001 approved; agent registry catch-up; alert-response HumanDecisionType deferred to v1.4; 546 total tests; HEAD 240cf18; SBOM v1.8 |
| **v1.12** | **June 22, 2026** | **Monorepo path corrected to `~/Developer/sovereign-platform/` throughout; Agent-to-Agent Briefing added to repo root and session context package; 03_LENS_Orientation_Module.md confirmed in repo; PR-LENS-001 status confirmed APPROVED; HEAD bd0e20d; no code change; no test change** |

---

*SOVEREIGN Platform Integration Brief v1.12 · June 22, 2026*
*Pre-Decisional · Internal Working Document*

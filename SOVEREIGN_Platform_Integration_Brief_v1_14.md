# SOVEREIGN Platform Integration Brief
## Version 1.14 | June 23, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.13
**Changed this version:** Session 9 complete (D1 — Security Framework live wiring,
configurable/synthetic) · VIGIL_ALERT_ENDPOINT now sourced from platform config ·
SecurityObservabilityQuery port added · module-vigil 63 → 72 tests · platform total
640 → 649 · HEAD updated to 1b02550 · system prompt updated to v3 (current) ·
§8, §11, §13, §14, §15, §18, §19 updated

---

## §1 — What This Document Is

Mandatory context for every SOVEREIGN Platform development session. Load order:
Integration Brief (current version) → `SOVEREIGN_Agent_to_Agent_Briefing.md` →
`system_prompt.md` → product or companion suite spec → prior session handoff →
`shell-contract.ts`.

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
Stage 1 COMPLETE. Terminal point: VIGIL Alert Queue — now endpoint-configurable;
live feed activates by setting `VIGIL_ALERT_ENDPOINT` (configuration change, no rewrite).

**CPMI-VRS AI Governance Standard** — portfolio-wide; NIST AI RMF aligned.

**AgentOS** — MLOps backbone; Security Framework + CPMI-VRS embedded. Human-approval
interface: VIGIL Agent Approval Queue (scaffold built; live features deferred).

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH → [Intelligence Layer, future] → CPMI → AgentOS → NEXUS / APEX → ARIA Suite
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ (parallel human-support layer)
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
   `4d78754f…6836acc2`, unchanged through Sessions 3–9**
9. All prompts registered before build — **10 registered; 7 APPROVED**
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
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← npm workspace root · git main · HEAD 1b02550
├── SOVEREIGN_Platform_Integration_Brief_v1.14.md
├── Agent_Identity_Standard.md         ← v1.1 · all 9 agents · lens-explainer Analytical
├── SOVEREIGN_Agent_to_Agent_Briefing.md
├── sovereign-security/                ← 127 Python tests
├── sovereign-api-client/              ← 143 tests
├── sovereign-data/                    ← 36 tests · v1.1.0
├── sovereign-shell/
│   ├── shell-contract.ts              ← v1.3 (unchanged Sessions 3–9)
│   └── src/register-modules.ts       ← mounts counsel + scribe + vigil + lens
├── module-counsel/                    ← COMPLETE — 91 tests
├── module-scribe/                     ← COMPLETE — 122 tests
├── module-vigil/                      ← CORE COMPLETE — 72 tests
│   └── src/
│       ├── vigil-endpoint.ts          ← NEW S9 · platform config reader
│       └── security-query.ts         ← NEW S9 · SecurityObservabilityQuery port
├── module-lens/                       ← CORE COMPLETE — 58 tests
└── docs/
    ├── 03_LENS_Orientation_Module.md
    ├── vigil_alert_response.md
    ├── vigil_agent_approvals.md
    ├── 02_SCRIBE_Drafting_Workspace.md
    ├── 04_VIGIL_Operator_Dashboard.md
    └── sovereign_data_CompanionSuite_Specification.md  ← at MONOREPO ROOT not docs/
```

**Git:** Branch `main`. HEAD and origin/main at `1b02550` (in sync).
**Absolute path:** `/Users/developmentsystem/Developer/sovereign-platform/`
**Dev server:** `cd ~/Developer/sovereign-platform/sovereign-shell && npm run dev` → `http://localhost:3000`.

---

## §9 — Intelligence Layer Exposure Requirements

| Field | Required On | IL Component | Status |
|---|---|---|---|
| `workflow_step_id` | Every Logger event | All five IL components | Enforced |
| `decision_type` | Every human decision event | Judgment Detection | Enforced |
| All six COUNSEL IL fields | COUNSEL Decision Records | Judgment Detection + Risk Modeler | LIVE — Session 5 |
| Alert-response `decision_type` | VIGIL alert responses | Judgment Detection | DEFERRED — v1.4 |
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
| Document | `document_id` | program | Implemented |
| Vendor | `vendor_id` | program | Implemented |
| StyleProfile | `user_id` | user | LIVE — Session 6 |
| LensExplanation | — | companion | LIVE — Session 8 |

---

## §11 — Current Build Status

### Stage 1 — COMPLETE (127 Python tests)

### Stage 2 — IN PROGRESS

| Deliverable | Tests | Status |
|---|---|---|
| sovereign-data + StyleProfile + LensExplanation | 36 | ✅ Sessions 3, 8 |
| Shell host + dev server | — | ✅ Session 3 |
| COUNSEL core + complete | 91 | ✅ Sessions 4–5 |
| RTL + jsdom layer | — | ✅ Session 5 |
| SCRIBE complete (core + intermediate + voice) | 122 | ✅ Sessions 5–6, 8 |
| VIGIL scaffold | 17 | ✅ Session 6 |
| VIGIL core (Triage + Alert Response) | 63 | ✅ Session 7 |
| LENS scaffold | 9 | ✅ Session 7 |
| LENS core | 58 | ✅ Session 8 |
| **VIGIL Security Framework wiring** | **72** | ✅ **Session 9** |
| VIGIL Agent Approval flow + `vigil-approval-agent` | — | Session 10 |
| Primary product builds (NEXUS, CPMI, etc.) | — | Stage 3+ |

**Total tests passing: 522 JS + 127 Python = 649 total**

### Session 10 priorities:
1. VIGIL Agent Approval flow — build `vigil-approval-agent` + Agent Approval Queue
   live features
2. Consider local LLM (Ollama) as Tier 2 provider demo (R7 resolution path)

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
| R7 | Tier 2 LLM Provider Unresolved | OPEN — resolution path: local LLM via Ollama as Tier 2 provider behind `createSovereignClient()`; demo target Session 10+; AgentOS provider registry Stage 4 |
| R8 | Shell ↔ module contract drift | MITIGATED |
| R9 | NEXUS ATO timeline | OPEN — Stage 5 |
| R10 | AgentOS has no user-facing surface | **CLOSED** — VIGIL |
| R11 | Security Framework alert response absent | **CLOSED** — VIGIL core complete |
| OWI-FP-001 | FLOWPATH elicitation gap | MITIGATED — SCRIBE framing mode |
| OWI-INT-001 | Cross-product failure topology | OPEN — Stage 9 |

---

## §13 — Open Governance Items

**CLOSED this session:**
- VIGIL live alert feed wiring deferred — **CLOSED** (configurable endpoint + query port built Session 9; live activation is a future governance decision)

**Carried (unchanged):**
1. Decision 24 — role→module access matrix
2. Decision 25 — access-denial taxonomy gap
3. esbuild GHSA-67mh-4wv8-2f99 — deferred Stage 5+
4. shell-contract Section 1 re-export reconciliation
5. Module mount/unmount event-type gap
6. ARIA rule maintenance intake path
7. Output Studio provenance reference
8. Notification / push interface absent
9. SOF Logger scoped-query API absent from contract
10. Prompt naming reconciliation
11. `CounselSourceProduct` "AgentOS" casing
12. COUNSEL Decision Record — `deployment_feedback` not emitted (by design)
13. PR-SCRIBE-002/003 not yet authored (optional)
14. RTL/jsdom toolchain — 19 moderate dev-only advisories
15. `ctx.data` cross-session store — future v1.4 governance decision
16. VIGIL → loader runtime coupling — accepted Session 6
17. D1 mode list correction recorded
18. Alert-response `HumanDecisionType` → shell-contract v1.4
19. `ALERT_INVESTIGATING` event-type gap
20. `vigil-approval-agent` deferred — Session 10
21. `sovereign-security/logs/sovereign.jsonl` — consider git-ignoring
22. LENS Pipeline Navigator — `ctx.navigation.currentProduct` absent (shell v1.4)
23. LENS AI Transparency Panel — platform-wide feed (shell v1.4)
24. PR-SCRIBE-002/003 optional dedicated prompts
25. R7 resolution path — local LLM via Ollama (Session 10+)

**New from Session 9:**
26. **Activating live operation is a future governance decision.** When ready: (a) set `VIGIL_ALERT_ENDPOINT` to the real Alert Dispatcher, (b) inject a live `SecurityObservabilityQuery` implementation — both configuration changes, zero VIGIL rewrites. Governance Clock activation requires explicit Project Principal decision in Claude Chat before any live data flows.

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.10 (through Session 9). No new third-party packages.
No version bumps. 0 production vulnerabilities.

**Running test totals:** pytest 127 · api-client 143 · data 36 · counsel 91 ·
scribe 122 · vigil 72 · lens 58 = **522 JS + 127 Python = 649 total**.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. State done condition — wait for Project Principal approval.
3. One component per exchange — build, verify, confirm, proceed.
4. Close with handoff — never skip.

**Session 10 context package:**
1. `SOVEREIGN_Platform_Integration_Brief_v1.14.md`
2. `SOVEREIGN_Agent_to_Agent_Briefing.md`
3. `PROJECT_SUMMARY.md`
4. `AGENT_BACKGROUND_AND_LESSONS_LEARNED.md`
5. `system_prompt.md`
6. `SOVEREIGN_Session9_Handoff.md`
7. `shell-contract.ts`
8. `module-vigil/src/index.ts`
9. `module-vigil/src/useAlertQueue.ts`
10. `module-vigil/src/useAlertResponse.ts`
11. `module-vigil/src/vigil-types.ts`
12. `docs/04_VIGIL_Operator_Dashboard.md`
13. `Agent_Identity_Standard.md`

**Pre-Session 10 Claude Chat actions:**
- Update `SOVEREIGN_Agent_to_Agent_Briefing.md` to reflect Session 9 completion
- Confirm Session 10 scope: VIGIL Agent Approval flow + vigil-approval-agent
- Author `05_VIGIL_Agent_Approval.md` architecture spec before Session 10 opens

**Session 10 is blocked on `05_VIGIL_Agent_Approval.md`** — author in Claude Chat
before opening the build session.

---

## §16 — Architectural Patterns (Platform Standard)

All patterns from v1.13 apply. Session 9 additions:

**Endpoint injectability pattern.** `VIGIL_ALERT_ENDPOINT` is read from platform config
via an isolated reader (`vigil-endpoint.ts`), mirroring the `anthropic-key.ts` pattern.
The existing hook (`useAlertQueue`) was already injection-ready and required no rewrite.
Default null → graceful-degradation notice. This is the platform standard for any module
that depends on an external endpoint not yet live-wired.

**SecurityObservabilityQuery port pattern.** The scoped query fills `AnomalyContext`
via an injectable port, not by reading `ctx.logger` (write-only) or a module-private
store. Synthetic/dev backing this session; live backing injected by configuration.
This is the platform standard for any module that needs to read Security Framework
data — never build a module-private event store, never read ctx.logger.

---

## §17 — Primary Product Inserts (Summary Reference)

All six governance records INCOMPLETE. All data SYNTHETIC. Governance Clock not activated.

---

## §18 — Companion Suite

### Module Build Status

| Module | Tests | Build Status |
|---|---|---|
| COUNSEL | 91 | **COMPLETE** |
| SCRIBE | 122 | **COMPLETE** |
| VIGIL | 72 | **Core + Security Framework wiring COMPLETE** (Agent Approval flow Session 10) |
| LENS | 58 | **CORE COMPLETE** |

### Registered Agents (9 total)

| Agent ID | Module | Class | Status |
|---|---|---|---|
| `counsel-analyst` | COUNSEL | Analytical | Implemented |
| `scribe-drafter` | SCRIBE | Operational | Implemented |
| `scribe-style-analyst` | SCRIBE | Analytical | Implemented |
| `vigil-triage-analyst` | VIGIL | Monitoring | Implemented |
| `vigil-approval-agent` | VIGIL | Monitoring | Registered — deferred to Session 10 |
| `lens-explainer` | LENS | Analytical | Implemented |
| `lens-orientation` | LENS | Analytical | Registered — scaffold only |

### Approved Prompts (7 total — unchanged)

| Registry ID | Prompt | Approved |
|---|---|---|
| PR-COUNSEL-001/002/003 | Analysis, Counterargument, Pre-Mortem | June 15–16, 2026 |
| PR-SCRIBE-001 | Drafting Engine (+ synthesis/framing) | June 16, 2026 |
| PR-SCRIBE-004 | Style Analysis | June 17, 2026 |
| PR-VIGIL-001 | Triage System | June 17, 2026 |
| PR-LENS-001 | Explainer System | June 18, 2026 |

### iCloud Folder — New Files This Version (v1.14)

```
7 - SOVEREIGN/
  SOVEREIGN_Platform_Integration_Brief_v1.14.md    ← replaces v1.13
  SOVEREIGN_Session9_Handoff.md                    ← from Claude Code
  Companion Suite/Governance/
    SBOM_Registry_v1.10_MERGED.md                  ← replaces v1.9
```

**Copy Integration Brief v1.14 to monorepo and commit:**
```bash
cp ~/Downloads/SOVEREIGN_Platform_Integration_Brief_v1_14.md ~/Developer/sovereign-platform/SOVEREIGN_Platform_Integration_Brief_v1.14.md
cd ~/Developer/sovereign-platform
git add SOVEREIGN_Platform_Integration_Brief_v1.14.md
git commit -m "docs: Integration Brief v1.14 (Session 9 complete)"
git push
```

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.0–v1.9 | May 31 – June 16, 2026 | See prior versions |
| v1.10 | June 17, 2026 | SCRIBE core; VIGIL scaffold; 491 total tests |
| v1.11 | June 18, 2026 | VIGIL core; LENS scaffold; 546 total tests |
| v1.12 | June 22, 2026 | Monorepo path corrected; Agent Briefing added |
| v1.13 | June 23, 2026 | Session 8 complete: LENS core, SCRIBE intermediate + voice, 640 tests |
| **v1.14** | **June 23, 2026** | **Session 9 complete: Security Framework wiring (configurable/synthetic), VIGIL 72 tests, 649 total, HEAD 1b02550** |

---

*SOVEREIGN Platform Integration Brief v1.14 · June 23, 2026*
*Pre-Decisional · Internal Working Document*

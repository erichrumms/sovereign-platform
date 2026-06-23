# SOVEREIGN Platform Integration Brief
## Version 1.13 | June 23, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.12
**Changed this version:** Session 8 complete (D1 LENS core, D2 SCRIBE intermediate
modes, D3 Smart Capture) · `@sovereign/data` bumped 1.0.0 → 1.1.0 (`LensExplanation`
entity) · LENS promoted scaffold → core complete (58 tests) · SCRIBE +36 tests (122
total) · `lens-explainer` class corrected Operational → Analytical · PR-LENS-001
confirmed APPROVED in file header · `Agent_Identity_Standard.md` updated ·
two LENS frozen-contract adaptations documented · gather script path fix noted ·
SBOM → v1.9 · total tests 546 → 640 · §8, §11, §13, §14, §15, §16, §18, §19 updated

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
Stage 1 COMPLETE. Terminal point: VIGIL Alert Queue (wired, null-graceful — live feed
activates in Session 9 Security Framework wiring, configuration change only).

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
   `4d78754f…6836acc2`, unchanged through Sessions 3–8**
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
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← npm workspace root · git main · HEAD 6eb8741
├── SOVEREIGN_Platform_Integration_Brief_v1.13.md
├── Agent_Identity_Standard.md         ← all 9 agents recorded · lens-explainer → Analytical
├── SOVEREIGN_Agent_to_Agent_Briefing.md  ← load every session
├── sovereign-security/                ← 127 Python tests
├── sovereign-api-client/              ← 143 tests
├── sovereign-data/                    ← 36 tests · v1.1.0 · LensExplanation entity added
├── sovereign-shell/
│   ├── shell-contract.ts              ← v1.3 (unchanged Sessions 3–8)
│   └── src/ [shell, module-loader, navigation, governance, main.tsx,
│              register-modules.ts]    ← registers counsel + scribe + vigil + lens
├── module-counsel/                    ← COMPLETE — 91 tests
├── module-scribe/                     ← COMPLETE — 122 tests (intermediate modes + voice)
├── module-vigil/                      ← CORE COMPLETE — 63 tests
├── module-lens/                       ← CORE COMPLETE — 58 tests
└── docs/
    ├── 03_LENS_Orientation_Module.md
    ├── vigil_alert_response.md
    ├── vigil_agent_approvals.md
    ├── 02_SCRIBE_Drafting_Workspace.md
    ├── 04_VIGIL_Operator_Dashboard.md
    └── sovereign_data_CompanionSuite_Specification.md  ← lives at MONOREPO ROOT, not docs/
```

**Git:** Branch `main`. HEAD and origin/main at `6eb8741` (in sync).
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
| **LensExplanation** | — | companion | **NEW — Session 8.** Fields: `explanation`, `sources[]`, `confidence` (grounded\|partial), `gaps[]`. Aligned to PR-LENS-001 output shape per Project Principal decision. |

---

## §11 — Current Build Status

### Stage 1 — COMPLETE (127 Python tests)

### Stage 2 — IN PROGRESS

| Deliverable | Tests | Status |
|---|---|---|
| sovereign-data + StyleProfile | 36 | ✅ Sessions 3, 8 |
| Shell host + dev server | — | ✅ Session 3 |
| COUNSEL core + complete | 91 | ✅ Sessions 4–5 |
| RTL + jsdom layer | — | ✅ Session 5 |
| SCRIBE scaffold + core + Style DNA | 86 | ✅ Sessions 5–6 |
| SCRIBE intermediate modes + Smart Capture | 122 | ✅ **Session 8 D2/D3** |
| VIGIL scaffold | 17 | ✅ Session 6 |
| VIGIL core (Triage + Alert Response) | 63 | ✅ Session 7 D1 |
| LENS scaffold | 9 | ✅ Session 7 D2 |
| **LENS core (`lens-explainer`)** | **58** | ✅ **Session 8 D1** |
| VIGIL Agent Approval flow + `vigil-approval-agent` | — | Later session |
| Security Framework live wiring (VIGIL_ALERT_ENDPOINT) | — | Session 9 |

**Total tests passing: 513 JS + 127 Python = 640 total**

### Session 9 priorities:
1. Security Framework live wiring — configure `VIGIL_ALERT_ENDPOINT` + scoped Logger
   query for `AnomalyContext.recentEvents`/`similarAlerts`; VIGIL queue and triage
   activate with zero rewrites (configuration change only — Constraint #3)
2. VIGIL Agent Approval flow + `vigil-approval-agent` registration (or later session
   per roadmap)

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
| R7 | Tier 2 LLM Provider Unresolved | OPEN — **resolution path recorded: local LLM via Ollama as Tier 2 provider behind `createSovereignClient()`; demo target Session 9/10; AgentOS provider registry to follow in Stage 4** |
| R8 | Shell ↔ module contract drift | MITIGATED |
| R9 | NEXUS ATO timeline | OPEN — Stage 5 |
| R10 | AgentOS has no user-facing surface | **CLOSED** — VIGIL |
| R11 | Security Framework alert response absent | **CLOSED** — VIGIL core complete |
| OWI-FP-001 | FLOWPATH elicitation gap | OPEN — SCRIBE framing mode mitigation ✅ |
| OWI-INT-001 | Cross-product failure topology | OPEN — Stage 9 |

---

## §13 — Open Governance Items

**CLOSED this session:**
- LENS core blocked on `03_LENS_Orientation_Module.md` — **CLOSED** (built Session 8 D1)
- `lens-explainer` agent class Operational → **Analytical** — **CLOSED** (corrected Session 8)
- OWI-FP-001 FLOWPATH elicitation gap — **MITIGATED** (SCRIBE framing mode built Session 8)

**Carried from prior sessions (unchanged):**
1. Decision 24 — role→module access matrix (COUNSEL, SCRIBE, LENS `minimumRole` = READ_ONLY placeholder; VIGIL is the only real gate)
2. Decision 25 — access-denial taxonomy gap
3. esbuild GHSA-67mh-4wv8-2f99 — deferred Stage 5+
4. shell-contract Section 1 re-export reconciliation (five synced copies)
5. Module mount/unmount event-type gap
6. ARIA rule maintenance intake path
7. Output Studio provenance reference
8. Notification / push interface absent
9. SOF Logger scoped-query API absent from contract
10. Prompt naming reconciliation
11. `CounselSourceProduct` "AgentOS" casing
12. COUNSEL Decision Record — `deployment_feedback` not emitted (by design)
13. PR-SCRIBE-002/003 not yet authored (not required — synthesis/framing run under PR-SCRIBE-001)
14. RTL/jsdom toolchain — 19 moderate dev-only npm advisories
15. `ctx.data` cross-session store (StyleProfile port) — future v1.4 governance decision
16. VIGIL → loader runtime coupling for `ModuleAccessDeniedError` — accepted Session 6
17. D1 mode list correction recorded (no AgentOS drafting mode)
18. Alert-response `HumanDecisionType` members deferred to shell-contract v1.4
19. `ALERT_INVESTIGATING` event-type gap
20. VIGIL Agent Approval flow and `vigil-approval-agent` remain deferred
21. VIGIL live alert feed deferred to Session 9
22. `sovereign-security/logs/sovereign.jsonl` modified by Python test runs — consider git-ignoring

**New from Session 8:**
23. **LENS Pipeline Navigator — `ctx.navigation.currentProduct` absent from shell contract.** Navigator derives product from `currentPath` + product picker. If `navigation.currentProduct` is wanted as a shell export, that is a shell-contract v1.4 governance decision.
24. **LENS AI Transparency Panel — `ctx.logger` is write-only.** Panel renders a LENS-owned session capture with an injectable seam for a future platform-wide feed. A platform-wide session activity feed is a shell-contract v1.4 governance decision.
25. **PR-SCRIBE-002/003 (dedicated synthesis/framing prompts)** — optional; synthesis/framing currently run under PR-SCRIBE-001. Author in Claude Chat if dedicated prompts are wanted; re-binding is a registry change, not a rewrite.
26. **R7 resolution path** — local LLM via Ollama as Tier 2 provider behind `createSovereignClient()`; demo target Session 9/10; AgentOS provider registry to follow in Stage 4.

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.9 (through Session 8). No new third-party packages.
`@sovereign/data` bumped 1.0.0 → 1.1.0 (`LensExplanation` entity). Web Speech API
is browser-native — no package. 0 production vulnerabilities.

**Running test totals:** pytest 127 · api-client 143 · data 36 · counsel 91 ·
scribe 122 · vigil 63 · lens 58 = **513 JS + 127 Python = 640 total**.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. State done condition — wait for Project Principal approval.
3. One component per exchange — build, verify, confirm, proceed.
4. Close with handoff — never skip.

**Session 9 context package:**
1. `SOVEREIGN_Platform_Integration_Brief_v1.13.md`
2. `SOVEREIGN_Agent_to_Agent_Briefing.md`
3. `PROJECT_SUMMARY.md`
4. `AGENT_BACKGROUND_AND_LESSONS_LEARNED.md`
5. `system_prompt.md`
6. `Session_8_Handoff_SOVEREIGN_[date].md`
7. `shell-contract.ts`
8. `module-vigil/src/index.ts`
9. `module-vigil/src/useAlertQueue.ts`
10. `sovereign-security/` — key Framework files (Logger, AnomalyDetector, AlertDispatcher)
11. `docs/04_VIGIL_Operator_Dashboard.md`

**Pre-Session 9 Claude Chat actions:**
- Update `SOVEREIGN_Agent_to_Agent_Briefing.md` to reflect Session 8 completion
- Update gather script — fix `sovereign_data_CompanionSuite_Specification.md` path
  (lives at monorepo root, not `docs/`)
- Confirm Session 9 scope with Project Principal (Security Framework live wiring vs.
  VIGIL Agent Approval flow vs. both)

**Session 9 is unblocked.**

---

## §16 — Architectural Patterns (Platform Standard)

All patterns from v1.12 apply. Session 8 additions:

**Intermediate prose modes have no product-schema validation.** `synthesis` and
`framing` produce human carry-forward prose, not canonical product payloads. Do not
attempt schema validation against a product intake schema on the intermediate path.
The Export gate is absent by design.

**Voice capture is transcription only.** `VOICE_CAPTURE_COMPLETED` fires when a
non-empty transcript is captured; the LLM call (draft/synthesis) fires separately
on the existing Generate/Synthesize confirmation step. No audio leaves the device.
Gate 1 disclosure is mandatory on the voice surface.

**LENS explanation output is schema-validated before display.** `validateLensExplanation`
runs against the `LensExplanation` entity before any explanation is shown to the user.
The `confidence` field uses the grounded/partial vocabulary (not high/medium/low) to
match the PR-LENS-001 approved output shape.

**Static tiers are honest.** Static fallback content labels itself explicitly as
degraded (not a confident AI assessment). `false_positive_likelihood` in static
templates carries an explicit "degraded, not an assessment" explanation. This is
the platform standard for any AI-assisted but human-decided workflow.

---

## §17 — Primary Product Inserts (Summary Reference)

All six governance records INCOMPLETE. All data SYNTHETIC. Governance Clock not activated.

---

## §18 — Companion Suite

### Module Build Status

| Module | Tests | Build Status |
|---|---|---|
| COUNSEL | 91 | **COMPLETE** |
| SCRIBE | 122 | **COMPLETE** (intermediate modes + Smart Capture added Session 8) |
| VIGIL | 63 | **Core COMPLETE** (Agent Approval flow + live feed later sessions) |
| LENS | 58 | **CORE COMPLETE** (Session 8) |

**The four-module companion suite is fully operational** — all four modules built to
core, mounting via ModuleLoader, with registered agents and approved prompts.

### Registered Agents (9 total)

| Agent ID | Module | Class | Status |
|---|---|---|---|
| `counsel-analyst` | COUNSEL | Analytical | Implemented |
| `scribe-drafter` | SCRIBE | Operational | Implemented |
| `scribe-style-analyst` | SCRIBE | Analytical | Implemented |
| `vigil-triage-analyst` | VIGIL | Monitoring | Implemented |
| `vigil-approval-agent` | VIGIL | Monitoring | Registered, not yet implemented |
| `lens-explainer` | LENS | **Analytical** | **Implemented — Session 8** |
| `lens-orientation` | LENS | Analytical | Registered — scaffold only |

### Approved Prompts (7 total)

| Registry ID | Prompt | Agent | Approved |
|---|---|---|---|
| PR-COUNSEL-001 | Analysis Engine | `counsel-analyst` | June 15, 2026 |
| PR-COUNSEL-002 | Counterargument Mode | `counsel-analyst` | June 16, 2026 |
| PR-COUNSEL-003 | Pre-Mortem Studio | `counsel-analyst` | June 16, 2026 |
| PR-SCRIBE-001 | SCRIBE Drafting Engine (+ synthesis/framing) | `scribe-drafter` | June 16, 2026 |
| PR-SCRIBE-004 | Style Analysis System | `scribe-style-analyst` | June 17, 2026 |
| PR-VIGIL-001 | VIGIL Triage System | `vigil-triage-analyst` | June 17, 2026 |
| PR-LENS-001 | LENS Explainer System | `lens-explainer` | June 18, 2026 |

Remaining unauthored: PR-SCRIBE-002, PR-SCRIBE-003 (optional — not required),
PR-LENS-002 (Pipeline Navigator is static — no LLM call; deferred indefinitely).

### iCloud Folder — New Files This Version (v1.13)

```
7 - SOVEREIGN/
  SOVEREIGN_Platform_Integration_Brief_v1.13.md       ← replaces v1.12
  SOVEREIGN_Session8_Handoff.md                       ← from Claude Code
  SOVEREIGN_Agent_to_Agent_Briefing.md                ← update before Session 9
  Companion Suite/Governance/
    SBOM_Registry_v1.9_MERGED.md                      ← replaces v1.8
    Prompt_Approvals_Session8.md                      ← no new approvals; record confirmation
```

**Copy Integration Brief v1.13 to monorepo:**
```bash
cp ~/Downloads/SOVEREIGN_Platform_Integration_Brief_v1.13.md ~/Developer/sovereign-platform/
```

**Commit:**
```bash
cd ~/Developer/sovereign-platform
git add SOVEREIGN_Platform_Integration_Brief_v1.13.md
git commit -m "docs: Integration Brief v1.13 (Session 8 complete)"
git push
```

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.0–v1.9 | May 31 – June 16, 2026 | See prior versions |
| v1.10 | June 17, 2026 | SCRIBE core; VIGIL scaffold; PR-SCRIBE-004 + PR-VIGIL-001 approved; 491 total tests |
| v1.11 | June 18, 2026 | VIGIL core; LENS scaffold; vigil-triage-analyst + lens agents registered; PR-LENS-001 approved; 546 total tests |
| v1.12 | June 22, 2026 | Monorepo path corrected; Agent Briefing added; 03_LENS spec confirmed; no code change |
| **v1.13** | **June 23, 2026** | **Session 8 complete: LENS core (58 tests), SCRIBE intermediate modes + Smart Capture (122 tests), LensExplanation entity, lens-explainer → Analytical, SBOM v1.9, 640 total tests, HEAD 6eb8741** |

---

*SOVEREIGN Platform Integration Brief v1.13 · June 23, 2026*
*Pre-Decisional · Internal Working Document*

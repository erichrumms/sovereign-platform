# SOVEREIGN Platform Integration Brief
## Version 1.17 | June 23, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.16
**Changed this version:** Five Local LLM governance decisions recorded (D1–D5) ·
R7 CLOSED for demo scope · §11, §12, §13, §19 updated

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
Stage 1 COMPLETE. VIGIL Alert Queue endpoint-configurable (Session 9); VIGIL Agent
Approval Queue port-configurable (Session 10). Both activate by configuration when
live backings are injected — zero rewrites required.

**CPMI-VRS AI Governance Standard** — portfolio-wide; NIST AI RMF aligned.

**AgentOS** — MLOps backbone; Security Framework + CPMI-VRS embedded. Live
`AgentApprovalPort` injectable by configuration when AgentOS A2A is built.

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH → [Intelligence Layer, future] → CPMI → AgentOS → NEXUS / APEX → ARIA Suite
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ — ALL COMPLETE
‖ PPBE — future workflow layer across pipeline products · deferred Stage 5+
```

---

## §5 — Governance Role Assignments (Permanent)

| Role | Assigned To | Status |
|---|---|---|
| CPMI Product Owner | Project Principal | Stage 3 SATISFIED |
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
   **v1.4 · SHA-256: `1a557e3ba3747ab8b922649a42602df8fa4aec16ace10d9eabd9f48acbb435d9`**
9. All prompts registered before build — **8 APPROVED**
10. All agents registered before build — **8 companion-suite agents registered**
11. **Five synced copies of shared artifacts** — changes must propagate to all copies

---

## §7 — CPMI Enhanced Monitoring

CPMI operates at **0.7× standard anomaly threshold** — architectural constant.
`CPMI_DRIFT_DETECTED` alerts receive elevated priority in VIGIL. CPMI checklist
keeps the reasoning-quality boundary (pattern, not correctness).

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← npm workspace root · git main · HEAD 3d42511
├── SOVEREIGN_Platform_Integration_Brief_v1.17.md
├── Agent_Identity_Standard.md         ← v1.1 · 8 companion agents
├── SOVEREIGN_Agent_to_Agent_Briefing.md  ← updated June 23, 2026
├── sovereign-security/                ← 127 Python tests
├── sovereign-api-client/              ← 143 tests
├── sovereign-data/                    ← 36 tests · v1.1.0
├── sovereign-shell/
│   ├── shell-contract.ts              ← v1.4 · SHA 1a557e3b…b435d9
│   └── src/register-modules.ts
├── module-counsel/                    ← COMPLETE — 91 tests
├── module-scribe/                     ← COMPLETE — 122 tests
├── module-vigil/                      ← COMPLETE — 113 tests
├── module-lens/                       ← COMPLETE — 58 tests
└── docs/
    ├── 02_SCRIBE_Drafting_Workspace.md
    ├── 03_LENS_Orientation_Module.md
    ├── 04_VIGIL_Operator_Dashboard.md
    ├── 05_VIGIL_Agent_Approval.md
    ├── 06_LocalLLM_Architecture.md    ← decisions recorded in §11
    ├── 07_LocalLLM_Decision_Framework.md
    ├── vigil_alert_response.md
    ├── vigil_agent_approvals.md
    └── sovereign_data_CompanionSuite_Specification.md  ← at MONOREPO ROOT
```

**Git:** Branch `main`. HEAD and origin/main at `3d42511` (in sync).
**Absolute path:** `/Users/developmentsystem/Developer/sovereign-platform/`

---

## §9 — Intelligence Layer Exposure Requirements

| Field | Required On | IL Component | Status |
|---|---|---|---|
| `workflow_step_id` | Every Logger event | All five IL components | Enforced |
| `decision_type` | Every human decision event | Judgment Detection | Enforced |
| `AGENT_APPROVAL` | Agent approval decisions | Judgment Detection | LIVE — Session 10 |
| All six COUNSEL IL fields | COUNSEL Decision Records | Judgment Detection + Risk Modeler | LIVE — Session 5 |
| Alert-response `decision_type` | VIGIL alert responses | Judgment Detection | DEFERRED |
| `INFERENCE_CALL` events | Local LLM inference | All five IL components | DEFERRED — Stage 4 |
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
| HumanDecisionType | — | governance | 11 members as of Session 10 |
| PPBE entities (6) | see PPBE architecture doc | program | PENDING — D-P3 required |

---

## §11 — Current Build Status

### Stage 1 — COMPLETE (127 Python tests)

### Stage 2 — COMPLETE

**Total tests passing: 563 JS + 127 Python = 690 total**

### Stage 3 — NEXT (CPMI-VRS elevation)

Session 11 scope to be confirmed by Project Principal.

### Stage 4 — Local LLM Infrastructure (Decisions Recorded)

| Decision | Resolution | Recorded |
|---|---|---|
| D1 — Agent classification | **Infrastructure component** — SBOM entry only, no agent registry entry. Provider swapping is a configuration change. | June 23, 2026 |
| D2 — Tier 2 provider | **Ollama on Mac Mini M4** — infrastructure built in Stage 4; Anthropic API remains primary through demo. Local inference activates by configuration when a client or use case requires it. Model: 13B parameter, Q4/Q5 quantization. Three-tier fallback: live Ollama → cached → static. | June 23, 2026 |
| D3 — Deployment target | **Mac Mini M4 for development and demo.** GovCloud deferred until first federal client requires it. | June 23, 2026 |
| D4 — Fine-tuning scope | **Inference-only** — frozen base model weights. Fine-tuning deferred to Stage 10 when Intelligence Layer corpus is ready. | June 23, 2026 |
| D5 — Agent Operator Scope | **Deferred until live inference activation.** Agent Operator Scope document updated with local model alert SLA before first real inference through Ollama in client/production context. | June 23, 2026 |

**Architecture references:** `docs/06_LocalLLM_Architecture.md` ·
`docs/07_LocalLLM_Decision_Framework.md`

### Stage 5+ — Future Integrations

| Integration | Status |
|---|---|
| PPBE | Architecture authored · 6 governance decisions required · deferred Stage 5+ |

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
| **R7** | **Tier 2 LLM Provider Unresolved** | **CLOSED for demo scope** — all five decisions recorded June 23, 2026. Infrastructure built in Stage 4. Anthropic API primary through demo. Local inference activates by configuration when client requires it. |
| R8 | Shell ↔ module contract drift | MITIGATED |
| R9 | NEXUS ATO timeline | OPEN — Stage 5 |
| R10 | AgentOS has no user-facing surface | **CLOSED** — VIGIL |
| R11 | Security Framework alert response absent | **CLOSED** — VIGIL complete |
| R12 | PPBE integration deferred | OPEN — architecture authored; 6 decisions required; Stage 5+ |
| OWI-FP-001 | FLOWPATH elicitation gap | MITIGATED — SCRIBE framing |
| OWI-INT-001 | Cross-product failure topology | OPEN — Stage 9 |

---

## §13 — Open Governance Items

**CLOSED this version:**
- R7 five Local LLM decisions — **CLOSED** (all five recorded June 23, 2026)

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
15. `ctx.data` cross-session store — future governance decision
16. VIGIL → loader runtime coupling — accepted Session 6
17. D1 mode list correction recorded
18. Alert-response `HumanDecisionType` members — batch into next contract change
19. `ALERT_INVESTIGATING` event-type gap
20. ~~`sovereign.jsonl` git-ignore~~ — **CLOSED** (Session 10)
21. LENS Pipeline Navigator — `ctx.navigation.currentProduct` (shell future)
22. LENS AI Transparency Panel — platform-wide feed (shell future)
23. PR-SCRIBE-002/003 optional dedicated prompts
24. ~~R7 five LLM decisions~~ — **CLOSED** (this version)
25. Activating live operation — future governance decision; Governance Clock OFF
26. Legacy `AgentApprovalQueue.tsx` stub — removable in future cleanup
27. Live `AgentApprovalPort` — inject when AgentOS A2A is built
28. Agent Operator Scope — update with local model alert SLA before live inference activates (D5)
29. PPBE integration — 6 governance decisions required before Phase I opens (D-P1 through D-P6)

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.11 (through Session 10). No new third-party packages.
Shell contract v1.4 hash of record: `1a557e3b…b435d9`.
0 production vulnerabilities.

**Running test totals:** pytest 127 · api-client 143 · data 36 · counsel 91 ·
scribe 122 · vigil 113 · lens 58 = **563 JS + 127 Python = 690 total**.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. State done condition — wait for Project Principal approval.
3. One component per exchange — build, verify, confirm, proceed.
4. Close with handoff — never skip.

**Shell contract hash of record: `1a557e3b…b435d9` (v1.4)**

**Session 11 context package:**
1. `SOVEREIGN_Platform_Integration_Brief_v1.17.md`
2. `SOVEREIGN_Agent_to_Agent_Briefing.md`
3. `PROJECT_SUMMARY.md`
4. `AGENT_BACKGROUND_AND_LESSONS_LEARNED.md`
5. `system_prompt.md`
6. `SOVEREIGN_Session10_Handoff.md`
7. `shell-contract.ts`
8. `Agent_Identity_Standard.md`

**Pre-Session 11 Claude Chat actions:**
- Confirm Session 11 scope with Project Principal — Stage 3 kickoff
- Author Session 11 opening prompt
- Update gather script for Session 11 file list

**Session 11 scope: Stage 3 — CPMI-VRS elevation.**

---

## §16 — Architectural Patterns (Platform Standard)

All patterns from v1.16 apply.

**Local LLM provider pattern (recorded for Stage 4):** The local LLM registers as
Provider B inside `sovereign-api-client`. No product touches the local inference
endpoint directly. Routing is `data_classification`-driven — CUI routes to local,
unclassified routes to Anthropic. Both providers return the same response schema.
Provider swapping is a configuration change; no product rewrites required. The
runtime is an infrastructure component — SBOM entry only, no agent registry entry.
Anthropic API remains primary through the demo period.

**PPBE architectural principle:** PPBE is a governed workflow layer, not a new
product. It inherits all platform infrastructure. No independent security, governance,
or audit systems. Standing Constraint 1 applies in full.

---

## §17 — Primary Product Inserts (Summary Reference)

All six governance records INCOMPLETE. All data SYNTHETIC. Governance Clock not
activated. Stage 3 (CPMI-VRS) is next.

---

## §18 — Companion Suite — FULLY COMPLETE

### Module Build Status

| Module | Tests | Status |
|---|---|---|
| COUNSEL | 91 | **COMPLETE** |
| SCRIBE | 122 | **COMPLETE** |
| VIGIL | 113 | **COMPLETE** |
| LENS | 58 | **COMPLETE** |

### Registered Agents (8)

| Agent ID | Module | Class | Status |
|---|---|---|---|
| `counsel-analyst` | COUNSEL | Analytical | Implemented |
| `scribe-drafter` | SCRIBE | Operational | Implemented |
| `scribe-style-analyst` | SCRIBE | Analytical | Implemented |
| `vigil-triage-analyst` | VIGIL | Monitoring | Implemented |
| `vigil-approval-agent` | VIGIL | Monitoring | Implemented |
| `lens-explainer` | LENS | Analytical | Implemented |
| `lens-orientation` | LENS | Analytical | Registered — scaffold only |

### Approved Prompts (8)

| ID | Prompt | Approved |
|---|---|---|
| PR-COUNSEL-001/002/003 | Analysis, Counterargument, Pre-Mortem | June 15–16, 2026 |
| PR-SCRIBE-001 | Drafting Engine | June 16, 2026 |
| PR-SCRIBE-004 | Style Analysis | June 17, 2026 |
| PR-VIGIL-001 | Triage System | June 17, 2026 |
| PR-VIGIL-002 | Approval System | June 23, 2026 |
| PR-LENS-001 | Explainer System | June 18, 2026 |

### iCloud — New Files This Version (v1.17)

```
7 - SOVEREIGN/
  SOVEREIGN_Platform_Integration_Brief_v1.17.md    ← replaces v1.16
```

**Copy to monorepo and commit:**
```bash
cp ~/Downloads/SOVEREIGN_Platform_Integration_Brief_v1_17.md \
   ~/Developer/sovereign-platform/SOVEREIGN_Platform_Integration_Brief_v1.17.md
cd ~/Developer/sovereign-platform
git add SOVEREIGN_Platform_Integration_Brief_v1.17.md
git commit -m "docs: Integration Brief v1.17 (Local LLM decisions D1-D5 recorded, R7 closed)"
git push
```

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.0–v1.12 | May 31 – June 22, 2026 | See prior versions |
| v1.13 | June 23, 2026 | Session 8: LENS core, SCRIBE complete, 640 tests |
| v1.14 | June 23, 2026 | Session 9: Security Framework wiring, 649 tests |
| v1.15 | June 23, 2026 | Session 10: shell-contract v1.4, VIGIL complete, 690 tests, Stage 2 COMPLETE |
| v1.16 | June 23, 2026 | PPBE integration architecture recorded (R12) |
| **v1.17** | **June 23, 2026** | **Local LLM decisions D1–D5 recorded · R7 CLOSED for demo scope · Anthropic API primary through demo · Ollama infrastructure built Stage 4 · inference-only · fine-tuning deferred Stage 10** |

---

*SOVEREIGN Platform Integration Brief v1.17 · June 23, 2026*
*Pre-Decisional · Internal Working Document*

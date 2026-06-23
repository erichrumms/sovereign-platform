# SOVEREIGN Platform Integration Brief
## Version 1.15 | June 23, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.14
**Changed this version:** Session 10 complete (D1 shell-contract v1.3→v1.4 / GD-6,
D2 VIGIL Agent Approval Flow) · shell-contract v1.4 hash of record: `1a557e3b…b435d9` ·
`AGENT_APPROVAL` HumanDecisionType added · `vigil-approval-agent` implemented ·
PR-VIGIL-002 APPROVED · module-vigil 72→113 tests · platform total 649→690 ·
companion suite fully complete · HEAD updated to ca44fa7 · §6, §8, §11, §13, §14,
§15, §18, §19 updated

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
   **(replaces v1.3 hash `4d78754f…6836acc2`, retired Session 10)**
9. All prompts registered before build — **8 APPROVED**
   (PR-COUNSEL-001/002/003, PR-SCRIBE-001, PR-SCRIBE-004, PR-VIGIL-001,
   PR-VIGIL-002, PR-LENS-001)
10. All agents registered before build — **8 companion-suite agents registered**
11. **Five synced copies of shared artifacts** — changes must propagate to all copies

---

## §7 — CPMI Enhanced Monitoring

CPMI operates at **0.7× standard anomaly threshold** — architectural constant.
`CPMI_DRIFT_DETECTED` alerts receive elevated priority in VIGIL (P1/P2 regardless of
underlying severity). CPMI checklist in the Triage Assistant keeps the
reasoning-quality boundary (pattern, not correctness).

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← npm workspace root · git main · HEAD ca44fa7
├── SOVEREIGN_Platform_Integration_Brief_v1.15.md
├── Agent_Identity_Standard.md         ← v1.1 · 8 companion agents
├── SOVEREIGN_Agent_to_Agent_Briefing.md
├── sovereign-security/                ← 127 Python tests
├── sovereign-api-client/              ← 143 tests
├── sovereign-data/                    ← 36 tests · v1.1.0 · HumanDecisionType 11 members
├── sovereign-shell/
│   ├── shell-contract.ts              ← v1.4 · SHA 1a557e3b…b435d9 (GD-6, Session 10)
│   └── src/register-modules.ts
├── module-counsel/                    ← COMPLETE — 91 tests
├── module-scribe/                     ← COMPLETE — 122 tests
├── module-vigil/                      ← COMPLETE — 113 tests
│   └── src/
│       ├── vigil-endpoint.ts
│       ├── security-query.ts
│       ├── approval-contract.ts
│       ├── approval-port.ts
│       ├── approval-engine.ts
│       ├── useApprovalBrief.ts
│       ├── useApprovalQueue.ts
│       └── useApprovalDecision.ts
├── module-lens/                       ← COMPLETE — 58 tests
└── docs/
    ├── 03_LENS_Orientation_Module.md
    ├── 04_VIGIL_Operator_Dashboard.md
    ├── 05_VIGIL_Agent_Approval.md
    ├── 06_LocalLLM_Architecture.md    ← pending Project Principal decision
    ├── 07_LocalLLM_Decision_Framework.md  ← pending Project Principal decision
    ├── vigil_alert_response.md
    ├── vigil_agent_approvals.md
    ├── 02_SCRIBE_Drafting_Workspace.md
    └── sovereign_data_CompanionSuite_Specification.md  ← at MONOREPO ROOT not docs/
```

**Git:** Branch `main`. HEAD and origin/main at `ca44fa7` (in sync).
**Absolute path:** `/Users/developmentsystem/Developer/sovereign-platform/`
**Dev server:** `cd ~/Developer/sovereign-platform/sovereign-shell && npm run dev`
→ `http://localhost:3000`

---

## §9 — Intelligence Layer Exposure Requirements

| Field | Required On | IL Component | Status |
|---|---|---|---|
| `workflow_step_id` | Every Logger event | All five IL components | Enforced |
| `decision_type` | Every human decision event | Judgment Detection | Enforced |
| `AGENT_APPROVAL` | Agent approval decisions | Judgment Detection | **LIVE — Session 10** |
| All six COUNSEL IL fields | COUNSEL Decision Records | Judgment Detection + Risk Modeler | LIVE — Session 5 |
| Alert-response `decision_type` | VIGIL alert responses | Judgment Detection | DEFERRED — future v1.x |
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
| HumanDecisionType | — | governance | **11 members as of Session 10 (AGENT_APPROVAL added)** |

---

## §11 — Current Build Status

### Stage 1 — COMPLETE (127 Python tests)

### Stage 2 — **COMPLETE**

| Module | Tests | Status |
|---|---|---|
| sovereign-data + entities | 36 | ✅ |
| sovereign-api-client | 143 | ✅ |
| Shell host + dev server | — | ✅ |
| COUNSEL | 91 | ✅ Complete |
| SCRIBE | 122 | ✅ Complete (intermediate modes + Smart Capture) |
| VIGIL | 113 | ✅ **Complete — Session 10** |
| LENS | 58 | ✅ Complete |

**Total tests passing: 563 JS + 127 Python = 690 total**

**The four-module companion suite is fully complete. Stage 2 is COMPLETE.**

### Stage 3 — NEXT

Stage 3 is CPMI-VRS elevation — the governance certification layer. This is the first
primary product build stage. Before Stage 3 opens, the five Local LLM decisions
(docs/06_LocalLLM_Architecture.md §8.1) must be reviewed and either recorded or
formally deferred. Session 11 scope to be confirmed by Project Principal.

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
| R7 | Tier 2 LLM Provider Unresolved | OPEN — architecture and decision framework authored (docs/06 + 07); five decisions pending Project Principal |
| R8 | Shell ↔ module contract drift | MITIGATED |
| R9 | NEXUS ATO timeline | OPEN — Stage 5 |
| R10 | AgentOS has no user-facing surface | **CLOSED** — VIGIL |
| R11 | Security Framework alert response absent | **CLOSED** — VIGIL complete |
| OWI-FP-001 | FLOWPATH elicitation gap | MITIGATED — SCRIBE framing |
| OWI-INT-001 | Cross-product failure topology | OPEN — Stage 9 |

---

## §13 — Open Governance Items

**CLOSED this session:**
- `vigil-approval-agent` deferred — **CLOSED** (implemented Session 10)
- VIGIL Agent Approval flow deferred — **CLOSED** (built Session 10)
- AGENT_APPROVAL HumanDecisionType gap (approval context) — **CLOSED** (GD-6)

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
18. Alert-response `HumanDecisionType` members — still deferred; consider batching into next contract change now that v1.4 set the precedent
19. `ALERT_INVESTIGATING` event-type gap
20. `sovereign-security/logs/sovereign.jsonl` — consider git-ignoring
21. LENS Pipeline Navigator — `ctx.navigation.currentProduct` (shell future)
22. LENS AI Transparency Panel — platform-wide feed (shell future)
23. PR-SCRIBE-002/003 optional dedicated prompts
24. R7 — local LLM five decisions pending Project Principal
25. Activating live operation — future governance decision
26. Legacy `AgentApprovalQueue.tsx` stub — superseded, safe to remove in cleanup

**New from Session 10:**
27. **Live `AgentApprovalPort`** — inject when AgentOS A2A is built; no VIGIL rewrite (Constraint #3).
28. **Five Local LLM decisions (R7)** — must be reviewed and recorded or formally deferred before Stage 3 opens. See `docs/06_LocalLLM_Architecture.md` §8.1.

---

## §14 — SBOM Status

Current: `SBOM_Registry.md` v1.11 (through Session 10). No new third-party packages.
Shell contract v1.4 hash of record: `1a557e3b…b435d9`.
`@sovereign/data` HumanDecisionType: 11 members.
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
Every session must verify both copies match this hash before any build work begins.

**Session 11 context package:**
1. `SOVEREIGN_Platform_Integration_Brief_v1.15.md`
2. `SOVEREIGN_Agent_to_Agent_Briefing.md`
3. `PROJECT_SUMMARY.md`
4. `AGENT_BACKGROUND_AND_LESSONS_LEARNED.md`
5. `system_prompt.md`
6. `SOVEREIGN_Session10_Handoff.md`
7. `shell-contract.ts`
8. `Agent_Identity_Standard.md`

**Pre-Session 11 Claude Chat actions:**
- Confirm Session 11 scope with Project Principal — Stage 3 kickoff vs. demo
  hardening vs. Local LLM five-decision governance session
- Update `SOVEREIGN_Agent_to_Agent_Briefing.md` to reflect Session 10 completion
  and shell-contract v1.4 hash
- Record or formally defer the five Local LLM decisions (R7)

**Session 11 scope is open — Project Principal decides.**

---

## §16 — Architectural Patterns (Platform Standard)

All patterns from v1.14 apply. Session 10 additions:

**Agent Approval Port pattern.** The `AgentApprovalPort` is injectable — synthetic/dev
backing this session, live AgentOS backing by configuration. This is the same pattern
as the `SecurityObservabilityQuery` port (Session 9). No VIGIL rewrite when the live
port is injected. Platform standard: all external data sources enter modules via
injectable ports, never direct API calls.

**Gate 2 fail-closed on approval decisions.** A failed Logger emit blocks the
approval decision — the same pattern as alert responses in `useAlertResponse.ts`.
An undocumented approval is as ungoverned as no approval. Platform standard: every
human decision event must be logged before the action it authorizes proceeds.

**Shell contract change governance.** GD-6 established the precedent for v1.4
changes: version increment, changelog entry, impact assessment, dual-copy SHA
verification, Constraint #11 propagation to all synced copies. Future contract changes
follow the same process. The `@sovereign/data` shared-types sync is a required step
for any HumanDecisionType or SovereignEventType addition.

---

## §17 — Primary Product Inserts (Summary Reference)

All six governance records INCOMPLETE. All data SYNTHETIC. Governance Clock not
activated. Stage 3 (CPMI-VRS) is next.

---

## §18 — Companion Suite — FULLY COMPLETE

### Module Build Status

| Module | Tests | Build Status |
|---|---|---|
| COUNSEL | 91 | **COMPLETE** |
| SCRIBE | 122 | **COMPLETE** |
| VIGIL | 113 | **COMPLETE — Session 10** |
| LENS | 58 | **COMPLETE** |

**Stage 2 is complete. The four-module companion suite is fully operational.**

### Registered Agents (8 companion-suite agents)

| Agent ID | Module | Class | Status |
|---|---|---|---|
| `counsel-analyst` | COUNSEL | Analytical | Implemented |
| `scribe-drafter` | SCRIBE | Operational | Implemented |
| `scribe-style-analyst` | SCRIBE | Analytical | Implemented |
| `vigil-triage-analyst` | VIGIL | Monitoring | Implemented |
| `vigil-approval-agent` | VIGIL | Monitoring | **Implemented — Session 10** |
| `lens-explainer` | LENS | Analytical | Implemented |
| `lens-orientation` | LENS | Analytical | Registered — scaffold only |

### Approved Prompts (8 total)

| Registry ID | Prompt | Approved |
|---|---|---|
| PR-COUNSEL-001/002/003 | Analysis, Counterargument, Pre-Mortem | June 15–16, 2026 |
| PR-SCRIBE-001 | Drafting Engine (+ synthesis/framing) | June 16, 2026 |
| PR-SCRIBE-004 | Style Analysis | June 17, 2026 |
| PR-VIGIL-001 | Triage System | June 17, 2026 |
| PR-VIGIL-002 | Approval System | **June 23, 2026** |
| PR-LENS-001 | Explainer System | June 18, 2026 |

### iCloud Folder — New Files This Version (v1.15)

```
7 - SOVEREIGN/
  SOVEREIGN_Platform_Integration_Brief_v1.15.md    ← replaces v1.14
  SOVEREIGN_Session10_Handoff.md                   ← from Claude Code
  Companion Suite/Governance/
    SBOM_Registry_v1.11_MERGED.md                  ← replaces v1.10
```

**Copy Integration Brief v1.15 to monorepo and commit:**
```bash
cp ~/Downloads/SOVEREIGN_Platform_Integration_Brief_v1_15.md \
   ~/Developer/sovereign-platform/SOVEREIGN_Platform_Integration_Brief_v1.15.md
cd ~/Developer/sovereign-platform
git add SOVEREIGN_Platform_Integration_Brief_v1.15.md
git commit -m "docs: Integration Brief v1.15 (Session 10 complete — companion suite fully complete)"
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
| v1.13 | June 23, 2026 | Session 8: LENS core, SCRIBE complete, 640 tests |
| v1.14 | June 23, 2026 | Session 9: Security Framework wiring, 649 tests |
| **v1.15** | **June 23, 2026** | **Session 10 complete: shell-contract v1.4 (GD-6, hash 1a557e3b…b435d9), VIGIL Agent Approval Flow, vigil-approval-agent implemented, PR-VIGIL-002 approved, 690 total tests, Stage 2 COMPLETE, HEAD ca44fa7** |

---

*SOVEREIGN Platform Integration Brief v1.15 · June 23, 2026*
*Pre-Decisional · Internal Working Document*

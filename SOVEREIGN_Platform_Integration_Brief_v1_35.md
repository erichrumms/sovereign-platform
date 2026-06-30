# SOVEREIGN Platform Integration Brief
## Version 1.35 | June 29, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.34
**Changed this version:** Session 23 (retry) COMPLETE · GD-20 executed (shell-contract
v1.15) · ARIA CLEAR core live · SCRIBE export gate wired · VIGIL receiving ARIA alerts ·
1187 total tests · §6, §8, §11, §13, §14, §15, §17, §18, §19 updated

---

## §1 — What This Document Is

Mandatory context for every SOVEREIGN Platform development session. Load order:
Integration Brief (current version) → `SOVEREIGN_Agent_to_Agent_Briefing.md` →
`system_prompt.md` → product or companion suite spec → prior session handoff →
`shell-contract.ts`.

Confirm all documents are loaded by name before any build work begins.
Verify shell-contract.ts SHA-256 matches the v1.15 hash of record.
**Verify agent count in Agent_Identity_Standard.md by counting the file directly.
Expected: 44. Do NOT rely on this Brief's count.**

---

## §2 — Platform Definition

SOVEREIGN — six primary products (NEXUS, CPMI, APEX, FLOWPATH, AgentOS, ARIA Suite)
plus four companion modules (COUNSEL, SCRIBE, LENS, VIGIL). Intelligence Layer is
the seventh product — must never be lost.

**Two governed workflow layers (not products):**
- **PPBE** — Planning, Programming, Budgeting, and Evaluation
- **Time & Travel** — Travel Management and Time & Expense compliance

**Three non-negotiable design outcomes:** Integration reliability · Operational
efficiency · End-to-end security observability.

---

## §3 — Three Shared Infrastructure Layers

**SOVEREIGN Security Observability Framework** — Stage 1 COMPLETE · 148 Python tests.
**CPMI-VRS AI Governance Standard** — Stage 3 COMPLETE · VRS certified.
**AgentOS** — Stage 4 COMPLETE.

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH ✅ → [Intelligence Layer] → CPMI ✅ → AgentOS ✅ → NEXUS ✅ → APEX ✅ → ARIA Suite 🔧
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ — COMPLETE
‖ NEXUS→AgentOS: LIVE via taskSurface (GD-19) ✅
‖ SCRIBE export gate: LIVE via ctx.aria.isCertified (GD-20) ✅
‖ PPBE: governed workflow layer · agents registered · build after Walkthrough D
‖ Time & Travel: governed workflow layer · agents registered · build after Walkthrough D
```

---

## §5 — Governance Role Assignments (Permanent)

*(unchanged from v1.34)*

---

## §6 — Standing Development Constraints (Invariant)

1. No independent security, governance, or audit systems
2. No shared entity field-name divergence — use `ClearanceLevel` not `DataClassification`
3. No rewrite debt — connections are configuration changes
4. Every human decision event carries `decision_type`
5. No direct LLM API calls — `createSovereignClient()` only
6. `workflow_step_id` on every Logger event
7. Shell context frozen at **ten exports** (GD-20 executed Session 23). No further
   additions without a new GD.
8. `shell-contract.ts` —
   **v1.15 · SHA-256: `939c2441a1b4a6af16fefae4cbf8269585260646e84d830b4e0529ca8bfa5876`**
9. All prompts registered before build — **14 APPROVED**
10. All agents registered before build — **verify Agent_Identity_Standard.md directly**.
    **Expected: 44.** (36 pre-TT + 8 Time & Travel added post-Session 23)
11. **Five synced copies of shared artifacts** — propagate all changes

**Codebase facts every session must know:**
- Real types: `SovereignRequestContext` / `SovereignLLMResponse` / `ClearanceLevel`
- `createSovereignClient()` unchanged — use `routedComplete()` for routing
- CommonJS: `sovereign-api-client` uses `process.env`, not `import.meta.env`
- ESM exception: `module-cpmi`, `module-apex`, `module-flowpath`, `module-aria` use
  `import.meta.env` via isolated `anthropic-key.ts` + jest stub
- `SovereignEventType`: **79 members** (after GD-20)
- `HumanDecisionType`: **19 members** (after GD-20)
- `SovereignEventType` NOT mirrored in `sovereign-data/src/shared-types.ts`
- Shell context exports: **10** — `auth, logger, governance, data, navigation, mcp,
  a2a, agui, taskSurface, aria`
- `ctx.aria.isCertified(documentId)` — SCRIBE export gate check (LIVE)
- `ctx.aria.record(certification)` — Certification Queue writes (LIVE)
- ARIA Suite minimumRole: `PLATFORM_ADMIN`
- `aria.rules-engine` is deterministic — no `sovereign-api-client` calls, no prompt
- CLEAR source loading is registry-bound (not runtime fs) — browser ESM module
- `evaluation_timestamp` is caller-supplied to clear-engine (fully deterministic)
- ARIA→VIGIL maps to existing AlertType values + `sourceProduct: "ARIA"` (no schema change)
- PPBE reserved field names (never use): `fiscal_year`, `lifecycle_cost_estimate`,
  `obligation_plan`, `performance_baseline`
- `tt.pattern-analyst` individual baseline: `data_classification: user` — employee ID hashed
- Approved UI pattern: white cards (`#ffffff`, `1px solid #e2e8f0`) on `#f1f5f9` canvas
- **Gather script filenames from prior SBOM §4. Never guess from spec. (Lesson 11)**
- **Agent count from the file, not this Brief. Expected: 44. (Lesson 12)**

**Carry-forward audit findings (non-blocking):**
- F-2: 8 agents implemented-but-not-carded (2 NEXUS + 6 AgentOS core)
- F-3: AgentOS dispatcher hyphenated id/class nuance

**GD-10 — Classification Boundary (permanent):**
UNCLASSIFIED only. CUI/SECRET/TOP_SECRET throw `ClassificationNotAuthorizedError`.

---

## §7 — CPMI Enhanced Monitoring

CPMI at **0.7× anomaly threshold** — architectural constant.
VRS certificates active: CPMI · APEX · FLOWPATH.

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← git main · HEAD 065c058
├── SOVEREIGN_Platform_Integration_Brief_v1_35.md
├── Agent_Identity_Standard.md         ← 44 agents (verify file directly)
├── GD-20_ARIA_CLEAR_ShellContract_APPROVED.md
├── sovereign-shell/shell-contract.ts  ← v1.15 · SHA 939c2441…bfa5876
├── sovereign-security/                ← 148 Python tests
├── sovereign-api-client/              ← 174 tests
├── sovereign-data/                    ← 43 tests (shared-types v1.3, HumanDecisionType 19)
├── module-counsel/                    ← COMPLETE — 91 tests
├── module-scribe/                     ← COMPLETE — 125 tests (CLEAR export gate live)
├── module-vigil/                      ← COMPLETE — 117 tests (ARIA alerts live)
├── module-lens/                       ← COMPLETE — 58 tests
├── module-cpmi/                       ← COMPLETE — 58 tests
├── module-agentos/                    ← COMPLETE — 89 tests
├── module-nexus/                      ← COMPLETE — 52 tests
├── module-apex/                       ← COMPLETE — 97 tests
├── module-flowpath/                   ← COMPLETE — 98 tests
├── module-aria/                       ← Stage 6 IN PROGRESS — 37 tests (CLEAR live)
└── e2e/                               ← 6 E2E scenarios passing
```

---

## §9 — Intelligence Layer Exposure Requirements

| Field | Required On | Status |
|---|---|---|
| `workflow_step_id` | Every Logger event | Enforced |
| `decision_type` | Every human decision | Enforced |
| `TASK_APPROVAL` / `TASK_CANCELLATION` | AgentOS task decisions | LIVE |
| `GATE_3_ATTESTATION` | CPMI + APEX + FLOWPATH | LIVE |
| `AGENTOS_TASK_ASSIGNED` | NEXUS→AgentOS hand-off | LIVE (GD-19) |
| `ARIA_COMPLIANCE_CHECK` | CLEAR engine evaluations | **LIVE (GD-20)** |
| `ARIA_CERTIFICATION_ISSUED` | CLEAR export certifications | **LIVE (GD-20)** |
| `ARIA_VIOLATION_FLAGGED` | CLEAR violations | **LIVE (GD-20)** |
| `ARIA_CALENDAR_ALERT` | Governance calendar violations | **LIVE (GD-20)** |
| TRACER events | ARIA traceability chains | PENDING — Session 24 |
| ARC events | ARIA regulatory impact | PENDING — Session 25 |
| PPBE decision events | PPBE transitions | DEFERRED |
| Time & Travel events | TT compliance checks | DEFERRED |

---

## §10 — Shared Data Dictionary

*(unchanged from v1.34 — Time & Travel entities approved but not yet built)*

---

## §11 — Current Build Status

### Stages 1–5b — COMPLETE ✅
### Walkthroughs A, B, C — COMPLETE ✅
### Stage 6 (ARIA Suite) — IN PROGRESS

**Total tests: 1039 JS/TS + 148 Python = 1187**

### Session 23 (retry) — COMPLETE

All six deliverables delivered. GD-20 executed as D1.

| Deliverable | Commit | Status |
|---|---|---|
| D1 — GD-20 shell-contract v1.15 | `04bd5e7` | ✅ |
| D4 — CLEAR rule engine (built before D2/D3) | `89c70ea` | ✅ |
| D2 — CLEAR Compliance Dashboard | `6b1d599` | ✅ |
| D3 — CLEAR Certification Queue + SCRIBE gate | `663de4a` | ✅ |
| D5 — VIGIL integration | `abb6ede` | ✅ |
| D6 — Tests + close verification | `41d855e` | ✅ |

**Key reconciliations (carried from handoff):**
- CLEAR source loading is registry-bound, not runtime fs (browser ESM — no Node types)
- `evaluation_timestamp` is caller-supplied → engine is fully deterministic
- ARIA→VIGIL maps to existing AlertType + `sourceProduct: "ARIA"` (no schema change)
- SCRIBE gate fires only when `source.context.documentId` is present (existing behavior preserved)

### Stage 6 Remaining — Sessions 24–25

| Session | Scope | Status |
|---|---|---|
| **24** | **TRACER core** | **NEXT** |
| 25 | ARC core + CPMI-VRS certification | Pending |
| Walkthrough D | Stage 6 validation | Pending |

---

## §12 — Risk Register

*(unchanged from v1.34)*

---

## §13 — Open Governance Items

**CLOSED this version:**
- GD-20 — EXECUTED Session 23 (retry)
- docs/16 §4/§7 amendment — COMPLETE (Session 23 D1)

**Open items:**

| ID | Item | Target |
|---|---|---|
| WC-6 | FLOWPATH VRS certificate document | Stage 7 / hardening |
| F-2 | 8 agents implemented-but-not-carded | Future session |
| F-3 | AgentOS dispatcher id/class nuance | Future session |
| PPBE-SPEC | `docs/17_PPBE_Workflow_Architecture.md` | Before PPBE Phase I |
| PPBE-PROMPTS | Four PPBE agent prompts | Before relevant build sessions |
| TT-PROMPTS | Two Time & Travel drafting prompts | Before Time & Travel Phase II |
| TT-GD | GD for TRAVEL_APPROVAL / TIME_CORRECTION_SENT / ESCALATION_AUTHORIZED | Before Time & Travel Phase II |

---

## §14 — SBOM Status

Current: `SBOM_Registry_v1.24_MERGED.md` (through Session 23).
Shell contract v1.15 · `939c2441…bfa5876`. 1187 total tests. 0 vulnerabilities.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. Verify shell-contract.ts SHA-256 = `939c2441…bfa5876` (v1.15).
3. **Count agent entries directly. Expected: 44. Do NOT rely on this Brief.**
4. Before any gather script: read prior SBOM §4 for exact filenames. (Lesson 11)
5. State done condition — wait for Project Principal approval.
6. One component per exchange — build, verify, confirm, proceed.
7. Close with handoff — never skip.

**Session 24 Opening Priorities:**
1. TRACER Traceability Explorer panel
2. Three traceability chain types (decision chains, document chains, obligation chains)
3. TRACER Logger event types added to `sovereign_logger.py`
4. Integration with COUNSEL Decision Records
5. Integration with SCRIBE document lineage
6. Tests (~20 new tests target)

---

## §16 — Level 1 Walkthrough Protocol

| Walkthrough | After Session | Stage | Status |
|---|---|---|---|
| A | 16 | Stage 4 | COMPLETE — June 25, 2026 |
| B | 18 | Stage 5a (APEX) | COMPLETE — June 26, 2026 |
| C | 21 | Stage 5b (FLOWPATH) | COMPLETE — June 29, 2026 |
| **D** | **~25** | **Stage 6 (ARIA Suite)** | **Pending — after Session 25** |
| E | ~27 | Pre-IL | Pending |
| F | ~32 | Full platform | Pending |

---

## §17 — Primary Product Inserts

| Product | Stage | Status |
|---|---|---|
| CPMI | Stage 3 | COMPLETE — VRS certified |
| AgentOS | Stage 4 | COMPLETE — 89 tests |
| NEXUS | Stage 4 | COMPLETE — 52 tests |
| APEX | Stage 5a | COMPLETE — VRS certified — 97 tests |
| FLOWPATH | Stage 5b | COMPLETE — VRS certified — 98 tests |
| **ARIA Suite** | **Stage 6** | **IN PROGRESS — 37 tests · CLEAR LIVE · TRACER next (Session 24)** |

---

## §18 — Agent and Prompt Registry

**Agent registry: 44 total — verify Agent_Identity_Standard.md directly**
- 36 pre-TT (verified Session 23 open)
- 8 Time & Travel agents appended post-Session 23 (`065c058`)

**Approved prompts: 14 total — unchanged**

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.33 | June 29, 2026 | Session 23 paused · GD-20 approved · retry authorized |
| v1.34 | June 29, 2026 | Time & Travel D-TT1–D-TT6 · 8 agents (44 total) · docs/17 |
| **v1.35** | **June 29, 2026** | **Session 23 retry COMPLETE · GD-20 executed · CLEAR live · shell v1.15 · 1187 tests** |

---

## §20 — Full Build Roadmap

### Stages 1–5b — COMPLETE ✅
### Walkthroughs A, B, C — COMPLETE ✅
### Stage 6 — ARIA Suite (IN PROGRESS)

| Session | Type | Scope |
|---|---|---|
| 23 (retry) | Build | GD-20 + CLEAR core — **COMPLETE** |
| **24** | **Build** | **TRACER core** |
| 25 | Build | ARC core + CPMI-VRS certification |
| **Walkthrough D** | Validation | Stage 6 — ARIA Suite |

### Workflow Layer Builds (after Walkthrough D)

| Session | Type | Scope |
|---|---|---|
| ~26 | Build | Time & Travel Phase I |
| ~27 | Build | Time & Travel Phase II |
| ~28 | Build | PPBE Phase I |
| ~29 | Build | PPBE Phase II |

### Stages 7–9 — Demo Hardening, Intelligence Layer, Production

*(unchanged)*

---

*SOVEREIGN Platform Integration Brief v1.35 · June 29, 2026*
*Pre-Decisional · Internal Working Document*

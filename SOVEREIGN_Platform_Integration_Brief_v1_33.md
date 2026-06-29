# SOVEREIGN Platform Integration Brief
## Version 1.33 | June 29, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.32
**Changed this version:** Session 23 paused at open (three shell-contract conflicts) ·
GD-20 APPROVED (shell-contract v1.15 — ARIA CLEAR surface, 4 event types,
COMPLIANCE_CERTIFICATION) · docs/16 §4/§7 flagged for amendment · §6, §13, §19 updated

---

## §1 — What This Document Is

Mandatory context for every SOVEREIGN Platform development session. Load order:
Integration Brief (current version) → `SOVEREIGN_Agent_to_Agent_Briefing.md` →
`system_prompt.md` → product or companion suite spec → prior session handoff →
`shell-contract.ts`.

Confirm all documents are loaded by name before any build work begins.
**Session 23 (retry): shell-contract opens at v1.14. D1 advances it to v1.15 per GD-20.**
Verify agent count in Agent_Identity_Standard.md by counting the file directly. Expected: 36.

---

## §2 — Platform Definition

SOVEREIGN — six primary products (NEXUS, CPMI, APEX, FLOWPATH, AgentOS, ARIA Suite)
plus four companion modules (COUNSEL, SCRIBE, LENS, VIGIL). Intelligence Layer is
the seventh product — must never be lost. PPBE is a governed workflow layer — not a product.

**Three non-negotiable design outcomes:** Integration reliability · Operational
efficiency · End-to-end security observability.

---

## §3 — Three Shared Infrastructure Layers

**SOVEREIGN Security Observability Framework** — Stage 1 COMPLETE · 142 Python tests.
**CPMI-VRS AI Governance Standard** — Stage 3 COMPLETE · VRS certified.
**AgentOS** — Stage 4 COMPLETE.

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH ✅ → [Intelligence Layer] → CPMI ✅ → AgentOS ✅ → NEXUS ✅ → APEX ✅ → ARIA Suite 🔧
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ — COMPLETE
‖ Local LLM: Provider B wired · UNCLASSIFIED-only (GD-10)
‖ NEXUS→AgentOS: LIVE via taskSurface (GD-19) ✅
‖ PPBE: governed workflow layer · D-P1–D-P6 approved · agents registered · build pending
```

---

## §5 — Governance Role Assignments (Permanent)

| Role | Assigned To | Status |
|---|---|---|
| CPMI Product Owner | Project Principal | Stage 3 COMPLETE |
| ARIA Suite Product Owner | Project Principal | Stage 6 IN PROGRESS |
| PPBE Product Owner | Project Principal | D-P2 APPROVED |
| Data Owner / Steward | Project Principal | Active |
| Agent Operator | Project Principal | R3 CLOSED |

---

## §6 — Standing Development Constraints (Invariant)

1. No independent security, governance, or audit systems
2. No shared entity field-name divergence — use `ClearanceLevel` not `DataClassification`
3. No rewrite debt — connections are configuration changes
4. Every human decision event carries `decision_type`
5. No direct LLM API calls — `createSovereignClient()` only
6. `workflow_step_id` on every Logger event
7. Shell context at **nine exports** currently (v1.14). **GD-20 advances to ten exports
   (v1.15) as Session 23 (retry) D1. No further additions without a new GD.**
8. `shell-contract.ts` —
   **v1.14 · SHA-256: `2b3d8674c5d350e81324a3eb9b81568fe378dfa1784025bbf898756ef17e9910`**
   *(Session 23 retry D1 advances to v1.15 per GD-20 — new hash recorded in Session 23 handoff)*
9. All prompts registered before build — **14 APPROVED**
10. All agents registered before build — **verify Agent_Identity_Standard.md directly**.
    Expected: 36.
11. **Five synced copies of shared artifacts** — propagate all changes

**Codebase facts every session must know:**
- Real types: `SovereignRequestContext` / `SovereignLLMResponse` / `ClearanceLevel`
- `createSovereignClient()` unchanged — use `routedComplete()` for routing
- CommonJS: `sovereign-api-client` uses `process.env`, not `import.meta.env`
- ESM exception: `module-cpmi`, `module-apex`, `module-flowpath`, `module-aria` use
  `import.meta.env` via isolated `anthropic-key.ts` + jest stub
- `SovereignEventType` NOT mirrored in `sovereign-data/src/shared-types.ts`
- `HumanDecisionType` has 18 members at v1.14; **19 after GD-20 D1**
- ARIA Suite minimumRole: `PLATFORM_ADMIN`
- `aria.rules-engine` is deterministic — no `sovereign-api-client` calls, no prompt
- `ctx.aria` does not exist at v1.14 — **added as tenth export by GD-20 D1**
- After GD-20: `ctx.aria.isCertified(documentId)` is the SCRIBE export gate check
- PPBE reserved field names (never use): `fiscal_year`, `lifecycle_cost_estimate`,
  `obligation_plan`, `performance_baseline`
- Approved UI pattern: white cards (`#ffffff`, `1px solid #e2e8f0`) on `#f1f5f9` canvas
- **Gather script filenames from prior SBOM §4. Never guess from spec. (Lesson 11)**
- **Agent count from the file, not this Brief. (Lesson 12)**

**GD-20 — APPROVED June 29, 2026 — execute as Session 23 (retry) D1:**
Shell-contract v1.14 → v1.15. Adds four `SovereignEventType` members
(ARIA_COMPLIANCE_CHECK, ARIA_CERTIFICATION_ISSUED, ARIA_VIOLATION_FLAGGED,
ARIA_CALENDAR_ALERT). Adds `COMPLIANCE_CERTIFICATION` to `HumanDecisionType` (18 → 19).
Adds `ctx.aria` as tenth shell export (`AriaCertificationSurface`). Constraint #7 relaxed
from 9 to 10 for this addition only. All additive. Full Constraint #11 propagation required.
See `GD-20_ARIA_CLEAR_ShellContract_APPROVED.md` for complete specification.

**docs/16 §4/§7 — amendment required (Session 23 retry D1):**
The statement that ARIA Suite requires no shell-contract change was written before the
Session 23 deliverable design placed ARIA Logger emission in the TypeScript layer.
GD-20 supersedes this. The spec must be amended to reflect that ARIA events are emitted
from the TS layer via `ctx.logger`, and that `ctx.aria` is a shell export.

**GD-10 — Classification Boundary (permanent):**
UNCLASSIFIED only. CUI/SECRET/TOP_SECRET throw `ClassificationNotAuthorizedError`.

---

## §7 — CPMI Enhanced Monitoring

CPMI at **0.7× anomaly threshold** — architectural constant.
VRS certificates active: CPMI · APEX · FLOWPATH (all current).

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← git main · HEAD b4f7a75
├── SOVEREIGN_Platform_Integration_Brief_v1_33.md
├── Agent_Identity_Standard.md         ← 36 agents
├── GD-20_ARIA_CLEAR_ShellContract_APPROVED.md  ← commit this session
├── sovereign-shell/shell-contract.ts  ← v1.14 now · v1.15 after Session 23 D1
├── module-aria/                       ← Stage 6 IN PROGRESS — 17 tests (scaffold)
└── [all other modules unchanged]
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
| `ARIA_COMPLIANCE_CHECK` | CLEAR engine evaluations | PENDING — GD-20 / Session 23 |
| `ARIA_CERTIFICATION_ISSUED` | CLEAR export certifications | PENDING — GD-20 / Session 23 |
| `ARIA_VIOLATION_FLAGGED` | CLEAR violations | PENDING — GD-20 / Session 23 |
| `ARIA_CALENDAR_ALERT` | Governance calendar violations | PENDING — GD-20 / Session 23 |
| PPBE decision events | PPBE transitions | DEFERRED |

---

## §10 — Shared Data Dictionary

*(unchanged from v1.32)*

---

## §11 — Current Build Status

### Stages 1–5b — COMPLETE ✅
### Walkthroughs A, B, C — COMPLETE ✅
### Stage 6 (ARIA Suite) — IN PROGRESS

**Total tests: 1018 JS + 142 Python = 1160 (unchanged — Session 23 first attempt produced no code)**

### Session 23 — PAUSED (first attempt) / RETRY READY

Session 23 first attempt paused correctly at session open. Three shell-contract conflicts
found in D2/D4 deliverables. GD-20 raised and approved same day. No code committed.
HEAD unchanged at `b4f7a75`.

**Session 23 (retry) is authorized to proceed with GD-20 pre-approved as D1.**

### Stage 6 Sequence

| Session | Scope | Status |
|---|---|---|
| 22 | GD-19 + Item 57 + WC gaps + ARIA scaffold | COMPLETE |
| **23 (retry)** | **GD-20 + CLEAR core** | **NEXT** |
| 24 | TRACER core | Pending |
| 25 | ARC core + CPMI-VRS certification | Pending |
| Walkthrough D | Stage 6 validation | Pending |

---

## §12 — Risk Register

*(unchanged from v1.32, except:)*

| R16 | ARIA Suite shell-contract scope underestimated in docs/16 | MITIGATED — GD-20 approved; docs/16 to be amended Session 23 D1 |

---

## §13 — Open Governance Items

**CLOSED this version:**
- GD-20 — APPROVED June 29, 2026 (execute Session 23 retry D1)

**Open items (unchanged from v1.32 plus):**

| ID | Item | Target |
|---|---|---|
| docs/16 amendment | §4/§7 — amend to reflect TS-layer emission and ctx.aria | Session 23 retry D1 |
| WC-6 | FLOWPATH VRS certificate document | Stage 7 / hardening |
| F-2 | 8 agents implemented-but-not-carded | Future session |
| F-3 | AgentOS dispatcher id/class nuance | Future session |
| PPBE-SPEC | `docs/17_PPBE_Workflow_Architecture.md` | Before PPBE Phase II |
| PPBE-PROMPTS | Four PPBE agent prompts | Before each relevant build session |

---

## §14 — SBOM Status

Current: `SBOM_Registry_v1.23_MERGED.md` (through Session 22 — Session 23 produced no code).
Shell contract v1.14 · `2b3d8674…e9910`. 1160 total tests. 0 vulnerabilities.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. Verify shell-contract.ts SHA-256.
   **Session 23 retry opens at v1.14 (`2b3d8674…e9910`). D1 advances to v1.15.**
3. Count agent entries directly. Expected: 36.
4. Before any gather script: read prior SBOM §4 for exact filenames. (Lesson 11)
5. State done condition — wait for Project Principal approval.
6. One component per exchange — build, verify, confirm, proceed.
7. Close with handoff — never skip.

**Session 23 (retry) Opening Priorities:**
1. **GD-20** — shell-contract v1.14 → v1.15 (all three changes + full Constraint #11 propagation)
2. **CLEAR Compliance Dashboard** (three monitoring surfaces)
3. **CLEAR Certification Queue** (ctx.aria.record, ctx.aria.isCertified, SCRIBE gate)
4. **CLEAR rule evaluation engine** (deterministic, four regulatory sources)
5. **VIGIL integration** (ARIA alerts routing to Alert Queue)
6. **Tests and close verification** (~25 new tests)

---

## §16 — Level 1 Walkthrough Protocol

*(unchanged from v1.32)*

---

## §17 — Primary Product Inserts

| Product | Stage | Status |
|---|---|---|
| CPMI | Stage 3 | COMPLETE — VRS certified |
| AgentOS | Stage 4 | COMPLETE — 89 tests |
| NEXUS | Stage 4 | COMPLETE — 52 tests |
| APEX | Stage 5a | COMPLETE — VRS certified — 97 tests |
| FLOWPATH | Stage 5b | COMPLETE — VRS certified — 98 tests |
| **ARIA Suite** | **Stage 6** | **IN PROGRESS — 17 tests (scaffold) · GD-20 approved · CLEAR retry NEXT** |

---

## §18 — Agent and Prompt Registry

**Agent registry: 36 total — verified Session 22 D0 audit**
**Approved prompts: 14 total — unchanged**

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.31 | June 29, 2026 | Walkthrough C · PPBE decisions · PPBE agents registered |
| v1.32 | June 29, 2026 | Session 22 · GD-19 · Item 57 · ARIA scaffold · 1160 tests |
| **v1.33** | **June 29, 2026** | **Session 23 paused · GD-20 APPROVED · retry authorized** |

---

*SOVEREIGN Platform Integration Brief v1.33 · June 29, 2026*
*Pre-Decisional · Internal Working Document*

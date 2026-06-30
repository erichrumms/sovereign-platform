# SOVEREIGN Platform Integration Brief
## Version 1.37 | June 29, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.36
**Changed this version:** Session 24 COMPLETE · TRACER core live · intentional Logger
taxonomy divergence documented (Python 82 vs. TypeScript 79) · repo housekeeping pass
complete · 1215 total tests · §6, §8, §9, §11, §13, §14, §15, §17 updated

---

## §1 — What This Document Is

Mandatory context for every SOVEREIGN Platform development session. Load order:
Integration Brief (current version) → `SOVEREIGN_Agent_to_Agent_Briefing.md` →
`system_prompt.md` → product or companion suite spec → prior session handoff →
`shell-contract.ts`.

Confirm all documents are loaded by name before any build work begins.
Verify shell-contract.ts SHA-256 matches the v1.15 hash of record (unchanged since
Session 23). Verify agent count in Agent_Identity_Standard.md by counting the file
directly. Expected: 44.

---

## §2 — Platform Definition

*(unchanged from v1.36)*

---

## §3 — Three Shared Infrastructure Layers

*(unchanged from v1.36)*

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH ✅ → [Intelligence Layer] → CPMI ✅ → AgentOS ✅ → NEXUS ✅ → APEX ✅ → ARIA Suite 🔧
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ — COMPLETE
‖ NEXUS→AgentOS: LIVE via taskSurface (GD-19) ✅
‖ SCRIBE export gate: LIVE via ctx.aria.isCertified (GD-20) ✅
‖ ARIA Suite: CLEAR ✅ live · TRACER ✅ live · ARC scaffold — Session 25 next
‖ PPBE: governed workflow layer · agents registered · build after Walkthrough D
‖ Time & Travel: governed workflow layer · agents registered · build after Walkthrough D
```

---

## §5 — Governance Role Assignments (Permanent)

*(unchanged from v1.36)*

---

## §6 — Standing Development Constraints (Invariant)

1. No independent security, governance, or audit systems
2. No shared entity field-name divergence — use `ClearanceLevel` not `DataClassification`
3. No rewrite debt — connections are configuration changes
4. Every human decision event carries `decision_type`
5. No direct LLM API calls — `createSovereignClient()` only
6. `workflow_step_id` on every Logger event
7. Shell context frozen at **ten exports**. No further additions without a new GD.
8. `shell-contract.ts` —
   **v1.15 · SHA-256: `939c2441a1b4a6af16fefae4cbf8269585260646e84d830b4e0529ca8bfa5876`**
   *(unchanged through Session 24)*
9. All prompts registered before build — **14 APPROVED**
10. All agents registered before build — **verify Agent_Identity_Standard.md directly**.
    **Expected: 44.**
11. **Five synced copies of shared artifacts** — propagate all changes

**Codebase facts every session must know:**
- Real types: `SovereignRequestContext` / `SovereignLLMResponse` / `ClearanceLevel`
- `createSovereignClient()` unchanged — use `routedComplete()` for routing
- CommonJS: `sovereign-api-client` uses `process.env`, not `import.meta.env`
- ESM exception: `module-cpmi`, `module-apex`, `module-flowpath`, `module-aria` use
  `import.meta.env` via isolated `anthropic-key.ts` + jest stub
- `SovereignEventType`: **79 members** — unchanged since GD-20
- `HumanDecisionType`: **19 members** — unchanged since GD-20
- Shell context exports: **10** — `auth, logger, governance, data, navigation, mcp,
  a2a, agui, taskSurface, aria`
- **Python `APPROVED_EVENT_TYPES`: 82 — intentionally 3 MORE than `SovereignEventType`
  (79). This is permanent and by design (TRACER's three event types are Python-only —
  `ARIA_TRACE_REQUESTED`, `ARIA_TRACE_PRODUCED`, `ARIA_ORPHAN_FLAGGED`). The prior
  assumption that the Python set mirrors the shell-contract exactly is RETIRED.
  Do not "fix" this divergence — it is correct as-is.**
- `ctx.aria.isCertified(documentId)` — SCRIBE export gate (LIVE)
- `ctx.data` is `{ types: unknown }` — no structured read API yet. `ctx.logger` is
  write-only (`log()` only, no read). TRACER and CLEAR both work around this via
  synthetic demo records / explicit input, pending a real read API.
- `aria.rules-engine` is deterministic — no `sovereign-api-client` calls, no prompt.
  Powers both CLEAR and TRACER.
- ARIA Suite minimumRole: `PLATFORM_ADMIN`
- PPBE reserved field names (never use): `fiscal_year`, `lifecycle_cost_estimate`,
  `obligation_plan`, `performance_baseline`
- Approved UI pattern: white cards (`#ffffff`, `1px solid #e2e8f0`) on `#f1f5f9` canvas
- **Gather script filenames from prior SBOM §4. Never guess from spec. (Lesson 11)**
- **Agent count from the file, not this Brief. Expected: 44. (Lesson 12)**
- **Repo hygiene: the monorepo root and `docs/` hold only current-version governing
  documents. iCloud-archival series (SBOM Registry vNN_MERGED, dated
  Agent-to-Agent Briefings, System Prompt vNN snapshots) are NOT tracked in git —
  they live in iCloud only. Do not commit these file types to the repo. (Lesson 13 —
  established June 30, 2026 during the post-Session-24 cleanup pass.)**

**Carry-forward audit findings (non-blocking):**
- F-2: 8 agents implemented-but-not-carded (2 NEXUS + 6 AgentOS core)
- F-3: AgentOS dispatcher hyphenated id/class nuance

**Open recommendation (not actioned, candidate for future GD):**
- COUNSEL `regulation_basis` field — would complete TRACER decision chains
  (Session 24 handoff §G.1). COUNSEL data model not modified this session per
  explicit build authorization to surface, not act.

**GD-10 — Classification Boundary (permanent):**
UNCLASSIFIED only. CUI/SECRET/TOP_SECRET throw `ClassificationNotAuthorizedError`.

---

## §7 — CPMI Enhanced Monitoring

*(unchanged from v1.36)*

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← git main · HEAD 1888e48
├── SOVEREIGN_Platform_Integration_Brief_v1_37.md
├── Agent_Identity_Standard.md         ← 44 agents (verify file directly)
├── sovereign-shell/shell-contract.ts  ← v1.15 · SHA 939c2441…bfa5876 (unchanged)
├── sovereign-security/                ← 153 Python tests
├── module-aria/                       ← Stage 6 IN PROGRESS — 60 tests
│                                         (CLEAR + TRACER live, ARC next)
└── docs/
    ├── 13_APEX_Architecture.md
    ├── 14_HumanReviewerStandard.md
    ├── 14_HumanReviewerStandard_Addendum_SupervisionEfficiency.md
    ├── 15_FLOWPATH_Architecture.md    ← updated 1888e48 (Lesson 11 note)
    ├── 16_ARIA_Suite_Architecture.md
    └── 17_TimeAndTravel_Architecture.md
```

**Repo housekeeping note (June 29–30, 2026):** A working-tree cleanup pass removed
24 untracked stray files — confirmed duplicates of committed documents, closed
session artifacts, and iCloud-archival series that were never meant to be tracked
in git (SBOM Registry vNN_MERGED snapshots v1.18–v1.24, System Prompt v11–v14,
six dated Agent-to-Agent Briefings, three already-merged governance records).
One genuine improvement (generalized handoff reference + Lesson 11 note) was
recovered from an untracked root copy of `docs/15_FLOWPATH_Architecture.md` and
merged into the canonical file before the duplicate was discarded. See Lesson 13
in §6 above.

---

## §9 — Intelligence Layer Exposure Requirements

| Field | Required On | Status |
|---|---|---|
| `workflow_step_id` | Every Logger event | Enforced |
| `decision_type` | Every human decision | Enforced |
| `TASK_APPROVAL` / `TASK_CANCELLATION` | AgentOS task decisions | LIVE |
| `GATE_3_ATTESTATION` | CPMI + APEX + FLOWPATH | LIVE |
| `AGENTOS_TASK_ASSIGNED` | NEXUS→AgentOS hand-off | LIVE (GD-19) |
| `ARIA_COMPLIANCE_CHECK` | CLEAR engine evaluations | LIVE (GD-20) |
| `ARIA_CERTIFICATION_ISSUED` | CLEAR export certifications | LIVE (GD-20) |
| `ARIA_VIOLATION_FLAGGED` | CLEAR violations | LIVE (GD-20) |
| `ARIA_CALENDAR_ALERT` | Governance calendar violations | LIVE (GD-20) |
| `ARIA_TRACE_REQUESTED` | TRACER queries | LIVE (Session 24 — Python-only) |
| `ARIA_TRACE_PRODUCED` | TRACER completed chains | LIVE (Session 24 — Python-only) |
| `ARIA_ORPHAN_FLAGGED` | TRACER incomplete chains | LIVE (Session 24 — Python-only) |
| ARC events | ARIA regulatory impact modeling | PENDING — Session 25 |
| PPBE decision events | PPBE transitions | DEFERRED |
| Time & Travel events | TT compliance checks | DEFERRED |

---

## §10 — Shared Data Dictionary

*(unchanged from v1.36 — Time & Travel and PPBE entities approved but not yet built)*

---

## §11 — Current Build Status

### Stages 1–5b — COMPLETE ✅
### Walkthroughs A, B, C — COMPLETE ✅
### Stage 6 (ARIA Suite) — IN PROGRESS

**Total tests: 1062 JS/TS + 153 Python = 1215**

### Session 24 — COMPLETE

All five deliverables delivered. No shell-contract change (TRACER needed none).

| Deliverable | Commit | Status |
|---|---|---|
| D1 — TRACER domain types + chain assembly engine | `560832c` | ✅ |
| D4 — COUNSEL/SCRIBE integration | `e202267` | ✅ |
| D2 — Traceability Explorer panel | `62bcc2e` | ✅ |
| D3 — TRACER Logger event types (Python-only) | `136cf54` | ✅ |
| D5 — Tests + close verification | `285032a` | ✅ |

**Key reconciliations (carried from handoff §G):**
- COUNSEL Decision Records carry no `regulation_basis` field — DecisionChain built to
  real data; field is optional on TRACER's input type for future COUNSEL extension
- SCRIBE has no `SCRIBE_DRAFT_CREATED` event — DocumentChain models the real
  `AGENT_STEP_COMPLETE` (`scribe-drafter`) event instead
- TRACER Logger events are Python-only by design — permanent 3-event divergence
  from `SovereignEventType` (see §6 above)
- `ctx.data`/`ctx.logger` have no runtime read API yet — TRACER uses synthetic demo
  records via explicit input, same convention as CLEAR's dashboard

### Post-Session 24 — Repo Housekeeping (June 29–30)

Working-tree cleanup completed. See §8 above. HEAD after cleanup: `1888e48`.

### Stage 6 Remaining — Session 25

| Session | Scope | Status |
|---|---|---|
| **25** | **ARC core + CPMI-VRS certification** | **NEXT** |
| Walkthrough D | Stage 6 validation | Pending — after Session 25 |

---

## §12 — Risk Register

*(unchanged from v1.36)*

---

## §13 — Open Governance Items

**CLOSED this version:**
- Session 24 (TRACER core) — COMPLETE
- Repo housekeeping pass — COMPLETE

**Open items:**

| ID | Item | Target |
|---|---|---|
| COUNSEL-GD | Candidate GD: add `regulation_basis` to COUNSEL Decision Record | Future session |
| docs/16-update | Retroactively reflect Session 24 §G.1–G.4 reconciliations in docs/16 §5 | Before Walkthrough D |
| WC-6 | FLOWPATH VRS certificate document | Stage 7 / hardening |
| F-2 | 8 agents implemented-but-not-carded | Future session |
| F-3 | AgentOS dispatcher id/class nuance | Future session |
| PPBE-SPEC | `docs/18_PPBE_Workflow_Architecture.md` (renumbered — 17 is now Time & Travel) | Before PPBE Phase I |
| PPBE-PROMPTS | Four PPBE agent prompts | Before relevant build sessions |
| TT-PROMPTS | Two Time & Travel drafting prompts | Before Time & Travel Phase II |
| TT-GD | GD for TRAVEL_APPROVAL / TIME_CORRECTION_SENT / ESCALATION_AUTHORIZED | Before Time & Travel Phase II |
| SES-APEX | Supervision Efficiency metrics in APEX analytics scope | Future APEX spec revision |
| SES-CONTEXT | Active context surfacing for DC-2/DC-3 | Future APEX spec revision |
| SES-LENS | LENS as active context layer | Stage 8 / Intelligence Layer planning |
| iCloud-cleanup | Consolidate superseded Integration Brief/Briefing versions in iCloud root into For Disposal/ | Future Cowork session on iCloud drive |

---

## §14 — SBOM Status

Current: `SBOM_Registry_v1.25_MERGED.md` (through Session 24).
Shell contract v1.15 · `939c2441…bfa5876`. 1215 total tests. 0 vulnerabilities.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. Verify shell-contract.ts SHA-256 = `939c2441…bfa5876` (v1.15).
3. Count agent entries directly. Expected: 44.
4. Before any gather script: read prior SBOM §4 for exact filenames. (Lesson 11)
5. **Do not commit iCloud-archival document types to git.** (Lesson 13)
6. State done condition — wait for Project Principal approval.
7. One component per exchange — build, verify, confirm, proceed.
8. Close with handoff — never skip.

**Session 25 Opening Priorities:**
1. ARC — Adaptive Regulatory Change engine core
2. Regulatory Impact Modeler UI panel
3. Dependency model for current regulatory framework (four sources from CLEAR)
4. ARC Logger event types (Python-only, following TRACER's precedent — confirm
   with docs/16 §6 whether ARC needs any TS-side emission before assuming none)
5. COUNSEL integration (adaptation decision routing) and NEXUS integration
   (action item routing from impact reports)
6. E2E Scenario 7 — full ARIA Suite compliance check → certification → export
7. CPMI-VRS benchmark scenarios for ARIA Suite (modified gate structure per
   docs/16 §12 — determinism verification replaces Gates 1/2 accuracy benchmarks)
8. Gate 3 attestation readiness (Project Principal step, not Claude Code)

---

## §16 — Level 1 Walkthrough Protocol

| Walkthrough | After Session | Stage | Status |
|---|---|---|---|
| A | 16 | Stage 4 | COMPLETE — June 25, 2026 |
| B | 18 | Stage 5a (APEX) | COMPLETE — June 26, 2026 |
| C | 21 | Stage 5b (FLOWPATH) | COMPLETE — June 29, 2026 |
| **D** | **25** | **Stage 6 (ARIA Suite)** | **Pending — after Session 25** |
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
| **ARIA Suite** | **Stage 6** | **IN PROGRESS — 60 tests · CLEAR + TRACER LIVE · ARC next (Session 25)** |

---

## §18 — Agent and Prompt Registry

**Agent registry: 44 total — verify Agent_Identity_Standard.md directly**
**Approved prompts: 14 total — unchanged**

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.35 | June 29, 2026 | Session 23 retry COMPLETE · GD-20 executed · CLEAR live · 1187 tests |
| v1.36 | June 29, 2026 | Supervision Efficiency Standard established · no build scope change |
| **v1.37** | **June 29, 2026** | **Session 24 COMPLETE · TRACER live · intentional Logger divergence documented · repo cleanup · 1215 tests** |

---

## §20 — Full Build Roadmap

### Stages 1–5b — COMPLETE ✅
### Walkthroughs A, B, C — COMPLETE ✅
### Stage 6 — ARIA Suite (IN PROGRESS)

| Session | Type | Scope |
|---|---|---|
| 23 (retry) | Build | GD-20 + CLEAR core — COMPLETE |
| 24 | Build | TRACER core — **COMPLETE** |
| **25** | **Build** | **ARC core + CPMI-VRS certification** |
| **Walkthrough D** | Validation | Stage 6 — ARIA Suite |

### Workflow Layer Builds (after Walkthrough D)

*(unchanged from v1.36)*

### Stages 7–9 — Demo Hardening, Intelligence Layer, Production

*(unchanged)*

---

*SOVEREIGN Platform Integration Brief v1.37 · June 29, 2026*
*Pre-Decisional · Internal Working Document*

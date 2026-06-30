# SOVEREIGN Platform Integration Brief
## Version 1.38 | June 29, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.37
**Changed this version:** Session 25 COMPLETE · ARC core live · **Stage 6 (ARIA Suite)
is FEATURE-COMPLETE** · CPMI-VRS Gates tab built, Gate 3/4 pending Project Principal ·
1267 total tests · Walkthrough D ready to schedule · §4, §6, §9, §11, §13, §14, §15,
§16, §17 updated

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

*(unchanged from v1.37)*

---

## §3 — Three Shared Infrastructure Layers

*(unchanged from v1.37)*

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH ✅ → [Intelligence Layer] → CPMI ✅ → AgentOS ✅ → NEXUS ✅ → APEX ✅ → ARIA Suite ✅
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ — COMPLETE
‖ NEXUS→AgentOS: LIVE via taskSurface (GD-19) ✅
‖ SCRIBE export gate: LIVE via ctx.aria.isCertified (GD-20) ✅
‖ ARIA Suite: CLEAR ✅ · TRACER ✅ · ARC ✅ — ALL LIVE. CPMI-VRS Gate 3/4 pending
‖             Project Principal. Walkthrough D ready to schedule.
‖ PPBE: governed workflow layer · agents registered · build after Walkthrough D
‖ Time & Travel: governed workflow layer · agents registered · build after Walkthrough D
```

**Stage 6 is feature-complete.** All six primary products now have live, functional
implementations. The platform pipeline from FLOWPATH through ARIA Suite is built.

---

## §5 — Governance Role Assignments (Permanent)

*(unchanged from v1.37)*

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
   *(unchanged through Session 25)*
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
- **Python `APPROVED_EVENT_TYPES`: 84 — permanently 5 MORE than `SovereignEventType`
  (79). By design: 3 TRACER events + 2 ARC events, all Python-only. This divergence
  is permanent and correct — do not "fix" it.** `ARIA_ADAPTATION_DECISION` is an
  event type, not a `HumanDecisionType` — it is reserved, not yet wired to actual
  routing.
- `ctx.aria.isCertified(documentId)` — SCRIBE export gate (LIVE). ARC outputs are
  deliberately NOT routed through `ctx.aria` — a projection is not a document
  awaiting export clearance (Session 25 finding G.2).
- `ctx.data` is `{ types: unknown }` — no structured read API yet. `ctx.logger` is
  write-only. CLEAR, TRACER, and ARC all use synthetic demo records / committed
  in-code registries pending a real read API.
- `aria.rules-engine` is deterministic — no `sovereign-api-client` calls, no prompt.
  Powers all three ARIA components: CLEAR, TRACER, and ARC.
- ARC's dependency model is a committed in-code registry of 14 platform items bound
  to the same four regulatory sources CLEAR loads — no new sources, no runtime fs read
- ARIA Suite minimumRole: `PLATFORM_ADMIN`
- PPBE reserved field names (never use): `fiscal_year`, `lifecycle_cost_estimate`,
  `obligation_plan`, `performance_baseline`
- Approved UI pattern: white cards (`#ffffff`, `1px solid #e2e8f0`) on `#f1f5f9` canvas
- **Gather script filenames from prior SBOM §4. Never guess from spec. (Lesson 11)**
- **Agent count from the file, not this Brief. Expected: 44. (Lesson 12)**
- **iCloud-archival document types never committed to git. (Lesson 13)**

**Carry-forward audit findings (non-blocking):**
- F-2: 8 agents implemented-but-not-carded (2 NEXUS + 6 AgentOS core)
- F-3: AgentOS dispatcher hyphenated id/class nuance

**Open recommendation (not actioned, strong candidate for next GD):**
- COUNSEL `regulation_basis` field — now reinforced by BOTH TRACER (Session 24,
  would complete decision chains) AND ARC (Session 25, would enable real
  ARC→COUNSEL adaptation-decision routing). COUNSEL data model not modified per
  explicit build authorization to surface, not act, across two sessions.

**GD-10 — Classification Boundary (permanent):**
UNCLASSIFIED only. CUI/SECRET/TOP_SECRET throw `ClassificationNotAuthorizedError`.

---

## §7 — CPMI Enhanced Monitoring

*(unchanged from v1.37)*

---

## §8 — Shell Architecture (Option C — Permanent)

```
~/Developer/sovereign-platform/        ← MONOREPO ROOT
├── package.json                       ← git main · HEAD cb49c9c
├── SOVEREIGN_Platform_Integration_Brief_v1_38.md
├── Agent_Identity_Standard.md         ← 44 agents (verify file directly)
├── sovereign-shell/shell-contract.ts  ← v1.15 · SHA 939c2441…bfa5876 (unchanged)
├── sovereign-security/                ← 158 Python tests
├── module-aria/                       ← Stage 6 FEATURE-COMPLETE — 101 tests
│                                         (CLEAR + TRACER + ARC all live)
└── docs/
    ├── 13_APEX_Architecture.md
    ├── 14_HumanReviewerStandard.md
    ├── 14_HumanReviewerStandard_Addendum_SupervisionEfficiency.md
    ├── 15_FLOWPATH_Architecture.md
    ├── 16_ARIA_Suite_Architecture.md  ← retroactive update recommended (S24/S25 findings)
    └── 17_TimeAndTravel_Architecture.md
```

---

## §9 — Intelligence Layer Exposure Requirements

| Field | Required On | Status |
|---|---|---|
| `workflow_step_id` | Every Logger event | Enforced |
| `decision_type` | Every human decision | Enforced |
| `TASK_APPROVAL` / `TASK_CANCELLATION` | AgentOS task decisions | LIVE |
| `GATE_3_ATTESTATION` | CPMI + APEX + FLOWPATH (ARIA pending) | LIVE / PENDING |
| `AGENTOS_TASK_ASSIGNED` | NEXUS→AgentOS hand-off | LIVE (GD-19) |
| `ARIA_COMPLIANCE_CHECK` / `ARIA_CERTIFICATION_ISSUED` / `ARIA_VIOLATION_FLAGGED` / `ARIA_CALENDAR_ALERT` | CLEAR | LIVE (GD-20) |
| `ARIA_TRACE_REQUESTED` / `ARIA_TRACE_PRODUCED` / `ARIA_ORPHAN_FLAGGED` | TRACER | LIVE (Python-only) |
| `ARIA_IMPACT_MODELED` / `ARIA_ADAPTATION_DECISION` | ARC | LIVE (Python-only — reserved, not yet wired to live routing) |
| PPBE decision events | PPBE transitions | DEFERRED |
| Time & Travel events | TT compliance checks | DEFERRED |

---

## §10 — Shared Data Dictionary

*(unchanged from v1.37)*

---

## §11 — Current Build Status

### Stages 1–6 — COMPLETE ✅ (Stage 6 feature-complete as of Session 25)
### Walkthroughs A, B, C — COMPLETE ✅
### Walkthrough D — READY TO SCHEDULE

**Total tests: 1109 JS/TS + 158 Python = 1267**

### Session 25 — COMPLETE

All five deliverables delivered. No shell-contract change.

| Deliverable | Commit | Status |
|---|---|---|
| D1 — ARC domain types + dependency-model engine | `1fcd7c1` | ✅ |
| D2 — ARC Regulatory Impact Modeler panel | `68db645` | ✅ |
| D3 — ARC Logger event types (Python-only) | `1a31277` | ✅ |
| D4 — CPMI-VRS determinism verification + Gates tab | `e89f1fa` | ✅ |
| D5 — Tests + close verification | `834385c` | ✅ |

**Key findings (carried from handoff §G, §H):**
- G.1 — docs/16 §6/§7 confirmed NOT ambiguous; ARC events correctly Python-only,
  following exact TRACER precedent. No GD needed.
- G.2 — ARC outputs deliberately NOT routed through `ctx.aria`. A projection is
  not a document awaiting export clearance. No new `AriaCertification` field.
- §H — ARC→COUNSEL/NEXUS routing is UI-recommendation-only. Real routing deferred,
  would benefit from the COUNSEL `regulation_basis` GD.

### ARIA Suite CPMI-VRS Certification — Modified Gate Structure

Gates 1–2 (accuracy benchmarks) replaced by **determinism verification**: six
benchmark scenarios (two each for CLEAR, TRACER, ARC) proving identical input
produces identical output. This determinism IS the certification basis. Gates 3
(Project Principal attestation) and 4 (monitoring baseline) remain pending — the
`AriaVrsGates.tsx` tab is built and ready; Claude Code did not attest them, per
the autonomous-operation rule reserving this for the Project Principal.

### What's Next: Walkthrough D

This is the next action — not a build session. Live, human-in-the-loop validation
with the Project Principal operating the platform in a browser while the
Governance Agent provides a scenario script, the same format as Walkthroughs A, B,
and C. First Walkthrough where the Supervision Efficiency Standard applies
formally, alongside Gap 5 and Gap 6.

---

## §12 — Risk Register

*(unchanged from v1.37)*

---

## §13 — Open Governance Items

**CLOSED this version:**
- Session 25 (ARC core + CPMI-VRS certification UI) — COMPLETE
- Stage 6 (ARIA Suite) — FEATURE-COMPLETE

**Open items:**

| ID | Item | Target |
|---|---|---|
| Walkthrough-D | Schedule and run Walkthrough D | Next action |
| Gate-3-4 | CPMI-VRS Gate 3 attestation + Gate 4 monitoring baseline for ARIA Suite | Project Principal step, any time |
| COUNSEL-GD | Candidate GD: add `regulation_basis` to COUNSEL Decision Record — now reinforced by both TRACER and ARC findings | Future session, strong candidate |
| docs/16-update | Retroactively reflect Session 24/25 reconciliations in docs/16 | Before/during Walkthrough D documentation |
| WC-6 | FLOWPATH VRS certificate document | Stage 7 / hardening |
| F-2 | 8 agents implemented-but-not-carded | Future session |
| F-3 | AgentOS dispatcher id/class nuance | Future session |
| PPBE-SPEC | `docs/18_PPBE_Workflow_Architecture.md` | Before PPBE Phase I, after Walkthrough D |
| PPBE-PROMPTS | Four PPBE agent prompts | Before relevant build sessions |
| TT-PROMPTS | Two Time & Travel drafting prompts | Before Time & Travel Phase II |
| TT-GD | GD for TRAVEL_APPROVAL / TIME_CORRECTION_SENT / ESCALATION_AUTHORIZED | Before Time & Travel Phase II |
| SES-APEX | Supervision Efficiency metrics in APEX analytics scope | Future APEX spec revision |

---

## §14 — SBOM Status

Current: `SBOM_Registry_v1.26_MERGED.md` (through Session 25).
Shell contract v1.15 · `939c2441…bfa5876`. 1267 total tests. 0 vulnerabilities.

---

## §15 — Session Protocol (Every Session Without Exception)

1. Confirm all context documents loaded — name each.
2. Verify shell-contract.ts SHA-256 = `939c2441…bfa5876` (v1.15).
3. Count agent entries directly. Expected: 44.
4. Before any gather script: read prior SBOM §4 for exact filenames. (Lesson 11)
5. Do not commit iCloud-archival document types to git. (Lesson 13)
6. State done condition — wait for Project Principal approval.
7. One component per exchange — build, verify, confirm, proceed.
8. Close with handoff — never skip.

**Immediate Next Action: Walkthrough D — not a Claude Code build session.**
Governance Agent produces a scenario script; Project Principal operates the live
platform in a browser; Governance Agent guides step-by-step and documents findings.

**After Walkthrough D, next build session priorities:**
1. Address any gaps found during Walkthrough D
2. Gate 3/4 attestation (if not already done by Project Principal during/after walkthrough)
3. Begin workflow layer builds (PPBE Phase I or Time & Travel Phase I — sequencing TBD)

---

## §16 — Level 1 Walkthrough Protocol

| Walkthrough | After Session | Stage | Status |
|---|---|---|---|
| A | 16 | Stage 4 | COMPLETE — June 25, 2026 |
| B | 18 | Stage 5a (APEX) | COMPLETE — June 26, 2026 |
| C | 21 | Stage 5b (FLOWPATH) | COMPLETE — June 29, 2026 |
| **D** | **25** | **Stage 6 (ARIA Suite)** | **READY TO SCHEDULE** |
| E | ~27 | Pre-IL | Pending |
| F | ~32 | Full platform | Pending |

**Walkthrough D is the first Walkthrough where the Supervision Efficiency Standard
applies formally, alongside Gap 5 and Gap 6** (established Integration Brief v1.36).

---

## §17 — Primary Product Inserts

| Product | Stage | Status |
|---|---|---|
| CPMI | Stage 3 | COMPLETE — VRS certified |
| AgentOS | Stage 4 | COMPLETE — 89 tests |
| NEXUS | Stage 4 | COMPLETE — 52 tests |
| APEX | Stage 5a | COMPLETE — VRS certified — 97 tests |
| FLOWPATH | Stage 5b | COMPLETE — VRS certified — 98 tests |
| **ARIA Suite** | **Stage 6** | **FEATURE-COMPLETE — 101 tests · CLEAR + TRACER + ARC all LIVE · CPMI-VRS Gate 3/4 pending** |

**All six primary SOVEREIGN products are now feature-complete.**

---

## §18 — Agent and Prompt Registry

**Agent registry: 44 total — verify Agent_Identity_Standard.md directly**
**Approved prompts: 14 total — unchanged**

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.36 | June 29, 2026 | Supervision Efficiency Standard established |
| v1.37 | June 29, 2026 | Session 24 COMPLETE · TRACER live · repo cleanup · 1215 tests |
| **v1.38** | **June 29, 2026** | **Session 25 COMPLETE · ARC live · Stage 6 FEATURE-COMPLETE · Walkthrough D ready · 1267 tests** |

---

## §20 — Full Build Roadmap

### Stages 1–6 — COMPLETE ✅
### Walkthroughs A, B, C — COMPLETE ✅
### Walkthrough D — READY TO SCHEDULE (next action)

| Session | Type | Scope |
|---|---|---|
| 23 (retry) | Build | GD-20 + CLEAR core — COMPLETE |
| 24 | Build | TRACER core — COMPLETE |
| 25 | Build | ARC core + CPMI-VRS certification UI — **COMPLETE** |
| **Walkthrough D** | **Validation** | **Stage 6 — ARIA Suite — NEXT** |

### Workflow Layer Builds (after Walkthrough D)

| Session | Type | Scope |
|---|---|---|
| ~26 | Build | Time & Travel Phase I or PPBE Phase I (sequencing TBD post-walkthrough) |
| ~27 | Build | Second workflow layer Phase I |
| ~28 | Build | Workflow layer Phase II builds |

### Stages 7–9 — Demo Hardening, Intelligence Layer, Production

*(unchanged)*

---

*SOVEREIGN Platform Integration Brief v1.38 · June 29, 2026*
*Pre-Decisional · Internal Working Document*

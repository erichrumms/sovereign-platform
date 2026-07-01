# SOVEREIGN Platform Integration Brief
## Version 1.39 | June 30, 2026
### The Document That Travels with Every Product

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.38
**Changed this version:** Walkthrough D COMPLETE · 12 findings · 5 design
considerations · Gate 3 attestation DEFERRED pending D-11/D-12 design fixes ·
post-walkthrough build session scoped · §11, §13, §15, §16, §17, §19 updated

---

## §1 — What This Document Is

Mandatory context for every SOVEREIGN Platform development session. Load order:
Integration Brief (current version) → `SOVEREIGN_Agent_to_Agent_Briefing.md` →
`system_prompt.md` → product or companion suite spec → prior session handoff →
`shell-contract.ts`.

Confirm all documents are loaded by name before any build work begins.
Verify shell-contract.ts SHA-256 matches the v1.15 hash of record.
Verify agent count in Agent_Identity_Standard.md by counting the file directly.
Expected: 44.

---

## §2 — Platform Definition

*(unchanged from v1.38)*

---

## §3 — Three Shared Infrastructure Layers

*(unchanged from v1.38)*

---

## §4 — The SOVEREIGN Portfolio Pipeline

```
FLOWPATH ✅ → [Intelligence Layer] → CPMI ✅ → AgentOS ✅ → NEXUS ✅ → APEX ✅ → ARIA Suite ✅
‖ Companion Suite: COUNSEL ✅ · SCRIBE ✅ · LENS ✅ · VIGIL ✅ — COMPLETE
‖ NEXUS→AgentOS: LIVE via taskSurface (GD-19) ✅
‖ SCRIBE export gate: LIVE via ctx.aria.isCertified (GD-20) ✅
‖ ARIA Suite: CLEAR ✅ · TRACER ✅ · ARC ✅ — ALL LIVE
‖             CPMI-VRS Gate 3 DEFERRED pending D-11/D-12 design fixes
‖             Walkthrough D COMPLETE — gap fixes next
‖ PPBE: governed workflow layer · agents registered · build after gap fixes
‖ Time & Travel: governed workflow layer · agents registered · build after gap fixes
```

---

## §5 — Governance Role Assignments (Permanent)

*(unchanged from v1.38)*

---

## §6 — Standing Development Constraints (Invariant)

*(unchanged from v1.38 — see that version for full text and codebase facts)*

Key facts unchanged:
- Shell contract: v1.15 · SHA-256: `939c2441a1b4a6af16fefae4cbf8269585260646e84d830b4e0529ca8bfa5876`
- Python `APPROVED_EVENT_TYPES`: 84 (permanently 5 more than SovereignEventType 79 — by design)
- Shell context exports: 10
- Agent count: 44 (verify file directly)
- Lessons 11, 12, 13 all active

---

## §7–§10 — (unchanged from v1.38)

---

## §11 — Current Build Status

### Stages 1–6 — COMPLETE ✅
### Walkthrough D — COMPLETE (June 30, 2026)

**Total tests: 1109 JS/TS + 158 Python = 1267 (unchanged)**

### Walkthrough D Findings — Post-Walkthrough Build Session Required

**Technical bugs (next build session — fix before Gate 3 attestation):**

| ID | Finding | Priority |
|---|---|---|
| **D-11** | Gate 3 attestation surface provides no context for what is being attested, from what authority, based on what evidence, or with what consequence. Blank field; no pre-formed statement; no explanation of what changes when submitted. **Required before Gate 3 can be attested.** | First priority |
| **D-12** | CPMI-VRS Gates tab does not explain what Gates 1–2 are, why they exist, or why determinism verification is a valid substitution. Assumes reviewer understands the CPMI-VRS framework. **Required before Gate 3 can be attested.** | First priority |
| **D-3** | CLEAR Certification Queue provides no access to the underlying document being certified. No preview, no view, no link. Reviewer certifies based on CLEAR's rule-check summaries only, never seeing the document itself. No export destination or recipient authorization captured. | Second priority |
| **D-4** | TRACER chain nodes surface internal platform identifiers (workflow step IDs, Logger event types, agent names) as primary content. Should be human-readable descriptions; internal references as secondary/expandable detail. | Second priority |
| **D-5** | Source nodes in SCRIBE document chains lack timestamps. A traceability chain without when-stamps cannot answer whether the document was built on the right version of the data. | Second priority |
| **D-9** | CPMI-VRS determinism verification page does not explain why these six scenarios were selected or what coverage they represent. Selection rationale should be stated. | Second priority |
| **D-10** | "Identically" in scenario titles does not specify what was compared. Headline claim is ambiguous; sub-text partially addresses it. | Second priority |
| **D-1** | Data quality severity assignment logic (P1 vs. At Risk keyed to document type) not visible at the row level — only in general page text above table. | Third priority |
| **D-2** | "FY26" fiscal year shorthand violates Gap 5 plain-language standard. Should read "FY 2026." | Third priority |
| **D-6** | ARC scope selection (Substantive/Clarifying) not echoed as a badge on the result panel — reviewer may not register which scope generated the result below. | Third priority |
| **D-7** | GD-10 classification boundary banner renders twice on CPMI-VRS tab. | Third priority |
| **D-8** | Engine name appears redundantly in both the colored badge and the scenario title on CPMI-VRS determinism cards. | Third priority |

**Walkthrough D Design Considerations — Future Stages:**

| ID | Consideration | Target |
|---|---|---|
| **DC-4** | CLEAR data quality surface should separate completeness/accuracy measure from consequence/exposure measure — two dimensions, not one number with a hidden rule | Future CLEAR enhancement |
| **DC-5** | When ARC identifies breaking CLEAR rule impacts, surface the implication for already-certified documents — prior certifications under a broken rule may need review | Future ARC enhancement |

### Gate 3 / Gate 4 Status

Gate 3 attestation DEFERRED. D-11 and D-12 must be resolved first. Gate 4 follows Gate 3. `AriaVrsGates.tsx` is built and ready — UI changes only needed, no shell-contract change.

### What Comes Next (in order)

1. Post-walkthrough build session — D-11/D-12 first, then D-3 through D-8
2. Project Principal completes Gate 3 attestation (once D-11/D-12 fixed)
3. Gate 4 monitoring baseline (follows Gate 3)
4. Workflow layer builds begin — PPBE Phase I or Time & Travel Phase I (sequencing TBD)

---

## §12 — Risk Register

*(unchanged from v1.38, plus:)*

| R17 | ARIA Suite Gate 3 attestation not informed without D-11/D-12 fixes | OPEN — post-walkthrough build session addresses |

---

## §13 — Open Governance Items

**CLOSED this version:**
- Walkthrough D — COMPLETE June 30, 2026

**Open items:**

| ID | Item | Target |
|---|---|---|
| **D-11 + D-12** | **Gate 3 attestation context redesign — required before attestation** | **Post-walkthrough build session — first priority** |
| D-3 | CLEAR export/preview/recipient gap | Post-walkthrough build session |
| D-4 + D-5 | TRACER human-readable language + timestamps | Post-walkthrough build session |
| D-1 + D-2 + D-6 + D-7 + D-8 + D-9 + D-10 | Remaining Walkthrough D fixes | Post-walkthrough build session |
| Gate-3-4 | CPMI-VRS Gate 3 attestation + Gate 4 | After D-11/D-12 fixed |
| COUNSEL-GD | Candidate GD: `regulation_basis` field — reinforced by TRACER + ARC | Future session |
| docs/16-update | Retroactive update to reflect Sessions 24/25 reconciliations | Before/during next build |
| PPBE-SPEC | `docs/18_PPBE_Workflow_Architecture.md` | Before PPBE Phase I |
| PPBE-PROMPTS | Four PPBE agent prompts | Before relevant build sessions |
| TT-PROMPTS | Two Time & Travel drafting prompts | Before Time & Travel Phase II |
| TT-GD | GD for TRAVEL_APPROVAL / TIME_CORRECTION_SENT / ESCALATION_AUTHORIZED | Before Time & Travel Phase II |
| iCloud-cleanup | Consolidate superseded documents in iCloud root into For Disposal/ | Future Cowork session |

---

## §14 — SBOM Status

Current: `SBOM_Registry_v1.26_MERGED.md` (through Session 25 — Walkthrough D
produced no code changes).
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

**Post-Walkthrough D Build Session Opening Priorities:**
1. **D-11 + D-12** — Gate 3 attestation context redesign (required before attestation)
2. **D-3** — CLEAR export/preview/recipient gap
3. **D-4 + D-5** — TRACER human-readable language + timestamps
4. **D-9 + D-10** — CPMI-VRS scenario selection rationale + "identically" precision
5. **D-1 + D-2 + D-6 + D-7 + D-8** — remaining minor fixes

---

## §16 — Level 1 Walkthrough Protocol

| Walkthrough | After Session | Stage | Status |
|---|---|---|---|
| A | 16 | Stage 4 | COMPLETE — June 25, 2026 |
| B | 18 | Stage 5a (APEX) | COMPLETE — June 26, 2026 |
| C | 21 | Stage 5b (FLOWPATH) | COMPLETE — June 29, 2026 |
| **D** | **25** | **Stage 6 (ARIA Suite)** | **COMPLETE — June 30, 2026** |
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
| **ARIA Suite** | **Stage 6** | **FEATURE-COMPLETE — 101 tests · CLEAR + TRACER + ARC LIVE · Walkthrough D COMPLETE · Gate 3 DEFERRED pending D-11/D-12** |

**All six primary SOVEREIGN products are feature-complete. Walkthroughs A–D are complete.**

---

## §18 — Agent and Prompt Registry

**Agent registry: 44 total — verify Agent_Identity_Standard.md directly**
**Approved prompts: 14 total — unchanged**

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.37 | June 29, 2026 | Session 24 COMPLETE · TRACER live · repo cleanup · 1215 tests |
| v1.38 | June 29, 2026 | Session 25 COMPLETE · ARC live · Stage 6 FEATURE-COMPLETE · 1267 tests |
| **v1.39** | **June 30, 2026** | **Walkthrough D COMPLETE · 12 findings · 5 design considerations · Gate 3 DEFERRED** |

---

## §20 — Full Build Roadmap

### Stages 1–6 — COMPLETE ✅
### Walkthroughs A–D — COMPLETE ✅

### Post-Walkthrough D — Gap Fixes + Certification

| Session | Type | Scope |
|---|---|---|
| **Next** | **Build** | **Walkthrough D gap fixes (D-11/D-12 first) + Gate 3/4 attestation** |

### Workflow Layer Builds (after Gate 3/4 complete)

| Session | Type | Scope |
|---|---|---|
| ~26 | Build | Time & Travel Phase I or PPBE Phase I (sequencing TBD) |
| ~27 | Build | Second workflow layer Phase I |
| ~28–29 | Build | Workflow layer Phase II builds |

### Stages 7–9 — Demo Hardening, Intelligence Layer, Production

*(unchanged)*

---

*SOVEREIGN Platform Integration Brief v1.39 · June 30, 2026*
*Pre-Decisional · Internal Working Document*

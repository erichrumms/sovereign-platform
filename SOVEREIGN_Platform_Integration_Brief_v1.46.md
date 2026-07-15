# SOVEREIGN Platform Integration Brief
## Version 1.46 | July 14, 2026

**Classification:** Pre-Decisional · Internal Working Document
**Supersedes:** Integration Brief v1.45
**Changed this version:** PPBE live smoke test (Session 35 Part 1) **CLOSED**
after two follow-up sessions. Session 36 traced and retracted an incorrect
diagnosis (no code defect existed in the API-key wiring). Session 37 found
and fixed a real issue — a retired model identifier — and standardized on
`claude-sonnet-4-6`. The subsequent live run: 3 of 4 PPBE agents completed
genuine live model calls; the 4th produced a real response that correctly
failed its own validator, a new low-urgency open item, not a wiring problem.
**Naming convention scrub applied throughout:** all references to "Claude
Chat," "Claude Code," or "Fable 5" replaced with "Governance Agent" and
"Build Agent" respectively, per Project Principal instruction.

---

## §1-§10 — unchanged, see v1.45

---

## §11 — Current Build Status

PPBE live-call smoke test: **CLOSED.** `ppbe-evidence-synthesizer`,
`ppbe-scenario-analyst`, `ppbe-coordination-assistant` — genuine `tier=live`
completions, response times 22-73 seconds (real generation, not fallback).
`ppbe-exhibit-drafter` — real live response, failed its own validator
(`live_response_failed_draft_validation`); correctly degraded to labeled
static per the platform's fail-closed design. This is a validator/prompt
tuning question, not a code defect. Diagnostic logging
(`SOVEREIGN_CLIENT_DEBUG=1`) is now permanent tooling. Model identifier
standardized on `claude-sonnet-4-6` via the single exported constant
`SOVEREIGN_DEFAULT_MODEL`, with a hermetic allowlist test preventing silent
drift to an unvalidated model string in the future.

Test count: not re-verified fresh since Session 35's 1900 baseline — Sessions
36 and 37 each added regression tests (exact new total not yet confirmed).
Verify fresh at next Build Agent session open.

---

## §13 — Open Governance Items

**CLOSED this version:**
- PPBE live-call smoke test (Session 35 Part 1) — was the last item blocking
  Walkthrough F prerequisites. Now closed; see §11.
- Retired model identifier (`claude-sonnet-4-20250514`) — fixed, Session 37.

| ID | Item | Target |
|---|---|---|
| Exhibit-drafter validation failure | Real live call, output failed its own validator — likely a figure-sourcing or system-invisibility check tripping on real model phrasing, not yet diagnosed | Scoped follow-up Build Agent session; low urgency, non-blocking |
| Walkthrough F scenario script | Governance Agent deliverable, unblocked | Draft now — genuinely nothing left blocking it |
| `AGENT_REFERENCE.md` terminology fix | Project knowledge file, read-only to the Governance Agent — remove the "(e.g., Claude Chat)" / "(e.g., Claude Code)" parentheticals from the role-definition table | Project Principal edits directly |
| `Agent_Identity_Standard.md` terminology fix | "Claude Chat"/"Claude Code" references in PPBE prompt-authorship notes | Fold into the same future session as the pre-existing stale TT Status fields fix |
| PPBE host wiring for `max_tokens` | No production composition-root wiring exists yet | Apply 4,096 override when built |
| docs/18 §5, §7.2, §3 corrections | Already applied in docs/18 v1.1 — this row is stale tracking, drop it next cycle | Verify then remove |
| module-lens orientation_system.md missing | Registry requires it, file absent | Correction or removal decision needed |
| VIGIL triage prompt path drift | Registry path vs. actual disk path | Registry correction |
| TT agent Status fields stale | All 8 TT agents still read pre-build language | Fold into the terminology-fix session above |
| SBOM merge, Sessions 27-30 | Already resolved, prior cycle | Closed, tracked for history only |
| docs/16 Supervision Efficiency | Confirmed absent | Project Principal's own pace |
| Root document cleanup, ~35 stale Brief versions | Unchanged | Optional, non-blocking |

---

## §14 — SBOM Status

SBOM Registry v1.39 current through Session 37.

## §15-§17 — unchanged from v1.45

---

## §18 — Agent and Prompt Registry

Unchanged: 44 agents, 20 registered = 19 approved + 1 pending. No agent or
prompt changes in Sessions 36-37 — both were code-level fixes, no governance
artifacts touched.

---

## §19 — Version History

| Version | Date | Changed |
|---|---|---|
| v1.44 | July 13, 2026 | All four wrap-up decisions closed; PPBE prompts APPROVED (20/19/1); cross-module fix + smoke test scheduled |
| v1.45 | July 13, 2026 | Session 35 closed: cross-module gap fix COMPLETE; prompt count CONFIRMED; smoke test harness built, live half pending |
| **v1.46** | **July 14, 2026** | **PPBE live smoke test CLOSED (Sessions 36-37); model identifier standardized on `claude-sonnet-4-6`; new low-urgency exhibit-drafter item opened; full terminology scrub (Governance Agent / Build Agent only, no model or product names) applied throughout** |

---

## §20 — Full Build Roadmap

### Next
| Item | Depends on |
|---|---|
| Walkthrough F scenario script | Nothing — fully unblocked |
| Exhibit-drafter validation investigation | Nothing — can run in parallel, non-blocking |
| Walkthrough F | Scenario script complete |
| Full rehearsal | Walkthrough F findings addressed |
| Demo-ready | Both workflow layers complete (true) + rehearsal clean |

---

## §21 — CTO Demo Readiness Track

**Critical path, current:** Walkthrough F scenario script (Governance Agent)
→ Walkthrough F → full rehearsal → demo-ready. The exhibit-drafter finding
runs alongside this, not ahead of it — it's a prompt-tuning question, not a
blocker.

Both governed workflow layers are complete. Both Session 35 build parts and
both follow-up fix sessions (36, 37) closed clean. **Nothing currently on the
critical path is a build blocker** — the next concrete deliverable is the
Governance Agent's own scenario script.

---

## Key Lessons — Current

Lessons 15-19 unchanged, see v1.45. **New:**

**Lesson 20 — a green test result can be true about the wrong thing.** A
fallback path's "pass" can look identical whether the primary path was
genuinely exercised and failed cleanly, or never reached at all. Distinguish
these with instrumentation, not by reading the summary line alone.

**Lesson 21 — verify placeholder substitution as rigorously as the value
itself.** When a command requires a secret a person types in by hand, verify
the substituted value's shape independently (e.g. length) before trusting
the run's result — a silently-unreplaced placeholder can produce a
plausible-looking failure that has nothing to do with the actual system
under test.

---

*SOVEREIGN Platform Integration Brief v1.46 · July 14, 2026*
*Pre-Decisional · Internal Working Document*

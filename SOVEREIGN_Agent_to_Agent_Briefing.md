# SOVEREIGN Platform — Agent-to-Agent Briefing
## Updated July 14, 2026 — PPBE live smoke test CLOSED; naming convention scrub applied

---

## Who You Are Talking To

The Project Principal is the sole human decision-maker. Non-technical
background, highly engaged. Big picture first, components second. The Build
Agent runs autonomously and may be unattended for extended periods.

**Naming convention, effective this version:** the two AI roles are referred
to only as "Governance Agent" and "Build Agent" throughout — no model or
product names anywhere in this or future governing documents.

---

## What's New Since the Last Briefing

**The PPBE live-call smoke test (Session 35 Part 1) is CLOSED**, after two
follow-up sessions:

1. **Session 36 found no code defect.** A proposed fix was traced, checked
   against the actual call path (`SovereignClientConfig` → factory
   translation → `AnthropicClientConfig`), confirmed correct via `tsc`, and
   formally withdrawn rather than applied on an incomplete diagnosis.
   Permanent diagnostic logging (`SOVEREIGN_CLIENT_DEBUG=1`) is now
   standing infrastructure.
2. **Session 37 found and fixed a real issue** — a retired model identifier
   (`claude-sonnet-4-20250514`) hardcoded in a single exported constant, no
   scattered duplicates. Standardized on `claude-sonnet-4-6`. Added a
   hermetic allowlist test that fails loudly on any future silent drift to
   an unvalidated model string.
3. **The subsequent live run:** 3 of 4 PPBE agents (`evidence-synthesizer`,
   `scenario-analyst`, `coordination-assistant`) completed genuine live
   model calls — response times in the 22-73 second range confirm real
   generation, not fallback. The 4th (`exhibit-drafter`) produced a real
   live response that failed its own validator — the fail-closed design
   working correctly, not a wiring problem. This is now a new, low-urgency,
   non-blocking open item.

**A deliberate decision was made and recorded:** the Project Principal
considered splitting the four PPBE agents across model tiers (Sonnet for
heavier reasoning, Haiku for lighter tasks) and explicitly declined for now,
given how much of tonight was already spent on single-model fragility.
Standing on one model until there's a concrete, evidence-based reason to
revisit.

---

## Current State — July 14, 2026

| Item | State |
|---|---|
| HEAD | `c6e19a1` (Session 37 close) — verify fresh via `git log -1` |
| shell-contract.ts | v1.16, unchanged since GD-21 |
| Platform tests | 1900+ baseline (Session 35); Sessions 36-37 added regression tests, exact new total not yet re-verified fresh |
| Registered agents | 44, unchanged |
| Prompt registry | 20 registered = 19 approved + 1 pending, unchanged |
| PPBE live smoke test | **CLOSED** — 3/4 fully live, 1/4 caught by its own validator (new tracked item) |
| Model identifier | Standardized: `claude-sonnet-4-6`, single source of truth, allowlist-guarded |
| Cross-module state gap (VIGIL→SCRIBE) | Fixed, tested, demonstrated live (unchanged from last briefing) |
| CPMI-VRS Gate 3 | Unblocked, still not attested |

---

## What's Next

1. **Governance Agent:** draft the Walkthrough F scenario script — fully
   unblocked, nothing left in the critical path ahead of it.
2. **Exhibit-drafter validation failure** — scoped follow-up Build Agent
   session, low urgency, can run in parallel with step 1.
3. **Two housekeeping items, project-knowledge-file edits, not build work:**
   `AGENT_REFERENCE.md`'s role-table parentheticals and
   `Agent_Identity_Standard.md`'s "Claude Chat"/"Claude Code" references
   both need the same naming scrub — fold the latter into the same future
   session as the pre-existing stale TT agent Status field fix.
4. Walkthrough F → full rehearsal → demo-ready.

---

## Corrections to Carry Forward

- PPBE live smoke test: CLOSED, not open. Don't re-list Part 1 as pending.
- Model identifier: `claude-sonnet-4-6`, confirmed working, single source of
  truth. Don't re-flag `claude-sonnet-4-20250514` — it's fixed.
- All standing lessons (15-19) remain in force. **New — Lesson 20: a green
  test result can be true about the wrong thing** — a fallback path's "pass"
  can look identical whether the primary path failed cleanly or was never
  reached; distinguish with instrumentation, not the summary line alone.
  **New — Lesson 21: verify placeholder substitution independently** (e.g.
  value length) before trusting a run's result when a person has to type or
  paste a secret into a command by hand.

---

*SOVEREIGN Platform · Agent-to-Agent Briefing · Updated July 14, 2026*
*Supersedes the prior version*
*Pre-Decisional · Internal Working Document*
*File to: git repo root, as `SOVEREIGN_Agent_to_Agent_Briefing.md` (no date suffix)*

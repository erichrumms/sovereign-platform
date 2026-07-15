# SOVEREIGN Platform — Agent-to-Agent Briefing
## Updated July 13, 2026 — Session 35 closed: cross-module fix complete, prompt count confirmed

---

## Who You Are Talking To

The Project Principal is the sole human decision-maker. Non-technical
background, highly engaged. Big picture first, components second. Fable 5
runs autonomously and may be unattended for extended periods.

---

## What's New Since the Last Briefing

**Session 35 closed all three of its parts, two fully and one pending a
single human action:**

1. **Part 2 (cross-module state gap fix): COMPLETE.** VIGIL's escalation
   authorization now publishes to the shell's `taskSurface` (GD-19, no
   contract change); SCRIBE's review queue subscribes and flips the item to
   "sendable" live, no refresh. 21 regression tests (more than double the
   ~9 estimated), including a real end-to-end convergence test using the
   actual VIGIL and SCRIBE components on one shared context — this is the
   literal script Walkthrough F can run in the browser.

2. **Part 3 (prompt registry count): CONFIRMED, root cause found.** The
   platform's 20 registered / 19 approved / 1 pending figure was correct the
   whole time. The apparent discrepancy traced to Sessions 27-30's handoffs
   mislabeling the *registered* count ("16") as the *approved* count — not a
   missing prompt. `PR-SCRIBE-004` (Style DNA) is the one genuinely pending
   prompt, unchanged since June 17.

3. **Part 1 (PPBE live-call smoke test): harness built, fail-closed half
   passing as a permanent regression, live half blocked on a missing
   credential** (dev has never had an Anthropic API key — expected, on
   record since Walkthrough B). One remaining action, and it belongs to the
   Project Principal alone: run the harness with a real key. Until that
   happens, the specific risk this test was scheduled to catch — first
   real-model exposure occurring mid-walkthrough instead of in a controlled
   30-minute check — technically still stands.

**New standing fact:** `sovereign-api-client`'s default `max_tokens` (1,000)
truncates multi-finding PPBE synthesis output. The smoke harness overrides to
4,096; any future production wiring for the four PPBE agents must do the
same — no such wiring exists yet.

---

## Current State — July 13, 2026

| Item | State |
|---|---|
| HEAD | Reported as `2a5f764` (session-close docs) — **not self-confirmed inside the handoff document**; verify via `git log -1` before trusting |
| shell-contract.ts | v1.16, unchanged since GD-21, re-verified both copies at Session 35 open and close |
| Platform tests | **1900 passing** (1705 JS/TS + 195 Python) + 4 key-gated live smoke tests, up from 1875 |
| Registered agents | 44, unchanged |
| Prompt registry | **20 registered = 19 approved + 1 pending — CONFIRMED**, not carried-forward arithmetic |
| Cross-module state gap (VIGIL→SCRIBE) | **FIXED**, tested, demonstrated live |
| PPBE live smoke test | Harness complete; live half awaiting one Project Principal action |
| CPMI-VRS Gate 3 | Unblocked, still not attested |

---

## What's Next

1. **Project Principal:** run the one credentialed smoke-test command (see
   Integration Brief v1.45 §13) — no further build work needed for Part 1.
2. **Governance Agent:** draft the Walkthrough F scenario script — unblocked
   now (Strategic Plan Part IV supplies the format), and doesn't need to wait
   for step 1's result to start.
3. Walkthrough F → full rehearsal → demo-ready.

---

## Corrections to Carry Forward

- Prompt count: 20/19/1 is CONFIRMED — the historical "16" figures in
  Sessions 27-30 were the *registered* count, not approved. Don't re-flag
  this as an open discrepancy; it's closed.
- Cross-module state gap: FIXED, not merely scheduled. Don't re-list it as an
  open item.
- Three Integration Brief duplicate pairs, operational log tracking policy,
  and Sessions 27-30's SBOM backfill: all still resolved from the prior
  cycle — don't re-flag any of these three.
- All standing lessons (15-18) remain in force. **New — Lesson 19: state any
  approval-gated count as three numbers (registered/approved/pending), never
  a bare total** — this exact discipline is what would have prevented the
  Sessions 27-30 mislabel from ever looking like a real gap.

---

*SOVEREIGN Platform · Agent-to-Agent Briefing · Updated July 13, 2026*
*Supersedes the prior version*
*Pre-Decisional · Internal Working Document*
*File to: git repo root, as `SOVEREIGN_Agent_to_Agent_Briefing.md` (no date suffix)*
